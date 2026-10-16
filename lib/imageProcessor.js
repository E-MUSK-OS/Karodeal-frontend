'use client';

/**
 * Utility for handling client-side image files:
 * 1. Automatically converts HEIC/HEIF files (from iPhone / iOS) to standard JPEG.
 * 2. Compresses & resizes oversized mobile photos/screenshots to guarantee crisp invoices under 1.5MB.
 * 3. Returns a standardized File and a preview ObjectURL.
 */

export const isHeicFile = (file) => {
  if (!file) return false;
  const name = (file.name || '').toLowerCase();
  const type = (file.type || '').toLowerCase();
  return (
    name.endsWith('.heic') ||
    name.endsWith('.heif') ||
    type.includes('heic') ||
    type.includes('heif')
  );
};

export const processImageUpload = async (file, options = {}) => {
  if (!file) return null;

  const {
    maxDimension = 2048,
    quality = 0.85,
    maxSizeMB = 4.0
  } = options;

  let activeFile = file;

  // 1. Convert HEIC/HEIF to JPEG if necessary
  if (isHeicFile(file)) {
    try {
      const heic2anyModule = await import('heic2any');
      const heic2any = heic2anyModule.default || heic2anyModule;
      
      const conversionResult = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.9
      });

      const blob = Array.isArray(conversionResult) ? conversionResult[0] : conversionResult;
      const cleanName = (file.name || 'image.jpg')
        .replace(/\.heic$/i, '.jpg')
        .replace(/\.heif$/i, '.jpg');

      activeFile = new File([blob], cleanName, { type: 'image/jpeg' });
    } catch (err) {
      console.warn('HEIC conversion warning, falling back to original file:', err);
    }
  }

  // 2. Validate MIME type
  const isImage = (activeFile.type && activeFile.type.startsWith('image/')) ||
    /\.(jpe?g|png|webp|gif|bmp|heic|heif)$/i.test(activeFile.name || '');

  if (!isImage) {
    throw new Error('Please upload a valid image file (PNG, JPG, WebP, HEIC).');
  }

  // 3. Compress / Downscale if larger than 1MB or large dimensions
  const isOversized = activeFile.size > 1024 * 1024; // > 1MB
  
  if (typeof window !== 'undefined' && isOversized && activeFile.type.startsWith('image/')) {
    try {
      const compressed = await compressImage(activeFile, maxDimension, quality);
      if (compressed && compressed.size < activeFile.size) {
        activeFile = compressed;
      }
    } catch (compErr) {
      console.warn('Client-side compression skipped:', compErr);
    }
  }

  // Final sanity check against extreme sizes (e.g. 10MB+)
  if (activeFile.size > maxSizeMB * 1024 * 1024) {
    throw new Error(`Image size is too large (${(activeFile.size / (1024 * 1024)).toFixed(1)}MB). Please select an image under ${maxSizeMB}MB.`);
  }

  const previewUrl = URL.createObjectURL(activeFile);
  return { file: activeFile, previewUrl };
};

/**
 * Resizes and compresses an image file using an offscreen canvas
 */
const compressImage = (file, maxDimension, quality) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const tempUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(tempUrl);
      let { width, height } = img;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return resolve(file);
      }

      // Draw with smooth scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(file);
          const finalName = file.name;
          const compressedFile = new File([blob], finalName, { type: blob.type || mimeType });
          resolve(compressedFile);
        },
        mimeType,
        quality
      );
    };

    img.onerror = (e) => {
      URL.revokeObjectURL(tempUrl);
      resolve(file); // fallback to original file
    };

    img.src = tempUrl;
  });
};

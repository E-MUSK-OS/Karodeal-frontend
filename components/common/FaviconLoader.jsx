'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// Vibrant Yellow & Orange shade (Amber Gold)
const SPINNER_COLOR = '#f59e0b';
const SPINNER_TRACK_COLOR = 'rgba(245, 158, 11, 0.25)';

// 8 frames * 90ms = 720ms per rotation.
// 90ms perfectly matches Chromium's async favicon IPC rate limit to prevent frame dropping & stutter ("stop stop")
const FRAME_COUNT = 8;
const FRAME_MS = 90;
const MIN_DURATION = 720; // Exactly 1 complete, unbroken 360-degree rotation

function generateFramesWithLogo(img, color = SPINNER_COLOR, count = FRAME_COUNT) {
  if (typeof document === 'undefined') return [];
  const size = 32;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  const center = size / 2; // 16
  const spinnerRadius = 13.5;
  const logoRadius = 9;
  const frames = [];

  for (let i = 0; i < count; i++) {
    ctx.clearRect(0, 0, size, size);

    // 1. Draw circular brand logo in the center
    if (img && (img.naturalWidth > 0 || img.width > 0)) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, logoRadius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(
        img,
        center - logoRadius,
        center - logoRadius,
        logoRadius * 2,
        logoRadius * 2
      );
      ctx.restore();
    }

    // 2. Faint circular track around icon
    ctx.beginPath();
    ctx.arc(center, center, spinnerRadius, 0, Math.PI * 2);
    ctx.strokeStyle = SPINNER_TRACK_COLOR;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 3. Vibrant Yellow-Orange active arc spinning around icon (exact 45-degree steps)
    const startAngle = (i / count) * 2 * Math.PI;
    const arcLength = Math.PI * 0.85; // ~150° clean crescent

    ctx.beginPath();
    ctx.arc(center, center, spinnerRadius, startAngle, startAngle + arcLength);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();

    frames.push(canvas.toDataURL('image/png'));
  }

  return frames;
}

export default function FaviconLoader() {
  const pathname = usePathname();
  const timerRef = useRef(null);
  const isAnimatingRef = useRef(false);
  const startTimeRef = useRef(0);
  const stopTimerRef = useRef(null);
  const framesRef = useRef([]);
  const originalHrefsRef = useRef(new Map());
  const stopLoadingRef = useRef(null);

  useEffect(() => {
    // Preload brand icon and pre-render frames
    const img = new Image();
    img.src = '/icon-48.png';

    const buildFrames = () => {
      framesRef.current = generateFramesWithLogo(img, SPINNER_COLOR, FRAME_COUNT);
    };

    if (img.complete && (img.naturalWidth > 0 || img.width > 0)) {
      buildFrames();
    } else {
      img.onload = buildFrames;
      framesRef.current = generateFramesWithLogo(null, SPINNER_COLOR, FRAME_COUNT);
    }

    const startLoading = () => {
      if (stopTimerRef.current) {
        clearTimeout(stopTimerRef.current);
        stopTimerRef.current = null;
      }

      if (isAnimatingRef.current) return;
      isAnimatingRef.current = true;
      startTimeRef.current = performance.now();

      const icons = Array.from(document.querySelectorAll("link[rel*='icon']"));
      if (icons.length === 0) return;

      // Cache original hrefs once
      icons.forEach((icon) => {
        if (!originalHrefsRef.current.has(icon)) {
          originalHrefsRef.current.set(
            icon,
            icon.getAttribute('href') || '/favicon.ico'
          );
        }
      });

      const frames = framesRef.current;
      if (frames.length === 0) return;

      let frameIndex = 0;
      for (let j = 0; j < icons.length; j++) {
        icons[j].setAttribute('href', frames[frameIndex]);
      }

      if (timerRef.current) clearInterval(timerRef.current);

      // Stable 90ms interval: Chromium processes each frame cleanly without dropping or throttling
      timerRef.current = setInterval(() => {
        if (!isAnimatingRef.current) return;
        frameIndex = (frameIndex + 1) % frames.length;
        const currentFrame = frames[frameIndex];
        for (let j = 0; j < icons.length; j++) {
          icons[j].setAttribute('href', currentFrame);
        }
      }, FRAME_MS);
    };

    const stopLoading = () => {
      if (!isAnimatingRef.current) return;

      // Ensure at least 1 full 360-degree rotation (MIN_DURATION) completes
      const elapsed = performance.now() - startTimeRef.current;
      const remaining = Math.max(0, MIN_DURATION - elapsed);

      if (stopTimerRef.current) clearTimeout(stopTimerRef.current);

      stopTimerRef.current = setTimeout(() => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        isAnimatingRef.current = false;
        stopTimerRef.current = null;

        // Restore original icon hrefs
        const icons = document.querySelectorAll("link[rel*='icon']");
        icons.forEach((icon) => {
          const originalHref =
            originalHrefsRef.current.get(icon) || '/favicon.ico';
          icon.setAttribute('href', originalHref);
        });
      }, remaining);
    };

    stopLoadingRef.current = stopLoading;

    // 1. Observe NextTopLoader (nprogress-busy on <html>)
    const observer = new MutationObserver(() => {
      const isBusy = document.documentElement.classList.contains('nprogress-busy');
      if (isBusy) {
        startLoading();
      } else {
        stopLoading();
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // 2. Listen to internal link clicks for instantaneous response
    const handleLinkClick = (e) => {
      let target = e.target;
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }
      if (!target || !target.href) return;

      try {
        const url = new URL(target.href, window.location.href);
        const isSameOrigin = url.origin === window.location.origin;
        const isHashOnly =
          url.pathname === window.location.pathname &&
          url.search === window.location.search &&
          url.hash !== '';
        const isSamePage =
          url.pathname === window.location.pathname &&
          url.search === window.location.search &&
          !url.hash;
        const isNewTab =
          target.target === '_blank' || e.ctrlKey || e.metaKey || e.shiftKey;

        if (
          isSameOrigin &&
          !isHashOnly &&
          !isSamePage &&
          !isNewTab &&
          !url.pathname.startsWith('/api')
        ) {
          startLoading();
        }
      } catch (err) {
        // ignore invalid urls
      }
    };

    // 3. Handle native beforeunload (reload / hard navigation)
    const handleBeforeUnload = () => {
      startLoading();
    };

    document.addEventListener('click', handleLinkClick, true);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      observer.disconnect();
      document.removeEventListener('click', handleLinkClick, true);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Stop loading when pathname changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof document !== 'undefined') {
        const isBusy = document.documentElement.classList.contains('nprogress-busy');
        if (!isBusy) {
          stopLoadingRef.current?.();
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}

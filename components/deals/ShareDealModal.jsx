'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { 
  WhatsappIcon, 
  TelegramIcon, 
  FacebookIcon 
} from 'react-share';
import { X, Copy, Check, Share2, MessageSquare, MoreHorizontal } from 'lucide-react';
import { cleanProductTitle } from '@/lib/titleSanitizer';

const emptySubscribe = () => () => {};

export default function ShareDealModal({ deal, shareUrl, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  // Close on Escape key & lock body scroll when open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !deal || !mounted) return null;

  const title = cleanProductTitle(deal.title || 'Special Deal');
  const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const appendTracking = (urlStr, source) => {
    try {
      const u = new URL(urlStr, typeof window !== 'undefined' ? window.location.origin : 'https://karodeal.in');
      u.searchParams.set('utm_source', source);
      u.searchParams.set('utm_medium', 'social');
      return u.toString();
    } catch {
      const sep = urlStr.includes('?') ? '&' : '?';
      return `${urlStr}${sep}utm_source=${source}&utm_medium=social`;
    }
  };

  const whatsappShareUrl = appendTracking(shareUrl, 'whatsapp');
  const encodedWhatsappUrl = encodeURIComponent(`${title ? title + '\n' : ''}${whatsappShareUrl}`);

  // Direct app protocol on mobile; standard full browser tab on desktop
  const whatsappUrl = isMobile 
    ? `whatsapp://send?text=${encodedWhatsappUrl}` 
    : `https://web.whatsapp.com/send?text=${encodedWhatsappUrl}`;

  const telegramShareUrl = appendTracking(shareUrl, 'telegram');
  const encodedTelegramUrl = encodeURIComponent(telegramShareUrl);
  const telegramUrl = isMobile
    ? `tg://msg_url?url=${encodedTelegramUrl}`
    : `https://t.me/share/url?url=${encodedTelegramUrl}`;

  const facebookShareUrl = appendTracking(shareUrl, 'facebook');
  const encodedFacebookUrl = encodeURIComponent(facebookShareUrl);
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedFacebookUrl}`;
  const smsUrl = isMobile ? `sms:?&body=${encodedWhatsappUrl}` : `sms:?body=${encodedWhatsappUrl}`;

  const handleCopyLink = async (e) => {
    e?.stopPropagation();
    try {
      await navigator.clipboard.writeText(whatsappShareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      const input = document.createElement('input');
      input.value = whatsappShareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleInstagramShare = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {}

    window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
    onClose();
  };

  const handleSmsShare = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (isMobile) {
      window.location.href = smsUrl;
    } else {
      if (typeof navigator !== 'undefined' && navigator.share) {
        navigator.share({ title, url: shareUrl }).catch(() => {});
      } else {
        handleCopyLink();
      }
    }
    onClose();
  };

  const handleNativeShare = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this deal on KaroDeal: ${title}`,
          url: whatsappShareUrl,
        });
        onClose();
      } catch (err) {
        if (err?.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }
      }}
    >
      <div
        className="bg-white dark:bg-neutral-900 rounded-2xl md:rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-5 border border-neutral-100 dark:border-neutral-800 relative animate-in zoom-in-95 duration-150"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-950/40 text-[#f96b02] flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-neutral-900 dark:text-white text-sm sm:text-base leading-none">
                Share Deal
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 truncate max-w-[210px]">{title}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 dark:text-neutral-200 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Social Platforms Row: 6 options in balanced 3x2 grid */}
        <div className="my-5">
          <div className="grid grid-cols-3 gap-3">
            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onClose()}
              className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-800 active:scale-95 transition cursor-pointer group outline-none"
            >
              <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-xs flex items-center justify-center transition-transform group-hover:scale-105">
                <WhatsappIcon size={48} />
              </div>
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">WhatsApp</span>
            </a>

            {/* Instagram */}
            <button
              type="button"
              onClick={handleInstagramShare}
              className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-800 active:scale-95 transition cursor-pointer group outline-none"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-105">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">Instagram</span>
            </button>

            {/* Facebook */}
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onClose()}
              className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-800 active:scale-95 transition cursor-pointer group outline-none"
            >
              <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-xs flex items-center justify-center transition-transform group-hover:scale-105">
                <FacebookIcon size={48} />
              </div>
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">Facebook</span>
            </a>

            {/* SMS */}
            <button
              type="button"
              onClick={handleSmsShare}
              className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-800 active:scale-95 transition cursor-pointer group outline-none"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-105">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">SMS</span>
            </button>

            {/* Telegram */}
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onClose()}
              className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-800 active:scale-95 transition cursor-pointer group outline-none"
            >
              <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-xs flex items-center justify-center transition-transform group-hover:scale-105">
                <TelegramIcon size={48} />
              </div>
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">Telegram</span>
            </a>

            {/* More (System Native Share) */}
            <button
              type="button"
              onClick={handleNativeShare}
              className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-800 active:scale-95 transition cursor-pointer group outline-none"
              title="More sharing options"
            >
              <div className="w-12 h-12 rounded-2xl bg-neutral-900 dark:bg-neutral-800 text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 hover:bg-black">
                <MoreHorizontal className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">More</span>
            </button>
          </div>
        </div>

        {/* Single Deal Link & Solid Black Copy Button */}
        <div>
          <div className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1.5">
            Single Deal Link
          </div>
          <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1.5 pl-3 border border-neutral-200 dark:border-neutral-700">
            <input
              type="text"
              readOnly
              value={whatsappShareUrl}
              className="w-full bg-transparent text-xs text-neutral-600 dark:text-neutral-300 outline-none truncate select-all"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold shrink-0 transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-white" /> Copy Link
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

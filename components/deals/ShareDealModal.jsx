'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { 
  WhatsappIcon, 
  TelegramIcon, 
  XIcon, 
  FacebookIcon 
} from 'react-share';
import { X, Copy, Check, Share2 } from 'lucide-react';
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
  const encodedUrl = encodeURIComponent(shareUrl);

  const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Direct app protocol on mobile; standard full browser tab on desktop
  const whatsappUrl = isMobile 
    ? `whatsapp://send?text=${encodedUrl}` 
    : `https://web.whatsapp.com/send?text=${encodedUrl}`;

  const telegramUrl = isMobile
    ? `tg://msg_url?url=${encodedUrl}`
    : `https://t.me/share/url?url=${encodedUrl}`;

  const xUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

  const shareItems = [
    {
      name: 'WhatsApp',
      href: whatsappUrl,
      icon: <WhatsappIcon size={48} />,
    },
    {
      name: 'Telegram',
      href: telegramUrl,
      icon: <TelegramIcon size={48} />,
    },
    {
      name: 'X',
      href: xUrl,
      icon: <XIcon size={48} />,
    },
    {
      name: 'Facebook',
      href: facebookUrl,
      icon: <FacebookIcon size={48} />,
    },
  ];

  const handleCopyLink = async (e) => {
    e?.stopPropagation();
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
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
        className="bg-white rounded-2xl md:rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-5 border border-neutral-100 relative animate-in zoom-in-95 duration-150"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-neutral-900 text-sm sm:text-base leading-none">
                Share Deal
              </h3>
              <p className="text-[11px] text-neutral-500 mt-1 truncate max-w-[210px]">{title}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Social Platforms Row: Opens in Full Tab on PC, Direct Native App on Mobile */}
        <div className="my-5">
          <div className="grid grid-cols-4 gap-2.5">
            {shareItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onClose()}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-neutral-50 active:scale-95 transition cursor-pointer group outline-none"
              >
                <div className="transition-transform group-hover:scale-105 shadow-md rounded-2xl overflow-hidden">
                  {item.icon}
                </div>
                <span className="text-[11px] font-semibold text-neutral-700">{item.name}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Single Deal Link & Copy Button */}
        <div>
          <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
            Single Deal Link
          </div>
          <div className="flex items-center gap-2 bg-neutral-100 rounded-xl p-1.5 pl-3 border border-neutral-200">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="w-full bg-transparent text-xs text-neutral-600 outline-none truncate select-all"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold shrink-0 transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-primary-600 hover:bg-primary-700 text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy Link
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

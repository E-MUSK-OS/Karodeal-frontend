'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Check, Copy, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import Button from '@/components/common/Button';
import PageLoader from '@/components/common/PageLoader';
import { showSuccessToast } from '@/lib/errorHandler';

function CopyCodeContent() {
  const searchParams = useSearchParams();
  const code = (searchParams.get('code') || '').trim();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (code) {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(code)
          .then(() => {
            setCopied(true);
            showSuccessToast(`Verification code ${code} copied to clipboard!`);
            // Attempt to automatically close this tab so the user returns right back to their previous screen
            setTimeout(() => {
              try {
                window.close();
              } catch (e) {
                // Browser restricted window.close
              }
            }, 600);
          })
          .catch(() => {
            setCopied(false);
          });
      }
    }
  }, [code]);

  const handleCopy = () => {
    if (!code) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(code).then(() => {
        setCopied(true);
        showSuccessToast(`Verification code ${code} copied to clipboard!`);
      });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10 font-sans">
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-xl max-w-sm w-full p-6 sm:p-8 text-center animate-in zoom-in-95 duration-200">
        
        {/* Status Icon */}
        <div className={`w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center transition-all ${
          copied ? 'bg-emerald-50 text-emerald-600 ring-4 ring-emerald-50' : 'bg-orange-50 text-[#f96b02]'
        }`}>
          {copied ? <CheckCircle2 className="w-8 h-8" /> : <Copy className="w-8 h-8" />}
        </div>

        <h2 className="text-xl font-black text-neutral-900 mb-1">
          {copied ? 'Code Copied!' : 'Your Code'}
        </h2>

        <p className="text-xs text-neutral-500 mb-5 font-medium">
          {copied ? 'Code has been copied to your clipboard. Paste it in KaroDeal.' : 'Click below to copy your code:'}
        </p>

        {code ? (
          <div 
            onClick={handleCopy}
            className="bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-2xl p-4 mb-5 cursor-pointer transition-all"
            title="Click to copy"
          >
            <div className="text-3xl font-mono font-black tracking-[0.3em] text-neutral-900 select-all">
              {code}
            </div>
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#f96b02] mt-2">
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Click to Copy</span>
                </>
              )}
            </div>
          </div>
        ) : (
          <p className="text-xs text-neutral-400 mb-5">No code provided.</p>
        )}

        {/* Buttons */}
        <div className="space-y-2.5">
          <Button
            type="button"
            variant="none"
            size="none"
            onClick={handleCopy}
            className="w-full bg-[#f96b02] hover:bg-[#e05e00] text-white font-bold py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Copy className="w-4 h-4" />
            <span>{copied ? 'Copy Again' : 'Copy Code'}</span>
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                try {
                  window.close();
                } catch (e) {}
              }}
              className="bg-neutral-900 hover:bg-black text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Close Tab</span>
            </button>
            <Link
              href="/signup"
              className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center"
            >
              <span>Back to App</span>
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400 font-medium mt-5 pt-4 border-t border-neutral-100">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Valid for 10 minutes</span>
        </div>

      </div>
    </div>
  );
}

export default function CopyCodePage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <CopyCodeContent />
    </Suspense>
  );
}

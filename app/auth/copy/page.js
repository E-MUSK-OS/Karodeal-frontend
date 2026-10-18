'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Check, Copy, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Button from '@/components/common/Button';
import PageLoader from '@/components/common/PageLoader';
import { showSuccessToast } from '@/lib/errorHandler';

function CopyCodeContent() {
  const searchParams = useSearchParams();
  const code = (searchParams.get('code') || '').trim();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (code) {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code)
          .then(() => {
            setCopied(true);
            showSuccessToast(`Verification code ${code} copied to clipboard!`);
          })
          .catch(() => {
            // In case automatic copy is restricted by browser policy
            setCopied(false);
          });
      }
    }
  }, [code]);

  const handleManualCopy = () => {
    if (!code) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code)
        .then(() => {
          setCopied(true);
          showSuccessToast(`Verification code ${code} copied to clipboard!`);
        })
        .catch(() => {
          // Fallback using textarea
          try {
            const textarea = document.createElement('textarea');
            textarea.value = code;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setCopied(true);
            showSuccessToast(`Verification code ${code} copied!`);
          } catch {
            // ignore
          }
        });
    }
  };

  const handleClose = () => {
    if (typeof window !== 'undefined') {
      window.close();
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xl max-w-md w-full p-6 sm:p-8 text-center animate-in fade-in zoom-in-95 duration-300">
        
        {/* Animated Status Icon */}
        <div className={`w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center transition-all ${
          copied ? 'bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50 scale-105' : 'bg-orange-50 text-[#f96b02] ring-8 ring-orange-50/50'
        }`}>
          {copied ? (
            <CheckCircle2 className="w-10 h-10 animate-in zoom-in-50 duration-300" />
          ) : (
            <Copy className="w-9 h-9" />
          )}
        </div>

        <h1 className="text-2xl font-black text-neutral-900 mb-2">
          {copied ? 'Code Copied Successfully!' : 'Your Verification Code'}
        </h1>

        <p className="text-sm text-neutral-500 mb-6 font-medium leading-relaxed">
          {copied 
            ? 'Your verification code is copied to your clipboard. You can now switch back to KaroDeal and paste it.' 
            : 'Click the button below to copy your 6-digit verification code to your clipboard.'}
        </p>

        {/* Code Display Card */}
        {code ? (
          <div 
            onClick={handleManualCopy}
            className="group relative bg-neutral-50 hover:bg-neutral-100 border-2 border-dashed border-[#f96b02] rounded-2xl p-5 mb-6 cursor-pointer transition-all active:scale-[0.99]"
            title="Click to copy code"
          >
            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
              Verification Code
            </div>
            
            <div className="text-3xl sm:text-4xl font-mono font-black tracking-[0.3em] sm:tracking-[0.4em] text-neutral-900 select-all my-1">
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
                  <span>Tap to Copy Code</span>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 mb-6 text-xs font-medium">
            No verification code found in this link. Please check your latest email from KaroDeal.
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {code && (
            <Button
              type="button"
              variant="none"
              size="none"
              onClick={handleManualCopy}
              className="w-full bg-[#f96b02] hover:bg-[#e05e00] text-white font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow text-sm cursor-pointer"
            >
              <Copy className="w-4 h-4" />
              <span>{copied ? 'Copy Again' : 'Copy Verification Code'}</span>
            </Button>
          )}

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <Link
              href="/login"
              className="w-full bg-neutral-900 hover:bg-black text-white font-bold py-3 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs text-center"
            >
              <span>Go to Login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/signup"
              className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold py-3 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs text-center"
            >
              <span>Go to Sign Up</span>
            </Link>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="text-xs font-semibold text-neutral-400 hover:text-neutral-700 pt-2 transition-colors cursor-pointer"
          >
            Done? Close this tab
          </button>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400 font-medium mt-6 pt-4 border-t border-neutral-100">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Valid for 10 minutes • Safe & Secure</span>
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

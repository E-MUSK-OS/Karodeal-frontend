'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const handleNewToast = (e) => {
      if (!e.detail) return;
      const newToast = e.detail;

      setToasts((prev) => {
        // Keep max 5 toasts on screen
        const updated = [...prev, newToast];
        return updated.slice(-5);
      });

      // Auto dismiss after duration
      if (newToast.duration && newToast.duration > 0) {
        setTimeout(() => {
          removeToast(newToast.id);
        }, newToast.duration);
      }
    };

    window.addEventListener('karodeal:toast', handleNewToast);
    return () => window.removeEventListener('karodeal:toast', handleNewToast);
  }, [removeToast]);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-5 right-5 z-[999999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full px-4 sm:px-0 pointer-events-none"
    >
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';
        const isInfo = toast.type === 'info';

        const config = {
          border: isError
            ? 'border-rose-200'
            : isSuccess
            ? 'border-emerald-200'
            : isWarning
            ? 'border-amber-200'
            : 'border-blue-200',
          bg: 'bg-white/95 backdrop-blur-md',
          iconBg: isError
            ? 'bg-rose-50 text-rose-600'
            : isSuccess
            ? 'bg-emerald-50 text-emerald-600'
            : isWarning
            ? 'bg-amber-50 text-amber-600'
            : 'bg-blue-50 text-blue-600',
          titleColor: isError
            ? 'text-rose-900'
            : isSuccess
            ? 'text-emerald-900'
            : isWarning
            ? 'text-amber-900'
            : 'text-blue-900',
          icon: isError ? (
            <AlertCircle className="w-5 h-5 shrink-0" />
          ) : isSuccess ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : isWarning ? (
            <AlertTriangle className="w-5 h-5 shrink-0" />
          ) : (
            <Info className="w-5 h-5 shrink-0" />
          ),
        };

        return (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border ${config.border} ${config.bg} shadow-xl shadow-neutral-900/10 transition-all duration-300 ease-out transform translate-y-0 opacity-100 hover:shadow-2xl animate-in slide-in-from-top-4`}
          >
            {/* Icon */}
            <div className={`p-2 rounded-xl shrink-0 ${config.iconBg}`}>
              {config.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              {toast.title && (
                <h4 className={`text-sm font-bold leading-tight ${config.titleColor}`}>
                  {toast.title}
                </h4>
              )}
              <p className="text-xs text-neutral-600 font-medium leading-relaxed mt-1 break-words">
                {toast.message}
              </p>
            </div>

            {/* Close Button (X) */}
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors shrink-0 -mr-1 -mt-1 cursor-pointer"
              title="Close notification"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle({ className = '', showLabel = false, size = 'md' }) {
  const { resolvedTheme, toggleTheme, mounted } = useTheme();

  const isDark = mounted ? resolvedTheme === 'dark' : false;

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const buttonSizes = {
    sm: 'w-8 h-8',
    md: 'w-9 h-9 sm:w-9.5 sm:h-9.5',
    lg: 'w-10 h-10',
  };

  if (showLabel) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`flex items-center justify-between w-full px-4 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
          isDark
            ? 'bg-neutral-900 hover:bg-neutral-800 text-neutral-100 border border-neutral-800'
            : 'bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 border border-neutral-200'
        } ${className}`}
        aria-label="Toggle Dark / Light theme"
      >
        <span className="flex items-center gap-2.5">
          {isDark ? (
            <Moon className="w-4 h-4 text-amber-400 fill-amber-400/20" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500 fill-amber-500/20" />
          )}
          <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
        </span>
        <div
          className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 flex items-center ${
            isDark ? 'bg-amber-400 justify-end' : 'bg-neutral-300 justify-start'
          }`}
        >
          <div className="w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200" />
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer active:scale-95 shadow-2xs ${buttonSizes[size] || buttonSizes.md} ${
        isDark
          ? 'bg-neutral-900 hover:bg-neutral-800 text-amber-400 border border-neutral-800 hover:border-neutral-700 shadow-black/20'
          : 'bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200/90 hover:border-neutral-300 shadow-black/5'
      } ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        {/* Sun Icon */}
        <Sun
          className={`${iconSizes[size] || iconSizes.md} text-amber-500 transition-all duration-300 transform ${
            isDark ? 'rotate-90 scale-0 opacity-0 absolute' : 'rotate-0 scale-100 opacity-100'
          }`}
        />
        {/* Moon Icon */}
        <Moon
          className={`${iconSizes[size] || iconSizes.md} text-amber-400 fill-amber-400/20 transition-all duration-300 transform ${
            isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0 absolute'
          }`}
        />
      </div>
    </button>
  );
}

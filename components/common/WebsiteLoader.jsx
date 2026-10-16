'use client';

import React, { useState, useEffect } from 'react';
import KaroDealAnimatedLogo from './KaroDealAnimatedLogo';

export default function WebsiteLoader() {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Ensure the animation has enough time to assemble gracefully (sequence finishes ~0.9s)
    const minDisplayTime = 1300;
    const startTime = Date.now();
    let timeoutId;
    let fallbackId;

    const handleComplete = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDisplayTime - elapsed);

      timeoutId = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          setIsVisible(false);
        }, 500); // Wait for fade-out transition
      }, remaining);
    };

    if (document.readyState === 'complete') {
      handleComplete();
    } else {
      window.addEventListener('load', handleComplete);
      // Fallback in case external scripts delay window load event
      fallbackId = setTimeout(handleComplete, 3500);
      return () => {
        window.removeEventListener('load', handleComplete);
        clearTimeout(timeoutId);
        clearTimeout(fallbackId);
      };
    }

    return () => clearTimeout(timeoutId);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white transition-all duration-500 ease-out ${
        isExiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Subtle Radial Ambient Glow */}
      <div className="absolute w-[300px] h-[300px] rounded-full bg-gradient-to-tr from-orange-400/10 via-blue-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Pure Animated KaroDeal Logo Icon (Compact & elegant) */}
      <KaroDealAnimatedLogo size="md" showText={false} />
    </div>
  );
}

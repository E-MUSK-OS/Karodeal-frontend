'use client';

import React from 'react';

/**
 * KaroDealAnimatedLogo
 * A high-performance vector logo loader where each part of the KaroDeal icon
 * (Stem, Upper Diagonal, Shopping Cart Body, Inner Grill Bars, Wheels, and Typography)
 * assembles sequentially with fluid animations.
 */
export default function KaroDealAnimatedLogo({
  size = 'md',
  showText = true,
  className = '',
  loop = true,
}) {
  const sizeMap = {
    xs: { width: 75, height: showText ? 52 : 60 },
    sm: { width: 95, height: showText ? 66 : 76 },
    md: { width: 145, height: showText ? 100 : 116 },
    lg: { width: 185, height: showText ? 128 : 148 },
    xl: { width: 230, height: showText ? 158 : 184 },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`relative inline-flex flex-col items-center justify-center select-none ${className}`}>
      <style>{`
        @keyframes kdStemIn {
          0% {
            opacity: 0;
            transform: translateY(-24px) scaleY(0.7);
          }
          60% {
            opacity: 1;
            transform: translateY(2px) scaleY(1.02);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scaleY(1);
          }
        }

        @keyframes kdBranchIn {
          0% {
            opacity: 0;
            transform: translate(20px, -20px) scale(0.6);
          }
          65% {
            opacity: 1;
            transform: translate(-2px, 2px) scale(1.03);
          }
          100% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
        }

        @keyframes kdCartIn {
          0% {
            opacity: 0;
            transform: translate(-20px, 20px) scale(0.7);
          }
          65% {
            opacity: 1;
            transform: translate(2px, -2px) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
        }

        @keyframes kdLinesIn {
          0% {
            opacity: 0;
            transform: scaleX(0);
          }
          60% {
            opacity: 1;
            transform: scaleX(1.06);
          }
          100% {
            opacity: 1;
            transform: scaleX(1);
          }
        }

        @keyframes kdWheelBounce {
          0% {
            opacity: 0;
            transform: translateY(-20px) scale(0.3);
          }
          50% {
            opacity: 1;
            transform: translateY(0) scale(1.15);
          }
          70% {
            transform: translateY(-4px) scale(0.95);
          }
          85% {
            transform: translateY(1px) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes kdTextFade {
          0% {
            opacity: 0;
            transform: translateY(12px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes kdFloatGlow {
          0%, 100% {
            transform: translateY(0);
            filter: drop-shadow(0 4px 14px rgba(249, 107, 2, 0.16));
          }
          50% {
            transform: translateY(-5px);
            filter: drop-shadow(0 10px 22px rgba(249, 107, 2, 0.32));
          }
        }

        .kd-animated-container {
          ${loop ? 'animation: kdFloatGlow 2.4s ease-in-out infinite 1.2s;' : ''}
        }

        .kd-part-stem {
          transform-box: fill-box;
          transform-origin: center;
          animation: kdStemIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .kd-part-branch {
          transform-box: fill-box;
          transform-origin: center;
          animation: kdBranchIn 0.42s cubic-bezier(0.34, 1.56, 0.64, 1) 0.14s both;
        }

        .kd-part-cart {
          transform-box: fill-box;
          transform-origin: center;
          animation: kdCartIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 0.28s both;
        }

        .kd-part-lines {
          transform-box: fill-box;
          transform-origin: center;
          animation: kdLinesIn 0.38s cubic-bezier(0.2, 0.8, 0.2, 1) 0.44s both;
        }

        .kd-wheel-1 {
          transform-box: fill-box;
          transform-origin: center;
          animation: kdWheelBounce 0.42s cubic-bezier(0.34, 1.56, 0.64, 1) 0.56s both;
        }

        .kd-wheel-2 {
          transform-box: fill-box;
          transform-origin: center;
          animation: kdWheelBounce 0.42s cubic-bezier(0.34, 1.56, 0.64, 1) 0.68s both;
        }

        .kd-part-text {
          animation: kdTextFade 0.45s ease-out 0.85s both;
        }
      `}</style>

      <div className="kd-animated-container">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox={showText ? "0 0 500 308" : "120 0 280 225"}
          width={currentSize.width}
          height={currentSize.height}
          className="overflow-visible"
        >
          <defs>
            <linearGradient id="orangeGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff7a18" />
              <stop offset="50%" stopColor="#f96b02" />
              <stop offset="100%" stopColor="#e55a00" />
            </linearGradient>

            <linearGradient id="blueGlowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#082d64" />
              <stop offset="100%" stopColor="#031e45" />
            </linearGradient>

            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.10" />
            </filter>
          </defs>

          {/* PART 1: K Vertical Stem (Navy Blue) */}
          <path
            className="kd-part-stem"
            d="M 143 14 C 143 10 146 8 150 8 L 187 8 C 189 8 189 10 189 14 L 189 168 C 189 174 185 180 178 183 L 146 190 C 144 190 143 189 143 186 Z"
            fill="url(#blueGlowGrad)"
            filter="url(#softShadow)"
          />

          {/* PART 2: K Upper Diagonal Branch (Navy Blue) */}
          <polygon
            className="kd-part-branch"
            points="214,88 248,88 304,8 266,8"
            fill="url(#blueGlowGrad)"
            filter="url(#softShadow)"
          />

          {/* PART 3: Shopping Cart Body & Lower Leg (Orange) */}
          <path
            className="kd-part-cart"
            d="M 194 71 L 235 174 C 237 178 242 181 247 181 L 319 181 C 324 181 329 177 331 172 L 358 92 L 386 92 L 386 71 L 343 71 L 316 154 L 253 154 L 219 71 Z"
            fill="url(#orangeGlowGrad)"
            filter="url(#softShadow)"
          />

          {/* PART 4: Shopping Cart Inner Horizontal Bars */}
          <g className="kd-part-lines">
            <rect x="254" y="101" width="92" height="12" rx="4" fill="url(#orangeGlowGrad)" />
            <rect x="270" y="126" width="62" height="12" rx="4" fill="url(#orangeGlowGrad)" />
          </g>

          {/* PART 5: Shopping Cart Wheels (Wheel 1 & Wheel 2) */}
          <g className="kd-wheel-1">
            <circle cx="247" cy="197" r="14" fill="url(#orangeGlowGrad)" />
          </g>

          <g className="kd-wheel-2">
            <circle cx="300" cy="197" r="14" fill="url(#orangeGlowGrad)" />
          </g>

          {/* PART 6: Typography "karodeal" (Only shown if showText is true) */}
          {showText && (
            <g className="kd-part-text">
              <text
                x="250"
                y="295"
                textAnchor="middle"
                fontFamily="'Inter', 'Montserrat', 'Arial Black', sans-serif"
                fontWeight="900"
                fontSize="82"
                letterSpacing="-3.5"
              >
                <tspan fill="#032554">karo</tspan>
                <tspan fill="#f96b02">deal</tspan>
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}

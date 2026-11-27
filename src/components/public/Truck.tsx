'use client';

import { useId } from 'react';
import Image from 'next/image';
import { ASSETS } from '@/lib/assets';

interface TruckProps {
  hasCustomWebp?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * High-craft Indian highway container tractor-trailer facing LEFT.
 * Uses `/public/truck.webp` when supplied, or renders a precision vector truck
 * with metallic depth gradients, cab glass reflections and rotating `[data-truck-wheel]` groups.
 */
export function Truck({
  hasCustomWebp = false,
  compact = false,
  className = '',
}: TruckProps) {
  const uid = useId().replace(/:/g, '');

  if (hasCustomWebp) {
    return (
      <div className={`relative select-none ${className}`}>
        <Image
          src={ASSETS.hero.truck.src}
          alt={ASSETS.hero.truck.alt}
          width={ASSETS.hero.truck.width}
          height={ASSETS.hero.truck.height}
          priority={!compact}
          sizes={compact ? '120px' : '(max-width: 768px) 95vw, 860px'}
          className="w-full h-auto object-contain pointer-events-none"
        />
      </div>
    );
  }

  return (
    <svg
      viewBox="0 0 980 370"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ASSETS.hero.truck.alt}
      className={`w-full h-auto select-none pointer-events-none ${className}`}
    >
      <defs>
        <linearGradient id={`tlBoxGrad-${uid}`} x1="300" y1="32" x2="300" y2="260" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#128980" />
          <stop offset="55%" stopColor="#0F766E" />
          <stop offset="100%" stopColor="#084540" />
        </linearGradient>
        <linearGradient id={`tlCabGrad-${uid}`} x1="150" y1="78" x2="150" y2="262" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#F3F7F7" />
          <stop offset="100%" stopColor="#DCE6E7" />
        </linearGradient>
        <linearGradient id={`tlGlassGrad-${uid}`} x1="70" y1="100" x2="160" y2="178" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0F3B40" />
          <stop offset="100%" stopColor="#04191C" />
        </linearGradient>
        <radialGradient id={`tlGroundShadow-${uid}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#06262A" stopOpacity="0.28" />
          <stop offset="65%" stopColor="#06262A" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#06262A" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`tlBeamGrad-${uid}`} x1="44" y1="224" x2="2" y2="236" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Subtle Forward Headlight Aura (kept cleanly inside viewBox) */}
      {!compact && (
        <polygon points="44,216 2,202 2,262 44,234" fill={`url(#tlBeamGrad-${uid})`} />
      )}

      {/* Soft Realistic Ground Contact Shadow */}
      <ellipse cx="495" cy="340" rx="445" ry="18" fill={`url(#tlGroundShadow-${uid})`} />

      {/* Rear Trailer Container Body */}
      <rect x="292" y="34" width="644" height="220" rx="10" fill={`url(#tlBoxGrad-${uid})`} />
      {/* Container Roof Trim */}
      <rect x="292" y="34" width="644" height="18" rx="8" fill="#06262A" fillOpacity="0.3" />
      {/* Container Bottom Rail */}
      <rect x="292" y="240" width="644" height="14" rx="3" fill="#06262A" fillOpacity="0.45" />

      {/* Subtle Vertical Panel Ribs */}
      {[
        336, 384, 432, 480, 528, 576, 624, 672, 720, 768, 816, 864, 904,
      ].map((x) => (
        <g key={x}>
          <rect x={x} y="58" width="6" height="176" rx="2" fill="#06262A" fillOpacity="0.16" />
          <rect x={x + 6} y="58" width="2" height="176" fill="#2DD4BF" fillOpacity="0.1" />
        </g>
      ))}

      {/* Clean Precision Livery Band */}
      <rect x="292" y="206" width="644" height="6" fill="#2DD4BF" fillOpacity="0.88" />
      <rect x="292" y="214" width="644" height="3" fill="#FFFFFF" fillOpacity="0.35" />

      {/* Side Brand Stencil (subtle architectural typography integrated directly onto container) */}
      {!compact && (
        <g opacity="0.92">
          <rect x="342" y="106" width="44" height="44" rx="10" fill="#F59E0B" />
          <path d="M352 120 H376 M364 120 V138" stroke="#06262A" strokeWidth="4.5" strokeLinecap="round" />
          <text
            x="402"
            y="137"
            fill="#FFFFFF"
            fontFamily="sans-serif"
            fontWeight="800"
            fontSize="26"
            letterSpacing="4"
          >
            TRUST LOGISTIC
          </text>
          <text
            x="404"
            y="156"
            fill="#2DD4BF"
            fontFamily="sans-serif"
            fontWeight="700"
            fontSize="11"
            letterSpacing="3.5"
          >
            FLEET · DISPATCH · COMPLIANCE
          </text>
        </g>
      )}

      {/* Safety Reflector & Amber Clearance Lights */}
      <rect x="920" y="42" width="12" height="8" rx="2" fill="#F59E0B" />
      <rect x="916" y="226" width="16" height="10" rx="2" fill="#F59E0B" />
      <rect x="304" y="244" width="20" height="5" rx="2" fill="#F59E0B" />
      <rect x="464" y="244" width="20" height="5" rx="2" fill="#F59E0B" />

      {/* Undercarriage Side Guard, Fuel Tank & Chassis Frame */}
      <rect x="82" y="254" width="844" height="22" rx="5" fill="#06262A" />
      {/* Side Underrun Guard Bars */}
      <rect x="336" y="280" width="224" height="8" rx="3" fill="#1E3A3F" />
      <rect x="336" y="294" width="224" height="8" rx="3" fill="#1E3A3F" />
      {/* Aluminum Fuel Tank */}
      <rect x="296" y="264" width="96" height="36" rx="8" fill="#0A4F4A" stroke="#2DD4BF" strokeOpacity="0.25" strokeWidth="1.5" />
      {/* Rear Axle Frame & Mudflaps */}
      <rect x="228" y="264" width="10" height="44" rx="2" fill="#06262A" />
      <rect x="886" y="264" width="12" height="44" rx="2" fill="#06262A" />

      {/* Aerodynamic Roof Wind Deflector */}
      <path d="M158 84 C186 42 232 34 282 34 L282 88 L150 88 Z" fill="#0A4F4A" />
      <path d="M168 82 C192 50 232 42 278 42" stroke="#2DD4BF" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" />

      {/* Coupling Gap */}
      <rect x="278" y="88" width="14" height="168" fill="#06262A" />

      {/* Sculpted Commercial Cab (Facing LEFT) */}
      <path
        d="M52 254 L52 178 C52 148 64 118 96 92 L134 86 L278 86 L278 254 Z"
        fill={`url(#tlCabGrad-${uid})`}
        stroke="#06262A"
        strokeWidth="3.5"
      />
      {/* Cab Teal Accent Belt & Door Seam */}
      <path d="M54 180 L276 180 L276 198 L54 198 Z" fill="#0F766E" />
      <path d="M164 90 L164 252" stroke="#06262A" strokeOpacity="0.2" strokeWidth="2" />
      <rect x="218" y="186" width="16" height="5" rx="2" fill="#06262A" fillOpacity="0.65" />

      {/* Front Raked Windshield & Side Door Window */}
      <path d="M68 168 L98 106 L150 106 L150 168 Z" fill={`url(#tlGlassGrad-${uid})`} />
      <path d="M174 106 L252 106 L252 168 L174 168 Z" fill={`url(#tlGlassGrad-${uid})`} />
      {/* Subtle Specular Glass Reflections */}
      <path d="M80 162 L102 114 L116 114 L96 162 Z" fill="#2DD4BF" fillOpacity="0.22" />
      <path d="M186 162 L206 114 L220 114 L201 162 Z" fill="#FFFFFF" fillOpacity="0.1" />

      {/* Side Mirror Assembly */}
      <path d="M56 122 L38 122 L38 168 L52 168" stroke="#06262A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="32" y="128" width="11" height="34" rx="4" fill="#06262A" />

      {/* Front Air Intake Grille & Lower Bumper (Facing Left) */}
      <rect x="52" y="204" width="38" height="28" rx="4" fill="#06262A" fillOpacity="0.14" />
      <rect x="42" y="212" width="16" height="22" rx="4" fill="#F59E0B" />
      <rect x="36" y="242" width="58" height="26" rx="6" fill="#06262A" />
      <rect x="40" y="248" width="28" height="6" rx="2" fill="#FFFFFF" fillOpacity="0.25" />

      {/* Wheel Arches */}
      <path d="M98 276 A62 62 0 0 1 222 276 Z" fill="#06262A" />
      <path d="M598 276 A62 62 0 0 1 722 276 Z" fill="#06262A" />
      <path d="M736 276 A62 62 0 0 1 860 276 Z" fill="#06262A" />

      {/* Rotating Commercial Alloy Wheels (radius r = 49 around cy = 286) */}
      {[160, 660, 798].map((cx) => (
        <g
          key={cx}
          data-truck-wheel="true"
          data-wheel-origin={`${cx} 286`}
        >
          {/* Heavy Tire Outer & Sidewall Tread Grooves */}
          <circle cx={cx} cy="286" r="49" fill="#06262A" />
          {[0, 120, 240].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const tx = cx + Math.cos(rad) * 43;
            const ty = 286 + Math.sin(rad) * 43;
            return (
              <circle key={`t-${angle}`} cx={tx} cy={ty} r="3.2" fill="#17444A" />
            );
          })}
          <circle cx={cx} cy="286" r="38" fill="#102F33" />
          {/* Alloy Wheel Dish */}
          <circle cx={cx} cy="286" r="26" fill="#E6EFEF" />
          <circle cx={cx} cy="286" r="21" fill="#CFDCDC" />
          {/* 5 High-Contrast Radial Alloy Spokes for Unmistakable Rotation */}
          {[0, 72, 144, 216, 288].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = cx + Math.cos(rad) * 10;
            const y1 = 286 + Math.sin(rad) * 10;
            const x2 = cx + Math.cos(rad) * 22;
            const y2 = 286 + Math.sin(rad) * 22;
            return (
              <line
                key={angle}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#06262A"
                strokeWidth="3.8"
                strokeLinecap="round"
              />
            );
          })}
          {/* Asymmetric Amber Valve Marker to Make Spin Visually Clear */}
          <circle
            cx={cx + Math.cos((36 * Math.PI) / 180) * 16}
            cy={286 + Math.sin((36 * Math.PI) / 180) * 16}
            r="3"
            fill="#F59E0B"
          />
          {/* Teal Center Hub & Amber Dust Cap */}
          <circle cx={cx} cy="286" r="9" fill="#0F766E" />
          <circle cx={cx} cy="286" r="4" fill="#F59E0B" />
        </g>
      ))}
    </svg>
  );
}

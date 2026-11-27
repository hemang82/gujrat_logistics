import Image from 'next/image';
import { type AssetSlot } from '@/lib/assets';

interface AssetSlotProps {
  asset: AssetSlot;
  sizes?: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  fill?: boolean;
  darkSurface?: boolean;
}

// Lightweight neutral teal SVG blur placeholder for next/image
const BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjEwIiBmaWxsPSIjMEE0RjRBIi8+PC9zdmc+';

export function AssetSlotView({
  asset,
  sizes = '(max-width: 768px) 100vw, 1200px',
  priority = false,
  className = '',
  imgClassName = 'object-cover',
  fill = false,
  darkSurface = true,
}: AssetSlotProps) {
  const isDev = process.env.NODE_ENV === 'development';

  if (asset.src) {
    if (fill) {
      return (
        <div className={`relative overflow-hidden ${className}`}>
          <Image
            src={asset.src}
            alt={asset.alt}
            fill
            sizes={sizes}
            priority={priority}
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            className={imgClassName}
          />
        </div>
      );
    }

    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image
          src={asset.src}
          alt={asset.alt}
          width={asset.width}
          height={asset.height}
          sizes={sizes}
          priority={priority}
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          className={`w-full h-auto ${imgClassName}`}
        />
      </div>
    );
  }

  // Branded teal gradient architectural placeholder when verified media hasn't been supplied yet
  return (
    <div
      role="img"
      aria-label={asset.alt}
      className={`relative overflow-hidden flex items-center justify-center ${
        darkSurface
          ? 'bg-gradient-to-br from-[#0F766E] via-[#0A4F4A] to-[#06262A] text-white'
          : 'bg-gradient-to-br from-[#E6F1F0] to-[#F3F7F7] text-[#06262A]'
      } ${asset.aspectClass} ${className}`}
    >
      {/* Subtle blueprint grid lines */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(45,212,191,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(45,212,191,0.22) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Dashed media slot card (explicit in development; understated architectural frame in production) */}
      <div
        className={`relative z-10 mx-4 max-w-md rounded-2xl border-2 border-dashed px-6 py-5 text-center backdrop-blur-sm ${
          darkSurface
            ? 'border-[#2DD4BF]/50 bg-[#06262A]/45 text-white'
            : 'border-[#0F766E]/40 bg-white/80 text-[#06262A]'
        }`}
      >
        <p className="text-sm font-bold tracking-wider uppercase text-[#2DD4BF]">
          {isDev ? 'Media Slot (Add in /lib/assets.ts)' : 'Trust Logistic Platform'}
        </p>
        <p className="mt-1.5 text-base font-semibold">
          {asset.label}
        </p>
        {isDev && (
          <p className="mt-1 text-sm opacity-80">
            Slot ID: <code>{asset.id}</code> · {asset.recommendedSize}
          </p>
        )}
      </div>
    </div>
  );
}

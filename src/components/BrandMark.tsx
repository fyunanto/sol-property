import { useEffect } from 'react';

// Signature SOLProperty SVG Favicon matching SOL Agency's vibrant red-orange-gold circular sun emblem
const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="solSunGrad" x1="12" y1="8" x2="54" y2="56" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#D92B22"/>
      <stop offset="52%" stop-color="#EA580C"/>
      <stop offset="100%" stop-color="#FACC15"/>
    </linearGradient>
    <linearGradient id="solWaveGrad" x1="12" y1="44" x2="52" y2="56" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#FACC15"/>
    </linearGradient>
  </defs>
  <circle cx="32" cy="32" r="30" fill="#FFFFFF" stroke="#F3E8E2" stroke-width="2"/>
  <circle cx="32" cy="32" r="25" fill="url(#solSunGrad)"/>
  <path d="M16 32L32 18L48 32" fill="none" stroke="#FFFFFF" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M21 29.5V43.5H43V29.5" fill="none" stroke="#FFFFFF" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="28" y="34" width="8" height="9.5" rx="1" fill="#FFFFFF"/>
  <path d="M14 46.5C21 43.2 43 43.2 50 46.5" fill="none" stroke="#FEF08A" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M19 51C25 48.6 39 48.6 45 51" fill="none" stroke="#FDE047" stroke-width="2.2" stroke-linecap="round"/>
</svg>`;

export function useDynamicFavicon() {
  useEffect(() => {
    const dataUri = `data:image/svg+xml,${encodeURIComponent(FAVICON_SVG)}`;
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.type = 'image/svg+xml';
    link.href = dataUri;
  }, []);
}

interface BrandMarkProps {
  size?: number;
  className?: string;
}

export function BrandMark({ size = 40, className = '' }: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="solPropertySunGrad" x1="10" y1="8" x2="54" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D92B22" />
          <stop offset="52%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#FACC15" />
        </linearGradient>
      </defs>
      {/* Clean circular white medallion with warm subtle rim (SOL Agency style) */}
      <circle cx="32" cy="32" r="30.5" fill="#FFFFFF" stroke="#F1E5DF" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="25.5" fill="url(#solPropertySunGrad)" />
      {/* Crisp Architectural Roof & Building Mark */}
      <path
        d="M15.5 31.5L32 17.5L48.5 31.5"
        stroke="#FFFFFF"
        strokeWidth="3.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 29V43H43V29"
        stroke="#FFFFFF"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Ledger Window Grid */}
      <rect x="27.5" y="33.5" width="9" height="9.5" rx="1.2" fill="#FFFFFF" fillOpacity="0.24" stroke="#FFFFFF" strokeWidth="2.2" />
      <line x1="32" y1="33.5" x2="32" y2="43" stroke="#FFFFFF" strokeWidth="1.8" />
      <line x1="27.5" y1="38" x2="36.5" y2="38" stroke="#FFFFFF" strokeWidth="1.8" />
      {/* Signature SOL Golden Sun Horizon Arcs */}
      <path
        d="M14.5 46.8C21.5 43.8 42.5 43.8 49.5 46.8"
        stroke="#FEF08A"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M20 51C25.5 48.8 38.5 48.8 44 51"
        stroke="#FDE047"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

import { useEffect } from 'react';

const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="solGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#1D4ED8"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="url(#solGrad)"/>
  <path d="M12 29L32 14L52 29" fill="none" stroke="#FFFFFF" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M18 26V49H46V26" fill="none" stroke="#FFFFFF" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="25" y="34" width="14" height="15" rx="1.5" fill="#FFFFFF" fill-opacity="0.22" stroke="#FFFFFF" stroke-width="2.6"/>
  <line x1="25" y1="40" x2="39" y2="40" stroke="#FFFFFF" stroke-width="2.2"/>
  <line x1="32" y1="34" x2="32" y2="49" stroke="#FFFFFF" stroke-width="2.2"/>
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

export function BrandMark({ size = 36, className = '' }: BrandMarkProps) {
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
        <linearGradient id="solPropertyMarkGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#solPropertyMarkGrad)" />
      <path
        d="M12 29L32 14L52 29"
        stroke="#FFFFFF"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 26V49H46V26"
        stroke="#FFFFFF"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="25"
        y="34"
        width="14"
        height="15"
        rx="1.5"
        fill="#FFFFFF"
        fillOpacity="0.2"
        stroke="#FFFFFF"
        strokeWidth="2.6"
      />
      <line x1="25" y1="40" x2="39" y2="40" stroke="#FFFFFF" strokeWidth="2.2" />
      <line x1="32" y1="34" x2="32" y2="49" stroke="#FFFFFF" strokeWidth="2.2" />
    </svg>
  );
}

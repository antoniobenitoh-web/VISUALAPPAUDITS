import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'auto';
}

export const SaleslandBrandMark: React.FC<{ className?: string }> = ({ className = "h-8" }) => (
  <div 
    className={`inline-flex items-center gap-2.5 select-none ${className}`}
    style={{ height: '36px', display: 'inline-flex', alignItems: 'center' }}
  >
    {/* Isotipo oficial Salesland: Chevrons geométricos en perspectiva */}
    <svg 
      viewBox="0 0 44 44" 
      className="shrink-0" 
      style={{ height: '36px', width: '36px' }}
      fill="none"
    >
      <path d="M17 8 L29 20 L24 25 L12 13 Z" fill="#00c4cc" />
      <path d="M23 14 L35 26 L30 31 L18 19 Z" fill="#ffffff" />
      <path d="M11 14 L23 26 L18 31 L6 19 Z" fill="#00828a" />
      <path d="M17 20 L29 32 L24 37 L12 25 Z" fill="#005d63" />
    </svg>
    <span 
      className="text-white font-bold tracking-tight text-xl font-sans"
      style={{ color: '#ffffff', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.02em' }}
    >
      Salesland
    </span>
  </div>
);

/**
 * Logotipo oficial de Salesland.
 * Utiliza la imagen corporativa oficial con fondo petróleo #104a60.
 */
export const SaleslandLogo: React.FC<LogoProps> = ({ className = "h-8" }) => (
  <div 
    className={`inline-flex items-center select-none ${className}`}
    style={{ height: '32px', display: 'inline-flex', alignItems: 'center' }}
  >
    <img
      src="./images/salesland_logo_transparent.png?v=2"
      alt="Salesland"
      style={{ height: '30px', width: 'auto', objectFit: 'contain' }}
      loading="eager"
    />
  </div>
);

/**
 * Logotipo oficial de Xiaomi.
 * Squircle naranja con el isotipo 'mi' en blanco.
 */
export const XiaomiLogo: React.FC<{ className?: string; withLabel?: boolean }> = ({ 
  className = "w-10 h-10",
  withLabel = false 
}) => (
  <div 
    className="inline-flex items-center gap-2 select-none"
    style={{ display: 'inline-flex', alignItems: 'center' }}
  >
    <div 
      className={`overflow-hidden shrink-0 shadow-md ${className}`}
      style={{ width: '42px', height: '42px', borderRadius: '14px', overflow: 'hidden' }}
    >
      <img
        src="./images/xiaomi_logo.png"
        alt="Xiaomi"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        loading="eager"
      />
    </div>
    {withLabel && (
      <span className="text-white font-bold tracking-wide text-xs">
        Xiaomi
      </span>
    )}
  </div>
);

/**
 * Insignia Co-branding oficial Salesland + Xiaomi
 */
export const CoBrandBadge: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-[#0a3343]/90 border border-[#009ca6]/30 backdrop-blur-md shadow-sm ${className}`}>
    <img
      src="./images/salesland_logo.png"
      alt="Salesland"
      className="h-5 sm:h-6 w-auto object-contain"
    />
    <div className="h-4 w-px bg-white/20" />
    <div className="flex items-center gap-1.5">
      <img
        src="./images/xiaomi_logo.png"
        alt="Xiaomi"
        className="w-4 h-4 rounded-md object-cover shadow-xs"
      />
      <span className="text-[11px] font-bold text-slate-200 tracking-tight">
        Retail Brand Spaces
      </span>
    </div>
  </div>
);


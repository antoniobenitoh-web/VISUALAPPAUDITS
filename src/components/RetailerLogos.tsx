import React from 'react';
import { RetailerId } from '../types';

interface RetailerLogoProps {
  id: RetailerId | string;
  className?: string;
  variant?: 'card' | 'filter' | 'header' | 'icon';
}

export const RetailerLogo: React.FC<RetailerLogoProps> = ({ 
  id, 
  className = "",
  variant = 'card' 
}) => {
  const normId = (id || '').trim().toLowerCase();

  let logoSrc = './images/retailers/mediamarkt.png';
  let altText = id;

  if (normId.includes('alcampo') || normId.includes('utebo') || normId.startsWith('alcp')) {
    logoSrc = './images/retailers/alcampo.png';
    altText = 'Alcampo';
  } else if (normId.includes('corte') || normId.includes('eci') || normId === 'el corte inglés') {
    logoSrc = './images/retailers/el_corte_ingles.svg';
    altText = 'El Corte Inglés';
  } else if (normId.includes('fnac')) {
    logoSrc = './images/retailers/fnac.webp';
    altText = 'FNAC';
  } else if (normId.includes('carrefour') || normId.includes('crf')) {
    logoSrc = './images/retailers/carrefour.svg';
    altText = 'Carrefour';
  } else if (normId.includes('media') || normId.includes('markt') || normId === 'mediamarkt') {
    logoSrc = './images/retailers/mediamarkt.png';
    altText = 'MediaMarkt';
  } else {
    return (
      <div className={`inline-flex items-center justify-center px-2 py-0.5 bg-slate-100 rounded-md text-slate-700 font-bold text-[11px] ${className}`}>
        <span>{id}</span>
      </div>
    );
  }

  // 1. Variante para botones de filtros superiores: nunca sobrepasa el botón (exactamente 20x20px en caja contenedora)
  if (variant === 'filter') {
    return (
      <div 
        className="w-5 h-5 min-w-[20px] min-h-[20px] max-w-[20px] max-h-[20px] rounded-md bg-white flex items-center justify-center p-0.5 shrink-0 overflow-hidden shadow-2xs border border-slate-200/60"
        style={{ width: '20px', height: '20px', minWidth: '20px', minHeight: '20px' }}
      >
        <img
          src={logoSrc}
          alt={altText}
          className="w-full h-full object-contain"
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
        />
      </div>
    );
  }

  // 2. Variante para tarjetas de tienda: con fondo acorde a la app (caja blanca redondeada estilizada)
  return (
    <div 
      className={`inline-flex items-center justify-start ${className}`}
      style={{ maxHeight: '36px' }}
    >
      <div 
        className="h-8 px-2.5 py-1 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-center transition group-hover:border-[#009ca6]/50"
        style={{ height: '32px', minHeight: '32px', maxWidth: '130px', display: 'flex', alignItems: 'center', backgroundColor: '#ffffff' }}
      >
        <img
          src={logoSrc}
          alt={altText}
          style={{ maxHeight: '22px', maxWidth: '105px', width: 'auto', height: 'auto', objectFit: 'contain' }}
          loading="lazy"
        />
      </div>
    </div>
  );
};

import React from 'react';
import { RetailerId, StoreCenter, UserProfile } from '../types';
import { INITIAL_RETAILERS } from '../data/defaultData';
import { AuthService } from '../services/authService';
import { RetailerLogo } from './RetailerLogos';
import { Store, ChevronRight, Sparkles, Building2, CheckCircle2, Clock } from 'lucide-react';

interface SurfaceSelectorProps {
  currentUser: UserProfile;
  stores: StoreCenter[];
  onSelectRetailer: (retailerId: RetailerId) => void;
}

export const SurfaceSelector: React.FC<SurfaceSelectorProps> = ({
  currentUser,
  stores,
  onSelectRetailer
}) => {
  const accessibleStores = AuthService.filterStoresForUser(currentUser, stores);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Banner de Bienvenida y Resumen Ejecutivo */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Plataforma Oficial de Auditoría · Brand Spaces Retail</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Selecciona una Superficie Comercial
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Accede a las mesas de experiencia Xiaomi, revisa el cumplimiento de planogramas en 3D e inspecciona dispositivos y maquetas en tienda.
            </p>
          </div>

          {/* KPI rápido de tiendas asignadas */}
          <div className="flex items-center gap-3 bg-slate-950/70 border border-slate-700/80 p-4 rounded-2xl shrink-0">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-black">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Tiendas a tu cargo ({currentUser.rol})
              </span>
              <span className="text-lg font-black text-white">
                {accessibleStores.length} {accessibleStores.length === 1 ? 'punto de venta' : 'puntos de venta'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Superficies con Logotipos Oficiales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {INITIAL_RETAILERS.map((retailer) => {
          const retailerStores = accessibleStores.filter((s) => s.retailer === retailer.id);
          const count = retailerStores.length;
          const isAvailable = count > 0;

          return (
            <div
              key={retailer.id}
              onClick={() => {
                if (isAvailable) onSelectRetailer(retailer.id);
              }}
              className={`group relative rounded-3xl p-5 sm:p-6 border transition-all duration-300 flex flex-col justify-between ${
                isAvailable
                  ? 'bg-slate-900/90 hover:bg-slate-800/90 border-slate-700 hover:border-slate-500 shadow-xl hover:shadow-2xl cursor-pointer hover:-translate-y-1'
                  : 'bg-slate-900/40 border-slate-800/40 opacity-60 cursor-not-allowed'
              }`}
            >
              <div>
                {/* Cabecera con Logotipo Oficial */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-36 h-12 flex items-center">
                    <RetailerLogo id={retailer.id} className="w-full h-11 object-contain" />
                  </div>

                  {count > 0 ? (
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>{count} {count === 1 ? 'Tienda' : 'Tiendas'}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-500 border border-slate-700">
                      Sin tiendas
                    </span>
                  )}
                </div>

                {/* Título y Descripción Intuitiva */}
                <h3 className="text-base font-extrabold text-white group-hover:text-sky-300 transition-colors mt-2">
                  {retailer.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {isAvailable
                    ? `Mesas de experiencia y expositores disponibles para auditar.`
                    : `No hay tiendas asignadas para tu rol o zona actual.`}
                </p>
              </div>

              {/* Botón Táctil de Acción */}
              <div className="pt-4 mt-5 border-t border-slate-800/80 flex items-center justify-between">
                <span className={`text-xs font-extrabold transition-colors ${
                  isAvailable ? 'text-sky-400 group-hover:text-white' : 'text-slate-600'
                }`}>
                  {isAvailable ? 'Abrir Directorio' : 'No disponible'}
                </span>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isAvailable
                      ? 'bg-slate-800 group-hover:bg-sky-600 text-white group-hover:translate-x-1 shadow-md'
                      : 'bg-slate-800/40 text-slate-600'
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

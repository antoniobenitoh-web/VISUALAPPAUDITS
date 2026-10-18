import React, { useState } from 'react';
import { StoreCenter, UserProfile } from '../../types';
import { AuthService } from '../../services/authService';
import { DbService } from '../../services/dbService';
import { RetailerLogo } from '../RetailerLogos';
import { SaleslandLogo, XiaomiLogo } from '../SaleslandBrandLogos';
import { 
  ArrowLeft, 
  Search, 
  ChevronRight, 
  Store, 
  MapPin, 
  Layers, 
  Clock, 
  X
} from 'lucide-react';

interface StoreSelectScreenProps {
  currentUser: UserProfile;
  stores: StoreCenter[];
  onSelectStore: (store: StoreCenter) => void;
  onBack: () => void;
}

export const StoreSelectScreen: React.FC<StoreSelectScreenProps> = ({
  currentUser,
  stores,
  onSelectStore,
  onBack
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChain, setSelectedChain] = useState<string>('all');

  // Filtrado RBAC estricto según rol del usuario con fallback a catálogo de tiendas
  const storeCatalog = stores && stores.length > 0 ? stores : DbService.getStores();
  const accessibleStores = AuthService.filterStoresForUser(currentUser, storeCatalog);

  const filteredStores = accessibleStores.filter((s) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      s.nombreTienda.toLowerCase().includes(term) ||
      s.zona.toLowerCase().includes(term) ||
      s.tiendaId.toLowerCase().includes(term) ||
      s.retailer.toLowerCase().includes(term);

    const matchesChain = selectedChain === 'all' || s.retailer === selectedChain;
    return matchesSearch && matchesChain;
  });

  // Estadísticas rápidas para los filtros
  const retailerCounts: Record<string, number> = {
    all: accessibleStores.length,
    'MediaMarkt': accessibleStores.filter(s => s.retailer === 'MediaMarkt').length,
    'El Corte Inglés': accessibleStores.filter(s => s.retailer === 'El Corte Inglés').length,
    'FNAC': accessibleStores.filter(s => s.retailer === 'FNAC').length,
    'Carrefour': accessibleStores.filter(s => s.retailer === 'Carrefour').length,
    'Alcampo': accessibleStores.filter(s => s.retailer === 'Alcampo').length,
  };

  return (
    <div className="w-full min-h-[92dvh] sm:min-h-[80vh] flex flex-col bg-white text-slate-800 rounded-none sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 transition-all duration-300">
      
      {/* HEADER CORPORATIVO SALESLAND con guiño a XIAOMI */}
      <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-[#072431] via-[#104a60] to-[#0a3343] text-white flex items-center justify-between sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
            title="Volver a Inicio"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                Directorio de Centros
              </span>
              <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[#ff6900]" />
              <span className="hidden sm:inline-block text-[11px] text-slate-300">
                Xiaomi Brand Spaces
              </span>
            </div>
            <h1 className="text-base sm:text-xl font-black text-white tracking-tight">
              Selecciona Espacio a Auditar
            </h1>
          </div>
        </div>

        {/* Co-branding pill & auditor activo */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/25 border border-white/10 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-medium">Auditor:</span>
            <span className="font-bold text-white truncate max-w-[120px]">{currentUser.nombre}</span>
          </div>

          <div className="flex items-center gap-2 bg-white/10 px-2.5 py-1 rounded-xl border border-white/10">
            <img src="./images/xiaomi_logo.png" alt="Xiaomi" className="w-5 h-5 rounded-md object-cover" />
            <span className="text-[10px] font-bold text-slate-200 uppercase tracking-tight hidden sm:inline">Partner</span>
          </div>
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA Y FILTRADO POR RETAILER */}
      <div className="p-4 sm:px-6 sm:py-4 bg-slate-50/80 border-b border-slate-200/80 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          
          {/* Buscador de Tiendas */}
          <div className="relative flex-1 max-w-xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar tienda por nombre, código ECI/MM, localidad o zona..."
              className="w-full bg-white border border-slate-300/80 rounded-2xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009ca6] focus:border-transparent transition shadow-xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Contador de tiendas */}
          <div className="text-[11px] font-bold text-slate-500 flex items-center justify-between sm:justify-end gap-2 shrink-0">
            <span>Mostrando <strong className="text-slate-900">{filteredStores.length}</strong> de {accessibleStores.length} tiendas</span>
          </div>
        </div>

        {/* Píldoras de Filtro por Retailer Oficial */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
          <button
            onClick={() => setSelectedChain('all')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              selectedChain === 'all'
                ? 'bg-[#104a60] text-white shadow-sm ring-2 ring-[#009ca6]/40'
                : 'bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200'
            }`}
          >
            <span>Todos los Retailers</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              selectedChain === 'all' ? 'bg-[#009ca6] text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {retailerCounts['all'] || 0}
            </span>
          </button>

          {(['MediaMarkt', 'El Corte Inglés', 'FNAC', 'Carrefour', 'Alcampo'] as const).map((ch) => {
            const isSelected = selectedChain === ch;
            const count = retailerCounts[ch] || 0;

            return (
              <button
                key={ch}
                onClick={() => setSelectedChain(ch)}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 border ${
                  isSelected
                    ? 'bg-[#104a60] text-white shadow-sm border-[#104a60] ring-2 ring-[#009ca6]/40'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <RetailerLogo id={ch} variant="filter" />
                <span>{ch}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-[#009ca6] text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* GRID RESPONSIVO DE TIENDAS FLUIDO Y PROPORCIONADO */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/50">
        {filteredStores.length === 0 ? (
          <div className="py-24 text-center space-y-3 text-slate-400">
            <Store className="w-12 h-12 mx-auto text-slate-300" />
            <h3 className="text-sm font-bold text-slate-700">No se encontraron tiendas</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No hay espacios de marca que coincidan con la búsqueda "{searchTerm}" o el filtro seleccionado.
            </p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedChain('all'); }}
              className="text-xs font-bold text-[#009ca6] hover:underline cursor-pointer"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,310px),1fr))] gap-4">
            {filteredStores.map((store) => {
              const draft = DbService.getDraft(store.tiendaId);
              const hasDraft = draft && draft.length > 0;
              const draftCount = draft ? draft.length : 0;
              const totalPuestos = store.totalPuestos || 12;

              return (
                <div
                  key={store.tiendaId}
                  onClick={() => onSelectStore(store)}
                  className="group relative bg-white hover:bg-slate-50/90 rounded-2xl p-4 sm:p-5 border border-slate-200/90 hover:border-[#009ca6] shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[170px] hover:-translate-y-0.5"
                >
                  {/* Fila superior: Logo Retailer y Estado */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <RetailerLogo id={store.retailer} variant="card" />

                    {hasDraft ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span>Borrador ({draftCount}/{totalPuestos})</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                        <span>Pendiente</span>
                      </span>
                    )}
                  </div>

                  {/* Nombre del centro y detalles */}
                  <div className="space-y-1 my-2">
                    <h3 
                      className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-[#104a60] transition leading-snug line-clamp-1"
                      title={store.nombreTienda}
                    >
                      {store.nombreTienda}
                    </h3>
                    
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{store.zona || 'España'}</span>
                      <span className="text-slate-300">•</span>
                      <span className="font-mono text-[11px] text-slate-400">{store.tiendaId}</span>
                    </div>
                  </div>

                  {/* Pie de la tarjeta: Tipo de Espacio y Botón Acción */}
                  <div className="pt-2.5 mt-auto border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600 font-semibold text-[11px]">
                      <Layers className="w-3.5 h-3.5 text-[#009ca6]" />
                      <span>{store.tipoEspacioId}</span>
                      <span className="text-slate-400 font-normal">({totalPuestos} puestos)</span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-bold text-[#009ca6] group-hover:translate-x-0.5 transition">
                      <span>Auditar</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FOOTER CORPORATIVO */}
      <div className="px-6 py-3 bg-white border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-600">
            {stores.length} {stores.length === 1 ? 'centro asignado' : 'centros asignados'}
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-400">
          <span>Salesland Retail</span>
          <span>•</span>
          <span className="text-[#ff6900] font-bold">Xiaomi España</span>
        </div>
      </div>

    </div>
  );
};

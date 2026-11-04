import React, { useState } from 'react';
import { StoreCenter, UserProfile, AuditWorkflowMode } from '../../types';
import { AuthService } from '../../services/authService';
import { DbService } from '../../services/dbService';
import {
  ACTIVE_IMPLANTATION_CAMPAIGN,
  hasActiveImplantationCampaign
} from '../../data/implantationCampaignData';
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
  X,
  ClipboardCheck,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Lock,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

interface StoreSelectScreenProps {
  currentUser: UserProfile;
  stores: StoreCenter[];
  onSelectStore: (store: StoreCenter) => void;
  onSelectStoreMode?: (store: StoreCenter, mode: AuditWorkflowMode) => void;
  onBack: () => void;
}

// Normalización insensible a tildes, mayúsculas y diacríticos
const normalizeStr = (text: string): string => {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

// Generador de supertexto de búsqueda enriquecido con sinónimos de cadena comercial
const getStoreSearchableText = (store: StoreCenter): string => {
  const parts = [
    store.nombreTienda,
    store.tiendaId,
    store.retailer,
    store.zona || '',
    store.region || '',
    store.tipoEspacioId || ''
  ];

  const ret = (store.retailer || '').toLowerCase();
  if (ret.includes('media') || ret.includes('markt')) {
    parts.push('mm mediamarkt media markt');
  } else if (ret.includes('corte') || ret.includes('eci')) {
    parts.push('eci el corte ingles corte ingles');
  } else if (ret.includes('carrefour') || ret.includes('crf')) {
    parts.push('crf carrefour');
  } else if (ret.includes('alcampo') || ret.includes('alcp')) {
    parts.push('alcp alcampo hipermercado utebo');
  } else if (ret.includes('fnac')) {
    parts.push('fnac');
  }

  return normalizeStr(parts.join(' '));
};

// Comprobación multi-palabra inteligente: cada palabra introducida debe encontrarse en el centro
const isStoreMatch = (store: StoreCenter, search: string): boolean => {
  const cleanSearch = normalizeStr(search);
  if (!cleanSearch) return true;

  const tokens = cleanSearch.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;

  const searchable = getStoreSearchableText(store);
  return tokens.every(token => searchable.includes(token));
};

// Resaltado visual sutil de coincidencias
const highlightMatch = (text: string, query: string) => {
  const cleanQuery = normalizeStr(query);
  if (!cleanQuery) return text;

  const tokens = cleanQuery.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return text;

  const escaped = tokens
    .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .filter(t => t.length > 0)
    .join('|');

  if (!escaped) return text;

  try {
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-amber-200 text-amber-950 px-0.5 rounded font-black">
          {part}
        </mark>
      ) : (
        part
      )
    );
  } catch {
    return text;
  }
};

export const StoreSelectScreen: React.FC<StoreSelectScreenProps> = ({
  currentUser,
  stores,
  onSelectStore,
  onSelectStoreMode,
  onBack
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChain, setSelectedChain] = useState<string>('all');
  const [modalStore, setModalStore] = useState<StoreCenter | null>(null);

  const handleStoreCardClick = (store: StoreCenter) => {
    setModalStore(store);
  };

  const handleChooseWorkflow = (store: StoreCenter, mode: AuditWorkflowMode) => {
    setModalStore(null);
    if (onSelectStoreMode) {
      onSelectStoreMode(store, mode);
    } else {
      onSelectStore(store);
    }
  };

  // Filtrado RBAC estricto según rol del usuario con fallback a catálogo de tiendas y sanitización
  const storeCatalog = (stores && stores.length > 0 ? stores : DbService.getStores()).map(s => DbService.sanitizeStore(s));
  const accessibleStores = AuthService.filterStoresForUser(currentUser, storeCatalog);

  // 1. Filtrado inteligente en tiempo real sobre el catálogo accesible
  const searchMatchedStores = accessibleStores.filter(s => isStoreMatch(s, searchTerm));

  // 2. Si hay búsqueda y el filtro de retailer deja 0 resultados pero existen en otros,
  // conmutamos automáticamente a 'all' para no dar falsos negativos
  const matchesInSelectedChain = searchMatchedStores.filter(s => selectedChain === 'all' || s.retailer === selectedChain).length;
  const effectiveChain = (searchTerm.trim() && matchesInSelectedChain === 0 && searchMatchedStores.length > 0)
    ? 'all'
    : selectedChain;

  const filteredStores = searchMatchedStores.filter(s => effectiveChain === 'all' || s.retailer === effectiveChain);

  // 3. Contadores dinámicos que se recalculan en vivo mientras se teclea
  const retailerCounts: Record<string, number> = {
    all: searchMatchedStores.length,
    'MediaMarkt': searchMatchedStores.filter(s => s.retailer === 'MediaMarkt').length,
    'El Corte Inglés': searchMatchedStores.filter(s => s.retailer === 'El Corte Inglés').length,
    'FNAC': searchMatchedStores.filter(s => s.retailer === 'FNAC').length,
    'Carrefour': searchMatchedStores.filter(s => s.retailer === 'Carrefour').length,
    'Alcampo': searchMatchedStores.filter(s => s.retailer === 'Alcampo').length,
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
          
          {/* Buscador Inteligente de Tiendas */}
          <div className="relative flex-1 max-w-xl">
            <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
              searchTerm.trim() ? 'text-[#009ca6]' : 'text-slate-400'
            }`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, código, localidad, marca (ej. Utebo, MM, ECI)..."
              className="w-full bg-white border border-slate-300/80 rounded-2xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009ca6] focus:border-transparent transition shadow-xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                title="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Contador en tiempo real */}
          <div className="text-[11px] font-bold text-slate-500 flex items-center justify-between sm:justify-end gap-2 shrink-0">
            {searchTerm.trim() ? (
              <span className="text-[#009ca6] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#009ca6] animate-pulse" />
                <span><strong className="text-slate-900">{filteredStores.length}</strong> {filteredStores.length === 1 ? 'coincidencia' : 'coincidencias'}</span>
              </span>
            ) : (
              <span>Mostrando <strong className="text-slate-900">{filteredStores.length}</strong> de {accessibleStores.length} tiendas</span>
            )}
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
              const latestAudit = DbService.getLatestAuditForStore(store.tiendaId);

              const impDraft = DbService.getImplantationDraft(store.tiendaId);
              const impRecord = DbService.getLatestImplantationForStore(store.tiendaId);
              const hasImpDraft = impDraft && (
                Object.values(impDraft.swapStates || {}).some(s => s.estadoSwap !== 'Pendiente') ||
                Object.values(impDraft.visualStates || {}).some(v => v.estadoVisual !== 'Pendiente')
              );

              return (
                <div
                  key={store.tiendaId}
                  onClick={() => handleStoreCardClick(store)}
                  className="group relative bg-white hover:bg-slate-50/90 rounded-2xl p-4 sm:p-5 border border-slate-200/90 hover:border-[#009ca6] shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[175px] hover:-translate-y-0.5"
                >
                  {/* Fila superior: Logo Retailer y Estado */}
                  <div className="flex items-start justify-between gap-2 mb-2.5 flex-wrap">
                    <RetailerLogo id={store.retailer} variant="card" />

                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {hasActiveImplantationCampaign(store) && impRecord ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>Swap OK</span>
                        </span>
                      ) : hasActiveImplantationCampaign(store) && hasImpDraft ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-[#ff6900] border border-orange-200 shrink-0">
                          <RefreshCw className="w-3 h-3 text-[#ff6900]" />
                          <span>Swap en curso</span>
                        </span>
                      ) : null}

                      {hasDraft ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                          <Clock className="w-3 h-3 text-amber-500" />
                          <span>Borrador ({draftCount}/{totalPuestos})</span>
                        </span>
                      ) : latestAudit ? (
                        latestAudit.incidenciasCount > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                            <AlertTriangle className="w-3 h-3 text-rose-500" />
                            <span>Incidencias ({latestAudit.incidenciasCount})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>Vigente OK</span>
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                          <span>Pendiente</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Nombre del centro y detalles con resaltado inteligente */}
                  <div className="space-y-1 my-2">
                    <h3 
                      className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-[#104a60] transition leading-snug line-clamp-1"
                      title={store.nombreTienda}
                    >
                      {highlightMatch(store.nombreTienda, searchTerm)}
                    </h3>
                    
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{highlightMatch(store.zona || 'España', searchTerm)}</span>
                      <span className="text-slate-300">•</span>
                      <span className="font-mono text-[11px] text-slate-400">{highlightMatch(store.tiendaId, searchTerm)}</span>
                    </div>

                    {latestAudit && !hasDraft && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium pt-0.5">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>Auditada: {latestAudit.fechaHora.slice(0, 10)}</span>
                      </div>
                    )}
                  </div>

                  {/* Pie de la tarjeta: Tipo de Espacio y Botón Acción */}
                  <div className="pt-2.5 mt-auto border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600 font-semibold text-[11px]">
                      <Layers className="w-3.5 h-3.5 text-[#009ca6]" />
                      <span>{store.tipoEspacioId}</span>
                      <span className="text-slate-400 font-normal">({totalPuestos} puestos)</span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-bold text-[#009ca6] group-hover:translate-x-0.5 transition">
                      <span>Seleccionar Modo</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL DE SELECCIÓN DE MODALIDAD: AUDITORÍA COMPLETA vs NUEVA IMPLANTACIÓN */}
      {modalStore && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setModalStore(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera del Modal */}
            <div className="px-6 py-5 bg-gradient-to-r from-[#072431] via-[#104a60] to-[#0a3343] text-white flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-teal-300 font-mono text-[11px] font-bold border border-white/15">
                    {modalStore.tiendaId}
                  </span>
                  <span className="text-xs text-slate-300 font-medium">
                    {modalStore.retailer} · {modalStore.tipoEspacioId}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
                  {modalStore.nombreTienda}
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Selecciona el tipo de intervención a realizar en este espacio Xiaomi:
                </p>
              </div>
              <button
                onClick={() => setModalStore(null)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Opciones de flujo */}
            <div className="p-5 sm:p-6 space-y-3.5 bg-slate-50">
              {/* Tarjeta de Resumen del Reporte Vigente (si existe) */}
              {(() => {
                const latest = DbService.getLatestAuditForStore(modalStore.tiendaId);
                const draft = DbService.getDraft(modalStore.tiendaId);
                if (!latest && (!draft || draft.length === 0)) return null;

                return (
                  <div className="bg-sky-50/90 border border-sky-200/90 rounded-2xl p-3.5 sm:p-4 text-xs text-sky-950 flex flex-col gap-1.5 shadow-2xs">
                    <div className="flex items-center justify-between font-bold">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#009ca6]" />
                        <span className="text-slate-900 font-extrabold text-xs sm:text-sm">
                          {draft && draft.length > 0 ? 'Borrador temporal detectado' : 'Último reporte vigente disponible'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-normal">
                        {draft && draft.length > 0 ? `${draft.length} puestos modificados` : latest?.fechaHora}
                      </span>
                    </div>

                    {latest && (!draft || draft.length === 0) && (
                      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-600 border-t border-sky-100">
                        <span>Auditor: <strong className="text-slate-800">{latest.usuarioNombre}</strong></span>
                        <div className="flex items-center gap-2 font-bold">
                          <span className="text-emerald-600">{latest.okCount} OK</span>
                          <span>•</span>
                          <span className={latest.incidenciasCount > 0 ? 'text-rose-600' : 'text-slate-500'}>
                            {latest.incidenciasCount} incidencias
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* OPCIÓN A: CONTINUAR / ACTUALIZAR REPORTE VIGENTE O AUDITORÍA COMPLETA */}
              {(() => {
                const hasExistingData = Boolean(
                  DbService.getLatestAuditForStore(modalStore.tiendaId) ||
                  (DbService.getDraft(modalStore.tiendaId)?.length || 0) > 0
                );
                const isPromotor = (currentUser?.rol || '').toLowerCase().includes('promotor');
                const canResetAudit = !isPromotor;

                return (
                  <>
                    <button
                      onClick={() => handleChooseWorkflow(modalStore, 'complete_audit')}
                      className="w-full text-left bg-white hover:bg-teal-50/40 border-2 border-slate-200 hover:border-[#009ca6] rounded-2xl p-4 sm:p-5 transition-all shadow-xs hover:shadow-md group cursor-pointer flex items-center gap-4"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[#104a60]/10 group-hover:bg-[#009ca6] text-[#104a60] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                        <ClipboardCheck className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-[#104a60]">
                            {hasExistingData ? 'Continuar / Modificar reporte vigente' : 'Auditoría completa de tienda'}
                          </h3>
                          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#009ca6] group-hover:translate-x-0.5 transition shrink-0" />
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">
                          {hasExistingData
                            ? 'Carga los puestos auditados para modificar terminales o solventar incidencias sin empezar de cero.'
                            : 'Audita y verifica todas las posiciones y dispositivos del planograma.'}
                        </p>
                      </div>
                    </button>

                    {hasExistingData && canResetAudit && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('¿Seguro que deseas iniciar una auditoría limpia desde cero? Esto reiniciará las posiciones previas de esta tienda.')) {
                            handleChooseWorkflow(modalStore, 'clean_audit');
                          }
                        }}
                        className="w-full text-left bg-white hover:bg-slate-100/80 border border-slate-200 rounded-xl px-4 py-2.5 transition flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                          <span>Iniciar nueva auditoría limpia (desde cero)</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Reset</span>
                      </button>
                    )}
                  </>
                );
              })()}

              {/* OPCIÓN B: NUEVA IMPLANTACIÓN (Visible en todas las tiendas; activa solo en las que coinciden con el planograma de MediaMarkt Tarragona) */}
              {(() => {
                const isCampaignActive = hasActiveImplantationCampaign(modalStore);
                return (
                  <button
                    type="button"
                    disabled={!isCampaignActive}
                    onClick={() => {
                      if (!isCampaignActive) return;
                      handleChooseWorkflow(modalStore, 'new_implantation');
                    }}
                    className={`w-full text-left rounded-2xl p-4 sm:p-5 transition-all flex items-center gap-4 relative overflow-hidden border-2 ${
                      isCampaignActive
                        ? 'bg-white hover:bg-orange-50/40 border-orange-200 hover:border-[#ff6900] shadow-xs hover:shadow-md group cursor-pointer'
                        : 'bg-slate-100/90 border-slate-200 opacity-75 cursor-not-allowed'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                        isCampaignActive
                          ? 'bg-[#ff6900]/15 group-hover:bg-[#ff6900] text-[#ff6900] group-hover:text-white'
                          : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {isCampaignActive ? (
                        <RefreshCw className="w-6 h-6" />
                      ) : (
                        <Lock className="w-6 h-6" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        {isCampaignActive ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-white bg-[#ff6900] px-2.5 py-0.5 rounded-md shadow-xs">
                              <Sparkles className="w-3 h-3" /> Campaña Activa
                            </span>
                            <span className="text-[11px] font-extrabold text-[#104a60] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                              {ACTIVE_IMPLANTATION_CAMPAIGN}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 bg-slate-200/80 px-2.5 py-0.5 rounded-md">
                            <Lock className="w-3 h-3" /> Sin implantación disponible
                          </span>
                        )}
                        {isCampaignActive && (
                          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#ff6900] group-hover:translate-x-0.5 transition shrink-0" />
                        )}
                      </div>
                      <h3
                        className={`text-base sm:text-lg font-black mt-1.5 transition-colors ${
                          isCampaignActive
                            ? 'text-slate-900 group-hover:text-[#ff6900]'
                            : 'text-slate-500'
                        }`}
                      >
                        Nueva implantación
                      </h3>
                      {!isCampaignActive && (
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">
                          No hay ninguna implantación nueva disponible para este planograma ({modalStore.tipoEspacioId}).
                        </p>
                      )}
                    </div>
                  </button>
                );
              })()}
            </div>

            {/* Pie del Modal */}
            <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Puedes alternar entre ambos flujos en cualquier momento</span>
              <button
                onClick={() => setModalStore(null)}
                className="font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

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

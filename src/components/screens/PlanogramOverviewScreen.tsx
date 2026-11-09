import React, { useState, useMemo } from 'react';
import { StoreCenter, PlanogramPosition, PositionAuditState, UserProfile, VisualElementAuditState } from '../../types';
import { DbService } from '../../services/dbService';
import { getPositionsForSpace } from '../../data/defaultData';
import { PLANOGRAM_IMAGES } from '../../data/planogramImages';
import { getStorePosmConfig, StorePosmItem } from '../../data/storePosmData';
import { InteractiveColumnCanvas } from '../3d/InteractiveColumnCanvas';
import { PosmInspectModal } from '../PosmInspectModal';
import { RetailerLogo } from '../RetailerLogos';
import { 
  ArrowLeft, 
  HelpCircle, 
  Layers, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Smartphone,
  Watch,
  Headphones,
  Tablet,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Building2,
  Ruler,
  Eye,
  Check,
  X,
  RotateCcw as ResetIcon
} from 'lucide-react';

interface PlanogramOverviewScreenProps {
  store: StoreCenter;
  currentUser?: UserProfile;
  auditStates: Record<string, PositionAuditState>;
  initialActiveSpace?: string;
  onActiveSpaceChange?: (space: string) => void;
  initialSelectedPositionId?: string | null;
  onSelectPositionIdChange?: (posId: string) => void;
  initialViewMode?: 'visual' | 'list';
  onViewModeChange?: (mode: 'visual' | 'list') => void;
  onSelectPosition: (pos: PlanogramPosition) => void;
  onFinishAudit: () => void;
  onBack: () => void;
  onResetAudit?: () => void;
}

export const PlanogramOverviewScreen: React.FC<PlanogramOverviewScreenProps> = ({
  store,
  currentUser,
  auditStates,
  initialActiveSpace,
  onActiveSpaceChange,
  initialSelectedPositionId,
  onSelectPositionIdChange,
  initialViewMode,
  onViewModeChange,
  onSelectPosition,
  onFinishAudit,
  onBack,
  onResetAudit
}) => {
  const [viewMode, setViewModeState] = useState<'visual' | 'list'>(initialViewMode || 'visual');
  const setViewMode = (mode: 'visual' | 'list') => {
    setViewModeState(mode);
    if (onViewModeChange) onViewModeChange(mode);
  };
  const [showLegend, setShowLegend] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const posmConfig = useMemo(() => getStorePosmConfig(store.tiendaId), [store.tiendaId]);
  const posmItems = useMemo(() => posmConfig?.elementos || [], [posmConfig]);

  const rawAvailableSpaces = store.availableSpaces && store.availableSpaces.length > 0
    ? store.availableSpaces
    : ['MESA 1 · Cara 1', 'MESA 1 · Cara 2', 'WALL', 'LINEAL SMARTWATCH'];

  const availableSpaces = useMemo(() => {
    const list = [...rawAvailableSpaces];
    // Añadir tab COLUMNA si la tienda tiene columna
    if (posmConfig?.hasColumnas && !list.some(s => s.toUpperCase().includes('COLUMNA'))) {
      list.push('COLUMNA');
    }
    // Añadir tab POSM si hay wall, miniwall, o top_table (elementos sin tab propio)
    const hasPosmExtras = posmConfig && (
      posmConfig.hasWall ||
      (posmConfig.hasMiniwall && !posmConfig.hasColumnas) || // miniwall solo (sin columna)
      posmConfig.hasTopTables
    );
    if (hasPosmExtras && !list.some(s => s.toUpperCase() === 'POSM')) {
      list.push('POSM');
    }
    return list;
  }, [rawAvailableSpaces, posmConfig]);

  const [activeSpace, setActiveSpaceState] = useState<string>(() => {
    if (initialActiveSpace && availableSpaces.includes(initialActiveSpace)) {
      return initialActiveSpace;
    }
    return availableSpaces[0];
  });
  const setActiveSpace = (space: string) => {
    setActiveSpaceState(space);
    if (onActiveSpaceChange) onActiveSpaceChange(space);
  };
  const isColumnaActive = activeSpace.toUpperCase().includes('COLUMNA');
  const isPosmTabActive = activeSpace.toUpperCase() === 'POSM';
  const positions = (isColumnaActive || isPosmTabActive) ? [] : getPositionsForSpace(store.tipoEspacioId, activeSpace, store);

  const [posmStates, setPosmStates] = useState<Record<string, VisualElementAuditState>>(() => {
    return DbService.getAuditPosmDraft(store.tiendaId) || {};
  });
  const [inspectingPosmItem, setInspectingPosmItem] = useState<StorePosmItem | null>(null);
  const [selectedColumnFace, setSelectedColumnFace] = useState<number>(1);
  const [showPosmDrawer, setShowPosmDrawer] = useState<boolean>(false);

  const handleSavePosmState = (st: VisualElementAuditState) => {
    const updated = { ...posmStates, [st.elementoId]: st };
    setPosmStates(updated);
    DbService.saveAuditPosmDraft(store.tiendaId, updated);
  };

  const auditedPosmCount = useMemo(() => {
    return posmItems.filter((it) => {
      const st = posmStates[it.id];
      return st && (st.estadoVisual === 'OK' || st.estadoVisual === 'Incidencia');
    }).length;
  }, [posmItems, posmStates]);

  const hasWall = store.availableSpaces && store.availableSpaces.some(s => s.toUpperCase().includes('WALL') && !s.toUpperCase().includes('MINIWALL'));
  const isTable1 = store.tipoEspacioId.includes('Table 1');
  const isTable2 = store.tipoEspacioId.includes('Table 2');
  const isTableCrf = store.tipoEspacioId.includes('Table CRF');
  const isLinealActive = activeSpace.toUpperCase().includes('LINEAL') || activeSpace.toUpperCase().includes('SMARTWATCH');
  const isMiniWallActive = activeSpace.toUpperCase().includes('MINIWALL');
  const isWallActive = activeSpace.toUpperCase().includes('WALL') && !isMiniWallActive;
  const isMesa2Active = activeSpace.toUpperCase().includes('MESA 2');
  const isCara2Active = activeSpace.includes('Cara 2') || activeSpace.includes('Cara B');

  const relevantTopTable = useMemo(() => {
    if (!posmItems || posmItems.length === 0) return undefined;
    const isMesa2 = activeSpace.toUpperCase().includes('MESA 2');
    const isMesa3 = activeSpace.toUpperCase().includes('MESA 3');
    const mesaNum = isMesa3 ? 3 : isMesa2 ? 2 : 1;
    const isCaraB = activeSpace.toUpperCase().includes('CARA 2') || activeSpace.toUpperCase().includes('CARA B');
    const caraLetra = isCaraB ? 'B' : 'A';

    return (
      posmItems.find(
        (it) => it.tipo === 'top_table' && it.nombre.includes(`Mesa ${mesaNum} Cara ${caraLetra}`)
      ) ||
      posmItems.find(
        (it) => it.tipo === 'top_table' && (isCaraB ? it.caraNumero % 2 === 0 : it.caraNumero % 2 === 1)
      )
    );
  }, [posmItems, activeSpace]);

  const relevantMiniwallPosm = useMemo(() => {
    if (!isMiniWallActive) return undefined;
    return (
      posmItems.find((it) => it.tipo === 'miniwall') || {
        id: `${store.tiendaId}-POSM-MINIWALL`,
        tipo: 'miniwall' as const,
        material: 'Lona / Textil' as const,
        nombre: 'Lona de MiniWall',
        ubicacion: 'MINIWALL · Bastidor Textil',
        caraNumero: 1,
        medida: '1000x1100 mm',
        campanaOficial: 'Xiaomi Pad 8 Series',
        activo: true
      }
    );
  }, [isMiniWallActive, posmItems, store.tiendaId]);

  let bgImage = PLANOGRAM_IMAGES.table1Cara1;
  if (isLinealActive) {
    bgImage = PLANOGRAM_IMAGES.linealSmartwatchImg;
  } else if (isMiniWallActive) {
    bgImage = PLANOGRAM_IMAGES.miniwallImg;
  } else if (isWallActive) {
    bgImage = PLANOGRAM_IMAGES.wallImg;
  } else if (isTableCrf) {
    bgImage = isCara2Active
      ? PLANOGRAM_IMAGES.tableCrfCara2
      : PLANOGRAM_IMAGES.tableCrfCara1;
  } else if (isMesa2Active) {
    bgImage = isCara2Active
      ? PLANOGRAM_IMAGES.table2Mesa2Cara2
      : PLANOGRAM_IMAGES.table2Mesa2Cara1;
  } else if (isTable2 && isCara2Active) {
    bgImage = PLANOGRAM_IMAGES.table2Mesa1Cara2;
  } else if (isTable1 && hasWall) {
    bgImage = isCara2Active
      ? PLANOGRAM_IMAGES.table1WallCara2
      : PLANOGRAM_IMAGES.table1WallCara1;
  } else {
    bgImage = isCara2Active
      ? PLANOGRAM_IMAGES.table1Cara2
      : PLANOGRAM_IMAGES.table1Cara1;
  }

  const containerBgColor = isMiniWallActive ? '#c8cbcf' : isWallActive ? '#9c9b99' : isLinealActive ? '#ded6ca' : '#c5c6c8';

  const [selectedPos, setSelectedPosState] = useState<PlanogramPosition>(() => {
    if (initialSelectedPositionId) {
      const found = positions.find(p => p.id === initialSelectedPositionId);
      if (found) return found;
    }
    return positions[0] || null;
  });
  const setSelectedPos = (pos: PlanogramPosition) => {
    setSelectedPosState(pos);
    if (pos && onSelectPositionIdChange) onSelectPositionIdChange(pos.id);
  };

  const totalPositions = useMemo(() => {
    let sum = 0;
    availableSpaces.forEach(sp => {
      const p = getPositionsForSpace(store.tipoEspacioId, sp, store);
      sum += p.length;
    });
    return sum > 0 ? sum : (store.totalPuestos || positions.length);
  }, [availableSpaces, store, positions.length]);
  const getPosAuditState = (pos: PlanogramPosition | null): PositionAuditState | undefined => {
    if (!pos) return undefined;
    if (auditStates[pos.id]) return auditStates[pos.id];
    return Object.values(auditStates).find(
      a => a.posicionId === pos.id || (a.mesaId === pos.mesaId && a.posicionNumero === pos.posicionNumero)
    );
  };

  const auditedCount = useMemo(() => {
    return Object.values(auditStates).filter(
      s => s.estadoPosicion === 'OK' || s.estadoPosicion === 'Incidencia' || (s.imeiSerial && s.imeiSerial !== '-')
    ).length;
  }, [auditStates]);

  const currentPosState = getPosAuditState(selectedPos);
  const isPosOk = currentPosState?.estadoPosicion === 'OK';
  const isPosIncident = currentPosState?.estadoPosicion === 'Incidencia';
  const progressPercent = Math.min(100, Math.round((auditedCount / totalPositions) * 100));
  const latestAudit = useMemo(() => DbService.getLatestAuditForStore(store.tiendaId), [store.tiendaId]);
  const hasDraft = useMemo(() => {
    const d = DbService.getDraft(store.tiendaId);
    return Boolean(d && d.length > 0);
  }, [store.tiendaId]);
  const isVigenteActive = Boolean(latestAudit && !hasDraft && auditedCount > 0);
  const isPromotor = (currentUser?.rol || '').toLowerCase().includes('promotor');

  return (
    <div className="w-full min-h-[92dvh] sm:min-h-[80vh] flex flex-col bg-white text-slate-800 rounded-none sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 transition-all duration-300">
      
      {/* HEADER CORPORATIVO SALESLAND CON DETALLES DE TIENDA Y XIAOMI */}
      <div className="px-3.5 sm:px-6 py-3 bg-gradient-to-r from-[#072431] via-[#104a60] to-[#0a3343] text-white flex items-center justify-between sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            onClick={onBack}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95 shrink-0 cursor-pointer"
            title="Volver a la selección de tienda"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isVigenteActive ? 'text-emerald-300' : 'text-teal-300'}`}>
                {isVigenteActive ? 'Reporte Vigente' : hasDraft ? 'Borrador en Curso' : 'Auditoría en Curso'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff6900]" />
              <span className="text-[10px] text-slate-300 truncate hidden xs:inline">
                {store.retailer}
              </span>
            </div>
            <h1 className="text-xs sm:text-base font-black text-white truncate tracking-tight max-w-[170px] xs:max-w-[260px] sm:max-w-none">
              {store.nombreTienda}
            </h1>
          </div>
        </div>

        {/* Progreso y Leyenda */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Badge de Progreso Circular */}
          <div className="flex items-center gap-2 bg-black/25 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-2xl border border-white/10">
            <div className="text-right hidden sm:block">
              <span className="block text-[9px] font-medium text-slate-300 uppercase">Auditados</span>
              <span className="text-xs font-black text-white">{auditedCount} / {totalPositions}</span>
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-[#009ca6] flex items-center justify-center font-bold text-[10px] sm:text-[11px] text-[#00c4cc] bg-[#009ca6]/20">
              {progressPercent}%
            </div>
          </div>

          {posmItems.length > 0 && (
            <button
              onClick={() => setShowPosmDrawer(true)}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#ff6900]/80 to-[#ff6900] hover:brightness-110 text-white transition text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md"
              title="Abrir checklist de POSM & Visibilidad"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">POSM</span>
              <span>({auditedPosmCount}/{posmItems.length})</span>
            </button>
          )}

          <button
            onClick={() => setShowLegend(!showLegend)}
            className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-teal-200 transition text-xs font-semibold flex items-center gap-1 cursor-pointer"
            title="Ver leyenda de colores"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden md:inline">Leyenda</span>
          </button>
        </div>
      </div>

      {/* Banner Informativo si hay Reporte Vigente Activo */}
      {latestAudit && auditedCount > 0 && (
        <div className="bg-sky-50 border-b border-sky-200/80 px-4 py-2 flex items-center justify-between gap-3 text-xs text-sky-950 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-4 h-4 text-[#009ca6] shrink-0" />
            <span className="truncate">
              <strong>Reporte vigente ({latestAudit.fechaHora}):</strong> {auditedCount} puestos registrados. Pulsa en cualquier posición para actualizar datos o resolver incidencias.
            </span>
          </div>
          {onResetAudit && !isPromotor && (
            <button
              onClick={() => {
                if (window.confirm('¿Seguro que deseas reiniciar y comenzar una auditoría limpia desde cero para esta tienda?')) {
                  onResetAudit();
                }
              }}
              className="text-[11px] font-bold text-rose-600 hover:text-rose-800 underline cursor-pointer shrink-0 ml-auto"
            >
              Empezar auditoría de cero
            </button>
          )}
        </div>
      )}

      {/* BARRA DE SUPERFICIES Y SWITCH DE MODO */}
      <div className="px-3.5 sm:px-6 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
        {/* Selector de Superficie / Mueble */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none max-w-full">
          {availableSpaces.map((space) => {
            const isSelected = activeSpace === space;
            return (
              <button
                key={space}
                onClick={() => {
                  setActiveSpace(space);
                  const newPositions = getPositionsForSpace(store.tipoEspacioId, space, store);
                  if (newPositions.length > 0) setSelectedPos(newPositions[0]);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-[#104a60] text-white shadow-xs ring-2 ring-[#009ca6]/40'
                    : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                }`}
              >
                <Layers className={`w-3.5 h-3.5 ${isSelected ? 'text-[#00c4cc]' : 'text-slate-400'}`} />
                <span>{space}</span>
              </button>
            );
          })}
        </div>

        {/* Switch Visual / Lista */}
        <div className="bg-white border border-slate-200 p-0.5 rounded-xl flex text-xs font-bold shadow-2xs shrink-0">
          <button
            onClick={() => setViewMode('visual')}
            className={`px-3 py-1 rounded-lg transition cursor-pointer ${
              viewMode === 'visual' ? 'bg-[#009ca6] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Vista Mesa
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded-lg transition cursor-pointer ${
              viewMode === 'list' ? 'bg-[#009ca6] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lista ({positions.length})
          </button>
        </div>
      </div>

      {/* LEYENDA DESPLEGABLE */}
      {showLegend && (
        <div className="bg-[#104a60]/10 border-b border-[#009ca6]/20 px-4 py-2 flex flex-wrap items-center justify-around text-xs font-bold text-slate-700 animate-fadeIn gap-2">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs"></span>
            <span>OK (Correcto)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#104a60] border border-[#009ca6] shadow-xs"></span>
            <span>Pendiente</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs"></span>
            <span>Incidencia</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-500 font-normal">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff6900] shadow-xs"></span>
            <span>Xiaomi Brand Space</span>
          </span>
        </div>
      )}

      {/* CUERPO PRINCIPAL ADAPTATIVO: En PC split 70%/30%, en Smartphone apilado de forma ordenada */}
      <div 
        className="flex-1 lg:grid lg:grid-cols-12 flex flex-col overflow-y-auto lg:overflow-hidden transition-colors duration-300"
        style={{ backgroundColor: containerBgColor }}
      >
        
        {/* COLUMNA VISUAL: FOTO DE LA MESA Y PINES INTERACTIVOS SIN MÁRGENES NEGROS */}
        <div 
          className="lg:col-span-7 xl:col-span-8 shrink-0 w-full relative flex flex-col justify-center items-center min-h-[240px] xs:min-h-[290px] sm:min-h-[400px] lg:min-h-full lg:h-[calc(100vh-140px)] overflow-hidden p-0 transition-colors duration-300"
          style={{ backgroundColor: containerBgColor }}
        >
          
          {isColumnaActive ? (
            <div className="w-full h-full p-2 sm:p-4 flex flex-col justify-center items-center">
              <InteractiveColumnCanvas
                store={store}
                selectedFace={selectedColumnFace}
                onSelectFace={setSelectedColumnFace}
                posmStates={posmStates}
                onInspectElement={(item) => setInspectingPosmItem(item)}
              />
            </div>
          ) : viewMode === 'visual' ? (
            <div 
              className="relative w-full lg:h-full flex items-center justify-center overflow-hidden transition-colors duration-300"
              style={{ backgroundColor: containerBgColor }}
            >
              {/* Badge Flotante de Top Table si la mesa dispone de él */}
              {relevantTopTable && (
                <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between bg-slate-950/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-teal-500/30 shadow-xl text-white">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-[#ff6900] text-white px-2 py-0.5 rounded shadow-sm shrink-0">
                      Top Table
                    </span>
                    <span className="text-xs font-bold text-teal-200 truncate">
                      {relevantTopTable.campanaOficial} · <strong className="text-white font-mono">{relevantTopTable.medida}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInspectingPosmItem(relevantTopTable)}
                    className="px-2.5 py-1 rounded-lg bg-[#009ca6] hover:bg-[#008992] text-white text-[11px] font-black transition cursor-pointer flex items-center gap-1 shrink-0 shadow-sm"
                  >
                    <span>{posmStates[relevantTopTable.id]?.estadoVisual || 'Auditar'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Badge Flotante de Lona de MiniWall si estamos en MINIWALL */}
              {isMiniWallActive && relevantMiniwallPosm && (
                <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between bg-slate-950/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-teal-500/30 shadow-xl text-white">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-[#ff6900] text-white px-2 py-0.5 rounded shadow-sm shrink-0">
                      Lona MiniWall
                    </span>
                    <span className="text-xs font-bold text-teal-200 truncate">
                      {relevantMiniwallPosm.campanaOficial} · <strong className="text-white font-mono">{relevantMiniwallPosm.medida}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {posmStates[relevantMiniwallPosm.id]?.estadoVisual && (
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        posmStates[relevantMiniwallPosm.id]?.estadoVisual === 'OK'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-rose-500 text-white'
                      }`}>
                        {posmStates[relevantMiniwallPosm.id]?.estadoVisual}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setInspectingPosmItem(relevantMiniwallPosm)}
                      className="px-2.5 py-1 rounded-lg bg-[#009ca6] hover:bg-[#008992] text-white text-[11px] font-black transition cursor-pointer flex items-center gap-1 shadow-sm"
                    >
                      <span>{posmStates[relevantMiniwallPosm.id]?.estadoVisual ? 'Editar Lona' : 'Auditar Lona'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
              {/* Imagen Real de la Mesa Oficial que se adapta al formato sin márgenes negros */}
              <div 
                className="relative w-full lg:h-full flex items-center justify-center transition-transform duration-200 ease-out"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                <div className="relative inline-block w-full lg:w-auto lg:max-w-full lg:max-h-full">
                  <img
                    src={bgImage}
                    alt={activeSpace}
                    className="w-full lg:w-auto h-auto lg:max-w-full lg:max-h-[calc(100vh-145px)] object-contain select-none block"
                    draggable={false}
                  />

                  {/* Hotspots / Pines Interactivos Lineales que no tapan los dispositivos */}
                  <div className="absolute inset-0 pointer-events-none">
                  {/* Hotspot de auditoría directa sobre la Lona del MiniWall */}
                  {isMiniWallActive && relevantMiniwallPosm && (
                    <div 
                      className="absolute z-20 pointer-events-auto"
                      style={{ left: '50%', top: '34%', transform: 'translate(-50%, -50%)' }}
                    >
                      <button
                        type="button"
                        onClick={() => setInspectingPosmItem(relevantMiniwallPosm)}
                        className={`group px-3 py-1.5 rounded-xl border-2 shadow-2xl backdrop-blur-md transition-all cursor-pointer flex items-center gap-2 ${
                          posmStates[relevantMiniwallPosm.id]?.estadoVisual === 'OK'
                            ? 'bg-emerald-700/90 hover:bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-400/40'
                            : posmStates[relevantMiniwallPosm.id]?.estadoVisual === 'Incidencia'
                            ? 'bg-rose-700/90 hover:bg-rose-600 text-white border-rose-400 ring-2 ring-rose-400/40'
                            : 'bg-slate-900/90 hover:bg-slate-900 text-white border-[#00c4cc] hover:scale-105'
                        }`}
                        title="Auditar Lona de MiniWall"
                      >
                        <Layers className="w-3.5 h-3.5 text-[#00c4cc]" />
                        <div className="text-left">
                          <span className="block text-[8px] font-medium text-slate-300 uppercase leading-none">
                            Lona MiniWall
                          </span>
                          <span className="text-xs font-black leading-tight">
                            {posmStates[relevantMiniwallPosm.id]?.estadoVisual || 'Auditar'}
                          </span>
                        </div>
                      </button>
                    </div>
                  )}

                  {positions.map((pos, idx) => {
                    const pState = getPosAuditState(pos);
                    const isOk = pState?.estadoPosicion === 'OK';
                    const isInc = pState?.estadoPosicion === 'Incidencia';
                    const isSel = selectedPos?.id === pos.id;

                    let pinColor = 'bg-[#104a60] text-white border-white ring-1 ring-[#009ca6]/60 shadow-lg';
                    if (isOk) {
                      pinColor = 'bg-emerald-500 text-white border-white ring-2 ring-emerald-500/40 shadow-emerald-500/30';
                    } else if (isInc) {
                      pinColor = 'bg-rose-500 text-white border-white ring-2 ring-rose-500/40 shadow-rose-500/30 animate-pulse';
                    }

                    const hasCoords = typeof pos.pinX === 'number' && typeof pos.pinY === 'number';
                    const inlineStyle: React.CSSProperties = hasCoords
                      ? {
                          position: 'absolute',
                          left: `${pos.pinX}%`,
                          top: `${pos.pinY}%`,
                          transform: 'translate(-50%, -50%)',
                          pointerEvents: 'auto'
                        }
                      : {
                          position: 'absolute',
                          left: `${((idx + 0.5) / positions.length) * 100}%`,
                          top: '52%',
                          transform: 'translate(-50%, -50%)',
                          pointerEvents: 'auto'
                        };

                    return (
                      <div
                        key={pos.id}
                        style={inlineStyle}
                        className="flex flex-col items-center pointer-events-auto group z-20"
                      >
                        {/* Línea indicadora vertical sutil hacia arriba que conecta con el dispositivo sin taparlo */}
                        <div 
                          className={`w-[1.5px] sm:w-[2px] h-2 sm:h-3 transition-all ${
                            isSel 
                              ? 'bg-[#00c4cc] shadow-sm shadow-[#00c4cc]' 
                              : 'bg-white/60 group-hover:bg-[#00c4cc]'
                          }`} 
                        />

                        {/* Botón con el número de posición en fila lineal */}
                        <button
                          onClick={() => setSelectedPos(pos)}
                          className={`rounded-full font-black shadow-2xl flex items-center justify-center transition-all cursor-pointer border-2 ${pinColor} ${
                            isSel 
                              ? 'w-7 h-7 xs:w-8 xs:h-8 sm:w-9 sm:h-9 scale-110 sm:scale-120 ring-3 ring-[#00c4cc] z-30 shadow-[#009ca6]/80' 
                              : 'w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 hover:scale-115'
                          }`}
                          title={`Puesto ${pos.posicionNumero}: ${pos.modeloOficial} (${pos.esDummy ? 'Maqueta' : 'LDU'})`}
                        >
                          {isOk ? (
                            <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                          ) : isInc ? (
                            <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                          ) : (
                            <span className="text-[9px] xs:text-[10px] sm:text-[11px] font-black">{String(pos.posicionNumero).padStart(2, '0')}</span>
                          )}

                          {/* Tooltip flotante hacia abajo en PC para no tapar los dispositivos */}
                          <div className="absolute top-full mt-1.5 hidden lg:group-hover:block bg-black/95 text-white text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap pointer-events-none shadow-xl border border-white/20 z-40">
                            P{String(pos.posicionNumero).padStart(2, '0')} · {pos.modeloOficial} ({pos.esDummy ? 'Maqueta' : 'LDU'})
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

              {/* Controles de Zoom en el canvas */}
              <div className="absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3 bg-black/70 backdrop-blur-md border border-white/10 rounded-xl p-1 flex items-center gap-1 z-20 text-white text-xs shadow-lg">
                <button
                  onClick={() => setZoomLevel(prev => Math.max(0.8, prev - 0.1))}
                  className="p-1 sm:p-1.5 hover:bg-white/20 rounded-lg cursor-pointer"
                  title="Reducir zoom"
                >
                  <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <span className="font-mono text-[10px] px-1">{Math.round(zoomLevel * 100)}%</span>
                <button
                  onClick={() => setZoomLevel(prev => Math.min(1.5, prev + 0.1))}
                  className="p-1 sm:p-1.5 hover:bg-white/20 rounded-lg cursor-pointer"
                  title="Aumentar zoom"
                >
                  <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  className="p-1 sm:p-1.5 hover:bg-white/20 rounded-lg cursor-pointer text-teal-300"
                  title="Restablecer zoom"
                >
                  <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              </div>

            </div>
          ) : (
            /* Vista Lista de Posiciones */
            <div className="w-full h-full bg-slate-900 p-3.5 sm:p-6 overflow-y-auto space-y-2">
              <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                Terminales en {activeSpace} ({positions.length})
              </div>
              {positions.map((p) => {
                const pState = getPosAuditState(p);
                const isOk = pState?.estadoPosicion === 'OK';
                const isInc = pState?.estadoPosicion === 'Incidencia';
                const isSel = selectedPos?.id === p.id;

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPos(p)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSel
                        ? 'bg-white/15 border-[#009ca6] ring-2 ring-[#009ca6]/40 shadow-md text-white'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                        isOk ? 'bg-emerald-500 text-white' : isInc ? 'bg-rose-500 text-white' : 'bg-white/10 text-slate-200'
                      }`}>
                        {String(p.posicionNumero).padStart(2, '0')}
                      </span>
                      <div>
                        <p className="text-xs sm:text-sm font-bold truncate">{p.modeloOficial}</p>
                        <p className="text-[10px] text-teal-300/80">{p.categoria} • <span className="font-semibold text-white">{p.esDummy ? 'Maqueta' : 'LDU'}</span></p>
                        {pState?.imeiSerial && pState.imeiSerial !== '-' && (
                          <p className="text-[10px] font-mono font-bold text-teal-300 mt-0.5">IMEI: {pState.imeiSerial}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      {isOk ? (
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> OK
                        </span>
                      ) : isInc ? (
                        <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Incidencia
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400">Pendiente</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* COLUMNA LATERAL (PC) / INFERIOR (SMARTPHONE): INSPECTOR Y CONTROL */}
        <div className="lg:col-span-5 xl:col-span-4 p-4 sm:p-6 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col justify-between space-y-4">
          
          {isColumnaActive ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Columna · 4 Caras de Lona
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#104a60]/10 text-[#104a60]">
                  Lona / Textil Perimetral
                </span>
              </div>

              {/* Selector de Caras de la Columna — con badge MiniWall si aplica */}
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((faceNum) => {
                  const it = posmItems.find((p) => p.tipo === 'columna' && p.caraNumero === faceNum);
                  const st = it ? posmStates[it.id] : undefined;
                  const isOk = st?.estadoVisual === 'OK';
                  const isInc = st?.estadoVisual === 'Incidencia';
                  const isSel = selectedColumnFace === faceNum;
                  const isMiniwall = Boolean(it?.esMiniwall);

                  return (
                    <button
                      key={faceNum}
                      type="button"
                      onClick={() => setSelectedColumnFace(faceNum)}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                        isSel
                          ? 'bg-[#104a60] text-white border-[#009ca6] ring-2 ring-[#009ca6]/40 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-xs font-black">Cara {faceNum}</span>
                      {isMiniwall && (
                        <span className="text-[8px] font-black px-1 py-0.5 rounded bg-orange-100 text-orange-700 leading-none">
                          MiniWall
                        </span>
                      )}
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          isOk
                            ? 'bg-emerald-500 text-white'
                            : isInc
                            ? 'bg-rose-500 text-white'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isOk ? 'OK' : isInc ? 'Inc' : 'Pend'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Ficha de detalle de la cara seleccionada */}
              {(() => {
                const activeColItem = posmItems.find(
                  (p) => p.tipo === 'columna' && p.caraNumero === selectedColumnFace
                );
                const activeState = activeColItem ? posmStates[activeColItem.id] : undefined;
                const isOk = activeState?.estadoVisual === 'OK';
                const isInc = activeState?.estadoVisual === 'Incidencia';
                const isMiniwall = Boolean(activeColItem?.esMiniwall);

                return (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3.5 shadow-xs">
                    <div className="flex items-center justify-between flex-wrap gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full">
                          Cara {selectedColumnFace} · Lona Textil
                        </span>
                        {isMiniwall && (
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-orange-500 text-white">
                            = MiniWall
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-500 font-mono">
                        {activeColItem?.medida || 'Sin medida'}
                      </span>
                    </div>

                    {isMiniwall && (
                      <div className="text-[10px] font-semibold text-orange-700 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                        ⚠️ Esta cara actúa como <strong>MiniWall</strong>: lona de menor tamaño que cubre el bastidor textil lateral.
                      </div>
                    )}

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Campaña Oficial Requerida
                      </span>
                      <h3 className="text-base font-black text-slate-900 leading-tight mt-0.5">
                        {activeColItem?.campanaOficial || 'Xiaomi 17 Ultra'}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {activeColItem?.ubicacion || `COLUMNA · Cara ${selectedColumnFace}`}
                      </p>
                    </div>

                    {/* Estado actual */}
                    <div className="p-2.5 rounded-xl flex items-center justify-between text-xs font-bold border bg-white">
                      {isOk ? (
                        <div className="flex items-center gap-2 text-emerald-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Lona conforme con campaña oficial</span>
                        </div>
                      ) : isInc ? (
                        <div className="flex items-center gap-2 text-rose-700">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>Incidencia: {activeState?.motivoIncidencia || 'Reportada'}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-amber-700">
                          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Pendiente de auditar en tienda</span>
                        </div>
                      )}
                    </div>

                    {activeState?.fotoNuevaUrl && (
                      <div className="relative h-32 rounded-xl overflow-hidden border border-emerald-300 bg-black">
                        <img
                          src={activeState.fotoNuevaUrl}
                          alt="Foto Cara Columna"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1.5 left-1.5 bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-sm">
                          ✓ Evidencia fotográfica adjuntada
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (activeColItem) setInspectingPosmItem(activeColItem);
                      }}
                      className="w-full py-3.5 bg-gradient-to-r from-[#009ca6] to-[#00b4bf] hover:brightness-110 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>
                        {activeState
                          ? `Editar Auditoría Cara ${selectedColumnFace}`
                          : `Auditar Cara ${selectedColumnFace}`}
                      </span>
                    </button>
                  </div>
                );
              })()}
            </div>

          ) : isPosmTabActive ? (
            /* ── TAB POSM: Wall / MiniWall / Top Table ── */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  POSM · Extravisibilidad
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#ff6900]/10 text-[#ff6900]">
                  {auditedPosmCount}/{posmItems.length} auditados
                </span>
              </div>

              <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1 scrollbar-none">
                {posmItems
                  .filter(it => it.tipo !== 'columna') // columnas se auditan en su propio tab
                  .map((item) => {
                    const st = posmStates[item.id];
                    const isOk = st?.estadoVisual === 'OK';
                    const isInc = st?.estadoVisual === 'Incidencia';
                    const isTT = item.tipo === 'top_table';
                    const isMW = item.tipo === 'miniwall';
                    const isWall = item.tipo === 'wall';

                    return (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                isTT ? 'bg-purple-100 text-purple-800'
                                     : isMW ? 'bg-orange-100 text-orange-800'
                                     : 'bg-blue-100 text-blue-800'
                              }`}>
                                {isTT ? 'Duratrans / Filmina' : 'Lona / Textil'}
                              </span>
                              <span className="text-[9px] font-mono font-bold text-slate-500">{item.medida}</span>
                            </div>
                            <h4 className="text-sm font-black text-slate-900 leading-tight">{item.nombre}</h4>
                            <p className="text-xs text-slate-500">
                              Campaña: <strong className="text-[#104a60]">{item.campanaOficial}</strong>
                            </p>
                          </div>
                          <span className={`shrink-0 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 ${
                            isOk
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                              : isInc
                              ? 'bg-rose-50 text-rose-700 border border-rose-300'
                              : 'bg-amber-50 text-amber-700 border border-amber-300'
                          }`}>
                            {isOk ? <Check className="w-3 h-3" /> : isInc ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {st?.estadoVisual || 'Pendiente'}
                          </span>
                        </div>

                        {/* Foto de evidencia si existe */}
                        {st?.fotoNuevaUrl && (
                          <div className="relative h-20 rounded-xl overflow-hidden border border-emerald-300 bg-black">
                            <img src={st.fotoNuevaUrl} alt="Evidencia POSM" className="w-full h-full object-cover" />
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => setInspectingPosmItem(item)}
                          className="w-full py-2.5 bg-gradient-to-r from-[#009ca6] to-[#00b4bf] hover:brightness-110 text-white font-black text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {st ? 'Editar Auditoría' : 'Auditar Elemento'}
                        </button>
                      </div>
                    );
                  })}

                {/* Si no hay elementos no-columna, mostrar mensaje */}
                {posmItems.filter(it => it.tipo !== 'columna').length === 0 && (
                  <div className="text-center text-xs text-slate-400 py-8">
                    No hay elementos POSM adicionales registrados para esta tienda.
                  </div>
                )}
              </div>
            </div>

          ) : (
            <div className="space-y-3.5">
            {/* Header del inspector */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Puestos en {activeSpace}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#104a60]/10 text-[#104a60]">
                {positions.length} posiciones
              </span>
            </div>

            {/* BARRA TÁCTIL RÁPIDA DE PUESTOS (Organizada linealmente) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {positions.map((p, idx) => {
                const pState = getPosAuditState(p);
                const isOk = pState?.estadoPosicion === 'OK';
                const isInc = pState?.estadoPosicion === 'Incidencia';
                const isSel = selectedPos?.id === p.id;

                let badgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
                if (isOk) badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-300';
                else if (isInc) badgeClass = 'bg-rose-50 text-rose-700 border-rose-300';

                // Separadores visuales para los 3 sectores de Cara 1 (6 izq, 3 centro, 3 dcha)
                const isCara1 = positions.length === 12;
                const showSectorSeparator = isCara1 && (idx === 6 || idx === 9);

                return (
                  <React.Fragment key={p.id}>
                    {showSectorSeparator && (
                      <div className="h-5 w-[1px] bg-slate-300 mx-0.5 shrink-0" />
                    )}
                    <button
                      onClick={() => setSelectedPos(p)}
                      className={`px-2.5 py-1.5 rounded-xl font-bold text-xs shrink-0 transition-all border cursor-pointer flex items-center gap-1 ${badgeClass} ${
                        isSel ? 'ring-2 ring-[#009ca6] scale-105 shadow-sm font-black' : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      <span>P{String(p.posicionNumero).padStart(2, '0')}</span>
                      {isOk && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                      {isInc && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Ficha de detalle del puesto seleccionado */}
            {selectedPos && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 sm:p-4 space-y-3 shadow-xs">
                {/* Header del dispositivo */}
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center p-2 shrink-0 shadow-2xs">
                    {selectedPos.categoria === 'Wearable' ? (
                      <Watch className="w-6 h-6 text-[#104a60]" />
                    ) : selectedPos.categoria === 'Audio' ? (
                      <Headphones className="w-6 h-6 text-[#104a60]" />
                    ) : selectedPos.categoria === 'Tablet' ? (
                      <Tablet className="w-6 h-6 text-[#104a60]" />
                    ) : (
                      <Smartphone className="w-6 h-6 sm:w-7 sm:h-7 text-[#104a60]" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-xs font-black text-white bg-[#104a60] px-1.5 py-0.5 rounded">
                        Puesto {String(selectedPos.posicionNumero).padStart(2, '0')}
                      </span>
                      {/* Etiqueta de sector para Cara 1 */}
                      {positions.length === 12 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700">
                          {selectedPos.posicionNumero <= 6 
                            ? 'Sector Izquierda (6)' 
                            : selectedPos.posicionNumero <= 9 
                              ? 'Sector Centro (3)' 
                              : 'Sector Derecha (3)'}
                        </span>
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff6900]">
                        Xiaomi
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 mt-1 leading-snug">
                      {selectedPos.modeloOficial}
                    </h3>
                  </div>
                </div>

                {/* Especificaciones requeridas */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">
                  <div className="p-2 bg-white rounded-xl border border-slate-100">
                    <span className="block text-[10px] text-slate-400 font-medium">Categoría</span>
                    <span className="font-bold text-slate-800">{selectedPos.categoria}</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-slate-100">
                    <span className="block text-[10px] text-slate-400 font-medium">Tipo Terminal</span>
                    <span className={`font-black text-xs ${selectedPos.esDummy ? 'text-amber-700' : 'text-teal-700'}`}>
                      {selectedPos.esDummy ? 'Maqueta' : 'LDU'}
                    </span>
                  </div>
                </div>

                {/* Estado de auditoría de este puesto */}
                <div className="p-2 rounded-xl flex items-center justify-between text-xs font-bold border">
                  {isPosOk ? (
                    <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border-emerald-200 w-full p-1 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Auditado y Validado OK</span>
                    </div>
                  ) : isPosIncident ? (
                    <div className="flex items-center gap-2 text-rose-700 bg-rose-50 border-rose-200 w-full p-1 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Incidencia registrada</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border-amber-200 w-full p-1 rounded-lg">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Pendiente de auditar</span>
                    </div>
                  )}
                </div>

                {/* IMEI / S/N Registrado en la posición */}
                {currentPosState?.imeiSerial && currentPosState.imeiSerial !== '-' && (
                  <div className="p-3 bg-white rounded-xl border border-teal-200 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1 text-teal-800">
                        <Smartphone className="w-3.5 h-3.5 text-teal-600" />
                        <span>IMEI / Serial Registrado</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                        isPosOk ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        isPosIncident ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {currentPosState.estadoPosicion}
                      </span>
                    </div>
                    <div className="font-mono text-sm sm:text-base font-black text-slate-900 tracking-wider select-all">
                      {currentPosState.imeiSerial}
                    </div>
                    {currentPosState.fechaHora && (
                      <div className="text-[10px] text-slate-400">
                        Modificado: {currentPosState.fechaHora} {currentPosState.auditadoPor ? `· ${currentPosState.auditadoPor}` : ''}
                      </div>
                    )}
                  </div>
                )}

                {/* Botón Principal para auditar este puesto */}
                <button
                  onClick={() => {
                    if (onActiveSpaceChange) onActiveSpaceChange(activeSpace);
                    if (onSelectPositionIdChange) onSelectPositionIdChange(selectedPos.id);
                    onSelectPosition(selectedPos);
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-[#009ca6] to-[#00b4bf] hover:from-[#008992] hover:to-[#00a3ad] active:scale-[0.98] text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-[#009ca6]/20 transition flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span>
                    {currentPosState?.imeiSerial && currentPosState.imeiSerial !== '-'
                      ? `Editar Puesto ${String(selectedPos.posicionNumero).padStart(2, '0')}`
                      : `Auditar Puesto ${String(selectedPos.posicionNumero).padStart(2, '0')}`}
                  </span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </button>
              </div>
            )}
          </div>
          )}

          {/* ACCIÓN DE RESUMEN FINAL */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Progreso Total Tienda:</span>
              <span className="font-bold text-slate-900">{auditedCount} de {totalPositions} puestos</span>
            </div>

            <button
              onClick={onFinishAudit}
              className="w-full py-3 bg-[#104a60] hover:bg-[#093545] text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#00c4cc]" />
              <span>Ver Resumen y Finalizar Auditoría</span>
            </button>
          </div>

        </div>

      </div>

      {/* MODAL DE INSPECCIÓN DETALLADA POSM */}
      {inspectingPosmItem && (
        <PosmInspectModal
          item={inspectingPosmItem}
          initialState={posmStates[inspectingPosmItem.id]}
          currentUserEmail={currentUser?.email}
          currentUserName={currentUser?.nombre}
          onSave={handleSavePosmState}
          onClose={() => setInspectingPosmItem(null)}
        />
      )}

      {/* DRAWER / MODAL COMPLETO DE POSM & EXTRAVISIBILIDAD */}
      {showPosmDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
            <div className="px-5 py-4 bg-gradient-to-r from-[#072431] via-[#104a60] to-[#0a3343] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#00c4cc] shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black">POSM & Extravisibilidad de Tienda</h3>
                  <p className="text-xs text-teal-200">
                    {store.nombreTienda} · {posmItems.length} elementos registrados
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPosmDrawer(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3">
              {posmItems.map((item) => {
                const st = posmStates[item.id];
                const isOk = st?.estadoVisual === 'OK';
                const isInc = st?.estadoVisual === 'Incidencia';

                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-[#009ca6] transition bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full">
                          {item.material}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-500">
                          {item.medida}
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-slate-900">{item.nombre}</h4>
                      <p className="text-xs text-slate-600">
                        Campaña oficial: <strong className="text-[#104a60]">{item.campanaOficial}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <span
                        className={`text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 ${
                          isOk
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                            : isInc
                            ? 'bg-rose-50 text-rose-700 border border-rose-300'
                            : 'bg-amber-50 text-amber-700 border border-amber-300'
                        }`}
                      >
                        {isOk ? (
                          <Check className="w-3 h-3" />
                        ) : isInc ? (
                          <AlertTriangle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        <span>{st?.estadoVisual || 'Pendiente'}</span>
                      </span>

                      <button
                        onClick={() => {
                          setShowPosmDrawer(false);
                          setInspectingPosmItem(item);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#009ca6] hover:bg-[#008992] text-white text-xs font-black transition cursor-pointer flex items-center gap-1 shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Auditar</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                onClick={() => setShowPosmDrawer(false)}
                className="px-5 py-2 rounded-xl bg-[#104a60] text-white text-xs font-black hover:brightness-110 transition cursor-pointer shadow-sm"
              >
                Cerrar Checklist
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

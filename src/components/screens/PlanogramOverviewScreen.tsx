import React, { useState, useMemo } from 'react';
import { StoreCenter, PlanogramPosition, PositionAuditState } from '../../types';
import { getPositionsForSpace } from '../../data/defaultData';
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
  ShieldCheck
} from 'lucide-react';

interface PlanogramOverviewScreenProps {
  store: StoreCenter;
  auditStates: Record<string, PositionAuditState>;
  onSelectPosition: (pos: PlanogramPosition) => void;
  onFinishAudit: () => void;
  onBack: () => void;
}

export const PlanogramOverviewScreen: React.FC<PlanogramOverviewScreenProps> = ({
  store,
  auditStates,
  onSelectPosition,
  onFinishAudit,
  onBack
}) => {
  const [viewMode, setViewMode] = useState<'visual' | 'list'>('visual');
  const [showLegend, setShowLegend] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const availableSpaces = store.availableSpaces && store.availableSpaces.length > 0
    ? store.availableSpaces
    : ['MESA 1 · Cara 1', 'MESA 1 · Cara 2', 'WALL', 'LINEAL SMARTWATCH'];

  const [activeSpace, setActiveSpace] = useState<string>(availableSpaces[0]);
  const positions = getPositionsForSpace(store.tipoEspacioId, activeSpace, store);

  const hasWall = store.availableSpaces && store.availableSpaces.some(s => s.toUpperCase().includes('WALL'));
  const isTable1 = store.tipoEspacioId.includes('Table 1');
  const isTableCrf = store.tipoEspacioId.includes('Table CRF');
  const isLinealActive = activeSpace.toUpperCase().includes('LINEAL') || activeSpace.toUpperCase().includes('SMARTWATCH');
  const isWallActive = activeSpace.toUpperCase().includes('WALL') && !activeSpace.toUpperCase().includes('MINIWALL');
  const isMesa2Active = activeSpace.toUpperCase().includes('MESA 2');
  const isCara2Active = activeSpace.includes('Cara 2') || activeSpace.includes('Cara B');

  let bgImage = '/images/tables/table1_cara1_render.jpg';
  if (isLinealActive) {
    bgImage = '/images/tables/lineal_smartwatch.jpg';
  } else if (isWallActive) {
    bgImage = '/images/tables/wall.jpg';
  } else if (isTableCrf) {
    bgImage = isCara2Active
      ? '/images/tables/table_crf_cara2_render.jpg'
      : '/images/tables/table_crf_cara1_render.jpg';
  } else if (isMesa2Active) {
    bgImage = isCara2Active
      ? '/images/tables/table2_mesa2_cara2.jpg'
      : '/images/tables/table2_mesa2_cara1.jpg';
  } else if (isTable1 && hasWall) {
    bgImage = isCara2Active
      ? '/images/tables/table1_wall_cara2_render.jpg'
      : '/images/tables/table1_wall_cara1_render.jpg';
  } else {
    bgImage = isCara2Active
      ? '/images/tables/table1_cara2_render.jpg'
      : '/images/tables/table1_cara1_render.jpg';
  }

  const containerBgColor = isWallActive ? '#9c9b99' : isLinealActive ? '#ded6ca' : '#c5c6c8';

  const [selectedPos, setSelectedPos] = useState<PlanogramPosition>(positions[0] || null);

  const totalPositions = useMemo(() => {
    let sum = 0;
    availableSpaces.forEach(sp => {
      const p = getPositionsForSpace(store.tipoEspacioId, sp, store);
      sum += p.length;
    });
    return sum > 0 ? sum : (store.totalPuestos || positions.length);
  }, [availableSpaces, store, positions.length]);
  const auditedCount = Object.keys(auditStates).length;
  const currentPosState = selectedPos ? auditStates[selectedPos.id] : undefined;
  const isPosOk = currentPosState?.estadoPosicion === 'OK';
  const isPosIncident = currentPosState?.estadoPosicion === 'Incidencia';
  const progressPercent = Math.min(100, Math.round((auditedCount / totalPositions) * 100));

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
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300">
                Auditoría en Curso
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
          className="lg:col-span-7 xl:col-span-8 relative flex flex-col justify-center items-center min-h-[260px] xs:min-h-[320px] sm:min-h-[440px] lg:min-h-full overflow-hidden p-0 transition-colors duration-300"
          style={{ backgroundColor: containerBgColor }}
        >
          
          {viewMode === 'visual' ? (
            <div 
              className="relative w-full h-full flex items-center justify-center overflow-hidden transition-colors duration-300"
              style={{ backgroundColor: containerBgColor }}
            >
              {/* Imagen Real de la Mesa Oficial que se adapta al formato sin márgenes negros */}
              <div 
                className="relative w-full h-full flex items-center justify-center transition-transform duration-200 ease-out"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                <div className="relative max-w-full max-h-full flex items-center justify-center">
                  <img
                    src={bgImage}
                    alt={activeSpace}
                    className="w-full h-auto max-h-[calc(100vh-135px)] lg:max-h-full object-contain select-none block"
                    draggable={false}
                  />

                  {/* Hotspots / Pines Interactivos Lineales que no tapan los dispositivos */}
                  <div className="absolute inset-0 pointer-events-none">
                  {positions.map((pos, idx) => {
                    const pState = auditStates[pos.id];
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
                const pState = auditStates[p.id];
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
                const pState = auditStates[p.id];
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

                {/* Botón Principal para auditar este puesto */}
                <button
                  onClick={() => onSelectPosition(selectedPos)}
                  className="w-full py-3.5 bg-gradient-to-r from-[#009ca6] to-[#00b4bf] hover:from-[#008992] hover:to-[#00a3ad] active:scale-[0.98] text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-[#009ca6]/20 transition flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span>Auditar Puesto {String(selectedPos.posicionNumero).padStart(2, '0')}</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </button>
              </div>
            )}
          </div>

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

    </div>
  );
};

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PlanogramPosition, PositionAuditState, StoreCenter, VisualElementAuditState } from '../../types';
import { StorePosmItem } from '../../data/storePosmData';
import { 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  MoveHorizontal,
  Compass,
  Maximize2,
  Minimize2,
  Sparkles,
  Info
} from 'lucide-react';

interface InteractiveTableCanvasProps {
  store?: StoreCenter;
  mesaName?: string;
  spaceName?: string;
  positions: PlanogramPosition[];
  auditStates: Record<string, PositionAuditState>;
  selectedPositionId: string | null;
  onSelectPosition: (position: PlanogramPosition) => void;
  relevantTopTable?: StorePosmItem;
  topTableState?: VisualElementAuditState;
  onInspectTopTable?: (item: StorePosmItem) => void;
}

interface OrbitView {
  id: string;
  index: number;
  angle: number;
  label: string;
  shortLabel: string;
  cara: 'Cara 1' | 'Cara 2' | 'Transición';
  src: string;
  isPrimaryFacing: boolean;
}

const ORBIT_VIEWS: OrbitView[] = [
  {
    id: '01',
    index: 0,
    angle: 0,
    label: 'Cara 1 (Frontal)',
    shortLabel: 'Cara 1 · 0°',
    cara: 'Cara 1',
    src: './images/tables/mesa_3d_01.jpg',
    isPrimaryFacing: true
  },
  {
    id: '02',
    index: 1,
    angle: 60,
    label: 'Frontal Izquierda (60°)',
    shortLabel: '60°',
    cara: 'Transición',
    src: './images/tables/mesa_3d_02.jpg',
    isPrimaryFacing: false
  },
  {
    id: '03',
    index: 2,
    angle: 120,
    label: 'Trasera Izquierda (120°)',
    shortLabel: '120°',
    cara: 'Transición',
    src: './images/tables/mesa_3d_03.jpg',
    isPrimaryFacing: false
  },
  {
    id: '04',
    index: 3,
    angle: 180,
    label: 'Cara 2 (Trasera)',
    shortLabel: 'Cara 2 · 180°',
    cara: 'Cara 2',
    src: './images/tables/mesa_3d_04.jpg',
    isPrimaryFacing: true
  },
  {
    id: '05',
    index: 4,
    angle: 240,
    label: 'Trasera Derecha (240°)',
    shortLabel: '240°',
    cara: 'Transición',
    src: './images/tables/mesa_3d_05.jpg',
    isPrimaryFacing: false
  },
  {
    id: '06',
    index: 5,
    angle: 300,
    label: 'Frontal Derecha (300°)',
    shortLabel: '300°',
    cara: 'Transición',
    src: './images/tables/mesa_3d_06.jpg',
    isPrimaryFacing: false
  }
];

export const InteractiveTableCanvas: React.FC<InteractiveTableCanvasProps> = ({
  store,
  mesaName,
  spaceName,
  positions,
  auditStates,
  selectedPositionId,
  onSelectPosition,
  relevantTopTable,
  topTableState,
  onInspectTopTable
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [imagesLoaded, setImagesLoaded] = useState<boolean>(false);
  const [hoveredPosId, setHoveredPosId] = useState<string | null>(null);

  // Arrastre 360° con inercia
  const isDragging = useRef<boolean>(false);
  const startX = useRef<number>(0);
  const accumulatedDeltaX = useRef<number>(0);
  const prevFrameIndex = useRef<number>(0);

  // Pre-cargar todas las 6 imágenes para rotación 360° instantánea y fluida
  useEffect(() => {
    let loadedCount = 0;
    ORBIT_VIEWS.forEach((view) => {
      const img = new Image();
      img.src = view.src;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === ORBIT_VIEWS.length) {
          setImagesLoaded(true);
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === ORBIT_VIEWS.length) {
          setImagesLoaded(true);
        }
      };
    });
  }, []);

  // Separar posiciones por Cara 1 y Cara 2
  const { cara1Positions, cara2Positions } = useMemo(() => {
    const c1 = positions.filter(p => p.cara === 'Cara 1');
    const c2 = positions.filter(p => p.cara === 'Cara 2');
    return { cara1Positions: c1, cara2Positions: c2 };
  }, [positions]);

  // Si se selecciona una posición desde fuera (ej. lista inferior), rotar al ángulo correspondiente
  useEffect(() => {
    if (!selectedPositionId) return;
    const pos = positions.find(p => p.id === selectedPositionId);
    if (!pos) return;

    if (pos.cara === 'Cara 2' && currentFrameIndex !== 3) {
      setCurrentFrameIndex(3);
    } else if (pos.cara === 'Cara 1' && currentFrameIndex !== 0) {
      setCurrentFrameIndex(0);
    }
  }, [selectedPositionId, positions]);

  // Manejo de gestos táctiles y ratón para arrastre 360°
  const handlePointerDown = (clientX: number) => {
    isDragging.current = true;
    startX.current = clientX;
    accumulatedDeltaX.current = 0;
    prevFrameIndex.current = currentFrameIndex;
  };

  const handlePointerMove = (clientX: number) => {
    if (!isDragging.current) return;
    const deltaX = clientX - startX.current;
    accumulatedDeltaX.current = deltaX;

    // Sensibilidad: cada 65px de arrastre equivale a un ángulo de 60° (un fotograma)
    const frameShift = Math.round(deltaX / 65);
    const totalFrames = ORBIT_VIEWS.length;
    let nextIndex = (prevFrameIndex.current - frameShift) % totalFrames;
    if (nextIndex < 0) nextIndex += totalFrames;

    if (nextIndex !== currentFrameIndex) {
      setCurrentFrameIndex(nextIndex);
    }
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  // Navegación directa
  const goToSide = (side: 'Cara 1' | 'Cara 2') => {
    setCurrentFrameIndex(side === 'Cara 1' ? 0 : 3);
  };

  const currentView = ORBIT_VIEWS[currentFrameIndex];
  const isCara1Active = currentFrameIndex === 0;
  const isCara2Active = currentFrameIndex === 3;
  const isTransitionView = !isCara1Active && !isCara2Active;

  // Posiciones activas a mostrar según el encuadre
  const activePins = isCara1Active ? cara1Positions : isCara2Active ? cara2Positions : [];

  return (
    <div 
      ref={containerRef}
      className={`relative w-full overflow-hidden select-none shadow-2xl flex flex-col justify-between transition-all duration-300 ${
        isFullscreen 
          ? 'fixed inset-0 z-50 bg-[#0a0f1d] rounded-none' 
          : 'h-[380px] xs:h-[440px] sm:h-[500px] lg:h-[calc(100vh-140px)] rounded-2xl bg-[#0a0f1d] border border-white/10'
      }`}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
    >
      {/* 1. HEADER FLOTANTE: Selector Cara 1 / Cara 2 y Top Table */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between gap-2 pointer-events-none">
        
        {/* Selector rápido Cara 1 / Cara 2 con indicación de número de puestos */}
        <div className="bg-slate-950/85 backdrop-blur-md p-1 rounded-2xl border border-white/10 shadow-xl flex items-center gap-1 pointer-events-auto">
          <button
            type="button"
            onClick={() => goToSide('Cara 1')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              isCara1Active
                ? 'bg-gradient-to-r from-[#009ca6] to-[#00b4bf] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Cara 1</span>
            <span className="text-[10px] opacity-80">({cara1Positions.length} puestos)</span>
          </button>

          <button
            type="button"
            onClick={() => goToSide('Cara 2')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              isCara2Active
                ? 'bg-gradient-to-r from-[#009ca6] to-[#00b4bf] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Cara 2</span>
            <span className="text-[10px] opacity-80">({cara2Positions.length} puestos)</span>
          </button>
        </div>

        {/* Badge Flotante Top Table (si la mesa dispone de él) */}
        {relevantTopTable && (
          <div className="bg-slate-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-teal-500/30 shadow-xl text-white flex items-center gap-2 pointer-events-auto">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[9px] font-black uppercase tracking-wider bg-[#ff6900] text-white px-2 py-0.5 rounded shadow-sm shrink-0">
                Top Table
              </span>
              <span className="text-xs font-bold text-teal-200 truncate hidden sm:inline">
                {relevantTopTable.campanaOficial}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onInspectTopTable && onInspectTopTable(relevantTopTable)}
              className="px-2.5 py-1 rounded-lg bg-[#009ca6] hover:bg-[#008992] text-white text-[11px] font-black transition cursor-pointer flex items-center gap-1 shadow-sm shrink-0"
            >
              <span>{topTableState?.estadoVisual || 'Auditar'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Botón Pantalla Completa */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-950/80 backdrop-blur-md p-1 rounded-xl border border-white/10 pointer-events-auto">
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. ÁREA CENTRAL DE VISUALIZACIÓN FOTORREALISTA 360° */}
      <div 
        className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at center, #b8bdc4 0%, #a4a9b0 65%, #8f949b 100%)'
        }}
        onMouseDown={(e) => handlePointerDown(e.clientX)}
        onMouseMove={(e) => handlePointerMove(e.clientX)}
        onTouchStart={(e) => handlePointerDown(e.touches[0].clientX)}
        onTouchMove={(e) => handlePointerMove(e.touches[0].clientX)}
        onTouchEnd={handlePointerUp}
      >
        {/* Render Fotorealista del Ángulo Actual */}
        <div 
          className="relative max-w-full max-h-full flex items-center justify-center pointer-events-none"
          style={{
            transform: `scale(${zoomLevel})`,
            transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)'
          }}
        >
          <img
            src={currentView.src}
            alt={`Mesa Xiaomi Vista ${currentView.label}`}
            className="w-full h-auto max-h-[82vh] object-contain drop-shadow-2xl select-none transition-opacity duration-150"
            draggable={false}
          />

          {/* HOTSPOTS INTERACTIVOS PARA CARA 1 (VISTA 01) Y CARA 2 (VISTA 04) */}
          {(isCara1Active || isCara2Active) && activePins.map((pos, idx) => {
            const isSelected = selectedPositionId === pos.id;
            const isHovered = hoveredPosId === pos.id;
            const audit = auditStates[pos.id];
            const isOk = audit?.estadoPosicion === 'OK';
            const isIncidence = audit?.estadoPosicion === 'Incidencia';

            // Coordenada por defecto si no está especificada
            const pinX = pos.pinX ?? (12 + (idx / Math.max(1, activePins.length - 1)) * 76);
            const pinY = pos.pinY ?? 53.5;

            let badgeBg = 'bg-[#104a60] text-white border-white ring-2 ring-[#009ca6]/60 shadow-lg';
            if (isOk) {
              badgeBg = 'bg-emerald-500 text-white border-white ring-2 ring-emerald-500/40 shadow-emerald-500/30';
            } else if (isIncidence) {
              badgeBg = 'bg-rose-500 text-white border-white ring-2 ring-rose-500/40 shadow-rose-500/30 animate-pulse';
            }

            return (
              <div
                key={pos.id}
                style={{
                  position: 'absolute',
                  left: `${pinX}%`,
                  top: `${pinY}%`,
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'auto'
                }}
                className="z-20 group"
                onMouseEnter={() => setHoveredPosId(pos.id)}
                onMouseLeave={() => setHoveredPosId(null)}
              >
                {/* Conector visual sutil hacia el dispositivo */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0.5 h-3 bg-gradient-to-t from-white/80 to-transparent pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity" />

                {/* Pin Circular */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPosition(pos);
                  }}
                  className={`rounded-full font-black flex items-center justify-center transition-all cursor-pointer border-2 shadow-xl ${badgeBg} ${
                    isSelected
                      ? 'w-9 h-9 sm:w-10 sm:h-10 scale-125 ring-4 ring-[#00c4cc] z-30 shadow-[#009ca6]'
                      : 'w-6 h-6 sm:w-7 sm:h-7 hover:scale-120'
                  }`}
                  title={`Puesto ${pos.posicionNumero}: ${pos.modeloOficial}`}
                >
                  {isOk ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  ) : isIncidence ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <span className="text-[10px] sm:text-[11px] font-black leading-none">
                      {String(pos.posicionNumero).padStart(2, '0')}
                    </span>
                  )}
                </button>

                {/* Tooltip Hover Flotante */}
                {(isHovered || isSelected) && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none z-40 whitespace-nowrap">
                    <div className="bg-slate-950/95 backdrop-blur-md text-white text-[11px] font-bold py-1 px-2.5 rounded-xl border border-white/20 shadow-2xl flex items-center gap-1.5">
                      <span className="bg-[#009ca6] text-white px-1.5 py-0.2 rounded text-[9px] font-black">
                        P{pos.posicionNumero}
                      </span>
                      <span className="text-teal-200">{pos.modeloOficial}</span>
                      {pos.esDummy && (
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded border border-amber-500/30">
                          Dummy
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* HUD EN PERSPECTIVAS LATERALES (02, 03, 05, 06) */}
        {isTransitionView && (
          <div className="absolute inset-x-0 bottom-16 flex justify-center pointer-events-none z-20">
            <div className="bg-slate-950/85 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-white shadow-2xl flex items-center gap-3 pointer-events-auto">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#00c4cc] animate-spin" style={{ animationDuration: '8s' }} />
                <div className="text-xs">
                  <div className="font-extrabold text-teal-300">{currentView.label}</div>
                  <div className="text-[10px] text-slate-400">Gira para enfocar frontalmente</div>
                </div>
              </div>

              <div className="h-5 w-px bg-white/20" />

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => goToSide('Cara 1')}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-black transition cursor-pointer text-slate-200 hover:text-white"
                >
                  Cara 1 (0°)
                </button>
                <button
                  type="button"
                  onClick={() => goToSide('Cara 2')}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-black transition cursor-pointer text-slate-200 hover:text-white"
                >
                  Cara 2 (180°)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. BARRA INFERIOR DE CONTROL 360° Y DIAL DE ÁNGULOS */}
      <div className="absolute bottom-3 left-3 right-3 z-30 flex items-center justify-between gap-2 pointer-events-none">
        
        {/* Controles de Zoom */}
        <div className="bg-slate-950/85 backdrop-blur-md border border-white/10 rounded-xl p-1 flex items-center gap-1 text-white text-xs shadow-lg pointer-events-auto">
          <button
            onClick={() => setZoomLevel(prev => Math.max(0.8, prev - 0.1))}
            className="p-1 sm:p-1.5 hover:bg-white/20 rounded-lg cursor-pointer transition text-slate-300 hover:text-white"
            title="Reducir zoom"
          >
            <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <span className="font-mono text-[10px] px-1 text-teal-300 font-bold">{Math.round(zoomLevel * 100)}%</span>
          <button
            onClick={() => setZoomLevel(prev => Math.min(1.6, prev + 0.1))}
            className="p-1 sm:p-1.5 hover:bg-white/20 rounded-lg cursor-pointer transition text-slate-300 hover:text-white"
            title="Aumentar zoom"
          >
            <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1 sm:p-1.5 hover:bg-white/20 rounded-lg cursor-pointer text-teal-400 hover:text-teal-300 transition"
            title="Restablecer zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* DIAL DE 6 ÁNGULOS (01 A 06) */}
        <div className="bg-slate-950/90 backdrop-blur-md px-2 py-1 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-1 pointer-events-auto">
          <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 px-1.5 hidden sm:flex">
            <MoveHorizontal className="w-3.5 h-3.5 text-[#00c4cc]" />
            <span>360°</span>
          </div>

          <div className="flex items-center gap-1">
            {ORBIT_VIEWS.map((view) => {
              const isActive = view.index === currentFrameIndex;
              return (
                <button
                  key={view.id}
                  type="button"
                  onClick={() => setCurrentFrameIndex(view.index)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition cursor-pointer flex items-center gap-1 ${
                    isActive
                      ? 'bg-[#009ca6] text-white shadow-md ring-1 ring-teal-400'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                  title={view.label}
                >
                  <span>{view.id}</span>
                  {view.isPrimaryFacing && (
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-300" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Indicador táctil de giro */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[10px] font-bold text-slate-300 pointer-events-none shadow-lg">
          <span className="w-2 h-2 rounded-full bg-[#00c4cc] animate-pulse" />
          <span>Arrastra en horizontal para orbitar 360°</span>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  DeviceReturnState,
  PlanogramPosition,
  PositionSwapState,
  StoreCenter,
  SwapCampaignAssignment,
  UserProfile,
  VisualElementAuditState,
  VisualElementDefinition,
  VisualIncidentMotivo
} from '../../types';
import { getPositionsForSpace } from '../../data/defaultData';
import { PLANOGRAM_IMAGES } from '../../data/planogramImages';
import {
  ACTIVE_IMPLANTATION_CAMPAIGN,
  getAllSwapAssignmentsForStore,
  getImplantationPositionsForMesa1Cara1,
  getReturnDevicesForStore,
  getSwapAssignmentForPosition,
  getVisualElementsForStore,
  isTwoTableSpace
} from '../../data/implantationCampaignData';
import { DbService } from '../../services/dbService';
import { ImageCompressionService } from '../../services/imageCompressionService';
import { ImplantationSummaryModal } from './ImplantationSummaryModal';
import { ScannerModal } from '../ScannerModal';
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowLeft,
  ArrowRightLeft,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  HelpCircle,
  Image as ImageIcon,
  Layers,
  PackageCheck,
  PackageMinus,
  PackagePlus,
  RotateCcw,
  Ruler,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Trash2,
  Upload,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

interface ImplantationOverviewScreenProps {
  store: StoreCenter;
  allStores: StoreCenter[];
  currentUser: UserProfile;
  swapStates: Record<string, PositionSwapState>;
  visualStates: Record<string, VisualElementAuditState>;
  activeTab?: 'return_devices' | 'swap_devices' | 'visual_plv';
  onTabChange?: (tab: 'return_devices' | 'swap_devices' | 'visual_plv') => void;
  initialActiveSpace?: string;
  onActiveSpaceChange?: (space: string) => void;
  initialSelectedPositionId?: string | null;
  onSelectPositionIdChange?: (posId: string) => void;
  initialViewMode?: 'visual' | 'list';
  onViewModeChange?: (mode: 'visual' | 'list') => void;
  initialOpenSummary?: boolean;
  onSelectSwapPosition: (pos: PlanogramPosition, assignment: SwapCampaignAssignment) => void;
  onUpdateVisualState: (state: VisualElementAuditState) => void;
  onFinishComplete: () => void;
  onBack: () => void;
}

const VISUAL_INCIDENT_MOTIVOS: VisualIncidentMotivo[] = [
  'Medidas no coinciden',
  'Material roto o dañado de origen',
  'Falta perfilería/sujeción',
  'Otro'
];

const CUBRECESTAS_PLACED_INCIDENT_MOTIVOS: VisualIncidentMotivo[] = [
  'Instalado fuera de la 2.ª posición oficial asignada',
  'Material instalado con desperfectos o deterioro estético visible',
  'Material recibido en mal estado de origen (instalado provisionalmente)',
  'Estructura o soporte de la cesta en mal estado / desencajado',
  'Medidas o formato no ajustan correctamente al mobiliario de tienda',
  'Otra incidencia en la colocación (detallar en observaciones)'
];

const CUBRECESTAS_NOT_PLACED_MOTIVOS: VisualIncidentMotivo[] = [
  'Material no recibido en el centro (pendiente de recepción logística)',
  'Material recibido con daños graves de origen (imposible su instalación)',
  'Instalación no autorizada por dirección / responsables del centro',
  'Ausencia de línea de cestas o mobiliario compatible en el centro',
  'Segunda posición ocupada por otra campaña prioritaria del retailer',
  'Mobiliario o soporte de cesta deteriorado (impide fijar el cubrecestas)',
  'Extraviado o no localizado en almacén del punto de venta',
  'Otro motivo justificado (detallar en observaciones)'
];

export const ImplantationOverviewScreen: React.FC<ImplantationOverviewScreenProps> = ({
  store,
  allStores,
  currentUser,
  swapStates,
  visualStates,
  activeTab,
  onTabChange,
  initialActiveSpace,
  onActiveSpaceChange,
  initialSelectedPositionId,
  onSelectPositionIdChange,
  initialViewMode,
  onViewModeChange,
  initialOpenSummary = false,
  onSelectSwapPosition,
  onUpdateVisualState,
  onFinishComplete,
  onBack
}) => {
  // Subsecciones dentro de Nueva Implantación:
  // 1. "Material a Retirar (7)" | 2. "Planograma Nuevo (11)" | 3. "POSM"
  const [internalSubModule, setInternalSubModule] = useState<'return_devices' | 'swap_devices' | 'visual_plv'>('return_devices');
  const subModule = activeTab ?? internalSubModule;
  const setSubModule = (next: 'return_devices' | 'swap_devices' | 'visual_plv') => {
    setInternalSubModule(next);
    if (onTabChange) onTabChange(next);
  };

  // Pestañas superiores dentro de Dispositivos: "Vista Interactiva 3D" | "Lista de Dispositivos"
  const [viewMode, setViewModeState] = useState<'visual' | 'list'>(initialViewMode || 'visual');
  const setViewMode = (mode: 'visual' | 'list') => {
    setViewModeState(mode);
    if (onViewModeChange) onViewModeChange(mode);
  };
  const [showLegend, setShowLegend] = useState(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState<boolean>(initialOpenSummary);

  const availableSpaces = useMemo(() => {
    const raw = store.availableSpaces && store.availableSpaces.length > 0
      ? store.availableSpaces
      : ['MESA 1 · Cara 1', 'MESA 1 · Cara 2', 'WALL', 'LINEAL SMARTWATCH'];

    const list: string[] = [];
    const hasMesa1 = raw.some(s => s.toUpperCase().includes('MESA 1'));
    const hasMesa2 = raw.some(s => s.toUpperCase().includes('MESA 2'));
    const hasMesa3 = raw.some(s => s.toUpperCase().includes('MESA 3'));

    if (hasMesa1) list.push('MESA 1');
    if (hasMesa2) list.push('MESA 2');
    if (hasMesa3) list.push('MESA 3');

    raw.forEach(s => {
      const u = s.toUpperCase();
      if (u.includes('MESA')) return;
      if (u.includes('COLUMNA')) return;
      if (!list.includes(s)) list.push(s);
    });

    return list.length > 0 ? list : ['MESA 1'];
  }, [store.availableSpaces]);

  const [activeSpace, setActiveSpaceState] = useState<string>(() => {
    if (initialActiveSpace) {
      const normalized = initialActiveSpace.includes('MESA 1') ? 'MESA 1'
        : initialActiveSpace.includes('MESA 2') ? 'MESA 2'
        : initialActiveSpace.includes('MESA 3') ? 'MESA 3'
        : initialActiveSpace;
      if (availableSpaces.includes(normalized)) return normalized;
    }
    return availableSpaces[0];
  });
  const setActiveSpace = (space: string) => {
    setActiveSpaceState(space);
    if (onActiveSpaceChange) onActiveSpaceChange(space);
  };

  // En Mesa 1 durante la Nueva Implantación se aplican los puestos oficiales de la campaña
  const isMesa1 = activeSpace.toUpperCase().includes('MESA 1');
  const isMesa1Cara1 = isMesa1;

  const positions = useMemo(() => {
    if (isMesa1Cara1) {
      return getImplantationPositionsForMesa1Cara1(store);
    }
    return getPositionsForSpace(store.tipoEspacioId, activeSpace, store);
  }, [store, activeSpace, isMesa1Cara1]);

  // Todas las posiciones asignadas a la campaña de lanzamiento en esta tienda
  const allStoreSwapAssignments = useMemo(
    () => getAllSwapAssignmentsForStore(store),
    [store]
  );

  // Última auditoría completa previa (fusionando borrador en curso si existe) para recuperar los IMEIs y estado LDU/Maqueta del material saliente
  const latestAudit = useMemo(() => {
    const baseAudit = DbService.getLatestAuditForStore(store.tiendaId);
    const activeDraft = DbService.getDraft(store.tiendaId);
    if (!activeDraft || activeDraft.length === 0) return baseAudit;

    const mergedMap = new Map<string, (typeof activeDraft)[number]>();
    (baseAudit?.positions || []).forEach((p) => {
      mergedMap.set(p.posicionId || `${p.mesaId}-${p.posicionNumero}`, p);
    });
    activeDraft.forEach((d) => {
      if (d.estadoPosicion !== 'Pendiente' || (d.imeiSerial && d.imeiSerial !== '-')) {
        mergedMap.set(d.posicionId || `${d.mesaId}-${d.posicionNumero}`, d);
      }
    });

    if (baseAudit) {
      return {
        ...baseAudit,
        positions: Array.from(mergedMap.values())
      };
    }
    return {
      auditId: `DRAFT_${store.tiendaId}`,
      tiendaId: store.tiendaId,
      nombreTienda: store.nombreTienda,
      retailer: store.retailer,
      usuarioEmail: currentUser.email,
      usuarioNombre: currentUser.nombre,
      fechaHora: new Date().toISOString(),
      totalPosiciones: mergedMap.size,
      okCount: 0,
      incidenciasCount: 0,
      pendientesCount: 0,
      positions: Array.from(mergedMap.values()),
      sincronizadoSheets: false
    };
  }, [store, currentUser.email, currentUser.nombre]);

  // Lista de dispositivos que deben retirarse de la mesa (Check-Out) con sus IMEIs y tipo LDU/Maqueta memorizados
  const [returnDevices, setReturnDevices] = useState<DeviceReturnState[]>(() => {
    const officialBase = getReturnDevicesForStore(store, latestAudit);
    const draft = DbService.getImplantationDraft(store.tiendaId);
    if (draft?.returnStates && Object.keys(draft.returnStates).length > 0) {
      return officialBase.map((official) => {
        const saved = draft.returnStates?.[official.id];
        if (!saved) return official;
        // Ignorar auto-confirmaciones antiguas ('Auditoría Registrada') o estados aún pendientes para refrescar IMEI y LDU/Maqueta desde la última auditoría
        if (
          saved.estadoRetirada === 'Pendiente' ||
          (saved.confirmadoPor === 'Auditoría Registrada' && saved.estadoRetirada === 'Retirado')
        ) {
          return {
            ...official,
            esDummy: official.esDummy,
            imeiMemorizado: official.esDummy
              ? undefined
              : saved.imeiMemorizado && saved.imeiMemorizado !== '-'
              ? saved.imeiMemorizado
              : official.imeiMemorizado,
            estadoRetirada: 'Pendiente',
            confirmadoPor: undefined
          };
        }
        return {
          ...official,
          ...saved,
          imeiMemorizado:
            saved.imeiMemorizado && saved.imeiMemorizado !== '-'
              ? saved.imeiMemorizado
              : official.imeiMemorizado
        };
      });
    }
    return officialBase;
  });

  // Estado de verificación explícita por dispositivo ('yes' = Sí es correcto, 'no' = No coincide / escanear o manual)
  const [editingImeiDiscrepancy, setEditingImeiDiscrepancy] = useState<Record<string, boolean>>({});
  const [openReturnIncidentDrawer, setOpenReturnIncidentDrawer] = useState<Record<string, boolean>>({});

  const toggleReturnIncidentDrawer = (devId: string) => {
    setOpenReturnIncidentDrawer((prev) => ({
      ...prev,
      [devId]: !prev[devId]
    }));
  };

  const saveReturnDevicesDraft = (updated: DeviceReturnState[]) => {
    setReturnDevices(updated);
    const returnStatesMap: Record<string, DeviceReturnState> = {};
    updated.forEach((r) => {
      returnStatesMap[r.id] = r;
    });
    DbService.saveImplantationDraft({
      tiendaId: store.tiendaId,
      campanaNombre: ACTIVE_IMPLANTATION_CAMPAIGN,
      swapStates,
      visualStates,
      returnStates: returnStatesMap,
      updatedAt: new Date().toISOString()
    });
  };

  // Escáner inteligente para IMEI en material a retirar (Check-Out)
  const [returnScannerTargetId, setReturnScannerTargetId] = useState<string | null>(null);
  const activeReturnScannerDev = useMemo(() => {
    if (!returnScannerTargetId) return null;
    return returnDevices.find((d) => d.id === returnScannerTargetId) || null;
  }, [returnScannerTargetId, returnDevices]);

  const handleUpdateReturnImei = (id: string, newImei: string) => {
    const updated = returnDevices.map((r) => {
      if (r.id === id) {
        return {
          ...r,
          imeiMemorizado: newImei.trim()
        };
      }
      return r;
    });
    saveReturnDevicesDraft(updated);
  };

  const handleToggleReturnDummy = (id: string, nextDummy: boolean) => {
    if (nextDummy && returnScannerTargetId === id) {
      setReturnScannerTargetId(null);
    }
    if (nextDummy) {
      setEditingImeiDiscrepancy((prev) => ({ ...prev, [id]: false }));
    }
    const updated = returnDevices.map((r) => {
      if (r.id === id) {
        return {
          ...r,
          esDummy: nextDummy
        };
      }
      return r;
    });
    saveReturnDevicesDraft(updated);
  };

  const handleReturnScanSuccess = (scannedCode: string) => {
    if (returnScannerTargetId) {
      const targetId = returnScannerTargetId;
      const updated = returnDevices.map((r) => {
        if (r.id === targetId) {
          return {
            ...r,
            imeiMemorizado: scannedCode.trim(),
            estadoRetirada: r.estadoRetirada === 'Incidencia' ? ('Incidencia' as const) : ('Retirado' as const),
            confirmadoPor: currentUser.nombre,
            fechaHora: new Date().toLocaleString('es-ES')
          };
        }
        return r;
      });
      saveReturnDevicesDraft(updated);
      setReturnScannerTargetId(null);
    }
  };

  const handleConfirmReturn = (id: string) => {
    const updated = returnDevices.map((r) => {
      if (r.id === id) {
        return {
          ...r,
          estadoRetirada: 'Retirado' as const,
          motivoIncidencia: undefined,
          confirmadoPor: currentUser.nombre,
          fechaHora: new Date().toLocaleString('es-ES')
        };
      }
      return r;
    });
    saveReturnDevicesDraft(updated);
  };

  const handleIncidentReturn = (id: string, motivo: string) => {
    const updated = returnDevices.map((r) => {
      if (r.id === id) {
        const isSameMotivo = r.estadoRetirada === 'Incidencia' && r.motivoIncidencia === motivo;
        if (isSameMotivo) {
          return {
            ...r,
            estadoRetirada: 'Pendiente' as const,
            motivoIncidencia: undefined
          };
        }
        return {
          ...r,
          estadoRetirada: 'Incidencia' as const,
          motivoIncidencia: motivo,
          confirmadoPor: currentUser.nombre,
          fechaHora: new Date().toLocaleString('es-ES')
        };
      }
      return r;
    });
    saveReturnDevicesDraft(updated);
  };

  // Elementos de Parte Visual (Lonas, Cartelería y Merchandising)
  const visualDefinitions = useMemo(() => getVisualElementsForStore(store), [store]);
  const [activeVisualId, setActiveVisualId] = useState<string>(visualDefinitions[0]?.id || '');
  const activeVisualDef =
    visualDefinitions.find((v) => v.id === activeVisualId) || visualDefinitions[0];

  // Cámara para Parte Visual (Paso 1 Foto Previa / Paso 2 Foto Posterior)
  const [visualCameraTarget, setVisualCameraTarget] = useState<{
    elementoId: string;
    step: 'antigua' | 'nueva';
  } | null>(null);
  const [tempVisualPhoto, setTempVisualPhoto] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Modal de previsualización en pantalla completa para imágenes de referencia POSM
  const [posmPreviewModal, setPosmPreviewModal] = useState<{
    src: string;
    title: string;
    subtitle?: string;
    isFaldon?: boolean;
  } | null>(null);

  // Selección de puesto en el mapa 3D (por defecto el puesto memorizado o el primero que interviene en el Swap)
  const [selectedPos, setSelectedPosState] = useState<PlanogramPosition>(() => {
    if (initialSelectedPositionId) {
      const found = positions.find((p) => p.id === initialSelectedPositionId);
      if (found) return found;
    }
    const firstCampaignPos = positions.find((p) => Boolean(getSwapAssignmentForPosition(p)));
    return firstCampaignPos || positions[0];
  });
  const isMesaActive = activeSpace.toUpperCase().startsWith('MESA');
  const [selectedCara, setSelectedCara] = useState<'Cara 1' | 'Cara 2'>('Cara 1');

  useEffect(() => {
    setSelectedCara('Cara 1');
  }, [activeSpace]);

  const setSelectedPos = (pos: PlanogramPosition) => {
    setSelectedPosState(pos);
    if (pos?.cara && isMesaActive) {
      setSelectedCara(pos.cara as 'Cara 1' | 'Cara 2');
    }
    if (pos && onSelectPositionIdChange) onSelectPositionIdChange(pos.id);
  };

  const isCara2Active = isMesaActive
    ? selectedCara === 'Cara 2'
    : (activeSpace.includes('Cara 2') || activeSpace.includes('Cara B'));

  const cara1Positions = useMemo(() => {
    return positions.filter(p => p.cara === 'Cara 1');
  }, [positions]);

  const cara2Positions = useMemo(() => {
    return positions.filter(p => p.cara === 'Cara 2');
  }, [positions]);

  const hasMultipleCaras = isMesaActive && cara1Positions.length > 0 && cara2Positions.length > 0;

  const visiblePositions = hasMultipleCaras
    ? (selectedCara === 'Cara 2' ? cara2Positions : cara1Positions)
    : positions;

  // Imagen de fondo del espacio 3D: en Mesa 1 Cara 1 se utiliza el nuevo render oficial de lanzamiento Xiaomi 18
  const hasWall = Boolean(
    store.availableSpaces &&
    store.availableSpaces.some(
      (s) => s.toUpperCase().includes('WALL') && !s.toUpperCase().includes('MINIWALL')
    )
  );
  const hasMiniwall = Boolean(
    store.availableSpaces &&
    store.availableSpaces.some((s) => s.toUpperCase().includes('MINIWALL'))
  );
  const hasWallOrMiniwall = hasWall || hasMiniwall;
  const isTable1 = store.tipoEspacioId.includes('Table 1');
  const isTable2 = store.tipoEspacioId.includes('Table 2');
  const isTableCrf = store.tipoEspacioId.includes('Table CRF');
  const isLinealActive =
    activeSpace.toUpperCase().includes('LINEAL') ||
    activeSpace.toUpperCase().includes('SMARTWATCH');
  const isMiniWallActive = activeSpace.toUpperCase().includes('MINIWALL');
  const isWallActive = activeSpace.toUpperCase().includes('WALL') && !isMiniWallActive;
  const isMesa2Active = activeSpace.toUpperCase().includes('MESA 2');

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
      ? (store.hasPad8Pro ? PLANOGRAM_IMAGES.table2Mesa2Pad8ProCara2 : PLANOGRAM_IMAGES.table2Mesa2Cara2)
      : (store.hasPad8Pro
          ? PLANOGRAM_IMAGES.table2Mesa2Pad8ProCara1
          : (hasWallOrMiniwall ? PLANOGRAM_IMAGES.table2Mesa2Cara1 : PLANOGRAM_IMAGES.table2Mesa2Cara1NoWall));
  } else if (isTable2) {
    bgImage = isCara2Active
      ? (hasWallOrMiniwall ? PLANOGRAM_IMAGES.table2Mesa1Cara2 : PLANOGRAM_IMAGES.table2Mesa1Cara2NoWall)
      : (hasWallOrMiniwall ? PLANOGRAM_IMAGES.table2Mesa1Cara1Xiaomi18 : PLANOGRAM_IMAGES.table2Mesa1Cara1NoWall);
  } else if (isTable1 && hasWall) {
    bgImage = isCara2Active
      ? PLANOGRAM_IMAGES.table1WallCara2
      : PLANOGRAM_IMAGES.table1WallCara1;
  } else if (isTable1 && !isCara2Active) {
    bgImage = PLANOGRAM_IMAGES.table1Cara1Xiaomi18;
  } else {
    bgImage = isCara2Active
      ? PLANOGRAM_IMAGES.table1Cara2
      : PLANOGRAM_IMAGES.table1Cara1;
  }

  const containerBgColor =
    isMiniWallActive ? '#c8cbcf' : isWallActive ? '#9c9b99' : isLinealActive ? '#ded6ca' : '#c5c6c8';

  // Métricas globales de avance de Nueva Implantación
  const completedSwapsCount = allStoreSwapAssignments.filter(
    (a) => swapStates[a.posicionId] && swapStates[a.posicionId].estadoSwap !== 'Pendiente'
  ).length;
  const totalSwapsCount = allStoreSwapAssignments.length;

  const completedVisualsCount = visualDefinitions.filter(
    (v) => visualStates[v.id] && visualStates[v.id].estadoVisual !== 'Pendiente'
  ).length;
  const totalVisualsCount = visualDefinitions.length;

  const completedReturnsCount = returnDevices.filter(
    (r) => r.estadoRetirada !== 'Pendiente'
  ).length;
  const totalReturnsCount = returnDevices.length;

  const globalTotal = totalSwapsCount + totalReturnsCount + totalVisualsCount;
  const globalDone = completedSwapsCount + completedReturnsCount + completedVisualsCount;
  const globalProgressPercent =
    globalTotal > 0 ? Math.min(100, Math.round((globalDone / globalTotal) * 100)) : 0;

  // Gestión de cámara para Parte Visual
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (visualCameraTarget && !tempVisualPhoto) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
          .then((stream) => {
            streamRef.current = stream;
            setCameraActive(true);
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.play().catch(() => {});
            }
          })
          .catch(() => setCameraActive(false));
      }
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [visualCameraTarget, tempVisualPhoto]);

  const getOrCreateVisualState = (def: VisualElementDefinition): VisualElementAuditState => {
    const existing = visualStates[def.id];
    if (existing) return existing;
    return {
      elementoId: def.id,
      nombreElemento: def.nombreElemento,
      tipoMaterial: def.tipoMaterial,
      medidasOficiales: def.medidasOficiales,
      fijacionYMedidaCorrecta: null,
      estadoVisual: 'Pendiente',
      motivoIncidencia: '',
      notas: '',
      auditadoPor: currentUser.nombre,
      usuarioEmail: currentUser.email,
      fechaHora: new Date().toLocaleString('es-ES')
    };
  };

  const computeVisualStatus = (
    _fotoAntigua?: string,
    fotoNueva?: string,
    medidasOk?: boolean | null,
    isCubrecestasItem?: boolean,
    motivoIncidencia?: string
  ): 'Pendiente' | 'OK' | 'Incidencia' => {
    if (isCubrecestasItem) {
      if (medidasOk === true) {
        return motivoIncidencia && motivoIncidencia.trim() !== '' ? 'Incidencia' : 'OK';
      }
      if (medidasOk === false) {
        return motivoIncidencia && motivoIncidencia.trim() !== '' ? 'Incidencia' : 'Pendiente';
      }
      return 'Pendiente';
    }
    if (medidasOk === false) return 'Incidencia';
    if (fotoNueva && medidasOk === true) return 'OK';
    return 'Pendiente';
  };

  const handleSaveVisualPhoto = (photoDataUrl: string) => {
    if (!visualCameraTarget || !activeVisualDef) return;
    const base = getOrCreateVisualState(activeVisualDef);
    const isCubrecestasItem = activeVisualDef.guiaVisualTipo === 'cubrecestas';
    const nextAntigua =
      visualCameraTarget.step === 'antigua' ? photoDataUrl : base.fotoAntiguaUrl;
    const nextNueva = visualCameraTarget.step === 'nueva' ? photoDataUrl : base.fotoNuevaUrl;
    const nextEstado = computeVisualStatus(
      nextAntigua,
      nextNueva,
      base.fijacionYMedidaCorrecta,
      isCubrecestasItem,
      base.motivoIncidencia
    );

    onUpdateVisualState({
      ...base,
      fotoAntiguaUrl: nextAntigua,
      fotoNuevaUrl: nextNueva,
      estadoVisual: nextEstado,
      auditadoPor: currentUser.nombre,
      usuarioEmail: currentUser.email,
      fechaHora: new Date().toLocaleString('es-ES')
    });

    stopCamera();
    setTempVisualPhoto(null);
    setVisualCameraTarget(null);
  };

  const generateDemoVisualPhoto = (def: VisualElementDefinition, step: 'antigua' | 'nueva') => {
    const canvas = document.createElement('canvas');
    canvas.width = 960;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const grad = ctx.createLinearGradient(0, 0, 960, 640);
    if (step === 'antigua') {
      grad.addColorStop(0, '#334155');
      grad.addColorStop(1, '#1e293b');
    } else {
      grad.addColorStop(0, '#072431');
      grad.addColorStop(0.6, '#104a60');
      grad.addColorStop(1, '#009ca6');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 960, 640);

    // Marco bastidor PLV
    ctx.strokeStyle = step === 'antigua' ? '#fbbf24' : '#2dd4bf';
    ctx.lineWidth = 6;
    ctx.strokeRect(50, 50, 860, 540);

    ctx.fillStyle = '#ff6900';
    ctx.beginPath();
    ctx.roundRect(80, 80, 70, 70, 16);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('mi', 115, 128);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(
      step === 'antigua'
        ? `PASO 1 · CARTELERÍA ANTIGUA RETIRADA`
        : `PASO 2 · NUEVA CARTELERÍA IMPLANTADA`,
      480,
      200
    );

    ctx.fillStyle = step === 'antigua' ? '#fcd34d' : '#5eead4';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText(def.nombreElemento.toUpperCase(), 480, 270);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(
      step === 'antigua'
        ? 'Campaña Anterior: Serie Xiaomi 17 Ultra / Xiaomi 17'
        : `Nueva Campaña Oficial: ${ACTIVE_IMPLANTATION_CAMPAIGN}`,
      480,
      340
    );

    ctx.font = '20px monospace';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(`Medidas Oficiales: ${def.medidasOficiales}`, 480, 405);
    ctx.fillText(
      `Tienda: ${store.nombreTienda} · ${new Date().toLocaleDateString('es-ES')}`,
      480,
      460
    );

    setTempVisualPhoto(canvas.toDataURL('image/jpeg', 0.85));
  };

  const selectedPosAssignment = selectedPos ? getSwapAssignmentForPosition(selectedPos) : null;
  const selectedPosSwapState = selectedPos ? swapStates[selectedPos.id] : undefined;

  return (
    <div className="w-full min-h-[92dvh] sm:min-h-[80vh] flex flex-col bg-white text-slate-800 rounded-none sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 transition-all duration-300">
      {/* =====================================================================
          HEADER CORPORATIVO SALESLAND + BOTÓN PRINCIPAL "FINALIZAR AUDITORÍA"
          ===================================================================== */}
      <div className="px-3.5 sm:px-6 py-3 bg-gradient-to-r from-[#072431] via-[#104a60] to-[#0a3343] text-white flex flex-wrap items-center justify-between gap-2.5 sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95 shrink-0 cursor-pointer"
            title="Volver a selección de tienda"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#ff6900] text-white">
                Nueva Implantación
              </span>
              <span className="text-[10px] font-bold text-teal-300 truncate">
                {ACTIVE_IMPLANTATION_CAMPAIGN}
              </span>
            </div>
            <h1 className="text-xs sm:text-base font-black text-white truncate tracking-tight mt-0.5">
              {store.nombreTienda} ({store.retailer})
            </h1>
          </div>
        </div>

        {/* Progreso Circular + Leyenda + Botón Principal "Finalizar Auditoría" */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 ml-auto">
          <div className="flex items-center gap-2 bg-black/25 px-2.5 py-1 rounded-2xl border border-white/10">
            <div className="text-right hidden md:block">
              <span className="block text-[9px] font-medium text-slate-300 uppercase">
                Avance Global
              </span>
              <span className="text-xs font-black text-white">
                {globalDone} / {globalTotal}
              </span>
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-[#009ca6] flex items-center justify-center font-bold text-[10px] text-[#00c4cc] bg-[#009ca6]/20">
              {globalProgressPercent}%
            </div>
          </div>

          {subModule === 'swap_devices' && (
            <button
              type="button"
              onClick={() => setShowLegend(!showLegend)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-teal-200 transition text-xs font-semibold flex items-center gap-1 cursor-pointer"
              title="Ver leyenda de colores de Nueva Implantación"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden lg:inline">Leyenda</span>
            </button>
          )}

          {/* BOTÓN PRINCIPAL EN CABECERA: "Finalizar Auditoría" */}
          <button
            type="button"
            onClick={() => setIsSummaryModalOpen(true)}
            className="px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-[#009ca6] to-[#00b4bf] hover:brightness-110 active:scale-95 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-[#009ca6]/30 cursor-pointer transition"
          >
            <ShieldCheck className="w-4 h-4 text-white shrink-0" />
            <span>Finalizar Auditoría</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          PESTAÑAS / SUBSECCIONES DENTRO DE NUEVA IMPLANTACIÓN:
          1. "Material a Retirar (7)" | 2. "Planograma Nuevo (11)" | 3. "POSM"
          ===================================================================== */}
      <div className="px-3.5 sm:px-6 py-2.5 bg-[#0a2e3d] text-white border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setSubModule('return_devices')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer ${
              subModule === 'return_devices'
                ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-300/40'
                : 'bg-white/10 text-slate-200 hover:bg-white/15'
            }`}
          >
            <PackageMinus className="w-3.5 h-3.5" />
            <span>1. Material a Retirar</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                subModule === 'return_devices' ? 'bg-black/25 text-white' : 'bg-white/10 text-amber-200'
              }`}
            >
              {completedReturnsCount}/{totalReturnsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSubModule('swap_devices')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer ${
              subModule === 'swap_devices'
                ? 'bg-[#009ca6] text-white shadow-md ring-2 ring-teal-300/40'
                : 'bg-white/10 text-slate-200 hover:bg-white/15'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>2. Planograma Nuevo</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                subModule === 'swap_devices' ? 'bg-black/25 text-white' : 'bg-white/10 text-teal-200'
              }`}
            >
              {completedSwapsCount}/{totalSwapsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSubModule('visual_plv')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer ${
              subModule === 'visual_plv'
                ? 'bg-[#ff6900] text-white shadow-md ring-2 ring-orange-300/40'
                : 'bg-white/10 text-slate-200 hover:bg-white/15'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>3. POSM</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                subModule === 'visual_plv' ? 'bg-black/25 text-white' : 'bg-white/10 text-amber-200'
              }`}
            >
              {completedVisualsCount}/{totalVisualsCount}
            </span>
          </button>
        </div>

        {/* Pestañas superiores de vista ("Vista Interactiva 3D" y "Lista de Dispositivos") cuando estamos en Dispositivos Swap */}
        {subModule === 'swap_devices' && (
          <div className="bg-black/30 border border-white/15 p-0.5 rounded-xl flex text-xs font-bold shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('visual')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'visual'
                  ? 'bg-[#009ca6] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Vista Interactiva 3D
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#009ca6] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Lista de Dispositivos ({positions.length})
            </button>
          </div>
        )}
      </div>

      {/* =====================================================================
          SUBSECCIÓN 1: "DISPOSITIVOS (SWAP)" (IDÉNTICA A AUDITORÍA COMPLETA)
          ===================================================================== */}
      {subModule === 'swap_devices' && (
        <>
          {/* Barra de superficies / muebles de la tienda */}
          <div className="px-3.5 sm:px-6 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1.5">
              {availableSpaces.map((space) => {
                const isSelected = activeSpace === space;
                const spacePositions = getPositionsForSpace(store.tipoEspacioId, space, store);
                const spaceCampaignCount = spacePositions.filter((p) =>
                  Boolean(getSwapAssignmentForPosition(p))
                ).length;

                return (
                  <button
                    key={space}
                    type="button"
                    onClick={() => {
                      setActiveSpace(space);
                      const newPositions = getPositionsForSpace(store.tipoEspacioId, space, store);
                      const firstCamp = newPositions.find((p) =>
                        Boolean(getSwapAssignmentForPosition(p))
                      );
                      if (firstCamp) setSelectedPos(firstCamp);
                      else if (newPositions.length > 0) setSelectedPos(newPositions[0]);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                      isSelected
                        ? 'bg-[#104a60] text-white shadow-xs ring-2 ring-[#009ca6]/40'
                        : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                    }`}
                  >
                    <Layers
                      className={`w-3.5 h-3.5 ${isSelected ? 'text-[#00c4cc]' : 'text-slate-400'}`}
                    />
                    <span>{space}</span>
                    {spaceCampaignCount > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                          isSelected ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {spaceCampaignCount} Swap
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Leyenda de colores de campaña */}
          {showLegend && (
            <div className="bg-[#104a60]/10 border-b border-[#009ca6]/20 px-4 py-2 flex flex-wrap items-center justify-around text-xs font-bold text-slate-700 gap-2">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-600 ring-2 ring-rose-400 animate-pulse" />
                <span>Pendiente de Instalar</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>Instalado OK (Sin Incidencias)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span>Con Incidencia</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-3 h-3 rounded-full bg-slate-400 opacity-50" />
                <span>Posición Atenuada (No interviene en campaña)</span>
              </span>
            </div>
          )}

          {/* Cuerpo Principal 70% Mapa 3D / 30% Inspector */}
          <div
            className="flex-1 lg:grid lg:grid-cols-12 flex flex-col overflow-y-auto lg:overflow-hidden transition-colors duration-300"
            style={{ backgroundColor: containerBgColor }}
          >
            {/* Columna Visual: Render 3D de la Mesa con Pines Resaltados vs Atenuados */}
            <div
              className="lg:col-span-7 xl:col-span-8 shrink-0 w-full relative flex flex-col justify-center items-center min-h-[240px] xs:min-h-[290px] sm:min-h-[400px] lg:min-h-full lg:h-[calc(100vh-140px)] overflow-hidden p-0"
              style={{ backgroundColor: containerBgColor }}
            >
              {viewMode === 'visual' ? (
                <div
                  className="relative w-full lg:h-full flex items-center justify-center overflow-hidden"
                  style={{ backgroundColor: containerBgColor }}
                >
                  {/* Selector Cara 1 / Cara 2 en mesas unificadas */}
                  {hasMultipleCaras && (
                    <div className="absolute top-3 left-3 z-30 flex items-center bg-slate-950/85 backdrop-blur-md p-1 rounded-2xl border border-white/10 shadow-xl pointer-events-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCara('Cara 1');
                          const firstC1 = cara1Positions[0];
                          if (firstC1 && selectedPos?.cara !== 'Cara 1') {
                            setSelectedPos(firstC1);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                          selectedCara === 'Cara 1'
                            ? 'bg-gradient-to-r from-[#009ca6] to-[#00b4bf] text-white shadow-md'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>Cara 1</span>
                        <span className="text-[10px] opacity-80 font-mono">
                          (P{String(cara1Positions[0]?.posicionNumero || 1).padStart(2, '0')}-P{String(cara1Positions[cara1Positions.length - 1]?.posicionNumero || 12).padStart(2, '0')})
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCara('Cara 2');
                          const firstC2 = cara2Positions[0];
                          if (firstC2 && selectedPos?.cara !== 'Cara 2') {
                            setSelectedPos(firstC2);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                          selectedCara === 'Cara 2'
                            ? 'bg-gradient-to-r from-[#009ca6] to-[#00b4bf] text-white shadow-md'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>Cara 2</span>
                        <span className="text-[10px] opacity-80 font-mono">
                          (P{String(cara2Positions[0]?.posicionNumero || 13).padStart(2, '0')}-P{String(cara2Positions[cara2Positions.length - 1]?.posicionNumero || 22).padStart(2, '0')})
                        </span>
                      </button>
                    </div>
                  )}

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

                      {/* Pines en el Mapa 3D: Resaltados para campaña activa, atenuados para los demás */}
                      <div className="absolute inset-0 pointer-events-none">
                        {visiblePositions.map((pos, idx) => {
                          const assignment = getSwapAssignmentForPosition(pos);
                          const isCampaignPos = Boolean(assignment);
                          const swapState = swapStates[pos.id];
                          const isDoneOk = swapState?.estadoSwap === 'OK';
                          const isDoneInc = swapState?.estadoSwap === 'Incidencia';
                          const isSel = selectedPos?.id === pos.id;

                          const hasCoords =
                            typeof pos.pinX === 'number' && typeof pos.pinY === 'number';
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
                                left: `${((idx + 0.5) / visiblePositions.length) * 100}%`,
                                top: '52%',
                                transform: 'translate(-50%, -50%)',
                                pointerEvents: 'auto'
                              };

                          // Estilo diferenciado según campaña vs no interviene
                          let pinClasses = '';
                          if (!isCampaignPos) {
                            pinClasses =
                              'bg-slate-700/60 text-slate-300 border-slate-400/50 opacity-35 saturate-0 hover:opacity-65';
                          } else if (isDoneOk) {
                            pinClasses =
                              'bg-emerald-500 text-white border-white ring-4 ring-emerald-400/60 shadow-lg shadow-emerald-500/40';
                          } else if (isDoneInc) {
                            pinClasses =
                              'bg-amber-500 text-white border-white ring-4 ring-amber-400/60 shadow-lg shadow-amber-500/40';
                          } else {
                            // Antes de ser sustituido: rojo/alerta con halo pulsante
                            pinClasses =
                              'bg-rose-600 text-white border-white ring-4 ring-rose-400/80 shadow-xl shadow-rose-600/60 animate-pulse';
                          }

                          return (
                            <div
                              key={pos.id}
                              style={inlineStyle}
                              className={`flex flex-col items-center pointer-events-auto group ${
                                isCampaignPos ? 'z-30' : 'z-10'
                              }`}
                            >
                              <div
                                className={`w-[2px] h-2.5 sm:h-3.5 transition-all ${
                                  isCampaignPos
                                    ? isDoneOk
                                      ? 'bg-emerald-400'
                                      : 'bg-rose-500'
                                    : 'bg-white/30'
                                }`}
                              />

                              <div className="relative flex items-center justify-center">
                                {/* Halo pulsante exterior para posiciones de campaña pendientes */}
                                {isCampaignPos && !isDoneOk && !isDoneInc && (
                                  <span className="absolute -inset-1.5 rounded-full bg-rose-500/60 animate-ping pointer-events-none" />
                                )}

                                <button
                                  type="button"
                                  onClick={() => setSelectedPos(pos)}
                                  className={`relative rounded-full font-black flex items-center justify-center transition-all cursor-pointer border-2 ${pinClasses} ${
                                    isSel
                                      ? 'w-8 h-8 sm:w-10 sm:h-10 scale-120 ring-4 ring-[#00c4cc] z-40'
                                      : isCampaignPos
                                        ? 'w-6 h-6 sm:w-8 sm:h-8 hover:scale-115'
                                        : 'w-5 h-5 sm:w-6 sm:h-6'
                                  }`}
                                  title={
                                    assignment
                                      ? `Puesto ${pos.posicionNumero}: Instalar ${assignment.modeloEntrante}`
                                      : `Puesto ${pos.posicionNumero}: ${pos.modeloOficial} (No interviene en campaña)`
                                  }
                                >
                                  {isCampaignPos && isDoneOk ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                                  ) : isCampaignPos && isDoneInc ? (
                                    <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                                  ) : (
                                    <span className="text-[9px] sm:text-[11px] font-black">
                                      {String(pos.posicionNumero).padStart(2, '0')}
                                    </span>
                                  )}

                                  {/* Tooltip flotante en PC */}
                                  <div className="absolute top-full mt-1.5 hidden lg:group-hover:block bg-slate-950/95 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap pointer-events-none shadow-xl border border-white/20 z-50">
                                    {assignment ? (
                                      <span>
                                        P{String(pos.posicionNumero).padStart(2, '0')} · Instalar:{' '}
                                        <span className="text-teal-300">
                                          {assignment.modeloEntrante}
                                        </span>
                                      </span>
                                    ) : (
                                      <span className="text-slate-400">
                                        P{String(pos.posicionNumero).padStart(2, '0')} ·{' '}
                                        {pos.modeloOficial} (Sin cambio)
                                      </span>
                                    )}
                                  </div>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Controles de Zoom */}
                  <div className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-md border border-white/10 rounded-xl p-1 flex items-center gap-1 z-20 text-white text-xs shadow-lg">
                    <button
                      type="button"
                      onClick={() => setZoomLevel((prev) => Math.max(0.8, prev - 0.1))}
                      className="p-1.5 hover:bg-white/20 rounded-lg cursor-pointer"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="font-mono text-[10px] px-1">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setZoomLevel((prev) => Math.min(1.5, prev + 0.1))}
                      className="p-1.5 hover:bg-white/20 rounded-lg cursor-pointer"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomLevel(1)}
                      className="p-1.5 hover:bg-white/20 rounded-lg cursor-pointer text-teal-300"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Vista "Lista de Dispositivos" */
                <div className="w-full h-full bg-slate-900 p-4 sm:p-6 overflow-y-auto space-y-2">
                  <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider flex items-center justify-between">
                    <span>Terminales en {activeSpace} ({positions.length})</span>
                    <span className="text-teal-400">
                      {positions.filter((p) => Boolean(getSwapAssignmentForPosition(p))).length}{' '}
                      asignados al lanzamiento
                    </span>
                  </div>
                  {positions.map((p) => {
                    const asg = getSwapAssignmentForPosition(p);
                    const swState = swapStates[p.id];
                    const isOk = swState?.estadoSwap === 'OK';
                    const isInc = swState?.estadoSwap === 'Incidencia';
                    const isSel = selectedPos?.id === p.id;

                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPos(p)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          !asg
                            ? 'bg-white/5 border-white/5 opacity-45 text-slate-400'
                            : isSel
                              ? 'bg-white/15 border-[#009ca6] ring-2 ring-[#009ca6]/40 text-white'
                              : 'bg-white/10 border-rose-500/30 hover:bg-white/15 text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                              !asg
                                ? 'bg-slate-800 text-slate-500'
                                : isOk
                                  ? 'bg-emerald-500 text-white'
                                  : isInc
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-rose-600 text-white animate-pulse'
                            }`}
                          >
                            {String(p.posicionNumero).padStart(2, '0')}
                          </span>
                          <div className="min-w-0">
                            {asg ? (
                              <>
                                <p className="text-xs sm:text-sm font-black truncate text-teal-300">
                                  {asg.modeloEntrante}
                                </p>
                                <p className="text-[10px] text-slate-300">
                                  Planograma Nuevo •{' '}
                                  <strong className="text-white">
                                    {asg.esDummyEntrante ? 'Maqueta (DUMMY)' : 'LDU (Real)'}
                                  </strong>
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="text-xs sm:text-sm font-bold truncate">
                                  {p.modeloOficial}
                                </p>
                                <p className="text-[10px] text-slate-500">
                                  No interviene en esta campaña ({p.esDummy ? 'Maqueta' : 'LDU'})
                                </p>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 ml-2">
                          {!asg ? (
                            <span className="text-[10px] font-semibold text-slate-500">
                              Sin cambio
                            </span>
                          ) : isOk ? (
                            <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Instalado OK
                            </span>
                          ) : isInc ? (
                            <span className="text-[10px] font-black text-amber-400 flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" /> Con Incidencia
                            </span>
                          ) : (
                            <span className="text-[10px] font-black text-rose-400 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> Pendiente Instalar
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Columna Lateral: Inspector de Posición de Campaña */}
            <div className="lg:col-span-5 xl:col-span-4 p-4 sm:p-6 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col justify-between space-y-4">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Puestos en {activeSpace}
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                    {positions.filter((p) => Boolean(getSwapAssignmentForPosition(p))).length}{' '}
                    puestos en lanzamiento
                  </span>
                </div>

                {/* Barra táctil rápida de puestos */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {positions.map((p, idx) => {
                    const asg = getSwapAssignmentForPosition(p);
                    const swState = swapStates[p.id];
                    const isOk = swState?.estadoSwap === 'OK';
                    const isInc = swState?.estadoSwap === 'Incidencia';
                    const isSel = selectedPos?.id === p.id;

                    let badgeClass = 'bg-slate-100 text-slate-400 border-slate-200 opacity-50';
                    if (asg) {
                      if (isOk)
                        badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-300 font-black';
                      else if (isInc)
                        badgeClass = 'bg-amber-50 text-amber-800 border-amber-300 font-black';
                      else badgeClass = 'bg-rose-50 text-rose-700 border-rose-300 font-black';
                    }

                    const isCara1 = positions.length === 12;
                    const showSectorSeparator = isCara1 && (idx === 6 || idx === 9);

                    return (
                      <React.Fragment key={p.id}>
                        {showSectorSeparator && (
                          <div className="h-5 w-[1px] bg-slate-300 mx-0.5 shrink-0" />
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedPos(p)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs shrink-0 transition-all border cursor-pointer flex items-center gap-1 ${badgeClass} ${
                            isSel ? 'ring-2 ring-[#009ca6] scale-105 opacity-100 shadow-xs' : ''
                          }`}
                        >
                          <span>P{String(p.posicionNumero).padStart(2, '0')}</span>
                          {asg && (
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isOk
                                  ? 'bg-emerald-500'
                                  : isInc
                                    ? 'bg-amber-500'
                                    : 'bg-rose-600 animate-ping'
                              }`}
                            />
                          )}
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Tarjeta del puesto seleccionado */}
                {selectedPos && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                    {selectedPosAssignment ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-black text-white bg-rose-600 px-2 py-0.5 rounded-lg">
                            Puesto {String(selectedPos.posicionNumero).padStart(2, '0')}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#ff6900]">
                            {ACTIVE_IMPLANTATION_CAMPAIGN}
                          </span>
                        </div>

                        {/* Resumen limpio del dispositivo a instalar en el Planograma Nuevo */}
                        <div className="space-y-2 pt-1">
                          <div className="p-3 bg-teal-50/80 border border-teal-200 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <PackagePlus className="w-5 h-5 text-[#009ca6] shrink-0" />
                              <div>
                                <span className="text-[10px] font-black uppercase text-[#009ca6] block">
                                  Dispositivo a Instalar
                                </span>
                                <span className="text-xs sm:text-sm font-black text-slate-900">
                                  {selectedPosAssignment.modeloEntrante}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Estado actual del puesto */}
                        <div className="pt-1">
                          {selectedPosSwapState?.estadoSwap === 'OK' ? (
                            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>Instalación completada OK</span>
                            </div>
                          ) : selectedPosSwapState?.estadoSwap === 'Incidencia' ? (
                            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>
                                Incidencia: {selectedPosSwapState.motivoIncidencia}
                              </span>
                            </div>
                          ) : (
                            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                              <Clock className="w-4 h-4 text-rose-600 shrink-0" />
                              <span>Pendiente de instalar dispositivo</span>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (onActiveSpaceChange) onActiveSpaceChange(activeSpace);
                            if (onSelectPositionIdChange) onSelectPositionIdChange(selectedPos.id);
                            onSelectSwapPosition(selectedPos, selectedPosAssignment);
                          }}
                          className="w-full py-3.5 bg-gradient-to-r from-[#009ca6] to-[#00b4bf] hover:from-[#008992] hover:to-[#00a3ad] active:scale-[0.98] text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-[#009ca6]/20 transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <PackagePlus className="w-4 h-4" />
                          <span>
                            {selectedPosSwapState
                              ? `Editar Puesto ${String(selectedPos.posicionNumero).padStart(2, '0')}`
                              : `Instalar Puesto ${String(selectedPos.posicionNumero).padStart(2, '0')}`}
                          </span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      /* Puesto atenuado que no interviene en la campaña */
                      <div className="space-y-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
                            Puesto {String(selectedPos.posicionNumero).padStart(2, '0')}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            Posición Atenuada
                          </span>
                        </div>
                        <h3 className="text-sm font-black text-slate-800">
                          {selectedPos.modeloOficial}
                        </h3>
                        <p className="text-slate-500 leading-relaxed">
                          Esta posición <strong>no interviene</strong> en la campaña activa{' '}
                          <strong>"{ACTIVE_IMPLANTATION_CAMPAIGN}"</strong>. El dispositivo actual
                          permanece expuesto sin cambios.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Pie del inspector lateral: Ir a POSM o Finalizar Auditoría */}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <button
                  type="button"
                  onClick={() => setSubModule('visual_plv')}
                  className="w-full py-2.5 bg-orange-50 hover:bg-orange-100 text-[#ff6900] border border-orange-200 font-black text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>
                    Ir a 3. POSM ({completedVisualsCount}/{totalVisualsCount})
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsSummaryModalOpen(true)}
                  className="w-full py-3 bg-[#104a60] hover:bg-[#093545] text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-[#00c4cc]" />
                  <span>Finalizar Auditoría</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* =====================================================================
          SUBSECCIÓN 2: SUBMÓDULO "MATERIAL A RETIRAR" (CHECK-OUT DE MODELOS OBSOLETOS)
          ===================================================================== */}
      {subModule === 'return_devices' && (
        <div className="flex-1 bg-slate-100/70 p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-5">
            {/* Banner superior con resumen (sin botón de marcado masivo para obligar verificación individual) */}
            <div className="bg-gradient-to-r from-[#072431] via-[#104a60] to-[#0a3343] text-white p-5 sm:p-6 rounded-3xl shadow-xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    Check-Out de Material
                  </span>
                  <span className="text-xs text-slate-300 font-semibold">
                    Campaña: {ACTIVE_IMPLANTATION_CAMPAIGN}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  Dispositivos a Retirar y Devolver ({completedReturnsCount} de {totalReturnsCount} verificados)
                </h2>
                <p className="text-xs sm:text-sm text-slate-200/90 font-medium max-w-3xl">
                  Verifica uno a uno el <strong>IMEI y modelo</strong> de cada dispositivo que retiras de la mesa. Indica si <strong>Sí es correcto</strong> para avanzar o <strong>No coincide</strong> para volver a escanearlo con la cámara o introducirlo manualmente.
                </p>
              </div>
            </div>

            {/* Listado de las tarjetas de dispositivos a devolver */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {returnDevices.map((dev) => {
                const isRetirado = dev.estadoRetirada === 'Retirado';
                const isIncidencia = dev.estadoRetirada === 'Incidencia';
                const isEditingDiscrepancy = Boolean(editingImeiDiscrepancy[dev.id]);
                const isIncidentDrawerOpen = Boolean(openReturnIncidentDrawer[dev.id]);
                const isWatchDevice =
                  dev.categoria === 'Wearable' || /watch|reloj|band/i.test(dev.modeloSaliente);

                const returnIncidentOptions: string[] = [
                  'Terminal ausente / Posible robo',
                  'Terminal bloqueado / Sin encendido (Imei ilegible)',
                  'Daño físico estético o funcional',
                  'Alarma dañada',
                  ...(isWatchDevice ? ['Correa robada o rota'] : [])
                ];

                return (
                  <div
                    key={dev.id}
                    className={`p-4 sm:p-5 rounded-3xl border transition-all shadow-sm flex flex-col justify-between gap-4 ${
                      isRetirado
                        ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-400/20'
                        : isIncidencia
                        ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Cabecera de la ficha */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-black px-2.5 py-1 rounded-xl bg-slate-900 text-white">
                          Puesto {dev.posicionAnterior} · {dev.mesaId}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                            <button
                              type="button"
                              onClick={() => handleToggleReturnDummy(dev.id, false)}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition cursor-pointer ${
                                !dev.esDummy
                                  ? 'bg-[#009ca6] text-white shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              LDU
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleReturnDummy(dev.id, true)}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition cursor-pointer ${
                                dev.esDummy
                                  ? 'bg-orange-600 text-white shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              Maqueta
                            </button>
                          </div>
                          {isRetirado && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white flex items-center gap-1 shadow-xs">
                              <Check className="w-3 h-3" /> Verificado
                            </span>
                          )}
                          {isIncidencia && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-600 text-white flex items-center gap-1 shadow-xs">
                              <AlertTriangle className="w-3 h-3" /> Incidencia
                            </span>
                          )}
                          {!isRetirado && !isIncidencia && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-200 text-slate-700">
                              Pendiente verificar
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Modelo y motivo */}
                      <div>
                        <h3 className="text-base font-black text-slate-900">
                          {dev.modeloSaliente}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {dev.motivoRetirada} ➔ <span className="font-bold text-slate-700">{dev.sustituidoPor}</span>
                        </p>
                      </div>

                      {/* Bloque de Verificación de IMEI / Serial del Dispositivo a Retirar */}
                      {!dev.esDummy ? (
                        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-[#009ca6] shrink-0" />
                              IMEI registrado a verificar
                            </span>
                            {isRetirado && !isEditingDiscrepancy && (
                              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                IMEI Confirmado ✓
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                            <span className="font-mono text-xs sm:text-sm font-black text-slate-800 tracking-wide select-all">
                              {dev.imeiMemorizado || 'Sin IMEI previo registrado'}
                            </span>
                          </div>

                          {/* Pregunta obligatoria: ¿Es correcto el dispositivo e IMEI que estás eliminando? */}
                          <div className="space-y-2 pt-1">
                            <span className="block text-[11px] font-black text-slate-800">
                              ¿Es correcto el dispositivo e IMEI que estás retirando?
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingImeiDiscrepancy((prev) => ({ ...prev, [dev.id]: false }));
                                  handleConfirmReturn(dev.id);
                                }}
                                className={`py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                                  isRetirado && !isEditingDiscrepancy
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300'
                                }`}
                              >
                                <Check className="w-4 h-4 shrink-0" />
                                <span>Sí, es correcto</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setEditingImeiDiscrepancy((prev) => ({ ...prev, [dev.id]: true }));
                                }}
                                className={`py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                                  isEditingDiscrepancy
                                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                                    : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                                }`}
                              >
                                <Camera className="w-3.5 h-3.5 shrink-0" />
                                <span>No, escanear / manual</span>
                              </button>
                            </div>
                          </div>

                          {/* Si elige "No", desplegar escáner por cámara + entrada manual */}
                          {isEditingDiscrepancy && (
                            <div className="p-3 rounded-2xl bg-amber-50/90 border border-amber-300 space-y-2.5 animate-fadeIn">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                                  <Camera className="w-3.5 h-3.5 text-amber-700" />
                                  <span>Escanear con cámara o escribir manualmente</span>
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => setReturnScannerTargetId(dev.id)}
                                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#009ca6] to-[#00b4bf] hover:opacity-95 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                              >
                                <Camera className="w-4 h-4" />
                                <span>Escanear IMEI / S/N con la Cámara</span>
                              </button>

                              <div className="space-y-1.5">
                                <label className="block text-[10px] font-bold text-amber-900">
                                  ¿No funciona con la cámara? Introdúcelo manualmente:
                                </label>
                                <div className="flex items-center gap-2">
                                  <div className="relative flex-1">
                                    <input
                                      type="text"
                                      value={dev.imeiMemorizado || ''}
                                      onChange={(e) => handleUpdateReturnImei(dev.id, e.target.value)}
                                      placeholder="Escribe el IMEI o N.º de Serie..."
                                      className="w-full bg-white text-slate-900 font-mono text-xs sm:text-sm font-bold px-3 py-2 rounded-xl border border-amber-400 focus:outline-none focus:border-[#009ca6] focus:ring-2 focus:ring-[#009ca6]/20 transition"
                                    />
                                    {dev.imeiMemorizado && (
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateReturnImei(dev.id, '')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                                        title="Limpiar IMEI"
                                      >
                                        <RotateCcw className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!dev.imeiMemorizado || !dev.imeiMemorizado.trim()) {
                                        alert('Por favor escanea o escribe el IMEI antes de confirmar, o marca la incidencia correspondiente.');
                                        return;
                                      }
                                      setEditingImeiDiscrepancy((prev) => ({ ...prev, [dev.id]: false }));
                                      handleConfirmReturn(dev.id);
                                    }}
                                    className="h-9 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1 shadow-xs transition shrink-0 cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Confirmar</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-2xl bg-orange-50/80 border border-orange-200 space-y-2.5 animate-fadeIn">
                          <div className="text-orange-950 text-xs font-bold flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
                            <span>Maqueta seleccionada (exenta de IMEI).</span>
                          </div>
                          <div className="flex items-center justify-between gap-2 pt-1">
                            <span className="text-[11px] font-black text-orange-950">
                              ¿Confirmas la retirada de esta maqueta?
                            </span>
                            <button
                              type="button"
                              onClick={() => handleConfirmReturn(dev.id)}
                              className={`py-2 px-3 rounded-xl font-black text-xs flex items-center gap-1.5 transition cursor-pointer ${
                                isRetirado
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{isRetirado ? 'Maqueta Verificada ✓' : 'Sí, confirmar retirada'}</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {isIncidencia && dev.motivoIncidencia && (
                        <div className="p-2.5 rounded-xl bg-amber-100/90 border border-amber-300 text-amber-950 text-xs font-bold flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700" />
                            <span>Incidencia: {dev.motivoIncidencia}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleIncidentReturn(dev.id, dev.motivoIncidencia || '')}
                            className="text-[10px] font-black text-amber-800 hover:text-amber-950 underline shrink-0 cursor-pointer"
                          >
                            Quitar
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Selector de incidencias predefinidas (disponible tanto en opción Sí como en No) */}
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <button
                        type="button"
                        onClick={() => toggleReturnIncidentDrawer(dev.id)}
                        className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-between transition cursor-pointer ${
                          isIncidencia
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-amber-100/80 hover:bg-amber-200/80 text-amber-900 border border-amber-200'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>
                            {isIncidencia
                              ? `Incidencia marcada: ${dev.motivoIncidencia}`
                              : 'Marcar incidencia al retirar'}
                          </span>
                        </span>
                        <span className="text-[10px] font-black uppercase">
                          {isIncidentDrawerOpen ? 'Ocultar ▲' : 'Seleccionar ▼'}
                        </span>
                      </button>

                      {isIncidentDrawerOpen && (
                        <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 animate-fadeIn">
                          <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500 px-1">
                            Selecciona la incidencia correspondiente:
                          </span>
                          {returnIncidentOptions.map((motivo) => {
                            const selected = isIncidencia && dev.motivoIncidencia === motivo;
                            return (
                              <button
                                key={motivo}
                                type="button"
                                onClick={() => handleIncidentReturn(dev.id, motivo)}
                                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                                  selected
                                    ? 'bg-amber-600 text-white shadow-xs'
                                    : 'bg-white hover:bg-amber-50 text-slate-800 border border-slate-200'
                                }`}
                              >
                                <span>{motivo}</span>
                                {selected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Botón inferior para avanzar a 2. Planograma Nuevo */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSubModule('swap_devices')}
                className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-[#009ca6] to-[#00b4bf] hover:brightness-110 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>
                  Ir a 2. Planograma Nuevo ({completedSwapsCount}/{totalSwapsCount})
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SUBSECCIÓN 3: SUBMÓDULO "POSM" (LONAS, PANTALLA HANSHOW, FALDÓN Y MERCH)
          ===================================================================== */}
      {subModule === 'visual_plv' && (
        <div className="flex-1 bg-slate-100/70 p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-5">
            {/* Selector de puestos/elementos POSM a intervenir */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {visualDefinitions.map((def, idx) => {
                const vState = visualStates[def.id];
                const isSelected = activeVisualDef?.id === def.id;
                const isOk = vState?.estadoVisual === 'OK';
                const isInc = vState?.estadoVisual === 'Incidencia';

                return (
                  <button
                    key={def.id}
                    type="button"
                    onClick={() => setActiveVisualId(def.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'bg-[#104a60] text-white border-[#009ca6] ring-2 ring-[#009ca6]/40 shadow-md'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-[#009ca6]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-white/15 text-teal-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        POSM 0{idx + 1} · {def.tipoMaterial}
                      </span>
                      {isOk ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white flex items-center gap-1">
                          <Check className="w-3 h-3" /> OK
                        </span>
                      ) : isInc ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Incidencia
                        </span>
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isSelected
                              ? 'bg-amber-400/20 text-amber-200'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          Pendiente
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm sm:text-base font-black">{def.nombreElemento}</h3>
                      <p
                        className={`text-[11px] mt-0.5 ${
                          isSelected ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {def.ubicacionEspacio}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Tarjeta de intervención del elemento POSM seleccionado */}
            {activeVisualDef && (() => {
              const curVState = getOrCreateVisualState(activeVisualDef);
              const isHanshow = activeVisualDef.guiaVisualTipo === 'hanshow_screen';
              const isFaldon = activeVisualDef.guiaVisualTipo === 'faldon_mesa';
              const isLuminoso = activeVisualDef.guiaVisualTipo === 'luminoso';
              const isCubrecestas = activeVisualDef.guiaVisualTipo === 'cubrecestas';

              return (
                <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
                  {/* Guía visual oficial del elemento POSM */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center bg-gradient-to-br from-[#072431] via-[#104a60] to-[#0d3b4c] text-white rounded-2xl p-5">
                    <div className="lg:col-span-5 space-y-2.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#ff6900] text-white">
                        Guía Visual POSM
                      </span>
                      <h2 className="text-lg sm:text-xl font-black text-white">
                        {activeVisualDef.nombreElemento}
                      </h2>
                      <p className="text-xs text-teal-200 font-semibold">
                        {activeVisualDef.campanaOficial}
                      </p>

                      {isCubrecestas && (
                        <div className="bg-[#ff6900]/25 border-2 border-[#ff6900] rounded-xl p-3 space-y-1 shadow-lg">
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
                            ⚠ ESPECIFICACIÓN DE UBICACIÓN OBLIGATORIA
                          </span>
                          <p className="text-xs sm:text-sm font-black text-white leading-snug">
                            El cubrecestas de Xiaomi 18 Pro se coloca obligatoriamente en la{' '}
                            <span className="underline decoration-[#ff6900] decoration-2 text-amber-200">
                              SEGUNDA POSICIÓN (2.ª posición)
                            </span>
                            .
                          </p>
                        </div>
                      )}

                      {isHanshow ? (
                        <div className="bg-black/30 p-3.5 rounded-xl border border-teal-400/30 space-y-1.5 text-xs">
                          <span className="text-[10px] font-black uppercase tracking-wider text-teal-300 block">
                            Configuración Punto de Acceso Móvil (Hotspot)
                          </span>
                          <div className="flex items-center justify-between bg-white/10 px-2.5 py-1.5 rounded-lg">
                            <span className="text-slate-300">Nombre Red (SSID):</span>
                            <strong className="font-mono text-amber-300 text-sm">Hanshow</strong>
                          </div>
                          <div className="flex items-center justify-between bg-white/10 px-2.5 py-1.5 rounded-lg">
                            <span className="text-slate-300">Contraseña:</span>
                            <strong className="font-mono text-teal-300 text-sm">12345678</strong>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs bg-black/25 px-3 py-2 rounded-xl border border-white/10">
                          <Ruler className="w-4 h-4 text-[#00c4cc] shrink-0" />
                          <span>
                            Referencia: <strong>{activeVisualDef.medidasOficiales}</strong>
                          </span>
                        </div>
                      )}

                      <p className="text-xs sm:text-sm text-white font-semibold bg-white/10 p-3 rounded-xl border border-white/15 leading-relaxed">
                        {activeVisualDef.instruccionesFijacion}
                      </p>
                    </div>

                    {/* Visualización derecha según tipo de POSM */}
                    <div className="lg:col-span-7">
                      {isCubrecestas && activeVisualDef.imagenReferenciaDespues ? (
                        /* GUÍA OFICIAL AMPLIABLE PARA CUBRECESTAS XIAOMI 18 PRO (2.ª POSICIÓN) */
                        <div className="rounded-2xl overflow-hidden border-2 border-teal-400/50 bg-slate-950/90 p-4 shadow-2xl space-y-3">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="text-[10px] font-black uppercase tracking-wider text-teal-300">
                              Referencia Oficial · Cubrecestas Xiaomi 18 Pro
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-[#ff6900] text-white text-[10px] font-black uppercase shadow-sm">
                              Colocar en 2.ª Posición
                            </span>
                          </div>
                          <div
                            onClick={() =>
                              setPosmPreviewModal({
                                src: activeVisualDef.imagenReferenciaDespues!,
                                title: 'Cubrecestas · Xiaomi 18 Pro (Colocar en 2.ª Posición)',
                                subtitle: 'Especificación oficial: Colocación obligatoria en la segunda posición'
                              })
                            }
                            className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-xl overflow-hidden bg-black border-2 border-emerald-400/60 cursor-pointer group"
                          >
                            <img
                              src={activeVisualDef.imagenReferenciaDespues}
                              alt="Cubrecestas Xiaomi 18 Pro"
                              className="w-full h-full object-contain bg-slate-950 group-hover:scale-103 transition-transform"
                            />
                            <div className="absolute top-2 left-2 px-3 py-1 rounded-lg bg-[#ff6900] text-white text-[10px] sm:text-xs font-black border border-white/30 shadow-lg">
                              📍 UBICACIÓN: 2.ª POSICIÓN
                            </div>
                            <span className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-xs text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/20 shadow-md">
                              <ZoomIn className="w-3.5 h-3.5 text-teal-300" /> Ampliar imagen
                            </span>
                          </div>
                          <p className="text-[11px] text-teal-200/90 font-semibold text-center flex items-center justify-center gap-1.5">
                            <ZoomIn className="w-3.5 h-3.5 text-teal-300" />
                            <span>Pulsa sobre la imagen del cubrecestas para verla ampliada en grande</span>
                          </p>
                        </div>
                      ) : activeVisualDef.imagenReferenciaAntes &&
                      activeVisualDef.imagenReferenciaDespues ? (
                        /* FORMATO ANTES ➔ DESPUÉS CON FLECHA GUÍA (LONA DE WALL Y PANTALLA HANSHOW) */
                        <div className="rounded-2xl overflow-hidden border-2 border-teal-400/50 bg-slate-950/90 p-4 shadow-2xl">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-black uppercase tracking-wider text-teal-300">
                              {isHanshow
                                ? 'Guía Visual de Cambio en Pantalla Hanshow'
                                : isLuminoso
                                ? 'Guía Visual de Cambio en Luminoso (Xiaomi 17T ➔ Xiaomi 18 Pro)'
                                : activeVisualDef.guiaVisualTipo === 'top_table'
                                ? 'Guía Visual de Cambio en Top Table'
                                : 'Guía Visual de Cambio en Lona (Xiaomi 17 Ultra ➔ Xiaomi 18 Pro)'}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-[#ff6900] text-white text-[9px] font-black uppercase">
                              Antes ➔ Después
                            </span>
                          </div>

                          <div className="grid grid-cols-11 gap-2 sm:gap-3 items-center">
                            {/* Foto Antes (Pulsa para ampliar) */}
                            <button
                              type="button"
                              onClick={() =>
                                setPosmPreviewModal({
                                  src: activeVisualDef.imagenReferenciaAntes!,
                                  title: 'ANTES (Retirar / Sustituir)',
                                  subtitle: activeVisualDef.guiaVisualTipo === 'top_table'
                                    ? 'Top Table Xiaomi 17 Ultra'
                                    : isLuminoso
                                    ? 'Luminoso Xiaomi 17T'
                                    : isHanshow
                                    ? 'Redmi Note 17 Series'
                                    : 'Lona Xiaomi 17 Ultra'
                                })
                              }
                              className="col-span-5 bg-slate-900 hover:bg-slate-800/90 rounded-xl p-2 border border-rose-500/40 flex flex-col items-center cursor-pointer transition group text-left"
                            >
                              <span className="text-[10px] font-black uppercase text-rose-400 mb-1.5">
                                ANTES (Retirar)
                              </span>
                              <div
                                className={`relative w-full ${
                                  isHanshow
                                    ? 'aspect-[3/4]'
                                    : isLuminoso
                                    ? 'aspect-[16/10] bg-slate-950'
                                    : 'aspect-[16/10]'
                                } rounded-lg overflow-hidden bg-black border border-white/10`}
                              >
                                <img
                                  src={activeVisualDef.imagenReferenciaAntes}
                                  alt="Antes"
                                  className={`w-full h-full ${isLuminoso ? 'object-contain' : 'object-cover'} group-hover:scale-105 transition-transform`}
                                />
                                <span className="absolute bottom-1.5 right-1.5 bg-black/75 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/20">
                                  <ZoomIn className="w-3 h-3 text-teal-300" /> Ampliar
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-300 font-bold mt-1.5 text-center">
                                {activeVisualDef.guiaVisualTipo === 'top_table'
                                  ? 'Top Table Xiaomi 17 Ultra'
                                  : isLuminoso
                                  ? 'Luminoso Xiaomi 17T'
                                  : isHanshow
                                  ? 'Redmi Note 17 Series'
                                  : 'Lona Xiaomi 17 Ultra'}
                              </span>
                            </button>

                            {/* Flecha central guía */}
                            <div className="col-span-1 flex flex-col items-center justify-center">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-[#ff6900] to-[#009ca6] text-white flex items-center justify-center shadow-lg ring-2 ring-white/30 animate-pulse">
                                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
                              </div>
                            </div>

                            {/* Foto Después (Pulsa para ampliar) */}
                            <button
                              type="button"
                              onClick={() =>
                                setPosmPreviewModal({
                                  src: activeVisualDef.imagenReferenciaDespues!,
                                  title: 'AHORA (Nuevo Instalado)',
                                  subtitle: activeVisualDef.guiaVisualTipo === 'top_table'
                                    ? 'Top Table Xiaomi 18 Series'
                                    : isLuminoso
                                    ? 'Luminoso Xiaomi 18 Pro'
                                    : isHanshow
                                    ? 'Xiaomi 18 Pro & Pro Max'
                                    : 'Lona Xiaomi 18 Pro'
                                })
                              }
                              className="col-span-5 bg-slate-900 hover:bg-slate-800/90 rounded-xl p-2 border-2 border-emerald-400/80 flex flex-col items-center shadow-lg cursor-pointer transition group text-left"
                            >
                              <span className="text-[10px] font-black uppercase text-emerald-400 mb-1.5">
                                AHORA (Nuevo)
                              </span>
                              <div
                                className={`relative w-full ${
                                  isHanshow
                                    ? 'aspect-[3/4]'
                                    : isLuminoso
                                    ? 'aspect-[16/10] bg-slate-950'
                                    : 'aspect-[16/10]'
                                } rounded-lg overflow-hidden bg-black border border-white/10`}
                              >
                                <img
                                  src={activeVisualDef.imagenReferenciaDespues}
                                  alt="Después"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                                <span className="absolute bottom-1.5 right-1.5 bg-black/75 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/20">
                                  <ZoomIn className="w-3 h-3 text-emerald-300" /> Ampliar
                                </span>
                              </div>
                              <span className="text-[10px] text-emerald-300 font-black mt-1.5 text-center">
                                {activeVisualDef.guiaVisualTipo === 'top_table'
                                  ? 'Top Table Xiaomi 18 Series'
                                  : isLuminoso
                                  ? 'Luminoso Xiaomi 18 Pro'
                                  : isHanshow
                                  ? 'Xiaomi 18 Pro & Pro Max'
                                  : 'Lona Xiaomi 18 Pro'}
                              </span>
                            </button>
                          </div>
                          <p className="text-[11px] text-teal-200/90 font-semibold text-center mt-2.5 flex items-center justify-center gap-1.5">
                            <ZoomIn className="w-3.5 h-3.5 text-teal-300" />
                            <span>Pulsa sobre cualquiera de las imágenes para verla en grande</span>
                          </p>
                        </div>
                      ) : activeVisualDef.imagenReferenciaDespues && (activeVisualDef.guiaVisualTipo === 'columna' || activeVisualDef.guiaVisualTipo === 'top_table') ? (
                        /* GUÍA OFICIAL PARA COLUMNAS Y TOP TABLES */
                        <div className="rounded-2xl overflow-hidden border-2 border-teal-400/50 bg-slate-950/90 p-4 shadow-2xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-teal-300">
                              {activeVisualDef.guiaVisualTipo === 'columna'
                                ? `Referencia Oficial · ${activeVisualDef.nombreElemento}`
                                : `Referencia Oficial · ${activeVisualDef.nombreElemento}`}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-[#ff6900] text-white text-[9px] font-black uppercase">
                              {activeVisualDef.tipoMaterial}
                            </span>
                          </div>
                          <div
                            onClick={() =>
                              setPosmPreviewModal({
                                src: activeVisualDef.imagenReferenciaDespues!,
                                title: `${activeVisualDef.nombreElemento} — ${activeVisualDef.medidasOficiales}`,
                                subtitle: `Campaña: ${activeVisualDef.campanaOficial}`
                              })
                            }
                            className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-xl overflow-hidden bg-black border border-white/15 cursor-pointer group"
                          >
                            <img
                              src={activeVisualDef.imagenReferenciaDespues}
                              alt={activeVisualDef.nombreElemento}
                              className="w-full h-full object-contain sm:object-cover group-hover:scale-102 transition-transform"
                            />
                            <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold border border-white/20">
                              Cotas: <strong className="text-teal-300">{activeVisualDef.medidasOficiales}</strong>
                            </div>
                            <span className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/20">
                              <ZoomIn className="w-3.5 h-3.5 text-teal-300" /> Ampliar imagen de referencia
                            </span>
                          </div>
                          <p className="text-[11px] text-teal-200/90 font-semibold text-center flex items-center justify-center gap-1.5">
                            <ZoomIn className="w-3.5 h-3.5 text-teal-300" />
                            <span>Pulsa sobre la imagen para verla en pantalla completa</span>
                          </p>
                        </div>
                      ) : isFaldon && activeVisualDef.imagenReferenciaDespues ? (
                        /* EJEMPLO REAL 2: FALDÓN MESA 1 CARA 1 CON FLECHAS SEÑALANDO LA TIRA DEL FALDÓN */
                        <div className="rounded-2xl overflow-hidden border-2 border-teal-400/50 bg-slate-950/90 p-4 shadow-2xl space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-teal-300">
                              Imagen de Referencia · Faldón Lateral Mesa 1 Cara 1
                            </span>
                            <span className="px-2 py-0.5 rounded bg-[#ff6900] text-white text-[9px] font-black uppercase">
                              Indicador con Flechas
                            </span>
                          </div>
                          <div
                            onClick={() =>
                              setPosmPreviewModal({
                                src: activeVisualDef.imagenReferenciaDespues!,
                                title: 'Faldón Xiaomi 18 Pro Max · Mesa 1 Cara 1',
                                subtitle: 'Colocar en la tira frontal de la Mesa 1 Cara 1',
                                isFaldon: true
                              })
                            }
                            className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-black border border-white/15 cursor-pointer group"
                          >
                            <img
                              src={activeVisualDef.imagenReferenciaDespues}
                              alt="Faldón Xiaomi 18 Pro Max en Mesa 1 Cara 1"
                              className="w-full h-full object-cover group-hover:scale-102 transition-transform"
                            />

                            {/* Recuadro de resaltado sobre la tira del faldón (MAX POWER · Xiaomi 18 Pro Max · MAX POWER) */}
                            <div
                              className="absolute left-[7%] right-[7%] top-[53%] h-[10%] rounded-lg border-2 border-[#ff6900] bg-[#ff6900]/10 shadow-[0_0_20px_rgba(255,105,0,0.85)] pointer-events-none"
                            />

                            {/* Flechas superiores apuntando hacia abajo a la tira del faldón */}
                            <div className="absolute left-[18%] top-[36%] flex flex-col items-center pointer-events-none animate-bounce">
                              <span className="px-2 py-0.5 rounded bg-[#ff6900] text-white text-[9px] font-black uppercase shadow-md whitespace-nowrap">
                                Faldón
                              </span>
                              <svg className="w-6 h-7 text-[#ff6900] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M11 4h2v11l4.5-4.5 1.42 1.42L12 18.84l-6.92-6.92 1.42-1.42L11 15V4z" />
                              </svg>
                            </div>

                            <div className="absolute left-1/2 -translate-x-1/2 top-[34%] flex flex-col items-center pointer-events-none animate-bounce">
                              <span className="px-2.5 py-0.5 rounded bg-[#ff6900] text-white text-[10px] font-black uppercase shadow-lg border border-white/40 whitespace-nowrap">
                                ▼ Tira Faldón: "Xiaomi 18 Pro Max" ▼
                              </span>
                              <svg className="w-7 h-8 text-[#ff6900] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M11 4h2v11l4.5-4.5 1.42 1.42L12 18.84l-6.92-6.92 1.42-1.42L11 15V4z" />
                              </svg>
                            </div>

                            <div className="absolute right-[18%] top-[36%] flex flex-col items-center pointer-events-none animate-bounce">
                              <span className="px-2 py-0.5 rounded bg-[#ff6900] text-white text-[9px] font-black uppercase shadow-md whitespace-nowrap">
                                Faldón
                              </span>
                              <svg className="w-6 h-7 text-[#ff6900] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M11 4h2v11l4.5-4.5 1.42 1.42L12 18.84l-6.92-6.92 1.42-1.42L11 15V4z" />
                              </svg>
                            </div>

                            {/* Flecha inferior apuntando hacia arriba a la tira del faldón */}
                            <div className="absolute left-1/2 -translate-x-1/2 top-[65%] flex flex-col items-center pointer-events-none">
                              <svg className="w-7 h-7 text-[#00c4cc] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M13 20h-2V9l-4.5 4.5-1.42-1.42L12 5.16l6.92 6.92-1.42 1.42L13 9v11z" />
                              </svg>
                              <span className="px-2.5 py-0.5 rounded bg-slate-950/90 text-teal-300 text-[10px] font-black border border-teal-400/50 shadow-md whitespace-nowrap">
                                Colocar en esta tira frontal de la Mesa 1 Cara 1
                              </span>
                            </div>

                            <span className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/20">
                              <ZoomIn className="w-3.5 h-3.5 text-teal-300" /> Ampliar imagen
                            </span>
                          </div>
                          <p className="text-[11px] text-teal-200/90 font-semibold text-center flex items-center justify-center gap-1.5">
                            <ZoomIn className="w-3.5 h-3.5 text-teal-300" />
                            <span>Pulsa sobre la imagen para verla en grande</span>
                          </p>
                        </div>
                      ) : (
                        /* GUÍA OFICIAL POR DEFECTO */
                        <div className="relative rounded-2xl overflow-hidden border-2 border-teal-400/50 bg-gradient-to-r from-slate-950 via-slate-900 to-[#0f3142] p-5 shadow-2xl">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <img
                                src="./images/xiaomi_logo.png"
                                alt="Xiaomi"
                                className="w-6 h-6 rounded-md"
                              />
                              <span className="text-xs font-black tracking-wider uppercase text-white">
                                XIAOMI 18 PRO MAX · LEICA OPTICS
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[9px] font-black uppercase">
                              Leica Co-Engineered
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-3 items-center py-2">
                            <div className="col-span-2 space-y-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-[#ff6900] block">
                                NUEVA CARTELERÍA OFICIAL A COLOCAR
                              </span>
                              <h4 className="text-base sm:text-lg font-black text-white leading-tight">
                                {activeVisualDef.guiaVisualTipo === 'lona_mesa'
                                  ? 'Lona Backlight Textil: Xiaomi 18 Pro Max & 18 Pro'
                                  : activeVisualDef.guiaVisualTipo === 'cabecero_wall'
                                    ? 'Cabecero Mural: Ecosistema Xiaomi 18 Series'
                                    : 'Stands Metacrilato A4 + Glorificador Leica + 4 Cartelas'}
                              </h4>
                              <p className="text-[11px] text-slate-300">
                                Ubicación: {activeVisualDef.ubicacionEspacio}
                              </p>
                            </div>
                            <div className="flex flex-col items-center justify-center bg-white/10 rounded-xl p-3 border border-white/15 text-center">
                              <Smartphone className="w-9 h-9 text-teal-300 mb-1" />
                              <span className="text-[10px] font-black text-white">
                                Serie Xiaomi 18
                              </span>
                              <span className="text-[9px] text-teal-300">
                                {activeVisualDef.medidasOficiales.split('(')[0]}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {isCubrecestas ? (
                    /* FLUJO ESPECÍFICO PARA CUBRECESTAS XIAOMI 18 PRO (2.ª POSICIÓN) */
                    <div className="space-y-5">
                      {/* PASO 1 CUBRECESTAS: CONFIRMACIÓN DE COLOCACIÓN E INCIDENCIAS */}
                      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-white bg-[#ff6900] px-2.5 py-0.5 rounded-full inline-block">
                              REPORTE DE COLOCACIÓN · 2.ª POSICIÓN OBLIGATORIA
                            </span>
                            <h4 className="text-sm sm:text-base font-black text-slate-900 mt-2">
                              ¿Se ha colocado el cubrecestas de Xiaomi 18 Pro en la 2.ª posición?
                            </h4>
                            <p className="text-xs text-slate-600 mt-0.5">
                              Indica si se ha instalado en tienda. Si lo has colocado podrás avanzar directamente (y añadir una incidencia opcional si aplica); si no se ha colocado, deberás indicar obligatoriamente el motivo.
                            </p>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                const keepPlacedMotivo =
                                  curVState.fijacionYMedidaCorrecta === true &&
                                  curVState.motivoIncidencia &&
                                  CUBRECESTAS_PLACED_INCIDENT_MOTIVOS.includes(curVState.motivoIncidencia)
                                    ? curVState.motivoIncidencia
                                    : '';
                                onUpdateVisualState({
                                  ...curVState,
                                  fijacionYMedidaCorrecta: true,
                                  motivoIncidencia: keepPlacedMotivo,
                                  estadoVisual: keepPlacedMotivo ? 'Incidencia' : 'OK',
                                  fechaHora: new Date().toLocaleString('es-ES')
                                });
                              }}
                              className={`px-5 py-3 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 border transition cursor-pointer ${
                                curVState.fijacionYMedidaCorrecta === true
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                                  : 'bg-white text-slate-700 border-slate-300 hover:bg-emerald-50'
                              }`}
                            >
                              <Check className="w-4 h-4" />
                              <span>Sí, colocado</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const existingNotPlacedMotivo =
                                  curVState.fijacionYMedidaCorrecta === false &&
                                  curVState.motivoIncidencia &&
                                  CUBRECESTAS_NOT_PLACED_MOTIVOS.includes(curVState.motivoIncidencia)
                                    ? curVState.motivoIncidencia
                                    : '';
                                onUpdateVisualState({
                                  ...curVState,
                                  fijacionYMedidaCorrecta: false,
                                  motivoIncidencia: existingNotPlacedMotivo,
                                  estadoVisual: existingNotPlacedMotivo ? 'Incidencia' : 'Pendiente',
                                  fechaHora: new Date().toLocaleString('es-ES')
                                });
                              }}
                              className={`px-5 py-3 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 border transition cursor-pointer ${
                                curVState.fijacionYMedidaCorrecta === false
                                  ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                                  : 'bg-white text-slate-700 border-slate-300 hover:bg-rose-50'
                              }`}
                            >
                              <AlertTriangle className="w-4 h-4" />
                              <span>No colocado</span>
                            </button>
                          </div>
                        </div>

                        {/* OPCIÓN A: SÍ SE HA COLOCADO -> PERMITE AVANZAR Y PERMITE AÑADIR INCIDENCIA OPCIONAL */}
                        {curVState.fijacionYMedidaCorrecta === true && (
                          <div className="p-4 bg-emerald-50/80 border border-emerald-300 rounded-2xl space-y-3.5 animate-fadeIn">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                <span className="text-xs sm:text-sm font-black text-emerald-950">
                                  {curVState.motivoIncidencia
                                    ? 'Cubrecestas colocado con observación / incidencia registrada — Listo para avanzar'
                                    : 'Cubrecestas colocado correctamente en 2.ª posición — Listo para avanzar'}
                                </span>
                              </div>
                            </div>

                            <div className="bg-white border border-emerald-200 rounded-xl p-3.5 space-y-2.5">
                              <label className="block text-xs font-black text-slate-800 uppercase">
                                ¿Deseas registrar alguna incidencia sobre el cubrecestas colocado? (Opcional):
                              </label>
                              <select
                                value={curVState.motivoIncidencia || ''}
                                onChange={(e) => {
                                  const val = e.target.value as VisualIncidentMotivo | '';
                                  onUpdateVisualState({
                                    ...curVState,
                                    fijacionYMedidaCorrecta: true,
                                    motivoIncidencia: val,
                                    estadoVisual: val ? 'Incidencia' : 'OK',
                                    fechaHora: new Date().toLocaleString('es-ES')
                                  });
                                }}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              >
                                <option value="">
                                  ✓ Sin incidencia (Instalado en 2.ª posición y en perfecto estado)
                                </option>
                                {CUBRECESTAS_PLACED_INCIDENT_MOTIVOS.map((m) => (
                                  <option key={m} value={m}>
                                    ⚠ {m}
                                  </option>
                                ))}
                              </select>

                              <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                  Observaciones adicionales (opcional):
                                </label>
                                <textarea
                                  rows={2}
                                  value={curVState.notas || ''}
                                  onChange={(e) =>
                                    onUpdateVisualState({
                                      ...curVState,
                                      notas: e.target.value
                                    })
                                  }
                                  placeholder="Añade cualquier detalle sobre la ubicación o estado del cubrecestas instalado..."
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* OPCIÓN B: NO SE HA COLOCADO -> OBLIGA SÍ O SÍ A INDICAR EL MOTIVO */}
                        {curVState.fijacionYMedidaCorrecta === false && (
                          <div className="p-4 bg-rose-50/85 border-2 border-rose-300 rounded-2xl space-y-3.5 animate-fadeIn">
                            {!curVState.motivoIncidencia ? (
                              <div className="p-3 bg-rose-600 text-white rounded-xl flex items-center gap-2.5 shadow-sm">
                                <AlertTriangle className="w-5 h-5 shrink-0" />
                                <span className="text-xs font-black">
                                  Obligatorio: Selecciona el motivo por el cual no se ha podido colocar el cubrecestas para poder avanzar.
                                </span>
                              </div>
                            ) : (
                              <div className="p-3 bg-amber-100 border border-amber-300 text-amber-950 rounded-xl flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
                                <span className="text-xs font-black">
                                  Motivo de no colocación registrado: "{curVState.motivoIncidencia}" — Ya puedes avanzar.
                                </span>
                              </div>
                            )}

                            <div>
                              <label className="block text-xs font-black text-rose-950 uppercase mb-2">
                                Selecciona el motivo de no instalación (Obligatorio):
                              </label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {CUBRECESTAS_NOT_PLACED_MOTIVOS.map((m) => {
                                  const isSelectedMotivo = curVState.motivoIncidencia === m;
                                  return (
                                    <button
                                      key={m}
                                      type="button"
                                      onClick={() =>
                                        onUpdateVisualState({
                                          ...curVState,
                                          fijacionYMedidaCorrecta: false,
                                          motivoIncidencia: m,
                                          estadoVisual: 'Incidencia',
                                          fechaHora: new Date().toLocaleString('es-ES')
                                        })
                                      }
                                      className={`p-3 rounded-xl border text-left text-xs font-bold transition cursor-pointer flex items-start gap-2 ${
                                        isSelectedMotivo
                                          ? 'bg-rose-600 text-white border-rose-700 shadow-md'
                                          : 'bg-white text-slate-800 border-rose-200 hover:border-rose-400 hover:bg-rose-50/40'
                                      }`}
                                    >
                                      <div
                                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                                          isSelectedMotivo
                                            ? 'border-white bg-white text-rose-600'
                                            : 'border-slate-400'
                                        }`}
                                      >
                                        {isSelectedMotivo && <Check className="w-3 h-3 stroke-[3]" />}
                                      </div>
                                      <span className="leading-snug">{m}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-black text-rose-900 uppercase mb-1">
                                Observaciones / Detalles adicionales:
                              </label>
                              <textarea
                                rows={2}
                                value={curVState.notas || ''}
                                onChange={(e) =>
                                  onUpdateVisualState({
                                    ...curVState,
                                    notas: e.target.value
                                  })
                                }
                                placeholder="Detalla cualquier información relevante (n.º de incidencia logística, persona de contacto en tienda, etc.)..."
                                className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* EVIDENCIA FOTOGRÁFICA OPCIONAL DEL CUBRECESTAS */}
                      <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 flex flex-col justify-between">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full">
                              Evidencia Fotográfica · Cubrecestas en 2.ª Posición (Opcional)
                            </span>
                            <h4 className="text-sm sm:text-base font-black text-slate-900 mt-2">
                              Fotografía del Cubrecestas Xiaomi 18 Pro instalado
                            </h4>
                            <p className="text-xs text-slate-500">
                              Si has colocado el cubrecestas en la 2.ª posición, puedes adjuntar una fotografía de evidencia.
                            </p>
                          </div>
                        </div>

                        {curVState.fotoNuevaUrl ? (
                          <div className="space-y-2">
                            <div className="relative h-52 rounded-xl overflow-hidden border border-emerald-300 bg-black">
                              <img
                                src={curVState.fotoNuevaUrl}
                                alt="Evidencia Cubrecestas"
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-black shadow-sm">
                                ✓ Foto de Evidencia Adjuntada
                              </span>
                            </div>
                            <div className="flex justify-between pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setTempVisualPhoto(null);
                                  setVisualCameraTarget({
                                    elementoId: activeVisualDef.id,
                                    step: 'nueva'
                                  });
                                }}
                                className="text-xs font-bold text-[#009ca6] hover:underline cursor-pointer"
                              >
                                Cambiar fotografía de evidencia
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateVisualState({
                                    ...curVState,
                                    fotoNuevaUrl: undefined,
                                    estadoVisual: computeVisualStatus(
                                      curVState.fotoAntiguaUrl,
                                      undefined,
                                      curVState.fijacionYMedidaCorrecta,
                                      true,
                                      curVState.motivoIncidencia
                                    )
                                  })
                                }
                                className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                              >
                                Eliminar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setTempVisualPhoto(null);
                              setVisualCameraTarget({
                                elementoId: activeVisualDef.id,
                                step: 'nueva'
                              });
                            }}
                            className="w-full py-3.5 bg-gradient-to-r from-[#009ca6] to-[#00b4bf] hover:brightness-110 text-white font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md"
                          >
                            <Camera className="w-4 h-4" />
                            <span>Capturar Foto del Cubrecestas en 2.ª Posición</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* CAPTURA DE FOTO ÚNICA DEL ELEMENTO NUEVO / ACTUALIZADO (SIN PEDIR FOTO ANTIGUA) */}
                      <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 flex flex-col justify-between">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full">
                              PASO 1 · Evidencia Fotográfica POSM Instalado
                            </span>
                            <h4 className="text-sm sm:text-base font-black text-slate-900 mt-2">
                              {isHanshow
                                ? 'Captura de la pantalla Hanshow actualizada'
                                : isLuminoso
                                ? 'Captura del Luminoso Xiaomi 18 Pro instalado'
                                : isFaldon
                                  ? 'Captura del faldón instalado en Mesa 1 Cara 1'
                                  : 'Captura de la nueva lona instalada'}
                            </h4>
                            <p className="text-xs text-slate-500">
                              Fotografía únicamente el nuevo elemento ya colocado o actualizado en tienda.
                            </p>
                          </div>
                        </div>

                        {curVState.fotoNuevaUrl ? (
                          <div className="space-y-2">
                            <div className="relative h-52 rounded-xl overflow-hidden border border-emerald-300 bg-black">
                              <img
                                src={curVState.fotoNuevaUrl}
                                alt="Evidencia POSM Nueva"
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-black shadow-sm">
                                ✓ Foto de Evidencia POSM Adjuntada
                              </span>
                            </div>
                            <div className="flex justify-between pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setTempVisualPhoto(null);
                                  setVisualCameraTarget({
                                    elementoId: activeVisualDef.id,
                                    step: 'nueva'
                                  });
                                }}
                                className="text-xs font-bold text-[#009ca6] hover:underline cursor-pointer"
                              >
                                Cambiar fotografía de evidencia
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateVisualState({
                                    ...curVState,
                                    fotoNuevaUrl: undefined,
                                    estadoVisual: computeVisualStatus(
                                      curVState.fotoAntiguaUrl,
                                      undefined,
                                      curVState.fijacionYMedidaCorrecta
                                    )
                                  })
                                }
                                className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                              >
                                Eliminar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setTempVisualPhoto(null);
                              setVisualCameraTarget({
                                elementoId: activeVisualDef.id,
                                step: 'nueva'
                              });
                            }}
                            className="w-full py-3.5 bg-gradient-to-r from-[#009ca6] to-[#00b4bf] hover:brightness-110 text-white font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md"
                          >
                            <Camera className="w-4 h-4" />
                            <span>
                              {isHanshow
                                ? 'Capturar Foto de Pantalla Hanshow Actualizada'
                                : isLuminoso
                                ? 'Capturar Foto del Luminoso Xiaomi 18 Pro'
                                : isFaldon
                                  ? 'Capturar Foto del Faldón Instalado'
                                  : 'Capturar Foto de la Lona Nueva Instalada'}
                            </span>
                          </button>
                        )}
                      </div>

                      {/* PASO 2: CUESTIONARIO DE VERIFICACIÓN RÁPIDA */}
                      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-[#104a60] block">
                              PASO 2 · Cuestionario de Verificación Rápida
                            </span>
                            <h4 className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
                              {isHanshow
                                ? '¿La pantalla Hanshow se ha actualizado correctamente al nuevo cartel Xiaomi 18 Series?'
                                : isLuminoso
                                ? '¿Se ha retirado el luminoso de Xiaomi 17T e instalado el nuevo de Xiaomi 18 Pro correctamente?'
                                : '¿El elemento POSM queda bien fijado y la medida es la correcta?'}
                            </h4>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                onUpdateVisualState({
                                  ...curVState,
                                  fijacionYMedidaCorrecta: true,
                                  motivoIncidencia: '',
                                  estadoVisual: computeVisualStatus(
                                    curVState.fotoAntiguaUrl,
                                    curVState.fotoNuevaUrl,
                                    true
                                  ),
                                  fechaHora: new Date().toLocaleString('es-ES')
                                });
                              }}
                              className={`px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 border transition cursor-pointer ${
                                curVState.fijacionYMedidaCorrecta === true
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                                  : 'bg-white text-slate-700 border-slate-300 hover:bg-emerald-50'
                              }`}
                            >
                              <Check className="w-4 h-4" />
                              <span>Sí</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                onUpdateVisualState({
                                  ...curVState,
                                  fijacionYMedidaCorrecta: false,
                                  motivoIncidencia:
                                    curVState.motivoIncidencia || 'Medidas no coinciden',
                                  estadoVisual: 'Incidencia',
                                  fechaHora: new Date().toLocaleString('es-ES')
                                });
                              }}
                              className={`px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 border transition cursor-pointer ${
                                curVState.fijacionYMedidaCorrecta === false
                                  ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                                  : 'bg-white text-slate-700 border-slate-300 hover:bg-rose-50'
                              }`}
                            >
                              <AlertTriangle className="w-4 h-4" />
                              <span>No</span>
                            </button>
                          </div>
                        </div>

                        {/* Si se marca "No": desplegable de motivos de incidencia y campo para observaciones */}
                        {curVState.fijacionYMedidaCorrecta === false && (
                          <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-3 animate-fadeIn">
                            <div>
                              <label className="block text-xs font-black text-rose-900 uppercase mb-1">
                                Motivo de la incidencia en Parte Visual / PLV:
                              </label>
                              <select
                                value={curVState.motivoIncidencia || 'Medidas no coinciden'}
                                onChange={(e) =>
                                  onUpdateVisualState({
                                    ...curVState,
                                    motivoIncidencia: e.target.value as VisualIncidentMotivo,
                                    estadoVisual: 'Incidencia'
                                  })
                                }
                                className="w-full bg-white border border-rose-300 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
                              >
                                {VISUAL_INCIDENT_MOTIVOS.map((m) => (
                                  <option key={m} value={m}>
                                    {m}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-black text-rose-900 uppercase mb-1">
                                Observaciones / Notas adicionales:
                              </label>
                              <textarea
                                rows={2}
                                value={curVState.notas || ''}
                                onChange={(e) =>
                                  onUpdateVisualState({
                                    ...curVState,
                                    notas: e.target.value
                                  })
                                }
                                placeholder="Especifica medidas reales medidas en tienda, estado de perfilería o detalles..."
                                className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* MODAL DE CÁMARA PARA PARTE VISUAL (PASO 1 ANTIGUA / PASO 2 NUEVA) */}
      {visualCameraTarget && activeVisualDef && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-5 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-400 block">
                  {visualCameraTarget.step === 'antigua'
                    ? 'PASO 1 · Fotografía Cartelería / Lona Antigua'
                    : 'PASO 2 · Fotografía Nueva Cartelería Instalada'}
                </span>
                <h3 className="text-sm sm:text-base font-black">{activeVisualDef.nombreElemento}</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setVisualCameraTarget(null);
                  setTempVisualPhoto(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-bold cursor-pointer"
              >
                Cerrar
              </button>
            </div>

            <div className="relative aspect-[3/2] w-full bg-black rounded-2xl overflow-hidden border-2 border-dashed border-teal-400/70 flex items-center justify-center">
              {tempVisualPhoto ? (
                <img
                  src={tempVisualPhoto}
                  alt="Preview PLV"
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <video
                    ref={(el) => {
                      videoRef.current = el;
                      if (el && streamRef.current && el.srcObject !== streamRef.current) {
                        el.srcObject = streamRef.current;
                        el.play().catch(() => {});
                      }
                    }}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                  />
                  {!cameraActive && (
                    <div className="p-6 text-center space-y-3">
                      <Camera className="w-10 h-10 text-slate-400 mx-auto" />
                      <p className="text-xs text-slate-300">
                        Encuadra el elemento PLV completo ({activeVisualDef.medidasOficiales})
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        <label className="px-4 py-2.5 bg-[#009ca6] hover:bg-[#008992] rounded-xl text-xs font-black cursor-pointer inline-flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          <span>Abrir Cámara / Galería</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const compressed =
                                await ImageCompressionService.compressImage(file);
                              setTempVisualPhoto(compressed);
                              stopCamera();
                            }}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            generateDemoVisualPhoto(activeVisualDef, visualCameraTarget.step)
                          }
                          className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-xs font-bold text-teal-200 cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Generar Foto de Prueba Local</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5">
              {tempVisualPhoto ? (
                <>
                  <button
                    type="button"
                    onClick={() => setTempVisualPhoto(null)}
                    className="px-4 py-2.5 bg-slate-800 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Repetir
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveVisualPhoto(tempVisualPhoto)}
                    className="px-5 py-2.5 bg-[#009ca6] hover:bg-[#008992] rounded-xl text-xs font-black cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Guardar Evidencia PLV</span>
                  </button>
                </>
              ) : (
                cameraActive && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (!videoRef.current) return;
                      const canvas = document.createElement('canvas');
                      canvas.width = videoRef.current.videoWidth || 1280;
                      canvas.height = videoRef.current.videoHeight || 720;
                      const ctx = canvas.getContext('2d');
                      if (!ctx) return;
                      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                      setTempVisualPhoto(dataUrl);
                      stopCamera();
                    }}
                    className="w-full py-3 bg-[#009ca6] rounded-xl text-xs font-black cursor-pointer"
                  >
                    Capturar Fotografía Ahora
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE PREVISUALIZACIÓN EN GRANDE DE IMÁGENES DE REFERENCIA POSM */}
      {posmPreviewModal && (
        <div
          onClick={() => setPosmPreviewModal(null)}
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-fadeIn"
        >
          {/* Barra superior con botón para volver a la pantalla anterior */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl mx-auto flex items-center justify-between gap-3 pb-3 border-b border-white/15"
          >
            <button
              type="button"
              onClick={() => setPosmPreviewModal(null)}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a la pantalla anterior</span>
            </button>

            <div className="text-right">
              <span className="text-xs sm:text-sm font-black text-teal-300 block">
                {posmPreviewModal.title}
              </span>
              {posmPreviewModal.subtitle && (
                <span className="text-[11px] text-slate-300 block">
                  {posmPreviewModal.subtitle}
                </span>
              )}
            </div>
          </div>

          {/* Imagen ampliada en el centro */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex-1 flex items-center justify-center my-4 overflow-hidden"
          >
            {posmPreviewModal.isFaldon ? (
              <div className="relative w-full max-w-4xl aspect-[16/10] rounded-2xl overflow-hidden bg-black border-2 border-teal-400/50 shadow-2xl">
                <img
                  src={posmPreviewModal.src}
                  alt={posmPreviewModal.title}
                  className="w-full h-full object-cover"
                />
                {/* Recuadro de resaltado sobre la tira del faldón */}
                <div className="absolute left-[7%] right-[7%] top-[53%] h-[10%] rounded-lg border-2 border-[#ff6900] bg-[#ff6900]/10 shadow-[0_0_20px_rgba(255,105,0,0.85)] pointer-events-none" />
                <div className="absolute left-[18%] top-[36%] flex flex-col items-center pointer-events-none animate-bounce">
                  <span className="px-2 py-0.5 rounded bg-[#ff6900] text-white text-[10px] sm:text-xs font-black uppercase shadow-md whitespace-nowrap">
                    Faldón
                  </span>
                  <svg className="w-6 h-7 sm:w-8 sm:h-9 text-[#ff6900] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11 4h2v11l4.5-4.5 1.42 1.42L12 18.84l-6.92-6.92 1.42-1.42L11 15V4z" />
                  </svg>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 top-[34%] flex flex-col items-center pointer-events-none animate-bounce">
                  <span className="px-2.5 py-0.5 rounded bg-[#ff6900] text-white text-[10px] sm:text-sm font-black uppercase shadow-lg border border-white/40 whitespace-nowrap">
                    ▼ Tira Faldón: "Xiaomi 18 Pro Max" ▼
                  </span>
                  <svg className="w-7 h-8 sm:w-9 sm:h-10 text-[#ff6900] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11 4h2v11l4.5-4.5 1.42 1.42L12 18.84l-6.92-6.92 1.42-1.42L11 15V4z" />
                  </svg>
                </div>
                <div className="absolute right-[18%] top-[36%] flex flex-col items-center pointer-events-none animate-bounce">
                  <span className="px-2 py-0.5 rounded bg-[#ff6900] text-white text-[10px] sm:text-xs font-black uppercase shadow-md whitespace-nowrap">
                    Faldón
                  </span>
                  <svg className="w-6 h-7 sm:w-8 sm:h-9 text-[#ff6900] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11 4h2v11l4.5-4.5 1.42 1.42L12 18.84l-6.92-6.92 1.42-1.42L11 15V4z" />
                  </svg>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 top-[65%] flex flex-col items-center pointer-events-none">
                  <svg className="w-7 h-7 sm:w-9 sm:h-9 text-[#00c4cc] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13 20h-2V9l-4.5 4.5-1.42-1.42L12 5.16l6.92 6.92-1.42 1.42L13 9v11z" />
                  </svg>
                  <span className="px-2.5 py-0.5 rounded bg-slate-950/90 text-teal-300 text-[10px] sm:text-xs font-black border border-teal-400/50 shadow-md whitespace-nowrap">
                    Colocar en esta tira frontal de la Mesa 1 Cara 1
                  </span>
                </div>
              </div>
            ) : (
              <img
                src={posmPreviewModal.src}
                alt={posmPreviewModal.title}
                className="max-w-full max-h-[75vh] w-auto h-auto object-contain rounded-2xl border-2 border-white/20 shadow-2xl"
              />
            )}
          </div>

          {/* Botón inferior para volver */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md mx-auto pt-2"
          >
            <button
              type="button"
              onClick={() => setPosmPreviewModal(null)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#009ca6] to-[#00b4bf] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xl"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a la pantalla anterior</span>
            </button>
          </div>
        </div>
      )}

      {/* PANTALLA MODAL DE RESUMEN PREVIO Y FINALIZACIÓN DE AUDITORÍA */}
      {isSummaryModalOpen && (
        <ImplantationSummaryModal
          store={store}
          allStores={allStores}
          currentUser={currentUser}
          swapAssignments={allStoreSwapAssignments}
          swapStates={swapStates}
          visualDefinitions={visualDefinitions}
          visualStates={visualStates}
          returnDevices={returnDevices}
          onClose={() => setIsSummaryModalOpen(false)}
          onFinishComplete={() => {
            setIsSummaryModalOpen(false);
            onFinishComplete();
          }}
        />
      )}

      {/* MODAL DE ESCÁNER (CÓDIGO DE BARRAS U OCR) PARA IMEI DEL DISPOSITIVO A RETIRAR */}
      {returnScannerTargetId && activeReturnScannerDev && (
        <ScannerModal
          isOpen={Boolean(returnScannerTargetId)}
          onClose={() => setReturnScannerTargetId(null)}
          onScanSuccess={handleReturnScanSuccess}
          initialMode={
            activeReturnScannerDev.categoria === 'Wearable' || activeReturnScannerDev.categoria === 'Tablet'
              ? 'ocr'
              : 'barcode'
          }
          deviceCategory={activeReturnScannerDev.categoria}
        />
      )}
    </div>
  );
};

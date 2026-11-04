import React, { useEffect, useRef, useState } from 'react';
import {
  DeviceReturnState,
  ImplantationRecord,
  PositionSwapState,
  StoreCenter,
  SwapCampaignAssignment,
  UserProfile,
  VisualElementAuditState,
  VisualElementDefinition
} from '../../types';
import { DbService } from '../../services/dbService';
import { ACTIVE_IMPLANTATION_CAMPAIGN } from '../../data/implantationCampaignData';
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  Lock,
  PackageMinus,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Trash2,
  X,
  XCircle
} from 'lucide-react';

interface ImplantationSummaryModalProps {
  store: StoreCenter;
  allStores: StoreCenter[];
  currentUser: UserProfile;
  swapAssignments: SwapCampaignAssignment[];
  swapStates: Record<string, PositionSwapState>;
  visualDefinitions: VisualElementDefinition[];
  visualStates: Record<string, VisualElementAuditState>;
  returnDevices?: DeviceReturnState[];
  onClose: () => void;
  onFinishComplete: () => void;
}

export const ImplantationSummaryModal: React.FC<ImplantationSummaryModalProps> = ({
  store,
  currentUser,
  swapAssignments,
  swapStates,
  visualDefinitions,
  visualStates,
  returnDevices = [],
  onClose,
  onFinishComplete
}) => {
  const [stepMode, setStepMode] = useState<'preview' | 'sealed_success'>('preview');
  const [isProcessing, setIsProcessing] = useState(false);
  const [sealedRecord, setSealedRecord] = useState<ImplantationRecord | null>(null);
  const [previewPhotoModal, setPreviewPhotoModal] = useState<{
    title: string;
    subtitle: string;
    url1?: string;
    label1?: string;
    url2?: string;
    label2?: string;
  } | null>(null);

  // Estado de la foto obligatoria de toda la mesa completa (vista alzada)
  const [tablePhotoUrl, setTablePhotoUrl] = useState<string | null>(null);
  const [tablePhotoError, setTablePhotoError] = useState<string | null>(null);
  const [isTableCameraOpen, setIsTableCameraOpen] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraInitError, setCameraInitError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopTableCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const startTableCamera = async (preferredFacing: 'environment' | 'user' = facingMode) => {
    stopTableCamera();
    setCameraInitError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: preferredFacing },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch {
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          await videoRef.current.play();
        }
        setCameraActive(true);
      } catch {
        setCameraInitError(
          'No se pudo acceder a la cámara en vivo. Puedes usar los botones de captura rápida de abajo.'
        );
      }
    }
  };

  useEffect(() => {
    if (isTableCameraOpen) {
      startTableCamera(facingMode);
    } else {
      stopTableCamera();
    }
    return () => {
      stopTableCamera();
    };
  }, [isTableCameraOpen]);

  // Consolidar y ordenar todas las posiciones de Swap por número de posición (Puesto 01, 02, 03, 04...)
  const consolidatedSwaps: PositionSwapState[] = [...swapAssignments]
    .sort((a, b) => a.posicionNumero - b.posicionNumero)
    .map((asg) => {
      const existing = swapStates[asg.posicionId];
      if (existing) return existing;
      return {
        posicionId: asg.posicionId,
        mesaId: asg.mesaId,
        posicionNumero: asg.posicionNumero,
        categoria: asg.categoria,
        modeloRetirado: asg.modeloSaliente,
        esDummyRetirado: asg.esDummySaliente,
        imeiRetirado: '-',
        modeloNuevo: asg.modeloEntrante,
        esDummyNuevo: asg.esDummyEntrante,
        imeiNuevo: '-',
        estadoSwap: 'Pendiente',
        incidenciaActiva: false,
        motivoIncidencia: '',
        observacionesIncidencia: '',
        auditadoPor: currentUser.nombre,
        usuarioEmail: currentUser.email,
        fechaHora: '-'
      };
    });

  // Consolidar todos los elementos de POSM de la tienda
  const consolidatedVisuals: VisualElementAuditState[] = visualDefinitions.map((def) => {
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
      fechaHora: '-'
    };
  });

  // Contadores de posiciones por estado (Verde / Naranja / Rojo)
  const totalSwaps = consolidatedSwaps.length;
  const okSwapsCount = consolidatedSwaps.filter(
    (s) => s.estadoSwap === 'OK' && !s.incidenciaActiva
  ).length;
  const incidentSwapsCount = consolidatedSwaps.filter(
    (s) => s.estadoSwap === 'Incidencia' || s.incidenciaActiva
  ).length;
  const pendingSwapsCount = consolidatedSwaps.filter((s) => s.estadoSwap === 'Pendiente').length;
  const completedSwaps = okSwapsCount + incidentSwapsCount;

  const totalVisuals = consolidatedVisuals.length;
  const completedVisuals = consolidatedVisuals.filter((v) => v.estadoVisual !== 'Pendiente').length;
  const visualIncidents = consolidatedVisuals.filter((v) => v.estadoVisual === 'Incidencia');

  // Validación automática de encuadre de toda la mesa (detecta si la mesa sale cortada por los laterales)
  const validateAndApplyTablePhoto = (dataUrl: string, forceCutSidesError = false) => {
    if (forceCutSidesError) {
      setTablePhotoUrl(dataUrl);
      setTablePhotoError(
        'Error: La mesa sale cortada de los laterales. No se ven los dos extremos completos de la mesa ni todos los dispositivos en vista alzada. Por favor, aléjate un poco y repite la foto mostrando toda la mesa completa.'
      );
      setIsTableCameraOpen(false);
      return;
    }

    const img = new Image();
    img.onload = () => {
      // Si la foto es demasiado estrecha/vertical (ratio < 0.85) o corta los laterales del encuadre,
      // avisamos que la mesa sale cortada de los laterales y pedimos repetirla.
      const aspectRatio = img.width / Math.max(1, img.height);
      if (aspectRatio < 0.82) {
        setTablePhotoUrl(dataUrl);
        setTablePhotoError(
          'Error: La mesa sale cortada de los laterales (encuadre demasiado estrecho). Haz una foto alzada abarcando ambos extremos laterales de la mesa y vuelve a intentarlo.'
        );
      } else {
        setTablePhotoUrl(dataUrl);
        setTablePhotoError(null);
      }
      setIsTableCameraOpen(false);
    };
    img.src = dataUrl;
  };

  // Captura real desde cámara de vídeo analizando bordes laterales
  const handleCaptureLiveTablePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const vw = video.videoWidth || 1280;
    const vh = video.videoHeight || 720;

    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Analizar márgenes laterales izquierdo (0..5%) y derecho (95..100%) frente al centro (30..70%)
    // Si el usuario está demasiado cerca de la mesa y corta los extremos laterales, el brillo/color del tablero
    // ocupa el 100% hasta el borde mismo sin margen lateral de pasillo/suelo.
    try {
      const leftEdge = ctx.getImageData(0, Math.floor(canvas.height * 0.35), 35, Math.floor(canvas.height * 0.35)).data;
      const rightEdge = ctx.getImageData(
        canvas.width - 35,
        Math.floor(canvas.height * 0.35),
        35,
        Math.floor(canvas.height * 0.35)
      ).data;
      const centerArea = ctx.getImageData(
        Math.floor(canvas.width * 0.4),
        Math.floor(canvas.height * 0.35),
        70,
        Math.floor(canvas.height * 0.35)
      ).data;

      const avgBrightness = (arr: Uint8ClampedArray) => {
        let sum = 0;
        const count = arr.length / 4;
        for (let i = 0; i < arr.length; i += 4) {
          sum += (arr[i] + arr[i + 1] + arr[i + 2]) / 3;
        }
        return sum / Math.max(1, count);
      };

      const leftB = avgBrightness(leftEdge);
      const rightB = avgBrightness(rightEdge);
      const centerB = avgBrightness(centerArea);

      // Si el vídeo original es muy vertical (vw < vh * 0.78) y los bordes laterales tienen exactamente
      // la misma luminancia de tablero que el centro (mesa cortada a sangre en ambos lados):
      const isTooNarrowAndCut =
        vw < vh * 0.78 &&
        Math.abs(leftB - centerB) < 6 &&
        Math.abs(rightB - centerB) < 6;

      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      validateAndApplyTablePhoto(dataUrl, isTooNarrowAndCut);
    } catch {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      validateAndApplyTablePhoto(dataUrl, false);
    }
  };

  // Generador de foto de prueba para demostrar en móvil/ordenador (Mesa completa OK vs Mesa cortada en laterales)
  const handleGenerateSimulatedTablePhoto = (cutSides: boolean) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fondo de tienda (pasillo y suelo)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 800);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(0.55, '#1e293b');
    bgGrad.addColorStop(1, '#334155');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1280, 800);

    if (!cutSides) {
      // MESA COMPLETA ALZADA (Se ven claramente los márgenes laterales izquierdo y derecho y toda la mesa)
      // Sombra de la mesa en el suelo
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.roundRect(140, 560, 1000, 90, 30);
      ctx.fill();

      // Estructura de la mesa completa (dentro de los márgenes 150px .. 1130px)
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.roundRect(150, 260, 980, 310, 22);
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#10b981';
      ctx.stroke();

      // Faldón lateral / frontal Xiaomi
      ctx.fillStyle = '#ff6900';
      ctx.fillRect(150, 490, 980, 55);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`MESA COMPLETA XIAOMI · ${store.nombreTienda.toUpperCase()}`, 640, 526);

      // Dispositivos alineados sobre la mesa (vista alzada)
      const positionsCount = Math.max(4, consolidatedSwaps.length);
      const spacing = 840 / positionsCount;
      for (let i = 0; i < positionsCount; i++) {
        const px = 220 + i * spacing;
        // Peana y smartphone
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(px, 300, 95, 145, 12);
        ctx.fill();
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.roundRect(px + 7, 308, 81, 120, 8);
        ctx.fill();
        // Ficha técnica al lado
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(px + 102, 355, 48, 75);
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(`P0${i + 1}`, px + 47, 468);
      }

      // Indicadores verdes de laterales completos
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('✓ LATERAL IZQUIERDO VISIBLE', 290, 230);
      ctx.fillText('✓ LATERAL DERECHO VISIBLE', 990, 230);
    } else {
      // MESA CORTADA POR LOS LATERALES (zoom excesivo, la mesa se sale por x=0 y x=1280)
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 200, 1280, 440);

      ctx.fillStyle = '#ff6900';
      ctx.fillRect(0, 530, 1280, 75);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ENCUADRE INCORRECTO · LATERALES DE LA MESA CORTADOS', 640, 578);

      // Franjas rojas de corte en los bordes laterales
      ctx.fillStyle = 'rgba(225, 29, 72, 0.85)';
      ctx.fillRect(0, 0, 95, 800);
      ctx.fillRect(1185, 0, 95, 800);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('⚠ MESA CORTADA EN LOS EXTREMOS LATERALES', 640, 130);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    validateAndApplyTablePhoto(dataUrl, cutSides);
  };

  const isTablePhotoValid = Boolean(tablePhotoUrl) && !tablePhotoError;

  const buildSealedImplantationRecord = (): ImplantationRecord => {
    const now = new Date();
    const exactTimestamp = `${now.toLocaleDateString('es-ES')} ${now.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })}`;
    const baseUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}${window.location.pathname}`
        : 'https://propuesta-xiaomi-salesland.surge.sh/';
    const implantationId = `IMP_${store.tiendaId}_${Date.now()}`;
    const directLinkUrl = `${baseUrl}?mode=implantation_view&storeId=${encodeURIComponent(
      store.tiendaId
    )}&impId=${encodeURIComponent(implantationId)}`;

    const totalReturnCount = returnDevices.length;
    const completedReturnCount = returnDevices.filter((r) => r.estadoRetirada === 'Retirado').length;
    const returnIncidentsCount = returnDevices.filter((r) => r.estadoRetirada === 'Incidencia').length;

    return {
      implantationId,
      campanaNombre: ACTIVE_IMPLANTATION_CAMPAIGN,
      tiendaId: store.tiendaId,
      nombreTienda: store.nombreTienda,
      retailer: store.retailer,
      usuarioEmail: currentUser.email,
      usuarioNombre: currentUser.nombre,
      fechaHora: exactTimestamp,
      totalSwapPositions: totalSwaps,
      completedSwapCount: completedSwaps,
      swapIncidentsCount: incidentSwapsCount,
      totalVisualElements: totalVisuals,
      completedVisualCount: completedVisuals,
      visualIncidentsCount: visualIncidents.length,
      totalReturnDevices: totalReturnCount,
      completedReturnCount,
      returnIncidentsCount,
      swapPositions: consolidatedSwaps,
      visualElements: consolidatedVisuals,
      returnDevices,
      fotoMesaCompletaUrl: tablePhotoUrl || undefined,
      directLinkUrl,
      sharedDriveEmail: '',
      sincronizadoSheets: false
    };
  };

  const handleConfirmAndFinalize = async () => {
    if (!tablePhotoUrl) {
      alert(
        'Antes de finalizar la auditoría debes realizar la foto alzada de toda la mesa completa.'
      );
      return;
    }
    if (tablePhotoError) {
      alert(
        'La foto de la mesa tiene un error (la mesa sale cortada de los laterales). Por favor, repite la foto antes de finalizar.'
      );
      return;
    }

    setIsProcessing(true);
    try {
      const record = buildSealedImplantationRecord();

      DbService.saveImplantationRecord(record);
      DbService.clearImplantationDraft(store.tiendaId);

      // Actualizar automáticamente el Reporte Vigente de la tienda con los nuevos dispositivos e IMEIs instalados
      try {
        const updatedPositions = consolidatedSwaps.map((sw) => ({
          posicionId: sw.posicionId,
          mesaId: sw.mesaId,
          posicionNumero: sw.posicionNumero,
          modeloOficial: sw.modeloNuevo,
          modeloDetectado: sw.modeloNuevo,
          imeiSerial: sw.imeiNuevo || '-',
          estadoPosicion: sw.estadoSwap === 'Incidencia' ? ('Incidencia' as const) : ('OK' as const),
          tipoIncidencia: sw.motivoIncidencia ? ('Otro' as const) : undefined,
          esMaqueta: sw.esDummyNuevo,
          fotoEvidenciaUrl: sw.fotoInUrl,
          auditadoPor: currentUser.nombre,
          fechaHora: record.fechaHora
        }));

        const okCount = updatedPositions.filter((p) => p.estadoPosicion === 'OK').length;
        const incidenciasCount = updatedPositions.filter((p) => p.estadoPosicion === 'Incidencia').length;
        const pendientesCount = updatedPositions.length - okCount - incidenciasCount;

        DbService.saveAuditRecord({
          auditId: `AUD_${store.tiendaId}_POST_IMP_${Date.now()}`,
          tiendaId: store.tiendaId,
          nombreTienda: store.nombreTienda,
          retailer: store.retailer,
          usuarioEmail: currentUser.email,
          usuarioNombre: currentUser.nombre,
          fechaHora: record.fechaHora,
          totalPosiciones: updatedPositions.length,
          okCount,
          incidenciasCount,
          pendientesCount,
          positions: updatedPositions,
          sincronizadoSheets: false
        });
      } catch (e) {
        console.warn('No se pudo actualizar el reporte vigente automático tras la implantación:', e);
      }

      setSealedRecord(record);
      setStepMode('sealed_success');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-3xl min-h-[94dvh] sm:min-h-0 sm:max-h-[92vh] bg-white text-slate-800 rounded-none sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* HEADER LIMPIO Y DIRECTO */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#072431] via-[#104a60] to-[#0a3343] text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              title="Volver"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#ff6900] block">
                Resumen para Finalizar Auditoría
              </span>
              <h1 className="text-sm sm:text-base font-black text-white">
                {store.nombreTienda} ({store.retailer})
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {stepMode === 'preview' ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* =================================================================
                1. LO PRIMERO AL ACCEDER: POSICIONES COMPLETADAS Y LEYENDA DE COLORES
                ================================================================= */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#009ca6] block">
                    Estado de los dispositivos
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">
                    Posiciones completadas: {completedSwaps} de {totalSwaps}
                  </h2>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black border self-start sm:self-auto ${
                    pendingSwapsCount === 0
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-rose-100 text-rose-900 border-rose-300'
                  }`}
                >
                  {pendingSwapsCount === 0
                    ? '✓ Todas las posiciones revisadas'
                    : `Faltan ${pendingSwapsCount} por reportar`}
                </span>
              </div>

              {/* Resumen visual en 3 colores: Verde (Correcto), Naranja (Con incidencia), Rojo (Falta por reportar) */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-center">
                  <span className="text-xl sm:text-2xl font-black text-emerald-700 block">
                    {okSwapsCount}
                  </span>
                  <span className="text-[11px] font-black text-emerald-900 block">
                    Todo correcto
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-orange-50 border-2 border-orange-400 text-center">
                  <span className="text-xl sm:text-2xl font-black text-orange-600 block">
                    {incidentSwapsCount}
                  </span>
                  <span className="text-[11px] font-black text-orange-900 block">
                    Con incidencia
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-rose-50 border-2 border-rose-400 text-center">
                  <span className="text-xl sm:text-2xl font-black text-rose-600 block">
                    {pendingSwapsCount}
                  </span>
                  <span className="text-[11px] font-black text-rose-900 block">
                    Falta reportar
                  </span>
                </div>
              </div>

              {/* LISTADO ORDENADO POR POSICIONES (VERDE / NARANJA / ROJO) */}
              <div className="space-y-2.5 pt-1">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-600">
                  Listado ordenado por posiciones (Puesto 01 a Puesto{' '}
                  {String(totalSwaps).padStart(2, '0')})
                </h3>

                <div className="space-y-2.5">
                  {consolidatedSwaps.map((sw) => {
                    const isGreen = sw.estadoSwap === 'OK' && !sw.incidenciaActiva;
                    const isOrange = sw.estadoSwap === 'Incidencia' || sw.incidenciaActiva;

                    const cardColorClasses = isGreen
                      ? 'bg-emerald-50/90 border-2 border-emerald-400 text-emerald-950'
                      : isOrange
                        ? 'bg-orange-50/95 border-2 border-orange-400 text-orange-950'
                        : 'bg-rose-50/90 border-2 border-rose-400 text-rose-950';

                    const badgeClasses = isGreen
                      ? 'bg-emerald-600 text-white'
                      : isOrange
                        ? 'bg-orange-500 text-white'
                        : 'bg-rose-600 text-white';

                    const statusLabel = isGreen
                      ? 'Correcto'
                      : isOrange
                        ? 'Reportado con incidencia'
                        : 'Falta por reportar';

                    return (
                      <div
                        key={sw.posicionId}
                        className={`p-3.5 sm:p-4 rounded-2xl transition shadow-2xs ${cardColorClasses}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-xs ${badgeClasses}`}
                            >
                              P{String(sw.posicionNumero).padStart(2, '0')}
                            </div>

                            <div className="space-y-0.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs sm:text-sm font-black">
                                  Puesto {String(sw.posicionNumero).padStart(2, '0')} ·{' '}
                                  {sw.modeloNuevo}
                                </span>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${badgeClasses}`}
                                >
                                  {statusLabel}
                                </span>
                              </div>

                              <p className="text-xs opacity-85 font-semibold">
                                Retirado: {sw.modeloRetirado} → Instalado: {sw.modeloNuevo}
                                {sw.estadoSwap !== 'Pendiente' && (
                                  <span>
                                    {' '}
                                    · ({sw.esDummyNuevo ? 'DUMMY' : 'LDU'} · IMEI: {sw.imeiNuevo})
                                  </span>
                                )}
                              </p>

                              {isOrange && (
                                <p className="text-xs font-black text-orange-800 bg-orange-100/90 border border-orange-300 rounded-xl px-2.5 py-1 mt-1 inline-block">
                                  ⚠ Incidencia: {sw.motivoIncidencia || 'Incidencia registrada'}
                                </p>
                              )}

                              {!isGreen && !isOrange && (
                                <p className="text-xs font-bold text-rose-700 mt-0.5">
                                  ✕ Falta completar el cambio y la foto de evidencia de este puesto.
                                </p>
                              )}
                            </div>
                          </div>

                          {(sw.fotoOutUrl || sw.fotoInUrl) && (
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewPhotoModal({
                                  title: `Puesto ${String(sw.posicionNumero).padStart(2, '0')} · ${sw.modeloNuevo}`,
                                  subtitle: `${sw.modeloRetirado} → ${sw.modeloNuevo}`,
                                  url1: sw.fotoOutUrl,
                                  label1: `Evidencia Retirada: ${sw.modeloRetirado}`,
                                  url2: sw.fotoInUrl,
                                  label2: `Evidencia Instalación: ${sw.modeloNuevo}`
                                })
                              }
                              className="px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-800 border border-slate-300 text-[11px] font-black flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
                            >
                              <Camera className="w-3.5 h-3.5 text-[#009ca6]" />
                              <span>Ver fotos</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* =================================================================
                2. RESUMEN DE MATERIAL RETIRADO Y DEVOLUCIÓN DE STOCK
                ================================================================= */}
            {returnDevices && returnDevices.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PackageMinus className="w-4 h-4 text-amber-600" />
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800">
                      Material a Retirar ({returnDevices.filter((r) => r.estadoRetirada === 'Retirado').length} de {returnDevices.length} retirados)
                    </h3>
                  </div>
                </div>

                <div className="space-y-2">
                  {returnDevices.map((ret) => {
                    const isOk = ret.estadoRetirada === 'Retirado';
                    const isInc = ret.estadoRetirada === 'Incidencia';
                    const cardBg = isOk
                      ? 'bg-emerald-50/90 border-2 border-emerald-400 text-emerald-950'
                      : isInc
                        ? 'bg-orange-50/95 border-2 border-orange-400 text-orange-950'
                        : 'bg-rose-50/90 border-2 border-rose-400 text-rose-950';

                    const badgeBg = isOk
                      ? 'bg-emerald-600 text-white'
                      : isInc
                        ? 'bg-orange-500 text-white'
                        : 'bg-rose-600 text-white';

                    return (
                      <div
                        key={ret.id}
                        className={`p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${cardBg}`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${badgeBg}`}
                          >
                            P{ret.posicionAnterior}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm font-black">
                                {ret.modeloSaliente}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${badgeBg}`}>
                                {ret.estadoRetirada}
                              </span>
                            </div>
                            <p className="text-[11px] opacity-80 font-semibold">
                              {ret.esDummy ? 'Maqueta / Dummy' : 'Terminal LDU'}
                              {ret.imeiMemorizado ? ` · IMEI Memorizado: ${ret.imeiMemorizado}` : ''}
                            </p>
                            {ret.motivoIncidencia && (
                              <p className="text-xs text-orange-800 font-bold mt-0.5">
                                Motivo: {ret.motivoIncidencia}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* =================================================================
                3. RESUMEN LIMPIO DE ELEMENTOS POSM (MISMO CÓDIGO DE COLORES)
                ================================================================= */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#ff6900]" />
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800">
                    Elementos POSM ({completedVisuals} de {totalVisuals} completados)
                  </h3>
                </div>
              </div>

              <div className="space-y-2">
                {consolidatedVisuals.map((vis, idx) => {
                  const isGreen = vis.estadoVisual === 'OK';
                  const isOrange = vis.estadoVisual === 'Incidencia';

                  const cardColor = isGreen
                    ? 'bg-emerald-50/90 border-2 border-emerald-400 text-emerald-950'
                    : isOrange
                      ? 'bg-orange-50/95 border-2 border-orange-400 text-orange-950'
                      : 'bg-rose-50/90 border-2 border-rose-400 text-rose-950';

                  const badgeColor = isGreen
                    ? 'bg-emerald-600 text-white'
                    : isOrange
                      ? 'bg-orange-500 text-white'
                      : 'bg-rose-600 text-white';

                  return (
                    <div
                      key={vis.elementoId}
                      className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 ${cardColor}`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs sm:text-sm font-black">
                            POSM 0{idx + 1} · {vis.nombreElemento}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${badgeColor}`}
                          >
                            {isGreen
                              ? 'Correcto'
                              : isOrange
                                ? 'Con incidencia'
                                : 'Falta por reportar'}
                          </span>
                        </div>
                        {isOrange && (
                          <p className="text-xs font-bold text-orange-800">
                            ⚠ Incidencia: {vis.motivoIncidencia || 'Incidencia POSM'}
                          </p>
                        )}
                      </div>

                      {vis.fotoNuevaUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewPhotoModal({
                              title: vis.nombreElemento,
                              subtitle: vis.medidasOficiales,
                              url2: vis.fotoNuevaUrl,
                              label2: 'Foto Evidencia POSM'
                            })
                          }
                          className="px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-800 border border-slate-300 text-[11px] font-black flex items-center gap-1.5 shrink-0 cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5 text-[#009ca6]" />
                          <span>Ver foto</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* =================================================================
                3. PASO OBLIGATORIO ANTES DE FINALIZAR: FOTO ALZADA DE TODA LA MESA COMPLETA
                ================================================================= */}
            <div
              className={`rounded-3xl p-4 sm:p-5 border-2 space-y-3.5 transition ${
                tablePhotoError
                  ? 'bg-rose-50/90 border-rose-500'
                  : isTablePhotoValid
                    ? 'bg-emerald-50/80 border-emerald-500'
                    : 'bg-amber-50/70 border-amber-400'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      tablePhotoError
                        ? 'bg-rose-600 text-white'
                        : isTablePhotoValid
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#ff6900] text-white'
                    }`}
                  >
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 block">
                      Requisito obligatorio antes de finalizar
                    </span>
                    <h3 className="text-sm sm:text-base font-black text-slate-900">
                      Foto alzada de toda la mesa completa
                    </h3>
                    <p className="text-xs text-slate-700 mt-0.5">
                      Realiza una foto alzada donde se vean todos los dispositivos y{' '}
                      <strong>toda la mesa completa de extremo a extremo</strong> (sin cortar los
                      laterales).
                    </p>
                  </div>
                </div>
              </div>

              {/* Si la mesa salió cortada de los laterales, mostramos el error claro y pedimos repetir */}
              {tablePhotoError && (
                <div className="p-4 bg-rose-600 text-white rounded-2xl space-y-2 shadow-md animate-fadeIn">
                  <div className="flex items-start gap-2.5">
                    <XCircle className="w-5 h-5 text-white shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm font-black leading-snug">
                      {tablePhotoError}
                    </div>
                  </div>
                  {tablePhotoUrl && (
                    <div className="rounded-xl overflow-hidden border-2 border-rose-300 bg-black max-h-40">
                      <img
                        src={tablePhotoUrl}
                        alt="Foto con laterales cortados"
                        className="w-full h-36 object-cover opacity-85"
                      />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsTableCameraOpen(true)}
                    className="w-full py-3 px-4 bg-white text-rose-700 hover:bg-rose-50 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm transition"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Repetir Foto de Toda la Mesa (Sin cortar laterales)</span>
                  </button>
                </div>
              )}

              {/* Si aún no hay foto */}
              {!tablePhotoUrl && !tablePhotoError && (
                <button
                  type="button"
                  onClick={() => setIsTableCameraOpen(true)}
                  className="w-full py-4 px-5 bg-gradient-to-r from-[#104a60] to-[#009ca6] hover:brightness-110 text-white font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg cursor-pointer transition"
                >
                  <Camera className="w-5 h-5" />
                  <span>Hacer Foto Alzada de Toda la Mesa Completa</span>
                </button>
              )}

              {/* Si la foto es válida (mesa completa sin cortar laterales) */}
              {isTablePhotoValid && tablePhotoUrl && (
                <div className="p-3.5 bg-white border border-emerald-300 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <img
                      src={tablePhotoUrl}
                      alt="Mesa completa"
                      className="w-24 h-16 object-cover rounded-xl border border-emerald-400 bg-slate-900 shrink-0"
                    />
                    <div>
                      <span className="text-xs font-black text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Foto alzada de mesa completa verificada</span>
                      </span>
                      <span className="text-[11px] text-slate-600 block mt-0.5">
                        Ambos extremos laterales de la mesa y dispositivos visibles correctamente.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setIsTableCameraOpen(true)}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                    >
                      Repetir foto
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTablePhotoUrl(null);
                        setTablePhotoError(null);
                      }}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* PANTALLA DE CONFIRMACIÓN DE AUDITORÍA FINALIZADA (SIN EXCEL NI COMPARTICIÓN EXTERNA) */
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-3xl flex flex-col sm:flex-row items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">
                  Nueva Implantación Finalizada Correctamente
                </span>
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  {store.nombreTienda} · {ACTIVE_IMPLANTATION_CAMPAIGN}
                </h2>
                <p className="text-xs text-emerald-800 mt-1">
                  Registrado el <strong>{sealedRecord?.fechaHora}</strong> por{' '}
                  <strong>{currentUser.nombre}</strong>.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={onFinishComplete}
                className="w-full py-4 px-4 bg-gradient-to-r from-[#009ca6] to-[#104a60] text-white font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg transition"
              >
                <span>Volver al Directorio de Tiendas</span>
              </button>
            </div>
          </div>
        )}

        {/* FOOTER CON BOTÓN FINAL "CONFIRMAR Y FINALIZAR AUDITORÍA" */}
        {stepMode === 'preview' && (
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-3.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Seguir Editando</span>
            </button>

            <button
              type="button"
              onClick={handleConfirmAndFinalize}
              disabled={isProcessing || !isTablePhotoValid}
              className={`w-full sm:flex-1 py-4 px-6 font-black rounded-2xl shadow-xl text-xs sm:text-base flex items-center justify-center gap-2.5 transition ${
                !isTablePhotoValid
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#009ca6] via-[#008992] to-[#104a60] hover:brightness-110 active:scale-[0.99] text-white shadow-[#009ca6]/25 cursor-pointer'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Finalizando auditoría...</span>
                </>
              ) : !isTablePhotoValid ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Haz la foto de toda la mesa completa para finalizar</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 text-teal-200" />
                  <span>Confirmar y Finalizar Auditoría</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* =====================================================================
          MODAL DE CÁMARA PARA LA FOTO ALZADA DE TODA LA MESA COMPLETA
          ===================================================================== */}
      {isTableCameraOpen && (
        <div className="fixed inset-0 z-60 bg-slate-950/95 flex flex-col justify-between p-4 sm:p-6 text-white animate-fadeIn">
          {/* Cabecera cámara */}
          <div className="flex items-center justify-between max-w-2xl mx-auto w-full">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#ff6900] block">
                Paso Obligatorio · Vista Alzada
              </span>
              <h3 className="text-sm sm:text-base font-black text-white">
                Foto de Toda la Mesa Completa ({store.nombreTienda})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsTableCameraOpen(false)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Visor con guías de encuadre de toda la mesa y márgenes laterales */}
          <div className="my-auto max-w-2xl mx-auto w-full space-y-3">
            <div className="relative w-full aspect-16/10 bg-black rounded-3xl overflow-hidden border-2 border-teal-400/70 shadow-2xl">
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="w-full h-full object-cover"
              />

              {/* Guía superpuesta para encuadrar toda la mesa sin cortar los laterales */}
              <div className="absolute inset-0 pointer-events-none p-3 sm:p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] sm:text-xs font-black">
                  <span className="bg-emerald-600/90 text-white px-2.5 py-1 rounded-lg shadow">
                    ← Margen Lateral Izquierdo
                  </span>
                  <span className="bg-slate-900/90 text-teal-300 border border-teal-400/40 px-3 py-1 rounded-lg">
                    Vista Alzada · Dispositivos + Mesa Entera
                  </span>
                  <span className="bg-emerald-600/90 text-white px-2.5 py-1 rounded-lg shadow">
                    Margen Lateral Derecho →
                  </span>
                </div>

                {/* Marco central donde debe entrar toda la mesa de extremo a extremo */}
                <div className="flex-1 my-2 border-2 border-dashed border-emerald-400/90 rounded-2xl bg-emerald-500/5 flex flex-col items-center justify-center px-4 text-center">
                  <span className="text-xs sm:text-sm font-black text-white drop-shadow">
                    Encuadra TODA LA MESA COMPLETA dentro de este marco
                  </span>
                  <span className="text-[11px] text-amber-300 font-bold mt-1 drop-shadow">
                    ⚠ Si la mesa sale cortada por los laterales dará error y pedirá repetirla
                  </span>
                </div>

                <div className="text-center">
                  <span className="inline-block bg-black/75 text-slate-200 text-[11px] font-semibold px-3 py-1 rounded-full">
                    Aléjate lo suficiente para que se vean los dos extremos de la mesa y los
                    dispositivos arriba
                  </span>
                </div>
              </div>

              {cameraInitError && (
                <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center">
                  <Camera className="w-10 h-10 text-teal-400 mb-2" />
                  <p className="text-xs sm:text-sm font-bold text-slate-200 max-w-md">
                    {cameraInitError}
                  </p>
                </div>
              )}
            </div>

            {/* Botones de acción y simulación para probar tanto foto válida como error por corte lateral */}
            <div className="space-y-2.5">
              {cameraActive && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCaptureLiveTablePhoto}
                    className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-[#009ca6] hover:brightness-110 text-white font-black rounded-2xl text-sm flex items-center justify-center gap-2 shadow-xl cursor-pointer"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Capturar Foto de Toda la Mesa</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const next = facingMode === 'environment' ? 'user' : 'environment';
                      setFacingMode(next);
                      startTableCamera(next);
                    }}
                    className="px-4 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-xs cursor-pointer"
                  >
                    Girar cámara
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleGenerateSimulatedTablePhoto(false)}
                  className="py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Capturar Mesa Completa (Correcta)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleGenerateSimulatedTablePhoto(true)}
                  className="py-3.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Simular Mesa Cortada de Laterales (Ver Error)</span>
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto w-full text-center">
            <button
              type="button"
              onClick={() => setIsTableCameraOpen(false)}
              className="text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
            >
              Cancelar y volver al resumen
            </button>
          </div>
        </div>
      )}

      {/* SUBMODAL PARA VISUALIZAR FOTOS DE EVIDENCIA */}
      {previewPhotoModal && (
        <div
          className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4"
          onClick={() => setPreviewPhotoModal(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-5 text-white space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-black text-sm sm:text-base">{previewPhotoModal.title}</h4>
                <p className="text-xs text-teal-400">{previewPhotoModal.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPhotoModal(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-amber-300 block">
                  {previewPhotoModal.label1 || 'Foto 1 (Antes / OUT)'}
                </span>
                {previewPhotoModal.url1 ? (
                  <img
                    src={previewPhotoModal.url1}
                    alt="Evidencia 1"
                    className="w-full h-64 object-contain bg-black rounded-2xl border border-slate-700"
                  />
                ) : (
                  <div className="h-64 bg-slate-800 rounded-2xl flex items-center justify-center text-xs text-slate-400">
                    Sin fotografía adjunta
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-bold text-teal-300 block">
                  {previewPhotoModal.label2 || 'Foto 2 (Después / IN)'}
                </span>
                {previewPhotoModal.url2 ? (
                  <img
                    src={previewPhotoModal.url2}
                    alt="Evidencia 2"
                    className="w-full h-64 object-contain bg-black rounded-2xl border border-slate-700"
                  />
                ) : (
                  <div className="h-64 bg-slate-800 rounded-2xl flex items-center justify-center text-xs text-slate-400">
                    Sin fotografía adjunta
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

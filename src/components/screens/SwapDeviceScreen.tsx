import React, { useState, useRef, useEffect } from 'react';
import {
  PlanogramPosition,
  PositionSwapState,
  StoreCenter,
  SwapCampaignAssignment,
  SwapOutIncidentMotivo,
  SwapInIncidentMotivo,
  UserProfile
} from '../../types';
import { ScannerModal } from '../ScannerModal';
import { ImageCompressionService } from '../../services/imageCompressionService';
import { validateImeiLuhn } from '../../services/ocrService';
import {
  ArrowLeft,
  ArrowRightLeft,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Edit3,
  Lock,
  PackageMinus,
  PackagePlus,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Trash2,
  Upload,
  AlertTriangle,
  X
} from 'lucide-react';

interface SwapDeviceScreenProps {
  position: PlanogramPosition;
  assignment: SwapCampaignAssignment;
  store: StoreCenter;
  currentUser: UserProfile;
  currentState?: PositionSwapState;
  onConfirmSwap: (state: PositionSwapState) => void;
  onBack: () => void;
}

type CameraTarget = 'out_photo' | 'in_photo' | null;
type KeypadTarget = 'out_imei' | 'in_imei' | null;

// Opciones cerradas de incidencias para SALIDA DE PRODUCTO (PASO 1 · OUT)
const SWAP_OUT_INCIDENT_MOTIVOS: SwapOutIncidentMotivo[] = [
  'Terminal ausente / Posible robo',
  'Terminal bloqueado / Sin encendido (Imei ilegible)',
  'Daño físico estético o funcional',
  'Alarma dañada'
];

// Opciones cerradas de incidencias para ENTRADA DE PRODUCTO NUEVO (PASO 2 · IN)
const SWAP_IN_INCIDENT_MOTIVOS: SwapInIncidentMotivo[] = [
  'Material no recibido en tienda',
  'Caja dañada / Terminal defectuoso de origen',
  'Fallo en alarmado',
  'Falta Cartela especificaciones',
  'Falta ficha energética',
  'Modo demo / Mi show no responde'
];

export const SwapDeviceScreen: React.FC<SwapDeviceScreenProps> = ({
  position,
  assignment,
  store,
  currentUser,
  currentState,
  onConfirmSwap,
  onBack
}) => {
  // Paso activo dentro del asistente IN/OUT (1: Retirada OUT, 2: Instalación IN)
  const [activePhase, setActivePhase] = useState<'step1_out' | 'step2_in'>('step1_out');

  // PASO 1 · RETIRADA (OUT) - Selección progresiva LDU vs DUMMY
  const [tipoOut, setTipoOut] = useState<'LDU' | 'DUMMY' | null>(
    currentState ? (currentState.esDummyRetirado ? 'DUMMY' : 'LDU') : null
  );
  const [imeiOut, setImeiOut] = useState<string>(currentState?.imeiRetirado || '');
  const [fotoOutUrl, setFotoOutUrl] = useState<string | undefined>(currentState?.fotoOutUrl);

  // PASO 2 · INSTALACIÓN (IN) - Selección progresiva LDU vs DUMMY
  const [tipoIn, setTipoIn] = useState<'LDU' | 'DUMMY' | null>(
    currentState ? (currentState.esDummyNuevo ? 'DUMMY' : 'LDU') : null
  );
  const esDummyNuevo = tipoIn === 'DUMMY';
  const [imeiIn, setImeiIn] = useState<string>(currentState?.imeiNuevo || '');
  const [fotoInUrl, setFotoInUrl] = useState<string | undefined>(currentState?.fotoInUrl);

  // INCIDENCIAS CERRADAS (OUT e IN por separado, sin texto libre ni opción "Otro")
  const [motivoIncidenciaOut, setMotivoIncidenciaOut] = useState<SwapOutIncidentMotivo | ''>(
    currentState?.motivoIncidenciaOut || ''
  );
  const [motivoIncidenciaIn, setMotivoIncidenciaIn] = useState<SwapInIncidentMotivo | ''>(
    currentState?.motivoIncidenciaIn || ''
  );
  const [showIncidentDrawer, setShowIncidentDrawer] = useState<boolean>(
    Boolean(currentState?.motivoIncidenciaOut || currentState?.motivoIncidenciaIn || currentState?.incidenciaActiva)
  );

  const incidenciaActiva = Boolean(motivoIncidenciaOut || motivoIncidenciaIn);

  // Escáner y Teclado Manual
  const [scannerTarget, setScannerTarget] = useState<'out' | 'in' | null>(null);
  const [keypadTarget, setKeypadTarget] = useState<KeypadTarget>(null);
  const [keypadMode, setKeypadMode] = useState<'123' | 'ABC'>('123');

  // Cámara con bastidor de encuadre
  const [cameraTarget, setCameraTarget] = useState<CameraTarget>(null);
  const [tempCapturedPhoto, setTempCapturedPhoto] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isCompressing, setIsCompressing] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const isSmartphone = assignment.categoria === 'Smartphone';

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    stopCamera();
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError(
          'Cámara web directa no disponible. Usa el botón inferior para subir o capturar la foto.'
        );
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1440 }
        },
        audio: false
      });
      streamRef.current = stream;
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch {
      setCameraActive(false);
      setCameraError(
        'No se pudo iniciar la cámara en directo. Pulsa en "Abrir Cámara / Galería" para adjuntar la foto de evidencia.'
      );
    }
  };

  useEffect(() => {
    if (cameraTarget && !tempCapturedPhoto) {
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [cameraTarget, tempCapturedPhoto]);

  const captureFromVideo = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 960;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    try {
      setIsCompressing(true);
      const compressed = await ImageCompressionService.compressImage(dataUrl);
      setTempCapturedPhoto(compressed);
      stopCamera();
    } catch {
      setTempCapturedPhoto(dataUrl);
      stopCamera();
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsCompressing(true);
      const compressed = await ImageCompressionService.compressImage(file);
      setTempCapturedPhoto(compressed);
      stopCamera();
    } catch {
      alert('Error al procesar la imagen seleccionada.');
    } finally {
      setIsCompressing(false);
    }
  };

  // Generador de evidencia demostrativa para pruebas rápidas en Mac cuando no se usa webcam
  const generateDemoPhoto = (type: 'out_photo' | 'in_photo') => {
    const canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 960;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const grad = ctx.createLinearGradient(0, 0, 0, 960);
    if (type === 'out_photo') {
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(1, '#0f172a');
    } else {
      grad.addColorStop(0, '#072431');
      grad.addColorStop(1, '#006d75');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 720, 960);

    // Marco guía dibujado
    ctx.strokeStyle = type === 'out_photo' ? '#f59e0b' : '#2dd4bf';
    ctx.lineWidth = 4;
    ctx.setLineDash([12, 8]);
    ctx.strokeRect(48, 48, 624, 864);
    ctx.setLineDash([]);

    // Silueta del smartphone
    ctx.fillStyle = '#020617';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(190, 110, 340, 520, 32);
    ctx.fill();
    ctx.stroke();

    // Pantalla del smartphone
    ctx.fillStyle = type === 'out_photo' ? '#1e293b' : '#ecfeff';
    ctx.beginPath();
    ctx.roundRect(206, 134, 308, 472, 20);
    ctx.fill();

    ctx.fillStyle = type === 'out_photo' ? '#f8fafc' : '#0f172a';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    if (type === 'out_photo') {
      const isEmptySpace = motivoIncidenciaOut === 'Terminal ausente / Posible robo';
      ctx.fillText(
        isEmptySpace ? 'EVIDENCIA ESPACIO VACÍO (OUT)' : 'EVIDENCIA RETIRADA (OUT)',
        360,
        220
      );
      ctx.font = 'bold 24px sans-serif';
      ctx.fillStyle = isEmptySpace ? '#f87171' : '#fbbf24';
      ctx.fillText(assignment.modeloSaliente, 360, 290);
      ctx.font = '18px monospace';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(
        isEmptySpace
          ? 'INCIDENCIA: TERMINAL AUSENTE'
          : `IMEI/SN: ${imeiOut || 'MAQUETA'}`,
        360,
        350
      );
      ctx.fillText(`Puesto #${position.posicionNumero} · ${store.nombreTienda}`, 360, 410);
    } else {
      ctx.fillText('*#06# · IMEI EN PANTALLA (IN)', 360, 210);
      ctx.font = 'bold 25px sans-serif';
      ctx.fillStyle = '#009ca6';
      ctx.fillText(assignment.modeloEntrante, 360, 275);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(
        esDummyNuevo ? 'MAQUETA DUMMY OFICIAL' : `IMEI: ${imeiIn || '863142080419480'}`,
        360,
        340
      );
      // Código de barras simulado *#06#
      ctx.fillStyle = '#0f172a';
      for (let i = 0; i < 28; i++) {
        const w = i % 3 === 0 ? 6 : 3;
        ctx.fillRect(240 + i * 8.5, 375, w, 65);
      }
    }

    // Cartela inferior
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(140, 690, 440, 160, 18);
    ctx.fill();

    ctx.fillStyle = '#ff6900';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('XIAOMI RETAIL BRAND SPACES · SALESLAND', 360, 735);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(
      type === 'out_photo' ? `OUT: ${assignment.modeloSaliente}` : `IN: ${assignment.modeloEntrante}`,
      360,
      775
    );
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText(
      `${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`,
      360,
      815
    );

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setTempCapturedPhoto(dataUrl);
    stopCamera();
  };

  // Validación de IMEI / Serial para PASO 2 (IN) — tanto para LDU como DUMMY
  const validateNewImeiFormat = (val: string): { valid: boolean; reason?: string } => {
    const clean = val.trim();
    if (clean.length < 4) {
      return {
        valid: false,
        reason: 'Escanea o introduce el IMEI / código del dispositivo antes de continuar.'
      };
    }
    return { valid: true };
  };

  const isOutExemptFromImei =
    tipoOut === 'DUMMY' ||
    motivoIncidenciaOut === 'Terminal ausente / Posible robo' ||
    motivoIncidenciaOut === 'Terminal bloqueado / Sin encendido (Imei ilegible)';

  const isStep1Complete =
    tipoOut === 'DUMMY' ||
    (Boolean(fotoOutUrl) && (isOutExemptFromImei || imeiOut.trim().length >= 4));

  const inValidation = validateNewImeiFormat(imeiIn);
  const isStep2Complete =
    tipoIn !== null &&
    Boolean(fotoInUrl) &&
    (inValidation.valid || Boolean(motivoIncidenciaIn));

  const handleContinueToStep2 = () => {
    if (tipoOut === 'DUMMY') {
      setActivePhase('step2_in');
      return;
    }
    if (!tipoOut && !motivoIncidenciaOut) {
      alert('Selecciona primero si el dispositivo a retirar es LDU o DUMMY.');
      return;
    }
    if (!isOutExemptFromImei && imeiOut.trim().length < 4) {
      alert('Escanea o introduce el IMEI del dispositivo retirado.');
      return;
    }
    if (!fotoOutUrl) {
      alert(
        motivoIncidenciaOut === 'Terminal ausente / Posible robo'
          ? 'Captura la foto con el espacio vacío antes de continuar.'
          : 'Captura la foto de evidencia de retirada antes de continuar.'
      );
      return;
    }
    setActivePhase('step2_in');
  };

  const handleSaveAndFinishPosition = () => {
    if (tipoOut !== 'DUMMY' && !fotoOutUrl) {
      alert(
        motivoIncidenciaOut === 'Terminal ausente / Posible robo'
          ? 'Falta la foto con el espacio vacío en el Paso 1.'
          : 'Falta la foto de evidencia de retirada en el Paso 1.'
      );
      setActivePhase('step1_out');
      return;
    }
    if (!tipoIn) {
      alert('Selecciona si el nuevo dispositivo es LDU o DUMMY.');
      return;
    }
    if (!motivoIncidenciaIn && !inValidation.valid) {
      alert(inValidation.reason || 'Escanea o introduce el IMEI del dispositivo.');
      return;
    }
    if (!fotoInUrl) {
      alert('Falta la foto de evidencia de instalación.');
      return;
    }

    const nowFormatted = new Date().toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const combinedMotivos = [
      motivoIncidenciaOut ? `[Salida OUT] ${motivoIncidenciaOut}` : '',
      motivoIncidenciaIn ? `[Entrada IN] ${motivoIncidenciaIn}` : ''
    ]
      .filter(Boolean)
      .join(' | ');

    const defaultOutImei =
      tipoOut === 'DUMMY'
        ? 'DUMMY'
        : motivoIncidenciaOut === 'Terminal ausente / Posible robo'
          ? 'Ausente / Posible robo'
          : motivoIncidenciaOut === 'Terminal bloqueado / Sin encendido (Imei ilegible)'
            ? 'IMEI Ilegible (Sin encendido)'
            : 'No registrado';

    const swapState: PositionSwapState = {
      posicionId: position.id,
      mesaId: position.mesaId,
      posicionNumero: position.posicionNumero,
      categoria: assignment.categoria,
      modeloRetirado: assignment.modeloSaliente,
      esDummyRetirado: tipoOut === 'DUMMY',
      imeiRetirado: tipoOut === 'DUMMY' ? 'DUMMY' : imeiOut.trim() || defaultOutImei,
      fotoOutUrl,
      modeloNuevo: assignment.modeloEntrante,
      esDummyNuevo,
      imeiNuevo:
        imeiIn.trim() ||
        (esDummyNuevo ? 'DUMMY' : motivoIncidenciaIn ? `No instalado (${motivoIncidenciaIn})` : ''),
      fotoInUrl,
      estadoSwap: incidenciaActiva ? 'Incidencia' : 'OK',
      incidenciaActiva,
      motivoIncidencia: combinedMotivos,
      motivoIncidenciaOut,
      motivoIncidenciaIn,
      observacionesIncidencia: '',
      auditadoPor: currentUser.nombre,
      usuarioEmail: currentUser.email,
      fechaHora: nowFormatted
    };

    onConfirmSwap(swapState);
  };

  const handleKeypadPress = (key: string) => {
    const isOut = keypadTarget === 'out_imei';
    const currentVal = isOut ? imeiOut : imeiIn;
    const setter = isOut ? setImeiOut : setImeiIn;

    if (key === 'backspace') {
      setter(currentVal.slice(0, -1));
      return;
    }

    if (!isOut && isSmartphone) {
      // Validación estricta de 15 dígitos numéricos para Smartphone IN
      if (currentVal.length < 15 && /\d/.test(key)) {
        setter(currentVal + key);
      }
    } else {
      const maxLen = isSmartphone ? 15 : 20;
      if (currentVal.length < maxLen) {
        setter((currentVal + key).toUpperCase());
      }
    }
  };

  // ---------------------------------------------------------------------------
  // MODAL DE CÁMARA DE EVIDENCIA (IDÉNTICA A LA AUDITORÍA COMPLETA)
  // ---------------------------------------------------------------------------
  if (cameraTarget) {
    const isOutCamera = cameraTarget === 'out_photo';
    return (
      <div className="w-full max-w-xl mx-auto min-h-[92dvh] sm:min-h-[640px] flex flex-col justify-between p-4 sm:p-6 bg-slate-950 text-white rounded-none sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-800">
        {/* Header idéntico a Auditoría Completa */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <button
            type="button"
            onClick={() => {
              stopCamera();
              setCameraTarget(null);
              setTempCapturedPhoto(null);
            }}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h2 className="text-sm sm:text-base font-black text-white">Foto de Evidencia</h2>
            <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider block">
              Directriz Oficial Xiaomi • {isOutCamera ? assignment.modeloSaliente : assignment.modeloEntrante}
            </span>
          </div>
          <div className="w-9 flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (tempCapturedPhoto) {
                  setTempCapturedPhoto(null);
                  startCamera(facingMode);
                } else {
                  const next = facingMode === 'environment' ? 'user' : 'environment';
                  setFacingMode(next);
                  startCamera(next);
                }
              }}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
              title="Girar Cámara / Repetir"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* VISOR DE CÁMARA CON MARCO GUÍA IDÉNTICO A AUDITORÍA COMPLETA (FORMATO 3:4) */}
        <div className="my-auto py-2 flex flex-col items-center">
          <div className="relative w-full max-w-[310px] sm:max-w-[340px] aspect-[3/4] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-700 flex items-center justify-center">
            {tempCapturedPhoto ? (
              <img
                src={tempCapturedPhoto}
                alt="Evidencia Capturada"
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
                  <div className="p-6 text-center space-y-3 z-10">
                    <Camera className="w-12 h-12 text-slate-500 mx-auto animate-pulse" />
                    <p className="text-xs text-slate-400">
                      {cameraError || 'Iniciando cámara en directo...'}
                    </p>
                    <div className="flex flex-col gap-2 pt-1">
                      <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#009ca6] text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-[#008992] transition">
                        <Upload className="w-4 h-4" />
                        <span>Abrir Cámara / Galería</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleFilePhotoUpload}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => generateDemoPhoto(cameraTarget)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-teal-200 rounded-xl text-[11px] font-bold cursor-pointer transition border border-white/15"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generar Foto de Prueba</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* OVERLAY DEL MARCO GUÍA SEGÚN DIRECTRIZ (IDÉNTICO A AUDITORÍA COMPLETA) */}
            <div className="absolute inset-3 sm:inset-4 pointer-events-none border-2 border-dashed border-teal-400/80 rounded-2xl flex flex-col justify-between p-2 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
              {/* 4 Esquinas sólidas */}
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-teal-300 rounded-tl-sm" />
              <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-teal-300 rounded-tr-sm" />
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-teal-300 rounded-bl-sm" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-teal-300 rounded-br-sm" />

              {/* Zona Superior: Dispositivo en Peana (60%) */}
              <div className="flex-[60] border border-dashed border-teal-400/40 rounded-xl flex flex-col items-center justify-center p-2 bg-teal-500/10 backdrop-blur-[0.5px]">
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-950/80 text-teal-300 text-[10px] font-black border border-teal-400/40 shadow-xs mb-1">
                  <Smartphone className="w-3 h-3" />
                  <span>1. Dispositivo en Soporte</span>
                </div>
                <span className="text-[9px] text-teal-200/80 font-medium">
                  Encuadrar terminal erguido
                </span>
              </div>

              {/* Separador con etiqueta */}
              <div className="my-1 border-t border-teal-400/50 border-dashed relative">
                <span className="absolute left-1/2 -top-2 -translate-x-1/2 px-2 py-0.2 bg-slate-950/90 text-[8px] font-bold text-teal-300 uppercase tracking-widest rounded-full">
                  Base de Mesa
                </span>
              </div>

              {/* Zona Inferior: Cartela de Precio y Ficha Técnica (40%) */}
              <div className="flex-[40] border border-dashed border-amber-400/50 rounded-xl flex flex-col items-center justify-center p-2 bg-amber-500/10 backdrop-blur-[0.5px]">
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-950/80 text-amber-300 text-[10px] font-black border border-amber-400/40 shadow-xs mb-1">
                  <span>2. Ficha Técnica y Precio</span>
                </div>
                <span className="text-[9px] text-amber-200/90 font-medium">
                  Cartela frontal y etiqueta visible
                </span>
              </div>
            </div>

            {/* Indicador superior directo */}
            <div className="absolute top-2 left-2 right-2 flex justify-between pointer-events-none">
              <span className="px-2 py-0.5 bg-slate-950/80 text-teal-300 text-[9px] font-bold rounded-md border border-teal-500/30">
                Formato 3:4
              </span>
              {tempCapturedPhoto && (
                <span className="px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-black rounded-md flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Capturada
                </span>
              )}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-2 text-center max-w-xs">
            Alinea el terminal en el soporte arriba y la etiqueta de precio/cartela en la parte inferior.
          </p>
        </div>

        {/* CONTROLES INFERIORES IDÉNTICOS A AUDITORÍA COMPLETA */}
        <div className="pt-2 max-w-sm mx-auto w-full">
          {tempCapturedPhoto ? (
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setTempCapturedPhoto(null);
                  startCamera(facingMode);
                }}
                className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold rounded-2xl text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Repetir</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (cameraTarget === 'out_photo') {
                    setFotoOutUrl(tempCapturedPhoto);
                  } else {
                    setFotoInUrl(tempCapturedPhoto);
                  }
                  stopCamera();
                  setTempCapturedPhoto(null);
                  setCameraTarget(null);
                }}
                className="flex-[2] py-3.5 bg-gradient-to-r from-[#009ca6] to-[#00b4bf] hover:from-[#008992] hover:to-[#00a3ad] active:scale-95 text-white font-black rounded-2xl text-xs sm:text-sm shadow-xl shadow-[#009ca6]/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Aceptar y Adjuntar</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <label className="px-3.5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-4 h-4 text-teal-400" />
                <span>Subir Foto</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFilePhotoUpload}
                  className="hidden"
                />
              </label>

              {cameraActive && (
                <button
                  type="button"
                  onClick={captureFromVideo}
                  disabled={isCompressing}
                  className="w-20 h-20 rounded-full border-4 border-teal-400 p-1 flex items-center justify-center transition active:scale-90 cursor-pointer"
                  title="Disparar Fotografía"
                >
                  <div className="w-full h-full rounded-full bg-white hover:bg-teal-50 transition flex items-center justify-center shadow-lg">
                    <div className="w-6 h-6 rounded-full bg-[#009ca6]" />
                  </div>
                </button>
              )}

              <button
                type="button"
                onClick={() => generateDemoPhoto(cameraTarget)}
                className="px-3.5 py-3 rounded-2xl bg-teal-950/90 hover:bg-teal-900 border border-teal-500/40 text-teal-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span>Foto Prueba</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // MODAL DE TECLADO MANUAL TÁCTIL (PARA IMEI OUT O IMEI IN)
  // ---------------------------------------------------------------------------
  if (keypadTarget) {
    const isOutKeypad = keypadTarget === 'out_imei';
    const currentVal = isOutKeypad ? imeiOut : imeiIn;
    const strict15Digits = !isOutKeypad && isSmartphone;

    return (
      <div className="w-full max-w-xl mx-auto min-h-[92dvh] sm:min-h-[640px] flex flex-col justify-between bg-white text-slate-800 rounded-none sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="px-5 py-4 bg-gradient-to-r from-[#072431] via-[#104a60] to-[#0a3343] text-white flex items-center justify-between">
          <button
            type="button"
            onClick={() => setKeypadTarget(null)}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300 block">
              {isOutKeypad ? 'PASO 1 · Retirada (OUT)' : 'PASO 2 · Instalación (IN)'}
            </span>
            <h2 className="text-sm sm:text-base font-black text-white">
              {isOutKeypad ? 'IMEI / S.N. Retirado' : 'Nuevo IMEI / S.N. Instalado'}
            </h2>
          </div>
          <div className="w-9" />
        </div>

        <div className="p-5 space-y-3 flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              {isOutKeypad ? 'Modelo Saliente' : 'Modelo Nuevo a Implantar'}
            </span>
            <h3 className="text-base font-black text-slate-900">
              {isOutKeypad ? assignment.modeloSaliente : assignment.modeloEntrante}
            </h3>
          </div>

          <div className="bg-slate-50 border-2 border-[#009ca6] rounded-2xl p-3.5 flex items-center justify-between">
            <input
              type="text"
              readOnly
              value={currentVal}
              placeholder={strict15Digits ? '863142080419480 (15 dígitos)' : 'Introduce IMEI o N.º de Serie'}
              className="w-full bg-transparent font-mono text-base sm:text-lg font-black text-slate-900 tracking-wider focus:outline-none"
            />
            {currentVal && (
              <button
                type="button"
                onClick={() => (isOutKeypad ? setImeiOut('') : setImeiIn(''))}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] px-1">
            <span className="text-slate-500">
              {strict15Digits
                ? 'Validación estricta: 15 dígitos numéricos (Smartphone)'
                : 'Longitud requerida: 12 a 20 caracteres'}
            </span>
            <span
              className={`font-mono font-black ${
                strict15Digits
                  ? currentVal.length === 15
                    ? 'text-emerald-600'
                    : 'text-amber-600'
                  : 'text-[#009ca6]'
              }`}
            >
              {currentVal.length} / {strict15Digits ? 15 : 20}
            </span>
          </div>

          {/* Botón rápido de autocompletado de prueba para agilidad en Mac */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => {
                if (isOutKeypad) {
                  setImeiOut('869241073812945');
                } else {
                  setImeiIn(isSmartphone ? '863142080419480' : '68707/EFAPBS6QD00345');
                }
              }}
              className="text-[11px] font-bold text-[#009ca6] bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1 rounded-full cursor-pointer transition"
            >
              Autocompletar IMEI válido de ejemplo ({isOutKeypad ? '869241073812945' : '863142080419480'})
            </button>
          </div>

          {!strict15Digits && (
            <div className="flex justify-center">
              <div className="inline-flex bg-slate-200/80 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setKeypadMode('123')}
                  className={`px-4 py-1 text-xs font-black rounded-lg cursor-pointer ${
                    keypadMode === '123' ? 'bg-[#009ca6] text-white' : 'text-slate-600'
                  }`}
                >
                  123 Números
                </button>
                <button
                  type="button"
                  onClick={() => setKeypadMode('ABC')}
                  className={`px-4 py-1 text-xs font-black rounded-lg cursor-pointer ${
                    keypadMode === 'ABC' ? 'bg-[#009ca6] text-white' : 'text-slate-600'
                  }`}
                >
                  ABC Letras
                </button>
              </div>
            </div>
          )}

          {strict15Digits || keypadMode === '123' ? (
            <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto w-full pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleKeypadPress(digit)}
                  className="py-3.5 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200/80 text-slate-800 font-black text-xl rounded-2xl shadow-2xs cursor-pointer"
                >
                  {digit}
                </button>
              ))}
              <div />
              <button
                type="button"
                onClick={() => handleKeypadPress('0')}
                className="py-3.5 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200/80 text-slate-800 font-black text-xl rounded-2xl shadow-2xs cursor-pointer"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress('backspace')}
                className="py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xl rounded-2xl shadow-2xs cursor-pointer"
              >
                ⌫
              </button>
            </div>
          ) : (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-center gap-1">
                {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => handleKeypadPress(l)}
                    className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-black text-sm rounded-xl cursor-pointer"
                  >
                    {l}
                  </button>
                ))}
              </div>
              <div className="flex justify-center gap-1 px-2">
                {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => handleKeypadPress(l)}
                    className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-black text-sm rounded-xl cursor-pointer"
                  >
                    {l}
                  </button>
                ))}
              </div>
              <div className="flex justify-center gap-1">
                {['Z', 'X', 'C', 'V', 'B', 'N', 'M', '/'].map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => handleKeypadPress(l)}
                    className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-black text-sm rounded-xl cursor-pointer"
                  >
                    {l}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleKeypadPress('backspace')}
                  className="px-3 py-3 bg-slate-200 text-slate-800 font-black text-sm rounded-xl cursor-pointer"
                >
                  ⌫
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-5 bg-white border-t border-slate-200">
          <button
            type="button"
            onClick={() => setKeypadTarget(null)}
            className="w-full bg-[#009ca6] hover:bg-[#008892] text-white font-black py-4 rounded-2xl shadow-lg text-sm cursor-pointer"
          >
            Confirmar Código
          </button>
        </div>
      </div>
    );
  }

  // Condiciones de aparición progresiva para no recargar la pantalla
  const showOutImeiStep = tipoOut === 'LDU';
  const showOutPhotoStep =
    (tipoOut === 'LDU' && (imeiOut.trim().length >= 4 || Boolean(motivoIncidenciaOut))) ||
    motivoIncidenciaOut === 'Terminal ausente / Posible robo';

  // En 2. Instalar: tanto si elige LDU como DUMMY primero pide escanear/introducir el IMEI,
  // y tras escanear el IMEI pide hacer la foto de evidencia (la misma que en la auditoría completa)
  const showInImeiStep = tipoIn !== null;
  const showInPhotoStep =
    tipoIn !== null && (inValidation.valid || Boolean(motivoIncidenciaIn));

  const canSaveFinal =
    (tipoOut === 'DUMMY' || Boolean(fotoOutUrl)) &&
    tipoIn !== null &&
    Boolean(fotoInUrl) &&
    (inValidation.valid || Boolean(motivoIncidenciaIn));

  // ---------------------------------------------------------------------------
  // PANTALLA PRINCIPAL DEL FLUJO DE DISPOSITIVOS (PROGRESIVO PASO A PASO)
  // ---------------------------------------------------------------------------
  return (
    <div className="w-full max-w-2xl mx-auto min-h-[92dvh] sm:min-h-[620px] flex flex-col bg-white text-slate-800 rounded-none sm:rounded-3xl shadow-2xl relative overflow-hidden border border-slate-200/80">
      {/* HEADER COMPACTO */}
      <div className="px-4 sm:px-5 py-3.5 bg-gradient-to-r from-[#072431] via-[#104a60] to-[#0a3343] text-white flex items-center justify-between sticky top-0 z-20 shadow-md">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <span className="text-[10px] font-black text-[#ff6900] uppercase tracking-wider block">
            Cambio Puesto {String(position.posicionNumero).padStart(2, '0')}
          </span>
          <h2 className="text-sm sm:text-base font-black text-white">
            {position.mesaId} • {store.nombreTienda}
          </h2>
        </div>

        <div className="w-9 flex justify-end">
          <img
            src="./images/xiaomi_logo.png"
            alt="Xiaomi"
            className="w-6 h-6 rounded-md object-cover shadow-xs"
          />
        </div>
      </div>

      {/* PESTAÑAS DE FASE: 1. RETIRAR / 2. INSTALAR */}
      <div className="px-4 sm:px-6 pt-3 bg-slate-50 border-b border-slate-200 flex gap-2">
        <button
          type="button"
          onClick={() => setActivePhase('step1_out')}
          className={`flex-1 py-2.5 px-3 rounded-t-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 border-b-3 transition cursor-pointer ${
            activePhase === 'step1_out'
              ? 'bg-white text-[#104a60] border-[#009ca6] shadow-2xs'
              : 'bg-slate-100/80 text-slate-500 border-transparent hover:text-slate-800'
          }`}
        >
          <PackageMinus className="w-4 h-4 text-amber-600" />
          <span>1. Retirar</span>
          {isStep1Complete && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
        </button>

        <button
          type="button"
          onClick={() => setActivePhase('step2_in')}
          className={`flex-1 py-2.5 px-3 rounded-t-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 border-b-3 transition cursor-pointer ${
            activePhase === 'step2_in'
              ? 'bg-white text-[#104a60] border-[#009ca6] shadow-2xs'
              : 'bg-slate-100/80 text-slate-500 border-transparent hover:text-slate-800'
          }`}
        >
          <PackagePlus className="w-4 h-4 text-[#009ca6]" />
          <span>2. Instalar</span>
          {isStep2Complete && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
        </button>
      </div>

      {/* CONTENIDO PRINCIPAL PROGRESIVO */}
      <div className="p-4 sm:p-6 space-y-5 flex-1 overflow-y-auto">
        {activePhase === 'step1_out' ? (
          /* ================================================================
             PASO 1 · RETIRAR DISPOSITIVO (PROGRESIVO)
             ================================================================ */
          <div className="space-y-4 animate-fadeIn">
            {/* Tarjeta simple del modelo a retirar */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                <PackageMinus className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 block">
                  Dispositivo a retirar
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {assignment.modeloSaliente}
                </h3>
              </div>
            </div>

            {/* PASO 1.1: Seleccionar primero LDU o DUMMY (Sin texto de relleno) */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                ¿Qué tipo de dispositivo retiras?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setTipoOut('LDU');
                    if (imeiOut === 'DUMMY' || imeiOut === 'MAQUETA-RETIRADA') {
                      setImeiOut('');
                    }
                  }}
                  className={`py-4 px-4 rounded-2xl font-black text-sm sm:text-base border-2 transition flex items-center justify-center gap-2 cursor-pointer ${
                    tipoOut === 'LDU'
                      ? 'bg-[#009ca6] text-white border-[#009ca6] shadow-md'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                  }`}
                >
                  <span>LDU</span>
                  {tipoOut === 'LDU' && <CheckCircle2 className="w-4 h-4 text-white" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTipoOut('DUMMY');
                    setImeiOut('DUMMY');
                    // Al marcar DUMMY pasamos directamente al siguiente paso para instalar el nuevo dispositivo
                    setActivePhase('step2_in');
                  }}
                  className={`py-4 px-4 rounded-2xl font-black text-sm sm:text-base border-2 transition flex items-center justify-center gap-2 cursor-pointer ${
                    tipoOut === 'DUMMY'
                      ? 'bg-orange-600 text-white border-orange-600 shadow-md'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                  }`}
                >
                  <span>DUMMY</span>
                  {tipoOut === 'DUMMY' && <CheckCircle2 className="w-4 h-4 text-white" />}
                </button>
              </div>
            </div>

            {/* Si marcó DUMMY y volvió atrás, le informamos que ya puede pasar al Paso 2 */}
            {tipoOut === 'DUMMY' && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-2 animate-fadeIn">
                <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>DUMMY seleccionado (no requiere IMEI ni foto de retirada)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActivePhase('step2_in')}
                  className="px-3 py-1.5 rounded-xl bg-[#009ca6] text-white text-xs font-black cursor-pointer shrink-0"
                >
                  Ir a Instalar →
                </button>
              </div>
            )}

            {/* PASO 1.2: Si es LDU, aparece automáticamente el espacio para escanear o introducir el IMEI */}
            {showOutImeiStep && (
              <div className="space-y-2.5 pt-2 border-t border-slate-100 animate-fadeIn">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                  IMEI del dispositivo retirado
                </label>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setScannerTarget('out')}
                    className="bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-[#009ca6] rounded-2xl p-3 text-left flex items-center gap-2.5 transition shadow-2xs cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-[#009ca6] text-white flex items-center justify-center shrink-0">
                      <Camera className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black text-slate-900">Escanear IMEI</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setKeypadTarget('out_imei')}
                    className="bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-[#009ca6] rounded-2xl p-3 text-left flex items-center gap-2.5 transition shadow-2xs cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      <Edit3 className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black text-slate-900">Manual</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={imeiOut}
                    onChange={(e) => setImeiOut(e.target.value)}
                    placeholder="Escanea o escribe el IMEI aquí..."
                    className={`w-full rounded-2xl px-4 py-3 text-sm font-mono font-black transition ${
                      imeiOut
                        ? 'bg-emerald-50/70 border-2 border-emerald-500/80 text-emerald-950'
                        : 'bg-slate-50 border border-slate-300 text-slate-800'
                    }`}
                  />
                  {imeiOut && (
                    <button
                      type="button"
                      onClick={() => setImeiOut('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-600 p-1.5 rounded-xl cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* PASO 1.3: Tras rellenar el IMEI (o si hay incidencia), aparece la foto de evidencia con los marcos */}
            {showOutPhotoStep && (
              <div className="space-y-2 pt-2 border-t border-slate-100 animate-fadeIn">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                  {motivoIncidenciaOut === 'Terminal ausente / Posible robo'
                    ? 'Foto de evidencia (Espacio vacío)'
                    : 'Foto de evidencia con marco guía'}
                </label>

                {!fotoOutUrl ? (
                  <button
                    type="button"
                    onClick={() => {
                      setTempCapturedPhoto(null);
                      setCameraTarget('out_photo');
                    }}
                    className={`w-full py-4 px-4 text-white font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg cursor-pointer transition ${
                      motivoIncidenciaOut === 'Terminal ausente / Posible robo'
                        ? 'bg-gradient-to-r from-rose-600 to-amber-600 hover:brightness-110'
                        : 'bg-gradient-to-r from-[#104a60] to-[#009ca6] hover:brightness-110'
                    }`}
                  >
                    <Camera className="w-5 h-5 text-white" />
                    <span>
                      {motivoIncidenciaOut === 'Terminal ausente / Posible robo'
                        ? 'Hacer Foto del Espacio Vacío'
                        : 'Hacer Foto de Evidencia (con Marcos)'}
                    </span>
                  </button>
                ) : (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-18 rounded-xl overflow-hidden border border-emerald-300 bg-black shrink-0">
                        <img
                          src={fotoOutUrl}
                          alt="Evidencia OUT"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-emerald-800 font-black text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Foto de evidencia guardada</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setTempCapturedPhoto(fotoOutUrl);
                            setCameraTarget('out_photo');
                          }}
                          className="text-[11px] font-bold text-[#009ca6] hover:underline mt-1 cursor-pointer"
                        >
                          Ver / Repetir foto
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFotoOutUrl(undefined)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* ================================================================
             PASO 2 · INSTALAR NUEVO DISPOSITIVO (PROGRESIVO)
             ================================================================ */
          <div className="space-y-4 animate-fadeIn">
            {/* Tarjeta simple del nuevo modelo a instalar */}
            <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white border border-teal-200 flex items-center justify-center text-[#009ca6] shrink-0">
                <PackagePlus className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#009ca6] block">
                  Nuevo dispositivo a instalar
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {assignment.modeloEntrante}
                </h3>
              </div>
            </div>

            {/* PASO 2.1: Seleccionar primero LDU o DUMMY (Sin texto de relleno) */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                ¿Qué tipo de dispositivo instalas?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTipoIn('LDU')}
                  className={`py-4 px-4 rounded-2xl font-black text-sm sm:text-base border-2 transition flex items-center justify-center gap-2 cursor-pointer ${
                    tipoIn === 'LDU'
                      ? 'bg-[#009ca6] text-white border-[#009ca6] shadow-md'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                  }`}
                >
                  <span>LDU</span>
                  {tipoIn === 'LDU' && <CheckCircle2 className="w-4 h-4 text-white" />}
                </button>

                <button
                  type="button"
                  onClick={() => setTipoIn('DUMMY')}
                  className={`py-4 px-4 rounded-2xl font-black text-sm sm:text-base border-2 transition flex items-center justify-center gap-2 cursor-pointer ${
                    tipoIn === 'DUMMY'
                      ? 'bg-orange-600 text-white border-orange-600 shadow-md'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                  }`}
                >
                  <span>DUMMY</span>
                  {tipoIn === 'DUMMY' && <CheckCircle2 className="w-4 h-4 text-white" />}
                </button>
              </div>
            </div>

            {/* PASO 2.2: Tanto si es LDU como DUMMY, aparece el espacio para escanear o introducir el IMEI */}
            {showInImeiStep && (
              <div className="space-y-2.5 pt-2 border-t border-slate-100 animate-fadeIn">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                  IMEI del nuevo dispositivo ({tipoIn})
                </label>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setScannerTarget('in')}
                    className="bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-[#009ca6] rounded-2xl p-3 text-left flex items-center gap-2.5 transition shadow-2xs cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-[#009ca6] text-white flex items-center justify-center shrink-0">
                      <Camera className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black text-slate-900">Escanear IMEI</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setKeypadTarget('in_imei')}
                    className="bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-[#009ca6] rounded-2xl p-3 text-left flex items-center gap-2.5 transition shadow-2xs cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      <Edit3 className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black text-slate-900">Manual</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={imeiIn}
                    onChange={(e) => setImeiIn(e.target.value.slice(0, 20))}
                    placeholder="Escanea o escribe el IMEI aquí..."
                    className={`w-full rounded-2xl px-4 py-3 text-sm font-mono font-black transition ${
                      imeiIn && inValidation.valid
                        ? 'bg-emerald-50/70 border-2 border-emerald-500/80 text-emerald-950'
                        : 'bg-slate-50 border border-slate-300 text-slate-800'
                    }`}
                  />
                  {imeiIn && (
                    <button
                      type="button"
                      onClick={() => setImeiIn('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-600 p-1.5 rounded-xl cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {imeiIn && inValidation.valid && (
                  <div className="text-[11px] flex items-center gap-1.5">
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>IMEI registrado · Ahora realiza la foto de evidencia</span>
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* PASO 2.3: Tras escanear/introducir el IMEI (tanto LDU como DUMMY), pide la Foto de Evidencia (la misma que en la auditoría completa) */}
            {showInPhotoStep && (
              <div className="space-y-2 pt-2 border-t border-slate-100 animate-fadeIn">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                  Foto de evidencia (Dispositivo en soporte + Ficha técnica)
                </label>

                {!fotoInUrl ? (
                  <button
                    type="button"
                    onClick={() => {
                      setTempCapturedPhoto(null);
                      setCameraTarget('in_photo');
                    }}
                    className="w-full py-4 px-4 bg-gradient-to-r from-[#009ca6] to-[#00b4bf] hover:brightness-110 text-white font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-[#009ca6]/25 cursor-pointer transition"
                  >
                    <Camera className="w-5 h-5 text-white" />
                    <span>Hacer Foto de Evidencia (con Marcos)</span>
                  </button>
                ) : (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-18 rounded-xl overflow-hidden border border-emerald-300 bg-black shrink-0">
                        <img
                          src={fotoInUrl}
                          alt="Evidencia IN"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-emerald-800 font-black text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Foto de evidencia guardada</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setTempCapturedPhoto(fotoInUrl);
                            setCameraTarget('in_photo');
                          }}
                          className="text-[11px] font-bold text-[#009ca6] hover:underline mt-1 cursor-pointer"
                        >
                          Ver / Repetir foto
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFotoInUrl(undefined)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================================================================
            SECCIÓN DE INCIDENCIAS (MANTENIDA TAL CUAL)
            ================================================================ */}
        <div className="pt-3 border-t border-slate-200 space-y-3">
          {(() => {
            const isOutPhase = activePhase === 'step1_out';
            const currentMotivo = isOutPhase ? motivoIncidenciaOut : motivoIncidenciaIn;
            const hasCurrentPhaseIncident = Boolean(currentMotivo);

            return (
              <>
                <div
                  onClick={() => setShowIncidentDrawer(!showIncidentDrawer)}
                  className={`w-full rounded-2xl p-3.5 border flex items-center justify-between transition cursor-pointer ${
                    hasCurrentPhaseIncident
                      ? 'bg-rose-50/50 border-rose-400 ring-2 ring-rose-200'
                      : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        hasCurrentPhaseIncident ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-600'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900">
                        Reportar incidencia
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {currentMotivo || 'Pulsa aquí si hay algún problema'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasCurrentPhaseIncident && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isOutPhase) {
                            setMotivoIncidenciaOut('');
                          } else {
                            setMotivoIncidenciaIn('');
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-rose-300 text-[11px] font-black text-rose-700 hover:bg-rose-100 cursor-pointer"
                      >
                        Quitar
                      </button>
                    )}
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform ${
                        showIncidentDrawer ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>

                {showIncidentDrawer && (
                  <div className="p-4 bg-rose-50/40 border border-rose-200 rounded-2xl space-y-2.5 animate-fadeIn">
                    <label className="block text-[11px] font-black text-slate-700 uppercase">
                      {isOutPhase
                        ? 'Selecciona motivo en salida de producto:'
                        : 'Selecciona motivo en producto nuevo:'}
                    </label>

                    <div className="grid grid-cols-1 gap-2">
                      {(isOutPhase ? SWAP_OUT_INCIDENT_MOTIVOS : SWAP_IN_INCIDENT_MOTIVOS).map(
                        (motivo) => {
                          const isSelected = currentMotivo === motivo;
                          return (
                            <button
                              key={motivo}
                              type="button"
                              onClick={() => {
                                if (isOutPhase) {
                                  setMotivoIncidenciaOut(
                                    isSelected ? '' : (motivo as SwapOutIncidentMotivo)
                                  );
                                } else {
                                  setMotivoIncidenciaIn(
                                    isSelected ? '' : (motivo as SwapInIncidentMotivo)
                                  );
                                }
                              }}
                              className={`w-full text-left px-3.5 py-3 rounded-xl border text-xs sm:text-sm font-bold transition flex items-center justify-between gap-2 cursor-pointer ${
                                isSelected
                                  ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                                  : 'bg-white hover:bg-rose-50 text-slate-800 border-rose-200'
                              }`}
                            >
                              <div>
                                <span>{motivo}</span>
                                {motivo === 'Terminal ausente / Posible robo' && (
                                  <span
                                    className={`block text-[10px] font-semibold mt-0.5 ${
                                      isSelected ? 'text-rose-100' : 'text-rose-600'
                                    }`}
                                  >
                                    * Se requerirá foto con el espacio vacío
                                  </span>
                                )}
                              </div>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
                            </button>
                          );
                        }
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {hasCurrentPhaseIncident ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (isOutPhase) {
                              setMotivoIncidenciaOut('');
                            } else {
                              setMotivoIncidenciaIn('');
                            }
                          }}
                          className="text-xs font-bold text-rose-700 hover:underline cursor-pointer"
                        >
                          Quitar incidencia
                        </button>
                      ) : (
                        <span />
                      )}
                      <button
                        type="button"
                        onClick={() => setShowIncidentDrawer(false)}
                        className="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>

      {/* FOOTER PROGRESIVO (SOLO APARECE EL BOTÓN CUANDO TOCA AVANZAR O GUARDAR) */}
      {(activePhase === 'step2_in' || isStep1Complete) && (
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex items-center gap-3">
          {activePhase === 'step1_out' ? (
            <button
              type="button"
              onClick={handleContinueToStep2}
              className="w-full py-4 px-6 bg-gradient-to-r from-[#104a60] to-[#009ca6] hover:brightness-110 active:scale-[0.99] text-white font-black rounded-2xl shadow-xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <span>Siguiente: Instalar Nuevo Dispositivo</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setActivePhase('step1_out')}
                className="px-4 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs sm:text-sm cursor-pointer transition shrink-0"
              >
                ‹ Atrás
              </button>
              <button
                type="button"
                onClick={handleSaveAndFinishPosition}
                disabled={!canSaveFinal}
                className={`flex-1 py-4 px-5 font-black rounded-2xl shadow-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition ${
                  !canSaveFinal
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    : incidenciaActiva
                      ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white cursor-pointer hover:brightness-110'
                      : 'bg-gradient-to-r from-emerald-600 to-[#009ca6] text-white cursor-pointer hover:brightness-110'
                }`}
              >
                {!canSaveFinal ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Completa los pasos para guardar</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Confirmar y Guardar Cambio</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      )}

      {/* ESCÁNER DE CÁMARA INTELIGENTE (BARCODE / OCR) */}
      <ScannerModal
        isOpen={scannerTarget !== null}
        initialMode={isSmartphone ? 'barcode' : 'ocr'}
        deviceCategory={assignment.categoria}
        onClose={() => setScannerTarget(null)}
        onScanSuccess={(code) => {
          if (scannerTarget === 'out') {
            setImeiOut(code.trim());
          } else if (scannerTarget === 'in') {
            setImeiIn(code.trim().slice(0, 20));
          }
          setScannerTarget(null);
        }}
      />
    </div>
  );
};

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
import { DbService } from '../../services/dbService';
import {
  ArrowLeft,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Edit3,
  Lock,
  PackageMinus,
  PackagePlus,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Trash2,
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

// Opciones de incidencias para RETIRADA (APARTADO 2 · RETIRADA)
const SWAP_OUT_INCIDENT_MOTIVOS: SwapOutIncidentMotivo[] = [
  'Terminal ausente / Posible robo',
  'Terminal bloqueado / Sin encendido (Imei ilegible)',
  'Daño físico estético o funcional',
  'Alarma dañada'
];

// Opciones de incidencias para INSTALACIÓN (APARTADO 1 · INSTALACIÓN)
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
  // Apartado activo: 1. Instalación (Nuevo IMEI) | 2. Retirada (IMEI Saliente)
  const [activePhase, setActivePhase] = useState<'step1_in' | 'step2_out'>('step1_in');

  // Buscar IMEI previo memorizado en la última auditoría de la tienda
  const memorizedPreviousImei = React.useMemo(() => {
    try {
      const latest = DbService.getLatestAuditForStore(store.tiendaId);
      if (!latest || !latest.positions) return '';

      // 1. Si hay un modelo saliente específico definido en la asignación, buscar por ese modelo en Mesa 1
      if (assignment?.modeloSaliente) {
        const cleanSaliente = assignment.modeloSaliente
          .toLowerCase()
          .replace(/\s*\(.*?\)/g, '')
          .trim();
        if (cleanSaliente) {
          const modelMatch = latest.positions.find(
            (p) =>
              p.mesaId.toUpperCase().includes('MESA 1') &&
              p.modeloOficial.toLowerCase().includes(cleanSaliente) &&
              p.imeiSerial &&
              p.imeiSerial !== '-' &&
              !p.esMaqueta
          );
          if (modelMatch) return modelMatch.imeiSerial;
        }
      }

      // 2. Fallback a coincidencia por número de posición directa
      const match = latest.positions.find(
        (p) =>
          p.posicionNumero === position.posicionNumero &&
          (p.mesaId === position.mesaId || p.posicionId === position.id)
      );
      if (match && match.imeiSerial && match.imeiSerial !== '-' && !match.esMaqueta) {
        return match.imeiSerial;
      }
    } catch {}
    return '';
  }, [store.tiendaId, position, assignment]);

  // APARTADO 1 · INSTALACIÓN (NUEVO DISPOSITIVO)
  const [tipoIn, setTipoIn] = useState<'LDU' | 'DUMMY'>(
    currentState
      ? currentState.esDummyNuevo
        ? 'DUMMY'
        : 'LDU'
      : assignment.esDummyEntrante
      ? 'DUMMY'
      : 'LDU'
  );
  const esDummyNuevo = tipoIn === 'DUMMY';
  const [imeiIn, setImeiIn] = useState<string>(currentState?.imeiNuevo || '');
  const [fotoInUrl, setFotoInUrl] = useState<string | undefined>(currentState?.fotoInUrl);

  // APARTADO 2 · RETIRADA (DISPOSITIVO ANTERIOR)
  const [tipoOut, setTipoOut] = useState<'LDU' | 'DUMMY'>(
    currentState
      ? currentState.esDummyRetirado
        ? 'DUMMY'
        : 'LDU'
      : assignment.esDummySaliente
      ? 'DUMMY'
      : 'LDU'
  );
  const esDummyRetirado = tipoOut === 'DUMMY';
  const [imeiOut, setImeiOut] = useState<string>(
    currentState?.imeiRetirado || memorizedPreviousImei || ''
  );
  const [fotoOutUrl, setFotoOutUrl] = useState<string | undefined>(currentState?.fotoOutUrl);

  // INCIDENCIAS
  const [motivoIncidenciaIn, setMotivoIncidenciaIn] = useState<SwapInIncidentMotivo | ''>(
    currentState?.motivoIncidenciaIn || ''
  );
  const [motivoIncidenciaOut, setMotivoIncidenciaOut] = useState<SwapOutIncidentMotivo | ''>(
    currentState?.motivoIncidenciaOut || ''
  );
  const [showIncidentDrawer, setShowIncidentDrawer] = useState<boolean>(
    Boolean(currentState?.motivoIncidenciaOut || currentState?.motivoIncidenciaIn || currentState?.incidenciaActiva)
  );

  const incidenciaActiva = Boolean(motivoIncidenciaOut || motivoIncidenciaIn);

  // Escáner y Teclado Manual
  const [scannerTarget, setScannerTarget] = useState<'out' | 'in' | null>(null);
  const [keypadTarget, setKeypadTarget] = useState<KeypadTarget>(null);
  const [keypadMode, setKeypadMode] = useState<'123' | 'ABC'>('123');

  // Cámara con marco oficial
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
        setCameraError('Cámara web directa no disponible. Adjunta foto con el botón inferior.');
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
      setCameraError('No se pudo iniciar la cámara en directo.');
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

  // Validación de IMEI del nuevo dispositivo
  const validateNewImeiFormat = (val: string): { valid: boolean; reason?: string } => {
    if (esDummyNuevo) return { valid: true };
    const clean = val.trim();
    if (clean.length < 4) {
      return {
        valid: false,
        reason: 'Introduce o escanea el IMEI del nuevo dispositivo.'
      };
    }
    return { valid: true };
  };

  const inValidation = validateNewImeiFormat(imeiIn);
  const isStep1Complete = esDummyNuevo || inValidation.valid || Boolean(motivoIncidenciaIn);

  // Validación de retirada
  const isOutExemptFromImei =
    esDummyRetirado ||
    motivoIncidenciaOut === 'Terminal ausente / Posible robo' ||
    motivoIncidenciaOut === 'Terminal bloqueado / Sin encendido (Imei ilegible)';

  const canSaveFinal =
    isStep1Complete &&
    (isOutExemptFromImei || imeiOut.trim().length >= 4 || Boolean(motivoIncidenciaOut) || true);

  const handleSaveAndFinishPosition = () => {
    if (!esDummyNuevo && !motivoIncidenciaIn && !inValidation.valid) {
      alert('Introduce o escanea el IMEI del nuevo dispositivo instalado.');
      return;
    }

    const nowFormatted = new Date().toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const hasInstallIncident = Boolean(motivoIncidenciaIn);

    const swapState: PositionSwapState = {
      posicionId: position.id,
      mesaId: position.mesaId,
      posicionNumero: position.posicionNumero,
      categoria: assignment.categoria,
      modeloRetirado: assignment.modeloSaliente,
      esDummyRetirado,
      imeiRetirado: esDummyRetirado ? 'DUMMY' : imeiOut.trim() || memorizedPreviousImei || 'No registrado',
      fotoOutUrl,
      modeloNuevo: assignment.modeloEntrante,
      esDummyNuevo,
      imeiNuevo: esDummyNuevo
        ? 'DUMMY'
        : imeiIn.trim() || (motivoIncidenciaIn ? `No instalado (${motivoIncidenciaIn})` : 'Pendiente'),
      fotoInUrl,
      estadoSwap: hasInstallIncident ? 'Incidencia' : 'OK',
      incidenciaActiva: hasInstallIncident,
      motivoIncidencia: motivoIncidenciaIn as any,
      motivoIncidenciaOut: '',
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
  // MODAL DE CÁMARA
  // ---------------------------------------------------------------------------
  if (cameraTarget) {
    const isOutCamera = cameraTarget === 'out_photo';
    return (
      <div className="w-full max-w-xl mx-auto min-h-[92dvh] sm:min-h-[640px] flex flex-col justify-between p-4 sm:p-6 bg-slate-950 text-white rounded-none sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-800">
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
              {isOutCamera ? `Retirada: ${assignment.modeloSaliente}` : `Instalación: ${assignment.modeloEntrante}`}
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
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="my-auto py-2 flex flex-col items-center">
          <div className="relative w-full max-w-[310px] sm:max-w-[340px] aspect-[3/4] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-700 flex items-center justify-center">
            {tempCapturedPhoto ? (
              <img src={tempCapturedPhoto} alt="Evidencia" className="w-full h-full object-cover" />
            ) : (
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
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex flex-col gap-2.5">
          {!tempCapturedPhoto ? (
            <button
              type="button"
              onClick={captureFromVideo}
              disabled={isCompressing}
              className="w-full py-4 bg-gradient-to-r from-[#009ca6] to-[#00b4bf] text-white font-black rounded-2xl shadow-lg cursor-pointer"
            >
              {isCompressing ? 'Procesando...' : 'Capturar Foto'}
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setTempCapturedPhoto(null);
                  startCamera(facingMode);
                }}
                className="py-3.5 bg-slate-800 text-slate-200 font-bold rounded-2xl cursor-pointer"
              >
                Repetir
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isOutCamera) {
                    setFotoOutUrl(tempCapturedPhoto);
                  } else {
                    setFotoInUrl(tempCapturedPhoto);
                  }
                  setCameraTarget(null);
                  setTempCapturedPhoto(null);
                  stopCamera();
                }}
                className="py-3.5 bg-emerald-600 text-white font-black rounded-2xl shadow-lg cursor-pointer"
              >
                Guardar Foto
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // TECLADO MANUAL
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
              {isOutKeypad ? '2. Retirada (OUT)' : '1. Instalación (IN)'}
            </span>
            <h2 className="text-sm sm:text-base font-black text-white">
              {isOutKeypad ? 'IMEI / S.N. Retirado' : 'Nuevo IMEI Instalado'}
            </h2>
          </div>
          <div className="w-9" />
        </div>

        <div className="p-5 space-y-3 flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              {isOutKeypad ? 'Modelo Retirado' : 'Modelo Nuevo Instalado'}
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
                ? 'Validación: 15 dígitos numéricos (Smartphone)'
                : 'Longitud requerida: 12 a 20 caracteres'}
            </span>
            <span className="font-mono font-black text-[#009ca6]">
              {currentVal.length} / {strict15Digits ? 15 : 20}
            </span>
          </div>

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

  // ---------------------------------------------------------------------------
  // PANTALLA PRINCIPAL: PLANOGRAMA NUEVO (INSTALACIÓN DEL NUEVO DISPOSITIVO)
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
          <span className="text-[10px] font-black text-[#00c4cc] uppercase tracking-wider block">
            Planograma Nuevo · Puesto {String(position.posicionNumero).padStart(2, '0')}
          </span>
          <h2 className="text-sm sm:text-base font-black text-white">
            {assignment.modeloEntrante} • {position.mesaId}
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

      {/* CONTENIDO: EXCLUSIVAMENTE INSTALACIÓN DEL NUEVO DISPOSITIVO */}
      <div className="p-4 sm:p-6 space-y-5 flex-1 overflow-y-auto">
        <div className="space-y-4 animate-fadeIn">
          {/* Tarjeta del nuevo modelo a instalar */}
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

          {/* Selección LDU vs DUMMY */}
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
              Tipo de terminal nuevo
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTipoIn('LDU')}
                className={`py-3 px-4 rounded-2xl font-black text-sm border-2 transition flex items-center justify-center gap-2 cursor-pointer ${
                  tipoIn === 'LDU'
                    ? 'bg-[#009ca6] text-white border-[#009ca6] shadow-md'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                }`}
              >
                <span>LDU (Operativo)</span>
                {tipoIn === 'LDU' && <CheckCircle2 className="w-4 h-4 text-white" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setTipoIn('DUMMY');
                  setScannerTarget(null);
                  setKeypadTarget(null);
                }}
                className={`py-3 px-4 rounded-2xl font-black text-sm border-2 transition flex items-center justify-center gap-2 cursor-pointer ${
                  tipoIn === 'DUMMY'
                    ? 'bg-orange-600 text-white border-orange-600 shadow-md'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                }`}
              >
                <span>DUMMY (Maqueta)</span>
                {tipoIn === 'DUMMY' && <CheckCircle2 className="w-4 h-4 text-white" />}
              </button>
            </div>
          </div>

          {/* Entrada del nuevo IMEI o Número de Serie instalado */}
          {tipoIn === 'LDU' && (
            <div className="space-y-2.5 pt-2 border-t border-slate-100 animate-fadeIn">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                {isSmartphone
                  ? 'IMEI del nuevo terminal instalado'
                  : 'Número de Serie (S/N) / IMEI del dispositivo instalado'}
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setScannerTarget('in')}
                  className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#009ca6] rounded-2xl p-3 text-left flex items-center gap-2.5 transition shadow-2xs cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-[#009ca6] text-white flex items-center justify-center shrink-0">
                    <Camera className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black text-slate-900">
                    {isSmartphone ? 'Escanear Cámara / OCR' : 'Escanear S/N en Pantalla'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setKeypadTarget('in_imei')}
                  className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#009ca6] rounded-2xl p-3 text-left flex items-center gap-2.5 transition shadow-2xs cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black text-slate-900">Teclado Manual</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={imeiIn}
                  onChange={(e) => setImeiIn(e.target.value.slice(0, 24))}
                  placeholder={
                    isSmartphone
                      ? 'Escribe o escanea el nuevo IMEI aquí...'
                      : 'Escanea o escribe el Número de Serie (ej. 58891/DPAK6H5RH00440)...'
                  }
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
                <div className="text-[11px] flex items-center gap-1.5 text-emerald-700 font-bold">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    {isSmartphone ? 'Nuevo IMEI' : 'Número de Serie'} registrado correctamente ({imeiIn})
                  </span>
                </div>
              )}
            </div>
          )}

          {tipoIn === 'DUMMY' && (
            <div className="p-4 bg-orange-50/80 border border-orange-200 rounded-2xl text-xs text-orange-950 font-bold flex items-center gap-3 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-orange-600 shrink-0" />
              <div>
                <span className="block font-black">Maqueta DUMMY seleccionada (Exenta de IMEI)</span>
                <span className="text-[11px] font-medium text-orange-800">
                  Las maquetas no requieren escanear ni introducir IMEI. Si es un dispositivo funcional, pulsa en "LDU (Operativo)" arriba para habilitar el escáner.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ================================================================
            SECCIÓN DE INCIDENCIAS DE INSTALACIÓN
            ================================================================ */}
        <div className="pt-3 border-t border-slate-200 space-y-3">
          {(() => {
            const currentMotivo = motivoIncidenciaIn;
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
                        Reportar incidencia en Instalación
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
                          setMotivoIncidenciaIn('');
                        }}
                        className="text-xs font-bold text-rose-600 hover:underline px-2 py-1"
                      >
                        Quitar
                      </button>
                    )}
                    <span className="text-xs font-bold text-slate-500">
                      {showIncidentDrawer ? 'Ocultar' : 'Elegir'}
                    </span>
                  </div>
                </div>

                {showIncidentDrawer && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 animate-fadeIn">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                      Motivos oficiales de incidencia de instalación
                    </span>
                    {SWAP_IN_INCIDENT_MOTIVOS.map((motivo) => {
                      const isSelected = motivoIncidenciaIn === motivo;
                      return (
                        <button
                          key={motivo}
                          type="button"
                          onClick={() => {
                            setMotivoIncidenciaIn(isSelected ? '' : (motivo as SwapInIncidentMotivo));
                          }}
                          className={`w-full text-left p-3 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-rose-600 text-white shadow-sm'
                              : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200/80'
                          }`}
                        >
                          <span>{motivo}</span>
                          {isSelected && <Check className="w-4 h-4 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>

      {/* FOOTER GUARDADO DIRECTO */}
      <div className="p-4 sm:p-5 bg-white border-t border-slate-200">
        <button
          type="button"
          onClick={handleSaveAndFinishPosition}
          disabled={!isStep1Complete}
          className={`w-full py-4 px-5 font-black rounded-2xl shadow-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition ${
            !isStep1Complete
              ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              : Boolean(motivoIncidenciaIn)
              ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white cursor-pointer hover:brightness-110'
              : 'bg-gradient-to-r from-[#009ca6] to-[#00b4bf] text-white cursor-pointer hover:brightness-110'
          }`}
        >
          <ShieldCheck className="w-5 h-5" />
          <span>Confirmar Instalación Puesto {String(position.posicionNumero).padStart(2, '0')}</span>
        </button>
      </div>

      {/* ESCÁNER DE CÁMARA INTELIGENTE (BARCODE / OCR) */}
      <ScannerModal
        isOpen={scannerTarget !== null}
        initialMode={isSmartphone ? 'barcode' : 'ocr'}
        deviceCategory={assignment.categoria}
        onClose={() => setScannerTarget(null)}
        onScanSuccess={(code) => {
          if (scannerTarget === 'out') {
            setImeiOut(code.trim().slice(0, 24));
          } else if (scannerTarget === 'in') {
            setImeiIn(code.trim().slice(0, 24));
          }
          setScannerTarget(null);
        }}
      />
    </div>
  );
};

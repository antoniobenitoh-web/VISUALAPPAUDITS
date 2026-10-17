import React, { useState, useRef, useEffect } from 'react';
import { PlanogramPosition, PositionAuditState, StoreCenter, UserProfile } from '../../types';
import { ScannerModal } from '../ScannerModal';
import { ImageCompressionService } from '../../services/imageCompressionService';
import { 
  ArrowLeft, 
  Barcode, 
  Edit3, 
  CheckCircle2, 
  Camera, 
  Smartphone, 
  Trash2, 
  X, 
  AlertTriangle, 
  RotateCcw, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight,
  Lock,
  Upload,
  Check
} from 'lucide-react';

interface DeviceIdentifyScreenProps {
  position: PlanogramPosition;
  store: StoreCenter;
  currentUser: UserProfile;
  currentState?: PositionAuditState;
  onConfirmSuccess: (state: PositionAuditState, andNext: boolean) => void;
  onBack: () => void;
}

type SubStep = 'identify' | 'manual_keypad' | 'camera_photo' | 'confirmation';

export const DeviceIdentifyScreen: React.FC<DeviceIdentifyScreenProps> = ({
  position,
  store,
  currentUser,
  currentState,
  onConfirmSuccess,
  onBack
}) => {
  const [subStep, setSubStep] = useState<SubStep>('identify');
  const [imei, setImei] = useState(currentState?.imeiSerial || '');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(currentState?.fotoEvidenciaUrl);
  const [isDummy, setIsDummy] = useState(currentState?.esMaqueta ?? position.esDummy);
  const [showScanner, setShowScanner] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [keypadMode, setKeypadMode] = useState<'123' | 'ABC'>('123');

  // Estados de cámara con marco de directriz
  const [tempCapturedPhoto, setTempCapturedPhoto] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const isSmartphone = position.categoria === 'Smartphone';

  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    stopCamera();
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Cámara web directa no disponible. Puedes usar el botón para abrir la cámara nativa de tu dispositivo.');
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
    } catch (err: any) {
      console.warn('Error starting camera stream:', err);
      setCameraActive(false);
      setCameraError('No se pudo acceder a la cámara en directo. Pulsa en "Abrir Cámara del Dispositivo" para capturar la evidencia.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (subStep === 'camera_photo' && !tempCapturedPhoto) {
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [subStep, tempCapturedPhoto]);

  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const captureFromVideo = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    try {
      setIsCompressing(true);
      const compressed = await ImageCompressionService.compressImage(dataUrl);
      setTempCapturedPhoto(compressed);
      stopCamera();
    } catch (err) {
      setTempCapturedPhoto(dataUrl);
      stopCamera();
    } finally {
      setIsCompressing(false);
    }
  };

  const handleValidate = () => {
    if (!isDummy) {
      if (isSmartphone && imei.trim().length < 15) {
        alert('Por favor introduce un IMEI válido de 15 dígitos numéricos (ej. 863142080419480).');
        return;
      }
      if (!isSmartphone && imei.trim().length < 6) {
        alert('Por favor introduce un número de serie válido (ej. 68707/EFAPBS6QD00345).');
        return;
      }
    }
    setSubStep('confirmation');
  };

  const handleKeypadPress = (val: string) => {
    if (val === 'backspace') {
      setImei(prev => prev.slice(0, -1));
    } else if (isSmartphone) {
      if (imei.length < 15 && /\d/.test(val)) {
        setImei(prev => prev + val);
      }
    } else {
      if (imei.length < 30) {
        setImei(prev => (prev + val).toUpperCase());
      }
    }
  };

  const handleCapturePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const compressed = await ImageCompressionService.compressImage(file);
      setTempCapturedPhoto(compressed);
      stopCamera();
    } catch (err) {
      alert('Error al procesar la foto.');
    } finally {
      setIsCompressing(false);
    }
  };

  const finalizeAudit = (andNext = true) => {
    if (!photoUrl) {
      alert('La fotografía de evidencia es obligatoria según la directriz de auditoría.');
      return;
    }

    const state: PositionAuditState = {
      posicionId: position.id,
      mesaId: position.mesaId,
      posicionNumero: position.posicionNumero,
      modeloOficial: position.modeloOficial,
      modeloDetectado: position.modeloOficial,
      imeiSerial: imei,
      estadoPosicion: 'OK',
      esMaqueta: isDummy,
      fotoEvidenciaUrl: photoUrl,
      auditadoPor: currentUser.nombre,
      fechaHora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    onConfirmSuccess(state, andNext);
  };

  return (
    <div className="w-full max-w-xl mx-auto min-h-[92dvh] sm:min-h-[640px] flex flex-col bg-white text-slate-800 rounded-none sm:rounded-3xl shadow-2xl relative overflow-hidden border border-slate-200/80 transition-all duration-300">
      
      {/* 1. SUBPASO: IDENTIFICAR DISPOSITIVO */}
      {subStep === 'identify' && (
        <div className="flex-1 flex flex-col justify-between">
          {/* Header Salesland Corporate */}
          <div className="px-5 py-4 bg-gradient-to-r from-[#072431] via-[#104a60] to-[#0a3343] text-white flex items-center justify-between sticky top-0 z-10 shadow-md">
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <span className="block text-[10px] font-bold text-teal-300 uppercase tracking-wider">
                Verificación de Terminal
              </span>
              <h2 className="text-sm sm:text-base font-black text-white">
                Puesto {String(position.posicionNumero).padStart(2, '0')} • {store.nombreTienda}
              </h2>
            </div>
            <div className="w-9 flex justify-end">
              <img src="./images/xiaomi_logo.png" alt="Xiaomi" className="w-6 h-6 rounded-md object-cover shadow-xs" />
            </div>
          </div>

          <div className="p-5 sm:p-7 space-y-5 flex-1 overflow-y-auto">
            {/* Tarjeta del Dispositivo Oficial Xiaomi */}
            <div className="bg-slate-50 border border-slate-200 p-4 sm:p-5 rounded-2xl flex items-center gap-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center p-2 shrink-0 shadow-2xs">
                <Smartphone className="w-8 h-8 text-[#104a60]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff6900]">
                    Oficial Xiaomi
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{position.categoria}</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                  {position.modeloOficial}
                </h3>
                <p className="text-xs text-teal-700 font-semibold mt-0.5">
                  Posición requerida: {position.mesaId} - #{position.posicionNumero}
                </p>
              </div>
            </div>

            {/* Opciones de Identificación */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Método de Lectura
              </label>

              {/* Botón Escáner Barcode */}
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                className="w-full bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-[#009ca6] rounded-2xl p-4 text-left flex items-center justify-between transition active:scale-[0.99] group shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-[#009ca6]/10 text-[#009ca6] flex items-center justify-center shrink-0 group-hover:bg-[#009ca6] group-hover:text-white transition">
                    <Barcode className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-[#104a60] transition-colors">
                      Escanear código de barras (IMEI)
                    </h4>
                    <p className="text-[11px] text-slate-500">Apunta con la cámara al código o marca *#06#</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#009ca6] group-hover:translate-x-0.5 transition" />
              </button>

              {/* Botón Entrada Manual */}
              <button
                type="button"
                onClick={() => setSubStep('manual_keypad')}
                className="w-full bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-[#009ca6] rounded-2xl p-4 text-left flex items-center justify-between transition active:scale-[0.99] group shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 group-hover:bg-[#104a60] group-hover:text-white transition">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-[#104a60] transition-colors">
                      Teclado numérico táctil
                    </h4>
                    <p className="text-[11px] text-slate-500">Para terminales sin cámara o introducción rápida</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#009ca6] group-hover:translate-x-0.5 transition" />
              </button>
            </div>

            {/* Input Directo de IMEI o Número de Serie */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {isSmartphone ? 'IMEI (15 dígitos)' : 'Número de Serie (S/N)'}
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {isSmartphone ? '863142080419480' : '68707/EFAPBS6QD00345'}
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={imei}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (isSmartphone) {
                      setImei(val.replace(/\D/g, '').slice(0, 15));
                    } else {
                      setImei(val.toUpperCase());
                    }
                  }}
                  placeholder={isSmartphone ? '863142080419480' : '68707/EFAPBS6QD00345'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#009ca6] focus:bg-white transition"
                />
                {imei && (
                  <button
                    onClick={() => setImei('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                {isSmartphone 
                  ? 'Ejemplo oficial: 863142080419480 (marcar *#06# o escanear código)' 
                  : 'Ejemplo oficial: 68707/EFAPBS6QD00345 (reverso o base de expositor)'}
              </p>
            </div>

            {/* Selector de Tipo de Terminal: LDU o Maqueta */}
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="pr-2">
                <span className="text-xs font-black text-slate-800 block">Tipo de Terminal</span>
                <span className="text-[11px] text-slate-500 block">
                  {isDummy ? 'Maqueta (expositor sin electrónica operativa)' : 'LDU (Live Demo Unit funcional)'}
                </span>
              </div>
              <div className="flex items-center bg-slate-200/80 p-1 rounded-xl shrink-0">
                <button
                  type="button"
                  onClick={() => setIsDummy(false)}
                  className={`px-3 py-1.5 text-xs font-black rounded-lg transition cursor-pointer ${
                    !isDummy ? 'bg-[#009ca6] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  LDU
                </button>
                <button
                  type="button"
                  onClick={() => setIsDummy(true)}
                  className={`px-3 py-1.5 text-xs font-black rounded-lg transition cursor-pointer ${
                    isDummy ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Maqueta
                </button>
              </div>
            </div>
          </div>

          {/* Botón Validar */}
          <div className="p-5 bg-white border-t border-slate-200">
            <button
              type="button"
              onClick={handleValidate}
              className="w-full bg-gradient-to-r from-[#009ca6] to-[#00b4bf] hover:from-[#008992] hover:to-[#00a3ad] active:scale-[0.98] text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-[#009ca6]/20 transition text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Validar Posición</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. SUBPASO: TECLADO NUMÉRICO TÁCTIL */}
      {subStep === 'manual_keypad' && (
        <div className="flex-1 flex flex-col justify-between">
          <div className="px-5 py-4 bg-gradient-to-r from-[#072431] via-[#104a60] to-[#0a3343] text-white flex items-center justify-between sticky top-0 z-10 shadow-md">
            <button
              onClick={() => setSubStep('identify')}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-sm sm:text-base font-black text-white">
              Entrada Manual {isSmartphone ? 'IMEI' : 'Número de Serie'}
            </h2>
            <div className="w-9" />
          </div>

          <div className="p-4 sm:p-6 space-y-3 flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
            <div className="text-center">
              <span className="text-[10px] text-teal-700 font-bold uppercase tracking-wider block">Dispositivo</span>
              <h3 className="text-base font-black text-slate-900">{position.modeloOficial}</h3>
            </div>

            {/* Display / Input editable de IMEI o Serial */}
            <div className="bg-slate-50 border-2 border-[#009ca6] rounded-2xl p-3 sm:p-4 flex items-center justify-between shadow-xs">
              <input
                type="text"
                value={imei}
                onChange={(e) => {
                  const val = e.target.value;
                  if (isSmartphone) {
                    setImei(val.replace(/\D/g, '').slice(0, 15));
                  } else {
                    setImei(val.toUpperCase().slice(0, 30));
                  }
                }}
                placeholder={isSmartphone ? '863142080419480' : '68707/EFAPBS6QD00345'}
                className="w-full bg-transparent font-mono text-base sm:text-lg font-black text-slate-900 tracking-wider focus:outline-none placeholder:text-slate-400 placeholder:font-normal placeholder:text-xs sm:placeholder:text-sm"
              />
              {imei && (
                <button
                  type="button"
                  onClick={() => setImei('')}
                  className="text-slate-400 hover:text-slate-600 p-1 shrink-0 ml-2 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-500 text-center">
              {isSmartphone 
                ? 'Introduce los 15 dígitos numéricos (ej. 863142080419480)' 
                : 'Introduce el número de serie (ej. 68707/EFAPBS6QD00345)'}
            </p>

            {/* Selector de modo 123 / ABC para no-smartphones */}
            {!isSmartphone && (
              <div className="flex items-center justify-center pt-1">
                <div className="inline-flex bg-slate-200/90 p-1 rounded-xl shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setKeypadMode('123')}
                    className={`px-5 py-1.5 text-xs font-black rounded-lg transition cursor-pointer ${
                      keypadMode === '123' 
                        ? 'bg-[#009ca6] text-white shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    123 Números
                  </button>
                  <button
                    type="button"
                    onClick={() => setKeypadMode('ABC')}
                    className={`px-5 py-1.5 text-xs font-black rounded-lg transition cursor-pointer ${
                      keypadMode === 'ABC' 
                        ? 'bg-[#009ca6] text-white shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ABC Letras
                  </button>
                </div>
              </div>
            )}

            {/* TECLADO */}
            {isSmartphone || keypadMode === '123' ? (
              /* MODO NUMÉRICO 123 */
              <div className="space-y-2 pt-1 max-w-sm mx-auto w-full">
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                    <button
                      key={digit}
                      type="button"
                      onClick={() => handleKeypadPress(digit)}
                      className="py-3.5 sm:py-4 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-800 font-black text-xl rounded-2xl shadow-xs transition cursor-pointer"
                    >
                      {digit}
                    </button>
                  ))}
                  {!isSmartphone ? (
                    <button
                      type="button"
                      onClick={() => setKeypadMode('ABC')}
                      className="py-3.5 sm:py-4 bg-slate-200/80 hover:bg-slate-300 active:bg-slate-400 text-slate-800 font-black text-sm rounded-2xl shadow-xs transition cursor-pointer"
                    >
                      ABC
                    </button>
                  ) : (
                    <div />
                  )}
                  <button
                    type="button"
                    onClick={() => handleKeypadPress('0')}
                    className="py-3.5 sm:py-4 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-800 font-black text-xl rounded-2xl shadow-xs transition cursor-pointer"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={() => handleKeypadPress('backspace')}
                    className="py-3.5 sm:py-4 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-black text-xl rounded-2xl shadow-xs flex items-center justify-center transition cursor-pointer"
                  >
                    ⌫
                  </button>
                </div>

                {!isSmartphone && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleKeypadPress('/')}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-black text-base rounded-xl shadow-xs transition cursor-pointer font-mono"
                    >
                      Barra diagonal ( / )
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* MODO ALFANUMÉRICO ABC (QWERTY) */
              <div className="space-y-1.5 pt-1 w-full">
                {/* Fila 1 Q-P */}
                <div className="flex justify-center gap-1 sm:gap-1.5">
                  {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map((letter) => (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => handleKeypadPress(letter)}
                      className="flex-1 py-3 sm:py-3.5 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200/90 text-slate-800 font-black text-sm sm:text-base rounded-xl shadow-2xs transition active:scale-95 cursor-pointer text-center"
                    >
                      {letter}
                    </button>
                  ))}
                </div>

                {/* Fila 2 A-L */}
                <div className="flex justify-center gap-1 sm:gap-1.5 px-3">
                  {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].map((letter) => (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => handleKeypadPress(letter)}
                      className="flex-1 py-3 sm:py-3.5 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200/90 text-slate-800 font-black text-sm sm:text-base rounded-xl shadow-2xs transition active:scale-95 cursor-pointer text-center"
                    >
                      {letter}
                    </button>
                  ))}
                </div>

                {/* Fila 3 Z-M + / + ⌫ */}
                <div className="flex justify-center gap-1 sm:gap-1.5">
                  <button
                    type="button"
                    onClick={() => setKeypadMode('123')}
                    className="px-2.5 sm:px-3 py-3 sm:py-3.5 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-800 font-black text-xs sm:text-sm rounded-xl shadow-2xs transition active:scale-95 cursor-pointer shrink-0"
                  >
                    123
                  </button>
                  {['Z', 'X', 'C', 'V', 'B', 'N', 'M'].map((letter) => (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => handleKeypadPress(letter)}
                      className="flex-1 py-3 sm:py-3.5 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200/90 text-slate-800 font-black text-sm sm:text-base rounded-xl shadow-2xs transition active:scale-95 cursor-pointer text-center"
                    >
                      {letter}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleKeypadPress('/')}
                    className="px-2.5 sm:px-3 py-3 sm:py-3.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-black text-sm sm:text-base rounded-xl shadow-2xs transition active:scale-95 cursor-pointer font-mono shrink-0"
                  >
                    /
                  </button>
                  <button
                    type="button"
                    onClick={() => handleKeypadPress('backspace')}
                    className="px-2.5 sm:px-3 py-3 sm:py-3.5 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-700 font-black text-sm sm:text-base rounded-xl shadow-2xs flex items-center justify-center transition active:scale-95 cursor-pointer shrink-0"
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
              onClick={handleValidate}
              className="w-full bg-[#009ca6] hover:bg-[#008892] active:scale-[0.98] text-white font-black py-4 rounded-2xl shadow-lg transition text-sm cursor-pointer"
            >
              Confirmar {isSmartphone ? 'IMEI' : 'Número de Serie'}
            </button>
          </div>
        </div>
      )}

      {/* 3. SUBPASO: CONFIRMACIÓN EXITOSA */}
      {subStep === 'confirmation' && (
        <div className="flex-1 flex flex-col justify-between p-6 sm:p-8 bg-white text-center">
          <div className="space-y-4 pt-2 my-auto">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg animate-pulseGlow">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div>
              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest block">
                Auditoría Aprobada
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Puesto Validado Correctamente
              </h2>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-2.5 text-xs shadow-xs max-w-md mx-auto">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1 shrink-0">
                  <Smartphone className="w-6 h-6 text-[#104a60]" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm">{position.modeloOficial}</h4>
                  <p className="text-xs text-slate-400">{position.categoria} • Puesto #{position.posicionNumero}</p>
                </div>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Tipo de Terminal:</span>
                <span className={`font-bold ${isDummy ? 'text-amber-600' : 'text-teal-600'}`}>
                  {isDummy ? 'Maqueta' : 'LDU'}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">{isSmartphone ? 'IMEI Registrado:' : 'Número de Serie:'}</span>
                <span className="font-mono font-bold text-slate-900">{imei || (isDummy ? 'Maqueta (Exento)' : 'LDU')}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Centro:</span>
                <span className="font-bold text-slate-900 truncate max-w-[200px]">{store.nombreTienda}</span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-slate-400 font-medium">Auditor:</span>
                <span className="font-bold text-slate-900">{currentUser.nombre}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 max-w-md mx-auto w-full">
            {/* Foto de Evidencia: Obligatoria */}
            {!photoUrl ? (
              <div className="space-y-2">
                <div className="p-3 bg-amber-50 border border-amber-200/90 rounded-2xl flex items-center gap-3 text-left shadow-2xs">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs font-black text-amber-900 leading-tight">Foto de Evidencia Obligatoria</h5>
                    <p className="text-[11px] text-amber-700 mt-0.5 leading-snug">
                      El guardado permanecerá bloqueado hasta adjuntar la fotografía del terminal y su cartela.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setTempCapturedPhoto(null);
                    setSubStep('camera_photo');
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-[#104a60] to-[#009ca6] hover:from-[#0a3343] hover:to-[#008992] text-white font-black rounded-2xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-teal-900/20 active:scale-[0.98] cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-teal-200" />
                  <span>Tomar Foto de Evidencia (Obligatoria)</span>
                </button>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50/90 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-left shadow-2xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-16 rounded-xl overflow-hidden border border-emerald-300 shrink-0 bg-black flex items-center justify-center shadow-xs">
                    <img src={photoUrl} alt="Evidencia" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-black text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Evidencia Adjuntada</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 mt-0.5 truncate">Formato 3:4 verificado</p>
                    <button
                      type="button"
                      onClick={() => {
                        setTempCapturedPhoto(photoUrl);
                        setSubStep('camera_photo');
                      }}
                      className="text-[11px] text-[#009ca6] hover:underline font-bold mt-1 inline-block cursor-pointer"
                    >
                      Ver / Cambiar Foto
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPhotoUrl(undefined)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                  title="Eliminar foto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Botón Guardar y Continuar: Bloqueado si no hay foto */}
            {!photoUrl ? (
              <button
                type="button"
                disabled={true}
                className="w-full bg-slate-100 border border-slate-200 text-slate-400 font-bold py-4 rounded-2xl transition text-sm flex items-center justify-center gap-2 cursor-not-allowed select-none opacity-80"
                title="Debes adjuntar la fotografía de evidencia antes de continuar"
              >
                <Lock className="w-4 h-4 text-slate-400" />
                <span>Guardar y Continuar (Bloqueado)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => finalizeAudit(true)}
                className="w-full bg-gradient-to-r from-[#009ca6] to-[#00b4bf] hover:from-[#008992] hover:to-[#00a3ad] active:scale-[0.98] text-white font-black py-4 rounded-2xl shadow-xl shadow-[#009ca6]/20 transition text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Guardar y Continuar</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4. SUBPASO: FOTOGRAFÍA DE EVIDENCIA CON MARCO GUÍA */}
      {subStep === 'camera_photo' && (
        <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 bg-slate-950 text-white min-h-[580px]">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <button
              onClick={() => {
                stopCamera();
                setSubStep('confirmation');
              }}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <h2 className="text-sm sm:text-base font-black text-white">Foto de Evidencia</h2>
              <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider block">
                Directriz Oficial Xiaomi
              </span>
            </div>
            <div className="w-9 flex justify-end">
              {tempCapturedPhoto ? (
                <button
                  type="button"
                  onClick={() => {
                    setTempCapturedPhoto(null);
                    startCamera(facingMode);
                  }}
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
                  title="Repetir Foto"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
                  title="Girar Cámara"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* VISOR DE CÁMARA CON MARCO GUÍA (FORMATO 3:4) */}
          <div className="my-auto py-2 flex flex-col items-center">
            <div className="relative w-full max-w-[310px] sm:max-w-[340px] aspect-[3/4] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-700 flex items-center justify-center">
              {tempCapturedPhoto ? (
                <img
                  src={tempCapturedPhoto}
                  alt="Evidencia Capturada"
                  className="w-full h-full object-cover"
                />
              ) : cameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="p-6 text-center space-y-3">
                  <Camera className="w-12 h-12 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-400">
                    {cameraError || 'Iniciando cámara en directo...'}
                  </p>
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#009ca6] text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-[#008992] transition">
                    <Upload className="w-4 h-4" />
                    <span>Abrir Cámara / Galería</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleCapturePhoto}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {/* OVERLAY DEL MARCO GUÍA SEGÚN DIRECTRIZ */}
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
                  <span className="text-[9px] text-teal-200/80 font-medium">Encuadrar terminal erguido</span>
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
                  <span className="text-[9px] text-amber-200/90 font-medium">Cartela frontal y etiqueta visible</span>
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

          {/* CONTROLES INFERIORES */}
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
                    setPhotoUrl(tempCapturedPhoto);
                    stopCamera();
                    setSubStep('confirmation');
                  }}
                  className="flex-[2] py-3.5 bg-gradient-to-r from-[#009ca6] to-[#00b4bf] hover:from-[#008992] hover:to-[#00a3ad] active:scale-95 text-white font-black rounded-2xl text-xs sm:text-sm shadow-xl shadow-[#009ca6]/20 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Aceptar y Adjuntar</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-around">
                {/* Selector nativo / archivo */}
                <label
                  className="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 flex items-center justify-center cursor-pointer transition"
                  title="Abrir cámara del dispositivo / Galería"
                >
                  <Upload className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleCapturePhoto}
                    className="hidden"
                  />
                </label>

                {/* Botón Disparador Principal */}
                <button
                  type="button"
                  onClick={captureFromVideo}
                  disabled={!cameraActive}
                  className={`w-20 h-20 rounded-full border-4 border-teal-400 p-1 flex items-center justify-center transition active:scale-90 ${
                    cameraActive ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'
                  }`}
                  title="Disparar Fotografía"
                >
                  <div className="w-full h-full rounded-full bg-white hover:bg-teal-50 transition flex items-center justify-center shadow-lg">
                    <div className="w-6 h-6 rounded-full bg-[#009ca6]" />
                  </div>
                </button>

                {/* Botón Girar Cámara */}
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 flex items-center justify-center cursor-pointer transition"
                  title="Cambiar Cámara"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL SCANNER BARCODE */}
      {showScanner && (
        <ScannerModal
          isOpen={showScanner}
          onClose={() => setShowScanner(false)}
          onScanSuccess={(detectedImei) => {
            setImei(detectedImei);
            setShowScanner(false);
          }}
        />
      )}

    </div>
  );
};

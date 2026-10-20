import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  X, 
  Camera, 
  AlertCircle, 
  Barcode, 
  ScanText, 
  CheckCircle2, 
  Sparkles, 
  Loader2,
  RefreshCw
} from 'lucide-react';
import { ocrService, validateImeiLuhn, validateSerialFormat } from '../services/ocrService';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (scannedText: string) => void;
  initialMode?: 'barcode' | 'ocr';
  deviceCategory?: string;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  initialMode,
  deviceCategory
}) => {
  // Determinar modo inicial: para Wearable o Tablet por defecto OCR si no se especifica
  const defaultMode = initialMode || (
    deviceCategory === 'Wearable' || deviceCategory === 'Tablet' ? 'ocr' : 'barcode'
  );

  const [mode, setMode] = useState<'barcode' | 'ocr'>(defaultMode);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [ocrFeedback, setOcrFeedback] = useState<string>('Analizando en directo...');
  const [isOcrWorkerLoading, setIsOcrWorkerLoading] = useState<boolean>(false);
  const [matchedCode, setMatchedCode] = useState<string | null>(null);

  // Referencias para Barcode (Html5Qrcode)
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerElementId = 'html5-qrcode-reader-modal';

  // Referencias para OCR en vídeo continuo
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isOcrProcessingRef = useRef<boolean>(false);
  const ocrIntervalRef = useRef<any>(null);

  // Detener todos los flujos de cámara y escáner
  const stopAll = async () => {
    // Detener Barcode Scanner
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {
        // Ignorar cleanup errors
      }
    }
    // Detener OCR Video Stream e intervalo
    if (ocrIntervalRef.current) {
      clearInterval(ocrIntervalRef.current);
      ocrIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    isOcrProcessingRef.current = false;
  };

  // Inicializar escáner según el modo activo
  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg(null);
    setMatchedCode(null);

    if (mode === 'barcode') {
      startBarcodeScanner();
    } else {
      startOcrScanner();
    }

    return () => {
      stopAll();
    };
  }, [isOpen, mode]);

  // 1. INICIAR ESCÁNER DE CÓDIGOS DE BARRA
  const startBarcodeScanner = async () => {
    await stopAll();
    try {
      const html5QrCode = new Html5Qrcode(scannerElementId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 15,
          qrbox: { width: 280, height: 160 },
          aspectRatio: 1.777778
        },
        (decodedText) => {
          const clean = decodedText.trim();
          // Feedback háptico
          if (navigator.vibrate) {
            navigator.vibrate(80);
          }
          onScanSuccess(clean);
          stopAll();
          onClose();
        },
        () => {
          // Ignorar frames sin código
        }
      );
    } catch (err: any) {
      console.error('Error al inicializar cámara de código de barras:', err);
      setErrorMsg('No se pudo acceder a la cámara. Revisa los permisos en tu navegador.');
    }
  };

  // 2. INICIAR ESCÁNER OCR EN TIEMPO REAL
  const startOcrScanner = async () => {
    await stopAll();
    setIsOcrWorkerLoading(true);
    setOcrFeedback('Inicializando motor de lectura OCR...');

    try {
      // Calentar el worker de Tesseract
      await ocrService.getWorker();
      setIsOcrWorkerLoading(false);
      setOcrFeedback('Enfoca el número de serie en la pantalla...');

      // Iniciar cámara con alta resolución
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorMsg('Tu navegador no soporta captura de vídeo en directo.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      // Iniciar bucle continuo de análisis en tiempo real
      startOcrLoop();
    } catch (err: any) {
      console.error('Error al inicializar OCR:', err);
      setIsOcrWorkerLoading(false);
      setErrorMsg('No se pudo iniciar el escáner OCR. Asegúrate de permitir el acceso a la cámara.');
    }
  };

  // Bucle de análisis fotograma a fotograma
  const startOcrLoop = () => {
    if (ocrIntervalRef.current) clearInterval(ocrIntervalRef.current);

    ocrIntervalRef.current = setInterval(async () => {
      if (isOcrProcessingRef.current || !videoRef.current || matchedCode) return;
      const video = videoRef.current;
      if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) return;

      isOcrProcessingRef.current = true;

      try {
        const vw = video.videoWidth;
        const vh = video.videoHeight;

        // Recortar la franja central guiada (85% ancho, 25% alto)
        const cropW = Math.round(vw * 0.85);
        const cropH = Math.round(vh * 0.26);
        const cropX = Math.round((vw - cropW) / 2);
        const cropY = Math.round((vh - cropH) / 2);

        const canvas = document.createElement('canvas');
        canvas.width = cropW;
        canvas.height = cropH;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

        // Preprocesamiento de imagen para pantallas (aumento de contraste para neutralizar reflejos y muaré)
        const imgData = ctx.getImageData(0, 0, cropW, cropH);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
          // Factor de contraste pronunciado
          const contrast = 1.7;
          const adjusted = Math.min(255, Math.max(0, ((gray - 128) * contrast) + 128));
          d[i] = adjusted;
          d[i + 1] = adjusted;
          d[i + 2] = adjusted;
        }
        ctx.putImageData(imgData, 0, 0);

        // Enviar a OCR y extraer S/N (5 núm + / + 14 alfanum) o IMEI con Luhn
        const { rawText, detected } = await ocrService.recognizeSnippet(canvas);

        if (detected) {
          // ¡COINCIDENCIA ENCONTRADA!
          setMatchedCode(detected.value);
          if (navigator.vibrate) {
            navigator.vibrate([70, 50, 70]);
          }
          if (ocrIntervalRef.current) {
            clearInterval(ocrIntervalRef.current);
            ocrIntervalRef.current = null;
          }

          // Breve pausa para feedback visual del usuario
          setTimeout(() => {
            onScanSuccess(detected.value);
            stopAll();
            onClose();
          }, 600);
          return;
        }

        // Si hay texto reconocido pero no coincide aún, dar feedback dinámico
        if (rawText && rawText.trim().length > 3) {
          const preview = rawText.trim().replace(/\s+/g, ' ').slice(0, 22);
          setOcrFeedback(`Leyendo: ${preview}`);
        } else {
          setOcrFeedback('Buscando número de serie en pantalla...');
        }
      } catch (err) {
        console.warn('Error en frame OCR:', err);
      } finally {
        isOcrProcessingRef.current = false;
      }
    }, 300); // Análisis continuo cada 300ms
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header con Pestañas de Modo */}
        <div className="p-3 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-2 text-white font-bold text-xs sm:text-sm">
              <Camera className="w-4 h-4 text-[#009ca6]" />
              <span>Escáner Inteligente</span>
            </div>
            <button
              onClick={() => {
                stopAll();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Selector de Modo: Código de Barras vs OCR Pantalla */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-800/80 rounded-2xl border border-slate-700/60">
            <button
              type="button"
              onClick={() => setMode('ocr')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                mode === 'ocr'
                  ? 'bg-gradient-to-r from-teal-500 to-[#009ca6] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ScanText className="w-4 h-4" />
              <span>OCR Pantalla (S/N)</span>
              {deviceCategory === 'Wearable' || deviceCategory === 'Tablet' ? (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              ) : null}
            </button>

            <button
              type="button"
              onClick={() => setMode('barcode')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                mode === 'barcode'
                  ? 'bg-gradient-to-r from-teal-500 to-[#009ca6] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Barcode className="w-4 h-4" />
              <span>Código Barras (IMEI)</span>
            </button>
          </div>
        </div>

        {/* Viewport del Escáner */}
        <div className="p-4 flex flex-col items-center">
          
          {/* Instrucciones según modo */}
          {mode === 'ocr' ? (
            <div className="text-center mb-3">
              <p className="text-xs font-semibold text-slate-200">
                Apunta al <strong className="text-teal-400">Número de Serie</strong> en pantalla del reloj o tablet
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Formato requerido: <span className="font-mono text-teal-300 font-bold">5 dígitos/14 caracteres</span> (Total: 20)
              </p>
            </div>
          ) : (
            <div className="text-center mb-3">
              <p className="text-xs font-semibold text-slate-200">
                Apunta al <strong className="text-sky-300">código de barras</strong> del terminal o pantalla con <strong className="text-white">*#06#</strong>
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Lectura instantánea de IMEI de 15 dígitos con validación Luhn
              </p>
            </div>
          )}

          {/* Contenedor Visual de Cámara */}
          <div className="relative w-full overflow-hidden rounded-2xl bg-black border border-slate-700 min-h-[280px] max-h-[340px] flex items-center justify-center">
            
            {/* 1. MODO OCR: Video Stream Directo + Guía Central */}
            {mode === 'ocr' && (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover min-h-[280px]"
                />

                {/* Overlay Guía Central para OCR */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                  
                  {/* Recuadro de Enfoque */}
                  <div className={`relative w-[88%] h-[68px] rounded-xl border-2 transition-all duration-300 flex items-center justify-center ${
                    matchedCode
                      ? 'border-emerald-400 bg-emerald-500/25 shadow-[0_0_25px_rgba(52,211,153,0.6)]'
                      : 'border-teal-400/90 bg-teal-950/20 shadow-[0_0_15px_rgba(45,212,191,0.25)]'
                  }`}>
                    {/* Esquinas decorativas iluminadas */}
                    <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-teal-300" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-teal-300" />
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-teal-300" />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-teal-300" />

                    {/* Láser de Escaneo Animado (solo si no ha terminado) */}
                    {!matchedCode && (
                      <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-teal-300 to-transparent animate-pulse" />
                    )}

                    {/* Texto Detectado en Vivo si coincide */}
                    {matchedCode ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/90 border border-emerald-400 rounded-lg text-emerald-300 font-mono font-black text-xs sm:text-sm animate-scaleUp">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{matchedCode}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] font-mono font-bold text-teal-200/70 tracking-wider">
                        [ RECUADRO DE LECTURA S/N ]
                      </span>
                    )}
                  </div>

                  {/* Estado en directo debajo del visor */}
                  <div className="mt-3 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/80 backdrop-blur-xs flex items-center gap-2 text-[11px] text-slate-300">
                    {isOcrWorkerLoading ? (
                      <>
                        <Loader2 className="w-3 h-3 text-teal-400 animate-spin" />
                        <span>Cargando motor OCR...</span>
                      </>
                    ) : matchedCode ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300 font-bold">¡Número de Serie validado!</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 text-teal-400 shrink-0" />
                        <span className="truncate max-w-[240px]">{ocrFeedback}</span>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* 2. MODO BARCODE: Html5QrCode Container */}
            {mode === 'barcode' && (
              <div id={scannerElementId} className="w-full" />
            )}
          </div>

          {errorMsg && (
            <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[10px] text-slate-400 flex items-center gap-1.5 pl-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{mode === 'ocr' ? 'OCR continuo activo' : 'Escáner Barcode activo'}</span>
          </div>
          <button
            onClick={() => {
              stopAll();
              onClose();
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Cancelar
          </button>
        </div>

      </div>
    </div>
  );
};

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
  Zap
} from 'lucide-react';
import { ocrService } from '../services/ocrService';

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
  const defaultMode =
    initialMode ||
    (deviceCategory === 'Wearable' || deviceCategory === 'Tablet' ? 'ocr' : 'barcode');

  const [mode, setMode] = useState<'barcode' | 'ocr'>(defaultMode);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [ocrFeedback, setOcrFeedback] = useState<string>('Enfoca el número de serie...');
  const [isOcrWorkerLoading, setIsOcrWorkerLoading] = useState<boolean>(false);
  const [matchedCode, setMatchedCode] = useState<string | null>(null);
  const [isInstantCapturing, setIsInstantCapturing] = useState<boolean>(false);

  // Sincronizar modo cuando se abre el modal para un nuevo dispositivo
  useEffect(() => {
    if (isOpen) {
      const nextMode =
        initialMode ||
        (deviceCategory === 'Wearable' || deviceCategory === 'Tablet' ? 'ocr' : 'barcode');
      setMode(nextMode);
    }
  }, [isOpen, initialMode, deviceCategory]);

  // Precalentar el motor OCR en segundo plano nada más montar el componente
  useEffect(() => {
    ocrService.getWorker().catch(() => {});
  }, []);

  // Referencias para Barcode (Html5Qrcode)
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerElementId = 'html5-qrcode-reader-modal';

  // Referencias para OCR en vídeo continuo de alta velocidad
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isOcrProcessingRef = useRef<boolean>(false);
  const ocrIntervalRef = useRef<any>(null);
  const passToggleRef = useRef<boolean>(false);
  const ReusableCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Detener todos los flujos de cámara y escáner
  const stopAll = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {
        // Ignorar cleanup errors
      }
    }
    if (ocrIntervalRef.current) {
      clearInterval(ocrIntervalRef.current);
      ocrIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
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
          fps: 20,
          qrbox: { width: 280, height: 160 },
          aspectRatio: 1.777778
        },
        (decodedText) => {
          const clean = decodedText.trim();
          if (navigator.vibrate) {
            navigator.vibrate(70);
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

  // 2. INICIAR ESCÁNER OCR EN TIEMPO REAL (ULTRA-RÁPIDO PARA RELOJES Y TABLETS)
  const startOcrScanner = async () => {
    await stopAll();
    setIsOcrWorkerLoading(true);
    setOcrFeedback('Activando cámara y lector rápido...');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorMsg('Tu navegador no soporta captura de vídeo en directo.');
        return;
      }

      // Abrir cámara y calentar worker de Tesseract en paralelo para no perder tiempo
      const [stream] = await Promise.all([
        navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        }),
        ocrService.getWorker()
      ]);

      // Intentar activar autoenfoque continuo (macro) si el móvil lo soporta
      try {
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack && typeof videoTrack.applyConstraints === 'function') {
          await videoTrack.applyConstraints({
            advanced: [{ focusMode: 'continuous' } as any]
          });
        }
      } catch {
        // Ignorar si el navegador no expone focusMode
      }

      streamRef.current = stream;
      setIsOcrWorkerLoading(false);
      setOcrFeedback('Enfoca el Número de Serie en el recuadro...');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      // Iniciar bucle continuo de alta velocidad
      startOcrLoop();
    } catch (err: any) {
      console.error('Error al inicializar OCR:', err);
      setIsOcrWorkerLoading(false);
      setErrorMsg(
        'No se pudo iniciar el escáner OCR. Asegúrate de permitir el acceso a la cámara.'
      );
    }
  };

  /**
   * Extrae un recorte optimizado (~640px ancho) de la región central del vídeo.
   * Escalado a ~640px multiplica x5 la velocidad de lectura en móviles (de ~1200ms a ~150ms por frame).
   */
  const buildCroppedFrameCanvas = (
    video: HTMLVideoElement,
    applyHighContrastFilter: boolean
  ): HTMLCanvasElement | null => {
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) return null;

    // Recortar el área central (90% ancho, 55% alto) para abarcar esferas completas de reloj y pantallas de tablet
    const srcW = Math.round(vw * 0.9);
    const srcH = Math.round(vh * 0.55);
    const srcX = Math.round((vw - srcW) / 2);
    const srcY = Math.round((vh - srcH) / 2);

    // Escalar a máximo 640px de ancho para que Tesseract procese en ~140ms sin perder nitidez
    const targetW = Math.min(640, srcW);
    const scale = targetW / srcW;
    const targetH = Math.round(srcH * scale);

    if (!ReusableCanvasRef.current) {
      ReusableCanvasRef.current = document.createElement('canvas');
    }
    const canvas = ReusableCanvasRef.current;
    canvas.width = targetW;
    canvas.height = targetH;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    ctx.drawImage(video, srcX, srcY, srcW, srcH, 0, 0, targetW, targetH);

    // En frames alternos aplicamos filtro de alto contraste / inversión para pantallas OLED oscuras con reflejos
    if (applyHighContrastFilter) {
      const imgData = ctx.getImageData(0, 0, targetW, targetH);
      const d = imgData.data;
      let totalLum = 0;
      const totalPx = d.length / 4;
      for (let i = 0; i < d.length; i += 4) {
        totalLum += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      }
      const isDarkScreen = totalLum / totalPx < 125;

      for (let i = 0; i < d.length; i += 4) {
        const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        const contrast = 1.65;
        let adjusted = (gray - 128) * contrast + 128;
        adjusted = Math.min(255, Math.max(0, adjusted));
        if (isDarkScreen) {
          adjusted = 255 - adjusted;
        }
        d[i] = adjusted;
        d[i + 1] = adjusted;
        d[i + 2] = adjusted;
      }
      ctx.putImageData(imgData, 0, 0);
    }

    return canvas;
  };

  // Confirmar código detectado y cerrar al instante
  const completeWithCode = (code: string) => {
    setMatchedCode(code);
    if (navigator.vibrate) {
      navigator.vibrate([60, 40, 60]);
    }
    if (ocrIntervalRef.current) {
      clearInterval(ocrIntervalRef.current);
      ocrIntervalRef.current = null;
    }

    // Registro casi instantáneo (250ms solo para ver el destello verde de confirmación)
    setTimeout(() => {
      onScanSuccess(code);
      stopAll();
      onClose();
    }, 250);
  };

  // Bucle de análisis continuo de alta velocidad (cada 160ms)
  const startOcrLoop = () => {
    if (ocrIntervalRef.current) clearInterval(ocrIntervalRef.current);

    ocrIntervalRef.current = setInterval(async () => {
      if (isOcrProcessingRef.current || !videoRef.current || matchedCode) return;
      const video = videoRef.current;
      if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) return;

      isOcrProcessingRef.current = true;

      try {
        // Alternar entre imagen natural nítida (ideal para OLED de Xiaomi Watch) y filtro de alto contraste
        const useFilter = passToggleRef.current;
        passToggleRef.current = !useFilter;

        const canvas = buildCroppedFrameCanvas(video, useFilter);
        if (!canvas) return;

        const { rawText, detected } = await ocrService.recognizeSnippet(canvas);

        if (detected) {
          completeWithCode(detected.value);
          return;
        }

        if (rawText && rawText.trim().length > 3) {
          const cleanPreview = rawText
            .trim()
            .replace(/[\r\n]+/g, ' ')
            .replace(/\s+/g, ' ')
            .slice(0, 26);
          setOcrFeedback(`Detectando: ${cleanPreview}...`);
        } else {
          setOcrFeedback('Enfoca el Número de Serie en pantalla...');
        }
      } catch (err) {
        console.warn('Error en frame OCR:', err);
      } finally {
        isOcrProcessingRef.current = false;
      }
    }, 160);
  };

  // Botón de "Capturar Ahora" para forzar lectura instantánea en doble pasada sobre el frame actual
  const handleInstantCaptureNow = async () => {
    if (!videoRef.current || matchedCode || isInstantCapturing) return;
    setIsInstantCapturing(true);
    setOcrFeedback('Analizando captura instantánea...');

    try {
      const video = videoRef.current;
      // Pasada 1: Imagen natural
      const canvasNatural = buildCroppedFrameCanvas(video, false);
      if (canvasNatural) {
        const res1 = await ocrService.recognizeSnippet(canvasNatural);
        if (res1.detected) {
          completeWithCode(res1.detected.value);
          return;
        }
      }

      // Pasada 2: Imagen con inversión/alto contraste
      const canvasFiltered = buildCroppedFrameCanvas(video, true);
      if (canvasFiltered) {
        const res2 = await ocrService.recognizeSnippet(canvasFiltered);
        if (res2.detected) {
          completeWithCode(res2.detected.value);
          return;
        }
      }

      setOcrFeedback('Acerca un poco más la pantalla al recuadro...');
    } catch {
      // Ignorar
    } finally {
      setIsInstantCapturing(false);
    }
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
              <span>Escáner Rápido S/N e IMEI</span>
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
              <span>Lector Pantalla (S/N)</span>
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
                Apunta al <strong className="text-teal-400">Número de Serie</strong> del reloj o
                tablet (en <span className="text-white">Acerca de</span>)
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Lectura automática en 1 o 2 líneas (ej.{' '}
                <span className="font-mono text-teal-300 font-bold">58891/DPAK6H5RH00440</span>)
              </p>
            </div>
          ) : (
            <div className="text-center mb-3">
              <p className="text-xs font-semibold text-slate-200">
                Apunta al <strong className="text-sky-300">código de barras</strong> del terminal o
                pantalla con <strong className="text-white">*#06#</strong>
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Lectura instantánea de IMEI o código de barras
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
                  {/* Recuadro de Enfoque Adaptado a S/N de Relojes (2 líneas) y Tablets */}
                  <div
                    className={`relative w-[90%] h-[145px] sm:h-[160px] rounded-2xl border-2 transition-all duration-200 flex items-center justify-center ${
                      matchedCode
                        ? 'border-emerald-400 bg-emerald-500/25 shadow-[0_0_25px_rgba(52,211,153,0.6)]'
                        : 'border-teal-400/90 bg-teal-950/15 shadow-[0_0_15px_rgba(45,212,191,0.25)]'
                    }`}
                  >
                    {/* Esquinas decorativas iluminadas */}
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-3 border-l-3 border-teal-300 rounded-tl-md" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-3 border-r-3 border-teal-300 rounded-tr-md" />
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-3 border-l-3 border-teal-300 rounded-bl-md" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-3 border-r-3 border-teal-300 rounded-br-md" />

                    {/* Láser de Escaneo Animado */}
                    {!matchedCode && (
                      <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-teal-300 to-transparent animate-pulse" />
                    )}

                    {/* Texto Detectado en Vivo si coincide */}
                    {matchedCode ? (
                      <div className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-950/95 border border-emerald-400 rounded-xl text-emerald-300 font-mono font-black text-xs sm:text-sm animate-scaleUp shadow-lg">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{matchedCode}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center px-2 pointer-events-none">
                        <span className="text-[11px] font-mono font-bold text-teal-200/95 tracking-wider drop-shadow">
                          [ ENCUADRA EL NÚMERO DE SERIE ]
                        </span>
                        <span className="text-[10px] text-teal-300/85 mt-1 font-semibold drop-shadow">
                          Ej: 58891/DPAK6H5RH00440
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Estado en directo debajo del visor */}
                  <div className="mt-2.5 px-3 py-1 rounded-full bg-slate-900/85 border border-slate-700/80 backdrop-blur-xs flex items-center gap-2 text-[11px] text-slate-300">
                    {isOcrWorkerLoading ? (
                      <>
                        <Loader2 className="w-3 h-3 text-teal-400 animate-spin" />
                        <span>Iniciando lector rápido...</span>
                      </>
                    ) : matchedCode ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300 font-bold">
                          ¡Número de Serie registrado!
                        </span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 text-teal-400 shrink-0" />
                        <span className="truncate max-w-[250px]">{ocrFeedback}</span>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* 2. MODO BARCODE: Html5QrCode Container */}
            {mode === 'barcode' && <div id={scannerElementId} className="w-full" />}
          </div>

          {/* Botón de ayuda para forzar lectura instantánea en modo OCR */}
          {mode === 'ocr' && !matchedCode && (
            <button
              type="button"
              onClick={handleInstantCaptureNow}
              disabled={isOcrWorkerLoading || isInstantCapturing}
              className="mt-3 w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#009ca6] to-teal-500 hover:brightness-110 active:scale-[0.99] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer transition"
            >
              <Zap className="w-4 h-4" />
              <span>
                {isInstantCapturing
                  ? 'Capturando Número de Serie...'
                  : 'Capturar Número de Serie Ahora'}
              </span>
            </button>
          )}

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
            <span>
              {mode === 'ocr' ? 'Detección rápida S/N activa' : 'Escáner Barcode activo'}
            </span>
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

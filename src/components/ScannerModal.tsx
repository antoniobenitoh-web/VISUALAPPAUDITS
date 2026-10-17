import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, AlertCircle } from 'lucide-react';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (scannedText: string) => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerElementId = 'html5-qrcode-reader-modal';

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg(null);

    const startScanner = async () => {
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
            // Limpieza básica de IMEI / Serial
            const clean = decodedText.trim();
            // Feedback háptico en móviles
            if (navigator.vibrate) {
              navigator.vibrate(80);
            }
            onScanSuccess(clean);
            stopScanner();
            onClose();
          },
          () => {
            // Ignorar frames sin código
          }
        );
      } catch (err: any) {
        console.error('Error al inicializar cámara:', err);
        setErrorMsg('No se pudo acceder a la cámara. Por favor asegúrate de otorgar permisos o introduce el IMEI manualmente.');
      }
    };

    const timer = setTimeout(startScanner, 200);

    return () => {
      clearTimeout(timer);
      stopScanner();
    };
  }, [isOpen]);

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {
        // Ignorar cleanup errors
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Camera className="w-4 h-4 text-sky-400" />
            <span>Escáner de Cámara (IMEI / Código)</span>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewport del Escáner */}
        <div className="p-4 flex flex-col items-center">
          <p className="text-xs text-slate-400 mb-3 text-center">
            Apunta la cámara al código de barras del terminal, caja o pantalla con <strong className="text-sky-300">*#06#</strong>
          </p>

          <div className="relative w-full overflow-hidden rounded-2xl bg-black border border-slate-700 min-h-[260px] flex items-center justify-center">
            <div id={scannerElementId} className="w-full" />
          </div>

          {errorMsg && (
            <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/50 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition"
          >
            Cerrar Escáner
          </button>
        </div>
      </div>
    </div>
  );
};

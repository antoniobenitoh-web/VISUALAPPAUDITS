import React, { useState, useEffect } from 'react';
import { PlanogramPosition, PositionAuditState, IncidentCategory } from '../types';
import { ScannerModal } from './ScannerModal';
import { ImageCompressionService } from '../services/imageCompressionService';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Camera, 
  Barcode, 
  ArrowRight, 
  Trash2, 
  HelpCircle,
  Smartphone,
  Eye
} from 'lucide-react';

interface PositionInspectModalProps {
  position: PlanogramPosition | null;
  currentState: PositionAuditState | undefined;
  isOpen: boolean;
  onClose: () => void;
  onSave: (state: PositionAuditState, andNext: boolean) => void;
  totalPositions: number;
}

const INCIDENT_CATEGORIES: IncidentCategory[] = [
  'Material faltante',
  'Terminal apagado/roto',
  'Modelo incorrecto',
  'Alarma defectuosa',
  'Falta cartela de precio',
  'Suciedad',
  'Dispositivo no asegurado',
  'Otro'
];

export const PositionInspectModal: React.FC<PositionInspectModalProps> = ({
  position,
  currentState,
  isOpen,
  onClose,
  onSave,
  totalPositions
}) => {
  if (!isOpen || !position) return null;

  const [modeloDetectado, setModeloDetectado] = useState(currentState?.modeloDetectado || position.modeloOficial);
  const [esMaqueta, setEsMaqueta] = useState(currentState?.esMaqueta ?? position.esDummy);
  const [imeiSerial, setImeiSerial] = useState(currentState?.imeiSerial || '');
  const [fotoEvidencia, setFotoEvidencia] = useState<string | undefined>(currentState?.fotoEvidenciaUrl);
  const [tipoIncidencia, setTipoIncidencia] = useState<IncidentCategory | ''>(currentState?.tipoIncidencia || '');
  const [comentarios, setComentarios] = useState(currentState?.comentarios || '');
  const [showScanner, setShowScanner] = useState(false);
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);

  useEffect(() => {
    if (position) {
      setModeloDetectado(currentState?.modeloDetectado || position.modeloOficial);
      setEsMaqueta(currentState?.esMaqueta ?? position.esDummy);
      setImeiSerial(currentState?.imeiSerial || '');
      setFotoEvidencia(currentState?.fotoEvidenciaUrl);
      setTipoIncidencia(currentState?.tipoIncidencia || '');
      setComentarios(currentState?.comentarios || '');
    }
  }, [position, currentState]);

  // Manejador de foto con compresión en cliente
  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressingPhoto(true);
      const compressed = await ImageCompressionService.compressImage(file);
      setFotoEvidencia(compressed);
    } catch (err) {
      console.error('Error al comprimir foto:', err);
      alert('Hubo un problema al procesar la imagen.');
    } finally {
      setIsCompressingPhoto(false);
    }
  };

  const isSmartphone = position.categoria === 'Smartphone';
  const hasModelDiscrepancy = modeloDetectado.trim().toLowerCase() !== position.modeloOficial.trim().toLowerCase();
  const requiresImeiCheck = position.requiereImei && !esMaqueta;
  const isImeiMissing = requiresImeiCheck && (
    isSmartphone ? imeiSerial.trim().length < 15 : imeiSerial.trim().length < 6
  );

  const handleConfirm = (andNext = false) => {
    const isIncident = Boolean(tipoIncidencia || hasModelDiscrepancy || isImeiMissing);
    
    let resolvedIncidentType = tipoIncidencia;
    if (!resolvedIncidentType && hasModelDiscrepancy) {
      resolvedIncidentType = 'Modelo incorrecto';
    } else if (!resolvedIncidentType && isImeiMissing) {
      resolvedIncidentType = 'Material faltante';
    }

    const updatedState: PositionAuditState = {
      posicionId: position.id,
      mesaId: position.mesaId,
      posicionNumero: position.posicionNumero,
      modeloOficial: position.modeloOficial,
      modeloDetectado,
      imeiSerial,
      estadoPosicion: isIncident ? 'Incidencia' : 'OK',
      tipoIncidencia: isIncident ? resolvedIncidentType : '',
      esMaqueta,
      fotoEvidenciaUrl: fotoEvidencia,
      comentarios,
      auditadoPor: 'Usuario Activo',
      fechaHora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    onSave(updatedState, andNext);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
        <div className="w-full sm:max-w-xl bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-md p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-400/30 flex items-center justify-center font-black text-sm">
                {String(position.posicionNumero).padStart(2, '0')}
              </span>
              <div>
                <h3 className="text-white font-extrabold text-base leading-tight">
                  Inspección de Posición #{position.posicionNumero}
                </h3>
                <span className="text-xs text-slate-400">
                  {position.mesaId} ({position.categoria})
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cuerpo */}
          <div className="p-4 sm:p-6 space-y-5">
            {/* 1. Comparativa Planograma vs Expuesto */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Planograma Oficial (Sheets)</span>
                <span className="px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800 font-bold text-[10px]">
                  {position.colorOficial}
                </span>
              </div>
              <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base">
                <Smartphone className="w-5 h-5 text-orange-500 shrink-0" />
                <span className="truncate">{position.modeloOficial}</span>
              </div>

              <div className="pt-3 border-t border-slate-800/80">
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Dispositivo Expuesto en Tienda
                </label>
                <input
                  type="text"
                  value={modeloDetectado}
                  onChange={(e) => setModeloDetectado(e.target.value)}
                  placeholder="Modelo observado..."
                  className={`w-full bg-slate-900 border rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 ${
                    hasModelDiscrepancy
                      ? 'border-rose-500/80 focus:ring-rose-500'
                      : 'border-slate-700 focus:ring-sky-500'
                  }`}
                />
                {hasModelDiscrepancy && (
                  <p className="text-[11px] text-rose-400 font-semibold mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Discrepancia detectada con el planograma oficial</span>
                  </p>
                )}
              </div>
            </div>

            {/* 2. Selector LDU / Maqueta */}
            <div className="flex items-center justify-between p-3.5 bg-slate-950/40 rounded-2xl border border-slate-800">
              <div className="flex flex-col pr-2">
                <span className="text-xs font-bold text-white">Tipo de Terminal</span>
                <span className="text-[11px] text-slate-400">
                  {esMaqueta ? 'Maqueta (expositor sin electrónica operativa)' : 'LDU (Live Demo Unit funcional con lectura requerida)'}
                </span>
              </div>
              <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-700 shrink-0">
                <button
                  type="button"
                  onClick={() => setEsMaqueta(false)}
                  className={`px-3 py-1.5 text-xs font-black rounded-lg transition cursor-pointer ${
                    !esMaqueta ? 'bg-[#009ca6] text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  LDU
                </button>
                <button
                  type="button"
                  onClick={() => setEsMaqueta(true)}
                  className={`px-3 py-1.5 text-xs font-black rounded-lg transition cursor-pointer ${
                    esMaqueta ? 'bg-orange-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Maqueta
                </button>
              </div>
            </div>

            {/* 3. Captura de IMEI o Número de Serie */}
            {!esMaqueta && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-300">
                    {isSmartphone ? 'IMEI' : 'Número de Serie (S/N)'} {requiresImeiCheck && <span className="text-rose-400">*</span>}
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {isSmartphone ? '15 dígitos numéricos' : 'Formato Código/Serial'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={imeiSerial}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (isSmartphone) {
                          setImeiSerial(val.replace(/\D/g, '').slice(0, 15));
                        } else {
                          setImeiSerial(val.toUpperCase());
                        }
                      }}
                      placeholder={isSmartphone ? '863142080419480' : '68707/EFAPBS6QD00345'}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowScanner(true)}
                    className="px-3.5 py-2.5 bg-sky-600 hover:bg-sky-500 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-lg shrink-0 cursor-pointer"
                  >
                    <Barcode className="w-4 h-4" />
                    <span>Escanear</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  {isSmartphone 
                    ? 'Ejemplo oficial: 863142080419480 (marcar *#06# o escanear código)' 
                    : 'Ejemplo oficial: 68707/EFAPBS6QD00345 (reverso o base de expositor)'}
                </p>
              </div>
            )}

            {/* 4. Evidencia Fotográfica */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                Evidencia Fotográfica (Pantalla con IMEI o Expositor)
              </label>

              {fotoEvidencia ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-700 group max-h-48">
                  <img src={fotoEvidencia} alt="Evidencia" className="w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFotoEvidencia(undefined)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600/90 text-white hover:bg-rose-700 transition shadow-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="w-full h-24 border-2 border-dashed border-slate-700 hover:border-slate-500 rounded-2xl flex flex-col items-center justify-center cursor-pointer bg-slate-950/40 hover:bg-slate-950/70 transition">
                  {isCompressingPhoto ? (
                    <span className="text-xs text-sky-400 font-semibold animate-pulse">Comprimiendo imagen en cliente...</span>
                  ) : (
                    <>
                      <Camera className="w-6 h-6 text-slate-400 mb-1" />
                      <span className="text-xs text-slate-300 font-bold">Tomar o subir foto</span>
                      <span className="text-[10px] text-slate-500">Compresión automática &lt;200KB</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoCapture}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* 5. Gestión de Incidencias */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="block text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Tipificación de Incidencia</span>
                {tipoIncidencia && (
                  <button
                    onClick={() => setTipoIncidencia('')}
                    className="text-[10px] text-slate-400 hover:text-white"
                  >
                    Quitar incidencia
                  </button>
                )}
              </label>
              <select
                value={tipoIncidencia}
                onChange={(e) => setTipoIncidencia(e.target.value as IncidentCategory | '')}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="">-- Sin incidencia (OK) --</option>
                {INCIDENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <textarea
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                placeholder="Notas adicionales para el GPV / Visual Merchandiser..."
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Footer de Acciones táctiles Mobile-First */}
          <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-md p-4 border-t border-slate-800 flex gap-2">
            <button
              type="button"
              onClick={() => handleConfirm(false)}
              className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-extrabold rounded-2xl text-xs transition flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Guardar</span>
            </button>

            {position.posicionNumero < totalPositions && (
              <button
                type="button"
                onClick={() => handleConfirm(true)}
                className="flex-1 py-3 px-4 bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-extrabold rounded-2xl text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-orange-600/20"
              >
                <span>Guardar y Siguiente</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Escáner de Cámara modal */}
      <ScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanSuccess={(val) => setImeiSerial(val)}
      />
    </>
  );
};

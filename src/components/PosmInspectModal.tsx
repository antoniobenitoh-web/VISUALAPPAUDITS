import React, { useState } from 'react';
import { StorePosmItem } from '../data/storePosmData';
import { VisualElementAuditState, VisualIncidentMotivo } from '../types';
import { ImageCompressionService } from '../services/imageCompressionService';
import { 
  X, 
  Check, 
  AlertTriangle, 
  Camera, 
  Ruler, 
  Sparkles, 
  Eye, 
  Trash2, 
  Layers, 
  Maximize2 
} from 'lucide-react';

interface PosmInspectModalProps {
  item: StorePosmItem;
  initialState?: VisualElementAuditState;
  currentUserEmail?: string;
  currentUserName?: string;
  onSave: (state: VisualElementAuditState) => void;
  onClose: () => void;
}

export const PosmInspectModal: React.FC<PosmInspectModalProps> = ({
  item,
  initialState,
  currentUserEmail = 'auditor@salesland.net',
  currentUserName = 'Auditor Salesland',
  onSave,
  onClose
}) => {
  const [campanaCorrecta, setCampanaCorrecta] = useState<boolean | null>(
    initialState?.fijacionYMedidaCorrecta ?? null
  );
  const [fijacionCorrecta, setFijacionCorrecta] = useState<boolean | null>(
    initialState?.fijacionYMedidaCorrecta ?? null
  );
  const [estadoVisual, setEstadoVisual] = useState<'Pendiente' | 'OK' | 'Incidencia'>(
    initialState?.estadoVisual || 'Pendiente'
  );
  const [motivoIncidencia, setMotivoIncidencia] = useState<VisualIncidentMotivo | ''>(
    initialState?.motivoIncidencia || ''
  );
  const [notas, setNotas] = useState<string>(initialState?.notas || '');
  const [fotoUrl, setFotoUrl] = useState<string | undefined>(initialState?.fotoNuevaUrl);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [previewZoom, setPreviewZoom] = useState<string | null>(null);

  // Imagen de referencia según tipo
  const refImage = item.tipo === 'columna'
    ? (item.caraNumero === 1 || item.caraNumero === 4
        ? './images/posm/columna_zaragoza_1.jpg'
        : './images/posm/columna_zaragoza_2.jpg')
    : item.tipo === 'wall' || item.tipo === 'miniwall'
    ? './images/posm/lona_wall_despues.png'
    : './images/posm/faldon_mesa1.png';

  const handleCapturePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const compressed = await ImageCompressionService.compressImage(file, 1280, 0.75);
      setFotoUrl(compressed);
    } catch (err) {
      console.error('Error al comprimir foto:', err);
      alert('Hubo un error al procesar la imagen.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleQuickMarkOk = () => {
    setCampanaCorrecta(true);
    setFijacionCorrecta(true);
    setEstadoVisual('OK');
    setMotivoIncidencia('');
  };

  const handleQuickMarkIncident = () => {
    setEstadoVisual('Incidencia');
    if (!motivoIncidencia) {
      setMotivoIncidencia('Medidas no coinciden');
    }
  };

  const handleSave = () => {
    const updatedState: VisualElementAuditState = {
      elementoId: item.id,
      nombreElemento: item.nombre,
      tipoMaterial: item.material,
      medidasOficiales: item.medida,
      fotoNuevaUrl: fotoUrl,
      fijacionYMedidaCorrecta: fijacionCorrecta ?? (estadoVisual === 'OK'),
      estadoVisual: estadoVisual === 'Pendiente' && (campanaCorrecta && fijacionCorrecta) ? 'OK' : estadoVisual,
      motivoIncidencia: estadoVisual === 'Incidencia' ? motivoIncidencia : '',
      notas,
      auditadoPor: currentUserName,
      usuarioEmail: currentUserEmail,
      fechaHora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    onSave(updatedState);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
        
        {/* Header Modal */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#072431] via-[#104a60] to-[#0a3343] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#00c4cc] shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-300">
                  {item.material}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff6900]" />
                <span className="text-[10px] text-slate-300">
                  {item.medida}
                </span>
              </div>
              <h3 className="text-base font-black truncate">{item.nombre}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5 text-slate-800">
          
          {/* Tarjeta de Especificación Oficial */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Campaña Oficial Asignada
                </span>
                <span className="text-sm sm:text-base font-black text-[#104a60]">
                  {item.campanaOficial}
                </span>
              </div>
              <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 shrink-0 self-start">
                <Ruler className="w-4 h-4 text-[#009ca6]" />
                <span>Cotas: <strong>{item.medida}</strong></span>
              </div>
            </div>

            {/* Imagen Guía de Referencia */}
            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 group">
              <img
                src={refImage}
                alt={item.nombre}
                className="w-full h-36 sm:h-44 object-cover group-hover:scale-102 transition-transform cursor-pointer"
                onClick={() => setPreviewZoom(refImage)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
              <button
                type="button"
                onClick={() => setPreviewZoom(refImage)}
                className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1 border border-white/20 cursor-pointer"
              >
                <Maximize2 className="w-3 h-3 text-[#00c4cc]" /> Ampliar Guía
              </button>
            </div>
          </div>

          {/* Checklist de Verificación en Tienda */}
          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600 block">
              1. Verificación en Tienda
            </span>

            {/* Check Campaña */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-extrabold text-slate-800 block">
                  ¿La campaña expuesta coincide con la oficial?
                </span>
                <span className="text-[11px] text-slate-500">
                  Debe mostrar: <strong>{item.campanaOficial}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setCampanaCorrecta(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    campanaCorrecta === true
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Sí
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCampanaCorrecta(false);
                    setEstadoVisual('Incidencia');
                    setMotivoIncidencia('Campaña desfasada');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    campanaCorrecta === false
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Check Fijación / Medida */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-extrabold text-slate-800 block">
                  ¿El material está tenso, bien encajado y sin arrugas/roturas?
                </span>
                <span className="text-[11px] text-slate-500">
                  {item.material === 'Duratrans / Filmina'
                    ? 'Filmina sin holguras bajo el metacrilato'
                    : 'Perfilería perimetral tensada y zócalo limpio'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setFijacionCorrecta(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    fijacionCorrecta === true
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Sí
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFijacionCorrecta(false);
                    setEstadoVisual('Incidencia');
                    setMotivoIncidencia('Falta perfilería/sujeción');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    fijacionCorrecta === false
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          </div>

          {/* Captura de Evidencia Fotográfica */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-600">
                2. Evidencia Fotográfica
              </span>
              <span className="text-[10px] text-slate-400">Compresión automática &lt; 200KB</span>
            </div>

            {fotoUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-emerald-300 bg-black h-48 group">
                <img src={fotoUrl} alt="Foto Evidencia POSM" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setFotoUrl(undefined)}
                  className="absolute top-2 right-2 p-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition cursor-pointer shadow-md"
                  title="Eliminar foto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <span className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-black shadow-md flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Foto Adjuntada
                </span>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-300 hover:border-[#009ca6] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition bg-slate-50 hover:bg-teal-50/40 text-center">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleCapturePhoto}
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-full bg-[#104a60]/10 text-[#009ca6] flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-700">
                  {isCompressing ? 'Optimizando foto...' : 'Tomar o subir foto del elemento colocado'}
                </span>
                <span className="text-[10px] text-slate-400">
                  Toca aquí para abrir la cámara del móvil o seleccionar archivo
                </span>
              </label>
            )}
          </div>

          {/* Selector de Estado Final */}
          <div className="space-y-2.5">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600 block">
              3. Calificación de Visibilidad
            </span>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleQuickMarkOk}
                className={`p-3.5 rounded-xl border text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
                  estadoVisual === 'OK'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400/40'
                    : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                }`}
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Conforme (OK)</span>
              </button>

              <button
                type="button"
                onClick={handleQuickMarkIncident}
                className={`p-3.5 rounded-xl border text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
                  estadoVisual === 'Incidencia'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-400/40'
                    : 'bg-white text-rose-700 border-rose-300 hover:bg-rose-50'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Reportar Incidencia</span>
              </button>
            </div>

            {/* Opciones de Incidencia si está seleccionada */}
            {estadoVisual === 'Incidencia' && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-3 mt-3 animate-fadeIn">
                <div>
                  <label className="text-[11px] font-bold text-rose-900 block mb-1">
                    Motivo de Incidencia POSM
                  </label>
                  <select
                    value={motivoIncidencia}
                    onChange={(e) => setMotivoIncidencia(e.target.value as VisualIncidentMotivo)}
                    className="w-full bg-white border border-rose-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="Medidas no coinciden">Medidas no coinciden</option>
                    <option value="Campaña desfasada">Campaña desfasada / No actualizada</option>
                    <option value="Material roto o dañado de origen">Material roto o dañado</option>
                    <option value="Falta perfilería/sujeción">Falta perfilería / Mala sujeción</option>
                    <option value="Otro">Otro motivo</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-rose-900 block mb-1">
                    Observaciones detalladas
                  </label>
                  <textarea
                    rows={2}
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Describe el estado de la lona o filmina..."
                    className="w-full bg-white border border-rose-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Modal con Botón Guardar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 bg-gradient-to-r from-[#009ca6] to-[#104a60] hover:brightness-110 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Guardar Auditoría POSM</span>
          </button>
        </div>

      </div>

      {/* Modal Zoom de Imagen de Referencia */}
      {previewZoom && (
        <div
          onClick={() => setPreviewZoom(null)}
          className="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[85vh] w-full flex items-center justify-center">
            <img src={previewZoom} alt="Zoom Guía" className="max-w-full max-h-[85vh] object-contain rounded-xl" />
          </div>
          <span className="text-white text-xs mt-3 bg-white/20 px-3 py-1 rounded-full">
            Toca en cualquier parte para cerrar
          </span>
        </div>
      )}
    </div>
  );
};


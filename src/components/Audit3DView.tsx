import React, { useState, useEffect } from 'react';
import { StoreCenter, UserProfile, PlanogramPosition, PositionAuditState, AuditRecord } from '../types';
import { getPositionsForSpace } from '../data/defaultData';
import { DbService } from '../services/dbService';
import { SheetsService } from '../services/sheetsService';
import { InteractiveTableCanvas } from './3d/InteractiveTableCanvas';
import { PositionInspectModal } from './PositionInspectModal';
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Send, 
  Layers, 
  Sparkles,
  Smartphone
} from 'lucide-react';

interface Audit3DViewProps {
  store: StoreCenter;
  currentUser: UserProfile;
  onFinishAudit: () => void;
  onBack: () => void;
}

export const Audit3DView: React.FC<Audit3DViewProps> = ({
  store,
  currentUser,
  onFinishAudit,
  onBack
}) => {
  // Áreas o mesas de la tienda
  const availableSpaces = store.availableSpaces && store.availableSpaces.length > 0
    ? store.availableSpaces
    : ['MESA 1 · Cara 1', 'MESA 1 · Cara 2', 'WALL', 'LINEAL SMARTWATCH'];

  const [activeSpace, setActiveSpace] = useState<string>(availableSpaces[0]);
  const [positions, setPositions] = useState<PlanogramPosition[]>([]);
  const [auditStates, setAuditStates] = useState<Record<string, PositionAuditState>>({});
  const [selectedPosition, setSelectedPosition] = useState<PlanogramPosition | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar posiciones y borrador previo al cambiar de tienda o espacio
  useEffect(() => {
    const loadedPositions = getPositionsForSpace(store.tipoEspacioId, activeSpace, store);
    setPositions(loadedPositions);

    // Cargar borrador de IndexedDB/localStorage
    const draft = DbService.getDraft(store.tiendaId);
    if (draft) {
      const stateMap: Record<string, PositionAuditState> = {};
      draft.forEach((p) => {
        stateMap[p.posicionId] = p;
      });
      setAuditStates(stateMap);
    }
  }, [store.tiendaId, activeSpace]);

  // Guardar cambio de estado de una posición
  const handleSavePosition = (state: PositionAuditState, andNext: boolean) => {
    const updated = {
      ...auditStates,
      [state.posicionId]: state
    };
    setAuditStates(updated);

    // Persistir en borrador local
    DbService.saveDraft(store.tiendaId, Object.values(updated));

    if (andNext && selectedPosition) {
      const nextNum = selectedPosition.posicionNumero + 1;
      const nextPos = positions.find((p) => p.posicionNumero === nextNum);
      if (nextPos) {
        setSelectedPosition(nextPos);
        return;
      }
    }

    setIsModalOpen(false);
    setSelectedPosition(null);
  };

  // KPIs globales de la auditoría en curso
  const allAudited = Object.values(auditStates);
  const okCount = allAudited.filter((p) => p.estadoPosicion === 'OK').length;
  const incidentCount = allAudited.filter((p) => p.estadoPosicion === 'Incidencia').length;
  const totalPuestos = store.totalPuestos || 20;
  const progressPercent = Math.min(100, Math.round((allAudited.length / totalPuestos) * 100));

  // Finalizar auditoría y sincronizar con Google Sheets
  const handleCompleteAudit = async () => {
    if (allAudited.length === 0) {
      alert('Debes auditar al menos una posición antes de finalizar.');
      return;
    }

    const confirmFinalize = window.confirm(
      `¿Deseas finalizar y registrar la auditoría de ${store.nombreTienda}?\n\n- Correctas: ${okCount}\n- Incidencias: ${incidentCount}`
    );
    if (!confirmFinalize) return;

    try {
      setIsSubmitting(true);

      const record: AuditRecord = {
        auditId: `AUDIT_${store.tiendaId}_${Date.now()}`,
        tiendaId: store.tiendaId,
        nombreTienda: store.nombreTienda,
        retailer: store.retailer,
        usuarioEmail: currentUser.email,
        usuarioNombre: currentUser.nombre,
        fechaHora: new Date().toLocaleString(),
        totalPosiciones: totalPuestos,
        okCount,
        incidenciasCount: incidentCount,
        pendientesCount: Math.max(0, totalPuestos - allAudited.length),
        positions: allAudited,
        sincronizadoSheets: false
      };

      // Guardar en base de datos local e intentar sincronizar con Google Sheets
      DbService.saveAuditRecord(record);
      DbService.clearDraft(store.tiendaId);

      // Intentar sincronizar inmediatamente si hay conexión
      await SheetsService.syncAuditToSheets(record);

      alert('¡Auditoría registrada con éxito! Los datos se han guardado localmente y sincronizado con Google Sheets.');
      onFinishAudit();
    } catch (err) {
      console.error('Error al finalizar auditoría:', err);
      alert('Hubo un problema al finalizar la auditoría.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 animate-fadeIn pb-24">
      {/* Barra Superior con Navegación y Resumen */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition hover:bg-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
              {store.nombreTienda}
            </h2>
            <span className="text-xs text-slate-400">
              Inspección 3D de Planograma y Terminales
            </span>
          </div>
        </div>

        {/* Botón de Finalizar Auditoría */}
        <button
          onClick={handleCompleteAudit}
          disabled={isSubmitting}
          className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-sky-600/20 transition flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          <span>{isSubmitting ? 'Guardando...' : 'Finalizar y Reportar'}</span>
        </button>
      </div>

      {/* Barra de Progreso y KPIs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300">Progreso Global de Auditoría</span>
          <span className="font-black text-white">{progressPercent}% completado</span>
        </div>
        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center gap-4 pt-1 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{okCount} OK</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400 font-bold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{incidentCount} Incidencias</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>{Math.max(0, totalPuestos - allAudited.length)} Pendientes</span>
          </div>
        </div>
      </div>

      {/* Selector de Áreas / Mesas (Pestañas Superiores) */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5 text-orange-500" />
          <span>Espacios y Planogramas Disponibles</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {availableSpaces.map((space) => {
            const isActive = activeSpace === space;
            return (
              <button
                key={space}
                onClick={() => setActiveSpace(space)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition shrink-0 border ${
                  isActive
                    ? 'bg-orange-600 text-white border-orange-500 shadow-lg shadow-orange-600/20'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {space}
              </button>
            );
          })}
        </div>
      </div>

      {/* Render 3D Interactivo con Hotspots */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold">Mesa de Experiencia 3D · Pulsa cualquier punto para auditar</span>
          <span className="text-sky-400 font-bold">{positions.length} posiciones en este espacio</span>
        </div>

        <InteractiveTableCanvas
          positions={positions}
          auditStates={auditStates}
          selectedPositionId={selectedPosition?.id || null}
          onSelectPosition={(pos) => {
            setSelectedPosition(pos);
            setIsModalOpen(true);
          }}
          spaceName={activeSpace}
        />
      </div>

      {/* Lista / Carrusel de Posiciones de la Mesa Activa */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-sky-400" />
          <span>Posiciones del Planograma en {activeSpace}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {positions.map((pos) => {
            const state = auditStates[pos.id];
            const isOk = state?.estadoPosicion === 'OK';
            const isIncident = state?.estadoPosicion === 'Incidencia';

            return (
              <div
                key={pos.id}
                onClick={() => {
                  setSelectedPosition(pos);
                  setIsModalOpen(true);
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isOk
                    ? 'bg-emerald-950/20 border-emerald-500/40 hover:bg-emerald-950/40'
                    : isIncident
                    ? 'bg-rose-950/20 border-rose-500/40 hover:bg-rose-950/40'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate mr-2">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                      isOk
                        ? 'bg-emerald-500 text-white'
                        : isIncident
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {String(pos.posicionNumero).padStart(2, '0')}
                  </span>
                  <div className="truncate">
                    <p className="text-xs font-bold text-white truncate">{pos.modeloOficial}</p>
                    <p className="text-[10px] text-slate-400">{pos.colorOficial}</p>
                  </div>
                </div>

                {/* Badge de estado */}
                {isOk ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : isIncident ? (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                ) : (
                  <span className="text-[10px] font-bold text-amber-400 shrink-0">Pendiente</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Ficha de Inspección Detallada */}
      <PositionInspectModal
        position={selectedPosition}
        currentState={selectedPosition ? auditStates[selectedPosition.id] : undefined}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPosition(null);
        }}
        onSave={handleSavePosition}
        totalPositions={positions.length}
      />
    </div>
  );
};

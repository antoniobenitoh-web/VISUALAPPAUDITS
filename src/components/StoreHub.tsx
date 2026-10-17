import React, { useState } from 'react';
import { StoreCenter, UserProfile, AuditRecord, PositionAuditState } from '../types';
import { DbService } from '../services/dbService';
import { ExcelService } from '../services/excelService';
import { RetailerLogo } from './RetailerLogos';
import { 
  ArrowLeft, 
  FileSpreadsheet, 
  Play, 
  AlertTriangle, 
  History, 
  Store, 
  Layers, 
  CheckCircle2, 
  Calendar,
  Sparkles,
  MapPin
} from 'lucide-react';

interface StoreHubProps {
  store: StoreCenter;
  currentUser: UserProfile;
  onStartAudit: () => void;
  onViewHistory: () => void;
  onBack: () => void;
}

export const StoreHub: React.FC<StoreHubProps> = ({
  store,
  currentUser,
  onStartAudit,
  onViewHistory,
  onBack
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const draft = DbService.getDraft(store.tiendaId);
  const history = DbService.getHistory().filter((h) => h.tiendaId === store.tiendaId);
  const lastRecord = history[0];

  const totalPositions = store.totalPuestos || 20;
  const draftPositionsCount = draft ? draft.length : 0;
  const isDraftInProgress = draftPositionsCount > 0;

  const incidentsCount = draft
    ? draft.filter((p) => p.estadoPosicion === 'Incidencia').length
    : lastRecord
    ? lastRecord.incidenciasCount
    : 0;

  const handleDownloadExcel = async () => {
    try {
      setIsExporting(true);

      const positionsToExport: PositionAuditState[] = draft || (lastRecord ? lastRecord.positions : []);

      const auditToExport: AuditRecord = lastRecord || {
        auditId: `EXPORT_${store.tiendaId}_${Date.now()}`,
        tiendaId: store.tiendaId,
        nombreTienda: store.nombreTienda,
        retailer: store.retailer,
        usuarioEmail: currentUser.email,
        usuarioNombre: currentUser.nombre,
        fechaHora: new Date().toLocaleString(),
        totalPosiciones: totalPositions,
        okCount: positionsToExport.filter((p) => p.estadoPosicion === 'OK').length,
        incidenciasCount: positionsToExport.filter((p) => p.estadoPosicion === 'Incidencia').length,
        pendientesCount: totalPositions - positionsToExport.length,
        positions: positionsToExport,
        sincronizadoSheets: false
      };

      await ExcelService.exportAuditReport(auditToExport);
    } catch (err) {
      console.error('Error al generar Excel:', err);
      alert('Hubo un error al generar el archivo Excel.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      {/* Barra de Navegación y Botón Excel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition hover:bg-slate-800 shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span className="text-slate-500">{store.retailer}</span>
            <span>/</span>
            <span className="text-white font-extrabold truncate max-w-[200px] sm:max-w-md">{store.nombreTienda}</span>
          </div>
        </div>

        {/* Botón Descargar Excel Corporativo */}
        <button
          onClick={handleDownloadExcel}
          disabled={isExporting}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>{isExporting ? 'Generando Excel...' : 'Descargar Reporte Excel (.xlsx)'}</span>
        </button>
      </div>

      {/* Hero del Portal de Tienda con Logotipo Oficial */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-28 h-9 flex items-center">
                <RetailerLogo id={store.retailer} className="w-full h-8 object-contain" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-black uppercase">
                {store.zona}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {store.nombreTienda}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Inspecciona los muebles de experiencia Xiaomi, escanea los IMEIs con cámara en mano y valida el cumplimiento oficial de los planogramas.
            </p>
          </div>

          <div className="flex flex-row md:flex-col gap-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800 shrink-0">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Puestos</span>
              <span className="text-lg font-black text-white">{totalPositions} posiciones</span>
            </div>
            <div className="md:pt-2 md:border-t md:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Última Auditoría</span>
              <span className="text-xs font-extrabold text-slate-300">
                {store.lastAuditDate || 'Pendiente'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tres Accesos Principales Destacados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Acceso 1: Iniciar / Continuar Auditoría */}
        <div
          onClick={onStartAudit}
          className="group bg-gradient-to-br from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 rounded-3xl p-6 shadow-xl shadow-orange-600/20 text-white flex flex-col justify-between cursor-pointer transition-all hover:-translate-y-1"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
              <Play className="w-6 h-6 text-white ml-0.5" />
            </div>
            <h3 className="text-lg font-black leading-tight">
              {isDraftInProgress ? 'Continuar Auditoría' : 'Iniciar Nueva Auditoría'}
            </h3>
            <p className="text-xs text-orange-100">
              {isDraftInProgress
                ? `${draftPositionsCount} de ${totalPositions} posiciones registradas en borrador.`
                : 'Abre la mesa interactiva en 3D y el lector de cámara para revisar los terminales.'}
            </p>
          </div>

          <div className="pt-6 mt-6 border-t border-white/20 flex items-center justify-between text-xs font-extrabold">
            <span>Abrir Mesa 3D</span>
            <span className="w-7 h-7 rounded-full bg-white text-orange-600 flex items-center justify-center font-bold">
              →
            </span>
          </div>
        </div>

        {/* Acceso 2: Incidencias */}
        <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white">Incidencias</h3>
              <span className="text-2xl font-black text-rose-500">{incidentsCount}</span>
            </div>
            <p className="text-xs text-slate-400">
              Discrepancias de modelo, terminales apagados, alarmas o material faltante reportados.
            </p>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Seguimiento Visual</span>
            <span className="font-bold text-rose-400">{incidentsCount > 0 ? 'Acción requerida' : 'Sin incidencias'}</span>
          </div>
        </div>

        {/* Acceso 3: Historial */}
        <div
          onClick={onViewHistory}
          className="group bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-500 rounded-3xl p-6 shadow-xl flex flex-col justify-between cursor-pointer transition-all hover:-translate-y-1"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <History className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white">Historial</h3>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {history.length} reportes
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Consulta registros pasados y descarga los informes en Excel de auditorías anteriores.
            </p>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-sky-400">
            <span>Ver registros</span>
            <span className="w-7 h-7 rounded-full bg-slate-800 group-hover:bg-sky-600 group-hover:text-white flex items-center justify-center transition-colors">
              →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

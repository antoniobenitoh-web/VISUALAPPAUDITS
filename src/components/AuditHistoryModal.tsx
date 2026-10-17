import React from "react";
import { AuditRecord, StoreCenter } from "../types";
import { DbService } from "../services/dbService";
import { ExcelService } from "../services/excelService";
import { X, History, FileSpreadsheet, CheckCircle2, AlertTriangle, Calendar, User } from "lucide-react";

interface AuditHistoryModalProps {
  store: StoreCenter;
  isOpen: boolean;
  onClose: () => void;
}

export const AuditHistoryModal: React.FC<AuditHistoryModalProps> = ({ store, isOpen, onClose }) => {
  if (!isOpen) return null;

  const history = DbService.getHistory().filter((h) => h.tiendaId === store.tiendaId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-white font-extrabold text-base">
            <History className="w-5 h-5 text-sky-400" />
            <span>Historial de Auditorías · {store.nombreTienda}</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-3 overflow-y-auto">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No hay auditorías registradas previamente para esta tienda.
            </div>
          ) : (
            history.map((record) => (
              <div
                key={record.auditId}
                className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Calendar className="w-3.5 h-3.5 text-sky-400" />
                    <span>{record.fechaHora}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <User className="w-3.5 h-3.5" />
                    <span>{record.usuarioNombre} ({record.usuarioEmail})</span>
                  </div>
                  <div className="flex items-center gap-3 pt-1 text-xs">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{record.okCount} OK</span>
                    </span>
                    <span className="text-rose-400 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{record.incidenciasCount} Incidencias</span>
                    </span>
                    <span className="text-slate-400">Total: {record.totalPosiciones} puestos</span>
                  </div>
                </div>

                <button
                  onClick={() => ExcelService.exportAuditReport(record)}
                  className="px-3 py-2 bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Descargar Excel</span>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-slate-950/50 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

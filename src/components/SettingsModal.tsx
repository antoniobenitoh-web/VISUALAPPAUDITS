import React, { useState } from 'react';
import { DbService } from '../services/dbService';
import { SheetsService } from '../services/sheetsService';
import { X, Save, RefreshCw, Link2, CheckCircle2, AlertCircle, FileCode } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [webhookUrl, setWebhookUrl] = useState(DbService.getSheetsWebhookUrl());
  const [driveFolderId, setDriveFolderId] = useState(DbService.getGoogleDriveFolderId());
  const [statusMsg, setStatusMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    DbService.saveSheetsWebhookUrl(webhookUrl);
    DbService.saveGoogleDriveFolderId(driveFolderId);
    setStatusMsg({ type: 'ok', text: 'Configuración de Google Sheets y Google Drive guardada correctamente.' });
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setStatusMsg(null);
    DbService.saveSheetsWebhookUrl(webhookUrl);
    DbService.saveGoogleDriveFolderId(driveFolderId);
    try {
      const result = await SheetsService.testConnection();
      setStatusMsg({
        type: result.driveOk ? 'ok' : 'err',
        text: result.message
      });
    } catch (e: any) {
      setStatusMsg({ type: 'err', text: 'Error al probar conexión: ' + (e?.message || e) });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSyncPending = async () => {
    setIsSyncing(true);
    setStatusMsg(null);
    try {
      const count = await SheetsService.processPendingQueue();
      setStatusMsg({
        type: 'ok',
        text: `Sincronización completada: ${count} auditorías enviadas a Google Sheets y Drive.`
      });
    } catch (e) {
      setStatusMsg({ type: 'err', text: 'Error al sincronizar con Google Sheets.' });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-white font-extrabold text-base">
            <Link2 className="w-5 h-5 text-sky-400" />
            <span>Configuración de Google Sheets & Drive</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto">
          {/* Carpeta Google Drive */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300">
              ID Carpeta de Google Drive (Auditoría Espacios de Marca)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={driveFolderId}
                onChange={(e) => setDriveFolderId(e.target.value)}
                placeholder="1RNmY0KnIqtOV6zU0mu080bJKAFFEhRyD"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <a
                href={`https://drive.google.com/drive/folders/${driveFolderId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 text-xs font-bold rounded-xl flex items-center justify-center transition"
                title="Abrir en Google Drive"
              >
                Abrir
              </a>
            </div>
            <p className="text-[11px] text-slate-400">
              Carpeta raíz donde se almacenan automáticamente los Excel y fotografías organizados por <strong className="text-slate-300">Retailer / Centro / Año / Fecha</strong>.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300">
              URL del Webhook de Google Apps Script (REST API)
            </label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <p className="text-[11px] text-slate-400">
              Webhook para sincronizar las pestañas de tienda, <strong className="text-slate-300">Auditorias_Log</strong> y subir archivos a Google Drive.
            </p>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || !webhookUrl}
              className="w-full py-2.5 px-3 bg-sky-950/60 hover:bg-sky-900/60 text-sky-300 border border-sky-800/80 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Comprobando acceso a Google Drive...' : 'Probar Conexión con Google Drive'}</span>
            </button>
          </div>

          {statusMsg && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                statusMsg.type === 'ok'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}
            >
              {statusMsg.type === 'ok' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Sincronización Manual */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Cola de Sincronización Offline</span>
              <span className="text-[11px] text-slate-400">
                {DbService.getSyncQueue().length} pendientes
              </span>
            </div>
            <button
              onClick={handleSyncPending}
              disabled={isSyncing}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sincronizando...' : 'Forzar Sincronización Ahora'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/50 border-t border-slate-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
          >
            Cerrar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Guardar Ajustes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

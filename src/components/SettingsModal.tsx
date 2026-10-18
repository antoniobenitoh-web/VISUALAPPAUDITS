import React, { useState } from 'react';
import { DbService } from '../services/dbService';
import { SheetsService } from '../services/sheetsService';
import { 
  X, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  CloudOff, 
  Smartphone,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  if (!isOpen) return null;

  const appVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.2.5';
  const buildTime = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : 'Reciente';
  const pendingCount = DbService.getSyncQueue().length;

  // Actualizar la aplicación limpiando service worker y caché de GitHub Pages
  const handleUpdateApp = async () => {
    setIsUpdating(true);
    setStatusMsg({ type: 'ok', text: 'Buscando última versión compilada en GitHub y renovando caché...' });

    try {
      // 1. Forzar actualización de Service Workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.update();
        }
      }

      // 2. Limpiar todos los cachés locales de la PWA (Workbox / CacheStorage)
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      // 3. Si hay conexión a internet, refrescar catálogos de tiendas y usuarios
      if (navigator.onLine) {
        try {
          await SheetsService.refreshCatalogFromSheets();
        } catch (e) {
          console.warn('Aviso al refrescar catálogos:', e);
        }
      }

      setStatusMsg({ 
        type: 'ok', 
        text: '¡Caché renovada y última versión aplicada! Reiniciando la app...' 
      });

      // 4. Recargar forzando bypass de caché tras 900ms
      setTimeout(() => {
        const refreshUrl = window.location.origin + window.location.pathname + '?v=' + Date.now();
        window.location.href = refreshUrl;
      }, 900);

    } catch (err: any) {
      console.error('Error durante la actualización:', err);
      setStatusMsg({ 
        type: 'err', 
        text: 'Error al limpiar caché. Recargando de forma estándar...' 
      });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } finally {
      setIsUpdating(false);
    }
  };

  // Sincronizar auditorías locales pendientes
  const handleSyncPending = async () => {
    setIsSyncing(true);
    setStatusMsg(null);
    try {
      const count = await SheetsService.processPendingQueue();
      setStatusMsg({
        type: 'ok',
        text: `Sincronización completada: ${count} auditorías enviadas al servidor.`
      });
    } catch (e) {
      setStatusMsg({ type: 'err', text: 'Error al sincronizar auditorías pendientes. Comprueba la conexión.' });
    } finally {
      setIsSyncing(false);
    }
  };

  // Diagnóstico de conexión interno (sin exponer credenciales ni IDs)
  const handleTestConnection = async () => {
    setIsTesting(true);
    setStatusMsg(null);
    try {
      const result = await SheetsService.testConnection();
      setStatusMsg({
        type: result.driveOk ? 'ok' : 'err',
        text: result.driveOk 
          ? '✅ Conexión con los servidores de Google activa y verificada.' 
          : '⚠️ Servidor accesible pero con advertencia: ' + result.message
      });
    } catch (e: any) {
      setStatusMsg({ type: 'err', text: 'No se pudo conectar con el servidor: ' + (e?.message || e) });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Cabecera */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shadow-inner">
              <RefreshCw className={`w-5 h-5 ${isUpdating ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h2 className="text-white font-black text-sm sm:text-base leading-tight">
                Actualizaciones del Sistema
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Brand Spaces Retail Audit PWA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido del Modal */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          
          {/* Tarjeta de Versión y Compilación */}
          <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold text-slate-200">Versión Instalada</span>
              </div>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono">
                v{appVersion}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
              <span>Última Compilación GitHub:</span>
              <span className="font-semibold text-slate-300 font-mono">{buildTime}</span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Modo de Operación:</span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Offline Ready / PWA
              </span>
            </div>
          </div>

          {/* Botón Principal: Forzar Actualización y Limpiar Caché */}
          <div className="space-y-2">
            <button
              onClick={handleUpdateApp}
              disabled={isUpdating}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-sky-600 via-sky-500 to-teal-500 hover:from-sky-500 hover:to-teal-400 active:scale-[0.99] text-white font-black rounded-2xl shadow-lg shadow-sky-600/25 transition flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
              <span className="text-xs sm:text-sm">
                {isUpdating ? 'Aplicando Actualización...' : 'Buscar y Aplicar Cambios de GitHub'}
              </span>
            </button>
            <p className="text-[11px] text-slate-400 text-center leading-relaxed px-2">
              Pulsa este botón cuando se hayan subido cambios o nuevas versiones al repositorio para renovar la memoria caché del navegador de forma instantánea.
            </p>
          </div>

          {/* Mensajes de Estado / Notificaciones */}
          {statusMsg && (
            <div
              className={`p-3 rounded-2xl border text-xs flex items-center gap-2.5 transition-all ${
                statusMsg.type === 'ok'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}
            >
              {statusMsg.type === 'ok' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span className="font-medium leading-tight">{statusMsg.text}</span>
            </div>
          )}

          {/* Estado de Auditorías Locales (Pendientes) */}
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">Auditorías en el Dispositivo</span>
              {pendingCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-black">
                  {pendingCount} pendientes
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Al día
                </span>
              )}
            </div>

            {pendingCount > 0 ? (
              <button
                onClick={handleSyncPending}
                disabled={isSyncing}
                className="w-full py-2 px-3 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Subiendo...' : 'Sincronizar Auditorías Pendientes'}</span>
              </button>
            ) : (
              <p className="text-[11px] text-slate-400 leading-snug">
                Todas tus auditorías ya están guardadas y sincronizadas con la nube de forma segura.
              </p>
            )}
          </div>

          {/* Acordeón de Diagnóstico Interno (Soporte Técnico) */}
          <div className="border-t border-slate-800/80 pt-2">
            <button
              type="button"
              onClick={() => setShowDiagnostics(!showDiagnostics)}
              className="w-full py-1.5 flex items-center justify-between text-slate-400 hover:text-slate-300 text-[11px] font-semibold transition cursor-pointer"
            >
              <span>Diagnóstico de Servidor (Soporte)</span>
              {showDiagnostics ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showDiagnostics && (
              <div className="mt-2 p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Verifica que el servicio en segundo plano de Google Apps Script y almacenamiento en la nube respondan correctamente sin exponer directorios.
                </p>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Verificando...' : 'Comprobar Estado del Servidor'}</span>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Pie del modal */}
        <div className="p-3.5 sm:p-4 bg-slate-950/60 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};

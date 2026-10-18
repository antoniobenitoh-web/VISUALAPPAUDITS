import React, { useState, useEffect } from 'react';
import { StoreCenter, UserProfile, PlanogramPosition, PositionAuditState } from './types';
import { AuthService } from './services/authService';
import { DbService } from './services/dbService';
import { SheetsService } from './services/sheetsService';

// Pantallas del flujo responsive adaptadas a Móvil y PC
import { WelcomeScreen } from './components/screens/WelcomeScreen';
import { StoreSelectScreen } from './components/screens/StoreSelectScreen';
import { PlanogramOverviewScreen } from './components/screens/PlanogramOverviewScreen';
import { DeviceIdentifyScreen } from './components/screens/DeviceIdentifyScreen';
import { AuditSummaryScreen } from './components/screens/AuditSummaryScreen';
import { SettingsModal } from './components/SettingsModal';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { Wifi, WifiOff, Settings } from 'lucide-react';

export type AppStep = 
  | 'welcome'          // Pantalla 1: Inicio / Login con Google
  | 'store_select'     // Pantalla 2: Selecciona tienda
  | 'planogram_3d'     // Pantalla 3 y 4: Planograma 3D y Hotspots
  | 'device_identify'  // Pantalla 5, 6, 7 y 8: Escáner IMEI / Teclado manual / Foto
  | 'audit_summary';   // Pantalla 9, 10 y 11: Resumen de auditoría y resultado

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(AuthService.getActiveUser());
  const [users, setUsers] = useState<UserProfile[]>(DbService.getUsers());
  const [stores, setStores] = useState<StoreCenter[]>(DbService.getStores());
  
  const [currentStep, setCurrentStep] = useState<AppStep>('welcome');
  const [selectedStore, setSelectedStore] = useState<StoreCenter | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<PlanogramPosition | null>(null);
  const [auditStates, setAuditStates] = useState<Record<string, PositionAuditState>>({});
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sincronización en vivo desde Google Sheets
  useEffect(() => {
    if (navigator.onLine) {
      SheetsService.refreshCatalogFromSheets().then((data) => {
        if (data) {
          if (data.stores && data.stores.length > 0) setStores(data.stores);
          if (data.users && data.users.length > 0) setUsers(data.users);
        }
      }).catch((e) => {
        console.warn('Operando con catálogo local:', e);
      });
    }
  }, []);

  const handleSelectStore = (store: StoreCenter) => {
    setSelectedStore(store);
    const draft = DbService.getDraft(store.tiendaId);
    if (draft) {
      const map: Record<string, PositionAuditState> = {};
      draft.forEach(p => { map[p.posicionId] = p; });
      setAuditStates(map);
    } else {
      setAuditStates({});
    }
    setCurrentStep('planogram_3d');
  };

  const handleConfirmPosition = (state: PositionAuditState, andNext: boolean) => {
    if (!selectedStore) return;
    const updated = {
      ...auditStates,
      [state.posicionId]: state
    };
    setAuditStates(updated);
    DbService.saveDraft(selectedStore.tiendaId, Object.values(updated));

    setCurrentStep('planogram_3d');
    setSelectedPosition(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#061d27] via-[#092b37] to-[#04151c] text-slate-100 flex flex-col font-sans selection:bg-[#009ca6] selection:text-white">
      {/* Barra superior corporativa Salesland: visible solo dentro de la app (tiendas, planograma, etc.) */}
      {currentStep !== 'welcome' && (
        <header className="w-full bg-[#072431]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs z-30 sticky top-0 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-3">
            <img
              src="./images/salesland_logo.png"
              alt="Salesland"
              className="h-6 sm:h-7 w-auto object-contain cursor-pointer"
              onClick={() => setCurrentStep('welcome')}
            />
            <div className="h-4 w-px bg-white/20 hidden sm:block" />
            <div className="flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded-xl border border-white/10">
              <img src="./images/xiaomi_logo.png" alt="Xiaomi" className="w-4 h-4 rounded-md object-cover" />
              <span className="text-[10px] font-bold text-slate-200 tracking-tight hidden sm:inline">
                Retail Brand Spaces
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Indicador de Auditor Activo */}
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400">Auditor:</span>
              <span className="font-bold text-white truncate max-w-[120px]">{currentUser.nombre}</span>
            </div>

            {/* Conexión Online / Offline */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition ${
                isOnline
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span className="hidden sm:inline">{isOnline ? 'Sincronizado' : 'Offline'}</span>
            </div>

            {/* Botón Ajustes / Actualización de App */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition cursor-pointer"
              title="Actualizaciones de la Aplicación"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>
      )}

      {/* Contenedor Principal Adaptativo */}
      <main className={`flex-1 w-full ${currentStep === 'welcome' ? 'p-0 max-w-full' : 'w-full max-w-[1920px] mx-auto p-0 sm:p-4 md:p-6'} flex items-stretch justify-center`}>
        <div className="w-full flex flex-col justify-start">
          {currentStep === 'welcome' && (
            <WelcomeScreen
              currentUser={currentUser}
              users={users}
              onSelectUser={(u) => {
                AuthService.setActiveUser(u);
                setCurrentUser(u);
              }}
              onStart={() => setCurrentStep('store_select')}
            />
          )}

          {currentStep === 'store_select' && (
            <StoreSelectScreen
              currentUser={currentUser}
              stores={stores}
              onSelectStore={handleSelectStore}
              onBack={() => setCurrentStep('welcome')}
            />
          )}

          {currentStep === 'planogram_3d' && selectedStore && (
            <PlanogramOverviewScreen
              store={selectedStore}
              auditStates={auditStates}
              onSelectPosition={(pos) => {
                setSelectedPosition(pos);
                setCurrentStep('device_identify');
              }}
              onFinishAudit={() => setCurrentStep('audit_summary')}
              onBack={() => setCurrentStep('store_select')}
            />
          )}

          {currentStep === 'device_identify' && selectedStore && selectedPosition && (
            <DeviceIdentifyScreen
              position={selectedPosition}
              store={selectedStore}
              currentUser={currentUser}
              currentState={auditStates[selectedPosition.id]}
              onConfirmSuccess={handleConfirmPosition}
              onBack={() => setCurrentStep('planogram_3d')}
            />
          )}

          {currentStep === 'audit_summary' && selectedStore && (
            <AuditSummaryScreen
              store={selectedStore}
              currentUser={currentUser}
              auditStates={auditStates}
              onFinishComplete={() => {
                setCurrentStep('store_select');
                setSelectedStore(null);
              }}
              onBack={() => setCurrentStep('planogram_3d')}
            />
          )}
        </div>
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Notificación y Banner para instalar como App en smartphone */}
      <PWAInstallPrompt />
    </div>
  );
};
export default App;

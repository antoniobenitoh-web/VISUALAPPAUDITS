import React, { useState, useEffect } from 'react';
import {
  StoreCenter,
  UserProfile,
  PlanogramPosition,
  PositionAuditState,
  AuditWorkflowMode,
  PositionSwapState,
  VisualElementAuditState,
  SwapCampaignAssignment
} from './types';
import { AuthService } from './services/authService';
import { DbService } from './services/dbService';
import { SheetsService } from './services/sheetsService';
import { ACTIVE_IMPLANTATION_CAMPAIGN } from './data/implantationCampaignData';

// Pantallas del flujo responsive adaptadas a Móvil y PC
import { WelcomeScreen } from './components/screens/WelcomeScreen';
import { StoreSelectScreen } from './components/screens/StoreSelectScreen';
import { PlanogramOverviewScreen } from './components/screens/PlanogramOverviewScreen';
import { DeviceIdentifyScreen } from './components/screens/DeviceIdentifyScreen';
import { AuditSummaryScreen } from './components/screens/AuditSummaryScreen';
import { ImplantationOverviewScreen } from './components/screens/ImplantationOverviewScreen';
import { SwapDeviceScreen } from './components/screens/SwapDeviceScreen';
import { SettingsModal } from './components/SettingsModal';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { Wifi, WifiOff, Settings } from 'lucide-react';

export type AppStep = 
  | 'welcome'                   // Pantalla 1: Inicio / Login con Google
  | 'store_select'              // Pantalla 2: Selecciona tienda y modalidad
  | 'planogram_3d'              // Pantalla 3 y 4: Planograma 3D y Hotspots (Auditoría Completa)
  | 'device_identify'           // Pantalla 5-8: Escáner IMEI / Teclado manual / Foto (Auditoría Completa)
  | 'audit_summary'             // Pantalla 9-11: Resumen de auditoría y resultado (Auditoría Completa)
  | 'implantation_overview'     // Módulo Nueva Implantación: Vista 3D / Lista Swap + Parte Visual (PLV)
  | 'implantation_swap_device'; // Módulo Nueva Implantación: Paso 1 OUT (Retirada) + Paso 2 IN (Instalación)

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(AuthService.getActiveUser());
  const [users, setUsers] = useState<UserProfile[]>(DbService.getUsers());
  const [stores, setStores] = useState<StoreCenter[]>(DbService.getStores());
  
  const [currentStep, setCurrentStep] = useState<AppStep>('welcome');
  const [selectedStore, setSelectedStore] = useState<StoreCenter | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<PlanogramPosition | null>(null);
  const [selectedSwapAssignment, setSelectedSwapAssignment] = useState<SwapCampaignAssignment | null>(null);
  const [auditStates, setAuditStates] = useState<Record<string, PositionAuditState>>({});
  const [swapStates, setSwapStates] = useState<Record<string, PositionSwapState>>({});
  const [visualStates, setVisualStates] = useState<Record<string, VisualElementAuditState>>({});
  const [activeImplantationTab, setActiveImplantationTab] = useState<'return_devices' | 'swap_devices' | 'visual_plv'>('return_devices');
  const [openImplantationSummaryOnMount, setOpenImplantationSummaryOnMount] = useState(false);
  const [activeAuditSpace, setActiveAuditSpace] = useState<string>('');
  const [lastAuditPositionId, setLastAuditPositionId] = useState<string | null>(null);
  const [auditViewMode, setAuditViewMode] = useState<'visual' | 'list'>('visual');
  const [activeImplantationSpace, setActiveImplantationSpace] = useState<string>('');
  const [lastImplantationPositionId, setLastImplantationPositionId] = useState<string | null>(null);
  const [implantationViewMode, setImplantationViewMode] = useState<'visual' | 'list'>('visual');
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
          if (data.stores && data.stores.length > 0) setStores(data.stores.map(s => DbService.sanitizeStore(s)));
          if (data.users && data.users.length > 0) setUsers(data.users);
        }
      }).catch((e) => {
        console.warn('Operando con catálogo local:', e);
      });
    }
  }, []);

  const loadImplantationStateForStore = (store: StoreCenter, openSummary = false) => {
    setSelectedStore(store);
    const impDraft = DbService.getImplantationDraft(store.tiendaId);
    const latestRec = DbService.getLatestImplantationForStore(store.tiendaId);

    let sMap: Record<string, PositionSwapState> = {};
    let vMap: Record<string, VisualElementAuditState> = {};

    if (
      impDraft &&
      (Object.keys(impDraft.swapStates || {}).length > 0 ||
        Object.keys(impDraft.visualStates || {}).length > 0)
    ) {
      sMap = { ...impDraft.swapStates };
      vMap = { ...impDraft.visualStates };
    } else if (latestRec) {
      latestRec.swapPositions.forEach(s => { sMap[s.posicionId] = s; });
      latestRec.visualElements.forEach(v => { vMap[v.elementoId] = v; });
    }

    setSwapStates(sMap);
    setVisualStates(vMap);
    setActiveImplantationTab('return_devices');
    setActiveImplantationSpace('');
    setLastImplantationPositionId(null);
    setImplantationViewMode('visual');
    setOpenImplantationSummaryOnMount(openSummary);
    setCurrentStep('implantation_overview');
  };

  // Soporte para Enlace Directo (URL) desde Excel "Matriz Control Retail" (?mode=implantation_view&storeId=...)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const modeParam = params.get('mode');
      const storeIdParam = params.get('storeId');
      if (modeParam === 'implantation_view' && storeIdParam) {
        const allStores = (stores && stores.length > 0 ? stores : DbService.getStores()).map(s => DbService.sanitizeStore(s));
        const targetStore = allStores.find(s => s.tiendaId.toUpperCase() === storeIdParam.toUpperCase());
        if (targetStore && AuthService.canAccessStore(currentUser, targetStore)) {
          loadImplantationStateForStore(targetStore, true);
        }
      }
    } catch (e) {
      console.warn('Error procesando parámetros de enlace directo:', e);
    }
  }, []);

  const handleSelectStore = (store: StoreCenter) => {
    setSelectedStore(store);
    const map: Record<string, PositionAuditState> = {};

    // 1. Cargar como base el último reporte vigente guardado en la app
    const latestAudit = DbService.getLatestAuditForStore(store.tiendaId);
    if (latestAudit && latestAudit.positions && latestAudit.positions.length > 0) {
      latestAudit.positions.forEach(p => {
        if (p.estadoPosicion !== 'Pendiente' || (p.modeloDetectado && p.modeloDetectado !== '-') || (p.imeiSerial && p.imeiSerial !== '-')) {
          map[p.posicionId] = p;
        }
      });
    }

    // 2. Superponer las modificaciones del borrador temporal en curso
    const draft = DbService.getDraft(store.tiendaId);
    if (draft && draft.length > 0) {
      draft.forEach(p => {
        map[p.posicionId] = p;
      });
    }

    setAuditStates(map);
    setActiveAuditSpace('');
    setLastAuditPositionId(null);
    setAuditViewMode('visual');
    setCurrentStep('planogram_3d');
  };

  const handleSelectStoreMode = (store: StoreCenter, mode: AuditWorkflowMode) => {
    const isPromotor = (currentUser?.rol || '').toLowerCase().includes('promotor');
    if (mode === 'new_implantation') {
      loadImplantationStateForStore(store, false);
    } else if (mode === 'clean_audit' && !isPromotor) {
      setSelectedStore(store);
      DbService.clearStoreAudit(store.tiendaId);
      setAuditStates({});
      setActiveAuditSpace('');
      setLastAuditPositionId(null);
      setAuditViewMode('visual');
      setCurrentStep('planogram_3d');
    } else {
      handleSelectStore(store);
    }
  };

  const handleResetAudit = () => {
    const isPromotor = (currentUser?.rol || '').toLowerCase().includes('promotor');
    if (isPromotor) return;
    if (!selectedStore) return;
    DbService.clearStoreAudit(selectedStore.tiendaId);
    setAuditStates({});
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

  const handleConfirmSwapState = (state: PositionSwapState) => {
    if (!selectedStore) return;
    const existingDraft = DbService.getImplantationDraft(selectedStore.tiendaId);
    const updatedSwaps = {
      ...swapStates,
      [state.posicionId]: state
    };
    setSwapStates(updatedSwaps);
    DbService.saveImplantationDraft({
      tiendaId: selectedStore.tiendaId,
      campanaNombre: ACTIVE_IMPLANTATION_CAMPAIGN,
      swapStates: updatedSwaps,
      visualStates,
      returnStates: existingDraft?.returnStates,
      updatedAt: new Date().toISOString()
    });
    setActiveImplantationTab('swap_devices');
    setCurrentStep('implantation_overview');
    setSelectedPosition(null);
    setSelectedSwapAssignment(null);
  };

  const handleUpdateVisualState = (state: VisualElementAuditState) => {
    if (!selectedStore) return;
    const existingDraft = DbService.getImplantationDraft(selectedStore.tiendaId);
    const updatedVisuals = {
      ...visualStates,
      [state.elementoId]: state
    };
    setVisualStates(updatedVisuals);
    DbService.saveImplantationDraft({
      tiendaId: selectedStore.tiendaId,
      campanaNombre: ACTIVE_IMPLANTATION_CAMPAIGN,
      swapStates,
      visualStates: updatedVisuals,
      returnStates: existingDraft?.returnStates,
      updatedAt: new Date().toISOString()
    });
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

            {/* Indicador Conectado / Desconectado */}
            <div
              title={isOnline ? 'Conectado a la base de datos' : 'Desconectado de la base de datos (Modo Local)'}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition ${
                isOnline
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span className="hidden sm:inline">{isOnline ? 'Conectado' : 'Desconectado'}</span>
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
              onSelectStoreMode={handleSelectStoreMode}
              onBack={() => setCurrentStep('welcome')}
            />
          )}

          {currentStep === 'planogram_3d' && selectedStore && (
            <PlanogramOverviewScreen
              store={selectedStore}
              currentUser={currentUser}
              auditStates={auditStates}
              initialActiveSpace={activeAuditSpace}
              onActiveSpaceChange={setActiveAuditSpace}
              initialSelectedPositionId={lastAuditPositionId}
              onSelectPositionIdChange={setLastAuditPositionId}
              initialViewMode={auditViewMode}
              onViewModeChange={setAuditViewMode}
              onSelectPosition={(pos) => {
                setLastAuditPositionId(pos.id);
                setSelectedPosition(pos);
                setCurrentStep('device_identify');
              }}
              onFinishAudit={() => setCurrentStep('audit_summary')}
              onResetAudit={handleResetAudit}
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

          {currentStep === 'implantation_overview' && selectedStore && (
            <ImplantationOverviewScreen
              store={selectedStore}
              allStores={stores}
              currentUser={currentUser}
              swapStates={swapStates}
              visualStates={visualStates}
              activeTab={activeImplantationTab}
              onTabChange={setActiveImplantationTab}
              initialActiveSpace={activeImplantationSpace}
              onActiveSpaceChange={setActiveImplantationSpace}
              initialSelectedPositionId={lastImplantationPositionId}
              onSelectPositionIdChange={setLastImplantationPositionId}
              initialViewMode={implantationViewMode}
              onViewModeChange={setImplantationViewMode}
              initialOpenSummary={openImplantationSummaryOnMount}
              onSelectSwapPosition={(pos, assignment) => {
                setLastImplantationPositionId(pos.id);
                setSelectedPosition(pos);
                setSelectedSwapAssignment(assignment);
                setActiveImplantationTab('swap_devices');
                setCurrentStep('implantation_swap_device');
              }}
              onUpdateVisualState={handleUpdateVisualState}
              onFinishComplete={() => {
                setOpenImplantationSummaryOnMount(false);
                setCurrentStep('store_select');
                setSelectedStore(null);
              }}
              onBack={() => {
                setOpenImplantationSummaryOnMount(false);
                setCurrentStep('store_select');
              }}
            />
          )}

          {currentStep === 'implantation_swap_device' && selectedStore && selectedPosition && selectedSwapAssignment && (
            <SwapDeviceScreen
              position={selectedPosition}
              assignment={selectedSwapAssignment}
              store={selectedStore}
              currentUser={currentUser}
              currentState={swapStates[selectedPosition.id]}
              onConfirmSwap={handleConfirmSwapState}
              onBack={() => setCurrentStep('implantation_overview')}
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

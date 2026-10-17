import React, { useState, useMemo } from 'react';
import { StoreCenter, PositionAuditState, UserProfile, PlanogramPosition, AuditRecord } from '../../types';
import { ExcelService } from '../../services/excelService';
import { DbService } from '../../services/dbService';
import { SheetsService, SyncAuditResult } from '../../services/sheetsService';
import { getPositionsForSpace } from '../../data/defaultData';
import { SaleslandLogo, XiaomiLogo } from '../SaleslandBrandLogos';
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileSpreadsheet, 
  RotateCcw,
  Smartphone,
  Watch,
  Tablet,
  HelpCircle,
  Camera,
  Share2,
  Download,
  Building2,
  Calendar,
  User,
  ShieldCheck,
  Folder,
  FolderTree,
  ExternalLink,
  Check,
  Sparkles,
  Loader2,
  FileText
} from 'lucide-react';

interface AuditSummaryScreenProps {
  store: StoreCenter;
  currentUser: UserProfile;
  auditStates: Record<string, PositionAuditState>;
  onFinishComplete: () => void;
  onBack: () => void;
}

type SummaryMode = 'summary' | 'results' | 'incident_detail' | 'drive_success';

export const AuditSummaryScreen: React.FC<AuditSummaryScreenProps> = ({
  store,
  currentUser,
  auditStates,
  onFinishComplete,
  onBack
}) => {
  const [mode, setMode] = useState<SummaryMode>('summary');
  const [selectedIncident, setSelectedIncident] = useState<PositionAuditState | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncAuditResult | null>(null);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string>('');

  const availableSpaces = useMemo(() => {
    return store.availableSpaces && store.availableSpaces.length > 0
      ? store.availableSpaces
      : ['MESA 1 · Cara 1', 'MESA 1 · Cara 2', 'WALL', 'LINEAL SMARTWATCH'];
  }, [store.availableSpaces]);

  // Obtener todas las posiciones oficiales plasmadas en los planogramas de esta tienda
  const allStorePositions: PlanogramPosition[] = useMemo(() => {
    const list: PlanogramPosition[] = [];
    availableSpaces.forEach(sp => {
      const p = getPositionsForSpace(store.tipoEspacioId, sp, store);
      list.push(...p);
    });
    return list;
  }, [store, availableSpaces]);

  const auditedList = Object.values(auditStates);
  const total = allStorePositions.length > 0 ? allStorePositions.length : (store.totalPuestos || 12);
  const count = auditedList.length;
  const okList = auditedList.filter(p => p.estadoPosicion === 'OK');
  const incidentList = auditedList.filter(p => p.estadoPosicion === 'Incidencia');
  const pendingCount = Math.max(0, total - count);
  const complianceScore = total > 0 ? Math.round((count / total) * 100) : 0;

  // Lista consolidada de posiciones para reporte oficial (incluye todas las del planograma)
  const fullStorePositionsList: PositionAuditState[] = useMemo(() => {
    if (allStorePositions.length === 0) return auditedList;
    return allStorePositions.map(pos => {
      const existing = auditStates[pos.id] || Object.values(auditStates).find(
        a => a.posicionId === pos.id || (a.mesaId === pos.mesaId && a.posicionNumero === pos.posicionNumero)
      );
      if (existing) return existing;
      return {
        posicionId: pos.id,
        mesaId: pos.mesaId,
        posicionNumero: pos.posicionNumero,
        modeloOficial: pos.modeloOficial,
        modeloDetectado: '-',
        imeiSerial: '-',
        estadoPosicion: 'Pendiente' as const,
        esMaqueta: false,
        auditadoPor: currentUser.nombre,
        fechaHora: new Date().toISOString()
      };
    });
  }, [allStorePositions, auditStates, auditedList, currentUser.nombre]);

  // Desglose de posiciones por categoría según el planograma real de la tienda
  const categoryBreakdown = useMemo(() => {
    const isAudited = (pos: PlanogramPosition) => {
      if (auditStates[pos.id]) return true;
      return Object.values(auditStates).some(
        a => a.posicionId === pos.id || (a.mesaId === pos.mesaId && a.posicionNumero === pos.posicionNumero)
      );
    };

    // 1. Smartphones Xiaomi / Redmi
    const smartphonePositions = allStorePositions.filter(p => {
      if (p.categoria === 'Smartphone') return true;
      const name = (p.modeloOficial || '').toLowerCase();
      return !name.includes('watch') && !name.includes('band') && !name.includes('pad') && !name.includes('buds');
    });

    // 2. Smartwatch & Bands (Wearables)
    const wearablePositions = allStorePositions.filter(p => {
      if (p.categoria === 'Wearable') return true;
      const name = (p.modeloOficial || '').toLowerCase();
      return name.includes('watch') || name.includes('band') || name.includes('reloj') || name.includes('pulsera');
    });

    // 3. Tablets & Ecosistema (Tablets, Audio, etc.)
    const ecosystemPositions = allStorePositions.filter(p => {
      return !smartphonePositions.includes(p) && !wearablePositions.includes(p);
    });

    const smartTotal = smartphonePositions.length;
    const smartAudited = smartphonePositions.filter(isAudited).length;

    const wearTotal = wearablePositions.length;
    const wearAudited = wearablePositions.filter(isAudited).length;

    const ecoTotal = ecosystemPositions.length;
    const ecoAudited = ecosystemPositions.filter(isAudited).length;

    if (allStorePositions.length === 0) {
      const sAudited = okList.filter(p => p.modeloOficial.toLowerCase().includes('xiaomi') || p.modeloOficial.toLowerCase().includes('redmi')).length;
      const wAudited = okList.filter(p => p.modeloOficial.toLowerCase().includes('watch') || p.modeloOficial.toLowerCase().includes('band')).length;
      const eAudited = okList.filter(p => p.modeloOficial.toLowerCase().includes('pad')).length;
      return {
        smartphones: { total: sAudited, audited: sAudited, pending: 0 },
        wearables: { total: wAudited, audited: wAudited, pending: 0 },
        ecosystem: { total: eAudited, audited: eAudited, pending: 0 }
      };
    }

    return {
      smartphones: {
        total: smartTotal,
        audited: smartAudited,
        pending: Math.max(0, smartTotal - smartAudited)
      },
      wearables: {
        total: wearTotal,
        audited: wearAudited,
        pending: Math.max(0, wearTotal - wearAudited)
      },
      ecosystem: {
        total: ecoTotal,
        audited: ecoAudited,
        pending: Math.max(0, ecoTotal - ecoAudited)
      }
    };
  }, [allStorePositions, auditStates, okList]);

  // Genera registro de auditoría completo
  const buildAuditRecord = (): AuditRecord => {
    return {
      auditId: `AUDIT_${store.tiendaId}_${Date.now()}`,
      tiendaId: store.tiendaId,
      nombreTienda: store.nombreTienda,
      retailer: store.retailer,
      usuarioEmail: currentUser.email,
      usuarioNombre: currentUser.nombre,
      fechaHora: new Date().toLocaleString('es-ES'),
      totalPosiciones: total,
      okCount: okList.length,
      incidenciasCount: incidentList.length,
      pendientesCount: pendingCount,
      positions: fullStorePositionsList,
      sincronizadoSheets: true
    };
  };

  // 1. Descarga directa de Excel al dispositivo
  const handleDownloadExcel = async () => {
    setIsExporting(true);
    try {
      const record = buildAuditRecord();
      await ExcelService.exportAuditReport(record);
    } catch (err) {
      console.error('Error generando Excel:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Finalizar, generar Excel, subir fotos y Excel a Google Drive, sincronizar Google Sheets
  const handleFinalizeAndSyncDrive = async () => {
    setIsExporting(true);
    setSyncStatusMsg('Generando Excel oficial corporativo...');
    try {
      const record = buildAuditRecord();

      // Generar Excel en memoria y disparar descarga directa al navegador
      const { base64: excelBase64, filename: excelFilename } = await ExcelService.generateAuditExcelBase64(record);
      await ExcelService.exportAuditReport(record);

      setSyncStatusMsg('Sincronizando con Google Drive y Google Sheets...');
      const driveFolderId = DbService.getGoogleDriveFolderId(); // '1RNmY0KnIqtOV6zU0mu080bJKAFFEhRyD'
      const result = await SheetsService.syncAuditToSheets(record, {
        excelBase64,
        excelFilename,
        driveFolderId
      });

      // Guardar auditoría localmente y vaciar borrador
      DbService.saveAuditRecord(record);
      DbService.clearDraft(store.tiendaId);

      setSyncResult(result);
      setMode('drive_success');
    } catch (error) {
      console.error('Error al sincronizar con Google Drive:', error);
      alert('Se ha generado el archivo Excel localmente. Revisa la conexión de red.');
      setMode('drive_success');
    } finally {
      setIsExporting(false);
      setSyncStatusMsg('');
    }
  };

  const currentDateFormatted = new Date().toLocaleDateString('es-ES');
  const currentTimeFormatted = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const currentYear = new Date().getFullYear().toString();
  const currentDateDash = `${String(new Date().getDate()).padStart(2, '0')}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${currentYear}`;
  const driveRootFolderId = DbService.getGoogleDriveFolderId();
  const driveRootUrl = `https://drive.google.com/drive/folders/${driveRootFolderId}`;

  return (
    <div className="w-full max-w-4xl mx-auto min-h-[92dvh] sm:min-h-[640px] flex flex-col bg-white text-slate-800 rounded-none sm:rounded-3xl shadow-2xl relative overflow-hidden border border-slate-200/80 transition-all duration-300">
      
      {/* HEADER CORPORATIVO SALESLAND */}
      <div className="px-5 py-4 bg-gradient-to-r from-[#072431] via-[#104a60] to-[#0a3343] text-white flex items-center justify-between sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={mode === 'summary' ? onBack : () => setMode('summary')}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-teal-300">
              Informe de Auditoría Retail
            </span>
            <h1 className="text-sm sm:text-base font-black text-white">
              {store.nombreTienda}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
          <img src="/images/xiaomi_logo.png" alt="Xiaomi" className="w-5 h-5 rounded-md object-cover" />
          <span className="text-[10px] font-bold text-slate-200 uppercase tracking-tight hidden sm:inline">
            Xiaomi Brand Space
          </span>
        </div>
      </div>

      {/* 1. MODO: RESUMEN DE AUDITORÍA */}
      {mode === 'summary' && (
        <div className="flex-1 flex flex-col justify-between p-5 sm:p-8 overflow-y-auto">
          <div className="space-y-6 max-w-2xl mx-auto w-full">
            
            {/* Medidor Circular de Cumplimiento */}
            <div className="text-center py-4">
              <div className="relative w-40 h-40 rounded-full border-8 border-slate-100 flex flex-col items-center justify-center mx-auto shadow-inner bg-slate-50/50">
                <div 
                  className="absolute inset-0 rounded-full border-8 border-[#009ca6] transition-all duration-1000"
                  style={{
                    clipPath: `polygon(50% 50%, 50% 0%, ${complianceScore > 25 ? '100% 0%' : '50% 0%'}, ${complianceScore > 50 ? '100% 100%' : '100% 0%'}, ${complianceScore > 75 ? '0% 100%' : '100% 100%'}, 0% 0%)`
                  }}
                />
                <span className="text-4xl font-black text-[#104a60] tracking-tight">{count}/{total}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Terminales</span>
                <span className="text-[11px] font-black text-[#009ca6]">{complianceScore}% Completado</span>
              </div>
            </div>

            {/* Metadatos de la Auditoría */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-medium">Retailer</span>
                <span className="font-bold text-slate-800">{store.retailer}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-medium">Auditor</span>
                <span className="font-bold text-slate-800 truncate block">{currentUser.nombre}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-medium">Fecha</span>
                <span className="font-bold text-slate-800">{new Date().toLocaleDateString('es-ES')}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-medium">Espacio</span>
                <span className="font-bold text-slate-800">{store.tipoEspacioId}</span>
              </div>
            </div>

            {/* Desglose por Categoría */}
            <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Desglose por Categoría de Producto
                </h3>
                <span className="text-[10px] font-bold text-slate-500">
                  {count} de {total} auditados ({complianceScore}%)
                </span>
              </div>

              {/* Smartphones Xiaomi */}
              <div className="flex items-center justify-between text-xs sm:text-sm py-2.5 border-b border-slate-200/90">
                <div className="flex items-center gap-2.5 font-bold text-slate-800">
                  <Smartphone className="w-4 h-4 text-[#009ca6] shrink-0" />
                  <div>
                    <span className="block leading-tight">Smartphones Xiaomi</span>
                    {categoryBreakdown.smartphones.total > 0 && categoryBreakdown.smartphones.pending > 0 ? (
                      <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">
                        Faltan {categoryBreakdown.smartphones.pending} por auditar
                      </span>
                    ) : categoryBreakdown.smartphones.total > 0 ? (
                      <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                        ✓ 100% auditado
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-black text-xs sm:text-sm px-2.5 py-1 rounded-xl border shadow-2xs ${
                    categoryBreakdown.smartphones.total > 0 && categoryBreakdown.smartphones.pending === 0
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : categoryBreakdown.smartphones.audited > 0
                      ? 'bg-amber-50 text-amber-900 border-amber-300'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}>
                    {categoryBreakdown.smartphones.audited} de {categoryBreakdown.smartphones.total} auditados
                  </span>
                </div>
              </div>

              {/* Smartwatch & Bands */}
              <div className="flex items-center justify-between text-xs sm:text-sm py-2.5 border-b border-slate-200/90">
                <div className="flex items-center gap-2.5 font-bold text-slate-800">
                  <Watch className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="block leading-tight">Smartwatch & Wearables</span>
                    {categoryBreakdown.wearables.total > 0 && categoryBreakdown.wearables.pending > 0 ? (
                      <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">
                        Faltan {categoryBreakdown.wearables.pending} por auditar
                      </span>
                    ) : categoryBreakdown.wearables.total > 0 ? (
                      <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                        ✓ 100% auditado
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-black text-xs sm:text-sm px-2.5 py-1 rounded-xl border shadow-2xs ${
                    categoryBreakdown.wearables.total > 0 && categoryBreakdown.wearables.pending === 0
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : categoryBreakdown.wearables.audited > 0
                      ? 'bg-amber-50 text-amber-900 border-amber-300'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}>
                    {categoryBreakdown.wearables.audited} de {categoryBreakdown.wearables.total} auditados
                  </span>
                </div>
              </div>

              {/* Tablets & Ecosistema */}
              <div className="flex items-center justify-between text-xs sm:text-sm py-2.5">
                <div className="flex items-center gap-2.5 font-bold text-slate-800">
                  <Tablet className="w-4 h-4 text-cyan-600 shrink-0" />
                  <div>
                    <span className="block leading-tight">Tablets & Ecosistema</span>
                    {categoryBreakdown.ecosystem.total > 0 && categoryBreakdown.ecosystem.pending > 0 ? (
                      <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">
                        Faltan {categoryBreakdown.ecosystem.pending} por auditar
                      </span>
                    ) : categoryBreakdown.ecosystem.total > 0 ? (
                      <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                        ✓ 100% auditado
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-black text-xs sm:text-sm px-2.5 py-1 rounded-xl border shadow-2xs ${
                    categoryBreakdown.ecosystem.total > 0 && categoryBreakdown.ecosystem.pending === 0
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : categoryBreakdown.ecosystem.audited > 0
                      ? 'bg-amber-50 text-amber-900 border-amber-300'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}>
                    {categoryBreakdown.ecosystem.audited} de {categoryBreakdown.ecosystem.total} auditados
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Botones de acción */}
          <div className="pt-6 max-w-2xl mx-auto w-full space-y-2.5">
            {pendingCount > 0 && (
              <button
                type="button"
                onClick={onBack}
                className="w-full py-3.5 bg-amber-50 hover:bg-amber-100 border border-amber-300/80 text-amber-900 font-bold rounded-2xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-amber-700" />
                <span>Continuar auditoría (Faltan {pendingCount} por auditar para el 100%)</span>
              </button>
            )}

            <button
              onClick={() => setMode('results')}
              className="w-full bg-gradient-to-r from-[#009ca6] to-[#00b4bf] hover:from-[#008992] hover:to-[#00a3ad] active:scale-[0.98] text-white font-black py-4 rounded-2xl shadow-xl shadow-[#009ca6]/20 transition text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Ver Resultado Completo de Auditoría</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. MODO: RESULTADOS DETALLADOS Y FINALIZACIÓN */}
      {mode === 'results' && (
        <div className="flex-1 flex flex-col justify-between p-5 sm:p-8 overflow-y-auto">
          <div className="space-y-5 max-w-2xl mx-auto w-full">
            
            {/* Banner de Estado General */}
            <div className={`p-4 rounded-2xl border flex items-center gap-3.5 shadow-xs ${
              incidentList.length > 0
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              {incidentList.length > 0 ? (
                <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              )}
              <div>
                <h3 className="font-black text-sm">
                  {incidentList.length > 0
                    ? `${incidentList.length} incidencia(s) detectada(s)`
                    : 'Auditoría completada con 100% de conformidad'}
                </h3>
                <p className="text-xs opacity-90">
                  {incidentList.length > 0
                    ? 'Se han registrado discrepancias entre el planograma oficial y el lineal en tienda.'
                    : 'Todos los terminales coinciden con el planograma oficial de Xiaomi y Salesland.'}
                </p>
              </div>
            </div>

            {/* Tarjeta de Métricas */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Total Puestos Oficiales:</span>
                <span className="font-black text-slate-900">{total}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Terminales Auditados:</span>
                <span className="font-black text-slate-900">{count}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Validados Correctos:
                </span>
                <span className="font-black text-emerald-600">{okList.length}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-rose-700 font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-500" /> Incidencias:
                </span>
                <span className="font-black text-rose-600">{incidentList.length}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Pendientes:</span>
                <span className="font-bold text-slate-500">{pendingCount}</span>
              </div>
            </div>

            {/* Lista de Incidencias Si Existen */}
            {incidentList.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Detalle de Incidencias ({incidentList.length})
                </h4>
                {incidentList.map(inc => (
                  <div
                    key={inc.posicionId}
                    onClick={() => {
                      setSelectedIncident(inc);
                      setMode('incident_detail');
                    }}
                    className="p-3.5 bg-white border border-rose-200 hover:border-rose-400 rounded-2xl flex items-center justify-between cursor-pointer transition shadow-xs"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                      <div className="truncate">
                        <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                          {inc.modeloOficial}
                        </p>
                        <p className="text-[11px] text-rose-600 font-medium">
                          Posición {inc.posicionNumero} • {inc.tipoIncidencia || 'Discrepancia detectada'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-400">Ver ›</span>
                  </div>
                ))}
              </div>
            )}

            {/* Botones de Finalización y Almacenamiento en Google Drive */}
            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                onClick={handleFinalizeAndSyncDrive}
                disabled={isExporting}
                className="w-full bg-gradient-to-r from-[#009ca6] via-[#008992] to-[#104a60] hover:brightness-110 active:scale-[0.99] text-white font-black py-4 px-4 rounded-2xl shadow-xl shadow-[#009ca6]/25 transition flex items-center justify-center gap-2.5 cursor-pointer text-sm sm:text-base disabled:opacity-75"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{syncStatusMsg || 'Sincronizando con Google Drive...'}</span>
                  </>
                ) : (
                  <>
                    <FolderTree className="w-5 h-5 text-teal-300" />
                    <span>Finalizar y Guardar en Google Drive (Excel + Fotos)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadExcel}
                disabled={isExporting}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold py-3 px-4 rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Descargar copia de archivo Excel (.xlsx)</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 3. MODO: DETALLE DE INCIDENCIA ESPECÍFICA */}
      {mode === 'incident_detail' && selectedIncident && (
        <div className="flex-1 flex flex-col justify-between p-5 sm:p-8 overflow-y-auto">
          <div className="space-y-4 max-w-lg mx-auto w-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <button
                onClick={() => setMode('results')}
                className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-sm sm:text-base font-black text-slate-900">Detalle de Incidencia</h2>
              <div className="w-9" />
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Puesto:</span>
                <span className="font-bold text-slate-900">#{selectedIncident.posicionNumero}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Modelo Teórico Oficial:</span>
                <span className="font-bold text-slate-900">{selectedIncident.modeloOficial}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Modelo Encontrado:</span>
                <span className="font-bold text-rose-700">{selectedIncident.modeloDetectado || 'No coincide'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">IMEI Registrado:</span>
                <span className="font-mono font-bold text-slate-900">{selectedIncident.imeiSerial || 'N/A'}</span>
              </div>
            </div>

            {selectedIncident.fotoEvidenciaUrl && (
              <div>
                <span className="text-xs font-bold text-slate-500 block mb-1">Foto de Evidencia:</span>
                <div className="rounded-2xl overflow-hidden border border-slate-200 max-h-60 bg-black flex items-center justify-center">
                  <img src={selectedIncident.fotoEvidenciaUrl} alt="Evidencia" className="max-h-60 object-contain" />
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 max-w-lg mx-auto w-full">
            <button
              onClick={() => setMode('results')}
              className="w-full bg-[#104a60] text-white font-black py-3.5 rounded-2xl text-xs sm:text-sm cursor-pointer"
            >
              Volver a Resultados
            </button>
          </div>
        </div>
      )}

      {/* 4. MODO: VISTA GOOGLE SHEETS & GOOGLE DRIVE CON BENEFICIOS (TAL Y COMO EN LA IMAGEN) */}
      {mode === 'drive_success' && (
        <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto space-y-5 bg-slate-50/60">
          
          {/* TARJETA SUPERIOR: VISTA EN GOOGLE SHEETS */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            
            {/* Header de la tarjeta */}
            <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {/* Logo SVG de Google Sheets */}
                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <rect width="24" height="24" rx="4" fill="#0F9D58"/>
                    <path d="M14 4H7C5.89543 4 5 4.89543 5 6V18C5 19.1046 5.89543 20 7 20H17C18.1046 20 19 19.1046 19 18V9L14 4Z" fill="#0F9D58"/>
                    <path d="M14 4V9H19L14 4Z" fill="#87CEAB"/>
                    <path d="M8 12H16M8 14.5H16M8 17H13" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-black tracking-tight text-slate-800 uppercase">
                    AUDITORÍA ESPACIOS DE MARCA
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-[#009ca6] tracking-tight">
                  Vista en Google Sheets
                </span>
              </div>
            </div>

            {/* Pestañas de Google Sheets */}
            <div className="bg-slate-100/80 px-3 py-1.5 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px] font-semibold text-slate-600">
              <span className="px-2.5 py-1 bg-white/70 rounded-md text-slate-500 border border-slate-200/60 flex items-center gap-1 cursor-default">
                ⚙ CONFIGURACIÓN
              </span>
              <span className="px-2.5 py-1 bg-white/70 rounded-md text-slate-500 border border-slate-200/60 cursor-default">
                TIENDAS
              </span>
              <span className="px-3 py-1 bg-white rounded-md text-[#009ca6] font-bold border-t-2 border-t-[#009ca6] border-x border-b-0 border-slate-200 shadow-2xs flex items-center gap-1">
                {store.nombreTienda}
              </span>
              <span className="px-2.5 py-1 bg-white/50 rounded-md text-slate-400 border border-slate-200/40 text-[10px] hidden sm:inline">
                Carpintería Gdolphe
              </span>
              <span className="px-2 py-1 text-slate-400">...</span>
            </div>

            {/* Tabla de Google Sheets idéntica al render oficial */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#009ca6] text-white font-bold text-[11px] tracking-wide">
                    <th className="py-2.5 px-3 border-r border-[#00878f]/50">Fecha</th>
                    <th className="py-2.5 px-3 border-r border-[#00878f]/50">Hora</th>
                    <th className="py-2.5 px-3 border-r border-[#00878f]/50">Tienda</th>
                    <th className="py-2.5 px-3 border-r border-[#00878f]/50">Espacio</th>
                    <th className="py-2.5 px-3 border-r border-[#00878f]/50 text-center">Posición</th>
                    <th className="py-2.5 px-3 border-r border-[#00878f]/50">Modelo esperado</th>
                    <th className="py-2.5 px-3 border-r border-[#00878f]/50">Modelo detectado</th>
                    <th className="py-2.5 px-3 border-r border-[#00878f]/50">IMEI</th>
                    <th className="py-2.5 px-3 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {fullStorePositionsList.slice(0, 8).map((pos, idx) => {
                    const isOk = pos.estadoPosicion === 'OK';
                    const isInc = pos.estadoPosicion === 'Incidencia';
                    const isAudited = isOk || isInc;
                    return (
                      <tr key={pos.posicionId || idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2 px-3 text-slate-600 font-mono text-[10px] whitespace-nowrap">
                          {currentDateFormatted}
                        </td>
                        <td className="py-2 px-3 text-slate-600 font-mono text-[10px]">
                          {currentTimeFormatted}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-800 whitespace-nowrap">
                          {store.nombreTienda}
                        </td>
                        <td className="py-2 px-3 text-slate-600 whitespace-nowrap">
                          {pos.mesaId ? pos.mesaId.replace(' · Cara ', ' C') : 'Xiaomi'}
                        </td>
                        <td className="py-2 px-3 text-center font-mono font-bold text-slate-700">
                          {String(pos.posicionNumero).padStart(2, '0')}
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-800">
                          {pos.modeloOficial}
                        </td>
                        <td className="py-2 px-3 text-slate-700 font-medium">
                          {isAudited ? (pos.modeloDetectado || pos.modeloOficial) : '—'}
                        </td>
                        <td className="py-2 px-3 font-mono text-[10px] text-slate-600 truncate max-w-[120px]">
                          {pos.imeiSerial && pos.imeiSerial !== '-' ? `${pos.imeiSerial.slice(0, 6)}XXXXXX` : '—'}
                        </td>
                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          {isOk ? (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#22c55e] text-white shadow-2xs">
                              OK
                            </span>
                          ) : isInc ? (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#ff6b6b] text-white shadow-2xs">
                              INCIDENCIA
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#ffa8a8] text-rose-900 shadow-2xs">
                              NO AUDITADO
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {fullStorePositionsList.length > 8 && (
                <div className="px-4 py-2 bg-slate-50 text-[10px] text-slate-500 font-medium text-center border-t border-slate-100">
                  Mostrando 8 de {fullStorePositionsList.length} posiciones sincronizadas en Google Sheets.
                </div>
              )}
            </div>
          </div>

          {/* PARTE INFERIOR: DOS TARJETAS (CARPETA GOOGLE DRIVE + BENEFICIOS) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* TARJETA 1: CARPETA EN GOOGLE DRIVE */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                {/* Header de Carpeta Drive */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    {/* Icono oficial Google Drive */}
                    <div className="w-7 h-7 flex items-center justify-center">
                      <svg className="w-6 h-6" viewBox="0 0 87.3 78" fill="none">
                        <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.9 2.5 3.2 3.3l16.3-28.2H6.6c0 1.5.4 3 1.2 4.3l-1.2 13.95z" fill="#0066DA"/>
                        <path d="M43.65 25 29.8 1.1c-1.3.8-2.4 1.9-3.2 3.2l-25.4 44c-.8 1.4-1.2 2.9-1.2 4.4h29.95L43.65 25z" fill="#00AC47"/>
                        <path d="m73.55 76.8c1.3-.8 2.4-1.9 3.2-3.2l7.7-13.3c.8-1.4 1.2-2.9 1.2-4.4 0-1.5-.4-3-1.2-4.3l-20.7-35.9H43.65l13.85 24H73.55l-16.25 28.2 16.25 8.9z" fill="#EA4335"/>
                        <path d="M43.65 25 57.5 1.1C56.2.3 54.7 0 53.2 0H34.1c-1.5 0-3 .4-4.3 1.1L43.65 25z" fill="#00832D"/>
                        <path d="M59.95 52.7H27.35L11.1 80.9c1.3.8 2.8 1.1 4.3 1.1h56.4c1.5 0 3-.4 4.3-1.1L59.95 52.7z" fill="#2684FC"/>
                        <path d="M73.55 76.8 59.95 52.7H29.95l-16.3 28.2c1.3.8 2.8 1.1 4.3 1.1h56.4c1.5 0 3-.4 4.3-1.1z" fill="#FFBA00"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                        Carpeta en Google Drive
                      </h3>
                      <p className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">
                        ID: {driveRootFolderId}
                      </p>
                    </div>
                  </div>

                  <a
                    href={driveRootUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-slate-400 hover:text-[#009ca6] transition rounded-lg hover:bg-slate-50"
                    title="Abrir carpeta en Google Drive"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Vista en Árbol de Carpetas */}
                <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/70 font-mono text-xs text-slate-700 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <Folder className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="truncate">AUDITORÍA ESPACIOS DE MARCA</span>
                  </div>
                  
                  <div className="pl-4 border-l border-slate-200 ml-2 space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <Folder className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="truncate">{store.retailer}</span>
                    </div>

                    <div className="pl-4 border-l border-slate-200 ml-2 space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <Folder className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="truncate">{store.nombreTienda}</span>
                      </div>

                      <div className="pl-4 border-l border-slate-200 ml-2 space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Folder className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span>{currentYear}</span>
                        </div>

                        <div className="pl-4 border-l border-slate-200 ml-2 space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                            <Folder className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span>{currentDateDash}</span>
                          </div>

                          {/* Archivos guardados */}
                          <div className="pl-4 border-l border-slate-200 ml-2 space-y-1 pt-0.5 text-[11px] text-slate-600">
                            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold truncate">
                              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate">Auditoria_{store.nombreTienda.replace(/[^a-zA-Z0-9]/g, '')}_{currentDateDash}.xlsx</span>
                            </div>
                            {auditedList.slice(0, 2).map((item, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-slate-600 truncate">
                                <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">
                                  {(item.modeloOficial || 'Dispositivo').replace(/[^a-zA-Z0-9]/g, '')}_{item.imeiSerial && item.imeiSerial !== '-' ? item.imeiSerial.slice(0, 6) : `Pos${item.posicionNumero}`}.jpg
                                </span>
                              </div>
                            ))}
                            {auditedList.length > 2 && (
                              <div className="text-[10px] text-slate-400 italic pl-5">
                                + {auditedList.length - 2} fotografías de evidencia más...
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones inferiores de la tarjeta de Drive */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMode('summary')}
                  className="w-full bg-[#009ca6] hover:bg-[#008992] text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-sm transition cursor-pointer text-center"
                >
                  Ver resumen
                </button>
                <button
                  type="button"
                  onClick={onFinishComplete}
                  className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition cursor-pointer text-center"
                >
                  Volver al inicio
                </button>
              </div>
            </div>

            {/* TARJETA 2: BENEFICIOS */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-800 mb-4 tracking-tight">
                  Beneficios
                </h3>

                <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700">
                  <li className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                    <span className="font-medium text-slate-800">Control de posición y modelo.</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                    <span className="font-medium text-slate-800">Registro de IMEI y fotografía.</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                    <span className="font-medium text-slate-800">Trazabilidad por tienda y fecha.</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                    <span className="font-medium text-slate-800">Detección de duplicados.</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                    <span className="font-medium text-slate-800">Información en tiempo real.</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                    <span className="font-medium text-slate-800">Sin necesidad de instalación (vía PWA).</span>
                  </li>
                </ul>
              </div>

              {/* Firma manuscrita corporativa "Todo bajo control" */}
              <div className="pt-6 pb-2 text-right">
                <div className="inline-block relative">
                  <span className="text-xl sm:text-2xl font-bold tracking-wide italic text-[#009ca6] drop-shadow-2xs select-none" style={{ fontFamily: 'Caveat, cursive, sans-serif' }}>
                    Todo bajo control
                  </span>
                  {/* Trazo decorativo de subrayado manual */}
                  <svg className="w-full h-3 -mt-1 text-[#009ca6]" viewBox="0 0 100 12" fill="none">
                    <path d="M2 7C25 2 70 3 98 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};


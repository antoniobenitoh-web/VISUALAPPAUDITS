import {
  AuditRecord,
  ImplantationDraft,
  ImplantationRecord,
  PositionAuditState,
  StoreCenter,
  UserProfile,
  VisualElementAuditState
} from '../types';
import { INITIAL_STORES, INITIAL_USERS } from '../data/defaultData';
import { SEED_AUDITS } from '../data/seedAudits';
import realPlanogramsData from '../data/realPlanograms.json';

const DRAFTS_KEY = 'brand_audit_drafts';
const HISTORY_KEY = 'brand_audit_history';
const LATEST_AUDIT_KEY_PREFIX = 'brand_audit_latest_';
const IMPLANTATION_DRAFTS_KEY = 'brand_implantation_drafts';
const IMPLANTATION_HISTORY_KEY = 'brand_implantation_history';
const STORES_KEY = 'brand_audit_stores_v6';
const USERS_KEY = 'brand_audit_users_v4';
const SYNC_QUEUE_KEY = 'brand_audit_sync_queue';
const SHEETS_CONFIG_KEY = 'brand_audit_sheets_config';

export class DbService {
  // Usuarios
  static getUsers(): UserProfile[] {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_USERS;
    }
  }

  static saveUsers(users: UserProfile[]) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  // Sanitizador universal de tiendas para asegurar coherencia de retailer (especialmente Alcampo Utebo)
  static sanitizeStore(s: StoreCenter): StoreCenter {
    const nameLower = (s.nombreTienda || '').toLowerCase();
    const idLower = (s.tiendaId || '').toLowerCase();
    const spaceLower = (s.tipoEspacioId || '').toLowerCase();

    let retailer = s.retailer;
    if (
      nameLower.includes('alcampo') || 
      nameLower.includes('utebo') || 
      idLower.startsWith('alcp') || 
      spaceLower.includes('alcampo')
    ) {
      retailer = 'Alcampo';
    } else if (nameLower.includes('eci') || nameLower.includes('corte') || idLower.startsWith('eci')) {
      retailer = 'El Corte Inglés';
    } else if (nameLower.includes('fnac') || idLower.startsWith('fnac')) {
      retailer = 'FNAC';
    } else if (nameLower.includes('crf') || nameLower.includes('carrefour') || idLower.startsWith('crf')) {
      retailer = 'Carrefour';
    } else if (nameLower.includes('media') || nameLower.includes('mm') || idLower.startsWith('mies')) {
      retailer = 'MediaMarkt';
    }

    return { ...s, retailer };
  }

  // Tiendas
  static getStores(): StoreCenter[] {
    const raw = localStorage.getItem(STORES_KEY);
    let stores = INITIAL_STORES;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          stores = parsed;
        } else {
          stores = INITIAL_STORES;
        }
      } catch {
        stores = INITIAL_STORES;
      }
    } else {
      localStorage.setItem(STORES_KEY, JSON.stringify(INITIAL_STORES));
    }

    // Auto-sanitizar tiendas y fusionar estados de auditoría precargados oficiales
    return stores.map(s => {
      const sanitized = this.sanitizeStore(s);
      const seed = SEED_AUDITS[s.tiendaId];
      if (seed && sanitized.auditStatus === 'Pendiente') {
        return {
          ...sanitized,
          auditStatus: seed.incidenciasCount > 0 ? 'Con Incidencias' : 'Auditada',
          lastAuditDate: seed.fechaHora.slice(0, 10)
        };
      }
      return sanitized;
    });
  }

  static saveStores(stores: StoreCenter[]) {
    const sanitized = stores.map(s => this.sanitizeStore(s));
    localStorage.setItem(STORES_KEY, JSON.stringify(sanitized));
  }

  // Migra posiciones antiguas de Table 2 Mesa 1 Cara 2 (numeración antigua 11..21) a la oficial P13..P23
  static migrateTable2Mesa1Cara2Positions(positions: PositionAuditState[]): PositionAuditState[] {
    if (!Array.isArray(positions)) return positions;
    const hasOldM1C2 = positions.some(
      (p) => p.posicionId === 'Table 2-MESA_1_·_Cara_2-P11' || (p.mesaId === 'MESA 1 · Cara 2' && p.posicionNumero === 11 && p.posicionId?.startsWith('Table 2-'))
    );
    if (!hasOldM1C2) return positions;

    const remap: Record<number, { pos: number; model: string; dummy: boolean }> = {
      19: { pos: 13, model: 'Redmi 17 5G Orange', dummy: false },
      21: { pos: 14, model: 'Redmi Buds 8', dummy: true },
      20: { pos: 15, model: 'Redmi Buds 8 Pro', dummy: true },
      17: { pos: 16, model: 'Redmi Note 17 5G Black', dummy: false },
      18: { pos: 17, model: 'Redmi Note 17 5G Sky Teal', dummy: false },
      14: { pos: 18, model: 'Redmi Note 17 Pro 5G Black', dummy: false },
      15: { pos: 19, model: 'Redmi Note 17 Pro 5G Purple', dummy: true },
      16: { pos: 20, model: 'Redmi Watch 6 Active Black', dummy: false },
      11: { pos: 21, model: 'Redmi Note 17 Pro Max 5G Black', dummy: false },
      12: { pos: 22, model: 'Redmi Note 17 Pro Max 5G Green', dummy: true },
      13: { pos: 23, model: 'Redmi Watch 6 Black', dummy: false }
    };

    return positions.map((p) => {
      if (p.posicionId?.startsWith('Table 2-MESA_1_·_Cara_2-P') && remap[p.posicionNumero]) {
        const cfg = remap[p.posicionNumero];
        const sameDetected = p.modeloDetectado === p.modeloOficial;
        return {
          ...p,
          posicionId: `Table 2-MESA_1_·_Cara_2-P${cfg.pos}`,
          posicionNumero: cfg.pos,
          modeloOficial: cfg.model,
          modeloDetectado: sameDetected ? cfg.model : p.modeloDetectado,
          esMaqueta: cfg.dummy
        };
      }
      return p;
    });
  }

  // Limpia cualquier borrador antiguo que haya quedado en localStorage de sesiones previas
  static purgeLegacyLocalStorageDrafts() {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (
          k &&
          (k.startsWith(`${DRAFTS_KEY}_`) ||
            k.startsWith('AUDIT_POSM_DRAFT_') ||
            k.startsWith(`${IMPLANTATION_DRAFTS_KEY}_`))
        ) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {
      // ignore storage errors
    }
  }

  // Borrador actual de una tienda (en sessionStorage: se mantiene al cambiar de pestaña, pero se borra al cerrar la app/pestaña por completo)
  static getDraft(tiendaId: string): PositionAuditState[] | null {
    this.purgeLegacyLocalStorageDrafts();
    const raw = sessionStorage.getItem(`${DRAFTS_KEY}_${tiendaId}`);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return null;

      // Descartar borrador si tiene la numeración antigua desfasada donde P1 era Xiaomi 17 Ultra Black
      const hasOldP1 = parsed.some(
        (p) =>
          (p.posicionNumero === 1 || p.posicionId?.endsWith('-P1')) &&
          p.modeloOficial?.toLowerCase().includes('17 ultra black')
      );
      if (hasOldP1) {
        sessionStorage.removeItem(`${DRAFTS_KEY}_${tiendaId}`);
        return null;
      }

      return this.migrateTable2Mesa1Cara2Positions(parsed);
    } catch {
      return null;
    }
  }

  static saveDraft(tiendaId: string, positions: PositionAuditState[]) {
    sessionStorage.setItem(`${DRAFTS_KEY}_${tiendaId}`, JSON.stringify(positions));
  }

  static clearDraft(tiendaId: string) {
    sessionStorage.removeItem(`${DRAFTS_KEY}_${tiendaId}`);
    localStorage.removeItem(`${DRAFTS_KEY}_${tiendaId}`);
  }

  // Borrador de POSM en Auditoría Regular (en sessionStorage: solo dura mientras la pestaña/sesión esté abierta)
  static getAuditPosmDraft(tiendaId: string): Record<string, VisualElementAuditState> | null {
    const raw = sessionStorage.getItem(`AUDIT_POSM_DRAFT_${tiendaId}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  static saveAuditPosmDraft(tiendaId: string, posmStates: Record<string, VisualElementAuditState>) {
    sessionStorage.setItem(`AUDIT_POSM_DRAFT_${tiendaId}`, JSON.stringify(posmStates));
  }

  static clearAuditPosmDraft(tiendaId: string) {
    sessionStorage.removeItem(`AUDIT_POSM_DRAFT_${tiendaId}`);
    localStorage.removeItem(`AUDIT_POSM_DRAFT_${tiendaId}`);
  }

  // Historial y Reporte Vigente de auditorías
  static getHistory(): AuditRecord[] {
    let localHistory: AuditRecord[] = [];
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) {
      try {
        localHistory = JSON.parse(raw);
      } catch {}
    }
    const localStoreIds = new Set(localHistory.map(r => r.tiendaId));
    const seedRecords = Object.values(SEED_AUDITS).filter(r => !localStoreIds.has(r.tiendaId));
    return [...localHistory, ...seedRecords];
  }

  // Obtiene el último reporte vigente completado de una tienda específica
  static getLatestAuditForStore(tiendaId: string): AuditRecord | null {
    const history = this.getHistory();
    // Buscar la última auditoría completa (que no sea un registro parcial POST_IMP de solo 11 posiciones)
    const latestFullFromHistory = history.find(
      (r) =>
        r.tiendaId === tiendaId &&
        !r.auditId?.includes('_POST_IMP_') &&
        !(r.positions || []).some(
          (p) =>
            (p.posicionNumero === 1 || p.posicionId?.endsWith('-P1')) &&
            p.modeloOficial?.toLowerCase().includes('17 ultra black')
        )
    );
    const seedRecord = SEED_AUDITS[tiendaId] || null;
    const baseFullAudit = latestFullFromHistory || seedRecord;

    let directRecord: AuditRecord | null = null;
    const rawDirect = localStorage.getItem(`${LATEST_AUDIT_KEY_PREFIX}${tiendaId}`);
    if (rawDirect) {
      try {
        const parsed = JSON.parse(rawDirect);
        if (parsed && parsed.tiendaId === tiendaId) {
          directRecord = {
            ...parsed,
            positions: this.migrateTable2Mesa1Cara2Positions(parsed.positions || [])
          };
        }
      } catch {}
    }

    // Si directRecord es un registro parcial POST_IMP, conservar las posiciones de la última auditoría completa como base
    if (directRecord && directRecord.auditId?.includes('_POST_IMP_') && baseFullAudit) {
      return {
        ...baseFullAudit,
        positions: this.migrateTable2Mesa1Cara2Positions(baseFullAudit.positions || [])
      };
    }

    if (directRecord) {
      return directRecord;
    }

    if (baseFullAudit) {
      return {
        ...baseFullAudit,
        positions: this.migrateTable2Mesa1Cara2Positions(baseFullAudit.positions || [])
      };
    }

    return null;
  }

  // Guarda el registro de auditoría en la aplicación optimizando el almacenamiento:
  // Se guardan todos los datos (posiciones, modelos, IMEIs, incidencias, notas, fechas),
  // pero se excluyen las imágenes pesadas en base64 de la copia local, ya que estas se suben a Google Drive.
  static saveAuditRecord(record: AuditRecord) {
    // 1. Generar copia ligera sin las fotos base64 para no saturar localStorage
    const lightweightPositions = (record.positions || []).map(p => {
      const { fotoEvidenciaUrl, ...rest } = p;
      return {
        ...rest,
        fotoEvidenciaUrl: fotoEvidenciaUrl ? '[Almacenada en Google Drive]' : undefined
      };
    });

    const lightweightRecord: AuditRecord = {
      ...record,
      positions: lightweightPositions
    };

    // 2. Guardar como reporte vigente de la tienda para consulta inmediata
    try {
      localStorage.setItem(
        `${LATEST_AUDIT_KEY_PREFIX}${record.tiendaId}`,
        JSON.stringify(lightweightRecord)
      );
    } catch (e) {
      console.warn('Error guardando reporte vigente en localStorage:', e);
    }

    // 3. Guardar en historial general (manteniendo los últimos 30 registros)
    try {
      const history = this.getHistory().filter(h => h.auditId !== record.auditId);
      const updatedHistory = [lightweightRecord, ...history].slice(0, 30);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (e) {
      console.warn('Error guardando en historial general:', e);
    }

    // Si no está sincronizado, añadir a cola offline (manteniendo registro con fotos para reintento)
    if (!record.sincronizadoSheets) {
      this.addToSyncQueue(record);
    }

    // 4. Actualizar estado y fecha en el catálogo de tiendas
    const stores = this.getStores();
    const storeIdx = stores.findIndex(s => s.tiendaId === record.tiendaId);
    if (storeIdx !== -1) {
      stores[storeIdx].auditStatus = record.incidenciasCount > 0 ? 'Con Incidencias' : 'Auditada';
      stores[storeIdx].lastAuditDate = new Date().toISOString().slice(0, 10);
      this.saveStores(stores);
    }
  }

  // Permite reiniciar o limpiar la auditoría de una tienda si el usuario desea empezar desde cero
  static clearStoreAudit(tiendaId: string) {
    this.clearDraft(tiendaId);
    localStorage.removeItem(`${LATEST_AUDIT_KEY_PREFIX}${tiendaId}`);

    const stores = this.getStores();
    const storeIdx = stores.findIndex(s => s.tiendaId === tiendaId);
    if (storeIdx !== -1) {
      stores[storeIdx].auditStatus = 'Pendiente';
      stores[storeIdx].lastAuditDate = undefined;
      this.saveStores(stores);
    }
  }

  // Cola de sincronización Offline
  static getSyncQueue(): AuditRecord[] {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static addToSyncQueue(record: AuditRecord) {
    const queue = this.getSyncQueue();
    queue.push(record);
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  }

  static removeAuditFromQueue(auditId: string) {
    const queue = this.getSyncQueue().filter(item => item.auditId !== auditId);
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  }

  // Configuración de Google Sheets Webhook
  static getSheetsWebhookUrl(): string {
    const defaultUrl = 'https://script.google.com/macros/s/AKfycbzn_qcs03cfotJkAhHEn6YskpKNIZIXlWEBmXmTE_NN89KCnt8DP_7AGx6zQ9aENye5/exec';
    const stored = localStorage.getItem(SHEETS_CONFIG_KEY);
    // Si tiene la URL antigua desactualizada, migrar automáticamente a la nueva URL activa con Drive
    if (stored && stored.includes('AKfycbw6m4LUbqvMEVVWFFGds_IyMokoB9v0wig5KcPjUi8BcXDhRdC0hMldXFayP5_c67HOQg')) {
      localStorage.setItem(SHEETS_CONFIG_KEY, defaultUrl);
      return defaultUrl;
    }
    return stored || defaultUrl;
  }

  static saveSheetsWebhookUrl(url: string) {
    localStorage.setItem(SHEETS_CONFIG_KEY, url.trim());
  }

  // Configuración de Google Drive
  static getGoogleDriveFolderId(): string {
    return localStorage.getItem('brand_audit_gdrive_folder_id') || '1RNmY0KnIqtOV6zU0mu080bJKAFFEhRyD';
  }

  static saveGoogleDriveFolderId(id: string) {
    localStorage.setItem('brand_audit_gdrive_folder_id', id.trim());
  }

  // Catálogo completo de dispositivos (Planogramas Columna D) sin duplicados
  static getCatalogDevices(): string[] {
    const DEVICES_KEY = 'brand_audit_catalog_devices_v2';
    const raw = localStorage.getItem(DEVICES_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {}
    }

    // Extraer sin duplicados desde realPlanograms.json
    const set = new Set<string>();
    Object.values(realPlanogramsData as Record<string, Array<{ device?: string }>>)
      .flat()
      .forEach(item => {
        if (item?.device && typeof item.device === 'string' && item.device.trim()) {
          set.add(item.device.trim());
        }
      });

    const list = Array.from(set).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
    localStorage.setItem(DEVICES_KEY, JSON.stringify(list));
    return list;
  }

  static saveCatalogDevices(devices: string[]) {
    const DEVICES_KEY = 'brand_audit_catalog_devices_v2';
    if (Array.isArray(devices) && devices.length > 0) {
      const current = this.getCatalogDevices();
      const set = new Set<string>([...devices, ...current]);
      const list = Array.from(set)
        .map(d => String(d).trim())
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
      localStorage.setItem(DEVICES_KEY, JSON.stringify(list));
    }
  }

  // =========================================================================
  // PERSISTENCIA DE "NUEVA IMPLANTACIÓN" (BORRADORES E HISTORIAL)
  // =========================================================================

  static getImplantationDraft(tiendaId: string): ImplantationDraft | null {
    this.purgeLegacyLocalStorageDrafts();
    const raw = sessionStorage.getItem(`${IMPLANTATION_DRAFTS_KEY}_${tiendaId}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  static saveImplantationDraft(draft: ImplantationDraft) {
    sessionStorage.setItem(`${IMPLANTATION_DRAFTS_KEY}_${draft.tiendaId}`, JSON.stringify(draft));
  }

  static clearImplantationDraft(tiendaId: string) {
    sessionStorage.removeItem(`${IMPLANTATION_DRAFTS_KEY}_${tiendaId}`);
    localStorage.removeItem(`${IMPLANTATION_DRAFTS_KEY}_${tiendaId}`);
  }

  static getImplantationHistory(): ImplantationRecord[] {
    const raw = localStorage.getItem(IMPLANTATION_HISTORY_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static saveImplantationRecord(record: ImplantationRecord) {
    const history = this.getImplantationHistory();
    const updated = [record, ...history.filter((r) => r.implantationId !== record.implantationId)];
    localStorage.setItem(IMPLANTATION_HISTORY_KEY, JSON.stringify(updated));
  }

  static getLatestImplantationForStore(tiendaId: string): ImplantationRecord | null {
    const history = this.getImplantationHistory();
    return history.find((r) => r.tiendaId === tiendaId) || null;
  }
}

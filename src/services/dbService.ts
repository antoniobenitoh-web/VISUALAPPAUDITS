import { AuditRecord, PositionAuditState, StoreCenter, UserProfile } from '../types';
import { INITIAL_STORES, INITIAL_USERS } from '../data/defaultData';

const DRAFTS_KEY = 'brand_audit_drafts';
const HISTORY_KEY = 'brand_audit_history';
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

  // Tiendas
  static getStores(): StoreCenter[] {
    const raw = localStorage.getItem(STORES_KEY);
    let stores = INITIAL_STORES;
    if (raw) {
      try {
        stores = JSON.parse(raw);
      } catch {
        stores = INITIAL_STORES;
      }
    } else {
      localStorage.setItem(STORES_KEY, JSON.stringify(INITIAL_STORES));
    }

    // Auto-sanitizar tiendas para asegurar coherencia de retailer
    return stores.map(s => {
      if (s.nombreTienda && s.nombreTienda.toLowerCase().includes('alcampo') && s.retailer !== 'Alcampo') {
        return { ...s, retailer: 'Alcampo' as const };
      }
      return s;
    });
  }

  static saveStores(stores: StoreCenter[]) {
    const sanitized = stores.map(s => {
      if (s.nombreTienda && s.nombreTienda.toLowerCase().includes('alcampo') && s.retailer !== 'Alcampo') {
        return { ...s, retailer: 'Alcampo' as const };
      }
      return s;
    });
    localStorage.setItem(STORES_KEY, JSON.stringify(sanitized));
  }

  // Borrador actual de una tienda
  static getDraft(tiendaId: string): PositionAuditState[] | null {
    const raw = localStorage.getItem(`${DRAFTS_KEY}_${tiendaId}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  static saveDraft(tiendaId: string, positions: PositionAuditState[]) {
    localStorage.setItem(`${DRAFTS_KEY}_${tiendaId}`, JSON.stringify(positions));
  }

  static clearDraft(tiendaId: string) {
    localStorage.removeItem(`${DRAFTS_KEY}_${tiendaId}`);
  }

  // Historial de auditorías
  static getHistory(): AuditRecord[] {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static saveAuditRecord(record: AuditRecord) {
    const history = this.getHistory();
    const updated = [record, ...history];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));

    // Si no está sincronizado, añadir a cola offline
    if (!record.sincronizadoSheets) {
      this.addToSyncQueue(record);
    }

    // Actualizar estado en tiendas
    const stores = this.getStores();
    const storeIdx = stores.findIndex(s => s.tiendaId === record.tiendaId);
    if (storeIdx !== -1) {
      stores[storeIdx].auditStatus = record.incidenciasCount > 0 ? 'Con Incidencias' : 'Auditada';
      stores[storeIdx].lastAuditDate = new Date().toISOString().slice(0, 10);
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
}

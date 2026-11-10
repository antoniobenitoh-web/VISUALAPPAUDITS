import { AuditRecord, DeviceReturnState, StoreCenter, UserProfile } from '../types';
import { DbService } from './dbService';
import { AuthService } from './authService';

export const SPREADSHEET_RETURNS_ID = '1GrtUs9aKfUhGmb1-HlfDAXaAwtnr4OPO0Ifpp2g7Cl8';
export const SPREADSHEET_RETURNS_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_RETURNS_ID}/edit`;

export interface SyncAuditOptions {
  excelBase64?: string;
  excelFilename?: string;
  driveFolderId?: string;
}

export interface SyncAuditResult {
  success: boolean;
  driveFolderUrl?: string;
  driveFileCount?: number;
  message?: string;
}

export interface SyncReturnsResult {
  success: boolean;
  rowsCount: number;
  message: string;
  rows: (string | number)[][];
  spreadsheetUrl: string;
}

export class SheetsService {
  /**
   * Sincroniza una auditoría completa hacia Google Sheets y sube el Excel directo
   * junto con las fotografías a la carpeta de Google Drive indicada (1RNmY0KnIqtOV6zU0mu080bJKAFFEhRyD).
   */
  static async syncAuditToSheets(audit: AuditRecord, options?: SyncAuditOptions): Promise<SyncAuditResult> {
    const webhookUrl = DbService.getSheetsWebhookUrl();
    const driveFolderId = options?.driveFolderId || DbService.getGoogleDriveFolderId();
    const defaultDriveUrl = `https://drive.google.com/drive/folders/${driveFolderId}`;

    // Extraer y formatear fotos según nomenclatura oficial: [Modelo]_[IMEI_o_Pos].jpg
    const photos = (audit.positions || [])
      .filter(p => Boolean(p.fotoEvidenciaUrl))
      .map(p => {
        const cleanModel = (p.modeloOficial || 'Dispositivo').replace(/[^a-zA-Z0-9]/g, '');
        const cleanImei = (p.imeiSerial || '').replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `${cleanModel}_${cleanImei || `Pos${p.posicionNumero}`}.jpg`;
        return {
          filename,
          base64: p.fotoEvidenciaUrl
        };
      });

    if (!webhookUrl) {
      console.warn('No hay URL de Webhook configurada. Guardando auditoría localmente.');
      DbService.removeAuditFromQueue(audit.auditId);
      return {
        success: true,
        driveFolderUrl: defaultDriveUrl,
        driveFileCount: photos.length + (options?.excelBase64 ? 1 : 0),
        message: 'Auditoría guardada en local (modo offline).'
      };
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          action: 'POST_AUDIT_LOG',
          payload: {
            auditId: audit.auditId,
            tiendaId: audit.tiendaId,
            nombreTienda: audit.nombreTienda,
            retailer: audit.retailer,
            usuarioEmail: audit.usuarioEmail,
            usuarioNombre: audit.usuarioNombre,
            fechaHora: audit.fechaHora,
            totalPosiciones: audit.totalPosiciones,
            okCount: audit.okCount,
            incidenciasCount: audit.incidenciasCount,
            pendientesCount: audit.pendientesCount,
            positions: audit.positions,
            driveFolderId: driveFolderId,
            excelFile: options?.excelBase64 ? {
              filename: options.excelFilename,
              base64: options.excelBase64
            } : undefined,
            photos: photos
          }
        }),
        mode: 'no-cors' // Google Apps Script webhooks devuelven redirect 302
      });

      DbService.removeAuditFromQueue(audit.auditId);
      return {
        success: true,
        driveFolderUrl: defaultDriveUrl,
        driveFileCount: photos.length + (options?.excelBase64 ? 1 : 0),
        message: 'Auditoría, archivo Excel y fotos sincronizados con Google Drive y Sheets.'
      };
    } catch (error) {
      console.error('Error al sincronizar con Google Sheets / Drive:', error);
      return {
        success: false,
        driveFolderUrl: defaultDriveUrl,
        message: 'Error de red al sincronizar con Google Drive. Se guardará en cola.'
      };
    }
  }

  /**
   * Procesa la cola de auditorías pendientes generadas en modo offline
   */
  static async processPendingQueue(): Promise<number> {
    const queue = DbService.getSyncQueue();
    if (queue.length === 0) return 0;

    let synced = 0;
    for (const record of queue) {
      const ok = await this.syncAuditToSheets(record);
      if (ok) synced++;
    }
    return synced;
  }

  /**
   * Descarga catálogo actualizado de tiendas y usuarios desde Google Sheets si está disponible
   */
  static async refreshCatalogFromSheets(): Promise<{ stores: StoreCenter[]; users: UserProfile[] } | null> {
    const webhookUrl = DbService.getSheetsWebhookUrl();
    if (!webhookUrl) return null;

    try {
      const url = `${webhookUrl}?action=GET_CATALOG`;
      const response = await fetch(url);
      if (!response.ok) return null;
      const data = await response.json();

      if (data && data.stores && Array.isArray(data.stores)) {
        DbService.saveStores(data.stores);
      }
      if (data && data.users && Array.isArray(data.users)) {
        DbService.saveUsers(data.users);
      }
      if (data && data.devices && Array.isArray(data.devices)) {
        DbService.saveCatalogDevices(data.devices);
      }
      return data;
    } catch (e) {
      console.warn('No se pudo conectar a Google Sheets en tiempo real, usando cache offline:', e);
      return null;
    }
  }

  /**
   * Diagnóstico de conexión en tiempo real: verifica si el Webhook y la carpeta de Google Drive son accesibles.
   */
  static async testConnection(): Promise<{ ok: boolean; driveOk?: boolean; message: string }> {
    const webhookUrl = DbService.getSheetsWebhookUrl();
    if (!webhookUrl) return { ok: false, message: 'No hay URL de Webhook configurada.' };

    try {
      const driveFolderId = DbService.getGoogleDriveFolderId();
      const testUrl = `${webhookUrl}?action=TEST_DRIVE&folderId=${encodeURIComponent(driveFolderId)}`;
      const res = await fetch(testUrl);
      if (!res.ok) return { ok: false, message: `Error HTTP al conectar: ${res.status}` };
      const data = await res.json();
      
      if (data && data.success) {
        return {
          ok: true,
          driveOk: true,
          message: `Conexión verificada: Google Apps Script tiene acceso a la carpeta "${data.folderName}".`
        };
      } else if (data && data.status === 'OK') {
        return {
          ok: true,
          driveOk: false,
          message: 'Conectado a Google Sheets, pero la versión desplegada en Apps Script aún no tiene autorizada la subida a Google Drive. Por favor, ejecuta testAutorizacionDrive() en Apps Script e implementa una Nueva Versión.'
        };
      } else {
        return {
          ok: false,
          driveOk: false,
          message: (data && data.error) ? data.error : 'Respuesta no esperada del Webhook.'
        };
      }
    } catch (e: any) {
      return { ok: false, message: 'No se pudo conectar con el Webhook: ' + (e?.message || e) };
    }
  }

  /**
   * Diagnóstico específico de conexión con la hoja oficial de Retiradas de Materiales
   * ID: 1GrtUs9aKfUhGmb1-HlfDAXaAwtnr4OPO0Ifpp2g7Cl8
   */
  static async testReturnsSheetConnection(): Promise<{ ok: boolean; message: string; sheetName?: string; lastRow?: number }> {
    const webhookUrl = DbService.getSheetsWebhookUrl();
    if (!webhookUrl) return { ok: false, message: 'No hay URL de Webhook configurada.' };

    try {
      const res = await fetch(`${webhookUrl}?action=TEST_RETURNS`);
      if (!res.ok) return { ok: false, message: `Error HTTP: ${res.status}` };
      const data = await res.json();
      if (data && data.success) {
        return {
          ok: true,
          sheetName: data.sheetName,
          lastRow: data.lastRow,
          message: `Conectado a la hoja "${data.sheetName}". Filas actuales: ${data.lastRow}.`
        };
      }
      return {
        ok: false,
        message: data?.error || 'El Webhook en Apps Script aún no tiene implementada la acción TEST_RETURNS (requiere desplegar Nueva Versión).'
      };
    } catch (e: any) {
      return { ok: false, message: 'No se pudo conectar: ' + (e?.message || e) };
    }
  }

  /**
   * Genera y sincroniza la retirada de materiales hacia la hoja de cálculo de Google Sheets oficial:
   * ID: 1GrtUs9aKfUhGmb1-HlfDAXaAwtnr4OPO0Ifpp2g7Cl8
   * 
   * Formato oficial de Columnas (A - I):
   * Columna A: Fecha de reporte
   * Columna B: Nombre del GPV responsable del centro
   * Columna C: Nombre de la tienda
   * Columna D: LDU o Maqueta
   * Columna E: Descripción del modelo, osea el nombre del modelo que se retira
   * Columna F: Vacía
   * Columna G: Si smartphone -> IMEI
   * Columna H: Si no smartphone -> Serial number
   * Columna I: Contiene caja -> NO (al ser devolución nunca tendrá caja)
   */
  static async syncImplantationReturnsToSheets(
    store: StoreCenter,
    returnDevices: DeviceReturnState[],
    currentUser: UserProfile,
    fechaHora?: string
  ): Promise<SyncReturnsResult> {
    const gpvName = AuthService.getGpvForStore(store, currentUser);
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear());
    const fechaReporte = `${day}/${month}/${year}`;

    const rawRows: (string | number)[][] = (returnDevices || []).map((dev) => {
      const isSmartphone = dev.categoria === 'Smartphone';
      const imei = isSmartphone ? (dev.imeiMemorizado && dev.imeiMemorizado !== '-' ? dev.imeiMemorizado : '') : '';
      const serial = !isSmartphone ? (dev.imeiMemorizado && dev.imeiMemorizado !== '-' ? dev.imeiMemorizado : '') : '';
      const tipoMaterial = dev.esDummy ? 'Maqueta' : 'LDU';
      const descripcionModelo = dev.modeloSaliente || '';
      const vacia = '';
      const contieneCaja = 'NO';

      return [
        fechaReporte,
        gpvName,
        store.nombreTienda,
        tipoMaterial,
        descripcionModelo,
        vacia,
        imei,
        serial,
        contieneCaja
      ];
    });

    const webhookUrl = DbService.getSheetsWebhookUrl();
    if (!webhookUrl) {
      console.warn('No hay URL de Webhook configurada para sincronizar retiradas.');
      return {
        success: true,
        rowsCount: rawRows.length,
        rows: rawRows,
        spreadsheetUrl: SPREADSHEET_RETURNS_URL,
        message: 'Filas generadas en local (modo offline).'
      };
    }

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          action: 'POST_IMPLANTATION_RETURNS',
          spreadsheetId: SPREADSHEET_RETURNS_ID,
          payload: {
            tiendaId: store.tiendaId,
            nombreTienda: store.nombreTienda,
            gpvNombre: gpvName,
            fechaReporte: fechaReporte,
            rows: rawRows
          },
          rows: rawRows
        }),
        mode: 'no-cors'
      });

      return {
        success: true,
        rowsCount: rawRows.length,
        rows: rawRows,
        spreadsheetUrl: SPREADSHEET_RETURNS_URL,
        message: `Se han registrado ${rawRows.length} filas en Google Sheets.`
      };
    } catch (err: any) {
      console.error('Error al sincronizar retiradas con Google Sheets:', err);
      return {
        success: false,
        rowsCount: rawRows.length,
        rows: rawRows,
        spreadsheetUrl: SPREADSHEET_RETURNS_URL,
        message: 'Error de red al conectar con Google Sheets.'
      };
    }
  }
}


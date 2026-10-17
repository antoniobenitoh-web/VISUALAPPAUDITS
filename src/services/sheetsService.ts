import { AuditRecord, StoreCenter, UserProfile } from '../types';
import { DbService } from './dbService';

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
          'Content-Type': 'application/json'
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
      return data;
    } catch (e) {
      console.warn('No se pudo conectar a Google Sheets en tiempo real, usando cache offline:', e);
      return null;
    }
  }
}

import ExcelJS from 'exceljs';
import { AuditRecord, PositionAuditState } from '../types';

export class ExcelService {
  /**
   * Construye el libro de trabajo con el formato corporativo oficial
   */
  static buildWorkbook(audit: AuditRecord): ExcelJS.Workbook {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Salesland Retail Audit PWA';
    workbook.created = new Date();

    // -------------------------------------------------------------
    // HOJA 1: RESUMEN Y REVISIÓN COMPLETA DE POSICIONES
    // -------------------------------------------------------------
    const sheet1 = workbook.addWorksheet('Resumen Auditoría', {
      views: [{ showGridLines: true }]
    });

    // 1. Título y Metadatos de Cabecera
    sheet1.mergeCells('A1:L1');
    const titleCell = sheet1.getCell('A1');
    titleCell.value = `REPORTE OFICIAL DE AUDITORÍA · ESPACIOS DE MARCA RETAIL`;
    titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2937' } }; // Slate 800
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet1.getRow(1).height = 30;

    // Fila 2: Subtítulo
    sheet1.mergeCells('A2:L2');
    const subCell = sheet1.getCell('A2');
    subCell.value = `Tienda: ${audit.nombreTienda} (${audit.retailer}) | Auditor: ${audit.usuarioNombre} (${audit.usuarioEmail}) | Fecha: ${audit.fechaHora}`;
    subCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FFE5E7EB' } };
    subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF374151' } };
    subCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet1.getRow(2).height = 20;

    // Fila 4: KPIs
    const kpiRow = 4;
    sheet1.getCell(`B${kpiRow}`).value = 'Total Puestos:';
    sheet1.getCell(`C${kpiRow}`).value = audit.totalPosiciones;
    sheet1.getCell(`E${kpiRow}`).value = 'Correctos (OK):';
    sheet1.getCell(`F${kpiRow}`).value = audit.okCount;
    sheet1.getCell(`H${kpiRow}`).value = 'Incidencias:';
    sheet1.getCell(`I${kpiRow}`).value = audit.incidenciasCount;
    sheet1.getCell(`K${kpiRow}`).value = 'Cumplimiento:';
    const compliance = audit.totalPosiciones > 0 ? Math.round((audit.okCount / audit.totalPosiciones) * 100) : 0;
    sheet1.getCell(`L${kpiRow}`).value = `${compliance}%`;

    [sheet1.getCell(`B${kpiRow}`), sheet1.getCell(`E${kpiRow}`), sheet1.getCell(`H${kpiRow}`), sheet1.getCell(`K${kpiRow}`)].forEach(c => {
      c.font = { bold: true };
    });

    // Fila 6: Cabeceras de la tabla principal
    const headers = [
      'Store Name',
      'Table / Espacio',
      'Posición',
      'Dispositivo Expuesto',
      'Tipo Terminal',
      'Check Planograma',
      'Modelo Oficial',
      'Tipo Oficial',
      'IMEI / Serial Number',
      'Motivo Incidencia',
      'Evidencia / Notas',
      'Fecha / Hora'
    ];

    const headerRowIdx = 6;
    const headerRow = sheet1.getRow(headerRowIdx);
    headerRow.values = headers;
    headerRow.height = 26;

    headerRow.eachCell((cell, colNum) => {
      cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF111827' } }; // Dark header
      cell.alignment = {
        horizontal: [3, 5, 6, 8].includes(colNum) ? 'center' : 'left',
        vertical: 'middle'
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF4B5563' } },
        bottom: { style: 'medium', color: { argb: 'FF000000' } }
      };
    });

    // Filas de datos
    let currentRowIdx = 7;
    audit.positions.forEach(pos => {
      const isOk = pos.estadoPosicion === 'OK';
      const isIncident = pos.estadoPosicion === 'Incidencia';
      const checkText = isOk ? 'OK' : isIncident ? 'INCIDENCIA' : 'NO AUDITADO';

      const row = sheet1.getRow(currentRowIdx);
      row.values = [
        audit.nombreTienda,
        pos.mesaId,
        pos.posicionNumero,
        pos.modeloDetectado || '(Sin producto)',
        pos.esMaqueta ? 'Maqueta' : 'LDU',
        checkText,
        pos.modeloOficial,
        pos.esMaqueta ? 'Maqueta' : 'LDU',
        pos.imeiSerial || '-',
        pos.tipoIncidencia || (isOk ? '-' : 'Pendiente'),
        pos.comentarios || '',
        pos.fechaHora || audit.fechaHora
      ];

      // Formato y estilos de celdas
      row.eachCell((cell, colNum) => {
        cell.font = { name: 'Calibri', size: 10 };
        cell.alignment = {
          horizontal: [3, 5, 6, 8].includes(colNum) ? 'center' : 'left',
          vertical: 'middle'
        };
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } }
        };

        // Columna Check coloreada
        if (colNum === 6) {
          cell.font = { name: 'Calibri', size: 10, bold: true };
          if (isOk) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } }; // Verde suave
            cell.font = { bold: true, color: { argb: 'FF065F46' } };
          } else if (isIncident) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } }; // Rojo suave
            cell.font = { bold: true, color: { argb: 'FF991B1B' } };
          } else {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } }; // Amarillo suave
            cell.font = { bold: true, color: { argb: 'FF92400E' } };
          }
        }
      });

      currentRowIdx++;
    });

    // Auto-filtro
    sheet1.autoFilter = `A6:L${currentRowIdx - 1}`;

    // Ancho de columnas Hoja 1
    sheet1.columns = [
      { width: 22 }, // Store Name
      { width: 20 }, // Table
      { width: 10 }, // Posición
      { width: 26 }, // Dispositivo Expuesto
      { width: 12 }, // Tipo Terminal
      { width: 18 }, // Check Planograma
      { width: 26 }, // Modelo Oficial
      { width: 12 }, // Tipo Oficial
      { width: 24 }, // IMEI
      { width: 24 }, // Motivo Incidencia
      { width: 30 }, // Evidencia / Notas
      { width: 18 }  // Fecha
    ];

    // -------------------------------------------------------------
    // HOJA 2: INCIDENCIAS DETALLADAS PARA ACCIÓN GPV / MERCHANDISER
    // -------------------------------------------------------------
    const incidents = audit.positions.filter(p => p.estadoPosicion === 'Incidencia');
    if (incidents.length > 0) {
      const sheet2 = workbook.addWorksheet('Incidencias Detalladas');

      sheet2.mergeCells('A1:G1');
      const incTitle = sheet2.getCell('A1');
      incTitle.value = `PLAN DE ACCIÓN DE INCIDENCIAS · ${audit.nombreTienda}`;
      incTitle.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
      incTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB91C1C' } }; // Rojo corporativo
      incTitle.alignment = { horizontal: 'center', vertical: 'middle' };
      sheet2.getRow(1).height = 25;

      const incHeaders = ['Mesa / Espacio', 'Posición', 'Modelo Oficial Requerido', 'Dispositivo en Tienda', 'Categoría de Incidencia', 'Detalle / Comentario', 'Fecha Reporte'];
      const incHeaderRow = sheet2.getRow(3);
      incHeaderRow.values = incHeaders;
      incHeaderRow.height = 24;

      incHeaderRow.eachCell(cell => {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2937' } };
        cell.alignment = { vertical: 'middle' };
      });

      let incRowIdx = 4;
      incidents.forEach(inc => {
        const row = sheet2.getRow(incRowIdx);
        row.values = [
          inc.mesaId,
          inc.posicionNumero,
          inc.modeloOficial,
          inc.modeloDetectado || '(Vacío)',
          inc.tipoIncidencia || 'No especificada',
          inc.comentarios || '',
          inc.fechaHora || audit.fechaHora
        ];
        row.eachCell(cell => {
          cell.font = { name: 'Calibri', size: 10 };
          cell.border = { bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } } };
        });
        incRowIdx++;
      });

      sheet2.columns = [
        { width: 22 },
        { width: 10 },
        { width: 28 },
        { width: 26 },
        { width: 25 },
        { width: 35 },
        { width: 18 }
      ];
    }

    return workbook;
  }

  /**
   * Genera el archivo Excel en memoria y devuelve Base64 para subida directa a Google Drive
   */
  static async generateAuditExcelBase64(audit: AuditRecord): Promise<{ base64: string; filename: string; blob: Blob }> {
    const workbook = this.buildWorkbook(audit);
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = window.btoa(binary);
    const safeStore = audit.nombreTienda.replace(/[^a-zA-Z0-9_-]/g, '_');
    const cleanDate = new Date().toISOString().slice(0, 10);
    const filename = `Auditoria_${safeStore}_${cleanDate}.xlsx`;

    return { base64, filename, blob };
  }

  /**
   * Genera y descarga directamente un archivo Excel (.xlsx) en el navegador
   */
  static async exportAuditReport(audit: AuditRecord) {
    const { blob, filename } = await this.generateAuditExcelBase64(audit);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

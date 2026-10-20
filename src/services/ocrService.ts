import { createWorker } from 'tesseract.js';

/**
 * Validador del algoritmo Luhn para IMEIs de 15 dígitos (módulo 10)
 */
export function validateImeiLuhn(imei: string): boolean {
  const clean = (imei || '').replace(/\D/g, '');
  if (clean.length !== 15) return false;
  let sum = 0;
  for (let i = 0; i < 15; i++) {
    let d = parseInt(clean[i], 10);
    // Posición impar (índice 1, 3, 5... 0-based) se multiplica por 2
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

/**
 * Validador estricto del formato de Número de Serie Xiaomi (20 caracteres):
 * 5 números + '/' + 14 letras o dígitos
 */
export function validateSerialFormat(serial: string): boolean {
  const clean = (serial || '').trim().toUpperCase();
  return /^\d{5}\/[A-Z0-9]{14}$/.test(clean);
}

export interface ExtractedCode {
  value: string;
  type: 'SN' | 'IMEI';
  rawText: string;
}

/**
 * Analiza un texto obtenido por OCR y extrae coincidencias de S/N o IMEI con filtro Luhn
 */
export function findSerialOrImeiInText(rawText: string): ExtractedCode | null {
  if (!rawText) return null;

  // Normalizar: mayúsculas, espacios y barras
  const normalized = rawText
    .toUpperCase()
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s*([/\\|])\s*/g, '/');

  // 1. Prioridad: Buscar patrón exacto de Número de Serie de 20 caracteres (5 dígitos / 14 alfanuméricos)
  const snMatch = normalized.match(/(?:^|[^A-Z0-9])(\d{5}\/[A-Z0-9]{14})(?=[^A-Z0-9]|$)/);
  if (snMatch && validateSerialFormat(snMatch[1])) {
    return { value: snMatch[1], type: 'SN', rawText };
  }

  // 1b. Variante sin espacios intermedios por si hay separadores de línea
  const compact = rawText.replace(/\s+/g, '').replace(/\\|\|/g, '/').toUpperCase();
  const snCompactMatch = compact.match(/(?:^|[^A-Z0-9])(\d{5}\/[A-Z0-9]{14})(?=[^A-Z0-9]|$)/);
  if (snCompactMatch && validateSerialFormat(snCompactMatch[1])) {
    return { value: snCompactMatch[1], type: 'SN', rawText };
  }

  // 2. Buscar IMEIs de 15 dígitos con validación matemática Luhn
  const candidateDigits = normalized.match(/\b\d{15}\b/g);
  if (candidateDigits) {
    for (const cand of candidateDigits) {
      if (validateImeiLuhn(cand)) {
        return { value: cand, type: 'IMEI', rawText };
      }
    }
  }

  return null;
}

// Gestor de Worker de Tesseract
class OcrService {
  private worker: any = null;
  private isInitializing = false;
  private initPromise: Promise<any> | null = null;

  public async getWorker() {
    if (this.worker) return this.worker;
    if (this.initPromise) return this.initPromise;

    this.isInitializing = true;
    this.initPromise = (async () => {
      try {
        const worker = await createWorker('eng');
        await worker.setParameters({
          tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ/-',
        });
        this.worker = worker;
        this.isInitializing = false;
        return worker;
      } catch (err) {
        console.error('Error al inicializar Tesseract OCR Worker:', err);
        this.isInitializing = false;
        this.initPromise = null;
        throw err;
      }
    })();

    return this.initPromise;
  }

  /**
   * Procesa un canvas o imagen con OCR y busca automáticamente el S/N o IMEI
   */
  public async recognizeSnippet(canvasOrBlob: HTMLCanvasElement | Blob | string): Promise<{
    rawText: string;
    detected: ExtractedCode | null;
  }> {
    const worker = await this.getWorker();
    const result = await worker.recognize(canvasOrBlob);
    const rawText = result?.data?.text || '';
    const detected = findSerialOrImeiInText(rawText);
    return { rawText, detected };
  }

  public async terminate() {
    if (this.worker) {
      try {
        await this.worker.terminate();
      } catch (e) {
        // Ignorar cleanup errors
      }
      this.worker = null;
      this.initPromise = null;
    }
  }
}

export const ocrService = new OcrService();

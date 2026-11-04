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
 * Helper para corregir confusiones típicas de OCR en los primeros 5 dígitos (O->0, S->5, etc.)
 */
function fixDigitPrefix(str: string): string {
  return str
    .replace(/[O]/gi, '0')
    .replace(/[I|l]/g, '1')
    .replace(/[Z]/gi, '2')
    .replace(/[S]/gi, '5')
    .replace(/[B]/gi, '8');
}

/**
 * Analiza un texto obtenido por OCR y extrae coincidencias de S/N o IMEI con filtro Luhn
 */
export function findSerialOrImeiInText(rawText: string): ExtractedCode | null {
  if (!rawText) return null;

  // 1. ANÁLISIS DE NÚMERO DE SERIE MULTI-LÍNEA PARA SMARTWATCHES / WEARABLES / TABLETS
  // En pantallas circulares o pequeñas el S/N suele saltar de línea:
  // "Product serial number"
  // "65343/"
  // "CRAG525ZK00505"

  // 1A. Coincidencia continua o separada por espacio, salto de línea o barra
  const multiLineRegex = /(?:^|[^A-Z0-9])([0-9OSIZB]{5})\s*[/\\|:;~_ -]?\s*([A-Z0-9]{14})(?=[^A-Z0-9]|$)/i;
  const multiMatch = rawText.match(multiLineRegex);
  if (multiMatch) {
    const prefix = fixDigitPrefix(multiMatch[1]);
    const suffix = multiMatch[2].toUpperCase();
    const candidate = `${prefix}/${suffix}`;
    if (validateSerialFormat(candidate)) {
      return { value: candidate, type: 'SN', rawText };
    }
  }

  // 1B. Análisis línea a línea por si hay saltos de línea estrictos (\r, \n)
  const lines = rawText
    .split(/[\r\n]+/)
    .map(l => l.trim())
    .filter(Boolean);

  for (let i = 0; i < lines.length - 1; i++) {
    const l1 = lines[i].replace(/\s+/g, '');
    const l2 = lines[i + 1].replace(/\s+/g, '');

    // Línea 1 termina con 5 dígitos y posible barra '/'
    const mPrefix = l1.match(/([0-9OSIZB]{5})\/?$/i);
    // Línea 2 empieza con posible barra '/' y 14 caracteres alfanuméricos
    const mSuffix = l2.match(/^\/?([A-Z0-9]{14})/i);

    if (mPrefix && mSuffix) {
      const prefix = fixDigitPrefix(mPrefix[1]);
      const suffix = mSuffix[1].toUpperCase();
      const candidate = `${prefix}/${suffix}`;
      if (validateSerialFormat(candidate)) {
        return { value: candidate, type: 'SN', rawText };
      }
    }
  }

  // 1C. Variante compacta eliminando todos los espacios en blanco
  const compact = rawText.replace(/\s+/g, '').replace(/\\|\|/g, '/').toUpperCase();
  const snCompactMatch = compact.match(/(?:^|[^A-Z0-9])([0-9OSIZB]{5})\/?([A-Z0-9]{14})(?=[^A-Z0-9]|$)/i);
  if (snCompactMatch) {
    const prefix = fixDigitPrefix(snCompactMatch[1]);
    const suffix = snCompactMatch[2].toUpperCase();
    const candidate = `${prefix}/${suffix}`;
    if (validateSerialFormat(candidate)) {
      return { value: candidate, type: 'SN', rawText };
    }
  }

  // 2. Buscar IMEIs de 15 dígitos con validación matemática Luhn
  const normalized = rawText
    .toUpperCase()
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s*([/\\|])\s*/g, '/');

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
          tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz/:;~-_ \n\r',
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

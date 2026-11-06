import { createWorker, PSM } from 'tesseract.js';

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
 * Validador del formato oficial de Número de Serie Xiaomi / Redmi (Relojes, Smart Bands y Tablets):
 * - Formato estándar Xiaomi (19-20 caracteres): 5 dígitos + '/' (o '-') + 13-15 caracteres alfanuméricos
 *   Ejemplos: 58891/DPAK6H5RH00440, 65343/CRAG525ZK01403, 68707/EFAPBS6QD00345
 * - Formato compacto Watch / Band (15 caracteres): 5 dígitos + '/' (o '-') + 9 caracteres alfanuméricos
 *   Ejemplos: 75789/05Z400407, 70399/Y5VW00838, 65573/W5RA01635
 */
export function validateSerialFormat(serial: string): boolean {
  const clean = (serial || '').trim().toUpperCase().replace(/-/g, '/');
  return /^\d{5}\/[A-Z0-9]{9,16}$/.test(clean);
}

export interface ExtractedCode {
  value: string;
  type: 'SN' | 'IMEI';
  rawText: string;
}

/**
 * Helper para corregir confusiones típicas de OCR en los primeros 5 dígitos numéricos (O->0, S->5, I/l->1, B->8, Z->2, G->6)
 */
function fixDigitPrefix(str: string): string {
  return str
    .replace(/[OQ]/gi, '0')
    .replace(/[I|l!]/g, '1')
    .replace(/[Z]/gi, '2')
    .replace(/[S$]/gi, '5')
    .replace(/[G]/gi, '6')
    .replace(/[B]/gi, '8');
}

/**
 * Limpia y normaliza el sufijo alfanumérico del número de serie.
 * En los números de serie Xiaomi (ej. 58891/DPAK6H5RH00440 o 75789/05Z400407),
 * los últimos 5 caracteres suelen ser dígitos numéricos correlativos (ej. 00440, 01403, 00345)
 * donde la cámara a menudo confunde el '0' con la letra 'O'.
 */
function normalizeSerialSuffix(rawSuffix: string): string {
  const clean = rawSuffix.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  if (clean.length < 9) return clean;

  // En los últimos 5 caracteres, si son mayoritariamente numéricos o 'O'/'I'/'S'/'B', corregir 'O' -> '0'
  const head = clean.slice(0, -5);
  const tail = clean
    .slice(-5)
    .replace(/O/g, '0')
    .replace(/[Il]/g, '1');

  return head + tail;
}

/**
 * Construye y valida un candidato de Número de Serie a partir de prefijo (5 dígitos) y sufijo
 */
function buildValidSerialCandidate(rawPrefix: string, rawSuffix: string): string | null {
  const prefix = fixDigitPrefix(rawPrefix);
  if (!/^\d{5}$/.test(prefix)) return null;

  let suffix = normalizeSerialSuffix(rawSuffix);
  // Si el OCR capturó algún carácter extra de ruido al final cuando el serial es de 14 caracteres (total 20)
  if (suffix.length > 14 && suffix.length <= 16) {
    suffix = suffix.slice(0, 14);
  }

  const candidate = `${prefix}/${suffix}`;
  if (validateSerialFormat(candidate)) {
    return candidate;
  }
  return null;
}

/**
 * Analiza un texto obtenido por OCR y extrae instantáneamente el Número de Serie (S/N) de Reloj/Tablet o IMEI.
 * Especialmente optimizado para pantallas circulares de relojes Xiaomi Watch / Redmi Watch y Tablets Xiaomi Pad
 * donde el número de serie aparece partido en 2 o 3 líneas:
 * Ejemplo real:
 *   Número de serie
 *   58891/DPAK6H5RH0
 *   0440
 */
export function findSerialOrImeiInText(rawText: string): ExtractedCode | null {
  if (!rawText) return null;

  // Limpiar artefactos comunes de bordes de relojes circulares
  const cleanedText = rawText
    .replace(/[|\\]/g, '/')
    .replace(/[“”"«»~_]/g, ' ');

  // ---------------------------------------------------------------------------
  // 1. DETECCIÓN MULTI-LÍNEA (2 O 3 LÍNEAS) PARA RELOJES Y TABLETS
  // Caso típico en Xiaomi Watch (como 58891/DPAK6H5RH0 \n 0440):
  // Prefijo 5 dígitos + '/' + parte1 (8-14 chars) + salto de línea + parte2 (2-6 chars)
  // ---------------------------------------------------------------------------
  const lines = cleanedText
    .split(/[\r\n]+/)
    .map((l) => l.trim())
    .filter(Boolean);

  for (let i = 0; i < lines.length; i++) {
    const lineClean = lines[i].replace(/\s+/g, '');

    // Buscar si esta línea contiene el patrón "58891/" o "58891-"
    const prefixSlashMatch = lineClean.match(/([0-9OQIl!ZSBG]{5})[/\-]([A-Z0-9]{0,16})/i);
    if (prefixSlashMatch) {
      const rawPref = prefixSlashMatch[1];
      let firstPart = prefixSlashMatch[2] || '';

      // 1A. ¿Ya está completo en la misma línea? (ej. 14 chars o 9 chars)
      if (firstPart.length === 14 || firstPart.length === 9) {
        const cand = buildValidSerialCandidate(rawPref, firstPart);
        if (cand) return { value: cand, type: 'SN', rawText };
      }

      // 1B. Si está partido en la línea siguiente (ej. "58891/DPAK6H5RHO" + siguiente línea "0440")
      if (i + 1 < lines.length) {
        // Extraer el primer bloque alfanumérico válido de la siguiente línea (ignorando ruido lateral como "~ 0440 A")
        const nextLineTokens = lines[i + 1].match(/[A-Z0-9]{2,14}/gi) || [];
        for (const token of nextLineTokens) {
          // Evitar palabras de la interfaz como "NORMATIVA"
          if (/^(NORMATIVA|ACERCA|NUMERO|SERIE|MODELO)$/i.test(token)) continue;
          const combinedSuffix = firstPart + token;
          if (combinedSuffix.length >= 9 && combinedSuffix.length <= 16) {
            const cand = buildValidSerialCandidate(rawPref, combinedSuffix);
            if (cand) return { value: cand, type: 'SN', rawText };
          }
          // También probar recortando a 14 caracteres exactos si la suma se pasó por 1 carácter de ruido
          if (combinedSuffix.length > 14) {
            const cand14 = buildValidSerialCandidate(rawPref, combinedSuffix.slice(0, 14));
            if (cand14) return { value: cand14, type: 'SN', rawText };
          }
        }
      }

      // 1C. Si incluso sin segunda línea tiene entre 9 y 15 caracteres válidos
      if (firstPart.length >= 9) {
        const cand = buildValidSerialCandidate(rawPref, firstPart);
        if (cand) return { value: cand, type: 'SN', rawText };
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 2. EXPRESIÓN REGULAR GLOBAL SOBRE TEXTO MULTILÍNEA (CON POSIBLE CORTE INTERMEDIO)
  // Captura: 5 dígitos + '/' + (bloque 1 de 4 a 14 chars) + (espacio/salto opcional + bloque 2 de 0 a 10 chars)
  // ---------------------------------------------------------------------------
  const splitSerialRegex = /([0-9OQIl!ZSBG]{5})\s*[/\-]\s*([A-Z0-9]{4,14})(?:[\s\r\n~—\-]*([0-9OIl]{2,8}))?/gi;
  let match: RegExpExecArray | null;
  while ((match = splitSerialRegex.exec(cleanedText)) !== null) {
    const rawPref = match[1];
    const part1 = match[2] || '';
    const part2 = match[3] || '';

    // Probar uniendo parte 1 + parte 2 (caso partido en 2 líneas: 10 chars + 4 dígitos = 14 chars)
    if (part2) {
      const joined = part1 + part2;
      const candJoined = buildValidSerialCandidate(rawPref, joined);
      if (candJoined) return { value: candJoined, type: 'SN', rawText };
    }

    // Probar solo con parte 1
    const candSingle = buildValidSerialCandidate(rawPref, part1);
    if (candSingle) return { value: candSingle, type: 'SN', rawText };
  }

  // ---------------------------------------------------------------------------
  // 3. VARIANTE ULTRA-COMPACTA (ELIMINANDO ESPACIOS Y SALTOS)
  // ---------------------------------------------------------------------------
  const compact = cleanedText.replace(/[^A-Z0-9/\-]/gi, '').toUpperCase();
  const compactMatch = compact.match(/([0-9OQIl!ZSBG]{5})[/\-]([A-Z0-9]{9,15})/i);
  if (compactMatch) {
    const cand = buildValidSerialCandidate(compactMatch[1], compactMatch[2].slice(0, 14));
    if (cand) return { value: cand, type: 'SN', rawText };
  }

  // ---------------------------------------------------------------------------
  // 4. BÚSQUEDA DE IMEIs DE 15 DÍGITOS (CON VALIDACIÓN MATEMÁTICA LUHN)
  // ---------------------------------------------------------------------------
  const normalized = cleanedText.toUpperCase().replace(/[\r\n]+/g, ' ');
  const candidateDigits = normalized.match(/\b\d{15}\b/g);
  if (candidateDigits) {
    for (const cand of candidateDigits) {
      if (validateImeiLuhn(cand)) {
        return { value: cand, type: 'IMEI', rawText };
      }
    }
  }

  // También permitir IMEI o Serial de 15 dígitos aunque esté separado por espacios
  const digitsOnly = cleanedText.replace(/\D/g, '');
  if (digitsOnly.length >= 15) {
    for (let i = 0; i <= digitsOnly.length - 15; i++) {
      const sub = digitsOnly.slice(i, i + 15);
      if (validateImeiLuhn(sub)) {
        return { value: sub, type: 'IMEI', rawText };
      }
    }
  }

  return null;
}

// Gestor de Worker de Tesseract optimizado para velocidad en móviles
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
          tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
          tessedit_char_whitelist:
            '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz/- \n\r'
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

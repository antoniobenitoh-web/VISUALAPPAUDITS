// Base de datos de espacios disponibles por tienda/centro
// Define qué planogramas (espacios de marca) están disponibles en cada tienda

const STORE_SPACES_CONFIG = {
  // Tiendas MediaMarkt estándar
  "Media Diagonal Mar": [
    'MESA 1 · Cara 1',
    'MESA 1 · Cara 2',
    'MESA 2 · Cara 1',
    'MESA 2 · Cara 2',
    'MESA 3 · Cara 1',
    'MESA 3 · Cara 2',
    'MINIWALL',
    'LINEAL SMARTWATCH'
  ],
  "Media El Prat": [
    'MESA 1 · Cara 1',
    'MESA 1 · Cara 2',
    'MESA 2 · Cara 1',
    'WALL'
  ],
  "Media Esplugues": [
    'MESA 1 · Cara 1',
    'MESA 1 · Cara 2',
    'MESA 2 · Cara 1',
    'MESA 2 · Cara 2',
    'WALL'
  ],
  "Media Fontanella": [
    'MESA 1 · Cara 1',
    'MESA 1 · Cara 2',
    'WALL'
  ],
  "Media Gavà": [
    'MESA 1 · Cara 1',
    'MESA 1 · Cara 2',
    'MESA 2 · Cara 1',
    'WALL',
    'LINEAL SMARTWATCH'
  ],
  "Media Girona": [
    'MESA 1 · Cara 1',
    'MESA 1 · Cara 2',
    'WALL'
  ],
  "Media Girona 2 Lloret del Mar": [
    'MESA 1 · Cara 1',
    'MESA 1 · Cara 2',
    'WALL'
  ],
  "Media Lleida": [
    'MESA 1 · Cara 1',
    'MESA 1 · Cara 2',
    'MESA 2 · Cara 1',
    'MESA 2 · Cara 2',
    'WALL',
    'LINEAL SMARTWATCH'
  ],
  "Media Maquinista": [
    'MESA 1 · Cara 1',
    'MESA 1 · Cara 2',
    'MESA 2 · Cara 1',
    'MESA 2 · Cara 2',
    'WALL'
  ],
  "Media Mataró": [
    'MESA 1 · Cara 1',
    'MESA 1 · Cara 2',
    'WALL'
  ],
  "Media Parets": [
    'MESA 1 · Cara 1',
    'MESA 1 · Cara 2',
    'WALL'
  ],
  "Media Sabadell": [
    'MESA 1 · Cara 1',
    'MESA 1 · Cara 2',
    'MESA 2 · Cara 1',
    'WALL'
  ],
  "Media Sant Cugat": [
    'MESA 1 · Cara 1',
    'MESA 1 · Cara 2',
    'MESA 2 · Cara 1',
    'MESA 2 · Cara 2',
    'WALL',
    'LINEAL SMARTWATCH'
  ],
  "Media Tarragona": [
    'MESA 1 · Cara 1',
    'MESA 1 · Cara 2',
    'MESA 2 · Cara 1',
    'MESA 2 · Cara 2',
    'WALL',
    'LINEAL SMARTWATCH'
  ],
  "Media Terrassa": [
    'MESA 1 · Cara 1',
    'MESA 1 · Cara 2',
    'WALL'
  ],
  "Media Vilanova": [
    'MESA 1 · Cara 1',
    'MESA 1 · Cara 2',
    'MESA 2 · Cara 1',
    'WALL'
  ],
  "Media Zaragoza Gran Casa": [
    'MESA 1 · Cara 1',
    'MESA 1 · Cara 2',
    'MESA 2 · Cara 1',
    'WALL'
  ],
  "Media Zaragoza PTO Venecia": [
    'MESA 1 · Cara 1',
    'MESA 1 · Cara 2',
    'MESA 2 · Cara 1',
    'WALL'
  ],

  // Para compatibilidad con nombres alternativos usados en el código
  "MediaMarkt Tarragona": [
    'MESA 1 · Cara 1',
    'MESA 1 · Cara 2',
    'MESA 2 · Cara 1',
    'MESA 2 · Cara 2',
    'WALL',
    'LINEAL SMARTWATCH'
  ],
  "MediaMarkt Diagonal Mar": [
    'MESA 1 · Cara 1',
    'MESA 1 · Cara 2',
    'MESA 2 · Cara 1',
    'WALL',
    'LINEAL SMARTWATCH'
  ],
  // ... agregue más variantes según sea necesario
};

// Función helper para obtener los espacios disponibles de una tienda
/**
 * Obtiene los espacios de marca disponibles para una tienda dada
 * @param {string} storeName - Nombre de la tienda (ej: "Media Diagonal Mar" o "MediaMarkt Tarragona")
 * @returns {string[]} Array de espacios disponibles o array vacío si no se encuentra la tienda
 */
function getAvailableSpacesForStore(storeName) {
  if (!storeName) return [];

  // Normalizar el nombre de la tienda para búsqueda
  const normalizedName = storeName.replace(/^MediaMarkt\s+/i, 'Media ');

  // Buscar primero en el nombre normalizado, luego en el original
  return STORE_SPACES_CONFIG[normalizedName] ||
    STORE_SPACES_CONFIG[storeName] ||
    [];
}

// Función para verificar si una tienda tiene un espacio específico
/**
 * Verifica si una tienda tiene disponible un espacio específico
 * @param {string} storeName - Nombre de la tienda
 * @param {string} spaceName - Nombre del espacio/planograma (ej: 'MESA 1 · Cara 1')
 * @returns {boolean} True si la tienda tiene el espacio disponible
 */
function storeHasSpace(storeName, spaceName) {
  const availableSpaces = getAvailableSpacesForStore(storeName);
  return availableSpaces.includes(spaceName);
}

// Exportar para uso en otros módulos (si se usa en entorno de módulos)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    STORE_SPACES_CONFIG,
    getAvailableSpacesForStore,
    storeHasSpace
  };
}

// También hacer disponible globalmente si no estamos en un entorno de módulos
if (typeof window !== 'undefined') {
  window.STORE_SPACES = {
    config: STORE_SPACES_CONFIG,
    getAvailableSpacesForStore,
    storeHasSpace
  };
}

console.log('Store Spaces Config loaded:', Object.keys(STORE_SPACES_CONFIG).length, 'stores configured');
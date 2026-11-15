import {
  AuditRecord,
  DeviceReturnState,
  PlanogramPosition,
  PositionAuditState,
  PositionSwapState,
  ProductCategory,
  StoreCenter,
  SwapCampaignAssignment,
  UserProfile,
  VisualElementDefinition
} from '../types';
import { getDynamicPosmDefinitionsForImplantation } from './storePosmData';
import { SEED_AUDITS } from './seedAudits';

export const ACTIVE_IMPLANTATION_CAMPAIGN = 'Lanzamiento Xiaomi 18 Pro Max';
export const EXCLUSIVE_DRIVE_TEST_EMAIL = '';

export interface X18StoreCampaignConfig {
  storeId: string;
  storeName: string;
  active: boolean;
  planogram: 'Table 1' | 'Table 2' | 'Table 3' | '';
  posmWall: boolean;
  posmMiniWall: boolean;
  posmColumnaCara1: boolean;
  posmTopTableCara1: boolean;
  hasXiaomiClip: boolean;
  x18ProLdu: number;
  x18ProMaxLdu: number;
  x18ProDummy: number;
  x18ProMaxDummy: number;
}

/**
 * Configuración oficial por tienda según Excel maestro de "Nueva Implantación" (Lanzamiento Xiaomi 18 Pro Max)
 */
export const X18_STORE_CAMPAIGN_CONFIG: Record<string, X18StoreCampaignConfig> = {
  MIESD00575: {
    storeId: 'MIESD00575',
    storeName: 'Media Sant Antoni',
    active: true,
    planogram: 'Table 1',
    posmWall: false,
    posmMiniWall: false,
    posmColumnaCara1: false,
    posmTopTableCara1: true,
    hasXiaomiClip: false,
    x18ProLdu: 0,
    x18ProMaxLdu: 0,
    x18ProDummy: 2,
    x18ProMaxDummy: 2
  },
  MIESP00034: {
    storeId: 'MIESP00034',
    storeName: 'Media Badalona',
    active: true,
    planogram: 'Table 1',
    posmWall: false,
    posmMiniWall: false,
    posmColumnaCara1: false,
    posmTopTableCara1: true,
    hasXiaomiClip: false,
    x18ProLdu: 0,
    x18ProMaxLdu: 0,
    x18ProDummy: 2,
    x18ProMaxDummy: 2
  },
  MIESD00174: {
    storeId: 'MIESD00174',
    storeName: 'Media Barcelona 5 Fontanella',
    active: true,
    planogram: 'Table 2',
    posmWall: true,
    posmMiniWall: false,
    posmColumnaCara1: false,
    posmTopTableCara1: false,
    hasXiaomiClip: true,
    x18ProLdu: 2,
    x18ProMaxLdu: 2,
    x18ProDummy: 0,
    x18ProMaxDummy: 0
  },
  MIESO00036: {
    storeId: 'MIESO00036',
    storeName: 'Media Diagonal Digital 1',
    active: false,
    planogram: '',
    posmWall: false,
    posmMiniWall: false,
    posmColumnaCara1: false,
    posmTopTableCara1: false,
    hasXiaomiClip: false,
    x18ProLdu: 0,
    x18ProMaxLdu: 0,
    x18ProDummy: 0,
    x18ProMaxDummy: 0
  },
  MIESS00026: {
    storeId: 'MIESS00026',
    storeName: 'Media Diagonal Mar-Barcelona',
    active: true,
    planogram: 'Table 3',
    posmWall: false,
    posmMiniWall: true,
    posmColumnaCara1: false,
    posmTopTableCara1: false,
    hasXiaomiClip: true,
    x18ProLdu: 1,
    x18ProMaxLdu: 1,
    x18ProDummy: 1,
    x18ProMaxDummy: 1
  },
  MIESD00175: {
    storeId: 'MIESD00175',
    storeName: 'Media El Prat',
    active: true,
    planogram: 'Table 2',
    posmWall: false,
    posmMiniWall: false,
    posmColumnaCara1: false,
    posmTopTableCara1: true,
    hasXiaomiClip: true,
    x18ProLdu: 1,
    x18ProMaxLdu: 1,
    x18ProDummy: 1,
    x18ProMaxDummy: 1
  },
  MIESO00034: {
    storeId: 'MIESO00034',
    storeName: 'Media Esplugues',
    active: true,
    planogram: 'Table 1',
    posmWall: false,
    posmMiniWall: false,
    posmColumnaCara1: false,
    posmTopTableCara1: true,
    hasXiaomiClip: false,
    x18ProLdu: 1,
    x18ProMaxLdu: 1,
    x18ProDummy: 1,
    x18ProMaxDummy: 1
  },
  MIESO00033: {
    storeId: 'MIESO00033',
    storeName: 'Media Gava',
    active: true,
    planogram: 'Table 1',
    posmWall: true,
    posmMiniWall: false,
    posmColumnaCara1: false,
    posmTopTableCara1: false,
    hasXiaomiClip: false,
    x18ProLdu: 1,
    x18ProMaxLdu: 1,
    x18ProDummy: 1,
    x18ProMaxDummy: 1
  },
  MIESD00182: {
    storeId: 'MIESD00182',
    storeName: 'Media Girona',
    active: true,
    planogram: 'Table 3',
    posmWall: false,
    posmMiniWall: false,
    posmColumnaCara1: false,
    posmTopTableCara1: true,
    hasXiaomiClip: true,
    x18ProLdu: 2,
    x18ProMaxLdu: 2,
    x18ProDummy: 0,
    x18ProMaxDummy: 0
  },
  MIESP00037: {
    storeId: 'MIESP00037',
    storeName: 'Media Girona 2',
    active: true,
    planogram: 'Table 1',
    posmWall: false,
    posmMiniWall: false,
    posmColumnaCara1: false,
    posmTopTableCara1: true,
    hasXiaomiClip: false,
    x18ProLdu: 0,
    x18ProMaxLdu: 0,
    x18ProDummy: 2,
    x18ProMaxDummy: 2
  },
  MIESM00438: {
    storeId: 'MIESM00438',
    storeName: 'Media Girona 3',
    active: true,
    planogram: 'Table 1',
    posmWall: false,
    posmMiniWall: false,
    posmColumnaCara1: false,
    posmTopTableCara1: true,
    hasXiaomiClip: false,
    x18ProLdu: 0,
    x18ProMaxLdu: 0,
    x18ProDummy: 2,
    x18ProMaxDummy: 2
  },
  MIESD00187: {
    storeId: 'MIESD00187',
    storeName: 'Media Lleida',
    active: true,
    planogram: 'Table 2',
    posmWall: false,
    posmMiniWall: false,
    posmColumnaCara1: false,
    posmTopTableCara1: true,
    hasXiaomiClip: true,
    x18ProLdu: 2,
    x18ProMaxLdu: 2,
    x18ProDummy: 0,
    x18ProMaxDummy: 0
  },
  MIESD00176: {
    storeId: 'MIESD00176',
    storeName: 'Media Maquinista',
    active: true,
    planogram: 'Table 2',
    posmWall: false,
    posmMiniWall: false,
    posmColumnaCara1: true,
    posmTopTableCara1: false,
    hasXiaomiClip: true,
    x18ProLdu: 2,
    x18ProMaxLdu: 2,
    x18ProDummy: 0,
    x18ProMaxDummy: 0
  },
  MIESD00177: {
    storeId: 'MIESD00177',
    storeName: 'Media Mataro',
    active: true,
    planogram: 'Table 1',
    posmWall: false,
    posmMiniWall: false,
    posmColumnaCara1: false,
    posmTopTableCara1: true,
    hasXiaomiClip: true,
    x18ProLdu: 1,
    x18ProMaxLdu: 1,
    x18ProDummy: 1,
    x18ProMaxDummy: 1
  },
  MIESD00178: {
    storeId: 'MIESD00178',
    storeName: 'Media Parets',
    active: true,
    planogram: 'Table 1',
    posmWall: false,
    posmMiniWall: false,
    posmColumnaCara1: false,
    posmTopTableCara1: true,
    hasXiaomiClip: true,
    x18ProLdu: 1,
    x18ProMaxLdu: 1,
    x18ProDummy: 1,
    x18ProMaxDummy: 1
  },
  MIESP03781: {
    storeId: 'MIESP03781',
    storeName: 'Media Sabadell',
    active: true,
    planogram: 'Table 2',
    posmWall: false,
    posmMiniWall: false,
    posmColumnaCara1: false,
    posmTopTableCara1: true,
    hasXiaomiClip: false,
    x18ProLdu: 1,
    x18ProMaxLdu: 1,
    x18ProDummy: 1,
    x18ProMaxDummy: 1
  },
  MIESD00180: {
    storeId: 'MIESD00180',
    storeName: 'Media Sant Cugat (Barcelona)',
    active: true,
    planogram: 'Table 2',
    posmWall: true,
    posmMiniWall: false,
    posmColumnaCara1: false,
    posmTopTableCara1: false,
    hasXiaomiClip: true,
    x18ProLdu: 1,
    x18ProMaxLdu: 1,
    x18ProDummy: 1,
    x18ProMaxDummy: 1
  },
  MIESO00043: {
    storeId: 'MIESO00043',
    storeName: 'Media Tarragona',
    active: true,
    planogram: 'Table 2',
    posmWall: true,
    posmMiniWall: false,
    posmColumnaCara1: false,
    posmTopTableCara1: false,
    hasXiaomiClip: true,
    x18ProLdu: 1,
    x18ProMaxLdu: 1,
    x18ProDummy: 1,
    x18ProMaxDummy: 1
  },
  MIESD00179: {
    storeId: 'MIESD00179',
    storeName: 'Media Terrassa',
    active: true,
    planogram: 'Table 2',
    posmWall: true,
    posmMiniWall: false,
    posmColumnaCara1: false,
    posmTopTableCara1: false,
    hasXiaomiClip: true,
    x18ProLdu: 1,
    x18ProMaxLdu: 1,
    x18ProDummy: 1,
    x18ProMaxDummy: 1
  },
  MIESD02181: {
    storeId: 'MIESD02181',
    storeName: 'Media Vilanova',
    active: true,
    planogram: 'Table 2',
    posmWall: true,
    posmMiniWall: false,
    posmColumnaCara1: false,
    posmTopTableCara1: false,
    hasXiaomiClip: true,
    x18ProLdu: 1,
    x18ProMaxLdu: 1,
    x18ProDummy: 1,
    x18ProMaxDummy: 1
  },
  MIESD00203: {
    storeId: 'MIESD00203',
    storeName: 'Media Zaragoza',
    active: true,
    planogram: 'Table 2',
    posmWall: false,
    posmMiniWall: false,
    posmColumnaCara1: false,
    posmTopTableCara1: true,
    hasXiaomiClip: false,
    x18ProLdu: 1,
    x18ProMaxLdu: 1,
    x18ProDummy: 1,
    x18ProMaxDummy: 1
  },
  MIESD00204: {
    storeId: 'MIESD00204',
    storeName: 'Media Zaragoza 2',
    active: true,
    planogram: 'Table 2',
    posmWall: true,
    posmMiniWall: false,
    posmColumnaCara1: false,
    posmTopTableCara1: false,
    hasXiaomiClip: true,
    x18ProLdu: 1,
    x18ProMaxLdu: 1,
    x18ProDummy: 1,
    x18ProMaxDummy: 1
  },
  MIESD00077: {
    storeId: 'MIESD00077',
    storeName: 'ECI C.C. GIROCENTRE',
    active: false,
    planogram: '',
    posmWall: false,
    posmMiniWall: false,
    posmColumnaCara1: false,
    posmTopTableCara1: false,
    hasXiaomiClip: false,
    x18ProLdu: 0,
    x18ProMaxLdu: 0,
    x18ProDummy: 0,
    x18ProMaxDummy: 0
  },
  MIESD00114: {
    storeId: 'MIESD00114',
    storeName: 'ECI CAN DRAGO',
    active: true,
    planogram: 'Table 1',
    posmWall: true,
    posmMiniWall: false,
    posmColumnaCara1: false,
    posmTopTableCara1: false,
    hasXiaomiClip: true,
    x18ProLdu: 1,
    x18ProMaxLdu: 1,
    x18ProDummy: 1,
    x18ProMaxDummy: 1
  },
  MIESS00002: {
    storeId: 'MIESS00002',
    storeName: 'ECI CATALUÑA',
    active: true,
    planogram: 'Table 2',
    posmWall: false,
    posmMiniWall: false,
    posmColumnaCara1: true,
    posmTopTableCara1: false,
    hasXiaomiClip: true,
    x18ProLdu: 2,
    x18ProMaxLdu: 2,
    x18ProDummy: 0,
    x18ProMaxDummy: 0
  },
  MIESD00121: {
    storeId: 'MIESD00121',
    storeName: 'ECI CORNELLA',
    active: true,
    planogram: 'Table 1',
    posmWall: false,
    posmMiniWall: false,
    posmColumnaCara1: true,
    posmTopTableCara1: false,
    hasXiaomiClip: true,
    x18ProLdu: 1,
    x18ProMaxLdu: 1,
    x18ProDummy: 1,
    x18ProMaxDummy: 1
  },
  MIESS00003: {
    storeId: 'MIESS00003',
    storeName: 'ECI DIAGONAL',
    active: true,
    planogram: 'Table 2',
    posmWall: false,
    posmMiniWall: false,
    posmColumnaCara1: false,
    posmTopTableCara1: true,
    hasXiaomiClip: true,
    x18ProLdu: 2,
    x18ProMaxLdu: 2,
    x18ProDummy: 0,
    x18ProMaxDummy: 0
  },
  MIESD00103: {
    storeId: 'MIESD00103',
    storeName: 'ECI INDEPENDENCIA',
    active: false,
    planogram: '',
    posmWall: false,
    posmMiniWall: false,
    posmColumnaCara1: false,
    posmTopTableCara1: false,
    hasXiaomiClip: false,
    x18ProLdu: 0,
    x18ProMaxLdu: 0,
    x18ProDummy: 0,
    x18ProMaxDummy: 0
  },
  MIESD00113: {
    storeId: 'MIESD00113',
    storeName: 'ECI MERIDIANA',
    active: true,
    planogram: 'Table 1',
    posmWall: false,
    posmMiniWall: false,
    posmColumnaCara1: false,
    posmTopTableCara1: true,
    hasXiaomiClip: true,
    x18ProLdu: 0,
    x18ProMaxLdu: 0,
    x18ProDummy: 2,
    x18ProMaxDummy: 2
  },
  MIESD00105: {
    storeId: 'MIESD00105',
    storeName: 'ECI PUERTO VENECIA',
    active: false,
    planogram: '',
    posmWall: false,
    posmMiniWall: false,
    posmColumnaCara1: false,
    posmTopTableCara1: false,
    hasXiaomiClip: false,
    x18ProLdu: 0,
    x18ProMaxLdu: 0,
    x18ProDummy: 0,
    x18ProMaxDummy: 0
  },
  MIESD00076: {
    storeId: 'MIESD00076',
    storeName: 'ECI SABADELL',
    active: true,
    planogram: 'Table 1',
    posmWall: false,
    posmMiniWall: false,
    posmColumnaCara1: true,
    posmTopTableCara1: false,
    hasXiaomiClip: true,
    x18ProLdu: 1,
    x18ProMaxLdu: 1,
    x18ProDummy: 1,
    x18ProMaxDummy: 1
  },
  MIESD00088: {
    storeId: 'MIESD00088',
    storeName: 'ECI TARRAGONA',
    active: false,
    planogram: '',
    posmWall: false,
    posmMiniWall: false,
    posmColumnaCara1: false,
    posmTopTableCara1: false,
    hasXiaomiClip: false,
    x18ProLdu: 0,
    x18ProMaxLdu: 0,
    x18ProDummy: 0,
    x18ProMaxDummy: 0
  },
  MIESD00104: {
    storeId: 'MIESD00104',
    storeName: 'ECI ZARAGOZA',
    active: true,
    planogram: 'Table 1',
    posmWall: false,
    posmMiniWall: false,
    posmColumnaCara1: true,
    posmTopTableCara1: false,
    hasXiaomiClip: true,
    x18ProLdu: 1,
    x18ProMaxLdu: 1,
    x18ProDummy: 1,
    x18ProMaxDummy: 1
  }
};

const normalizeStoreName = (val: string): string =>
  val
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^mediamarkt\s+/i, 'media ')
    .replace(/\s+/g, ' ')
    .trim();

export const getX18StoreCampaignConfig = (
  storeOrId?: StoreCenter | string
): X18StoreCampaignConfig | undefined => {
  if (!storeOrId) return undefined;

  if (typeof storeOrId === 'string') {
    const cleanId = storeOrId.trim().toUpperCase();
    if (X18_STORE_CAMPAIGN_CONFIG[cleanId]) {
      return X18_STORE_CAMPAIGN_CONFIG[cleanId];
    }
    const norm = normalizeStoreName(storeOrId);
    return Object.values(X18_STORE_CAMPAIGN_CONFIG).find(
      (cfg) => normalizeStoreName(cfg.storeName) === norm
    );
  }

  const cleanId = (storeOrId.tiendaId || '').trim().toUpperCase();
  if (X18_STORE_CAMPAIGN_CONFIG[cleanId]) {
    return X18_STORE_CAMPAIGN_CONFIG[cleanId];
  }

  const normName = normalizeStoreName(storeOrId.nombreTienda || '');
  return Object.values(X18_STORE_CAMPAIGN_CONFIG).find(
    (cfg) => normalizeStoreName(cfg.storeName) === normName
  );
};

export const isTargetX18Mesa1Cara1Store = (storeOrId?: StoreCenter | string): boolean => {
  const cfg = getX18StoreCampaignConfig(storeOrId);
  if (cfg) return cfg.active;
  return false;
};

/**
 * Determina si una tienda tiene activa la campaña de Nueva Implantación ("Lanzamiento Xiaomi 18 Pro Max").
 * Se rige estrictamente por el Excel maestro (las 28 tiendas activas).
 */
export const hasActiveImplantationCampaign = (store: StoreCenter): boolean => {
  const cfg = getX18StoreCampaignConfig(store);
  if (cfg !== undefined) {
    return cfg.active;
  }
  const spaceType = (store.tipoEspacioId || '').trim().toLowerCase();
  return (
    spaceType.includes('table 1') ||
    spaceType.includes('table 2') ||
    spaceType.includes('table 3')
  );
};

/**
 * Determina si una tienda es de formato Table 1 (1 mesa) en la campaña X18
 */
export const isTable1CampaignStore = (storeOrId?: StoreCenter | string): boolean => {
  const cfg = getX18StoreCampaignConfig(storeOrId);
  if (cfg && cfg.planogram) {
    return cfg.planogram === 'Table 1';
  }
  if (typeof storeOrId === 'object' && storeOrId?.tipoEspacioId) {
    return storeOrId.tipoEspacioId.trim().toLowerCase().includes('table 1');
  }
  if (typeof storeOrId === 'string') {
    return storeOrId.trim().toLowerCase().includes('table 1');
  }
  return false;
};

/**
 * Determina si una tienda es de formato 2 o 3 mesas (Table 2 / Table 3)
 */
export const isTwoTableSpace = (storeOrSpace?: StoreCenter | string): boolean => {
  if (!storeOrSpace) return false;
  const cfg = getX18StoreCampaignConfig(storeOrSpace);
  if (cfg && cfg.planogram) {
    return cfg.planogram === 'Table 2' || cfg.planogram === 'Table 3';
  }
  if (typeof storeOrSpace === 'string') {
    const s = storeOrSpace.trim().toLowerCase();
    return s.includes('table 2') || s.includes('table 3') || s.toUpperCase() === 'MIESO00043';
  }
  const spaceType = (storeOrSpace.tipoEspacioId || '').trim().toLowerCase();
  const available = (storeOrSpace.availableSpaces || []).map((s) => s.toUpperCase());
  const hasMesa2 = available.some((s) => s.includes('MESA 2') || s.includes('TABLE 2'));
  return (
    spaceType.includes('table 2') ||
    spaceType.includes('table 3') ||
    hasMesa2 ||
    storeOrSpace.tiendaId.toUpperCase() === 'MIESO00043'
  );
};

/**
 * Devuelve la clave de imagen en PLANOGRAM_IMAGES que corresponde a la Mesa 1 Cara 1
 * de la tienda según su formato en el Excel (Table 1 vs Table 2/3, con o sin Xiaomi Clip, con o sin Top Table).
 */
export type ImplantationPlanogramImageKey =
  | 'mesa1Cara1T1X18WithClip'
  | 'mesa1Cara1T1X18NoClip'
  | 'mesa1Cara1X18Implantacion'
  | 'mesa1Cara1T2X18NoClipTt'
  | 'mesa1Cara1T2X18NoClipNoTt';

export const getImplantationPlanogramImageKeyForStore = (
  storeOrId?: StoreCenter | string
): ImplantationPlanogramImageKey => {
  const cfg = getX18StoreCampaignConfig(storeOrId);
  const isT1 = isTable1CampaignStore(storeOrId);
  const hasClip = cfg ? cfg.hasXiaomiClip : true;

  if (isT1) {
    return hasClip ? 'mesa1Cara1T1X18WithClip' : 'mesa1Cara1T1X18NoClip';
  }

  if (hasClip) {
    return 'mesa1Cara1X18Implantacion';
  }

  return cfg?.posmTopTableCara1 ? 'mesa1Cara1T2X18NoClipTt' : 'mesa1Cara1T2X18NoClipNoTt';
};

export interface ImplantationPositionSpec {
  pos: number;
  device: string;
  color: string;
  dummy: boolean;
  category: ProductCategory;
  pinX: number;
  pinY: number;
  isNewInstall: boolean;
  previousPosNum?: number;
  modeloSaliente?: string;
  esDummySaliente?: boolean;
}

/**
 * Genera la lista exacta de posiciones de Mesa 1 Cara 1 para una tienda según el Excel maestro:
 * - Determina para P01..P04 si cada unidad de Xiaomi 18 Pro Max y Xiaomi 18 Pro es LDU o Dummy:
 *   · Cuando hay 1 LDU y 1 Dummy: P01 = Xiaomi 18 Pro Max (LDU), P02 = Xiaomi 18 Pro Max (Dummy), P03 = Xiaomi 18 Pro (LDU), P04 = Xiaomi 18 Pro (Dummy).
 *   · Cuando hay 2 LDU: P01..P04 son todos LDU.
 *   · Cuando hay 2 Dummy: P01..P04 son todos Dummy.
 * - Si la tienda lleva Xiaomi Clip (`hasXiaomiClip = true`), P05 es Xiaomi Clip (Dummy). Si no lo lleva, no existe ese puesto y los siguientes dispositivos suben una posición (quedando 10 puestos en la cara).
 * - En tiendas Table 1: el bloque central tiene Xiaomi 17T Pro Blue, Xiaomi 17T Purple y Xiaomi Watch 5 (que se instala/reubica en lugar de la Smart Band 10 Pro), seguidos de los 3 Redmi Note 17 Pro Max 5G.
 * - En tiendas Table 2 / Table 3: el bloque central y derecho mantienen del Xiaomi 17T Pro Blue al Xiaomi Smart Band 11 Active.
 */
export const getImplantationPositionSpecsForStore = (
  storeOrId?: StoreCenter | string
): ImplantationPositionSpec[] => {
  const cfg = getX18StoreCampaignConfig(storeOrId);
  const isT1 = isTable1CampaignStore(storeOrId);
  const hasClip = cfg ? cfg.hasXiaomiClip : true;

  // Regla oficial LDU vs Dummy en P01..P04:
  // - P01 Xiaomi 18 Pro Max: LDU si x18ProMaxLdu >= 1, Dummy si x18ProMaxLdu === 0
  // - P02 Xiaomi 18 Pro Max: LDU si x18ProMaxLdu >= 2, Dummy en caso contrario
  // - P03 Xiaomi 18 Pro: LDU si x18ProLdu >= 1, Dummy si x18ProLdu === 0
  // - P04 Xiaomi 18 Pro: LDU si x18ProLdu >= 2, Dummy en caso contrario
  const p1Dummy = cfg ? cfg.x18ProMaxLdu < 1 : false;
  const p2Dummy = cfg ? cfg.x18ProMaxLdu < 2 : false;
  const p3Dummy = cfg ? cfg.x18ProLdu < 1 : false;
  const p4Dummy = cfg ? cfg.x18ProLdu < 2 : false;

  if (isT1) {
    if (hasClip) {
      // Table 1 CON Xiaomi Clip (11 posiciones)
      return [
        {
          pos: 1,
          device: 'Xiaomi 18 Pro Max',
          color: p1Dummy ? 'Red / Burgundy (Maqueta)' : 'Red / Burgundy',
          dummy: p1Dummy,
          category: 'Smartphone',
          pinX: 14.5,
          pinY: 53.5,
          isNewInstall: true,
          previousPosNum: 1,
          modeloSaliente: 'Xiaomi 17 Ultra Green',
          esDummySaliente: true
        },
        {
          pos: 2,
          device: 'Xiaomi 18 Pro Max',
          color: p2Dummy ? 'Red / Burgundy (Maqueta)' : 'Red / Burgundy',
          dummy: p2Dummy,
          category: 'Smartphone',
          pinX: 19.3,
          pinY: 53.5,
          isNewInstall: true,
          previousPosNum: 2,
          modeloSaliente: 'Xiaomi 17 Blue',
          esDummySaliente: true
        },
        {
          pos: 3,
          device: 'Xiaomi 18 Pro',
          color: p3Dummy ? 'Purple / Blue (Maqueta)' : 'Purple / Blue',
          dummy: p3Dummy,
          category: 'Smartphone',
          pinX: 30.2,
          pinY: 53.5,
          isNewInstall: true,
          previousPosNum: 3,
          modeloSaliente: 'Xiaomi 17 Ultra Black',
          esDummySaliente: false
        },
        {
          pos: 4,
          device: 'Xiaomi 18 Pro',
          color: p4Dummy ? 'Purple / Blue (Maqueta)' : 'Purple / Blue',
          dummy: p4Dummy,
          category: 'Smartphone',
          pinX: 35.2,
          pinY: 53.5,
          isNewInstall: true,
          previousPosNum: 4,
          modeloSaliente: 'Xiaomi 17 Black',
          esDummySaliente: false
        },
        {
          pos: 5,
          device: 'Xiaomi Clip',
          color: 'Black (Maqueta)',
          dummy: true,
          category: 'Audio',
          pinX: 43.8,
          pinY: 53.5,
          isNewInstall: true,
          previousPosNum: 6,
          modeloSaliente: 'Xiaomi Buds 6',
          esDummySaliente: true
        },
        {
          pos: 6,
          device: 'Xiaomi 17T Pro Blue',
          color: 'Blue',
          dummy: false,
          category: 'Smartphone',
          pinX: 51.0,
          pinY: 53.5,
          isNewInstall: false,
          previousPosNum: 7
        },
        {
          pos: 7,
          device: 'Xiaomi 17T Purple',
          color: 'Purple',
          dummy: false,
          category: 'Smartphone',
          pinX: 56.0,
          pinY: 53.5,
          isNewInstall: false,
          previousPosNum: 8
        },
        {
          pos: 8,
          device: 'Xiaomi Watch 5',
          color: 'Black',
          dummy: false,
          category: 'Wearable',
          pinX: 64.5,
          pinY: 53.5,
          isNewInstall: true,
          previousPosNum: 5,
          modeloSaliente: 'Xiaomi Smart Band 10 Pro',
          esDummySaliente: false
        },
        {
          pos: 9,
          device: 'Redmi Note 17 Pro Max 5G White&Orange',
          color: 'White & Orange',
          dummy: false,
          category: 'Smartphone',
          pinX: 76.2,
          pinY: 53.5,
          isNewInstall: false,
          previousPosNum: 10
        },
        {
          pos: 10,
          device: 'Redmi Note 17 Pro Max 5G White&Orange',
          color: 'White & Orange (Maqueta)',
          dummy: true,
          category: 'Smartphone',
          pinX: 81.8,
          pinY: 53.5,
          isNewInstall: false,
          previousPosNum: 11
        },
        {
          pos: 11,
          device: 'Redmi Note 17 Pro Max 5G Green',
          color: 'Green',
          dummy: false,
          category: 'Smartphone',
          pinX: 87.5,
          pinY: 53.5,
          isNewInstall: false,
          previousPosNum: 12
        }
      ];
    } else {
      // Table 1 SIN Xiaomi Clip (10 posiciones)
      return [
        {
          pos: 1,
          device: 'Xiaomi 18 Pro Max',
          color: p1Dummy ? 'Red / Burgundy (Maqueta)' : 'Red / Burgundy',
          dummy: p1Dummy,
          category: 'Smartphone',
          pinX: 19.5,
          pinY: 53.5,
          isNewInstall: true,
          previousPosNum: 1,
          modeloSaliente: 'Xiaomi 17 Ultra Green',
          esDummySaliente: true
        },
        {
          pos: 2,
          device: 'Xiaomi 18 Pro Max',
          color: p2Dummy ? 'Red / Burgundy (Maqueta)' : 'Red / Burgundy',
          dummy: p2Dummy,
          category: 'Smartphone',
          pinX: 24.5,
          pinY: 53.5,
          isNewInstall: true,
          previousPosNum: 2,
          modeloSaliente: 'Xiaomi 17 Blue',
          esDummySaliente: true
        },
        {
          pos: 3,
          device: 'Xiaomi 18 Pro',
          color: p3Dummy ? 'Purple / Blue (Maqueta)' : 'Purple / Blue',
          dummy: p3Dummy,
          category: 'Smartphone',
          pinX: 34.5,
          pinY: 53.5,
          isNewInstall: true,
          previousPosNum: 3,
          modeloSaliente: 'Xiaomi 17 Ultra Black',
          esDummySaliente: false
        },
        {
          pos: 4,
          device: 'Xiaomi 18 Pro',
          color: p4Dummy ? 'Purple / Blue (Maqueta)' : 'Purple / Blue',
          dummy: p4Dummy,
          category: 'Smartphone',
          pinX: 39.5,
          pinY: 53.5,
          isNewInstall: true,
          previousPosNum: 4,
          modeloSaliente: 'Xiaomi 17 Black',
          esDummySaliente: false
        },
        {
          pos: 5,
          device: 'Xiaomi 17T Pro Blue',
          color: 'Blue',
          dummy: false,
          category: 'Smartphone',
          pinX: 50.2,
          pinY: 53.5,
          isNewInstall: false,
          previousPosNum: 7
        },
        {
          pos: 6,
          device: 'Xiaomi 17T Purple',
          color: 'Purple',
          dummy: false,
          category: 'Smartphone',
          pinX: 55.2,
          pinY: 53.5,
          isNewInstall: false,
          previousPosNum: 8
        },
        {
          pos: 7,
          device: 'Xiaomi Watch 5',
          color: 'Black',
          dummy: false,
          category: 'Wearable',
          pinX: 63.8,
          pinY: 53.5,
          isNewInstall: true,
          previousPosNum: 5,
          modeloSaliente: 'Xiaomi Smart Band 10 Pro',
          esDummySaliente: false
        },
        {
          pos: 8,
          device: 'Redmi Note 17 Pro Max 5G White&Orange',
          color: 'White & Orange',
          dummy: false,
          category: 'Smartphone',
          pinX: 74.8,
          pinY: 53.5,
          isNewInstall: false,
          previousPosNum: 10
        },
        {
          pos: 9,
          device: 'Redmi Note 17 Pro Max 5G White&Orange',
          color: 'White & Orange (Maqueta)',
          dummy: true,
          category: 'Smartphone',
          pinX: 80.2,
          pinY: 53.5,
          isNewInstall: false,
          previousPosNum: 11
        },
        {
          pos: 10,
          device: 'Redmi Note 17 Pro Max 5G Green',
          color: 'Green',
          dummy: false,
          category: 'Smartphone',
          pinX: 85.8,
          pinY: 53.5,
          isNewInstall: false,
          previousPosNum: 12
        }
      ];
    }
  }

  // Table 2 / Table 3
  if (hasClip) {
    // Table 2 / Table 3 CON Xiaomi Clip (11 posiciones)
    return [
      {
        pos: 1,
        device: 'Xiaomi 18 Pro Max',
        color: p1Dummy ? 'Red / Burgundy (Maqueta)' : 'Red / Burgundy',
        dummy: p1Dummy,
        category: 'Smartphone',
        pinX: 15.8,
        pinY: 52.5,
        isNewInstall: true,
        previousPosNum: 1,
        modeloSaliente: 'Xiaomi 17 Ultra Green',
        esDummySaliente: true
      },
      {
        pos: 2,
        device: 'Xiaomi 18 Pro Max',
        color: p2Dummy ? 'Red / Burgundy (Maqueta)' : 'Red / Burgundy',
        dummy: p2Dummy,
        category: 'Smartphone',
        pinX: 21.2,
        pinY: 52.5,
        isNewInstall: true,
        previousPosNum: 2,
        modeloSaliente: 'Xiaomi 17 Blue',
        esDummySaliente: true
      },
      {
        pos: 3,
        device: 'Xiaomi 18 Pro',
        color: p3Dummy ? 'Purple / Blue (Maqueta)' : 'Purple / Blue',
        dummy: p3Dummy,
        category: 'Smartphone',
        pinX: 28.8,
        pinY: 52.5,
        isNewInstall: true,
        previousPosNum: 3,
        modeloSaliente: 'Xiaomi 17 Ultra Black',
        esDummySaliente: false
      },
      {
        pos: 4,
        device: 'Xiaomi 18 Pro',
        color: p4Dummy ? 'Purple / Blue (Maqueta)' : 'Purple / Blue',
        dummy: p4Dummy,
        category: 'Smartphone',
        pinX: 34.2,
        pinY: 52.5,
        isNewInstall: true,
        previousPosNum: 4,
        modeloSaliente: 'Xiaomi 17 Black',
        esDummySaliente: false
      },
      {
        pos: 5,
        device: 'Xiaomi Clip',
        color: 'Black (Maqueta)',
        dummy: true,
        category: 'Audio',
        pinX: 43.5,
        pinY: 52.5,
        isNewInstall: true,
        previousPosNum: 6,
        modeloSaliente: 'Xiaomi Buds 6',
        esDummySaliente: true
      },
      {
        pos: 6,
        device: 'Xiaomi 17T Pro Blue',
        color: 'Blue',
        dummy: false,
        category: 'Smartphone',
        pinX: 54.0,
        pinY: 52.5,
        isNewInstall: false,
        previousPosNum: 7
      },
      {
        pos: 7,
        device: 'Xiaomi Watch S5 46mm',
        color: 'Black',
        dummy: false,
        category: 'Wearable',
        pinX: 59.3,
        pinY: 52.5,
        isNewInstall: false,
        previousPosNum: 8
      },
      {
        pos: 8,
        device: 'Xiaomi Smart Band 10 Pro',
        color: 'Black',
        dummy: false,
        category: 'Wearable',
        pinX: 64.5,
        pinY: 52.5,
        isNewInstall: false,
        previousPosNum: 9
      },
      {
        pos: 9,
        device: 'Xiaomi 17T Purple',
        color: 'Purple',
        dummy: false,
        category: 'Smartphone',
        pinX: 74.6,
        pinY: 52.5,
        isNewInstall: false,
        previousPosNum: 10
      },
      {
        pos: 10,
        device: 'Xiaomi 17T Blue',
        color: 'Blue (Maqueta)',
        dummy: true,
        category: 'Smartphone',
        pinX: 79.8,
        pinY: 52.5,
        isNewInstall: false,
        previousPosNum: 11
      },
      {
        pos: 11,
        device: 'Xiaomi Smart Band 11 Active',
        color: 'Black',
        dummy: false,
        category: 'Wearable',
        pinX: 85.2,
        pinY: 52.5,
        isNewInstall: false,
        previousPosNum: 12
      }
    ];
  } else {
    // Table 2 SIN Xiaomi Clip (10 posiciones: Media Sabadell y Media Zaragoza)
    return [
      {
        pos: 1,
        device: 'Xiaomi 18 Pro Max',
        color: p1Dummy ? 'Red / Burgundy (Maqueta)' : 'Red / Burgundy',
        dummy: p1Dummy,
        category: 'Smartphone',
        pinX: 19.5,
        pinY: 52.5,
        isNewInstall: true,
        previousPosNum: 1,
        modeloSaliente: 'Xiaomi 17 Ultra Green',
        esDummySaliente: true
      },
      {
        pos: 2,
        device: 'Xiaomi 18 Pro Max',
        color: p2Dummy ? 'Red / Burgundy (Maqueta)' : 'Red / Burgundy',
        dummy: p2Dummy,
        category: 'Smartphone',
        pinX: 24.5,
        pinY: 52.5,
        isNewInstall: true,
        previousPosNum: 2,
        modeloSaliente: 'Xiaomi 17 Blue',
        esDummySaliente: true
      },
      {
        pos: 3,
        device: 'Xiaomi 18 Pro',
        color: p3Dummy ? 'Purple / Blue (Maqueta)' : 'Purple / Blue',
        dummy: p3Dummy,
        category: 'Smartphone',
        pinX: 38.2,
        pinY: 52.5,
        isNewInstall: true,
        previousPosNum: 3,
        modeloSaliente: 'Xiaomi 17 Ultra Black',
        esDummySaliente: false
      },
      {
        pos: 4,
        device: 'Xiaomi 18 Pro',
        color: p4Dummy ? 'Purple / Blue (Maqueta)' : 'Purple / Blue',
        dummy: p4Dummy,
        category: 'Smartphone',
        pinX: 43.2,
        pinY: 52.5,
        isNewInstall: true,
        previousPosNum: 4,
        modeloSaliente: 'Xiaomi 17 Black',
        esDummySaliente: false
      },
      {
        pos: 5,
        device: 'Xiaomi 17T Pro Blue',
        color: 'Blue',
        dummy: false,
        category: 'Smartphone',
        pinX: 54.2,
        pinY: 52.5,
        isNewInstall: false,
        previousPosNum: 7
      },
      {
        pos: 6,
        device: 'Xiaomi Watch S5 46mm',
        color: 'Black',
        dummy: false,
        category: 'Wearable',
        pinX: 59.3,
        pinY: 52.5,
        isNewInstall: false,
        previousPosNum: 8
      },
      {
        pos: 7,
        device: 'Xiaomi Smart Band 10 Pro',
        color: 'Black',
        dummy: false,
        category: 'Wearable',
        pinX: 64.2,
        pinY: 52.5,
        isNewInstall: false,
        previousPosNum: 9
      },
      {
        pos: 8,
        device: 'Xiaomi 17T Purple',
        color: 'Purple',
        dummy: false,
        category: 'Smartphone',
        pinX: 75.0,
        pinY: 52.5,
        isNewInstall: false,
        previousPosNum: 10
      },
      {
        pos: 9,
        device: 'Xiaomi 17T Blue',
        color: 'Blue (Maqueta)',
        dummy: true,
        category: 'Smartphone',
        pinX: 80.0,
        pinY: 52.5,
        isNewInstall: false,
        previousPosNum: 11
      },
      {
        pos: 10,
        device: 'Xiaomi Smart Band 11 Active',
        color: 'Black',
        dummy: false,
        category: 'Wearable',
        pinX: 85.2,
        pinY: 52.5,
        isNewInstall: false,
        previousPosNum: 12
      }
    ];
  }
};

export const getImplantationPositionsForMesa1Cara1 = (store: StoreCenter): PlanogramPosition[] => {
  const specs = getImplantationPositionSpecsForStore(store);
  return specs.map((item) => ({
    id: `${store.tiendaId}-M1-C1-P${item.pos}`,
    tipoEspacioId: store.tipoEspacioId,
    mesaId: 'MESA 1',
    cara: 'Cara 1',
    posicionNumero: item.pos,
    categoria: item.category,
    modeloOficial: item.device,
    colorOficial: item.color,
    esDummy: item.dummy,
    requiereImei: !item.dummy,
    pinX: item.pinX,
    pinY: item.pinY
  }));
};

export interface DeviceReturnPlanItem {
  id: string;
  posicionAnterior: number;
  mesaId: string;
  cara: string;
  modeloSaliente: string;
  esDummy: boolean;
  categoria: ProductCategory;
  motivoRetirada: string;
  sustituidoPor: string;
}

/**
 * 6 Dispositivos a retirar de Mesa 1 Cara 1 para tiendas Table 2 y Table 3
 * (desde Xiaomi 17 Ultra Green hasta Xiaomi Buds 6, incluido Xiaomi Watch 5)
 */
export const RETURN_DEVICES_TABLE2_M1C1: DeviceReturnPlanItem[] = [
  {
    id: 'RET-T2-M1C1-P1',
    posicionAnterior: 1,
    mesaId: 'MESA 1',
    cara: 'Cara 1',
    modeloSaliente: 'Xiaomi 17 Ultra Green',
    esDummy: true,
    categoria: 'Smartphone',
    motivoRetirada: 'Fin de campaña (Sustituido por Xiaomi 18 Pro Max)',
    sustituidoPor: 'Xiaomi 18 Pro Max (P01)'
  },
  {
    id: 'RET-T2-M1C1-P2',
    posicionAnterior: 2,
    mesaId: 'MESA 1',
    cara: 'Cara 1',
    modeloSaliente: 'Xiaomi 17 Blue',
    esDummy: true,
    categoria: 'Smartphone',
    motivoRetirada: 'Fin de campaña (Sustituido por Xiaomi 18 Pro Max)',
    sustituidoPor: 'Xiaomi 18 Pro Max (P02)'
  },
  {
    id: 'RET-T2-M1C1-P3',
    posicionAnterior: 3,
    mesaId: 'MESA 1',
    cara: 'Cara 1',
    modeloSaliente: 'Xiaomi 17 Ultra Black',
    esDummy: false,
    categoria: 'Smartphone',
    motivoRetirada: 'Fin de campaña (Sustituido por Xiaomi 18 Pro)',
    sustituidoPor: 'Xiaomi 18 Pro (P03)'
  },
  {
    id: 'RET-T2-M1C1-P4',
    posicionAnterior: 4,
    mesaId: 'MESA 1',
    cara: 'Cara 1',
    modeloSaliente: 'Xiaomi 17 Black',
    esDummy: false,
    categoria: 'Smartphone',
    motivoRetirada: 'Fin de campaña (Sustituido por Xiaomi 18 Pro)',
    sustituidoPor: 'Xiaomi 18 Pro (P04)'
  },
  {
    id: 'RET-T2-M1C1-P5',
    posicionAnterior: 5,
    mesaId: 'MESA 1',
    cara: 'Cara 1',
    modeloSaliente: 'Xiaomi Watch 5',
    esDummy: false,
    categoria: 'Wearable',
    motivoRetirada: 'Fin de campaña (Reestructuración de Mesa 1 Cara 1)',
    sustituidoPor: 'Reestructuración Mesa 1 Cara 1'
  },
  {
    id: 'RET-T2-M1C1-P6',
    posicionAnterior: 6,
    mesaId: 'MESA 1',
    cara: 'Cara 1',
    modeloSaliente: 'Xiaomi Buds 6',
    esDummy: true,
    categoria: 'Audio',
    motivoRetirada: 'Fin de campaña (Retirada de audio campaña anterior)',
    sustituidoPor: 'Xiaomi Clip / Reestructuración Mesa 1'
  }
];

/**
 * 6 Dispositivos a retirar de Mesa 1 Cara 1 para tiendas Table 1 (1 mesa):
 * - No se retira el Xiaomi Watch 5 porque se reubica al bloque central.
 * - En su lugar se retira la Xiaomi Smart Band 10 Pro (P09 anterior) para colocar ahí el Xiaomi Watch 5.
 */
export const RETURN_DEVICES_TABLE1_M1C1: DeviceReturnPlanItem[] = [
  {
    id: 'RET-T1-M1C1-P1',
    posicionAnterior: 1,
    mesaId: 'MESA 1',
    cara: 'Cara 1',
    modeloSaliente: 'Xiaomi 17 Ultra Green',
    esDummy: true,
    categoria: 'Smartphone',
    motivoRetirada: 'Fin de campaña (Sustituido por Xiaomi 18 Pro Max)',
    sustituidoPor: 'Xiaomi 18 Pro Max (P01)'
  },
  {
    id: 'RET-T1-M1C1-P2',
    posicionAnterior: 2,
    mesaId: 'MESA 1',
    cara: 'Cara 1',
    modeloSaliente: 'Xiaomi 17 Blue',
    esDummy: true,
    categoria: 'Smartphone',
    motivoRetirada: 'Fin de campaña (Sustituido por Xiaomi 18 Pro Max)',
    sustituidoPor: 'Xiaomi 18 Pro Max (P02)'
  },
  {
    id: 'RET-T1-M1C1-P3',
    posicionAnterior: 3,
    mesaId: 'MESA 1',
    cara: 'Cara 1',
    modeloSaliente: 'Xiaomi 17 Ultra Black',
    esDummy: false,
    categoria: 'Smartphone',
    motivoRetirada: 'Fin de campaña (Sustituido por Xiaomi 18 Pro)',
    sustituidoPor: 'Xiaomi 18 Pro (P03)'
  },
  {
    id: 'RET-T1-M1C1-P4',
    posicionAnterior: 4,
    mesaId: 'MESA 1',
    cara: 'Cara 1',
    modeloSaliente: 'Xiaomi 17 Black',
    esDummy: false,
    categoria: 'Smartphone',
    motivoRetirada: 'Fin de campaña (Sustituido por Xiaomi 18 Pro)',
    sustituidoPor: 'Xiaomi 18 Pro (P04)'
  },
  {
    id: 'RET-T1-M1C1-P6',
    posicionAnterior: 6,
    mesaId: 'MESA 1',
    cara: 'Cara 1',
    modeloSaliente: 'Xiaomi Buds 6',
    esDummy: true,
    categoria: 'Audio',
    motivoRetirada: 'Fin de campaña (Retirada de audio campaña anterior)',
    sustituidoPor: 'Xiaomi Clip / Reestructuración Mesa 1'
  },
  {
    id: 'RET-T1-M1C1-P9',
    posicionAnterior: 9,
    mesaId: 'MESA 1',
    cara: 'Cara 1',
    modeloSaliente: 'Xiaomi Smart Band 10 Pro',
    esDummy: false,
    categoria: 'Wearable',
    motivoRetirada: 'Sustitución en bloque central: Retirar Smart Band 10 Pro para colocar el mismo Xiaomi Watch 5 del otro display (Puesto 05)',
    sustituidoPor: 'Xiaomi Watch 5 (Mismo reloj reubicado del Puesto 05)'
  }
];

export const BASE_RETURN_DEVICES_M1C1 = RETURN_DEVICES_TABLE2_M1C1;

/**
 * Obtiene el IMEI memorizado de un modelo específico en Mesa 1 (p. ej. Xiaomi Smart Band 10 Pro en P09
 * o Xiaomi Watch 5 en P05) a partir de la auditoría previa de la tienda o del SEED_AUDITS oficial.
 */
export const getStoreModelMemorizedImei = (
  store: StoreCenter,
  modelName: string,
  latestAudit?: AuditRecord | null
): string => {
  const cleanTarget = (modelName || '')
    .toLowerCase()
    .replace(/\s*\(.*?\)/g, '')
    .trim();
  if (!cleanTarget) return '';

  const seedAudit = SEED_AUDITS[store.tiendaId];
  const candidatePositions = [
    ...(latestAudit?.positions || []),
    ...(seedAudit?.positions || [])
  ];

  const match = candidatePositions.find((p) => {
    const m = (p.mesaId || '').toUpperCase();
    const id = (p.posicionId || '').toUpperCase();
    const isMesa1 = m.includes('MESA 1') || m.includes('TABLE 1') || id.includes('MESA_1');
    if (!isMesa1) return false;
    const mod = (p.modeloOficial || '').toLowerCase().trim();
    const rawImei = (p.imeiSerial || '').trim();
    const hasValidImei =
      Boolean(rawImei) &&
      rawImei !== '-' &&
      rawImei !== 'DUMMY' &&
      !rawImei.toLowerCase().includes('maqueta') &&
      !rawImei.toLowerCase().includes('exento');
    return (mod === cleanTarget || mod.includes(cleanTarget)) && hasValidImei && !p.esMaqueta;
  });

  return match?.imeiSerial?.trim() || '';
};

/**
 * Obtiene los dispositivos a retirar según si la tienda es Table 1 o Table 2/3,
 * enlazando los IMEIs memorizados y si era Maqueta o LDU desde la última auditoría completa previa.
 */
export const getReturnDevicesForStore = (
  store: StoreCenter,
  latestAudit?: AuditRecord | null
): DeviceReturnState[] => {
  const isT1 = isTable1CampaignStore(store);
  const baseList = isT1 ? RETURN_DEVICES_TABLE1_M1C1 : RETURN_DEVICES_TABLE2_M1C1;
  const seedAudit = SEED_AUDITS[store.tiendaId];

  // Posiciones correspondientes a Mesa 1 del último reporte de auditoría completa previa (con respaldo de SEED_AUDITS)
  const combinedSourcePositions = [
    ...(latestAudit?.positions || []),
    ...(seedAudit?.positions || [])
  ];

  const mesa1Positions = combinedSourcePositions.filter((p) => {
    const m = (p.mesaId || '').toUpperCase();
    const id = (p.posicionId || '').toUpperCase();
    return m.includes('MESA 1') || m.includes('TABLE 1') || id.includes('MESA_1');
  });

  const mesa1Cara1Positions = mesa1Positions.filter((p) => {
    const m = (p.mesaId || '').toUpperCase();
    const id = (p.posicionId || '').toUpperCase();
    return !m.includes('CARA 2') && !id.includes('CARA_2');
  });

  return baseList.map((item) => {
    const targetModel = item.modeloSaliente.trim().toLowerCase();

    // 1. Coincidencia simultánea por modelo y número de posición en Mesa 1 Cara 1
    let prevPos = mesa1Cara1Positions.find(
      (p) =>
        (p.modeloOficial || '').trim().toLowerCase() === targetModel &&
        (p.posicionNumero === item.posicionAnterior ||
          p.posicionId?.toUpperCase().endsWith(`-P${item.posicionAnterior}`))
    );

    // 2. Coincidencia exacta de nombre de modelo en Mesa 1 Cara 1 o en Mesa 1
    if (!prevPos) {
      prevPos =
        mesa1Cara1Positions.find(
          (p) => (p.modeloOficial || '').trim().toLowerCase() === targetModel
        ) ||
        mesa1Positions.find(
          (p) => (p.modeloOficial || '').trim().toLowerCase() === targetModel
        );
    }

    // 3. Fallback por número de posición anterior en Mesa 1 Cara 1
    if (!prevPos) {
      prevPos = mesa1Cara1Positions.find(
        (p) =>
          p.posicionNumero === item.posicionAnterior ||
          p.posicionId?.toUpperCase().endsWith(`-P${item.posicionAnterior}`)
      );
    }

    const rawImei = prevPos?.imeiSerial ? prevPos.imeiSerial.trim() : '';
    const hasRealImei =
      Boolean(rawImei) &&
      rawImei !== '-' &&
      !rawImei.toLowerCase().includes('maqueta') &&
      !rawImei.toLowerCase().includes('exento');

    // Recordar si era Maqueta o LDU según el reporte de auditoría completa más reciente
    let rememberedDummy = item.esDummy;
    if (prevPos) {
      if (rawImei.toLowerCase().includes('maqueta') || prevPos.esMaqueta === true) {
        rememberedDummy = true;
      } else if (hasRealImei || prevPos.esMaqueta === false) {
        rememberedDummy = false;
      }
    }

    const imei = !rememberedDummy && hasRealImei ? rawImei : undefined;

    return {
      id: item.id,
      posicionAnterior: item.posicionAnterior,
      mesaId: item.mesaId,
      modeloSaliente: item.modeloSaliente,
      esDummy: rememberedDummy,
      categoria: item.categoria,
      motivoRetirada: item.motivoRetirada,
      sustituidoPor: item.sustituidoPor,
      imeiMemorizado: imei,
      estadoRetirada: 'Pendiente'
    };
  });
};

/**
 * Busca el estado e IMEI guardado en la Auditoría Completa previa para los dispositivos que se mantienen
 * en Mesa 1 Cara 1 (y para el Xiaomi Watch 5 cuando se reubica en Table 1).
 */
export const findKeptDeviceStateFromAudit = (
  pos: PlanogramPosition,
  baseAudit?: AuditRecord | null
): PositionAuditState | undefined => {
  if (!baseAudit || !baseAudit.positions) return undefined;

  const mesa1Positions = baseAudit.positions.filter((p) => {
    const m = (p.mesaId || '').toUpperCase();
    const id = (p.posicionId || '').toUpperCase();
    return m.includes('MESA 1') || m.includes('TABLE 1') || id.includes('MESA_1');
  });

  const targetModel = (pos.modeloOficial || '').trim().toLowerCase();
  const isWatchS5 = targetModel.includes('watch s5');
  const isRedmiWhiteOrange = targetModel.includes('white&orange');

  // 1. Para los Redmi Note 17 Pro Max 5G White&Orange (donde uno es LDU y otro es Dummy), distinguir por esDummy
  if (isRedmiWhiteOrange) {
    const matchByDummy = mesa1Positions.find((p) => {
      const m = (p.modeloOficial || '').trim().toLowerCase();
      if (!m.includes('white&orange')) return false;
      const pIsDummy = Boolean(p.esMaqueta) || p.imeiSerial === '-' || (p.imeiSerial || '').toLowerCase().includes('maqueta');
      return pIsDummy === Boolean(pos.esDummy);
    });
    if (matchByDummy) return matchByDummy;
  }

  // 2. Buscar por nombre de modelo en toda la Mesa 1
  const byModel = mesa1Positions.find((p) => {
    const m = (p.modeloOficial || '').trim().toLowerCase();
    return (
      m === targetModel ||
      (isWatchS5 && m.includes('watch s5')) ||
      (targetModel.includes('17t pro') && m.includes('17t pro'))
    );
  });
  if (byModel) return byModel;

  // 3. Si la auditoría ya tenía las posiciones reajustadas
  const bySamePos = mesa1Positions.find((p) => {
    const m = (p.modeloOficial || '').trim().toLowerCase();
    return (
      p.posicionNumero === pos.posicionNumero &&
      (m === targetModel || (isWatchS5 && m.includes('watch s5')))
    );
  });
  return bySamePos;
};

/**
 * Determina si una posición del planograma requiere instalar / verificar un dispositivo en "Nueva Implantación"
 * para la campaña activa "Lanzamiento Xiaomi 18 Pro Max":
 * - P01 a P04: Los 4 terminales Xiaomi 18 Pro Max y Xiaomi 18 Pro (según si son LDU o Dummy en esa tienda).
 * - P05 (si lleva Xiaomi Clip): Xiaomi Clip (Dummy).
 * - En Table 1: el puesto del Xiaomi Watch 5 (P08 con Clip, P07 sin Clip) que se instala/reubica sustituyendo a la Xiaomi Smart Band 10 Pro.
 * - Resto de posiciones: se mantienen de la Auditoría Completa (no requieren volver a meter IMEI).
 */
export const getSwapAssignmentForPosition = (
  pos: PlanogramPosition
): SwapCampaignAssignment | null => {
  const isMesa1Cara1 =
    pos.mesaId.toUpperCase().includes('MESA 1') &&
    (pos.mesaId.includes('Cara 1') || pos.cara === 'Cara 1');

  if (!isMesa1Cara1) return null;

  const modelLower = (pos.modeloOficial || '').trim().toLowerCase();

  if (pos.posicionNumero === 1 && modelLower.includes('18 pro max')) {
    return {
      posicionId: pos.id,
      mesaId: pos.mesaId,
      posicionNumero: 1,
      categoria: 'Smartphone',
      modeloSaliente: 'Xiaomi 17 Ultra Green',
      esDummySaliente: true,
      modeloEntrante: 'Xiaomi 18 Pro Max',
      esDummyEntrante: Boolean(pos.esDummy)
    };
  }
  if (pos.posicionNumero === 2 && modelLower.includes('18 pro max')) {
    return {
      posicionId: pos.id,
      mesaId: pos.mesaId,
      posicionNumero: 2,
      categoria: 'Smartphone',
      modeloSaliente: 'Xiaomi 17 Blue',
      esDummySaliente: true,
      modeloEntrante: 'Xiaomi 18 Pro Max',
      esDummyEntrante: Boolean(pos.esDummy)
    };
  }
  if (pos.posicionNumero === 3 && modelLower.includes('18 pro')) {
    return {
      posicionId: pos.id,
      mesaId: pos.mesaId,
      posicionNumero: 3,
      categoria: 'Smartphone',
      modeloSaliente: 'Xiaomi 17 Ultra Black',
      esDummySaliente: false,
      modeloEntrante: 'Xiaomi 18 Pro',
      esDummyEntrante: Boolean(pos.esDummy)
    };
  }
  if (pos.posicionNumero === 4 && modelLower.includes('18 pro')) {
    return {
      posicionId: pos.id,
      mesaId: pos.mesaId,
      posicionNumero: 4,
      categoria: 'Smartphone',
      modeloSaliente: 'Xiaomi 17 Black',
      esDummySaliente: false,
      modeloEntrante: 'Xiaomi 18 Pro',
      esDummyEntrante: Boolean(pos.esDummy)
    };
  }
  if (pos.posicionNumero === 5 && modelLower.includes('xiaomi clip')) {
    return {
      posicionId: pos.id,
      mesaId: pos.mesaId,
      posicionNumero: 5,
      categoria: 'Audio',
      modeloSaliente: 'Xiaomi Buds 6',
      esDummySaliente: true,
      modeloEntrante: 'Xiaomi Clip',
      esDummyEntrante: true
    };
  }
  // En Table 1: el Xiaomi Watch 5 se instala/reubica en el bloque central (P08 con Clip, P07 sin Clip) sustituyendo a la Smart Band 10 Pro
  if (modelLower === 'xiaomi watch 5') {
    return {
      posicionId: pos.id,
      mesaId: pos.mesaId,
      posicionNumero: pos.posicionNumero,
      categoria: 'Wearable',
      modeloSaliente: 'Xiaomi Smart Band 10 Pro',
      esDummySaliente: false,
      modeloEntrante: 'Xiaomi Watch 5',
      esDummyEntrante: false
    };
  }

  // El resto de dispositivos se mantienen igual respecto a la Auditoría Completa
  return null;
};

/**
 * Obtiene todas las posiciones asignadas al Swap de la campaña activa en una tienda.
 */
export const getAllSwapAssignmentsForStore = (store: StoreCenter): SwapCampaignAssignment[] => {
  const positions = getImplantationPositionsForMesa1Cara1(store);
  const list: SwapCampaignAssignment[] = [];
  positions.forEach((pos) => {
    const assignment = getSwapAssignmentForPosition(pos);
    if (assignment) {
      list.push(assignment);
    }
  });
  return list;
};

/**
 * Construye el registro de Auditoría Completa actualizado automáticamente tras finalizar y enviar
 * la "Nueva Implantación":
 * - Mesa 1 Cara 1: guarda los nuevos dispositivos instalados con sus IMEIs/estados y los dispositivos que se mantienen conservando su IMEI y reajustando su número de posición (11 puestos si lleva Xiaomi Clip, 10 puestos si no lleva Xiaomi Clip).
 * - Mesa 1 Cara 2: conserva sus dispositivos e IMEIs reajustando su número de posición correlativo a continuación de Cara 1 (desde P12 si Cara 1 tiene 11 puestos, o desde P11 si Cara 1 tiene 10 puestos).
 * - Resto de mesas y espacios (Mesa 2, Mesa 3, Wall, MiniWall, Lineal Smartwatch): se mantienen intactos de la auditoría completa previa.
 */
export const buildFullAuditRecordFromImplantation = (
  store: StoreCenter,
  currentUser: UserProfile,
  consolidatedSwaps: PositionSwapState[],
  fechaHora: string,
  baseAudit?: AuditRecord | null
): AuditRecord => {
  const m1c1Positions = getImplantationPositionsForMesa1Cara1(store);
  const newMesa1Cara1AuditPositions: PositionAuditState[] = m1c1Positions.map((pos) => {
    const swap = consolidatedSwaps.find((s) => s.posicionNumero === pos.posicionNumero);
    const officialPosId = `${store.tipoEspacioId}-MESA_1_·_Cara_1-P${pos.posicionNumero}`;

    if (swap) {
      const isDummy = Boolean(swap.esDummyNuevo);
      const cleanImei = isDummy
        ? '-'
        : swap.imeiNuevo && swap.imeiNuevo !== 'DUMMY'
        ? swap.imeiNuevo
        : '-';
      return {
        posicionId: officialPosId,
        mesaId: 'MESA 1 · Cara 1',
        posicionNumero: pos.posicionNumero,
        modeloOficial: pos.modeloOficial,
        modeloDetectado: pos.modeloOficial,
        imeiSerial: cleanImei,
        estadoPosicion: swap.estadoSwap === 'Incidencia' ? ('Incidencia' as const) : ('OK' as const),
        tipoIncidencia: swap.motivoIncidencia ? ('Otro' as const) : undefined,
        esMaqueta: isDummy,
        comentarios: swap.motivoIncidencia
          ? `Incidencia en Nueva Implantación: ${swap.motivoIncidencia}`
          : 'Actualizado desde Nueva Implantación (Lanzamiento Xiaomi 18 Pro Max)',
        fotoEvidenciaUrl: swap.fotoInUrl,
        auditadoPor: currentUser.nombre,
        fechaHora
      };
    }

    // Posiciones que se mantienen de la auditoría completa previa con su IMEI original y nuevo número de posición
    const kept = findKeptDeviceStateFromAudit(pos, baseAudit);
    const isDummy = pos.esDummy;
    const preservedImei = isDummy
      ? '-'
      : kept?.imeiSerial && kept.imeiSerial !== '-' && kept.imeiSerial !== 'DUMMY'
      ? kept.imeiSerial
      : 'Verificado en Auditoría Completa';

    return {
      posicionId: officialPosId,
      mesaId: 'MESA 1 · Cara 1',
      posicionNumero: pos.posicionNumero,
      modeloOficial: pos.modeloOficial,
      modeloDetectado: pos.modeloOficial,
      imeiSerial: preservedImei,
      estadoPosicion: kept?.estadoPosicion === 'Incidencia' ? ('Incidencia' as const) : ('OK' as const),
      tipoIncidencia: kept?.tipoIncidencia,
      esMaqueta: isDummy,
      comentarios: kept?.comentarios || 'Mantenido de Auditoría Completa (Posición reajustada automáticamente)',
      fotoEvidenciaUrl: kept?.fotoEvidenciaUrl,
      auditadoPor: kept?.auditadoPor || currentUser.nombre,
      fechaHora: kept?.fechaHora || fechaHora
    };
  });

  // Posiciones de Mesa 1 Cara 2 de la auditoría completa previa: reajustar su número de posición correlativo después de Cara 1
  const startCara2Pos = m1c1Positions.length + 1; // 12 si Cara 1 tiene 11 puestos, 11 si Cara 1 tiene 10 puestos
  const basePositions = baseAudit?.positions || [];
  const baseMesa1Cara2 = basePositions
    .filter((p) => {
      const m = (p.mesaId || '').toUpperCase();
      const id = (p.posicionId || '').toUpperCase();
      const isMesa1 = m.includes('MESA 1') || m.includes('TABLE 1') || id.includes('MESA_1');
      const isCara2 = m.includes('CARA 2') || id.includes('CARA_2');
      return isMesa1 && isCara2;
    })
    .sort((a, b) => a.posicionNumero - b.posicionNumero);

  const updatedMesa1Cara2Positions: PositionAuditState[] = baseMesa1Cara2.map((p, idx) => {
    const newPosNum = startCara2Pos + idx;
    return {
      ...p,
      posicionId: `${store.tipoEspacioId}-MESA_1_·_Cara_2-P${newPosNum}`,
      mesaId: 'MESA 1 · Cara 2',
      posicionNumero: newPosNum
    };
  });

  // Resto de espacios (Mesa 2, Mesa 3, Wall, MiniWall, Lineal Smartwatch) se conservan intactos
  const otherSpacesPositions = basePositions.filter((p) => {
    const m = (p.mesaId || '').toUpperCase();
    const id = (p.posicionId || '').toUpperCase();
    const isMesa1 = m.includes('MESA 1') || m.includes('TABLE 1') || id.includes('MESA_1');
    return !isMesa1;
  });

  const allMergedPositions: PositionAuditState[] = [
    ...newMesa1Cara1AuditPositions,
    ...updatedMesa1Cara2Positions,
    ...otherSpacesPositions
  ];

  const okCount = allMergedPositions.filter((p) => p.estadoPosicion === 'OK').length;
  const incidenciasCount = allMergedPositions.filter((p) => p.estadoPosicion === 'Incidencia').length;
  const pendientesCount = Math.max(0, allMergedPositions.length - okCount - incidenciasCount);

  return {
    auditId: `AUD_${store.tiendaId}_IMP_FULL_${Date.now()}`,
    tiendaId: store.tiendaId,
    nombreTienda: store.nombreTienda,
    retailer: store.retailer,
    usuarioEmail: currentUser.email,
    usuarioNombre: currentUser.nombre,
    fechaHora,
    totalPosiciones: allMergedPositions.length,
    okCount,
    incidenciasCount,
    pendientesCount,
    positions: allMergedPositions,
    sincronizadoSheets: false
  };
};

/**
 * Obtiene los elementos de "POSM" oficiales (Lonas, Duratrans, Columna, Luminoso y Cubrecestas)
 * que deben intervenirse en la tienda durante la Nueva Implantación según el Excel maestro.
 */
export const getVisualElementsForStore = (store: StoreCenter): VisualElementDefinition[] => {
  if (hasActiveImplantationCampaign(store)) {
    return getDynamicPosmDefinitionsForImplantation(store);
  }
  return [];
};

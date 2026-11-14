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
import { getPositionsForSpace } from './defaultData';
import { getDynamicPosmDefinitionsForImplantation } from './storePosmData';

export const ACTIVE_IMPLANTATION_CAMPAIGN = 'Lanzamiento Xiaomi 18 Pro Max';
export const EXCLUSIVE_DRIVE_TEST_EMAIL = '';

/**
 * 12 Tiendas asignadas al nuevo planograma oficial de Mesa 1 Cara 1 ("Lanzamiento Xiaomi 18 Pro Max"):
 * - Media Barcelona 5 Fontanella (MIESD00174)
 * - Media Diagonal Mar (MIESS00026)
 * - Media El Prat (MIESD00175)
 * - Media Girona (MIESD00182)
 * - Media Lleida (MIESD00187)
 * - Media Maquinista (MIESD00176)
 * - Media Manresa
 * - Media Mataro (MIESD00177)
 * - Media Parets (MIESD00178)
 * - Media Sant Cugat (MIESD00180)
 * - Media Tarragona (MIESO00043)
 * - Media Vilanova (MIESD02181)
 */
export const TARGET_X18_M1C1_STORE_IDS = new Set([
  'MIESD00174', // Media Barcelona 5 Fontanella
  'MIESS00026', // Media Diagonal Mar-Barcelona
  'MIESD00175', // Media El Prat
  'MIESD00182', // Media Girona
  'MIESD00187', // Media Lleida
  'MIESD00176', // Media Maquinista
  'MIESD00177', // Media Mataro
  'MIESD00178', // Media Parets
  'MIESD00180', // Media Sant Cugat (Barcelona)
  'MIESO00043', // Media Tarragona
  'MIESD02181'  // Media Vilanova
]);

export const isTargetX18Mesa1Cara1Store = (storeOrId?: StoreCenter | string): boolean => {
  if (!storeOrId) return false;
  if (typeof storeOrId === 'string') {
    const cleanId = storeOrId.trim().toUpperCase();
    if (TARGET_X18_M1C1_STORE_IDS.has(cleanId)) return true;
    const norm = storeOrId
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
    return (
      norm.includes('fontanella') ||
      norm.includes('diagonal mar') ||
      norm.includes('el prat') ||
      (norm.includes('media girona') && !norm.includes('girona 2') && !norm.includes('girona 3')) ||
      norm.includes('lleida') ||
      norm.includes('maquinista') ||
      norm.includes('manresa') ||
      norm.includes('mataro') ||
      norm.includes('parets') ||
      norm.includes('sant cugat') ||
      norm.includes('tarragona') ||
      norm.includes('vilanova')
    );
  }

  const cleanId = (storeOrId.tiendaId || '').trim().toUpperCase();
  if (TARGET_X18_M1C1_STORE_IDS.has(cleanId)) return true;

  const normName = (storeOrId.nombreTienda || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  return (
    normName.includes('fontanella') ||
    normName.includes('diagonal mar') ||
    normName.includes('el prat') ||
    (normName.includes('media girona') && !normName.includes('girona 2') && !normName.includes('girona 3')) ||
    normName.includes('lleida') ||
    normName.includes('maquinista') ||
    normName.includes('manresa') ||
    normName.includes('mataro') ||
    normName.includes('parets') ||
    normName.includes('sant cugat') ||
    normName.includes('tarragona') ||
    normName.includes('vilanova')
  );
};

/**
 * Determina si una tienda tiene activa la campaña de Nueva Implantación ("Lanzamiento Xiaomi 18 Pro Max").
 * Activa tanto para espacios de 1 Table (Table 1, FNAC, CRF, Alcampo) como de 2 Tables (Table 2, Table 3, MediaMarkt Tarragona).
 */
export const hasActiveImplantationCampaign = (store: StoreCenter): boolean => {
  const spaceType = (store.tipoEspacioId || '').trim().toLowerCase();
  return (
    isTargetX18Mesa1Cara1Store(store) ||
    spaceType.includes('table') ||
    spaceType.includes('mesa') ||
    store.tiendaId.toUpperCase() === 'MIESO00043' ||
    Boolean(store.availableSpaces?.some((s) => s.toUpperCase().includes('MESA 1')))
  );
};

/**
 * Determina si una tienda es de formato 2 mesas (Table 2 / Table 3 / MediaMarkt Tarragona)
 */
export const isTwoTableSpace = (storeOrSpace?: StoreCenter | string): boolean => {
  if (!storeOrSpace) return false;
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
 * 11 Posiciones oficiales de la nueva implantación para Mesa 1 Cara 1 ("Lanzamiento Xiaomi 18 Pro Max")
 * Según guía visual oficial:
 * - P01: Xiaomi 18 Pro Max (LDU) [Nuevo]
 * - P02: Xiaomi 18 Pro Max (LDU) [Nuevo]
 * - P03: Xiaomi 18 Pro (LDU) [Nuevo]
 * - P04: Xiaomi 18 Pro (LDU) [Nuevo]
 * - P05: Xiaomi Clip (DUMMY) [Nuevo]
 * - P06: Xiaomi 17T Pro Blue (LDU) [Se mantiene de Auditoría Completa, antes P07]
 * - P07: Xiaomi Watch S5 46mm (LDU) [Se mantiene de Auditoría Completa, antes P08]
 * - P08: Xiaomi Smart Band 10 Pro (LDU) [Se mantiene de Auditoría Completa, antes P09]
 * - P09: Xiaomi 17T Purple (LDU) [Se mantiene de Auditoría Completa, antes P10]
 * - P10: Xiaomi 17T Blue (DUMMY) [Se mantiene de Auditoría Completa, antes P11]
 * - P11: Xiaomi Smart Band 11 Active (LDU) [Se mantiene de Auditoría Completa, antes P12]
 */
export const X18_IMPLANTATION_M1_C1_ITEMS: Array<{
  pos: number;
  device: string;
  color: string;
  dummy: boolean;
  category: ProductCategory;
  pinX: number;
  pinY: number;
  isNewInstall: boolean;
  previousPosNum?: number;
}> = [
  { pos: 1, device: 'Xiaomi 18 Pro Max', color: 'Red / Burgundy', dummy: false, category: 'Smartphone', pinX: 16.5, pinY: 45.5, isNewInstall: true },
  { pos: 2, device: 'Xiaomi 18 Pro Max', color: 'Red / Burgundy', dummy: false, category: 'Smartphone', pinX: 21.0, pinY: 45.5, isNewInstall: true },
  { pos: 3, device: 'Xiaomi 18 Pro', color: 'Purple / Blue', dummy: false, category: 'Smartphone', pinX: 29.5, pinY: 45.5, isNewInstall: true },
  { pos: 4, device: 'Xiaomi 18 Pro', color: 'Purple / Blue', dummy: false, category: 'Smartphone', pinX: 34.0, pinY: 45.5, isNewInstall: true },
  { pos: 5, device: 'Xiaomi Clip', color: 'Black (Maqueta)', dummy: true, category: 'Audio', pinX: 43.5, pinY: 45.5, isNewInstall: true },
  { pos: 6, device: 'Xiaomi 17T Pro Blue', color: 'Blue', dummy: false, category: 'Smartphone', pinX: 54.4, pinY: 45.5, isNewInstall: false, previousPosNum: 7 },
  { pos: 7, device: 'Xiaomi Watch S5 46mm', color: 'Black', dummy: false, category: 'Wearable', pinX: 59.3, pinY: 45.5, isNewInstall: false, previousPosNum: 8 },
  { pos: 8, device: 'Xiaomi Smart Band 10 Pro', color: 'Black', dummy: false, category: 'Wearable', pinX: 63.8, pinY: 45.5, isNewInstall: false, previousPosNum: 9 },
  { pos: 9, device: 'Xiaomi 17T Purple', color: 'Purple', dummy: false, category: 'Smartphone', pinX: 75.0, pinY: 45.5, isNewInstall: false, previousPosNum: 10 },
  { pos: 10, device: 'Xiaomi 17T Blue', color: 'Blue (Maqueta)', dummy: true, category: 'Smartphone', pinX: 79.8, pinY: 45.5, isNewInstall: false, previousPosNum: 11 },
  { pos: 11, device: 'Xiaomi Smart Band 11 Active', color: 'Black', dummy: false, category: 'Wearable', pinX: 84.8, pinY: 45.5, isNewInstall: false, previousPosNum: 12 }
];

export const getImplantationPositionsForMesa1Cara1 = (store: StoreCenter): PlanogramPosition[] => {
  return X18_IMPLANTATION_M1_C1_ITEMS.map((item) => ({
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
 * 6 Dispositivos a retirar de Mesa 1 Cara 1 (desde Xiaomi 17 Ultra Green hasta Xiaomi Buds 6)
 * El resto de dispositivos (P07 a P12 del planograma anterior) se mantiene en la mesa actualizando su posición a P06..P11.
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
    sustituidoPor: 'Xiaomi 18 Pro Max (LDU P01)'
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
    sustituidoPor: 'Xiaomi 18 Pro Max (LDU P02)'
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
    sustituidoPor: 'Xiaomi 18 Pro (LDU P03)'
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
    sustituidoPor: 'Xiaomi 18 Pro (LDU P04)'
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
    sustituidoPor: 'Xiaomi Clip (DUMMY P05)'
  },
  {
    id: 'RET-T2-M1C1-P6',
    posicionAnterior: 6,
    mesaId: 'MESA 1',
    cara: 'Cara 1',
    modeloSaliente: 'Xiaomi Buds 6',
    esDummy: true,
    categoria: 'Audio',
    motivoRetirada: 'Fin de campaña (Sustituido por Xiaomi Clip)',
    sustituidoPor: 'Xiaomi Clip (DUMMY P05)'
  }
];

/**
 * Dispositivos a devolver para espacios de 1 TABLE (Table 1)
 */
export const RETURN_DEVICES_TABLE1_M1C1: DeviceReturnPlanItem[] = RETURN_DEVICES_TABLE2_M1C1;

export const BASE_RETURN_DEVICES_M1C1 = RETURN_DEVICES_TABLE2_M1C1;

/**
 * Obtiene los dispositivos a retirar, enlazando los IMEIs memorizados de la última auditoría completa previa
 */
export const getReturnDevicesForStore = (
  store: StoreCenter,
  latestAudit?: AuditRecord | null
): DeviceReturnState[] => {
  const baseList = RETURN_DEVICES_TABLE2_M1C1;

  // Posiciones correspondientes a Mesa 1 del último reporte de auditoría completa previa
  const mesa1Positions = (latestAudit?.positions || []).filter((p) => {
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

    // 2. Coincidencia exacta de nombre de modelo en Mesa 1 Cara 1 o en Mesa 1 (p.ej. Table 3 Diagonal Mar / Girona)
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
 * en Mesa 1 Cara 1 (P06 a P11, que antes eran P07 a P12).
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

  // 1. Buscar en la posición anterior equivalente (pos.posicionNumero + 1, p.ej. P06 era P07, P11 era P12)
  const expectedOldPos = pos.posicionNumero + 1;
  const byOldPosAndModel = mesa1Positions.find((p) => {
    const m = (p.modeloOficial || '').trim().toLowerCase();
    const matchesModel =
      m === targetModel ||
      (isWatchS5 && m.includes('watch s5')) ||
      (targetModel.includes('17t pro') && m.includes('17t pro'));
    return p.posicionNumero === expectedOldPos && matchesModel;
  });
  if (byOldPosAndModel) return byOldPosAndModel;

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

  // 3. Si la auditoría ya tenía las posiciones reajustadas (P06..P11)
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
 * Determina si una posición del planograma requiere instalar un nuevo dispositivo en "Nueva Implantación"
 * para la campaña activa "Lanzamiento Xiaomi 18 Pro Max".
 * Solo intervienen los 5 nuevos modelos a instalar en Mesa 1 Cara 1 (P01 a P05).
 * Los modelos de P06 a P11 se mantienen igual respecto a la Auditoría Completa (solo actualizan su número de posición).
 */
export const getSwapAssignmentForPosition = (
  pos: PlanogramPosition
): SwapCampaignAssignment | null => {
  const isMesa1Cara1 =
    pos.mesaId.toUpperCase().includes('MESA 1') &&
    (pos.mesaId.includes('Cara 1') || pos.cara === 'Cara 1');

  if (!isMesa1Cara1) return null;

  if (pos.posicionNumero === 1) {
    return {
      posicionId: pos.id,
      mesaId: pos.mesaId,
      posicionNumero: 1,
      categoria: 'Smartphone',
      modeloSaliente: 'Xiaomi 17 Ultra Green',
      esDummySaliente: true,
      modeloEntrante: 'Xiaomi 18 Pro Max',
      esDummyEntrante: false
    };
  }
  if (pos.posicionNumero === 2) {
    return {
      posicionId: pos.id,
      mesaId: pos.mesaId,
      posicionNumero: 2,
      categoria: 'Smartphone',
      modeloSaliente: 'Xiaomi 17 Blue',
      esDummySaliente: true,
      modeloEntrante: 'Xiaomi 18 Pro Max',
      esDummyEntrante: false
    };
  }
  if (pos.posicionNumero === 3) {
    return {
      posicionId: pos.id,
      mesaId: pos.mesaId,
      posicionNumero: 3,
      categoria: 'Smartphone',
      modeloSaliente: 'Xiaomi 17 Ultra Black',
      esDummySaliente: false,
      modeloEntrante: 'Xiaomi 18 Pro',
      esDummyEntrante: false
    };
  }
  if (pos.posicionNumero === 4) {
    return {
      posicionId: pos.id,
      mesaId: pos.mesaId,
      posicionNumero: 4,
      categoria: 'Smartphone',
      modeloSaliente: 'Xiaomi 17 Black',
      esDummySaliente: false,
      modeloEntrante: 'Xiaomi 18 Pro',
      esDummyEntrante: false
    };
  }
  if (pos.posicionNumero === 5) {
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

  // P06 a P11 se mantienen igual respecto a la Auditoría Completa: no requieren volver a poner IMEI
  return null;
};

/**
 * Obtiene todas las posiciones asignadas al Swap de la campaña activa en una tienda.
 * Limitado exclusivamente a Mesa 1 Cara 1 (P01 a P05).
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
 * - P01 a P05 (Mesa 1 Cara 1): nuevos dispositivos instalados con sus IMEIs/estados.
 * - P06 a P11 (Mesa 1 Cara 1): dispositivos que se mantienen de la auditoría completa previa, conservando su IMEI y reajustando su posición de P07..P12 a P06..P11.
 * - P12 en adelante (Mesa 1 Cara 2): dispositivos de Cara 2 conservando su IMEI y reajustando su número de posición (-1, de P13..P23 a P12..P22) al pasar Cara 1 de 12 a 11 dispositivos.
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

    // Posiciones P06 a P11: se mantienen de la auditoría completa previa con su IMEI original y nueva posición P06..P11
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

  // Posiciones de Mesa 1 Cara 2 de la auditoría completa previa: reajustar su número de posición a correlativo desde P12 (P12, P13, ...)
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
    // Si empezaban en P13 (porque Cara 1 tenía 12 puestos), ahora empiezan en P12 (porque Cara 1 tiene 11 puestos)
    const newPosNum = p.posicionNumero >= 13 ? p.posicionNumero - 1 : 12 + idx;
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
 * Obtiene los elementos de "POSM" oficiales (Lonas, Duratrans y Columna)
 * que deben intervenirse en la tienda durante la Nueva Implantación.
 * 
 * Se limita exclusivamente según especificación oficial a:
 * - Tiendas con lona Xiaomi 17 Ultra (Wall o Miniwall) -> cambio a Xiaomi 18 Series.
 * - Tiendas con duratrans (Top Table) -> la franja que pertenece a Xiaomi 17 Ultra se modifica por Xiaomi 18 Series.
 * - Tiendas con columna -> la cara de Xiaomi 17 Ultra se modifica a Xiaomi 18 Series.
 */
export const getVisualElementsForStore = (store: StoreCenter): VisualElementDefinition[] => {
  if (hasActiveImplantationCampaign(store)) {
    return getDynamicPosmDefinitionsForImplantation(store);
  }
  return [];
};

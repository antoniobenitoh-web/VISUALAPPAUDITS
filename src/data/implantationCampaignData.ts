import {
  AuditRecord,
  DeviceReturnState,
  PlanogramPosition,
  ProductCategory,
  StoreCenter,
  SwapCampaignAssignment,
  VisualElementDefinition
} from '../types';
import { getPositionsForSpace } from './defaultData';

export const ACTIVE_IMPLANTATION_CAMPAIGN = 'Lanzamiento Xiaomi 18 Pro Max';
export const EXCLUSIVE_DRIVE_TEST_EMAIL = '';

/**
 * Determina si una tienda coincide en planograma con MediaMarkt Tarragona ("Table 2")
 * y por tanto tiene activa la campaña de Nueva Implantación ("Lanzamiento Xiaomi 18 Pro Max").
 */
export const hasActiveImplantationCampaign = (store: StoreCenter): boolean => {
  const spaceType = (store.tipoEspacioId || '').trim().toLowerCase();
  return spaceType === 'table 2' || store.tiendaId.toUpperCase() === 'MIESO00043';
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
 * 11 Posiciones oficiales de la nueva implantación para Mesa 1 Cara 1
 * Adaptadas según si la tienda es espacio de 2 Mesas ("Table 2") o de 1 Mesa ("Table 1").
 */
export const getImplantationPositionsForMesa1Cara1 = (store: StoreCenter): PlanogramPosition[] => {
  const isTable2 = isTwoTableSpace(store);

  if (isTable2) {
    // FORMATO ESPACIO 2 TABLES (MediaMarkt Tarragona y centros con Table 2 / Table 3)
    return [
      {
        id: `${store.tiendaId}-M1-C1-P1`,
        tipoEspacioId: store.tipoEspacioId,
        mesaId: 'MESA 1',
        cara: 'Cara 1',
        posicionNumero: 1,
        categoria: 'Smartphone',
        modeloOficial: 'Xiaomi 18 Pro Max',
        colorOficial: 'Black',
        esDummy: false,
        requiereImei: true,
        pinX: 13.4,
        pinY: 46.5
      },
      {
        id: `${store.tiendaId}-M1-C1-P2`,
        tipoEspacioId: store.tipoEspacioId,
        mesaId: 'MESA 1',
        cara: 'Cara 1',
        posicionNumero: 2,
        categoria: 'Smartphone',
        modeloOficial: 'Xiaomi 18 Pro Max',
        colorOficial: 'Green (Maqueta)',
        esDummy: true,
        requiereImei: false,
        pinX: 23.0,
        pinY: 46.5
      },
      {
        id: `${store.tiendaId}-M1-C1-P3`,
        tipoEspacioId: store.tipoEspacioId,
        mesaId: 'MESA 1',
        cara: 'Cara 1',
        posicionNumero: 3,
        categoria: 'Smartphone',
        modeloOficial: 'Xiaomi 18 Pro',
        colorOficial: 'Black',
        esDummy: false,
        requiereImei: true,
        pinX: 34.4,
        pinY: 46.5
      },
      {
        id: `${store.tiendaId}-M1-C1-P4`,
        tipoEspacioId: store.tipoEspacioId,
        mesaId: 'MESA 1',
        cara: 'Cara 1',
        posicionNumero: 4,
        categoria: 'Smartphone',
        modeloOficial: 'Xiaomi 18 Pro',
        colorOficial: 'Blue (Maqueta)',
        esDummy: true,
        requiereImei: false,
        pinX: 44.1,
        pinY: 46.5
      },
      {
        id: `${store.tiendaId}-M1-C1-P5`,
        tipoEspacioId: store.tipoEspacioId,
        mesaId: 'MESA 1',
        cara: 'Cara 1',
        posicionNumero: 5,
        categoria: 'Smartphone',
        modeloOficial: 'Xiaomi 17T Pro',
        colorOficial: 'Blue',
        esDummy: false,
        requiereImei: true,
        pinX: 52.9,
        pinY: 46.5
      },
      {
        id: `${store.tiendaId}-M1-C1-P6`,
        tipoEspacioId: store.tipoEspacioId,
        mesaId: 'MESA 1',
        cara: 'Cara 1',
        posicionNumero: 6,
        categoria: 'Wearable',
        modeloOficial: 'Xiaomi Watch S5 46MM',
        colorOficial: 'Black',
        esDummy: false,
        requiereImei: true,
        pinX: 58.0,
        pinY: 46.5
      },
      {
        id: `${store.tiendaId}-M1-C1-P7`,
        tipoEspacioId: store.tipoEspacioId,
        mesaId: 'MESA 1',
        cara: 'Cara 1',
        posicionNumero: 7,
        categoria: 'Wearable',
        modeloOficial: 'Xiaomi Watch S5 41MM',
        colorOficial: 'Silver',
        esDummy: false,
        requiereImei: true,
        pinX: 62.8,
        pinY: 46.5
      },
      {
        id: `${store.tiendaId}-M1-C1-P8`,
        tipoEspacioId: store.tipoEspacioId,
        mesaId: 'MESA 1',
        cara: 'Cara 1',
        posicionNumero: 8,
        categoria: 'Audio',
        modeloOficial: 'Xiaomi Clip',
        colorOficial: 'Black',
        esDummy: false,
        requiereImei: true,
        pinX: 68.5,
        pinY: 46.5
      },
      {
        id: `${store.tiendaId}-M1-C1-P9`,
        tipoEspacioId: store.tipoEspacioId,
        mesaId: 'MESA 1',
        cara: 'Cara 1',
        posicionNumero: 9,
        categoria: 'Smartphone',
        modeloOficial: 'Xiaomi 17T',
        colorOficial: 'Purple',
        esDummy: false,
        requiereImei: true,
        pinX: 74.8,
        pinY: 46.5
      },
      {
        id: `${store.tiendaId}-M1-C1-P10`,
        tipoEspacioId: store.tipoEspacioId,
        mesaId: 'MESA 1',
        cara: 'Cara 1',
        posicionNumero: 10,
        categoria: 'Wearable',
        modeloOficial: 'Xiaomi Smart Band 11',
        colorOficial: 'Black',
        esDummy: false,
        requiereImei: true,
        pinX: 81.4,
        pinY: 46.5
      },
      {
        id: `${store.tiendaId}-M1-C1-P11`,
        tipoEspacioId: store.tipoEspacioId,
        mesaId: 'MESA 1',
        cara: 'Cara 1',
        posicionNumero: 11,
        categoria: 'Wearable',
        modeloOficial: 'Xiaomi Smart Band 11 Active',
        colorOficial: 'Black',
        esDummy: false,
        requiereImei: true,
        pinX: 87.9,
        pinY: 46.5
      }
    ];
  }

  // FORMATO ESPACIO 1 TABLE (Table 1, Table FNAC, Table CRF, Table Alcampo)
  return [
    {
      id: `${store.tiendaId}-M1-C1-P1`,
      tipoEspacioId: store.tipoEspacioId,
      mesaId: 'MESA 1',
      cara: 'Cara 1',
      posicionNumero: 1,
      categoria: 'Smartphone',
      modeloOficial: 'Xiaomi 18 Pro Max',
      colorOficial: 'Black',
      esDummy: false,
      requiereImei: true,
      pinX: 13.5,
      pinY: 46.5
    },
    {
      id: `${store.tiendaId}-M1-C1-P2`,
      tipoEspacioId: store.tipoEspacioId,
      mesaId: 'MESA 1',
      cara: 'Cara 1',
      posicionNumero: 2,
      categoria: 'Smartphone',
      modeloOficial: 'Xiaomi 18 Pro Max',
      colorOficial: 'Green (Maqueta)',
      esDummy: true,
      requiereImei: false,
      pinX: 23.1,
      pinY: 46.5
    },
    {
      id: `${store.tiendaId}-M1-C1-P3`,
      tipoEspacioId: store.tipoEspacioId,
      mesaId: 'MESA 1',
      cara: 'Cara 1',
      posicionNumero: 3,
      categoria: 'Smartphone',
      modeloOficial: 'Xiaomi 18 Pro',
      colorOficial: 'Black',
      esDummy: false,
      requiereImei: true,
      pinX: 34.5,
      pinY: 46.5
    },
    {
      id: `${store.tiendaId}-M1-C1-P4`,
      tipoEspacioId: store.tipoEspacioId,
      mesaId: 'MESA 1',
      cara: 'Cara 1',
      posicionNumero: 4,
      categoria: 'Smartphone',
      modeloOficial: 'Xiaomi 18 Pro',
      colorOficial: 'Blue (Maqueta)',
      esDummy: true,
      requiereImei: false,
      pinX: 44.2,
      pinY: 46.5
    },
    {
      id: `${store.tiendaId}-M1-C1-P5`,
      tipoEspacioId: store.tipoEspacioId,
      mesaId: 'MESA 1',
      cara: 'Cara 1',
      posicionNumero: 5,
      categoria: 'Smartphone',
      modeloOficial: 'Xiaomi 17T Pro',
      colorOficial: 'Blue',
      esDummy: false,
      requiereImei: true,
      pinX: 52.9,
      pinY: 46.5
    },
    {
      id: `${store.tiendaId}-M1-C1-P6`,
      tipoEspacioId: store.tipoEspacioId,
      mesaId: 'MESA 1',
      cara: 'Cara 1',
      posicionNumero: 6,
      categoria: 'Smartphone',
      modeloOficial: 'Xiaomi 17T',
      colorOficial: 'Purple',
      esDummy: false,
      requiereImei: true,
      pinX: 58.6,
      pinY: 46.5
    },
    {
      id: `${store.tiendaId}-M1-C1-P7`,
      tipoEspacioId: store.tipoEspacioId,
      mesaId: 'MESA 1',
      cara: 'Cara 1',
      posicionNumero: 7,
      categoria: 'Wearable',
      modeloOficial: 'Xiaomi Band 11',
      colorOficial: 'Black',
      esDummy: false,
      requiereImei: true,
      pinX: 62.7,
      pinY: 46.5
    },
    {
      id: `${store.tiendaId}-M1-C1-P8`,
      tipoEspacioId: store.tipoEspacioId,
      mesaId: 'MESA 1',
      cara: 'Cara 1',
      posicionNumero: 8,
      categoria: 'Audio',
      modeloOficial: 'Xiaomi Clip',
      colorOficial: 'Black',
      esDummy: false,
      requiereImei: true,
      pinX: 67.5,
      pinY: 46.5
    },
    {
      id: `${store.tiendaId}-M1-C1-P9`,
      tipoEspacioId: store.tipoEspacioId,
      mesaId: 'MESA 1',
      cara: 'Cara 1',
      posicionNumero: 9,
      categoria: 'Smartphone',
      modeloOficial: 'Redmi Note 17 Pro Max',
      colorOficial: 'Black',
      esDummy: false,
      requiereImei: true,
      pinX: 74.5,
      pinY: 46.5
    },
    {
      id: `${store.tiendaId}-M1-C1-P10`,
      tipoEspacioId: store.tipoEspacioId,
      mesaId: 'MESA 1',
      cara: 'Cara 1',
      posicionNumero: 10,
      categoria: 'Smartphone',
      modeloOficial: 'Redmi Note 17 Pro Max',
      colorOficial: 'Green (Maqueta)',
      esDummy: true,
      requiereImei: false,
      pinX: 81.0,
      pinY: 46.5
    },
    {
      id: `${store.tiendaId}-M1-C1-P11`,
      tipoEspacioId: store.tipoEspacioId,
      mesaId: 'MESA 1',
      cara: 'Cara 1',
      posicionNumero: 11,
      categoria: 'Smartphone',
      modeloOficial: 'Redmi Note 17 Pro Max',
      colorOficial: 'White & Orange',
      esDummy: false,
      requiereImei: true,
      pinX: 87.2,
      pinY: 46.5
    }
  ];
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
 * Dispositivos a devolver para espacios de 2 TABLES (Table 2 - MediaMarkt Tarragona etc.)
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
    sustituidoPor: 'Xiaomi 18 Pro Max (Maqueta)'
  },
  {
    id: 'RET-T2-M1C1-P2',
    posicionAnterior: 2,
    mesaId: 'MESA 1',
    cara: 'Cara 1',
    modeloSaliente: 'Xiaomi 17 Blue',
    esDummy: true,
    categoria: 'Smartphone',
    motivoRetirada: 'Fin de campaña (Sustituido por Xiaomi 18 Pro)',
    sustituidoPor: 'Xiaomi 18 Pro (Maqueta)'
  },
  {
    id: 'RET-T2-M1C1-P3',
    posicionAnterior: 3,
    mesaId: 'MESA 1',
    cara: 'Cara 1',
    modeloSaliente: 'Xiaomi 17 Ultra Black',
    esDummy: false,
    categoria: 'Smartphone',
    motivoRetirada: 'Fin de campaña (Sustituido por Xiaomi 18 Pro Max)',
    sustituidoPor: 'Xiaomi 18 Pro Max (LDU)'
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
    sustituidoPor: 'Xiaomi 18 Pro (LDU)'
  },
  {
    id: 'RET-T2-M1C1-P5',
    posicionAnterior: 5,
    mesaId: 'MESA 1',
    cara: 'Cara 1',
    modeloSaliente: 'Xiaomi Watch 5',
    esDummy: false,
    categoria: 'Wearable',
    motivoRetirada: 'Desmontaje de mesa (Sustituido por Watch S5 46MM)',
    sustituidoPor: 'Xiaomi Watch S5 46MM (LDU)'
  },
  {
    id: 'RET-T2-M1C1-P6',
    posicionAnterior: 6,
    mesaId: 'MESA 1',
    cara: 'Cara 1',
    modeloSaliente: 'Xiaomi Buds 6',
    esDummy: true,
    categoria: 'Audio',
    motivoRetirada: 'Desmontaje de mesa (Sustituido por Xiaomi Clip)',
    sustituidoPor: 'Xiaomi Clip (LDU)'
  },
  {
    id: 'RET-T2-M1C1-P8',
    posicionAnterior: 8,
    mesaId: 'MESA 1',
    cara: 'Cara 1',
    modeloSaliente: 'Xiaomi Watch S5 45mm',
    esDummy: false,
    categoria: 'Wearable',
    motivoRetirada: 'Actualización a nueva gama (Sustituido por Watch S5 41MM)',
    sustituidoPor: 'Xiaomi Watch S5 41MM (LDU)'
  },
  {
    id: 'RET-T2-M1C1-P9',
    posicionAnterior: 9,
    mesaId: 'MESA 1',
    cara: 'Cara 1',
    modeloSaliente: 'Xiaomi Smart Band 10 Pro',
    esDummy: false,
    categoria: 'Wearable',
    motivoRetirada: 'Fin de ciclo (Sustituida por Smart Band 11)',
    sustituidoPor: 'Xiaomi Smart Band 11 (LDU)'
  },
  {
    id: 'RET-T2-M1C1-P11',
    posicionAnterior: 11,
    mesaId: 'MESA 1',
    cara: 'Cara 1',
    modeloSaliente: 'Xiaomi 17T blue',
    esDummy: true,
    categoria: 'Smartphone',
    motivoRetirada: 'Desmontaje de maqueta secundaria',
    sustituidoPor: 'Reorganización de mesa'
  }
];

/**
 * Dispositivos a devolver para espacios de 1 TABLE (Table 1)
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
    motivoRetirada: 'Fin de campaña (Sustituido por nuevo flagship)',
    sustituidoPor: 'Xiaomi 18 Pro Max (Maqueta)'
  },
  {
    id: 'RET-T1-M1C1-P2',
    posicionAnterior: 2,
    mesaId: 'MESA 1',
    cara: 'Cara 1',
    modeloSaliente: 'Xiaomi 17 Blue',
    esDummy: true,
    categoria: 'Smartphone',
    motivoRetirada: 'Fin de campaña (Sustituido por nuevo flagship)',
    sustituidoPor: 'Xiaomi 18 Pro (Maqueta)'
  },
  {
    id: 'RET-T1-M1C1-P3',
    posicionAnterior: 3,
    mesaId: 'MESA 1',
    cara: 'Cara 1',
    modeloSaliente: 'Xiaomi 17 Ultra Black',
    esDummy: false,
    categoria: 'Smartphone',
    motivoRetirada: 'Fin de campaña (Sustituido por nuevo flagship)',
    sustituidoPor: 'Xiaomi 18 Pro Max (LDU)'
  },
  {
    id: 'RET-T1-M1C1-P4',
    posicionAnterior: 4,
    mesaId: 'MESA 1',
    cara: 'Cara 1',
    modeloSaliente: 'Xiaomi 17 Black',
    esDummy: false,
    categoria: 'Smartphone',
    motivoRetirada: 'Fin de campaña (Sustituido por nuevo flagship)',
    sustituidoPor: 'Xiaomi 18 Pro (LDU)'
  },
  {
    id: 'RET-T1-M1C1-P5',
    posicionAnterior: 5,
    mesaId: 'MESA 1',
    cara: 'Cara 1',
    modeloSaliente: 'Xiaomi Watch 5',
    esDummy: false,
    categoria: 'Wearable',
    motivoRetirada: 'Desmontaje de mesa (No figura en nuevo planograma)',
    sustituidoPor: 'Reconfiguración de mesa'
  },
  {
    id: 'RET-T1-M1C1-P6',
    posicionAnterior: 6,
    mesaId: 'MESA 1',
    cara: 'Cara 1',
    modeloSaliente: 'Xiaomi Buds 6',
    esDummy: true,
    categoria: 'Audio',
    motivoRetirada: 'Desmontaje de mesa (Sustituido por nuevos accesorios)',
    sustituidoPor: 'Xiaomi Clip / Band 11'
  },
  {
    id: 'RET-T1-M1C1-P9',
    posicionAnterior: 9,
    mesaId: 'MESA 1',
    cara: 'Cara 1',
    modeloSaliente: 'Xiaomi Smart Band 10 Pro',
    esDummy: false,
    categoria: 'Wearable',
    motivoRetirada: 'Fin de campaña de accesorio',
    sustituidoPor: 'Xiaomi Band 11 (LDU)'
  }
];

export const BASE_RETURN_DEVICES_M1C1 = RETURN_DEVICES_TABLE2_M1C1;

/**
 * Obtiene los dispositivos a retirar, enlazando los IMEIs memorizados de la última auditoría vigente
 */
export const getReturnDevicesForStore = (
  store: StoreCenter,
  latestAudit?: AuditRecord | null
): DeviceReturnState[] => {
  const isTable2 = isTwoTableSpace(store);
  const baseList = isTable2 ? RETURN_DEVICES_TABLE2_M1C1 : RETURN_DEVICES_TABLE1_M1C1;

  return baseList.map((item) => {
    // Buscar si en la última auditoría existía esta posición anterior
    const prevPos = latestAudit?.positions?.find(
      (p) =>
        (p.mesaId.toUpperCase().includes('MESA 1') || p.mesaId.toUpperCase().includes('TABLE 1')) &&
        (p.posicionNumero === item.posicionAnterior ||
          p.posicionId?.endsWith(`-P${item.posicionAnterior}`) ||
          p.modeloOficial.toLowerCase().includes(item.modeloSaliente.toLowerCase().slice(0, 10)))
    );

    const imei = prevPos?.imeiSerial && prevPos.imeiSerial !== '-' ? prevPos.imeiSerial : undefined;

    return {
      id: item.id,
      posicionAnterior: item.posicionAnterior,
      mesaId: item.mesaId,
      modeloSaliente: item.modeloSaliente,
      esDummy: item.esDummy,
      categoria: item.categoria,
      motivoRetirada: item.motivoRetirada,
      sustituidoPor: item.sustituidoPor,
      imeiMemorizado: imei,
      estadoRetirada: 'Pendiente'
    };
  });
};

/**
 * Determina si una posición del planograma pertenece a la campaña activa
 * "Lanzamiento Xiaomi 18 Pro Max"
 */
export const getSwapAssignmentForPosition = (
  pos: PlanogramPosition
): SwapCampaignAssignment | null => {
  const rawModel = (pos.modeloOficial || '').trim();
  const modelLower = rawModel.toLowerCase();
  const isMesa1Cara1 =
    pos.mesaId.toUpperCase().includes('MESA 1') &&
    (pos.mesaId.includes('Cara 1') || pos.cara === 'Cara 1');

  // Mapeo para las 11 posiciones oficiales de la Nueva Implantación de Mesa 1 Cara 1
  if (isMesa1Cara1) {
    if (pos.posicionNumero === 1) {
      return {
        posicionId: pos.id,
        mesaId: pos.mesaId,
        posicionNumero: 1,
        categoria: 'Smartphone',
        modeloSaliente: 'Xiaomi 17 Ultra Black',
        esDummySaliente: false,
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
        modeloSaliente: 'Xiaomi 17 Ultra Green',
        esDummySaliente: true,
        modeloEntrante: 'Xiaomi 18 Pro Max (Maqueta)',
        esDummyEntrante: true
      };
    }
    if (pos.posicionNumero === 3) {
      return {
        posicionId: pos.id,
        mesaId: pos.mesaId,
        posicionNumero: 3,
        categoria: 'Smartphone',
        modeloSaliente: 'Xiaomi 17 Black',
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
        modeloSaliente: 'Xiaomi 17 Blue',
        esDummySaliente: true,
        modeloEntrante: 'Xiaomi 18 Pro (Maqueta)',
        esDummyEntrante: true
      };
    }
    if (pos.posicionNumero === 5) {
      return {
        posicionId: pos.id,
        mesaId: pos.mesaId,
        posicionNumero: 5,
        categoria: 'Smartphone',
        modeloSaliente: 'Xiaomi 17T Pro (Recolocación)',
        esDummySaliente: false,
        modeloEntrante: 'Xiaomi 17T Pro',
        esDummyEntrante: false
      };
    }
    if (pos.posicionNumero === 6) {
      return {
        posicionId: pos.id,
        mesaId: pos.mesaId,
        posicionNumero: 6,
        categoria: pos.categoria,
        modeloSaliente:
          pos.categoria === 'Wearable'
            ? 'Xiaomi Watch 5'
            : 'Xiaomi 17T (Recolocación)',
        esDummySaliente: false,
        modeloEntrante: pos.modeloOficial,
        esDummyEntrante: false
      };
    }
    if (pos.posicionNumero === 7) {
      return {
        posicionId: pos.id,
        mesaId: pos.mesaId,
        posicionNumero: 7,
        categoria: pos.categoria,
        modeloSaliente:
          pos.modeloOficial.includes('Watch S5')
            ? 'Xiaomi Watch S5 45mm'
            : 'Xiaomi Smart Band 10 Pro',
        esDummySaliente: false,
        modeloEntrante: pos.modeloOficial,
        esDummyEntrante: false
      };
    }
    if (pos.posicionNumero === 8) {
      return {
        posicionId: pos.id,
        mesaId: pos.mesaId,
        posicionNumero: 8,
        categoria: 'Audio',
        modeloSaliente: 'Xiaomi Buds 6',
        esDummySaliente: true,
        modeloEntrante: 'Xiaomi Clip',
        esDummyEntrante: false
      };
    }
    if (pos.posicionNumero === 9) {
      return {
        posicionId: pos.id,
        mesaId: pos.mesaId,
        posicionNumero: 9,
        categoria: pos.categoria,
        modeloSaliente:
          pos.modeloOficial.includes('17T')
            ? 'Xiaomi 17T Purple (Recolocación)'
            : 'Redmi Note 17 Pro Max',
        esDummySaliente: false,
        modeloEntrante: pos.modeloOficial,
        esDummyEntrante: false
      };
    }
    if (pos.posicionNumero === 10) {
      return {
        posicionId: pos.id,
        mesaId: pos.mesaId,
        posicionNumero: 10,
        categoria: pos.categoria,
        modeloSaliente:
          pos.modeloOficial.includes('Band 11')
            ? 'Xiaomi Smart Band 10 Pro'
            : 'Redmi Note 17 Pro Max',
        esDummySaliente: pos.esDummy,
        modeloEntrante: pos.modeloOficial,
        esDummyEntrante: pos.esDummy
      };
    }
    if (pos.posicionNumero === 11) {
      return {
        posicionId: pos.id,
        mesaId: pos.mesaId,
        posicionNumero: 11,
        categoria: pos.categoria,
        modeloSaliente:
          pos.modeloOficial.includes('Band')
            ? 'Xiaomi Smart Band 11 Active (Recolocación)'
            : 'Redmi Note 17 Pro Max',
        esDummySaliente: false,
        modeloEntrante: pos.modeloOficial,
        esDummyEntrante: false
      };
    }
  }

  // 1. Caso genérico: Modelos Xiaomi 17 Ultra -> Xiaomi 18 Pro Max
  if (modelLower.includes('xiaomi 17 ultra')) {
    const colorSuffix = rawModel.replace(/xiaomi\s+17\s+ultra/i, '').trim();
    const newModel = `Xiaomi 18 Pro Max${colorSuffix ? ` ${colorSuffix}` : ''}`;
    return {
      posicionId: pos.id,
      mesaId: pos.mesaId,
      posicionNumero: pos.posicionNumero,
      categoria: pos.categoria,
      modeloSaliente: rawModel,
      esDummySaliente: pos.esDummy,
      modeloEntrante: newModel,
      esDummyEntrante: pos.esDummy
    };
  }

  // 2. Caso genérico: Modelos Xiaomi 17 -> Xiaomi 18 Pro
  const isXiaomi17Standard =
    modelLower.startsWith('xiaomi 17') &&
    !modelLower.startsWith('xiaomi 17t') &&
    !modelLower.includes('ultra');

  if (isXiaomi17Standard) {
    const colorSuffix = rawModel.replace(/xiaomi\s+17/i, '').trim();
    const newModel = `Xiaomi 18 Pro${colorSuffix ? ` ${colorSuffix}` : ''}`;
    return {
      posicionId: pos.id,
      mesaId: pos.mesaId,
      posicionNumero: pos.posicionNumero,
      categoria: pos.categoria,
      modeloSaliente: rawModel,
      esDummySaliente: pos.esDummy,
      modeloEntrante: newModel,
      esDummyEntrante: pos.esDummy
    };
  }

  return null;
};

/**
 * Obtiene todas las posiciones asignadas al Swap de la campaña activa en una tienda.
 */
export const getAllSwapAssignmentsForStore = (store: StoreCenter): SwapCampaignAssignment[] => {
  const availableSpaces =
    store.availableSpaces && store.availableSpaces.length > 0
      ? store.availableSpaces
      : ['MESA 1 · Cara 1', 'MESA 1 · Cara 2', 'WALL', 'LINEAL SMARTWATCH'];

  const list: SwapCampaignAssignment[] = [];
  availableSpaces.forEach((sp) => {
    const isM1C1 = sp.toUpperCase().includes('MESA 1') && sp.includes('Cara 1');
    const positions = isM1C1
      ? getImplantationPositionsForMesa1Cara1(store)
      : getPositionsForSpace(store.tipoEspacioId, sp, store);

    positions.forEach((pos) => {
      const assignment = getSwapAssignmentForPosition(pos);
      if (assignment) {
        list.push(assignment);
      }
    });
  });

  return list;
};

/**
 * Obtiene los elementos de "POSM" (Lonas, Pantallas Hanshow, Faldón y Merchandising)
 * que deben intervenirse en la tienda durante la Nueva Implantación.
 */
export const getVisualElementsForStore = (store: StoreCenter): VisualElementDefinition[] => {
  if (hasActiveImplantationCampaign(store)) {
    return [
      {
        id: `${store.tiendaId}-POSM-LONA-WALL`,
        nombreElemento: 'Lona de Wall',
        tipoMaterial: 'Textil / Lona',
        ubicacionEspacio: 'WALL · Bastidor Textil Retroiluminado',
        campanaOficial: 'Cambio de lona: Xiaomi 17 Ultra → Xiaomi 18 Pro Max (Fotografía Leica)',
        medidasOficiales: '200 x 110 cm (Perfil silicona perimetral)',
        instruccionesFijacion: 'Extender lona de tal forma que quede tensa y sin arrugas.',
        guiaVisualTipo: 'lona_mesa',
        imagenReferenciaAntes: './images/posm/lona_wall_antes.png',
        imagenReferenciaDespues: './images/posm/lona_wall_despues.png'
      },
      {
        id: `${store.tiendaId}-POSM-HANSHOW`,
        nombreElemento: 'Actualizar Pantalla de Hanshow',
        tipoMaterial: 'Pantalla Digital / Hanshow',
        ubicacionEspacio: 'MESA 1 · Pantalla Digital Hanshow',
        campanaOficial: 'Cambio de cartel: Redmi Note 17 Series → Xiaomi 18 Pro & Pro Max',
        medidasOficiales: 'Punto de acceso: Hanshow | Contraseña: 12345678',
        instruccionesFijacion:
          'Crear un punto de acceso desde un teléfono con el nombre "Hanshow" y la contraseña "12345678". Desconectar la pantalla y volverla a conectar para que se actualice.',
        guiaVisualTipo: 'hanshow_screen',
        imagenReferenciaAntes: './images/posm/hanshow_antes.png',
        imagenReferenciaDespues: './images/posm/hanshow_despues.png'
      },
      {
        id: `${store.tiendaId}-POSM-FALDON-M1C1`,
        nombreElemento: 'Faldón 18 Pro Max — Mesa 1 Cara 1',
        tipoMaterial: 'Faldón Mesa / Vinilo',
        ubicacionEspacio: 'MESA 1 · Cara 1 (Lateral / Frontal de Mesa)',
        campanaOficial: 'MAX POWER · Xiaomi 18 Pro Max · MAX POWER',
        medidasOficiales: 'Lateral de Mesa 1 Cara 1',
        instruccionesFijacion:
          'Colocar el faldón de Xiaomi 18 Pro Max en el lateral de la Mesa 1 Cara 1 según la imagen de referencia.',
        guiaVisualTipo: 'faldon_mesa',
        imagenReferenciaDespues: './images/posm/faldon_mesa1.png'
      }
    ];
  }

  return [];
};

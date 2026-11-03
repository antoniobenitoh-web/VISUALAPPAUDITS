import {
  PlanogramPosition,
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
 * Determina si una posición del planograma pertenece a la campaña activa
 * "Lanzamiento Xiaomi 18 Pro Max" (Sustitución desde Xiaomi 17 Ultra hasta Xiaomi 17:
 * Maquetas -> Maquetas Xiaomi 18 Pro Max / Xiaomi 18 Pro, y LDUs -> LDUs Xiaomi 18 Pro Max / Xiaomi 18 Pro).
 */
export const getSwapAssignmentForPosition = (
  pos: PlanogramPosition
): SwapCampaignAssignment | null => {
  const rawModel = (pos.modeloOficial || '').trim();
  const modelLower = rawModel.toLowerCase();
  const isMesa1Cara1 = pos.mesaId.includes('MESA 1') && (pos.mesaId.includes('Cara 1') || pos.cara === 'Cara 1');

  // 1. Caso principal: Modelos Xiaomi 17 Ultra -> Xiaomi 18 Pro Max (Maqueta por Maqueta, LDU por LDU)
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

  // 2. Caso principal: Modelos Xiaomi 17 (excluyendo 17T y Redmi 17) -> Xiaomi 18 Pro (Maqueta por Maqueta, LDU por LDU)
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

  // 3. Fallback para formatos reducidos (Table FNAC, Table CRF, Table Alcampo) en Mesa 1 Cara 1 Puestos 1 y 2
  if (
    isMesa1Cara1 &&
    (pos.tipoEspacioId.includes('FNAC') ||
      pos.tipoEspacioId.includes('CRF') ||
      pos.tipoEspacioId.includes('Alcampo') ||
      pos.tipoEspacioId.includes('4.1')) &&
    (pos.posicionNumero === 1 || pos.posicionNumero === 2)
  ) {
    const isPos1 = pos.posicionNumero === 1;
    return {
      posicionId: pos.id,
      mesaId: pos.mesaId,
      posicionNumero: pos.posicionNumero,
      categoria: 'Smartphone',
      modeloSaliente: rawModel,
      esDummySaliente: pos.esDummy,
      modeloEntrante: isPos1 ? 'Xiaomi 18 Pro Max Black' : 'Xiaomi 18 Pro Blue',
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
    const positions = getPositionsForSpace(store.tipoEspacioId, sp, store);
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

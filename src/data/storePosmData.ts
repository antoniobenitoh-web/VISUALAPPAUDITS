// Catálogo y configuración oficial de POSM (Columnas, Wall, MiniWall y Top Tables)
// Extraído de la base de datos oficial Brand Spaces / Salesland
import { VisualElementDefinition, StoreCenter } from '../types/index';

export type PosmElementType = 'columna' | 'wall' | 'miniwall' | 'top_table';
export type PosmMaterialType = 'Lona / Textil' | 'Duratrans / Filmina' | 'Faldón Vinilo' | 'Pantalla Digital';

export interface StorePosmItem {
  id: string;
  tipo: PosmElementType;
  material: PosmMaterialType;
  nombre: string;
  ubicacion: string;
  caraNumero: number;
  medida: string;
  campanaOficial: string;
  activo: boolean;
  /** Indica que esta cara de columna actúa también como MiniWall (lona de menor tamaño) */
  esMiniwall?: boolean;
}

export interface StorePosmConfig {
  tiendaId: string;
  nombreTienda: string;
  planogram: string;
  hasPad8Pro: boolean;
  hasWall: boolean;
  hasMiniwall: boolean;
  hasColumnas: boolean;
  hasTopTables: boolean;
  columnMeasures?: {
    cara1: string;
    cara2: string;
    cara3: string;
    cara4: string;
  };
  elementos: StorePosmItem[];
}

export const STORE_POSM_DATA: Record<string, StorePosmConfig> = {
  "MIESD00575": {
    "tiendaId": "MIESD00575",
    "nombreTienda": "Media Sant Antoni",
    "planogram": "Table 1",
    "hasPad8Pro": false,
    "hasWall": false,
    "hasMiniwall": false,
    "hasColumnas": false,
    "hasTopTables": true,
    "columnMeasures": {
      "cara1": "",
      "cara2": "",
      "cara3": "",
      "cara4": ""
    },
    "elementos": [
      {
        "id": "MIESD00575-POSM-TT-C1",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 1 (Mesa 1 Cara A)",
        "ubicacion": "MESA 1 · Franja Central (Cara A)",
        "caraNumero": 1,
        "medida": "1150X275 mm",
        "campanaOficial": "Xiaomi 17 Ultra",
        "activo": true
      },
      {
        "id": "MIESD00575-POSM-TT-C2",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 2 (Mesa 1 Cara B)",
        "ubicacion": "MESA 1 · Franja Central (Cara B)",
        "caraNumero": 2,
        "medida": "1150X275 mm",
        "campanaOficial": "Redmi Note 17 Series",
        "activo": true
      }
    ]
  },
  "MIESP00034": {
    "tiendaId": "MIESP00034",
    "nombreTienda": "Media Badalona",
    "planogram": "Table 1",
    "hasPad8Pro": false,
    "hasWall": false,
    "hasMiniwall": false,
    "hasColumnas": false,
    "hasTopTables": true,
    "columnMeasures": {
      "cara1": "",
      "cara2": "",
      "cara3": "",
      "cara4": ""
    },
    "elementos": [
      {
        "id": "MIESP00034-POSM-TT-C1",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 1 (Mesa 1 Cara A)",
        "ubicacion": "MESA 1 · Franja Central (Cara A)",
        "caraNumero": 1,
        "medida": "1150X275 mm",
        "campanaOficial": "Xiaomi 17 Ultra",
        "activo": true
      },
      {
        "id": "MIESP00034-POSM-TT-C2",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 2 (Mesa 1 Cara B)",
        "ubicacion": "MESA 1 · Franja Central (Cara B)",
        "caraNumero": 2,
        "medida": "1150X275 mm",
        "campanaOficial": "Redmi Note 17 Series",
        "activo": true
      }
    ]
  },
  "MIESD00174": {
    "tiendaId": "MIESD00174",
    "nombreTienda": "Media Barcelona 5 Fontanella",
    "planogram": "Table 2",
    "hasPad8Pro": true,
    "hasWall": true,
    "hasMiniwall": false,
    "hasColumnas": false,
    "hasTopTables": false,
    "columnMeasures": {
      "cara1": "",
      "cara2": "",
      "cara3": "",
      "cara4": ""
    },
    "elementos": [
      {
        "id": "MIESD00174-POSM-WALL",
        "tipo": "wall",
        "material": "Lona / Textil",
        "nombre": "Lona de Wall",
        "ubicacion": "WALL · Bastidor Textil Retroiluminado",
        "caraNumero": 1,
        "medida": "2275x735 mm",
        "campanaOficial": "Xiaomi 17 Ultra",
        "activo": true
      }
    ]
  },
  "MIESO00036": {
    "tiendaId": "MIESO00036",
    "nombreTienda": "Media Diagonal Digital 1",
    "planogram": "",
    "hasPad8Pro": false,
    "hasWall": false,
    "hasMiniwall": false,
    "hasColumnas": false,
    "hasTopTables": false,
    "columnMeasures": {
      "cara1": "",
      "cara2": "",
      "cara3": "",
      "cara4": ""
    },
    "elementos": []
  },
  "MIESS00026": {
    "tiendaId": "MIESS00026",
    "nombreTienda": "Media Diagonal Mar-Barcelona",
    "planogram": "Table 3",
    "hasPad8Pro": false,
    "hasWall": false,
    "hasMiniwall": true,
    "hasColumnas": false,
    "hasTopTables": false,
    "columnMeasures": {
      "cara1": "650x460",
      "cara2": "",
      "cara3": "",
      "cara4": ""
    },
    "elementos": [
      {
        "id": "MIESS00026-POSM-MINIWALL",
        "tipo": "miniwall",
        "material": "Lona / Textil",
        "nombre": "Minilona (MiniWall)",
        "ubicacion": "MINIWALL · Minilona Bastidor Textil",
        "caraNumero": 1,
        "medida": "650x460 mm",
        "campanaOficial": "Xiaomi 17 Ultra",
        "activo": true
      }
    ]
  },
  "MIESD00175": {
    "tiendaId": "MIESD00175",
    "nombreTienda": "Media El Prat",
    "planogram": "Table 2",
    "hasPad8Pro": false,
    "hasWall": false,
    "hasMiniwall": false,
    "hasColumnas": false,
    "hasTopTables": true,
    "columnMeasures": {
      "cara1": "",
      "cara2": "",
      "cara3": "",
      "cara4": ""
    },
    "elementos": [
      {
        "id": "MIESD00175-POSM-TT-C1",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 1 (Mesa 1 Cara A)",
        "ubicacion": "MESA 1 · Franja Central (Cara A)",
        "caraNumero": 1,
        "medida": "1160x300 mm",
        "campanaOficial": "Xiaomi 17 Ultra",
        "activo": true
      },
      {
        "id": "MIESD00175-POSM-TT-C2",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 2 (Mesa 1 Cara B)",
        "ubicacion": "MESA 1 · Franja Central (Cara B)",
        "caraNumero": 2,
        "medida": "1160x300 mm",
        "campanaOficial": "redmi note 17 series",
        "activo": true
      },
      {
        "id": "MIESD00175-POSM-TT-C3",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 3 (Mesa 2 Cara A)",
        "ubicacion": "MESA 2 · Franja Central (Cara A)",
        "caraNumero": 3,
        "medida": "1160x300 mm",
        "campanaOficial": "Xiaomi Pad 8 series",
        "activo": true
      },
      {
        "id": "MIESD00175-POSM-TT-C4",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 4 (Mesa 2 Cara B)",
        "ubicacion": "MESA 2 · Franja Central (Cara B)",
        "caraNumero": 4,
        "medida": "1160x300 mm",
        "campanaOficial": "Redmi 15C",
        "activo": true
      }
    ]
  },
  "MIESO00034": {
    "tiendaId": "MIESO00034",
    "nombreTienda": "Media Esplugues",
    "planogram": "Table 1",
    "hasPad8Pro": false,
    "hasWall": false,
    "hasMiniwall": false,
    "hasColumnas": false,
    "hasTopTables": true,
    "columnMeasures": {
      "cara1": "",
      "cara2": "",
      "cara3": "",
      "cara4": ""
    },
    "elementos": [
      {
        "id": "MIESO00034-POSM-TT-C1",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 1 (Mesa 1 Cara A)",
        "ubicacion": "MESA 1 · Franja Central (Cara A)",
        "caraNumero": 1,
        "medida": "1150x275 mm",
        "campanaOficial": "Xiaomi 17 Ultra",
        "activo": true
      },
      {
        "id": "MIESO00034-POSM-TT-C2",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 2 (Mesa 1 Cara B)",
        "ubicacion": "MESA 1 · Franja Central (Cara B)",
        "caraNumero": 2,
        "medida": "1150x275 mm",
        "campanaOficial": "Redmi Note 17 Series",
        "activo": true
      }
    ]
  },
  "MIESO00033": {
    "tiendaId": "MIESO00033",
    "nombreTienda": "Media Gava",
    "planogram": "Table 1",
    "hasPad8Pro": false,
    "hasWall": true,
    "hasMiniwall": false,
    "hasColumnas": false,
    "hasTopTables": false,
    "columnMeasures": {
      "cara1": "",
      "cara2": "",
      "cara3": "",
      "cara4": ""
    },
    "elementos": [
      {
        "id": "MIESO00033-POSM-WALL",
        "tipo": "wall",
        "material": "Lona / Textil",
        "nombre": "Lona de Wall",
        "ubicacion": "WALL · Bastidor Textil Retroiluminado",
        "caraNumero": 1,
        "medida": "2410x430 mm",
        "campanaOficial": "XIAOMI 17 ULTRA",
        "activo": true
      }
    ]
  },
  "MIESD00182": {
    "tiendaId": "MIESD00182",
    "nombreTienda": "Media Girona",
    "planogram": "Table 3",
    "hasPad8Pro": true,
    "hasWall": false,
    "hasMiniwall": false,
    "hasColumnas": false,
    "hasTopTables": true,
    "columnMeasures": {
      "cara1": "",
      "cara2": "",
      "cara3": "",
      "cara4": ""
    },
    "elementos": [
      {
        "id": "MIESD00182-POSM-TT-C1",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 1 (Mesa 1 Cara A)",
        "ubicacion": "MESA 1 · Franja Central (Cara A)",
        "caraNumero": 1,
        "medida": "1150x275 mm",
        "campanaOficial": "Xiaomi 17 Ultra",
        "activo": true
      },
      {
        "id": "MIESD00182-POSM-TT-C2",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 2 (Mesa 1 Cara B)",
        "ubicacion": "MESA 1 · Franja Central (Cara B)",
        "caraNumero": 2,
        "medida": "1150x275 mm",
        "campanaOficial": "Xiaomi 17T Series",
        "activo": true
      },
      {
        "id": "MIESD00182-POSM-TT-C3",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 3 (Mesa 2 Cara A)",
        "ubicacion": "MESA 2 · Franja Central (Cara A)",
        "caraNumero": 3,
        "medida": "1150x275 mm",
        "campanaOficial": "Redmi Note 15 series",
        "activo": true
      },
      {
        "id": "MIESD00182-POSM-TT-C4",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 4 (Mesa 2 Cara B)",
        "ubicacion": "MESA 2 · Franja Central (Cara B)",
        "caraNumero": 4,
        "medida": "1150x275 mm",
        "campanaOficial": "Xiaomi Pad 8 series",
        "activo": true
      },
      {
        "id": "MIESD00182-POSM-TT-C5",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 5 (Mesa 3 Cara A)",
        "ubicacion": "MESA 3 · Franja Central (Cara A)",
        "caraNumero": 5,
        "medida": "1150x275 mm",
        "campanaOficial": "Xiaomi 17 Ultra",
        "activo": true
      },
      {
        "id": "MIESD00182-POSM-TT-C6",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 6 (Mesa 3 Cara B)",
        "ubicacion": "MESA 3 · Franja Central (Cara B)",
        "caraNumero": 6,
        "medida": "1150x275 mm",
        "campanaOficial": "Redmi Note 17 Series",
        "activo": true
      }
    ]
  },
  "MIESP00037": {
    "tiendaId": "MIESP00037",
    "nombreTienda": "Media Girona 2",
    "planogram": "Table 1",
    "hasPad8Pro": false,
    "hasWall": false,
    "hasMiniwall": false,
    "hasColumnas": false,
    "hasTopTables": true,
    "columnMeasures": {
      "cara1": "",
      "cara2": "",
      "cara3": "",
      "cara4": ""
    },
    "elementos": [
      {
        "id": "MIESP00037-POSM-TT-C1",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 1 (Mesa 1 Cara A)",
        "ubicacion": "MESA 1 · Franja Central (Cara A)",
        "caraNumero": 1,
        "medida": "1150X275 mm",
        "campanaOficial": "Xiaomi 17 Ultra",
        "activo": true
      },
      {
        "id": "MIESP00037-POSM-TT-C2",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 2 (Mesa 1 Cara B)",
        "ubicacion": "MESA 1 · Franja Central (Cara B)",
        "caraNumero": 2,
        "medida": "1150X275 mm",
        "campanaOficial": "Redmi Note 17 Series",
        "activo": true
      }
    ]
  },
  "MIESM00438": {
    "tiendaId": "MIESM00438",
    "nombreTienda": "Media Girona 3",
    "planogram": "Table 1",
    "hasPad8Pro": false,
    "hasWall": false,
    "hasMiniwall": false,
    "hasColumnas": false,
    "hasTopTables": true,
    "columnMeasures": {
      "cara1": "",
      "cara2": "",
      "cara3": "",
      "cara4": ""
    },
    "elementos": [
      {
        "id": "MIESM00438-POSM-TT-C1",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 1 (Mesa 1 Cara A)",
        "ubicacion": "MESA 1 · Franja Central (Cara A)",
        "caraNumero": 1,
        "medida": "1150X275 mm",
        "campanaOficial": "Xiaomi 17 Ultra",
        "activo": true
      },
      {
        "id": "MIESM00438-POSM-TT-C2",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 2 (Mesa 1 Cara B)",
        "ubicacion": "MESA 1 · Franja Central (Cara B)",
        "caraNumero": 2,
        "medida": "1150X275 mm",
        "campanaOficial": "Redmi Note 17 Series",
        "activo": true
      }
    ]
  },
  "MIESD00187": {
    "tiendaId": "MIESD00187",
    "nombreTienda": "Media Lleida",
    "planogram": "Table 2",
    "hasPad8Pro": true,
    "hasWall": false,
    "hasMiniwall": false,
    "hasColumnas": false,
    "hasTopTables": true,
    "columnMeasures": {
      "cara1": "",
      "cara2": "",
      "cara3": "",
      "cara4": ""
    },
    "elementos": [
      {
        "id": "MIESD00187-POSM-TT-C1",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 1 (Mesa 1 Cara A)",
        "ubicacion": "MESA 1 · Franja Central (Cara A)",
        "caraNumero": 1,
        "medida": "1180x360 mm",
        "campanaOficial": "Xiaomi 17 Ultra",
        "activo": true
      },
      {
        "id": "MIESD00187-POSM-TT-C2",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 2 (Mesa 1 Cara B)",
        "ubicacion": "MESA 1 · Franja Central (Cara B)",
        "caraNumero": 2,
        "medida": "1180x360 mm",
        "campanaOficial": "Redmi Note 17 series",
        "activo": true
      },
      {
        "id": "MIESD00187-POSM-TT-C3",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 3 (Mesa 2 Cara A)",
        "ubicacion": "MESA 2 · Franja Central (Cara A)",
        "caraNumero": 3,
        "medida": "1180x360 mm",
        "campanaOficial": "Xiaomi Pad 8 series",
        "activo": true
      },
      {
        "id": "MIESD00187-POSM-TT-C4",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 4 (Mesa 2 Cara B)",
        "ubicacion": "MESA 2 · Franja Central (Cara B)",
        "caraNumero": 4,
        "medida": "1180x360 mm",
        "campanaOficial": "Redmi 15C",
        "activo": true
      }
    ]
  },
  "MIESD00176": {
    "tiendaId": "MIESD00176",
    "nombreTienda": "Media Maquinista",
    "planogram": "Table 2",
    "hasPad8Pro": true,
    "hasWall": false,
    "hasMiniwall": true,
    "hasColumnas": true,
    "hasTopTables": false,
    "columnMeasures": {
      "cara1": "845X1875",
      "cara2": "905X1875",
      "cara3": "1365X1875",
      "cara4": "905X465"
    },
    "elementos": [
      {
        "id": "MIESD00176-POSM-COL-C1",
        "tipo": "columna",
        "material": "Lona / Textil",
        "nombre": "Columna · Cara 1",
        "ubicacion": "COLUMNA · Cara 1",
        "caraNumero": 1,
        "medida": "845X1875 mm",
        "campanaOficial": "Xiaomi 17 Ultra",
        "activo": true
      },
      {
        "id": "MIESD00176-POSM-COL-C2",
        "tipo": "columna",
        "material": "Lona / Textil",
        "nombre": "Columna · Cara 2",
        "ubicacion": "COLUMNA · Cara 2",
        "caraNumero": 2,
        "medida": "905X1875 mm",
        "campanaOficial": "Xiaomi 17T Series",
        "activo": true
      },
      {
        "id": "MIESD00176-POSM-COL-C3",
        "tipo": "columna",
        "material": "Lona / Textil",
        "nombre": "Columna · Cara 3",
        "ubicacion": "COLUMNA · Cara 3",
        "caraNumero": 3,
        "medida": "1365X1875 mm",
        "campanaOficial": "Redmi Note 17 series",
        "activo": true
      },
      {
        "id": "MIESD00176-POSM-COL-C4",
        "tipo": "columna",
        "material": "Lona / Textil",
        "nombre": "Columna · Cara 4",
        "ubicacion": "COLUMNA · Cara 4",
        "caraNumero": 4,
        "medida": "905X465 mm",
        "campanaOficial": "Xiaomi Pad 8 series",
        "activo": true
      }
    ]
  },
  "MIESD00177": {
    "tiendaId": "MIESD00177",
    "nombreTienda": "Media Mataro",
    "planogram": "Table 1",
    "hasPad8Pro": false,
    "hasWall": false,
    "hasMiniwall": false,
    "hasColumnas": false,
    "hasTopTables": true,
    "columnMeasures": {
      "cara1": "",
      "cara2": "",
      "cara3": "",
      "cara4": ""
    },
    "elementos": [
      {
        "id": "MIESD00177-POSM-TT-C1",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 1 (Mesa 1 Cara A)",
        "ubicacion": "MESA 1 · Franja Central (Cara A)",
        "caraNumero": 1,
        "medida": "1150X275 mm",
        "campanaOficial": "Xiaomi 17 Ultra",
        "activo": true
      },
      {
        "id": "MIESD00177-POSM-TT-C2",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 2 (Mesa 1 Cara B)",
        "ubicacion": "MESA 1 · Franja Central (Cara B)",
        "caraNumero": 2,
        "medida": "1150X275 mm",
        "campanaOficial": "Redmi Note 17 Series",
        "activo": true
      }
    ]
  },
  "MIESD00178": {
    "tiendaId": "MIESD00178",
    "nombreTienda": "Media Parets",
    "planogram": "Table 1",
    "hasPad8Pro": false,
    "hasWall": false,
    "hasMiniwall": false,
    "hasColumnas": false,
    "hasTopTables": true,
    "columnMeasures": {
      "cara1": "",
      "cara2": "",
      "cara3": "",
      "cara4": ""
    },
    "elementos": [
      {
        "id": "MIESD00178-POSM-TT-C1",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 1 (Mesa 1 Cara A)",
        "ubicacion": "MESA 1 · Franja Central (Cara A)",
        "caraNumero": 1,
        "medida": "1150X275 mm",
        "campanaOficial": "Xiaomi 17 Ultra",
        "activo": true
      },
      {
        "id": "MIESD00178-POSM-TT-C2",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 2 (Mesa 1 Cara B)",
        "ubicacion": "MESA 1 · Franja Central (Cara B)",
        "caraNumero": 2,
        "medida": "1150X275 mm",
        "campanaOficial": "Redmi Note 17 Series",
        "activo": true
      }
    ]
  },
  "MIESP03781": {
    "tiendaId": "MIESP03781",
    "nombreTienda": "Media Sabadell",
    "planogram": "Table 2",
    "hasPad8Pro": false,
    "hasWall": false,
    "hasMiniwall": false,
    "hasColumnas": false,
    "hasTopTables": true,
    "columnMeasures": {
      "cara1": "",
      "cara2": "",
      "cara3": "",
      "cara4": ""
    },
    "elementos": [
      {
        "id": "MIESP03781-POSM-TT-C1",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 1 (Mesa 1 Cara A)",
        "ubicacion": "MESA 1 · Franja Central (Cara A)",
        "caraNumero": 1,
        "medida": "1150X275 mm",
        "campanaOficial": "Xiaomi 17 Ultra",
        "activo": true
      },
      {
        "id": "MIESP03781-POSM-TT-C2",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 2 (Mesa 1 Cara B)",
        "ubicacion": "MESA 1 · Franja Central (Cara B)",
        "caraNumero": 2,
        "medida": "1150X275 mm",
        "campanaOficial": "Redmi Note 17 Series",
        "activo": true
      },
      {
        "id": "MIESP03781-POSM-TT-C3",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 3 (Mesa 2 Cara A)",
        "ubicacion": "MESA 2 · Franja Central (Cara A)",
        "caraNumero": 3,
        "medida": "1150X275 mm",
        "campanaOficial": "Xiaomi Pad 8 series",
        "activo": true
      },
      {
        "id": "MIESP03781-POSM-TT-C4",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 4 (Mesa 2 Cara B)",
        "ubicacion": "MESA 2 · Franja Central (Cara B)",
        "caraNumero": 4,
        "medida": "1150X275 mm",
        "campanaOficial": "Redmi 15C",
        "activo": true
      }
    ]
  },
  "MIESD00180": {
    "tiendaId": "MIESD00180",
    "nombreTienda": "Media Sant Cugat (Barcelona)",
    "planogram": "Table 2",
    "hasPad8Pro": false,
    "hasWall": true,
    "hasMiniwall": false,
    "hasColumnas": false,
    "hasTopTables": false,
    "columnMeasures": {
      "cara1": "",
      "cara2": "",
      "cara3": "",
      "cara4": ""
    },
    "elementos": [
      {
        "id": "MIESD00180-POSM-WALL",
        "tipo": "wall",
        "material": "Lona / Textil",
        "nombre": "Lona de Wall",
        "ubicacion": "WALL · Bastidor Textil Retroiluminado",
        "caraNumero": 1,
        "medida": "2145x415 mm",
        "campanaOficial": "XIAOMI 15T SERIES",
        "activo": true
      }
    ]
  },
  "MIESO00043": {
    "tiendaId": "MIESO00043",
    "nombreTienda": "Media Tarragona",
    "planogram": "Table 2",
    "hasPad8Pro": false,
    "hasWall": true,
    "hasMiniwall": false,
    "hasColumnas": false,
    "hasTopTables": false,
    "columnMeasures": {
      "cara1": "",
      "cara2": "",
      "cara3": "",
      "cara4": ""
    },
    "elementos": [
      {
        "id": "MIESO00043-POSM-WALL",
        "tipo": "wall",
        "material": "Lona / Textil",
        "nombre": "Lona de Wall",
        "ubicacion": "WALL · Bastidor Textil Retroiluminado",
        "caraNumero": 1,
        "medida": "2135X360 mm",
        "campanaOficial": "Xiaomi 17 Ultra",
        "activo": true
      }
    ]
  },
  "MIESD00179": {
    "tiendaId": "MIESD00179",
    "nombreTienda": "Media Terrassa",
    "planogram": "Table 2",
    "hasPad8Pro": false,
    "hasWall": true,
    "hasMiniwall": false,
    "hasColumnas": false,
    "hasTopTables": false,
    "columnMeasures": {
      "cara1": "",
      "cara2": "",
      "cara3": "",
      "cara4": ""
    },
    "elementos": [
      {
        "id": "MIESD00179-POSM-WALL",
        "tipo": "wall",
        "material": "Lona / Textil",
        "nombre": "Lona de Wall",
        "ubicacion": "WALL · Bastidor Textil Retroiluminado",
        "caraNumero": 1,
        "medida": "2740x795 mm",
        "campanaOficial": "Xiaomi 17 Ultra",
        "activo": true
      }
    ]
  },
  "MIESD02181": {
    "tiendaId": "MIESD02181",
    "nombreTienda": "Media Vilanova",
    "planogram": "Table 2",
    "hasPad8Pro": false,
    "hasWall": true,
    "hasMiniwall": false,
    "hasColumnas": false,
    "hasTopTables": false,
    "columnMeasures": {
      "cara1": "",
      "cara2": "",
      "cara3": "",
      "cara4": ""
    },
    "elementos": [
      {
        "id": "MIESD02181-POSM-WALL",
        "tipo": "wall",
        "material": "Lona / Textil",
        "nombre": "Lona de Wall",
        "ubicacion": "WALL · Bastidor Textil Retroiluminado",
        "caraNumero": 1,
        "medida": "2400x415 mm",
        "campanaOficial": "Xiaomi 17 Ultra",
        "activo": true
      }
    ]
  },
  "MIESD00203": {
    "tiendaId": "MIESD00203",
    "nombreTienda": "Media Zaragoza",
    "planogram": "Table 2",
    "hasPad8Pro": false,
    "hasWall": false,
    "hasMiniwall": false,
    "hasColumnas": false,
    "hasTopTables": true,
    "columnMeasures": {
      "cara1": "",
      "cara2": "",
      "cara3": "",
      "cara4": ""
    },
    "elementos": [
      {
        "id": "MIESD00203-POSM-TT-C1",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 1 (Mesa 1 Cara A)",
        "ubicacion": "MESA 1 · Franja Central (Cara A)",
        "caraNumero": 1,
        "medida": "1160x300 mm",
        "campanaOficial": "Xiaomi 17 Ultra",
        "activo": true
      },
      {
        "id": "MIESD00203-POSM-TT-C2",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 2 (Mesa 1 Cara B)",
        "ubicacion": "MESA 1 · Franja Central (Cara B)",
        "caraNumero": 2,
        "medida": "1160x300 mm",
        "campanaOficial": "Redmi Note 17 series",
        "activo": true
      },
      {
        "id": "MIESD00203-POSM-TT-C3",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 3 (Mesa 2 Cara A)",
        "ubicacion": "MESA 2 · Franja Central (Cara A)",
        "caraNumero": 3,
        "medida": "1160x300 mm",
        "campanaOficial": "Xiaomi Pad 8 series",
        "activo": true
      },
      {
        "id": "MIESD00203-POSM-TT-C4",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 4 (Mesa 2 Cara B)",
        "ubicacion": "MESA 2 · Franja Central (Cara B)",
        "caraNumero": 4,
        "medida": "1160x300 mm",
        "campanaOficial": "Redmi 15C",
        "activo": true
      }
    ]
  },
  "MIESD00204": {
    "tiendaId": "MIESD00204",
    "nombreTienda": "Media Zaragoza 2",
    "planogram": "Table 2",
    "hasPad8Pro": false,
    "hasWall": true,
    "hasMiniwall": false,
    "hasColumnas": false,
    "hasTopTables": false,
    "columnMeasures": {
      "cara1": "",
      "cara2": "",
      "cara3": "",
      "cara4": ""
    },
    "elementos": [
      {
        "id": "MIESD00204-POSM-WALL",
        "tipo": "wall",
        "material": "Lona / Textil",
        "nombre": "Lona de Wall",
        "ubicacion": "WALL · Bastidor Textil Retroiluminado",
        "caraNumero": 1,
        "medida": "2200x545 mm",
        "campanaOficial": "Xiaomi 17 Ultra",
        "activo": true
      }
    ]
  },
  "MIESD00077": {
    "tiendaId": "MIESD00077",
    "nombreTienda": "ECI C.C. GIROCENTRE",
    "planogram": "",
    "hasPad8Pro": false,
    "hasWall": false,
    "hasMiniwall": false,
    "hasColumnas": false,
    "hasTopTables": false,
    "columnMeasures": {
      "cara1": "",
      "cara2": "",
      "cara3": "",
      "cara4": ""
    },
    "elementos": []
  },
  "MIESD00114": {
    "tiendaId": "MIESD00114",
    "nombreTienda": "ECI CAN DRAGO",
    "planogram": "Table 1",
    "hasPad8Pro": false,
    "hasWall": true,
    "hasMiniwall": false,
    "hasColumnas": false,
    "hasTopTables": false,
    "columnMeasures": {
      "cara1": "",
      "cara2": "",
      "cara3": "",
      "cara4": ""
    },
    "elementos": [
      {
        "id": "MIESD00114-POSM-WALL",
        "tipo": "wall",
        "material": "Lona / Textil",
        "nombre": "Lona de Wall",
        "ubicacion": "WALL · Bastidor Textil Retroiluminado",
        "caraNumero": 1,
        "medida": "2200x545 mm",
        "campanaOficial": "Xiaomi 17 Ultra",
        "activo": true
      }
    ]
  },
  "MIESS00002": {
    "tiendaId": "MIESS00002",
    "nombreTienda": "ECI CATALUÑA",
    "planogram": "Table 2",
    "hasPad8Pro": true,
    "hasWall": false,
    "hasMiniwall": true,
    "hasColumnas": true,
    "hasTopTables": false,
    "columnMeasures": {
      "cara1": "880x2220",
      "cara2": "880x1186",
      "cara3": "880x2220",
      "cara4": ""
    },
    "elementos": [
      {
        "id": "MIESS00002-POSM-COL-C1",
        "tipo": "columna",
        "material": "Lona / Textil",
        "nombre": "Columna · Cara 1",
        "ubicacion": "COLUMNA · Cara 1",
        "caraNumero": 1,
        "medida": "880x2220 mm",
        "campanaOficial": "Xiaomi 17 Ultra",
        "activo": true
      },
      {
        "id": "MIESS00002-POSM-COL-C2",
        "tipo": "columna",
        "material": "Lona / Textil",
        "nombre": "Columna · Cara 2",
        "ubicacion": "COLUMNA · Cara 2",
        "caraNumero": 2,
        "medida": "880x1186 mm",
        "campanaOficial": "Xiaomi 17T Series",
        "activo": true
      },
      {
        "id": "MIESS00002-POSM-COL-C3",
        "tipo": "columna",
        "material": "Lona / Textil",
        "nombre": "Columna · Cara 3",
        "ubicacion": "COLUMNA · Cara 3",
        "caraNumero": 3,
        "medida": "880x2220 mm",
        "campanaOficial": "Redmi Note 17 Series",
        "activo": true
      },
      {
        "id": "MIESS00002-POSM-COL-C4",
        "tipo": "columna",
        "material": "Lona / Textil",
        "nombre": "Columna · Cara 4",
        "ubicacion": "COLUMNA · Cara 4",
        "caraNumero": 4,
        "medida": "Medida estándar",
        "campanaOficial": "Pantalla",
        "activo": true
      }
    ]
  },
  "MIESD00121": {
    "tiendaId": "MIESD00121",
    "nombreTienda": "ECI CORNELLA",
    "planogram": "Table 1",
    "hasPad8Pro": false,
    "hasWall": false,
    "hasMiniwall": true,
    "hasColumnas": true,
    "hasTopTables": false,
    "columnMeasures": {
      "cara1": "810x2075",
      "cara2": "925x2075",
      "cara3": "810x2075",
      "cara4": "920x795"
    },
    "elementos": [
      {
        "id": "MIESD00121-POSM-COL-C1",
        "tipo": "columna",
        "material": "Lona / Textil",
        "nombre": "Columna · Cara 1",
        "ubicacion": "COLUMNA · Cara 1",
        "caraNumero": 1,
        "medida": "810x2075 mm",
        "campanaOficial": "XIAOMI 17 ULTRA",
        "activo": true
      },
      {
        "id": "MIESD00121-POSM-COL-C2",
        "tipo": "columna",
        "material": "Lona / Textil",
        "nombre": "Columna · Cara 2",
        "ubicacion": "COLUMNA · Cara 2",
        "caraNumero": 2,
        "medida": "925x2075 mm",
        "campanaOficial": "Xiaomi 17T series",
        "activo": true
      },
      {
        "id": "MIESD00121-POSM-COL-C3",
        "tipo": "columna",
        "material": "Lona / Textil",
        "nombre": "Columna · Cara 3",
        "ubicacion": "COLUMNA · Cara 3",
        "caraNumero": 3,
        "medida": "810x2075 mm",
        "campanaOficial": "Redmi Note 17 series",
        "activo": true
      },
      {
        "id": "MIESD00121-POSM-COL-C4",
        "tipo": "columna",
        "material": "Lona / Textil",
        "nombre": "Columna · Cara 4",
        "ubicacion": "COLUMNA · Cara 4",
        "caraNumero": 4,
        "medida": "920x795 mm",
        "campanaOficial": "XIAOMI PAD 8 series",
        "activo": true
      }
    ]
  },
  "MIESS00003": {
    "tiendaId": "MIESS00003",
    "nombreTienda": "ECI DIAGONAL",
    "planogram": "Table 2",
    "hasPad8Pro": true,
    "hasWall": false,
    "hasMiniwall": false,
    "hasColumnas": false,
    "hasTopTables": true,
    "columnMeasures": {
      "cara1": "",
      "cara2": "",
      "cara3": "",
      "cara4": ""
    },
    "elementos": [
      {
        "id": "MIESS00003-POSM-TT-C1",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 1 (Mesa 1 Cara A)",
        "ubicacion": "MESA 1 · Franja Central (Cara A)",
        "caraNumero": 1,
        "medida": "1200x300 mm",
        "campanaOficial": "Xiaomi 17 Ultra",
        "activo": true
      },
      {
        "id": "MIESS00003-POSM-TT-C2",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 2 (Mesa 1 Cara B)",
        "ubicacion": "MESA 1 · Franja Central (Cara B)",
        "caraNumero": 2,
        "medida": "1200x300 mm",
        "campanaOficial": "Redmi Note 17 series",
        "activo": true
      },
      {
        "id": "MIESS00003-POSM-TT-C3",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 3 (Mesa 2 Cara A)",
        "ubicacion": "MESA 2 · Franja Central (Cara A)",
        "caraNumero": 3,
        "medida": "1200x300 mm",
        "campanaOficial": "Xiaomi Pad 8 series",
        "activo": true
      },
      {
        "id": "MIESS00003-POSM-TT-C4",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 4 (Mesa 2 Cara B)",
        "ubicacion": "MESA 2 · Franja Central (Cara B)",
        "caraNumero": 4,
        "medida": "1200x300 mm",
        "campanaOficial": "Redmi 15C",
        "activo": true
      }
    ]
  },
  "MIESD00103": {
    "tiendaId": "MIESD00103",
    "nombreTienda": "ECI INDEPENDENCIA",
    "planogram": "",
    "hasPad8Pro": false,
    "hasWall": false,
    "hasMiniwall": false,
    "hasColumnas": false,
    "hasTopTables": false,
    "columnMeasures": {
      "cara1": "",
      "cara2": "",
      "cara3": "",
      "cara4": ""
    },
    "elementos": []
  },
  "MIESD00113": {
    "tiendaId": "MIESD00113",
    "nombreTienda": "ECI MERIDIANA",
    "planogram": "Table 1",
    "hasPad8Pro": false,
    "hasWall": false,
    "hasMiniwall": false,
    "hasColumnas": false,
    "hasTopTables": true,
    "columnMeasures": {
      "cara1": "",
      "cara2": "",
      "cara3": "",
      "cara4": ""
    },
    "elementos": [
      {
        "id": "MIESD00113-POSM-TT-C1",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 1 (Mesa 1 Cara A)",
        "ubicacion": "MESA 1 · Franja Central (Cara A)",
        "caraNumero": 1,
        "medida": "1722x2410 mm",
        "campanaOficial": "Xiaomi 17 Ultra",
        "activo": true
      },
      {
        "id": "MIESD00113-POSM-TT-C2",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 2 (Mesa 1 Cara B)",
        "ubicacion": "MESA 1 · Franja Central (Cara B)",
        "caraNumero": 2,
        "medida": "1722x2410 mm",
        "campanaOficial": "Redmi Note 17 Series",
        "activo": true
      }
    ]
  },
  "MIESD00105": {
    "tiendaId": "MIESD00105",
    "nombreTienda": "ECI PUERTO VENECIA",
    "planogram": "",
    "hasPad8Pro": false,
    "hasWall": false,
    "hasMiniwall": false,
    "hasColumnas": false,
    "hasTopTables": false,
    "columnMeasures": {
      "cara1": "",
      "cara2": "",
      "cara3": "",
      "cara4": ""
    },
    "elementos": []
  },
  "MIESD00076": {
    "tiendaId": "MIESD00076",
    "nombreTienda": "ECI SABADELL",
    "planogram": "Table 1",
    "hasPad8Pro": false,
    "hasWall": false,
    "hasMiniwall": true,
    "hasColumnas": true,
    "hasTopTables": false,
    "columnMeasures": {
      "cara1": "1105x2300",
      "cara2": "1105x2300",
      "cara3": "1120x1130",
      "cara4": "1105x2300"
    },
    "elementos": [
      {
        "id": "MIESD00076-POSM-COL-C1",
        "tipo": "columna",
        "material": "Lona / Textil",
        "nombre": "Columna · Cara 1",
        "ubicacion": "COLUMNA · Cara 1",
        "caraNumero": 1,
        "medida": "1105x2300 mm",
        "campanaOficial": "Xiaomi 17 Ultra",
        "activo": true
      },
      {
        "id": "MIESD00076-POSM-COL-C2",
        "tipo": "columna",
        "material": "Lona / Textil",
        "nombre": "Columna · Cara 2",
        "ubicacion": "COLUMNA · Cara 2",
        "caraNumero": 2,
        "medida": "1105x2300 mm",
        "campanaOficial": "Xiaomi 17T series",
        "activo": true
      },
      {
        "id": "MIESD00076-POSM-COL-C3",
        "tipo": "columna",
        "material": "Lona / Textil",
        "nombre": "Columna · Cara 3",
        "ubicacion": "COLUMNA · Cara 3",
        "caraNumero": 3,
        "medida": "1120x1130 mm",
        "campanaOficial": "Xiaomi Pad 8 series",
        "activo": true
      },
      {
        "id": "MIESD00076-POSM-COL-C4",
        "tipo": "columna",
        "material": "Lona / Textil",
        "nombre": "Columna · Cara 4",
        "ubicacion": "COLUMNA · Cara 4",
        "caraNumero": 4,
        "medida": "1105x2300 mm",
        "campanaOficial": "Redmi Note 17 series",
        "activo": true
      }
    ]
  },
  "MIESD00088": {
    "tiendaId": "MIESD00088",
    "nombreTienda": "ECI TARRAGONA",
    "planogram": "",
    "hasPad8Pro": false,
    "hasWall": false,
    "hasMiniwall": false,
    "hasColumnas": false,
    "hasTopTables": false,
    "columnMeasures": {
      "cara1": "",
      "cara2": "",
      "cara3": "",
      "cara4": ""
    },
    "elementos": []
  },
  "MIESD00104": {
    "tiendaId": "MIESD00104",
    "nombreTienda": "ECI ZARAGOZA",
    "planogram": "Table 1",
    "hasPad8Pro": false,
    "hasWall": false,
    "hasMiniwall": true,
    "hasColumnas": true,
    "hasTopTables": false,
    "columnMeasures": {
      "cara1": "985x2295",
      "cara2": "695x2295",
      "cara3": "985x1120",
      "cara4": "695x2295"
    },
    "elementos": [
      {
        "id": "MIESD00104-POSM-COL-C1",
        "tipo": "columna",
        "material": "Lona / Textil",
        "nombre": "Columna · Cara 1",
        "ubicacion": "COLUMNA · Cara 1",
        "caraNumero": 1,
        "medida": "985x2295 mm",
        "campanaOficial": "Xiaomi 17 Ultra",
        "activo": true
      },
      {
        "id": "MIESD00104-POSM-COL-C2",
        "tipo": "columna",
        "material": "Lona / Textil",
        "nombre": "Columna · Cara 2",
        "ubicacion": "COLUMNA · Cara 2",
        "caraNumero": 2,
        "medida": "695x2295 mm",
        "campanaOficial": "Redmi Note 17 series",
        "activo": true
      },
      {
        "id": "MIESD00104-POSM-COL-C3",
        "tipo": "columna",
        "material": "Lona / Textil",
        "nombre": "Columna · Cara 3",
        "ubicacion": "COLUMNA · Cara 3",
        "caraNumero": 3,
        "medida": "985x1120 mm",
        "campanaOficial": "Xiaomi Pad 8 series",
        "activo": true
      },
      {
        "id": "MIESD00104-POSM-COL-C4",
        "tipo": "columna",
        "material": "Lona / Textil",
        "nombre": "Columna · Cara 4",
        "ubicacion": "COLUMNA · Cara 4",
        "caraNumero": 4,
        "medida": "695x2295 mm",
        "campanaOficial": "Xiaomi 17T series",
        "activo": true
      }
    ]
  },
  "MIESS00018": {
    "tiendaId": "MIESS00018",
    "nombreTienda": "FNAC Illa",
    "planogram": "",
    "hasPad8Pro": false,
    "hasWall": false,
    "hasMiniwall": false,
    "hasColumnas": false,
    "hasTopTables": false,
    "columnMeasures": {
      "cara1": "",
      "cara2": "",
      "cara3": "",
      "cara4": ""
    },
    "elementos": []
  },
  "MIESD00149": {
    "tiendaId": "MIESD00149",
    "nombreTienda": "FNAC Plaza España",
    "planogram": "Table FNAC",
    "hasPad8Pro": false,
    "hasWall": false,
    "hasMiniwall": false,
    "hasColumnas": false,
    "hasTopTables": true,
    "columnMeasures": {
      "cara1": "",
      "cara2": "",
      "cara3": "",
      "cara4": ""
    },
    "elementos": [
      {
        "id": "MIESD00149-POSM-TT-C1",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 1 (Mesa 1 Cara A)",
        "ubicacion": "MESA 1 · Franja Central (Cara A)",
        "caraNumero": 1,
        "medida": "520X315 mm",
        "campanaOficial": "Xiaomi 17 Ultra",
        "activo": true
      },
      {
        "id": "MIESD00149-POSM-TT-C2",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 2 (Mesa 1 Cara B)",
        "ubicacion": "MESA 1 · Franja Central (Cara B)",
        "caraNumero": 2,
        "medida": "520X315 mm",
        "campanaOficial": "Redmi Note 15 Series",
        "activo": true
      }
    ]
  },
  "MIESD00145": {
    "tiendaId": "MIESD00145",
    "nombreTienda": "FNAC Arenas",
    "planogram": "Table FNAC",
    "hasPad8Pro": false,
    "hasWall": false,
    "hasMiniwall": false,
    "hasColumnas": false,
    "hasTopTables": true,
    "columnMeasures": {
      "cara1": "",
      "cara2": "",
      "cara3": "",
      "cara4": ""
    },
    "elementos": [
      {
        "id": "MIESD00145-POSM-TT-C1",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 1 (Mesa 1 Cara A)",
        "ubicacion": "MESA 1 · Franja Central (Cara A)",
        "caraNumero": 1,
        "medida": "520X320 mm",
        "campanaOficial": "Xiaomi 17 Ultra",
        "activo": true
      },
      {
        "id": "MIESD00145-POSM-TT-C2",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 2 (Mesa 1 Cara B)",
        "ubicacion": "MESA 1 · Franja Central (Cara B)",
        "caraNumero": 2,
        "medida": "520X320 mm",
        "campanaOficial": "Redmi Note 15 series",
        "activo": true
      }
    ]
  },
  "MIESD00144": {
    "tiendaId": "MIESD00144",
    "nombreTienda": "FNAC Maquinista",
    "planogram": "",
    "hasPad8Pro": false,
    "hasWall": false,
    "hasMiniwall": false,
    "hasColumnas": false,
    "hasTopTables": false,
    "columnMeasures": {
      "cara1": "",
      "cara2": "",
      "cara3": "",
      "cara4": ""
    },
    "elementos": []
  },
  "MIESD00638": {
    "tiendaId": "MIESD00638",
    "nombreTienda": "CRF Cabrera",
    "planogram": "Table CRF",
    "hasPad8Pro": false,
    "hasWall": false,
    "hasMiniwall": false,
    "hasColumnas": false,
    "hasTopTables": true,
    "columnMeasures": {
      "cara1": "",
      "cara2": "",
      "cara3": "",
      "cara4": ""
    },
    "elementos": [
      {
        "id": "MIESD00638-POSM-TT-C1",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 1 (Mesa 1 Cara A)",
        "ubicacion": "MESA 1 · Franja Central (Cara A)",
        "caraNumero": 1,
        "medida": "900x280 mm",
        "campanaOficial": "Redmi Note 15 Series",
        "activo": true
      },
      {
        "id": "MIESD00638-POSM-TT-C2",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 2 (Mesa 1 Cara B)",
        "ubicacion": "MESA 1 · Franja Central (Cara B)",
        "caraNumero": 2,
        "medida": "900x280 mm",
        "campanaOficial": "Redmi Note 15 Series",
        "activo": true
      }
    ]
  },
  "MIESO00015": {
    "tiendaId": "MIESO00015",
    "nombreTienda": "CRF Manresa",
    "planogram": "Table CRF",
    "hasPad8Pro": false,
    "hasWall": false,
    "hasMiniwall": false,
    "hasColumnas": false,
    "hasTopTables": true,
    "columnMeasures": {
      "cara1": "",
      "cara2": "",
      "cara3": "",
      "cara4": ""
    },
    "elementos": [
      {
        "id": "MIESO00015-POSM-TT-C1",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 1 (Mesa 1 Cara A)",
        "ubicacion": "MESA 1 · Franja Central (Cara A)",
        "caraNumero": 1,
        "medida": "900x280 mm",
        "campanaOficial": "Redmi Note 15 Series",
        "activo": true
      },
      {
        "id": "MIESO00015-POSM-TT-C2",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 2 (Mesa 1 Cara B)",
        "ubicacion": "MESA 1 · Franja Central (Cara B)",
        "caraNumero": 2,
        "medida": "900x280 mm",
        "campanaOficial": "Redmi Note 15 Series",
        "activo": true
      }
    ]
  },
  "MIESP00031": {
    "tiendaId": "MIESP00031",
    "nombreTienda": "CRF Maquinista",
    "planogram": "Table CRF",
    "hasPad8Pro": false,
    "hasWall": false,
    "hasMiniwall": false,
    "hasColumnas": false,
    "hasTopTables": true,
    "columnMeasures": {
      "cara1": "",
      "cara2": "",
      "cara3": "",
      "cara4": ""
    },
    "elementos": [
      {
        "id": "MIESP00031-POSM-TT-C1",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 1 (Mesa 1 Cara A)",
        "ubicacion": "MESA 1 · Franja Central (Cara A)",
        "caraNumero": 1,
        "medida": "911x291 mm",
        "campanaOficial": "Redmi Note 15 Series",
        "activo": true
      },
      {
        "id": "MIESP00031-POSM-TT-C2",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 2 (Mesa 1 Cara B)",
        "ubicacion": "MESA 1 · Franja Central (Cara B)",
        "caraNumero": 2,
        "medida": "911x291 mm",
        "campanaOficial": "Redmi Note 15 Series",
        "activo": true
      }
    ]
  },
  "MIESO00009": {
    "tiendaId": "MIESO00009",
    "nombreTienda": "CRF Gran Vía 2",
    "planogram": "Table CRF",
    "hasPad8Pro": false,
    "hasWall": false,
    "hasMiniwall": false,
    "hasColumnas": false,
    "hasTopTables": true,
    "columnMeasures": {
      "cara1": "",
      "cara2": "",
      "cara3": "",
      "cara4": ""
    },
    "elementos": [
      {
        "id": "MIESO00009-POSM-TT-C1",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 1 (Mesa 1 Cara A)",
        "ubicacion": "MESA 1 · Franja Central (Cara A)",
        "caraNumero": 1,
        "medida": "900x280 mm",
        "campanaOficial": "Redmi Note 15 Series",
        "activo": true
      },
      {
        "id": "MIESO00009-POSM-TT-C2",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 2 (Mesa 1 Cara B)",
        "ubicacion": "MESA 1 · Franja Central (Cara B)",
        "caraNumero": 2,
        "medida": "900x280 mm",
        "campanaOficial": "Redmi Note 15 Series",
        "activo": true
      }
    ]
  },
  "MIESD00069": {
    "tiendaId": "MIESD00069",
    "nombreTienda": "CRF Augusta",
    "planogram": "Table Premium",
    "hasPad8Pro": false,
    "hasWall": false,
    "hasMiniwall": false,
    "hasColumnas": false,
    "hasTopTables": true,
    "columnMeasures": {
      "cara1": "",
      "cara2": "",
      "cara3": "",
      "cara4": ""
    },
    "elementos": [
      {
        "id": "MIESD00069-POSM-TT-C1",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 1 (Mesa 1 Cara A)",
        "ubicacion": "MESA 1 · Franja Central (Cara A)",
        "caraNumero": 1,
        "medida": "1420X1035 mm",
        "campanaOficial": "Redmi Note 15 series",
        "activo": true
      }
    ]
  },
  "MIESO00023": {
    "tiendaId": "MIESO00023",
    "nombreTienda": "CRF Tarragona",
    "planogram": "Table CRF",
    "hasPad8Pro": false,
    "hasWall": false,
    "hasMiniwall": false,
    "hasColumnas": false,
    "hasTopTables": true,
    "columnMeasures": {
      "cara1": "",
      "cara2": "",
      "cara3": "",
      "cara4": ""
    },
    "elementos": [
      {
        "id": "MIESO00023-POSM-TT-C1",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 1 (Mesa 1 Cara A)",
        "ubicacion": "MESA 1 · Franja Central (Cara A)",
        "caraNumero": 1,
        "medida": "900x280 mm",
        "campanaOficial": "Redmi Note 15 series",
        "activo": true
      },
      {
        "id": "MIESO00023-POSM-TT-C2",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 2 (Mesa 1 Cara B)",
        "ubicacion": "MESA 1 · Franja Central (Cara B)",
        "caraNumero": 2,
        "medida": "900x280 mm",
        "campanaOficial": "Redmi Note 15 series",
        "activo": true
      }
    ]
  },
  "MIESP03652": {
    "tiendaId": "MIESP03652",
    "nombreTienda": "Alcampo Utebo",
    "planogram": "Table Alcampo",
    "hasPad8Pro": false,
    "hasWall": false,
    "hasMiniwall": false,
    "hasColumnas": false,
    "hasTopTables": true,
    "columnMeasures": {
      "cara1": "",
      "cara2": "",
      "cara3": "",
      "cara4": ""
    },
    "elementos": [
      {
        "id": "MIESP03652-POSM-TT-C1",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 1 (Mesa 1 Cara A)",
        "ubicacion": "MESA 1 · Franja Central (Cara A)",
        "caraNumero": 1,
        "medida": "900x280 mm",
        "campanaOficial": "Redmi Note 15 Series",
        "activo": true
      },
      {
        "id": "MIESP03652-POSM-TT-C2",
        "tipo": "top_table",
        "material": "Duratrans / Filmina",
        "nombre": "Top Table · Cara 2 (Mesa 1 Cara B)",
        "ubicacion": "MESA 1 · Franja Central (Cara B)",
        "caraNumero": 2,
        "medida": "900x280 mm",
        "campanaOficial": "Redmi Note 15 Series",
        "activo": true
      }
    ]
  }
};

/**
 * Obtiene la configuración POSM de una tienda por su código (tiendaId).
 * Si la tienda tiene columnas Y miniwall, identifica la cara de columna con menor
 * superficie (ancho × alto en mm²) y la marca con esMiniwall=true, ya que esa
 * cara actúa como el miniwall (lona de menor tamaño).
 */
export const getStorePosmConfig = (storeId?: string): StorePosmConfig | undefined => {
  if (!storeId) return undefined;
  const cleanId = storeId.trim().toUpperCase();
  const raw = STORE_POSM_DATA[cleanId] || Object.values(STORE_POSM_DATA).find(s => s.tiendaId.toUpperCase() === cleanId);
  if (!raw) return undefined;

  // Si la tienda tiene columnas Y miniwall, marcar la cara de columna de menor área como MiniWall
  if (raw.hasColumnas && raw.hasMiniwall) {
    const caras = raw.elementos.filter(e => e.tipo === 'columna');

    // Parsea "845X1875" → área en mm² (devuelve 0 si no parseable)
    const parseArea = (medida: string): number => {
      const m = medida.replace(/\s*mm\s*/i, '').match(/(\d+)[xX×](\d+)/);
      return m ? parseInt(m[1]) * parseInt(m[2]) : 0;
    };

    if (caras.length > 0) {
      let minArea = Infinity;
      let minId = '';
      caras.forEach(c => {
        const area = parseArea(c.medida);
        if (area > 0 && area < minArea) { minArea = area; minId = c.id; }
      });

      // Devolver config con elementos actualizados (esMiniwall en la cara más pequeña)
      return {
        ...raw,
        elementos: raw.elementos.map(e =>
          e.id === minId ? { ...e, esMiniwall: true } : e
        )
      };
    }
  }

  return raw;
};

/**
 * Obtiene la lista de elementos POSM activos para una tienda dada.
 */
export const getPosmElementsForStore = (storeId?: string): StorePosmItem[] => {
  const cfg = getStorePosmConfig(storeId);
  return cfg ? cfg.elementos : [];
};

/**
 * Determina si una tienda pertenece al listado exclusivo de centros MediaMarkt
 * que llevan el apartado "Cubrecestas" de Xiaomi 18 Pro en POSM:
 * - Media Barcelona (Media Badalona / Media Barcelona)
 * - Media Girona
 * - Media Barcelona 5 Fontanella
 * - Media Tarragona
 * - Media El Prat
 * - Media Diagonal Mar
 * - Media Sant Cugat
 * - Media Mataro
 * - Media Lleida
 * - Media Zaragoza Puerto Venecia (Media Zaragoza 2 / PTO Venecia)
 * - Media Parets
 * - Media Terrassa
 */
const CUBRECESTAS_EXCLUSIVE_STORE_IDS = new Set<string>([
  'MIESP00034', // Media Badalona / Media Barcelona
  'MIESD00182', // Media Girona
  'MIESD00174', // Media Barcelona 5 Fontanella
  'MIESO00043', // Media Tarragona
  'MIESD00175', // Media El Prat
  'MIESS00026', // Media Diagonal Mar-Barcelona
  'MIESD00180', // Media Sant Cugat (Barcelona)
  'MIESD00177', // Media Mataro
  'MIESD00187', // Media Lleida
  'MIESD00204', // Media Zaragoza 2 (Puerto Venecia)
  'MIESD00178', // Media Parets
  'MIESD00179'  // Media Terrassa
]);

const CUBRECESTAS_EXCLUSIVE_STORE_NAMES = new Set<string>([
  'media barcelona',
  'media badalona',
  'media girona',
  'media barcelona 5 fontanella',
  'media fontanella',
  'media tarragona',
  'mediamarkt tarragona',
  'media el prat',
  'media diagonal mar',
  'media diagonal mar-barcelona',
  'media sant cugat',
  'media sant cugat (barcelona)',
  'media mataro',
  'media lleida',
  'media zaragoza puerto venecia',
  'media zaragoza pto venecia',
  'media zaragoza 2',
  'media parets',
  'media terrassa'
]);

export const hasCubrecestasForStore = (store: StoreCenter): boolean => {
  const storeId = (store.tiendaId || '').trim().toUpperCase();
  if (CUBRECESTAS_EXCLUSIVE_STORE_IDS.has(storeId)) {
    return true;
  }
  const normalizedName = (store.nombreTienda || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^mediamarkt\s+/i, 'media ')
    .replace(/\s+/g, ' ');
  return CUBRECESTAS_EXCLUSIVE_STORE_NAMES.has(normalizedName);
};

/**
 * Convierte los elementos POSM de una tienda en definiciones de elementos visuales
 * para el módulo de Nueva Implantación (lanzamiento oficial).
 * 
 * Se limita exclusivamente según especificación oficial a:
 * 1. Tiendas con lona Xiaomi 17 Ultra (Wall o Miniwall) -> cambio a Xiaomi 18 Pro / 18 Series.
 * 2. Tiendas con duratrans (Top Table) -> la franja que pertenece a Xiaomi 17 Ultra (Cara 1 / Cara A) se modifica por Xiaomi 18 Series.
 * 3. Tiendas con columna -> la cara de Xiaomi 17 Ultra (Cara 1) se modifica a Xiaomi 18 Series.
 * 4. Luminoso -> se mantiene referencia de retirada Xiaomi 17T y se instala el nuevo de Xiaomi 18 Pro.
 * 5. Cubrecestas -> exclusivo en las 12 tiendas seleccionadas de MediaMarkt (colocación obligatoria en 2.ª posición).
 */
export const getDynamicPosmDefinitionsForImplantation = (store: StoreCenter): VisualElementDefinition[] => {
  const config = getStorePosmConfig(store.tiendaId);
  const defs: VisualElementDefinition[] = [];

  const isMediaMarktStore =
    (store.retailer || '').toLowerCase().includes('mediamarkt') ||
    (store.nombreTienda || '').toLowerCase().startsWith('media');

  const hasWallSpace = Boolean(
    config?.hasWall ||
      store.availableSpaces?.some((s) => {
        const u = s.toUpperCase().trim();
        return u === 'WALL' || (u.includes('WALL') && !u.includes('MINIWALL'));
      })
  );

  // 1. Tiendas con lona Xiaomi 17 Ultra (Wall o Miniwall) -> cambio a Xiaomi 18 Pro / Series
  if (hasWallSpace) {
    const wallItem = config?.elementos.find((el) => el.tipo === 'wall');
    defs.push({
      id: `${store.tiendaId}-POSM-WALL-X18`,
      nombreElemento: isMediaMarktStore ? 'Lona Wall · Xiaomi 18 Pro' : 'Lona Wall · Xiaomi 18 Series',
      tipoMaterial: 'Textil / Lona',
      ubicacionEspacio: 'WALL (Muro retroiluminado)',
      campanaOficial: 'Lanzamiento Xiaomi 18 Pro Max',
      medidasOficiales: wallItem?.medida || 'Muro retroiluminado',
      instruccionesFijacion: isMediaMarktStore
        ? 'Retirar la lona actual de Xiaomi 17 Ultra e instalar la nueva lona oficial de Xiaomi 18 Pro en el bastidor retroiluminado del Wall, insertando el perfil de silicona perimetral de forma tensa y sin arrugas.'
        : 'Sustituir la lona anterior de Xiaomi 17 Ultra por la nueva lona de Xiaomi 18 Series, insertando el perfil de silicona perimetral en el bastidor con la espátula perimetral.',
      guiaVisualTipo: 'lona_mesa',
      imagenReferenciaAntes: isMediaMarktStore
        ? './images/posm/lona_wall_mm_antes.jpg'
        : './images/posm/lona_wall_antes.png',
      imagenReferenciaDespues: isMediaMarktStore
        ? './images/posm/lona_wall_mm_despues.jpg'
        : './images/posm/lona_wall_despues.png'
    });
  }

  // Solo mostrar la lona de Miniwall cuando la tienda NO tiene columna de 4 lados (solo tiene 1 lado / MiniWall).
  // Cuando tiene columna de 4 lados, la lona de Xiaomi 17 Ultra -> Xiaomi 18 Series es la Cara 1 de la Columna.
  if (config?.hasMiniwall && !config?.hasColumnas) {
    const miniwallItem = config.elementos.find((el) => el.tipo === 'miniwall');
    defs.push({
      id: `${store.tiendaId}-POSM-MINIWALL-X18`,
      nombreElemento: 'Lona Miniwall · Xiaomi 18 Series',
      tipoMaterial: 'Textil / Lona',
      ubicacionEspacio: 'MINIWALL (Bastidor textil)',
      campanaOficial: 'Lanzamiento Xiaomi 18 Pro Max',
      medidasOficiales: miniwallItem?.medida || '650x460 mm',
      instruccionesFijacion:
        'Sustituir la minilona anterior de Xiaomi 17 Ultra por la nueva lona de Xiaomi 18 Series, extendiéndola tensa y sin arrugas en el bastidor textil.',
      guiaVisualTipo: 'lona_mesa',
      imagenReferenciaAntes: './images/posm/lona_miniwall_x17.jpg',
      imagenReferenciaDespues: './images/posm/miniwall_render.jpg'
    });
  }

  // 2. Tiendas con duratrans (Top Table) -> La cara perteneciente a Xiaomi 17 Ultra (Cara 1) se modifica por Xiaomi 18 Series
  if (config?.hasTopTables) {
    const ttCara1 =
      config.elementos.find((el) => el.tipo === 'top_table' && (el.caraNumero === 1 || el.campanaOficial.toLowerCase().includes('17 ultra'))) ||
      config.elementos.find((el) => el.tipo === 'top_table');
    defs.push({
      id: `${store.tiendaId}-POSM-TT-C1-X18`,
      nombreElemento: 'Duratrans Top Table · Xiaomi 18 Series (Mesa 1 Cara A)',
      tipoMaterial: 'Duratrans / Filmina',
      ubicacionEspacio: 'MESA 1 · Franja Central (Cara A)',
      campanaOficial: 'Lanzamiento Xiaomi 18 Pro Max',
      medidasOficiales: ttCara1?.medida || '1150X275 mm',
      instruccionesFijacion:
        'Sustituir la filmina Duratrans de Xiaomi 17 Ultra por el nuevo Duratrans de Xiaomi 18 Series en la guía central de la mesa, centrada y protegida bajo el metacrilato.',
      guiaVisualTipo: 'top_table',
      imagenReferenciaAntes: './images/tables/table1_cara1_render.jpg',
      imagenReferenciaDespues: './images/tables/table1_cara1_xiaomi18_render.jpg'
    });
  }

  // 3. Tiendas con columna -> La cara de Xiaomi 17 Ultra (Cara 1) se modifica a Xiaomi 18 Series
  if (config?.hasColumnas) {
    const colCara1 =
      config.elementos.find((el) => el.tipo === 'columna' && (el.caraNumero === 1 || el.campanaOficial.toLowerCase().includes('17 ultra'))) ||
      config.elementos.find((el) => el.tipo === 'columna');
    defs.push({
      id: `${store.tiendaId}-POSM-COL-C1-X18`,
      nombreElemento: 'Lona Columna Cara 1 · Xiaomi 18 Series',
      tipoMaterial: 'Textil / Lona',
      ubicacionEspacio: 'Columna · Cara 1 (Frontal principal)',
      campanaOficial: 'Lanzamiento Xiaomi 18 Pro Max',
      medidasOficiales: config.columnMeasures?.cara1 || colCara1?.medida || 'Columna Cara 1',
      instruccionesFijacion:
        'Sustituir la lona anterior de Xiaomi 17 Ultra por la nueva lona textil de Xiaomi 18 Series tensada en la perfilería de la columna, sin arrugas y alineada con el zócalo.',
      guiaVisualTipo: 'columna',
      imagenReferenciaAntes: './images/posm/cara1_xiaomi17ultra.jpg',
      imagenReferenciaDespues: './images/posm/cara1_xiaomi17ultra.jpg'
    });
  }

  // 4. Luminoso Xiaomi 18 Pro -> Mantiene retirada de Xiaomi 17T y añade el nuevo de Xiaomi 18 Pro
  defs.push({
    id: `${store.tiendaId}-POSM-LUM-X18`,
    nombreElemento: 'Luminoso · Xiaomi 18 Pro',
    tipoMaterial: 'Luminoso / Metacrilato',
    ubicacionEspacio: 'MESA 1 · Lineal / Expositor',
    campanaOficial: 'Lanzamiento Xiaomi 18 Pro Max',
    medidasOficiales: 'Luminoso de sobremesa / lineal',
    instruccionesFijacion:
      'Retirar el luminoso anterior de Xiaomi 17T e instalar el nuevo luminoso oficial de Xiaomi 18 Pro Series (Mi | Leica). Comprobar que queda correctamente fijado y encendido.',
    guiaVisualTipo: 'luminoso',
    imagenReferenciaAntes: './images/posm/luminoso_xiaomi17t_antes.jpg',
    imagenReferenciaDespues: './images/posm/luminoso_xiaomi18pro_despues.jpg'
  });

  // 5. Cubrecestas Xiaomi 18 Pro -> Exclusivamente en las 12 tiendas seleccionadas de MediaMarkt (2.ª posición)
  if (hasCubrecestasForStore(store)) {
    defs.push({
      id: `${store.tiendaId}-POSM-CUBRECESTAS-X18`,
      nombreElemento: 'Cubrecestas · Xiaomi 18 Pro',
      tipoMaterial: 'Cubrecestas',
      ubicacionEspacio: 'Línea de Cestas · 2.ª Posición (Obligatorio)',
      campanaOficial: 'Lanzamiento Xiaomi 18 Pro Max',
      medidasOficiales: 'Ubicación obligatoria: 2.ª Posición',
      instruccionesFijacion:
        'IMPORTANTE: El cubrecestas de Xiaomi 18 Pro debe colocarse obligatoriamente en la SEGUNDA POSICIÓN (2.ª posición). Verifica que quede correctamente encajado y visible en el lineal de cestas.',
      guiaVisualTipo: 'cubrecestas',
      imagenReferenciaDespues: './images/posm/cubrecestas_xiaomi18pro.jpg'
    });
  }

  return defs;
};

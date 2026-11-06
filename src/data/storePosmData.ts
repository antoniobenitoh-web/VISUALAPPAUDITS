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
    "hasColumnas": true,
    "hasTopTables": false,
    "columnMeasures": {
      "cara1": "650x460",
      "cara2": "",
      "cara3": "",
      "cara4": ""
    },
    "elementos": [
      {
        "id": "MIESS00026-POSM-COL-C1",
        "tipo": "columna",
        "material": "Lona / Textil",
        "nombre": "Columna · Cara 1",
        "ubicacion": "COLUMNA · Cara 1",
        "caraNumero": 1,
        "medida": "650x460 mm",
        "campanaOficial": "Xiaomi 17 Ultra",
        "activo": true
      },
      {
        "id": "MIESS00026-POSM-MINIWALL",
        "tipo": "miniwall",
        "material": "Lona / Textil",
        "nombre": "Lona de MiniWall",
        "ubicacion": "MINIWALL · Bastidor Textil",
        "caraNumero": 1,
        "medida": "1000x1100 mm",
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
      },
      {
        "id": "MIESD00176-POSM-MINIWALL",
        "tipo": "miniwall",
        "material": "Lona / Textil",
        "nombre": "Lona de MiniWall",
        "ubicacion": "MINIWALL · Bastidor Textil",
        "caraNumero": 1,
        "medida": "1000x1100 mm",
        "campanaOficial": "Xiaomi 17 Ultra",
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
      },
      {
        "id": "MIESS00002-POSM-MINIWALL",
        "tipo": "miniwall",
        "material": "Lona / Textil",
        "nombre": "Lona de MiniWall",
        "ubicacion": "MINIWALL · Bastidor Textil",
        "caraNumero": 1,
        "medida": "1000x1100 mm",
        "campanaOficial": "Xiaomi 17 Ultra",
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
      },
      {
        "id": "MIESD00121-POSM-MINIWALL",
        "tipo": "miniwall",
        "material": "Lona / Textil",
        "nombre": "Lona de MiniWall",
        "ubicacion": "MINIWALL · Bastidor Textil",
        "caraNumero": 1,
        "medida": "1000x1100 mm",
        "campanaOficial": "XIAOMI 17 ULTRA",
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
      },
      {
        "id": "MIESD00076-POSM-MINIWALL",
        "tipo": "miniwall",
        "material": "Lona / Textil",
        "nombre": "Lona de MiniWall",
        "ubicacion": "MINIWALL · Bastidor Textil",
        "caraNumero": 1,
        "medida": "1000x1100 mm",
        "campanaOficial": "Xiaomi 17 Ultra",
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
      },
      {
        "id": "MIESD00104-POSM-MINIWALL",
        "tipo": "miniwall",
        "material": "Lona / Textil",
        "nombre": "Lona de MiniWall",
        "ubicacion": "MINIWALL · Bastidor Textil",
        "caraNumero": 1,
        "medida": "1000x1100 mm",
        "campanaOficial": "Xiaomi 17 Ultra",
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
 * Convierte los elementos POSM de una tienda en definiciones de elementos visuales
 * para el módulo de Nueva Implantación (lanzamiento oficial).
 */
export const getDynamicPosmDefinitionsForImplantation = (store: StoreCenter): VisualElementDefinition[] => {
  const posmItems = getPosmElementsForStore(store.tiendaId);
  const defs: VisualElementDefinition[] = [];

  posmItems.forEach((item) => {
    if (item.tipo === 'columna') {
      // Imagen de referencia por campaña de cara (Cara 1=Ultra, 2=17T, 3=Redmi, 4=Pad)
      const faceImgMap: Record<number, string> = {
        1: './images/posm/cara1_xiaomi17ultra.jpg',
        2: './images/posm/cara2_xiaomi17t.jpg',
        3: './images/posm/cara3_redminote17.jpg',
        4: './images/posm/cara4_xiaoipad8.jpg',
      };
      const imgRef = faceImgMap[item.caraNumero] || './images/posm/cara1_xiaomi17ultra.jpg';
      defs.push({
        id: item.id,
        nombreElemento: item.nombre,
        tipoMaterial: 'Textil / Lona',
        ubicacionEspacio: item.ubicacion,
        campanaOficial: item.campanaOficial,
        medidasOficiales: item.medida,
        instruccionesFijacion: 'Colocar la nueva lona textil tensada en la perfilería de la columna, sin arrugas y alineada con el zócalo.',
        guiaVisualTipo: 'columna',
        imagenReferenciaDespues: imgRef
      });
    } else if (item.tipo === 'wall') {
      defs.push({
        id: item.id,
        nombreElemento: item.nombre,
        tipoMaterial: 'Textil / Lona',
        ubicacionEspacio: item.ubicacion,
        campanaOficial: item.campanaOficial || 'Lanzamiento Xiaomi 18 Series',
        medidasOficiales: item.medida,
        instruccionesFijacion: 'Insertar el perfil de silicona de la lona en el bastidor retroiluminado con la espátula perimetral.',
        guiaVisualTipo: 'lona_mesa',
        imagenReferenciaDespues: './images/posm/lona_wall_despues.png'
      });
    } else if (item.tipo === 'miniwall') {
      defs.push({
        id: item.id,
        nombreElemento: item.nombre,
        tipoMaterial: 'Textil / Lona',
        ubicacionEspacio: item.ubicacion,
        campanaOficial: item.campanaOficial || 'Lanzamiento Xiaomi 18 Series',
        medidasOficiales: item.medida,
        instruccionesFijacion: 'Extender y fijar la lona de miniwall tensa en el bastidor textil.',
        guiaVisualTipo: 'lona_mesa',
        imagenReferenciaDespues: './images/posm/lona_wall_despues.png'
      });
    } else if (item.tipo === 'top_table') {
      defs.push({
        id: item.id,
        nombreElemento: item.nombre,
        tipoMaterial: 'Duratrans / Filmina',
        ubicacionEspacio: item.ubicacion,
        campanaOficial: item.campanaOficial,
        medidasOficiales: item.medida,
        instruccionesFijacion: 'Insertar la filmina Duratrans en la guía central de la mesa, centrada y protegida bajo el metacrilato.',
        guiaVisualTipo: 'top_table',
        imagenReferenciaDespues: './images/posm/faldon_mesa1.png'
      });
    }
  });

  // Si la tienda tiene mesa 1: añadimos la pantalla Hanshow y el faldón de mesa
  const hasMesa1 = Boolean(store.availableSpaces?.some(s => s.toUpperCase().includes('MESA 1')));
  if (hasMesa1) {
    defs.push({
      id: store.tiendaId + '-POSM-HANSHOW',
      nombreElemento: 'Actualizar Pantalla de Hanshow',
      tipoMaterial: 'Pantalla Digital / Hanshow',
      ubicacionEspacio: 'MESA 1 · Pantalla Digital Hanshow',
      campanaOficial: 'Cambio de cartel: Xiaomi 18 Pro & Pro Max',
      medidasOficiales: 'Punto de acceso: Hanshow | Contraseña: 12345678',
      instruccionesFijacion: 'Crear un punto de acceso desde un teléfono con el nombre "Hanshow" y la contraseña "12345678". Desconectar la pantalla y volverla a conectar para que se actualice.',
      guiaVisualTipo: 'hanshow_screen',
      imagenReferenciaDespues: './images/posm/hanshow_despues.png'
    });

    defs.push({
      id: store.tiendaId + '-POSM-FALDON-M1C1',
      nombreElemento: 'Faldón 18 Pro Max — Mesa 1 Cara 1',
      tipoMaterial: 'Faldón Mesa / Vinilo',
      ubicacionEspacio: 'MESA 1 · Cara 1 (Lateral / Frontal de Mesa)',
      campanaOficial: 'MAX POWER · Xiaomi 18 Pro Max · MAX POWER',
      medidasOficiales: 'Lateral de Mesa 1 Cara 1',
      instruccionesFijacion: 'Colocar el faldón de Xiaomi 18 Pro Max en el lateral de la Mesa 1 Cara 1 según la imagen de referencia.',
      guiaVisualTipo: 'faldon_mesa',
      imagenReferenciaDespues: './images/posm/faldon_mesa1.png'
    });
  }

  return defs;
};

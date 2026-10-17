import { RetailerInfo, UserProfile, StoreCenter, SpaceType, PlanogramPosition, ProductCategory } from '../types';

export const SPREADSHEET_ID = '1s9hGfmS7tqvD3hP-QktLyDsTo_fRn7q8r0IMc1Dy-uo';

export const INITIAL_RETAILERS: RetailerInfo[] = [
  {
    id: 'MediaMarkt',
    name: 'MediaMarkt',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Media_Markt_logo.svg',
    brandColor: '#df0000',
    accentColor: '#b00000',
    status: 'active'
  },
  {
    id: 'El Corte Inglés',
    name: 'El Corte Inglés',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/23/El_Corte_Ingl%C3%A9s_logo.svg',
    brandColor: '#005b38',
    accentColor: '#004329',
    status: 'active'
  },
  {
    id: 'FNAC',
    name: 'FNAC',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Fnac_Logo.svg',
    brandColor: '#e1a100',
    accentColor: '#c58d00',
    status: 'active'
  },
  {
    id: 'Carrefour',
    name: 'Carrefour',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Carrefour_logo.svg',
    brandColor: '#0055a5',
    accentColor: '#003e7a',
    status: 'active'
  },
  {
    id: 'Alcampo',
    name: 'Alcampo',
    logo: '/images/retailers/alcampo.png',
    brandColor: '#e2001a',
    accentColor: '#b50015',
    status: 'active'
  }
];

export const INITIAL_USERS: UserProfile[] = [
  {
    email: 'mmtarragona@salesland.net',
    nombre: 'Promotor Media Tarragona',
    rol: 'Promotor',
    retailer: 'MediaMarkt',
    zona: 'Cataluña',
    region: 'Noreste',
    tiendaAsignadaId: 'MIESD00174'
  },
  {
    email: 'ricardo.dahdah@salesland.net',
    nombre: 'Ricardo Dahdah',
    rol: 'GPV',
    retailer: 'MediaMarkt',
    zona: 'Cataluña',
    region: 'Noreste'
  },
  {
    email: 'antoniobenitoh@salesland.net',
    nombre: 'Antonio Benito',
    rol: 'AM',
    region: 'Nacional'
  },
  {
    email: 'admin@salesland.net',
    nombre: 'SuperAdmin Central Salesland',
    rol: 'SuperAdmin',
    region: 'Global'
  }
];

export const INITIAL_STORES: StoreCenter[] = [
  {
    "tiendaId": "MIESD00575",
    "retailer": "MediaMarkt",
    "nombreTienda": "Media Sant Antoni",
    "tipoEspacioId": "Table 1",
    "zona": "Cataluña",
    "region": "Noreste",
    "totalPuestos": 22,
    "availableSpaces": [
      "MESA 1 · Cara 1",
      "MESA 1 · Cara 2"
    ],
    "auditStatus": "Pendiente",
    "hasPad8Pro": false
  },
  {
    "tiendaId": "MIESP00034",
    "retailer": "MediaMarkt",
    "nombreTienda": "Media Badalona",
    "tipoEspacioId": "Table 1",
    "zona": "Cataluña",
    "region": "Noreste",
    "totalPuestos": 22,
    "availableSpaces": [
      "MESA 1 · Cara 1",
      "MESA 1 · Cara 2"
    ],
    "auditStatus": "Pendiente",
    "hasPad8Pro": false
  },
  {
    "tiendaId": "MIESD00174",
    "retailer": "MediaMarkt",
    "nombreTienda": "Media Barcelona 5 Fontanella",
    "tipoEspacioId": "Table 2",
    "zona": "Cataluña",
    "region": "Noreste",
    "totalPuestos": 24,
    "availableSpaces": [
      "MESA 1 · Cara 1",
      "MESA 1 · Cara 2",
      "MESA 2 · Cara 1",
      "MESA 2 · Cara 2",
      "WALL",
      "LINEAL SMARTWATCH"
    ],
    "auditStatus": "Pendiente",
    "linealWearablesPlanogram": "L. Wearables_9.0",
    "linealWearablesCount": 9,
    "hasPad8Pro": true
  },
  {
    "tiendaId": "MIESO00036",
    "retailer": "MediaMarkt",
    "nombreTienda": "Media Diagonal Digital 1",
    "tipoEspacioId": "Table 1",
    "zona": "Cataluña",
    "region": "Noreste",
    "totalPuestos": 22,
    "availableSpaces": [
      "MESA 1 · Cara 1",
      "MESA 1 · Cara 2"
    ],
    "auditStatus": "Pendiente",
    "hasPad8Pro": false
  },
  {
    "tiendaId": "MIESS00026",
    "retailer": "MediaMarkt",
    "nombreTienda": "Media Diagonal Mar-Barcelona",
    "tipoEspacioId": "Table 3",
    "zona": "Cataluña",
    "region": "Noreste",
    "totalPuestos": 32,
    "availableSpaces": [
      "MESA 1 · Cara 1",
      "MESA 1 · Cara 2",
      "MESA 2 · Cara 1",
      "MESA 2 · Cara 2",
      "MESA 3 · Cara 1",
      "MESA 3 · Cara 2",
      "MINIWALL",
      "LINEAL SMARTWATCH"
    ],
    "auditStatus": "Pendiente",
    "linealWearablesPlanogram": "L. Wearables_8.0",
    "linealWearablesCount": 8,
    "hasPad8Pro": false
  },
  {
    "tiendaId": "MIESD00175",
    "retailer": "MediaMarkt",
    "nombreTienda": "Media El Prat",
    "tipoEspacioId": "Table 2",
    "zona": "Cataluña",
    "region": "Noreste",
    "totalPuestos": 20,
    "availableSpaces": [
      "MESA 1 · Cara 1",
      "MESA 1 · Cara 2",
      "MESA 2 · Cara 1",
      "MESA 2 · Cara 2",
      "LINEAL SMARTWATCH"
    ],
    "auditStatus": "Pendiente",
    "linealWearablesPlanogram": "L. Wearables_9.0",
    "linealWearablesCount": 9,
    "hasPad8Pro": false
  },
  {
    "tiendaId": "MIESO00034",
    "retailer": "MediaMarkt",
    "nombreTienda": "Media Esplugues",
    "tipoEspacioId": "Table 1",
    "zona": "Cataluña",
    "region": "Noreste",
    "totalPuestos": 12,
    "availableSpaces": [
      "MESA 1 · Cara 1",
      "MESA 1 · Cara 2",
      "LINEAL SMARTWATCH"
    ],
    "auditStatus": "Pendiente",
    "linealWearablesPlanogram": "L. Wearables_7.0",
    "linealWearablesCount": 7,
    "hasPad8Pro": false
  },
  {
    "tiendaId": "MIESO00033",
    "retailer": "MediaMarkt",
    "nombreTienda": "Media Gava",
    "tipoEspacioId": "Table 1",
    "zona": "Cataluña",
    "region": "Noreste",
    "totalPuestos": 16,
    "availableSpaces": [
      "MESA 1 · Cara 1",
      "MESA 1 · Cara 2",
      "WALL",
      "LINEAL SMARTWATCH"
    ],
    "auditStatus": "Pendiente",
    "linealWearablesPlanogram": "L. Wearables_7.0",
    "linealWearablesCount": 7,
    "hasPad8Pro": false
  },
  {
    "tiendaId": "MIESD00182",
    "retailer": "MediaMarkt",
    "nombreTienda": "Media Girona",
    "tipoEspacioId": "Table 3",
    "zona": "Cataluña",
    "region": "Noreste",
    "totalPuestos": 28,
    "availableSpaces": [
      "MESA 1 · Cara 1",
      "MESA 1 · Cara 2",
      "MESA 2 · Cara 1",
      "MESA 2 · Cara 2",
      "MESA 3 · Cara 1",
      "MESA 3 · Cara 2",
      "LINEAL SMARTWATCH"
    ],
    "auditStatus": "Pendiente",
    "linealWearablesPlanogram": "L. Wearables_9.0",
    "linealWearablesCount": 9,
    "hasPad8Pro": true
  },
  {
    "tiendaId": "MIESP00037",
    "retailer": "MediaMarkt",
    "nombreTienda": "Media Girona 2",
    "tipoEspacioId": "Table 1",
    "zona": "Cataluña",
    "region": "Noreste",
    "totalPuestos": 22,
    "availableSpaces": [
      "MESA 1 · Cara 1",
      "MESA 1 · Cara 2"
    ],
    "auditStatus": "Pendiente",
    "hasPad8Pro": false
  },
  {
    "tiendaId": "MIESM00438",
    "retailer": "MediaMarkt",
    "nombreTienda": "Media Girona 3",
    "tipoEspacioId": "Table 1",
    "zona": "Cataluña",
    "region": "Noreste",
    "totalPuestos": 22,
    "availableSpaces": [
      "MESA 1 · Cara 1",
      "MESA 1 · Cara 2"
    ],
    "auditStatus": "Pendiente",
    "hasPad8Pro": false
  },
  {
    "tiendaId": "MIESD00187",
    "retailer": "MediaMarkt",
    "nombreTienda": "Media Lleida",
    "tipoEspacioId": "Table 2",
    "zona": "Cataluña",
    "region": "Noreste",
    "totalPuestos": 20,
    "availableSpaces": [
      "MESA 1 · Cara 1",
      "MESA 1 · Cara 2",
      "MESA 2 · Cara 1",
      "MESA 2 · Cara 2",
      "LINEAL SMARTWATCH"
    ],
    "auditStatus": "Pendiente",
    "linealWearablesPlanogram": "L. Wearables_6.0",
    "linealWearablesCount": 6,
    "hasPad8Pro": true
  },
  {
    "tiendaId": "MIESD00176",
    "retailer": "MediaMarkt",
    "nombreTienda": "Media Maquinista",
    "tipoEspacioId": "Table 2",
    "zona": "Cataluña",
    "region": "Noreste",
    "totalPuestos": 24,
    "availableSpaces": [
      "MESA 1 · Cara 1",
      "MESA 1 · Cara 2",
      "MESA 2 · Cara 1",
      "MESA 2 · Cara 2",
      "MINIWALL",
      "LINEAL SMARTWATCH"
    ],
    "auditStatus": "Pendiente",
    "linealWearablesPlanogram": "L. Wearables_8.0",
    "linealWearablesCount": 8,
    "hasPad8Pro": true
  },
  {
    "tiendaId": "MIESD00177",
    "retailer": "MediaMarkt",
    "nombreTienda": "Media Mataro",
    "tipoEspacioId": "Table 1",
    "zona": "Cataluña",
    "region": "Noreste",
    "totalPuestos": 12,
    "availableSpaces": [
      "MESA 1 · Cara 1",
      "MESA 1 · Cara 2",
      "LINEAL SMARTWATCH"
    ],
    "auditStatus": "Pendiente",
    "linealWearablesPlanogram": "L. Wearables_8.0",
    "linealWearablesCount": 8,
    "hasPad8Pro": false
  },
  {
    "tiendaId": "MIESD00178",
    "retailer": "MediaMarkt",
    "nombreTienda": "Media Parets",
    "tipoEspacioId": "Table 1",
    "zona": "Cataluña",
    "region": "Noreste",
    "totalPuestos": 12,
    "availableSpaces": [
      "MESA 1 · Cara 1",
      "MESA 1 · Cara 2",
      "LINEAL SMARTWATCH"
    ],
    "auditStatus": "Pendiente",
    "linealWearablesPlanogram": "L. Wearables_9.0",
    "linealWearablesCount": 9,
    "hasPad8Pro": false
  },
  {
    "tiendaId": "MIESP03781",
    "retailer": "MediaMarkt",
    "nombreTienda": "Media Sabadell",
    "tipoEspacioId": "Table 2",
    "zona": "Cataluña",
    "region": "Noreste",
    "totalPuestos": 20,
    "availableSpaces": [
      "MESA 1 · Cara 1",
      "MESA 1 · Cara 2",
      "MESA 2 · Cara 1",
      "MESA 2 · Cara 2",
      "LINEAL SMARTWATCH"
    ],
    "auditStatus": "Pendiente",
    "linealWearablesPlanogram": "L. Wearables_7.0",
    "linealWearablesCount": 7,
    "hasPad8Pro": false
  },
  {
    "tiendaId": "MIESD00180",
    "retailer": "MediaMarkt",
    "nombreTienda": "Media Sant Cugat (Barcelona)",
    "tipoEspacioId": "Table 2",
    "zona": "Cataluña",
    "region": "Noreste",
    "totalPuestos": 24,
    "availableSpaces": [
      "MESA 1 · Cara 1",
      "MESA 1 · Cara 2",
      "MESA 2 · Cara 1",
      "MESA 2 · Cara 2",
      "WALL",
      "LINEAL SMARTWATCH"
    ],
    "auditStatus": "Pendiente",
    "linealWearablesPlanogram": "L. Wearables_9.0",
    "linealWearablesCount": 9,
    "hasPad8Pro": false
  },
  {
    "tiendaId": "MIESO00043",
    "retailer": "MediaMarkt",
    "nombreTienda": "Media Tarragona",
    "tipoEspacioId": "Table 2",
    "zona": "Cataluña",
    "region": "Noreste",
    "totalPuestos": 24,
    "availableSpaces": [
      "MESA 1 · Cara 1",
      "MESA 1 · Cara 2",
      "MESA 2 · Cara 1",
      "MESA 2 · Cara 2",
      "WALL",
      "LINEAL SMARTWATCH"
    ],
    "auditStatus": "Pendiente",
    "linealWearablesPlanogram": "L. Wearables_9.0",
    "linealWearablesCount": 9,
    "hasPad8Pro": false
  },
  {
    "tiendaId": "MIESD00179",
    "retailer": "MediaMarkt",
    "nombreTienda": "Media Terrassa",
    "tipoEspacioId": "Table 2",
    "zona": "Cataluña",
    "region": "Noreste",
    "totalPuestos": 24,
    "availableSpaces": [
      "MESA 1 · Cara 1",
      "MESA 1 · Cara 2",
      "MESA 2 · Cara 1",
      "MESA 2 · Cara 2",
      "WALL",
      "LINEAL SMARTWATCH"
    ],
    "auditStatus": "Pendiente",
    "linealWearablesPlanogram": "L. Wearables_9.0",
    "linealWearablesCount": 9,
    "hasPad8Pro": false
  },
  {
    "tiendaId": "MIESD02181",
    "retailer": "MediaMarkt",
    "nombreTienda": "Media Vilanova",
    "tipoEspacioId": "Table 2",
    "zona": "Cataluña",
    "region": "Noreste",
    "totalPuestos": 24,
    "availableSpaces": [
      "MESA 1 · Cara 1",
      "MESA 1 · Cara 2",
      "MESA 2 · Cara 1",
      "MESA 2 · Cara 2",
      "WALL",
      "LINEAL SMARTWATCH"
    ],
    "auditStatus": "Pendiente",
    "linealWearablesPlanogram": "L. Wearables_7.0",
    "linealWearablesCount": 7,
    "hasPad8Pro": false
  },
  {
    "tiendaId": "MIESD00203",
    "retailer": "MediaMarkt",
    "nombreTienda": "Media Zaragoza",
    "tipoEspacioId": "Table 2",
    "zona": "Cataluña",
    "region": "Noreste",
    "totalPuestos": 20,
    "availableSpaces": [
      "MESA 1 · Cara 1",
      "MESA 1 · Cara 2",
      "MESA 2 · Cara 1",
      "MESA 2 · Cara 2",
      "LINEAL SMARTWATCH"
    ],
    "auditStatus": "Pendiente",
    "linealWearablesPlanogram": "L. Wearables_8.0",
    "linealWearablesCount": 8,
    "hasPad8Pro": false
  },
  {
    "tiendaId": "MIESD00204",
    "retailer": "MediaMarkt",
    "nombreTienda": "Media Zaragoza 2",
    "tipoEspacioId": "Table 2",
    "zona": "Cataluña",
    "region": "Noreste",
    "totalPuestos": 24,
    "availableSpaces": [
      "MESA 1 · Cara 1",
      "MESA 1 · Cara 2",
      "MESA 2 · Cara 1",
      "MESA 2 · Cara 2",
      "WALL",
      "LINEAL SMARTWATCH"
    ],
    "auditStatus": "Pendiente",
    "linealWearablesPlanogram": "L. Wearables_6.0",
    "linealWearablesCount": 6,
    "hasPad8Pro": false
  },
  {
    "tiendaId": "MIESD00077",
    "retailer": "El Corte Inglés",
    "nombreTienda": "ECI C.C. GIROCENTRE",
    "tipoEspacioId": "Table 1",
    "zona": "Cataluña",
    "region": "Noreste",
    "totalPuestos": 22,
    "availableSpaces": [
      "MESA 1 · Cara 1",
      "MESA 1 · Cara 2"
    ],
    "auditStatus": "Pendiente",
    "hasPad8Pro": false
  },
  {
    "tiendaId": "MIESD00114",
    "retailer": "El Corte Inglés",
    "nombreTienda": "ECI CAN DRAGO",
    "tipoEspacioId": "Table 1",
    "zona": "Cataluña",
    "region": "Noreste",
    "totalPuestos": 12,
    "availableSpaces": [
      "MESA 1 · Cara 1",
      "MESA 1 · Cara 2",
      "WALL"
    ],
    "auditStatus": "Pendiente",
    "hasPad8Pro": false
  },
  {
    "tiendaId": "MIESS00002",
    "retailer": "El Corte Inglés",
    "nombreTienda": "ECI CATALUÑA",
    "tipoEspacioId": "Table 2",
    "zona": "Cataluña",
    "region": "Noreste",
    "totalPuestos": 24,
    "availableSpaces": [
      "MESA 1 · Cara 1",
      "MESA 1 · Cara 2",
      "MESA 2 · Cara 1",
      "MESA 2 · Cara 2",
      "MINIWALL",
      "LINEAL SMARTWATCH"
    ],
    "auditStatus": "Pendiente",
    "linealWearablesPlanogram": "L. Wearables_ECI 6",
    "linealWearablesCount": 6,
    "hasPad8Pro": true
  },
  {
    "tiendaId": "MIESD00121",
    "retailer": "El Corte Inglés",
    "nombreTienda": "ECI CORNELLA",
    "tipoEspacioId": "Table 1",
    "zona": "Cataluña",
    "region": "Noreste",
    "totalPuestos": 12,
    "availableSpaces": [
      "MESA 1 · Cara 1",
      "MESA 1 · Cara 2",
      "MINIWALL"
    ],
    "auditStatus": "Pendiente",
    "hasPad8Pro": false
  },
  {
    "tiendaId": "MIESS00003",
    "retailer": "El Corte Inglés",
    "nombreTienda": "ECI DIAGONAL",
    "tipoEspacioId": "Table 2",
    "zona": "Cataluña",
    "region": "Noreste",
    "totalPuestos": 16,
    "availableSpaces": [
      "MESA 1 · Cara 1",
      "MESA 1 · Cara 2",
      "MESA 2 · Cara 1",
      "MESA 2 · Cara 2"
    ],
    "auditStatus": "Pendiente",
    "hasPad8Pro": true
  },
  {
    "tiendaId": "MIESD00103",
    "retailer": "El Corte Inglés",
    "nombreTienda": "ECI INDEPENDENCIA",
    "tipoEspacioId": "Table 1",
    "zona": "Cataluña",
    "region": "Noreste",
    "totalPuestos": 22,
    "availableSpaces": [
      "MESA 1 · Cara 1",
      "MESA 1 · Cara 2"
    ],
    "auditStatus": "Pendiente",
    "hasPad8Pro": false
  },
  {
    "tiendaId": "MIESD00113",
    "retailer": "El Corte Inglés",
    "nombreTienda": "ECI MERIDIANA",
    "tipoEspacioId": "Table 1",
    "zona": "Cataluña",
    "region": "Noreste",
    "totalPuestos": 22,
    "availableSpaces": [
      "MESA 1 · Cara 1",
      "MESA 1 · Cara 2"
    ],
    "auditStatus": "Pendiente",
    "hasPad8Pro": false
  },
  {
    "tiendaId": "MIESD00105",
    "retailer": "El Corte Inglés",
    "nombreTienda": "ECI PUERTO VENECIA",
    "tipoEspacioId": "Table 1",
    "zona": "Cataluña",
    "region": "Noreste",
    "totalPuestos": 22,
    "availableSpaces": [
      "MESA 1 · Cara 1",
      "MESA 1 · Cara 2"
    ],
    "auditStatus": "Pendiente",
    "hasPad8Pro": false
  },
  {
    "tiendaId": "MIESD00076",
    "retailer": "El Corte Inglés",
    "nombreTienda": "ECI SABADELL",
    "tipoEspacioId": "Table 1",
    "zona": "Cataluña",
    "region": "Noreste",
    "totalPuestos": 16,
    "availableSpaces": [
      "MESA 1 · Cara 1",
      "MESA 1 · Cara 2",
      "MINIWALL",
      "LINEAL SMARTWATCH"
    ],
    "auditStatus": "Pendiente",
    "linealWearablesPlanogram": "L. Wearables_ECI 6",
    "linealWearablesCount": 6,
    "hasPad8Pro": false
  },
  {
    "tiendaId": "MIESD00088",
    "retailer": "El Corte Inglés",
    "nombreTienda": "ECI TARRAGONA",
    "tipoEspacioId": "Table 1",
    "zona": "Cataluña",
    "region": "Noreste",
    "totalPuestos": 22,
    "availableSpaces": [
      "MESA 1 · Cara 1",
      "MESA 1 · Cara 2"
    ],
    "auditStatus": "Pendiente",
    "hasPad8Pro": false
  },
  {
    "tiendaId": "MIESD00104",
    "retailer": "El Corte Inglés",
    "nombreTienda": "ECI ZARAGOZA",
    "tipoEspacioId": "Table 1",
    "zona": "Cataluña",
    "region": "Noreste",
    "totalPuestos": 12,
    "availableSpaces": [
      "MESA 1 · Cara 1",
      "MESA 1 · Cara 2",
      "MINIWALL"
    ],
    "auditStatus": "Pendiente",
    "hasPad8Pro": false
  },
  {
    "tiendaId": "MIESS00018",
    "retailer": "FNAC",
    "nombreTienda": "FNAC Illa",
    "tipoEspacioId": "Table 1",
    "zona": "Cataluña",
    "region": "Noreste",
    "totalPuestos": 22,
    "availableSpaces": [
      "MESA 1 · Cara 1",
      "MESA 1 · Cara 2"
    ],
    "auditStatus": "Pendiente",
    "hasPad8Pro": false
  },
  {
    "tiendaId": "MIESD00149",
    "retailer": "FNAC",
    "nombreTienda": "FNAC Plaza España",
    "tipoEspacioId": "Table FNAC",
    "zona": "Cataluña",
    "region": "Noreste",
    "totalPuestos": 8,
    "availableSpaces": [
      "MESA 1 · Cara 1",
      "MESA 1 · Cara 2"
    ],
    "auditStatus": "Pendiente",
    "hasPad8Pro": false
  },
  {
    "tiendaId": "MIESD00145",
    "retailer": "FNAC",
    "nombreTienda": "FNAC Arenas",
    "tipoEspacioId": "Table FNAC",
    "zona": "Cataluña",
    "region": "Noreste",
    "totalPuestos": 8,
    "availableSpaces": [
      "MESA 1 · Cara 1",
      "MESA 1 · Cara 2"
    ],
    "auditStatus": "Pendiente",
    "hasPad8Pro": false
  },
  {
    "tiendaId": "MIESD00144",
    "retailer": "FNAC",
    "nombreTienda": "FNAC Maquinista",
    "tipoEspacioId": "Table 1",
    "zona": "Cataluña",
    "region": "Noreste",
    "totalPuestos": 22,
    "availableSpaces": [
      "MESA 1 · Cara 1",
      "MESA 1 · Cara 2"
    ],
    "auditStatus": "Pendiente",
    "hasPad8Pro": false
  },
  {
    "tiendaId": "MIESD00638",
    "retailer": "Carrefour",
    "nombreTienda": "CRF Cabrera",
    "tipoEspacioId": "Table CRF",
    "zona": "Cataluña",
    "region": "Noreste",
    "totalPuestos": 8,
    "availableSpaces": [
      "MESA 1 · Cara 1",
      "MESA 1 · Cara 2"
    ],
    "auditStatus": "Pendiente",
    "hasPad8Pro": false
  },
  {
    "tiendaId": "MIESO00015",
    "retailer": "Carrefour",
    "nombreTienda": "CRF Manresa",
    "tipoEspacioId": "Table CRF",
    "zona": "Cataluña",
    "region": "Noreste",
    "totalPuestos": 8,
    "availableSpaces": [
      "MESA 1 · Cara 1",
      "MESA 1 · Cara 2"
    ],
    "auditStatus": "Pendiente",
    "hasPad8Pro": false
  },
  {
    "tiendaId": "MIESP00031",
    "retailer": "Carrefour",
    "nombreTienda": "CRF Maquinista",
    "tipoEspacioId": "Table CRF",
    "zona": "Cataluña",
    "region": "Noreste",
    "totalPuestos": 8,
    "availableSpaces": [
      "MESA 1 · Cara 1",
      "MESA 1 · Cara 2"
    ],
    "auditStatus": "Pendiente",
    "hasPad8Pro": false
  },
  {
    "tiendaId": "MIESO00009",
    "retailer": "Carrefour",
    "nombreTienda": "CRF Gran Vía 2",
    "tipoEspacioId": "Table CRF",
    "zona": "Cataluña",
    "region": "Noreste",
    "totalPuestos": 8,
    "availableSpaces": [
      "MESA 1 · Cara 1",
      "MESA 1 · Cara 2"
    ],
    "auditStatus": "Pendiente",
    "hasPad8Pro": false
  },
  {
    "tiendaId": "MIESD00069",
    "retailer": "Carrefour",
    "nombreTienda": "CRF Augusta",
    "tipoEspacioId": "Table Premium",
    "zona": "Cataluña",
    "region": "Noreste",
    "totalPuestos": 4,
    "availableSpaces": [
      "MESA 1 · Cara 1"
    ],
    "auditStatus": "Pendiente",
    "hasPad8Pro": false
  },
  {
    "tiendaId": "MIESO00023",
    "retailer": "Carrefour",
    "nombreTienda": "CRF Tarragona",
    "tipoEspacioId": "Table CRF",
    "zona": "Cataluña",
    "region": "Noreste",
    "totalPuestos": 8,
    "availableSpaces": [
      "MESA 1 · Cara 1",
      "MESA 1 · Cara 2"
    ],
    "auditStatus": "Pendiente",
    "hasPad8Pro": false
  },
  {
    "tiendaId": "ALCP00012",
    "retailer": "Alcampo",
    "nombreTienda": "Alcampo Utebo",
    "tipoEspacioId": "Table Alcampo",
    "zona": "Aragón",
    "region": "Noreste",
    "totalPuestos": 8,
    "availableSpaces": [
      "MESA 1 · Cara 1",
      "MESA 1 · Cara 2"
    ],
    "auditStatus": "Pendiente",
    "hasPad8Pro": false
  }
];

export const REAL_PLANOGRAMS_DATA: Record<string, Array<{ pos: number; device: string; dummy: boolean; category: ProductCategory }>> = {
  "Table 2_Table 1": [
    {
      "pos": 1,
      "device": "Xiaomi 17 Ultra Green",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 2,
      "device": "Xiaomi 17 Blue",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 3,
      "device": "Xiaomi 17 Ultra Black",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 4,
      "device": "Xiaomi 17 Black",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 5,
      "device": "Xiaomi Watch 5",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 6,
      "device": "Xiaomi Buds 6",
      "dummy": true,
      "category": "Audio"
    },
    {
      "pos": 7,
      "device": "Xiaomi 17T Pro Blue",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 8,
      "device": "Xiaomi Watch S5 45mm",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 9,
      "device": "Xiaomi Smart Band 10 Pro",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 10,
      "device": "Xiaomi 17T Purple",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 11,
      "device": "Xiaomi 17T blue",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 12,
      "device": "Xiaomi Smart Band 11 Active",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 13,
      "device": "Redmi Note 17 Pro Max 5G Black",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 14,
      "device": "Redmi Note 17 Pro Max 5G Green",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 15,
      "device": "Redmi Watch 6",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 16,
      "device": "Redmi Note 17 Pro 5G Black",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 17,
      "device": "Redmi Note 17 Pro 5G Purple",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 18,
      "device": "Redmi Watch 6 Active",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 19,
      "device": "Redmi Note 17 5G Black",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 20,
      "device": "Redmi Note 17 5G Blue",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 21,
      "device": "Redmi 17 5G Orange",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 22,
      "device": "Redmi Buds 8 Pro",
      "dummy": true,
      "category": "Audio"
    },
    {
      "pos": 23,
      "device": "Redmi Buds 8",
      "dummy": true,
      "category": "Audio"
    },
    {
      "pos": 3,
      "device": "Xiaomi 17 Ultra Black",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 4,
      "device": "Xiaomi 17 Black",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 5,
      "device": "Xiaomi Watch 5",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 6,
      "device": "Xiaomi Buds 6",
      "dummy": true,
      "category": "Audio"
    },
    {
      "pos": 7,
      "device": "Xiaomi 17T Pro Blue",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 8,
      "device": "Xiaomi Watch S5 45mm",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 9,
      "device": "Xiaomi Smart Band 10 Pro",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 10,
      "device": "Xiaomi 17T Purple",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 11,
      "device": "Xiaomi 17T blue",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 12,
      "device": "Xiaomi Smart Band 11 Active",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 13,
      "device": "Redmi Note 17 Pro Max 5G Black",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 14,
      "device": "Redmi Note 17 Pro Max 5G Green",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 15,
      "device": "Redmi Watch 6",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 16,
      "device": "Redmi Note 17 Pro 5G Black",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 17,
      "device": "Redmi Note 17 Pro 5G Purple",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 18,
      "device": "Redmi Watch 6 Active",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 19,
      "device": "Redmi Note 17 5G Black",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 20,
      "device": "Redmi Note 17 5G Blue",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 21,
      "device": "Redmi 17 5G Orange",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 22,
      "device": "Redmi Buds 8 Pro",
      "dummy": true,
      "category": "Audio"
    },
    {
      "pos": 23,
      "device": "Redmi Buds 8",
      "dummy": true,
      "category": "Audio"
    }
  ],
  "Table 2_Table 2": [
    {
      "pos": 1,
      "device": "Xiaomi 17 Ultra Green",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 2,
      "device": "Xiaomi 17 Blue",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 3,
      "device": "Xiaomi Pad 8",
      "dummy": false,
      "category": "Tablet"
    },
    {
      "pos": 4,
      "device": "Redmi Pad 2 Pro",
      "dummy": false,
      "category": "Tablet"
    },
    {
      "pos": 5,
      "device": "Redmi 17 5G Orange",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 6,
      "device": "Redmi Pad 2 Pro",
      "dummy": false,
      "category": "Tablet"
    },
    {
      "pos": 7,
      "device": "Redmi 17 4G Blue",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 8,
      "device": "Redmi Pad 2",
      "dummy": false,
      "category": "Tablet"
    },
    {
      "pos": 9,
      "device": "Redmi Note 17 Pro Max 5G White&Orange",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 10,
      "device": "Redmi Note 17 Pro Max 5G White&Orange",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 11,
      "device": "Redmi Watch 6",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 12,
      "device": "Redmi Note 17 Pro 5G Blue",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 13,
      "device": "Redmi Note 17 Pro 5G Purple",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 14,
      "device": "Redmi Watch 6 Active",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 15,
      "device": "Redmi 17 5G Purple",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 16,
      "device": "Redmi 17 5G Blue",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 17,
      "device": "Redmi Watch 6 Lite",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 18,
      "device": "Redmi Pad 2 SE 9.7\"",
      "dummy": false,
      "category": "Tablet"
    },
    {
      "pos": 19,
      "device": "Redmi 17 4G Green",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 3,
      "device": "Xiaomi Pad 8 Pro",
      "dummy": false,
      "category": "Tablet"
    },
    {
      "pos": 4,
      "device": "Xiaomi Pad 8",
      "dummy": false,
      "category": "Tablet"
    },
    {
      "pos": 5,
      "device": "Redmi 17 5G Orange",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 6,
      "device": "Redmi Pad 2 Pro",
      "dummy": false,
      "category": "Tablet"
    },
    {
      "pos": 7,
      "device": "Redmi 17 4G Blue",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 8,
      "device": "Redmi Pad 2",
      "dummy": false,
      "category": "Tablet"
    },
    {
      "pos": 9,
      "device": "Redmi Note 17 Pro Max 5G White&Orange",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 10,
      "device": "Redmi Note 17 Pro Max 5G White&Orange",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 11,
      "device": "Redmi Watch 6",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 12,
      "device": "Redmi Note 17 Pro 5G Blue",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 13,
      "device": "Redmi Note 17 Pro 5G Purple",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 14,
      "device": "Redmi Watch 6 Active",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 15,
      "device": "Redmi Note 17 5G Purple",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 16,
      "device": "Redmi Note 17 5G Blue",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 17,
      "device": "Redmi Watch 6 Lite",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 18,
      "device": "Redmi Pad 2 SE 9.7\"",
      "dummy": false,
      "category": "Tablet"
    },
    {
      "pos": 19,
      "device": "Redmi 17 4G Green",
      "dummy": false,
      "category": "Smartphone"
    }
  ],
  "Table 1_Table 1": [
    {
      "pos": 1,
      "device": "Xiaomi 17 Ultra Green",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 2,
      "device": "Xiaomi 17 Blue",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 3,
      "device": "Xiaomi 17 Ultra Black",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 4,
      "device": "Xiaomi 17 Black",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 5,
      "device": "Xiaomi Watch 5",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 6,
      "device": "Xiaomi Buds 6",
      "dummy": true,
      "category": "Audio"
    },
    {
      "pos": 7,
      "device": "Xiaomi 17T Pro Blue",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 8,
      "device": "Xiaomi 17T Purple",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 9,
      "device": "Xiaomi Smart Band 10 Pro",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 10,
      "device": "Redmi Note 17 Pro Max 5G White&Orange",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 11,
      "device": "Redmi Note 17 Pro Max 5G White&Orange",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 12,
      "device": "Redmi Note 17 Pro Max 5G Green",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 13,
      "device": "Redmi 17 4G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 14,
      "device": "Redmi Pad 2",
      "dummy": false,
      "category": "Tablet"
    },
    {
      "pos": 15,
      "device": "Redmi 17 5G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 16,
      "device": "Redmi Pad 2 Pro",
      "dummy": false,
      "category": "Tablet"
    },
    {
      "pos": 17,
      "device": "Redmi Note 17 5G Purple",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 18,
      "device": "Xiaomi Pad 8",
      "dummy": false,
      "category": "Tablet"
    },
    {
      "pos": 19,
      "device": "Redmi Note 17 Pro 5G Blue",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 20,
      "device": "Redmi Note 17 Pro 5G Purple",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 21,
      "device": "Redmi Watch 6",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 22,
      "device": "Redmi Buds 8",
      "dummy": true,
      "category": "Audio"
    }
  ],
  "Table 3_Table 1": [
    {
      "pos": 1,
      "device": "Xiaomi 17 Ultra Green",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 2,
      "device": "Xiaomi 17 Blue",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 3,
      "device": "Xiaomi 17 Ultra Black",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 4,
      "device": "Xiaomi 17 Black",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 5,
      "device": "Xiaomi Watch 5",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 6,
      "device": "Xiaomi Buds 6",
      "dummy": true,
      "category": "Audio"
    },
    {
      "pos": 7,
      "device": "Xiaomi 17T Pro Blue",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 8,
      "device": "Xiaomi Watch S5 45mm",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 9,
      "device": "Xiaomi 17T Purple",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 10,
      "device": "Xiaomi Watch S4 41mm",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 11,
      "device": "Xiaomi 17 Ultra Green",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 12,
      "device": "Xiaomi Watch S5 45mm",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 13,
      "device": "Xiaomi 17 Blue",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 14,
      "device": "Xiaomi Smart Band 10 Pro",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 15,
      "device": "Xiaomi 17T Pro Purple",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 16,
      "device": "Xiaomi Smart Band 10",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 17,
      "device": "Xiaomi 17T Blue",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 18,
      "device": "Xiaomi Smart Band 11 Active",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 3,
      "device": "Xiaomi 17 Ultra Black",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 4,
      "device": "Xiaomi 17 Black",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 5,
      "device": "Xiaomi Watch 5",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 6,
      "device": "Xiaomi Buds 6",
      "dummy": true,
      "category": "Audio"
    },
    {
      "pos": 7,
      "device": "Xiaomi 17T Pro Blue",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 8,
      "device": "Xiaomi Watch S5 45mm",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 9,
      "device": "Xiaomi 17T Purple",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 10,
      "device": "Xiaomi Watch S4 41mm",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 11,
      "device": "Xiaomi 17 Ultra Green",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 12,
      "device": "Xiaomi Watch S5 45mm",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 13,
      "device": "Xiaomi 17 Blue",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 14,
      "device": "Xiaomi Smart Band 10 Pro",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 15,
      "device": "Xiaomi 17T Pro Purple",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 16,
      "device": "Xiaomi Smart Band 10",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 17,
      "device": "Xiaomi 17T Blue",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 18,
      "device": "Xiaomi Smart Band 11 Active",
      "dummy": false,
      "category": "Wearable"
    }
  ],
  "Table 3_Table 2": [
    {
      "pos": 1,
      "device": "Xiaomi 17 Ultra Green",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 2,
      "device": "Xiaomi 17 Blue",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 3,
      "device": "Redmi Note 17 Pro Max 5G White&Orange",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 4,
      "device": "Redmi Note 17 Pro Max 5G White&Orange",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 5,
      "device": "Redmi Watch 6 Active",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 6,
      "device": "Redmi Note 17 Pro Max 5G Green",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 7,
      "device": "Redmi Note 17 Pro 5G Blue",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 8,
      "device": "Redmi Buds 8 Pro",
      "dummy": true,
      "category": "Audio"
    },
    {
      "pos": 9,
      "device": "Redmi Note 17 Pro 5G Black",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 10,
      "device": "Redmi Note 17 Pro 5G Blue",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 11,
      "device": "Redmi Note 17 5G Purple",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 12,
      "device": "Redmi Note 17 5G Blue",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 13,
      "device": "Redmi 17 5G Orange",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 14,
      "device": "Redmi 17 5G Orange",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 15,
      "device": "Redmi 17 4G Green",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 16,
      "device": "Redmi 17 4G Blue",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 17,
      "device": "Redmi 15C Black",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 18,
      "device": "Redmi Watch 6",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 19,
      "device": "Redmi 15C Black",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 20,
      "device": "Redmi Buds 8 Pro",
      "dummy": true,
      "category": "Audio"
    },
    {
      "pos": 21,
      "device": "Redmi Buds 8",
      "dummy": true,
      "category": "Audio"
    },
    {
      "pos": 3,
      "device": "Redmi Note 17 Pro Max 5G White&Orange",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 4,
      "device": "Redmi Note 17 Pro Max 5G White&Orange",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 5,
      "device": "Redmi Watch 6 Active",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 6,
      "device": "Redmi Note 17 Pro Max 5G Green",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 7,
      "device": "Redmi Note 17 Pro 5G Blue",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 8,
      "device": "Redmi Buds 8 Pro",
      "dummy": true,
      "category": "Audio"
    },
    {
      "pos": 9,
      "device": "Redmi Note 17 Pro 5G Black",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 10,
      "device": "Redmi Note 17 Pro 5G Blue",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 11,
      "device": "Redmi Note 17 5G Purple",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 12,
      "device": "Redmi Note 17 5G Blue",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 13,
      "device": "Redmi 17 5G Orange",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 14,
      "device": "Redmi 17 5G Orange",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 15,
      "device": "Redmi 17 4G Green",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 16,
      "device": "Redmi 17 4G Blue",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 17,
      "device": "Redmi 15C Black",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 18,
      "device": "Redmi Watch 6",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 19,
      "device": "Redmi 15C Black",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 20,
      "device": "Redmi Buds 8 Pro",
      "dummy": true,
      "category": "Audio"
    },
    {
      "pos": 21,
      "device": "Redmi Buds 8",
      "dummy": true,
      "category": "Audio"
    }
  ],
  "Table 3_Table 3": [
    {
      "pos": 1,
      "device": "Xiaomi 17 Ultra Green",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 2,
      "device": "Xiaomi 17 Blue",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 3,
      "device": "Xiaomi Pad 8",
      "dummy": false,
      "category": "Tablet"
    },
    {
      "pos": 4,
      "device": "Redmi Pad 2 Pro",
      "dummy": false,
      "category": "Tablet"
    },
    {
      "pos": 5,
      "device": "Redmi Pad 2 Pro",
      "dummy": false,
      "category": "Tablet"
    },
    {
      "pos": 6,
      "device": "Redmi Pad 2",
      "dummy": false,
      "category": "Tablet"
    },
    {
      "pos": 7,
      "device": "Redmi Pad 2",
      "dummy": false,
      "category": "Tablet"
    },
    {
      "pos": 8,
      "device": "Redmi Pad 2 SE 9.7\"",
      "dummy": false,
      "category": "Tablet"
    },
    {
      "pos": 9,
      "device": "Redmi Watch 6 Active",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 10,
      "device": "Redmi Watch 6 Lite",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 11,
      "device": "Redmi Watch 6",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 12,
      "device": "Redmi Watch 6",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 3,
      "device": "Xiaomi Pad 8 Pro",
      "dummy": false,
      "category": "Tablet"
    },
    {
      "pos": 4,
      "device": "Xiaomi Pad 8",
      "dummy": false,
      "category": "Tablet"
    },
    {
      "pos": 5,
      "device": "Redmi Pad 2 Pro",
      "dummy": false,
      "category": "Tablet"
    },
    {
      "pos": 6,
      "device": "Redmi Pad 2 Pro",
      "dummy": false,
      "category": "Tablet"
    },
    {
      "pos": 7,
      "device": "Redmi Pad 2",
      "dummy": false,
      "category": "Tablet"
    },
    {
      "pos": 8,
      "device": "Redmi Pad 2 SE 9.7\"",
      "dummy": false,
      "category": "Tablet"
    },
    {
      "pos": 9,
      "device": "Redmi Watch 6 Active",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 10,
      "device": "Redmi Watch 6 Lite",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 11,
      "device": "Redmi Watch 6",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 12,
      "device": "Redmi Watch 6",
      "dummy": false,
      "category": "Wearable"
    }
  ],
  "Wall_Wall": [
    {
      "pos": 1,
      "device": "Redmi Note 17 Pro Max 5G Green",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 2,
      "device": "Redmi Watch 6 Active",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 3,
      "device": "Redmi Watch 6 Lite",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 4,
      "device": "Redmi Note 17 Pro 5G Blue",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 5,
      "device": "Redmi Watch 5 Active",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 6,
      "device": "Redmi Watch 5 Lite",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 7,
      "device": "Redmi Pad 2",
      "dummy": false,
      "category": "Tablet"
    },
    {
      "pos": 8,
      "device": "Xiaomi Smart Band 11 Active",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 9,
      "device": "Xiaomi Smart Band 9 active",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 10,
      "device": "Xiaomi Smart Band 11 Active",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 11,
      "device": "Xiaomi Smart Band 9 active",
      "dummy": false,
      "category": "Wearable"
    }
  ],
  "MiniWall_Miniwall": [
    {
      "pos": 1,
      "device": "Redmi Note 17 Pro Max 5G White&Orange",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 2,
      "device": "Redmi Watch 6 Active",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 3,
      "device": "Redmi Watch 5 Lite",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 4,
      "device": "Redmi Pad 2",
      "dummy": false,
      "category": "Tablet"
    }
  ],
  "Table FNAC_Table 1": [
    {
      "pos": 1,
      "device": "Xiaomi 15T Pro",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 2,
      "device": "Xiaomi 15T",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 3,
      "device": "Xiaomi Watch 5",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 4,
      "device": "Xiaomi Openwear",
      "dummy": true,
      "category": "Audio"
    },
    {
      "pos": 5,
      "device": "Redmi Note 15 Pro 5G Black",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 6,
      "device": "Redmi Note 15 Pro 4G Black",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 7,
      "device": "Redmi Watch 5",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 8,
      "device": "Redmi Note 15 5G Black",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 9,
      "device": "Redmi Note 15 4G Black",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 10,
      "device": "Redmi Buds 8",
      "dummy": true,
      "category": "Audio"
    },
    {
      "pos": 11,
      "device": "Redmi 15C Black",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 12,
      "device": "Redmi 15 4G Black",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 13,
      "device": "Redmi Watch 5 Active",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 14,
      "device": "Redmi Buds 6 Pro",
      "dummy": true,
      "category": "Audio"
    },
    {
      "pos": 15,
      "device": "Xiaomi Pad 7",
      "dummy": false,
      "category": "Tablet"
    },
    {
      "pos": 16,
      "device": "Redmi Pad 2 Pro",
      "dummy": false,
      "category": "Tablet"
    },
    {
      "pos": 17,
      "device": "Redmi Pad 2",
      "dummy": false,
      "category": "Tablet"
    }
  ],
  "Table 4.1_Table 1": [
    {
      "pos": 1,
      "device": "Xiaomi 15T Pro",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 2,
      "device": "Xiaomi 15T",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 3,
      "device": "Xiaomi Watch 5",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 4,
      "device": "Xiaomi Openwear",
      "dummy": true,
      "category": "Audio"
    },
    {
      "pos": 5,
      "device": "Redmi Note 15 Pro 5G Blue",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 6,
      "device": "Redmi Watch 5",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 7,
      "device": "Redmi Note 15 5G Black",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 8,
      "device": "Redmi Note 15 4G Blue",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 9,
      "device": "Redmi 15 4G Black",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 10,
      "device": "Redmi 15C 4G Black",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 11,
      "device": "Xiaomi Pad 7",
      "dummy": false,
      "category": "Tablet"
    },
    {
      "pos": 12,
      "device": "Redmi Note 15 4G Green",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 13,
      "device": "Redmi Pad 2 Pro",
      "dummy": false,
      "category": "Tablet"
    },
    {
      "pos": 14,
      "device": "Redmi Pad 2",
      "dummy": false,
      "category": "Tablet"
    }
  ],
  "Table Alcampo_Table 1": [
    {
      "pos": 1,
      "device": "Xiaomi X17T Black",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 2,
      "device": "Redmi Note 15 Pro+ 5G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 3,
      "device": "Redmi Note 17 Pro 5G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 4,
      "device": "Redmi Note 17 5G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 5,
      "device": "Redmi 17 5G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 6,
      "device": "Redmi 17 4G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 7,
      "device": "Redmi 15C 4G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 8,
      "device": "Redmi Pad 2",
      "dummy": false,
      "category": "Tablet"
    }
  ],
  "Table CRF_Table 1": [
    {
      "pos": 1,
      "device": "Redmi Note 15 Pro 5G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 2,
      "device": "Redmi Note 17 5G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 3,
      "device": "Redmi 17 4G",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 4,
      "device": "Redmi 17 4G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 5,
      "device": "Redmi Pad 2 Pro",
      "dummy": false,
      "category": "Tablet"
    },
    {
      "pos": 6,
      "device": "Redmi Pad 2",
      "dummy": false,
      "category": "Tablet"
    },
    {
      "pos": 7,
      "device": "Redmi Pad 2",
      "dummy": false,
      "category": "Tablet"
    },
    {
      "pos": 8,
      "device": "Redmi 15C 4G",
      "dummy": false,
      "category": "Smartphone"
    }
  ],
  "Escalerilla SC_Caída 1": [
    {
      "pos": 1,
      "device": "Xiaomi 17 green",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 2,
      "device": "Xiaomi 17T Pro",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 3,
      "device": "Xiaomi 17T",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 1,
      "device": "Xiaomi 17 green",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 2,
      "device": "Xiaomi 17T Pro",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 3,
      "device": "Xiaomi 17T",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 1,
      "device": "Xiaomi 17 green",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 2,
      "device": "Xiaomi 17T Pro",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 3,
      "device": "Xiaomi 17T",
      "dummy": false,
      "category": "Smartphone"
    }
  ],
  "Escalerilla SC_Caída 2": [
    {
      "pos": 1,
      "device": "Redmi Note 17 Pro Max 5G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 2,
      "device": "Redmi Note 17 Pro 5G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 3,
      "device": "Redmi Note 17 5G Purple",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 1,
      "device": "Redmi Note 17 Pro Max 5G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 2,
      "device": "Redmi Note 17 Pro 5G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 3,
      "device": "Redmi Note 17 5G Purple",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 1,
      "device": "Redmi Note 15 Pro+ 5G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 2,
      "device": "Redmi Note 15 Pro 5G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 3,
      "device": "Redmi Note 15 Pro 4G",
      "dummy": false,
      "category": "Smartphone"
    }
  ],
  "Escalerilla SC_Caída 3": [
    {
      "pos": 1,
      "device": "Redmi Note 15 Pro+ 5G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 2,
      "device": "Redmi Note 15 Pro 5G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 3,
      "device": "Redmi Note 15 Pro 5G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 1,
      "device": "Redmi Note 15 Pro+ 5G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 2,
      "device": "Redmi Note 15 Pro 5G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 3,
      "device": "Redmi Note 15 Pro 4G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 1,
      "device": "Redmi Note 15 5G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 2,
      "device": "Redmi Note 15 4G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 3,
      "device": "Redmi 15C",
      "dummy": false,
      "category": "Smartphone"
    }
  ],
  "Escalerilla SC_Caída 4": [
    {
      "pos": 1,
      "device": "Redmi Note 15 Pro 4G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 2,
      "device": "Redmi Note 15 5G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 3,
      "device": "Redmi Note 15 5G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 1,
      "device": "Redmi Note 15 5G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 2,
      "device": "Redmi 15",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 3,
      "device": "Redmi 15C",
      "dummy": false,
      "category": "Smartphone"
    }
  ],
  "Escalerilla SC_Caída 5": [
    {
      "pos": 1,
      "device": "Redmi Note 15 4G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 2,
      "device": "Redmi 15",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 3,
      "device": "Redmi 15C",
      "dummy": false,
      "category": "Smartphone"
    }
  ],
  "Escalerilla CC_Caída 1": [
    {
      "pos": 1,
      "device": "Xiaomi 17 green",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 2,
      "device": "Xiaomi 17T Pro",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 3,
      "device": "Xiaomi 17T",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 1,
      "device": "Xiaomi 17 green",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 2,
      "device": "Xiaomi 17T Pro",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 3,
      "device": "Xiaomi 17T",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 1,
      "device": "Xiaomi 17 green",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 2,
      "device": "Xiaomi 17T Pro",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 3,
      "device": "Xiaomi 17T",
      "dummy": false,
      "category": "Smartphone"
    }
  ],
  "Escalerilla CC_Caída 2": [
    {
      "pos": 1,
      "device": "Redmi Note 17 Pro Max 5G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 2,
      "device": "Redmi Note 17 Pro 5G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 3,
      "device": "Redmi Note 17 5G Purple",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 1,
      "device": "Redmi Note 17 Pro Max 5G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 2,
      "device": "Redmi Note 17 Pro 5G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 3,
      "device": "Redmi Note 17 5G Purple",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 1,
      "device": "Redmi Note 15 Pro+ 5G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 2,
      "device": "Redmi Note 15 Pro 5G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 3,
      "device": "Redmi Note 15 Pro 4G",
      "dummy": false,
      "category": "Smartphone"
    }
  ],
  "Escalerilla CC_Caída 3": [
    {
      "pos": 1,
      "device": "Redmi Note 15 Pro+ 5G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 2,
      "device": "Redmi Note 15 Pro 5G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 3,
      "device": "Redmi Note 15 Pro 5G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 1,
      "device": "Redmi Note 15 Pro+ 5G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 2,
      "device": "Redmi Note 15 Pro 5G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 3,
      "device": "Redmi Note 15 Pro 4G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 1,
      "device": "Redmi Note 15 5G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 2,
      "device": "Redmi Note 15 4G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 3,
      "device": "Redmi 15C",
      "dummy": false,
      "category": "Smartphone"
    }
  ],
  "Escalerilla CC_Caída 4": [
    {
      "pos": 1,
      "device": "Redmi Note 15 Pro 4G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 2,
      "device": "Redmi Note 15 5G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 3,
      "device": "Redmi Note 15 5G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 1,
      "device": "Redmi Note 15 5G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 2,
      "device": "Redmi 15",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 3,
      "device": "Redmi 15C",
      "dummy": false,
      "category": "Smartphone"
    }
  ],
  "Escalerilla CC_Caída 5": [
    {
      "pos": 1,
      "device": "Redmi Note 15 4G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 2,
      "device": "Redmi 15",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 3,
      "device": "Redmi 15C",
      "dummy": false,
      "category": "Smartphone"
    }
  ],
  "L. Wearables_9.0": [
    {
      "pos": 1,
      "device": "Xiaomi Watch 5 Black",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 2,
      "device": "Xiaomi Watch S4 47MM Black",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 3,
      "device": "Xiaomi Watch S5 46mm",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 4,
      "device": "Redmi Watch 6 Black",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 5,
      "device": "Xiaomi Smart Band 10",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 6,
      "device": "Xiaomi Smart Band 11 Active",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 7,
      "device": "Redmi Watch 6 Lite Light Gold",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 8,
      "device": "Redmi Watch 6 Active Black",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 9,
      "device": "Xiaomi Smart Band 9 active",
      "dummy": false,
      "category": "Wearable"
    }
  ],
  "L. Wearables_8.0": [
    {
      "pos": 1,
      "device": "Xiaomi Watch S4 41MM Green",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 2,
      "device": "Xiaomi Watch S5 46mm",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 3,
      "device": "Redmi Watch 6 Black",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 4,
      "device": "Xiaomi Smart Band 10",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 5,
      "device": "Redmi Watch 6 Lite Light Gold",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 6,
      "device": "Xiaomi Smart Band 11 Active",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 7,
      "device": "Redmi Watch 6 Active Black",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 8,
      "device": "Xiaomi Smart Band 9 active",
      "dummy": false,
      "category": "Wearable"
    }
  ],
  "L. Wearables_7.0": [
    {
      "pos": 1,
      "device": "Xiaomi Watch S4 41MM",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 2,
      "device": "Xiaomi Watch S4 47MM",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 3,
      "device": "Redmi Watch 5 Black",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 4,
      "device": "Redmi Watch 6 Lite Light Gold",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 5,
      "device": "Xiaomi Smart Band 11 Active",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 6,
      "device": "Redmi Watch 6 Active Black",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 7,
      "device": "Xiaomi Smart Band 9 active",
      "dummy": false,
      "category": "Wearable"
    }
  ],
  "L. Wearables_6.0": [
    {
      "pos": 1,
      "device": "Xiaomi Watch 5 Black",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 2,
      "device": "Xiaomi Watch S5 46mm",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 3,
      "device": "Xiaomi Watch S4 41MM",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 4,
      "device": "Redmi Watch 6 Black",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 5,
      "device": "Xiaomi Smart Band 10",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 6,
      "device": "Xiaomi Smart Band 11 Active",
      "dummy": false,
      "category": "Wearable"
    }
  ],
  "L. Wearables_5.0": [
    {
      "pos": 1,
      "device": "Xiaomi Watch S5 46mm",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 2,
      "device": "Xiaomi Watch S4 47MM",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 3,
      "device": "Redmi Watch 5 Black",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 4,
      "device": "Redmi Watch 6 Lite Light Gold",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 5,
      "device": "Redmi Watch 6 Active Black",
      "dummy": false,
      "category": "Wearable"
    }
  ],
  "L. Wearables_ECI 6": [
    {
      "pos": 1,
      "device": "Xiaomi Watch 5",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 2,
      "device": "Xiaomi Watch S5",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 3,
      "device": "Redmi Watch 6 Lite Silver",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 4,
      "device": "Redmi Watch 6 Active Silver",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 5,
      "device": "Xiaomi Smart Band 11 Active Black",
      "dummy": false,
      "category": "Wearable"
    },
    {
      "pos": 6,
      "device": "Xiaomi Smart Band 10 Black",
      "dummy": false,
      "category": "Wearable"
    }
  ],
  "Table Premium_Table 1": [
    {
      "pos": 1,
      "device": "Redmi 17 4G",
      "dummy": true,
      "category": "Smartphone"
    },
    {
      "pos": 2,
      "device": "Redmi 17 4G",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 3,
      "device": "Redmi 15C",
      "dummy": false,
      "category": "Smartphone"
    },
    {
      "pos": 4,
      "device": "Redmi Pad 2 Pro",
      "dummy": false,
      "category": "Tablet"
    },
    {
      "pos": 5,
      "device": "Redmi Pad 2",
      "dummy": false,
      "category": "Tablet"
    },
    {
      "pos": 6,
      "device": "Redmi Pad 2",
      "dummy": false,
      "category": "Tablet"
    }
  ]
};

export const STORE_LINEAL_PLANOGRAMS: Record<string, { planogram: string; count: number }> = {
  'MIESD00174': { planogram: 'L. Wearables_9.0', count: 9 }, // Media Barcelona 5 Fontanella
  'MIESS00026': { planogram: 'L. Wearables_8.0', count: 8 }, // Media Diagonal Mar-Barcelona
  'MIESD00175': { planogram: 'L. Wearables_9.0', count: 9 }, // Media El Prat
  'MIESO00034': { planogram: 'L. Wearables_7.0', count: 7 }, // Media Esplugues
  'MIESO00033': { planogram: 'L. Wearables_7.0', count: 7 }, // Media Gava
  'MIESD00182': { planogram: 'L. Wearables_9.0', count: 9 }, // Media Girona
  'MIESD00187': { planogram: 'L. Wearables_6.0', count: 6 }, // Media Lleida
  'MIESD00176': { planogram: 'L. Wearables_8.0', count: 8 }, // Media Maquinista
  'MIESD00177': { planogram: 'L. Wearables_8.0', count: 8 }, // Media Mataro
  'MIESD00178': { planogram: 'L. Wearables_9.0', count: 9 }, // Media Parets
  'MIESP03781': { planogram: 'L. Wearables_7.0', count: 7 }, // Media Sabadell
  'MIESD00180': { planogram: 'L. Wearables_9.0', count: 9 }, // Media Sant Cugat (Barcelona)
  'MIESO00043': { planogram: 'L. Wearables_9.0', count: 9 }, // Media Tarragona
  'MIESD00179': { planogram: 'L. Wearables_9.0', count: 9 }, // Media Terrassa
  'MIESD02181': { planogram: 'L. Wearables_7.0', count: 7 }, // Media Vilanova
  'MIESD00203': { planogram: 'L. Wearables_8.0', count: 8 }, // Media Zaragoza
  'MIESD00204': { planogram: 'L. Wearables_6.0', count: 6 }, // Media Zaragoza 2
  'MIESS00002': { planogram: 'L. Wearables_ECI 6', count: 6 }, // ECI CATALUÑA
  'MIESD00076': { planogram: 'L. Wearables_ECI 6', count: 6 }, // ECI SABADELL
};

export const getPositionsForSpace = (
  tipoEspacioId: string, 
  mesaId: string, 
  storeOrId?: StoreCenter | string
): PlanogramPosition[] => {
  // Buscar en los planogramas reales de la hoja de cálculo
  let searchKey = '';
  const isWall = mesaId.includes('WALL');
  const isMiniWall = mesaId.includes('MINIWALL');
  const isLineal = mesaId.includes('LINEAL') || mesaId.includes('SMARTWATCH');

  let linealCount = 9;

  if (isWall) {
    searchKey = 'Wall_Wall';
  } else if (isMiniWall) {
    searchKey = 'MiniWall_Miniwall';
  } else if (isLineal) {
    // Configuración específica de Lineal Wearables por tienda (Columna U y V del Drive)
    let planogram = 'L. Wearables_9.0';
    const storeId = typeof storeOrId === 'string' ? storeOrId : storeOrId?.tiendaId;
    const storeObj = typeof storeOrId === 'object' ? storeOrId : undefined;

    if (storeObj?.linealWearablesPlanogram && storeObj?.linealWearablesCount) {
      planogram = storeObj.linealWearablesPlanogram;
      linealCount = storeObj.linealWearablesCount;
    } else if (storeId && STORE_LINEAL_PLANOGRAMS[storeId]) {
      planogram = STORE_LINEAL_PLANOGRAMS[storeId].planogram;
      linealCount = STORE_LINEAL_PLANOGRAMS[storeId].count;
    } else if (storeObj?.nombreTienda) {
      const match = Object.entries(STORE_LINEAL_PLANOGRAMS).find(([_, cfg]) => cfg.planogram === storeObj.tipoEspacioId);
      if (match) {
        planogram = match[1].planogram;
        linealCount = match[1].count;
      }
    }
    searchKey = planogram;
  } else if (mesaId.includes('MESA 1')) {
    searchKey = `${tipoEspacioId}_Table 1`;
  } else if (mesaId.includes('MESA 2')) {
    searchKey = `${tipoEspacioId}_Table 2`;
  } else if (mesaId.includes('MESA 3')) {
    searchKey = `${tipoEspacioId}_Table 3`;
  }

  let items = REAL_PLANOGRAMS_DATA[searchKey] || [];
  if (items.length === 0) {
    // Fallback si no existe la variante específica
    items = isLineal 
      ? (REAL_PLANOGRAMS_DATA['L. Wearables_9.0'] || []) 
      : (REAL_PLANOGRAMS_DATA['Table 1_Table 1'] || []);
  }

  // Coordenadas calibradas con el render 3D oficial para Cara 1 (12 puestos lineales que no tapan los dispositivos)
  const TABLE1_CARA1_PINS = [
    // Sector Izquierda: 6 números
    { pinX: 20.5, pinY: 53.5 }, // 1. Xiaomi 17 Ultra Green (Dummy tumbada)
    { pinX: 25.0, pinY: 53.5 }, // 2. Xiaomi 17 Blue (Dummy tumbada)
    { pinX: 28.6, pinY: 53.5 }, // 3. Xiaomi 17 Ultra Black (Smartphone vertical)
    { pinX: 32.6, pinY: 53.5 }, // 4. Xiaomi 17 Black (Smartphone vertical)
    { pinX: 37.2, pinY: 53.5 }, // 5. Xiaomi Watch 5 (Reloj en soporte)
    { pinX: 41.2, pinY: 53.5 }, // 6. Xiaomi Buds 6 (Audio estuche)
    // Sector Centro: trío de 3 números
    { pinX: 49.2, pinY: 53.5 }, // 7. Xiaomi 17T Pro Blue (Smartphone vertical)
    { pinX: 53.7, pinY: 53.5 }, // 8. Xiaomi 17T Purple (Smartphone vertical)
    { pinX: 58.1, pinY: 53.5 }, // 9. Xiaomi Smart Band 10 Pro (Smart Band peana)
    // Sector Derecha: trío de 3 números
    { pinX: 73.1, pinY: 53.5 }, // 10. Redmi Note 17 Pro Max 5G White&Orange (Smartphone base naranja)
    { pinX: 77.7, pinY: 53.5 }, // 11. Redmi Note 17 Pro Max 5G White&Orange Dummy (Smartphone centro base naranja)
    { pinX: 82.6, pinY: 53.5 }  // 12. Redmi Note 17 Pro Max 5G Green (Smartphone dcha base naranja)
  ];

  // Coordenadas calibradas lineales con el render 3D oficial para Cara 2 (10 puestos lineales sin tapar pantallas)
  const TABLE1_CARA2_PINS = [
    { pinX: 14.5, pinY: 52.5 }, // 13. Redmi 17 4G (Smartphone izq)
    { pinX: 23.0, pinY: 52.5 }, // 14. Pad 2 (Tablet izq)
    { pinX: 32.0, pinY: 52.5 }, // 15. Redmi 17 5G (Smartphone centro-izq)
    { pinX: 39.5, pinY: 52.5 }, // 16. Redmi Pad 2 Pro (Tablet centro)
    { pinX: 51.0, pinY: 52.5 }, // 17. Redmi Note 17 5G Purple (Smartphone centro-dcha)
    { pinX: 59.0, pinY: 52.5 }, // 18. Pad 8 (Tablet con teclado)
    { pinX: 71.3, pinY: 52.5 }, // 19. Redmi note 17 Pro 5G Blue (Smartphone dcha 1)
    { pinX: 76.0, pinY: 52.5 }, // 20. Redmi note 17 Pro 5G Purple (Smartphone dcha 2)
    { pinX: 80.3, pinY: 52.5 }, // 21. Redmi Watch 6 (Wearable peana)
    { pinX: 84.2, pinY: 52.5 }  // 22. Redmi Buds 8 (Audio estuche)
  ];

  // Coordenadas calibradas con el render 3D oficial para Table CRF Cara 1 (4 smartphones lineales sin tapar pantallas)
  const TABLE_CRF_CARA1_PINS = [
    { pinX: 19.1, pinY: 53.5 }, // 1. Redmi Note 15 Pro 5G (Smartphone izq)
    { pinX: 34.5, pinY: 53.5 }, // 2. Redmi Note 17 5G (Smartphone centro-izq)
    { pinX: 49.6, pinY: 53.5 }, // 3. Redmi 17 4G Dummy (Smartphone centro-dcha)
    { pinX: 65.2, pinY: 53.5 }  // 4. Redmi 17 4G (Smartphone dcha)
  ];

  // Coordenadas calibradas con el render 3D oficial para Table CRF Cara 2 (3 tablets + 1 smartphone)
  const TABLE_CRF_CARA2_PINS = [
    { pinX: 31.0, pinY: 53.5 }, // 5. Redmi Pad 2 Pro (Tablet 1)
    { pinX: 46.1, pinY: 53.5 }, // 6. Redmi Pad 2 (Tablet 2)
    { pinX: 61.0, pinY: 53.5 }, // 7. Redmi Pad 2 (Tablet 3)
    { pinX: 76.2, pinY: 53.5 }  // 8. Redmi 15C 4G (Smartphone dcha)
  ];

  // Coordenadas calibradas con el render 3D oficial para Wall (11 puestos lineales que no tapan dispositivos ni pantallas)
  const WALL_PINS = [
    { pinX: 7.6, pinY: 73.5 },  // 1. Redmi Note 17 Pro Max 5G Green (Smartphone izq)
    { pinX: 12.6, pinY: 73.5 }, // 2. Redmi Watch 6 Active (Reloj izq 1)
    { pinX: 17.2, pinY: 73.5 }, // 3. Redmi Watch 6 Lite (Reloj izq 2)
    { pinX: 25.1, pinY: 73.5 }, // 4. Redmi Note 17 Pro 5G Blue (Smartphone centro-izq)
    { pinX: 29.8, pinY: 73.5 }, // 5. Redmi Watch 5 Active (Banda centro-izq 1)
    { pinX: 34.5, pinY: 73.5 }, // 6. Redmi Watch 5 Lite (Banda centro-izq 2)
    { pinX: 49.5, pinY: 73.5 }, // 7. Redmi Pad 2 (Tablet horizontal centro)
    { pinX: 68.5, pinY: 73.5 }, // 8. Xiaomi Smart Band 11 Active (Banda centro-dcha 1)
    { pinX: 73.2, pinY: 73.5 }, // 9. Xiaomi Smart Band 9 active (Banda centro-dcha 2)
    { pinX: 85.5, pinY: 73.5 }, // 10. Xiaomi Smart Band 11 Active (Banda dcha 1)
    { pinX: 90.5, pinY: 73.5 }  // 11. Xiaomi Smart Band 9 active (Banda dcha 2)
  ];

  // Coordenadas calibradas alternas para Lineal Wearables:
  // Arriba: impares (1, 3, 5, 7, 9)
  // Abajo: pares (2, 4, 6, 8)
  const LINEAL_PINS_MAP: Record<number, Array<{ pinX: number; pinY: number }>> = {
    // 9 posiciones: 5 balda superior (1, 3, 5, 7, 9), 4 balda inferior (2, 4, 6, 8)
    9: [
      { pinX: 21.0, pinY: 44.0 }, // Pos 1: Arriba 1 (Reloj)
      { pinX: 21.5, pinY: 76.0 }, // Pos 2: Abajo 1 (Reloj)
      { pinX: 35.0, pinY: 44.0 }, // Pos 3: Arriba 2 (Reloj)
      { pinX: 37.0, pinY: 76.0 }, // Pos 4: Abajo 2 (Reloj)
      { pinX: 53.0, pinY: 44.0 }, // Pos 5: Arriba 3 (Banda)
      { pinX: 53.5, pinY: 76.0 }, // Pos 6: Abajo 3 (Banda)
      { pinX: 67.5, pinY: 44.0 }, // Pos 7: Arriba 4 (Banda)
      { pinX: 69.5, pinY: 76.0 }, // Pos 8: Abajo 4 (Banda)
      { pinX: 81.5, pinY: 44.0 }  // Pos 9: Arriba 5 (Banda)
    ],
    // 8 posiciones: 4 balda superior (1, 3, 5, 7), 4 balda inferior (2, 4, 6, 8)
    8: [
      { pinX: 22.0, pinY: 44.0 }, // Pos 1: Arriba 1
      { pinX: 22.0, pinY: 76.0 }, // Pos 2: Abajo 1
      { pinX: 39.0, pinY: 44.0 }, // Pos 3: Arriba 2
      { pinX: 39.0, pinY: 76.0 }, // Pos 4: Abajo 2
      { pinX: 57.0, pinY: 44.0 }, // Pos 5: Arriba 3
      { pinX: 57.0, pinY: 76.0 }, // Pos 6: Abajo 3
      { pinX: 75.0, pinY: 44.0 }, // Pos 7: Arriba 4
      { pinX: 75.0, pinY: 76.0 }  // Pos 8: Abajo 4
    ],
    // 7 posiciones: 4 balda superior (1, 3, 5, 7), 3 balda inferior (2, 4, 6)
    7: [
      { pinX: 22.0, pinY: 44.0 }, // Pos 1: Arriba 1
      { pinX: 28.0, pinY: 76.0 }, // Pos 2: Abajo 1
      { pinX: 39.0, pinY: 44.0 }, // Pos 3: Arriba 2
      { pinX: 48.0, pinY: 76.0 }, // Pos 4: Abajo 2
      { pinX: 57.0, pinY: 44.0 }, // Pos 5: Arriba 3
      { pinX: 68.0, pinY: 76.0 }, // Pos 6: Abajo 3
      { pinX: 75.0, pinY: 44.0 }  // Pos 7: Arriba 4
    ],
    // 6 posiciones: 3 balda superior (1, 3, 5), 3 balda inferior (2, 4, 6)
    6: [
      { pinX: 26.0, pinY: 44.0 }, // Pos 1: Arriba 1
      { pinX: 26.0, pinY: 76.0 }, // Pos 2: Abajo 1
      { pinX: 48.0, pinY: 44.0 }, // Pos 3: Arriba 2
      { pinX: 48.0, pinY: 76.0 }, // Pos 4: Abajo 2
      { pinX: 70.0, pinY: 44.0 }, // Pos 5: Arriba 3
      { pinX: 70.0, pinY: 76.0 }  // Pos 6: Abajo 3
    ],
    // 5 posiciones: 3 balda superior (1, 3, 5), 2 balda inferior (2, 4)
    5: [
      { pinX: 26.0, pinY: 44.0 }, // Pos 1: Arriba 1
      { pinX: 35.0, pinY: 76.0 }, // Pos 2: Abajo 1
      { pinX: 48.0, pinY: 44.0 }, // Pos 3: Arriba 2
      { pinX: 61.0, pinY: 76.0 }, // Pos 4: Abajo 2
      { pinX: 70.0, pinY: 44.0 }  // Pos 5: Arriba 3
    ]
  };

  // Coordenadas y dispositivos calibrados para Table 2 Mesa 2 Cara A (Cara 1) - 6 puestos naturales (1 a 6)
  const TABLE2_MESA2_CARA1_ITEMS = [
    { pos: 1, device: 'Xiaomi Pad 8', dummy: false, category: 'Tablet' as ProductCategory, pinX: 16.4, pinY: 56.0 },
    { pos: 2, device: 'Redmi Pad 2 Pro', dummy: false, category: 'Tablet' as ProductCategory, pinX: 35.2, pinY: 56.0 },
    { pos: 3, device: 'Redmi Pad 2 Pro', dummy: false, category: 'Tablet' as ProductCategory, pinX: 55.7, pinY: 56.0 },
    { pos: 4, device: 'Redmi 17 5G Orange', dummy: true, category: 'Smartphone' as ProductCategory, pinX: 64.6, pinY: 56.0 },
    { pos: 5, device: 'Redmi Pad 2', dummy: false, category: 'Tablet' as ProductCategory, pinX: 77.9, pinY: 56.0 },
    { pos: 6, device: 'Redmi 17 4G Blue', dummy: true, category: 'Smartphone' as ProductCategory, pinX: 86.4, pinY: 56.0 }
  ];

  // Coordenadas y dispositivos calibrados para Table 2 Mesa 2 Cara B (Cara 2) - 11 puestos en orden requerido:
  // 10, 11, 7, 8, 9, 4, 5, 6, 1, 2, 3
  const TABLE2_MESA2_CARA2_ITEMS = [
    { pos: 10, device: 'Redmi Pad 2 SE 9.7"', dummy: false, category: 'Tablet' as ProductCategory, pinX: 12.9, pinY: 56.0 },
    { pos: 11, device: 'Redmi 17 4G Green', dummy: false, category: 'Smartphone' as ProductCategory, pinX: 21.7, pinY: 56.0 },
    { pos: 7,  device: 'Redmi 17 5G Purple', dummy: false, category: 'Smartphone' as ProductCategory, pinX: 34.2, pinY: 56.0 },
    { pos: 8,  device: 'Redmi 17 5G Blue', dummy: true, category: 'Smartphone' as ProductCategory, pinX: 38.8, pinY: 56.0 },
    { pos: 9,  device: 'Redmi Watch 6 Lite', dummy: false, category: 'Wearable' as ProductCategory, pinX: 43.5, pinY: 56.0 },
    { pos: 4,  device: 'Redmi Note 17 Pro 5G Blue', dummy: false, category: 'Smartphone' as ProductCategory, pinX: 55.7, pinY: 56.0 },
    { pos: 5,  device: 'Redmi Note 17 Pro 5G Purple', dummy: true, category: 'Smartphone' as ProductCategory, pinX: 60.5, pinY: 56.0 },
    { pos: 6,  device: 'Redmi Watch 6 Active', dummy: false, category: 'Wearable' as ProductCategory, pinX: 65.0, pinY: 56.0 },
    { pos: 1,  device: 'Redmi Note 17 Pro Max 5G White&Orange', dummy: false, category: 'Smartphone' as ProductCategory, pinX: 77.5, pinY: 56.0 },
    { pos: 2,  device: 'Redmi Note 17 Pro Max 5G White&Orange', dummy: true, category: 'Smartphone' as ProductCategory, pinX: 82.2, pinY: 56.0 },
    { pos: 3,  device: 'Redmi Watch 6', dummy: false, category: 'Wearable' as ProductCategory, pinX: 86.9, pinY: 56.0 }
  ];

  const isMesa2 = mesaId.includes('MESA 2');
  if (isMesa2) {
    const isCara2 = mesaId.includes('Cara 2') || mesaId.includes('Cara B');
    const storeObj = typeof storeOrId === 'object' ? storeOrId : undefined;
    const isPad8ProStore = storeObj?.hasPad8Pro === true;

    const tableItems = isCara2 ? TABLE2_MESA2_CARA2_ITEMS : (
      isPad8ProStore ? TABLE2_MESA2_CARA1_ITEMS.map((item, idx) => {
        if (idx === 0) return { ...item, device: 'Xiaomi Pad 8 Pro' };
        if (idx === 1) return { ...item, device: 'Xiaomi Pad 8' };
        return item;
      }) : TABLE2_MESA2_CARA1_ITEMS
    );

    return tableItems.map((item, index) => ({
      id: `${tipoEspacioId}-${mesaId.replace(/\s+/g, '_')}-P${item.pos}`,
      tipoEspacioId,
      mesaId,
      cara: isCara2 ? 'Cara 2' : 'Cara 1',
      posicionNumero: item.pos,
      categoria: item.category,
      modeloOficial: item.device,
      colorOficial: 'Estándar Oficial',
      esDummy: item.dummy,
      requiereImei: !item.dummy,
      pinX: item.pinX,
      pinY: item.pinY,
      x: (index - tableItems.length / 2) * 0.35,
      y: 0.78,
      z: isCara2 ? 0.35 : -0.35
    }));
  }

  // Si la mesa tiene caras (ej. Cara 2), tomar los puestos correspondientes
  const isCara2 = mesaId.includes('Cara 2');
  let selectedItems = items;
  if (isLineal) {
    selectedItems = items;
  } else if (isWall) {
    selectedItems = items;
  } else if (items.length >= 22) {
    selectedItems = isCara2 ? items.slice(12, 22) : items.slice(0, 12);
  } else if (items.length >= 20) {
    selectedItems = isCara2 ? items.slice(10, 20) : items.slice(0, 10);
  } else if (items.length >= 8) {
    selectedItems = isCara2 ? items.slice(Math.floor(items.length / 2)) : items.slice(0, Math.floor(items.length / 2));
  } else if (items.length > 4) {
    selectedItems = isCara2 ? items.slice(Math.floor(items.length / 2)) : items.slice(0, Math.floor(items.length / 2));
  }

  const count = isLineal 
    ? (linealCount || selectedItems.length || 9) 
    : (isWall ? 11 : (selectedItems.length || 10));
  const positions: PlanogramPosition[] = [];
  const isCrf = tipoEspacioId === 'Table CRF';

  for (let i = 1; i <= count; i++) {
    const item = selectedItems[i - 1] || {
      pos: isCara2 ? i + 10 : i,
      device: `Xiaomi Wearable ${i}`,
      dummy: false,
      category: (isLineal ? 'Wearable' : 'Smartphone') as ProductCategory
    };

    const posNum = item.pos || (isCara2 ? i + 10 : i);

    // Asignar coordenadas precisas del render 3D
    let pinX: number | undefined;
    let pinY: number | undefined;

    if (isLineal) {
      const pinList = LINEAL_PINS_MAP[count] || LINEAL_PINS_MAP[9];
      const coord = pinList ? pinList[i - 1] : undefined;
      if (coord) { pinX = coord.pinX; pinY = coord.pinY; }
    } else if (isWall) {
      const coord = WALL_PINS[i - 1];
      if (coord) { pinX = coord.pinX; pinY = coord.pinY; }
    } else if (isCrf) {
      const coord = isCara2 ? TABLE_CRF_CARA2_PINS[i - 1] : TABLE_CRF_CARA1_PINS[i - 1];
      if (coord) { pinX = coord.pinX; pinY = coord.pinY; }
    } else if (isCara2) {
      const coord = TABLE1_CARA2_PINS[i - 1];
      if (coord) { pinX = coord.pinX; pinY = coord.pinY; }
    } else {
      const coord = TABLE1_CARA1_PINS[i - 1];
      if (coord) { pinX = coord.pinX; pinY = coord.pinY; }
    }

    const xStep = 3.6 / (count + 1);
    const xPos = -1.8 + i * xStep;
    const zPos = isCara2 ? 0.35 : -0.35;

    let linealX = (i - count / 2) * 0.4;
    let linealY = 1.4;
    if (isLineal) {
      const isTopShelf = i % 2 !== 0;
      const shelfTotal = isTopShelf ? Math.ceil(count / 2) : Math.floor(count / 2);
      const shelfIdx = isTopShelf ? Math.floor((i - 1) / 2) : Math.floor((i - 2) / 2);
      linealX = (shelfIdx - (shelfTotal - 1) / 2) * 0.45;
      linealY = isTopShelf ? 1.55 : 1.15;
    }

    positions.push({
      id: `${tipoEspacioId}-${mesaId.replace(/\s+/g, '_')}-P${posNum}`,
      tipoEspacioId,
      mesaId,
      cara: isLineal ? 'Lineal' : (isWall ? 'Wall' : (isCara2 ? 'Cara 2' : 'Cara 1')),
      posicionNumero: posNum,
      categoria: item.category as ProductCategory,
      modeloOficial: item.device,
      colorOficial: 'Estándar Oficial',
      esDummy: item.dummy,
      requiereImei: !item.dummy,
      pinX,
      pinY,
      x: isLineal ? linealX : (isWall ? (i - 6) * 0.4 : xPos),
      y: isLineal ? linealY : (isWall ? 1.6 : 0.78),
      z: isLineal ? -0.5 : (isWall ? -1.0 : zPos)
    });
  }

  return positions;
};

export type UserRole = 'Promotor' | 'GPV' | 'AM' | 'SuperAdmin';

export interface UserProfile {
  password?: string;
  email: string;
  nombre: string;
  rol: UserRole;
  retailer?: string;
  zona?: string;
  region?: string;
  tiendaAsignadaId?: string;
}

export type RetailerId = 'MediaMarkt' | 'El Corte Inglés' | 'Carrefour' | 'Alcampo' | 'FNAC' | 'Orange' | 'Vodafone';

export interface RetailerInfo {
  id: RetailerId;
  name: string;
  logo: string;
  brandColor: string;
  accentColor: string;
  status: 'active' | 'in_preparation';
}

export interface StoreCenter {
  tiendaId: string;
  retailer: RetailerId;
  nombreTienda: string;
  tipoEspacioId: string;
  zona: string;
  region: string;
  totalPuestos: number;
  availableSpaces?: string[]; // ej: ['MESA 1 · Cara 1', 'MESA 1 · Cara 2', 'WALL', 'LINEAL SMARTWATCH']
  hasPad8Pro?: boolean; // Columna D: SI / NO
  linealWearablesPlanogram?: string; // ej: 'L. Wearables_9.0', 'L. Wearables_8.0', etc.
  linealWearablesCount?: number; // 9, 8, 7, 6
  auditStatus?: 'Pendiente' | 'En curso' | 'Auditada' | 'Con Incidencias';
  lastAuditDate?: string;
}

export interface SpaceType {
  tipoEspacioId: string;
  nombreTipo: string;
  configuracionMesas: string;
  modelo3DUrl?: string;
  descripcion: string;
}

export type ProductCategory = 'Smartphone' | 'Wearable' | 'Audio' | 'Ecosistema' | 'Tablet';

export interface PlanogramPosition {
  id: string; // ej: "MM-TARRAGONA-M1-C1-P1"
  tipoEspacioId: string;
  mesaId: string;
  cara: string; // "Cara 1" | "Cara 2" | "Mural Wall" | "Lineal"
  posicionNumero: number;
  categoria: ProductCategory;
  modeloOficial: string;
  colorOficial: string;
  esDummy: boolean;
  requiereImei: boolean;
  checkColor?: string;
  // Posicion relativa 3D procedural (para el visualizador 3D)
  x?: number;
  y?: number;
  z?: number;
  // Coordenadas 2D ajustadas al render de la mesa (en porcentaje 0-100)
  pinX?: number;
  pinY?: number;
}

export type PositionStatus = 'Pendiente' | 'OK' | 'Incidencia';

export type IncidentCategory = 
  | 'Material faltante'
  | 'Terminal apagado/roto'
  | 'Modelo incorrecto'
  | 'Alarma defectuosa'
  | 'Falta cartela de precio'
  | 'Suciedad'
  | 'Dispositivo no asegurado'
  | 'No coincide'
  | 'Robo'
  | 'Fallo alarmado'
  | 'Otro';

export interface PositionAuditState {
  posicionId: string;
  mesaId: string;
  posicionNumero: number;
  modeloOficial: string;
  modeloDetectado: string;
  imeiSerial: string;
  estadoPosicion: PositionStatus;
  tipoIncidencia?: IncidentCategory | '';
  esMaqueta: boolean;
  fotoEvidenciaUrl?: string;
  comentarios?: string;
  auditadoPor: string;
  fechaHora: string;
}

export interface AuditRecord {
  auditId: string;
  tiendaId: string;
  nombreTienda: string;
  retailer: string;
  usuarioEmail: string;
  usuarioNombre: string;
  fechaHora: string;
  totalPosiciones: number;
  okCount: number;
  incidenciasCount: number;
  pendientesCount: number;
  positions: PositionAuditState[];
  sincronizadoSheets: boolean;
}

export interface SheetsSyncConfig {
  webhookUrl: string;
  useOfflineFallback: boolean;
  lastSyncTimestamp?: number;
}

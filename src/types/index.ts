export type UserRole = 'Promotor' | 'GPV' | 'AM' | 'SuperAdmin' | string;

export interface UserProfile {
  password?: string;
  email: string;
  nombre: string;
  rol: UserRole;
  retailer?: string;
  zona?: string;
  region?: string;
  tiendaAsignadaId?: string;
  centrosAsignados?: string[];
  gpv?: string;
  am?: string;
  administradora?: string;
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
  posmElements?: VisualElementAuditState[];
  sincronizadoSheets: boolean;
}

export interface SheetsSyncConfig {
  webhookUrl: string;
  useOfflineFallback: boolean;
  lastSyncTimestamp?: number;
}

// ============================================================================
// TIPOS PARA EL MÓDULO "NUEVA IMPLANTACIÓN" (SWAP IN/OUT + PARTE VISUAL PLV)
// ============================================================================

export type AuditWorkflowMode = 'complete_audit' | 'new_implantation' | 'clean_audit';

export type SwapStatus = 'Pendiente' | 'OK' | 'Incidencia';

export type SwapOutIncidentMotivo =
  | 'Terminal ausente / Posible robo'
  | 'Terminal bloqueado / Sin encendido (Imei ilegible)'
  | 'Daño físico estético o funcional'
  | 'Alarma dañada';

export type SwapInIncidentMotivo =
  | 'Material no recibido en tienda'
  | 'Caja dañada / Terminal defectuoso de origen'
  | 'Fallo en alarmado'
  | 'Falta Cartela especificaciones'
  | 'Falta ficha energética'
  | 'Modo demo / Mi show no responde';

export type SwapIncidentMotivo = SwapOutIncidentMotivo | SwapInIncidentMotivo | string;

export interface SwapCampaignAssignment {
  posicionId: string;
  mesaId: string;
  posicionNumero: number;
  categoria: ProductCategory;
  modeloSaliente: string;
  esDummySaliente: boolean;
  modeloEntrante: string;
  esDummyEntrante: boolean;
}

export interface PositionSwapState {
  posicionId: string;
  mesaId: string;
  posicionNumero: number;
  categoria: ProductCategory;
  modeloRetirado: string;
  esDummyRetirado: boolean;
  imeiRetirado: string;
  fotoOutUrl?: string;
  modeloNuevo: string;
  esDummyNuevo: boolean;
  imeiNuevo: string;
  fotoInUrl?: string;
  estadoSwap: SwapStatus;
  incidenciaActiva: boolean;
  motivoIncidencia?: SwapIncidentMotivo | '';
  motivoIncidenciaOut?: SwapOutIncidentMotivo | '';
  motivoIncidenciaIn?: SwapInIncidentMotivo | '';
  observacionesIncidencia?: string;
  auditadoPor: string;
  usuarioEmail: string;
  fechaHora: string;
}

export type VisualIncidentMotivo =
  | 'Medidas no coinciden'
  | 'Material roto o dañado de origen'
  | 'Falta perfilería/sujeción'
  | 'Campaña desfasada'
  | 'Sin lona instalada'
  | 'Otro';

export interface VisualElementDefinition {
  id: string;
  nombreElemento: string;
  tipoMaterial:
    | 'Textil / Lona'
    | 'Cartelería / Cabecero'
    | 'Merchandising / Metacrilato'
    | 'Pantalla Digital / Hanshow'
    | 'Faldón Mesa / Vinilo'
    | 'Duratrans / Filmina'
    | 'Luminoso / Metacrilato';
  ubicacionEspacio: string;
  campanaOficial: string;
  medidasOficiales: string;
  instruccionesFijacion: string;
  guiaVisualTipo:
    | 'lona_mesa'
    | 'cabecero_wall'
    | 'stands_merch'
    | 'hanshow_screen'
    | 'faldon_mesa'
    | 'columna'
    | 'top_table'
    | 'luminoso';
  imagenReferenciaAntes?: string;
  imagenReferenciaDespues?: string;
}

export interface VisualElementAuditState {
  elementoId: string;
  nombreElemento: string;
  tipoMaterial: string;
  medidasOficiales: string;
  fotoAntiguaUrl?: string;
  fotoNuevaUrl?: string;
  fijacionYMedidaCorrecta: boolean | null;
  estadoVisual: 'Pendiente' | 'OK' | 'Incidencia';
  motivoIncidencia?: VisualIncidentMotivo | '';
  notas?: string;
  auditadoPor: string;
  usuarioEmail: string;
  fechaHora: string;
}

export interface DeviceReturnState {
  id: string;
  posicionAnterior: number;
  mesaId: string;
  modeloSaliente: string;
  esDummy: boolean;
  categoria: ProductCategory;
  motivoRetirada: string;
  sustituidoPor: string;
  imeiMemorizado?: string;
  estadoRetirada: 'Pendiente' | 'Retirado' | 'Incidencia';
  motivoIncidencia?: string;
  observaciones?: string;
  fotoRetiradaUrl?: string;
  confirmadoPor?: string;
  fechaHora?: string;
}

export interface ImplantationDraft {
  tiendaId: string;
  campanaNombre: string;
  swapStates: Record<string, PositionSwapState>;
  visualStates: Record<string, VisualElementAuditState>;
  returnStates?: Record<string, DeviceReturnState>;
  updatedAt: string;
}

export interface ImplantationRecord {
  implantationId: string;
  campanaNombre: string;
  tiendaId: string;
  nombreTienda: string;
  retailer: string;
  usuarioEmail: string;
  usuarioNombre: string;
  fechaHora: string;
  totalSwapPositions: number;
  completedSwapCount: number;
  swapIncidentsCount: number;
  totalVisualElements: number;
  completedVisualCount: number;
  visualIncidentsCount: number;
  totalReturnDevices?: number;
  completedReturnCount?: number;
  returnIncidentsCount?: number;
  swapPositions: PositionSwapState[];
  visualElements: VisualElementAuditState[];
  returnDevices?: DeviceReturnState[];
  fotoMesaCompletaUrl?: string;
  directLinkUrl: string;
  sharedDriveEmail: string;
  sincronizadoSheets: boolean;
}


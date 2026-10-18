import { StoreCenter, UserProfile, UserRole } from '../types';
import { DbService } from './dbService';

const ACTIVE_USER_KEY = 'brand_audit_active_user';

export class AuthService {
  static getActiveUser(): UserProfile {
    const raw = localStorage.getItem(ACTIVE_USER_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    const defaultUser = DbService.getUsers()[0];
    this.setActiveUser(defaultUser);
    return defaultUser;
  }

  static setActiveUser(user: UserProfile) {
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
  }

  static loginByEmail(email: string): UserProfile | null {
    const users = DbService.getUsers();
    const clean = email.trim().toLowerCase();
    const found = users.find(u => u.email.toLowerCase() === clean);
    if (found) {
      this.setActiveUser(found);
      return found;
    }
    return null;
  }

  /**
   * Normaliza los roles provenientes de Google Sheets (ej: "administradora", "trainer", "am", "gpv")
   * al estándar canónico RBAC del sistema.
   */
  static normalizeRole(rawRole?: string): UserRole {
    if (!rawRole) return 'Promotor';
    const r = rawRole.toLowerCase().trim();
    if (r.includes('admin') || r.includes('superadmin') || r.includes('coordin') || r.includes('director')) {
      return 'SuperAdmin';
    }
    if (r === 'am' || r.includes('area') || r.includes('trainer') || r.includes('formador') || r.includes('lead')) {
      return 'AM';
    }
    if (r === 'gpv') {
      return 'GPV';
    }
    return 'Promotor';
  }

  /**
   * Limpieza y normalización de cadenas de texto para comparaciones flexibles
   */
  static normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quita tildes
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Determina si el nombre de un centro asignado (Columna K) coincide con un centro del catálogo.
   * Regla de negocio: La parte inicial es completa y DEBE coincidir obligatoriamente (mismo retailer y localidad).
   * El nombre de la hoja solo puede estar acortado en su parte final (ej: "Media Barcelona 5 Fontane" -> "Media Barcelona 5 Fontanella").
   */
  static isStoreMatch(assignedName: string, store: StoreCenter): boolean {
    if (!assignedName) return false;
    const a = this.normalizeText(assignedName);
    const sName = this.normalizeText(store.nombreTienda);
    const sId = this.normalizeText(store.tiendaId);

    // 1. Coincidencia exacta con ID de tienda o Nombre completo
    if (a === sId || a === sName) return true;

    // 2. Coincidencia estricta desde el INICIO (prefijo):
    // La parte inicial debe coincidir íntegramente. El truncamiento solo se permite en la parte final.
    if (sName.startsWith(a)) {
      const remaining = sName.slice(a.length).trim();
      // Si la tienda oficial añade un número de centro diferente (ej: "2"), no coincide
      if (/^\d/.test(remaining)) {
        return false;
      }
      return true;
    }

    if (a.startsWith(sName)) {
      const remaining = a.slice(sName.length).trim();
      if (/^\d/.test(remaining)) {
        return false;
      }
      return true;
    }

    return false;
  }

  /**
   * Lógica de Acceso Jerárquico RBAC según Especificación:
   * - Promotor: Centros asignados en Columna K.
   * - GPV: Centros donde su nombre aparece en Columna F (asignados para él).
   * - AM: Centros donde su nombre aparece en Columna G (asignados para él).
   * - Administradora: Centros donde su nombre aparece en Columna J (o acceso global si es Nacional/Global).
   */
  static canAccessStore(user: UserProfile, store: StoreCenter): boolean {
    if (!user) return true;
    const role = this.normalizeRole(user.rol);

    // 1. Recopilar centros asignados expresamente para este usuario
    const userCenters: string[] = [];
    if (user.centrosAsignados && Array.isArray(user.centrosAsignados)) {
      userCenters.push(...user.centrosAsignados);
    }
    if (user.tiendaAsignadaId) {
      user.tiendaAsignadaId.split(',').forEach(c => {
        const tr = c.trim();
        if (tr && !userCenters.includes(tr)) userCenters.push(tr);
      });
    }

    const hasGlobalFlag = userCenters.some(c => {
      const cl = c.toLowerCase();
      return cl === 'national' || cl === 'nacional' || cl === 'global' || cl === 'todos';
    });

    // 2. Administradora / SuperAdmin
    if (role === 'SuperAdmin') {
      if (hasGlobalFlag || userCenters.length === 0) return true;
      // Si la administradora tiene lista específica de centros asignados (Col J)
      return userCenters.some(assigned => this.isStoreMatch(assigned, store));
    }

    // 3. AM (Area Manager)
    if (role === 'AM') {
      if (hasGlobalFlag) return true;
      // Centros donde su nombre aparece en Col G
      if (userCenters.length > 0) {
        const matchesAssigned = userCenters.some(assigned => this.isStoreMatch(assigned, store));
        if (matchesAssigned) return true;
      }
      // Fallback a región si coincide
      if (!user.region || user.region === 'Nacional' || user.region === 'Global' || user.region === 'Todos') {
        return true;
      }
      return Boolean(store.region.toLowerCase() === user.region.toLowerCase());
    }

    // 4. GPV
    if (role === 'GPV') {
      if (hasGlobalFlag) return true;
      // Centros donde su nombre aparece en Col F
      if (userCenters.length > 0) {
        const matchesAssigned = userCenters.some(assigned => this.isStoreMatch(assigned, store));
        if (matchesAssigned) return true;
      }
      // Fallback a zona asignada
      if (user.zona && user.zona !== 'Todos' && user.zona !== 'Nacional' && user.zona !== 'Global') {
        return Boolean(store.zona.toLowerCase().includes(user.zona.toLowerCase()));
      }
      return true;
    }

    // 5. Promotor
    if (role === 'Promotor') {
      if (hasGlobalFlag) return true;
      if (userCenters.length > 0) {
        return userCenters.some(assigned => this.isStoreMatch(assigned, store));
      }
      // Si no tiene centro asignado pero su nombre coincide con la tienda
      if (user.nombre && store.nombreTienda.toLowerCase().includes(user.nombre.toLowerCase())) {
        return true;
      }
      return false;
    }

    return true;
  }

  static filterStoresForUser(user: UserProfile, stores: StoreCenter[]): StoreCenter[] {
    if (!stores || stores.length === 0) return [];
    if (!user) return stores;

    const filtered = stores.filter(store => this.canAccessStore(user, store));

    // Si el filtro no encuentra ninguna tienda asignada para este usuario (ej. usuario nuevo o tienda sin mapear),
    // devolvemos todas las tiendas para que nunca se quede la pantalla en blanco
    if (filtered.length === 0) {
      console.warn(`[AuthService] No se encontraron tiendas específicas para ${user.email}. Mostrando tiendas disponibles.`);
      return stores;
    }

    return filtered;
  }

  static getRoleBadgeColor(role: string): { bg: string; text: string; border: string } {
    const r = this.normalizeRole(role);
    switch (r) {
      case 'SuperAdmin':
        return { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' };
      case 'AM':
        return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' };
      case 'GPV':
        return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' };
      case 'Promotor':
      default:
        return { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30' };
    }
  }
}

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
   * Lógica de Acceso Jerárquico RBAC según Especificación:
   * - SuperAdmin / Coordinación / Dirección: Acceso global a todas las superficies y tiendas.
   * - AM / Trainer / Formador: Acceso a todas las tiendas de su Región o Nacional/Global.
   * - GPV: Acceso a las tiendas pertenecientes a su Zona o Región.
   * - Promotor: Acceso a su propia tienda asignada (comparando ID de tienda o nombre de centro).
   */
  static canAccessStore(user: UserProfile, store: StoreCenter): boolean {
    if (!user) return true;
    const role = this.normalizeRole(user.rol);

    // SuperAdmin y Coordinación: acceso global
    if (role === 'SuperAdmin') {
      return true;
    }

    // AM y Trainers: acceso a todas las tiendas de su región o nacional
    if (role === 'AM') {
      if (!user.region || user.region === 'Nacional' || user.region === 'Global' || user.region === 'Todos') {
        return true;
      }
      return Boolean(
        store.region.toLowerCase() === user.region.toLowerCase() ||
        (user.zona && store.zona.toLowerCase().includes(user.zona.toLowerCase()))
      );
    }

    // GPV: acceso a tiendas de su zona
    if (role === 'GPV') {
      if (!user.zona || user.zona === 'Todos' || user.zona === 'Nacional' || user.zona === 'Global') {
        return true;
      }
      return Boolean(
        store.zona.toLowerCase().includes(user.zona.toLowerCase()) ||
        (user.region && store.region.toLowerCase() === user.region.toLowerCase())
      );
    }

    // Promotor: asignación por centro o nombre de tienda
    if (role === 'Promotor') {
      const uTienda = (user.tiendaAsignadaId || '').toLowerCase().trim();
      if (!uTienda || uTienda === 'national' || uTienda === 'nacional' || uTienda === 'todos') {
        return true;
      }

      const sId = store.tiendaId.toLowerCase().trim();
      const sName = store.nombreTienda.toLowerCase().trim();

      // Coincidencia directa por código o nombre
      if (sId === uTienda || sName === uTienda) {
        return true;
      }

      // Si tiendaAsignadaId contiene o está contenida en el nombre de la tienda
      if (sName.includes(uTienda) || uTienda.includes(sName)) {
        return true;
      }

      // Coincidencia por palabras clave representativas (evitando palabras comunes)
      const stopwords = new Set([
        'media', 'markt', 'mediamarkt', 'el', 'la', 'los', 'las', 'de', 'del', 'en', 
        'corte', 'ingles', 'tienda', 'space', 'brand', 'xiaomi'
      ]);
      const userKeywords = uTienda
        .replace(/[^a-záéíóúñ0-9\s]/gi, ' ')
        .split(/\s+/)
        .map(w => w.trim())
        .filter(w => w.length > 2 && !stopwords.has(w));

      if (userKeywords.length > 0) {
        const storeText = `${sId} ${sName}`.toLowerCase();
        if (userKeywords.some(kw => storeText.includes(kw))) {
          return true;
        }
      }

      // Si el nombre del usuario aparece en la tienda
      if (user.nombre && sName.includes(user.nombre.toLowerCase())) {
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
      console.warn(`[AuthService] No se encontraron tiendas restringidas para ${user.email}. Mostrando todas las tiendas disponibles.`);
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

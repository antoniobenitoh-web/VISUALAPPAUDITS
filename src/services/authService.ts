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
   * Lógica de Acceso Jerárquico RBAC según Especificación:
   * - Promotor: Acceso restringido exclusivamente a su propia tienda asignada (Tienda_Asignada_ID).
   * - GPV: Acceso a las tiendas pertenecientes a su Zona.
   * - AM: Acceso a todas las tiendas de su Region o Nacional.
   * - SuperAdmin: Acceso global a todas las superficies y tiendas.
   */
  static canAccessStore(user: UserProfile, store: StoreCenter): boolean {
    if (user.rol === 'SuperAdmin') {
      return true;
    }

    if (user.rol === 'AM') {
      if (!user.region || user.region === 'Nacional' || user.region === 'Global') {
        return true;
      }
      return store.region.toLowerCase() === user.region.toLowerCase();
    }

    if (user.rol === 'GPV') {
      if (user.zona) {
        return store.zona.toLowerCase().includes(user.zona.toLowerCase());
      }
      return true;
    }

    if (user.rol === 'Promotor') {
      if (user.tiendaAsignadaId) {
        return store.tiendaId.toLowerCase() === user.tiendaAsignadaId.toLowerCase();
      }
      return store.nombreTienda.toLowerCase().includes(user.nombre.toLowerCase());
    }

    return false;
  }

  static filterStoresForUser(user: UserProfile, stores: StoreCenter[]): StoreCenter[] {
    return stores.filter(store => this.canAccessStore(user, store));
  }

  static getRoleBadgeColor(role: UserRole): { bg: string; text: string; border: string } {
    switch (role) {
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

import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { AuthService } from '../services/authService';
import { DbService } from '../services/dbService';
import { Shield, Wifi, WifiOff, Settings, User, RefreshCw } from 'lucide-react';

interface HeaderProps {
  currentUser: UserProfile;
  onUserChange: (user: UserProfile) => void;
  onOpenSettings: () => void;
  isOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onUserChange,
  onOpenSettings,
  isOnline
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const users = DbService.getUsers();
  const badgeColors = AuthService.getRoleBadgeColor(currentUser.rol);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo de la aplicación */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-600/30">
            <span className="font-black text-white text-base tracking-tighter">X</span>
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-wide leading-tight">
              BRAND SPACES <span className="text-orange-500">AUDIT</span>
            </h1>
            <span className="text-[10px] text-slate-400 font-semibold block">
              PWA Corporativa · Salesland
            </span>
          </div>
        </div>

        {/* Controles de Estado y Perfil */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Indicador Offline / Online */}
          <div
            title={isOnline ? 'Conectado a la red' : 'Modo Offline (Almacenando localmente)'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${
              isOnline
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          {/* Selector de Rol / Perfil RBAC */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition cursor-pointer"
            >
              <div className="w-7 h-7 rounded-xl bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                <User className="w-3.5 h-3.5 text-slate-300" />
              </div>
              <div className="hidden sm:block text-left">
                <span className={`text-[10px] font-black uppercase px-1.5 py-0.2 rounded border ${badgeColors.bg} ${badgeColors.text} ${badgeColors.border}`}>
                  {currentUser.rol}
                </span>
                <p className="text-xs font-bold text-white truncate max-w-[120px]">
                  {currentUser.nombre}
                </p>
              </div>
            </button>

            {/* Dropdown para cambiar de usuario (simulación RBAC) */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50">
                <div className="px-3 py-2 border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Simular Rol de Usuario (RBAC)
                </div>
                <div className="py-1 space-y-1">
                  {users.map((u) => {
                    const bColor = AuthService.getRoleBadgeColor(u.rol);
                    const isSelected = u.email === currentUser.email;
                    return (
                      <button
                        key={u.email}
                        onClick={() => {
                          AuthService.setActiveUser(u);
                          onUserChange(u);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition ${
                          isSelected ? 'bg-sky-600/20 border border-sky-500/40' : 'hover:bg-slate-800'
                        }`}
                      >
                        <div className="truncate mr-2">
                          <p className="font-bold text-white truncate">{u.nombre}</p>
                          <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                        </div>
                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${bColor.bg} ${bColor.text} ${bColor.border}`}>
                          {u.rol}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Botón Ajustes / Actualización de App */}
          <button
            onClick={onOpenSettings}
            title="Actualizaciones de la Aplicación"
            className="w-9 h-9 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 transition cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { RetailerId, StoreCenter, UserProfile } from '../types';
import { AuthService } from '../services/authService';
import { RetailerLogo } from './RetailerLogos';
import { 
  Search, 
  Store, 
  MapPin, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowLeft,
  Sparkles,
  Smartphone
} from 'lucide-react';

interface StoreDirectoryProps {
  retailerId: RetailerId;
  currentUser: UserProfile;
  stores: StoreCenter[];
  onSelectStore: (store: StoreCenter) => void;
  onBack: () => void;
}

export const StoreDirectory: React.FC<StoreDirectoryProps> = ({
  retailerId,
  currentUser,
  stores,
  onSelectStore,
  onBack
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pendiente' | 'Auditada' | 'Con Incidencias'>('all');

  const userStores = AuthService.filterStoresForUser(currentUser, stores).filter(
    (s) => s.retailer === retailerId
  );

  const filtered = userStores.filter((store) => {
    const matchesSearch =
      store.nombreTienda.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.zona.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.tiendaId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || store.auditStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      {/* Botón Volver y Cabecera de la Cadena con Logo Oficial */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-11 h-11 rounded-2xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition hover:bg-slate-700 active:scale-95 shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-28 sm:w-32 h-10 flex items-center">
              <RetailerLogo id={retailerId} className="w-full h-9 object-contain" />
            </div>
            <div className="border-l border-slate-700 pl-3">
              <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                Directorio de Centros
              </h2>
              <p className="text-[11px] text-slate-400 font-semibold">
                {userStores.length} {userStores.length === 1 ? 'tienda asignada' : 'tiendas asignadas'} ({currentUser.rol})
              </p>
            </div>
          </div>
        </div>

        {/* Buscador Rápido Intuitivo */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, código o ciudad..."
            className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition shadow-inner"
          />
        </div>
      </div>

      {/* Filtros de Estado con Contador */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3.5 py-2 rounded-2xl font-bold transition shrink-0 border ${
            statusFilter === 'all'
              ? 'bg-sky-600 text-white border-sky-500 shadow-lg shadow-sky-600/20'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
          }`}
        >
          Todas ({userStores.length})
        </button>
        <button
          onClick={() => setStatusFilter('Pendiente')}
          className={`px-3.5 py-2 rounded-2xl font-bold transition shrink-0 border flex items-center gap-1.5 ${
            statusFilter === 'Pendiente'
              ? 'bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-600/20'
              : 'bg-slate-900 text-amber-400/80 border-slate-800 hover:text-amber-300 hover:bg-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pendientes</span>
        </button>
        <button
          onClick={() => setStatusFilter('Auditada')}
          className={`px-3.5 py-2 rounded-2xl font-bold transition shrink-0 border flex items-center gap-1.5 ${
            statusFilter === 'Auditada'
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/20'
              : 'bg-slate-900 text-emerald-400/80 border-slate-800 hover:text-emerald-300 hover:bg-slate-800'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Auditadas</span>
        </button>
        <button
          onClick={() => setStatusFilter('Con Incidencias')}
          className={`px-3.5 py-2 rounded-2xl font-bold transition shrink-0 border flex items-center gap-1.5 ${
            statusFilter === 'Con Incidencias'
              ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/20'
              : 'bg-slate-900 text-rose-400/80 border-slate-800 hover:text-rose-300 hover:bg-slate-800'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Con Incidencias</span>
        </button>
      </div>

      {/* Grid de Tiendas */}
      {filtered.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <Store className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-white font-bold text-sm">No se encontraron tiendas</h3>
          <p className="text-xs text-slate-400">
            Prueba a modificar el término de búsqueda o selecciona otro filtro.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((store) => {
            const isIncident = store.auditStatus === 'Con Incidencias';
            const isAudited = store.auditStatus === 'Auditada';

            return (
              <div
                key={store.tiendaId}
                onClick={() => onSelectStore(store)}
                className="group bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-slate-500 p-5 rounded-3xl shadow-xl transition-all cursor-pointer flex flex-col justify-between hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-sky-400" />
                      <span>{store.zona} ({store.region})</span>
                    </span>

                    {/* Badge de Estado */}
                    {isIncident ? (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Incidencia</span>
                      </span>
                    ) : isAudited ? (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Auditada</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Pendiente</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-extrabold text-white group-hover:text-sky-300 transition-colors">
                    {store.nombreTienda}
                  </h3>

                  <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-bold text-slate-300">{store.totalPuestos} puestos</span>
                    <span>•</span>
                    <span className="truncate">{store.tipoEspacioId}</span>
                  </div>

                  {/* Píldoras de espacios disponibles */}
                  {store.availableSpaces && store.availableSpaces.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {store.availableSpaces.slice(0, 3).map((sp) => (
                        <span key={sp} className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-slate-950 text-slate-400 border border-slate-800">
                          {sp}
                        </span>
                      ))}
                      {store.availableSpaces.length > 3 && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-slate-950 text-slate-500">
                          +{store.availableSpaces.length - 3} más
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 group-hover:text-white font-bold transition-colors">
                    Acceder a Planogramas
                  </span>
                  <div className="w-7 h-7 rounded-full bg-slate-800 group-hover:bg-sky-600 text-white flex items-center justify-center transition-transform group-hover:translate-x-1 shadow">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

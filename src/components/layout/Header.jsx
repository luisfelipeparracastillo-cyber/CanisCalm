import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Dog, ShieldCheck, Wifi, WifiOff, ChevronDown, Plus } from 'lucide-react';
import Badge from '../common/Badge';

export function Header() {
  const { dogs, activeDog, setActiveDog, apiConnected, setActiveTab } = useApp();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-surface-border shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Logo & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sage-500 text-white flex items-center justify-center shadow-soft">
            <Dog className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-sage-800 tracking-tight">CanisCalm</h1>
              <span className="hidden sm:inline-block">
                <Badge variant="sage" size="sm">v1.0</Badge>
              </span>
            </div>
            <p className="text-xs text-ink-muted hidden sm:block font-medium">
              Entrenamiento Reactivo & Rastreo Calmo GPS
            </p>
          </div>
        </div>

        {/* Right Actions: Pet Switcher & API Status */}
        <div className="flex items-center gap-3">
          {/* Active Pet Selector */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2.5 px-3.5 py-2 bg-sage-50 hover:bg-sage-100 border border-sage-200 rounded-2xl text-sage-800 text-sm font-semibold transition-all cursor-pointer shadow-soft"
              aria-label="Seleccionar perro activo"
            >
              <div className="w-6 h-6 rounded-full bg-sage-500 text-white text-xs font-bold flex items-center justify-center">
                {activeDog ? activeDog.name.charAt(0).toUpperCase() : '?'}
              </div>
              <span className="max-w-[120px] truncate">
                {activeDog ? activeDog.name : 'Sin perro'}
              </span>
              <ChevronDown className="w-4 h-4 text-sage-600" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-hover border border-surface-border py-2 z-50 animate-slide-up">
                <div className="px-4 py-2 text-xs font-bold text-ink-muted uppercase tracking-wider border-b border-surface-border">
                  Tus Perros
                </div>
                {dogs.length > 0 ? (
                  dogs.map((dog) => (
                    <button
                      key={dog.id}
                      onClick={() => {
                        setActiveDog(dog);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-sage-50 transition-colors ${
                        activeDog?.id === dog.id ? 'font-bold text-sage-700 bg-sage-50/50' : 'text-ink-primary'
                      }`}
                    >
                      <span className="truncate">{dog.name}</span>
                      {dog.breed_name && (
                        <span className="text-xs text-ink-muted truncate max-w-[90px]">{dog.breed_name}</span>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-xs text-ink-muted">No hay perros registrados</div>
                )}
                <div className="border-t border-surface-border mt-1 pt-1">
                  <button
                    onClick={() => {
                      setActiveTab('profiles');
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-sage-600 hover:bg-sage-50 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Gestionar / Añadir Perro</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Connection Status Badge */}
          <div className="flex items-center">
            {apiConnected ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200" title="Conectado al Servidor Backend Local">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Wifi className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Online (Backend)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200" title="Operando en Modo Autónomo Local (Resiliente)">
                <Wifi className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Modo Local</span>
              </span>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}

export default Header;

import React from 'react';
import { useApp } from '../../context/AppContext';
import { MapPin, BookOpen, Dog, Shield, BarChart3 } from 'lucide-react';

export function Navigation() {
  const { activeTab, setActiveTab, isWalking } = useApp();

  const navItems = [
    {
      id: 'live_walk',
      label: 'Paseo en Vivo',
      icon: MapPin,
      badge: isWalking ? 'ACTIVO' : null,
    },
    {
      id: 'breeds',
      label: 'Razas',
      icon: BookOpen,
    },
    {
      id: 'profiles',
      label: 'Mis Perros',
      icon: Dog,
    },
    {
      id: 'training',
      label: 'Entrenamiento',
      icon: Shield,
    },
    {
      id: 'analytics',
      label: 'Analítica',
      icon: BarChart3,
    },
  ];

  return (
    <>
      {/* Desktop / Tablet Top Navigation Bar */}
      <nav className="hidden md:block bg-cream-100 border-b border-surface-border py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-sage-500 text-white shadow-soft scale-[1.02]'
                    : 'text-ink-secondary hover:text-sage-800 hover:bg-sage-100/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-sage-600'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-extrabold bg-terracotta-500 text-white animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Bottom Fixed Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-surface-border px-2 py-2 shadow-hover">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center w-full py-1.5 px-1 rounded-xl transition-all ${
                  isActive ? 'text-sage-600 font-bold' : 'text-ink-muted font-medium hover:text-ink-primary'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-sage-500 stroke-[2.5]' : 'stroke-[1.75]'}`} />
                  {item.badge && (
                    <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-terracotta-500 animate-ping" />
                  )}
                </div>
                <span className="text-[11px] leading-tight truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export default Navigation;

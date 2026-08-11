import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { Search, Globe, Award, Zap, Flame, ShieldAlert, Activity, CheckCircle2 } from 'lucide-react';

const FCI_GROUPS = [
  'Todos',
  'Grupo 1: Perros de Pastor',
  'Grupo 2: Pinscher y Schnauzer - Molosoides',
  'Grupo 3: Terriers',
  'Grupo 5: Perros tipo Spitz y Primitivo',
  'Grupo 6: Perros tipo Sabueso',
  'Grupo 8: Cobradores y Perros de Agua',
];

export function BreedEncyclopedia() {
  const { breeds = [] } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('Todos');

  // Instant client-side memoized filtering for 100% rock-solid performance
  const filteredBreeds = useMemo(() => {
    return breeds.filter((b) => {
      const matchesSearch =
        !searchTerm ||
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.description && b.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.fci_origin && b.fci_origin.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesGroup =
        selectedGroup === 'Todos' ||
        (b.fci_group && b.fci_group.toLowerCase().includes(selectedGroup.split(':')[0].toLowerCase()));

      return matchesSearch && matchesGroup;
    });
  }, [breeds, searchTerm, selectedGroup]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner & Official FCI Seal */}
      <div className="bg-white p-6 rounded-3xl border border-surface-border shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-sage-800">Enciclopedia Canina Oficial FCI</h2>
            <Badge variant="sage" size="sm" className="flex items-center gap-1 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Norma FCI
            </Badge>
          </div>
          <p className="text-sm text-ink-secondary mt-1">
            Información verídica basada en los estándares de la <strong>Fédération Cynologique Internationale (FCI)</strong> y perfiles de reactividad canina.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            placeholder="Buscar por raza, origen o FCI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-cream-100 border border-surface-border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 font-medium"
          />
        </div>
      </div>

      {/* FCI Group Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {FCI_GROUPS.map((group) => {
          const isActive = selectedGroup === group;
          return (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-sage-600 text-white shadow-soft font-bold'
                  : 'bg-white text-ink-secondary border border-surface-border hover:bg-sage-50'
              }`}
            >
              {group}
            </button>
          );
        })}
      </div>

      {/* Breeds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBreeds.map((breed) => (
          <Card key={breed.id || breed.name} hoverable className="flex flex-col justify-between border border-surface-border">
            <div>
              {/* Image & FCI Badges */}
              {breed.image_url && (
                <div className="relative h-44 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-3xl bg-cream-200">
                  <img
                    src={breed.image_url}
                    alt={breed.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-sage-900 border border-white/50 shadow-soft">
                    {breed.fci_standard || 'FCI N° Standard'}
                  </div>
                  {breed.fci_origin && (
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-semibold text-white flex items-center gap-1">
                      <Globe className="w-3 h-3 text-cream-300" /> {breed.fci_origin}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-lg font-bold text-sage-900">{breed.name}</h3>
              </div>

              {/* FCI Group Label */}
              <div className="mb-3">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sage-700 bg-sage-50 px-2 py-0.5 rounded-md border border-sage-200">
                  <Award className="w-3 h-3 text-sage-600" />
                  {breed.fci_group || 'Clasificación FCI'}
                </span>
              </div>

              <p className="text-xs text-ink-secondary line-clamp-3 mb-4 leading-relaxed">
                {breed.description}
              </p>
            </div>

            {/* Temperament & Reactivity Metrics */}
            <div className="space-y-2 pt-3 border-t border-surface-border text-xs">
              <div className="flex justify-between items-center text-ink-secondary">
                <span className="flex items-center gap-1.5 font-medium"><Zap className="w-3.5 h-3.5 text-amber-500" /> Nivel de Energía</span>
                <span className="font-extrabold text-sage-900">{breed.energy_level || 3} / 5</span>
              </div>
              <div className="flex justify-between items-center text-ink-secondary">
                <span className="flex items-center gap-1.5 font-medium"><Flame className="w-3.5 h-3.5 text-terracotta-500" /> Impulso de Presa</span>
                <span className="font-extrabold text-sage-900">{breed.prey_drive || 3} / 5</span>
              </div>
              <div className="flex justify-between items-center text-ink-secondary">
                <span className="flex items-center gap-1.5 font-medium"><ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> Sensibilidad Estímulo</span>
                <span className="font-extrabold text-sage-900">{breed.sensitivity || 3} / 5</span>
              </div>
              <div className="flex justify-between items-center text-ink-secondary">
                <span className="flex items-center gap-1.5 font-medium"><Activity className="w-3.5 h-3.5 text-sage-500" /> Umbral Excitación</span>
                <span className="font-extrabold text-sage-900">{breed.arousal_threshold || 3} / 5</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default BreedEncyclopedia;

import React from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { BarChart3, TrendingDown, Map, Calendar, AlertCircle } from 'lucide-react';

export function AnalyticsDashboard() {
  const { stats, activeDog } = useApp();

  const totalWalks = stats?.total_walks || 0;
  const totalEvents = stats?.total_events || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-3xl border border-surface-border shadow-soft flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-sage-800">Analítica & Progreso</h2>
          <p className="text-sm text-ink-secondary mt-1">
            {activeDog
              ? `Estadísticas de frecuencia y mapa de calor para ${activeDog.name}`
              : 'Resumen global de paseos y eventos de reactividad'}
          </p>
        </div>
        <Badge variant="sage" size="md">Tiempo Real</Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sage-100 text-sage-700 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-ink-muted">Total Paseos</span>
            <div className="text-2xl font-black text-sage-900">{totalWalks}</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-terracotta-100 text-terracotta-700 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-ink-muted">Episodios Registrados</span>
            <div className="text-2xl font-black text-terracotta-900">{totalEvents}</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-ink-muted">Tendencia Promedio</span>
            <div className="text-2xl font-black text-emerald-900">-18%</div>
          </div>
        </Card>
      </div>

      {/* Chart & Heatmap Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 flex flex-col justify-between min-h-[300px]">
          <div>
            <h3 className="font-bold text-sage-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-sage-600" /> Frecuencia de Detonantes
            </h3>
            <p className="text-xs text-ink-secondary mt-1">Distribución por categoría de estímulo gatillo.</p>
          </div>
          <div className="py-12 text-center text-ink-muted text-xs border border-dashed border-sage-200 rounded-2xl bg-sage-50/30">
            Gráfico de Frecuencia Interactivo (Milestone 5)
          </div>
        </Card>

        <Card className="p-6 flex flex-col justify-between min-h-[300px]">
          <div>
            <h3 className="font-bold text-sage-900 flex items-center gap-2">
              <Map className="w-5 h-5 text-terracotta-600" /> Mapa de Calor de Reactividad
            </h3>
            <p className="text-xs text-ink-secondary mt-1">Zonas críticas y acumulado de eventos en ruta.</p>
          </div>
          <div className="py-12 text-center text-ink-muted text-xs border border-dashed border-terracotta-200 rounded-2xl bg-terracotta-50/30">
            Mapa de Calor Leaflet Hotspot (Milestone 5)
          </div>
        </Card>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;

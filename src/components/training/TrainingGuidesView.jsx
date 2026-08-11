import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { Shield, Eye, RefreshCw, Compass, Clock, CheckCircle } from 'lucide-react';

export function TrainingGuidesView() {
  const guides = [
    {
      id: 'lat',
      title: 'Técnica LAT (Look At That)',
      category: 'Reorientación de Atención',
      icon: Eye,
      description: 'Enseña a tu perro a mirar el estímulo gatillo y volver la mirada hacia ti a cambio de una recompensa de alto valor.',
      level: 'Principiante',
    },
    {
      id: 'counter_conditioning',
      title: 'Contracondicionamiento Clásico',
      category: 'Modificación Emocional',
      icon: RefreshCw,
      description: 'Asocia la presencia del detonante con estímulos sumamente placenteros para modificar su respuesta fisiológica.',
      level: 'Intermedio',
    },
    {
      id: 'comfort_zones',
      title: 'Zonas de Confort y Umbrales',
      category: 'Manejo de Distancia',
      icon: Compass,
      description: 'Identifica la distancia crítica bajo la cual el perro entra en sobre-excitación y cómo mantenerte siempre bajo umbral.',
      level: 'Fundamental',
    },
    {
      id: 'three_second_rule',
      title: 'Regla de los 3 Segundos',
      category: 'Control de Exposición',
      icon: Clock,
      description: 'Permite contacto visual o exploración durante máximo 3 segundos antes de romper el contacto amablemente.',
      level: 'Avanzado',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-3xl border border-surface-border shadow-soft">
        <h2 className="text-2xl font-extrabold text-sage-800">Guías de Entrenamiento y Desensibilización</h2>
        <p className="text-sm text-ink-secondary mt-1">
          Protocolos interactivos paso a paso basados en refuerzo positivo para reducción de reactividad.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guides.map((guide) => {
          const Icon = guide.icon;
          return (
            <Card key={guide.id} hoverable className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-sage-100 text-sage-700 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge variant="sage" size="sm">{guide.level}</Badge>
                </div>
                <h3 className="text-lg font-bold text-sage-900 mb-1">{guide.title}</h3>
                <p className="text-xs font-semibold text-terracotta-600 mb-2">{guide.category}</p>
                <p className="text-xs text-ink-secondary leading-relaxed">{guide.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-surface-border flex items-center justify-between text-xs text-sage-700 font-bold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" /> Protocolo Validado
                </span>
                <span>Ver Guía Pasos →</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default TrainingGuidesView;

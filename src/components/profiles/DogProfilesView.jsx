import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import Modal from '../common/Modal';
import { Dog, Plus, Edit2, Trash2, Heart, Award } from 'lucide-react';

export function DogProfilesView() {
  const { dogs, activeDog, setActiveDog, breeds, createNewDog, deleteExistingDog } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    breed_id: '',
    age: '',
    triggers: '',
    training_goals: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const triggersArray = formData.triggers
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      await createNewDog({
        name: formData.name,
        breed_id: Number(formData.breed_id) || 1,
        age: Number(formData.age) || 0,
        triggers: triggersArray,
        training_goals: formData.training_goals || '',
      });
      setModalOpen(false);
      setFormData({ name: '', breed_id: '', age: '', triggers: '', training_goals: '' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-3xl border border-surface-border shadow-soft flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-sage-800">Mis Perros</h2>
          <p className="text-sm text-ink-secondary mt-1">
            Administra perfiles de tus mascotas, desensibilizaciones activas y objetivos.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setModalOpen(true)}>
          Nuevo Perro
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dogs.map((dog) => {
          const isSelected = activeDog?.id === dog.id;
          const parsedTriggers = Array.isArray(dog.triggers)
            ? dog.triggers
            : typeof dog.triggers === 'string'
            ? JSON.parse(dog.triggers || '[]')
            : [];

          return (
            <Card
              key={dog.id}
              className={`relative border-2 ${
                isSelected ? 'border-sage-500 ring-2 ring-sage-200' : 'border-surface-border'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sage-100 text-sage-700 flex items-center justify-center font-bold text-lg">
                    {dog.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-sage-900">{dog.name}</h3>
                    <p className="text-xs text-ink-secondary">{dog.breed_name || 'Raza Mixta'} • {dog.age} años</p>
                  </div>
                </div>
                {isSelected && <Badge variant="sage" size="sm">Activo</Badge>}
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <span className="text-xs font-semibold text-ink-muted">Desencadenantes Conocidos:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {parsedTriggers.length > 0 ? (
                      parsedTriggers.map((t, idx) => (
                        <Badge key={idx} variant="terracotta" size="sm">{t}</Badge>
                      ))
                    ) : (
                      <span className="text-xs text-ink-muted italic">Ninguno registrado</span>
                    )}
                  </div>
                </div>

                {dog.training_goals && (
                  <div>
                    <span className="text-xs font-semibold text-ink-muted">Meta de Entrenamiento:</span>
                    <p className="text-xs text-ink-primary mt-0.5 line-clamp-2">{dog.training_goals}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-surface-border flex items-center justify-between">
                <Button
                  variant={isSelected ? 'soft' : 'outline'}
                  size="sm"
                  onClick={() => setActiveDog(dog)}
                >
                  {isSelected ? 'Seleccionado' : 'Seleccionar'}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteExistingDog(dog.id)}
                  className="text-rose-500 hover:bg-rose-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal Creación Perro */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Registrar Nuevo Perro"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-ink-secondary mb-1">Nombre</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-cream-100 border border-surface-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
              placeholder="Ej: Max"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-ink-secondary mb-1">Raza</label>
              <select
                value={formData.breed_id}
                onChange={(e) => setFormData({ ...formData, breed_id: e.target.value })}
                className="w-full px-3 py-2.5 bg-cream-100 border border-surface-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
              >
                <option value="">Selecciona Raza</option>
                {breeds.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-ink-secondary mb-1">Edad (años)</label>
              <input
                type="number"
                min="0"
                max="25"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-cream-100 border border-surface-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
                placeholder="Ej: 3"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-secondary mb-1">Desencadenantes (separados por coma)</label>
            <input
              type="text"
              value={formData.triggers}
              onChange={(e) => setFormData({ ...formData, triggers: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-cream-100 border border-surface-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
              placeholder="Ej: Bicicletas, Perros sin correa, Ruido fuerte"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-secondary mb-1">Meta de Entrenamiento</label>
            <textarea
              rows="3"
              value={formData.training_goals}
              onChange={(e) => setFormData({ ...formData, training_goals: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-cream-100 border border-surface-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
              placeholder="Ej: Lograr reducir la reactividad a menos de 3 metros durante paseos..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-border">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" type="submit">Guardar Perro</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default DogProfilesView;

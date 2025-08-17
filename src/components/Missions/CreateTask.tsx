import React, { useState } from 'react';
import { 
  CheckSquare, 
  User, 
  Calendar, 
  Clock, 
  Target, 
  Save,
  X
} from 'lucide-react';
import { Task, Priority } from '../../types';
import { useAuth } from '../../hooks/useAuth';

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Faible', color: 'bg-gray-100 text-gray-700' },
  { value: 'medium', label: 'Moyenne', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'high', label: 'Haute', color: 'bg-orange-100 text-orange-700' },
  { value: 'urgent', label: 'Urgente', color: 'bg-red-100 text-red-700' }
];

interface CreateTaskProps {
  missionId: string;
  onSave: (task: Partial<Task>) => void;
  onCancel: () => void;
}

export default function CreateTask({ missionId, onSave, onCancel }: CreateTaskProps) {
  const { getAllUsers } = useAuth();
  const [formData, setFormData] = useState<Partial<Task>>({
    missionId,
    title: '',
    description: '',
    assignedTo: '',
    status: 'todo',
    priority: 'medium',
    estimatedHours: 1,
    actualHours: 0,
    tags: [],
    checklist: [],
    comments: [],
    attachments: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const allUsers = getAllUsers();
  const availableUsers = allUsers.filter(u => u.role === 'collaborator' || u.role === 'manager');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) newErrors.title = 'Le titre est requis';
    if (!formData.assignedTo) newErrors.assignedTo = 'L\'assignation est requise';
    if (!formData.estimatedHours || formData.estimatedHours <= 0) newErrors.estimatedHours = 'Les heures estimées doivent être positives';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const task: Partial<Task> = {
        ...formData,
        id: Date.now().toString(),
        history: [{
          id: Date.now().toString(),
          action: 'Tâche créée',
          userId: formData.assignedTo!,
          details: 'Nouvelle tâche créée',
          createdAt: new Date()
        }],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      onSave(task);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Nouvelle Tâche</h2>
              <p className="text-gray-600 text-sm">Créer une nouvelle tâche dans la mission</p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Titre et Description */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre de la Tâche *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ex: Saisir les écritures comptables"
              />
              {errors.title && <p className="text-red-600 text-xs mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Description détaillée de la tâche..."
              />
            </div>
          </div>

          {/* Assignation et Priorité */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigné à *
              </label>
              <select
                value={formData.assignedTo}
                onChange={(e) => handleChange('assignedTo', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.assignedTo ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Sélectionner un collaborateur</option>
                {availableUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} - {user.team} ({user.role === 'manager' ? 'Manager' : 'Collaborateur'})
                  </option>
                ))}
              </select>
              {errors.assignedTo && <p className="text-red-600 text-xs mt-1">{errors.assignedTo}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priorité
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {priorities.map(priority => (
                  <option key={priority.value} value={priority.value}>{priority.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates et Heures */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date d'Échéance
              </label>
              <input
                type="date"
                value={formData.dueDate?.toISOString().split('T')[0] || ''}
                onChange={(e) => handleChange('dueDate', e.target.value ? new Date(e.target.value) : undefined)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heures Estimées *
              </label>
              <input
                type="number"
                value={formData.estimatedHours}
                onChange={(e) => handleChange('estimatedHours', parseFloat(e.target.value) || 0)}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.estimatedHours ? 'border-red-300' : 'border-gray-300'
                }`}
                min="0"
                step="0.5"
              />
              {errors.estimatedHours && <p className="text-red-600 text-xs mt-1">{errors.estimatedHours}</p>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Save className="h-4 w-4" />
              <span>Créer la Tâche</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
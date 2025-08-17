import React, { useState } from 'react';
import { 
  FolderOpen, 
  User, 
  Calendar, 
  Clock, 
  Target, 
  FileText,
  Save,
  X,
  Plus
} from 'lucide-react';
import { Mission, MissionType, Priority } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useClients } from '../../hooks/useClients';

const missionTypes: { value: MissionType; label: string }[] = [
  { value: 'accounting', label: 'Comptabilité' },
  { value: 'vat', label: 'TVA' },
  { value: 'corporate_tax', label: 'Impôt sur les Sociétés' },
  { value: 'income_tax', label: 'Impôt sur le Revenu' },
  { value: 'cnss', label: 'CNSS' },
  { value: 'payroll', label: 'Paie' },
  { value: 'audit', label: 'Audit' },
  { value: 'legal', label: 'Juridique' },
  { value: 'incorporation', label: 'Constitution' }
];

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Faible', color: 'bg-gray-100 text-gray-700' },
  { value: 'medium', label: 'Moyenne', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'high', label: 'Haute', color: 'bg-orange-100 text-orange-700' },
  { value: 'urgent', label: 'Urgente', color: 'bg-red-100 text-red-700' }
];

interface CreateMissionProps {
  onSave: (mission: Partial<Mission>) => void;
  onCancel: () => void;
}

export default function CreateMission({ onSave, onCancel }: CreateMissionProps) {
  const { clients } = useClients();
  const { getAllUsers } = useAuth();
  const [formData, setFormData] = useState<Partial<Mission>>({
    clientId: '',
    title: '',
    description: '',
    type: 'accounting',
    priority: 'medium',
    budgetHours: 8,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours par défaut
    assignedTo: [],
    status: 'todo'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const allUsers = getAllUsers();
  const availableCollaborators = allUsers.filter(u => u.role === 'collaborator' || u.role === 'manager');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientId) newErrors.clientId = 'Le client est requis';
    if (!formData.title?.trim()) newErrors.title = 'Le titre est requis';
    if (!formData.type) newErrors.type = 'Le type de mission est requis';
    if (!formData.budgetHours || formData.budgetHours <= 0) newErrors.budgetHours = 'Le budget en heures doit être positif';
    if (!formData.startDate) newErrors.startDate = 'La date de début est requise';
    if (!formData.endDate) newErrors.endDate = 'La date de fin est requise';
    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = 'La date de fin doit être après la date de début';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const mission: Partial<Mission> = {
        ...formData,
        id: Date.now().toString(),
        consumedHours: 0,
        tasks: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      onSave(mission);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAssignedToChange = (userId: string, checked: boolean) => {
    const currentAssigned = formData.assignedTo || [];
    if (checked) {
      handleChange('assignedTo', [...currentAssigned, userId]);
    } else {
      handleChange('assignedTo', currentAssigned.filter(id => id !== userId));
    }
  };

  const getClientDisplayName = (client: any) => {
    const parts = [];
    if (client.companyName) parts.push(client.companyName);
    if (client.sector) parts.push(`(${client.sector})`);
    if (client.address?.city) parts.push(`- ${client.address.city}`);
    return parts.join(' ');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Nouvelle Mission</h2>
              <p className="text-gray-600 text-sm">Créer une nouvelle mission pour un client</p>
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
          {/* Client */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client *
            </label>
            <select
              value={formData.clientId}
              onChange={(e) => handleChange('clientId', e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.clientId ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Sélectionner un client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {getClientDisplayName(client)}
                </option>
              ))}
            </select>
            {errors.clientId && <p className="text-red-600 text-xs mt-1">{errors.clientId}</p>}
          </div>

          {/* Titre et Description */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre de la Mission *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ex: Déclaration TVA Janvier 2024"
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
                placeholder="Description détaillée de la mission..."
              />
            </div>
          </div>

          {/* Type et Priorité */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de Mission *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.type ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                {missionTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              {errors.type && <p className="text-red-600 text-xs mt-1">{errors.type}</p>}
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

          {/* Dates et Budget */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de Début *
              </label>
              <input
                type="date"
                value={formData.startDate?.toISOString().split('T')[0]}
                onChange={(e) => handleChange('startDate', new Date(e.target.value))}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.startDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.startDate && <p className="text-red-600 text-xs mt-1">{errors.startDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de Fin *
              </label>
              <input
                type="date"
                value={formData.endDate?.toISOString().split('T')[0]}
                onChange={(e) => handleChange('endDate', new Date(e.target.value))}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.endDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.endDate && <p className="text-red-600 text-xs mt-1">{errors.endDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget (heures) *
              </label>
              <input
                type="number"
                value={formData.budgetHours}
                onChange={(e) => handleChange('budgetHours', parseFloat(e.target.value) || 0)}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.budgetHours ? 'border-red-300' : 'border-gray-300'
                }`}
                min="0"
                step="0.5"
              />
              {errors.budgetHours && <p className="text-red-600 text-xs mt-1">{errors.budgetHours}</p>}
            </div>
          </div>

          {/* Collaborateurs Assignés */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Collaborateurs et Managers Assignés
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {availableCollaborators.map(user => (
                <label key={user.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={(formData.assignedTo || []).includes(user.id)}
                    onChange={(e) => handleAssignedToChange(user.id, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {user.firstName} {user.lastName} - {user.team} ({user.role === 'manager' ? 'Manager' : 'Collaborateur'})
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Les personnes assignées verront cette mission dans leur tableau de bord
            </p>
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
              <span>Créer la Mission</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
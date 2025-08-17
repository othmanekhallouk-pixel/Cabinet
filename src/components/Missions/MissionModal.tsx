import React, { useState } from 'react';
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  MessageSquare, 
  Paperclip, 
  Clock,
  User,
  Calendar,
  Tag,
  FileText,
  History
} from 'lucide-react';
import { Mission, Priority, MissionStatus } from '../../types';
import { mockUsers } from '../../data/mockData';
import { useClients } from '../../hooks/useClients';

interface MissionModalProps {
  mission: Mission;
  onSave: (mission: Mission) => void;
  onCancel: () => void;
}

const statusLabels: Record<MissionStatus, string> = {
  todo: 'À Faire',
  in_progress: 'En Cours',
  review: 'En Révision',
  client_waiting: 'Attente Client',
  completed: 'Terminé'
};

const priorityLabels: Record<Priority, string> = {
  low: 'Faible',
  medium: 'Moyenne',
  high: 'Haute',
  urgent: 'Urgente'
};

export default function MissionModal({ mission, onSave, onCancel }: MissionModalProps) {
  const { clients } = useClients();
  const [formData, setFormData] = useState<Mission>(mission);
  const [newComment, setNewComment] = useState('');
  const [newTag, setNewTag] = useState('');

  const handleSave = () => {
    const updatedMission = {
      ...formData,
      updatedAt: new Date(),
      history: [...formData.history, {
        id: Date.now().toString(),
        action: 'Mission modifiée',
        userId: '3', // Current user
        details: 'Mission mise à jour',
        createdAt: new Date()
      }]
    };
    onSave(updatedMission);
  };

  const addComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now().toString(),
        userId: '3', // Current user
        text: newComment.trim(),
        createdAt: new Date()
      };
      
      setFormData(prev => ({
        ...prev,
        comments: [...(prev.comments || []), comment]
      }));
      
      setNewComment('');
    }
  };

  const addTag = () => {
    if (newTag.trim() && !(formData.tags || []).includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
    }));
  };

  const getUserName = (userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Utilisateur inconnu';
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.companyName : 'Client inconnu';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Détails de la Mission</h2>
              <p className="text-gray-600 text-sm">{getClientName(formData.clientId)}</p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Informations principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre de la Mission *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as MissionStatus }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priorité
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Priority }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(priorityLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de Début
                  </label>
                  <input
                    type="date"
                    value={formData.startDate.toISOString().split('T')[0]}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: new Date(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date d'Échéance
                  </label>
                  <input
                    type="date"
                    value={formData.endDate.toISOString().split('T')[0]}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: new Date(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heures Prévues
                  </label>
                  <input
                    type="number"
                    value={formData.budgetHours || 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, budgetHours: parseFloat(e.target.value) || 0 }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    step="0.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Progression (%)
                  </label>
                  <input
                    type="number"
                    value={formData.progression}
                    onChange={(e) => setFormData(prev => ({ ...prev, progression: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manager Responsable
                </label>
                <select
                  value={formData.managerId}
                  onChange={(e) => setFormData(prev => ({ ...prev, managerId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {mockUsers.filter(u => u.role === 'manager' || u.role === 'admin').map(user => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(formData.tags || []).map(tag => (
                <span key={tag} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ajouter un tag"
              />
              <button
                onClick={addTag}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{(formData.tasks || []).length}</div>
              <div className="text-sm text-gray-600">Tâches</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {(formData.tasks || []).filter(t => t.status === 'done').length}
              </div>
              <div className="text-sm text-gray-600">Terminées</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{formData.consumedHours || 0}h</div>
              <div className="text-sm text-gray-600">Temps passé</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{(formData.comments || []).length}</div>
              <div className="text-sm text-gray-600">Commentaires</div>
            </div>
          </div>

          {/* Commentaires */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Commentaires</h3>
            
            <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
              {(formData.comments || []).map(comment => (
                <div key={comment.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900 text-sm">{getUserName(comment.userId)}</span>
                      <span className="text-xs text-gray-500">{comment.createdAt.toLocaleDateString('fr-FR')}</span>
                    </div>
                    <p className="text-gray-700 text-sm">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ajouter un commentaire..."
                />
                <button
                  onClick={addComment}
                  className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                >
                  Commenter
                </button>
              </div>
            </div>
          </div>

          {/* Historique */}
          {(formData.history || []).length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Historique</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {(formData.history || []).map(entry => (
                  <div key={entry.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                    <History className="h-4 w-4 text-gray-500" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{entry.details}</p>
                      <p className="text-xs text-gray-500">{entry.createdAt.toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Save className="h-4 w-4" />
            <span>Enregistrer</span>
          </button>
        </div>
      </div>
    </div>
  );
}
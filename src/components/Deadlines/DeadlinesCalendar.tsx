import React, { useState } from 'react';
import Header from '../Layout/Header';
import { 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Download
} from 'lucide-react';
import { mockDeadlines } from '../../data/mockData';
import { Deadline, DeadlineType, DeadlineStatus } from '../../types';
import { useClients } from '../../hooks/useClients';

const deadlineTypeLabels: Record<DeadlineType, string> = {
  vat: 'TVA',
  corporate_tax: 'IS',
  income_tax: 'IR',
  cnss: 'CNSS',
  amo: 'AMO',
  cimr: 'CIMR'
};

const statusLabels: Record<DeadlineStatus, string> = {
  pending: 'En attente',
  in_progress: 'En cours',
  completed: 'Terminé',
  overdue: 'En retard'
};

const statusColors: Record<DeadlineStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800'
};

const priorityColors = {
  low: 'border-l-gray-400',
  medium: 'border-l-yellow-400',
  high: 'border-l-orange-400',
  urgent: 'border-l-red-400'
};

export default function DeadlinesCalendar() {
  const { clients } = useClients();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedType, setSelectedType] = useState<DeadlineType | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<DeadlineStatus | ''>('');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.companyName || 'Client inconnu';
  };

  const filteredDeadlines = mockDeadlines.filter(deadline => {
    const matchesType = !selectedType || deadline.type === selectedType;
    const matchesStatus = !selectedStatus || deadline.status === selectedStatus;
    return matchesType && matchesStatus;
  });

  const getDeadlinesByDate = () => {
    const grouped: Record<string, Deadline[]> = {};
    filteredDeadlines.forEach(deadline => {
      const dateKey = deadline.dueDate.toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(deadline);
    });
    return grouped;
  };

  const getUpcomingDeadlines = () => {
    const now = new Date();
    const upcoming = filteredDeadlines
      .filter(d => d.dueDate >= now)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .slice(0, 10);
    return upcoming;
  };

  const getOverdueDeadlines = () => {
    const now = new Date();
    return filteredDeadlines.filter(d => d.dueDate < now && d.status !== 'completed');
  };

  const getDeadlineStats = () => {
    const total = filteredDeadlines.length;
    const completed = filteredDeadlines.filter(d => d.status === 'completed').length;
    const overdue = getOverdueDeadlines().length;
    const upcoming = filteredDeadlines.filter(d => {
      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return d.dueDate >= now && d.dueDate <= weekFromNow && d.status !== 'completed';
    }).length;

    return { total, completed, overdue, upcoming };
  };

  const stats = getDeadlineStats();
  const upcomingDeadlines = getUpcomingDeadlines();
  const overdueDeadlines = getOverdueDeadlines();

  const DeadlineCard = ({ deadline }: { deadline: Deadline }) => {
    const isOverdue = deadline.dueDate < new Date() && deadline.status !== 'completed';
    const daysUntilDue = Math.ceil((deadline.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 ${priorityColors[deadline.priority]} p-4 hover:shadow-md transition-shadow duration-200`}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-medium text-gray-900">{deadline.title}</h4>
            <p className="text-sm text-gray-600">{getClientName(deadline.clientId)}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[deadline.status]}`}>
              {statusLabels[deadline.status]}
            </span>
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
              {deadlineTypeLabels[deadline.type]}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{deadline.dueDate.toLocaleDateString('fr-FR')}</span>
          </div>
          <div className="flex items-center">
            <span className={`font-medium ${isOverdue ? 'text-red-600' : daysUntilDue <= 7 ? 'text-orange-600' : 'text-gray-600'}`}>
              {isOverdue ? `${Math.abs(daysUntilDue)} jours de retard` : 
               daysUntilDue === 0 ? 'Aujourd\'hui' :
               daysUntilDue === 1 ? 'Demain' :
               `Dans ${daysUntilDue} jours`}
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-700 mb-3">{deadline.period}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-600">
            <FileText className="h-4 w-4 mr-1" />
            <span>{deadline.documents.length} document(s)</span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200">
              <Eye className="h-4 w-4" />
            </button>
            <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200">
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <Header 
        title="Échéances Fiscales & Sociales" 
        subtitle="Suivi consolidé des déclarations et paiements"
        action={{ label: 'Nouvelle Échéance', onClick: () => {} }}
      />
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Échéances</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Cette Semaine</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{stats.upcoming}</p>
              </div>
              <div className="p-3 rounded-xl bg-orange-50">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">En Retard</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.overdue}</p>
              </div>
              <div className="p-3 rounded-xl bg-red-50">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Terminées</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-50">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filtres</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Liste
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  viewMode === 'calendar' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Calendrier
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as DeadlineType | '')}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les types</option>
              {Object.entries(deadlineTypeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as DeadlineStatus | '')}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les statuts</option>
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <button className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200">
              <Filter className="h-4 w-4" />
              <span>Réinitialiser</span>
            </button>
          </div>
        </div>

        {/* Échéances en retard */}
        {overdueDeadlines.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h3 className="text-lg font-semibold text-red-600">Échéances en Retard</h3>
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-sm font-medium">
                  {overdueDeadlines.length}
                </span>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
              {overdueDeadlines.map((deadline) => (
                <DeadlineCard key={deadline.id} deadline={deadline} />
              ))}
            </div>
          </div>
        )}

        {/* Échéances à venir */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Prochaines Échéances</h3>
            <p className="text-gray-600 text-sm">Déclarations et paiements à venir</p>
          </div>
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {upcomingDeadlines.map((deadline) => (
              <DeadlineCard key={deadline.id} deadline={deadline} />
            ))}
          </div>
        </div>

        {/* Toutes les échéances */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Toutes les Échéances</h3>
            <p className="text-gray-600 text-sm">{filteredDeadlines.length} échéances trouvées</p>
          </div>
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredDeadlines.map((deadline) => (
              <DeadlineCard key={deadline.id} deadline={deadline} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
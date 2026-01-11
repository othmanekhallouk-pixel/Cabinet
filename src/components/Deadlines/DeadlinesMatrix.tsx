import React, { useState } from 'react';
import Header from '../Layout/Header';
import {
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Filter,
  Eye
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

const statusIcons: Record<DeadlineStatus, React.ReactNode> = {
  pending: <Clock className="h-5 w-5 text-yellow-600" />,
  in_progress: <Calendar className="h-5 w-5 text-blue-600" />,
  completed: <CheckCircle className="h-5 w-5 text-green-600" />,
  overdue: <AlertTriangle className="h-5 w-5 text-red-600" />
};

const statusColors: Record<DeadlineStatus, string> = {
  pending: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200',
  in_progress: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
  completed: 'bg-green-50 hover:bg-green-100 border-green-200',
  overdue: 'bg-red-50 hover:bg-red-100 border-red-200'
};

export default function DeadlinesMatrix() {
  const { clients } = useClients();
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<DeadlineStatus | ''>('');
  const [currentView, setCurrentView] = useState<'all' | 'pending' | 'overdue'>('all');

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.companyName || 'Client inconnu';
  };

  const filteredDeadlines = mockDeadlines.filter(deadline => {
    const matchesStatus = !selectedStatus || deadline.status === selectedStatus;
    const matchesPeriod = !selectedPeriod || deadline.period === selectedPeriod;
    return matchesStatus && matchesPeriod;
  });

  const deadlineTypes: DeadlineType[] = ['vat', 'corporate_tax', 'income_tax', 'cnss', 'amo', 'cimr'];

  const clientDeadlineMatrix = clients.map(client => {
    const clientDeadlines = filteredDeadlines.filter(d => d.clientId === client.id);
    const deadlinesByType: Record<string, Deadline | undefined> = {};

    deadlineTypes.forEach(type => {
      const typeDeadlines = clientDeadlines.filter(d => d.type === type);
      deadlinesByType[type] = typeDeadlines[0];
    });

    return {
      client,
      deadlinesByType,
      totalDeadlines: clientDeadlines.length
    };
  });

  const getStatusStats = () => {
    const total = filteredDeadlines.length;
    const pending = filteredDeadlines.filter(d => d.status === 'pending').length;
    const inProgress = filteredDeadlines.filter(d => d.status === 'in_progress').length;
    const completed = filteredDeadlines.filter(d => d.status === 'completed').length;
    const overdue = filteredDeadlines.filter(d => d.status === 'overdue').length;

    return { total, pending, inProgress, completed, overdue };
  };

  const stats = getStatusStats();

  const handleStatusChange = (deadlineId: string, checked: boolean) => {
    console.log('Status change:', deadlineId, checked);
  };

  const DeadlineCell = ({ deadline }: { deadline?: Deadline }) => {
    if (!deadline) {
      return (
        <div className="h-24 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center">
          <span className="text-gray-400 text-sm">-</span>
        </div>
      );
    }

    const currentStatus = deadline.status;
    const isOverdue = currentStatus === 'overdue';
    const daysUntilDue = Math.ceil((deadline.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    return (
      <div className={`h-24 border-2 rounded-lg p-3 transition-all duration-200 ${statusColors[currentStatus]}`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              {statusIcons[currentStatus]}
              <span className="text-xs font-medium text-gray-700">
                {deadline.dueDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
              </span>
            </div>
            <p className="text-xs text-gray-600 line-clamp-2">{deadline.period}</p>
          </div>
          <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200">
            <Eye className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id={`check-${deadline.id}`}
              checked={currentStatus === 'completed'}
              onChange={(e) => handleStatusChange(deadline.id, e.target.checked)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <label htmlFor={`check-${deadline.id}`} className="ml-2 text-xs text-gray-700">
              Réalisé
            </label>
          </div>
          {deadline.documents.length > 0 && (
            <div className="flex items-center text-xs text-gray-500">
              <FileText className="h-3 w-3 mr-1" />
              {deadline.documents.length}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Matrice des Échéances"
        subtitle="Vue consolidée par client et type d'échéance"
        action={{ label: 'Exporter', onClick: () => {} }}
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50">
                <Calendar className="h-6 w-6 text-gray-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">Statistiques des échéances par statut</p>
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

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">En Cours</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.inProgress}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50">
                <Clock className="h-6 w-6 text-blue-600" />
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
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filtres</h3>
            <Filter className="h-5 w-5 text-gray-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as DeadlineStatus | '')}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminé</option>
              <option value="overdue">En retard</option>
            </select>

            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Toutes les périodes</option>
              <option value="Q1 2024">Q1 2024</option>
              <option value="Q2 2024">Q2 2024</option>
              <option value="Q3 2024">Q3 2024</option>
              <option value="Q4 2024">Q4 2024</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Matrice Client × Type d'Échéance</h3>
            <p className="text-gray-600 text-sm">Vue d'ensemble des échéances par client et catégorie</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 sticky left-0 bg-gray-50 z-10">
                    Client
                  </th>
                  {deadlineTypes.map((type) => (
                    <th key={type} className="px-4 py-4 text-center text-sm font-semibold text-gray-900 min-w-[200px]">
                      {deadlineTypeLabels[type]}
                    </th>
                  ))}
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {clientDeadlineMatrix.map(({ client, deadlinesByType, totalDeadlines }) => (
                  <tr key={client.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 sticky left-0 bg-white z-10">
                      <div>
                        <p className="font-medium text-gray-900">{client.companyName}</p>
                        <p className="text-sm text-gray-500">{client.sector}</p>
                      </div>
                    </td>
                    {deadlineTypes.map((type) => (
                      <td key={type} className="px-4 py-4">
                        <DeadlineCell deadline={deadlinesByType[type]} />
                      </td>
                    ))}
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                        {totalDeadlines}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {clientDeadlineMatrix.length === 0 && (
            <div className="p-12 text-center">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucune échéance trouvée</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

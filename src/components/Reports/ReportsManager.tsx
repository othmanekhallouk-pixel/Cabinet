import React, { useState } from 'react';
import Header from '../Layout/Header';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Download,
  Calendar,
  Users,
  Clock,
  DollarSign,
  FileText,
  Building2,
  Target,
  AlertTriangle,
  CheckCircle,
  Filter,
  Eye,
  User
} from 'lucide-react';
import { mockMissions, mockTimeEntries, mockUsers, mockDeadlines, mockDashboardStats, mockClients } from '../../data/mockData';
import { useClients } from '../../hooks/useClients';

interface ReportData {
  id: string;
  title: string;
  description: string;
  category: 'productivity' | 'financial' | 'clients' | 'time' | 'deadlines' | 'team';
  icon: React.ComponentType<any>;
  data: any;
  chartType: 'bar' | 'pie' | 'line' | 'table';
}

export default function ReportsManager() {
  const { clients } = useClients();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedClient, setSelectedClient] = useState('');

  // Calculs des données de rapports
  const getProductivityReports = (): ReportData[] => [
    {
      id: 'missions-by-status',
      title: 'Missions par Statut',
      description: 'Répartition des missions selon leur statut d\'avancement',
      category: 'productivity',
      icon: BarChart3,
      chartType: 'pie',
      data: {
        labels: ['À Faire', 'En Cours', 'En Révision', 'Attente Client', 'Terminé'],
        values: [
          mockMissions.filter(m => m.status === 'planned').length,
          mockMissions.filter(m => m.status === 'in_progress').length,
          mockMissions.filter(m => m.status === 'review').length,
          mockMissions.filter(m => m.status === 'client_waiting').length,
          mockMissions.filter(m => m.status === 'completed').length
        ],
        colors: ['#6B7280', '#3B82F6', '#F59E0B', '#F97316', '#10B981']
      }
    },
    {
      id: 'time-vs-budget',
      title: 'Temps Passé vs Budget',
      description: 'Comparaison entre temps prévu et temps réellement passé',
      category: 'productivity',
      icon: Clock,
      chartType: 'bar',
      data: {
        missions: mockMissions.map(m => ({
          name: m.title,
          budgeted: m.budgetHours,
          actual: m.consumedHours,
          variance: ((m.consumedHours - m.budgetHours) / m.budgetHours * 100).toFixed(1)
        }))
      }
    },
    {
      id: 'team-utilization',
      title: 'Utilisation de l\'Équipe',
      description: 'Taux d\'utilisation par collaborateur',
      category: 'team',
      icon: Users,
      chartType: 'bar',
      data: {
        users: mockUsers.map(user => {
          const userEntries = mockTimeEntries.filter(t => t.userId === user.id);
          const totalHours = userEntries.reduce((sum, entry) => sum + (entry.duration / 60), 0);
          const utilization = Math.min((totalHours / (8 * 22)) * 100, 100);
          return {
            name: `${user.firstName} ${user.lastName}`,
            hours: totalHours,
            utilization: Math.round(utilization),
            team: user.team
          };
        })
      }
    }
  ];

  const getFinancialReports = (): ReportData[] => [
    {
      id: 'revenue-by-client',
      title: 'Chiffre d\'Affaires par Client',
      description: 'Répartition du CA par client sur la période',
      category: 'financial',
      icon: DollarSign,
      chartType: 'pie',
      data: {
        clients: clients.map(client => {
          const clientMissions = mockMissions.filter(m => m.clientId === client.id);
          const revenue = clientMissions.reduce((sum, m) => sum + (m.consumedHours * 500), 0); // 500 DH/heure
          return {
            name: client.companyName,
            revenue,
            missions: clientMissions.length
          };
        }).filter(c => c.revenue > 0)
      }
    },
    {
      id: 'profitability-analysis',
      title: 'Analyse de Rentabilité',
      description: 'Marge par mission et par client',
      category: 'financial',
      icon: TrendingUp,
      chartType: 'table',
      data: {
        missions: mockMissions.map(mission => {
          const client = clients.find(c => c.id === mission.clientId);
          const revenue = mission.consumedHours * 500; // Prix de vente
          const cost = mission.consumedHours * 300; // Coût interne
          const margin = revenue - cost;
          const marginRate = revenue > 0 ? (margin / revenue * 100).toFixed(1) : '0';
          
          return {
            mission: mission.title,
            client: client?.companyName,
            hours: mission.consumedHours,
            revenue,
            cost,
            margin,
            marginRate: `${marginRate}%`,
            status: mission.status
          };
        })
      }
    }
  ];

  const getClientReports = (): ReportData[] => [
    {
      id: 'client-activity',
      title: 'Activité par Client',
      description: 'Missions actives et temps passé par client',
      category: 'clients',
      icon: Building2,
      chartType: 'table',
      data: {
        clients: clients.map(client => {
          const clientMissions = mockMissions.filter(m => m.clientId === client.id);
          const activeMissions = clientMissions.filter(m => m.status !== 'completed');
          const totalHours = clientMissions.reduce((sum, m) => sum + m.consumedHours, 0);
          const completedMissions = clientMissions.filter(m => m.status === 'completed');
          
          return {
            name: client.companyName,
            sector: client.sector,
            totalMissions: clientMissions.length,
            activeMissions: activeMissions.length,
            completedMissions: completedMissions.length,
            totalHours,
            lastActivity: clientMissions.length > 0 ? 
              Math.max(...clientMissions.map(m => m.updatedAt.getTime())) : null
          };
        })
      }
    }
  ];

  const getDeadlineReports = (): ReportData[] => [
    {
      id: 'deadlines-status',
      title: 'État des Échéances',
      description: 'Suivi des échéances fiscales et sociales',
      category: 'deadlines',
      icon: AlertTriangle,
      chartType: 'pie',
      data: {
        labels: ['En attente', 'En cours', 'Terminé', 'En retard'],
        values: [
          mockDeadlines.filter(d => d.status === 'pending').length,
          mockDeadlines.filter(d => d.status === 'in_progress').length,
          mockDeadlines.filter(d => d.status === 'completed').length,
          mockDeadlines.filter(d => d.status === 'overdue').length
        ],
        colors: ['#F59E0B', '#3B82F6', '#10B981', '#EF4444']
      }
    },
    {
      id: 'deadlines-by-type',
      title: 'Échéances par Type',
      description: 'Répartition des échéances par type de déclaration',
      category: 'deadlines',
      icon: FileText,
      chartType: 'bar',
      data: {
        types: Object.entries(
          mockDeadlines.reduce((acc, deadline) => {
            acc[deadline.type] = (acc[deadline.type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ).map(([type, count]) => ({ type, count }))
      }
    }
  ];

  const getAllReports = (): ReportData[] => [
    ...getProductivityReports(),
    ...getFinancialReports(),
    ...getClientReports(),
    ...getDeadlineReports()
  ];

  const filteredReports = getAllReports().filter(report => 
    selectedCategory === 'all' || report.category === selectedCategory
  );

  const categories = [
    { id: 'all', label: 'Tous les Rapports', icon: BarChart3 },
    { id: 'productivity', label: 'Productivité', icon: Target },
    { id: 'financial', label: 'Financier', icon: DollarSign },
    { id: 'clients', label: 'Clients', icon: Building2 },
    { id: 'team', label: 'Équipe', icon: Users },
    { id: 'deadlines', label: 'Échéances', icon: AlertTriangle }
  ];

  const ReportCard = ({ report }: { report: ReportData }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <report.icon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{report.title}</h3>
            <p className="text-sm text-gray-600">{report.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200">
            <Eye className="h-4 w-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-green-600 transition-colors duration-200">
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Aperçu des données */}
      <div className="bg-gray-50 rounded-lg p-4">
        {report.chartType === 'pie' && report.data.labels && (
          <div className="space-y-2">
            {report.data.labels.map((label: string, index: number) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: report.data.colors[index] }}
                  ></div>
                  <span className="text-sm text-gray-700">{label}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{report.data.values[index]}</span>
              </div>
            ))}
          </div>
        )}

        {report.chartType === 'bar' && report.data.missions && (
          <div className="space-y-2">
            {report.data.missions.slice(0, 3).map((mission: any) => (
              <div key={mission.name} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 truncate">{mission.name}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">{mission.actual}h/{mission.budgeted}h</span>
                  <span className={`text-xs font-medium ${
                    parseFloat(mission.variance) > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {mission.variance}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {report.chartType === 'table' && report.data.clients && (
          <div className="space-y-2">
            {report.data.clients.slice(0, 3).map((client: any) => (
              <div key={client.name} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{client.name}</span>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{client.activeMissions} actives</div>
                  <div className="text-xs text-gray-500">{client.totalHours}h total</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {report.chartType === 'table' && report.data.userClientHours && (
          <div className="space-y-2">
            {report.data.userClientHours.slice(0, 3).map((user: any) => (
              <div key={user.userName} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{user.userName}</span>
                  <span className="text-sm font-bold text-blue-600">{user.totalHours}h</span>
                </div>
                <div className="text-xs text-gray-500 ml-2">
                  {user.clientBreakdown.slice(0, 2).map((client: any) => (
                    <div key={client.clientName} className="flex justify-between">
                      <span>{client.clientName}</span>
                      <span>{client.hours}h</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {report.chartType === 'table' && report.data.userMissionHours && (
          <div className="space-y-2">
            {report.data.userMissionHours.slice(0, 3).map((user: any) => (
              <div key={user.userName} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{user.userName}</span>
                  <span className="text-sm font-bold text-green-600">{user.totalHours}h</span>
                </div>
                <div className="text-xs text-gray-500 ml-2">
                  {user.missionBreakdown.slice(0, 2).map((mission: any) => (
                    <div key={mission.missionTitle} className="flex justify-between">
                      <span className="truncate">{mission.missionTitle}</span>
                      <span>{mission.hours}h</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {report.chartType === 'table' && report.data.clientTimeSummary && (
          <div className="space-y-2">
            {report.data.clientTimeSummary.slice(0, 3).map((client: any) => (
              <div key={client.clientName} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{client.clientName}</span>
                  <span className="text-sm font-bold text-purple-600">{client.totalHours}h</span>
                </div>
                <div className="text-xs text-gray-500 ml-2">
                  {client.userBreakdown.slice(0, 2).map((user: any) => (
                    <div key={user.userName} className="flex justify-between">
                      <span>{user.userName}</span>
                      <span>{user.hours}h</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          report.category === 'productivity' ? 'bg-blue-100 text-blue-700' :
          report.category === 'financial' ? 'bg-green-100 text-green-700' :
          report.category === 'clients' ? 'bg-purple-100 text-purple-700' :
          report.category === 'team' ? 'bg-orange-100 text-orange-700' :
          report.category === 'deadlines' ? 'bg-red-100 text-red-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {categories.find(c => c.id === report.category)?.label}
        </span>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          Voir détails →
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <Header 
        title="Rapports et Analyses" 
        subtitle="Tableaux de bord et analyses de performance"
        action={{ label: 'Exporter Tout', onClick: () => {} }}
      />
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Clients</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{mockDashboardStats.totalClients}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Missions Actives</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{mockDashboardStats.activeMissions}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-50">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Heures Enregistrées</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{mockDashboardStats.hoursLogged}h</p>
              </div>
              <div className="p-3 rounded-xl bg-orange-50">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Chiffre d'Affaires</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{mockDashboardStats.revenue.toLocaleString()} DH</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-50">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filtres et Catégories</h3>
            <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
              <Download className="h-4 w-4" />
              <span>Exporter Sélection</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Période</label>
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-gray-500">à</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tous les clients</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.companyName}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <category.icon className="h-4 w-4" />
                    <span>{category.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Rapports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredReports.map(report => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>

        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun rapport trouvé</h3>
            <p className="text-gray-600">Essayez de modifier vos critères de filtrage</p>
          </div>
        )}
      </div>
    </div>
  );
}
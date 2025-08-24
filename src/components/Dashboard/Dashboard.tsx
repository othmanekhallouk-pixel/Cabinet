import React from 'react';
import { 
  Building2, 
  FolderOpen, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Users,
  DollarSign,
  CheckCircle,
  Calendar,
  Target,
  BarChart3,
  FileText
} from 'lucide-react';
import StatsCard from './StatsCard';
import { mockTimeEntries, mockLeaveRequests, mockDeadlines } from '../../data/mockData';
import { useClients } from '../../hooks/useClients';
import { useMissions } from '../../hooks/useMissions';
import { useAuth } from '../../hooks/useAuth';

export default function Dashboard() {
  const { clients } = useClients();
  const { missions } = useMissions();
  const { getAllUsers } = useAuth();
  
  const allUsers = getAllUsers();

  // Calculer les vraies statistiques
  const getDashboardStats = () => {
    const totalClients = clients.length;
    const activeMissions = missions.filter(m => m.status !== 'completed').length;
    const completedMissions = missions.filter(m => m.status === 'completed').length;
    
    // Calculer le chiffre d'affaires basé sur les heures consommées
    const revenue = missions.reduce((sum, mission) => {
      return sum + (mission.consumedHours * 500); // 500 DH par heure
    }, 0);
    
    // Calculer les heures totales enregistrées
    const hoursLogged = mockTimeEntries.reduce((sum, entry) => sum + (entry.duration / 60), 0);
    
    // Calculer l'utilisation de l'équipe
    const totalCapacity = allUsers.filter(u => u.isActive).length * 8 * 22; // 8h/jour, 22 jours/mois
    const teamUtilization = totalCapacity > 0 ? Math.round((hoursLogged / totalCapacity) * 100) : 0;
    
    // Échéances
    const pendingDeadlines = mockDeadlines.filter(d => d.status === 'pending' || d.status === 'in_progress').length;
    const overdueDeadlines = mockDeadlines.filter(d => 
      d.status === 'overdue' || (d.status === 'pending' && new Date(d.dueDate) < new Date())
    ).length;

    return {
      totalClients,
      activeMissions,
      completedMissions,
      pendingDeadlines,
      overdueDeadlines,
      teamUtilization,
      revenue,
      hoursLogged: Math.round(hoursLogged)
    };
  };

  const stats = getDashboardStats();

  // Missions récentes
  const recentMissions = missions
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  // Échéances urgentes
  const urgentDeadlines = mockDeadlines
    .filter(d => {
      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return d.dueDate >= now && d.dueDate <= weekFromNow && d.status !== 'completed';
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.companyName || 'Client inconnu';
  };

  const getUserName = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Non assigné';
  };

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white p-6">
        <h1 className="text-2xl font-bold mb-2">Tableau de Bord</h1>
        <p className="text-blue-100">Vue d'ensemble de l'activité du cabinet</p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Clients"
          value={stats.totalClients}
          icon={Building2}
          color="blue"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Missions Actives"
          value={stats.activeMissions}
          icon={FolderOpen}
          color="green"
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Échéances en Attente"
          value={stats.pendingDeadlines}
          icon={AlertTriangle}
          color="yellow"
          trend={{ value: -5, isPositive: false }}
        />
        <StatsCard
          title="Utilisation Équipe"
          value={`${stats.teamUtilization}%`}
          icon={Users}
          color="blue"
          trend={{ value: 3, isPositive: true }}
        />
      </div>

      {/* Statistiques secondaires */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Chiffre d'Affaires"
          value={`${stats.revenue.toLocaleString()} DH`}
          icon={DollarSign}
          color="green"
          trend={{ value: 15, isPositive: true }}
        />
        <StatsCard
          title="Heures Enregistrées"
          value={`${stats.hoursLogged}h`}
          icon={Clock}
          color="blue"
          trend={{ value: 7, isPositive: true }}
        />
        <StatsCard
          title="Échéances en Retard"
          value={stats.overdueDeadlines}
          icon={AlertTriangle}
          color="red"
          trend={{ value: -2, isPositive: true }}
        />
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Missions récentes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Missions Récentes</h3>
            <p className="text-gray-600 text-sm">Dernières missions mises à jour</p>
          </div>
          <div className="p-6">
            {recentMissions.length > 0 ? (
              <div className="space-y-4">
                {recentMissions.map((mission) => (
                  <div key={mission.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <div>
                      <h4 className="font-medium text-gray-900">{mission.title}</h4>
                      <p className="text-sm text-gray-600">{getClientName(mission.clientId)}</p>
                      <p className="text-xs text-gray-500">
                        Échéance: {mission.endDate.toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        mission.status === 'completed' ? 'bg-green-100 text-green-800' :
                        mission.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        mission.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {mission.status === 'completed' ? 'Terminé' :
                         mission.status === 'in_progress' ? 'En Cours' :
                         mission.status === 'review' ? 'En Révision' : 'À Faire'}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {mission.consumedHours}h / {mission.budgetHours}h
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucune mission récente</p>
              </div>
            )}
          </div>
        </div>

        {/* Échéances urgentes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Échéances Urgentes</h3>
            <p className="text-gray-600 text-sm">Prochaines échéances à traiter</p>
          </div>
          <div className="p-6">
            {urgentDeadlines.length > 0 ? (
              <div className="space-y-4">
                {urgentDeadlines.map((deadline) => {
                  const daysUntilDue = Math.ceil((deadline.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div key={deadline.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <div>
                        <h4 className="font-medium text-gray-900">{deadline.title}</h4>
                        <p className="text-sm text-gray-600">{getClientName(deadline.clientId)}</p>
                        <p className="text-xs text-gray-500">{deadline.period}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {deadline.dueDate.toLocaleDateString('fr-FR')}
                        </p>
                        <p className={`text-xs font-medium ${
                          daysUntilDue <= 3 ? 'text-red-600' : 
                          daysUntilDue <= 7 ? 'text-orange-600' : 'text-gray-600'
                        }`}>
                          {daysUntilDue === 0 ? 'Aujourd\'hui' :
                           daysUntilDue === 1 ? 'Demain' :
                           `Dans ${daysUntilDue} jours`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucune échéance urgente</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activité de l'équipe */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Activité de l'Équipe</h3>
          <p className="text-gray-600 text-sm">Performance et utilisation des collaborateurs</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {allUsers.filter(u => u.isActive && u.role !== 'admin').map(user => {
              const userEntries = mockTimeEntries.filter(t => t.userId === user.id);
              const userMissions = missions.filter(m => m.assignedTo.includes(user.id));
              const totalHours = userEntries.reduce((sum, entry) => sum + (entry.duration / 60), 0);
              const activeMissions = userMissions.filter(m => m.status !== 'completed').length;
              
              return (
                <div key={user.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        {user.firstName[0]}{user.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{user.firstName} {user.lastName}</h4>
                      <p className="text-sm text-gray-600">{user.team}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Heures ce mois:</span>
                      <span className="font-medium">{Math.round(totalHours)}h</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Missions actives:</span>
                      <span className="font-medium">{activeMissions}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.min((totalHours / (8 * 22)) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
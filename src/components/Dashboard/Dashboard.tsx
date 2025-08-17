import React from 'react';
import Header from '../Layout/Header';
import StatsCard from './StatsCard';
import { 
  Users, 
  FolderOpen, 
  AlertTriangle, 
  TrendingUp,
  Clock,
  CheckCircle,
  DollarSign,
  Calendar
} from 'lucide-react';
import { mockDashboardStats, mockDeadlines, mockMissions } from '../../data/mockData';
import { useClients } from '../../hooks/useClients';

export default function Dashboard() {
  const { clients } = useClients();
  const stats = mockDashboardStats;
  const upcomingDeadlines = mockDeadlines.filter(d => d.status !== 'completed').slice(0, 5);
  const recentMissions = mockMissions.filter(m => m.status !== 'completed').slice(0, 5);

  const handleStatsClick = (type: string) => {
    switch (type) {
      case 'clients':
        window.location.href = '/clients';
        break;
      case 'missions':
        window.location.href = '/missions';
        break;
      case 'deadlines':
        window.location.href = '/deadlines';
        break;
      case 'team':
        window.location.href = '/team';
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header 
        title="Tableau de Bord" 
        subtitle="Vue d'ensemble de l'activité du cabinet"
      />
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div onClick={() => handleStatsClick('clients')} className="cursor-pointer">
            <StatsCard
              title="Total Clients"
              value={stats.totalClients}
              icon={Users}
              trend={{ value: 12, isPositive: true }}
              color="blue"
            />
          </div>
          <div onClick={() => handleStatsClick('missions')} className="cursor-pointer">
            <StatsCard
              title="Missions Actives"
              value={stats.activeMissions}
              icon={FolderOpen}
              trend={{ value: 8, isPositive: true }}
              color="green"
            />
          </div>
          <div onClick={() => handleStatsClick('deadlines')} className="cursor-pointer">
            <StatsCard
              title="Échéances en Attente"
              value={stats.pendingDeadlines}
              icon={AlertTriangle}
              color="yellow"
            />
          </div>
          <div onClick={() => handleStatsClick('team')} className="cursor-pointer">
            <StatsCard
            title="Utilisation Équipe"
            value={`${stats.teamUtilization}%`}
            icon={TrendingUp}
            trend={{ value: 5, isPositive: true }}
            color="green"
          />
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div onClick={() => handleStatsClick('billing')} className="cursor-pointer">
            <StatsCard
              title="Chiffre d'Affaires"
              value={`${stats.revenue.toLocaleString()} DH`}
              icon={DollarSign}
              color="blue"
            />
          </div>
          <div onClick={() => handleStatsClick('time')} className="cursor-pointer">
            <StatsCard
              title="Heures Enregistrées"
              value={stats.hoursLogged}
              icon={Clock}
              color="green"
            />
          </div>
          <div onClick={() => handleStatsClick('deadlines')} className="cursor-pointer">
            <StatsCard
              title="Échéances en Retard"
              value={stats.overdueDeadlines}
            icon={AlertTriangle}
            color="red"
          />
          <StatsCard
            title="Missions Terminées"
            value={stats.completedMissions}
            icon={CheckCircle}
            color="green"
          />
        </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Échéances Prochaines</h3>
              <p className="text-gray-600 text-sm">Déclarations et paiements à venir</p>
            </div>
            <div className="p-6 space-y-4">
              {upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                  <div>
                    <h4 className="font-medium text-gray-900">{deadline.title}</h4>
                    <p className="text-sm text-gray-600">{deadline.period}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {deadline.dueDate.toLocaleDateString('fr-FR')}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      deadline.priority === 'high' 
                        ? 'bg-red-100 text-red-700'
                        : deadline.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {deadline.priority === 'high' ? 'Urgent' : 
                       deadline.priority === 'medium' ? 'Moyen' : 'Faible'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Missions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Missions Récentes</h3>
              <p className="text-gray-600 text-sm">Activité récente du cabinet</p>
            </div>
            <div className="p-6 space-y-4">
              {recentMissions.map((mission) => (
                <div key={mission.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                  <div>
                    <h4 className="font-medium text-gray-900">{mission.title}</h4>
                    <p className="text-sm text-gray-600">{mission.type}</p>
                  </div>
                  <div className="text-right">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mb-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(mission.consumedHours / mission.budgetHours) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600">
                      {mission.consumedHours}h / {mission.budgetHours}h
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Activité Récente</h3>
            <p className="text-gray-600 text-sm">Dernières actions effectuées</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Youssef Tahiri</span> a validé la déclaration TVA pour TechnoMaroc
                  </p>
                  <p className="text-xs text-gray-500">Il y a 2 heures</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Fatima Alami</span> a approuvé une demande de congé
                  </p>
                  <p className="text-xs text-gray-500">Il y a 4 heures</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm text-gray-900">
                    Nouvelle échéance créée pour <span className="font-medium">AtlasExport</span>
                  </p>
                  <p className="text-xs text-gray-500">Il y a 6 heures</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
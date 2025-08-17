import React from 'react';
import { 
  Clock, 
  FolderOpen, 
  Calendar, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Target,
  Award
} from 'lucide-react';
import { mockTimeEntries, mockLeaveRequests, mockDeadlines } from '../../data/mockData';
import { User } from '../../types';
import { useMissions } from '../../hooks/useMissions';

interface CollaboratorDashboardProps {
  user: User;
}

export default function CollaboratorDashboard({ user }: CollaboratorDashboardProps) {
  const { getMissionsByUser } = useMissions();
  
  // Filtrer les données pour le collaborateur connecté
  const userMissions = getMissionsByUser(user.id);
  const userTimeEntries = mockTimeEntries.filter(t => t.userId === user.id);
  const userLeaveRequests = mockLeaveRequests.filter(l => l.userId === user.id);
  const userDeadlines = mockDeadlines.filter(d => d.assignedTo === user.id);

  // Calculer les statistiques
  const activeMissions = userMissions.filter(m => m.status !== 'completed');
  const totalHoursThisMonth = userTimeEntries.reduce((sum, entry) => sum + (entry.duration / 60), 0);
  const pendingLeaves = userLeaveRequests.filter(l => l.status === 'pending');
  const upcomingDeadlines = userDeadlines.filter(d => {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return d.dueDate >= now && d.dueDate <= weekFromNow && d.status !== 'completed';
  });

  const utilizationRate = Math.min(Math.round((totalHoursThisMonth / (8 * 22)) * 100), 100);

  return (
    <div className="p-6 space-y-6">
      {/* En-tête personnalisé */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
            <span className="text-2xl font-bold">{user.firstName[0]}{user.lastName[0]}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Bonjour, {user.firstName} !</h1>
            <p className="text-blue-100">Bienvenue sur votre espace collaborateur</p>
            <p className="text-sm text-blue-200 mt-1">{user.team} • {user.role === 'collaborator' ? 'Collaborateur' : 'Manager'}</p>
          </div>
        </div>
      </div>

      {/* Statistiques personnelles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Missions Actives</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{activeMissions.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50">
              <FolderOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Heures ce Mois</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{Math.round(totalHoursThisMonth)}h</p>
            </div>
            <div className="p-3 rounded-xl bg-green-50">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Taux d'Utilisation</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{utilizationRate}%</p>
            </div>
            <div className="p-3 rounded-xl bg-orange-50">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Échéances Semaine</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{upcomingDeadlines.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-red-50">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Mes missions en cours */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Mes Missions en Cours</h3>
          <p className="text-gray-600 text-sm">Missions qui vous sont assignées</p>
        </div>
        <div className="p-6">
          {activeMissions.length > 0 ? (
            <div className="space-y-4">
              {activeMissions.map((mission) => {
                const progress = (mission.consumedHours / mission.budgetHours) * 100;
                const isOverBudget = mission.consumedHours > mission.budgetHours;
                
                return (
                  <div key={mission.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{mission.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{mission.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          mission.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          mission.status === 'review' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {mission.status === 'in_progress' ? 'En Cours' :
                           mission.status === 'review' ? 'En Révision' : 'Planifié'}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          mission.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                          mission.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          mission.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {mission.priority === 'urgent' ? 'Urgent' :
                           mission.priority === 'high' ? 'Haute' :
                           mission.priority === 'medium' ? 'Moyenne' : 'Faible'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>Échéance: {mission.endDate.toLocaleDateString('fr-FR')}</span>
                      <span className={isOverBudget ? 'text-red-600 font-medium' : ''}>
                        {mission.consumedHours}h / {mission.budgetHours}h ({Math.round(progress)}%)
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${isOverBudget ? 'bg-red-500' : 'bg-blue-500'}`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune mission active</h3>
              <p className="text-gray-600">Vous n'avez pas de missions assignées pour le moment</p>
            </div>
          )}
        </div>
      </div>

      {/* Échéances à venir */}
      {upcomingDeadlines.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Mes Échéances à Venir</h3>
            <p className="text-gray-600 text-sm">Déclarations et paiements sous votre responsabilité</p>
          </div>
          <div className="p-6 space-y-4">
            {upcomingDeadlines.map((deadline) => {
              const daysUntilDue = Math.ceil((deadline.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <div key={deadline.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{deadline.title}</h4>
                    <p className="text-sm text-gray-600">{deadline.period}</p>
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
        </div>
      )}

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-medium text-gray-900 mb-2">Pointer le Temps</h3>
          <p className="text-sm text-gray-600 mb-4">Démarrer le suivi de votre temps de travail</p>
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200">
            Démarrer Timer
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="font-medium text-gray-900 mb-2">Demander Congé</h3>
          <p className="text-sm text-gray-600 mb-4">Soumettre une demande de congé ou d'absence</p>
          <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200">
            Nouvelle Demande
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Target className="h-6 w-6 text-orange-600" />
          </div>
          <h3 className="font-medium text-gray-900 mb-2">Mes Objectifs</h3>
          <p className="text-sm text-gray-600 mb-4">Consulter vos objectifs et performances</p>
          <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors duration-200">
            Voir Objectifs
          </button>
        </div>
      </div>
    </div>
  );
}
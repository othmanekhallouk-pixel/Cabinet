import React, { useState } from 'react';
import Header from '../Layout/Header';
import { 
  Calendar, 
  Plus, 
  Filter, 
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { mockUsers, mockLeaveRequests } from '../../data/mockData';
import { LeaveRequest, LeaveType } from '../../types';
import { useClients } from '../../hooks/useClients';

const leaveTypeLabels: Record<LeaveType, string> = {
  vacation: 'Congé Annuel',
  sick: 'Congé Maladie',
  personal: 'Congé Personnel',
  maternity: 'Congé Maternité',
  paternity: 'Congé Paternité',
  rtt: 'RTT',
  marriage: 'Congé Mariage',
  exceptional: 'Congé Exceptionnel'
};

const leaveTypeColors: Record<LeaveType, string> = {
  vacation: 'bg-blue-100 text-blue-800 border-blue-200',
  sick: 'bg-red-100 text-red-800 border-red-200',
  personal: 'bg-purple-100 text-purple-800 border-purple-200',
  maternity: 'bg-pink-100 text-pink-800 border-pink-200',
  paternity: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  rtt: 'bg-green-100 text-green-800 border-green-200',
  marriage: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  exceptional: 'bg-orange-100 text-orange-800 border-orange-200'
};

export default function LeaveCalendar() {
  const { clients } = useClients();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedType, setSelectedType] = useState<LeaveType | ''>('');
  const [showCreateLeave, setShowCreateLeave] = useState(false);

  // Générer les jours du mois
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Jours du mois précédent
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true });
    }
    
    // Jours du mois suivant pour compléter la grille
    const remainingDays = 42 - days.length; // 6 semaines * 7 jours
    for (let day = 1; day <= remainingDays; day++) {
      days.push({ date: new Date(year, month + 1, day), isCurrentMonth: false });
    }
    
    return days;
  };

  const getLeaveForDate = (date: Date) => {
    return mockLeaveRequests.filter(leave => {
      const leaveStart = new Date(leave.startDate);
      const leaveEnd = new Date(leave.endDate);
      const checkDate = new Date(date);
      
      // Normaliser les dates pour comparer seulement jour/mois/année
      leaveStart.setHours(0, 0, 0, 0);
      leaveEnd.setHours(23, 59, 59, 999);
      checkDate.setHours(12, 0, 0, 0);
      
      return checkDate >= leaveStart && checkDate <= leaveEnd && 
             (selectedUser === '' || leave.userId === selectedUser) &&
             (selectedType === '' || leave.type === selectedType) &&
             leave.status === 'approved';
    });
  };

  const getUserName = (userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Utilisateur inconnu';
  };

  const days = getDaysInMonth(selectedMonth);
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const navigateMonth = (direction: number) => {
    setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  };

  return (
    <div className="flex flex-col h-full">
      <Header 
        title="Calendrier des Congés" 
        subtitle="Vue d'ensemble des congés et absences de l'équipe"
        action={{ label: 'Nouvelle Demande', onClick: () => setShowCreateLeave(true) }}
      />
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Contrôles du calendrier */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                ←
              </button>
              <h2 className="text-xl font-semibold text-gray-900">
                {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
              </h2>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                →
              </button>
            </div>
            
            <button
              onClick={() => setSelectedMonth(new Date())}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Aujourd'hui
            </button>
          </div>

          {/* Filtres */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Collaborateur</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tous les collaborateurs</option>
                {mockUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type de congé</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as LeaveType | '')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tous les types</option>
                {Object.entries(leaveTypeLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                <Filter className="h-4 w-4" />
                <span>Réinitialiser</span>
              </button>
            </div>
          </div>
        </div>

        {/* Légende */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Types de congés</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(leaveTypeLabels).map(([key, label]) => (
              <div key={key} className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded border ${leaveTypeColors[key as LeaveType]}`}></div>
                <span className="text-xs text-gray-700">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Calendrier */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6">
            {/* En-têtes des jours */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            {/* Grille du calendrier */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const leaves = getLeaveForDate(day.date);
                const isToday = day.date.toDateString() === new Date().toDateString();
                
                return (
                  <div
                    key={index}
                    className={`min-h-24 p-1 border border-gray-100 rounded ${
                      day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                    } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {day.date.getDate()}
                    </div>
                    
                    <div className="space-y-1">
                      {leaves.slice(0, 3).map((leave, leaveIndex) => (
                        <div
                          key={leaveIndex}
                          className={`text-xs px-1 py-0.5 rounded border ${leaveTypeColors[leave.type]} truncate`}
                          title={`${getUserName(leave.userId)} - ${leaveTypeLabels[leave.type]}`}
                        >
                          {getUserName(leave.userId).split(' ')[0]}
                        </div>
                      ))}
                      {leaves.length > 3 && (
                        <div className="text-xs text-gray-500 px-1">
                          +{leaves.length - 3} autres
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Liste des congés du mois */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">
              Congés de {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
            </h3>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {mockLeaveRequests
                .filter(leave => {
                  const leaveMonth = new Date(leave.startDate).getMonth();
                  const leaveYear = new Date(leave.startDate).getFullYear();
                  return leaveMonth === selectedMonth.getMonth() && 
                         leaveYear === selectedMonth.getFullYear() &&
                         (selectedUser === '' || leave.userId === selectedUser) &&
                         (selectedType === '' || leave.type === selectedType);
                })
                .map(leave => (
                  <div key={leave.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{getUserName(leave.userId)}</h4>
                        <p className="text-sm text-gray-600">
                          {leave.startDate.toLocaleDateString('fr-FR')} - {leave.endDate.toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-sm text-gray-500">{leave.days} jour(s)</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${leaveTypeColors[leave.type]}`}>
                        {leaveTypeLabels[leave.type]}
                      </span>
                      
                      <div className="flex items-center space-x-1">
                        {leave.status === 'approved' && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {leave.status === 'rejected' && <XCircle className="h-4 w-4 text-red-600" />}
                        {leave.status === 'pending' && <AlertCircle className="h-4 w-4 text-yellow-600" />}
                        <span className={`text-sm font-medium ${
                          leave.status === 'approved' ? 'text-green-600' :
                          leave.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {leave.status === 'approved' ? 'Approuvé' :
                           leave.status === 'rejected' ? 'Rejeté' : 'En attente'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
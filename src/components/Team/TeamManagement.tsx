import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Layout/Header';
import { 
  User, 
  Mail, 
  Phone, 
  Clock, 
  TrendingUp, 
  Calendar,
  Award,
  MapPin,
  Shield,
  Activity,
  BarChart3,
  Users,
  Search,
  Filter,
  Plus,
  Grid,
  List,
  Eye,
  Edit,
  MessageSquare
} from 'lucide-react';
import { mockTimeEntries, mockMissions, mockLeaveRequests } from '../../data/mockData';
import { User as UserType, UserRole } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { Key, Lock, X } from 'lucide-react';

interface ResetPasswordModalProps {
  user: UserType;
  onSave: (newPassword: string) => void;
  onCancel: () => void;
}

function ResetPasswordModal({ user, onSave, onCancel }: ResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);
    try {
      await onSave(newPassword);
    } catch (err) {
      setError('Erreur lors de la réinitialisation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Réinitialiser le Mot de Passe</h3>
              <p className="text-sm text-gray-600">{user.firstName} {user.lastName}</p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Key className="h-4 w-4" />
              )}
              <span>Réinitialiser</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrateur',
  manager: 'Manager',
  collaborator: 'Collaborateur',
  quality_control: 'Contrôle Qualité',
  client: 'Client'
};

const roleColors: Record<UserRole, string> = {
  admin: 'bg-purple-100 text-purple-800',
  manager: 'bg-blue-100 text-blue-800',
  collaborator: 'bg-green-100 text-green-800',
  quality_control: 'bg-orange-100 text-orange-800',
  client: 'bg-gray-100 text-gray-800'
};

export default function TeamManagement() {
  const navigate = useNavigate();
  const { getAllUsers, resetUserPassword } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<UserType | null>(null);

  const allUsers = getAllUsers();
  const getUserStats = (userId: string) => {
    const userTimeEntries = mockTimeEntries.filter(t => t.userId === userId);
    const userMissions = mockMissions.filter(m => m.assignedTo.includes(userId));
    const userLeaves = mockLeaveRequests.filter(l => l.userId === userId);
    
    const totalHours = userTimeEntries.reduce((sum, entry) => sum + (entry.duration / 60), 0);
    const activeMissions = userMissions.filter(m => m.status !== 'completed').length;
    const approvedLeaves = userLeaves.filter(l => l.status === 'approved').length;
    const utilizationRate = Math.round((totalHours / (8 * 22)) * 100); // Assuming 8h/day, 22 working days

    return {
      totalHours: Math.round(totalHours * 10) / 10,
      activeMissions,
      approvedLeaves,
      utilizationRate: Math.min(utilizationRate, 100)
    };
  };

  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !selectedRole || user.role === selectedRole;
    const matchesTeam = !selectedTeam || user.team === selectedTeam;
    
    return matchesSearch && matchesRole && matchesTeam;
  });

  const teams = [...new Set(allUsers.map(u => u.team).filter(Boolean))];
  const roles = [...new Set(allUsers.map(u => u.role))];

  const UserCard = ({ user }: { user: UserType }) => {
    const stats = getUserStats(user.id);
    const initials = `${user.firstName[0]}${user.lastName[0]}`;

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              {user.avatar ? (
                <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} className="w-full h-full rounded-xl object-cover" />
              ) : (
                initials
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{user.firstName} {user.lastName}</h3>
              <p className="text-sm text-gray-600">{user.email}</p>
              {user.team && (
                <p className="text-sm text-gray-500 mt-1">{user.team}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${roleColors[user.role]}`}>
              {roleLabels[user.role]}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {user.isActive ? 'Actif' : 'Inactif'}
            </span>
          </div>
        </div>

        {/* Informations de contact */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <Mail className="h-4 w-4 mr-2" />
            {user.email}
          </div>
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <Shield className="h-4 w-4 mr-2" />
            Coût interne: {user.internalCost} DH/jour
          </div>
          {user.lastLogin && (
            <div className="flex items-center text-sm text-gray-600">
              <Activity className="h-4 w-4 mr-2" />
              Dernière connexion: {user.lastLogin instanceof Date ? 
                user.lastLogin.toLocaleDateString('fr-FR') : 
                new Date(user.lastLogin).toLocaleDateString('fr-FR')}
            </div>
          )}
        </div>

        {/* Statistiques de performance */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Clock className="h-4 w-4 text-blue-600 mr-1" />
              <span className="text-lg font-bold text-blue-600">{stats.totalHours}h</span>
            </div>
            <p className="text-xs text-gray-600">Temps total</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <BarChart3 className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-lg font-bold text-green-600">{stats.utilizationRate}%</span>
            </div>
            <p className="text-xs text-gray-600">Utilisation</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Award className="h-4 w-4 text-orange-600 mr-1" />
              <span className="text-lg font-bold text-orange-600">{stats.activeMissions}</span>
            </div>
            <p className="text-xs text-gray-600">Missions</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Calendar className="h-4 w-4 text-purple-600 mr-1" />
              <span className="text-lg font-bold text-purple-600">{stats.approvedLeaves}</span>
            </div>
            <p className="text-xs text-gray-600">Congés</p>
          </div>
        </div>

        {/* Barre de progression utilisation */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>Taux d'utilisation</span>
            <span>{stats.utilizationRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                stats.utilizationRate >= 90 ? 'bg-red-500' :
                stats.utilizationRate >= 75 ? 'bg-orange-500' :
                stats.utilizationRate >= 50 ? 'bg-green-500' :
                'bg-blue-500'
              }`}
              style={{ width: `${stats.utilizationRate}%` }}
            ></div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button 
            onClick={() => handleViewProfile(user)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
          >
            Voir Profil
          </button>
          <span className="text-sm text-gray-500">
            ID: {user.id}
          </span>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => handleResetPasswordClick(user)}
              className="flex items-center space-x-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors duration-200"
              title="Réinitialiser mot de passe"
            >
              <Key className="h-4 w-4" />
              <span>Reset MDP</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const getTeamStats = () => {
    const totalUsers = filteredUsers.length;
    const activeUsers = filteredUsers.filter(u => u.isActive).length;
    const totalHours = filteredUsers.reduce((sum, user) => {
      const userStats = getUserStats(user.id);
      return sum + userStats.totalHours;
    }, 0);
    const avgUtilization = filteredUsers.reduce((sum, user) => {
      const userStats = getUserStats(user.id);
      return sum + userStats.utilizationRate;
    }, 0) / totalUsers;

    return {
      totalUsers,
      activeUsers,
      totalHours: Math.round(totalHours * 10) / 10,
      avgUtilization: Math.round(avgUtilization)
    };
  };

  const teamStats = getTeamStats();

  const handleCreateCollaborator = () => {
    navigate('/team/create');
  };

  const handleViewProfile = (user: UserType) => {
    setSelectedUser(user);
    setShowUserProfile(true);
  };

  const handleSendMessage = (user: UserType) => {
    // TODO: Implémenter l'envoi de message
    console.log('Envoyer message à:', user.firstName, user.lastName);
  };

  const handleResetPasswordClick = (user: UserType) => {
    setResetPasswordUser(user);
    setShowResetPassword(true);
  };

  const handleResetPassword = async (newPassword: string) => {
    if (resetPasswordUser) {
      try {
        await resetUserPassword(resetPasswordUser.id, newPassword);
        setShowResetPassword(false);
        setResetPasswordUser(null);
        alert(`Mot de passe réinitialisé avec succès pour ${resetPasswordUser.firstName} ${resetPasswordUser.lastName}`);
      } catch (error) {
        console.error('Erreur lors de la réinitialisation:', error);
        throw error;
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header 
        title="Équipe" 
        subtitle={`${teamStats.activeUsers} collaborateurs actifs`}
        action={{ label: 'Nouveau Collaborateur', onClick: handleCreateCollaborator }}
      />
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Statistiques d'équipe */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Équipe</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{teamStats.totalUsers}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Collaborateurs Actifs</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{teamStats.activeUsers}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-50">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Heures Totales</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{teamStats.totalHours}h</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Utilisation Moyenne</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{teamStats.avgUtilization}%</p>
              </div>
              <div className="p-3 rounded-xl bg-orange-50">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher un collaborateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole | '')}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les rôles</option>
              {roles.map(role => (
                <option key={role} value={role}>{roleLabels[role]}</option>
              ))}
            </select>

            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Toutes les équipes</option>
              {teams.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>

            <button className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200">
              <Filter className="h-4 w-4" />
              <span>Plus de filtres</span>
            </button>
          </div>
        </div>

        {/* Liste des collaborateurs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun collaborateur trouvé</h3>
            <p className="text-gray-600">Essayez de modifier vos critères de recherche</p>
          </div>
        )}
      </div>

      {/* Modal Profil Utilisateur */}
      {showUserProfile && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {selectedUser.avatar ? (
                      <img src={selectedUser.avatar} alt={`${selectedUser.firstName} ${selectedUser.lastName}`} className="w-full h-full rounded-xl object-cover" />
                    ) : (
                      `${selectedUser.firstName[0]}${selectedUser.lastName[0]}`
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </h2>
                    <p className="text-gray-600">{roleLabels[selectedUser.role]} - {selectedUser.team}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUserProfile(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Informations personnelles */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Informations Personnelles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-600">{selectedUser.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Coût Interne</p>
                      <p className="text-sm text-gray-600">{selectedUser.internalCost} DH/jour</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Équipe</p>
                      <p className="text-sm text-gray-600">{selectedUser.team}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Activity className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Dernière Connexion</p>
                      <p className="text-sm text-gray-600">
                        {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString('fr-FR') : 'Jamais'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Statistiques détaillées */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Statistiques de Performance</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(() => {
                    const stats = getUserStats(selectedUser.id);
                    return (
                      <>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-blue-600">{stats.totalHours}h</p>
                          <p className="text-sm text-gray-600">Temps Total</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <BarChart3 className="h-6 w-6 text-green-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-green-600">{stats.utilizationRate}%</p>
                          <p className="text-sm text-gray-600">Utilisation</p>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <Award className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-orange-600">{stats.activeMissions}</p>
                          <p className="text-sm text-gray-600">Missions</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <Calendar className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-purple-600">{stats.approvedLeaves}</p>
                          <p className="text-sm text-gray-600">Congés</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
              {/* Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => handleSendMessage(selectedUser)}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Envoyer Message</span>
                </button>
                <button
                  onClick={() => handleResetPasswordClick(selectedUser)}
                  className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  <Key className="h-4 w-4" />
                  <span>Réinitialiser Mot de Passe</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Réinitialisation Mot de Passe */}
      {showResetPassword && resetPasswordUser && (
        <ResetPasswordModal
          user={resetPasswordUser}
          onSave={handleResetPassword}
          onCancel={() => {
            setShowResetPassword(false);
            setResetPasswordUser(null);
          }}
        />
      )}
    </div>
  );
}
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  Clock,
  Calendar,
  AlertCircle,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  UserPlus,
} from 'lucide-react';
import { User } from '../../types';

interface SidebarProps {
  user: User;
  onLogout: () => void;
}

const getNavigation = (userRole: string) => [
  { name: 'Tableau de Bord', href: '/', icon: LayoutDashboard },
  ...(userRole !== 'collaborator' ? [
    { name: 'Clients', href: '/clients', icon: Users },
  ] : []),
  { name: 'Missions', href: '/missions', icon: FolderOpen },
  { name: 'Temps', href: '/time', icon: Clock },
  ...(userRole === 'admin' || userRole === 'manager' ? [
    { name: 'Équipe', href: '/team', icon: Users },
    { name: 'Facturation', href: '/billing', icon: FileText },
  ] : []),
  { name: 'Congés', href: '/leaves', icon: Calendar },
  { name: 'Échéances', href: '/deadlines', icon: AlertCircle },
  { name: 'Matrice Échéances', href: '/deadlines-matrix', icon: BarChart3 },
  { name: 'Documents', href: '/documents', icon: FileText },
  ...(userRole !== 'collaborator' ? [
    { name: 'Rapports', href: '/reports', icon: BarChart3 },
  ] : []),
  { name: 'Paramètres', href: '/settings', icon: Settings },
];

export default function Sidebar({ user, onLogout }: SidebarProps) {
  const navigate = useNavigate();
  const navigation = getNavigation(user.role);

  const handleCreateCollaborator = () => {
    navigate('/team/create');
  };

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">4A</span>
          </div>
          <span className="text-xl font-semibold text-gray-900">Consulting</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {/* Bouton créer collaborateur pour admin/manager */}
        {user.role === 'admin' && (
          <button
            onClick={handleCreateCollaborator}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200 mb-4"
          >
            <UserPlus className="mr-3 h-5 w-5" />
            Nouveau Collaborateur
          </button>
        )}
        
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon
              className={`mr-3 h-5 w-5 transition-colors duration-200`}
              aria-hidden="true"
            />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user.firstName[0]}{user.lastName[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user.role === 'admin' ? 'Administrateur' :
               user.role === 'manager' ? 'Manager' :
               user.role === 'collaborator' ? 'Collaborateur' :
               user.role === 'quality_control' ? 'Contrôle Qualité' : 'Client'}
            </p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Déconnexion
        </button>
      </div>
    </div>
  );
}
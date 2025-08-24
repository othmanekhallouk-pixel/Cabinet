import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  FolderOpen, 
  Clock, 
  Users, 
  Calendar, 
  AlertTriangle,
  FileText,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  Grid3X3,
  CalendarDays
} from 'lucide-react';
import { User } from '../../types';

interface SidebarProps {
  user: User;
  onLogout: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
  roles?: string[];
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Tableau de Bord',
    icon: LayoutDashboard,
    path: '/',
  },
  {
    id: 'clients',
    label: 'Clients',
    icon: Building2,
    path: '/clients',
  },
  {
    id: 'missions',
    label: 'Missions',
    icon: FolderOpen,
    path: '/missions',
  },
  {
    id: 'time',
    label: 'Suivi du Temps',
    icon: Clock,
    path: '/time',
  },
  {
    id: 'team',
    label: 'Équipe',
    icon: Users,
    path: '/team',
    roles: ['admin', 'manager'],
  },
  {
    id: 'leaves',
    label: 'Congés',
    icon: Calendar,
    path: '/leaves',
  },
  {
    id: 'deadlines',
    label: 'Échéances',
    icon: AlertTriangle,
    path: '/deadlines',
    children: [
      {
        id: 'deadlines-calendar',
        label: 'Calendrier',
        icon: CalendarDays,
        path: '/deadlines',
      },
      {
        id: 'deadlines-matrix',
        label: 'Matrice',
        icon: Grid3X3,
        path: '/deadlines-matrix',
      },
    ],
  },
  {
    id: 'billing',
    label: 'Facturation',
    icon: DollarSign,
    path: '/billing',
    roles: ['admin', 'manager'],
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FileText,
    path: '/documents',
  },
  {
    id: 'reports',
    label: 'Rapports',
    icon: BarChart3,
    path: '/reports',
    roles: ['admin', 'manager'],
  },
  {
    id: 'settings',
    label: 'Paramètres',
    icon: Settings,
    path: '/settings',
    roles: ['admin'],
  },
];

export default function Sidebar({ user, onLogout }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = React.useState<string[]>(['deadlines']);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const hasAccess = (item: MenuItem) => {
    return !item.roles || item.roles.includes(user.role);
  };

  const MenuItem = ({ item, level = 0 }: { item: MenuItem; level?: number }) => {
    const isExpanded = expandedItems.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const active = isActive(item.path);

    if (!hasAccess(item)) {
      return null;
    }

    return (
      <div>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else {
              navigate(item.path);
            }
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
            active
              ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
              : 'text-gray-700 hover:bg-gray-100'
          } ${level > 0 ? 'ml-4' : ''}`}
        >
          <div className="flex items-center space-x-3">
            <item.icon className={`h-5 w-5 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
            <span className="font-medium">{item.label}</span>
          </div>
          {hasChildren && (
            <ChevronDown 
              className={`h-4 w-4 transition-transform duration-200 ${
                isExpanded ? 'transform rotate-180' : ''
              }`} 
            />
          )}
        </button>
        
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => (
              <MenuItem key={child.id} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold">4A</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-900">4AConsulting</h1>
            <p className="text-xs text-gray-600">Management Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map(item => (
          <MenuItem key={item.id} item={item} />
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-medium text-sm">
              {user.firstName[0]}{user.lastName[0]}
            </span>
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900 text-sm">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-gray-600">{user.team}</p>
          </div>
        </div>
        
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm">Déconnexion</span>
        </button>
      </div>
    </div>
  );
}
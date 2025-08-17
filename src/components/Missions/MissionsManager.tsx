import React, { useState, useMemo } from 'react';
import Header from '../Layout/Header';
import { 
  Search, 
  Filter, 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  User, 
  Calendar,
  Tag,
  FileText,
  Download,
  Edit,
  Trash2,
  Play,
  Pause,
  Square,
  RotateCcw,
  MessageSquare,
  Paperclip,
  BarChart3,
  LayoutGrid,
  List,
  CheckSquare
} from 'lucide-react';
import { Mission, Task, MissionStatus, Priority, SavedView } from '../../types';
import { mockUsers } from '../../data/mockData';
import CreateMission from './CreateMission';
import TaskModal from './TaskModal';
import MissionModal from './MissionModal';
import { useClients } from '../../hooks/useClients';
import { useMissions } from '../../hooks/useMissions';

const statusLabels: Record<MissionStatus, string> = {
  todo: 'À Faire',
  in_progress: 'En Cours',
  review: 'En Révision',
  client_waiting: 'Attente Client',
  completed: 'Terminé'
};

const statusColors: Record<MissionStatus, string> = {
  todo: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  review: 'bg-yellow-100 text-yellow-800',
  client_waiting: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800'
};

const priorityColors: Record<Priority, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700'
};

const priorityLabels: Record<Priority, string> = {
  low: 'Faible',
  medium: 'Moyenne',
  high: 'Haute',
  urgent: 'Urgente'
};

export default function MissionsManager() {
  const { clients } = useClients();
  const { missions, addMission, updateMission, deleteMission } = useMissions();

  const [filters, setFilters] = useState({
    search: '',
    status: [] as MissionStatus[],
    priority: [] as Priority[],
    clientId: '',
    responsableId: '',
    tags: [] as string[],
    showOnlyMyTasks: false
  });

  const [viewMode, setViewMode] = useState<'missions' | 'tasks'>('missions');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showCreateMission, setShowCreateMission] = useState(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [currentUser] = useState(mockUsers[2]); // Collaborateur connecté
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid');

  // Filtrage des données
  const filteredMissions = useMemo(() => {
    return missions.filter(mission => {
      const matchesSearch = !filters.search || 
        mission.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        mission.description.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = filters.status.length === 0 || filters.status.includes(mission.status);
      const matchesPriority = filters.priority.length === 0 || filters.priority.includes(mission.priority);
      const matchesClient = !filters.clientId || mission.clientId === filters.clientId;
      const matchesResponsable = !filters.responsableId || 
        mission.managerId === filters.responsableId || 
        mission.assignedTo.includes(filters.responsableId);

      return matchesSearch && matchesStatus && matchesPriority && matchesClient && matchesResponsable;
    });
  }, [missions, filters]);

  const allTasks = useMemo(() => {
    const tasks: (Task & { missionTitle: string; clientName: string })[] = [];
    filteredMissions.forEach(mission => {
      const client = clients.find(c => c.id === mission.clientId);
      const missionTasks = mission.tasks || [];
      missionTasks.forEach(task => {
        if (!filters.showOnlyMyTasks || task.assignedTo === currentUser.id) {
          tasks.push({
            ...task,
            missionTitle: mission.title,
            clientName: client?.companyName || 'Client inconnu'
          });
        }
      });
    });
    return tasks;
  }, [filteredMissions, filters.showOnlyMyTasks, currentUser.id]);

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.companyName || 'Client inconnu';
  };

  const getUserName = (userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Non assigné';
  };

  const handleCompleteMission = (mission: Mission) => {
    const tasks = mission.tasks || [];
    const incompleteTasks = tasks.filter(t => t.status !== 'done');
    
    if (incompleteTasks.length > 0) {
      const confirm = window.confirm(
        `Cette mission a encore ${incompleteTasks.length} tâche(s) non terminée(s). Voulez-vous vraiment la terminer ?`
      );
      if (!confirm) return;
    }

    const updatedMission = { 
      ...mission, 
      status: 'completed' as MissionStatus,
      dateFin: new Date(),
      progression: 100,
      history: [...mission.history, {
        id: Date.now().toString(),
        action: 'Mission terminée',
        userId: currentUser.id,
        details: `Mission clôturée par ${currentUser.firstName} ${currentUser.lastName}`,
        createdAt: new Date()
      }]
    };
    
    updateMission(updatedMission);

    alert('Mission terminée avec succès !');
  };

  const handleCompleteTask = (task: Task) => {
    const mission = missions.find(m => (m.tasks || []).some(t => t.id === task.id));
    if (mission) {
      const tasks = mission.tasks || [];
      const updatedMission = {
        ...mission,
        tasks: tasks.map(t => 
          t.id === task.id 
            ? { 
                ...t, 
                status: 'done' as const,
                dateFin: new Date(),
                history: [...t.history, {
                  id: Date.now().toString(),
                  action: 'Tâche terminée',
                  userId: currentUser.id,
                  details: `Tâche terminée par ${currentUser.firstName} ${currentUser.lastName}`,
                  createdAt: new Date()
                }]
              }
            : t
        )
      };
      
      updateMission(updatedMission);
    }

    // Vérifier si toutes les tâches de cette mission sont terminées
    if (mission) {
      const tasks = mission.tasks || [];
      const allTasksCompleted = tasks.every(t => t.id === task.id || t.status === 'done');
      if (allTasksCompleted) {
        const shouldCompleteMission = window.confirm(
          'Toutes les tâches de cette mission sont terminées. Voulez-vous terminer la mission ?'
        );
        if (shouldCompleteMission) {
          handleCompleteMission(mission);
        }
      }
    }

    alert('Tâche terminée avec succès !');
  };

  const handleReopenMission = (mission: Mission) => {
    const motif = window.prompt('Motif de réouverture (obligatoire) :');
    if (!motif) return;

    const updatedMission = { 
      ...mission, 
      status: 'in_progress' as MissionStatus,
      dateFin: undefined,
      history: [...mission.history, {
        id: Date.now().toString(),
        action: 'Mission réouverte',
        userId: currentUser.id,
        details: `Mission réouverte par ${currentUser.firstName} ${currentUser.lastName}. Motif: ${motif}`,
        createdAt: new Date()
      }]
    };
    
    updateMission(updatedMission);

    alert('Mission réouverte avec succès !');
  };

  const handleDeleteMission = (mission: Mission) => {
    const confirm = window.confirm(
      `Êtes-vous sûr de vouloir supprimer la mission "${mission.title}" ? Cette action est irréversible.`
    );
    if (confirm) {
      deleteMission(mission.id);
      alert('Mission supprimée avec succès !');
    }
  };

  const canCompleteMission = (mission: Mission) => {
    return currentUser.role === 'admin' || currentUser.role === 'manager' || mission.managerId === currentUser.id;
  };

  const canReopenMission = (mission: Mission) => {
    return currentUser.role === 'admin' || currentUser.role === 'manager';
  };

  const MissionCard = ({ mission }: { mission: Mission }) => {
    const tasks = mission.tasks || [];
    const attachments = mission.attachments || [];
    const comments = mission.comments || [];
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const totalTasks = tasks.length;
    const isOverdue = mission.endDate < new Date() && mission.status !== 'completed';

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                checked={selectedItems.includes(mission.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedItems([...selectedItems, mission.id]);
                  } else {
                    setSelectedItems(selectedItems.filter(id => id !== mission.id));
                  }
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <h4 className="font-medium text-gray-900">{mission.title}</h4>
              {isOverdue && <AlertTriangle className="h-4 w-4 text-red-500" />}
            </div>
            <p className="text-sm text-gray-600 mb-2">{getClientName(mission.clientId)}</p>
            <p className="text-xs text-gray-500">{mission.description}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[mission.status]}`}>
              {statusLabels[mission.status]}
            </span>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${priorityColors[mission.priority]}`}>
              {priorityLabels[mission.priority]}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-3 text-sm text-gray-600">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-1" />
            <span>{getUserName(mission.managerId)}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{mission.endDate.toLocaleDateString('fr-FR')}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{mission.tempsPasse}h / {mission.tempsPrevu}h</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 mr-1" />
            <span>{completedTasks}/{totalTasks} tâches</span>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Progression</span>
            <span>{mission.progression}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${mission.progression}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {attachments.length > 0 && (
              <div className="flex items-center text-xs text-gray-500">
                <Paperclip className="h-3 w-3 mr-1" />
                <span>{attachments.length}</span>
              </div>
            )}
            {comments.length > 0 && (
              <div className="flex items-center text-xs text-gray-500">
                <MessageSquare className="h-3 w-3 mr-1" />
                <span>{comments.length}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setEditingMission(mission)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200"
            >
              <Edit className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => handleDeleteMission(mission)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
              title="Supprimer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            
            {mission.status === 'completed' ? (
              canReopenMission(mission) && (
                <button
                  onClick={() => handleReopenMission(mission)}
                  className="p-1 text-gray-400 hover:text-orange-600 transition-colors duration-200"
                  title="Réouvrir"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              )
            ) : (
              canCompleteMission(mission) && (
                <button
                  onClick={() => handleCompleteMission(mission)}
                  className="p-1 text-gray-400 hover:text-green-600 transition-colors duration-200"
                  title="Terminer"
                >
                  <CheckCircle className="h-4 w-4" />
                </button>
              )
            )}
          </div>
        </div>
      </div>
    );
  };

  const MissionRow = ({ mission }: { mission: Mission }) => {
    const tasks = mission.tasks || [];
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const totalTasks = tasks.length;
    const isOverdue = mission.endDate < new Date() && mission.status !== 'completed';
    const progressPercentage = mission.tempsPrevu > 0 ? Math.round((mission.tempsPasse / mission.tempsPrevu) * 100) : 0;
    const isOverBudget = mission.tempsPasse > mission.tempsPrevu;

    return (
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4">
          <input
            type="checkbox"
            checked={selectedItems.includes(mission.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedItems([...selectedItems, mission.id]);
              } else {
                setSelectedItems(selectedItems.filter(id => id !== mission.id));
              }
            }}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </td>
        <td className="px-6 py-4">
          <div>
            <div className="flex items-center space-x-2">
              <p className="font-medium text-gray-900">{mission.title}</p>
              {isOverdue && <AlertTriangle className="h-4 w-4 text-red-500" />}
              {isOverBudget && <Clock className="h-4 w-4 text-orange-500" title="Dépassement budget" />}
            </div>
            <p className="text-sm text-gray-600">{getClientName(mission.clientId)}</p>
            {mission.description && (
              <p className="text-xs text-gray-400 mt-1 truncate max-w-xs">{mission.description}</p>
            )}
          </div>
        </td>
        <td className="px-6 py-4">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[mission.status]}`}>
            {statusLabels[mission.status]}
          </span>
        </td>
        <td className="px-6 py-4">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${priorityColors[mission.priority]}`}>
            {priorityLabels[mission.priority]}
          </span>
        </td>
        <td className="px-6 py-4 text-sm text-gray-900">
          {getUserName(mission.managerId)}
        </td>
        <td className="px-6 py-4 text-sm text-gray-900">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className={isOverBudget ? 'text-red-600 font-medium' : 'text-gray-600'}>
                {mission.tempsPasse}h / {mission.tempsPrevu}h
              </span>
              <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-600'}`}>
                {progressPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  isOverBudget ? 'bg-red-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              ></div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 text-sm text-gray-900">
          {mission.endDate.toLocaleDateString('fr-FR')}
        </td>
        <td className="px-6 py-4 text-sm text-gray-900">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600">{completedTasks}/{totalTasks}</span>
            <div className="w-16 bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setEditingMission(mission)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200"
            >
              <Edit className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => handleDeleteMission(mission)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
              title="Supprimer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            
            {mission.status === 'completed' ? (
              canReopenMission(mission) && (
                <button
                  onClick={() => handleReopenMission(mission)}
                  className="p-1 text-gray-400 hover:text-orange-600 transition-colors duration-200"
                  title="Réouvrir"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              )
            ) : (
              canCompleteMission(mission) && (
                <button
                  onClick={() => handleCompleteMission(mission)}
                  className="p-1 text-gray-400 hover:text-green-600 transition-colors duration-200"
                  title="Terminer"
                >
                  <CheckCircle className="h-4 w-4" />
                </button>
              )
            )}
          </div>
        </td>
      </tr>
    );
  };

  const TaskRow = ({ task }: { task: Task & { missionTitle: string; clientName: string } }) => {
    const isOverdue = task.endDate && task.endDate < new Date() && task.status !== 'done';
    const progressPercentage = task.estimatedHours > 0 ? Math.round((task.actualHours / task.estimatedHours) * 100) : 0;
    const isOverBudget = task.actualHours > task.estimatedHours;

    return (
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4">
          <input
            type="checkbox"
            checked={selectedItems.includes(task.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedItems([...selectedItems, task.id]);
              } else {
                setSelectedItems(selectedItems.filter(id => id !== task.id));
              }
            }}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </td>
        <td className="px-6 py-4">
          <div>
            <div className="flex items-center space-x-2">
              <p className="font-medium text-gray-900">{task.title}</p>
              {isOverdue && <AlertTriangle className="h-4 w-4 text-red-500" />}
              {isOverBudget && <Clock className="h-4 w-4 text-orange-500" title="Dépassement budget" />}
            </div>
            <p className="text-sm text-gray-600">{task.missionTitle}</p>
            <p className="text-xs text-gray-500">{task.clientName}</p>
            {task.description && (
              <p className="text-xs text-gray-400 mt-1 truncate max-w-xs">{task.description}</p>
            )}
          </div>
        </td>
        <td className="px-6 py-4">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
            task.status === 'done' ? 'bg-green-100 text-green-800' :
            task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {task.status === 'done' ? 'Terminé' :
             task.status === 'in_progress' ? 'En Cours' : 'À Faire'}
          </span>
        </td>
        <td className="px-6 py-4">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${priorityColors[task.priority]}`}>
            {priorityLabels[task.priority]}
          </span>
        </td>
        <td className="px-6 py-4 text-sm text-gray-900">
          {getUserName(task.assignedTo)}
        </td>
        <td className="px-6 py-4 text-sm text-gray-900">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className={isOverBudget ? 'text-red-600 font-medium' : 'text-gray-600'}>
                {task.actualHours}h / {task.estimatedHours}h
              </span>
              <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-600'}`}>
                {progressPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  isOverBudget ? 'bg-red-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              ></div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 text-sm text-gray-900">
          {task.endDate?.toLocaleDateString('fr-FR') || '-'}
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center space-x-2">
            {task.comments && task.comments.length > 0 && (
              <div className="flex items-center text-xs text-gray-500">
                <MessageSquare className="h-3 w-3 mr-1" />
                <span>{task.comments.length}</span>
              </div>
            )}
            {task.attachments && task.attachments.length > 0 && (
              <div className="flex items-center text-xs text-gray-500">
                <Paperclip className="h-3 w-3 mr-1" />
                <span>{task.attachments.length}</span>
              </div>
            )}
            {task.checklist && task.checklist.length > 0 && (
              <div className="flex items-center text-xs text-gray-500">
                <CheckSquare className="h-3 w-3 mr-1" />
                <span>{task.checklist.filter(c => c.completed).length}/{task.checklist.length}</span>
              </div>
            )}
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setEditingTask(task)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200"
            >
              <Edit className="h-4 w-4" />
            </button>
            {task.status !== 'done' && (
              <button
                onClick={() => handleCompleteTask(task)}
                className="p-1 text-gray-400 hover:text-green-600 transition-colors duration-200"
                title="Terminer"
              >
                <CheckCircle className="h-4 w-4" />
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <Header 
        title="Gestion des Missions" 
        subtitle={`${filteredMissions.length} missions • ${allTasks.length} tâches`}
        action={{ label: 'Nouvelle Mission', onClick: () => setShowCreateMission(true) }}
      />
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Filtres et recherche */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Rechercher missions ou tâches..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('missions')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    viewMode === 'missions' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Missions
                </button>
                <button
                  onClick={() => setViewMode('tasks')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    viewMode === 'tasks' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Tâches
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Boutons d'affichage grille/liste */}
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setDisplayMode('grid')}
                  className={`p-2 transition-colors duration-200 ${
                    displayMode === 'grid' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  title="Vue grille"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDisplayMode('list')}
                  className={`p-2 transition-colors duration-200 ${
                    displayMode === 'list' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  title="Vue liste"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {selectedItems.length > 0 && (
                <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
                  <span className="text-sm text-blue-700">{selectedItems.length} sélectionné(s)</span>
                  <button className="text-blue-600 hover:text-blue-700">
                    <CheckCircle className="h-4 w-4" />
                  </button>
                  <button className="text-blue-600 hover:text-blue-700">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              )}
              
              <button className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                <Filter className="h-4 w-4" />
                <span>Filtres</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <select
              value={filters.status.join(',')}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                status: e.target.value ? e.target.value.split(',') as MissionStatus[] : []
              }))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les statuts</option>
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <select
              value={filters.priority.join(',')}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                priority: e.target.value ? e.target.value.split(',') as Priority[] : []
              }))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Toutes les priorités</option>
              {Object.entries(priorityLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <select
              value={filters.clientId}
              onChange={(e) => setFilters(prev => ({ ...prev, clientId: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les clients</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.companyName}</option>
              ))}
            </select>

            <select
              value={filters.responsableId}
              onChange={(e) => setFilters(prev => ({ ...prev, responsableId: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les responsables</option>
              {mockUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.showOnlyMyTasks}
                onChange={(e) => setFilters(prev => ({ ...prev, showOnlyMyTasks: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Mes tâches uniquement</span>
            </label>
          </div>
        </div>

        {/* Contenu principal */}
        {viewMode === 'missions' ? (
          displayMode === 'grid' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredMissions.map((mission) => (
                <MissionCard key={mission.id} mission={mission} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems(filteredMissions.map(m => m.id));
                          } else {
                            setSelectedItems([]);
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mission
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priorité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Responsable
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Temps
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Échéance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tâches
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMissions.map((mission) => (
                    <MissionRow key={mission.id} mission={mission} />
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(allTasks.map(t => t.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tâche
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priorité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Responsable
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Temps
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Échéance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Détails
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allTasks.map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {(viewMode === 'missions' ? filteredMissions : allTasks).length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun{viewMode === 'missions' ? 'e mission' : 'e tâche'} trouvé{viewMode === 'missions' ? 'e' : 'e'}
            </h3>
            <p className="text-gray-600">Essayez de modifier vos critères de recherche</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateMission && (
        <CreateMission
          onSave={(missionData: any) => {
            const newMission = {
              ...missionData,
              id: Date.now().toString(),
              consumedHours: 0,
              tasks: [],
              createdAt: new Date(),
              updatedAt: new Date()
            } as Mission;
            
            addMission(newMission);
            setShowCreateMission(false);
            alert('Mission créée avec succès !');
          }}
          onCancel={() => setShowCreateMission(false)}
        />
      )}

      {editingMission && (
        <MissionModal
          mission={editingMission}
          onSave={(updatedMission: Mission) => {
            updateMission(updatedMission);
            setEditingMission(null);
            alert('Mission modifiée avec succès !');
          }}
          onCancel={() => setEditingMission(null)}
        />
      )}

      {editingTask && (
        <TaskModal
          task={editingTask}
          onSave={(updatedTask: any) => {
            const mission = missions.find(m => m.tasks.some(t => t.id === updatedTask.id));
            if (mission) {
              const updatedMission = {
                ...mission,
                tasks: mission.tasks.map(t => 
                  t.id === updatedTask.id ? updatedTask : t
                )
              };
              updateMission(updatedMission);
            }
            setEditingTask(null);
            alert('Tâche modifiée avec succès !');
          }}
          onCancel={() => setEditingTask(null)}
        />
      )}
    </div>
  );
}
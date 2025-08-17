import React, { useState } from 'react';
import Header from '../Layout/Header';
import { Plus, Clock, User, Calendar, CheckSquare, MessageSquare, Paperclip, Edit } from 'lucide-react';
import { Mission, MissionStatus, Task } from '../../types';
import { mockUsers } from '../../data/mockData';
import CreateMission from './CreateMission';
import CreateTask from './CreateTask';
import TaskModal from './TaskModal';
import { useClients } from '../../hooks/useClients';
import { useMissions } from '../../hooks/useMissions';

const statusConfig: Record<MissionStatus, { label: string; color: string }> = {
  planned: { label: 'À Faire', color: 'bg-gray-100 text-gray-700' },
  in_progress: { label: 'En Cours', color: 'bg-blue-100 text-blue-700' },
  review: { label: 'En Révision', color: 'bg-yellow-100 text-yellow-700' },
  client_waiting: { label: 'Attente Client', color: 'bg-orange-100 text-orange-700' },
  completed: { label: 'Terminé', color: 'bg-green-100 text-green-700' },
};

const priorityColors = {
  low: 'border-l-gray-400',
  medium: 'border-l-yellow-400',
  high: 'border-l-orange-400',
  urgent: 'border-l-red-400',
};

export default function MissionsKanban() {
  const { clients } = useClients();
  const { missions, addMission, updateMission, deleteMission } = useMissions();
  const [showCreateMission, setShowCreateMission] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedMissionId, setSelectedMissionId] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const handleCreateMission = (missionData: any) => {
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
    alert(`Mission "${newMission.title}" créée avec succès !`);
  };

  const handleEditMission = (mission: Mission) => {
    // Logique pour éditer une mission
    console.log('Éditer mission:', mission);
  };

  const handleCreateTask = (missionId: string) => {
    setSelectedMissionId(missionId);
    setShowCreateTask(true);
  };

  const handleSaveTask = (taskData: any) => {
    const mission = missions.find(m => m.id === selectedMissionId);
    if (mission) {
      const newTask = {
        ...taskData,
        id: Date.now().toString(),
        missionId: selectedMissionId,
        createdAt: new Date(),
        updatedAt: new Date()
      } as Task;

      const updatedMission = {
        ...mission,
        tasks: [...mission.tasks, newTask]
      };
      
      updateMission(updatedMission);
    }
    setShowCreateTask(false);
    setSelectedMissionId('');
    alert('Tâche créée avec succès !');
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleUpdateTask = (updatedTask: Task) => {
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
    setShowTaskModal(false);
    setSelectedTask(null);
  };

  const getMissionsByStatus = (status: MissionStatus) => {
    return missions.filter(mission => mission.status === status);
  };

  const getClientName = (clientId: string) => {
    return clients.find(client => client.id === clientId)?.companyName || 'Client inconnu';
  };

  const getUserName = (userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Non assigné';
  };

  const getTaskStats = (tasks: Task[]) => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'done').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    return { total, completed, inProgress };
  };

  const MissionCard = ({ mission }: { mission: Mission }) => {
    const progress = (mission.consumedHours / mission.budgetHours) * 100;
    const isOverBudget = mission.consumedHours > mission.budgetHours;
    const taskStats = getTaskStats(mission.tasks);

    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 ${priorityColors[mission.priority]} p-4 mb-3 hover:shadow-md transition-shadow duration-200 cursor-pointer`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 text-sm mb-1">{mission.title}</h4>
            <p className="text-xs text-gray-600">{getClientName(mission.clientId)}</p>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleEditMission(mission)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200"
            >
              <Edit className="h-3 w-3" />
            </button>
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
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>{mission.consumedHours}h / {mission.budgetHours}h</span>
            </div>
            <div className="flex items-center">
              <User className="h-3 w-3 mr-1" />
              <span>{getUserName(mission.assignedTo[0])}</span>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full ${isOverBudget ? 'bg-red-500' : 'bg-blue-500'}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{mission.endDate.toLocaleDateString('fr-FR')}</span>
            </div>
            <span className={`${isOverBudget ? 'text-red-600 font-medium' : ''}`}>
              {Math.round(progress)}%
            </span>
          </div>

          {/* Statistiques des tâches */}
          {taskStats.total > 0 && (
            <div className="flex items-center justify-between text-xs bg-gray-50 rounded p-2">
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <CheckSquare className="h-3 w-3 mr-1 text-green-600" />
                  <span>{taskStats.completed}/{taskStats.total}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1 text-blue-600" />
                  <span>{taskStats.inProgress}</span>
                </div>
              </div>
              <button
                onClick={() => handleCreateTask(mission.id)}
                className="text-blue-600 hover:text-blue-700"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Tâches */}
          {mission.tasks.length > 0 && (
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {mission.tasks.slice(0, 3).map(task => (
                <div
                  key={task.id}
                  onClick={() => handleTaskClick(task)}
                  className="flex items-center justify-between p-1 bg-gray-50 rounded text-xs hover:bg-gray-100 cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      task.status === 'done' ? 'bg-green-500' :
                      task.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-400'
                    }`}></div>
                    <span className="truncate">{task.title}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {task.comments && task.comments.length > 0 && (
                      <MessageSquare className="h-3 w-3 text-gray-400" />
                    )}
                    {task.attachments && task.attachments.length > 0 && (
                      <Paperclip className="h-3 w-3 text-gray-400" />
                    )}
                  </div>
                </div>
              ))}
              {mission.tasks.length > 3 && (
                <p className="text-xs text-gray-500 text-center">+{mission.tasks.length - 3} autres tâches</p>
              )}
            </div>
          )}

          {/* Bouton ajouter tâche si aucune tâche */}
          {mission.tasks.length === 0 && (
            <button
              onClick={() => handleCreateTask(mission.id)}
              className="w-full text-xs text-blue-600 hover:text-blue-700 py-1 border border-dashed border-blue-300 rounded hover:bg-blue-50 transition-colors duration-200"
            >
              + Ajouter une tâche
            </button>
          )}
        </div>
      </div>
    );
  };

  const StatusColumn = ({ status, title }: { status: MissionStatus; title: string }) => {
    const statusMissions = getMissionsByStatus(status);

    return (
      <div className="flex-1 min-w-80">
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <span className="bg-white px-2 py-1 rounded-full text-sm font-medium text-gray-600">
              {statusMissions.length}
            </span>
          </div>
        </div>
        
        <div className="space-y-3 min-h-96">
          {statusMissions.map((mission) => (
            <MissionCard key={mission.id} mission={mission} />
          ))}
          
          {statusMissions.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <p className="text-sm">Aucune mission</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <Header 
        title="Missions" 
        subtitle="Vue Kanban des missions avec tâches détaillées"
        action={{ label: 'Nouvelle Mission', onClick: () => setShowCreateMission(true) }}
      />
      
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <div className="flex space-x-6 h-full">
          <StatusColumn status="planned" title="À Faire" />
          <StatusColumn status="in_progress" title="En Cours" />
          <StatusColumn status="review" title="En Révision" />
          <StatusColumn status="client_waiting" title="Attente Client" />
          <StatusColumn status="completed" title="Terminé" />
        </div>
      </div>
      
      {/* Modal Création Mission */}
      {showCreateMission && (
        <CreateMission
          onSave={handleCreateMission}
          onCancel={() => setShowCreateMission(false)}
        />
      )}

      {/* Modal Création Tâche */}
      {showCreateTask && (
        <CreateTask
          missionId={selectedMissionId}
          onSave={handleSaveTask}
          onCancel={() => {
            setShowCreateTask(false);
            setSelectedMissionId('');
          }}
        />
      )}

      {/* Modal Tâche */}
      {showTaskModal && selectedTask && (
        <TaskModal
          task={selectedTask}
          onSave={handleUpdateTask}
          onCancel={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
}
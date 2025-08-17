import { useState, useEffect, createContext, useContext } from 'react';
import { Mission } from '../types';
import { mockMissions } from '../data/mockData';

interface MissionsContextType {
  missions: Mission[];
  addMission: (mission: Mission) => void;
  updateMission: (mission: Mission) => void;
  deleteMission: (missionId: string) => void;
  getMission: (missionId: string) => Mission | undefined;
  getMissionsByUser: (userId: string) => Mission[];
}

const MissionsContext = createContext<MissionsContextType | undefined>(undefined);

export const useMissions = () => {
  const context = useContext(MissionsContext);
  if (context === undefined) {
    throw new Error('useMissions must be used within a MissionsProvider');
  }
  return context;
};

export const useMissionsLogic = () => {
  const initializeMission = (mission: any): Mission => ({
    ...mission,
    startDate: new Date(mission.startDate),
    endDate: new Date(mission.endDate),
    createdAt: new Date(mission.createdAt),
    updatedAt: new Date(mission.updatedAt),
    tasks: mission.tasks?.map((task: any) => ({
      ...task,
      endDate: task.endDate ? new Date(task.endDate) : undefined,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
      comments: task.comments?.map((comment: any) => ({
        ...comment,
        createdAt: new Date(comment.createdAt)
      })) || [],
      attachments: task.attachments || [],
      checklist: task.checklist || [],
      history: task.history?.map((entry: any) => ({
        ...entry,
        createdAt: new Date(entry.createdAt)
      })) || []
    })) || [],
    comments: mission.comments?.map((comment: any) => ({
      ...comment,
      createdAt: new Date(comment.createdAt)
    })) || [],
    history: mission.history?.map((entry: any) => ({
      ...entry,
      createdAt: new Date(entry.createdAt)
    })) || [],
    tags: mission.tags || [],
    attachments: mission.attachments || [],
    assignedTo: mission.assignedTo || [],
    progression: mission.progression || 0,
    budgetHours: mission.budgetHours || mission.tempsPrevu || 0,
    consumedHours: mission.consumedHours || mission.tempsPasse || 0,
    isLocked: mission.isLocked || false
  });

  const [missions, setMissions] = useState<Mission[]>(() => {
    const savedMissions = localStorage.getItem('missions');
    if (savedMissions) {
      try {
        const parsed = JSON.parse(savedMissions);
        return parsed.map(initializeMission);
      } catch (error) {
        console.error('Erreur lors du chargement des missions:', error);
        return mockMissions.map(initializeMission);
      }
    }
    return mockMissions.map(initializeMission);
  });

  useEffect(() => {
    localStorage.setItem('missions', JSON.stringify(missions));
  }, [missions]);

  const addMission = (mission: Mission) => {
    setMissions(prev => [...prev, mission]);
  };

  const updateMission = (updatedMission: Mission) => {
    setMissions(prev => prev.map(m => m.id === updatedMission.id ? updatedMission : m));
  };

  const deleteMission = (missionId: string) => {
    setMissions(prev => prev.filter(m => m.id !== missionId));
  };

  const getMission = (missionId: string) => {
    return missions.find(m => m.id === missionId);
  };

  const getMissionsByUser = (userId: string) => {
    return missions.filter(m => m.assignedTo.includes(userId));
  };

  return {
    missions,
    addMission,
    updateMission,
    deleteMission,
    getMission,
    getMissionsByUser
  };
};

export { MissionsContext };
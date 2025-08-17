import React, { useState } from 'react';
import Header from '../Layout/Header';
import { Play, Pause, Square, Clock, Plus } from 'lucide-react';
import { useTimer } from '../../hooks/useTimer';
import { mockTimeEntries, mockUsers } from '../../data/mockData';
import { TimeEntry } from '../../types';
import { useClients } from '../../hooks/useClients';
import { useMissions } from '../../hooks/useMissions';

export default function TimeTracker() {
  const { clients } = useClients();
  const { missions } = useMissions();
  const { timerState, startTimer, stopTimer, pauseTimer, resumeTimer, formatTime } = useTimer();
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedMission, setSelectedMission] = useState('');
  const [description, setDescription] = useState('');
  const [recentEntries, setRecentEntries] = useState<TimeEntry[]>(() => {
    const savedEntries = localStorage.getItem('timeEntries');
    if (savedEntries) {
      try {
        const parsed = JSON.parse(savedEntries);
        return parsed.map((entry: any) => ({
          ...entry,
          startTime: new Date(entry.startTime),
          endTime: entry.endTime ? new Date(entry.endTime) : undefined,
          createdAt: new Date(entry.createdAt)
        }));
      } catch (error) {
        return mockTimeEntries;
      }
    }
    return mockTimeEntries;
  });
  const [activeTimers, setActiveTimers] = useState<any[]>([]);

  // Sauvegarder les entrées de temps dans localStorage
  React.useEffect(() => {
    localStorage.setItem('timeEntries', JSON.stringify(recentEntries));
  }, [recentEntries]);

  const handleStartTimer = () => {
    if (!selectedClient || !selectedMission) {
      alert('Veuillez sélectionner un client et une mission');
      return;
    }

    // Arrêter les autres timers actifs
    if (activeTimers.length > 0) {
      const shouldStop = confirm('Un autre timer est actif. Voulez-vous l\'arrêter pour démarrer celui-ci ?');
      if (shouldStop) {
        setActiveTimers([]);
      } else {
        return;
      }
    }
    startTimer({
      userId: '3', // Current user
      clientId: selectedClient,
      missionId: selectedMission,
      description,
      tags: [],
      status: 'draft',
      breakDuration: 0,
    });

    setActiveTimers([{
      clientId: selectedClient,
      missionId: selectedMission,
      description,
      startTime: new Date()
    }]);
  };

  const handleStopTimer = () => {
    const entry = stopTimer();
    if (entry) {
      const newEntry: TimeEntry = {
        id: Date.now().toString(),
        userId: '3',
        clientId: selectedClient,
        missionId: selectedMission,
        startTime: entry.startTime!,
        endTime: entry.endTime!,
        duration: entry.duration!,
        breakDuration: 0,
        description: description,
        tags: [],
        status: 'submitted',
        isRunning: false,
        createdAt: new Date(),
      };
      
      setRecentEntries([newEntry, ...recentEntries]);
      setDescription('');
      setSelectedClient('');
      setSelectedMission('');
      setActiveTimers([]);
    }
  };

  const handlePauseTimer = () => {
    pauseTimer();
  };

  const handleResumeTimer = () => {
    resumeTimer();
  };
  const availableMissions = missions.filter(m => m.clientId === selectedClient);

  return (
    <div className="flex flex-col h-full">
      <Header 
        title="Suivi du Temps" 
        subtitle="Enregistrement et gestion du temps de travail"
        action={{ label: 'Nouvelle Saisie', onClick: () => {} }}
      />
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Timer Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Minuteur</h2>
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock className="h-5 w-5" />
              <span className="text-3xl font-mono font-bold text-blue-600">
                {formatTime()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client
              </label>
              <select
                value={selectedClient}
                onChange={(e) => {
                  setSelectedClient(e.target.value);
                  setSelectedMission('');
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={timerState.isRunning}
              >
                <option value="">Sélectionner un client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.companyName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mission
              </label>
              <select
                value={selectedMission}
                onChange={(e) => setSelectedMission(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={timerState.isRunning || !selectedClient}
              >
                <option value="">Sélectionner une mission</option>
                {availableMissions.map((mission) => (
                  <option key={mission.id} value={mission.id}>
                    {mission.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description de l'activité"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={timerState.isRunning}
              />
            </div>
          </div>

          <div className="flex items-center justify-center space-x-4">
            {!timerState.isRunning ? (
              <button
                onClick={handleStartTimer}
                className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                <Play className="h-5 w-5" />
                <span>Démarrer</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handlePauseTimer}
                  className="flex items-center space-x-2 bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors duration-200"
                >
                  <Pause className="h-5 w-5" />
                  <span>Pause</span>
                </button>
                <button
                  onClick={handleStopTimer}
                  className="flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  <Square className="h-5 w-5" />
                  <span>Arrêter</span>
                </button>
              </>
            )}
          </div>

          {/* Timers actifs */}
          {activeTimers.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Timer Actif</h3>
              {activeTimers.map((timer, index) => {
                const client = clients.find(c => c.id === timer.clientId);
                return (
                  <div key={index}>
                    {client?.companyName}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Time Entries */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Saisies Récentes</h3>
                <p className="text-gray-600 text-sm">Historique des temps enregistrés</p>
              </div>
              <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                <Plus className="h-4 w-4" />
                <span>Saisie Manuelle</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durée
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentEntries.map((entry) => {
                  const client = clients.find(c => c.id === entry.clientId);
                  const mission = missions.find(m => m.id === entry.missionId);
                  
                  return (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.startTime.toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {client?.companyName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {mission?.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {entry.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {Math.floor(entry.duration / 60)}h {entry.duration % 60}m
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          entry.status === 'approved' 
                            ? 'bg-green-100 text-green-800'
                            : entry.status === 'submitted'
                            ? 'bg-blue-100 text-blue-800'
                            : entry.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {entry.status === 'approved' ? 'Approuvé' : 
                           entry.status === 'submitted' ? 'Soumis' :
                           entry.status === 'rejected' ? 'Rejeté' : 'Brouillon'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
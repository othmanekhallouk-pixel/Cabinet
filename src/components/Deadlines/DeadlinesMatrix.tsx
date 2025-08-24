import React, { useState, useEffect } from 'react';
import Header from '../Layout/Header';
import { 
  Calendar, 
  Save, 
  Download, 
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { mockDeadlines } from '../../data/mockData';
import { Deadline, DeadlineType, DeadlineStatus } from '../../types';
import { useClients } from '../../hooks/useClients';

const deadlineTypeLabels: Record<DeadlineType, string> = {
  is: 'IS',
  ir: 'IR', 
  vat: 'TVA',
  foreign_withholding: 'Retenue à la Source Étrangère',
  vat_withholding: 'Retenue TVA',
  fees_withholding: 'Retenue Honoraires',
  registration_duty: 'Droits d\'Enregistrement',
  tax_package: 'Forfait Fiscal',
  fees_declaration: 'Déclaration Honoraires',
  dividends_declaration: 'Déclaration Dividendes',
  third_party_payments: 'Paiements Tiers',
  non_resident_payments: 'Paiements Non-Résidents',
  cnss_amo: 'CNSS/AMO',
  cimr: 'CIMR'
};

const statusColors: Record<DeadlineStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  overdue: 'bg-red-100 text-red-800 border-red-200'
};

const months = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export default function DeadlinesMatrix() {
  const { clients } = useClients();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [deadlineStatuses, setDeadlineStatuses] = useState<Record<string, DeadlineStatus>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Charger les statuts sauvegardés
  useEffect(() => {
    const savedStatuses = localStorage.getItem(`deadlineMatrix_${selectedYear}`);
    if (savedStatuses) {
      setDeadlineStatuses(JSON.parse(savedStatuses));
    } else {
      // Initialiser avec les statuts par défaut
      const initialStatuses: Record<string, DeadlineStatus> = {};
      mockDeadlines.forEach(deadline => {
        if (new Date(deadline.dueDate).getFullYear() === selectedYear) {
          initialStatuses[deadline.id] = deadline.status;
        }
      });
      setDeadlineStatuses(initialStatuses);
    }
    setHasUnsavedChanges(false);
  }, [selectedYear]);

  const handleStatusChange = (deadlineId: string, newStatus: DeadlineStatus) => {
    setDeadlineStatuses(prev => ({
      ...prev,
      [deadlineId]: newStatus
    }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    localStorage.setItem(`deadlineMatrix_${selectedYear}`, JSON.stringify(deadlineStatuses));
    setHasUnsavedChanges(false);
    alert('Matrice des échéances sauvegardée avec succès !');
  };

  const handleExport = () => {
    const data = {
      year: selectedYear,
      statuses: deadlineStatuses,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `matrice_echeances_${selectedYear}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.companyName || 'Client inconnu';
  };

  const getDeadlinesForMonth = (month: number) => {
    return mockDeadlines.filter(deadline => {
      const deadlineDate = new Date(deadline.dueDate);
      return deadlineDate.getFullYear() === selectedYear && deadlineDate.getMonth() === month;
    });
  };

  const getStatusIcon = (status: DeadlineStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header 
        title="Matrice des Échéances" 
        subtitle={`Vue matricielle des échéances fiscales et sociales - ${selectedYear}`}
        action={{ 
          label: hasUnsavedChanges ? 'Sauvegarder' : 'Exporter', 
          onClick: hasUnsavedChanges ? handleSave : handleExport 
        }}
      />
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Notification de modifications non sauvegardées */}
        {hasUnsavedChanges && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-orange-800 font-medium">Modifications non sauvegardées</span>
              </div>
              <button
                onClick={handleSave}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors duration-200"
              >
                Sauvegarder Maintenant
              </button>
            </div>
          </div>
        )}

        {/* Contrôles */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedYear(prev => prev - 1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-semibold text-gray-900">Année {selectedYear}</h2>
              <button
                onClick={() => setSelectedYear(prev => prev + 1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedYear(new Date().getFullYear())}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Année Actuelle
              </button>
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <Download className="h-4 w-4" />
                <span>Exporter</span>
              </button>
            </div>
          </div>
        </div>

        {/* Matrice par mois */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {months.map((month, index) => {
            const monthDeadlines = getDeadlinesForMonth(index);
            
            return (
              <div key={month} className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">{month} {selectedYear}</h3>
                  <p className="text-sm text-gray-600">{monthDeadlines.length} échéance(s)</p>
                </div>
                
                <div className="p-4 space-y-3">
                  {monthDeadlines.length > 0 ? (
                    monthDeadlines.map(deadline => {
                      const currentStatus = deadlineStatuses[deadline.id] || deadline.status;
                      
                      return (
                        <div key={deadline.id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 text-sm">{deadline.title}</h4>
                              <p className="text-xs text-gray-600">{getClientName(deadline.clientId)}</p>
                              <p className="text-xs text-gray-500">
                                {deadline.dueDate.toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                            <div className="ml-2">
                              {getStatusIcon(currentStatus)}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <span className="text-xs font-medium text-gray-700 block">
                              {deadlineTypeLabels[deadline.type]}
                            </span>
                            
                            <select
                              value={currentStatus}
                              onChange={(e) => handleStatusChange(deadline.id, e.target.value as DeadlineStatus)}
                              className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="pending">En attente</option>
                              <option value="in_progress">En cours</option>
                              <option value="completed">Terminé</option>
                              <option value="overdue">En retard</option>
                            </select>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Aucune échéance</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Résumé annuel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Résumé Annuel {selectedYear}</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {Object.values(deadlineStatuses).filter(s => s === 'completed').length}
                </div>
                <p className="text-sm text-gray-600">Terminées</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {Object.values(deadlineStatuses).filter(s => s === 'in_progress').length}
                </div>
                <p className="text-sm text-gray-600">En cours</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 mb-1">
                  {Object.values(deadlineStatuses).filter(s => s === 'pending').length}
                </div>
                <p className="text-sm text-gray-600">En attente</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {Object.values(deadlineStatuses).filter(s => s === 'overdue').length}
                </div>
                <p className="text-sm text-gray-600">En retard</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
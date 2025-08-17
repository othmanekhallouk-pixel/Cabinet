import React, { useState } from 'react';
import Header from '../Layout/Header';
import { 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Filter,
  Download,
  Eye,
  Plus,
  Upload,
  FileText,
  X,
  Save,
  Paperclip,
  User
} from 'lucide-react';
import { mockDeadlines } from '../../data/mockData';
import { DeadlineType, DeadlineStatus } from '../../types';
import { useClients } from '../../hooks/useClients';

const deadlineTypeLabels: Record<DeadlineType, string> = {
  is: 'IS',
  ir: 'IR',
  vat: 'TVA',
  foreign_withholding: 'Ret. Source Étrangers',
  vat_withholding: 'Ret. Source TVA',
  fees_withholding: 'Ret. Source Honoraires',
  registration_duty: 'Droit Enregistrement',
  tax_package: 'Liasse Fiscale',
  fees_declaration: 'Décl. Honoraires',
  dividends_declaration: 'Décl. Dividendes',
  third_party_payments: 'Rém. Tiers',
  non_resident_payments: 'Rém. Non-Résidents',
  cnss_amo: 'CNSS/AMO',
  cimr: 'CIMR'
};

const monthlyQuarterlyTypes: DeadlineType[] = [
  'is', 'ir', 'vat', 'foreign_withholding', 'vat_withholding', 'fees_withholding', 'registration_duty', 'cnss_amo', 'cimr'
];

const annualTypes: DeadlineType[] = [
  'tax_package', 'fees_declaration', 'dividends_declaration', 'third_party_payments', 'non_resident_payments'
];

const months = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre', 'Annuel'
];

type TaskStatus = 'realized' | 'in_progress' | 'not_applicable' | 'client_todo';

const statusLabels: Record<TaskStatus, string> = {
  realized: 'Réalisé',
  in_progress: 'En cours',
  not_applicable: 'Non applicable',
  client_todo: 'À réaliser par le client'
};

const statusColors: Record<TaskStatus, string> = {
  realized: 'bg-green-100 text-green-800 border-green-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  not_applicable: 'bg-gray-100 text-gray-800 border-gray-200',
  client_todo: 'bg-orange-100 text-orange-800 border-orange-200'
};

interface DeadlineCell {
  clientId: string;
  type: DeadlineType;
  month: number;
  year: number;
  status: TaskStatus;
  documents: string[];
}

export default function DeadlinesMatrix() {
  const { clients } = useClients();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedClient, setSelectedClient] = useState('');
  const [deadlineCells, setDeadlineCells] = useState<Record<string, DeadlineCell>>({});
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{clientId: string, type: DeadlineType} | null>(null);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);

  const isAnnualView = selectedMonth === 12; // Index 12 = "Annuel"
  const displayTypes = isAnnualView ? annualTypes : monthlyQuarterlyTypes;
  const getCellKey = (clientId: string, type: DeadlineType) => {
    return `${clientId}-${type}-${selectedMonth}-${selectedYear}`;
  };

  const getDeadlineCell = (clientId: string, type: DeadlineType): DeadlineCell => {
    const key = getCellKey(clientId, type);
    const existingDeadline = mockDeadlines.find(d => 
      d.clientId === clientId && 
      d.type === type && 
      new Date(d.dueDate).getMonth() === selectedMonth &&
      new Date(d.dueDate).getFullYear() === selectedYear
    );

    return deadlineCells[key] || {
      clientId,
      type,
      month: selectedMonth,
      year: selectedYear,
      status: existingDeadline?.status === 'completed' ? 'realized' : 'client_todo',
      documents: existingDeadline?.documents || []
    };
  };

  const updateDeadlineCell = (clientId: string, type: DeadlineType, updates: Partial<DeadlineCell>) => {
    const key = getCellKey(clientId, type);
    const currentCell = getDeadlineCell(clientId, type);
    
    setDeadlineCells(prev => ({
      ...prev,
      [key]: { ...currentCell, ...updates }
    }));
  };

  const handleStatusChange = (clientId: string, type: DeadlineType, status: TaskStatus) => {
    updateDeadlineCell(clientId, type, { status });
  };

  const handleUploadClick = (clientId: string, type: DeadlineType) => {
    setSelectedCell({ clientId, type });
    setShowUploadModal(true);
    setUploadFiles([]);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadFiles(files);
  };

  const handleSaveUpload = () => {
    if (selectedCell && uploadFiles.length > 0) {
      const { clientId, type } = selectedCell;
      const currentCell = getDeadlineCell(clientId, type);
      const newDocuments = [...currentCell.documents, ...uploadFiles.map(f => f.name)];
      
      updateDeadlineCell(clientId, type, {
        documents: newDocuments,
        status: 'realized'
      });
      
      setShowUploadModal(false);
      setSelectedCell(null);
      setUploadFiles([]);
      
      alert(`${uploadFiles.length} document(s) téléchargé(s) avec succès !`);
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'realized':
        return <CheckCircle className="h-4 w-4" />;
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      case 'not_applicable':
        return <X className="h-4 w-4" />;
      case 'client_todo':
        return <User className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const filteredClients = selectedClient 
    ? clients.filter(c => c.id === selectedClient)
    : clients;

  const DeadlineMatrixCell = ({ clientId, type }: { clientId: string, type: DeadlineType }) => {
    const cell = getDeadlineCell(clientId, type);
    const hasDocuments = cell.documents.length > 0;

    return (
      <td className="p-2 border border-gray-200 text-center relative group min-w-32">
        <div className="space-y-2">
          {/* Statut */}
          <select
            value={cell.status}
            onChange={(e) => handleStatusChange(clientId, type, e.target.value as TaskStatus)}
            className={`w-full text-xs px-2 py-1 rounded border-2 ${statusColors[cell.status]} focus:ring-2 focus:ring-blue-500`}
          >
            {Object.entries(statusLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          {/* Documents */}
          <div className="flex items-center justify-center space-x-1">
            <button
              onClick={() => handleUploadClick(clientId, type)}
              className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
              title="Ajouter document"
            >
              <Upload className="h-3 w-3" />
            </button>
            
            {hasDocuments && (
              <div className="flex items-center space-x-1">
                <Paperclip className="h-3 w-3 text-blue-600" />
                <span className="text-xs text-blue-600 font-medium">{cell.documents.length}</span>
                <button
                  className="p-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200"
                  title={`${cell.documents.length} document(s)`}
                >
                  <Eye className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </td>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <Header 
        title="Matrice des Échéances" 
        subtitle={`${months[selectedMonth]} ${selectedYear} - ${isAnnualView ? 'Déclarations annuelles' : 'Échéances mensuelles et trimestrielles'}`}
        action={{ label: 'Nouvelle Échéance', onClick: () => {} }}
      />
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Année</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={2023}>2023</option>
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mois</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {months.map((month, index) => (
                  <option key={index} value={index}>{month}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tous les clients</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.companyName}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                <Download className="h-4 w-4" />
                <span>Exporter</span>
              </button>
            </div>
          </div>
        </div>

        {/* Légende */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Légende des Statuts</h3>
          <div className="flex flex-wrap gap-4 text-xs">
            {Object.entries(statusLabels).map(([key, label]) => (
              <div key={key} className="flex items-center space-x-2">
                <div className={`px-2 py-1 rounded border-2 ${statusColors[key as TaskStatus]}`}>
                  {getStatusIcon(key as TaskStatus)}
                </div>
                <span>{label}</span>
              </div>
            ))}
            <div className="flex items-center space-x-2">
              <Paperclip className="h-4 w-4 text-blue-600" />
              <span>Avec documents</span>
            </div>
          </div>
        </div>

        {/* Tableau Unique */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">
              {isAnnualView ? 'Déclarations Annuelles' : 'Échéances Mensuelles et Trimestrielles'} - {months[selectedMonth]} {selectedYear}
            </h3>
            <p className="text-gray-600 text-sm">
              {isAnnualView ? 'Déclarations et obligations annuelles' : 'Sélectionnez le statut et ajoutez des documents pour chaque déclaration'}
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky left-0 bg-gray-50 z-10">
                    Client
                  </th>
                  {displayTypes.map(type => (
                    <th key={type} className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase min-w-32">
                      {deadlineTypeLabels[type]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredClients.map(client => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900 sticky left-0 bg-white z-10 border-r border-gray-200">
                      <div>
                        <p className="font-medium">{client.companyName}</p>
                        <p className="text-xs text-gray-500">{client.rc}</p>
                      </div>
                    </td>
                    {displayTypes.map(type => (
                      <DeadlineMatrixCell
                        key={type}
                        clientId={client.id}
                        type={type}
                      />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Upload Documents */}
      {showUploadModal && selectedCell && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Ajouter Documents</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {clients.find(c => c.id === selectedCell.clientId)?.companyName} - {deadlineTypeLabels[selectedCell.type]}
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sélectionner les fichiers
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Cliquez pour sélectionner ou glissez-déposez</p>
                    <p className="text-xs text-gray-500 mt-1">PDF, DOC, XLS, Images (max 10MB par fichier)</p>
                  </label>
                </div>
              </div>

              {uploadFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Fichiers sélectionnés :</h4>
                  {uploadFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{file.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveUpload}
                disabled={uploadFiles.length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                <span>Enregistrer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
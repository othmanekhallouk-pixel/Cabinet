import React, { useState } from 'react';
import Header from '../Layout/Header';
import { 
  FileText, 
  Upload, 
  Search, 
  Filter, 
  Download,
  Eye,
  Trash2,
  Plus,
  Folder,
  Building2
} from 'lucide-react';
import { useClients } from '../../hooks/useClients';

const documentTypes = [
  'Statuts',
  'Registre de Commerce',
  'Publicité légale',
  'PV Assemblée Générale',
  'PV de Gérance',
  'PV Conseil d\'Administration',
  'Rapport de Gestion',
  'Contrat',
  'Facture',
  'Relevé bancaire',
  'Déclaration fiscale',
  'Attestation',
  'Correspondance',
  'Autre'
];

interface Document {
  id: string;
  clientId: string;
  name: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
  version: number;
  tags: string[];
}

const mockDocuments: Document[] = [
  {
    id: '1',
    clientId: '1',
    name: 'Statuts_TechnoMaroc_v2.pdf',
    type: 'Statuts',
    size: 2048576,
    uploadedBy: 'Fatima Alami',
    uploadedAt: new Date('2024-01-15'),
    version: 2,
    tags: ['juridique', 'constitution']
  },
  {
    id: '2',
    clientId: '1',
    name: 'RC_TechnoMaroc.pdf',
    type: 'Registre de Commerce',
    size: 1024000,
    uploadedBy: 'Youssef Tahiri',
    uploadedAt: new Date('2024-01-10'),
    version: 1,
    tags: ['officiel', 'identité']
  }
];

export default function DocumentsManager() {
  const { clients } = useClients();
  const [documents] = useState<Document[]>(mockDocuments);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUpload, setShowUpload] = useState(false);

  const filteredDocuments = documents.filter(doc => {
    const matchesClient = !selectedClient || doc.clientId === selectedClient;
    const matchesType = !selectedType || doc.type === selectedType;
    const matchesSearch = !searchTerm || 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesClient && matchesType && matchesSearch;
  });

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.companyName || 'Client inconnu';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const DocumentCard = ({ document }: { document: Document }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900 text-sm">{document.name}</h4>
            <p className="text-xs text-gray-600">{getClientName(document.clientId)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200">
            <Eye className="h-4 w-4" />
          </button>
          <button className="p-1 text-gray-400 hover:text-green-600 transition-colors duration-200">
            <Download className="h-4 w-4" />
          </button>
          <button className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span className="px-2 py-1 bg-gray-100 rounded-full">{document.type}</span>
          <span>v{document.version}</span>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{formatFileSize(document.size)}</span>
          <span>{document.uploadedAt.toLocaleDateString('fr-FR')}</span>
        </div>

        <div className="flex items-center text-xs text-gray-500">
          <span>Par {document.uploadedBy}</span>
        </div>

        {document.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {document.tags.map(tag => (
              <span key={tag} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <Header 
        title="Documents" 
        subtitle="Gestion documentaire centralisée"
        action={{ label: 'Télécharger Document', onClick: () => setShowUpload(true) }}
      />
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher un document..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les clients</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.companyName}</option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les types</option>
              {documentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <button className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200">
              <Filter className="h-4 w-4" />
              <span>Plus de filtres</span>
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Documents</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{filteredDocuments.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Clients Documentés</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {new Set(filteredDocuments.map(d => d.clientId)).size}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-green-50">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Types de Documents</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">
                  {new Set(filteredDocuments.map(d => d.type)).size}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-orange-50">
                <Folder className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Taille Totale</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {formatFileSize(filteredDocuments.reduce((sum, doc) => sum + doc.size, 0))}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-purple-50">
                <Upload className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Documents par client */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Documents par Client</h3>
          </div>
          
          <div className="p-6">
            {clients.map(client => {
              const clientDocs = filteredDocuments.filter(d => d.clientId === client.id);
              if (clientDocs.length === 0) return null;
              
              return (
                <div key={client.id} className="mb-8">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{client.companyName}</h4>
                      <p className="text-sm text-gray-600">{clientDocs.length} document(s)</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {clientDocs.map(document => (
                      <DocumentCard key={document.id} document={document} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun document trouvé</h3>
            <p className="text-gray-600">Essayez de modifier vos critères de recherche</p>
          </div>
        )}
      </div>

      {/* Modal Upload */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Télécharger un Document</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Sélectionner un client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.companyName}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de Document</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  {documentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fichier</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Glissez-déposez ou cliquez pour sélectionner</p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => setShowUpload(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Annuler
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                Télécharger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
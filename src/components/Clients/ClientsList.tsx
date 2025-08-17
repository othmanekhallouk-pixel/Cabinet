import React, { useState } from 'react';
import Header from '../Layout/Header';
import CreateClient from './CreateClient';
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  FileText,
  Calendar,
  Euro,
  Search,
  Filter,
  Edit,
  List,
  Grid
} from 'lucide-react';
import { mockClients, mockMissions, mockTimeEntries, mockDeadlines } from '../../data/mockData';
import { Client } from '../../types';
import { useClients } from '../../hooks/useClients';

export default function ClientsList() {
  const { clients, addClient, updateClient } = useClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedVatRegime, setSelectedVatRegime] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateClient, setShowCreateClient] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const handleCreateClient = (clientData: any) => {
    const newClient = {
      ...clientData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    addClient(newClient);
    setShowCreateClient(false);
    alert(`Client "${newClient.companyName}" créé avec succès !`);
  };

  const handleEditClient = (clientData: any) => {
    updateClient(clientData);
    setEditingClient(null);
    alert(`Client "${clientData.companyName}" modifié avec succès !`);
  };
  const getClientStats = (clientId: string) => {
    const clientMissions = mockMissions.filter(m => m.clientId === clientId);
    const clientTimeEntries = mockTimeEntries.filter(t => t.clientId === clientId);
    const clientDeadlines = mockDeadlines.filter(d => d.clientId === clientId);
    
    const activeMissions = clientMissions.filter(m => m.status !== 'completed').length;
    const totalHours = clientTimeEntries.reduce((sum, entry) => sum + (entry.duration / 60), 0);
    const pendingDeadlines = clientDeadlines.filter(d => d.status === 'pending').length;
    const overdueDeadlines = clientDeadlines.filter(d => 
      d.status === 'overdue' || (d.status === 'pending' && new Date(d.dueDate) < new Date())
    ).length;

    return {
      activeMissions,
      totalHours: Math.round(totalHours * 10) / 10,
      pendingDeadlines,
      overdueDeadlines
    };
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.contacts[0]?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.contacts[0]?.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = !selectedSector || client.sector === selectedSector;
    const matchesVatRegime = !selectedVatRegime || client.vatRegime === selectedVatRegime;
    
    return matchesSearch && matchesSector && matchesVatRegime;
  });

  const sectors = [...new Set(clients.map(c => c.sector))];
  const vatRegimes = [...new Set(clients.map(c => c.vatRegime))];

  const ClientCard = ({ client }: { client: Client }) => {
    const stats = getClientStats(client.id);
    const primaryContact = client.contacts.find(c => c.isPrimary) || client.contacts[0];

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{client.companyName}</h3>
              <p className="text-sm text-gray-600">{client.sector}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setEditingClient(client)}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
            >
              <Edit className="h-4 w-4" />
            </button>
            {client.isFreeZone && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                Zone Franche
              </span>
            )}
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              client.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {client.isActive ? 'Actif' : 'Inactif'}
            </span>
          </div>
        </div>

        {/* Informations fiscales */}
        <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-500">RC</p>
            <p className="font-medium text-gray-900">{client.rc}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">ICE</p>
            <p className="font-medium text-gray-900">{client.ice}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Régime TVA</p>
            <p className="font-medium text-gray-900 capitalize">{client.vatRegime}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Périodicité</p>
            <p className="font-medium text-gray-900 capitalize">{client.vatPeriodicity}</p>
          </div>
        </div>

        {/* Contact principal */}
        {primaryContact && (
          <div className="mb-4 p-3 border border-gray-200 rounded-lg">
            <p className="font-medium text-gray-900 mb-2">{primaryContact.firstName} {primaryContact.lastName}</p>
            <div className="space-y-1">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                {primaryContact.email}
              </div>
              {primaryContact.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {primaryContact.phone}
                </div>
              )}
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                {client.address.city}, {client.address.country}
              </div>
            </div>
          </div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <FileText className="h-4 w-4 text-blue-600 mr-1" />
              <span className="text-lg font-bold text-blue-600">{stats.activeMissions}</span>
            </div>
            <p className="text-xs text-gray-600">Missions actives</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Clock className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-lg font-bold text-green-600">{stats.totalHours}h</span>
            </div>
            <p className="text-xs text-gray-600">Temps passé</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Calendar className="h-4 w-4 text-yellow-600 mr-1" />
              <span className="text-lg font-bold text-yellow-600">{stats.pendingDeadlines}</span>
            </div>
            <p className="text-xs text-gray-600">Échéances</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <AlertTriangle className="h-4 w-4 text-red-600 mr-1" />
              <span className="text-lg font-bold text-red-600">{stats.overdueDeadlines}</span>
            </div>
            <p className="text-xs text-gray-600">En retard</p>
          </div>
        </div>
      </div>
    );
  };

  const ClientRow = ({ client }: { client: Client }) => {
    const stats = getClientStats(client.id);
    const primaryContact = client.contacts.find(c => c.isPrimary) || client.contacts[0];

    return (
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{client.companyName}</p>
              <p className="text-sm text-gray-500">{client.sector}</p>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 text-sm text-gray-900">
          <div>
            <p>RC: {client.rc}</p>
            <p>ICE: {client.ice}</p>
          </div>
        </td>
        <td className="px-6 py-4 text-sm text-gray-900">
          {primaryContact && (
            <div>
              <p className="font-medium">{primaryContact.firstName} {primaryContact.lastName}</p>
              <p className="text-gray-500">{primaryContact.email}</p>
            </div>
          )}
        </td>
        <td className="px-6 py-4 text-sm text-gray-900">
          <div className="flex items-center space-x-2">
            <span className="capitalize">{client.vatRegime}</span>
            <span className="text-gray-500">({client.vatPeriodicity})</span>
          </div>
        </td>
        <td className="px-6 py-4 text-sm text-gray-900">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-center">
              <p className="font-bold text-blue-600">{stats.activeMissions}</p>
              <p className="text-gray-500">Missions</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-green-600">{stats.totalHours}h</p>
              <p className="text-gray-500">Temps</p>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setEditingClient(client)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200"
            >
              <Edit className="h-4 w-4" />
            </button>
            {client.isFreeZone && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                ZF
              </span>
            )}
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              client.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {client.isActive ? 'Actif' : 'Inactif'}
            </span>
          </div>
        </td>
      </tr>
    );
  };
  return (
    <div className="flex flex-col h-full">
      <Header 
        title="Clients" 
        subtitle={`${filteredClients.length} clients actifs`}
        action={{ label: 'Nouveau Client', onClick: () => setShowCreateClient(true) }}
      />
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filtres et Affichage</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  viewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher un client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les secteurs</option>
              {sectors.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>

            <select
              value={selectedVatRegime}
              onChange={(e) => setSelectedVatRegime(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les régimes TVA</option>
              {vatRegimes.map(regime => (
                <option key={regime} value={regime} className="capitalize">{regime}</option>
              ))}
            </select>

            <button className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200">
              <Filter className="h-4 w-4" />
              <span>Plus de filtres</span>
            </button>
          </div>
        </div>

        {/* Liste des clients */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredClients.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Informations Fiscales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Principal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TVA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statistiques
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClients.map((client) => (
                  <ClientRow key={client.id} client={client} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun client trouvé</h3>
            <p className="text-gray-600">Essayez de modifier vos critères de recherche</p>
          </div>
        )}
      </div>
      
      {/* Modals */}
      {showCreateClient && (
        <CreateClient
          onSave={handleCreateClient}
          onCancel={() => setShowCreateClient(false)}
        />
      )}
      
      {editingClient && (
        <CreateClient
          client={editingClient}
          onSave={handleEditClient}
          onCancel={() => setEditingClient(null)}
        />
      )}
    </div>
  );
}
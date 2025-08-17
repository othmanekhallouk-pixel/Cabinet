import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Layout/Header';
import { 
  FileText, 
  Plus, 
  Eye, 
  Download,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  Building2,
  CreditCard,
  Receipt,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  Filter
} from 'lucide-react';
import { useClients } from '../../hooks/useClients';
import { Invoice, Quote, CreditNote, InvoiceStatus } from '../../types';

const mockInvoices: Invoice[] = [
  {
    id: '1',
    clientId: '1',
    invoiceNumber: 'FAC-2024-001',
    date: new Date('2024-01-15'),
    dueDate: new Date('2024-02-15'),
    currency: 'MAD',
    items: [
      {
        id: '1',
        description: 'Tenue comptabilité mensuelle',
        quantity: 1,
        unitPrice: 3000,
        total: 3000,
        vatRate: 20
      }
    ],
    subtotal: 3000,
    vatRate: 20,
    vatAmount: 600,
    total: 3600,
    status: 'sent',
    template: {
      id: '1',
      name: 'Standard',
      header: '4AConsulting',
      footer: 'Merci pour votre confiance',
      colors: { primary: '#2563EB', secondary: '#64748B' }
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  }
];

const mockQuotes: Quote[] = [
  {
    id: '1',
    clientId: '1',
    quoteNumber: 'DEV-2024-001',
    date: new Date('2024-01-10'),
    validUntil: new Date('2024-02-10'),
    currency: 'MAD',
    items: [
      {
        id: '1',
        description: 'Audit comptable annuel',
        quantity: 1,
        unitPrice: 15000,
        total: 15000,
        vatRate: 20
      }
    ],
    subtotal: 15000,
    vatRate: 20,
    vatAmount: 3000,
    total: 18000,
    status: 'sent',
    template: {
      id: '1',
      name: 'Standard',
      header: '4AConsulting',
      footer: 'Devis valable 30 jours',
      colors: { primary: '#2563EB', secondary: '#64748B' }
    },
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  }
];

const mockCreditNotes: CreditNote[] = [
  {
    id: '1',
    clientId: '1',
    originalInvoiceId: '1',
    creditNoteNumber: 'AV-2024-001',
    date: new Date('2024-01-20'),
    currency: 'MAD',
    items: [
      {
        id: '1',
        description: 'Remboursement partiel - Erreur facturation',
        quantity: 1,
        unitPrice: -500,
        total: -500,
        vatRate: 20
      }
    ],
    subtotal: -500,
    vatRate: 20,
    vatAmount: -100,
    total: -600,
    reason: 'Erreur de facturation - remboursement partiel',
    status: 'sent',
    template: {
      id: '1',
      name: 'Standard',
      header: '4AConsulting',
      footer: 'Facture d\'avoir',
      colors: { primary: '#2563EB', secondary: '#64748B' }
    },
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  }
];

const statusLabels: Record<InvoiceStatus, string> = {
  draft: 'Brouillon',
  sent: 'Envoyée',
  paid: 'Payée',
  overdue: 'En retard',
  cancelled: 'Annulée'
};

const statusColors: Record<InvoiceStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800'
};

export default function BillingManager() {
  const { clients } = useClients();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'invoices' | 'quotes' | 'credit_notes' | 'payments'>('invoices');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.companyName || 'Client inconnu';
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === 'MAD' ? 'DH' : currency === 'EUR' ? '€' : '$';
    return `${amount.toLocaleString()} ${symbol}`;
  };

  const getBillingStats = () => {
    const totalInvoices = mockInvoices.length;
    const totalQuotes = mockQuotes.length;
    const totalCreditNotes = mockCreditNotes.length;
    const totalRevenue = mockInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
    const pendingAmount = mockInvoices.filter(i => i.status === 'sent').reduce((sum, i) => sum + i.total, 0);
    const overdueAmount = mockInvoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.total, 0);

    return {
      totalInvoices,
      totalQuotes,
      totalCreditNotes,
      totalRevenue,
      pendingAmount,
      overdueAmount
    };
  };

  const stats = getBillingStats();

  const InvoiceCard = ({ invoice }: { invoice: Invoice }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium text-gray-900">{invoice.invoiceNumber}</h4>
          <p className="text-sm text-gray-600">{getClientName(invoice.clientId)}</p>
          <p className="text-xs text-gray-500">{invoice.date.toLocaleDateString('fr-FR')}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg text-gray-900">{formatCurrency(invoice.total, invoice.currency)}</p>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[invoice.status]}`}>
            {statusLabels[invoice.status]}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
        <span>Échéance: {invoice.dueDate.toLocaleDateString('fr-FR')}</span>
        <span>{invoice.items.length} ligne(s)</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200">
            <Eye className="h-4 w-4" />
          </button>
          <button className="p-1 text-gray-400 hover:text-green-600 transition-colors duration-200">
            <Download className="h-4 w-4" />
          </button>
          <button 
            onClick={() => navigate(`/billing/invoice/${invoice.id}/edit`)}
            className="p-1 text-gray-400 hover:text-orange-600 transition-colors duration-200"
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center space-x-2">
          {invoice.status === 'sent' && (
            <button className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">
              Marquer payée
            </button>
          )}
          <button 
            onClick={() => navigate(`/billing/credit-note/create?invoice=${invoice.id}`)}
            className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
          >
            Avoir
          </button>
        </div>
      </div>
    </div>
  );

  const QuoteCard = ({ quote }: { quote: Quote }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium text-gray-900">{quote.quoteNumber}</h4>
          <p className="text-sm text-gray-600">{getClientName(quote.clientId)}</p>
          <p className="text-xs text-gray-500">{quote.date.toLocaleDateString('fr-FR')}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg text-gray-900">{formatCurrency(quote.total, quote.currency)}</p>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
            quote.status === 'accepted' ? 'bg-green-100 text-green-800' :
            quote.status === 'rejected' ? 'bg-red-100 text-red-800' :
            quote.status === 'expired' ? 'bg-gray-100 text-gray-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {quote.status === 'accepted' ? 'Accepté' :
             quote.status === 'rejected' ? 'Refusé' :
             quote.status === 'expired' ? 'Expiré' : 'Envoyé'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
        <span>Valide jusqu'au: {quote.validUntil.toLocaleDateString('fr-FR')}</span>
        <span>{quote.items.length} ligne(s)</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200">
            <Eye className="h-4 w-4" />
          </button>
          <button className="p-1 text-gray-400 hover:text-green-600 transition-colors duration-200">
            <Download className="h-4 w-4" />
          </button>
          <button 
            onClick={() => navigate(`/billing/quote/${quote.id}/edit`)}
            className="p-1 text-gray-400 hover:text-orange-600 transition-colors duration-200"
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center space-x-2">
          {quote.status === 'accepted' && (
            <button 
              onClick={() => navigate(`/billing/invoice/create?quote=${quote.id}`)}
              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
            >
              Facturer
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const CreditNoteCard = ({ creditNote }: { creditNote: CreditNote }) => {
    const originalInvoice = mockInvoices.find(i => i.id === creditNote.originalInvoiceId);
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-medium text-gray-900">{creditNote.creditNoteNumber}</h4>
            <p className="text-sm text-gray-600">{getClientName(creditNote.clientId)}</p>
            <p className="text-xs text-gray-500">Facture: {originalInvoice?.invoiceNumber}</p>
            <p className="text-xs text-gray-500">{creditNote.date.toLocaleDateString('fr-FR')}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg text-red-600">{formatCurrency(Math.abs(creditNote.total), creditNote.currency)}</p>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              creditNote.status === 'processed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {creditNote.status === 'processed' ? 'Traitée' : 'Envoyée'}
            </span>
          </div>
        </div>

        <div className="mb-3">
          <p className="text-sm text-gray-700 font-medium">Motif:</p>
          <p className="text-xs text-gray-600">{creditNote.reason}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200">
              <Eye className="h-4 w-4" />
            </button>
            <button className="p-1 text-gray-400 hover:text-green-600 transition-colors duration-200">
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const PaymentTracker = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Suivi des Paiements</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Facture</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Échéance</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockInvoices.map(invoice => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{invoice.invoiceNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{getClientName(invoice.clientId)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(invoice.total, invoice.currency)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{invoice.dueDate.toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[invoice.status]}`}>
                      {statusLabels[invoice.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      {invoice.status === 'sent' && (
                        <button className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">
                          Marquer payée
                        </button>
                      )}
                      <button className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">
                        Relancer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <Header 
        title="Facturation" 
        subtitle="Gestion des factures, devis et avoirs"
        action={{ 
          label: activeTab === 'invoices' ? 'Nouvelle Facture' : 
                 activeTab === 'quotes' ? 'Nouveau Devis' : 
                 activeTab === 'credit_notes' ? 'Nouvel Avoir' : 'Nouveau Paiement',
          onClick: () => {
            if (activeTab === 'invoices') navigate('/billing/invoice/create');
            else if (activeTab === 'quotes') navigate('/billing/quote/create');
            else if (activeTab === 'credit_notes') navigate('/billing/credit-note/create');
          }
        }}
      />
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Chiffre d'Affaires</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{formatCurrency(stats.totalRevenue, 'MAD')}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-50">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">En Attente</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{formatCurrency(stats.pendingAmount, 'MAD')}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">En Retard</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{formatCurrency(stats.overdueAmount, 'MAD')}</p>
              </div>
              <div className="p-3 rounded-xl bg-red-50">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Documents</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalInvoices + stats.totalQuotes + stats.totalCreditNotes}</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50">
                <FileText className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('invoices')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'invoices'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Factures ({stats.totalInvoices})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('quotes')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'quotes'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Receipt className="h-4 w-4" />
                  <span>Devis ({stats.totalQuotes})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('credit_notes')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'credit_notes'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Avoirs ({stats.totalCreditNotes})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'payments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4" />
                  <span>Paiements</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Filtres */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Rechercher..."
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
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tous les statuts</option>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>

              <button className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                <Filter className="h-4 w-4" />
                <span>Plus de filtres</span>
              </button>
            </div>
          </div>

          {/* Contenu des onglets */}
          <div className="p-6">
            {activeTab === 'invoices' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {mockInvoices.map(invoice => (
                  <InvoiceCard key={invoice.id} invoice={invoice} />
                ))}
              </div>
            )}

            {activeTab === 'quotes' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {mockQuotes.map(quote => (
                  <QuoteCard key={quote.id} quote={quote} />
                ))}
              </div>
            )}

            {activeTab === 'credit_notes' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {mockCreditNotes.map(creditNote => (
                  <CreditNoteCard key={creditNote.id} creditNote={creditNote} />
                ))}
              </div>
            )}

            {activeTab === 'payments' && <PaymentTracker />}
          </div>
        </div>
      </div>
    </div>
  );
}
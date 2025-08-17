import React, { useState } from 'react';
import Header from '../Layout/Header';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Save, 
  Eye, 
  DollarSign,
  Calendar,
  Building2,
  Palette
} from 'lucide-react';
import { mockProjects } from '../../data/mockData';
import { Invoice, InvoiceItem, InvoiceTemplate } from '../../types';
import { useClients } from '../../hooks/useClients';

const currencies = [
  { code: 'MAD', symbol: 'DH', name: 'Dirham Marocain' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'Dollar US' }
];

const defaultTemplate: InvoiceTemplate = {
  id: '1',
  name: 'Template Standard',
  header: '4AConsulting - Cabinet d\'Expertise Comptable',
  footer: 'Merci pour votre confiance',
  colors: {
    primary: '#2563EB',
    secondary: '#64748B'
  }
};

export default function CreateInvoice() {
  const { clients } = useClients();
  const [invoice, setInvoice] = useState<Partial<Invoice>>({
    clientId: '',
    projectId: '',
    invoiceNumber: `FAC-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
    date: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
    currency: 'MAD',
    items: [{ id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }],
    subtotal: 0,
    vatRate: 20,
    vatAmount: 0,
    total: 0,
    status: 'draft',
    template: defaultTemplate
  });
  
  const selectedClient = clients.find(c => c.id === invoice.clientId);
  const selectedCurrency = currencies.find(c => c.code === invoice.currency);
  const availableProjects = mockProjects.filter(p => p.clientId === invoice.clientId);
  
  const [vatWarning, setVatWarning] = useState('');

  const [showPreview, setShowPreview] = useState(false);

  const calculateTotals = (items: InvoiceItem[], vatRate: number) => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const vatAmount = (subtotal * vatRate) / 100;
    const total = subtotal + vatAmount;
    return { subtotal, vatAmount, total };
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...(invoice.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    const totals = calculateTotals(newItems, invoice.vatRate || 20);
    setInvoice(prev => ({ ...prev, items: newItems, ...totals }));
  };

  const updateItemVat = (index: number, vatRate: number) => {
    const newItems = [...(invoice.items || [])];
    newItems[index] = { ...newItems[index], vatRate };
    setInvoice(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
      vatRate: 20,
      isExpense: false
    };
    const newItems = [...(invoice.items || []), newItem];
    setInvoice(prev => ({ ...prev, items: newItems }));
  };

  const removeItem = (index: number) => {
    const newItems = (invoice.items || []).filter((_, i) => i !== index);
    const totals = calculateTotals(newItems, invoice.vatRate || 20);
    setInvoice(prev => ({ ...prev, items: newItems, ...totals }));
  };

  // Vérification zone franche
  React.useEffect(() => {
    if (selectedClient?.isFreeZone && invoice.items?.some(item => item.vatRate > 0)) {
      setVatWarning('⚠️ Attention : Ce client est en Zone Franche. Êtes-vous sûr de vouloir appliquer la TVA ?');
    } else {
      setVatWarning('');
    }
  }, [selectedClient, invoice.items]);

  const handleSave = () => {
    console.log('Facture sauvegardée:', invoice);
    alert('Facture créée avec succès !');
  };

  return (
    <div className="flex flex-col h-full">
      <Header 
        title="Nouvelle Facture" 
        subtitle="Création d'une facture client"
        action={{ label: 'Aperçu', onClick: () => setShowPreview(!showPreview) }}
      />
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Informations générales */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations Générales</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de Facture
                </label>
                <input
                  type="text"
                  value={invoice.invoiceNumber}
                  onChange={(e) => setInvoice(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de Facture
                </label>
                <input
                  type="date"
                  value={invoice.date?.toISOString().split('T')[0]}
                  onChange={(e) => setInvoice(prev => ({ ...prev, date: new Date(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date d'Échéance
                </label>
                <input
                  type="date"
                  value={invoice.dueDate?.toISOString().split('T')[0]}
                  onChange={(e) => setInvoice(prev => ({ ...prev, dueDate: new Date(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Avertissement Zone Franche */}
          {vatWarning && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-yellow-800 font-medium">{vatWarning}</p>
            </div>
          )}

          {/* Client et Projet */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Client et Projet</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client *
                </label>
                <select
                  value={invoice.clientId}
                  onChange={(e) => setInvoice(prev => ({ ...prev, clientId: e.target.value, projectId: '' }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.companyName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Projet (optionnel)
                </label>
                <select
                  value={invoice.projectId}
                  onChange={(e) => setInvoice(prev => ({ ...prev, projectId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!invoice.clientId}
                >
                  <option value="">Aucun projet</option>
                  {availableProjects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Devise
                </label>
                <select
                  value={invoice.currency}
                  onChange={(e) => setInvoice(prev => ({ ...prev, currency: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {currencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.symbol} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Lignes de facture */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Lignes de Facture</h3>
              <button
                onClick={addItem}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter une ligne</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix Unitaire</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">TVA %</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(invoice.items || []).map((item, index) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Description du service"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={item.isExpense ? 'expense' : 'service'}
                          onChange={(e) => {
                            const isExpense = e.target.value === 'expense';
                            updateItem(index, 'isExpense', isExpense);
                            if (isExpense) {
                              updateItemVat(index, 0);
                            }
                          }}
                          className="w-24 border border-gray-300 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="service">Service</option>
                          <option value="expense">Débours</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-20 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-24 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.vatRate || 20}
                          onChange={(e) => updateItemVat(index, parseFloat(e.target.value) || 0)}
                          className="w-16 border border-gray-300 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="0"
                          max="100"
                          step="0.01"
                          disabled={item.isExpense}
                        />
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {item.total.toFixed(2)} {selectedCurrency?.symbol}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-700 p-1"
                          disabled={(invoice.items || []).length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totaux */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-end">
              <div className="w-80 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sous-total :</span>
                  <span className="font-medium">{(invoice.subtotal || 0).toFixed(2)} {selectedCurrency?.symbol}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">TVA :</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={invoice.vatRate}
                      onChange={(e) => {
                        const vatRate = parseFloat(e.target.value) || 0;
                        const totals = calculateTotals(invoice.items || [], vatRate);
                        setInvoice(prev => ({ ...prev, vatRate, ...totals }));
                      }}
                      className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                    <span className="text-sm">%</span>
                    <span className="font-medium">{(invoice.vatAmount || 0).toFixed(2)} {selectedCurrency?.symbol}</span>
                  </div>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total :</span>
                    <span>{(invoice.total || 0).toFixed(2)} {selectedCurrency?.symbol}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              <Eye className="h-4 w-4" />
              <span>Aperçu</span>
            </button>
            
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Save className="h-4 w-4" />
              <span>Enregistrer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Aperçu de la facture */}
      {showPreview && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* En-tête */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-blue-600">4AConsulting</h1>
                  <p className="text-gray-600">Cabinet d'Expertise Comptable</p>
                </div>
                <div className="text-right">
                  <h2 className="text-xl font-bold text-gray-900">FACTURE</h2>
                  <p className="text-gray-600">{invoice.invoiceNumber}</p>
                </div>
              </div>

              {/* Informations client */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Facturé à :</h3>
                  <p className="font-medium">{selectedClient.companyName}</p>
                  <p className="text-sm text-gray-600">{selectedClient.address.street}</p>
                  <p className="text-sm text-gray-600">{selectedClient.address.city}, {selectedClient.address.postalCode}</p>
                  <p className="text-sm text-gray-600">RC: {selectedClient.rc}</p>
                  <p className="text-sm text-gray-600">ICE: {selectedClient.ice}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Détails :</h3>
                  <p className="text-sm"><span className="font-medium">Date :</span> {invoice.date?.toLocaleDateString('fr-FR')}</p>
                  <p className="text-sm"><span className="font-medium">Échéance :</span> {invoice.dueDate?.toLocaleDateString('fr-FR')}</p>
                  <p className="text-sm"><span className="font-medium">Devise :</span> {selectedCurrency?.name}</p>
                </div>
              </div>

              {/* Lignes de facture */}
              <table className="w-full mb-8">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Description</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Qté</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">P.U.</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(invoice.items || []).map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm">{item.description}</td>
                      <td className="px-4 py-3 text-sm text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-right">{item.unitPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">{item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totaux */}
              <div className="flex justify-end mb-8">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span>Sous-total :</span>
                    <span>{(invoice.subtotal || 0).toFixed(2)} {selectedCurrency?.symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TVA ({invoice.vatRate}%) :</span>
                    <span>{(invoice.vatAmount || 0).toFixed(2)} {selectedCurrency?.symbol}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total :</span>
                      <span>{(invoice.total || 0).toFixed(2)} {selectedCurrency?.symbol}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pied de page */}
              <div className="text-center text-sm text-gray-600 border-t pt-4">
                <p>Merci pour votre confiance</p>
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
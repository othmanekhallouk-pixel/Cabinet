import React, { useState } from 'react';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Save, 
  X,
  Plus,
  Trash2,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { Client, Contact, VATRegime } from '../../types';

interface CreateClientProps {
  onSave: (client: Partial<Client>) => void;
  onCancel: () => void;
  client?: Client;
}

const vatRegimes: { value: VATRegime; label: string }[] = [
  { value: 'normal', label: 'Débit' },
  { value: 'simplified', label: 'Encaissement' },
  { value: 'exempt', label: 'Exonéré' }
];


export default function CreateClient({ onSave, onCancel, client }: CreateClientProps) {
  const [formData, setFormData] = useState<Partial<Client>>({
    companyName: client?.companyName || '',
    rc: client?.rc || '',
    ice: client?.ice || '',
    if: client?.if || '',
    cnss: client?.cnss || '',
    vatRegime: client?.vatRegime || 'normal',
    vatPeriodicity: client?.vatPeriodicity || 'monthly',
    fiscalYearStart: client?.fiscalYearStart || new Date(new Date().getFullYear(), 0, 1),
    fiscalYearEnd: client?.fiscalYearEnd || new Date(new Date().getFullYear(), 11, 31),
    sector: client?.sector || '',
    isFreeZone: client?.isFreeZone || false,
    currency: client?.currency || 'MAD',
    isActive: client?.isActive !== undefined ? client.isActive : true,
    address: client?.address || {
      street: '',
      city: '',
      postalCode: '',
      country: 'Maroc'
    },
    contacts: client?.contacts || [{
      id: '1',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      position: '',
      isPrimary: true
    }],
    contracts: client?.contracts || []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const newWarnings: Record<string, string> = {};

    // Validation format ICE si rempli (15 chiffres)
    if (formData.ice && formData.ice.trim() && !/^\d{15}$/.test(formData.ice)) {
      newErrors.ice = 'L\'ICE doit contenir exactement 15 chiffres';
    }

    // Messages de recommandation pour les champs non remplis (première fois)
    if (!formData.companyName?.trim()) newWarnings.companyName = 'La raison sociale est recommandée pour identifier le client';
    if (!formData.ice?.trim()) newWarnings.ice = 'L\'ICE est recommandé pour les déclarations fiscales';
    if (!formData.rc?.trim()) newWarnings.rc = 'Le RC est recommandé pour la qualité du dossier client';
    if (!formData.if?.trim()) newWarnings.if = 'L\'IF est recommandé pour les déclarations fiscales';
    if (!formData.cnss?.trim()) newWarnings.cnss = 'Le CNSS est recommandé pour les déclarations sociales';
    if (!formData.address?.street?.trim()) newWarnings.street = 'L\'adresse est recommandée pour les documents officiels';
    if (!formData.address?.city?.trim()) newWarnings.city = 'La ville est recommandée pour les documents officiels';
    
    // Validation des contacts si remplis
    formData.contacts?.forEach((contact, index) => {
      if (contact.firstName?.trim() && !contact.lastName?.trim()) {
        newWarnings[`contact_${index}_lastName`] = 'Le nom est recommandé si le prénom est renseigné';
      }
      if (contact.lastName?.trim() && !contact.firstName?.trim()) {
        newWarnings[`contact_${index}_firstName`] = 'Le prénom est recommandé si le nom est renseigné';
      }
      if ((contact.firstName?.trim() || contact.lastName?.trim()) && !contact.email?.trim()) {
        newWarnings[`contact_${index}_email`] = 'L\'email est recommandé pour le contact';
      }
      if (contact.email?.trim() && !/\S+@\S+\.\S+/.test(contact.email)) {
        newErrors[`contact_${index}_email`] = 'Format d\'email invalide';
      }
    });

    setErrors(newErrors);
    setWarnings(newWarnings);
    
    // Permettre la sauvegarde même avec des warnings
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const clientData: Partial<Client> = {
        ...formData,
        id: client?.id || Date.now().toString(),
        createdAt: client?.createdAt || new Date(),
      };
      onSave(clientData);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (warnings[field]) {
      setWarnings(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address!, [field]: value }
    }));
  };

  const handleContactChange = (index: number, field: string, value: any) => {
    const newContacts = [...(formData.contacts || [])];
    newContacts[index] = { ...newContacts[index], [field]: value };
    setFormData(prev => ({ ...prev, contacts: newContacts }));
  };

  const addContact = () => {
    const newContact: Contact = {
      id: Date.now().toString(),
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      position: '',
      isPrimary: false
    };
    setFormData(prev => ({
      ...prev,
      contacts: [...(prev.contacts || []), newContact]
    }));
  };

  const removeContact = (index: number) => {
    const newContacts = (formData.contacts || []).filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, contacts: newContacts }));
  };

  const isVatDisabled = formData.vatRegime === 'exempt';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {client ? 'Modifier le Client' : 'Nouveau Client'}
              </h2>
              <p className="text-gray-600 text-sm">
                {client ? 'Modifier les informations du client' : 'Créer un nouveau client'}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Messages d'avertissement globaux */}
          {Object.keys(warnings).length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Recommandations Qualité</h4>
                  <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                    {Object.values(warnings).map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Informations générales */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Informations Générales</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raison Sociale <span className="text-xs text-gray-500">(optionnel)</span>
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: TechnoMaroc SARL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secteur d'Activité <span className="text-xs text-gray-500">(optionnel)</span>
                </label>
                <input
                  type="text"
                  value={formData.sector}
                  onChange={(e) => handleChange('sector', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Commerce, Services, Industrie..."
                />
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isFreeZone}
                  onChange={(e) => handleChange('isFreeZone', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Zone Franche</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Client Actif</span>
              </label>
            </div>
          </div>

          {/* Informations fiscales */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Informations Fiscales</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ICE <span className="text-xs text-gray-500">(15 chiffres)</span>
                </label>
                <input
                  type="text"
                  value={formData.ice}
                  onChange={(e) => handleChange('ice', e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.ice ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="001234567890123"
                  maxLength={15}
                />
                {errors.ice && <p className="text-red-600 text-xs mt-1">{errors.ice}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RC <span className="text-xs text-gray-500">(optionnel)</span>
                </label>
                <input
                  type="text"
                  value={formData.rc}
                  onChange={(e) => handleChange('rc', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IF <span className="text-xs text-gray-500">(optionnel)</span>
                </label>
                <input
                  type="text"
                  value={formData.if}
                  onChange={(e) => handleChange('if', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="12345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CNSS <span className="text-xs text-gray-500">(optionnel)</span>
                </label>
                <input
                  type="text"
                  value={formData.cnss}
                  onChange={(e) => handleChange('cnss', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1234567"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Régime TVA</label>
                <select
                  value={formData.vatRegime}
                  onChange={(e) => handleChange('vatRegime', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {vatRegimes.map(regime => (
                    <option key={regime.value} value={regime.value}>{regime.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Périodicité TVA</label>
                <select
                  value={formData.vatPeriodicity}
                  onChange={(e) => handleChange('vatPeriodicity', e.target.value)}
                  className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isVatDisabled ? 'bg-gray-100 text-gray-400' : ''
                  }`}
                  disabled={isVatDisabled}
                >
                  <option value="monthly">Mensuelle</option>
                  <option value="quarterly">Trimestrielle</option>
                </select>
                {isVatDisabled && (
                  <p className="text-xs text-gray-500 mt-1">Non applicable (exonéré)</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Devise</label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="MAD">MAD - Dirham</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="USD">USD - Dollar</option>
                </select>
              </div>
            </div>

            {/* Année fiscale */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Début Année Fiscale
                </label>
                <input
                  type="date"
                  value={formData.fiscalYearStart?.toISOString().split('T')[0]}
                  onChange={(e) => handleChange('fiscalYearStart', new Date(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fin Année Fiscale
                </label>
                <input
                  type="date"
                  value={formData.fiscalYearEnd?.toISOString().split('T')[0]}
                  onChange={(e) => handleChange('fiscalYearEnd', new Date(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Adresse */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Adresse</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rue <span className="text-xs text-gray-500">(optionnel)</span></label>
                <input
                  type="text"
                  value={formData.address?.street}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123 Boulevard Mohammed V"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ville <span className="text-xs text-gray-500">(optionnel)</span></label>
                <input
                  type="text"
                  value={formData.address?.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Casablanca"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Code Postal</label>
                <input
                  type="text"
                  value={formData.address?.postalCode}
                  onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="20000"
                />
              </div>
            </div>
          </div>

          {/* Contacts */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Contacts</h3>
              <button
                type="button"
                onClick={addContact}
                className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter Contact</span>
              </button>
            </div>

            {formData.contacts?.map((contact, index) => (
              <div key={contact.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Contact {index + 1}</h4>
                  {formData.contacts!.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeContact(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prénom <span className="text-xs text-gray-500">(optionnel)</span></label>
                    <input
                      type="text"
                      value={contact.firstName}
                      onChange={(e) => handleContactChange(index, 'firstName', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom <span className="text-xs text-gray-500">(optionnel)</span></label>
                    <input
                      type="text"
                      value={contact.lastName}
                      onChange={(e) => handleContactChange(index, 'lastName', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email <span className="text-xs text-gray-500">(optionnel)</span></label>
                    <input
                      type="email"
                      value={contact.email}
                      onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors[`contact_${index}_email`] ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors[`contact_${index}_email`] && (
                      <p className="text-red-600 text-xs mt-1">{errors[`contact_${index}_email`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Poste <span className="text-xs text-gray-500">(optionnel)</span></label>
                    <input
                      type="text"
                      value={contact.position}
                      onChange={(e) => handleContactChange(index, 'position', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={contact.isPrimary}
                      onChange={(e) => handleContactChange(index, 'isPrimary', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Contact Principal</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Save className="h-4 w-4" />
              <span>{client ? 'Modifier' : 'Créer'} le Client</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
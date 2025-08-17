import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

interface ForgotPasswordProps {
  onBack: () => void;
  onResetRequest: (email: string) => Promise<void>;
}

export default function ForgotPassword({ onBack, onResetRequest }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await onResetRequest(email);
      setIsSuccess(true);
    } catch (err) {
      setError('Erreur lors de l\'envoi de l\'email de récupération');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Email envoyé !</h1>
          <p className="text-gray-600 mb-6">
            Un email de récupération sera envoyé à <strong>{email}</strong> si ce compte existe.
            Vérifiez votre boîte mail dans quelques minutes.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Pour la démo :</strong> Utilisez un des emails suivants pour tester la réinitialisation :
            </p>
            <ul className="mt-2 text-sm text-blue-700 space-y-1">
              <li>• admin@4aconsulting.ma</li>
              <li>• fatima.alami@4aconsulting.ma</li>
              <li>• youssef.tahiri@4aconsulting.ma</li>
            </ul>
            <p className="text-sm text-blue-800 mt-2">
              En production, un vrai email serait envoyé. Contactez votre administrateur si problème.
            </p>
          </div>

          <button
            onClick={onBack}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">4A</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Mot de passe oublié</h1>
          <p className="text-gray-600 mt-2">
            Saisissez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email professionnel
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="votre.email@4aconsulting.ma"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Mail className="h-5 w-5" />
                <span>Envoyer le lien</span>
              </>
            )}
          </button>
        </form>

        {/* Retour */}
        <div className="mt-6">
          <button
            onClick={onBack}
            className="w-full flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-900 py-2 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour à la connexion</span>
          </button>
        </div>

        {/* Aide */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">Besoin d'aide ?</p>
          <div className="space-y-1 text-xs text-gray-600">
            <p>• Vérifiez que l'email est correct</p>
            <p>• Contactez votre administrateur si problème</p>
            <p>• Email support : admin@4aconsulting.ma</p>
          </div>
        </div>
      </div>
    </div>
  );
}
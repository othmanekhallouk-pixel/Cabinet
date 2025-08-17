import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from './components/Auth/AuthProvider';
import ClientsProvider from './components/Clients/ClientsProvider';
import MissionsProvider from './components/Missions/MissionsProvider';
import Login from './components/Auth/Login';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import CollaboratorDashboard from './components/Collaborator/CollaboratorDashboard';
import TimeTracker from './components/Time/TimeTracker';
import MissionsKanban from './components/Missions/MissionsKanban';
import MissionsManager from './components/Missions/MissionsManager';
import ClientsList from './components/Clients/ClientsList';
import DeadlinesCalendar from './components/Deadlines/DeadlinesCalendar';
import DeadlinesMatrix from './components/Deadlines/DeadlinesMatrix';
import TeamManagement from './components/Team/TeamManagement';
import CreateCollaborator from './components/Auth/CreateCollaborator';
import CreateMission from './components/Missions/CreateMission';
import CreateInvoice from './components/Billing/CreateInvoice';
import BillingManager from './components/Billing/BillingManager';
import ReportsManager from './components/Reports/ReportsManager';
import LeaveCalendar from './components/Leaves/LeaveCalendar';
import Settings from './components/Settings/Settings';
import DocumentsManager from './components/Documents/DocumentsManager';

function AppContent() {
  const { user, login, logout, isLoading, requestPasswordReset, resetPassword } = useAuth();
  const [showCreateMission, setShowCreateMission] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'forgot' | 'reset'>('login');
  const [resetToken, setResetToken] = useState('');

  const handleForgotPassword = () => {
    setAuthView('forgot');
  };

  const handleBackToLogin = () => {
    setAuthView('login');
  };

  const handlePasswordResetRequest = async (email: string) => {
    await requestPasswordReset(email);
    // En production, rediriger vers une page de confirmation
    // Ici on simule avec un token pour la démo
    const token = btoa(email + Date.now());
    setResetToken(token);
    setAuthView('reset');
  };

  const handlePasswordReset = async (password: string) => {
    await resetPassword(resetToken, password);
    setAuthView('login');
  };

  const handleCreateMission = (mission: any) => {
    console.log('Nouvelle mission créée:', mission);
    alert(`Mission "${mission.title}" créée avec succès !`);
    setShowCreateMission(false);
  };

  const handleCreateCollaborator = (collaborator: any) => {
    console.log('Nouveau collaborateur créé:', collaborator);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">4A</span>
          </div>
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (authView === 'forgot') {
      return (
        <ForgotPassword 
          onBack={handleBackToLogin}
          onResetRequest={handlePasswordResetRequest}
        />
      );
    }

    if (authView === 'reset') {
      return (
        <ResetPassword 
          token={resetToken}
          onResetComplete={handlePasswordReset}
          onBack={handleBackToLogin}
        />
      );
    }
    return <Login onLogin={login} onForgotPassword={handleForgotPassword} />;
  }

  // Dashboard spécifique selon le rôle
  const getDashboardComponent = () => {
    if (user.role === 'collaborator') {
      return <CollaboratorDashboard user={user} />;
    }
    return <Dashboard />;
  };

  return (
    <Layout user={user} onLogout={logout}>
      <Routes>
        <Route path="/" element={getDashboardComponent()} />
        <Route path="/clients" element={<ClientsList />} />
        <Route path="/missions" element={<MissionsManager />} />
        <Route path="/time" element={<TimeTracker />} />
        <Route path="/team" element={<TeamManagement />} />
        <Route path="/team/create" element={
          <CreateCollaborator 
            onSave={handleCreateCollaborator}
            onCancel={() => window.history.back()}
          />
        } />
        <Route path="/leaves" element={<LeaveCalendar />} />
        <Route path="/deadlines" element={<DeadlinesCalendar />} />
        <Route path="/deadlines-matrix" element={<DeadlinesMatrix />} />
        <Route path="/billing" element={<BillingManager />} />
        <Route path="/billing/invoice/create" element={<CreateInvoice />} />
        <Route path="/billing/quote/create" element={<CreateInvoice />} />
        <Route path="/billing/credit-note/create" element={<CreateInvoice />} />
        <Route path="/documents" element={<DocumentsManager />} />
        <Route path="/reports" element={<ReportsManager />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Modals */}
      {showCreateMission && (
        <CreateMission
          onSave={handleCreateMission}
          onCancel={() => setShowCreateMission(false)}
        />
      )}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <ClientsProvider>
        <MissionsProvider>
          <Router>
            <AppContent />
          </Router>
        </MissionsProvider>
      </ClientsProvider>
    </AuthProvider>
  );
}

export default App;
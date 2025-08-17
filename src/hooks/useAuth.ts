import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';

interface UserCredentials {
  userId: string;
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  register: (userData: Omit<User, 'id' | 'createdAt'>, password: string) => Promise<boolean>;
  getAllUsers: () => User[];
  resetUserPassword: (userId: string, newPassword: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Données utilisateurs par défaut - TOUJOURS PRÉSENTS
const getDefaultUsers = (): User[] => [
  {
    id: '1',
    firstName: 'Admin',
    lastName: 'System',
    email: 'admin@4aconsulting.ma',
    role: 'admin' as UserRole,
    team: 'Direction',
    internalCost: 800,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date()
  },
  {
    id: '2',
    firstName: 'Othmane',
    lastName: 'Manager',
    email: 'othmane@4aconsulting.ma',
    role: 'manager' as UserRole,
    team: 'Comptabilité',
    internalCost: 600,
    isActive: true,
    createdAt: new Date('2024-01-15'),
    lastLogin: new Date()
  },
  {
    id: '3',
    firstName: 'Fatima',
    lastName: 'Alami',
    email: 'fatima.alami@4aconsulting.ma',
    role: 'manager' as UserRole,
    team: 'Fiscal',
    internalCost: 600,
    isActive: true,
    createdAt: new Date('2024-01-10'),
    lastLogin: new Date()
  },
  {
    id: '4',
    firstName: 'Youssef',
    lastName: 'Tahiri',
    email: 'youssef.tahiri@4aconsulting.ma',
    role: 'collaborator' as UserRole,
    team: 'Comptabilité',
    internalCost: 400,
    isActive: true,
    createdAt: new Date('2024-01-05'),
    lastLogin: new Date()
  }
];

const getDefaultCredentials = (): UserCredentials[] => [
  { userId: '1', email: 'admin@4aconsulting.ma', password: 'admin123' },
  { userId: '2', email: 'othmane@4aconsulting.ma', password: 'othmane123' },
  { userId: '3', email: 'fatima.alami@4aconsulting.ma', password: 'manager123' },
  { userId: '4', email: 'youssef.tahiri@4aconsulting.ma', password: 'collab123' }
];

// Fonction pour charger les utilisateurs avec fallback
const loadUsers = (): User[] => {
  try {
    const saved = localStorage.getItem('users');
    if (saved) {
      const parsed = JSON.parse(saved);
      
      // Convertir les dates string en objets Date
      const usersWithDates = parsed.map((user: any) => ({
        ...user,
        createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
        lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined
      }));
      
      // Vérifier que Othmane est présent, sinon le rajouter
      const hasOthmane = usersWithDates.some((u: User) => u.email === 'othmane@4aconsulting.ma');
      if (!hasOthmane) {
        console.log('Othmane manquant, ajout automatique...');
        const defaultUsers = getDefaultUsers();
        const othmane = defaultUsers.find(u => u.email === 'othmane@4aconsulting.ma');
        if (othmane) {
          usersWithDates.push(othmane);
          localStorage.setItem('users', JSON.stringify(usersWithDates));
        }
      }
      return usersWithDates;
    }
  } catch (error) {
    console.error('Erreur chargement utilisateurs:', error);
  }
  return getDefaultUsers();
};

// Fonction pour charger les credentials avec fallback
const loadCredentials = (): UserCredentials[] => {
  try {
    const saved = localStorage.getItem('userCredentials');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Vérifier que les credentials d'Othmane sont présents
      const hasOthmaneCredentials = parsed.some((c: UserCredentials) => c.email === 'othmane@4aconsulting.ma');
      if (!hasOthmaneCredentials) {
        console.log('Credentials Othmane manquants, ajout automatique...');
        const defaultCredentials = getDefaultCredentials();
        const othmaneCredentials = defaultCredentials.find(c => c.email === 'othmane@4aconsulting.ma');
        if (othmaneCredentials) {
          parsed.push(othmaneCredentials);
          localStorage.setItem('userCredentials', JSON.stringify(parsed));
        }
      }
      return parsed;
    }
  } catch (error) {
    console.error('Erreur chargement credentials:', error);
  }
  return getDefaultCredentials();
};

export const useAuthLogic = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>(() => loadUsers());
  const [userCredentials, setUserCredentials] = useState<UserCredentials[]>(() => loadCredentials());

  // Sauvegarder automatiquement dans localStorage
  useEffect(() => {
    console.log('Sauvegarde utilisateurs:', users.length);
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    console.log('Sauvegarde credentials:', userCredentials.length);
    localStorage.setItem('userCredentials', JSON.stringify(userCredentials));
  }, [userCredentials]);

  // Vérifier si l'utilisateur est connecté au démarrage
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Erreur chargement utilisateur connecté:', error);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const credential = userCredentials.find(
      cred => cred.email === email && cred.password === password
    );
    
    if (credential) {
      const userData = users.find(u => u.id === credential.userId);
      if (userData) {
        // Mettre à jour la dernière connexion
        const updatedUser = { ...userData, lastLogin: new Date() };
        const updatedUsers = users.map(u => 
          u.id === userData.id ? updatedUser : u
        );
        
        setUsers(updatedUsers);
        setUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const register = async (userData: Omit<User, 'id' | 'createdAt'>, password: string): Promise<boolean> => {
    // Vérifier si l'email existe déjà
    const existingUser = userCredentials.find(cred => cred.email === userData.email);
    if (existingUser) {
      console.log('Email déjà existant:', userData.email);
      return false;
    }

    const newUserId = Date.now().toString();
    const newUser: User = {
      ...userData,
      id: newUserId,
      createdAt: new Date()
    };

    const newCredential: UserCredentials = {
      userId: newUserId,
      email: userData.email,
      password
    };

    console.log('=== AJOUT NOUVEL UTILISATEUR ===');
    console.log('Nouvel utilisateur:', newUser);
    console.log('Nouvelles credentials:', newCredential);

    // SAUVEGARDE IMMÉDIATE ET DIRECTE
    const newUsers = [...users, newUser];
    const newCredentials = [...userCredentials, newCredential];
    
    console.log('Utilisateurs avant:', users.length);
    console.log('Utilisateurs après:', newUsers.length);
    
    // Sauvegarder IMMÉDIATEMENT dans localStorage
    localStorage.setItem('users', JSON.stringify(newUsers));
    localStorage.setItem('userCredentials', JSON.stringify(newCredentials));
    
    // Puis mettre à jour les états
    setUsers(newUsers);
    setUserCredentials(newCredentials);
    
    console.log('=== SAUVEGARDE TERMINÉE ===');
    return true;
  };

  const getAllUsers = (): User[] => {
    return users;
  };

  const resetUserPassword = async (userId: string, newPassword: string): Promise<void> => {
    console.log('Réinitialisation mot de passe pour:', userId);
    
    const newCredentials = userCredentials.map(cred =>
      cred.userId === userId ? { ...cred, password: newPassword } : cred
    );
    
    // Sauvegarde immédiate
    localStorage.setItem('userCredentials', JSON.stringify(newCredentials));
    setUserCredentials(newCredentials);
    
    console.log('Mot de passe réinitialisé avec succès');
  };

  const requestPasswordReset = async (email: string): Promise<boolean> => {
    // Simuler l'envoi d'email de réinitialisation
    const userExists = userCredentials.some(cred => cred.email === email);
    console.log('Demande de réinitialisation pour:', email, 'Existe:', userExists);
    
    // Dans une vraie application, on enverrait un email ici
    // Pour la démo, on retourne toujours true pour des raisons de sécurité
    return true;
  };

  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    // Simuler la réinitialisation avec token
    console.log('Réinitialisation avec token:', token);
    // En production, on vérifierait le token et mettrait à jour le mot de passe
  };

  return {
    user,
    login,
    logout,
    isLoading,
    register,
    getAllUsers,
    resetUserPassword,
    requestPasswordReset,
    resetPassword
  };
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };
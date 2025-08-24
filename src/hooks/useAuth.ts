import { useState, useEffect, createContext, useContext } from 'react';
import { User, UserRole } from '../types';
import { mockUsers } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: Partial<User>, password: string) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  resetUserPassword: (userId: string, newPassword: string) => Promise<void>;
  getAllUsers: () => User[];
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthLogic = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialiser les utilisateurs avec Othmane
  const initializeUsers = () => {
    const savedUsers = localStorage.getItem('users');
    let users = savedUsers ? JSON.parse(savedUsers) : mockUsers;
    
    // Vérifier si Othmane existe
    const othmanExists = users.some((u: User) => u.email === 'othmane@4aconsulting.ma');
    if (!othmanExists) {
      const othmane: User = {
        id: 'othmane-001',
        email: 'othmane@4aconsulting.ma',
        firstName: 'Othmane',
        lastName: 'Benali',
        role: 'manager',
        team: 'Direction',
        internalCost: 700,
        isActive: true,
        lastLogin: new Date('2024-01-15T10:00:00'),
      };
      users.push(othmane);
      localStorage.setItem('users', JSON.stringify(users));
      console.log('✅ Othmane ajouté automatiquement');
    }
    
    return users;
  };

  const [allUsers, setAllUsers] = useState<User[]>(() => initializeUsers());

  useEffect(() => {
    // Vérifier si un utilisateur est connecté
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Convertir les dates
        if (parsedUser.lastLogin) {
          parsedUser.lastLogin = new Date(parsedUser.lastLogin);
        }
        setUser(parsedUser);
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
        localStorage.removeItem('currentUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    console.log('=== TENTATIVE DE CONNEXION ===');
    console.log('Email:', email);
    console.log('Utilisateurs disponibles:', allUsers.map(u => ({ email: u.email, role: u.role })));
    
    // Comptes de démonstration
    const demoAccounts = {
      'admin@4aconsulting.ma': 'admin123',
      'othmane@4aconsulting.ma': 'othmane123',
      'fatima.alami@4aconsulting.ma': 'manager123',
      'youssef.tahiri@4aconsulting.ma': 'collab123'
    };

    const foundUser = allUsers.find(u => u.email === email);
    
    if (foundUser && (demoAccounts[email as keyof typeof demoAccounts] === password || password === 'demo123')) {
      const userWithLogin = {
        ...foundUser,
        lastLogin: new Date()
      };
      
      // Mettre à jour la dernière connexion
      const updatedUsers = allUsers.map(u => 
        u.id === foundUser.id ? userWithLogin : u
      );
      setAllUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      setUser(userWithLogin);
      localStorage.setItem('currentUser', JSON.stringify(userWithLogin));
      
      console.log('✅ Connexion réussie pour:', foundUser.firstName, foundUser.lastName);
    } else {
      console.log('❌ Échec de connexion - utilisateur non trouvé ou mot de passe incorrect');
      throw new Error('Email ou mot de passe incorrect');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const register = async (userData: Partial<User>, password: string): Promise<boolean> => {
    try {
      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email!,
        firstName: userData.firstName!,
        lastName: userData.lastName!,
        role: userData.role!,
        team: userData.team,
        internalCost: userData.internalCost!,
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        lastLogin: undefined,
      };

      const updatedUsers = [...allUsers, newUser];
      setAllUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      // Sauvegarder le mot de passe (en production, ceci serait géré côté serveur)
      const passwords = JSON.parse(localStorage.getItem('passwords') || '{}');
      passwords[newUser.email] = password;
      localStorage.setItem('passwords', JSON.stringify(passwords));

      console.log('✅ Utilisateur créé:', newUser);
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la création:', error);
      return false;
    }
  };

  const requestPasswordReset = async (email: string) => {
    console.log('Demande de réinitialisation pour:', email);
    // Simulation d'envoi d'email
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const resetPassword = async (token: string, password: string) => {
    console.log('Réinitialisation du mot de passe avec token:', token);
    // Simulation de réinitialisation
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const resetUserPassword = async (userId: string, newPassword: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
      const passwords = JSON.parse(localStorage.getItem('passwords') || '{}');
      passwords[user.email] = newPassword;
      localStorage.setItem('passwords', JSON.stringify(passwords));
      console.log('✅ Mot de passe réinitialisé pour:', user.email);
    }
  };

  const getAllUsers = () => allUsers;

  return {
    user,
    login,
    logout,
    register,
    requestPasswordReset,
    resetPassword,
    resetUserPassword,
    getAllUsers,
    isLoading
  };
};
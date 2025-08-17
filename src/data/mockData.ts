import { Client, Mission, User, TimeEntry, LeaveRequest, Deadline, DashboardStats } from '../types';

export const mockProjects = [
  {
    id: '1',
    clientId: '1',
    name: 'Gestion Comptable 2024',
    description: 'Tenue comptable complète pour l\'exercice 2024',
    status: 'active' as const,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    managerId: '2',
    missions: [],
    progress: 65,
    isCompleted: false,
    createdAt: new Date('2023-12-15'),
    updatedAt: new Date('2024-01-15'),
  },
];

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@4aconsulting.ma',
    firstName: 'Ahmed',
    lastName: 'Bennani',
    role: 'admin',
    team: 'Direction',
    internalCost: 800,
    isActive: true,
    lastLogin: new Date('2024-01-15T09:00:00'),
  },
  {
    id: '2',
    email: 'fatima.alami@4aconsulting.ma',
    firstName: 'Fatima',
    lastName: 'Alami',
    role: 'manager',
    team: 'Fiscal',
    internalCost: 600,
    isActive: true,
    lastLogin: new Date('2024-01-15T08:30:00'),
  },
  {
    id: '3',
    email: 'youssef.tahiri@4aconsulting.ma',
    firstName: 'Youssef',
    lastName: 'Tahiri',
    role: 'collaborator',
    team: 'Comptabilité',
    internalCost: 400,
    isActive: true,
    lastLogin: new Date('2024-01-15T09:15:00'),
  },
];

export const mockClients: Client[] = [
  {
    id: '1',
    companyName: 'TechnoMaroc SARL',
    rc: '123456',
    ice: '001234567890123',
    if: '12345678',
    cnss: '1234567',
    vatRegime: 'normal',
    vatPeriodicity: 'monthly',
    fiscalYear: '2024',
    contacts: [
      {
        id: '1',
        firstName: 'Hassan',
        lastName: 'Kettani',
        email: 'h.kettani@technomaroc.ma',
        phone: '+212 5 22 34 56 78',
        position: 'Directeur Général',
        isPrimary: true,
      },
    ],
    address: {
      street: '123 Boulevard Mohammed V',
      city: 'Casablanca',
      postalCode: '20000',
      country: 'Maroc',
    },
    sector: 'Technologie',
    isFreeZone: false,
    currency: 'MAD',
    createdAt: new Date('2023-06-01'),
    isActive: true,
    contracts: [
      {
        id: '1',
        clientId: '1',
        name: 'Contrat Comptabilité 2024',
        type: 'accounting',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        items: [
          {
            id: '1',
            description: 'Tenue de comptabilité mensuelle',
            type: 'fixed',
            amount: 3000,
          },
          {
            id: '2',
            description: 'Conseil fiscal',
            type: 'unit_price',
            amount: 500,
            unit: 'heure',
          }
        ],
        totalAmount: 3000,
        currency: 'MAD',
        status: 'active',
        createdAt: new Date('2023-12-01'),
      }
    ],
  },
  {
    id: '2',
    companyName: 'AtlasExport SA',
    rc: '789012',
    ice: '001789012345678',
    if: '87901234',
    cnss: '7890123',
    vatRegime: 'normal',
    vatPeriodicity: 'quarterly',
    fiscalYear: '2024',
    contacts: [
      {
        id: '2',
        firstName: 'Aicha',
        lastName: 'Benali',
        email: 'a.benali@atlasexport.ma',
        phone: '+212 5 37 12 34 56',
        position: 'Directrice Financière',
        isPrimary: true,
      },
    ],
    address: {
      street: '45 Avenue des FAR',
      city: 'Rabat',
      postalCode: '10000',
      country: 'Maroc',
    },
    sector: 'Export',
    isFreeZone: true,
    currency: 'EUR',
    createdAt: new Date('2023-08-15'),
    isActive: true,
    contracts: [
      {
        id: '2',
        clientId: '2',
        name: 'Contrat Paie 2024',
        type: 'payroll',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-10'),
        items: [
          {
            id: '3',
            description: 'Paie mensuelle',
            type: 'tiered',
            amount: 2000,
            tiers: [
              { from: 1, to: 20, price: 2000 },
              { from: 21, price: 30 }
            ]
          }
        ],
        totalAmount: 2000,
        currency: 'MAD',
        status: 'active',
        createdAt: new Date('2023-12-01'),
      }
    ],
  },
];

export const mockMissions: Mission[] = [
  {
    id: '1',
    clientId: '1',
    title: 'Déclaration TVA Janvier 2024',
    description: 'Préparation et dépôt de la déclaration TVA mensuelle',
    type: 'vat',
    status: 'in_progress',
    priority: 'high',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-02-01'),
    managerId: '2',
    assignedTo: ['3'],
    tasks: [],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    clientId: '2',
    title: 'Audit Comptable Q4 2023',
    description: 'Révision des comptes du quatrième trimestre',
    type: 'audit',
    status: 'pending',
    priority: 'medium',
    budgetHours: 40,
    consumedHours: 35,
    startDate: new Date('2024-01-05'),
    endDate: new Date('2024-01-25'),
    managerId: '2',
    assignedTo: ['3'],
    tasks: [],
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-15'),
  },
];

export const mockTimeEntries: TimeEntry[] = [
  {
    id: '1',
    userId: '3',
    clientId: '1',
    missionId: '1',
    startTime: new Date('2024-01-15T09:00:00'),
    endTime: new Date('2024-01-15T12:30:00'),
    duration: 210, // 3.5 hours in minutes
    breakDuration: 15,
    description: 'Saisie des écritures comptables',
    tags: ['saisie', 'comptabilité'],
    status: 'approved',
    isRunning: false,
    createdAt: new Date('2024-01-15T12:30:00'),
  },
];

export const mockLeaveRequests: LeaveRequest[] = [
  {
    id: '1',
    userId: '3',
    type: 'vacation',
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-02-05'),
    days: 5,
    reason: 'Congés annuels',
    status: 'approved',
    approverId: '2',
    approvedAt: new Date('2024-01-10'),
    createdAt: new Date('2024-01-08'),
  },
];

export const mockDeadlines: Deadline[] = [
  {
    id: '1',
    clientId: '1',
    type: 'vat',
    title: 'Déclaration TVA Janvier 2024',
    description: 'Dépôt déclaration TVA mensuelle',
    dueDate: new Date('2024-02-20'),
    period: 'Janvier 2024',
    status: 'in_progress',
    priority: 'high',
    assignedTo: '3',
    documents: [],
    alerts: [],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    clientId: '2',
    type: 'corporate_tax',
    title: 'Acompte IS Q1 2024',
    description: 'Paiement acompte impôt sur les sociétés',
    dueDate: new Date('2024-03-31'),
    period: 'Q1 2024',
    status: 'pending',
    priority: 'medium',
    assignedTo: '2',
    documents: [],
    alerts: [],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '3',
    clientId: '1',
    type: 'cnss',
    title: 'Déclaration CNSS Janvier 2024',
    description: 'Déclaration mensuelle CNSS',
    dueDate: new Date('2024-02-15'),
    period: 'Janvier 2024',
    status: 'overdue',
    priority: 'urgent',
    assignedTo: '3',
    documents: ['doc1.pdf'],
    alerts: [],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '4',
    clientId: '2',
    type: 'income_tax',
    title: 'IR Salaires Janvier 2024',
    description: 'Déclaration IR sur salaires',
    dueDate: new Date('2024-02-28'),
    period: 'Janvier 2024',
    status: 'completed',
    priority: 'medium',
    assignedTo: '2',
    documents: ['ir_jan.pdf', 'attestation.pdf'],
    alerts: [],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-10'),
  },
  {
    id: '5',
    clientId: '1',
    type: 'vat',
    title: 'Déclaration TVA Février 2024',
    description: 'Dépôt déclaration TVA mensuelle',
    dueDate: new Date('2024-03-20'),
    period: 'Février 2024',
    status: 'pending',
    priority: 'high',
    assignedTo: '3',
    documents: [],
    alerts: [],
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15'),
  },
];

// Hook pour gérer les clients avec persistance
export const useClients = () => {
  const [clients, setClients] = React.useState(() => {
    const savedClients = localStorage.getItem('clients');
    return savedClients ? JSON.parse(savedClients) : mockClients;
  });

  React.useEffect(() => {
    localStorage.setItem('clients', JSON.stringify(clients));
  }, [clients]);

  return { clients, setClients };
};

export const mockDashboardStats: DashboardStats = {
  totalClients: 45,
  activeMissions: 12,
  pendingDeadlines: 8,
  teamUtilization: 78,
  revenue: 245000,
  hoursLogged: 1240,
  overdueDeadlines: 2,
  completedMissions: 156,
};
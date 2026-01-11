// Core data types for the application

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  team?: string;
  internalCost: number;
  isActive: boolean;
  lastLogin?: Date;
  avatar?: string;
}

export type UserRole = 'admin' | 'manager' | 'collaborator' | 'quality_control' | 'client';

export interface Client {
  id: string;
  companyName: string;
  rc: string; // Registre de Commerce
  ice: string; // Identifiant Commun de l'Entreprise
  if: string; // Identifiant Fiscal
  cnss: string; // Numéro CNSS
  vatRegime: VATRegime;
  vatPeriodicity: 'monthly' | 'quarterly';
  fiscalYearStart: Date; // Début année fiscale
  fiscalYearEnd: Date; // Fin année fiscale
  contacts: Contact[];
  address: Address;
  sector: string;
  isFreeZone: boolean;
  currency: string;
  createdAt: Date;
  isActive: boolean;
  contracts: Contract[];
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string;
  isPrimary: boolean;
}

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export type VATRegime = 'normal' | 'simplified' | 'exempt';

export interface Contract {
  id: string;
  clientId: string;
  name: string;
  type: 'accounting' | 'consulting' | 'payroll' | 'mixed';
  startDate: Date;
  endDate?: Date;
  items: ContractItem[];
  totalAmount: number;
  currency: string;
  status: 'active' | 'inactive' | 'expired';
  createdAt: Date;
}

export interface ContractItem {
  id: string;
  description: string;
  type: 'fixed' | 'unit_price' | 'tiered';
  amount: number;
  quantity?: number;
  unit?: string;
  tiers?: ContractTier[];
}

export interface ContractTier {
  from: number;
  to?: number;
  price: number;
}

export interface Mission {
  id: string;
  clientId: string;
  projectId?: string;
  title: string;
  description: string;
  type: MissionType;
  status: MissionStatus;
  priority: Priority;
  startDate: Date;
  endDate: Date;
  dateFin?: Date;
  progression: number; // 0-100%
  budgetHours: number;
  consumedHours: number;
  managerId: string;
  assignedTo: string[];
  tags: string[];
  isLocked: boolean;
  tasks: Task[];
  attachments: string[];
  comments: MissionComment[];
  history: HistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export type MissionType = 'accounting' | 'vat' | 'corporate_tax' | 'income_tax' | 'cnss' | 'payroll' | 'audit' | 'legal' | 'incorporation';

export type MissionStatus = 'todo' | 'in_progress' | 'review' | 'client_waiting' | 'completed';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  missionId: string;
  title: string;
  description?: string;
  endDate?: Date;
  dateFin?: Date;
  assignedTo: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: Priority;
  estimatedHours: number;
  actualHours: number;
  tags: string[];
  checklist?: ChecklistItem[];
  comments?: TaskComment[];
  attachments?: string[];
  history: HistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MissionComment {
  id: string;
  userId: string;
  text: string;
  createdAt: Date;
}

export interface HistoryEntry {
  id: string;
  action: string;
  userId: string;
  details: string;
  createdAt: Date;
}

export interface SavedView {
  id: string;
  name: string;
  filters: {
    status?: MissionStatus[];
    priority?: Priority[];
    clientId?: string;
    responsableId?: string;
    tags?: string[];
    dateRange?: { start: Date; end: Date };
  };
  userId: string;
}
export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskComment {
  id: string;
  userId: string;
  text: string;
  createdAt: Date;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: Date;
  endDate: Date;
  managerId: string;
  missions: Mission[];
  progress: number; // 0-100%
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectStatus = 'planned' | 'active' | 'on_hold' | 'completed' | 'cancelled';

export interface TimeEntry {
  id: string;
  userId: string;
  clientId: string;
  missionId: string;
  taskId?: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  breakDuration: number; // in minutes
  description: string;
  tags: string[];
  status: TimeEntryStatus;
  isRunning: boolean;
  createdAt: Date;
}

export type TimeEntryStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  userId: string;
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  days: number;
  reason?: string;
  status: LeaveStatus;
  approverId?: string;
  approvedAt?: Date;
  createdAt: Date;
}

export type LeaveType = 'vacation' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'rtt' | 'marriage' | 'exceptional';
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface BreakEntry {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  type: BreakType;
  isActive: boolean;
  createdAt: Date;
}

export type BreakType = 'lunch' | 'coffee' | 'personal' | 'meeting';

export interface Deadline {
  id: string;
  clientId: string;
  type: DeadlineType;
  title: string;
  description?: string;
  dueDate: Date;
  period: string; // e.g., "Q1 2024", "January 2024"
  status: DeadlineStatus;
  priority: Priority;
  assignedTo: string;
  documents: string[];
  alerts: Alert[];
  createdAt: Date;
  updatedAt: Date;
}

export type DeadlineType =
  | 'vat' | 'corporate_tax' | 'income_tax' | 'cnss' | 'amo' | 'cimr';

export type DeadlineStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';

export interface Quote {
  id: string;
  clientId: string;
  quoteNumber: string;
  date: Date;
  validUntil: Date;
  currency: 'MAD' | 'EUR' | 'USD';
  items: InvoiceItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  template: InvoiceTemplate;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreditNote {
  id: string;
  clientId: string;
  originalInvoiceId: string;
  creditNoteNumber: string;
  date: Date;
  currency: 'MAD' | 'EUR' | 'USD';
  items: InvoiceItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  reason: string;
  status: 'draft' | 'sent' | 'processed';
  template: InvoiceTemplate;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  clientId: string;
  projectId?: string;
  invoiceNumber: string;
  date: Date;
  dueDate: Date;
  currency: 'MAD' | 'EUR' | 'USD';
  items: InvoiceItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  status: InvoiceStatus;
  template: InvoiceTemplate;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  vatRate?: number;
  isExpense?: boolean;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceTemplate {
  id: string;
  name: string;
  logo?: string;
  header: string;
  footer: string;
  colors: {
    primary: string;
    secondary: string;
  };
}

export interface Alert {
  id: string;
  type: 'deadline' | 'overdue' | 'approval' | 'system';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  targetDate: Date;
  isRead: boolean;
  createdAt: Date;
}

export interface Document {
  id: string;
  clientId: string;
  missionId?: string;
  name: string;
  type: string;
  size: number;
  url: string;
  version: number;
  uploadedBy: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalClients: number;
  activeMissions: number;
  pendingDeadlines: number;
  teamUtilization: number;
  revenue: number;
  hoursLogged: number;
  overdueDeadlines: number;
  completedMissions: number;
}
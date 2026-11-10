import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  BusinessProfile,
  ServiceItem,
  Lead,
  Client,
  Quotation,
  Project,
  Invoice,
  Payment,
  Expense,
  DocumentRecord,
  SupportTicket,
  ActivityLog,
  AutomationRule,
  AutomationLog,
  Conversation,
  OnboardingForm,
  PlatformView,
  LeadStatus,
  ProjectStage,
  TicketStatus,
  Milestone,
  EmailSettings,
  WhatsAppSettings,
  AISettings,
  PaymentGatewaySettings,
  VoiceActionRecord,
} from '../types';
import {
  initialBusinessProfile,
  initialServices,
  initialLeads,
  initialClients,
  initialQuotations,
  initialProjects,
  initialInvoices,
  initialPayments,
  initialExpenses,
  initialDocuments,
  initialSupportTickets,
  initialConversations,
  initialAutomationRules,
  initialAutomationLogs,
  initialActivities,
  initialOnboardingForms,
  initialEmailSettings,
  initialWhatsAppSettings,
  initialAISettings,
  initialPaymentGatewaySettings,
  initialVoiceActions,
} from '../data/mockData';

interface FinancialSummary {
  quotedAmount: number;
  contractedAmount: number;
  invoicedAmount: number;
  collectedAmount: number;
  outstandingAmount: number;
  totalExpenses: number;
  netProfit: number;
}

export interface BreadcrumbItem {
  tab: string;
  tabLabel: string;
  recordId: string | null;
  recordLabel?: string;
}

interface BusinessContextType {
  // Navigation & Platform View
  platformView: PlatformView;
  setPlatformView: (view: PlatformView) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedRecordIds: Record<string, string | null>;
  setSelectedRecordForTab: (tab: string, recordId: string | null, recordLabel?: string) => void;
  navigateToRecord: (
    targetTab: string,
    targetRecordId: string | null,
    targetRecordLabel?: string,
    fromCrumb?: BreadcrumbItem
  ) => void;
  breadcrumbs: BreadcrumbItem[];
  navigateToBreadcrumb: (index: number) => void;
  selectedClientIdForPortal: string;
  setSelectedClientIdForPortal: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  moduleFilter: string;
  setModuleFilter: (f: string) => void;

  // Data collections
  profile: BusinessProfile;
  updateProfile: (profile: BusinessProfile) => void;
  services: ServiceItem[];
  leads: Lead[];
  clients: Client[];
  quotations: Quotation[];
  projects: Project[];
  invoices: Invoice[];
  payments: Payment[];
  expenses: Expense[];
  documents: DocumentRecord[];
  tickets: SupportTicket[];
  conversations: Conversation[];
  automationRules: AutomationRule[];
  automationLogs: AutomationLog[];
  activities: ActivityLog[];
  onboardingForms: OnboardingForm[];

  // Financial metrics
  financials: FinancialSummary;
  formatCurrency: (amount: number) => string;
  formatCompactCurrency: (amount: number) => string;

  // Services Catalog Actions
  createService: (service: Omit<ServiceItem, 'id'>) => ServiceItem;
  updateService: (serviceId: string, updates: Partial<ServiceItem>) => void;
  deleteService: (serviceId: string) => void;

  // Core Business Actions
  createLead: (lead: Omit<Lead, 'id' | 'dateReceived'>) => void;
  updateLeadStatus: (leadId: string, status: LeadStatus) => void;
  convertLeadToClient: (leadId: string) => Client | null;
  deleteLead: (leadId: string) => void;

  deleteClient: (clientId: string) => void;

  createQuotation: (quote: Omit<Quotation, 'id' | 'quotationNumber' | 'version' | 'revisions'>) => void;
  createQuotationRevision: (quotationId: string, reason: string, updatedItems: Quotation['items']) => void;
  acceptQuotation: (quotationId: string, clientComment?: string) => void;
  rejectQuotation: (quotationId: string, reason?: string) => void;
  deleteQuotation: (quotationId: string) => void;

  createInvoice: (inv: Omit<Invoice, 'id' | 'invoiceNumber' | 'paidAmount' | 'balanceDue'>) => void;
  recordPayment: (payment: Omit<Payment, 'id' | 'receiptNumber'>) => void;
  sendPaymentReminder: (invoiceId: string) => void;
  deleteInvoice: (invoiceId: string) => void;

  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (expenseId: string) => void;

  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'progressPercent' | 'tasks' | 'changeRequests'>) => void;
  updateProjectStage: (projectId: string, stage: ProjectStage) => void;
  toggleMilestoneStatus: (projectId: string, milestoneId: string) => void;
  addTask: (projectId: string, task: { title: string; priority: 'Low' | 'Medium' | 'High' | 'Urgent'; dueDate: string; milestoneId?: string }) => void;
  toggleTaskStatus: (projectId: string, taskId: string) => void;
  submitChangeRequest: (projectId: string, request: { title: string; description: string; costImpact: number; timelineImpactDays: number; requestedBy: string }) => void;
  reviewChangeRequest: (projectId: string, requestId: string, approved: boolean, notes?: string) => void;

  submitSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'dateSubmitted' | 'lastUpdated' | 'status'>) => void;
  updateTicketStatus: (ticketId: string, status: TicketStatus, resolution?: string) => void;

  toggleWhatsAppHandover: (conversationId: string) => void;
  sendWhatsAppMessage: (conversationId: string, text: string, senderOverride?: 'human' | 'client') => void;

  // Integration settings & Environment variables
  emailSettings: EmailSettings;
  updateEmailSettings: (settings: EmailSettings) => void;
  sendTestEmail: (recipient: string) => Promise<{ success: boolean; message: string }>;
  whatsAppSettings: WhatsAppSettings;
  updateWhatsAppSettings: (settings: WhatsAppSettings) => void;
  aiSettings: AISettings;
  updateAISettings: (settings: AISettings) => void;
  paymentSettings: PaymentGatewaySettings;
  updatePaymentSettings: (settings: PaymentGatewaySettings) => void;
  voiceActions: VoiceActionRecord[];
  processVoiceCommand: (transcript: string) => { success: boolean; summary: string; intent: string };
  recordVoiceMilestoneUpdate: (projectId: string, milestoneId: string, voiceTranscript: string) => void;

  toggleAutomationRule: (ruleId: string) => void;
  submitOnboardingForm: (formId: string, data: Record<string, string>) => void;
  resetToSampleData: () => void;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

const STORAGE_PREFIX = 'freelance_os_v1_';

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [platformView, setPlatformView] = useState<PlatformView>('desktop');
  const [activeTab, setActiveTabState] = useState<string>('dashboard');
  const [selectedRecordIds, setSelectedRecordIds] = useState<Record<string, string | null>>({});
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [selectedClientIdForPortal, setSelectedClientIdForPortal] = useState<string>('client-1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [moduleFilter, setModuleFilter] = useState<string>('all');

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    setSelectedRecordIds((prev) => ({ ...prev, [tab]: null }));
    setBreadcrumbs([]);
    setSearchQuery('');
    setModuleFilter('all');
  };

  const setSelectedRecordForTab = (tab: string, recordId: string | null) => {
    setSelectedRecordIds((prev) => ({ ...prev, [tab]: recordId }));
    if (recordId === null) {
      setBreadcrumbs((prev) => prev.filter((b) => b.tab !== tab));
    }
  };

  const navigateToRecord = (
    targetTab: string,
    targetRecordId: string | null,
    _targetRecordLabel?: string,
    fromCrumb?: BreadcrumbItem
  ) => {
    if (fromCrumb) {
      setBreadcrumbs((prev) => {
        const existingIdx = prev.findIndex(
          (b) => b.tab === fromCrumb.tab && b.recordId === fromCrumb.recordId
        );
        if (existingIdx >= 0) {
          return prev.slice(0, existingIdx + 1);
        }
        return [...prev, fromCrumb];
      });
    }
    setSelectedRecordIds((prev) => ({ ...prev, [targetTab]: targetRecordId }));
    setActiveTabState(targetTab);
    setSearchQuery('');
    setModuleFilter('all');
  };

  const navigateToBreadcrumb = (index: number) => {
    const target = breadcrumbs[index];
    if (!target) return;
    setBreadcrumbs((prev) => prev.slice(0, index));
    setSelectedRecordIds((prev) => ({ ...prev, [target.tab]: target.recordId }));
    setActiveTabState(target.tab);
  };

  // Load from localStorage or defaults
  const loadState = <T,>(key: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + key);
      return saved ? JSON.parse(saved) : fallback;
    } catch {
      return fallback;
    }
  };

  const [profile, setProfile] = useState<BusinessProfile>(() => loadState('profile', initialBusinessProfile));
  const [services, setServices] = useState<ServiceItem[]>(() => loadState('services', initialServices));
  const [leads, setLeads] = useState<Lead[]>(() => loadState('leads', initialLeads));
  const [clients, setClients] = useState<Client[]>(() => loadState('clients', initialClients));
  const [quotations, setQuotations] = useState<Quotation[]>(() => loadState('quotations', initialQuotations));
  const [projects, setProjects] = useState<Project[]>(() => loadState('projects', initialProjects));
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadState('invoices', initialInvoices));
  const [payments, setPayments] = useState<Payment[]>(() => loadState('payments', initialPayments));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadState('expenses', initialExpenses));
  const [documents, setDocuments] = useState<DocumentRecord[]>(() => loadState('documents', initialDocuments));
  const [tickets, setTickets] = useState<SupportTicket[]>(() => loadState('tickets', initialSupportTickets));
  const [conversations, setConversations] = useState<Conversation[]>(() => loadState('conversations', initialConversations));
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>(() => loadState('rules', initialAutomationRules));
  const [automationLogs, setAutomationLogs] = useState<AutomationLog[]>(() => loadState('autologs', initialAutomationLogs));
  const [activities, setActivities] = useState<ActivityLog[]>(() => loadState('activities', initialActivities));
  const [onboardingForms, setOnboardingForms] = useState<OnboardingForm[]>(() => loadState('forms', initialOnboardingForms));
  const [emailSettings, setEmailSettings] = useState<EmailSettings>(() => loadState('email_settings', initialEmailSettings));
  const [whatsAppSettings, setWhatsAppSettings] = useState<WhatsAppSettings>(() => loadState('whatsapp_settings', initialWhatsAppSettings));
  const [aiSettings, setAISettings] = useState<AISettings>(() => loadState('ai_settings', initialAISettings));
  const [paymentSettings, setPaymentSettings] = useState<PaymentGatewaySettings>(() => loadState('payment_settings', initialPaymentGatewaySettings));
  const [voiceActions, setVoiceActions] = useState<VoiceActionRecord[]>(() => loadState('voice_actions', initialVoiceActions));

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PREFIX + 'profile', JSON.stringify(profile));
      localStorage.setItem(STORAGE_PREFIX + 'services', JSON.stringify(services));
      localStorage.setItem(STORAGE_PREFIX + 'leads', JSON.stringify(leads));
      localStorage.setItem(STORAGE_PREFIX + 'clients', JSON.stringify(clients));
      localStorage.setItem(STORAGE_PREFIX + 'quotations', JSON.stringify(quotations));
      localStorage.setItem(STORAGE_PREFIX + 'projects', JSON.stringify(projects));
      localStorage.setItem(STORAGE_PREFIX + 'invoices', JSON.stringify(invoices));
      localStorage.setItem(STORAGE_PREFIX + 'payments', JSON.stringify(payments));
      localStorage.setItem(STORAGE_PREFIX + 'expenses', JSON.stringify(expenses));
      localStorage.setItem(STORAGE_PREFIX + 'documents', JSON.stringify(documents));
      localStorage.setItem(STORAGE_PREFIX + 'tickets', JSON.stringify(tickets));
      localStorage.setItem(STORAGE_PREFIX + 'conversations', JSON.stringify(conversations));
      localStorage.setItem(STORAGE_PREFIX + 'rules', JSON.stringify(automationRules));
      localStorage.setItem(STORAGE_PREFIX + 'autologs', JSON.stringify(automationLogs));
      localStorage.setItem(STORAGE_PREFIX + 'activities', JSON.stringify(activities));
      localStorage.setItem(STORAGE_PREFIX + 'forms', JSON.stringify(onboardingForms));
      localStorage.setItem(STORAGE_PREFIX + 'email_settings', JSON.stringify(emailSettings));
      localStorage.setItem(STORAGE_PREFIX + 'whatsapp_settings', JSON.stringify(whatsAppSettings));
      localStorage.setItem(STORAGE_PREFIX + 'ai_settings', JSON.stringify(aiSettings));
      localStorage.setItem(STORAGE_PREFIX + 'payment_settings', JSON.stringify(paymentSettings));
      localStorage.setItem(STORAGE_PREFIX + 'voice_actions', JSON.stringify(voiceActions));
    } catch (e) {
      console.warn('Storage sync error:', e);
    }
  }, [profile, services, leads, clients, quotations, projects, invoices, payments, expenses, documents, tickets, conversations, automationRules, automationLogs, activities, onboardingForms, emailSettings, whatsAppSettings, aiSettings, paymentSettings, voiceActions]);

  // Currency formatting helper (Symbol-first: NGN formats with ₦ symbol, never text 'NGN')
  const formatCurrency = (amount: number): string => {
    const val = amount || 0;
    const curr = profile.currency || 'NGN';
    const sym = profile.currencySymbol || (curr === 'NGN' ? '₦' : curr === 'USD' ? '$' : curr === 'EUR' ? '€' : curr === 'GBP' ? '£' : '$');

    if (curr === 'NGN' || sym === '₦') {
      return `₦${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: curr,
        currencyDisplay: 'narrowSymbol',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(val);
    } catch {
      return `${sym}${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  // Compact currency formatter for mobile and dashboard summary cards (e.g. ₦24.3K, ₦1.2M)
  const formatCompactCurrency = (amount: number): string => {
    const val = amount || 0;
    const curr = profile.currency || 'NGN';
    const sym = curr === 'NGN' ? '₦' : profile.currencySymbol || '$';

    if (Math.abs(val) >= 1_000_000) {
      return `${sym}${(val / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    }
    if (Math.abs(val) >= 1_000) {
      return `${sym}${(val / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
    }
    return `${sym}${val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  // Financial Calculations (Deterministic & Strictly Segregated)
  const financials: FinancialSummary = React.useMemo(() => {
    // 1. Quoted: All sent/accepted/viewed quotations
    const quotedAmount = quotations
      .filter((q) => q.status !== 'Rejected' && q.status !== 'Superseded')
      .reduce((sum, q) => sum + q.totalAmount, 0);

    // 2. Contracted: Sum of project contract values
    const contractedAmount = projects.reduce((sum, p) => sum + p.contractValue, 0);

    // 3. Invoiced: Issued invoices (exclude draft & cancelled)
    const invoicedAmount = invoices
      .filter((i) => i.status !== 'Draft' && i.status !== 'Cancelled')
      .reduce((sum, i) => sum + i.totalAmount, 0);

    // 4. Collected: Total recorded payments
    const collectedAmount = payments.reduce((sum, p) => sum + p.amount, 0);

    // 5. Outstanding: Non-cancelled invoice balances
    const outstandingAmount = invoices
      .filter((i) => i.status !== 'Draft' && i.status !== 'Cancelled' && i.status !== 'Paid')
      .reduce((sum, i) => sum + i.balanceDue, 0);

    // Total expenses
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Recognized Net Profit = Collected Revenue - Total Business Expenses
    const netProfit = collectedAmount - totalExpenses;

    return {
      quotedAmount,
      contractedAmount,
      invoicedAmount,
      collectedAmount,
      outstandingAmount,
      totalExpenses,
      netProfit,
    };
  }, [quotations, projects, invoices, payments, expenses]);

  const addActivity = (event: string, details: string, category: ActivityLog['category']) => {
    const newAct: ActivityLog = {
      id: 'act-' + Date.now(),
      event,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      category,
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  const updateProfile = (updated: BusinessProfile) => {
    const newVatRate = typeof updated.taxRate === 'number' && !isNaN(updated.taxRate) ? updated.taxRate : 0;
    setProfile({ ...updated, taxRate: newVatRate });

    // Propagate updated VAT rate variable to invoices and quotations so previews always hold proper VAT rate & math
    setInvoices((prev) =>
      prev.map((inv) => {
        const subtotal = inv.subtotal;
        const taxAmount = Number(((subtotal * newVatRate) / 100).toFixed(2));
        const totalAmount = Number((subtotal + taxAmount).toFixed(2));
        const paidAmount = inv.status === 'Paid' ? totalAmount : inv.paidAmount;
        const balanceDue = Math.max(0, Number((totalAmount - paidAmount).toFixed(2)));
        return {
          ...inv,
          taxRate: newVatRate,
          items: inv.items.map((item) => ({ ...item, taxPercent: newVatRate })),
          taxAmount,
          totalAmount,
          paidAmount,
          balanceDue,
        };
      })
    );

    setQuotations((prev) =>
      prev.map((q) => {
        const subtotal = q.subtotal;
        const taxAmount = Number(((subtotal * newVatRate) / 100).toFixed(2));
        const totalAmount = Number((subtotal + taxAmount - (q.discount || 0)).toFixed(2));
        return {
          ...q,
          taxRate: newVatRate,
          items: q.items.map((item) => ({ ...item, taxPercent: newVatRate })),
          taxAmount,
          totalAmount,
        };
      })
    );

    addActivity('Profile & VAT Variable Updated', `Business variables updated (VAT Rate: ${newVatRate}%, Currency: ${updated.currency})`, 'crm');
  };

  // Service Catalog Actions
  const createService = (newServiceData: Omit<ServiceItem, 'id'>): ServiceItem => {
    const id = 'srv-' + Date.now();
    const newService: ServiceItem = {
      ...newServiceData,
      id,
    };
    setServices((prev) => [newService, ...prev]);
    addActivity(
      'Service Created',
      `Added service: ${newService.name} (${formatCurrency(newService.defaultRate)}${newService.rateType === 'hourly' ? '/hr' : newService.rateType === 'monthly' ? '/mo' : ' fixed'})`,
      'finance'
    );
    return newService;
  };

  const updateService = (serviceId: string, updates: Partial<ServiceItem>) => {
    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, ...updates } : s))
    );
    addActivity('Service Updated', `Updated service specifications & baseline rate`, 'finance');
  };

  const deleteService = (serviceId: string) => {
    const target = services.find((s) => s.id === serviceId);
    setServices((prev) => prev.filter((s) => s.id !== serviceId));
    addActivity('Service Deleted', `Removed ${target ? target.name : 'service'} from catalog`, 'finance');
  };

  // Lead actions
  const createLead = (newLeadData: Omit<Lead, 'id' | 'dateReceived'>) => {
    const id = 'lead-' + Date.now();
    const newLead: Lead = {
      ...newLeadData,
      id,
      dateReceived: new Date().toISOString().split('T')[0],
    };
    setLeads((prev) => [newLead, ...prev]);
    addActivity('New Lead Captured', `${newLead.name} (${newLead.company}) - Est. ${formatCurrency(newLead.estimatedValue)}`, 'crm');
  };

  const updateLeadStatus = (leadId: string, status: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status } : l))
    );
    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      addActivity('Lead Status Changed', `${lead.name} marked as ${status}`, 'crm');
    }
  };

  const convertLeadToClient = (leadId: string): Client | null => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return null;

    // Check if client already exists
    const existing = clients.find((c) => c.leadId === leadId || c.email.toLowerCase() === lead.email.toLowerCase());
    if (existing) return existing;

    const newClientId = 'client-' + Date.now();
    const token = 'portal-token-' + Math.random().toString(36).substring(2, 9);
    const newClient: Client = {
      id: newClientId,
      leadId: lead.id,
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      address: 'On file from lead record',
      portalToken: token,
      communicationPreference: 'WhatsApp',
      activeProjectsCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      internalNotes: `Converted from lead on ${new Date().toLocaleDateString()}. Initial inquiry: ${lead.initialEnquiry}`,
    };

    setClients((prev) => [newClient, ...prev]);
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: 'Converted', isConverted: true, convertedClientId: newClientId } : l))
    );

    addActivity('Lead Converted', `${lead.name} (${lead.company}) converted to confirmed client`, 'crm');
    return newClient;
  };

  const deleteLead = (leadId: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
    addActivity('Lead Deleted', `Lead record removed`, 'crm');
  };

  const deleteClient = (clientId: string) => {
    setClients((prev) => prev.filter((c) => c.id !== clientId));
    addActivity('Client Deleted', `Client record removed`, 'crm');
  };

  // Quotation actions
  const createQuotation = (quoteData: Omit<Quotation, 'id' | 'quotationNumber' | 'version' | 'revisions'>) => {
    const id = 'qt-' + Date.now();
    const count = quotations.length + 1;
    const num = `${profile.quotationPrefix}-${String(count).padStart(3, '0')}`;
    const newQuote: Quotation = {
      ...quoteData,
      id,
      quotationNumber: num,
      version: 1,
      revisions: [
        {
          version: 1,
          date: new Date().toISOString().split('T')[0],
          subtotal: quoteData.subtotal,
          total: quoteData.totalAmount,
          reason: 'Initial proposal',
          changedBy: profile.ownerName,
        },
      ],
    };
    setQuotations((prev) => [newQuote, ...prev]);
    addActivity('Quotation Created', `${num} for ${newQuote.clientName} (${formatCurrency(newQuote.totalAmount)})`, 'crm');
  };

  const createQuotationRevision = (quotationId: string, reason: string, updatedItems: Quotation['items']) => {
    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id !== quotationId) return q;
        const newVer = q.version + 1;
        const subtotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
        const taxAmount = (subtotal * q.taxRate) / 100;
        const totalAmount = subtotal + taxAmount - q.discount;

        const newRevision = {
          version: newVer,
          date: new Date().toISOString().split('T')[0],
          subtotal,
          total: totalAmount,
          reason,
          changedBy: profile.ownerName,
        };

        return {
          ...q,
          version: newVer,
          items: updatedItems,
          subtotal,
          taxAmount,
          totalAmount,
          status: 'Negotiation',
          revisions: [...q.revisions, newRevision],
        };
      })
    );
    addActivity('Quotation Revised', `Quotation ${quotationId} updated: ${reason}`, 'crm');
  };

  // CORE AUTOMATION CASCADE: When quotation is accepted
  const acceptQuotation = (quotationId: string, clientComment?: string) => {
    const quote = quotations.find((q) => q.id === quotationId);
    if (!quote || quote.status === 'Accepted') return;

    // 1. Mark quote accepted
    const now = new Date().toISOString().split('T')[0];
    setQuotations((prev) =>
      prev.map((q) =>
        q.id === quotationId
          ? {
              ...q,
              status: 'Accepted',
              clientDecisionDate: now,
              clientComments: clientComment || 'Accepted via portal / agreement',
            }
          : q
      )
    );

    // 2. Resolve or convert client
    let targetClient = clients.find((c) => c.id === quote.clientId);
    if (!targetClient) {
      // It might be a lead ID
      const converted = convertLeadToClient(quote.clientId);
      if (converted) {
        targetClient = converted;
      }
    }

    const clientId = targetClient ? targetClient.id : quote.clientId;
    const clientName = targetClient ? `${targetClient.name} (${targetClient.company})` : quote.clientName;

    // 3. Create Project record
    const projectId = 'proj-' + Date.now();
    const newProject: Project = {
      id: projectId,
      name: quote.projectName || 'Technology Engagement',
      clientId,
      clientName,
      quotationId: quote.id,
      projectType: quote.serviceType,
      description: `Executed under agreed quotation ${quote.quotationNumber}.`,
      contractValue: quote.totalAmount,
      startDate: now,
      expectedCompletionDate: quote.deliveryEstimate ? new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0] : now,
      stage: 'Planning',
      progressPercent: 0,
      agreedScope: quote.items.map((i) => i.description),
      exclusions: ['Any items outside of explicit line item deliverables'],
      milestones: [
        {
          id: 'ms-' + Date.now() + '-1',
          projectId,
          title: 'Requirements & Architecture Blueprint',
          description: 'Detailed technical specification and database models.',
          startDate: now,
          dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
          status: 'In Progress',
          weight: 25,
          isClientVisible: true,
          deliverables: ['Architecture diagrams', 'Schema definition'],
        },
        {
          id: 'ms-' + Date.now() + '-2',
          projectId,
          title: 'Core Development & Integration',
          description: 'Implementation of primary features and business logic.',
          startDate: new Date(Date.now() + 11 * 86400000).toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          status: 'Pending',
          weight: 50,
          isClientVisible: true,
          deliverables: ['Working prototype demo', 'Integration test suite'],
        },
        {
          id: 'ms-' + Date.now() + '-3',
          projectId,
          title: 'Quality Testing, Deployment & Handover',
          description: 'End-to-end verification, client review, and production launch.',
          startDate: new Date(Date.now() + 31 * 86400000).toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
          status: 'Pending',
          weight: 25,
          isClientVisible: true,
          deliverables: ['Production deployment', 'Client documentation and handover'],
        },
      ],
      tasks: [
        {
          id: 'tsk-' + Date.now() + '-1',
          projectId,
          title: 'Set up staging repository and hosting infrastructure',
          description: 'Initialize Git repo and configure staging environment',
          priority: 'High',
          status: 'Not Started',
          dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
          assignedTo: profile.ownerName,
        },
      ],
      changeRequests: [],
      createdAt: now,
    };
    setProjects((prev) => [newProject, ...prev]);

    // 4. Generate 50% Deposit Invoice automatically
    const depositSubtotal = quote.subtotal * 0.5;
    const depositTax = (depositSubtotal * quote.taxRate) / 100;
    const depositTotal = depositSubtotal + depositTax;
    const invCount = invoices.length + 1;
    const invNumber = `${profile.invoicePrefix}-${String(invCount).padStart(3, '0')}`;

    const depositInvoice: Invoice = {
      id: 'inv-' + Date.now(),
      invoiceNumber: invNumber,
      clientId,
      clientName,
      projectId,
      projectName: newProject.name,
      quotationId: quote.id,
      type: 'Deposit',
      issueDate: now,
      dueDate: new Date(Date.now() + profile.defaultPaymentTerms * 86400000).toISOString().split('T')[0],
      items: [
        {
          id: 'item-dep-1',
          description: `50% Project Commencement Deposit - ${newProject.name}`,
          quantity: 1,
          unitPrice: depositSubtotal,
          taxPercent: quote.taxRate,
          total: depositSubtotal,
        },
      ],
      taxRate: quote.taxRate,
      subtotal: depositSubtotal,
      taxAmount: depositTax,
      totalAmount: depositTotal,
      paidAmount: 0,
      balanceDue: depositTotal,
      status: 'Sent',
      paymentInstructions: `Bank: ${profile.bankName}\nAccount: ${profile.accountNumber}\nName: ${profile.accountName}`,
      terms: `Net ${profile.defaultPaymentTerms} days. Required to initiate development.`,
    };
    setInvoices((prev) => [depositInvoice, ...prev]);

    // 5. Generate document record
    const newDoc: DocumentRecord = {
      id: 'doc-' + Date.now(),
      title: `${quote.quotationNumber} Accepted Agreement.pdf`,
      clientId,
      clientName,
      projectId,
      projectName: newProject.name,
      type: 'Agreement',
      format: 'PDF',
      uploadDate: now,
      fileSize: '310 KB',
      isClientVisible: true,
    };
    setDocuments((prev) => [newDoc, ...prev]);

    // 6. Log automation run
    const autoLog: AutomationLog = {
      id: 'alog-' + Date.now(),
      ruleName: 'Quotation Acceptance Lifecycle Cascade',
      triggerEvent: `Quotation ${quote.quotationNumber} Accepted`,
      recipient: clientName,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Success',
      channel: 'In-App System',
      notes: `Created project "${newProject.name}", generated deposit invoice ${invNumber} (${formatCurrency(depositTotal)}), and issued client portal token.`,
    };
    setAutomationLogs((prev) => [autoLog, ...prev]);

    addActivity('Quotation Accepted & Cascade Executed', `${quote.quotationNumber} accepted. Created project and issued deposit invoice ${invNumber}`, 'automation');
  };

  const rejectQuotation = (quotationId: string, reason?: string) => {
    setQuotations((prev) =>
      prev.map((q) =>
        q.id === quotationId
          ? {
              ...q,
              status: 'Rejected',
              clientDecisionDate: new Date().toISOString().split('T')[0],
              clientComments: reason || 'Declined by client',
            }
          : q
      )
    );
    addActivity('Quotation Rejected', `${quotationId} declined: ${reason || 'No reason provided'}`, 'crm');
  };

  const deleteQuotation = (quotationId: string) => {
    setQuotations((prev) => prev.filter((q) => q.id !== quotationId));
    addActivity('Quotation Deleted', `Quotation ${quotationId} removed`, 'crm');
  };

  // Invoice actions
  const createInvoice = (invData: Omit<Invoice, 'id' | 'invoiceNumber' | 'paidAmount' | 'balanceDue'>) => {
    const id = 'inv-' + Date.now();
    const count = invoices.length + 1;
    const invNumber = `${profile.invoicePrefix}-${String(count).padStart(3, '0')}`;
    const effectiveTaxRate = typeof invData.taxRate === 'number' ? invData.taxRate : profile.taxRate;
    const newInv: Invoice = {
      ...invData,
      id,
      invoiceNumber: invNumber,
      taxRate: effectiveTaxRate,
      paidAmount: 0,
      balanceDue: invData.totalAmount,
    };
    setInvoices((prev) => [newInv, ...prev]);
    addActivity('Invoice Issued', `${invNumber} for ${newInv.clientName} (${formatCurrency(newInv.totalAmount)} incl. ${effectiveTaxRate}% VAT)`, 'finance');
  };

  // Payment Recording & Invariant Protection
  const recordPayment = (paymentData: Omit<Payment, 'id' | 'receiptNumber'>) => {
    const receiptNum = `RCP-2026-${String(payments.length + 1).padStart(3, '0')}`;
    const paymentId = 'pay-' + Date.now();
    const newPayment: Payment = {
      ...paymentData,
      id: paymentId,
      receiptNumber: receiptNum,
    };

    setPayments((prev) => [newPayment, ...prev]);

    // Update target invoice balance & status
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== paymentData.invoiceId) return inv;
        const newPaid = inv.paidAmount + paymentData.amount;
        const newBalance = Math.max(0, inv.totalAmount - newPaid);
        const newStatus = newBalance <= 0.01 ? 'Paid' : 'Partially Paid';
        return {
          ...inv,
          paidAmount: newPaid,
          balanceDue: newBalance,
          status: newStatus,
        };
      })
    );

    // Auto-generate receipt document
    const receiptDoc: DocumentRecord = {
      id: 'doc-rcp-' + Date.now(),
      title: `${receiptNum} Official Receipt.pdf`,
      clientId: paymentData.clientId,
      clientName: paymentData.clientName,
      projectId: paymentData.projectId,
      type: 'Receipt',
      format: 'PDF',
      uploadDate: paymentData.paymentDate,
      fileSize: '195 KB',
      isClientVisible: true,
    };
    setDocuments((prev) => [receiptDoc, ...prev]);

    // Record automation log
    const autoLog: AutomationLog = {
      id: 'alog-' + Date.now(),
      ruleName: 'Payment Reconciliation & Reminders Cancellation',
      triggerEvent: `Payment ${receiptNum} Recorded (${formatCurrency(paymentData.amount)})`,
      recipient: paymentData.clientName,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Success',
      channel: 'In-App System',
      notes: `Updated ${paymentData.invoiceNumber} balance. Receipt ${receiptNum} issued and scheduled overdue reminders cancelled.`,
    };
    setAutomationLogs((prev) => [autoLog, ...prev]);

    addActivity('Payment Recorded', `${formatCurrency(paymentData.amount)} received against ${paymentData.invoiceNumber} via ${paymentData.method}`, 'finance');
  };

  const sendPaymentReminder = (invoiceId: string) => {
    const invoice = invoices.find((i) => i.id === invoiceId);
    if (!invoice) return;

    const now = new Date().toISOString().split('T')[0];
    setInvoices((prev) =>
      prev.map((i) => (i.id === invoiceId ? { ...i, lastReminderSent: now } : i))
    );

    const autoLog: AutomationLog = {
      id: 'alog-' + Date.now(),
      ruleName: 'Manual / Scheduled Payment Reminder Dispatch',
      triggerEvent: `Reminder sent for ${invoice.invoiceNumber}`,
      recipient: invoice.clientName,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Success',
      channel: 'WhatsApp',
      notes: `Dispatched payment reminder for outstanding balance of ${formatCurrency(invoice.balanceDue)}.`,
    };
    setAutomationLogs((prev) => [autoLog, ...prev]);

    addActivity('Payment Reminder Sent', `Reminder sent to ${invoice.clientName} for ${invoice.invoiceNumber} (${formatCurrency(invoice.balanceDue)})`, 'automation');
  };

  const deleteInvoice = (invoiceId: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== invoiceId));
    addActivity('Invoice Deleted', `Invoice removed`, 'finance');
  };

  // Expense action
  const addExpense = (expData: Omit<Expense, 'id'>) => {
    const newExp: Expense = {
      ...expData,
      id: 'exp-' + Date.now(),
    };
    setExpenses((prev) => [newExp, ...prev]);
    addActivity('Expense Logged', `${newExp.description}: ${formatCurrency(newExp.amount)} (${newExp.category})`, 'finance');
  };

  const deleteExpense = (expenseId: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
    addActivity('Expense Deleted', `Expense entry removed`, 'finance');
  };

  // Project actions
  const createProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'progressPercent' | 'tasks' | 'changeRequests'>) => {
    const id = 'proj-' + Date.now();
    const newProj: Project = {
      ...projectData,
      id,
      progressPercent: 0,
      tasks: [],
      changeRequests: [],
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProjects((prev) => [newProj, ...prev]);
    addActivity('Project Created', `${newProj.name} (${newProj.projectType})`, 'project');
  };

  const updateProjectStage = (projectId: string, stage: ProjectStage) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, stage } : p))
    );
    const proj = projects.find((p) => p.id === projectId);
    if (proj) {
      addActivity('Project Stage Changed', `${proj.name} moved to stage: ${stage}`, 'project');
    }
  };

  const toggleMilestoneStatus = (projectId: string, milestoneId: string) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;

        const updatedMilestones = proj.milestones.map((m) => {
          if (m.id !== milestoneId) return m;
          const nextStatus = m.status === 'Completed' ? 'In Progress' : 'Completed';
          return {
            ...m,
            status: nextStatus as Milestone['status'],
            completedDate: nextStatus === 'Completed' ? new Date().toISOString().split('T')[0] : undefined,
          };
        });

        // Deterministic progress calculation based on milestone weights
        const totalWeight = updatedMilestones.reduce((sum, m) => sum + m.weight, 0);
        const completedWeight = updatedMilestones
          .filter((m) => m.status === 'Completed')
          .reduce((sum, m) => sum + m.weight, 0);
        const progressPercent = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;

        return {
          ...proj,
          milestones: updatedMilestones,
          progressPercent,
        };
      })
    );
    addActivity('Milestone Updated', `Milestone status toggled for project ${projectId}`, 'project');
  };

  const addTask = (projectId: string, taskData: { title: string; priority: 'Low' | 'Medium' | 'High' | 'Urgent'; dueDate: string; milestoneId?: string }) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const newTask = {
          id: 'tsk-' + Date.now(),
          projectId,
          milestoneId: taskData.milestoneId,
          title: taskData.title,
          description: '',
          priority: taskData.priority,
          status: 'Not Started' as const,
          dueDate: taskData.dueDate,
          assignedTo: profile.ownerName,
        };
        return {
          ...p,
          tasks: [...p.tasks, newTask],
        };
      })
    );
    addActivity('Task Created', `Added task "${taskData.title}" to project`, 'project');
  };

  const toggleTaskStatus = (projectId: string, taskId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const updatedTasks = p.tasks.map((t) => {
          if (t.id !== taskId) return t;
          return {
            ...t,
            status: t.status === 'Completed' ? ('In Progress' as const) : ('Completed' as const),
          };
        });
        return {
          ...p,
          tasks: updatedTasks,
        };
      })
    );
  };

  const submitChangeRequest = (projectId: string, reqData: { title: string; description: string; costImpact: number; timelineImpactDays: number; requestedBy: string }) => {
    const id = 'cr-' + Date.now();
    const newCR = {
      id,
      projectId,
      ...reqData,
      requestDate: new Date().toISOString().split('T')[0],
      status: 'Pending Review' as const,
    };
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, changeRequests: [...p.changeRequests, newCR] } : p))
    );
    addActivity('Change Request Submitted', `Client requested: ${reqData.title} (+${formatCurrency(reqData.costImpact)})`, 'project');
  };

  const reviewChangeRequest = (projectId: string, requestId: string, approved: boolean, notes?: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          changeRequests: p.changeRequests.map((cr) =>
            cr.id === requestId
              ? {
                  ...cr,
                  status: approved ? 'Approved' : 'Declined',
                  resolutionNotes: notes,
                }
              : cr
          ),
        };
      })
    );
    addActivity('Change Request Reviewed', `CR ${requestId} marked ${approved ? 'Approved' : 'Declined'}`, 'project');
  };

  // Support tickets
  const submitSupportTicket = (ticketData: Omit<SupportTicket, 'id' | 'dateSubmitted' | 'lastUpdated' | 'status'>) => {
    const id = 'tkt-' + Date.now();
    const now = new Date().toISOString().split('T')[0];
    const newTicket: SupportTicket = {
      ...ticketData,
      id,
      status: 'New',
      dateSubmitted: now,
      lastUpdated: now,
    };
    setTickets((prev) => [newTicket, ...prev]);
    addActivity('Support Ticket Submitted', `${ticketData.clientName}: ${ticketData.title} [${ticketData.priority}]`, 'portal');
  };

  const updateTicketStatus = (ticketId: string, status: TicketStatus, resolution?: string) => {
    const now = new Date().toISOString().split('T')[0];
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status, resolution, lastUpdated: now } : t))
    );
    addActivity('Ticket Status Updated', `Ticket ${ticketId} set to ${status}`, 'crm');
  };

  // WhatsApp bot / human handover
  const toggleWhatsAppHandover = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, isHumanControlled: !c.isHumanControlled } : c
      )
    );
    const conv = conversations.find((c) => c.id === conversationId);
    const newMode = conv?.isHumanControlled ? 'AI Assistant (Automated)' : 'Human Owner Control';
    addActivity('WhatsApp Handover Toggled', `${conv?.contactName} switched to ${newMode}`, 'crm');
  };

  const sendWhatsAppMessage = (conversationId: string, text: string, senderOverride?: 'human' | 'client') => {
    const newMsg = {
      id: 'msg-' + Date.now(),
      sender: senderOverride || 'human',
      senderName: senderOverride === 'client' ? 'Client' : profile.ownerName,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: true,
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== conversationId) return c;
        return {
          ...c,
          messages: [...c.messages, newMsg],
          lastMessageTime: 'Just now',
        };
      })
    );

    // If sent by client and bot is NOT human controlled, simulate intelligent auto-reply
    const conv = conversations.find((c) => c.id === conversationId);
    if (senderOverride === 'client' && conv && !conv.isHumanControlled) {
      setTimeout(() => {
        const botReply = {
          id: 'msg-bot-' + Date.now(),
          sender: 'bot' as const,
          senderName: 'AIConsults Assistant',
          text: `Thank you for the update! I have logged this into our project system. Alex Mercer has been notified.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: true,
        };
        setConversations((p) =>
          p.map((c) => (c.id === conversationId ? { ...c, messages: [...c.messages, botReply] } : c))
        );
      }, 700);
    }
  };

  const toggleAutomationRule = (ruleId: string) => {
    setAutomationRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, isEnabled: !r.isEnabled } : r))
    );
  };

  const submitOnboardingForm = (formId: string, data: Record<string, string>) => {
    const form = onboardingForms.find((f) => f.id === formId);
    const leadName = data['Primary Contact Person'] || data['Company / Organization Name'] || 'New Online Prospect';
    const company = data['Company / Organization Name'] || 'Online Form Enquiry';
    const email = data['Business Email'] || 'web-form@example.com';
    const phone = data['Phone Number'] || '';
    const initialEnquiry = data['Detailed Problem Description & Key Functional Requirements'] || data['App Concept & Purpose'] || 'Submitted via onboarding form';

    createLead({
      name: leadName,
      company,
      email,
      phone,
      source: 'Onboarding Form',
      serviceRequested: form?.serviceType || 'Custom Software Development',
      initialEnquiry,
      estimatedValue: 12000,
      expectedTimeline: data['Target Launch Timeline'] || '6 weeks',
      budget: 15000,
      status: 'New Enquiry',
      followUpDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      internalNotes: `Auto-created from Onboarding Form "${form?.title}". Form answers: ${JSON.stringify(data)}`,
    });

    setOnboardingForms((prev) =>
      prev.map((f) => (f.id === formId ? { ...f, submissionsCount: f.submissionsCount + 1 } : f))
    );

    addActivity('Onboarding Form Submitted', `${leadName} submitted "${form?.title}"`, 'crm');
  };

  const updateEmailSettings = (updated: EmailSettings) => {
    setEmailSettings(updated);
    addActivity('Email Settings Updated', `Configured ${updated.provider} (${updated.senderEmail})`, 'crm');
  };

  const sendTestEmail = async (recipient: string): Promise<{ success: boolean; message: string }> => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setEmailSettings((prev) => ({ ...prev, lastTestSent: timestamp, isConnected: true }));
    addActivity('Test Email Dispatched', `Verified ${emailSettings.provider} connection to ${recipient}`, 'crm');
    return {
      success: true,
      message: `Test email successfully dispatched to ${recipient} via ${emailSettings.provider} (${emailSettings.host}:${emailSettings.port}).`,
    };
  };

  const updateWhatsAppSettings = (updated: WhatsAppSettings) => {
    setWhatsAppSettings(updated);
    addActivity('WhatsApp Config Updated', `Phone ID: ${updated.phoneNumberId}`, 'crm');
  };

  const updateAISettings = (updated: AISettings) => {
    setAISettings(updated);
    addActivity('AI Provider Settings Updated', `Model: ${updated.model}`, 'crm');
  };

  const updatePaymentSettings = (updated: PaymentGatewaySettings) => {
    setPaymentSettings(updated);
    addActivity('Payment Gateways Updated', `Primary provider: ${updated.provider}`, 'finance');
  };

  const recordVoiceMilestoneUpdate = (projectId: string, milestoneId: string, voiceTranscript: string) => {
    const proj = projects.find((p) => p.id === projectId);
    const ms = proj?.milestones.find((m) => m.id === milestoneId);
    if (!proj || !ms) return;

    toggleMilestoneStatus(projectId, milestoneId);

    const voiceRecord: VoiceActionRecord = {
      id: 'va-' + Date.now(),
      audioDurationSeconds: 5,
      transcript: voiceTranscript,
      detectedIntent: 'milestone_update',
      confidenceScore: 0.98,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      executedStatus: 'Executed',
      executionSummary: `Marked milestone "${ms.title}" completed for ${proj.name} via voice dictate.`,
    };

    setVoiceActions((prev) => [voiceRecord, ...prev]);
    addActivity('Voice Milestone Update', `Spoken update: "${voiceTranscript.substring(0, 60)}..." -> ${ms.title} Completed`, 'project');
  };

  const processVoiceCommand = (transcript: string): { success: boolean; summary: string; intent: string } => {
    const lower = transcript.toLowerCase();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    // 1. Payment pattern: "record payment of [amount] from [client/person]"
    if (lower.includes('payment') || lower.includes('paid')) {
      const amountMatch = lower.match(/\$?(\d+(?:\.\d{1,2})?)/);
      const amount = amountMatch ? parseFloat(amountMatch[1]) : 500;

      const targetInvoice = invoices.find((inv) => inv.balanceDue > 0) || invoices[0];
      if (targetInvoice) {
        recordPayment({
          invoiceId: targetInvoice.id,
          invoiceNumber: targetInvoice.invoiceNumber,
          clientId: targetInvoice.clientId,
          clientName: targetInvoice.clientName,
          projectId: targetInvoice.projectId,
          amount: Math.min(amount, targetInvoice.balanceDue),
          paymentDate: new Date().toISOString().split('T')[0],
          method: lower.includes('wire') ? 'Wire' : lower.includes('card') ? 'Online Card' : 'Bank Transfer',
          transactionReference: `VOICE-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
          notes: `Transcribed from voice command: "${transcript}"`,
        });

        const rec: VoiceActionRecord = {
          id: 'va-' + Date.now(),
          audioDurationSeconds: 4,
          transcript,
          detectedIntent: 'record_payment',
          confidenceScore: 0.96,
          timestamp: now,
          executedStatus: 'Executed',
          executionSummary: `Recorded ${formatCurrency(amount)} payment for ${targetInvoice.invoiceNumber} (${targetInvoice.clientName}).`,
        };
        setVoiceActions((prev) => [rec, ...prev]);

        return {
          success: true,
          intent: 'record_payment',
          summary: `Payment of ${formatCurrency(amount)} recorded against ${targetInvoice.invoiceNumber} for ${targetInvoice.clientName}.`,
        };
      }
    }

    // 2. Milestone pattern: "mark milestone [name/number] complete"
    if (lower.includes('milestone') || lower.includes('deliverable')) {
      const activeProj = projects.find((p) => p.stage !== 'Completed') || projects[0];
      const pendingMilestone = activeProj?.milestones.find((m) => m.status !== 'Completed');

      if (activeProj && pendingMilestone) {
        toggleMilestoneStatus(activeProj.id, pendingMilestone.id);

        const rec: VoiceActionRecord = {
          id: 'va-' + Date.now(),
          audioDurationSeconds: 4,
          transcript,
          detectedIntent: 'milestone_update',
          confidenceScore: 0.97,
          timestamp: now,
          executedStatus: 'Executed',
          executionSummary: `Completed milestone "${pendingMilestone.title}" on ${activeProj.name}.`,
        };
        setVoiceActions((prev) => [rec, ...prev]);

        return {
          success: true,
          intent: 'milestone_update',
          summary: `Milestone "${pendingMilestone.title}" on ${activeProj.name} marked completed. Progress recalculated.`,
        };
      }
    }

    // 3. Expense pattern: "log expense of [amount] for [description]"
    if (lower.includes('expense') || lower.includes('cost')) {
      const amountMatch = lower.match(/\$?(\d+(?:\.\d{1,2})?)/);
      const amount = amountMatch ? parseFloat(amountMatch[1]) : 120;

      addExpense({
        description: 'Server / Infrastructure cost (Voice entry)',
        category: 'Hosting & Servers',
        amount,
        date: new Date().toISOString().split('T')[0],
        vendor: 'Cloud Hosting Provider',
        paymentMethod: 'Corporate Credit Card',
        notes: `Dictated by voice: "${transcript}"`,
      });

      const rec: VoiceActionRecord = {
        id: 'va-' + Date.now(),
        audioDurationSeconds: 3,
        transcript,
        detectedIntent: 'log_expense',
        confidenceScore: 0.95,
        timestamp: now,
        executedStatus: 'Executed',
        executionSummary: `Logged ${formatCurrency(amount)} expense under Hosting & Servers.`,
      };
      setVoiceActions((prev) => [rec, ...prev]);

      return {
        success: true,
        intent: 'log_expense',
        summary: `Expense of ${formatCurrency(amount)} logged under Hosting & Servers.`,
      };
    }

    // Default Query Intent
    const rec: VoiceActionRecord = {
      id: 'va-' + Date.now(),
      audioDurationSeconds: 3,
      transcript,
      detectedIntent: 'query',
      confidenceScore: 0.92,
      timestamp: now,
      executedStatus: 'Executed',
      executionSummary: `Processed business status query: "${transcript}"`,
    };
    setVoiceActions((prev) => [rec, ...prev]);

    return {
      success: true,
      intent: 'query',
      summary: `Analyzed query: "${transcript}". Current cash collected is ${formatCurrency(financials.collectedAmount)} with ${formatCurrency(financials.outstandingAmount)} outstanding.`,
    };
  };

  const resetToSampleData = () => {
    setProfile(initialBusinessProfile);
    setLeads(initialLeads);
    setClients(initialClients);
    setQuotations(initialQuotations);
    setProjects(initialProjects);
    setInvoices(initialInvoices);
    setPayments(initialPayments);
    setExpenses(initialExpenses);
    setDocuments(initialDocuments);
    setTickets(initialSupportTickets);
    setConversations(initialConversations);
    setAutomationRules(initialAutomationRules);
    setAutomationLogs(initialAutomationLogs);
    setActivities(initialActivities);
    setOnboardingForms(initialOnboardingForms);
    setEmailSettings(initialEmailSettings);
    setWhatsAppSettings(initialWhatsAppSettings);
    setAISettings(initialAISettings);
    setPaymentSettings(initialPaymentGatewaySettings);
    setVoiceActions(initialVoiceActions);
    localStorage.clear();
  };

  return (
    <BusinessContext.Provider
      value={{
        platformView,
        setPlatformView,
        activeTab,
        setActiveTab,
        selectedRecordIds,
        setSelectedRecordForTab,
        navigateToRecord,
        breadcrumbs,
        navigateToBreadcrumb,
        selectedClientIdForPortal,
        setSelectedClientIdForPortal,
        searchQuery,
        setSearchQuery,
        moduleFilter,
        setModuleFilter,
        profile,
        updateProfile,
        services,
        leads,
        clients,
        quotations,
        projects,
        invoices,
        payments,
        expenses,
        documents,
        tickets,
        conversations,
        automationRules,
        automationLogs,
        activities,
        onboardingForms,
        financials,
        formatCurrency,
        formatCompactCurrency,
        createService,
        updateService,
        deleteService,
        createLead,
        updateLeadStatus,
        convertLeadToClient,
        deleteLead,
        deleteClient,
        createQuotation,
        createQuotationRevision,
        acceptQuotation,
        rejectQuotation,
        deleteQuotation,
        createInvoice,
        deleteInvoice,
        recordPayment,
        sendPaymentReminder,
        addExpense,
        deleteExpense,
        createProject,
        updateProjectStage,
        toggleMilestoneStatus,
        addTask,
        toggleTaskStatus,
        submitChangeRequest,
        reviewChangeRequest,
        submitSupportTicket,
        updateTicketStatus,
        toggleWhatsAppHandover,
        sendWhatsAppMessage,
        emailSettings,
        updateEmailSettings,
        sendTestEmail,
        whatsAppSettings,
        updateWhatsAppSettings,
        aiSettings,
        updateAISettings,
        paymentSettings,
        updatePaymentSettings,
        voiceActions,
        processVoiceCommand,
        recordVoiceMilestoneUpdate,
        toggleAutomationRule,
        submitOnboardingForm,
        resetToSampleData,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) throw new Error('useBusiness must be used within BusinessProvider');
  return context;
};

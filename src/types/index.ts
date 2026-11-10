export type PlatformView = 'desktop' | 'android' | 'portal';

export type LeadStatus =
  | 'New Enquiry'
  | 'Contacted'
  | 'Discussion'
  | 'Requirements Gathering'
  | 'Preparing Quotation'
  | 'Quotation Sent'
  | 'Negotiation'
  | 'Converted'
  | 'Lost';

export type QuotationStatus =
  | 'Draft'
  | 'Sent'
  | 'Viewed'
  | 'Negotiation'
  | 'Accepted'
  | 'Rejected'
  | 'Expired'
  | 'Superseded';

export type InvoiceStatus =
  | 'Draft'
  | 'Sent'
  | 'Partially Paid'
  | 'Paid'
  | 'Overdue'
  | 'Cancelled';

export type ProjectStage =
  | 'Requirements'
  | 'Planning'
  | 'Design'
  | 'Development'
  | 'Internal Testing'
  | 'Client Review'
  | 'Revisions'
  | 'Deployment'
  | 'Handover'
  | 'Completed';

export type TaskStatus = 'Not Started' | 'In Progress' | 'Waiting' | 'Completed' | 'Cancelled';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type TicketStatus = 'New' | 'Acknowledged' | 'In Progress' | 'Waiting for Client' | 'Resolved' | 'Closed';

export interface BusinessProfile {
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  currencySymbol: string;
  taxRate: number; // percentage, e.g. 7.5 or 0
  bankName: string;
  accountNumber: string;
  accountName: string;
  invoicePrefix: string;
  quotationPrefix: string;
  defaultPaymentTerms: number; // days
}

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  description: string;
  defaultRate: number;
  rateType: 'fixed' | 'hourly' | 'monthly';
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  serviceRequested: string;
  initialEnquiry: string;
  estimatedValue: number;
  expectedTimeline: string;
  budget: number;
  status: LeadStatus;
  dateReceived: string;
  followUpDate: string;
  internalNotes: string;
  isConverted?: boolean;
  convertedClientId?: string;
}

export interface Client {
  id: string;
  leadId?: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  portalToken: string;
  communicationPreference: 'WhatsApp' | 'Email' | 'Phone';
  activeProjectsCount: number;
  createdAt: string;
  internalNotes: string;
}

export interface QuotationLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  total: number;
}

export interface QuotationRevision {
  version: number;
  date: string;
  subtotal: number;
  total: number;
  reason: string;
  changedBy: string;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  clientId: string;
  clientName: string;
  projectName: string;
  serviceType: string;
  issueDate: string;
  validUntil: string;
  status: QuotationStatus;
  version: number;
  items: QuotationLineItem[];
  discount: number;
  taxRate: number;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paymentTerms: string;
  deliveryEstimate: string;
  specialConditions: string;
  revisions: QuotationRevision[];
  clientDecisionDate?: string;
  clientComments?: string;
}

export interface ChangeRequest {
  id: string;
  projectId: string;
  title: string;
  description: string;
  requestedBy: string;
  requestDate: string;
  costImpact: number;
  timelineImpactDays: number;
  status: 'Pending Review' | 'Approved' | 'Declined';
  resolutionNotes?: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  startDate: string;
  dueDate: string;
  completedDate?: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Delayed';
  weight: number; // percentage weight towards 100%
  isClientVisible: boolean;
  relatedInvoiceId?: string;
  deliverables: string[];
}

export interface Task {
  id: string;
  projectId: string;
  milestoneId?: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  assignedTo: string;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  quotationId?: string;
  projectType: string;
  description: string;
  contractValue: number;
  startDate: string;
  expectedCompletionDate: string;
  stage: ProjectStage;
  progressPercent: number;
  agreedScope: string[];
  exclusions: string[];
  milestones: Milestone[];
  tasks: Task[];
  changeRequests: ChangeRequest[];
  createdAt: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  projectId?: string;
  projectName?: string;
  quotationId?: string;
  type: 'Deposit' | 'Milestone' | 'Full' | 'Additional Service' | 'Recurring';
  issueDate: string;
  dueDate: string;
  items: InvoiceLineItem[];
  taxRate?: number;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: InvoiceStatus;
  paymentInstructions: string;
  terms: string;
  lastReminderSent?: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  projectId?: string;
  amount: number;
  paymentDate: string;
  method: 'Bank Transfer' | 'Online Card' | 'Cash' | 'Cheque' | 'Wire';
  transactionReference: string;
  receiptNumber: string;
  notes: string;
}

export interface Expense {
  id: string;
  description: string;
  category: 'Hosting & Servers' | 'Software Subscriptions' | 'Contractor' | 'Domain & SSL' | 'Hardware' | 'Office & Admin' | 'Transport';
  amount: number;
  date: string;
  projectId?: string;
  projectName?: string;
  vendor: string;
  paymentMethod: string;
  notes: string;
}

export interface DocumentRecord {
  id: string;
  title: string;
  clientId?: string;
  clientName?: string;
  projectId?: string;
  projectName?: string;
  type: 'Quotation' | 'Invoice' | 'Receipt' | 'Agreement' | 'Deliverable' | 'Specification';
  format: 'PDF' | 'DOCX' | 'ZIP' | 'IMAGE';
  uploadDate: string;
  fileSize: string;
  isClientVisible: boolean;
}

export interface SupportTicket {
  id: string;
  clientId: string;
  clientName: string;
  projectId: string;
  projectName: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: TicketStatus;
  dateSubmitted: string;
  lastUpdated: string;
  resolution?: string;
}

export interface ActivityLog {
  id: string;
  clientId?: string;
  clientName?: string;
  projectId?: string;
  event: string;
  details: string;
  timestamp: string;
  category: 'crm' | 'finance' | 'project' | 'automation' | 'portal';
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  conditions: string;
  actions: string[];
  isEnabled: boolean;
  lastRun?: string;
}

export interface AutomationLog {
  id: string;
  ruleName: string;
  triggerEvent: string;
  recipient: string;
  timestamp: string;
  status: 'Success' | 'Failed' | 'Skipped';
  channel: 'WhatsApp' | 'Email' | 'In-App System';
  notes: string;
}

export interface MessageItem {
  id: string;
  sender: 'client' | 'bot' | 'human';
  senderName: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  leadOrClientId: string;
  contactName: string;
  contactPhone: string;
  channel: 'WhatsApp' | 'Portal';
  isHumanControlled: boolean; // if true, bot is paused for this contact
  messages: MessageItem[];
  unreadCount: number;
  lastMessageTime: string;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'number' | 'dropdown' | 'textarea' | 'checkbox';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface OnboardingForm {
  id: string;
  title: string;
  serviceType: string;
  description: string;
  fields: FormField[];
  isActive: boolean;
  submissionsCount: number;
}

export interface EmailSettings {
  provider: 'Postmark' | 'SendGrid' | 'Resend' | 'SMTP';
  host: string;
  port: number;
  encryption: 'TLS' | 'SSL' | 'None';
  username: string;
  apiKey: string;
  senderName: string;
  senderEmail: string;
  invoiceSubject: string;
  reminderSubject: string;
  isConnected: boolean;
  lastTestSent?: string;
}

export interface WhatsAppSettings {
  phoneNumberId: string;
  businessAccountId: string;
  accessToken: string;
  webhookSecret: string;
  webhookUrl: string;
  autoReplyEnabled: boolean;
  aiHandoverThreshold: string;
  isConnected: boolean;
}

export interface AISettings {
  provider: 'Google Gemini' | 'OpenAI' | 'Custom';
  model: string;
  apiKeyOverride?: string;
  dailyTokenCap: number;
  usedTokensToday: number;
  temperature: number;
  voiceTranscribeLanguage: string;
  autoExecuteHighConfidenceActions: boolean;
}

export interface PaymentGatewaySettings {
  provider: 'Stripe' | 'Paystack' | 'Flutterwave' | 'Bank Transfer';
  stripePublishableKey: string;
  stripeSecretKey: string;
  paystackPublicKey: string;
  paystackSecretKey: string;
  flutterwavePublicKey: string;
  webhookSecret: string;
  testMode: boolean;
}

export interface VoiceActionRecord {
  id: string;
  audioDurationSeconds: number;
  transcript: string;
  detectedIntent: 'milestone_update' | 'record_payment' | 'log_expense' | 'create_lead' | 'query';
  confidenceScore: number;
  timestamp: string;
  executedStatus: 'Executed' | 'Needs Review' | 'Rejected';
  executionSummary: string;
}


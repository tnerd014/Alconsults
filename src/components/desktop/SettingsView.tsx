import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { BusinessProfile, EmailSettings, WhatsAppSettings, AISettings, PaymentGatewaySettings } from '../../types';
import {
  Mail,
  MessageSquare,
  Bot,
  CreditCard,
  Mic,
  Save,
  Check,
  Send,
  Sliders,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Calendar,
  HardDrive,
  FileSpreadsheet,
  LayoutGrid,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { COMPANY_LOGO_URL, APP_LOGO_URL } from '../common/BrandLogo';
import { SearchAndFilterBar } from '../common/SearchAndFilterBar';
import {
  getGoogleWorkspaceTokenStatus,
  requestGoogleWorkspaceToken,
  syncEventToGoogleCalendar,
  saveDocumentToGoogleDrive,
  exportLedgerToGoogleSheets,
} from '../../services/googleWorkspace';

export const SettingsView: React.FC = () => {
  const {
    profile,
    updateProfile,
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
    invoices,
    payments,
    expenses,
    projects,
  } = useBusiness();

  const [activeSubTab, setActiveSubTab] = useState<string>('profile');
  const [settingsSearch, setSettingsSearch] = useState('');

  // Local form states
  const [profileForm, setProfileForm] = useState<BusinessProfile>(profile);
  const [emailForm, setEmailForm] = useState<EmailSettings>(emailSettings);
  const [whatsAppForm, setWhatsAppForm] = useState<WhatsAppSettings>(whatsAppSettings);
  const [aiForm, setAIForm] = useState<AISettings>(aiSettings);
  const [paymentForm, setPaymentForm] = useState<PaymentGatewaySettings>(paymentSettings);

  React.useEffect(() => {
    setProfileForm(profile);
  }, [profile]);

  // Customizable Email Body Templates in Settings
  const [invoiceBodyTemplate, setInvoiceBodyTemplate] = useState(
    `Dear {{client_name}},\n\nPlease find attached VAT Invoice {{invoice_number}} (Subtotal: {{subtotal}} + VAT {{vat_rate}}: {{vat_amount}} = Total: {{amount}}) due on {{due_date}}.\n\nBank Transfer Instructions:\nBank: ${profile.bankName}\nAccount Name: ${profile.accountName}\nAccount Number: ${profile.accountNumber}\n\nWarm regards,\n{{owner_name}}\n{{business_name}}`
  );
  const [quotationBodyTemplate, setQuotationBodyTemplate] = useState(
    `Dear {{client_name}},\n\nThank you for the opportunity to collaborate. Please find attached Commercial Proposal {{invoice_number}} totaling {{amount}} (incl. {{vat_rate}} VAT: {{vat_amount}}, valid until {{due_date}}).\n\nOnce approved, we will immediately initiate the project kickoff milestones.\n\nWarm regards,\n{{owner_name}}\n{{business_name}}`
  );

  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Email test sending
  const [testEmailRecipient, setTestEmailRecipient] = useState(profile.email);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string } | null>(null);

  // Google Workspace live integration state
  const [isGoogleConnected, setIsGoogleConnected] = useState(getGoogleWorkspaceTokenStatus().isConnected);
  const [workspaceActionStatus, setWorkspaceActionStatus] = useState<string | null>(null);
  const [workspaceActionLink, setWorkspaceActionLink] = useState<string | null>(null);
  const [workspaceLoading, setWorkspaceLoading] = useState<string | null>(null);

  const handleConnectGoogleWorkspace = async () => {
    setWorkspaceLoading('connect');
    setWorkspaceActionStatus(null);
    setWorkspaceActionLink(null);
    try {
      await requestGoogleWorkspaceToken(true);
      setIsGoogleConnected(true);
      setWorkspaceActionStatus('Google Workspace Account Connected (Gmail, Calendar, Drive & Sheets authorized).');
    } catch (err: any) {
      setWorkspaceActionStatus(err?.message || 'Google authorization could not be completed.');
    } finally {
      setWorkspaceLoading(null);
    }
  };

  const handleSyncCalendarMilestones = async () => {
    setWorkspaceLoading('calendar');
    setWorkspaceActionStatus(null);
    setWorkspaceActionLink(null);
    try {
      const targetProj = projects[0];
      const nextMilestone = targetProj?.milestones.find((m) => m.status !== 'Completed') || targetProj?.milestones[0];
      const res = await syncEventToGoogleCalendar({
        summary: `AIConsults Milestone: ${nextMilestone?.title || 'Project Review'} (${targetProj?.name || 'Client Project'})`,
        description: `Client: ${targetProj?.clientName} · Stage: ${targetProj?.stage}`,
        date: nextMilestone?.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      });
      setIsGoogleConnected(true);
      setWorkspaceActionStatus(`Synced milestone "${nextMilestone?.title}" to your primary Google Calendar.`);
      if (res.htmlLink) setWorkspaceActionLink(res.htmlLink);
    } catch (err: any) {
      setWorkspaceActionStatus(err?.message || 'Failed to sync milestone to Google Calendar.');
    } finally {
      setWorkspaceLoading(null);
    }
  };

  const handleArchiveInvoicesToDrive = async () => {
    setWorkspaceLoading('drive');
    setWorkspaceActionStatus(null);
    setWorkspaceActionLink(null);
    try {
      const latestInv = invoices[0];
      const html = `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:32px;"><h1>${profile.name} — Tax Invoice ${latestInv.invoiceNumber}</h1><p>Client: ${latestInv.clientName}</p><p>Total: ${profile.currencySymbol}${latestInv.totalAmount.toLocaleString()}</p></body></html>`;
      const res = await saveDocumentToGoogleDrive({
        fileName: `${latestInv.invoiceNumber}_${latestInv.clientName.replace(/\s+/g, '_')}.html`,
        htmlContent: html,
      });
      setIsGoogleConnected(true);
      setWorkspaceActionStatus(`Archived "${res.name}" to your Google Drive.`);
      if (res.webViewLink) setWorkspaceActionLink(res.webViewLink);
    } catch (err: any) {
      setWorkspaceActionStatus(err?.message || 'Failed to archive invoice to Google Drive.');
    } finally {
      setWorkspaceLoading(null);
    }
  };

  const handleExportLedgerToSheets = async () => {
    setWorkspaceLoading('sheets');
    setWorkspaceActionStatus(null);
    setWorkspaceActionLink(null);
    try {
      const rows: (string | number)[][] = [
        ['Type', 'Reference', 'Client / Vendor', 'Date', 'Status / Method', `Amount (${profile.currency})`],
        ...invoices.map((i) => ['INVOICE', i.invoiceNumber, i.clientName, i.issueDate, i.status, i.totalAmount]),
        ...payments.map((p) => ['PAYMENT RECEIVED', p.receiptNumber, p.clientName, p.paymentDate, p.method, p.amount]),
        ...expenses.map((e) => ['EXPENSE', e.category, e.vendor, e.date, e.paymentMethod, -e.amount]),
      ];
      const res = await exportLedgerToGoogleSheets({
        title: `${profile.name} — Financial Ledger (${new Date().toISOString().split('T')[0]})`,
        rows,
      });
      setIsGoogleConnected(true);
      setWorkspaceActionStatus('Exported live Invoices, Payments & Expenses to a new Google Sheet.');
      if (res.spreadsheetUrl) setWorkspaceActionLink(res.spreadsheetUrl);
    } catch (err: any) {
      setWorkspaceActionStatus(err?.message || 'Failed to export ledger to Google Sheets.');
    } finally {
      setWorkspaceLoading(null);
    }
  };

  const triggerSuccess = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(profileForm);
    triggerSuccess('Business Profile & Currency Variables Saved');
  };

  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmailSettings(emailForm);
    triggerSuccess('Email Credentials & Message Templates Saved');
  };

  const handleSaveWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    updateWhatsAppSettings(whatsAppForm);
    triggerSuccess('WhatsApp Cloud API Settings Saved');
  };

  const handleSaveAI = (e: React.FormEvent) => {
    e.preventDefault();
    updateAISettings(aiForm);
    triggerSuccess('AI Provider & Voice Parameters Saved');
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    updatePaymentSettings(paymentForm);
    triggerSuccess('Payment Gateways & Webhook Secrets Saved');
  };

  const handleRunEmailTest = async () => {
    setIsSendingTestEmail(true);
    setTestEmailResult(null);
    try {
      const res = await sendTestEmail(testEmailRecipient);
      setTestEmailResult(res);
    } catch {
      setTestEmailResult({ success: false, message: 'Failed to dispatch test message.' });
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  const subTabLabels: Record<string, string> = {
    profile: 'Business & Currency',
    email: 'Email & Templates',
    workspace: 'Google Workspace',
    whatsapp: 'WhatsApp Cloud API',
    ai: 'AI Model & Voice',
    payments: 'Payment Gateways',
    voice_logs: `Voice Logs (${voiceActions.length})`,
    governance: 'UI/UX Consistency Rules',
  };

  return (
    <div className="p-3.5 sm:p-6 space-y-4 max-w-6xl mx-auto min-h-full flex flex-col bg-[#F5F8FC]">
      {/* Compact Sticky Minimalist Header */}
      <div className="sticky top-0 z-25 bg-[#F5F8FC] -mx-3.5 px-3.5 sm:-mx-6 sm:px-6 -mt-3.5 pt-3.5 sm:-mt-6 sm:pt-4 pb-2.5 border-b border-slate-200/90 shadow-2xs flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-[#0B192C] shrink-0">Settings</h1>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-[#EBF2FF] text-[#0D5EF4] truncate">
            {subTabLabels[activeSubTab]}
          </span>
        </div>

        {saveSuccessMsg && (
          <div className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-white bg-[#16A34A] rounded-xl shadow-2xs shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-white stroke-[2.5]" />
            <span className="truncate max-w-[160px] sm:max-w-none">{saveSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Main Page Search + Popup Filter Modal for Settings Category */}
      <SearchAndFilterBar
        searchPlaceholder="Search settings or click Filter to switch category..."
        searchValue={settingsSearch}
        onSearchChange={(val) => {
          setSettingsSearch(val);
          const q = val.toLowerCase();
          if (q.includes('email') || q.includes('smtp')) setActiveSubTab('email');
          else if (q.includes('google') || q.includes('drive') || q.includes('calendar')) setActiveSubTab('workspace');
          else if (q.includes('whatsapp')) setActiveSubTab('whatsapp');
          else if (q.includes('ai') || q.includes('model')) setActiveSubTab('ai');
          else if (q.includes('pay') || q.includes('stripe') || q.includes('paystack')) setActiveSubTab('payments');
          else if (q.includes('log') || q.includes('voice')) setActiveSubTab('voice_logs');
          else if (q.includes('currency') || q.includes('bank') || q.includes('vat')) setActiveSubTab('profile');
        }}
        activeFiltersCount={activeSubTab !== 'profile' ? 1 : 0}
        onResetFilters={() => setActiveSubTab('profile')}
        filterGroups={[
          {
            label: 'Settings Category',
            value: activeSubTab,
            onChange: setActiveSubTab,
            options: [
              { label: 'Business & Currency', value: 'profile' },
              { label: 'Email & Templates', value: 'email' },
              { label: 'Google Workspace', value: 'workspace' },
              { label: 'WhatsApp Cloud API', value: 'whatsapp' },
              { label: 'AI Model & Voice', value: 'ai' },
              { label: 'Payment Gateways', value: 'payments' },
              { label: `Voice Logs (${voiceActions.length})`, value: 'voice_logs' },
              { label: 'UI/UX Consistency Rules', value: 'governance' },
            ],
          },
        ]}
      />

      {/* SUBTAB 1: BUSINESS PROFILE & CURRENCY */}
      {activeSubTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          {/* Official Brand Assets: Company Logo & App Logo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#F5F8FC] border border-blue-100 rounded-2xl">
            <div className="flex items-center gap-4 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="w-14 h-14 rounded-xl bg-white border border-slate-100 flex items-center justify-center p-1.5 shrink-0">
                <img
                  src={COMPANY_LOGO_URL}
                  alt="AIConsults Company Logo"
                  className="w-full h-full object-contain scale-125"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0D5EF4]">
                  Official Company Logo
                </span>
                <div className="text-sm font-extrabold text-[#0B192C]">AIConsults Corporate Mark</div>
                <div className="text-[11px] text-slate-500">
                  Active on Desktop Header, Executive A4 Invoices, Proposals & Client Portal
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shrink-0">
                <img
                  src={APP_LOGO_URL}
                  alt="AIConsults App Icon"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#16A34A]">
                  Mobile & Web App Icon
                </span>
                <div className="text-sm font-extrabold text-[#0B192C]">AIConsults App Launcher</div>
                <div className="text-[11px] text-slate-500">
                  Active on Android App Bar, Splash Screen & Browser Favicon
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-extrabold text-[#0B192C] border-b border-slate-100 pb-2">
              Business Identity & International Currency
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Company / Operating Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full bg-[#F5F8FC] border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#0B192C] focus:outline-none focus:border-[#0D5EF4] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Primary Operating Currency</label>
                <select
                  value={profileForm.currency}
                  onChange={(e) => {
                    const c = e.target.value;
                    const symbols: Record<string, string> = {
                      USD: '$',
                      EUR: '€',
                      GBP: '£',
                      NGN: '₦',
                      CAD: 'CA$',
                      AUD: 'A$',
                      JPY: '¥',
                    };
                    setProfileForm({
                      ...profileForm,
                      currency: c,
                      currencySymbol: symbols[c] || '$',
                    });
                  }}
                  className="w-full bg-[#F5F8FC] border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#0B192C] focus:outline-none focus:border-[#0D5EF4] focus:bg-white transition-all"
                >
                  <option value="NGN">NGN — Nigerian Naira (₦)</option>
                  <option value="USD">USD — US Dollar ($)</option>
                  <option value="EUR">EUR — Euro (€)</option>
                  <option value="GBP">GBP — British Pound (£)</option>
                  <option value="CAD">CAD — Canadian Dollar (CA$)</option>
                  <option value="AUD">AUD — Australian Dollar (A$)</option>
                  <option value="JPY">JPY — Japanese Yen (¥)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  VAT Rate Variable (%)
                </label>
                <div className="space-y-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={profileForm.taxRate}
                    onChange={(e) => setProfileForm({ ...profileForm, taxRate: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#F5F8FC] border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-[#0B192C] focus:outline-none focus:border-[#0D5EF4] focus:bg-white transition-all"
                  />
                  <div className="flex flex-wrap items-center gap-1">
                    {[
                      { label: '0% Exempt', val: 0 },
                      { label: '5%', val: 5 },
                      { label: '7.5% VAT', val: 7.5 },
                      { label: '10%', val: 10 },
                      { label: '15%', val: 15 },
                      { label: '20%', val: 20 },
                    ].map((preset) => (
                      <button
                        key={preset.val}
                        type="button"
                        onClick={() => setProfileForm({ ...profileForm, taxRate: preset.val })}
                        className={`px-2 py-0.5 rounded-lg font-mono text-[10px] font-bold transition-colors ${
                          profileForm.taxRate === preset.val
                            ? 'bg-[#0D5EF4] text-white'
                            : 'bg-[#F5F8FC] text-slate-600 border border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Business Owner</label>
                <input
                  type="text"
                  required
                  value={profileForm.ownerName}
                  onChange={(e) => setProfileForm({ ...profileForm, ownerName: e.target.value })}
                  className="w-full bg-[#F5F8FC] border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#0B192C] focus:outline-none focus:border-[#0D5EF4] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Official Support Email</label>
                <input
                  type="email"
                  required
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full bg-[#F5F8FC] border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#0B192C] focus:outline-none focus:border-[#0D5EF4] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Business Phone</label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full bg-[#F5F8FC] border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#0B192C] focus:outline-none focus:border-[#0D5EF4] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Invoice Number Prefix</label>
                <input
                  type="text"
                  value={profileForm.invoicePrefix}
                  onChange={(e) => setProfileForm({ ...profileForm, invoicePrefix: e.target.value })}
                  className="w-full bg-[#F5F8FC] border border-slate-200/90 rounded-xl px-3.5 py-2.5 font-mono text-xs font-bold text-[#0B192C] focus:outline-none focus:border-[#0D5EF4] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Quotation Prefix</label>
                <input
                  type="text"
                  value={profileForm.quotationPrefix}
                  onChange={(e) => setProfileForm({ ...profileForm, quotationPrefix: e.target.value })}
                  className="w-full bg-[#F5F8FC] border border-slate-200/90 rounded-xl px-3.5 py-2.5 font-mono text-xs font-bold text-[#0B192C] focus:outline-none focus:border-[#0D5EF4] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Standard Payment Terms (Days)</label>
                <input
                  type="number"
                  value={profileForm.defaultPaymentTerms}
                  onChange={(e) => setProfileForm({ ...profileForm, defaultPaymentTerms: parseInt(e.target.value) || 14 })}
                  className="w-full bg-[#F5F8FC] border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-[#0B192C] focus:outline-none focus:border-[#0D5EF4] focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Banking Instructions */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="text-sm font-extrabold text-[#0B192C] border-b border-slate-100 pb-2">
              Bank Account Details (Rendered on Executive Quotations & Invoices)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Receiving Bank</label>
                <input
                  type="text"
                  value={profileForm.bankName}
                  onChange={(e) => setProfileForm({ ...profileForm, bankName: e.target.value })}
                  className="w-full bg-[#F5F8FC] border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#0B192C] focus:outline-none focus:border-[#0D5EF4] focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Account / IBAN / NUBAN</label>
                <input
                  type="text"
                  value={profileForm.accountNumber}
                  onChange={(e) => setProfileForm({ ...profileForm, accountNumber: e.target.value })}
                  className="w-full bg-[#F5F8FC] border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-[#0B192C] focus:outline-none focus:border-[#0D5EF4] focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Beneficiary Account Name</label>
                <input
                  type="text"
                  value={profileForm.accountName}
                  onChange={(e) => setProfileForm({ ...profileForm, accountName: e.target.value })}
                  className="w-full bg-[#F5F8FC] border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#0B192C] focus:outline-none focus:border-[#0D5EF4] focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#0D5EF4] rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all"
            >
              <Save className="w-4 h-4 text-white stroke-[2.5]" />
              <span>Save Business Variables</span>
            </button>
          </div>
        </form>
      )}

      {/* SUBTAB 2: EMAIL INTEGRATION, SMTP & CLIENT MESSAGE TEMPLATES */}
      {activeSubTab === 'email' && (
        <form onSubmit={handleSaveEmail} className="space-y-6 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-extrabold text-[#0B192C]">Transactional Email, SMTP & Client Message Templates</h2>
                <div className="text-xs text-slate-500">
                  Powers direct client invoice/proposal dispatch, automated reminders, and smart message templates
                </div>
              </div>

              <span className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl">
                <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>{emailForm.provider} Relay Ready</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Email Service Provider</label>
                <select
                  value={emailForm.provider}
                  onChange={(e) => setEmailForm({ ...emailForm, provider: e.target.value as any })}
                  className="w-full bg-[#F5F8FC] border border-slate-200/90 rounded-xl px-3.5 py-2.5 font-semibold text-[#0B192C] focus:outline-none focus:border-[#0D5EF4]"
                >
                  <option value="Postmark">Postmark (Transactional)</option>
                  <option value="SendGrid">SendGrid</option>
                  <option value="Resend">Resend API</option>
                  <option value="SMTP">Custom SMTP / Gmail Relay</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">SMTP Host</label>
                <input
                  type="text"
                  value={emailForm.host}
                  onChange={(e) => setEmailForm({ ...emailForm, host: e.target.value })}
                  className="w-full bg-[#F5F8FC] border border-slate-200/90 rounded-xl px-3.5 py-2.5 font-mono text-xs text-[#0B192C] focus:outline-none focus:border-[#0D5EF4]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">SMTP Port & Encryption</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={emailForm.port}
                    onChange={(e) => setEmailForm({ ...emailForm, port: parseInt(e.target.value) || 587 })}
                    className="w-24 bg-[#F5F8FC] border border-slate-200/90 rounded-xl px-3 py-2.5 font-mono text-xs text-[#0B192C]"
                  />
                  <select
                    value={emailForm.encryption}
                    onChange={(e) => setEmailForm({ ...emailForm, encryption: e.target.value as any })}
                    className="flex-1 bg-[#F5F8FC] border border-slate-200/90 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#0B192C]"
                  >
                    <option value="TLS">TLS</option>
                    <option value="SSL">SSL</option>
                    <option value="None">None</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">API Key / SMTP Credentials Token</label>
                <input
                  type="password"
                  value={emailForm.apiKey}
                  onChange={(e) => setEmailForm({ ...emailForm, apiKey: e.target.value })}
                  className="w-full bg-[#F5F8FC] border border-slate-200/90 rounded-xl px-3.5 py-2.5 font-mono text-xs text-[#0B192C]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Verified Sender Name</label>
                <input
                  type="text"
                  value={emailForm.senderName}
                  onChange={(e) => setEmailForm({ ...emailForm, senderName: e.target.value })}
                  className="w-full bg-[#F5F8FC] border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#0B192C]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Sender Email Address</label>
                <input
                  type="email"
                  value={emailForm.senderEmail}
                  onChange={(e) => setEmailForm({ ...emailForm, senderEmail: e.target.value })}
                  className="w-full bg-[#F5F8FC] border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#0B192C]"
                />
              </div>
            </div>

            {/* Email Subject & Body Templates Workspace */}
            <div className="space-y-4 pt-4 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-[#0B192C] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#0D5EF4]" />
                    <span>Client Document Dispatch Templates (Subject & Message Body)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Used when clicking &ldquo;Send to Client&rdquo; on any Invoice or Quotation preview. Supports dynamic variables.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    '{{client_name}}',
                    '{{invoice_number}}',
                    '{{subtotal}}',
                    '{{vat_rate}}',
                    '{{vat_amount}}',
                    '{{amount}}',
                    '{{due_date}}',
                    '{{business_name}}',
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-blue-50 text-[#0D5EF4] border border-blue-200/70 rounded-lg font-mono text-[10px] font-bold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Invoice Dispatch Subject Line</label>
                  <input
                    type="text"
                    value={emailForm.invoiceSubject}
                    onChange={(e) => setEmailForm({ ...emailForm, invoiceSubject: e.target.value })}
                    className="w-full bg-[#F5F8FC] border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#0B192C]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Payment Reminder Subject Line</label>
                  <input
                    type="text"
                    value={emailForm.reminderSubject}
                    onChange={(e) => setEmailForm({ ...emailForm, reminderSubject: e.target.value })}
                    className="w-full bg-[#F5F8FC] border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#0B192C]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Default Invoice Email Message Template</label>
                  <textarea
                    rows={5}
                    value={invoiceBodyTemplate}
                    onChange={(e) => setInvoiceBodyTemplate(e.target.value)}
                    className="w-full bg-[#F5F8FC] border border-slate-200/90 rounded-xl p-3 text-xs text-[#0B192C] leading-relaxed focus:outline-none focus:border-[#0D5EF4] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Default Quotation / Proposal Message Template</label>
                  <textarea
                    rows={5}
                    value={quotationBodyTemplate}
                    onChange={(e) => setQuotationBodyTemplate(e.target.value)}
                    className="w-full bg-[#F5F8FC] border border-slate-200/90 rounded-xl p-3 text-xs text-[#0B192C] leading-relaxed focus:outline-none focus:border-[#0D5EF4] focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Interactive Live Email Dispatch Tester */}
            <div className="p-4 bg-[#F5F8FC] rounded-2xl border border-slate-200/80 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-[#0B192C]">Test Outbound Email Relay</div>
                  <div className="text-slate-500 text-[11px]">
                    Verify that your configured credentials can deliver invoices and client portal alerts
                  </div>
                </div>
                {emailSettings.lastTestSent && (
                  <span className="text-[11px] text-slate-500 font-mono">
                    Last verified: {emailSettings.lastTestSent}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="email"
                  value={testEmailRecipient}
                  onChange={(e) => setTestEmailRecipient(e.target.value)}
                  placeholder="recipient@example.com"
                  className="flex-1 bg-white border border-slate-200/90 rounded-xl px-3.5 py-2 text-xs text-[#0B192C]"
                />
                <button
                  type="button"
                  onClick={handleRunEmailTest}
                  disabled={isSendingTestEmail}
                  className="px-4 py-2 bg-[#0B192C] text-white rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingTestEmail ? 'Sending...' : 'Send Test Email'}</span>
                </button>
              </div>

              {testEmailResult && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                    testEmailResult.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16A34A]" />
                  <span>{testEmailResult.message}</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#0D5EF4] rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all"
            >
              <Save className="w-4 h-4 text-white stroke-[2.5]" />
              <span>Save Email & Templates</span>
            </button>
          </div>
        </form>
      )}

      {/* SUBTAB 3: GOOGLE WORKSPACE PRODUCT SUITE */}
      {activeSubTab === 'workspace' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-extrabold text-[#0B192C]">Google Workspace Productivity Suite</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Live OAuth 2.0 integration for Gmail invoice dispatch, Google Calendar milestones, Google Drive archiving, and Google Sheets ledgers
              </p>
            </div>
            <button
              type="button"
              onClick={handleConnectGoogleWorkspace}
              disabled={workspaceLoading === 'connect'}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs ${
                isGoogleConnected
                  ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200'
                  : 'bg-[#0D5EF4] text-white hover:bg-blue-700'
              }`}
            >
              {workspaceLoading === 'connect' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>{isGoogleConnected ? 'Google Workspace Connected (Re-authorize)' : 'Connect Google Workspace'}</span>
            </button>
          </div>

          {workspaceActionStatus && (
            <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs font-bold text-[#0B192C] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0D5EF4] shrink-0" />
                <span>{workspaceActionStatus}</span>
              </div>
              {workspaceActionLink && (
                <a
                  href={workspaceActionLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-[#0D5EF4] text-white text-[11px] font-bold flex items-center gap-1 shrink-0 hover:bg-blue-700"
                >
                  <span>Open in Google</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#F5F8FC] border border-slate-200/80 flex flex-col justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0D5EF4] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-[#0B192C]">Gmail Direct Dispatch</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-[#16A34A]">
                      gmail.send
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Dispatches Executive A4 Invoices, Commercial Proposals, and Payment Reminders directly from your verified Google Workspace email address.
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200/60 flex justify-end">
                <span className="text-[11px] font-bold text-[#0D5EF4]">
                  Active inside &ldquo;Send to Client&rdquo; on all Invoices &amp; Quotations
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F5F8FC] border border-slate-200/80 flex flex-col justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0D5EF4] flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-[#0B192C]">Google Calendar Milestones</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-[#16A34A]">
                      calendar.events
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Schedules client discovery calls, project milestone deadlines, and invoice due-date alerts on your primary Google Calendar.
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200/60 flex justify-end">
                <button
                  type="button"
                  disabled={workspaceLoading === 'calendar'}
                  onClick={handleSyncCalendarMilestones}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0D5EF4] hover:bg-blue-700 text-white text-[11px] font-bold transition-colors"
                >
                  {workspaceLoading === 'calendar' ? 'Syncing...' : 'Sync Next Milestone to Calendar'}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F5F8FC] border border-slate-200/80 flex flex-col justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0D5EF4] flex items-center justify-center shrink-0">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-[#0B192C]">Google Drive Client Vault</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-[#16A34A]">
                      drive.file
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Archives generated Tax Invoices, signed Commercial Quotations, and project deliverables directly into your Google Drive.
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200/60 flex justify-end">
                <button
                  type="button"
                  disabled={workspaceLoading === 'drive'}
                  onClick={handleArchiveInvoicesToDrive}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0D5EF4] hover:bg-blue-700 text-white text-[11px] font-bold transition-colors"
                >
                  {workspaceLoading === 'drive' ? 'Uploading...' : 'Archive Latest Invoice to Drive'}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F5F8FC] border border-slate-200/80 flex flex-col justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0D5EF4] flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-[#0B192C]">Google Sheets Financial Ledger</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-[#16A34A]">
                      spreadsheets
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Exports real-time received payments, outstanding receivables, and operating expenses into a live Google Sheet.
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200/60 flex justify-end">
                <button
                  type="button"
                  disabled={workspaceLoading === 'sheets'}
                  onClick={handleExportLedgerToSheets}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0D5EF4] hover:bg-blue-700 text-white text-[11px] font-bold transition-colors"
                >
                  {workspaceLoading === 'sheets' ? 'Exporting...' : 'Export Ledger to Google Sheets'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: WHATSAPP CLOUD API */}
      {activeSubTab === 'whatsapp' && (
        <form onSubmit={handleSaveWhatsApp} className="space-y-6 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-extrabold text-[#0B192C]">Official WhatsApp Business Cloud API</h2>
                <div className="text-xs text-slate-500">
                  Connects incoming client messages and requirements gathering to CRM
                </div>
              </div>
              <span className="flex items-center gap-1 px-3 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl">
                <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>Meta WABA Active</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">WhatsApp Phone Number ID</label>
                <input
                  type="text"
                  value={whatsAppForm.phoneNumberId}
                  onChange={(e) => setWhatsAppForm({ ...whatsAppForm, phoneNumberId: e.target.value })}
                  className="w-full bg-[#F5F8FC] border border-slate-200/90 rounded-xl px-3.5 py-2.5 font-mono text-xs text-[#0B192C]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Meta Business Account ID (WABA)</label>
                <input
                  type="text"
                  value={whatsAppForm.businessAccountId}
                  onChange={(e) => setWhatsAppForm({ ...whatsAppForm, businessAccountId: e.target.value })}
                  className="w-full bg-[#F5F8FC] border border-slate-200/90 rounded-xl px-3.5 py-2.5 font-mono text-xs text-[#0B192C]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1.5">Permanent System User Token</label>
                <input
                  type="password"
                  value={whatsAppForm.accessToken}
                  onChange={(e) => setWhatsAppForm({ ...whatsAppForm, accessToken: e.target.value })}
                  className="w-full bg-[#F5F8FC] border border-slate-200/90 rounded-xl px-3.5 py-2.5 font-mono text-xs text-[#0B192C]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1.5">Webhook Ingest URL</label>
                <input
                  type="text"
                  readOnly
                  value={whatsAppForm.webhookUrl}
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3.5 py-2.5 font-mono text-xs text-slate-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Webhook Verify Secret</label>
                <input
                  type="password"
                  value={whatsAppForm.webhookSecret}
                  onChange={(e) => setWhatsAppForm({ ...whatsAppForm, webhookSecret: e.target.value })}
                  className="w-full bg-[#F5F8FC] border border-slate-200/90 rounded-xl px-3.5 py-2.5 font-mono text-xs text-[#0B192C]"
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={whatsAppForm.autoReplyEnabled}
                    onChange={(e) => setWhatsAppForm({ ...whatsAppForm, autoReplyEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0D5EF4]"></div>
                </label>
                <span className="font-semibold text-[#0B192C]">
                  Enable automated AI assistant responses when owner is away
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#0D5EF4] rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all"
            >
              <Save className="w-4 h-4 text-white stroke-[2.5]" />
              <span>Save WhatsApp Integration</span>
            </button>
          </div>
        </form>
      )}

      {/* SUBTAB 5: AI MODEL & VOICE TRANSCRIBE */}
      {activeSubTab === 'ai' && (
        <form onSubmit={handleSaveAI} className="space-y-6 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-extrabold text-[#0B192C]">AI Intelligence Provider & Voice Processing</h2>
                <div className="text-xs text-slate-500">
                  Powers requirements summarization, voice transactions, and draft quotation synthesis
                </div>
              </div>
              <span className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl">
                <Bot className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>@google/genai Model Ready</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Intelligence Provider</label>
                <select
                  value={aiForm.provider}
                  onChange={(e) => setAIForm({ ...aiForm, provider: e.target.value as any })}
                  className="w-full bg-[#F5F8FC] border border-slate-200/90 rounded-xl px-3.5 py-2.5 font-semibold text-[#0B192C]"
                >
                  <option value="Google Gemini">Google Gemini (@google/genai)</option>
                  <option value="OpenAI">OpenAI Compatible Endpoint</option>
                  <option value="Custom">Custom Self-Hosted LLM</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Target Model</label>
                <select
                  value={aiForm.model}
                  onChange={(e) => setAIForm({ ...aiForm, model: e.target.value })}
                  className="w-full bg-[#F5F8FC] border border-slate-200/90 rounded-xl px-3.5 py-2.5 font-mono text-[#0B192C]"
                >
                  <option value="models/gemini-2.5-flash">models/gemini-2.5-flash (Fast & Cost Efficient)</option>
                  <option value="models/gemini-2.5-pro">models/gemini-2.5-pro (Deep Extraction)</option>
                  <option value="models/gemini-2.0-flash">models/gemini-2.0-flash</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Daily Token Budget Cap</label>
                <input
                  type="number"
                  value={aiForm.dailyTokenCap}
                  onChange={(e) => setAIForm({ ...aiForm, dailyTokenCap: parseInt(e.target.value) || 500000 })}
                  className="w-full bg-[#F5F8FC] border border-slate-200/90 rounded-xl px-3.5 py-2.5 font-mono text-xs text-[#0B192C]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Voice Recognition Language</label>
                <select
                  value={aiForm.voiceTranscribeLanguage}
                  onChange={(e) => setAIForm({ ...aiForm, voiceTranscribeLanguage: e.target.value })}
                  className="w-full bg-[#F5F8FC] border border-slate-200/90 rounded-xl px-3.5 py-2.5 font-semibold text-[#0B192C]"
                >
                  <option value="en-US">English (United States)</option>
                  <option value="en-GB">English (UK / Commonwealth)</option>
                  <option value="en-NG">English (Nigeria)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Temperature (Creativity vs Determinism)</label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="1"
                  value={aiForm.temperature}
                  onChange={(e) => setAIForm({ ...aiForm, temperature: parseFloat(e.target.value) || 0.2 })}
                  className="w-full bg-[#F5F8FC] border border-slate-200/90 rounded-xl px-3.5 py-2.5 font-mono text-xs text-[#0B192C]"
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aiForm.autoExecuteHighConfidenceActions}
                    onChange={(e) => setAIForm({ ...aiForm, autoExecuteHighConfidenceActions: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0D5EF4]"></div>
                </label>
                <span className="font-semibold text-[#0B192C]">
                  Auto-execute voice payment commands with confidence &gt; 95%
                </span>
              </div>
            </div>

            {/* Token Consumption Meter */}
            <div className="p-4 bg-[#F5F8FC] rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#0B192C]">Today&apos;s Token Consumption</span>
                <span className="font-mono font-bold text-[#0D5EF4]">
                  {aiForm.usedTokensToday.toLocaleString()} / {aiForm.dailyTokenCap.toLocaleString()} tokens (8.4%)
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#0D5EF4] h-full rounded-full"
                  style={{ width: `${(aiForm.usedTokensToday / aiForm.dailyTokenCap) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#0D5EF4] rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all"
            >
              <Save className="w-4 h-4 text-white stroke-[2.5]" />
              <span>Save AI & Voice Parameters</span>
            </button>
          </div>
        </form>
      )}

      {/* SUBTAB 6: PAYMENT GATEWAYS */}
      {activeSubTab === 'payments' && (
        <form onSubmit={handleSavePayment} className="space-y-6 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-extrabold text-[#0B192C]">Payment Gateway Integrations</h2>
                <div className="text-xs text-slate-500">
                  Configures online client portal payment checkout (Stripe, Paystack, Flutterwave)
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Primary Gateway</label>
                <select
                  value={paymentForm.provider}
                  onChange={(e) => setPaymentForm({ ...paymentForm, provider: e.target.value as any })}
                  className="w-full bg-[#F5F8FC] border border-slate-200/90 rounded-xl px-3.5 py-2.5 font-semibold text-[#0B192C]"
                >
                  <option value="Paystack">Paystack (Nigeria NGN / Africa Cards & Transfers)</option>
                  <option value="Stripe">Stripe (Global USD / EUR / GBP Cards)</option>
                  <option value="Flutterwave">Flutterwave</option>
                  <option value="Bank Transfer">Direct Bank Wire Only</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Stripe Publishable Key</label>
                <input
                  type="text"
                  value={paymentForm.stripePublishableKey}
                  onChange={(e) => setPaymentForm({ ...paymentForm, stripePublishableKey: e.target.value })}
                  className="w-full bg-[#F5F8FC] border border-slate-200/90 rounded-xl px-3.5 py-2.5 font-mono text-xs text-[#0B192C]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Paystack Public Key</label>
                <input
                  type="text"
                  value={paymentForm.paystackPublicKey}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paystackPublicKey: e.target.value })}
                  className="w-full bg-[#F5F8FC] border border-slate-200/90 rounded-xl px-3.5 py-2.5 font-mono text-xs text-[#0B192C]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Webhook Secret Verification Key</label>
                <input
                  type="password"
                  value={paymentForm.webhookSecret}
                  onChange={(e) => setPaymentForm({ ...paymentForm, webhookSecret: e.target.value })}
                  className="w-full bg-[#F5F8FC] border border-slate-200/90 rounded-xl px-3.5 py-2.5 font-mono text-xs text-[#0B192C]"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#0D5EF4] rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all"
            >
              <Save className="w-4 h-4 text-white stroke-[2.5]" />
              <span>Save Payment Gateways</span>
            </button>
          </div>
        </form>
      )}

      {/* SUBTAB 7: VOICE ACTIONS & AUDIT LOGS */}
      {activeSubTab === 'voice_logs' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-extrabold text-[#0B192C]">Voice Record & Dictation Execution Log</h2>
              <div className="text-xs text-slate-500">
                Audit records of spoken commands converted into milestones and payments
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {voiceActions.map((va) => (
              <div key={va.id} className="p-4 bg-[#F5F8FC] rounded-2xl border border-slate-200/80 text-xs space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-[#0D5EF4] text-white rounded-xl flex items-center justify-center shrink-0 shadow-xs">
                      <Mic className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-[#0B192C]">&ldquo;{va.transcript}&quot;</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {va.timestamp} · Audio Duration: {va.audioDurationSeconds}s · Confidence: {(va.confidenceScore * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 text-[#16A34A] border border-emerald-200">
                    {va.executedStatus}
                  </span>
                </div>

                <div className="pl-10 text-slate-700 text-[11.5px] border-t border-slate-200/60 pt-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                  <span>{va.executionSummary}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 8: UI/UX DESIGN & CONSISTENCY GOVERNANCE RULES */}
      {activeSubTab === 'governance' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-extrabold text-[#0B192C]">AIConsults UI/UX Design & Consistency Constitution</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Enforced across Desktop, Android Mobile App, Client Portal, Executive Documents, and all Interactive Modals
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl text-[11px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
              100% Enforced Across All Views
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#F5F8FC] border border-slate-200/80 space-y-1.5">
              <div className="font-extrabold text-[#0B192C] flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-[#0D5EF4] text-white text-[10px] font-bold flex items-center justify-center">1</span>
                <span>Zero Top-Right &ldquo;X&rdquo; Close Buttons on Modals</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                All Android and Desktop modals behave like native mobile/desktop sheets: top drag-handle pill indicator, backdrop click-to-dismiss, Escape key support, and an explicit bottom <span className="font-bold">Dismiss</span> button paired with the primary CTA.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F5F8FC] border border-slate-200/80 space-y-1.5">
              <div className="font-extrabold text-[#0B192C] flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-[#0D5EF4] text-white text-[10px] font-bold flex items-center justify-center">2</span>
                <span>Unified Royal Blue &amp; Midnight Navy Brand System</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Primary actions use Royal Blue (<code className="font-mono text-[#0D5EF4]">#0D5EF4</code>), deep headers use Midnight Navy (<code className="font-mono text-[#0B192C]">#0B192C</code>), surfaces use Soft Slate-Blue (<code className="font-mono">#F5F8FC</code>), Received uses Semantic Green (<code className="font-mono text-[#16A34A]">#16A34A</code>), and Outstanding uses Semantic Red (<code className="font-mono text-[#DC2626]">#DC2626</code>).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F5F8FC] border border-slate-200/80 space-y-1.5">
              <div className="font-extrabold text-[#0B192C] flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-[#0D5EF4] text-white text-[10px] font-bold flex items-center justify-center">3</span>
                <span>Executive Document Preview &amp; Templated Dispatch</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Invoices and Quotations render inside a high-contrast A4 corporate preview sheet with one-click standalone HTML/PDF download and a dedicated Client Email Dispatch Modal with customizable templates.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F5F8FC] border border-slate-200/80 space-y-1.5">
              <div className="font-extrabold text-[#0B192C] flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-[#0D5EF4] text-white text-[10px] font-bold flex items-center justify-center">4</span>
                <span>No View Left Behind (Strict Visual Parity)</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Every card uses <code className="font-mono">rounded-2xl</code> geometry, <code className="font-mono">Plus Jakarta Sans</code> typography, and <code className="font-mono">tabular-nums</code> monospace figures for all currency amounts across Android, Desktop, and Client Portal views.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

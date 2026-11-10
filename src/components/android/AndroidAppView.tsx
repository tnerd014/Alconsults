import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import {
  Home,
  Users,
  Briefcase,
  MoreHorizontal,
  Plus,
  Bell,
  TrendingUp,
  Folder,
  FileText,
  Calculator,
  Check,
  Layers,
  ChevronRight,
  CreditCard,
  Mic,
  Minimize2,
  Maximize2,
  Phone,
  Mail,
  CheckCircle2,
  FileSpreadsheet,
  MessageSquare,
  Send,
  Download,
  Printer,
  Eye,
} from 'lucide-react';
import { BrandLogo, COMPANY_LOGO_URL, APP_LOGO_URL } from '../common/BrandLogo';
import { VoiceRecordModal } from '../modals/VoiceRecordModal';
import { SendDocumentEmailModal } from '../modals/SendDocumentEmailModal';
import { Invoice, Quotation, Payment, Client } from '../../types';

export const AndroidAppView: React.FC = () => {
  const {
    financials,
    profile,
    updateProfile,
    projects,
    invoices,
    quotations,
    leads,
    clients,
    payments,
    recordPayment,
    createLead,
    toggleMilestoneStatus,
    acceptQuotation,
  } = useBusiness();

  // Simulator controls
  const [isFullViewport, setIsFullViewport] = useState(false);
  const [showSplashPreview, setShowSplashPreview] = useState(false);

  // Main bottom navigation tabs matching the template: Home | Clients | (+) | Projects | More
  const [activeTab, setActiveTab] = useState<'home' | 'clients' | 'projects' | 'more'>('home');
  const [moreSubView, setMoreSubView] = useState<'menu' | 'invoices' | 'quotations' | 'payments' | 'activities'>('menu');

  // Bottom sheet state for center (+) button
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<'action_menu' | 'quick_payment' | 'quick_lead'>('action_menu');

  // Native Mobile Document & Receipt Preview Sheet state
  const [previewItem, setPreviewItem] = useState<
    | { type: 'invoice'; data: Invoice }
    | { type: 'quotation'; data: Quotation }
    | { type: 'payment'; data: Payment }
    | { type: 'client'; data: Client }
    | null
  >(null);

  // Voice recording modal state (supports both general voice transactions & specific project milestones)
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [voiceTargetMilestone, setVoiceTargetMilestone] = useState<{
    projectId: string;
    milestoneId: string;
    title: string;
  } | null>(null);

  // Mobile email dispatch state
  const [mobileEmailDoc, setMobileEmailDoc] = useState<{
    type: 'invoice' | 'quotation';
    invoice?: Invoice;
    quotation?: Quotation;
  } | null>(null);

  // Quick payment form
  const unpaidInvoices = invoices.filter((i) => i.balanceDue > 0);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(unpaidInvoices[0]?.id || invoices[0]?.id || '');
  const [paymentAmount, setPaymentAmount] = useState<number>(unpaidInvoices[0]?.balanceDue || 150000);

  // Quick lead form
  const [leadName, setLeadName] = useState('');
  const [leadCompany, setLeadCompany] = useState('');
  const [leadValue] = useState(250000);

  // Compact number & currency formatting matching the template (e.g. ₦1.2M, ₦285K, ₦950K)
  const sym = profile.currencySymbol || '₦';
  const isNgn = profile.currency === 'NGN';

  const formatMoney = (amount: number) => `${sym}${amount.toLocaleString()}`;

  const formatCompact = (amount: number, fallbackNgnDisplay?: string) => {
    if (isNgn && fallbackNgnDisplay) return fallbackNgnDisplay;
    const scaled = isNgn ? amount * 30 : amount;
    if (scaled >= 1_000_000) {
      return `${sym}${(scaled / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    }
    if (scaled >= 1_000) {
      return `${sym}${Math.round(scaled / 1_000)}K`;
    }
    return `${sym}${scaled.toLocaleString()}`;
  };

  // Computed metrics aligned with template + live state increments
  const extraClientsCount = Math.max(0, clients.length - 5);
  const displayClientCount = 24 + extraClientsCount;

  const activeProjectsList = projects.filter((p) => p.stage !== 'Completed');
  const displayProjectCount = Math.max(6, projects.length + 2);
  const displayActiveProjectsCount = activeProjectsList.length;
  const avgProgress =
    activeProjectsList.length > 0
      ? Math.round(activeProjectsList.reduce((acc, p) => acc + p.progressPercent, 0) / activeProjectsList.length)
      : 67;

  const extraCollected = Math.max(0, financials.collectedAmount - 25225);
  const displayInvoiced = isNgn
    ? `₦${((1200000 + extraCollected * 30) / 1000000).toFixed(1)}M`
    : formatCompact(financials.invoicedAmount);

  const displayOutstanding = isNgn
    ? `₦${Math.max(0, Math.round((285000 - extraCollected * 30) / 1000))}K`
    : formatCompact(financials.outstandingAmount);

  const displayReceived = isNgn
    ? `₦${Math.round((950000 + extraCollected * 30) / 1000)}K`
    : formatCompact(financials.collectedAmount);

  const displayQuotationsCount = quotations.length;

  // SVG Circle math for Active Projects 67% ring
  const ringRadius = 22;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringStrokeDashoffset = ringCircumference - (avgProgress / 100) * ringCircumference;

  const handleRecordQuickPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const inv = invoices.find((i) => i.id === selectedInvoiceId) || invoices[0];
    if (!inv || paymentAmount <= 0) return;

    recordPayment({
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      clientId: inv.clientId,
      clientName: inv.clientName,
      projectId: inv.projectId,
      amount: paymentAmount,
      paymentDate: new Date().toISOString().split('T')[0],
      method: 'Bank Transfer',
      transactionReference: `MOB-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      notes: 'Recorded via AIConsults Android Dashboard',
    });
    setIsBottomSheetOpen(false);
  };

  const handleCreateQuickLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim()) return;

    createLead({
      name: leadName,
      company: leadCompany || 'Digital Solutions',
      email: `${leadName.toLowerCase().replace(/\s+/g, '.')}@client.com`,
      phone: '+234 803 000 0000',
      source: 'Mobile App',
      serviceRequested: 'Enterprise Web & AI Integration',
      initialEnquiry: 'Enquiry logged via Android app',
      estimatedValue: leadValue,
      expectedTimeline: '6 weeks',
      budget: leadValue,
      status: 'New Enquiry',
      followUpDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      internalNotes: 'Captured from mobile quick action',
    });
    setLeadName('');
    setLeadCompany('');
    setIsBottomSheetOpen(false);
  };

  const toggleCurrencyNgnUsd = () => {
    if (profile.currency === 'NGN') {
      updateProfile({ ...profile, currency: 'USD', currencySymbol: '$' });
    } else {
      updateProfile({ ...profile, currency: 'NGN', currencySymbol: '₦' });
    }
  };

  // Download standalone HTML document from mobile preview with full VAT breakdown
  const handleDownloadMobileDoc = (
    title: string,
    docNumber: string,
    clientName: string,
    subtotal: number,
    vatRate: number,
    vatAmount: number,
    total: number,
    items: Array<{ description: string; quantity: number; unitPrice: number; total: number }>
  ) => {
    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>${title} ${docNumber} — ${profile.name}</title>
<style>
  body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; background: #F5F8FC; padding: 32px; color: #0B192C; }
  .sheet { max-width: 720px; margin: 0 auto; background: #fff; border-radius: 20px; padding: 36px; border: 1px solid #E2E8F0; }
  .bar { height: 6px; background: linear-gradient(90deg, #0B192C, #0D5EF4); border-radius: 6px; margin-bottom: 24px; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th { text-align: left; font-size: 11px; text-transform: uppercase; color: #64748B; border-bottom: 2px solid #E2E8F0; padding: 10px 6px; }
  td { padding: 12px 6px; border-bottom: 1px solid #F1F5F9; font-size: 13px; }
</style>
</head>
<body>
  <div class="sheet">
    <div class="bar"></div>
    <h1 style="margin:0;color:#0D5EF4;font-size:20px;">${profile.name}</h1>
    <p style="margin:4px 0 20px;font-size:12px;color:#64748B;">${title} · <strong>${docNumber}</strong> · Prepared for <strong>${clientName}</strong></p>
    <table>
      <thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th>VAT</th><th style="text-align:right">Total</th></tr></thead>
      <tbody>
        ${items.map((it) => `<tr><td>${it.description}</td><td>${it.quantity}</td><td>${formatMoney(it.unitPrice)}</td><td>${vatRate}%</td><td style="text-align:right;font-weight:700">${formatMoney(it.total)}</td></tr>`).join('')}
      </tbody>
    </table>
    <div style="text-align:right;font-size:13px;color:#475569;margin-top:12px;">
      <div>Subtotal (Excl. VAT): <strong>${formatMoney(subtotal)}</strong></div>
      <div style="margin-top:4px;">VAT (${vatRate}%): <strong>${formatMoney(vatAmount)}</strong></div>
      <h2 style="margin-top:8px;color:#0B192C;">Total (Incl. VAT): ${formatMoney(total)}</h2>
    </div>
    <p style="font-size:12px;color:#64748B;border-top:1px solid #E2E8F0;padding-top:14px;">Bank: ${profile.bankName} · Account: ${profile.accountNumber} (${profile.accountName})</p>
  </div>
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docNumber}_${clientName.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="py-6 px-4 flex flex-col items-center min-h-[calc(100vh-3.5rem)] bg-[#EEF2F8]">
      {/* Top Simulator Bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 w-full max-w-[410px]">
        <div className="flex items-center gap-2">
          <img src={APP_LOGO_URL} alt="AIConsults App Icon" className="w-7 h-7 rounded-lg shadow-xs object-contain" />
          <span className="text-xs font-bold text-[#0B192C]">AIConsults Android</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleCurrencyNgnUsd}
            className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-[11px] font-bold text-[#0D5EF4] hover:bg-blue-50 transition-colors"
            title="Switch between NGN (₦) and USD ($)"
          >
            {profile.currency === 'NGN' ? '₦ NGN' : '$ USD'}
          </button>

          <button
            onClick={() => setShowSplashPreview(!showSplashPreview)}
            className={`px-2.5 py-1 border rounded-lg text-[11px] font-semibold transition-colors ${
              showSplashPreview
                ? 'bg-[#0D5EF4] text-white border-[#0D5EF4]'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {showSplashPreview ? 'Exit Splash' : 'App Splash'}
          </button>

          <button
            onClick={() => setIsFullViewport(!isFullViewport)}
            className="p-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
            title={isFullViewport ? 'Phone Frame' : 'Expand Width'}
          >
            {isFullViewport ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Mobile Device Viewport */}
      <div
        className={`bg-[#F5F8FC] shadow-2xl transition-all duration-200 flex flex-col overflow-hidden relative select-none ${
          isFullViewport
            ? 'w-full max-w-[460px] h-[860px] rounded-3xl border border-slate-300'
            : 'w-full max-w-[395px] h-[820px] rounded-[46px] border-[7px] border-[#0B192C]'
        }`}
      >
        {/* Optional Brand Splash Screen Overlay */}
        {showSplashPreview && (
          <div
            onClick={() => setShowSplashPreview(false)}
            className="absolute inset-0 z-50 bg-gradient-to-b from-[#69A9FF] via-[#EBF3FF] to-[#0D5EF4] flex flex-col items-center justify-between p-8 cursor-pointer animate-in fade-in"
          >
            <div className="w-full flex justify-between items-center text-xs font-bold text-[#0B192C]/80 pt-2">
              <span>9:41</span>
              <span>5G · 100%</span>
            </div>

            <div className="flex flex-col items-center text-center my-auto">
              <div className="w-28 h-28 rounded-3xl bg-white shadow-xl flex items-center justify-center p-3 mb-5">
                <img
                  src={COMPANY_LOGO_URL}
                  alt="AIConsults Logo"
                  className="w-full h-full object-contain scale-125"
                />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#0B192C]">AIConsults</h1>
              <p className="text-xs font-semibold tracking-widest uppercase text-[#0D5EF4] mt-2">
                Plan · Organize · Achieve
              </p>
            </div>

            <div className="w-full text-center space-y-3 pb-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 text-[#0B192C] text-xs font-bold shadow-md">
                <span>Tap anywhere to enter Dashboard</span>
                <ChevronRight className="w-4 h-4 text-[#0D5EF4]" />
              </div>
            </div>
          </div>
        )}

        {/* Status Bar (9:41 + Signal, Wi-Fi, Battery) */}
        <div className="h-10 px-6 pt-2 flex items-center justify-between text-[13px] font-bold text-[#0B192C] shrink-0 bg-[#F5F8FC] z-20">
          <span className="tracking-tight">9:41</span>
          <div className="flex items-center gap-1.5">
            <div className="flex items-end gap-[2px] h-3">
              <span className="w-[3px] h-1.5 bg-[#0B192C] rounded-xs" />
              <span className="w-[3px] h-2 bg-[#0B192C] rounded-xs" />
              <span className="w-[3px] h-2.5 bg-[#0B192C] rounded-xs" />
              <span className="w-[3px] h-3 bg-[#0B192C] rounded-xs" />
            </div>
            <svg className="w-4 h-3.5 text-[#0B192C]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4.5C7 4.5 2.7 6.6 0 10l2.1 2.1C4.4 9.2 8 7.5 12 7.5s7.6 1.7 9.9 4.6L24 10c-2.7-3.4-7-5.5-12-5.5zm0 6c-3.3 0-6.3 1.4-8.4 3.6L5.7 16c1.6-1.7 3.8-2.5 6.3-2.5s4.7.8 6.3 2.5l2.1-1.9c-2.1-2.2-5.1-3.6-8.4-3.6zm0 6c-1.8 0-3.4.8-4.5 2L12 23l4.5-4.5c-1.1-1.2-2.7-2-4.5-2z" />
            </svg>
            <div className="w-6 h-3 rounded-[4px] border border-[#0B192C]/60 p-[1.5px] flex items-center relative">
              <div className="w-full h-full bg-[#0B192C] rounded-[2px]" />
              <div className="w-[2px] h-1.5 bg-[#0B192C]/60 rounded-r-xs absolute -right-[3px]" />
            </div>
          </div>
        </div>

        {/* Top App Bar: AIConsults Logo + Voice Mic + Bell + User Avatar */}
        <div className="px-5 py-2.5 bg-[#F5F8FC] flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              setActiveTab('home');
              setMoreSubView('menu');
            }}
            className="flex items-center gap-2 text-left"
          >
            <BrandLogo size="md" showText={true} logoType="company" />
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setVoiceTargetMilestone(null);
                setIsVoiceModalOpen(true);
              }}
              className="w-8 h-8 rounded-full bg-blue-100/80 text-[#0D5EF4] hover:bg-blue-200/70 flex items-center justify-center transition-colors"
              title="Voice Transaction & Milestone Update"
            >
              <Mic className="w-4 h-4 stroke-[2.2]" />
            </button>

            <button
              onClick={() => {
                setActiveTab('more');
                setMoreSubView('payments');
              }}
              className="relative p-1 text-[#0B192C] hover:opacity-80 transition-opacity"
              title="Notifications & Payments"
            >
              <Bell className="w-5 h-5 stroke-[2]" />
              <span className="w-2 h-2 rounded-full bg-[#EF4444] absolute top-1 right-1 ring-2 ring-[#F5F8FC]" />
            </button>

            <button
              onClick={() => {
                setActiveTab('more');
                setMoreSubView('menu');
              }}
              className="relative w-9 h-9 rounded-full bg-slate-200 p-0.5 ring-2 ring-white shadow-xs"
              title="Business Profile & More"
            >
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#0B192C] to-[#0D5EF4] text-white flex items-center justify-center text-xs font-extrabold">
                AM
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] absolute bottom-0 right-0 ring-2 ring-white" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-5 pt-2 pb-24 space-y-4">
          {/* ========================================================= */}
          {/* TAB 1: HOME (Exact match to Android Dashboard Template!)  */}
          {/* ========================================================= */}
          {activeTab === 'home' && (
            <>
              {/* Hero Greeting Banner */}
              <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-r from-[#0047BA] via-[#0D5EF4] to-[#1D82FF] p-5 text-white shadow-lg shadow-blue-600/20">
                <svg
                  className="absolute right-0 top-0 h-full w-3/5 pointer-events-none opacity-35"
                  viewBox="0 0 200 140"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path d="M60 140 C95 85, 135 40, 200 15 L200 140 Z" fill="#002E80" />
                  <path d="M30 140 C85 95, 140 65, 200 55 L200 140 Z" fill="#3898FF" />
                </svg>

                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-blue-100">Good Morning</div>
                    <h2 className="text-[22px] font-extrabold tracking-tight text-white mt-0.5">
                      Welcome Back
                    </h2>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] shadow-xs" />
                      <span className="text-xs font-medium text-blue-50">Business Active</span>
                    </div>
                  </div>

                  <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white stroke-[2.4]" />
                  </div>
                </div>
              </div>

              {/* 3x2 Succinct Minimalistic KPI Grid */}
              <div className="grid grid-cols-3 gap-3">
                {/* 1. Clients */}
                <button
                  onClick={() => setActiveTab('clients')}
                  className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-100 flex flex-col items-center justify-center text-center hover:border-blue-200 transition-all active:scale-97"
                >
                  <div className="text-[#0D5EF4] mb-1.5">
                    <Users className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div className="text-[11px] font-medium text-slate-500">Clients</div>
                  <div className="text-[17px] font-extrabold text-[#0B192C] tabular-nums mt-0.5">
                    {displayClientCount}
                  </div>
                </button>

                {/* 2. Projects */}
                <button
                  onClick={() => setActiveTab('projects')}
                  className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-100 flex flex-col items-center justify-center text-center hover:border-blue-200 transition-all active:scale-97"
                >
                  <div className="text-[#0D5EF4] mb-1.5">
                    <Folder className="w-6 h-6 fill-[#0D5EF4] stroke-[#0D5EF4]" />
                  </div>
                  <div className="text-[11px] font-medium text-slate-500">Projects</div>
                  <div className="text-[17px] font-extrabold text-[#0B192C] tabular-nums mt-0.5">
                    {displayProjectCount}
                  </div>
                </button>

                {/* 3. Invoices (Tap to view & preview all Invoices) */}
                <button
                  onClick={() => {
                    setActiveTab('more');
                    setMoreSubView('invoices');
                  }}
                  className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-100 flex flex-col items-center justify-center text-center hover:border-blue-200 transition-all active:scale-97"
                >
                  <div className="text-[#0D5EF4] mb-1.5">
                    <FileText className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div className="text-[11px] font-medium text-slate-500">Invoices</div>
                  <div className="text-[16px] font-extrabold text-[#0B192C] tabular-nums mt-0.5">
                    {displayInvoiced}
                  </div>
                </button>

                {/* 4. Outstanding (Tap to preview unpaid invoice or record payment) */}
                <button
                  onClick={() => {
                    const firstUnpaid = invoices.find((i) => i.balanceDue > 0) || invoices[0];
                    if (firstUnpaid) {
                      setPreviewItem({ type: 'invoice', data: firstUnpaid });
                    }
                  }}
                  className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-100 flex flex-col items-center justify-center text-center hover:border-rose-200 transition-all active:scale-97"
                >
                  <div className="text-[#0D5EF4] mb-1.5">
                    <Calculator className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div className="text-[11px] font-medium text-slate-500">Outstanding</div>
                  <div className="text-[16px] font-extrabold text-[#DC2626] tabular-nums mt-0.5">
                    {displayOutstanding}
                  </div>
                </button>

                {/* 5. Received (Tap to view & preview Payment Receipts) */}
                <button
                  onClick={() => {
                    setActiveTab('more');
                    setMoreSubView('payments');
                  }}
                  className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-100 flex flex-col items-center justify-center text-center hover:border-emerald-200 transition-all active:scale-97"
                >
                  <div className="w-6 h-6 rounded-full bg-[#16A34A] text-white flex items-center justify-center mb-1.5">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div className="text-[11px] font-medium text-slate-500">Received</div>
                  <div className="text-[16px] font-extrabold text-[#16A34A] tabular-nums mt-0.5">
                    {displayReceived}
                  </div>
                </button>

                {/* 6. Quotations (Tap to view & preview Commercial Proposals) */}
                <button
                  onClick={() => {
                    setActiveTab('more');
                    setMoreSubView('quotations');
                  }}
                  className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-100 flex flex-col items-center justify-center text-center hover:border-blue-200 transition-all active:scale-97"
                >
                  <div className="text-[#0D5EF4] mb-1.5">
                    <FileSpreadsheet className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div className="text-[11px] font-medium text-slate-500">Quotations</div>
                  <div className="text-[17px] font-extrabold text-[#0B192C] tabular-nums mt-0.5">
                    {displayQuotationsCount}
                  </div>
                </button>
              </div>

              {/* Active Projects Progress Banner */}
              <button
                onClick={() => setActiveTab('projects')}
                className="w-full bg-[#EBF2FF] hover:bg-[#E1ECFF] border border-[#D5E4FF] rounded-2xl px-4 py-3.5 flex items-center justify-between transition-colors text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#0D5EF4]/10 text-[#0D5EF4] flex items-center justify-center">
                    <Layers className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#0B192C]">Active Projects</div>
                    <div className="text-xs font-semibold text-[#0D5EF4] mt-0.5">In Progress</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-2xl font-extrabold text-[#0B192C] tabular-nums">
                    {displayActiveProjectsCount}
                  </span>

                  <div className="relative w-13 h-13 flex items-center justify-center">
                    <svg className="w-13 h-13 -rotate-90" viewBox="0 0 52 52">
                      <circle cx="26" cy="26" r={ringRadius} fill="none" stroke="#CBD5E1" strokeWidth="4.5" />
                      <circle
                        cx="26"
                        cy="26"
                        r={ringRadius}
                        fill="none"
                        stroke="#16A34A"
                        strokeWidth="4.5"
                        strokeLinecap="round"
                        strokeDasharray={ringCircumference}
                        strokeDashoffset={ringStrokeDashoffset}
                      />
                    </svg>
                    <span className="absolute text-[11px] font-extrabold text-[#0B192C] tabular-nums">
                      {avgProgress}%
                    </span>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              </button>

              {/* Recent Activity Timeline (Tap any item to preview Receipt / Quotation / Client!) */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-extrabold text-[#0B192C]">Recent Activity</h3>
                  <button
                    onClick={() => {
                      setActiveTab('more');
                      setMoreSubView('payments');
                    }}
                    className="text-xs font-bold text-[#0D5EF4] flex items-center gap-0.5 hover:underline"
                  >
                    <span>View All</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="relative pl-5 space-y-4 before:content-[''] before:absolute before:left-[7px] before:top-3 before:bottom-3 before:w-[1.5px] before:bg-slate-200">
                  {payments.length > 3 && (
                    <div
                      onClick={() => setPreviewItem({ type: 'payment', data: payments[0] })}
                      className="relative flex items-center justify-between cursor-pointer group"
                    >
                      <span className="w-3 h-3 rounded-full bg-[#0D5EF4] ring-4 ring-[#F5F8FC] absolute -left-[19px]" />
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0D5EF4] flex items-center justify-center shrink-0">
                          <CreditCard className="w-4 h-4 stroke-[2.2]" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#0B192C] group-hover:text-[#0D5EF4]">
                            Payment Received
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {payments[0].clientName} • Just now
                          </div>
                        </div>
                      </div>
                      <div className="text-xs font-extrabold text-[#16A34A] tabular-nums">
                        {sym}
                        {payments[0].amount.toLocaleString()}
                      </div>
                    </div>
                  )}

                  {/* Activity 1: Payment Received -> Opens Official Payment Receipt Preview */}
                  <div
                    onClick={() => {
                      if (payments[0]) setPreviewItem({ type: 'payment', data: payments[0] });
                    }}
                    className="relative flex items-center justify-between cursor-pointer group"
                  >
                    <span className="w-3 h-3 rounded-full bg-[#0D5EF4] ring-4 ring-[#F5F8FC] absolute -left-[19px]" />
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0D5EF4] flex items-center justify-center shrink-0">
                        <CreditCard className="w-4 h-4 stroke-[2.2]" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#0B192C] group-hover:text-[#0D5EF4]">
                          Payment Received
                        </div>
                        <div className="text-[11px] text-slate-500">ABC Technologies • 2h ago</div>
                      </div>
                    </div>
                    <div className="text-xs font-extrabold text-[#16A34A] tabular-nums">
                      {isNgn ? '₦150,000' : `${sym}4,500`}
                    </div>
                  </div>

                  {/* Activity 2: Quotation Accepted -> Opens Commercial Quotation Preview */}
                  <div
                    onClick={() => {
                      if (quotations[0]) setPreviewItem({ type: 'quotation', data: quotations[0] });
                    }}
                    className="relative flex items-center justify-between cursor-pointer group"
                  >
                    <span className="w-3 h-3 rounded-full bg-[#0284C7] ring-4 ring-[#F5F8FC] absolute -left-[19px]" />
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#16A34A] text-white flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#0B192C] group-hover:text-[#0D5EF4]">
                          Quotation Accepted
                        </div>
                        <div className="text-[11px] text-slate-500">TechPro Ltd • 3h ago</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>

                  {/* Activity 3: New Enquiry */}
                  <div
                    onClick={() => setActiveTab('clients')}
                    className="relative flex items-center justify-between cursor-pointer group"
                  >
                    <span className="w-3 h-3 rounded-full bg-[#7C3AED] ring-4 ring-[#F5F8FC] absolute -left-[19px]" />
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#7C3AED] text-white flex items-center justify-center shrink-0">
                        <MessageSquare className="w-4 h-4 stroke-[2.2]" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#0B192C] group-hover:text-[#0D5EF4]">
                          New Enquiry
                        </div>
                        <div className="text-[11px] text-slate-500">Digital Solutions • 4h ago</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ========================================================= */}
          {/* TAB 2: CLIENTS & LEADS (Tap any Client to preview 360°)   */}
          {/* ========================================================= */}
          {activeTab === 'clients' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-[#0B192C]">Clients & Enquiries</h2>
                  <p className="text-[11px] text-slate-500">Tap any client to inspect invoices, quotes & receipts</p>
                </div>
                <button
                  onClick={() => {
                    setSheetMode('quick_lead');
                    setIsBottomSheetOpen(true);
                  }}
                  className="px-2.5 py-1.5 bg-[#0D5EF4] text-white rounded-xl text-[11px] font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Lead</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {clients.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => setPreviewItem({ type: 'client', data: client })}
                    className="w-full text-left bg-white rounded-2xl p-3.5 border border-slate-100 hover:border-blue-200 shadow-xs space-y-2 transition-all active:scale-99"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-bold text-[#0B192C]">{client.company}</div>
                        <div className="text-[11px] text-slate-500">{client.name} · {client.communicationPreference}</div>
                      </div>
                      <span className="text-[10px] font-bold text-[#0D5EF4] bg-blue-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <span>View</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 truncate">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {client.email}
                      </span>
                      <span className="flex items-center gap-1 shrink-0">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {client.phone}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: PROJECTS & VOICE MILESTONE COMPLETION              */}
          {/* ========================================================= */}
          {activeTab === 'projects' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-[#0B192C]">Active Projects</h2>
                  <p className="text-[11px] text-slate-500">Tap mic on any milestone to dictate completion</p>
                </div>
                <button
                  onClick={() => {
                    setVoiceTargetMilestone(null);
                    setIsVoiceModalOpen(true);
                  }}
                  className="px-2.5 py-1.5 bg-[#0D5EF4] text-white rounded-xl text-[11px] font-bold flex items-center gap-1"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Voice</span>
                </button>
              </div>

              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-[#0B192C]">{proj.name}</div>
                      <div className="text-[11px] text-slate-500">{proj.clientName} · {proj.stage}</div>
                    </div>
                    <span className="text-xs font-extrabold font-mono text-[#0D5EF4]">
                      {proj.progressPercent}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#16A34A] h-full rounded-full transition-all duration-300"
                      style={{ width: `${proj.progressPercent}%` }}
                    />
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {proj.milestones.map((m) => {
                      const done = m.status === 'Completed';
                      return (
                        <div
                          key={m.id}
                          className={`p-2 rounded-xl border flex items-center justify-between gap-2 ${
                            done ? 'bg-emerald-50/50 border-emerald-200/70' : 'bg-slate-50 border-slate-200/60'
                          }`}
                        >
                          <button
                            onClick={() => toggleMilestoneStatus(proj.id, m.id)}
                            className="flex items-center gap-2 text-left flex-1 min-w-0"
                          >
                            <div
                              className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 ${
                                done ? 'bg-[#16A34A] text-white' : 'border border-slate-300 bg-white'
                              }`}
                            >
                              {done && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span
                              className={`text-[11px] font-semibold truncate ${
                                done ? 'line-through text-slate-400' : 'text-[#0B192C]'
                              }`}
                            >
                              {m.title}
                            </span>
                          </button>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {!done && (
                              <button
                                onClick={() => {
                                  setVoiceTargetMilestone({
                                    projectId: proj.id,
                                    milestoneId: m.id,
                                    title: m.title,
                                  });
                                  setIsVoiceModalOpen(true);
                                }}
                                className="p-1 rounded-lg bg-blue-100 text-[#0D5EF4] hover:bg-blue-200"
                                title="Dictate milestone completion"
                              >
                                <Mic className="w-3 h-3" />
                              </button>
                            )}
                            <span className="text-[10px] font-mono text-slate-500">{m.weight}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: MORE (Invoices, Quotations, Payments, Voice)       */}
          {/* ========================================================= */}
          {activeTab === 'more' && (
            <div className="space-y-3">
              {moreSubView !== 'menu' && (
                <button
                  onClick={() => setMoreSubView('menu')}
                  className="text-xs font-bold text-[#0D5EF4] flex items-center gap-1 mb-1"
                >
                  <span>← Back to More Menu</span>
                </button>
              )}

              {moreSubView === 'menu' && (
                <>
                  {/* Brand Identity Card */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={APP_LOGO_URL}
                        alt="AIConsults App Icon"
                        className="w-12 h-12 rounded-2xl shadow-xs object-contain"
                      />
                      <div>
                        <div className="text-sm font-extrabold text-[#0B192C]">AIConsults OS</div>
                        <div className="text-[11px] text-slate-500">Plan · Organize · Achieve</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowSplashPreview(true)}
                      className="px-2.5 py-1.5 rounded-xl bg-blue-50 text-[#0D5EF4] text-[11px] font-bold"
                    >
                      Splash View
                    </button>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => setMoreSubView('invoices')}
                      className="w-full p-3.5 bg-white rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0D5EF4] flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-bold text-[#0B192C]">Invoices & Receivables</div>
                          <div className="text-[11px] text-slate-500">Tap any invoice to preview, download or email</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button
                      onClick={() => setMoreSubView('quotations')}
                      className="w-full p-3.5 bg-white rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0D5EF4] flex items-center justify-center">
                          <FileSpreadsheet className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-bold text-[#0B192C]">Quotations & Proposals</div>
                          <div className="text-[11px] text-slate-500">Tap any quotation to preview or send to client</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button
                      onClick={() => setMoreSubView('payments')}
                      className="w-full p-3.5 bg-white rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-bold text-[#0B192C]">Payments & Official Receipts</div>
                          <div className="text-[11px] text-slate-500">{payments.length} verified receipts · Tap to preview</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button
                      onClick={() => {
                        setVoiceTargetMilestone(null);
                        setIsVoiceModalOpen(true);
                      }}
                      className="w-full p-3.5 bg-white rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0D5EF4] flex items-center justify-center">
                          <Mic className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-bold text-[#0B192C]">Voice Transaction Recorder</div>
                          <div className="text-[11px] text-slate-500">Minimalist voice engine for payments & milestones</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </>
              )}

              {/* INVOICES LIST (Tap row to open Executive Mobile Invoice Preview!) */}
              {moreSubView === 'invoices' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-[#0B192C]">Tax Invoices ({invoices.length})</h3>
                    <span className="text-[10px] font-bold text-slate-400">Tap row to preview</span>
                  </div>
                  {invoices.map((inv) => (
                    <div
                      key={inv.id}
                      onClick={() => setPreviewItem({ type: 'invoice', data: inv })}
                      className="p-3.5 bg-white rounded-2xl border border-slate-100 hover:border-blue-200 shadow-xs flex items-center justify-between gap-2 cursor-pointer transition-all active:scale-99"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold text-[#0B192C] font-mono">{inv.invoiceNumber}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-[#0D5EF4] flex items-center gap-0.5">
                            <Eye className="w-2.5 h-2.5" /> Preview
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{inv.clientName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Due: {inv.dueDate}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div
                            className={`text-xs font-extrabold font-mono tabular-nums ${
                              inv.status === 'Paid' ? 'text-[#16A34A]' : 'text-[#DC2626]'
                            }`}
                          >
                            {sym}
                            {inv.totalAmount.toLocaleString()}
                          </div>
                          <div className="text-[10px] font-bold text-slate-400">{inv.status}</div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMobileEmailDoc({ type: 'invoice', invoice: inv });
                          }}
                          className="p-2 rounded-xl bg-blue-50 text-[#0D5EF4] hover:bg-blue-100"
                          title="Send Invoice via Email"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* QUOTATIONS LIST (Tap row to open Executive Mobile Quotation Preview!) */}
              {moreSubView === 'quotations' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-[#0B192C]">Commercial Quotations ({quotations.length})</h3>
                    <span className="text-[10px] font-bold text-slate-400">Tap row to preview</span>
                  </div>
                  {quotations.map((qt) => (
                    <div
                      key={qt.id}
                      onClick={() => setPreviewItem({ type: 'quotation', data: qt })}
                      className="p-3.5 bg-white rounded-2xl border border-slate-100 hover:border-blue-200 shadow-xs flex items-center justify-between gap-2 cursor-pointer transition-all active:scale-99"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold text-[#0B192C] font-mono">{qt.quotationNumber}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-[#0D5EF4] flex items-center gap-0.5">
                            <Eye className="w-2.5 h-2.5" /> Preview
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{qt.clientName}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[170px]">{qt.projectName}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-xs font-extrabold text-[#0B192C] font-mono tabular-nums">
                            {sym}
                            {qt.totalAmount.toLocaleString()}
                          </div>
                          <div
                            className={`text-[10px] font-bold ${
                              qt.status === 'Accepted' ? 'text-[#16A34A]' : 'text-[#0D5EF4]'
                            }`}
                          >
                            {qt.status}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMobileEmailDoc({ type: 'quotation', quotation: qt });
                          }}
                          className="p-2 rounded-xl bg-blue-50 text-[#0D5EF4] hover:bg-blue-100"
                          title="Send Proposal via Email"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* PAYMENTS & RECEIPTS LIST (Tap row to open Official Payment Receipt Preview!) */}
              {(moreSubView === 'payments' || moreSubView === 'activities') && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-[#0B192C]">Payments & Receipts ({payments.length})</h3>
                    <span className="text-[10px] font-bold text-slate-400">Tap receipt to preview</span>
                  </div>
                  {payments.map((pay) => (
                    <div
                      key={pay.id}
                      onClick={() => setPreviewItem({ type: 'payment', data: pay })}
                      className="p-3.5 bg-white rounded-2xl border border-slate-100 hover:border-emerald-200 shadow-xs flex items-center justify-between cursor-pointer transition-all active:scale-99"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center shrink-0">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-extrabold text-[#0B192C] font-mono">{pay.receiptNumber}</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-[#16A34A]">
                              Receipt
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{pay.clientName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {pay.invoiceNumber} · {pay.paymentDate}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-[#16A34A] font-mono tabular-nums block">
                          +{sym}
                          {pay.amount.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400">{pay.method}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* NATIVE MOBILE DOCUMENT & RECEIPT PREVIEW SHEET (NO TOP-RIGHT X)   */}
        {/* ================================================================= */}
        {previewItem && (
          <div
            onClick={() => setPreviewItem(null)}
            className="absolute inset-0 bg-[#0B192C]/60 backdrop-blur-2xs flex flex-col justify-end z-40 animate-in fade-in"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-3xl max-h-[88%] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Top Drag Handle Pill */}
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="w-full pt-3 pb-1.5 flex justify-center focus:outline-none group shrink-0"
              >
                <span className="w-12 h-1.5 rounded-full bg-slate-300 group-hover:bg-slate-400 transition-colors" />
              </button>

              {/* Top Brand Accent Bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-[#0B192C] via-[#0D5EF4] to-[#3898FF] shrink-0" />

              {/* Scrollable Document Body */}
              <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
                {/* 1. MOBILE VAT INVOICE PREVIEW */}
                {previewItem.type === 'invoice' && (() => {
                  const inv = previewItem.data;
                  const vatRate = typeof inv.taxRate === 'number' ? inv.taxRate : profile.taxRate;
                  const vatAmount = Number(((inv.subtotal * vatRate) / 100).toFixed(2));
                  const totalAmount = Number((inv.subtotal + vatAmount).toFixed(2));
                  const paidAmount = inv.status === 'Paid' ? totalAmount : inv.paidAmount;
                  const balanceDue = inv.status === 'Paid' ? 0 : Math.max(0, Number((totalAmount - paidAmount).toFixed(2)));
                  return (
                  <>
                    <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={COMPANY_LOGO_URL}
                          alt={profile.name}
                          className="w-9 h-9 object-contain rounded-lg border border-slate-100 p-1"
                        />
                        <div>
                          <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#0D5EF4]">
                            Official VAT Invoice · {vatRate}% VAT
                          </div>
                          <div className="text-sm font-extrabold font-mono text-[#0B192C]">
                            {inv.invoiceNumber}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200'
                            : 'bg-red-50 text-[#DC2626] border border-red-200'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>

                    {/* Billed To & Dates */}
                    <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#F5F8FC] rounded-2xl border border-slate-200/80">
                      <div>
                        <div className="text-[10px] font-bold uppercase text-slate-400">Billed To</div>
                        <div className="font-extrabold text-[#0B192C] mt-0.5">{inv.clientName}</div>
                        <div className="text-[11px] text-slate-500 truncate">{inv.projectName}</div>
                      </div>
                      <div className="text-right font-mono text-[11px]">
                        <div className="text-slate-400">Issued: {inv.issueDate}</div>
                        <div className="font-bold text-[#DC2626] mt-0.5">Due: {inv.dueDate}</div>
                      </div>
                    </div>

                    {/* Line Items */}
                    <div className="space-y-2">
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Line Items
                      </div>
                      <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden">
                        {inv.items.map((item) => (
                          <div key={item.id} className="p-3 bg-white flex items-center justify-between gap-2">
                            <div>
                              <div className="font-bold text-[#0B192C]">{item.description}</div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                Qty {item.quantity} × {formatMoney(item.unitPrice)} · VAT {vatRate}%
                              </div>
                            </div>
                            <div className="font-mono font-extrabold text-[#0B192C] tabular-nums">
                              {formatMoney(item.total)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Totals Summary */}
                    <div className="p-3.5 bg-[#F5F8FC] rounded-2xl border border-slate-200/80 space-y-1.5">
                      <div className="flex justify-between text-slate-500">
                        <span>Subtotal (Excl. VAT)</span>
                        <span className="font-mono font-bold text-[#0B192C]">
                          {formatMoney(inv.subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-[#0B192C]">
                        <span className="font-semibold">VAT ({vatRate}%)</span>
                        <span className="font-mono font-bold text-[#0D5EF4]">
                          {formatMoney(vatAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-700 font-semibold border-t border-slate-200/70 pt-1">
                        <span>Invoice Total (Incl. VAT)</span>
                        <span className="font-mono font-bold text-[#0B192C]">
                          {formatMoney(totalAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between text-emerald-700">
                        <span>Paid to Date</span>
                        <span className="font-mono font-bold">-{formatMoney(paidAmount)}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                        <span className="font-extrabold text-[#0B192C]">Balance Due</span>
                        <span
                          className={`text-sm font-extrabold font-mono tabular-nums ${
                            balanceDue > 0 ? 'text-[#DC2626]' : 'text-[#16A34A]'
                          }`}
                        >
                          {formatMoney(balanceDue)}
                        </span>
                      </div>
                    </div>

                    {/* Bank Instructions */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200/80 text-[11px] text-slate-500">
                      <div className="font-bold text-[#0B192C]">Bank Transfer Details</div>
                      <div className="font-mono mt-0.5">
                        {profile.bankName} · {profile.accountNumber} ({profile.accountName})
                      </div>
                    </div>
                  </>
                  );
                })()}

                {/* 2. MOBILE COMMERCIAL QUOTATION PREVIEW */}
                {previewItem.type === 'quotation' && (() => {
                  const qt = previewItem.data;
                  const vatRate = typeof qt.taxRate === 'number' ? qt.taxRate : profile.taxRate;
                  const vatAmount = Number(((qt.subtotal * vatRate) / 100).toFixed(2));
                  const totalAmount = Number((qt.subtotal + vatAmount - (qt.discount || 0)).toFixed(2));
                  return (
                  <>
                    <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={COMPANY_LOGO_URL}
                          alt={profile.name}
                          className="w-9 h-9 object-contain rounded-lg border border-slate-100 p-1"
                        />
                        <div>
                          <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#0D5EF4]">
                            Commercial Proposal · Rev {qt.version} · {vatRate}% VAT
                          </div>
                          <div className="text-sm font-extrabold font-mono text-[#0B192C]">
                            {qt.quotationNumber}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          qt.status === 'Accepted'
                            ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200'
                            : 'bg-blue-50 text-[#0D5EF4] border border-blue-200'
                        }`}
                      >
                        {qt.status}
                      </span>
                    </div>

                    <div className="p-3.5 bg-[#F5F8FC] rounded-2xl border border-slate-200/80 space-y-1">
                      <div className="text-[10px] font-bold uppercase text-slate-400">Prepared For</div>
                      <div className="font-extrabold text-[#0B192C]">{qt.clientName}</div>
                      <div className="text-xs font-semibold text-[#0D5EF4]">{qt.projectName}</div>
                      <div className="text-[11px] text-slate-500 pt-1">{qt.specialConditions}</div>
                    </div>

                    <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden">
                      {qt.items.map((item) => (
                        <div key={item.id} className="p-3 bg-white flex items-center justify-between gap-2">
                          <div>
                            <div className="font-bold text-[#0B192C]">{item.description}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Qty {item.quantity} × {formatMoney(item.unitPrice)} · VAT {vatRate}%
                            </div>
                          </div>
                          <div className="font-mono font-extrabold text-[#0B192C] tabular-nums">
                            {formatMoney(item.total)}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-3.5 bg-[#F5F8FC] rounded-2xl border border-slate-200/80 space-y-1.5">
                      <div className="flex justify-between text-slate-500">
                        <span>Subtotal (Excl. VAT)</span>
                        <span className="font-mono font-bold text-[#0B192C]">{formatMoney(qt.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-[#0B192C]">
                        <span className="font-semibold">VAT ({vatRate}%)</span>
                        <span className="font-mono font-bold text-[#0D5EF4]">{formatMoney(vatAmount)}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                        <div>
                          <span className="font-extrabold text-[#0B192C] block">Total Investment (Incl. VAT)</span>
                          <span className="text-[10px] text-slate-400">Valid until {qt.validUntil}</span>
                        </div>
                        <span className="text-sm font-extrabold font-mono text-[#0D5EF4] tabular-nums">
                          {formatMoney(totalAmount)}
                        </span>
                      </div>
                    </div>
                  </>
                  );
                })()}

                {/* 3. MOBILE OFFICIAL PAYMENT RECEIPT PREVIEW */}
                {previewItem.type === 'payment' && (
                  <>
                    <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={COMPANY_LOGO_URL}
                          alt={profile.name}
                          className="w-9 h-9 object-contain rounded-lg border border-slate-100 p-1"
                        />
                        <div>
                          <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#16A34A]">
                            Official Payment Receipt
                          </div>
                          <div className="text-sm font-extrabold font-mono text-[#0B192C]">
                            {previewItem.data.receiptNumber}
                          </div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-[#16A34A] border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Reconciled
                      </span>
                    </div>

                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-1">
                      <div className="text-[11px] font-bold text-emerald-700">Amount Received</div>
                      <div className="text-2xl font-extrabold font-mono text-[#16A34A] tabular-nums">
                        {formatMoney(previewItem.data.amount)}
                      </div>
                      <div className="text-[11px] text-emerald-600 font-mono">
                        Paid on {previewItem.data.paymentDate} via {previewItem.data.method}
                      </div>
                    </div>

                    <div className="p-3.5 bg-[#F5F8FC] rounded-2xl border border-slate-200/80 space-y-2.5">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Received From</span>
                        <span className="font-bold text-[#0B192C]">{previewItem.data.clientName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Applied To Invoice</span>
                        <button
                          type="button"
                          onClick={() => {
                            const linked = invoices.find((i) => i.id === previewItem.data.invoiceId);
                            if (linked) setPreviewItem({ type: 'invoice', data: linked });
                          }}
                          className="font-mono font-bold text-[#0D5EF4] underline"
                        >
                          {previewItem.data.invoiceNumber}
                        </button>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Reference</span>
                        <span className="font-mono text-[#0B192C]">{previewItem.data.transactionReference}</span>
                      </div>
                    </div>
                  </>
                )}

                {/* 4. MOBILE CLIENT 360° PREVIEW */}
                {previewItem.type === 'client' && (
                  <>
                    <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                      <div>
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#0D5EF4]">
                          Client 360° Profile
                        </div>
                        <div className="text-base font-extrabold text-[#0B192C]">{previewItem.data.company}</div>
                        <div className="text-xs text-slate-500">{previewItem.data.name}</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-[#0D5EF4]">
                        {previewItem.data.communicationPreference}
                      </span>
                    </div>

                    <div className="p-3.5 bg-[#F5F8FC] rounded-2xl border border-slate-200/80 space-y-1.5">
                      <div className="text-[11px] text-[#0B192C] font-medium">{previewItem.data.email}</div>
                      <div className="text-[11px] text-slate-500">{previewItem.data.phone}</div>
                      <div className="text-[11px] text-slate-400">{previewItem.data.address}</div>
                    </div>

                    {/* Client's Invoices — Tap to preview! */}
                    <div className="space-y-2">
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Client Invoices (Tap to Preview)
                      </div>
                      {invoices
                        .filter((i) => i.clientId === previewItem.data.id)
                        .map((inv) => (
                          <button
                            key={inv.id}
                            type="button"
                            onClick={() => setPreviewItem({ type: 'invoice', data: inv })}
                            className="w-full p-3 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between text-left hover:border-blue-300"
                          >
                            <div>
                              <div className="font-mono font-bold text-[#0B192C]">{inv.invoiceNumber}</div>
                              <div className="text-[10px] text-slate-400">Due {inv.dueDate}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-mono font-extrabold text-[#0D5EF4]">
                                {formatMoney(inv.totalAmount)}
                              </div>
                              <div className="text-[10px] text-slate-500">{inv.status}</div>
                            </div>
                          </button>
                        ))}
                    </div>
                  </>
                )}
              </div>

              {/* Bottom Action Bar for Preview Sheet */}
              <div className="p-4 bg-[#F5F8FC] border-t border-slate-200/80 flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  className="px-3.5 py-2.5 bg-slate-200/80 hover:bg-slate-300/70 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                >
                  Dismiss
                </button>

                {previewItem.type === 'invoice' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const inv = previewItem.data;
                        const vatRate = typeof inv.taxRate === 'number' ? inv.taxRate : profile.taxRate;
                        const vatAmount = Number(((inv.subtotal * vatRate) / 100).toFixed(2));
                        const totalAmount = Number((inv.subtotal + vatAmount).toFixed(2));
                        handleDownloadMobileDoc(
                          'VAT INVOICE',
                          inv.invoiceNumber,
                          inv.clientName,
                          inv.subtotal,
                          vatRate,
                          vatAmount,
                          totalAmount,
                          inv.items
                        );
                      }}
                      className="p-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50"
                      title="Download Invoice"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    {previewItem.data.balanceDue > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const inv = previewItem.data;
                          setSelectedInvoiceId(inv.id);
                          setPaymentAmount(inv.balanceDue);
                          setPreviewItem(null);
                          setSheetMode('quick_payment');
                          setIsBottomSheetOpen(true);
                        }}
                        className="flex-1 py-2.5 bg-[#16A34A] text-white font-bold text-xs rounded-xl shadow-xs"
                      >
                        Record Pay
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        const inv = previewItem.data;
                        setPreviewItem(null);
                        setMobileEmailDoc({ type: 'invoice', invoice: inv });
                      }}
                      className="flex-1 py-2.5 bg-[#0D5EF4] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send to Client</span>
                    </button>
                  </>
                )}

                {previewItem.type === 'quotation' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const qt = previewItem.data;
                        const vatRate = typeof qt.taxRate === 'number' ? qt.taxRate : profile.taxRate;
                        const vatAmount = Number(((qt.subtotal * vatRate) / 100).toFixed(2));
                        const totalAmount = Number((qt.subtotal + vatAmount - (qt.discount || 0)).toFixed(2));
                        handleDownloadMobileDoc(
                          'COMMERCIAL PROPOSAL',
                          qt.quotationNumber,
                          qt.clientName,
                          qt.subtotal,
                          vatRate,
                          vatAmount,
                          totalAmount,
                          qt.items
                        );
                      }}
                      className="p-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50"
                      title="Download Quotation"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    {previewItem.data.status !== 'Accepted' && (
                      <button
                        type="button"
                        onClick={() => {
                          acceptQuotation(previewItem.data.id, 'Accepted via AIConsults Mobile App');
                          setPreviewItem(null);
                        }}
                        className="flex-1 py-2.5 bg-[#16A34A] text-white font-bold text-xs rounded-xl shadow-xs"
                      >
                        Accept Quote
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        const qt = previewItem.data;
                        setPreviewItem(null);
                        setMobileEmailDoc({ type: 'quotation', quotation: qt });
                      }}
                      className="flex-1 py-2.5 bg-[#0D5EF4] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send to Client</span>
                    </button>
                  </>
                )}

                {previewItem.type === 'payment' && (
                  <>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="flex-1 py-2.5 bg-[#0D5EF4] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Official Receipt</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Sheet for Center (+) FAB (Native Android Sheet — No X Button) */}
        {isBottomSheetOpen && (
          <div
            onClick={() => setIsBottomSheetOpen(false)}
            className="absolute inset-0 bg-[#0B192C]/55 backdrop-blur-2xs flex flex-col justify-end z-40"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-3xl p-5 pt-3 space-y-4 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setIsBottomSheetOpen(false)}
                className="w-full py-1.5 flex justify-center focus:outline-none group"
                title="Pull down or tap outside to dismiss"
              >
                <span className="w-12 h-1.5 rounded-full bg-slate-300 group-hover:bg-slate-400 transition-colors" />
              </button>

              <div className="border-b border-slate-100 pb-2.5 text-center">
                <h3 className="font-extrabold text-[#0B192C] text-sm">
                  {sheetMode === 'action_menu' && 'Quick Operations'}
                  {sheetMode === 'quick_payment' && 'Record Payment Received'}
                  {sheetMode === 'quick_lead' && 'Log New Enquiry'}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {sheetMode === 'action_menu'
                    ? 'Select an action or tap backdrop to close'
                    : 'Complete details below'}
                </p>
              </div>

              {sheetMode === 'action_menu' && (
                <div className="grid grid-cols-1 gap-2.5">
                  <button
                    onClick={() => setSheetMode('quick_payment')}
                    className="p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#16A34A] text-white flex items-center justify-center">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#0B192C]">Record Payment</div>
                        <div className="text-[11px] text-slate-500">Update received & outstanding balances</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    onClick={() => {
                      setIsBottomSheetOpen(false);
                      setVoiceTargetMilestone(null);
                      setIsVoiceModalOpen(true);
                    }}
                    className="p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#0D5EF4] text-white flex items-center justify-center">
                        <Mic className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#0B192C]">Voice Transaction</div>
                        <div className="text-[11px] text-slate-500">Speak to record transactions or milestones</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    onClick={() => setSheetMode('quick_lead')}
                    className="p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#0B192C]">New Client Enquiry</div>
                        <div className="text-[11px] text-slate-500">Add prospect to pipeline</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsBottomSheetOpen(false)}
                    className="w-full py-2.5 mt-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {sheetMode === 'quick_payment' && (
                <form onSubmit={handleRecordQuickPayment} className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Invoice</label>
                    <select
                      value={selectedInvoiceId}
                      onChange={(e) => setSelectedInvoiceId(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white"
                    >
                      {invoices.map((inv) => (
                        <option key={inv.id} value={inv.id}>
                          {inv.invoiceNumber} — {inv.clientName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Amount ({sym})</label>
                    <input
                      type="number"
                      required
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSheetMode('action_menu')}
                      className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-[2] py-2.5 bg-[#16A34A] text-white font-bold rounded-xl shadow-md"
                    >
                      Confirm Payment
                    </button>
                  </div>
                </form>
              )}

              {sheetMode === 'quick_lead' && (
                <form onSubmit={handleCreateQuickLead} className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Contact Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chidi Okonkwo"
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Company</label>
                    <input
                      type="text"
                      placeholder="e.g. Digital Solutions"
                      value={leadCompany}
                      onChange={(e) => setLeadCompany(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSheetMode('action_menu')}
                      className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-[2] py-2.5 bg-[#0D5EF4] text-white font-bold rounded-xl shadow-md"
                    >
                      Save Enquiry
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Bottom Navigation Bar (Home | Clients | Raised + | Projects | More) */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-white border-t border-slate-200/80 px-4 flex items-center justify-between z-30">
          <button
            onClick={() => setActiveTab('home')}
            className={`relative flex flex-col items-center justify-center gap-0.5 w-14 py-1 ${
              activeTab === 'home' ? 'text-[#0D5EF4]' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Home className={`w-5 h-5 ${activeTab === 'home' ? 'fill-[#0D5EF4] stroke-[#0D5EF4]' : 'stroke-[2]'}`} />
            <span className="text-[10px] font-bold">Home</span>
            {activeTab === 'home' && (
              <span className="w-8 h-[3px] bg-[#0D5EF4] rounded-full absolute -bottom-1" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('clients')}
            className={`relative flex flex-col items-center justify-center gap-0.5 w-14 py-1 ${
              activeTab === 'clients' ? 'text-[#0D5EF4]' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-5 h-5 stroke-[2]" />
            <span className="text-[10px] font-semibold">Clients</span>
            {activeTab === 'clients' && (
              <span className="w-8 h-[3px] bg-[#0D5EF4] rounded-full absolute -bottom-1" />
            )}
          </button>

          <div className="relative -top-5 flex items-center justify-center">
            <button
              onClick={() => {
                setSheetMode('action_menu');
                setIsBottomSheetOpen(true);
              }}
              className="w-14 h-14 rounded-full bg-[#0D5EF4] hover:bg-[#0047BA] text-white flex items-center justify-center shadow-lg shadow-blue-600/35 ring-4 ring-white transition-transform active:scale-95"
              title="Quick Action"
            >
              <Plus className="w-7 h-7 stroke-[2.5]" />
            </button>
          </div>

          <button
            onClick={() => setActiveTab('projects')}
            className={`relative flex flex-col items-center justify-center gap-0.5 w-14 py-1 ${
              activeTab === 'projects' ? 'text-[#0D5EF4]' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Briefcase className="w-5 h-5 stroke-[2]" />
            <span className="text-[10px] font-semibold">Projects</span>
            {activeTab === 'projects' && (
              <span className="w-8 h-[3px] bg-[#0D5EF4] rounded-full absolute -bottom-1" />
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('more');
              setMoreSubView('menu');
            }}
            className={`relative flex flex-col items-center justify-center gap-0.5 w-14 py-1 ${
              activeTab === 'more' ? 'text-[#0D5EF4]' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <MoreHorizontal className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[10px] font-semibold">More</span>
            {activeTab === 'more' && (
              <span className="w-8 h-[3px] bg-[#0D5EF4] rounded-full absolute -bottom-1" />
            )}
          </button>
        </div>
      </div>

      {/* Minimalist Voice Recording Modal */}
      <VoiceRecordModal
        isOpen={isVoiceModalOpen}
        onClose={() => {
          setIsVoiceModalOpen(false);
          setVoiceTargetMilestone(null);
        }}
        targetProjectId={voiceTargetMilestone?.projectId}
        targetMilestoneId={voiceTargetMilestone?.milestoneId}
        targetMilestoneTitle={voiceTargetMilestone?.title}
      />

      {/* Mobile Document Email Dispatch Modal */}
      <SendDocumentEmailModal
        isOpen={!!mobileEmailDoc}
        onClose={() => setMobileEmailDoc(null)}
        documentType={mobileEmailDoc?.type || 'invoice'}
        invoice={mobileEmailDoc?.invoice || null}
        quotation={mobileEmailDoc?.quotation || null}
      />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import {
  Search,
  Plus,
  Mic,
  Command,
  FileText,
  Users,
  FolderGit2,
  CreditCard,
  Receipt,
  Sparkles,
  ChevronDown,
  X,
  ArrowRight,
} from 'lucide-react';

interface CommandBarProps {
  onOpenQuickAction: (action: string) => void;
}

const CURRENCIES = [
  { code: 'NGN', symbol: '₦', label: 'NGN (₦)' },
  { code: 'USD', symbol: '$', label: 'USD ($)' },
  { code: 'EUR', symbol: '€', label: 'EUR (€)' },
  { code: 'GBP', symbol: '£', label: 'GBP (£)' },
];

export const CommandBar: React.FC<CommandBarProps> = ({ onOpenQuickAction }) => {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    moduleFilter,
    setModuleFilter,
    profile,
    updateProfile,
    financials,
    formatCompactCurrency,
    clients,
    quotations,
    invoices,
    projects,
  } = useBusiness();

  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState('');
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);

  // Keyboard shortcut Cmd+K / Ctrl+K for Global Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsPaletteOpen(false);
        setIsCreateMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Contextual configuration per module (Refinement B)
  const getModuleContext = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Dashboard',
          searchPlaceholder: 'Search workspace or press ⌘K...',
          filters: [],
          primaryAction: { label: 'Create', action: 'menu' },
          showFinancialSummary: true,
        };
      case 'clients':
        return {
          title: 'Clients',
          searchPlaceholder: 'Search clients by name, company, or email...',
          filters: [
            { id: 'all', label: 'All' },
            { id: 'balance', label: 'With Balance' },
            { id: 'active', label: 'Active Projects' },
          ],
          primaryAction: { label: 'New Client', action: 'client' },
        };
      case 'leads':
        return {
          title: 'Leads & Enquiries',
          searchPlaceholder: 'Search enquiries by name, company, or service...',
          filters: [
            { id: 'all', label: 'All' },
            { id: 'New Enquiry', label: 'New' },
            { id: 'Qualified', label: 'Qualified' },
            { id: 'Proposal Sent', label: 'Proposal Sent' },
          ],
          primaryAction: { label: 'New Enquiry', action: 'lead' },
        };
      case 'quotations':
        return {
          title: 'Quotations',
          searchPlaceholder: 'Search quotations by #, client, or project...',
          filters: [
            { id: 'all', label: 'All' },
            { id: 'Draft', label: 'Draft' },
            { id: 'Sent', label: 'Sent' },
            { id: 'Accepted', label: 'Accepted' },
          ],
          primaryAction: { label: 'New Quotation', action: 'quotation' },
        };
      case 'projects':
        return {
          title: 'Projects',
          searchPlaceholder: 'Search projects by name, client, or stage...',
          filters: [
            { id: 'all', label: 'All Stages' },
            { id: 'Design', label: 'Design' },
            { id: 'Development', label: 'Development' },
            { id: 'Completed', label: 'Completed' },
          ],
          primaryAction: null,
        };
      case 'invoices':
        return {
          title: 'Invoices',
          searchPlaceholder: 'Search invoices by #, client, or project...',
          filters: [
            { id: 'all', label: 'All' },
            { id: 'Paid', label: 'Paid' },
            { id: 'Partially Paid', label: 'Partial' },
            { id: 'Unpaid', label: 'Unpaid' },
            { id: 'Overdue', label: 'Overdue' },
          ],
          primaryAction: { label: 'New Invoice', action: 'invoice' },
          secondaryAction: { label: 'Record Payment', action: 'payment' },
        };
      case 'payments':
        return {
          title: 'Payments & Receipts',
          searchPlaceholder: 'Search receipts, clients, or references...',
          filters: [
            { id: 'all', label: 'All Methods' },
            { id: 'Bank Transfer', label: 'Bank Transfer' },
            { id: 'Wire', label: 'Wire' },
            { id: 'Online Card', label: 'Card' },
          ],
          primaryAction: { label: 'Record Payment', action: 'payment' },
        };
      case 'expenses':
        return {
          title: 'Expenses',
          searchPlaceholder: 'Search expenses by vendor, description, or project...',
          filters: [
            { id: 'all', label: 'All' },
            { id: 'Cloud / Hosting', label: 'Cloud' },
            { id: 'Contractor', label: 'Contractor' },
            { id: 'Software / SaaS', label: 'Software' },
          ],
          primaryAction: { label: 'Add Expense', action: 'expense' },
        };
      case 'documents':
        return {
          title: 'Documents',
          searchPlaceholder: 'Search vault by title, client, or project...',
          filters: [
            { id: 'all', label: 'All Files' },
            { id: 'Quotation', label: 'Quotations' },
            { id: 'Invoice', label: 'Invoices' },
            { id: 'Agreement', label: 'Agreements' },
          ],
          primaryAction: null,
        };
      case 'tasks':
        return {
          title: 'Tasks',
          searchPlaceholder: 'Filter tasks across projects...',
          filters: [
            { id: 'all', label: 'All' },
            { id: 'Pending', label: 'Pending' },
            { id: 'Completed', label: 'Completed' },
          ],
          primaryAction: null,
        };
      default:
        return {
          title: activeTab.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          searchPlaceholder: 'Search workspace (⌘K)...',
          filters: [],
          primaryAction: null,
        };
    }
  };

  const ctx = getModuleContext();

  const handleCurrencyChange = (code: string) => {
    const found = CURRENCIES.find((c) => c.code === code);
    if (found) {
      updateProfile({
        ...profile,
        currency: found.code,
        currencySymbol: found.symbol,
      });
    }
  };

  // Global Palette Search Results
  const q = paletteQuery.trim().toLowerCase();
  const matchedClients = q
    ? clients.filter((c) => c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q)).slice(0, 3)
    : clients.slice(0, 2);
  const matchedInvoices = q
    ? invoices
        .filter((i) => i.invoiceNumber.toLowerCase().includes(q) || i.clientName.toLowerCase().includes(q))
        .slice(0, 3)
    : invoices.slice(0, 2);
  const matchedProjects = q
    ? projects.filter((p) => p.name.toLowerCase().includes(q) || p.clientName.toLowerCase().includes(q)).slice(0, 3)
    : projects.slice(0, 2);
  const matchedQuotes = q
    ? quotations
        .filter((qt) => qt.quotationNumber.toLowerCase().includes(q) || qt.clientName.toLowerCase().includes(q))
        .slice(0, 2)
    : [];

  return (
    <>
      {/* Desktop & Tablet Contextual Floating Command Bar */}
      <div className="hidden lg:block sticky top-0 z-30 px-6 pt-3 pb-2 bg-[#090D16]/90 backdrop-blur-md border-b border-[#1E293B]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left Zone: Active Module Breadcrumb + Contextual Search Input */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-extrabold tracking-tight text-[#F8FAFC] whitespace-nowrap">
                {ctx.title}
              </span>
              <span className="text-slate-600">/</span>
            </div>

            {/* Contextual Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (activeTab === 'dashboard') setIsPaletteOpen(true);
                }}
                placeholder={ctx.searchPlaceholder}
                className="w-full bg-[#0F1624] border border-[#1E293B] focus:border-[#3B82F6] rounded-xl pl-8 pr-14 py-1.5 text-xs text-[#F8FAFC] placeholder-slate-500 focus:outline-none transition-colors"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => setIsPaletteOpen(true)}
                  className="absolute right-2 top-1.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-[#162032] border border-[#1E293B] rounded hover:text-white transition-colors"
                  title="Open Global Command Palette (⌘K)"
                >
                  ⌘K
                </button>
              )}
            </div>

            {/* Contextual Filter Pills (Only shown when current module defines filters) */}
            {ctx.filters && ctx.filters.length > 0 && (
              <div className="hidden xl:flex items-center gap-1 p-1 bg-[#0F1624] border border-[#1E293B] rounded-xl shrink-0">
                {ctx.filters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setModuleFilter(f.id)}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors whitespace-nowrap ${
                      moduleFilter === f.id
                        ? 'bg-[#2563EB] text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}

            {/* Dashboard Contextual Financial Summary Pill */}
            {ctx.showFinancialSummary && (
              <div className="hidden xl:flex items-center gap-3 px-3 py-1.5 bg-[#0F1624] border border-[#1E293B] rounded-xl text-[11px] font-mono shrink-0">
                <span className="text-slate-400">
                  Contracted:{' '}
                  <strong className="text-[#F8FAFC]">{formatCompactCurrency(financials.contractedAmount)}</strong>
                </span>
                <span className="text-slate-700">·</span>
                <span className="text-slate-400">
                  Collected:{' '}
                  <strong className="text-emerald-400">{formatCompactCurrency(financials.collectedAmount)}</strong>
                </span>
                <span className="text-slate-700">·</span>
                <span className="text-slate-400">
                  Due:{' '}
                  <strong className="text-rose-400">{formatCompactCurrency(financials.outstandingAmount)}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Right Zone: Contextual Primary Action + Global Utilities */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Secondary Module Action (e.g. Record Payment on Invoices) */}
            {ctx.secondaryAction && (
              <button
                onClick={() => onOpenQuickAction(ctx.secondaryAction!.action)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-[#162032] hover:bg-[#1E293B] border border-[#1E293B] rounded-xl transition-colors whitespace-nowrap"
              >
                <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                <span>{ctx.secondaryAction.label}</span>
              </button>
            )}

            {/* Primary Contextual Action Button */}
            {ctx.primaryAction && (
              <div className="relative">
                <button
                  onClick={() => {
                    if (ctx.primaryAction!.action === 'menu') {
                      setIsCreateMenuOpen((prev) => !prev);
                    } else {
                      onOpenQuickAction(ctx.primaryAction!.action);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl transition-colors whitespace-nowrap shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{ctx.primaryAction.label}</span>
                  {ctx.primaryAction.action === 'menu' && <ChevronDown className="w-3 h-3 ml-0.5" />}
                </button>

                {/* Dashboard Quick Create Dropdown */}
                {isCreateMenuOpen && ctx.primaryAction.action === 'menu' && (
                  <div
                    onMouseLeave={() => setIsCreateMenuOpen(false)}
                    className="absolute right-0 mt-2 w-48 bg-[#0F1624] border border-[#1E293B] rounded-2xl shadow-2xl p-1.5 z-50 space-y-0.5"
                  >
                    {[
                      { id: 'quotation', label: 'New Quotation', icon: <FileText className="w-3.5 h-3.5 text-blue-400" /> },
                      { id: 'invoice', label: 'New Invoice', icon: <Receipt className="w-3.5 h-3.5 text-emerald-400" /> },
                      { id: 'payment', label: 'Record Payment', icon: <CreditCard className="w-3.5 h-3.5 text-amber-400" /> },
                      { id: 'client', label: 'New Client', icon: <Users className="w-3.5 h-3.5 text-sky-400" /> },
                      { id: 'lead', label: 'New Enquiry', icon: <Sparkles className="w-3.5 h-3.5 text-purple-400" /> },
                      { id: 'expense', label: 'Add Expense', icon: <FolderGit2 className="w-3.5 h-3.5 text-rose-400" /> },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setIsCreateMenuOpen(false);
                          onOpenQuickAction(item.id);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-[#162032] rounded-xl transition-colors"
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="h-4 w-px bg-[#1E293B] mx-0.5" />

            {/* Voice AI Trigger */}
            <button
              onClick={() => setActiveTab('ai-assistant')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap ${
                activeTab === 'ai-assistant'
                  ? 'bg-[#2563EB]/20 text-blue-400 border-blue-500/40'
                  : 'bg-[#0F1624] text-slate-300 border-[#1E293B] hover:border-slate-700 hover:text-white'
              }`}
              title="Voice AI & Intelligence"
            >
              <Mic className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden xl:inline">Voice AI</span>
            </button>

            {/* Currency Selector (Strict ₦ Symbol Default) */}
            <select
              aria-label="Currency selector"
              value={profile.currency || 'NGN'}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="text-xs font-mono font-bold bg-[#0F1624] border border-[#1E293B] text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#3B82F6] cursor-pointer"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Global Command Palette Modal (⌘K) */}
      {isPaletteOpen && (
        <div
          onClick={() => setIsPaletteOpen(false)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-start justify-center pt-20 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-[#0F1624] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1E293B]">
              <Command className="w-4 h-4 text-blue-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={paletteQuery}
                onChange={(e) => setPaletteQuery(e.target.value)}
                placeholder="Jump to any client, invoice, quotation, project, or action..."
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none border-none"
              />
              <button
                onClick={() => setIsPaletteOpen(false)}
                className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-[#162032] hover:text-white"
              >
                ESC
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-3 space-y-4 text-xs">
              {/* Quick Creation Actions */}
              <div>
                <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Quick Actions
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {[
                    { id: 'quotation', label: '+ New Quotation' },
                    { id: 'invoice', label: '+ New Invoice' },
                    { id: 'payment', label: '+ Record Payment' },
                    { id: 'client', label: '+ New Client' },
                    { id: 'lead', label: '+ New Enquiry' },
                    { id: 'expense', label: '+ Add Expense' },
                  ].map((act) => (
                    <button
                      key={act.id}
                      onClick={() => {
                        setIsPaletteOpen(false);
                        onOpenQuickAction(act.id);
                      }}
                      className="px-3 py-2 rounded-xl bg-[#162032] hover:bg-[#2563EB] text-slate-200 hover:text-white font-semibold text-left transition-colors"
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Matched Invoices */}
              {matchedInvoices.length > 0 && (
                <div>
                  <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Invoices
                  </div>
                  <div className="space-y-1">
                    {matchedInvoices.map((inv) => (
                      <button
                        key={inv.id}
                        onClick={() => {
                          setActiveTab('invoices');
                          setSearchQuery(inv.invoiceNumber);
                          setIsPaletteOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#162032] text-left transition-colors"
                      >
                        <div>
                          <span className="font-mono font-bold text-white">{inv.invoiceNumber}</span>
                          <span className="text-slate-400 ml-2">· {inv.clientName}</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Quotations */}
              {matchedQuotes.length > 0 && (
                <div>
                  <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Quotations
                  </div>
                  <div className="space-y-1">
                    {matchedQuotes.map((qt) => (
                      <button
                        key={qt.id}
                        onClick={() => {
                          setActiveTab('quotations');
                          setSearchQuery(qt.quotationNumber);
                          setIsPaletteOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#162032] text-left transition-colors"
                      >
                        <div>
                          <span className="font-mono font-bold text-white">{qt.quotationNumber}</span>
                          <span className="text-slate-400 ml-2">· {qt.clientName}</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Clients & Projects */}
              {matchedClients.length > 0 && (
                <div>
                  <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Clients
                  </div>
                  <div className="space-y-1">
                    {matchedClients.map((cl) => (
                      <button
                        key={cl.id}
                        onClick={() => {
                          setActiveTab('clients');
                          setSearchQuery(cl.name);
                          setIsPaletteOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#162032] text-left transition-colors"
                      >
                        <div>
                          <span className="font-bold text-white">{cl.name}</span>
                          <span className="text-slate-400 ml-2">· {cl.company}</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {matchedProjects.length > 0 && (
                <div>
                  <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Projects
                  </div>
                  <div className="space-y-1">
                    {matchedProjects.map((pr) => (
                      <button
                        key={pr.id}
                        onClick={() => {
                          setActiveTab('projects');
                          setSearchQuery(pr.name);
                          setIsPaletteOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#162032] text-left transition-colors"
                      >
                        <div>
                          <span className="font-bold text-white">{pr.name}</span>
                          <span className="text-slate-400 ml-2">· {pr.stage}</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

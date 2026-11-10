import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { BrandLogo } from '../common/BrandLogo';
import {
  HeaderSearchAndFilterButtons,
  MobileExpandableSearchRow,
} from '../common/SearchAndFilterBar';
import {
  LayoutDashboard,
  Users,
  FolderGit2,
  Receipt,
  Grid,
  Plus,
  FileText,
  CreditCard,
  TrendingDown,
  FolderOpen,
  MessageSquare,
  UserPlus,
  CheckSquare,
  BarChart3,
  Zap,
  Briefcase,
  Mic,
  ClipboardList,
  Settings,
  Calendar,
} from 'lucide-react';

interface MobileNavigationProps {
  onOpenQuickAction: (action: string) => void;
  onOpenCalendar?: () => void;
}

const TAB_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  inbox: 'Inbox',
  leads: 'Leads',
  clients: 'Clients',
  quotations: 'Quotations',
  projects: 'Projects',
  invoices: 'Invoices',
  payments: 'Payments',
  expenses: 'Expenses',
  documents: 'Documents',
  tasks: 'Tasks',
  reports: 'Reports',
  automations: 'Automations',
  services: 'Services',
  'ai-assistant': 'Voice AI',
  forms: 'Forms',
  settings: 'Settings',
};

const CONTEXTUAL_ADD_ACTION: Record<string, { action: string; label: string }> = {
  leads: { action: 'lead', label: 'New Lead' },
  clients: { action: 'client', label: 'New Client' },
  quotations: { action: 'quotation', label: 'New Quote' },
  invoices: { action: 'invoice', label: 'New Invoice' },
  payments: { action: 'payment', label: 'Payment' },
  expenses: { action: 'expense', label: 'Expense' },
};

export const MobileTopBar: React.FC<MobileNavigationProps> = ({
  onOpenQuickAction,
  onOpenCalendar,
}) => {
  const { activeTab, profile, updateProfile } = useBusiness();
  const [quickSheetOpen, setQuickSheetOpen] = useState(false);

  const contextualAdd = CONTEXTUAL_ADD_ACTION[activeTab];

  const handleAddClick = () => {
    if (contextualAdd) {
      onOpenQuickAction(contextualAdd.action);
    } else {
      setQuickSheetOpen(true);
    }
  };

  return (
    <>
      {/* Unified Minimalist Top Header Bar (Mobile & Desktop) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3.5 sm:px-6 h-11 flex items-center justify-between gap-2 shrink-0">
        {/* Left: Mobile shows BrandLogo; Desktop shows subtle Module Name */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="lg:hidden">
            <BrandLogo size="sm" showText={true} variant="light" />
          </div>
          <span className="hidden lg:inline-block text-sm font-extrabold text-[#0B192C] tracking-tight truncate">
            {TAB_LABELS[activeTab] || 'Workspace'}
          </span>
        </div>

        {/* Right: Unified Search Icon + Filter Icon + Calendar + Currency + Contextual Add Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          <HeaderSearchAndFilterButtons />

          {onOpenCalendar && (
            <button
              type="button"
              onClick={onOpenCalendar}
              className="h-7 w-7 rounded-lg bg-[#F5F8FC] hover:bg-blue-50 border border-slate-200 text-[#0B192C] flex items-center justify-center transition-colors group"
              title="Open Calendar & Schedule"
            >
              <Calendar className="w-3.5 h-3.5 text-[#0D5EF4] group-hover:scale-110 transition-transform" />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              const next = profile.currency === 'NGN' ? 'USD' : 'NGN';
              updateProfile({
                ...profile,
                currency: next,
                currencySymbol: next === 'NGN' ? '₦' : '$',
              });
            }}
            className="lg:hidden h-7 px-2 rounded-lg bg-[#F5F8FC] border border-slate-200 text-[11px] font-mono font-bold text-[#0B192C]"
            title="Toggle Currency"
          >
            {profile.currency === 'NGN' ? '₦' : profile.currencySymbol}
          </button>

          <button
            type="button"
            onClick={handleAddClick}
            aria-label={contextualAdd ? contextualAdd.label : 'Quick create'}
            className="h-7 px-2.5 rounded-lg bg-[#0D5EF4] hover:bg-blue-700 text-white flex items-center justify-center gap-1 text-xs font-bold shadow-2xs transition-colors"
            title={contextualAdd ? contextualAdd.label : 'Quick Create'}
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">
              {contextualAdd ? contextualAdd.label : 'New'}
            </span>
          </button>
        </div>
      </header>

      {/* Expandable Search Input Row on Mobile when Search Icon is tapped */}
      <MobileExpandableSearchRow />

      {/* Quick Creation Modal / Sheet (for Mobile & Desktop when on general tabs) */}
      {quickSheetOpen && (
        <div
          onClick={() => setQuickSheetOpen(false)}
          className="fixed inset-0 z-50 bg-[#0B192C]/50 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md max-h-[82vh] bg-white border-t sm:border border-slate-200 rounded-t-3xl sm:rounded-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-150 shadow-2xl"
          >
            {/* Fixed-in-place Header */}
            <div className="shrink-0 bg-[#F8FAFC] border-b border-slate-200/80 px-5 pt-3 pb-3">
              <div className="sm:hidden w-10 h-1 rounded-full bg-slate-300 mx-auto mb-2.5" />
              <h3 className="text-sm font-extrabold text-[#0B192C]">Create Record</h3>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'quotation', label: 'New Quotation', icon: <FileText className="w-4 h-4 text-[#0D5EF4]" /> },
                  { id: 'invoice', label: 'New Invoice', icon: <Receipt className="w-4 h-4 text-[#16A34A]" /> },
                  { id: 'payment', label: 'Record Payment', icon: <CreditCard className="w-4 h-4 text-amber-500" /> },
                  { id: 'client', label: 'New Client', icon: <Users className="w-4 h-4 text-sky-500" /> },
                  { id: 'lead', label: 'New Lead', icon: <UserPlus className="w-4 h-4 text-purple-500" /> },
                  { id: 'expense', label: 'Add Expense', icon: <TrendingDown className="w-4 h-4 text-rose-500" /> },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setQuickSheetOpen(false);
                      onOpenQuickAction(item.id);
                    }}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F5F8FC] hover:bg-blue-50/60 border border-slate-200 hover:border-blue-200 text-left text-xs font-bold text-[#0B192C] transition-all"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Fixed-in-place Footer Button */}
            <div className="shrink-0 px-5 py-3 bg-[#F8FAFC] border-t border-slate-200/80">
              <button
                type="button"
                onClick={() => setQuickSheetOpen(false)}
                className="w-full py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab, conversations, invoices, leads } = useBusiness();
  const [moreOpen, setMoreOpen] = useState(false);

  const unreadMessagesCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);
  const overdueInvoicesCount = invoices.filter((i) => i.status === 'Overdue').length;
  const newLeadsCount = leads.filter((l) => l.status === 'New Enquiry').length;

  const primaryTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'invoices', label: 'Invoices', icon: Receipt, badge: overdueInvoicesCount },
  ];

  const isSecondaryActive = !primaryTabs.some((t) => t.id === activeTab);

  const secondaryModules = [
    { id: 'quotations', label: 'Quotations', icon: FileText, color: 'text-[#0D5EF4]' },
    { id: 'payments', label: 'Payments', icon: CreditCard, color: 'text-emerald-600' },
    { id: 'expenses', label: 'Expenses', icon: TrendingDown, color: 'text-rose-500' },
    { id: 'documents', label: 'Documents', icon: FolderOpen, color: 'text-amber-500' },
    { id: 'inbox', label: 'Inbox', icon: MessageSquare, color: 'text-sky-500', badge: unreadMessagesCount },
    { id: 'leads', label: 'Leads', icon: UserPlus, color: 'text-purple-500', badge: newLeadsCount },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, color: 'text-teal-500' },
    { id: 'reports', label: 'Reports', icon: BarChart3, color: 'text-indigo-500' },
    { id: 'ai-assistant', label: 'Voice AI', icon: Mic, color: 'text-[#0D5EF4]' },
    { id: 'automations', label: 'Automations', icon: Zap, color: 'text-amber-500' },
    { id: 'services', label: 'Services', icon: Briefcase, color: 'text-slate-600' },
    { id: 'forms', label: 'Forms', icon: ClipboardList, color: 'text-emerald-600' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'text-slate-600' },
  ];

  return (
    <>
      {/* Compact 5-Tab Bottom Navigation Bar for Mobile (< lg) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 flex items-center justify-around">
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id && !moreOpen;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setMoreOpen(false);
                setActiveTab(tab.id);
              }}
              className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[40px] px-2 py-0.5 rounded-xl transition-colors ${
                isActive ? 'text-[#0D5EF4]' : 'text-slate-500 hover:text-[#0B192C]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] font-bold mt-0.5">{tab.label}</span>
              {tab.badge && tab.badge > 0 ? (
                <span className="absolute top-1 right-2.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
              ) : null}
            </button>
          );
        })}

        {/* 5th Tab: More Modules */}
        <button
          onClick={() => setMoreOpen((prev) => !prev)}
          className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[40px] px-2 py-0.5 rounded-xl transition-colors ${
            moreOpen || isSecondaryActive ? 'text-[#0D5EF4]' : 'text-slate-500 hover:text-[#0B192C]'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span className="text-[10px] font-bold mt-0.5">More</span>
          {unreadMessagesCount + newLeadsCount > 0 && (
            <span className="absolute top-1 right-2.5 w-1.5 h-1.5 rounded-full bg-[#0D5EF4]" />
          )}
        </button>
      </nav>

      {/* Secondary Modules Hub Bottom Sheet */}
      {moreOpen && (
        <div
          onClick={() => setMoreOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-[#0B192C]/50 backdrop-blur-xs flex items-end justify-center pb-14"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-h-[75vh] bg-white border-t border-slate-200 rounded-t-3xl flex flex-col overflow-hidden"
          >
            {/* Fixed-in-place Header */}
            <div className="shrink-0 bg-[#F8FAFC] border-b border-slate-200/80 px-5 pt-3 pb-3">
              <div className="w-10 h-1 rounded-full bg-slate-300 mx-auto mb-2.5" />
              <h3 className="text-sm font-extrabold text-[#0B192C]">All Modules</h3>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              <div className="grid grid-cols-3 gap-2">
                {secondaryModules.map((mod) => {
                  const Icon = mod.icon;
                  const isActive = activeTab === mod.id;
                  return (
                    <button
                      key={mod.id}
                      onClick={() => {
                        setActiveTab(mod.id);
                        setMoreOpen(false);
                      }}
                      className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-colors ${
                        isActive
                          ? 'bg-[#EBF2FF] border-[#0D5EF4] text-[#0D5EF4]'
                          : 'bg-[#F5F8FC] border-slate-200 text-slate-700 hover:text-[#0B192C]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mb-1 ${mod.color}`} />
                      <span className="text-[11px] font-bold leading-tight">{mod.label}</span>
                      {mod.badge && mod.badge > 0 ? (
                        <span className="absolute top-1.5 right-1.5 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-rose-500 text-white">
                          {mod.badge}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fixed-in-place Footer Button */}
            <div className="shrink-0 px-5 py-3 bg-[#F8FAFC] border-t border-slate-200/80">
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="w-full py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

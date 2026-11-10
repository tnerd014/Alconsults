import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { BrandLogo } from '../common/BrandLogo';
import { VoiceRecordModal } from '../modals/VoiceRecordModal';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Layers,
  ChevronRight,
  ChevronLeft,
  Mic,
  FolderGit2,
  Receipt,
  FileSpreadsheet,
  CheckSquare,
  BarChart3,
  MessageSquare,
  UserPlus,
  CreditCard,
  TrendingDown,
  FolderOpen,
  Zap,
  Settings,
  ClipboardList,
  Calendar,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  onOpenCalendar?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenCalendar }) => {
  const { activeTab, setActiveTab, conversations, invoices, leads, profile, updateProfile } =
    useBusiness();
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  const unreadMessagesCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);
  const overdueInvoicesCount = invoices.filter((i) => i.status === 'Overdue').length;
  const newLeadsCount = leads.filter((l) => l.status === 'New Enquiry').length;

  const currencies = [
    { code: 'NGN', symbol: '₦' },
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' },
  ];

  const navSections: NavSection[] = [
    {
      title: 'Commercial Pipeline',
      items: [
        {
          id: 'leads',
          label: 'Leads',
          icon: <UserPlus className="w-4 h-4 text-purple-600" />,
          badge: newLeadsCount,
        },
        {
          id: 'clients',
          label: 'Clients',
          icon: <Users className="w-4 h-4 text-[#0D5EF4]" />,
        },
        {
          id: 'quotations',
          label: 'Quotations',
          icon: <FileSpreadsheet className="w-4 h-4 text-sky-600" />,
        },
      ],
    },
    {
      title: 'Operations & Delivery',
      items: [
        {
          id: 'calendar',
          label: 'Calendar & Schedule',
          icon: <Calendar className="w-4 h-4 text-indigo-600" />,
        },
        {
          id: 'projects',
          label: 'Projects',
          icon: <FolderGit2 className="w-4 h-4 text-emerald-600" />,
        },
        {
          id: 'tasks',
          label: 'Tasks',
          icon: <CheckSquare className="w-4 h-4 text-teal-600" />,
        },
        {
          id: 'inbox',
          label: 'WhatsApp Inbox',
          icon: <MessageSquare className="w-4 h-4 text-emerald-500" />,
          badge: unreadMessagesCount,
        },
        {
          id: 'documents',
          label: 'Documents',
          icon: <FolderOpen className="w-4 h-4 text-amber-600" />,
        },
      ],
    },
    {
      title: 'Finance & Accounts',
      items: [
        {
          id: 'invoices',
          label: 'Invoices',
          icon: <Receipt className="w-4 h-4 text-blue-600" />,
          badge: overdueInvoicesCount,
        },
        {
          id: 'payments',
          label: 'Payments',
          icon: <CreditCard className="w-4 h-4 text-emerald-600" />,
        },
        {
          id: 'expenses',
          label: 'Expenses',
          icon: <TrendingDown className="w-4 h-4 text-rose-500" />,
        },
        {
          id: 'reports',
          label: 'Financial Reports',
          icon: <BarChart3 className="w-4 h-4 text-indigo-600" />,
        },
      ],
    },
    {
      title: 'System & Catalog',
      items: [
        {
          id: 'services',
          label: 'Services Catalog',
          icon: <Briefcase className="w-4 h-4 text-slate-600" />,
        },
        {
          id: 'forms',
          label: 'Onboarding Forms',
          icon: <ClipboardList className="w-4 h-4 text-emerald-600" />,
        },
        {
          id: 'automations',
          label: 'Automations',
          icon: <Zap className="w-4 h-4 text-amber-500" />,
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: <Settings className="w-4 h-4 text-slate-500" />,
        },
      ],
    },
  ];

  return (
    <>
      <aside
        className={`hidden lg:flex bg-white border-r border-slate-200/90 flex-col justify-between shrink-0 h-full transition-all duration-200 select-none z-30 ${
          collapsed ? 'w-16' : 'w-56'
        }`}
      >
        {/* Fixed Brand Header */}
        <div className="px-4 py-3.5 border-b border-slate-200/80 flex items-center justify-between shrink-0 bg-white">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center min-w-0 text-left focus:outline-none group"
          >
            <BrandLogo size="sm" showText={!collapsed} variant="light" />
          </button>
        </div>

        {/* 1-Click Flat Pipeline Navigation */}
        <div className="flex-1 overflow-y-auto px-2.5 py-2.5 space-y-4">
          {/* Dashboard Home Link */}
          <button
            onClick={() => setActiveTab('dashboard')}
            title="Dashboard"
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-[#EBF2FF] text-[#0D5EF4] shadow-2xs'
                : 'text-slate-600 hover:text-[#0B192C] hover:bg-slate-50'
            } ${collapsed ? 'justify-center px-0' : ''}`}
          >
            <LayoutDashboard className="w-4 h-4 text-[#0D5EF4] shrink-0" />
            {!collapsed && <span>Dashboard</span>}
          </button>

          {/* Grouped 1-Click Sections */}
          {navSections.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              {!collapsed && (
                <div className="px-3 pt-1 pb-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  {sec.title}
                </div>
              )}
              {collapsed && idx > 0 && <div className="w-6 h-px bg-slate-200 mx-auto my-1" />}

              {sec.items.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === 'calendar' && onOpenCalendar) {
                        onOpenCalendar();
                      } else {
                        setActiveTab(item.id);
                      }
                    }}
                    title={item.label}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all relative ${
                      isActive
                        ? 'bg-[#EBF2FF] text-[#0D5EF4] font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-[#0B192C] hover:bg-slate-50'
                    } ${collapsed ? 'justify-center px-0 h-9' : ''}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="shrink-0">{item.icon}</span>
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!collapsed && item.badge && item.badge > 0 ? (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-rose-500 text-white shrink-0">
                        {item.badge}
                      </span>
                    ) : null}

                    {collapsed && item.badge && item.badge > 0 ? (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer Utilities (Voice AI + Currency + Collapse) */}
        <div className="p-2.5 border-t border-slate-200/80 shrink-0 space-y-2 bg-white">
          {!collapsed && (
            <div className="flex items-center justify-between gap-1.5 px-0.5">
              <button
                onClick={() => setIsVoiceModalOpen(true)}
                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl bg-[#F5F8FC] hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-[#0D5EF4] text-[11px] font-bold transition-colors"
                title="Voice AI"
              >
                <Mic className="w-3.5 h-3.5 text-[#0D5EF4]" />
                <span>Voice AI</span>
              </button>

              <select
                value={profile.currency}
                onChange={(e) => {
                  const selected = currencies.find((c) => c.code === e.target.value);
                  if (selected) {
                    updateProfile({
                      ...profile,
                      currency: selected.code,
                      currencySymbol: selected.symbol,
                    });
                  }
                }}
                className="bg-[#F5F8FC] border border-slate-200 rounded-xl px-2 py-1.5 text-[11px] font-mono font-bold text-[#0B192C] focus:outline-none focus:border-[#0D5EF4] cursor-pointer"
                title="Currency"
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.code}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-1.5 text-slate-500 hover:text-[#0B192C] hover:bg-slate-50 rounded-xl text-xs transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <div className="flex items-center justify-between w-full px-2 text-slate-500 hover:text-[#0B192C]">
                <span className="text-xs font-medium">Collapse</span>
                <ChevronLeft className="w-4 h-4" />
              </div>
            )}
          </button>
        </div>
      </aside>

      <VoiceRecordModal isOpen={isVoiceModalOpen} onClose={() => setIsVoiceModalOpen(false)} />
    </>
  );
};

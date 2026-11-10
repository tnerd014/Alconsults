import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { SearchAndFilterBar } from '../common/SearchAndFilterBar';
import {
  Plus,
  Clock,
  AlertCircle,
  Users,
  CreditCard,
  Folder,
  FileText,
  Calculator,
  Check,
  FileSpreadsheet,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';

interface DashboardViewProps {
  onOpenQuickAction: (action: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenQuickAction }) => {
  const {
    financials,
    formatCurrency,
    formatCompactCurrency,
    projects,
    invoices,
    quotations,
    clients,
    leads,
    activities,
    setActiveTab,
    searchQuery,
    setSearchQuery,
  } = useBusiness();

  const [dashboardSection, setDashboardSection] = useState<string>('projects');
  const [stageFilter, setStageFilter] = useState<string>('All');

  const overdueInvoices = invoices.filter((i) => i.status === 'Overdue');
  const activeProjects = projects.filter(
    (p) =>
      p.stage !== 'Completed' &&
      (stageFilter === 'All' || p.stage === stageFilter) &&
      (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.clientName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredActivities = activities.filter(
    (a) =>
      a.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const upcomingDeadlines = projects
    .filter((p) => p.stage !== 'Completed')
    .sort((a, b) => new Date(a.expectedCompletionDate).getTime() - new Date(b.expectedCompletionDate).getTime())
    .slice(0, 3);

  const activeFiltersCount = (dashboardSection !== 'projects' ? 1 : 0) + (stageFilter !== 'All' ? 1 : 0);

  return (
    <div className="p-3.5 sm:p-6 space-y-4 max-w-6xl mx-auto">
      {/* Main Page Search + Popup Filter Modal */}
      <SearchAndFilterBar
        searchPlaceholder="Search active projects, clients, or activity..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        activeFiltersCount={activeFiltersCount}
        onResetFilters={() => {
          setDashboardSection('projects');
          setStageFilter('All');
        }}
        filterGroups={[
          {
            label: 'Dashboard Feed',
            value: dashboardSection,
            onChange: setDashboardSection,
            options: [
              { label: `Active Projects (${activeProjects.length})`, value: 'projects' },
              { label: `Recent Activity (${filteredActivities.length})`, value: 'activity' },
            ],
          },
          {
            label: 'Project Stage',
            value: stageFilter,
            onChange: setStageFilter,
            options: [
              { label: 'All Active Stages', value: 'All' },
              { label: 'Planning', value: 'Planning' },
              { label: 'UI/UX Design', value: 'UI/UX Design' },
              { label: 'Development', value: 'Development' },
              { label: 'Testing', value: 'Testing' },
              { label: 'Awaiting Client Review', value: 'Awaiting Client Review' },
            ],
          },
        ]}
      />

      {/* 6-Card Minimalist KPI Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        <button
          onClick={() => setActiveTab('clients')}
          className="bg-white rounded-2xl p-3 shadow-2xs border border-slate-200/80 flex flex-col items-center justify-center text-center hover:border-[#0D5EF4] transition-all min-w-0 overflow-hidden"
        >
          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#0D5EF4] mb-1 stroke-[2]" />
          <div className="text-[10px] sm:text-[11px] font-medium text-slate-500 truncate w-full">Clients</div>
          <div className="text-sm sm:text-lg font-extrabold text-[#0B192C] tabular-nums mt-0.5 font-mono">
            {clients.length}
          </div>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className="bg-white rounded-2xl p-3 shadow-2xs border border-slate-200/80 flex flex-col items-center justify-center text-center hover:border-[#0D5EF4] transition-all min-w-0 overflow-hidden"
        >
          <Folder className="w-4 h-4 sm:w-5 sm:h-5 text-[#0D5EF4] mb-1 stroke-[2]" />
          <div className="text-[10px] sm:text-[11px] font-medium text-slate-500 truncate w-full">Projects</div>
          <div className="text-sm sm:text-lg font-extrabold text-[#0B192C] tabular-nums mt-0.5 font-mono">
            {projects.length}
          </div>
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className="bg-white rounded-2xl p-3 shadow-2xs border border-slate-200/80 flex flex-col items-center justify-center text-center hover:border-[#0D5EF4] transition-all min-w-0 overflow-hidden"
        >
          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#0D5EF4] mb-1 stroke-[2]" />
          <div className="text-[10px] sm:text-[11px] font-medium text-slate-500 truncate w-full">Invoiced</div>
          <div className="text-xs sm:text-base font-extrabold text-[#0B192C] font-mono tabular-nums mt-0.5 truncate w-full">
            {formatCompactCurrency(financials.invoicedAmount)}
          </div>
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className="bg-white rounded-2xl p-3 shadow-2xs border border-slate-200/80 flex flex-col items-center justify-center text-center hover:border-rose-300 transition-all min-w-0 overflow-hidden"
        >
          <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-[#DC2626] mb-1 stroke-[2]" />
          <div className="text-[10px] sm:text-[11px] font-medium text-slate-500 truncate w-full">Outstanding</div>
          <div className="text-xs sm:text-base font-extrabold text-[#DC2626] font-mono tabular-nums mt-0.5 truncate w-full">
            {formatCompactCurrency(financials.outstandingAmount)}
          </div>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className="bg-white rounded-2xl p-3 shadow-2xs border border-slate-200/80 flex flex-col items-center justify-center text-center hover:border-emerald-300 transition-all min-w-0 overflow-hidden"
        >
          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#16A34A] text-white flex items-center justify-center mb-1">
            <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
          </div>
          <div className="text-[10px] sm:text-[11px] font-medium text-slate-500 truncate w-full">Received</div>
          <div className="text-xs sm:text-base font-extrabold text-[#16A34A] font-mono tabular-nums mt-0.5 truncate w-full">
            {formatCompactCurrency(financials.collectedAmount)}
          </div>
        </button>

        <button
          onClick={() => setActiveTab('quotations')}
          className="bg-white rounded-2xl p-3 shadow-2xs border border-slate-200/80 flex flex-col items-center justify-center text-center hover:border-[#0D5EF4] transition-all min-w-0 overflow-hidden"
        >
          <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5 text-[#0D5EF4] mb-1 stroke-[2]" />
          <div className="text-[10px] sm:text-[11px] font-medium text-slate-500 truncate w-full">Quotes</div>
          <div className="text-sm sm:text-lg font-extrabold text-[#0B192C] tabular-nums mt-0.5 font-mono">
            {quotations.length}
          </div>
        </button>
      </div>

      {/* Overdue Alert Bar */}
      {overdueInvoices.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs text-rose-800">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="truncate">
              <strong>{overdueInvoices.length} overdue</strong> ({formatCurrency(overdueInvoices.reduce((acc, i) => acc + i.balanceDue, 0))})
            </span>
          </div>
          <button
            onClick={() => setActiveTab('invoices')}
            className="font-bold text-rose-700 hover:underline shrink-0"
          >
            View →
          </button>
        </div>
      )}

      {dashboardSection === 'projects' ? (
        <div className="space-y-4">
          {/* Full-Width Active Projects List */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Active Projects ({activeProjects.length})
              </h2>
              <button
                onClick={() => setActiveTab('projects')}
                className="text-xs font-bold text-[#0D5EF4] flex items-center gap-0.5 hover:underline"
              >
                <span>All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {activeProjects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setActiveTab('projects')}
                  className="px-4 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold text-[#0B192C] truncate">{p.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {p.clientName} · <span className="text-[#0D5EF4] font-semibold">{p.stage}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-[#0B192C] tabular-nums">
                        {formatCurrency(p.contractValue)}
                      </div>
                      <div className="flex items-center justify-end gap-1.5 mt-0.5">
                        <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className="bg-[#16A34A] h-full rounded-full"
                            style={{ width: `${p.progressPercent}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] font-bold text-slate-500 tabular-nums">
                          {p.progressPercent}%
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
              {activeProjects.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  No active projects match your current filter.
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Milestones Strip */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#0D5EF4]" />
                <span>Upcoming Deadlines</span>
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              {upcomingDeadlines.map((p) => {
                const pendingMilestone = p.milestones.find((m) => m.status !== 'Completed');
                return (
                  <div
                    key={p.id}
                    onClick={() => setActiveTab('projects')}
                    className="p-3 bg-[#F5F8FC] hover:bg-blue-50/50 rounded-xl border border-slate-200/70 cursor-pointer transition-colors"
                  >
                    <div className="font-bold text-[#0B192C] truncate">{p.name}</div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {pendingMilestone ? pendingMilestone.title : 'All milestones complete'}
                    </div>
                    <div className="font-mono text-[10px] font-semibold text-[#0D5EF4] mt-1">
                      Due {p.expectedCompletionDate}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Full-Width Recent Activity View */
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Recent Activity ({filteredActivities.length})
            </h2>
            <button
              onClick={() => setActiveTab('payments')}
              className="text-xs font-bold text-[#0D5EF4] flex items-center gap-0.5 hover:underline"
            >
              <span>Payments</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredActivities.map((act) => {
              const isPayment = act.category === 'finance' || act.event.toLowerCase().includes('payment');
              const isQuote =
                act.event.toLowerCase().includes('quotation') || act.event.toLowerCase().includes('quote');

              return (
                <div
                  key={act.id}
                  onClick={() => {
                    if (isPayment) setActiveTab('payments');
                    else if (isQuote) setActiveTab('quotations');
                    else setActiveTab('leads');
                  }}
                  className="py-2.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isPayment ? (
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0D5EF4] flex items-center justify-center shrink-0">
                        <CreditCard className="w-3.5 h-3.5 stroke-[2.2]" />
                      </div>
                    ) : isQuote ? (
                      <div className="w-7 h-7 rounded-full bg-[#16A34A] text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#7C3AED] text-white flex items-center justify-center shrink-0">
                        <MessageSquare className="w-3.5 h-3.5 stroke-[2.2]" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#0B192C] truncate">{act.event}</div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {act.details} • {act.timestamp.substring(5)}
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              );
            })}
          </div>

          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              Enquiries: <strong className="text-[#0B192C]">{leads.length}</strong>
            </span>
            <button
              onClick={() => setActiveTab('leads')}
              className="font-bold text-[#0D5EF4] hover:underline"
            >
              Leads →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

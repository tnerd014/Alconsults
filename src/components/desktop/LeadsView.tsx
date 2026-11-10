import React, { useMemo } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { Lead, LeadStatus } from '../../types';
import {
  ArrowRight,
  CheckCircle2,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Eye,
  UserCheck,
  Trash2,
} from 'lucide-react';
import { SearchAndFilterBar } from '../common/SearchAndFilterBar';
import { DetailViewHeader } from '../common/DetailViewHeader';
import {
  useTableSort,
  SortableTh,
  RowActionsMenu,
  TableSummaryFooter,
} from '../common/TableMechanics';

interface LeadsViewProps {
  onNewLead: () => void;
}

export const LeadsView: React.FC<LeadsViewProps> = () => {
  const {
    leads,
    updateLeadStatus,
    convertLeadToClient,
    deleteLead,
    formatCurrency,
    setActiveTab,
    searchQuery: searchTerm,
    setSearchQuery: setSearchTerm,
    moduleFilter: statusFilter,
    setModuleFilter: setStatusFilter,
    selectedRecordIds,
    setSelectedRecordForTab,
  } = useBusiness();

  const selectedLeadId = selectedRecordIds['leads'] || null;
  const setSelectedLeadId = (id: string | null) => setSelectedRecordForTab('leads', id);

  const statuses: LeadStatus[] = [
    'New Enquiry',
    'Contacted',
    'Discussion',
    'Requirements Gathering',
    'Preparing Quotation',
    'Quotation Sent',
    'Negotiation',
    'Converted',
    'Lost',
  ];

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.serviceRequested.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leads, searchTerm, statusFilter]);

  const { sortedItems: sortedLeads, sortConfig, handleSort } = useTableSort<Lead>(
    filteredLeads,
    'estimatedValue',
    'desc'
  );

  const activeLead = selectedLeadId
    ? leads.find((l) => l.id === selectedLeadId) || null
    : null;

  /* ====================================================================== */
  /* PAGE 2: DEDICATED LEAD DETAIL PAGE                                     */
  /* ====================================================================== */
  if (activeLead) {
    const currentIndex = sortedLeads.findIndex((l) => l.id === activeLead.id);

    return (
      <div className="p-3.5 sm:p-5 space-y-4 max-w-4xl mx-auto min-h-full flex flex-col">
        <DetailViewHeader
          moduleLabel="Leads"
          recordTitle={`${activeLead.name} — ${activeLead.company}`}
          onBack={() => setSelectedLeadId(null)}
          currentIndex={currentIndex >= 0 ? currentIndex : 0}
          totalCount={sortedLeads.length}
          onPrev={
            currentIndex > 0 ? () => setSelectedLeadId(sortedLeads[currentIndex - 1].id) : undefined
          }
          onNext={
            currentIndex >= 0 && currentIndex < sortedLeads.length - 1
              ? () => setSelectedLeadId(sortedLeads[currentIndex + 1].id)
              : undefined
          }
        >
          {activeLead.status === 'Converted' ? (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Converted</span>
            </span>
          ) : (
            <button
              onClick={() => {
                convertLeadToClient(activeLead.id);
                setActiveTab('clients');
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-white bg-[#0D5EF4] rounded-xl hover:bg-blue-700 shadow-2xs transition-colors shrink-0"
            >
              <span>Convert</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </DetailViewHeader>

        {/* Dedicated Lead Detail Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs p-5 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h1 className="text-lg font-extrabold text-[#0B192C]">{activeLead.name}</h1>
              <div className="text-xs text-slate-500 mt-0.5">
                {activeLead.company} · {activeLead.serviceRequested}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Estimated Deal Value
              </div>
              <div className="text-lg font-extrabold font-mono text-[#0D5EF4]">
                {formatCurrency(activeLead.estimatedValue)}
              </div>
            </div>
          </div>

          <div className="max-w-sm">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Pipeline Stage
            </label>
            <select
              value={activeLead.status}
              onChange={(e) => updateLeadStatus(activeLead.id, e.target.value as LeadStatus)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#0B192C] focus:outline-none focus:border-[#0D5EF4]"
            >
              {statuses.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-[#F5F8FC] p-4 rounded-2xl border border-slate-200/80 text-xs">
            <div>
              <div className="text-slate-400 text-[11px] flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> Email
              </div>
              <div className="font-semibold text-[#0B192C] truncate mt-1">{activeLead.email}</div>
            </div>
            <div>
              <div className="text-slate-400 text-[11px] flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> Phone
              </div>
              <div className="font-semibold text-[#0B192C] truncate mt-1">{activeLead.phone}</div>
            </div>
            <div>
              <div className="text-slate-400 text-[11px] flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" /> Stated Budget
              </div>
              <div className="font-mono font-bold text-[#0B192C] mt-1">
                {formatCurrency(activeLead.budget)}
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-[11px] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Target Timeline
              </div>
              <div className="font-semibold text-[#0B192C] mt-1">{activeLead.expectedTimeline}</div>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Initial Enquiry &amp; Problem Scope
            </div>
            <div className="p-3.5 bg-[#F5F8FC] rounded-xl border border-slate-200 text-xs text-[#0B192C] leading-relaxed">
              {activeLead.initialEnquiry}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Internal Notes
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-600">
              {activeLead.internalNotes || 'No internal notes recorded.'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ====================================================================== */
  /* PAGE 1: MAIN FULL-WIDTH LEADS TABLE (True Desktop Table Mechanics)     */
  /* ====================================================================== */
  const totalPipelineValue = sortedLeads.reduce((acc, l) => acc + l.estimatedValue, 0);
  const newEnquiriesCount = sortedLeads.filter((l) => l.status === 'New Enquiry').length;

  return (
    <div className="p-3 sm:p-5 flex-1 flex flex-col min-h-0">
      <SearchAndFilterBar
        placeholder="Search leads by name, company, or service..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        modalTitle="Filter Leads"
        filterGroups={[
          {
            label: 'Pipeline Stage',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Stages', value: 'all' },
              ...statuses.map((st) => ({ label: st, value: st })),
            ],
          },
        ]}
      />

      {/* MOBILE FEED (< sm): Non-overwhelming touch cards */}
      <div className="sm:hidden space-y-2.5 overflow-y-auto flex-1 pb-2">
        {sortedLeads.map((lead) => (
          <div
            key={lead.id}
            onClick={() => setSelectedLeadId(lead.id)}
            className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs active:bg-blue-50/50 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-bold text-sm text-[#0B192C] truncate">{lead.name}</div>
                <div className="text-[11px] text-slate-500 truncate">{lead.company}</div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-bold text-[#0D5EF4] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                  {lead.status}
                </span>
                <RowActionsMenu
                  actions={[
                    {
                      label: 'Open Details',
                      icon: <Eye className="w-3.5 h-3.5" />,
                      onClick: () => setSelectedLeadId(lead.id),
                      variant: 'primary',
                    },
                    ...(lead.status !== 'Converted'
                      ? [
                          {
                            label: 'Convert to Client',
                            icon: <UserCheck className="w-3.5 h-3.5" />,
                            onClick: () => {
                              convertLeadToClient(lead.id);
                              setActiveTab('clients');
                            },
                          },
                        ]
                      : []),
                    {
                      label: 'Copy Email',
                      icon: <Mail className="w-3.5 h-3.5" />,
                      onClick: () => navigator.clipboard?.writeText(lead.email),
                    },
                    {
                      label: 'Delete Lead',
                      icon: <Trash2 className="w-3.5 h-3.5" />,
                      onClick: () => deleteLead(lead.id),
                      variant: 'danger',
                    },
                  ]}
                />
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500 truncate max-w-[160px]">
                {lead.serviceRequested}
              </span>
              <span className="font-mono font-extrabold text-[#0B192C]">
                {formatCurrency(lead.estimatedValue)}
              </span>
            </div>
          </div>
        ))}
        {sortedLeads.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
            No leads found matching query.
          </div>
        )}
      </div>

      {/* DESKTOP DATA TABLE (hidden on mobile, visible on sm and up) */}
      <div className="hidden sm:flex bg-white border border-slate-200/90 rounded-2xl shadow-2xs flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr>
                <SortableTh
                  label="Lead & Company"
                  sortKey="name"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTh
                  label="Contact"
                  sortKey="email"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTh
                  label="Requested Service"
                  sortKey="serviceRequested"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTh
                  label="Stage"
                  sortKey="status"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTh
                  label="Est. Value"
                  sortKey="estimatedValue"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  align="right"
                />
                <th className="px-4 py-2.5 w-12 sticky top-0 z-10 bg-[#F5F8FC] border-b border-slate-200/90 text-right font-bold text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedLeads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => setSelectedLeadId(lead.id)}
                  className="cursor-pointer transition-colors hover:bg-blue-50/40 group"
                >
                  <td className="py-3 px-4">
                    <div className="font-bold text-xs sm:text-sm text-[#0B192C] group-hover:text-[#0D5EF4] transition-colors">
                      {lead.name}
                    </div>
                    <div className="text-[11px] text-slate-500">{lead.company}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div>{lead.email}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{lead.phone}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div className="font-medium text-[#0B192C]">{lead.serviceRequested}</div>
                    <div className="text-[11px] text-slate-400">Source: {lead.source}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-block text-[10px] font-bold text-[#0D5EF4] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-[#0B192C] font-bold">
                    {formatCurrency(lead.estimatedValue)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <RowActionsMenu
                      actions={[
                        {
                          label: 'Open Lead Details',
                          icon: <Eye className="w-3.5 h-3.5" />,
                          onClick: () => setSelectedLeadId(lead.id),
                          variant: 'primary',
                        },
                        ...(lead.status !== 'Converted'
                          ? [
                              {
                                label: 'Convert to Client',
                                icon: <UserCheck className="w-3.5 h-3.5" />,
                                onClick: () => {
                                  convertLeadToClient(lead.id);
                                  setActiveTab('clients');
                                },
                              },
                            ]
                          : []),
                        {
                          label: 'Copy Email',
                          icon: <Mail className="w-3.5 h-3.5" />,
                          onClick: () => navigator.clipboard?.writeText(lead.email),
                        },
                        {
                          label: 'Delete Lead',
                          icon: <Trash2 className="w-3.5 h-3.5" />,
                          onClick: () => deleteLead(lead.id),
                          variant: 'danger',
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))}
              {sortedLeads.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                    No leads found matching query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <TableSummaryFooter
          recordCount={sortedLeads.length}
          totalCount={leads.length}
          recordLabel="Leads"
          metrics={[
            { label: 'New Enquiries', value: newEnquiriesCount, tone: 'primary' },
            { label: 'Pipeline Value', value: formatCurrency(totalPipelineValue), tone: 'emerald' },
          ]}
        />
      </div>
    </div>
  );
};

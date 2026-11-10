import React, { useState, useMemo } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { Client } from '../../types';
import {
  ExternalLink,
  Mail,
  Phone,
  Copy,
  Check,
  Building2,
  FolderGit2,
  Receipt,
  Eye,
  Trash2,
  FileSpreadsheet,
} from 'lucide-react';
import { SearchAndFilterBar } from '../common/SearchAndFilterBar';
import { DetailViewHeader } from '../common/DetailViewHeader';
import {
  useTableSort,
  SortableTh,
  RowActionsMenu,
  TableSummaryFooter,
} from '../common/TableMechanics';

interface ClientsViewProps {
  onNewClient: () => void;
}

export const ClientsView: React.FC<ClientsViewProps> = () => {
  const {
    clients,
    projects,
    invoices,
    payments,
    deleteClient,
    formatCurrency,
    formatCompactCurrency,
    setPlatformView,
    setSelectedClientIdForPortal,
    searchQuery: searchTerm,
    setSearchQuery: setSearchTerm,
    moduleFilter,
    setModuleFilter,
    selectedRecordIds,
    setSelectedRecordForTab,
    navigateToRecord,
  } = useBusiness();

  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const selectedClientId = selectedRecordIds['clients'] || null;
  const setSelectedClientId = (id: string | null) => setSelectedRecordForTab('clients', id);

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
      if (moduleFilter === 'balance') {
        const due = invoices.filter((i) => i.clientId === c.id).reduce((s, i) => s + i.balanceDue, 0);
        return due > 0;
      }
      if (moduleFilter === 'active') {
        return projects.some((p) => p.clientId === c.id && p.stage !== 'Completed');
      }
      return true;
    });
  }, [clients, invoices, projects, searchTerm, moduleFilter]);

  const customGetters = useMemo(
    () => ({
      name: (c: Client) => c.name,
      email: (c: Client) => c.email,
      projects: (c: Client) => projects.filter((p) => p.clientId === c.id).length,
      outstanding: (c: Client) =>
        invoices.filter((i) => i.clientId === c.id).reduce((s, i) => s + i.balanceDue, 0),
    }),
    [projects, invoices]
  );

  const { sortedItems: sortedClients, sortConfig, handleSort } = useTableSort<Client>(
    filteredClients,
    'name',
    'asc',
    customGetters
  );

  const selectedClient = selectedClientId
    ? clients.find((c) => c.id === selectedClientId) || null
    : null;

  const copyPortalLink = (client: Client) => {
    const link = `https://portal.apexdigital.tech/access?token=${client.portalToken}`;
    navigator.clipboard?.writeText(link);
    setCopiedToken(client.id);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const previewInClientPortal = (clientId: string) => {
    setSelectedClientIdForPortal(clientId);
    setPlatformView('portal');
  };

  // ============================================================================
  // PAGE 2: DEDICATED CLIENT DETAIL PAGE (With Breadcrumbs & Prev/Next Stepper)
  // ============================================================================
  if (selectedClient) {
    const currentIndex = sortedClients.findIndex((c) => c.id === selectedClient.id);
    const clientProjects = projects.filter((p) => p.clientId === selectedClient.id);
    const clientInvoices = invoices.filter((i) => i.clientId === selectedClient.id);
    const clientPayments = payments.filter((p) => p.clientId === selectedClient.id);
    const totalBilled = clientInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
    const totalPaid = clientPayments.reduce((sum, p) => sum + p.amount, 0);
    const outstanding = clientInvoices.reduce((sum, i) => sum + i.balanceDue, 0);
    const collectionRate =
      totalBilled > 0 ? Math.min(100, Math.round((totalPaid / totalBilled) * 100)) : 100;

    // Adaptive monetary formatter to gracefully handle millions on mobile viewports with zero clipping
    const renderStatAmount = (amount: number) => {
      const isMillionOrMore = Math.abs(amount) >= 1_000_000;
      const isHundredsOfThousands = Math.abs(amount) >= 100_000;
      const fullFormatted = formatCurrency(amount);
      const compactFormatted = formatCompactCurrency(amount);

      return (
        <div className="min-w-0" title={fullFormatted}>
          {/* Mobile Viewport (< sm): Compact primary for large amounts to prevent horizontal text break */}
          <div className="sm:hidden">
            <div
              className={`font-mono font-extrabold truncate tracking-tight ${
                isMillionOrMore
                  ? 'text-xs xs:text-sm'
                  : isHundredsOfThousands
                  ? 'text-xs'
                  : 'text-xs xs:text-sm'
              }`}
            >
              {isMillionOrMore ? compactFormatted : fullFormatted}
            </div>
            {isMillionOrMore && (
              <div
                className="font-mono text-[9px] text-slate-400 truncate mt-0.5"
                title={fullFormatted}
              >
                {fullFormatted}
              </div>
            )}
          </div>

          {/* Desktop Viewport (>= sm): High-resolution typography */}
          <div className="hidden sm:block">
            <div
              className={`font-mono font-extrabold tracking-tight truncate ${
                isMillionOrMore
                  ? 'text-sm md:text-base lg:text-lg'
                  : isHundredsOfThousands
                  ? 'text-base md:text-lg lg:text-xl'
                  : 'text-lg lg:text-xl'
              }`}
            >
              {fullFormatted}
            </div>
            {isMillionOrMore && (
              <div className="font-mono text-[10px] text-slate-400 truncate mt-0.5">
                Approx. {compactFormatted}
              </div>
            )}
          </div>
        </div>
      );
    };

    const currentCrumb = {
      tab: 'clients',
      tabLabel: 'Clients',
      recordId: selectedClient.id,
      recordLabel: selectedClient.company || selectedClient.name,
    };

    return (
      <div className="p-3.5 sm:p-5 space-y-4 max-w-6xl mx-auto min-h-full flex flex-col">
        <DetailViewHeader
          moduleLabel="Clients"
          recordTitle={`${selectedClient.name} — ${selectedClient.company}`}
          onBack={() => setSelectedClientId(null)}
          currentIndex={currentIndex >= 0 ? currentIndex : 0}
          totalCount={sortedClients.length}
          onPrev={
            currentIndex > 0 ? () => setSelectedClientId(sortedClients[currentIndex - 1].id) : undefined
          }
          onNext={
            currentIndex >= 0 && currentIndex < sortedClients.length - 1
              ? () => setSelectedClientId(sortedClients[currentIndex + 1].id)
              : undefined
          }
        >
          <button
            onClick={() => previewInClientPortal(selectedClient.id)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-white bg-[#0D5EF4] hover:bg-blue-700 rounded-xl shadow-2xs transition-colors shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Portal</span>
          </button>
        </DetailViewHeader>

        {/* Executive Financial Ledger Card - 100% Mobile Responsive & Scalable for Millions */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          {/* Top Collection Health Indicator Bar */}
          {totalBilled > 0 && (
            <div
              className="h-1 bg-slate-100 w-full overflow-hidden flex"
              title={`${collectionRate}% Collected (${formatCurrency(totalPaid)})`}
            >
              <div
                className="bg-[#16A34A] h-full transition-all duration-500"
                style={{ width: `${collectionRate}%` }}
              />
              <div
                className="bg-amber-400 h-full transition-all duration-500"
                style={{ width: `${100 - collectionRate}%` }}
              />
            </div>
          )}

          <div className="grid grid-cols-3 divide-x divide-slate-100 p-2.5 sm:p-4 text-xs">
            {/* 1. Billed */}
            <div className="px-2 sm:px-4 first:pl-1 sm:first:pl-2 min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5 text-slate-500 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0D5EF4] shrink-0" />
                <span className="truncate">Billed</span>
              </div>
              <div className="text-[#0B192C] mt-1">
                {renderStatAmount(totalBilled)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 hidden sm:flex items-center gap-1 truncate">
                <span>{clientInvoices.length} {clientInvoices.length === 1 ? 'invoice' : 'invoices'} issued</span>
              </div>
            </div>

            {/* 2. Collected */}
            <div className="px-2 sm:px-4 min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5 text-[#16A34A] text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] shrink-0" />
                <span className="truncate">Collected</span>
              </div>
              <div className="text-[#16A34A] mt-1">
                {renderStatAmount(totalPaid)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 hidden sm:flex items-center gap-1 truncate">
                <span>{collectionRate}% recovery rate</span>
              </div>
            </div>

            {/* 3. Balance Due */}
            <div className="px-2 sm:px-4 last:pr-1 sm:last:pr-2 min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5 text-amber-600 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider">
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    outstanding > 0 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                />
                <span className="truncate sm:hidden">Due</span>
                <span className="truncate hidden sm:inline">Balance Due</span>
              </div>
              <div className={outstanding > 0 ? 'text-amber-600 mt-1' : 'text-[#16A34A] mt-1'}>
                {outstanding === 0 ? (
                  <div className="flex items-center gap-1 font-mono font-extrabold text-xs sm:text-base lg:text-lg text-[#16A34A]">
                    <Check className="w-3.5 h-3.5 stroke-[3] hidden xs:inline" />
                    <span>Settled</span>
                  </div>
                ) : (
                  renderStatAmount(outstanding)
                )}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 hidden sm:flex items-center gap-1 truncate">
                <span>{outstanding > 0 ? 'Pending collection' : 'Zero balance'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info & Portal Access Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5 text-xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Contact Information
            </div>
            <div className="space-y-2 text-[#0B192C]">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#0D5EF4] shrink-0" />
                <span>{selectedClient.email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#0D5EF4] shrink-0" />
                <span>{selectedClient.phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-[#0D5EF4] shrink-0" />
                <span>{selectedClient.address}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Client Web Portal Link
              </span>
              <span className="text-[10px] text-[#16A34A] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                Active &amp; Secure
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={`https://portal.apexdigital.tech/access?token=${selectedClient.portalToken}`}
                className="w-full bg-[#F5F8FC] border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-[#0B192C] select-all"
              />
              <button
                onClick={() => copyPortalLink(selectedClient)}
                className="px-3 py-2 bg-[#F5F8FC] border border-slate-200 hover:bg-slate-100 rounded-xl text-[#0B192C] shrink-0 flex items-center gap-1.5 font-bold"
                title="Copy Portal Link"
              >
                {copiedToken === selectedClient.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#0D5EF4]" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Linked Projects & Linked Invoices (Clickable Cross-Linking) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Connected Projects */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5 text-[#0D5EF4]" />
                <span>Linked Projects ({clientProjects.length})</span>
              </span>
            </div>
            <div className="space-y-2">
              {clientProjects.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => navigateToRecord('projects', p.id, p.name, currentCrumb)}
                  className="w-full text-left p-3 bg-[#F5F8FC] hover:bg-blue-50/60 rounded-xl border border-slate-200/80 hover:border-blue-300 transition-all group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[#0B192C] group-hover:text-[#0D5EF4] transition-colors truncate">
                      {p.name}
                    </span>
                    <span className="font-mono font-bold text-[#0B192C] shrink-0">
                      {formatCurrency(p.contractValue)}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>Stage: {p.stage}</span>
                    <span className="font-mono text-[#0D5EF4] font-bold">{p.progressPercent}%</span>
                  </div>
                </button>
              ))}
              {clientProjects.length === 0 && (
                <div className="text-slate-400 text-xs py-2">No active projects for this client.</div>
              )}
            </div>
          </div>

          {/* Connected Invoices */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                <span>Linked Invoices ({clientInvoices.length})</span>
              </span>
            </div>
            <div className="space-y-2">
              {clientInvoices.map((inv) => (
                <button
                  key={inv.id}
                  type="button"
                  onClick={() => navigateToRecord('invoices', inv.id, inv.invoiceNumber, currentCrumb)}
                  className="w-full text-left p-3 bg-[#F5F8FC] hover:bg-blue-50/60 rounded-xl border border-slate-200/80 hover:border-blue-300 transition-all group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-[#0B192C] group-hover:text-[#0D5EF4] transition-colors">
                      {inv.invoiceNumber}
                    </span>
                    <span className="font-mono font-bold text-[#0B192C]">
                      {formatCurrency(inv.totalAmount)}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>Status: {inv.status}</span>
                    <span
                      className={`font-mono font-bold ${
                        inv.balanceDue > 0 ? 'text-amber-600' : 'text-emerald-600'
                      }`}
                    >
                      Due: {formatCurrency(inv.balanceDue)}
                    </span>
                  </div>
                </button>
              ))}
              {clientInvoices.length === 0 && (
                <div className="text-slate-400 text-xs py-2">No invoices issued for this client.</div>
              )}
            </div>
          </div>
        </div>

        {/* Internal Notes */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Internal Notes</span>
            <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-bold">
              Internal Only
            </span>
          </div>
          <div className="p-3 bg-[#F5F8FC] rounded-xl border border-slate-200/80 text-slate-700 leading-relaxed">
            {selectedClient.internalNotes || 'No internal notes on file.'}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // PAGE 1: RESPONSIVE PRESENTATION: TABLE ON DESKTOP, CLEAN CARD FEED ON MOBILE
  // ============================================================================
  const totalProjectsCount = sortedClients.reduce(
    (acc, c) => acc + projects.filter((p) => p.clientId === c.id).length,
    0
  );
  const totalOutstandingSum = sortedClients.reduce(
    (acc, c) =>
      acc + invoices.filter((i) => i.clientId === c.id).reduce((s, i) => s + i.balanceDue, 0),
    0
  );

  return (
    <div className="p-3 sm:p-5 flex-1 flex flex-col min-h-0">
      <SearchAndFilterBar
        placeholder="Search clients by name, company, or email..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        modalTitle="Filter Clients"
        filterGroups={[
          {
            label: 'Client Segment',
            value: moduleFilter,
            onChange: setModuleFilter,
            options: [
              { label: 'All Clients', value: 'all' },
              { label: 'Outstanding Balance', value: 'balance' },
              { label: 'Active Projects', value: 'active' },
            ],
          },
        ]}
      />

      {/* MOBILE FEED (< sm): Minimalist touch-friendly cards */}
      <div className="sm:hidden space-y-2.5 overflow-y-auto flex-1">
        {sortedClients.map((client) => {
          const clientOut = invoices
            .filter((i) => i.clientId === client.id)
            .reduce((sum, i) => sum + i.balanceDue, 0);
          const projCount = projects.filter((p) => p.clientId === client.id).length;

          return (
            <div
              key={client.id}
              onClick={() => setSelectedClientId(client.id)}
              className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs active:bg-blue-50/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-bold text-sm text-[#0B192C] truncate">{client.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{client.company}</div>
                </div>
                <RowActionsMenu
                  actions={[
                    {
                      label: 'Open Profile',
                      icon: <Eye className="w-3.5 h-3.5" />,
                      onClick: () => setSelectedClientId(client.id),
                      variant: 'primary',
                    },
                    {
                      label: 'Open Portal',
                      icon: <ExternalLink className="w-3.5 h-3.5" />,
                      onClick: () => previewInClientPortal(client.id),
                    },
                    {
                      label: 'Copy Portal Link',
                      icon: <Copy className="w-3.5 h-3.5" />,
                      onClick: () => copyPortalLink(client),
                    },
                    {
                      label: 'Delete Client',
                      icon: <Trash2 className="w-3.5 h-3.5" />,
                      onClick: () => deleteClient(client.id),
                      variant: 'danger',
                    },
                  ]}
                />
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-mono text-xs text-slate-600">
                  {projCount} {projCount === 1 ? 'project' : 'projects'}
                </span>
                <span className="font-mono font-bold">
                  {clientOut > 0 ? (
                    <span className="text-amber-600">{formatCurrency(clientOut)} due</span>
                  ) : (
                    <span className="text-emerald-600 font-semibold">Settled</span>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* DESKTOP DATA TABLE (hidden on mobile, visible on sm and up) */}
      <div className="hidden sm:flex bg-white border border-slate-200/90 rounded-2xl shadow-2xs flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr>
                <SortableTh
                  label="Client & Company"
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
                  label="Projects"
                  sortKey="projects"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  align="center"
                />
                <SortableTh
                  label="Outstanding"
                  sortKey="outstanding"
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
              {sortedClients.map((client) => {
                const clientOut = invoices
                  .filter((i) => i.clientId === client.id)
                  .reduce((sum, i) => sum + i.balanceDue, 0);
                const projCount = projects.filter((p) => p.clientId === client.id).length;

                return (
                  <tr
                    key={client.id}
                    onClick={() => setSelectedClientId(client.id)}
                    className="cursor-pointer hover:bg-blue-50/40 transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-xs sm:text-sm text-[#0B192C] group-hover:text-[#0D5EF4] transition-colors">
                        {client.name}
                      </div>
                      <div className="text-[11px] text-slate-500">{client.company}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div className="truncate max-w-[180px] sm:max-w-none">{client.email}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{client.phone}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono font-bold text-xs text-[#0D5EF4] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg">
                        {projCount}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      {clientOut > 0 ? (
                        <span className="text-amber-600">{formatCurrency(clientOut)}</span>
                      ) : (
                        <span className="text-slate-400">{formatCurrency(0)}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <RowActionsMenu
                        actions={[
                          {
                            label: 'Open Client Profile',
                            icon: <Eye className="w-3.5 h-3.5" />,
                            onClick: () => setSelectedClientId(client.id),
                            variant: 'primary',
                          },
                          {
                            label: 'Open Client Portal',
                            icon: <ExternalLink className="w-3.5 h-3.5" />,
                            onClick: () => previewInClientPortal(client.id),
                          },
                          {
                            label: 'Copy Portal Link',
                            icon: <Copy className="w-3.5 h-3.5" />,
                            onClick: () => copyPortalLink(client),
                          },
                          {
                            label: 'Copy Email',
                            icon: <Mail className="w-3.5 h-3.5" />,
                            onClick: () => navigator.clipboard?.writeText(client.email),
                          },
                          {
                            label: 'Delete Client',
                            icon: <Trash2 className="w-3.5 h-3.5" />,
                            onClick: () => deleteClient(client.id),
                            variant: 'danger',
                          },
                        ]}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <TableSummaryFooter
          recordCount={sortedClients.length}
          totalCount={clients.length}
          recordLabel="Clients"
          metrics={[
            { label: 'Active Projects', value: totalProjectsCount, tone: 'primary' },
            {
              label: 'Total Outstanding',
              value: formatCurrency(totalOutstandingSum),
              tone: totalOutstandingSum > 0 ? 'amber' : 'default',
            },
          ]}
        />
      </div>
    </div>
  );
};

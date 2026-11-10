import React, { useState, useMemo } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { Quotation } from '../../types';
import {
  CheckCircle2,
  XCircle,
  History,
  Printer,
  Download,
  Send,
  Building2,
  Eye,
  Users,
  Trash2,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { SendDocumentEmailModal } from '../modals/SendDocumentEmailModal';
import { SearchAndFilterBar } from '../common/SearchAndFilterBar';
import { DetailViewHeader } from '../common/DetailViewHeader';
import {
  useTableSort,
  SortableTh,
  RowActionsMenu,
  TableSummaryFooter,
} from '../common/TableMechanics';

interface QuotationsViewProps {
  onNewQuotation: () => void;
}

export const QuotationsView: React.FC<QuotationsViewProps> = () => {
  const {
    quotations,
    profile,
    acceptQuotation,
    rejectQuotation,
    createQuotationRevision,
    deleteQuotation,
    formatCurrency,
    searchQuery: searchTerm,
    setSearchQuery: setSearchTerm,
    moduleFilter: statusFilter,
    setModuleFilter: setStatusFilter,
    selectedRecordIds,
    setSelectedRecordForTab,
    navigateToRecord,
  } = useBusiness();

  const selectedQuoteId = selectedRecordIds['quotations'] || null;
  const setSelectedQuoteId = (id: string | null) => setSelectedRecordForTab('quotations', id);

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisionReason, setRevisionReason] = useState('');

  const filteredQuotes = useMemo(() => {
    return quotations.filter((q) => {
      const matchesSearch =
        q.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.projectName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [quotations, searchTerm, statusFilter]);

  const { sortedItems: sortedQuotes, sortConfig, handleSort } = useTableSort<Quotation>(
    filteredQuotes,
    'issueDate',
    'desc'
  );

  const activeQuote = selectedQuoteId
    ? quotations.find((q) => q.id === selectedQuoteId) || null
    : null;

  const handleAddRevision = () => {
    if (!activeQuote || !revisionReason.trim()) return;
    createQuotationRevision(activeQuote.id, revisionReason, activeQuote.items);
    setRevisionReason('');
    setIsRevisionModalOpen(false);
  };

  const handleDownloadQuotation = (qt: Quotation) => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Proposal ${qt.quotationNumber} — ${profile.name}</title>
  <style>
    body { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif; color: #0B192C; background: #F8FAFC; padding: 40px; margin: 0; }
    .sheet { max-width: 800px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 10px 30px rgba(11,25,44,0.06); }
    .top-bar { height: 8px; background: linear-gradient(90deg, #0047BA, #0D5EF4, #1D82FF); }
    .content { padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #E2E8F0; padding-bottom: 24px; }
    .brand-title { font-size: 24px; font-weight: 800; color: #0B192C; margin: 0; }
    .tagline { font-size: 11px; color: #64748B; letter-spacing: 0.08em; text-transform: uppercase; margin-top: 4px; }
    .badge { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #0D5EF4; background: #EFF6FF; padding: 4px 10px; border-radius: 6px; display: inline-block; }
    .num-title { font-size: 22px; font-weight: 800; font-family: monospace; margin: 8px 0 4px 0; }
    .grid { display: flex; justify-content: space-between; margin: 28px 0; gap: 24px; }
    .label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748B; letter-spacing: 0.06em; margin-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 13px; }
    th { background: #0B192C; color: #FFFFFF; text-align: left; padding: 12px 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
    td { padding: 14px; border-bottom: 1px solid #F1F5F9; }
    .num { font-family: monospace; text-align: right; }
    .totals { width: 280px; margin-left: auto; font-size: 13px; }
    .totals-row { display: flex; justify-content: space-between; padding: 6px 0; }
    .totals-final { border-top: 2px solid #0B192C; font-weight: 800; font-size: 15px; padding-top: 10px; margin-top: 6px; color: #0D5EF4; }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="top-bar"></div>
    <div class="content">
      <div class="header">
        <div>
          <h1 class="brand-title">${profile.name}</h1>
          <div class="tagline">Plan · Organize · Achieve</div>
          <div style="font-size:12px; color:#64748B; margin-top:12px;">
            ${profile.address}<br/>
            ${profile.email} · ${profile.phone}
          </div>
        </div>
        <div style="text-align:right;">
          <span class="badge">Commercial Proposal (v${qt.version})</span>
          <div class="num-title">${qt.quotationNumber}</div>
          <div style="font-size:12px; color:#475569;">Status: <strong>${qt.status}</strong></div>
        </div>
      </div>
      <div class="grid">
        <div>
          <div class="label">Prepared For</div>
          <div style="font-size:15px; font-weight:700;">${qt.clientName}</div>
          <div style="font-size:13px; color:#0D5EF4; margin-top:4px;">Project: ${qt.projectName}</div>
          <div style="font-size:12px; color:#64748B; margin-top:2px;">Service: ${qt.serviceType}</div>
        </div>
        <div style="text-align:right;">
          <div class="label">Timeline & Validity</div>
          <div style="font-size:13px;">Issue Date: <strong>${qt.issueDate}</strong></div>
          <div style="font-size:13px; margin-top:4px;">Valid Until: <strong>${qt.validUntil}</strong></div>
          <div style="font-size:12px; color:#0D5EF4; margin-top:4px;">Est. Delivery: <strong>${qt.deliveryEstimate}</strong></div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Deliverable Description</th>
            <th style="text-align:center;">Qty</th>
            <th style="text-align:right;">Unit Rate</th>
            <th style="text-align:right;">Line Total</th>
          </tr>
        </thead>
        <tbody>
          ${qt.items
            .map(
              (item) => `
            <tr>
              <td><strong>${item.description}</strong></td>
              <td style="text-align:center; font-family:monospace;">${item.quantity}</td>
              <td class="num">${formatCurrency(item.unitPrice)}</td>
              <td class="num"><strong>${formatCurrency(item.total)}</strong></td>
            </tr>`
            )
            .join('')}
        </tbody>
      </table>
      <div class="totals">
        <div class="totals-row"><span>Subtotal (Excl. VAT)</span><span class="num">${formatCurrency(qt.subtotal)}</span></div>
        <div class="totals-row"><span>VAT (${qt.taxRate ?? profile.taxRate}%)</span><span class="num">${formatCurrency(qt.taxAmount)}</span></div>
        <div class="totals-row totals-final"><span>Total Investment (Incl. VAT)</span><span class="num">${formatCurrency(qt.totalAmount)}</span></div>
      </div>
      <div style="margin-top:32px; padding-top:20px; border-top:1px solid #E2E8F0; font-size:12px; color:#475569;">
        <div><strong>Payment Terms:</strong> ${qt.paymentTerms}</div>
        <div style="margin-top:6px;"><strong>Conditions:</strong> ${qt.specialConditions}</div>
      </div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${qt.quotationNumber}-${profile.name}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /* ====================================================================== */
  /* PAGE 2: DEDICATED QUOTATION DETAIL & PREVIEW PAGE                      */
  /* ====================================================================== */
  if (activeQuote) {
    const currentIndex = sortedQuotes.findIndex((q) => q.id === activeQuote.id);
    const currentCrumb = {
      tab: 'quotations',
      tabLabel: 'Quotations',
      recordId: activeQuote.id,
      recordLabel: activeQuote.quotationNumber,
    };

    return (
      <div className="p-3.5 sm:p-5 space-y-4 max-w-5xl mx-auto min-h-full flex flex-col">
        <DetailViewHeader
          moduleLabel="Quotations"
          recordTitle={`${activeQuote.quotationNumber} (v${activeQuote.version}) — ${activeQuote.clientName}`}
          onBack={() => setSelectedQuoteId(null)}
          currentIndex={currentIndex >= 0 ? currentIndex : 0}
          totalCount={sortedQuotes.length}
          onPrev={
            currentIndex > 0
              ? () => setSelectedQuoteId(sortedQuotes[currentIndex - 1].id)
              : undefined
          }
          onNext={
            currentIndex >= 0 && currentIndex < sortedQuotes.length - 1
              ? () => setSelectedQuoteId(sortedQuotes[currentIndex + 1].id)
              : undefined
          }
        >
          <button
            onClick={() => handleDownloadQuotation(activeQuote)}
            className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-bold text-[#0B192C] bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
            title="Download"
          >
            <Download className="w-3.5 h-3.5 text-[#0D5EF4]" />
            <span className="hidden sm:inline">Download</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-bold text-[#0B192C] bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
            title="Print"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Print</span>
          </button>

          <button
            onClick={() => setIsEmailModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-white bg-[#0D5EF4] hover:bg-[#0047BA] rounded-xl shadow-2xs transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>

          {activeQuote.status !== 'Accepted' && (
            <>
              <button
                onClick={() => setIsRevisionModalOpen(true)}
                className="px-2.5 py-1.5 text-xs font-bold text-[#0B192C] bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
              >
                Revise
              </button>
              <button
                onClick={() => acceptQuotation(activeQuote.id)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-white bg-[#16A34A] hover:bg-emerald-700 rounded-xl shadow-2xs transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Accept</span>
              </button>
              <button
                onClick={() =>
                  rejectQuotation(activeQuote.id, 'Client requested scope adjustment')
                }
                className="p-1.5 text-slate-400 hover:text-[#DC2626] rounded-xl"
                title="Mark Rejected"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
        </DetailViewHeader>

        {/* Status Banner */}
        {activeQuote.status === 'Accepted' && (
          <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900 shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
              <span>
                Proposal accepted on {activeQuote.clientDecisionDate}. Active project and deposit
                invoice generated automatically.
              </span>
            </div>
          </div>
        )}

        {/* Executive Commercial Proposal Sheet */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-[#0047BA] via-[#0D5EF4] to-[#1D82FF]" />

          <div className="p-5 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
              <div className="space-y-1.5">
                <BrandLogo size="md" showText={true} showTagline={true} logoType="company" />
                <div className="text-[11px] text-slate-500 leading-relaxed pt-1">
                  <div>{profile.address}</div>
                  <div className="font-mono">
                    {profile.email} · {profile.phone}
                  </div>
                </div>
              </div>

              <div className="text-right space-y-1">
                <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest text-[#0D5EF4] bg-blue-50 px-2.5 py-0.5 rounded-md">
                  Commercial Proposal · v{activeQuote.version}
                </span>
                <div className="text-xl sm:text-2xl font-extrabold font-mono text-[#0B192C] tracking-tight pt-0.5">
                  {activeQuote.quotationNumber}
                </div>
                <div className="text-xs text-slate-500">
                  Service: <strong className="text-[#0B192C]">{activeQuote.serviceType}</strong>
                </div>
              </div>
            </div>

            {/* Client & Schedule Metadata (With Clickable Client Link!) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200/70 text-xs">
              <div className="space-y-1">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Prepared For
                </div>
                {activeQuote.clientId ? (
                  <button
                    type="button"
                    onClick={() =>
                      navigateToRecord(
                        'clients',
                        activeQuote.clientId!,
                        activeQuote.clientName,
                        currentCrumb
                      )
                    }
                    className="text-sm font-extrabold text-[#0B192C] hover:text-[#0D5EF4] flex items-center gap-1.5 transition-colors text-left group"
                  >
                    <Building2 className="w-4 h-4 text-[#0D5EF4]" />
                    <span className="underline decoration-slate-300 group-hover:decoration-[#0D5EF4] underline-offset-2">
                      {activeQuote.clientName}
                    </span>
                  </button>
                ) : (
                  <div className="text-sm font-extrabold text-[#0B192C] flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-[#0D5EF4]" />
                    <span>{activeQuote.clientName}</span>
                  </div>
                )}
                <div className="text-xs font-bold text-[#0D5EF4] pt-1">
                  Project: {activeQuote.projectName}
                </div>
              </div>

              <div className="sm:text-right space-y-1">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Proposal Validity &amp; Delivery
                </div>
                <div className="text-xs text-slate-600">
                  Issued: <strong className="font-mono text-[#0B192C]">{activeQuote.issueDate}</strong>
                </div>
                <div className="text-xs text-slate-600">
                  Valid Until:{' '}
                  <strong className="font-mono text-[#0B192C]">{activeQuote.validUntil}</strong>
                </div>
                <div className="text-xs font-bold text-[#16A34A]">
                  Estimated Delivery: {activeQuote.deliveryEstimate}
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0B192C] text-white font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">Deliverable &amp; Scope Item</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-4 text-right">Unit Price</th>
                    <th className="py-2.5 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeQuote.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-semibold text-[#0B192C]">{item.description}</td>
                      <td className="py-3 px-3 text-center text-slate-600 font-mono tabular-nums">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600 font-mono tabular-nums">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-extrabold text-[#0B192C] tabular-nums">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Terms & Totals */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
              <div className="sm:col-span-6 space-y-2.5 text-xs">
                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 space-y-2">
                  <div>
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#0D5EF4]">
                      Payment Terms
                    </div>
                    <div className="text-[#0B192C] mt-0.5">{activeQuote.paymentTerms}</div>
                  </div>
                  <div className="pt-2 border-t border-slate-200/70">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Warranty &amp; Conditions
                    </div>
                    <div className="text-slate-600 mt-0.5">
                      {activeQuote.specialConditions || 'Standard SLA terms apply.'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-6 bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal (Excl. VAT)</span>
                  <span className="font-mono font-semibold tabular-nums">
                    {formatCurrency(activeQuote.subtotal)}
                  </span>
                </div>
                {activeQuote.discount > 0 && (
                  <div className="flex justify-between text-[#16A34A]">
                    <span>Discount</span>
                    <span className="font-mono tabular-nums">
                      -{formatCurrency(activeQuote.discount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-[#0B192C] font-semibold">
                  <span className="flex items-center gap-1.5">
                    <span>VAT</span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-50 text-[#0D5EF4] font-mono text-[10px] font-bold">
                      {activeQuote.taxRate ?? profile.taxRate}%
                    </span>
                  </span>
                  <span className="font-mono font-bold tabular-nums">
                    {formatCurrency(activeQuote.taxAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-[#0B192C] pt-2 border-t-2 border-[#0B192C]">
                  <span>Total Investment (Incl. VAT)</span>
                  <span className="font-mono text-[#0D5EF4] tabular-nums">
                    {formatCurrency(activeQuote.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Revision History Log */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#0B192C]">
                <History className="w-3.5 h-3.5 text-[#0D5EF4]" />
                <span>Revision Audit Trail ({activeQuote.revisions.length})</span>
              </div>
              <div className="space-y-1.5">
                {activeQuote.revisions.map((rev) => (
                  <div
                    key={rev.version}
                    className="text-xs p-2.5 bg-[#F8FAFC] rounded-xl border border-slate-200/70 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-mono font-bold text-[#0D5EF4] mr-2">
                        v{rev.version}
                      </span>
                      <span className="text-[#0B192C] font-medium">{rev.reason}</span>
                      <span className="text-slate-400 text-[11px] ml-2">
                        by {rev.changedBy} on {rev.date}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-[#0B192C] tabular-nums">
                      {formatCurrency(rev.total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Native Revision Modal */}
        {isRevisionModalOpen && (
          <div
            onClick={() => setIsRevisionModalOpen(false)}
            className="fixed inset-0 bg-[#0B192C]/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 z-50"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="shrink-0 px-5 py-3.5 bg-white border-b border-slate-200/80">
                <h3 className="text-sm font-extrabold text-[#0B192C]">
                  Create Quotation Revision (v{activeQuote.version + 1})
                </h3>
              </div>

              <div className="p-5 space-y-4 text-xs overflow-y-auto flex-1 min-h-0">
                <div>
                  <label className="font-bold text-[#0B192C] block mb-1">
                    Reason for Revision *
                  </label>
                  <textarea
                    rows={3}
                    value={revisionReason}
                    onChange={(e) => setRevisionReason(e.target.value)}
                    placeholder="e.g. Added compliance reporting module per client request"
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-3 text-xs text-[#0B192C] focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
                  />
                </div>
              </div>

              <div className="shrink-0 px-5 py-3.5 bg-white border-t border-slate-200/80 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsRevisionModalOpen(false)}
                  className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  onClick={handleAddRevision}
                  disabled={!revisionReason.trim()}
                  className="flex-[2] py-2 text-xs font-bold text-white bg-[#0D5EF4] hover:bg-[#0047BA] rounded-xl shadow-xs disabled:opacity-50"
                >
                  Confirm Revision
                </button>
              </div>
            </div>
          </div>
        )}

        <SendDocumentEmailModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          documentType="quotation"
          quotation={activeQuote}
        />
      </div>
    );
  }

  /* ====================================================================== */
  /* PAGE 1: FULL-WIDTH QUOTATIONS TABLE (True Desktop Table Mechanics)     */
  /* ====================================================================== */
  const totalQuotedSum = sortedQuotes.reduce((acc, q) => acc + q.totalAmount, 0);
  const acceptedCount = sortedQuotes.filter((q) => q.status === 'Accepted').length;

  return (
    <div className="p-3 sm:p-5 flex-1 flex flex-col min-h-0">
      <SearchAndFilterBar
        placeholder="Search quotations by number, client, or project..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        modalTitle="Filter Quotations"
        filterGroups={[
          {
            label: 'Proposal Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Proposals', value: 'all' },
              { label: 'Draft', value: 'Draft' },
              { label: 'Sent', value: 'Sent' },
              { label: 'Accepted', value: 'Accepted' },
              { label: 'Rejected', value: 'Rejected' },
            ],
          },
        ]}
      />

      {/* MOBILE FEED (< sm): Non-overwhelming touch cards */}
      <div className="sm:hidden space-y-2.5 overflow-y-auto flex-1 pb-2">
        {sortedQuotes.map((quote) => (
          <div
            key={quote.id}
            onClick={() => setSelectedQuoteId(quote.id)}
            className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs active:bg-blue-50/50 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-mono font-extrabold text-xs text-[#0B192C]">
                  {quote.quotationNumber}
                </div>
                <div className="font-bold text-sm text-[#0B192C] truncate mt-0.5">
                  {quote.clientName}
                </div>
                <div className="text-[11px] text-slate-500 truncate">{quote.projectName}</div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    quote.status === 'Accepted'
                      ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200'
                      : quote.status === 'Rejected'
                      ? 'bg-rose-50 text-[#DC2626] border border-rose-200'
                      : 'bg-blue-50 text-[#0D5EF4] border border-blue-200'
                  }`}
                >
                  {quote.status}
                </span>
                <RowActionsMenu
                  actions={[
                    {
                      label: 'Open Proposal',
                      icon: <Eye className="w-3.5 h-3.5" />,
                      onClick: () => setSelectedQuoteId(quote.id),
                      variant: 'primary',
                    },
                    ...(quote.status !== 'Accepted'
                      ? [
                          {
                            label: 'Accept Proposal',
                            icon: <CheckCircle2 className="w-3.5 h-3.5" />,
                            onClick: () => acceptQuotation(quote.id),
                          },
                        ]
                      : []),
                    {
                      label: 'Download Proposal',
                      icon: <Download className="w-3.5 h-3.5" />,
                      onClick: () => handleDownloadQuotation(quote),
                    },
                    ...(quote.clientId
                      ? [
                          {
                            label: 'Open Client',
                            icon: <Users className="w-3.5 h-3.5" />,
                            onClick: () =>
                              navigateToRecord('clients', quote.clientId!, quote.clientName),
                          },
                        ]
                      : []),
                    {
                      label: 'Delete Proposal',
                      icon: <Trash2 className="w-3.5 h-3.5" />,
                      onClick: () => deleteQuotation(quote.id),
                      variant: 'danger',
                    },
                  ]}
                />
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500 truncate max-w-[160px]">
                {quote.serviceType}
              </span>
              <span className="font-mono font-extrabold text-[#0B192C]">
                {formatCurrency(quote.totalAmount)}
              </span>
            </div>
          </div>
        ))}
        {sortedQuotes.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
            No quotations found matching your filter.
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
                  label="Proposal #"
                  sortKey="quotationNumber"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTh
                  label="Client & Project"
                  sortKey="clientName"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTh
                  label="Service Line"
                  sortKey="serviceType"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTh
                  label="Valid Until"
                  sortKey="validUntil"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTh
                  label="Status"
                  sortKey="status"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTh
                  label="Total Investment"
                  sortKey="totalAmount"
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
              {sortedQuotes.map((quote) => (
                <tr
                  key={quote.id}
                  onClick={() => setSelectedQuoteId(quote.id)}
                  className="cursor-pointer hover:bg-blue-50/40 transition-colors group"
                >
                  <td className="py-3 px-4">
                    <div className="font-mono font-extrabold text-xs text-[#0B192C] group-hover:text-[#0D5EF4] transition-colors">
                      {quote.quotationNumber}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      v{quote.version} · {quote.issueDate}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#0B192C]">{quote.clientName}</div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[220px]">
                      {quote.projectName}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{quote.serviceType}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                    <div>{quote.validUntil}</div>
                    <div className="text-[10px] text-slate-400">Est: {quote.deliveryEstimate}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        quote.status === 'Accepted'
                          ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200'
                          : quote.status === 'Rejected'
                          ? 'bg-rose-50 text-[#DC2626] border border-rose-200'
                          : 'bg-blue-50 text-[#0D5EF4] border border-blue-200'
                      }`}
                    >
                      {quote.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-extrabold text-[#0B192C]">
                    {formatCurrency(quote.totalAmount)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <RowActionsMenu
                      actions={[
                        {
                          label: 'Open Proposal',
                          icon: <Eye className="w-3.5 h-3.5" />,
                          onClick: () => setSelectedQuoteId(quote.id),
                          variant: 'primary',
                        },
                        ...(quote.status !== 'Accepted'
                          ? [
                              {
                                label: 'Accept Proposal',
                                icon: <CheckCircle2 className="w-3.5 h-3.5" />,
                                onClick: () => acceptQuotation(quote.id),
                              },
                            ]
                          : []),
                        {
                          label: 'Download Proposal',
                          icon: <Download className="w-3.5 h-3.5" />,
                          onClick: () => handleDownloadQuotation(quote),
                        },
                        ...(quote.clientId
                          ? [
                              {
                                label: 'Open Client',
                                icon: <Users className="w-3.5 h-3.5" />,
                                onClick: () =>
                                  navigateToRecord('clients', quote.clientId!, quote.clientName),
                              },
                            ]
                          : []),
                        {
                          label: 'Delete Proposal',
                          icon: <Trash2 className="w-3.5 h-3.5" />,
                          onClick: () => deleteQuotation(quote.id),
                          variant: 'danger',
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))}
              {sortedQuotes.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No quotations found matching your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <TableSummaryFooter
          recordCount={sortedQuotes.length}
          totalCount={quotations.length}
          recordLabel="Proposals"
          metrics={[
            { label: 'Accepted', value: acceptedCount, tone: 'emerald' },
            { label: 'Total Quoted Value', value: formatCurrency(totalQuotedSum), tone: 'primary' },
          ]}
        />
      </div>
    </div>
  );
};

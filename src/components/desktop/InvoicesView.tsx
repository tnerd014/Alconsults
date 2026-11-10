import React, { useState, useMemo } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { Invoice } from '../../types';
import {
  CreditCard,
  Send,
  Printer,
  Download,
  AlertCircle,
  CheckCircle2,
  Building2,
  ShieldCheck,
  Eye,
  Users,
  FolderGit2,
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

interface InvoicesViewProps {
  onNewInvoice: () => void;
  onRecordPayment: (invoice?: Invoice) => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({ onRecordPayment }) => {
  const {
    invoices,
    profile,
    clients,
    formatCurrency,
    searchQuery: searchTerm,
    setSearchQuery: setSearchTerm,
    moduleFilter: statusFilter,
    setModuleFilter: setStatusFilter,
    selectedRecordIds,
    setSelectedRecordForTab,
    navigateToRecord,
    deleteInvoice,
  } = useBusiness();

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const selectedInvoiceId = selectedRecordIds['invoices'] || null;
  const setSelectedInvoiceId = (id: string | null) => setSelectedRecordForTab('invoices', id);

  // Resolve proper VAT rate from invoice or global BusinessProfile VAT variable
  const getInvoiceVatMetrics = (inv: Invoice) => {
    const vatRate = typeof inv.taxRate === 'number' ? inv.taxRate : profile.taxRate;
    const vatAmount = Number(((inv.subtotal * vatRate) / 100).toFixed(2));
    const totalAmount = Number((inv.subtotal + vatAmount).toFixed(2));
    const paidAmount = inv.status === 'Paid' ? totalAmount : inv.paidAmount;
    const balanceDue =
      inv.status === 'Paid' ? 0 : Math.max(0, Number((totalAmount - paidAmount).toFixed(2)));
    return { vatRate, vatAmount, totalAmount, paidAmount, balanceDue };
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.projectName && inv.projectName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  const customGetters = useMemo(
    () => ({
      invoiceNumber: (i: Invoice) => i.invoiceNumber,
      clientName: (i: Invoice) => i.clientName,
      dueDate: (i: Invoice) => i.dueDate,
      status: (i: Invoice) => i.status,
      totalAmount: (i: Invoice) => getInvoiceVatMetrics(i).totalAmount,
      balanceDue: (i: Invoice) => getInvoiceVatMetrics(i).balanceDue,
    }),
    [profile.taxRate]
  );

  const { sortedItems: sortedInvoices, sortConfig, handleSort } = useTableSort<Invoice>(
    filteredInvoices,
    'dueDate',
    'desc',
    customGetters
  );

  const activeInvoice = selectedInvoiceId
    ? invoices.find((i) => i.id === selectedInvoiceId) || null
    : null;

  const activeClient = clients.find((c) => c.id === activeInvoice?.clientId);
  const activeVatMetrics = activeInvoice ? getInvoiceVatMetrics(activeInvoice) : null;

  const handleDownloadInvoice = (inv: Invoice) => {
    const { vatRate, vatAmount, totalAmount, paidAmount, balanceDue } = getInvoiceVatMetrics(inv);
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice ${inv.invoiceNumber} — ${profile.name}</title>
  <style>
    body { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif; color: #0B192C; background: #F8FAFC; padding: 40px; margin: 0; }
    .sheet { max-width: 800px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 10px 30px rgba(11,25,44,0.06); }
    .top-bar { height: 8px; background: linear-gradient(90deg, #0047BA, #0D5EF4, #1D82FF); }
    .content { padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #E2E8F0; padding-bottom: 24px; }
    .brand-title { font-size: 24px; font-weight: 800; color: #0B192C; margin: 0; }
    .tagline { font-size: 11px; color: #64748B; letter-spacing: 0.08em; text-transform: uppercase; margin-top: 4px; }
    .inv-badge { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #0D5EF4; background: #EFF6FF; padding: 4px 10px; border-radius: 6px; display: inline-block; }
    .inv-num { font-size: 22px; font-weight: 800; font-family: monospace; margin: 8px 0 4px 0; }
    .grid { display: flex; justify-content: space-between; margin: 28px 0; gap: 24px; }
    .label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748B; letter-spacing: 0.06em; margin-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 13px; }
    th { background: #0B192C; color: #FFFFFF; text-align: left; padding: 12px 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
    td { padding: 14px; border-bottom: 1px solid #F1F5F9; }
    .num { font-family: monospace; text-align: right; }
    .totals { width: 300px; margin-left: auto; font-size: 13px; }
    .totals-row { display: flex; justify-content: space-between; padding: 6px 0; }
    .totals-final { border-top: 2px solid #0B192C; font-weight: 800; font-size: 15px; padding-top: 10px; margin-top: 6px; color: #0D5EF4; }
    .footer { margin-top: 36px; padding-top: 20px; border-top: 1px solid #E2E8F0; display: flex; justify-content: space-between; font-size: 12px; color: #475569; }
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
          <span class="inv-badge">Official VAT Invoice</span>
          <div class="inv-num">${inv.invoiceNumber}</div>
          <div style="font-size:12px; color:#475569;">Status: <strong>${inv.status}</strong> · VAT Rate: <strong>${vatRate}%</strong></div>
        </div>
      </div>
      <div class="grid">
        <div>
          <div class="label">Billed To</div>
          <div style="font-size:15px; font-weight:700;">${inv.clientName}</div>
          ${inv.projectName ? `<div style="font-size:12px; color:#0D5EF4; margin-top:4px;">Project: ${inv.projectName}</div>` : ''}
        </div>
        <div style="text-align:right;">
          <div class="label">Invoice Schedule</div>
          <div style="font-size:13px;">Issue Date: <strong>${inv.issueDate}</strong></div>
          <div style="font-size:13px; margin-top:4px;">Due Date: <strong style="color:#DC2626;">${inv.dueDate}</strong></div>
          <div style="font-size:12px; color:#64748B; margin-top:4px;">Billing Type: ${inv.type}</div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align:center;">Qty</th>
            <th style="text-align:right;">Unit Price</th>
            <th style="text-align:center;">VAT %</th>
            <th style="text-align:right;">Line Total</th>
          </tr>
        </thead>
        <tbody>
          ${inv.items
            .map(
              (item) => `
            <tr>
              <td><strong>${item.description}</strong></td>
              <td style="text-align:center; font-family:monospace;">${item.quantity}</td>
              <td class="num">${formatCurrency(item.unitPrice)}</td>
              <td style="text-align:center; font-family:monospace;">${vatRate}%</td>
              <td class="num"><strong>${formatCurrency(item.total)}</strong></td>
            </tr>`
            )
            .join('')}
        </tbody>
      </table>
      <div class="totals">
        <div class="totals-row"><span>Subtotal</span><span class="num">${formatCurrency(inv.subtotal)}</span></div>
        <div class="totals-row"><span>VAT (${vatRate}%)</span><span class="num">${formatCurrency(vatAmount)}</span></div>
        <div class="totals-row"><span>Total Amount (Incl. VAT)</span><span class="num"><strong>${formatCurrency(totalAmount)}</strong></span></div>
        <div class="totals-row" style="color:#16A34A;"><span>Amount Paid</span><span class="num">-${formatCurrency(paidAmount)}</span></div>
        <div class="totals-row totals-final"><span>Balance Due</span><span class="num">${formatCurrency(balanceDue)}</span></div>
      </div>
      <div class="footer">
        <div>
          <div class="label">Bank Settlement Coordinates</div>
          <div><strong>Bank:</strong> ${profile.bankName}</div>
          <div><strong>Account Name:</strong> ${profile.accountName}</div>
          <div><strong>Account Number:</strong> <span style="font-family:monospace;">${profile.accountNumber}</span></div>
        </div>
        <div style="text-align:right; max-width:260px;">
          <div class="label">Terms & Authorization</div>
          <div>${inv.terms}</div>
          <div style="margin-top:8px; font-weight:700; color:#0B192C;">Issued by ${profile.name}</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${inv.invoiceNumber}-${profile.name}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /* ====================================================================== */
  /* PAGE 2: DEDICATED INVOICE DETAIL & DOCUMENT PREVIEW PAGE               */
  /* ====================================================================== */
  if (activeInvoice && activeVatMetrics) {
    const currentIndex = sortedInvoices.findIndex((i) => i.id === activeInvoice.id);
    const currentCrumb = {
      tab: 'invoices',
      tabLabel: 'Invoices',
      recordId: activeInvoice.id,
      recordLabel: activeInvoice.invoiceNumber,
    };

    return (
      <div className="p-3.5 sm:p-5 space-y-4 max-w-5xl mx-auto min-h-full flex flex-col">
        <DetailViewHeader
          moduleLabel="Invoices"
          recordTitle={`${activeInvoice.invoiceNumber} — ${activeInvoice.clientName}`}
          onBack={() => setSelectedInvoiceId(null)}
          currentIndex={currentIndex >= 0 ? currentIndex : 0}
          totalCount={sortedInvoices.length}
          onPrev={
            currentIndex > 0
              ? () => setSelectedInvoiceId(sortedInvoices[currentIndex - 1].id)
              : undefined
          }
          onNext={
            currentIndex >= 0 && currentIndex < sortedInvoices.length - 1
              ? () => setSelectedInvoiceId(sortedInvoices[currentIndex + 1].id)
              : undefined
          }
        >
          <button
            onClick={() => handleDownloadInvoice(activeInvoice)}
            className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-bold text-[#0B192C] bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
            title="Download"
          >
            <Download className="w-3.5 h-3.5 text-[#0D5EF4]" />
            <span className="hidden sm:inline">Download</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-bold text-[#0B192C] bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
            title="Print / PDF"
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

          {activeInvoice.status !== 'Paid' && (
            <button
              onClick={() => onRecordPayment(activeInvoice)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-white bg-[#16A34A] hover:bg-emerald-700 rounded-xl shadow-2xs transition-colors"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Pay</span>
            </button>
          )}
        </DetailViewHeader>

        {/* Overdue Banner if applicable */}
        {activeInvoice.status === 'Overdue' && (
          <div className="px-4 py-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs text-rose-900 shrink-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
              <span>
                Overdue balance of{' '}
                <strong className="font-mono">{formatCurrency(activeInvoice.balanceDue)}</strong> past
                due since {activeInvoice.dueDate}.
              </span>
            </div>
            <button
              onClick={() => setIsEmailModalOpen(true)}
              className="font-bold text-[#DC2626] hover:underline shrink-0 ml-3"
            >
              Send Notice →
            </button>
          </div>
        )}

        {/* EXECUTIVE A4 INVOICE PAPER SHEET */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-[#0047BA] via-[#0D5EF4] to-[#1D82FF]" />

          <div className="p-5 sm:p-8 space-y-6">
            {/* Document Header */}
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
                  Official VAT Invoice · {activeVatMetrics.vatRate}% VAT
                </span>
                <div className="text-xl sm:text-2xl font-extrabold font-mono text-[#0B192C] tracking-tight pt-0.5">
                  {activeInvoice.invoiceNumber}
                </div>
                <div className="text-xs text-slate-500">
                  Billing Category: <strong className="text-[#0B192C]">{activeInvoice.type}</strong>
                </div>
              </div>
            </div>

            {/* Client & Schedule Metadata Grid (With Clickable Client & Project Cross-Links!) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200/70 text-xs">
              <div className="space-y-1">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Billed To Client
                </div>
                <button
                  type="button"
                  onClick={() =>
                    navigateToRecord(
                      'clients',
                      activeInvoice.clientId,
                      activeInvoice.clientName,
                      currentCrumb
                    )
                  }
                  className="text-sm font-extrabold text-[#0B192C] hover:text-[#0D5EF4] flex items-center gap-1.5 transition-colors text-left group"
                >
                  <Building2 className="w-4 h-4 text-[#0D5EF4]" />
                  <span className="underline decoration-slate-300 group-hover:decoration-[#0D5EF4] underline-offset-2">
                    {activeInvoice.clientName}
                  </span>
                </button>
                {activeClient && (
                  <div className="text-[11px] text-slate-500">
                    {activeClient.address} · {activeClient.email}
                  </div>
                )}
                {activeInvoice.projectName && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        navigateToRecord(
                          'projects',
                          activeInvoice.projectId || null,
                          activeInvoice.projectName,
                          currentCrumb
                        )
                      }
                      className="text-xs font-bold text-[#0D5EF4] hover:underline text-left"
                    >
                      Project: {activeInvoice.projectName} →
                    </button>
                  </div>
                )}
              </div>

              <div className="sm:text-right space-y-1">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Payment Schedule
                </div>
                <div className="text-xs text-slate-600">
                  Issue Date: <strong className="font-mono text-[#0B192C]">{activeInvoice.issueDate}</strong>
                </div>
                <div className="text-xs text-slate-600">
                  Due Date:{' '}
                  <strong
                    className={`font-mono ${
                      activeInvoice.status === 'Overdue' ? 'text-[#DC2626]' : 'text-[#0B192C]'
                    }`}
                  >
                    {activeInvoice.dueDate}
                  </strong>
                </div>
                <div className="text-[11px] text-slate-500">{activeInvoice.terms}</div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0B192C] text-white font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">Deliverable / Service Description</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-4 text-right">Unit Rate</th>
                    <th className="py-2.5 px-3 text-center">VAT</th>
                    <th className="py-2.5 px-4 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeInvoice.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-semibold text-[#0B192C]">{item.description}</td>
                      <td className="py-3 px-3 text-center font-mono text-slate-600 tabular-nums">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600 tabular-nums">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-[#0D5EF4] font-bold tabular-nums">
                        {activeVatMetrics.vatRate}%
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-extrabold text-[#0B192C] tabular-nums">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Split: Bank Settlement Details (Left) | Financial Totals Box (Right) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
              <div className="sm:col-span-6 space-y-2.5">
                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 text-xs space-y-1">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#0D5EF4]">
                    Bank Transfer / Wire Instructions
                  </div>
                  <div className="text-[#0B192C]">
                    <span className="text-slate-500">Bank:</span> <strong>{profile.bankName}</strong>
                  </div>
                  <div className="text-[#0B192C]">
                    <span className="text-slate-500">Account Name:</span>{' '}
                    <strong>{profile.accountName}</strong>
                  </div>
                  <div className="text-[#0B192C]">
                    <span className="text-slate-500">Account Number:</span>{' '}
                    <strong className="font-mono">{profile.accountNumber}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 px-1">
                  {activeInvoice.status === 'Paid' ? (
                    <span className="inline-flex items-center gap-1.5 font-extrabold text-[#16A34A]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>PAID IN FULL &amp; VERIFIED</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 font-semibold text-slate-500">
                      <ShieldCheck className="w-4 h-4 text-[#0D5EF4]" />
                      <span>Quote {activeInvoice.invoiceNumber} as payment reference</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="sm:col-span-6 bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal (Excl. VAT)</span>
                  <span className="font-mono font-semibold tabular-nums">
                    {formatCurrency(activeInvoice.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-[#0B192C] font-semibold">
                  <span className="flex items-center gap-1.5">
                    <span>VAT</span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-50 text-[#0D5EF4] font-mono text-[10px] font-bold">
                      {activeVatMetrics.vatRate}%
                    </span>
                  </span>
                  <span className="font-mono font-bold tabular-nums">
                    {formatCurrency(activeVatMetrics.vatAmount)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-[#0B192C] border-t border-slate-200 pt-2">
                  <span>Invoice Total (Incl. VAT)</span>
                  <span className="font-mono tabular-nums">
                    {formatCurrency(activeVatMetrics.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-[#16A34A] font-semibold">
                  <span>Verified Paid</span>
                  <span className="font-mono tabular-nums">
                    -{formatCurrency(activeVatMetrics.paidAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-[#0B192C] border-t-2 border-[#0B192C] pt-2">
                  <span>Balance Due</span>
                  <span
                    className={`font-mono tabular-nums ${
                      activeVatMetrics.balanceDue > 0 ? 'text-[#DC2626]' : 'text-[#16A34A]'
                    }`}
                  >
                    {formatCurrency(activeVatMetrics.balanceDue)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <SendDocumentEmailModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          documentType="invoice"
          invoice={activeInvoice}
        />
      </div>
    );
  }

  /* ====================================================================== */
  /* PAGE 1: FULL-WIDTH INVOICES TABLE (True Desktop Table Mechanics)       */
  /* ====================================================================== */
  const totalInvoicedSum = sortedInvoices.reduce(
    (acc, inv) => acc + getInvoiceVatMetrics(inv).totalAmount,
    0
  );
  const totalPaidSum = sortedInvoices.reduce(
    (acc, inv) => acc + getInvoiceVatMetrics(inv).paidAmount,
    0
  );
  const totalBalanceSum = sortedInvoices.reduce(
    (acc, inv) => acc + getInvoiceVatMetrics(inv).balanceDue,
    0
  );

  return (
    <div className="p-3 sm:p-5 flex-1 flex flex-col min-h-0">
      <SearchAndFilterBar
        placeholder="Search by invoice #, client, or project..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        modalTitle="Filter Invoices"
        filterGroups={[
          {
            label: 'Invoice Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Invoices', value: 'all' },
              { label: 'Draft', value: 'Draft' },
              { label: 'Sent', value: 'Sent' },
              { label: 'Partially Paid', value: 'Partially Paid' },
              { label: 'Paid', value: 'Paid' },
              { label: 'Overdue', value: 'Overdue' },
            ],
          },
        ]}
      />

      {/* MOBILE FEED (< sm): Non-overwhelming touch cards */}
      <div className="sm:hidden space-y-2.5 overflow-y-auto flex-1 pb-2">
        {sortedInvoices.map((inv) => {
          const { vatRate, totalAmount, balanceDue } = getInvoiceVatMetrics(inv);
          return (
            <div
              key={inv.id}
              onClick={() => setSelectedInvoiceId(inv.id)}
              className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs active:bg-blue-50/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-mono font-extrabold text-xs text-[#0B192C]">
                    {inv.invoiceNumber}
                  </div>
                  <div className="font-bold text-sm text-[#0B192C] truncate mt-0.5">
                    {inv.clientName}
                  </div>
                  {inv.projectName && (
                    <div className="text-[11px] text-slate-500 truncate">{inv.projectName}</div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      inv.status === 'Paid'
                        ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200'
                        : inv.status === 'Overdue'
                        ? 'bg-rose-50 text-[#DC2626] border border-rose-200'
                        : 'bg-blue-50 text-[#0D5EF4] border border-blue-200'
                    }`}
                  >
                    {inv.status}
                  </span>
                  <RowActionsMenu
                    actions={[
                      {
                        label: 'Open Invoice',
                        icon: <Eye className="w-3.5 h-3.5" />,
                        onClick: () => setSelectedInvoiceId(inv.id),
                        variant: 'primary',
                      },
                      ...(inv.status !== 'Paid'
                        ? [
                            {
                              label: 'Record Payment',
                              icon: <CreditCard className="w-3.5 h-3.5" />,
                              onClick: () => onRecordPayment(inv),
                            },
                          ]
                        : []),
                      {
                        label: 'Download Invoice',
                        icon: <Download className="w-3.5 h-3.5" />,
                        onClick: () => handleDownloadInvoice(inv),
                      },
                      {
                        label: 'Open Client',
                        icon: <Users className="w-3.5 h-3.5" />,
                        onClick: () =>
                          navigateToRecord('clients', inv.clientId, inv.clientName),
                      },
                      ...(inv.projectId
                        ? [
                            {
                              label: 'Open Project',
                              icon: <FolderGit2 className="w-3.5 h-3.5" />,
                              onClick: () =>
                                navigateToRecord('projects', inv.projectId!, inv.projectName),
                            },
                          ]
                        : []),
                      {
                        label: 'Delete Invoice',
                        icon: <Trash2 className="w-3.5 h-3.5" />,
                        onClick: () => deleteInvoice(inv.id),
                        variant: 'danger',
                      },
                    ]}
                  />
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="text-[11px] font-mono text-slate-500">
                  Due {inv.dueDate}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-500">
                    {formatCurrency(totalAmount)}
                  </span>
                  <span className="font-mono font-bold text-xs">
                    {inv.status === 'Paid' || balanceDue <= 0 ? (
                      <span className="text-[#16A34A]">Paid</span>
                    ) : (
                      <span className={inv.status === 'Overdue' ? 'text-[#DC2626]' : 'text-amber-600'}>
                        {formatCurrency(balanceDue)} due
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {sortedInvoices.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
            No invoices found matching criteria.
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
                  label="Invoice #"
                  sortKey="invoiceNumber"
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
                  label="Due Date"
                  sortKey="dueDate"
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
                  label="Total (Incl. VAT)"
                  sortKey="totalAmount"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  align="right"
                />
                <SortableTh
                  label="Balance Due"
                  sortKey="balanceDue"
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
              {sortedInvoices.map((inv) => {
                const { vatRate, totalAmount, balanceDue } = getInvoiceVatMetrics(inv);
                return (
                  <tr
                    key={inv.id}
                    onClick={() => setSelectedInvoiceId(inv.id)}
                    className="cursor-pointer hover:bg-blue-50/40 transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <div className="font-mono font-extrabold text-xs text-[#0B192C] group-hover:text-[#0D5EF4] transition-colors">
                        {inv.invoiceNumber}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {inv.type} · VAT {vatRate}%
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#0B192C]">{inv.clientName}</div>
                      {inv.projectName && (
                        <div className="text-[11px] text-slate-500 truncate max-w-[220px]">
                          {inv.projectName}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      <div>{inv.dueDate}</div>
                      <div className="text-[10px] text-slate-400">Issued: {inv.issueDate}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200'
                            : inv.status === 'Overdue'
                            ? 'bg-rose-50 text-[#DC2626] border border-rose-200'
                            : 'bg-blue-50 text-[#0D5EF4] border border-blue-200'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#0B192C]">
                      {formatCurrency(totalAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-extrabold">
                      {inv.status === 'Paid' || balanceDue <= 0 ? (
                        <span className="text-[#16A34A]">Paid</span>
                      ) : (
                        <span
                          className={inv.status === 'Overdue' ? 'text-[#DC2626]' : 'text-amber-600'}
                        >
                          {formatCurrency(balanceDue)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <RowActionsMenu
                        actions={[
                          {
                            label: 'Open Invoice',
                            icon: <Eye className="w-3.5 h-3.5" />,
                            onClick: () => setSelectedInvoiceId(inv.id),
                            variant: 'primary',
                          },
                          ...(inv.status !== 'Paid'
                            ? [
                                {
                                  label: 'Record Payment',
                                  icon: <CreditCard className="w-3.5 h-3.5" />,
                                  onClick: () => onRecordPayment(inv),
                                },
                              ]
                            : []),
                          {
                            label: 'Download Invoice',
                            icon: <Download className="w-3.5 h-3.5" />,
                            onClick: () => handleDownloadInvoice(inv),
                          },
                          {
                            label: 'Open Client',
                            icon: <Users className="w-3.5 h-3.5" />,
                            onClick: () =>
                              navigateToRecord('clients', inv.clientId, inv.clientName),
                          },
                          ...(inv.projectId
                            ? [
                                {
                                  label: 'Open Project',
                                  icon: <FolderGit2 className="w-3.5 h-3.5" />,
                                  onClick: () =>
                                    navigateToRecord('projects', inv.projectId!, inv.projectName),
                                },
                              ]
                            : []),
                          {
                            label: 'Delete Invoice',
                            icon: <Trash2 className="w-3.5 h-3.5" />,
                            onClick: () => deleteInvoice(inv.id),
                            variant: 'danger',
                          },
                        ]}
                      />
                    </td>
                  </tr>
                );
              })}
              {sortedInvoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No invoices found matching your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <TableSummaryFooter
          recordCount={sortedInvoices.length}
          totalCount={invoices.length}
          recordLabel="Invoices"
          metrics={[
            { label: 'Invoiced', value: formatCurrency(totalInvoicedSum), tone: 'default' },
            { label: 'Collected', value: formatCurrency(totalPaidSum), tone: 'emerald' },
            {
              label: 'Balance Due',
              value: formatCurrency(totalBalanceSum),
              tone: totalBalanceSum > 0 ? 'rose' : 'default',
            },
          ]}
        />
      </div>
    </div>
  );
};

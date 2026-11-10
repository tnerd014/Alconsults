import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { Download, ChevronRight } from 'lucide-react';
import { SearchAndFilterBar } from '../common/SearchAndFilterBar';

export const ReportsView: React.FC = () => {
  const {
    financials,
    formatCurrency,
    quotations,
    invoices,
    payments,
    expenses,
    setActiveTab,
    searchQuery: searchTerm,
    setSearchQuery: setSearchTerm,
  } = useBusiness();

  const [reportTab, setReportTab] = useState<string>('receivables');

  const serviceRevenueMap: Record<string, number> = {};
  quotations
    .filter((q) => q.status === 'Accepted')
    .forEach((q) => {
      serviceRevenueMap[q.serviceType] = (serviceRevenueMap[q.serviceType] || 0) + q.totalAmount;
    });

  const filteredReceivables = invoices.filter(
    (i) =>
      i.balanceDue > 0 &&
      i.status !== 'Cancelled' &&
      (i.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.clientName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleExportCSV = () => {
    const rows = [
      ['Date', 'Type', 'Entity/Ref', 'Client', 'Amount', 'Status'],
      ...payments.map((p) => [p.paymentDate, 'Payment Received', p.receiptNumber, p.clientName, p.amount.toString(), 'Reconciled']),
      ...invoices.map((i) => [i.issueDate, 'Invoice Issued', i.invoiceNumber, i.clientName, i.totalAmount.toString(), i.status]),
      ...expenses.map((e) => [e.date, 'Expense', e.description, e.vendor, (-e.amount).toString(), e.category]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `financial_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-3.5 sm:p-6 space-y-4 max-w-7xl mx-auto min-h-full flex flex-col">
      {/* Compact Main Page Header & Export Button */}
      <div className="sticky-page-header flex items-center justify-between gap-2 border-b border-slate-200 pb-2.5 shrink-0">
        <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-[#0B192C] truncate">Reports</h1>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-[#0D5EF4] rounded-xl hover:bg-blue-700 shadow-2xs transition-colors shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Minimalistic Search Bar + Filter Modal Button */}
      <SearchAndFilterBar
        placeholder="Search reports by invoice number, client, or service..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        modalTitle="Filter Report View"
        filterGroups={[
          {
            label: 'Report Breakdown',
            value: reportTab,
            onChange: setReportTab,
            options: [
              { label: 'Accounts Receivable', value: 'receivables' },
              { label: 'Revenue by Service', value: 'services' },
            ],
          },
        ]}
      />

      {/* Single Full-Width Report Table */}
      {reportTab === 'receivables' ? (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F8FC] border-b border-slate-200 text-slate-500 font-bold">
                <tr>
                  <th className="py-3.5 px-5">Invoice</th>
                  <th className="py-3.5 px-5">Client</th>
                  <th className="py-3.5 px-5">Due Date</th>
                  <th className="py-3.5 px-5 text-right">Balance Due</th>
                  <th className="py-3.5 px-5 text-right">Open</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReceivables.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => setActiveTab('invoices')}
                    className="cursor-pointer hover:bg-slate-50/90 transition-colors group"
                  >
                    <td className="py-4 px-5 font-mono font-bold text-[#0B192C] group-hover:text-[#0D5EF4]">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-4 px-5 text-slate-600 font-medium">{inv.clientName}</td>
                    <td className="py-4 px-5 text-slate-500 font-mono text-[11px]">{inv.dueDate}</td>
                    <td className="py-4 px-5 text-right font-mono font-bold text-amber-600">
                      {formatCurrency(inv.balanceDue)}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0D5EF4]">
                        <span>Inspect</span>
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F8FC] border-b border-slate-200 text-slate-500 font-bold">
                <tr>
                  <th className="py-3.5 px-5">Service Line</th>
                  <th className="py-3.5 px-5 text-right">Contracted Value</th>
                  <th className="py-3.5 px-5 text-right">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(serviceRevenueMap).map(([service, amount]) => {
                  const total = financials.contractedAmount || 1;
                  const share = Math.round((amount / total) * 100);
                  return (
                    <tr
                      key={service}
                      onClick={() => setActiveTab('quotations')}
                      className="cursor-pointer hover:bg-slate-50/90 transition-colors"
                    >
                      <td className="py-4 px-5 font-bold text-[#0B192C]">{service}</td>
                      <td className="py-4 px-5 text-right font-mono font-bold text-[#0B192C]">
                        {formatCurrency(amount)}
                      </td>
                      <td className="py-4 px-5 text-right font-mono text-slate-500">{share}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

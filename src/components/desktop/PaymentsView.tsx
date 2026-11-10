import React, { useMemo } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { Payment } from '../../types';
import { Printer, Eye, Users, Receipt } from 'lucide-react';
import { SearchAndFilterBar } from '../common/SearchAndFilterBar';
import { DetailViewHeader } from '../common/DetailViewHeader';
import {
  useTableSort,
  SortableTh,
  RowActionsMenu,
  TableSummaryFooter,
} from '../common/TableMechanics';

interface PaymentsViewProps {
  onRecordPayment: () => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = () => {
  const {
    payments,
    formatCurrency,
    profile,
    searchQuery: searchTerm,
    setSearchQuery: setSearchTerm,
    moduleFilter,
    setModuleFilter,
    selectedRecordIds,
    setSelectedRecordForTab,
    navigateToRecord,
  } = useBusiness();

  const selectedPaymentId = selectedRecordIds['payments'] || null;
  const setSelectedPaymentId = (id: string | null) => setSelectedRecordForTab('payments', id);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchesSearch =
        p.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.transactionReference.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMethod = moduleFilter === 'all' || p.method === moduleFilter;
      return matchesSearch && matchesMethod;
    });
  }, [payments, searchTerm, moduleFilter]);

  const { sortedItems: sortedPayments, sortConfig, handleSort } = useTableSort<Payment>(
    filteredPayments,
    'paymentDate',
    'desc'
  );

  const selectedPayment = selectedPaymentId
    ? payments.find((p) => p.id === selectedPaymentId) || null
    : null;

  /* ====================================================================== */
  /* PAGE 2: DEDICATED PAYMENT RECEIPT DETAIL PAGE                          */
  /* ====================================================================== */
  if (selectedPayment) {
    const currentIndex = sortedPayments.findIndex((p) => p.id === selectedPayment.id);
    const currentCrumb = {
      tab: 'payments',
      tabLabel: 'Payments',
      recordId: selectedPayment.id,
      recordLabel: selectedPayment.receiptNumber,
    };

    return (
      <div className="p-3.5 sm:p-5 space-y-4 max-w-4xl mx-auto min-h-full flex flex-col">
        <DetailViewHeader
          moduleLabel="Payments"
          recordTitle={`${selectedPayment.receiptNumber} — ${selectedPayment.clientName}`}
          onBack={() => setSelectedPaymentId(null)}
          currentIndex={currentIndex >= 0 ? currentIndex : 0}
          totalCount={sortedPayments.length}
          onPrev={
            currentIndex > 0
              ? () => setSelectedPaymentId(sortedPayments[currentIndex - 1].id)
              : undefined
          }
          onNext={
            currentIndex >= 0 && currentIndex < sortedPayments.length - 1
              ? () => setSelectedPaymentId(sortedPayments[currentIndex + 1].id)
              : undefined
          }
        >
          <button
            onClick={() => window.print()}
            className="px-2.5 py-1.5 text-slate-700 hover:text-[#0B192C] bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-xs font-bold flex items-center gap-1 shrink-0"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </DetailViewHeader>

        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs p-5 space-y-4">
          {/* Amount Banner */}
          <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
            <div className="text-xs text-emerald-700 font-bold">
              Payment Received &amp; Reconciled
            </div>
            <div className="text-3xl font-extrabold font-mono text-emerald-700 mt-1">
              {formatCurrency(selectedPayment.amount)}
            </div>
            <div className="text-xs text-emerald-600 mt-1">
              Paid on {selectedPayment.paymentDate}
            </div>
          </div>

          {/* Transaction Details with Clickable Cross-Links */}
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#F5F8FC] rounded-2xl border border-slate-200/80">
              <div>
                <div className="text-slate-400 text-[11px]">Received From</div>
                <button
                  type="button"
                  onClick={() =>
                    navigateToRecord(
                      'clients',
                      selectedPayment.clientId,
                      selectedPayment.clientName,
                      currentCrumb
                    )
                  }
                  className="font-bold text-[#0B192C] hover:text-[#0D5EF4] underline decoration-slate-300 underline-offset-2 mt-0.5 text-left"
                >
                  {selectedPayment.clientName}
                </button>
              </div>
              <div>
                <div className="text-slate-400 text-[11px]">Applied To Invoice</div>
                <button
                  type="button"
                  onClick={() =>
                    navigateToRecord(
                      'invoices',
                      selectedPayment.invoiceId,
                      selectedPayment.invoiceNumber,
                      currentCrumb
                    )
                  }
                  className="font-mono font-bold text-[#0D5EF4] hover:underline mt-0.5 text-left"
                >
                  {selectedPayment.invoiceNumber} →
                </button>
              </div>
              <div>
                <div className="text-slate-400 text-[11px]">Payment Method</div>
                <div className="font-bold text-[#0B192C] mt-0.5">{selectedPayment.method}</div>
              </div>
              <div>
                <div className="text-slate-400 text-[11px]">Transaction Reference</div>
                <div className="font-mono text-slate-700 mt-0.5">
                  {selectedPayment.transactionReference}
                </div>
              </div>
            </div>

            {selectedPayment.notes && (
              <div className="p-4 bg-white rounded-2xl border border-slate-200">
                <div className="text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Audit Notes
                </div>
                <div className="text-slate-700">{selectedPayment.notes}</div>
              </div>
            )}
          </div>

          {/* Business Footer Details */}
          <div className="border-t border-slate-100 pt-4 text-[11px] text-slate-500 space-y-1">
            <div>
              Issued by: {profile.name} · {profile.ownerName}
            </div>
            <div>
              Account: {profile.bankName} ({profile.accountNumber})
            </div>
            <div>Support: {profile.email}</div>
          </div>
        </div>
      </div>
    );
  }

  /* ====================================================================== */
  /* PAGE 1: FULL-WIDTH PAYMENTS TABLE (True Desktop Table Mechanics)       */
  /* ====================================================================== */
  const totalCollectedSum = sortedPayments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="p-3 sm:p-5 flex-1 flex flex-col min-h-0">
      <SearchAndFilterBar
        placeholder="Search payments by receipt #, client, invoice #, or transaction ref..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        modalTitle="Filter Payments"
        filterGroups={[
          {
            label: 'Payment Method',
            value: moduleFilter,
            onChange: setModuleFilter,
            options: [
              { label: 'All Methods', value: 'all' },
              { label: 'Bank Transfer', value: 'Bank Transfer' },
              { label: 'Online Card', value: 'Online Card' },
              { label: 'Wire', value: 'Wire' },
              { label: 'Cheque', value: 'Cheque' },
              { label: 'Cash', value: 'Cash' },
            ],
          },
        ]}
      />

      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr>
                <SortableTh
                  label="Receipt & Date"
                  sortKey="paymentDate"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTh
                  label="Client"
                  sortKey="clientName"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTh
                  label="Invoice & Method"
                  sortKey="invoiceNumber"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTh
                  label="Amount"
                  sortKey="amount"
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
              {sortedPayments.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => setSelectedPaymentId(p.id)}
                  className="cursor-pointer hover:bg-blue-50/40 transition-colors group"
                >
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-[#0B192C] group-hover:text-[#0D5EF4] transition-colors">
                      {p.receiptNumber}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">{p.paymentDate}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#0B192C]">{p.clientName}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div className="font-mono font-semibold text-[#0B192C]">{p.invoiceNumber}</div>
                    <div className="text-[11px] text-slate-500">
                      {p.method} · <span className="font-mono">{p.transactionReference}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-extrabold text-[#16A34A]">
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <RowActionsMenu
                      actions={[
                        {
                          label: 'Open Receipt',
                          icon: <Eye className="w-3.5 h-3.5" />,
                          onClick: () => setSelectedPaymentId(p.id),
                          variant: 'primary',
                        },
                        {
                          label: 'Open Invoice',
                          icon: <Receipt className="w-3.5 h-3.5" />,
                          onClick: () =>
                            navigateToRecord('invoices', p.invoiceId, p.invoiceNumber),
                        },
                        {
                          label: 'Open Client',
                          icon: <Users className="w-3.5 h-3.5" />,
                          onClick: () => navigateToRecord('clients', p.clientId, p.clientName),
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))}
              {sortedPayments.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No payment records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <TableSummaryFooter
          recordCount={sortedPayments.length}
          totalCount={payments.length}
          recordLabel="Payments"
          metrics={[
            { label: 'Total Collected', value: formatCurrency(totalCollectedSum), tone: 'emerald' },
          ]}
        />
      </div>
    </div>
  );
};

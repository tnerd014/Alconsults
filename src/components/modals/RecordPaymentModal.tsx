import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { Invoice } from '../../types';
import { CreditCard, CheckCircle2, ArrowRight } from 'lucide-react';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetInvoice?: Invoice | null;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({ isOpen, onClose, targetInvoice }) => {
  const { invoices, recordPayment, formatCurrency, profile } = useBusiness();
  const eligibleInvoices = invoices.filter((i) => i.balanceDue > 0 && i.status !== 'Cancelled');

  const [invoiceId, setInvoiceId] = useState<string>(targetInvoice ? targetInvoice.id : eligibleInvoices[0]?.id || '');
  const [amount, setAmount] = useState<number>(targetInvoice ? targetInvoice.balanceDue : 0);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState<'Bank Transfer' | 'Online Card' | 'Cash' | 'Cheque' | 'Wire'>('Bank Transfer');
  const [transactionReference, setTransactionReference] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (targetInvoice) {
      setInvoiceId(targetInvoice.id);
      setAmount(targetInvoice.balanceDue);
    } else if (eligibleInvoices[0]) {
      setInvoiceId(eligibleInvoices[0].id);
      setAmount(eligibleInvoices[0].balanceDue);
    }
  }, [targetInvoice]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const selectedInv = invoices.find((i) => i.id === invoiceId);

  const handleInvoiceChange = (id: string) => {
    setInvoiceId(id);
    const inv = invoices.find((i) => i.id === id);
    if (inv) {
      setAmount(inv.balanceDue);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInv || amount <= 0) return;

    recordPayment({
      invoiceId: selectedInv.id,
      invoiceNumber: selectedInv.invoiceNumber,
      clientId: selectedInv.clientId,
      clientName: selectedInv.clientName,
      projectId: selectedInv.projectId,
      amount,
      paymentDate,
      method,
      transactionReference: transactionReference || `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      notes: notes || 'Verified manual receipt entry',
    });
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-[#0B192C]/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200/90 shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Native Drag Handle Pill */}
        <button
          type="button"
          onClick={onClose}
          title="Tap or pull down to dismiss"
          className="shrink-0 w-full pt-3 pb-1 flex justify-center focus:outline-none group bg-white"
        >
          <span className="w-12 h-1.5 rounded-full bg-slate-300 group-hover:bg-slate-400 transition-colors" />
        </button>

        {/* Fixed-in-place Header */}
        <div className="shrink-0 px-6 py-4 bg-white border-b border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#16A34A] text-white flex items-center justify-center shadow-xs shrink-0">
            <CreditCard className="w-5 h-5 stroke-[2.2]" />
          </div>
          <h2 className="text-base font-extrabold text-[#0B192C]">Record Verified Payment</h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden text-xs">
          <div className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
            <div>
              <label className="font-bold text-[#0B192C] block mb-1">Target Invoice *</label>
              <select
                value={invoiceId}
                onChange={(e) => handleInvoiceChange(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2.5 text-[#0B192C] font-mono focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
              >
                {eligibleInvoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} — {inv.clientName} (Due: {formatCurrency(inv.balanceDue)})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="font-bold text-[#0B192C] block mb-1">
                  Amount ({profile.currencySymbol}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={selectedInv ? selectedInv.balanceDue : undefined}
                  required
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 font-mono font-extrabold text-[#16A34A] tabular-nums focus:bg-white focus:outline-none focus:border-[#16A34A]"
                />
                {selectedInv && (
                  <div className="text-[10px] text-slate-500 font-mono mt-1">
                    Balance: {formatCurrency(selectedInv.balanceDue)}
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-[#0B192C] block mb-1">Payment Date</label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 text-[#0B192C] focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="font-bold text-[#0B192C] block mb-1">Payment Method</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as any)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 text-[#0B192C] focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Online Card">Online Card (Stripe/Paystack)</option>
                  <option value="Wire">Wire Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-[#0B192C] block mb-1">Transaction Reference</label>
                <input
                  type="text"
                  placeholder="e.g. TRX-948210"
                  value={transactionReference}
                  onChange={(e) => setTransactionReference(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 font-mono text-[#0B192C] focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-[#0B192C] block mb-1">Verification Notes</label>
              <textarea
                rows={2}
                placeholder="Verified against bank settlement statement..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-3 text-[#0B192C] focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
              />
            </div>
          </div>

          {/* Fixed-in-place Split Action Footer */}
          <div className="shrink-0 px-6 py-4 bg-white border-t border-slate-200/80 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Dismiss
            </button>
            <button
              type="submit"
              className="flex-[2] py-2.5 px-5 text-xs font-bold text-white bg-[#16A34A] hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Confirm Receipt</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { Expense } from '../../types';
import { TrendingDown, ArrowRight } from 'lucide-react';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose }) => {
  const { projects, addExpense, profile } = useBusiness();
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Expense['category']>('Hosting & Servers');
  const [amount, setAmount] = useState<number>(100);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [projectId, setProjectId] = useState<string>('');
  const [vendor, setVendor] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Corporate Credit Card');
  const [notes] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projects.find((p) => p.id === projectId);

    addExpense({
      description,
      category,
      amount,
      date,
      projectId: projectId || undefined,
      projectName: proj ? proj.name : undefined,
      vendor: vendor || 'Direct Vendor',
      paymentMethod,
      notes,
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
        {/* Native Drag Pill Handle */}
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
          <div className="w-10 h-10 rounded-2xl bg-[#0D5EF4] text-white flex items-center justify-center shadow-xs shrink-0">
            <TrendingDown className="w-5 h-5 stroke-[2.2]" />
          </div>
          <h2 className="text-base font-extrabold text-[#0B192C]">Record Business Expense</h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden text-xs">
          <div className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
            <div>
              <label className="font-bold text-[#0B192C] block mb-1">Expense Description *</label>
              <input
                type="text"
                required
                placeholder="e.g. Cloud infrastructure & CDN cluster"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 text-[#0B192C] focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="font-bold text-[#0B192C] block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 text-[#0B192C] focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
                >
                  <option value="Hosting & Servers">Hosting & Servers</option>
                  <option value="Software Subscriptions">Software Subscriptions</option>
                  <option value="Contractor">Contractor / Subcontractor</option>
                  <option value="Domain & SSL">Domain & SSL</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Office & Admin">Office & Admin</option>
                  <option value="Transport">Transport</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-[#0B192C] block mb-1">
                  Amount ({profile.currencySymbol}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-[#0B192C] tabular-nums focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="font-bold text-[#0B192C] block mb-1">Date Incurred</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 text-[#0B192C] focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
                />
              </div>
              <div>
                <label className="font-bold text-[#0B192C] block mb-1">Project Allocation</label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 text-[#0B192C] focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
                >
                  <option value="">General Overhead</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="font-bold text-[#0B192C] block mb-1">Vendor / Payee</label>
                <input
                  type="text"
                  placeholder="Google Cloud / AWS"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 text-[#0B192C] focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
                />
              </div>
              <div>
                <label className="font-bold text-[#0B192C] block mb-1">Payment Method</label>
                <input
                  type="text"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 text-[#0B192C] focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
                />
              </div>
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
              className="flex-[2] py-2.5 px-5 text-xs font-bold text-white bg-[#0D5EF4] hover:bg-[#0047BA] rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Log Expense</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

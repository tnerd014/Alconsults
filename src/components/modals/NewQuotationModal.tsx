import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { QuotationLineItem } from '../../types';
import { Plus, Trash2, FileSpreadsheet, ArrowRight } from 'lucide-react';

interface NewQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewQuotationModal: React.FC<NewQuotationModalProps> = ({ isOpen, onClose }) => {
  const { clients, services, createQuotation, profile, updateProfile, formatCurrency } = useBusiness();
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [projectName, setProjectName] = useState('');
  const [serviceType, setServiceType] = useState(services[0]?.name || 'Custom Software Development');
  const [deliveryEstimate, setDeliveryEstimate] = useState('6 weeks');
  const [paymentTerms, setPaymentTerms] = useState('50% deposit upon start, 50% upon final acceptance');
  const [discount] = useState<number>(0);
  const [specialConditions, setSpecialConditions] = useState('Includes 30 days post-launch warranty and bug fixes.');
  const [vatRate, setVatRate] = useState<number>(profile.taxRate);

  const [items, setItems] = useState<QuotationLineItem[]>([
    { id: '1', description: 'Core Application Architecture & Database Modeling', quantity: 1, unitPrice: 3500, taxPercent: profile.taxRate, total: 3500 },
    { id: '2', description: 'Frontend Interface & Interactive Workflows', quantity: 1, unitPrice: 4200, taxPercent: profile.taxRate, total: 4200 },
  ]);

  useEffect(() => {
    if (isOpen) {
      setVatRate(profile.taxRate);
    }
  }, [isOpen, profile.taxRate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: String(Date.now()),
        description: 'New deliverable line item',
        quantity: 1,
        unitPrice: 1500,
        taxPercent: vatRate,
        total: 1500,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter((i) => i.id !== id));
  };

  const handleUpdateItem = (id: string, field: 'description' | 'quantity' | 'unitPrice', val: any) => {
    setItems(
      items.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: val };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = updated.quantity * updated.unitPrice;
        }
        return updated;
      })
    );
  };

  const subtotal = items.reduce((sum, i) => sum + i.total, 0);
  const taxAmount = Number(((subtotal * vatRate) / 100).toFixed(2));
  const totalAmount = Number((subtotal + taxAmount - discount).toFixed(2));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedClient = clients.find((c) => c.id === clientId);
    const clientName = selectedClient ? `${selectedClient.name} (${selectedClient.company})` : 'Prospective Client';

    if (vatRate !== profile.taxRate) {
      updateProfile({ ...profile, taxRate: vatRate });
    }

    createQuotation({
      clientId,
      clientName,
      projectName: projectName || `${serviceType} Solution`,
      serviceType,
      issueDate: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      status: 'Sent',
      items: items.map((it) => ({ ...it, taxPercent: vatRate })),
      discount,
      taxRate: vatRate,
      subtotal,
      taxAmount,
      totalAmount,
      paymentTerms,
      deliveryEstimate,
      specialConditions,
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
        className="bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200/90 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Fixed-in-place Header Title */}
        <div className="shrink-0 bg-[#F8FAFC] border-b border-slate-200/80">
          <button
            type="button"
            onClick={onClose}
            title="Tap or pull down to dismiss"
            className="w-full pt-3 pb-1 flex justify-center focus:outline-none group"
          >
            <span className="w-12 h-1.5 rounded-full bg-slate-300 group-hover:bg-slate-400 transition-colors" />
          </button>

          <div className="px-6 py-3.5 flex items-center justify-between gap-3.5">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#0D5EF4] text-white flex items-center justify-center shadow-sm shrink-0">
                <FileSpreadsheet className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h2 className="text-base font-extrabold text-[#0B192C]">New Commercial Quotation</h2>
            </div>
            <span className="text-[11px] font-mono font-bold text-[#0D5EF4] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
              VAT {vatRate}%
            </span>
          </div>
        </div>

        {/* Scrollable Body + Fixed-in-place Bottom Action Footer */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden text-xs">
          <div className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="font-bold text-[#0B192C] block mb-1">Target Client *</label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 text-[#0B192C] focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.company})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-bold text-[#0B192C] block mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="Enterprise Web & AI Platform"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 text-[#0B192C] focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
                />
              </div>
              <div>
                <label className="font-bold text-[#0B192C] block mb-1">Service Category</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 text-[#0B192C] focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-bold text-[#0B192C] block mb-1">Estimated Delivery</label>
                <input
                  type="text"
                  value={deliveryEstimate}
                  onChange={(e) => setDeliveryEstimate(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 text-[#0B192C] focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
                />
              </div>
            </div>

            {/* VAT Rate Variable Strip */}
            <div className="p-3.5 rounded-2xl bg-[#F5F8FC] border border-blue-100 flex flex-wrap items-center justify-between gap-2">
              <span className="font-extrabold text-[#0B192C] text-[11px]">VAT Rate Variable (%)</span>
              <div className="flex items-center gap-1.5">
                {[0, 5, 7.5, 10, 15, 20].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setVatRate(rate)}
                    className={`px-2 py-1 rounded-lg font-mono text-[10px] font-bold transition-colors ${
                      vatRate === rate
                        ? 'bg-[#0D5EF4] text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={vatRate}
                  onChange={(e) => setVatRate(parseFloat(e.target.value) || 0)}
                  className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1 text-center font-mono font-bold text-xs text-[#0B192C]"
                />
              </div>
            </div>

            {/* Line Items Builder */}
            <div className="space-y-2.5 border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[#0B192C] text-[11px] uppercase tracking-wider">
                  Deliverables &amp; Line Items ({items.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-[#0D5EF4] text-[11px] font-bold hover:bg-blue-100 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add Deliverable
                </button>
              </div>

              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 bg-[#F8FAFC] p-2.5 rounded-xl border border-slate-200/80">
                    <input
                      type="text"
                      required
                      placeholder="Deliverable description"
                      value={item.description}
                      onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-[#0B192C]"
                    />
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleUpdateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-14 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-center font-mono tabular-nums"
                    />
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={item.unitPrice}
                      onChange={(e) => handleUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-24 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-right font-mono tabular-nums"
                    />
                    <span className="w-20 text-right font-mono font-bold text-[#0B192C] text-xs tabular-nums">
                      {formatCurrency(item.total)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2 text-xs space-y-1 flex-col items-end">
                <div className="flex justify-between w-56 text-slate-500">
                  <span>Subtotal (Excl. VAT):</span>
                  <span className="font-mono tabular-nums">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between w-56 text-[#0B192C] font-semibold">
                  <span>VAT ({vatRate}%):</span>
                  <span className="font-mono tabular-nums">{formatCurrency(taxAmount)}</span>
                </div>
                <div className="flex justify-between w-56 font-extrabold text-[#0B192C] border-t border-slate-200 pt-1.5 text-sm">
                  <span>Quoted Total:</span>
                  <span className="font-mono text-[#0D5EF4] tabular-nums">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 border-t border-slate-100 pt-3">
              <div>
                <label className="font-bold text-[#0B192C] block mb-1">Payment Terms</label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 text-[#0B192C]"
                />
              </div>
              <div>
                <label className="font-bold text-[#0B192C] block mb-1">Warranty &amp; Conditions</label>
                <input
                  type="text"
                  value={specialConditions}
                  onChange={(e) => setSpecialConditions(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 text-[#0B192C]"
                />
              </div>
            </div>
          </div>

          {/* Fixed-in-place Bottom Action Footer */}
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
              <span>Issue Quotation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

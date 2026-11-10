import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { LeadStatus } from '../../types';
import { Users, ArrowRight } from 'lucide-react';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewLeadModal: React.FC<NewLeadModalProps> = ({ isOpen, onClose }) => {
  const { createLead, services, profile } = useBusiness();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [source, setSource] = useState('Website Form');
  const [serviceRequested, setServiceRequested] = useState(services[0]?.name || 'Custom Software Development');
  const [initialEnquiry, setInitialEnquiry] = useState('');
  const [estimatedValue, setEstimatedValue] = useState<number>(8500);
  const [expectedTimeline, setExpectedTimeline] = useState('6 weeks');
  const [budget, setBudget] = useState<number>(10000);
  const [status] = useState<LeadStatus>('New Enquiry');
  const [followUpDate] = useState(new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]);
  const [internalNotes, setInternalNotes] = useState('');

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
    createLead({
      name,
      company,
      email,
      phone,
      source,
      serviceRequested,
      initialEnquiry,
      estimatedValue,
      expectedTimeline,
      budget,
      status,
      followUpDate,
      internalNotes,
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
        className="bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200/90 shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden"
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

          <div className="px-6 py-3.5 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#0D5EF4] text-white flex items-center justify-center shadow-sm shrink-0">
              <Users className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h2 className="text-base font-extrabold text-[#0B192C]">New Client Enquiry</h2>
          </div>
        </div>

        {/* Scrollable Form Fields + Fixed-in-place Bottom Action Footer */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden text-xs">
          <div className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="font-bold text-[#0B192C] block mb-1">Contact Name *</label>
                <input
                  required
                  type="text"
                  placeholder="Marcus Vance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 text-[#0B192C] focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
                />
              </div>
              <div>
                <label className="font-bold text-[#0B192C] block mb-1">Company / Organization *</label>
                <input
                  required
                  type="text"
                  placeholder="Vance Logistics"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 text-[#0B192C] focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
                />
              </div>
              <div>
                <label className="font-bold text-[#0B192C] block mb-1">Email Address *</label>
                <input
                  required
                  type="email"
                  placeholder="marcus@vance.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 text-[#0B192C] focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
                />
              </div>
              <div>
                <label className="font-bold text-[#0B192C] block mb-1">Phone / WhatsApp</label>
                <input
                  type="text"
                  placeholder="+1 (555) 912-3840"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 text-[#0B192C] focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="font-bold text-[#0B192C] block mb-1">Requested Service</label>
                <select
                  value={serviceRequested}
                  onChange={(e) => setServiceRequested(e.target.value)}
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
                <label className="font-bold text-[#0B192C] block mb-1">Enquiry Channel</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 text-[#0B192C] focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
                >
                  <option value="Website Form">Website Form</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Referral">Referral</option>
                  <option value="Direct Outreach">Direct Outreach</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-[#0B192C] block mb-1">
                  Est. Value ({profile.currencySymbol})
                </label>
                <input
                  type="number"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-[#0B192C] tabular-nums focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
                />
              </div>
              <div>
                <label className="font-bold text-[#0B192C] block mb-1">
                  Budget ({profile.currencySymbol})
                </label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-[#0B192C] tabular-nums focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
                />
              </div>
              <div>
                <label className="font-bold text-[#0B192C] block mb-1">Timeline</label>
                <input
                  type="text"
                  placeholder="6 weeks"
                  value={expectedTimeline}
                  onChange={(e) => setExpectedTimeline(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 text-[#0B192C] focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-[#0B192C] block mb-1">Initial Requirements Summary *</label>
              <textarea
                rows={2}
                required
                placeholder="Describe the client's project goals and deliverables..."
                value={initialEnquiry}
                onChange={(e) => setInitialEnquiry(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-3 text-[#0B192C] focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
              />
            </div>

            <div>
              <label className="font-bold text-[#0B192C] block mb-1">Internal Strategy Notes</label>
              <textarea
                rows={2}
                placeholder="Private workspace notes..."
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-3 text-[#0B192C] focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
              />
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
              <span>Save Enquiry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { Client } from '../../types';
import { Building2, ArrowRight } from 'lucide-react';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewClientModal: React.FC<NewClientModalProps> = ({ isOpen, onClose }) => {
  const { clients } = useBusiness();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [communicationPreference, setCommunicationPreference] = useState<'WhatsApp' | 'Email' | 'Phone'>('WhatsApp');
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
    const token = 'portal-token-' + Math.random().toString(36).substring(2, 9);
    const newClient: Client = {
      id: 'client-' + Date.now(),
      name,
      company,
      email,
      phone,
      address,
      portalToken: token,
      communicationPreference,
      activeProjectsCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      internalNotes,
    };
    clients.unshift(newClient);
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
              <Building2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h2 className="text-base font-extrabold text-[#0B192C]">Add Confirmed Client</h2>
          </div>
        </div>

        {/* Scrollable Body + Fixed-in-place Bottom Action Footer */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden text-xs">
          <div className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="font-bold text-[#0B192C] block mb-1">Contact Name *</label>
                <input
                  required
                  type="text"
                  placeholder="Julian Sterling"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 text-[#0B192C] focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
                />
              </div>
              <div>
                <label className="font-bold text-[#0B192C] block mb-1">Company *</label>
                <input
                  required
                  type="text"
                  placeholder="Sterling BioLabs"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 text-[#0B192C] focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
                />
              </div>
              <div>
                <label className="font-bold text-[#0B192C] block mb-1">Email *</label>
                <input
                  required
                  type="email"
                  placeholder="julian@biolabs.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 text-[#0B192C] focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
                />
              </div>
              <div>
                <label className="font-bold text-[#0B192C] block mb-1">Phone</label>
                <input
                  type="text"
                  placeholder="+1 (555) 419-7711"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 text-[#0B192C] focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-[#0B192C] block mb-1">Billing Address</label>
              <input
                type="text"
                placeholder="320 Cambridge Parkway, Boston, MA"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 text-[#0B192C] focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
              />
            </div>

            <div>
              <label className="font-bold text-[#0B192C] block mb-1">Preferred Communication</label>
              <select
                value={communicationPreference}
                onChange={(e) => setCommunicationPreference(e.target.value as any)}
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 text-[#0B192C] focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
              >
                <option value="WhatsApp">WhatsApp</option>
                <option value="Email">Email</option>
                <option value="Phone">Phone</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-[#0B192C] block mb-1">Internal Relationship Notes</label>
              <textarea
                rows={2}
                placeholder="Private account notes..."
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
              <span>Create Client</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

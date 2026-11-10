import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { OnboardingForm } from '../../types';
import { Send, CheckCircle2, Copy, Check, ArrowLeft, ChevronRight } from 'lucide-react';
import { SearchAndFilterBar } from '../common/SearchAndFilterBar';

export const FormsView: React.FC = () => {
  const {
    onboardingForms,
    submitOnboardingForm,
    setActiveTab,
    searchQuery: searchTerm,
    setSearchQuery: setSearchTerm,
  } = useBusiness();
  const [selectedForm, setSelectedForm] = useState<OnboardingForm | null>(null);
  const [formResponses, setFormResponses] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [serviceFilter, setServiceFilter] = useState<string>('all');

  const serviceTypes = Array.from(new Set(onboardingForms.map((f) => f.serviceType)));

  const filteredForms = onboardingForms.filter((f) => {
    const matchesSearch =
      f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.serviceType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesService = serviceFilter === 'all' || f.serviceType === serviceFilter;
    return matchesSearch && matchesService;
  });

  const handleFieldChange = (label: string, value: string) => {
    setFormResponses((prev) => ({ ...prev, [label]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForm) return;
    submitOnboardingForm(selectedForm.id, formResponses);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormResponses({});
    }, 4000);
  };

  const copyPublicLink = (formId?: string) => {
    const id = formId || selectedForm?.id || onboardingForms[0]?.id || 'default';
    navigator.clipboard?.writeText(`https://onboard.apexdigital.tech/forms/${id}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  /* ====================================================================== */
  /* PAGE 2: DEDICATED INTERACTIVE FORM PAGE                                */
  /* ====================================================================== */
  if (selectedForm) {
    return (
      <div className="p-3.5 sm:p-6 space-y-4 max-w-4xl mx-auto min-h-full flex flex-col">
        {/* Compact Top Back Navigation & Copy Public Link */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5 shrink-0">
          <button
            onClick={() => {
              setSelectedForm(null);
              setSubmitted(false);
              setFormResponses({});
            }}
            className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-[#0B192C] px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <button
            onClick={() => copyPublicLink(selectedForm.id)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-[#0B192C] bg-white border border-slate-200/90 rounded-xl hover:bg-slate-50 shadow-2xs shrink-0"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5 text-[#0D5EF4]" />}
            <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
          </button>
        </div>

        {/* Dedicated Form Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 sm:p-8">
          {submitted ? (
            <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3 my-8">
              <CheckCircle2 className="w-10 h-10 text-[#16A34A] mx-auto" />
              <h2 className="text-base font-extrabold text-emerald-950">Requirements Submitted Successfully</h2>
              <p className="text-xs text-emerald-800 max-w-md mx-auto">
                A new Lead record has been automatically generated in your CRM with these structured responses, and notifications have been dispatched.
              </p>
              <button
                onClick={() => setActiveTab('leads')}
                className="mt-2 px-4 py-2 text-xs font-bold text-white bg-[#0D5EF4] rounded-xl hover:bg-blue-700 inline-block shadow-xs"
              >
                View in CRM Leads →
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <span className="text-[10px] text-slate-400 font-mono uppercase">{selectedForm.serviceType}</span>
                <h2 className="text-lg font-extrabold text-[#0B192C] mt-0.5">{selectedForm.title}</h2>
                <p className="text-xs text-slate-500 mt-1">{selectedForm.description}</p>
              </div>

              <div className="space-y-4 pt-3 border-t border-slate-100">
                {selectedForm.fields.map((f) => (
                  <div key={f.id} className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block">
                      {f.label} {f.required && <span className="text-rose-600">*</span>}
                    </label>

                    {f.type === 'textarea' ? (
                      <textarea
                        rows={3}
                        required={f.required}
                        placeholder={f.placeholder}
                        value={formResponses[f.label] || ''}
                        onChange={(e) => handleFieldChange(f.label, e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-[#0D5EF4]"
                      />
                    ) : f.type === 'dropdown' ? (
                      <select
                        required={f.required}
                        value={formResponses[f.label] || ''}
                        onChange={(e) => handleFieldChange(f.label, e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#0B192C] focus:outline-none focus:border-[#0D5EF4]"
                      >
                        <option value="">Select option...</option>
                        {f.options?.map((opt, i) => (
                          <option key={i} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={f.type}
                        required={f.required}
                        placeholder={f.placeholder}
                        value={formResponses[f.label] || ''}
                        onChange={(e) => handleFieldChange(f.label, e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0D5EF4]"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400">
                  Submissions execute backend validation &amp; automatic CRM lead generation
                </span>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-[#0D5EF4] rounded-xl hover:bg-blue-700 shadow-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Requirements</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  /* ====================================================================== */
  /* PAGE 1: MAIN FULL-WIDTH ONBOARDING FORMS LIST PAGE                     */
  /* ====================================================================== */
  return (
    <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto min-h-full flex flex-col">
      {/* Main Page Header */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5 shrink-0">
        <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-[#0B192C] truncate">Forms</h1>

        <button
          onClick={() => copyPublicLink()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#0D5EF4] rounded-xl hover:bg-blue-700 shadow-xs transition-colors shrink-0"
        >
          {copiedLink ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-white" />}
          <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
        </button>
      </div>

      {/* Main Page Search Bar + Filter Modal Button */}
      <SearchAndFilterBar
        placeholder="Search onboarding forms by title or service line..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        modalTitle="Filter Forms"
        filterGroups={[
          {
            label: 'Service Line',
            value: serviceFilter,
            onChange: setServiceFilter,
            options: [
              { label: 'All Service Lines', value: 'all' },
              ...serviceTypes.map((st) => ({ label: st, value: st })),
            ],
          },
        ]}
      />

      {/* Full-Width Forms Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F8FC] border-b border-slate-200/80 text-slate-500 font-bold">
              <tr>
                <th className="py-3.5 px-5">Form Title</th>
                <th className="py-3.5 px-5">Service Line</th>
                <th className="py-3.5 px-5">Structured Fields</th>
                <th className="py-3.5 px-5">Submissions</th>
                <th className="py-3.5 px-5 text-right">Open Form</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredForms.map((f) => (
                <tr
                  key={f.id}
                  onClick={() => {
                    setSelectedForm(f);
                    setFormResponses({});
                    setSubmitted(false);
                  }}
                  className="cursor-pointer transition-colors hover:bg-slate-50/90 group"
                >
                  <td className="py-4 px-5">
                    <div className="font-bold text-sm text-[#0B192C] group-hover:text-[#0D5EF4] transition-colors">
                      {f.title}
                    </div>
                  </td>
                  <td className="py-4 px-5 text-slate-600 font-medium">{f.serviceType}</td>
                  <td className="py-4 px-5 font-mono text-slate-500">{f.fields.length} fields</td>
                  <td className="py-4 px-5 font-mono font-bold text-[#0D5EF4]">{f.submissionsCount}</td>
                  <td className="py-4 px-5 text-right">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0D5EF4] group-hover:translate-x-0.5 transition-transform">
                      <span>Open</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </td>
                </tr>
              ))}
              {filteredForms.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-slate-400">
                    No onboarding forms found matching query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

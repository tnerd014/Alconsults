import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import {
  Globe,
  CheckCircle2,
  Clock,
  Download,
  CreditCard,
  Plus,
  LifeBuoy,
  GitPullRequest,
  FileText,
  Lock,
  Printer,
  ChevronRight,
  Send,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

export const ClientPortalView: React.FC = () => {
  const {
    clients,
    projects,
    invoices,
    payments,
    documents,
    tickets,
    quotations,
    selectedClientIdForPortal,
    setSelectedClientIdForPortal,
    formatCurrency,
    profile,
    submitSupportTicket,
    submitChangeRequest,
    recordPayment,
  } = useBusiness();

  // Active client & associated projects
  const client = clients.find((c) => c.id === selectedClientIdForPortal) || clients[0];
  const clientProjects = projects.filter((p) => p.clientId === client?.id);
  const selectedProject = clientProjects[0];

  const clientInvoices = invoices.filter((i) => i.clientId === client?.id);
  const clientPayments = payments.filter((p) => p.clientId === client?.id);
  const clientDocs = documents.filter((d) => d.clientId === client?.id && d.isClientVisible);
  const clientTickets = tickets.filter((t) => t.clientId === client?.id);
  const clientQuotes = quotations.filter((q) => q.clientId === client?.id);

  const totalContracted = clientProjects.reduce((sum, p) => sum + p.contractValue, 0);
  const totalPaid = clientPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalBalanceDue = clientInvoices.reduce((sum, i) => sum + i.balanceDue, 0);

  // Modals state
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketPriority, setTicketPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');

  const [isChangeRequestModalOpen, setIsChangeRequestModalOpen] = useState(false);
  const [changeTitle, setChangeTitle] = useState('');
  const [changeDesc, setChangeDesc] = useState('');

  // Payment mock modal
  const [payingInvoice, setPayingInvoice] = useState<string | null>(null);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !selectedProject || !ticketTitle.trim()) return;

    submitSupportTicket({
      clientId: client.id,
      clientName: client.name,
      projectId: selectedProject.id,
      projectName: selectedProject.name,
      title: ticketTitle,
      description: ticketDesc,
      priority: ticketPriority,
    });
    setTicketTitle('');
    setTicketDesc('');
    setIsTicketModalOpen(false);
  };

  const handleCreateChangeRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !changeTitle.trim()) return;

    submitChangeRequest(selectedProject.id, {
      title: changeTitle,
      description: changeDesc,
      costImpact: 500,
      timelineImpactDays: 3,
      requestedBy: client.name,
    });
    setChangeTitle('');
    setChangeDesc('');
    setIsChangeRequestModalOpen(false);
  };

  const handlePayInvoice = (invoiceId: string) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv) return;

    recordPayment({
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      clientId: inv.clientId,
      clientName: inv.clientName,
      projectId: inv.projectId,
      amount: inv.balanceDue,
      paymentDate: new Date().toISOString().split('T')[0],
      method: 'Online Card',
      transactionReference: `PORTAL-PAY-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      notes: 'Settled securely via Client Self-Service Portal checkout',
    });
    setPayingInvoice(null);
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#F5F8FC] py-4 sm:py-6 px-3.5 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        {/* Portal Simulator Header Bar */}
        <div className="bg-white border border-slate-200/80 rounded-xl px-3 py-2 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-bold text-[#0B192C] flex items-center gap-1 shrink-0">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Portal Sandbox:</span>
            </span>
            <select
              value={selectedClientIdForPortal}
              onChange={(e) => setSelectedClientIdForPortal(e.target.value)}
              className="font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[#0B192C] truncate max-w-[200px] sm:max-w-xs"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.company}
                </option>
              ))}
            </select>
          </div>

          <div className="text-slate-400 text-[10px] font-mono hidden sm:block">
            Token: <span className="text-slate-700">{client?.portalToken}</span>
          </div>
        </div>

        {/* Client Portal Header */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 sm:p-5 shadow-xs flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Client Portal
            </span>
            <h1 className="text-sm sm:text-base font-extrabold text-[#0B192C] truncate">{client?.company}</h1>
            <div className="text-[11px] text-slate-500 truncate">{client?.name}</div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsChangeRequestModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100"
            >
              <GitPullRequest className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Scope Change</span>
            </button>

            <button
              onClick={() => setIsTicketModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-[#0D5EF4] rounded-xl hover:bg-blue-700"
            >
              <LifeBuoy className="w-3.5 h-3.5" />
              <span>Support</span>
            </button>
          </div>
        </div>

        {/* Financial Summary for Client */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white border border-neutral-200 rounded">
            <div className="text-xs text-neutral-500 font-medium">Contracted Engagement Value</div>
            <div className="text-xl font-bold font-mono text-neutral-900 mt-1">
              {formatCurrency(totalContracted)}
            </div>
            <div className="text-[11px] text-neutral-400 mt-0.5">Agreed project budget</div>
          </div>

          <div className="p-4 bg-white border border-neutral-200 rounded">
            <div className="text-xs text-emerald-700 font-medium">Total Paid to Date</div>
            <div className="text-xl font-bold font-mono text-emerald-700 mt-1">
              {formatCurrency(totalPaid)}
            </div>
            <div className="text-[11px] text-emerald-600 mt-0.5">{clientPayments.length} reconciled payment(s)</div>
          </div>

          <div className="p-4 bg-white border border-neutral-200 rounded">
            <div className="text-xs text-amber-700 font-medium">Outstanding Balance Due</div>
            <div className="text-xl font-bold font-mono text-amber-700 mt-1">
              {formatCurrency(totalBalanceDue)}
            </div>
            <div className="text-[11px] text-amber-600 mt-0.5">
              {totalBalanceDue > 0 ? 'Pending invoice payments' : 'All invoices settled'}
            </div>
          </div>
        </div>

        {/* Active Project Delivery Status */}
        {selectedProject ? (
          <div className="bg-white border border-neutral-200 rounded p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-100 pb-3">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-semibold">Active Project Delivery</span>
                <h2 className="text-base font-bold text-neutral-900 mt-0.5">{selectedProject.name}</h2>
                <div className="text-xs text-neutral-500 mt-0.5">Stage: {selectedProject.stage} · Target Completion: {selectedProject.expectedCompletionDate}</div>
              </div>

              <div className="text-right">
                <span className="font-mono text-base font-bold text-neutral-900">{selectedProject.progressPercent}%</span>
                <span className="text-xs text-neutral-500 block">Overall Deliverables Progress</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-neutral-900 h-full rounded-full transition-all duration-300"
                style={{ width: `${selectedProject.progressPercent}%` }}
              />
            </div>

            {/* Project Milestones (Client Visible only!) */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase text-neutral-500 tracking-wider">
                Milestones & Handover Schedule
              </h3>
              <div className="space-y-2">
                {selectedProject.milestones
                  .filter((m) => m.isClientVisible)
                  .map((m) => {
                    const isDone = m.status === 'Completed';
                    return (
                      <div
                        key={m.id}
                        className={`p-3 rounded border text-xs flex flex-wrap items-center justify-between gap-3 ${
                          isDone ? 'bg-emerald-50/50 border-emerald-200' : 'bg-neutral-50 border-neutral-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2
                            className={`w-4 h-4 ${isDone ? 'text-emerald-600' : 'text-neutral-400'}`}
                          />
                          <div>
                            <span className={`font-semibold ${isDone ? 'text-emerald-950 line-through' : 'text-neutral-900'}`}>
                              {m.title}
                            </span>
                            <div className="text-neutral-500 text-[11px]">{m.description}</div>
                          </div>
                        </div>

                        <div className="text-right font-mono text-[11px] text-neutral-500">
                          {isDone ? (
                            <span className="text-emerald-700 font-semibold">Completed on {m.completedDate}</span>
                          ) : (
                            <span>Target: {m.dueDate}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 bg-white border border-neutral-200 rounded text-center text-xs text-neutral-400">
            No active project currently associated with this client account.
          </div>
        )}

        {/* Invoices & Direct Pay Section */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-extrabold text-[#0B192C]">VAT Invoices &amp; Statements</h2>
              <div className="text-xs text-slate-500">Pay online or review itemized VAT breakdown</div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#0D5EF4] font-mono text-xs font-bold">
              Standard VAT: {profile.taxRate}%
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F8FC] border-b border-slate-200 text-slate-500 font-bold">
                <tr>
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                  <th className="py-2.5 px-3 text-right">VAT ({profile.taxRate}%)</th>
                  <th className="py-2.5 px-3 text-right">Total (Incl. VAT)</th>
                  <th className="py-2.5 px-3 text-right">Balance Due</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clientInvoices.map((inv) => {
                  const vatRate = typeof inv.taxRate === 'number' ? inv.taxRate : profile.taxRate;
                  const vatAmount = Number(((inv.subtotal * vatRate) / 100).toFixed(2));
                  const totalAmount = Number((inv.subtotal + vatAmount).toFixed(2));
                  const paidAmount = inv.status === 'Paid' ? totalAmount : inv.paidAmount;
                  const balanceDue = inv.status === 'Paid' ? 0 : Math.max(0, Number((totalAmount - paidAmount).toFixed(2)));
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-mono font-bold text-[#0B192C]">{inv.invoiceNumber}</td>
                      <td className="py-3 px-3 text-slate-600">{inv.type}</td>
                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">{inv.dueDate}</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-600 tabular-nums">{formatCurrency(inv.subtotal)}</td>
                      <td className="py-3 px-3 text-right font-mono text-[#0D5EF4] font-semibold tabular-nums">
                        {formatCurrency(vatAmount)} ({vatRate}%)
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-[#0B192C] tabular-nums">{formatCurrency(totalAmount)}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-[#0B192C] tabular-nums">
                        {balanceDue > 0 ? (
                          <span className="text-[#DC2626]">{formatCurrency(balanceDue)}</span>
                        ) : (
                          <span className="text-[#16A34A]">{formatCurrency(0)}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full border inline-block ${
                            inv.status === 'Paid'
                              ? 'text-[#16A34A] bg-emerald-50 border-emerald-200'
                              : 'text-[#DC2626] bg-red-50 border-red-200'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {balanceDue > 0 ? (
                          <button
                            onClick={() => handlePayInvoice(inv.id)}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-[#0D5EF4] hover:bg-blue-700 rounded-xl inline-flex items-center gap-1 shadow-xs"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Pay {formatCurrency(balanceDue)}</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-[#16A34A] font-bold">Settled</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Client Approved Documents Vault (Section 14.4) */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-extrabold text-[#0B192C]">Approved Project Documents &amp; Receipts</h2>
              <div className="text-xs text-slate-500">Official agreements, specifications, and payment receipts</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {clientDocs.map((doc) => (
              <div key={doc.id} className="p-3.5 bg-[#F5F8FC] border border-slate-200/80 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5 truncate pr-2">
                  <FileText className="w-4 h-4 text-[#0D5EF4] shrink-0" />
                  <div className="truncate">
                    <div className="font-bold text-[#0B192C] truncate">{doc.title}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{doc.fileSize} · {doc.uploadDate}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const html = `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:36px;"><h1>${profile.name} — ${doc.title}</h1><p>Client: ${client?.company}</p><p>Date: ${doc.uploadDate}</p></body></html>`;
                    const blob = new Blob([html], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${doc.title.replace(/\s+/g, '_')}.html`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="p-2 text-[#0D5EF4] hover:bg-blue-50 bg-white border border-slate-200 rounded-xl shrink-0"
                  title="Download File"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {clientDocs.length === 0 && (
              <div className="text-slate-400 text-xs py-4">No client-visible documents shared yet.</div>
            )}
          </div>
        </div>

        {/* Support Tickets Section */}
        <div className="bg-white border border-neutral-200 rounded p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-neutral-900">Support Requests ({clientTickets.length})</h2>
              <div className="text-xs text-neutral-500">Post-launch inquiries and bug reports</div>
            </div>
            <button
              onClick={() => setIsTicketModalOpen(true)}
              className="px-2.5 py-1 text-xs font-medium text-white bg-neutral-900 rounded hover:bg-neutral-800"
            >
              + New Ticket
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {clientTickets.map((t) => (
              <div key={t.id} className="p-3 bg-neutral-50 border border-neutral-200 rounded flex items-start justify-between">
                <div>
                  <div className="font-semibold text-neutral-900">{t.title}</div>
                  <div className="text-neutral-600 text-[11px] mt-0.5">{t.description}</div>
                  <div className="text-[10px] text-neutral-400 font-mono mt-1">Submitted: {t.dateSubmitted}</div>
                </div>
                <span className="text-[10px] font-semibold text-neutral-700 bg-white border border-neutral-200 px-2 py-0.5 rounded">
                  {t.status}
                </span>
              </div>
            ))}
            {clientTickets.length === 0 && (
              <div className="text-neutral-400 text-xs py-2">No support tickets submitted.</div>
            )}
          </div>
        </div>
      </div>

      {/* Ticket Modal (Fixed Header + Scrollable Body + Fixed Footer) */}
      {isTicketModalOpen && (
        <div
          onClick={() => setIsTicketModalOpen(false)}
          className="fixed inset-0 bg-[#0B192C]/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200/90 shadow-2xl max-w-md w-full max-h-[88vh] flex flex-col overflow-hidden text-xs"
          >
            {/* Fixed-in-Place Header Title */}
            <div className="shrink-0 bg-[#F8FAFC] border-b border-slate-200/80">
              <button
                type="button"
                onClick={() => setIsTicketModalOpen(false)}
                className="w-full pt-3 pb-1 flex justify-center focus:outline-none group"
                title="Dismiss"
              >
                <span className="w-12 h-1.5 rounded-full bg-slate-300 group-hover:bg-slate-400 transition-colors" />
              </button>

              <div className="px-6 py-3.5 flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-2xl bg-[#0D5EF4] text-white flex items-center justify-center shrink-0">
                  <LifeBuoy className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-[#0B192C] text-sm">Submit Support Request</h3>
              </div>
            </div>

            <form onSubmit={handleCreateTicket} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-3.5 min-h-0">
                <div>
                  <label className="font-bold text-[#0B192C] block mb-1">Subject / Issue Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Broken link on tenant payment form"
                    value={ticketTitle}
                    onChange={(e) => setTicketTitle(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 text-[#0B192C] focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#0B192C] block mb-1">Priority</label>
                  <select
                    value={ticketPriority}
                    onChange={(e) => setTicketPriority(e.target.value as any)}
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 text-[#0B192C]"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#0B192C] block mb-1">Description</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Please describe what happened..."
                    value={ticketDesc}
                    onChange={(e) => setTicketDesc(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-3 text-[#0B192C] focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
                  />
                </div>
              </div>

              {/* Fixed-in-Place Footer Action Buttons */}
              <div className="shrink-0 px-6 py-4 bg-[#F8FAFC] border-t border-slate-200/80 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsTicketModalOpen(false)}
                  className="flex-1 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold rounded-xl"
                >
                  Dismiss
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-2.5 bg-[#0D5EF4] hover:bg-[#0047BA] text-white rounded-xl font-bold shadow-md shadow-blue-500/20"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Request Modal (Fixed Header + Scrollable Body + Fixed Footer) */}
      {isChangeRequestModalOpen && (
        <div
          onClick={() => setIsChangeRequestModalOpen(false)}
          className="fixed inset-0 bg-[#0B192C]/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200/90 shadow-2xl max-w-md w-full max-h-[88vh] flex flex-col overflow-hidden text-xs"
          >
            {/* Fixed-in-Place Header Title */}
            <div className="shrink-0 bg-[#F8FAFC] border-b border-slate-200/80">
              <button
                type="button"
                onClick={() => setIsChangeRequestModalOpen(false)}
                className="w-full pt-3 pb-1 flex justify-center focus:outline-none group"
                title="Dismiss"
              >
                <span className="w-12 h-1.5 rounded-full bg-slate-300 group-hover:bg-slate-400 transition-colors" />
              </button>

              <div className="px-6 py-3.5 flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-2xl bg-[#0D5EF4] text-white flex items-center justify-center shrink-0">
                  <GitPullRequest className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-[#0B192C] text-sm">Request Scope Change</h3>
              </div>
            </div>

            <form onSubmit={handleCreateChangeRequest} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-3.5 min-h-0">
                <div>
                  <label className="font-bold text-[#0B192C] block mb-1">Requested Feature / Change *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Additional payment gateway integration"
                    value={changeTitle}
                    onChange={(e) => setChangeTitle(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 text-[#0B192C] focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#0B192C] block mb-1">Description</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe the requested feature..."
                    value={changeDesc}
                    onChange={(e) => setChangeDesc(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-3 text-[#0B192C] focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
                  />
                </div>
              </div>

              {/* Fixed-in-Place Footer Action Buttons */}
              <div className="shrink-0 px-6 py-4 bg-[#F8FAFC] border-t border-slate-200/80 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsChangeRequestModalOpen(false)}
                  className="flex-1 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold rounded-xl"
                >
                  Dismiss
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-2.5 bg-[#0D5EF4] hover:bg-[#0047BA] text-white rounded-xl font-bold shadow-md shadow-blue-500/20"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

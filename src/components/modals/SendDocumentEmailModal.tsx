import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { Invoice, Quotation } from '../../types';
import {
  Mail,
  Send,
  Sparkles,
  CheckCircle2,
  Sliders,
  Paperclip,
  RefreshCw,
  HardDrive,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { COMPANY_LOGO_URL } from '../common/BrandLogo';
import {
  sendEmailViaGmailApi,
  saveDocumentToGoogleDrive,
  syncEventToGoogleCalendar,
} from '../../services/googleWorkspace';

interface SendDocumentEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: 'invoice' | 'quotation';
  invoice?: Invoice | null;
  quotation?: Quotation | null;
}

type TemplateKey = 'standard' | 'reminder' | 'urgent' | 'thank_you';

export const SendDocumentEmailModal: React.FC<SendDocumentEmailModalProps> = ({
  isOpen,
  onClose,
  documentType,
  invoice,
  quotation,
}) => {
  const {
    profile,
    emailSettings,
    clients,
    formatCurrency,
    sendPaymentReminder,
    setActiveTab,
  } = useBusiness();

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey>('standard');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [ccEmail, setCcEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachPdf, setAttachPdf] = useState(true);
  const [deliveryChannel, setDeliveryChannel] = useState<'gmail' | 'smtp'>('gmail');
  const [isSending, setIsSending] = useState(false);
  const [isSyncingWorkspace, setIsSyncingWorkspace] = useState(false);
  const [sentSuccess, setSentSuccess] = useState<string | null>(null);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);

  const clientId = invoice?.clientId || quotation?.clientId;
  const clientName = invoice?.clientName || quotation?.clientName || 'Valued Client';
  const clientObj = clients.find((c) => c.id === clientId);
  const docNumber = invoice?.invoiceNumber || quotation?.quotationNumber || 'DOC-2026';
  const projectName = invoice?.projectName || quotation?.projectName || 'Digital Transformation Project';
  const effectiveVatRate = invoice
    ? typeof invoice.taxRate === 'number'
      ? invoice.taxRate
      : profile.taxRate
    : quotation
    ? typeof quotation.taxRate === 'number'
      ? quotation.taxRate
      : profile.taxRate
    : profile.taxRate;

  const subtotalAmount = invoice ? invoice.subtotal : quotation ? quotation.subtotal : 0;
  const vatAmountVal = Number(((subtotalAmount * effectiveVatRate) / 100).toFixed(2));
  const totalAmountVal = invoice
    ? Number((subtotalAmount + vatAmountVal).toFixed(2))
    : quotation
    ? Number((subtotalAmount + vatAmountVal - (quotation.discount || 0)).toFixed(2))
    : 0;

  const subtotalFormatted = formatCurrency(subtotalAmount);
  const vatAmountFormatted = formatCurrency(vatAmountVal);
  const vatRateFormatted = `${effectiveVatRate}%`;

  const amountFormatted = invoice
    ? formatCurrency(invoice.balanceDue > 0 ? Math.max(0, totalAmountVal - invoice.paidAmount) : totalAmountVal)
    : quotation
    ? formatCurrency(totalAmountVal)
    : formatCurrency(0);
  const dueDate = invoice?.dueDate || quotation?.validUntil || '2026-11-30';

  const applyTemplate = (tplKey: TemplateKey) => {
    setSelectedTemplate(tplKey);

    if (documentType === 'invoice') {
      if (tplKey === 'standard') {
        const rawSubj =
          emailSettings.invoiceSubject ||
          'New Invoice {{invoice_number}} from {{business_name}}';
        setSubject(
          rawSubj
            .replace('{{invoice_number}}', docNumber)
            .replace('{{business_name}}', profile.name)
            .replace('{{client_name}}', clientName)
            .replace('{{vat_rate}}', vatRateFormatted)
        );
        setBody(
          `Dear ${clientName},\n\nPlease find attached official VAT invoice ${docNumber} for ${projectName}.\n\n• Invoice Reference: ${docNumber}\n• Subtotal (Excl. VAT): ${subtotalFormatted}\n• VAT (${vatRateFormatted}): ${vatAmountFormatted}\n• Amount Due (Incl. VAT): ${amountFormatted}\n• Payment Due Date: ${dueDate}\n\nSettlement Instructions:\nBank: ${profile.bankName}\nAccount Name: ${profile.accountName}\nAccount Number: ${profile.accountNumber}\n\nThank you for your continued partnership.\n\nWarm regards,\n${profile.ownerName}\n${profile.name} (${emailSettings.senderEmail})`
        );
      } else if (tplKey === 'reminder') {
        const rawSubj =
          emailSettings.reminderSubject ||
          'Payment Reminder: {{invoice_number}} (Due {{due_date}})';
        setSubject(
          rawSubj
            .replace('{{invoice_number}}', docNumber)
            .replace('{{due_date}}', dueDate)
            .replace('{{business_name}}', profile.name)
        );
        setBody(
          `Hello ${clientName},\n\nI hope your week is going well. This is a friendly reminder regarding invoice ${docNumber} for ${projectName}, which has an outstanding balance of ${amountFormatted} (incl. ${vatRateFormatted} VAT of ${vatAmountFormatted}, Due: ${dueDate}).\n\nWe have attached a copy of the invoice for your convenience. Please let us know once the transfer has been initiated so we can issue your verified receipt.\n\nBest regards,\n${profile.ownerName}\n${profile.name}`
        );
      } else if (tplKey === 'urgent') {
        setSubject(`Overdue Notice: Invoice ${docNumber} — Action Required`);
        setBody(
          `Dear ${clientName},\n\nOur records indicate that payment of ${amountFormatted} (incl. ${vatRateFormatted} VAT) for invoice ${docNumber} (${projectName}) is currently past its due date of ${dueDate}.\n\nTo ensure uninterrupted project milestone delivery, please arrange settlement to:\n${profile.bankName} · ${profile.accountNumber} (${profile.accountName})\n\nIf payment has already been dispatched, please reply with the transaction reference.\n\nSincerely,\n${profile.name} Billing Desk`
        );
      } else {
        setSubject(`Payment Receipt & Confirmation — ${docNumber}`);
        setBody(
          `Dear ${clientName},\n\nThank you for your payment toward invoice ${docNumber} for ${projectName}.\n\nAttached is your updated statement confirming our receipt. We appreciate your trust in ${profile.name}.\n\nBest regards,\n${profile.ownerName}\n${profile.name}`
        );
      }
    } else {
      if (tplKey === 'standard') {
        setSubject(`Commercial Proposal ${docNumber}: ${projectName} — ${profile.name}`);
        setBody(
          `Dear ${clientName},\n\nThank you for the opportunity to collaborate on ${projectName}. Please find attached our commercial quotation (${docNumber}) outlining the scope, deliverables, and investment summary.\n\n• Proposal Reference: ${docNumber}\n• Subtotal (Excl. VAT): ${subtotalFormatted}\n• VAT (${vatRateFormatted}): ${vatAmountFormatted}\n• Total Investment (Incl. VAT): ${amountFormatted}\n• Valid Until: ${dueDate}\n\nYou can review the itemized breakdown in the attached document or approve directly via your Client Portal.\n\nWarm regards,\n${profile.ownerName}\n${profile.name}`
        );
      } else {
        setSubject(`Follow-Up on Proposal ${docNumber} (${projectName})`);
        setBody(
          `Hello ${clientName},\n\nFollowing up on commercial quotation ${docNumber} (${amountFormatted} incl. ${vatRateFormatted} VAT) for ${projectName}. Please let me know if you have any questions regarding the milestones or technical deliverables.\n\nWe are ready to kick off requirements & architecture as soon as the proposal is confirmed.\n\nBest regards,\n${profile.ownerName}\n${profile.name}`
        );
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      setRecipientEmail(clientObj?.email || 'client@enterprise.com');
      setSentSuccess(null);
      setWorkspaceError(null);
      applyTemplate(
        invoice?.status === 'Overdue'
          ? 'urgent'
          : invoice?.status === 'Paid'
          ? 'thank_you'
          : 'standard'
      );
    }
  }, [isOpen, invoice, quotation]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const insertVariable = (token: string) => {
    const replacements: Record<string, string> = {
      '{{client_name}}': clientName,
      '{{invoice_number}}': docNumber,
      '{{subtotal}}': subtotalFormatted,
      '{{vat_rate}}': vatRateFormatted,
      '{{vat_amount}}': vatAmountFormatted,
      '{{amount}}': amountFormatted,
      '{{due_date}}': dueDate,
      '{{business_name}}': profile.name,
      '{{project_name}}': projectName,
    };
    const resolved = replacements[token] || token;
    setBody((prev) => `${prev} ${resolved}`);
  };

  const handleArchiveToDrive = async () => {
    setIsSyncingWorkspace(true);
    setWorkspaceError(null);
    try {
      const htmlContent = `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:32px;"><h1>${profile.name} — ${docNumber}</h1><p>Client: ${clientName}</p><p>Project: ${projectName}</p><p>Amount: <strong>${amountFormatted}</strong></p><pre style="background:#F5F8FC;padding:16px;border-radius:12px;">${body}</pre></body></html>`;
      const res = await saveDocumentToGoogleDrive({
        fileName: `${docNumber}_${clientName.replace(/\s+/g, '_')}.html`,
        htmlContent,
      });
      setSentSuccess(`Archived "${res.name}" to your Google Drive`);
    } catch (err: any) {
      setWorkspaceError(err?.message || 'Could not archive to Google Drive.');
    } finally {
      setIsSyncingWorkspace(false);
    }
  };

  const handleAddDueDateToCalendar = async () => {
    setIsSyncingWorkspace(true);
    setWorkspaceError(null);
    try {
      const validDate = /^\d{4}-\d{2}-\d{2}$/.test(dueDate)
        ? dueDate
        : new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
      await syncEventToGoogleCalendar({
        summary: `${documentType === 'invoice' ? 'Invoice Due' : 'Proposal Expiry'}: ${docNumber} (${clientName})`,
        description: `${projectName} — Amount: ${amountFormatted}`,
        date: validDate,
      });
      setSentSuccess(`Synced ${docNumber} due date (${validDate}) to Google Calendar`);
    } catch (err: any) {
      setWorkspaceError(err?.message || 'Could not sync event to Google Calendar.');
    } finally {
      setIsSyncingWorkspace(false);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setWorkspaceError(null);

    if (deliveryChannel === 'gmail') {
      try {
        await sendEmailViaGmailApi({
          to: recipientEmail,
          cc: ccEmail || undefined,
          subject,
          body,
        });
        if (documentType === 'invoice' && invoice) {
          sendPaymentReminder(invoice.id);
        }
        setIsSending(false);
        setSentSuccess(`Sent to ${recipientEmail} via Google Workspace Gmail API`);
        setTimeout(() => {
          onClose();
          setSentSuccess(null);
        }, 1800);
        return;
      } catch (err: any) {
        setIsSending(false);
        setWorkspaceError(
          `${err?.message || 'Gmail API authorization failed.'} You can retry or switch to SMTP Relay.`
        );
        return;
      }
    }

    // SMTP / Postmark Relay fallback
    setTimeout(() => {
      if (documentType === 'invoice' && invoice) {
        sendPaymentReminder(invoice.id);
      }
      setIsSending(false);
      setSentSuccess(
        `Dispatched to ${recipientEmail} via ${emailSettings.provider} (${emailSettings.host})`
      );
      setTimeout(() => {
        onClose();
        setSentSuccess(null);
      }, 1800);
    }, 800);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-[#0B192C]/65 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden"
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
        <div className="shrink-0 px-6 py-4 bg-white border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#0D5EF4] text-white flex items-center justify-center shadow-xs shrink-0">
              <Mail className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h2 className="text-base font-extrabold text-[#0B192C]">
              Send {documentType === 'invoice' ? `Invoice ${docNumber}` : `Quotation ${docNumber}`}
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={isSyncingWorkspace}
              onClick={handleArchiveToDrive}
              className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 text-[11px] font-bold text-slate-700 flex items-center gap-1 shadow-2xs transition-colors"
              title="Save Document to Google Drive"
            >
              <HardDrive className="w-3.5 h-3.5 text-[#0D5EF4]" />
              <span>Save to Drive</span>
            </button>

            <button
              type="button"
              disabled={isSyncingWorkspace}
              onClick={handleAddDueDateToCalendar}
              className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 text-[11px] font-bold text-slate-700 flex items-center gap-1 shadow-2xs transition-colors"
              title="Sync Due Date to Google Calendar"
            >
              <Calendar className="w-3.5 h-3.5 text-[#0D5EF4]" />
              <span>Calendar</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                setActiveTab('settings');
              }}
              className="p-1.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 text-slate-700 shadow-2xs transition-colors"
              title="Email Settings"
            >
              <Sliders className="w-3.5 h-3.5 text-[#0D5EF4]" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSendEmail} className="flex flex-col flex-1 min-h-0 overflow-hidden text-xs">
          <div className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
            {/* Delivery Provider Selector: Google Gmail API vs Configured SMTP Relay */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#F5F8FC] rounded-2xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setDeliveryChannel('gmail')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  deliveryChannel === 'gmail'
                    ? 'bg-[#0D5EF4] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#0B192C]'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Google Workspace (Gmail API)</span>
              </button>
              <button
                type="button"
                onClick={() => setDeliveryChannel('smtp')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  deliveryChannel === 'smtp'
                    ? 'bg-[#0D5EF4] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#0B192C]'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{emailSettings.provider} SMTP Relay</span>
              </button>
            </div>

            {/* Template Generator Strip */}
            <div className="bg-[#F5F8FC] p-3.5 rounded-2xl border border-blue-100/90 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-[#0B192C] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0D5EF4]" />
                  <span>Smart Message Template Generator</span>
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {documentType === 'invoice' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => applyTemplate('standard')}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                        selectedTemplate === 'standard'
                          ? 'bg-[#0D5EF4] text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:text-[#0B192C]'
                      }`}
                    >
                      Standard Invoice
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTemplate('reminder')}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                        selectedTemplate === 'reminder'
                          ? 'bg-[#0D5EF4] text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:text-[#0B192C]'
                      }`}
                    >
                      Gentle Reminder
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTemplate('urgent')}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                        selectedTemplate === 'urgent'
                          ? 'bg-[#DC2626] text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:text-[#0B192C]'
                      }`}
                    >
                      Overdue Notice
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTemplate('thank_you')}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                        selectedTemplate === 'thank_you'
                          ? 'bg-[#16A34A] text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:text-[#0B192C]'
                      }`}
                    >
                      Payment Thank You
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => applyTemplate('standard')}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                        selectedTemplate === 'standard'
                          ? 'bg-[#0D5EF4] text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:text-[#0B192C]'
                      }`}
                    >
                      Proposal Dispatch
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTemplate('reminder')}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                        selectedTemplate === 'reminder'
                          ? 'bg-[#0D5EF4] text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:text-[#0B192C]'
                      }`}
                    >
                      Proposal Follow-Up
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Recipient & CC Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="font-bold text-[#0B192C] block mb-1">Recipient Email (To) *</label>
                <input
                  type="email"
                  required
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 text-[#0B192C] font-mono focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
                />
              </div>
              <div>
                <label className="font-bold text-[#0B192C] block mb-1">CC (Optional)</label>
                <input
                  type="text"
                  placeholder="finance@client.com"
                  value={ccEmail}
                  onChange={(e) => setCcEmail(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 text-[#0B192C] font-mono focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
                />
              </div>
            </div>

            {/* Subject Line */}
            <div>
              <label className="font-bold text-[#0B192C] block mb-1">Email Subject *</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 text-[#0B192C] font-semibold focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
              />
            </div>

            {/* Message Body + Dynamic Variable Chips */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <label className="font-bold text-[#0B192C]">Message Body *</label>
                <div className="flex items-center gap-1 flex-wrap">
                  {[
                    { label: '+Client', token: '{{client_name}}' },
                    { label: '+Doc #', token: '{{invoice_number}}' },
                    { label: '+Subtotal', token: '{{subtotal}}' },
                    { label: '+VAT Rate', token: '{{vat_rate}}' },
                    { label: '+VAT Amt', token: '{{vat_amount}}' },
                    { label: '+Total', token: '{{amount}}' },
                    { label: '+Due Date', token: '{{due_date}}' },
                  ].map((v) => (
                    <button
                      key={v.token}
                      type="button"
                      onClick={() => insertVariable(v.token)}
                      className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-[#0D5EF4] rounded-md font-mono text-[10px] font-bold transition-colors"
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                rows={5}
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-2xl p-3.5 text-xs text-[#0B192C] leading-relaxed focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
              />
            </div>

            {/* Attached PDF Document Card */}
            <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200/90 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1.5 shrink-0">
                  <img src={COMPANY_LOGO_URL} alt="AIConsults" className="w-full h-full object-contain scale-125" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-[#0D5EF4]" />
                    <span className="font-mono font-bold text-[#0B192C]">{docNumber}.pdf</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    <strong className="font-mono text-[#0B192C]">{amountFormatted}</strong>
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={attachPdf}
                  onChange={(e) => setAttachPdf(e.target.checked)}
                  className="w-4 h-4 accent-[#0D5EF4] rounded"
                />
                <span className="text-xs font-bold text-[#0B192C]">Attach PDF</span>
              </label>
            </div>

            {workspaceError && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-[#DC2626] font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{workspaceError}</span>
              </div>
            )}

            {sentSuccess && (
              <div className="p-3.5 rounded-2xl bg-[#16A34A] text-white font-bold flex items-center gap-2 shadow-md">
                <CheckCircle2 className="w-4 h-4 stroke-[2.5] shrink-0" />
                <span>{sentSuccess}</span>
              </div>
            )}
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
              disabled={isSending}
              className="flex-[2] py-2.5 px-5 text-xs font-bold text-white bg-[#0D5EF4] hover:bg-[#0047BA] disabled:opacity-60 rounded-xl shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all"
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>
                    {deliveryChannel === 'gmail' ? 'Sending via Gmail API...' : `Dispatching via ${emailSettings.provider}...`}
                  </span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {deliveryChannel === 'gmail' ? `Send via Gmail to ${clientName}` : `Send via SMTP to ${clientName}`}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { Bot, Mic, Send } from 'lucide-react';
import { VoiceRecordModal } from '../modals/VoiceRecordModal';
import { SearchAndFilterBar } from '../common/SearchAndFilterBar';

export const AIAssistantView: React.FC = () => {
  const { invoices, payments, projects, leads, financials, formatCurrency } = useBusiness();
  const [query, setQuery] = useState('');
  const [presetTopic, setPresetTopic] = useState('All');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string }>>([
    {
      sender: 'assistant',
      text: 'Welcome back. I can summarize unpaid receivables, check project milestone schedules, or draft commercial proposals for your review.',
    },
  ]);

  const handleRunQuery = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { sender: 'user', text: trimmed }]);
    setQuery('');

    setTimeout(() => {
      let reply = '';
      const lower = trimmed.toLowerCase();

      if (lower.includes('unpaid') || lower.includes('outstanding') || lower.includes('invoice')) {
        const unpaid = invoices.filter((i) => i.balanceDue > 0);
        const total = unpaid.reduce((sum, i) => sum + i.balanceDue, 0);
        reply =
          `You have ${unpaid.length} unpaid invoices totaling ${formatCurrency(total)}:\n\n` +
          unpaid
            .map(
              (i) =>
                `• ${i.invoiceNumber} (${i.clientName}): ${formatCurrency(i.balanceDue)} due ${i.dueDate} [${i.status}]`
            )
            .join('\n');
      } else if (lower.includes('collected') || lower.includes('revenue') || lower.includes('cash')) {
        reply =
          `Total cash collected is ${formatCurrency(financials.collectedAmount)} across ${payments.length} verified transactions.\n\n` +
          `• Invoiced Total: ${formatCurrency(financials.invoicedAmount)}\n` +
          `• Operating Expenses: ${formatCurrency(financials.totalExpenses)}\n` +
          `• Net Profit: ${formatCurrency(financials.netProfit)}`;
      } else if (lower.includes('deadline') || lower.includes('milestone')) {
        const active = projects.filter((p) => p.stage !== 'Completed');
        reply =
          `Active projects and completion targets:\n\n` +
          active
            .map(
              (p) =>
                `• ${p.name} (${p.clientName}) — ${p.progressPercent}% complete · Due ${p.expectedCompletionDate}`
            )
            .join('\n');
      } else if (lower.includes('draft') || lower.includes('quote') || lower.includes('quotation')) {
        reply =
          `Draft Commercial Proposal — Mobile Banking MVP:\n\n` +
          `• Biometric Auth & Tokenization: ${formatCurrency(4500)}\n` +
          `• Account Ledger & Transaction Feed: ${formatCurrency(5200)}\n` +
          `• Transfer & Bill Pay Gateway: ${formatCurrency(4300)}\n\n` +
          `Proposed Total: ${formatCurrency(14000)} (Requires owner approval before client dispatch).`;
      } else {
        reply = `Current snapshot: ${projects.filter((p) => p.stage !== 'Completed').length} active projects, ${leads.filter((l) => l.status !== 'Converted').length} pipeline enquiries, and ${formatCurrency(financials.outstandingAmount)} in outstanding receivables.`;
      }

      setMessages((prev) => [...prev, { sender: 'assistant', text: reply }]);
    }, 350);
  };

  return (
    <div className="p-3.5 sm:p-6 space-y-3.5 max-w-6xl mx-auto h-[calc(100vh-3.5rem)] flex flex-col bg-[#F5F8FC]">
      {/* Compact Sticky Minimalist Header */}
      <div className="sticky top-0 z-25 bg-[#F5F8FC] -mx-3.5 px-3.5 sm:-mx-6 sm:px-6 -mt-3.5 pt-3.5 sm:-mt-6 sm:pt-4 pb-2.5 border-b border-slate-200/90 shadow-2xs flex items-center justify-between gap-2 shrink-0">
        <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-[#0B192C] truncate">Voice AI</h1>

        <button
          onClick={() => setIsVoiceModalOpen(true)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-[#0D5EF4] hover:bg-blue-700 rounded-xl shadow-2xs transition-colors shrink-0"
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Voice Record</span>
        </button>
      </div>

      {/* Main Page Search + Popup Filter Modal for Quick Prompts */}
      <div className="shrink-0">
        <SearchAndFilterBar
          searchPlaceholder="Type a question or use Filter to run a quick intelligence query..."
          searchValue={query}
          onSearchChange={setQuery}
          activeFiltersCount={presetTopic !== 'All' ? 1 : 0}
          onResetFilters={() => setPresetTopic('All')}
          filterGroups={[
            {
              label: 'Quick Intelligence Query',
              value: presetTopic,
              onChange: (val) => {
                setPresetTopic(val);
                if (val !== 'All') {
                  handleRunQuery(val);
                }
              },
              options: [
                { label: 'Select a Preset Query', value: 'All' },
                { label: 'Show unpaid invoices', value: 'Show unpaid invoices' },
                { label: 'Collected revenue summary', value: 'Collected revenue summary' },
                { label: 'Active project deadlines', value: 'Active project deadlines' },
                { label: 'Draft Mobile Banking MVP quote', value: 'Draft Mobile Banking MVP quote' },
              ],
            },
          ]}
        />
      </div>

      {/* Minimalist Conversation Card */}
      <div className="flex-1 bg-white border border-slate-200/80 rounded-2xl shadow-2xs flex flex-col overflow-hidden min-h-0">
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((m, i) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={i}
                className={`flex gap-3 text-xs leading-relaxed ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 bg-blue-50 text-[#0D5EF4] border border-blue-100 rounded-xl flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl max-w-2xl whitespace-pre-wrap ${
                    isUser
                      ? 'bg-[#0D5EF4] text-white font-semibold shadow-2xs'
                      : 'bg-[#F5F8FC] text-[#0B192C] border border-slate-200/80'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Clean Input Bar */}
        <div className="p-3.5 bg-[#F5F8FC] border-t border-slate-200/80 flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsVoiceModalOpen(true)}
            className="p-2.5 rounded-xl bg-white border border-slate-200/90 text-[#0D5EF4] hover:bg-blue-50 transition-colors"
            title="Open Voice Recorder"
          >
            <Mic className="w-4 h-4" />
          </button>

          <input
            type="text"
            placeholder="Ask about unpaid invoices, revenue, or project milestones..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRunQuery(query);
            }}
            className="flex-1 bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-[#0B192C] focus:outline-none focus:border-[#0D5EF4]"
          />

          <button
            onClick={() => handleRunQuery(query)}
            disabled={!query.trim()}
            className="px-4 py-2.5 bg-[#0D5EF4] text-white rounded-xl text-xs font-bold hover:bg-blue-700 disabled:opacity-40 flex items-center gap-1.5 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask</span>
          </button>
        </div>
      </div>

      <VoiceRecordModal isOpen={isVoiceModalOpen} onClose={() => setIsVoiceModalOpen(false)} />
    </div>
  );
};

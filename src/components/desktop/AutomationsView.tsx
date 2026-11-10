import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { AutomationRule } from '../../types';
import { History, ArrowRight, ArrowLeft, ChevronRight } from 'lucide-react';
import { SearchAndFilterBar } from '../common/SearchAndFilterBar';

export const AutomationsView: React.FC = () => {
  const {
    automationRules,
    automationLogs,
    toggleAutomationRule,
    searchQuery: searchTerm,
    setSearchQuery: setSearchTerm,
  } = useBusiness();
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredRules = automationRules.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.trigger.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'enabled' && r.isEnabled) ||
      (statusFilter === 'paused' && !r.isEnabled);
    return matchesSearch && matchesStatus;
  });

  const activeRule: AutomationRule | null = selectedRuleId
    ? automationRules.find((r) => r.id === selectedRuleId) || null
    : null;

  /* ====================================================================== */
  /* PAGE 2: DEDICATED WORKFLOW RULE DETAIL PAGE                            */
  /* ====================================================================== */
  if (activeRule) {
    const ruleLogs = automationLogs.filter((l) => l.ruleName === activeRule.name);

    return (
      <div className="p-3.5 sm:p-6 space-y-4 max-w-5xl mx-auto min-h-full flex flex-col">
        <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5 shrink-0">
          <button
            onClick={() => setSelectedRuleId(null)}
            className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-[#0B192C] px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <button
            onClick={() => toggleAutomationRule(activeRule.id)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors shrink-0 ${
              activeRule.isEnabled
                ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200'
                : 'bg-[#0D5EF4] text-white hover:bg-blue-700'
            }`}
          >
            {activeRule.isEnabled ? 'Active (Pause)' : 'Enable Rule'}
          </button>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h1 className="text-xl font-extrabold text-[#0B192C]">{activeRule.name}</h1>
              <div className="text-xs text-slate-500 mt-0.5">Last executed: {activeRule.lastRun || 'Never'}</div>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                activeRule.isEnabled
                  ? 'bg-emerald-50 text-[#16A34A] border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
            >
              {activeRule.isEnabled ? 'Enabled' : 'Paused'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-[#F5F8FC] rounded-xl border border-slate-200/80">
              <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Trigger Event</div>
              <div className="font-bold text-[#0B192C] mt-1">{activeRule.trigger}</div>
            </div>
            <div className="p-4 bg-[#F5F8FC] rounded-xl border border-slate-200/80">
              <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Evaluation Conditions</div>
              <div className="font-bold text-[#0B192C] mt-1">{activeRule.conditions}</div>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Automated Execution Pipeline
            </div>
            <div className="space-y-2">
              {activeRule.actions.map((act, i) => (
                <div
                  key={i}
                  className="p-3 bg-[#F5F8FC] rounded-xl border border-slate-200/80 flex items-center gap-2 text-xs text-[#0B192C] font-medium"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-[#0D5EF4] shrink-0" />
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rule Execution History */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-5">
          <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
            <History className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-bold text-[#0B192C]">Rule Execution History ({ruleLogs.length})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F8FC] border-b border-slate-200 text-slate-500 font-bold">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Trigger Event</th>
                  <th className="py-2.5 px-3">Recipient</th>
                  <th className="py-2.5 px-3">Channel</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ruleLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">{log.timestamp}</td>
                    <td className="py-2.5 px-3 text-slate-600">{log.triggerEvent}</td>
                    <td className="py-2.5 px-3 text-[#0B192C] font-medium">{log.recipient}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{log.channel}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{log.notes}</td>
                  </tr>
                ))}
                {ruleLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No execution logs recorded for this rule yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  /* ====================================================================== */
  /* PAGE 1: MAIN FULL-WIDTH AUTOMATIONS PAGE                               */
  /* ====================================================================== */
  return (
    <div className="p-3.5 sm:p-6 space-y-4 max-w-7xl mx-auto min-h-full flex flex-col">
      {/* Compact Main Page Header */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5 shrink-0">
        <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-[#0B192C] truncate">Automations</h1>
      </div>

      {/* Main Page Search Bar + Filter Modal Button */}
      <SearchAndFilterBar
        placeholder="Search automation rules by name or trigger event..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        modalTitle="Filter Workflows"
        filterGroups={[
          {
            label: 'Workflow Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Workflows', value: 'all' },
              { label: 'Active / Enabled', value: 'enabled' },
              { label: 'Paused', value: 'paused' },
            ],
          },
        ]}
      />

      {/* Full-Width Automation Workflows Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F8FC] border-b border-slate-200/80 text-slate-500 font-bold">
              <tr>
                <th className="py-3.5 px-5">Workflow Rule</th>
                <th className="py-3.5 px-5">Trigger Event</th>
                <th className="py-3.5 px-5">Last Run</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRules.map((rule) => (
                <tr
                  key={rule.id}
                  onClick={() => setSelectedRuleId(rule.id)}
                  className="cursor-pointer hover:bg-slate-50/90 transition-colors group"
                >
                  <td className="py-4 px-5">
                    <div className="font-bold text-sm text-[#0B192C] group-hover:text-[#0D5EF4] transition-colors">
                      {rule.name}
                    </div>
                    <div className="text-[11px] text-slate-400">{rule.actions.length} automated actions</div>
                  </td>
                  <td className="py-4 px-5 text-slate-600">{rule.trigger}</td>
                  <td className="py-4 px-5 font-mono text-[11px] text-slate-500">{rule.lastRun || 'Never'}</td>
                  <td
                    className="py-4 px-5"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rule.isEnabled}
                        onChange={() => toggleAutomationRule(rule.id)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0D5EF4]"></div>
                    </label>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0D5EF4] group-hover:translate-x-0.5 transition-transform">
                      <span>View Rule</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

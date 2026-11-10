import React, { useState, useMemo } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { Project, ProjectStage } from '../../types';
import {
  Plus,
  CheckCircle2,
  Check,
  AlertTriangle,
  Mic,
  Eye,
  Users,
  Receipt,
  Building2,
} from 'lucide-react';
import { VoiceRecordModal } from '../modals/VoiceRecordModal';
import { AddTaskModal } from '../modals/AddTaskModal';
import { SearchAndFilterBar } from '../common/SearchAndFilterBar';
import { DetailViewHeader } from '../common/DetailViewHeader';
import {
  useTableSort,
  SortableTh,
  RowActionsMenu,
  TableSummaryFooter,
} from '../common/TableMechanics';

export const ProjectsView: React.FC = () => {
  const {
    projects,
    invoices,
    updateProjectStage,
    toggleMilestoneStatus,
    toggleTaskStatus,
    reviewChangeRequest,
    formatCurrency,
    searchQuery: searchTerm,
    setSearchQuery: setSearchTerm,
    moduleFilter,
    setModuleFilter,
    selectedRecordIds,
    setSelectedRecordForTab,
    navigateToRecord,
  } = useBusiness();

  const selectedProjectId = selectedRecordIds['projects'] || null;
  const setSelectedProjectId = (id: string | null) => setSelectedRecordForTab('projects', id);

  const selectedProject = selectedProjectId
    ? projects.find((p) => p.id === selectedProjectId) || null
    : null;

  const [activeTab, setActiveTab] = useState<'milestones' | 'tasks' | 'scope' | 'changes'>('milestones');
  const [voiceMilestone, setVoiceMilestone] = useState<{
    projectId: string;
    milestoneId: string;
    title: string;
  } | null>(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  const stages: ProjectStage[] = [
    'Requirements',
    'Planning',
    'Design',
    'Development',
    'Internal Testing',
    'Client Review',
    'Revisions',
    'Deployment',
    'Handover',
    'Completed',
  ];

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.projectType.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStage = moduleFilter === 'all' || p.stage === moduleFilter;
      return matchesSearch && matchesStage;
    });
  }, [projects, searchTerm, moduleFilter]);

  const { sortedItems: sortedProjects, sortConfig, handleSort } = useTableSort<Project>(
    filteredProjects,
    'name',
    'asc'
  );

  // ============================================================================
  // PAGE 2: DEDICATED PROJECT EXECUTION CONSOLE PAGE (Breadcrumbs & Stepper)
  // ============================================================================
  if (selectedProject) {
    const currentIndex = sortedProjects.findIndex((p) => p.id === selectedProject.id);
    const projectInvoices = invoices.filter((i) => i.projectId === selectedProject.id);
    const currentCrumb = {
      tab: 'projects',
      tabLabel: 'Projects',
      recordId: selectedProject.id,
      recordLabel: selectedProject.name,
    };

    return (
      <div className="p-3.5 sm:p-5 space-y-4 max-w-6xl mx-auto min-h-full flex flex-col">
        <DetailViewHeader
          moduleLabel="Projects"
          recordTitle={selectedProject.name}
          onBack={() => setSelectedProjectId(null)}
          currentIndex={currentIndex >= 0 ? currentIndex : 0}
          totalCount={sortedProjects.length}
          onPrev={
            currentIndex > 0
              ? () => setSelectedProjectId(sortedProjects[currentIndex - 1].id)
              : undefined
          }
          onNext={
            currentIndex >= 0 && currentIndex < sortedProjects.length - 1
              ? () => setSelectedProjectId(sortedProjects[currentIndex + 1].id)
              : undefined
          }
        >
          <button
            onClick={() => setIsAddTaskModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-white bg-[#0D5EF4] rounded-xl hover:bg-blue-700 transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </DetailViewHeader>

        {/* Client & Linked Invoices Bar + Stage Selector */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 text-xs">
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() =>
                  navigateToRecord(
                    'clients',
                    selectedProject.clientId,
                    selectedProject.clientName,
                    currentCrumb
                  )
                }
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50/80 border border-blue-200 text-[#0D5EF4] font-bold hover:bg-blue-100 transition-colors"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Client: {selectedProject.clientName}</span>
              </button>

              {projectInvoices.map((inv) => (
                <button
                  key={inv.id}
                  type="button"
                  onClick={() =>
                    navigateToRecord('invoices', inv.id, inv.invoiceNumber, currentCrumb)
                  }
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono font-bold hover:bg-emerald-100 transition-colors"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>
                    {inv.invoiceNumber} ({inv.status})
                  </span>
                </button>
              ))}
            </div>

            <div className="font-mono font-extrabold text-sm text-[#0B192C]">
              Contract: {formatCurrency(selectedProject.contractValue)}
            </div>
          </div>

          {/* Stage Selector + Progress Bar */}
          <div className="p-3.5 bg-[#F5F8FC] rounded-xl border border-slate-200/80 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-bold text-[#0B192C]">Lifecycle Stage</div>
              <select
                value={selectedProject.stage}
                onChange={(e) =>
                  updateProjectStage(selectedProject.id, e.target.value as ProjectStage)
                }
                className="bg-white border border-slate-200 rounded-xl px-3 py-1 text-xs font-bold text-[#0B192C] focus:outline-none focus:border-[#0D5EF4]"
              >
                {stages.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Completion Progress</span>
                <span className="font-mono font-bold text-[#0B192C]">
                  {selectedProject.progressPercent}%
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#0D5EF4] h-full rounded-full transition-all duration-300"
                  style={{ width: `${selectedProject.progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Sub-tabs */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveTab('milestones')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                activeTab === 'milestones'
                  ? 'bg-[#0D5EF4] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-[#0B192C] hover:bg-[#F5F8FC]'
              }`}
            >
              Milestones ({selectedProject.milestones.length})
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                activeTab === 'tasks'
                  ? 'bg-[#0D5EF4] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-[#0B192C] hover:bg-[#F5F8FC]'
              }`}
            >
              Tasks ({selectedProject.tasks.length})
            </button>
            <button
              onClick={() => setActiveTab('scope')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                activeTab === 'scope'
                  ? 'bg-[#0D5EF4] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-[#0B192C] hover:bg-[#F5F8FC]'
              }`}
            >
              Scope &amp; Exclusions
            </button>
            <button
              onClick={() => setActiveTab('changes')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                activeTab === 'changes'
                  ? 'bg-[#0D5EF4] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-[#0B192C] hover:bg-[#F5F8FC]'
              }`}
            >
              Change Requests ({selectedProject.changeRequests.length})
            </button>
          </div>

          {/* Tab 1: Weighted Milestones */}
          {activeTab === 'milestones' && (
            <div className="space-y-2">
              {selectedProject.milestones.map((m) => {
                const isComplete = m.status === 'Completed';
                return (
                  <div
                    key={m.id}
                    className={`p-3 rounded-xl border text-xs transition-colors ${
                      isComplete
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-[#F5F8FC] border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <button
                          onClick={() => toggleMilestoneStatus(selectedProject.id, m.id)}
                          className={`mt-0.5 w-4 h-4 rounded-md flex items-center justify-center border transition-colors ${
                            isComplete
                              ? 'bg-[#16A34A] border-[#16A34A] text-white'
                              : 'border-slate-400 hover:border-[#0B192C] bg-white'
                          }`}
                        >
                          {isComplete && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                        <div>
                          <div
                            className={`font-bold ${
                              isComplete ? 'text-emerald-950 line-through' : 'text-[#0B192C]'
                            }`}
                          >
                            {m.title}
                          </div>
                          <div className="text-slate-500 mt-0.5">{m.description}</div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 space-y-1">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isComplete && (
                            <button
                              type="button"
                              onClick={() =>
                                setVoiceMilestone({
                                  projectId: selectedProject.id,
                                  milestoneId: m.id,
                                  title: m.title,
                                })
                              }
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-blue-50 text-[#0D5EF4] hover:bg-blue-100 border border-blue-200 transition-colors"
                            >
                              <Mic className="w-3 h-3" />
                              <span>Voice</span>
                            </button>
                          )}
                          <span className="font-mono text-[11px] font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-lg">
                            {m.weight}%
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">Due: {m.dueDate}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 2: Tasks */}
          {activeTab === 'tasks' && (
            <div className="space-y-2">
              {selectedProject.tasks.map((t) => {
                const isComplete = t.status === 'Completed';
                return (
                  <div
                    key={t.id}
                    className="p-3 bg-[#F5F8FC] rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => toggleTaskStatus(selectedProject.id, t.id)}
                        className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                          isComplete
                            ? 'bg-[#0D5EF4] border-[#0D5EF4] text-white'
                            : 'border-slate-400 bg-white'
                        }`}
                      >
                        {isComplete && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </button>
                      <span
                        className={
                          isComplete ? 'line-through text-slate-400' : 'font-semibold text-[#0B192C]'
                        }
                      >
                        {t.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                          t.priority === 'High' || t.priority === 'Urgent'
                            ? 'text-rose-700 bg-rose-50 border-rose-200'
                            : 'text-slate-600 bg-white border-slate-200'
                        }`}
                      >
                        {t.priority}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">{t.dueDate}</span>
                    </div>
                  </div>
                );
              })}
              {selectedProject.tasks.length === 0 && (
                <div className="text-slate-400 text-xs py-6 text-center">No tasks recorded yet.</div>
              )}
            </div>
          )}

          {/* Tab 3: Agreed Scope & Exclusions */}
          {activeTab === 'scope' && (
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="font-bold text-[#0B192C] mb-2">Agreed Scope of Work</h3>
                <ul className="space-y-1.5 bg-[#F5F8FC] p-3.5 rounded-xl border border-slate-200">
                  {selectedProject.agreedScope.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-[#0B192C] mb-2">Explicit Scope Exclusions</h3>
                <ul className="space-y-1.5 bg-[#F5F8FC] p-3.5 rounded-xl border border-slate-200">
                  {selectedProject.exclusions.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-600">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Tab 4: Change Requests */}
          {activeTab === 'changes' && (
            <div className="space-y-2.5 text-xs">
              {selectedProject.changeRequests.map((cr) => (
                <div
                  key={cr.id}
                  className="p-3.5 bg-[#F5F8FC] rounded-xl border border-slate-200 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-[#0B192C]">{cr.title}</div>
                      <div className="text-slate-600 mt-0.5">{cr.description}</div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        cr.status === 'Approved'
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                          : cr.status === 'Declined'
                          ? 'text-rose-700 bg-rose-50 border-rose-200'
                          : 'text-amber-700 bg-amber-50 border-amber-200'
                      }`}
                    >
                      {cr.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono">
                    <span>Cost Impact: +{formatCurrency(cr.costImpact)}</span>
                    <span>Timeline Impact: +{cr.timelineImpactDays} days</span>
                    <span>Requested: {cr.requestDate}</span>
                  </div>

                  {cr.status === 'Pending Review' && (
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                      <button
                        onClick={() =>
                          reviewChangeRequest(
                            selectedProject.id,
                            cr.id,
                            false,
                            'Declined due to timeline constraints'
                          )
                        }
                        className="px-3 py-1 text-xs font-bold text-rose-700 bg-rose-50 rounded-lg border border-rose-200 hover:bg-rose-100"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() =>
                          reviewChangeRequest(selectedProject.id, cr.id, true, 'Approved by client')
                        }
                        className="px-3 py-1 text-xs font-bold text-white bg-[#16A34A] rounded-lg hover:bg-emerald-700"
                      >
                        Approve &amp; Update Scope
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {selectedProject.changeRequests.length === 0 && (
                <div className="py-6 text-center text-slate-400">No change requests on file.</div>
              )}
            </div>
          )}
        </div>

        <AddTaskModal
          isOpen={isAddTaskModalOpen}
          onClose={() => setIsAddTaskModalOpen(false)}
          defaultProjectId={selectedProject.id}
        />

        <VoiceRecordModal
          isOpen={!!voiceMilestone}
          onClose={() => setVoiceMilestone(null)}
          targetProjectId={voiceMilestone?.projectId}
          targetMilestoneId={voiceMilestone?.milestoneId}
          targetMilestoneTitle={voiceMilestone?.title}
        />
      </div>
    );
  }

  // ============================================================================
  // PAGE 1: FULL-WIDTH PROJECTS TABLE (True Desktop Table Mechanics)
  // ============================================================================
  const totalContractValue = sortedProjects.reduce((acc, p) => acc + p.contractValue, 0);
  const avgProgress =
    sortedProjects.length > 0
      ? Math.round(
          sortedProjects.reduce((acc, p) => acc + p.progressPercent, 0) / sortedProjects.length
        )
      : 0;

  return (
    <div className="p-3 sm:p-5 flex-1 flex flex-col min-h-0">
      <SearchAndFilterBar
        placeholder="Search projects by name, client, or type..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        modalTitle="Filter Projects"
        filterGroups={[
          {
            label: 'Lifecycle Stage',
            value: moduleFilter,
            onChange: setModuleFilter,
            options: [
              { label: 'All Stages', value: 'all' },
              ...stages.map((st) => ({ label: st, value: st })),
            ],
          },
        ]}
      />

      {/* MOBILE FEED (< sm): Non-overwhelming touch cards */}
      <div className="sm:hidden space-y-2.5 overflow-y-auto flex-1 pb-2">
        {sortedProjects.map((proj) => (
          <div
            key={proj.id}
            onClick={() => setSelectedProjectId(proj.id)}
            className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs active:bg-blue-50/50 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-bold text-sm text-[#0B192C] truncate">{proj.name}</div>
                <div className="text-[11px] text-slate-500 truncate">{proj.clientName}</div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg">
                  {proj.stage}
                </span>
                <RowActionsMenu
                  actions={[
                    {
                      label: 'Open Project',
                      icon: <Eye className="w-3.5 h-3.5" />,
                      onClick: () => setSelectedProjectId(proj.id),
                      variant: 'primary',
                    },
                    {
                      label: 'Add Task',
                      icon: <Plus className="w-3.5 h-3.5" />,
                      onClick: () => {
                        setSelectedProjectId(proj.id);
                        setIsAddTaskModalOpen(true);
                      },
                    },
                    {
                      label: 'Open Client',
                      icon: <Users className="w-3.5 h-3.5" />,
                      onClick: () =>
                        navigateToRecord('clients', proj.clientId, proj.clientName),
                    },
                  ]}
                />
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold text-[#0D5EF4]">
                  {proj.progressPercent}%
                </span>
                <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#0D5EF4] h-full rounded-full"
                    style={{ width: `${proj.progressPercent}%` }}
                  />
                </div>
              </div>
              <span className="font-mono font-bold text-[#0B192C]">
                {formatCurrency(proj.contractValue)}
              </span>
            </div>
          </div>
        ))}
        {sortedProjects.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
            No projects found matching criteria.
          </div>
        )}
      </div>

      {/* DESKTOP DATA TABLE (hidden on mobile, visible on sm and up) */}
      <div className="hidden sm:flex bg-white border border-slate-200/90 rounded-2xl shadow-2xs flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr>
                <SortableTh
                  label="Project & Client"
                  sortKey="name"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTh
                  label="Type"
                  sortKey="projectType"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTh
                  label="Stage"
                  sortKey="stage"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTh
                  label="Contract Value"
                  sortKey="contractValue"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  align="right"
                />
                <SortableTh
                  label="Progress"
                  sortKey="progressPercent"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  align="right"
                />
                <th className="px-4 py-2.5 w-12 sticky top-0 z-10 bg-[#F5F8FC] border-b border-slate-200/90 text-right font-bold text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedProjects.map((proj) => (
                <tr
                  key={proj.id}
                  onClick={() => setSelectedProjectId(proj.id)}
                  className="cursor-pointer hover:bg-blue-50/40 transition-colors group"
                >
                  <td className="py-3 px-4">
                    <div className="font-bold text-xs sm:text-sm text-[#0B192C] group-hover:text-[#0D5EF4] transition-colors">
                      {proj.name}
                    </div>
                    <div className="text-[11px] text-slate-500">{proj.clientName}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{proj.projectType}</td>
                  <td className="py-3 px-4">
                    <span className="inline-block text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-lg">
                      {proj.stage}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#0B192C]">
                    {formatCurrency(proj.contractValue)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="font-mono font-bold text-[#0B192C]">{proj.progressPercent}%</div>
                    <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden ml-auto mt-1">
                      <div
                        className="bg-[#0D5EF4] h-full rounded-full"
                        style={{ width: `${proj.progressPercent}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <RowActionsMenu
                      actions={[
                        {
                          label: 'Open Project',
                          icon: <Eye className="w-3.5 h-3.5" />,
                          onClick: () => setSelectedProjectId(proj.id),
                          variant: 'primary',
                        },
                        {
                          label: 'Add Task',
                          icon: <Plus className="w-3.5 h-3.5" />,
                          onClick: () => {
                            setSelectedProjectId(proj.id);
                            setIsAddTaskModalOpen(true);
                          },
                        },
                        {
                          label: 'Open Client',
                          icon: <Users className="w-3.5 h-3.5" />,
                          onClick: () =>
                            navigateToRecord('clients', proj.clientId, proj.clientName),
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))}
              {sortedProjects.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No projects found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <TableSummaryFooter
          recordCount={sortedProjects.length}
          totalCount={projects.length}
          recordLabel="Projects"
          metrics={[
            { label: 'Avg Progress', value: `${avgProgress}%`, tone: 'primary' },
            { label: 'Total Contracted', value: formatCurrency(totalContractValue), tone: 'emerald' },
          ]}
        />
      </div>
    </div>
  );
};

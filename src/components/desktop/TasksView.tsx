import React, { useState, useMemo } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { Task } from '../../types';
import { Check, FolderKanban, Plus, Eye, Users } from 'lucide-react';
import { SearchAndFilterBar } from '../common/SearchAndFilterBar';
import { AddTaskModal } from '../modals/AddTaskModal';
import { DetailViewHeader } from '../common/DetailViewHeader';
import {
  useTableSort,
  SortableTh,
  RowActionsMenu,
  TableSummaryFooter,
} from '../common/TableMechanics';

type EnrichedTask = Task & { projectName: string; clientName: string; clientId: string };

export const TasksView: React.FC = () => {
  const {
    projects,
    toggleTaskStatus,
    searchQuery: searchTerm,
    setSearchQuery: setSearchTerm,
    moduleFilter: statusFilter,
    setModuleFilter: setStatusFilter,
    selectedRecordIds,
    setSelectedRecordForTab,
    navigateToRecord,
  } = useBusiness();

  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  const selectedTaskId = selectedRecordIds['tasks'] || null;
  const setSelectedTaskId = (id: string | null) => setSelectedRecordForTab('tasks', id);

  const allTasks: EnrichedTask[] = useMemo(() => {
    const list: EnrichedTask[] = [];
    projects.forEach((p) => {
      p.tasks.forEach((t) => {
        list.push({
          ...t,
          projectName: p.name,
          clientName: p.clientName,
          clientId: p.clientId,
        });
      });
    });
    return list;
  }, [projects]);

  const filteredTasks = useMemo(() => {
    return allTasks.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.clientName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      const normalizedFilter = statusFilter.toLowerCase();
      const matchesStatus =
        normalizedFilter === 'all' ||
        (normalizedFilter === 'completed' && t.status === 'Completed') ||
        (normalizedFilter === 'pending' && t.status !== 'Completed');
      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [allTasks, searchTerm, priorityFilter, statusFilter]);

  const { sortedItems: sortedTasks, sortConfig, handleSort } = useTableSort<EnrichedTask>(
    filteredTasks,
    'dueDate',
    'asc'
  );

  const activeTask = selectedTaskId
    ? allTasks.find((t) => t.id === selectedTaskId) || null
    : null;

  /* ====================================================================== */
  /* PAGE 2: DEDICATED TASK DETAIL PAGE                                     */
  /* ====================================================================== */
  if (activeTask) {
    const currentIndex = sortedTasks.findIndex((t) => t.id === activeTask.id);
    const isDone = activeTask.status === 'Completed';
    const currentCrumb = {
      tab: 'tasks',
      tabLabel: 'Tasks',
      recordId: activeTask.id,
      recordLabel: activeTask.title,
    };

    return (
      <div className="p-3.5 sm:p-5 space-y-4 max-w-4xl mx-auto min-h-full flex flex-col">
        <DetailViewHeader
          moduleLabel="Tasks"
          recordTitle={activeTask.title}
          onBack={() => setSelectedTaskId(null)}
          currentIndex={currentIndex >= 0 ? currentIndex : 0}
          totalCount={sortedTasks.length}
          onPrev={
            currentIndex > 0
              ? () => setSelectedTaskId(sortedTasks[currentIndex - 1].id)
              : undefined
          }
          onNext={
            currentIndex >= 0 && currentIndex < sortedTasks.length - 1
              ? () => setSelectedTaskId(sortedTasks[currentIndex + 1].id)
              : undefined
          }
        >
          <button
            onClick={() =>
              navigateToRecord(
                'projects',
                activeTask.projectId,
                activeTask.projectName,
                currentCrumb
              )
            }
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-[#0B192C] bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <FolderKanban className="w-3.5 h-3.5 text-[#0D5EF4]" />
            <span className="hidden sm:inline">Project</span>
          </button>
          <button
            onClick={() => toggleTaskStatus(activeTask.projectId, activeTask.id)}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-xl transition-colors ${
              isDone
                ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200'
                : 'bg-[#0D5EF4] text-white hover:bg-blue-700'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isDone ? 'Completed' : 'Mark Done'}</span>
          </button>
        </DetailViewHeader>

        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs p-5 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <button
                type="button"
                onClick={() =>
                  navigateToRecord(
                    'projects',
                    activeTask.projectId,
                    activeTask.projectName,
                    currentCrumb
                  )
                }
                className="text-[10px] font-bold uppercase tracking-wider text-[#0D5EF4] hover:underline"
              >
                {activeTask.projectName} →
              </button>
              <h1 className="text-lg font-extrabold text-[#0B192C] mt-1">{activeTask.title}</h1>
              <button
                type="button"
                onClick={() =>
                  navigateToRecord(
                    'clients',
                    activeTask.clientId,
                    activeTask.clientName,
                    currentCrumb
                  )
                }
                className="text-xs text-slate-500 hover:text-[#0D5EF4] underline decoration-slate-300 underline-offset-2 mt-0.5 block"
              >
                Client: {activeTask.clientName}
              </button>
            </div>

            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                isDone
                  ? 'bg-emerald-50 text-[#16A34A] border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {activeTask.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 bg-[#F5F8FC] rounded-xl border border-slate-200/80">
              <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                Priority Level
              </div>
              <div className="font-bold text-[#0B192C] mt-1">{activeTask.priority}</div>
            </div>
            <div className="p-3.5 bg-[#F5F8FC] rounded-xl border border-slate-200/80">
              <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                Target Due Date
              </div>
              <div className="font-mono font-bold text-[#0B192C] mt-1">{activeTask.dueDate}</div>
            </div>
            <div className="p-3.5 bg-[#F5F8FC] rounded-xl border border-slate-200/80">
              <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                Assigned Project
              </div>
              <div className="font-bold text-[#0D5EF4] mt-1">{activeTask.projectName}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ====================================================================== */
  /* PAGE 1: MAIN FULL-WIDTH TASKS TABLE (True Desktop Table Mechanics)     */
  /* ====================================================================== */
  const completedCount = sortedTasks.filter((t) => t.status === 'Completed').length;
  const pendingCount = sortedTasks.length - completedCount;

  return (
    <div className="p-3 sm:p-5 flex-1 flex flex-col min-h-0">
      <SearchAndFilterBar
        placeholder="Search tasks, deliverables, or projects..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        modalTitle="Filter Tasks"
        filterGroups={[
          {
            label: 'Completion Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Tasks', value: 'all' },
              { label: 'Pending', value: 'pending' },
              { label: 'Completed', value: 'completed' },
            ],
          },
          {
            label: 'Priority Level',
            value: priorityFilter,
            onChange: setPriorityFilter,
            options: [
              { label: 'All Priorities', value: 'all' },
              { label: 'Urgent', value: 'Urgent' },
              { label: 'High', value: 'High' },
              { label: 'Medium', value: 'Medium' },
              { label: 'Low', value: 'Low' },
            ],
          },
        ]}
      />

      {/* MOBILE FEED (< sm): Non-overwhelming touch cards */}
      <div className="sm:hidden space-y-2.5 overflow-y-auto flex-1 pb-2">
        {sortedTasks.map((task) => {
          const isDone = task.status === 'Completed';
          return (
            <div
              key={task.id}
              onClick={() => setSelectedTaskId(task.id)}
              className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs active:bg-blue-50/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTaskStatus(task.projectId, task.id);
                    }}
                    className={`mt-0.5 w-4 h-4 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                      isDone
                        ? 'bg-[#0D5EF4] border-[#0D5EF4] text-white'
                        : 'border-slate-300 hover:border-[#0D5EF4] bg-white'
                    }`}
                  >
                    {isDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </button>
                  <div className="min-w-0">
                    <div
                      className={`font-bold text-sm truncate ${
                        isDone ? 'line-through text-slate-400' : 'text-[#0B192C]'
                      }`}
                    >
                      {task.title}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {task.projectName} · {task.clientName}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      task.priority === 'High' || task.priority === 'Urgent'
                        ? 'text-rose-700 bg-rose-50 border-rose-200'
                        : 'text-slate-700 bg-slate-100 border-slate-200'
                    }`}
                  >
                    {task.priority}
                  </span>
                  <RowActionsMenu
                    actions={[
                      {
                        label: 'Open Task',
                        icon: <Eye className="w-3.5 h-3.5" />,
                        onClick: () => setSelectedTaskId(task.id),
                        variant: 'primary',
                      },
                      {
                        label: isDone ? 'Mark Pending' : 'Mark Completed',
                        icon: <Check className="w-3.5 h-3.5" />,
                        onClick: () => toggleTaskStatus(task.projectId, task.id),
                      },
                      {
                        label: 'Add New Task',
                        icon: <Plus className="w-3.5 h-3.5" />,
                        onClick: () => setIsAddTaskModalOpen(true),
                      },
                      {
                        label: 'Open Project',
                        icon: <FolderKanban className="w-3.5 h-3.5" />,
                        onClick: () =>
                          navigateToRecord('projects', task.projectId, task.projectName),
                      },
                      {
                        label: 'Open Client',
                        icon: <Users className="w-3.5 h-3.5" />,
                        onClick: () =>
                          navigateToRecord('clients', task.clientId, task.clientName),
                      },
                    ]}
                  />
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-slate-500">Due {task.dueDate}</span>
                <span
                  className={`text-[11px] font-semibold ${
                    isDone ? 'text-emerald-600' : 'text-slate-500'
                  }`}
                >
                  {isDone ? 'Completed' : 'Pending Action'}
                </span>
              </div>
            </div>
          );
        })}
        {sortedTasks.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
            No tasks found matching criteria.
          </div>
        )}
      </div>

      {/* DESKTOP DATA TABLE (hidden on mobile, visible on sm and up) */}
      <div className="hidden sm:flex bg-white border border-slate-200/90 rounded-2xl shadow-2xs flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr>
                <th className="py-2.5 px-4 w-12 sticky top-0 z-10 bg-[#F5F8FC] border-b border-slate-200/90 font-bold text-slate-500">
                  Done
                </th>
                <SortableTh
                  label="Task Deliverable"
                  sortKey="title"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTh
                  label="Project & Client"
                  sortKey="projectName"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTh
                  label="Priority"
                  sortKey="priority"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTh
                  label="Due Date"
                  sortKey="dueDate"
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
              {sortedTasks.map((task) => {
                const isDone = task.status === 'Completed';
                return (
                  <tr
                    key={task.id}
                    onClick={() => setSelectedTaskId(task.id)}
                    className="cursor-pointer hover:bg-blue-50/40 transition-colors group"
                  >
                    <td
                      className="py-3 px-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskStatus(task.projectId, task.id);
                      }}
                    >
                      <button
                        type="button"
                        className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors ${
                          isDone
                            ? 'bg-[#0D5EF4] border-[#0D5EF4] text-white'
                            : 'border-slate-300 hover:border-[#0D5EF4] bg-white'
                        }`}
                      >
                        {isDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-bold text-xs sm:text-sm group-hover:text-[#0D5EF4] transition-colors ${
                          isDone ? 'line-through text-slate-400' : 'text-[#0B192C]'
                        }`}
                      >
                        {task.title}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div className="font-semibold text-[#0B192C]">{task.projectName}</div>
                      <div className="text-[11px] text-slate-400">{task.clientName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border inline-block ${
                          task.priority === 'High' || task.priority === 'Urgent'
                            ? 'text-rose-700 bg-rose-50 border-rose-200'
                            : 'text-slate-700 bg-slate-100 border-slate-200'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600 text-[11px]">
                      {task.dueDate}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <RowActionsMenu
                        actions={[
                          {
                            label: 'Open Task',
                            icon: <Eye className="w-3.5 h-3.5" />,
                            onClick: () => setSelectedTaskId(task.id),
                            variant: 'primary',
                          },
                          {
                            label: isDone ? 'Mark Pending' : 'Mark Completed',
                            icon: <Check className="w-3.5 h-3.5" />,
                            onClick: () => toggleTaskStatus(task.projectId, task.id),
                          },
                          {
                            label: 'Add New Task',
                            icon: <Plus className="w-3.5 h-3.5" />,
                            onClick: () => setIsAddTaskModalOpen(true),
                          },
                          {
                            label: 'Open Project',
                            icon: <FolderKanban className="w-3.5 h-3.5" />,
                            onClick: () =>
                              navigateToRecord('projects', task.projectId, task.projectName),
                          },
                          {
                            label: 'Open Client',
                            icon: <Users className="w-3.5 h-3.5" />,
                            onClick: () =>
                              navigateToRecord('clients', task.clientId, task.clientName),
                          },
                        ]}
                      />
                    </td>
                  </tr>
                );
              })}
              {sortedTasks.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                    No tasks found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <TableSummaryFooter
          recordCount={sortedTasks.length}
          totalCount={allTasks.length}
          recordLabel="Tasks"
          metrics={[
            { label: 'Pending', value: pendingCount, tone: 'amber' },
            { label: 'Completed', value: completedCount, tone: 'emerald' },
          ]}
        />
      </div>

      <AddTaskModal isOpen={isAddTaskModalOpen} onClose={() => setIsAddTaskModalOpen(false)} />
    </div>
  );
};

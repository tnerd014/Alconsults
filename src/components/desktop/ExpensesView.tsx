import React, { useMemo } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { Expense } from '../../types';
import { Printer, CheckCircle2, Eye, FolderGit2, Trash2 } from 'lucide-react';
import { SearchAndFilterBar } from '../common/SearchAndFilterBar';
import { DetailViewHeader } from '../common/DetailViewHeader';
import {
  useTableSort,
  SortableTh,
  RowActionsMenu,
  TableSummaryFooter,
} from '../common/TableMechanics';

interface ExpensesViewProps {
  onAddExpense: () => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = () => {
  const {
    expenses,
    deleteExpense,
    formatCurrency,
    searchQuery: searchTerm,
    setSearchQuery: setSearchTerm,
    moduleFilter: categoryFilter,
    setModuleFilter: setCategoryFilter,
    selectedRecordIds,
    setSelectedRecordForTab,
    navigateToRecord,
  } = useBusiness();

  const selectedExpenseId = selectedRecordIds['expenses'] || null;
  const setSelectedExpenseId = (id: string | null) => setSelectedRecordForTab('expenses', id);

  const categories = [
    'Hosting & Servers',
    'Software Subscriptions',
    'Contractor',
    'Domain & SSL',
    'Hardware',
    'Office & Admin',
    'Transport',
  ];

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchesSearch =
        e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.projectName && e.projectName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [expenses, searchTerm, categoryFilter]);

  const { sortedItems: sortedExpenses, sortConfig, handleSort } = useTableSort<Expense>(
    filteredExpenses,
    'date',
    'desc'
  );

  const selectedExpense = selectedExpenseId
    ? expenses.find((e) => e.id === selectedExpenseId) || null
    : null;

  /* ====================================================================== */
  /* PAGE 2: DEDICATED EXPENSE VOUCHER DETAIL PAGE                          */
  /* ====================================================================== */
  if (selectedExpense) {
    const currentIndex = sortedExpenses.findIndex((e) => e.id === selectedExpense.id);
    const currentCrumb = {
      tab: 'expenses',
      tabLabel: 'Expenses',
      recordId: selectedExpense.id,
      recordLabel: selectedExpense.description,
    };

    return (
      <div className="p-3.5 sm:p-5 space-y-4 max-w-4xl mx-auto min-h-full flex flex-col">
        <DetailViewHeader
          moduleLabel="Expenses"
          recordTitle={`${selectedExpense.description} — ${selectedExpense.vendor}`}
          onBack={() => setSelectedExpenseId(null)}
          currentIndex={currentIndex >= 0 ? currentIndex : 0}
          totalCount={sortedExpenses.length}
          onPrev={
            currentIndex > 0
              ? () => setSelectedExpenseId(sortedExpenses[currentIndex - 1].id)
              : undefined
          }
          onNext={
            currentIndex >= 0 && currentIndex < sortedExpenses.length - 1
              ? () => setSelectedExpenseId(sortedExpenses[currentIndex + 1].id)
              : undefined
          }
        >
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-[#0B192C] bg-white hover:bg-slate-50 rounded-xl transition-colors border border-slate-200 shrink-0"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </DetailViewHeader>

        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs p-5 space-y-4">
          {/* Amount Display */}
          <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200/60 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                Total Expenditure
              </div>
              <div className="text-3xl font-extrabold font-mono text-rose-700 mt-0.5">
                {formatCurrency(selectedExpense.amount)}
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-700">
              {selectedExpense.paymentMethod}
            </span>
          </div>

          {/* Expense Specifics */}
          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-100 space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Description &amp; Vendor
              </div>
              <div className="font-bold text-[#0B192C] text-sm">{selectedExpense.description}</div>
              <div className="text-slate-500">
                Payee / Vendor: <strong className="text-[#0B192C]">{selectedExpense.vendor}</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-100 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Accounting Category
                </div>
                <div className="font-bold text-[#0B192C]">{selectedExpense.category}</div>
              </div>
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-100 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Project Allocation
                </div>
                {selectedExpense.projectId ? (
                  <button
                    type="button"
                    onClick={() =>
                      navigateToRecord(
                        'projects',
                        selectedExpense.projectId!,
                        selectedExpense.projectName,
                        currentCrumb
                      )
                    }
                    className="font-bold text-[#0D5EF4] hover:underline text-left"
                  >
                    {selectedExpense.projectName || 'View Project'} →
                  </button>
                ) : (
                  <div className="font-bold text-[#0D5EF4]">
                    {selectedExpense.projectName || 'General Overhead'}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
            <span>Verified expenditure record ({selectedExpense.date}).</span>
          </div>
        </div>
      </div>
    );
  }

  /* ====================================================================== */
  /* PAGE 1: FULL-WIDTH EXPENSES TABLE (True Desktop Table Mechanics)       */
  /* ====================================================================== */
  const totalOutflow = sortedExpenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="p-3 sm:p-5 flex-1 flex flex-col min-h-0">
      <SearchAndFilterBar
        placeholder="Search expenses by vendor, description, or project..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        modalTitle="Filter Expenses"
        filterGroups={[
          {
            label: 'Expense Category',
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: [
              { label: 'All Categories', value: 'all' },
              ...categories.map((cat) => ({ label: cat, value: cat })),
            ],
          },
        ]}
      />

      {/* MOBILE FEED (< sm): Non-overwhelming touch cards */}
      <div className="sm:hidden space-y-2.5 overflow-y-auto flex-1 pb-2">
        {sortedExpenses.map((exp) => (
          <div
            key={exp.id}
            onClick={() => setSelectedExpenseId(exp.id)}
            className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs active:bg-blue-50/50 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-bold text-sm text-[#0B192C] truncate">{exp.description}</div>
                <div className="text-[11px] text-slate-500 truncate">{exp.vendor}</div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                  {exp.category}
                </span>
                <RowActionsMenu
                  actions={[
                    {
                      label: 'Open Voucher',
                      icon: <Eye className="w-3.5 h-3.5" />,
                      onClick: () => setSelectedExpenseId(exp.id),
                      variant: 'primary',
                    },
                    ...(exp.projectId
                      ? [
                          {
                            label: 'Open Project',
                            icon: <FolderGit2 className="w-3.5 h-3.5" />,
                            onClick: () =>
                              navigateToRecord('projects', exp.projectId!, exp.projectName),
                          },
                        ]
                      : []),
                    {
                      label: 'Delete Expense',
                      icon: <Trash2 className="w-3.5 h-3.5" />,
                      onClick: () => deleteExpense(exp.id),
                      variant: 'danger',
                    },
                  ]}
                />
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-mono text-[11px] text-slate-500">{exp.date}</span>
              <span className="font-mono font-bold text-rose-600">
                -{formatCurrency(exp.amount)}
              </span>
            </div>
          </div>
        ))}
        {sortedExpenses.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
            No expenses found matching criteria.
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
                  label="Description & Vendor"
                  sortKey="description"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTh
                  label="Date"
                  sortKey="date"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTh
                  label="Category & Project"
                  sortKey="category"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTh
                  label="Amount"
                  sortKey="amount"
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
              {sortedExpenses.map((exp) => (
                <tr
                  key={exp.id}
                  onClick={() => setSelectedExpenseId(exp.id)}
                  className="cursor-pointer hover:bg-blue-50/40 transition-colors group"
                >
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#0B192C] group-hover:text-[#0D5EF4] transition-colors">
                      {exp.description}
                    </div>
                    <div className="text-[11px] text-slate-500">{exp.vendor}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{exp.date}</td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      {exp.category}
                    </span>
                    {exp.projectName && (
                      <div className="text-[10px] text-[#0D5EF4] font-semibold mt-1 truncate max-w-[180px]">
                        {exp.projectName}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                    -{formatCurrency(exp.amount)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <RowActionsMenu
                      actions={[
                        {
                          label: 'Open Voucher',
                          icon: <Eye className="w-3.5 h-3.5" />,
                          onClick: () => setSelectedExpenseId(exp.id),
                          variant: 'primary',
                        },
                        ...(exp.projectId
                          ? [
                              {
                                label: 'Open Project',
                                icon: <FolderGit2 className="w-3.5 h-3.5" />,
                                onClick: () =>
                                  navigateToRecord('projects', exp.projectId!, exp.projectName),
                              },
                            ]
                          : []),
                        {
                          label: 'Delete Expense',
                          icon: <Trash2 className="w-3.5 h-3.5" />,
                          onClick: () => deleteExpense(exp.id),
                          variant: 'danger',
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))}
              {sortedExpenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No expenses found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <TableSummaryFooter
          recordCount={sortedExpenses.length}
          totalCount={expenses.length}
          recordLabel="Expenses"
          metrics={[
            { label: 'Total Outflow', value: `-${formatCurrency(totalOutflow)}`, tone: 'rose' },
          ]}
        />
      </div>
    </div>
  );
};

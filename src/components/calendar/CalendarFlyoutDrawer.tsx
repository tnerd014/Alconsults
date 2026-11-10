import React, { useState, useEffect, useMemo } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import {
  Calendar as CalendarIcon,
  X,
  Plus,
  RefreshCw,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  FolderGit2,
  FileText,
  CheckSquare,
  AlertCircle,
  Trash2,
  Check,
  ChevronDown,
  UserPlus,
  Filter,
  Menu,
  ArrowLeft,
} from 'lucide-react';
import {
  ConnectedAccount,
  UnifiedCalendarItem,
  getStoredAccounts,
  connectGoogleAccount,
  disconnectGoogleAccount,
  toggleAccountEnabled,
  fetchGoogleCalendarEvents,
  createGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
} from '../../services/googleCalendarService';

type CalendarViewMode = 'month' | 'week' | 'day' | 'schedule';

interface CalendarFlyoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export const CalendarFlyoutDrawer: React.FC<CalendarFlyoutDrawerProps> = ({
  isOpen,
  onClose,
  onOpen,
}) => {
  const {
    invoices,
    projects,
    quotations,
    navigateToRecord,
    formatCurrency,
    formatCompactCurrency,
  } = useBusiness();

  // Multi-account Google state
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [googleEvents, setGoogleEvents] = useState<UnifiedCalendarItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // View state & navigation date
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Real-time minute ticker for iOS/Google "Now Indicator"
  const [nowMinute, setNowMinute] = useState(new Date().getMinutes());
  const [nowHour, setNowHour] = useState(new Date().getHours());

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setNowMinute(now.getMinutes());
      setNowHour(now.getHours());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Sidebar toggle state (desktop & mobile drawer)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Mobile selected day bottom sheet
  const [mobileDaySheetOpen, setMobileDaySheetOpen] = useState(false);

  // Category / Scope Filter Dropdown
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Platform deliverables toggles
  const [showInvoices, setShowInvoices] = useState(true);
  const [showProjects, setShowProjects] = useState(true);
  const [showTasks, setShowTasks] = useState(true);
  const [showQuotations, setShowQuotations] = useState(true);

  // Event inspection dialog
  const [inspectedItem, setInspectedItem] = useState<UnifiedCalendarItem | null>(null);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);

  // Quick Add Event Form state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEventStartTime, setNewEventStartTime] = useState('09:00');
  const [newEventEndTime, setNewEventEndTime] = useState('10:00');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [selectedAccountForAdd, setSelectedAccountForAdd] = useState<string>('');

  // Keyboard escape listener to close modals or calendar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (inspectedItem) {
          setInspectedItem(null);
        } else if (isAddModalOpen) {
          setIsAddModalOpen(false);
        } else if (mobileDaySheetOpen) {
          setMobileDaySheetOpen(false);
        } else if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inspectedItem, isAddModalOpen, mobileDaySheetOpen, isOpen, onClose]);

  // Load connected accounts on mount
  useEffect(() => {
    const stored = getStoredAccounts();
    setAccounts(stored);
    if (stored.length > 0 && !selectedAccountForAdd) {
      setSelectedAccountForAdd(stored[0].email);
    }
  }, []);

  // Sync Google events
  const syncAllCalendars = async (currentAccounts = accounts) => {
    if (currentAccounts.length === 0) {
      setGoogleEvents([]);
      return;
    }

    setIsLoading(true);
    setSyncError(null);
    const allEvents: UnifiedCalendarItem[] = [];

    for (const acc of currentAccounts) {
      if (!acc.enabled) continue;
      try {
        const evs = await fetchGoogleCalendarEvents(acc);
        allEvents.push(...evs);
      } catch (err: any) {
        console.warn(`Failed to sync calendar for ${acc.email}:`, err);
        setSyncError(`Could not sync ${acc.email}. Token may have expired.`);
      }
    }

    setGoogleEvents(allEvents);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      syncAllCalendars();
    }
  }, [isOpen]);

  const handleConnectAccount = async () => {
    try {
      setIsLoading(true);
      setSyncError(null);
      const newAcc = await connectGoogleAccount();
      const updated = getStoredAccounts();
      setAccounts(updated);
      setSelectedAccountForAdd(newAcc.email);
      await syncAllCalendars(updated);
    } catch (err: any) {
      setSyncError(err.message || 'Failed to authenticate Google account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = (email: string) => {
    if (!window.confirm(`Disconnect Google Calendar account (${email})?`)) return;
    const updated = disconnectGoogleAccount(email);
    setAccounts(updated);
    syncAllCalendars(updated);
  };

  const handleToggleAccount = (email: string, enabled: boolean) => {
    const updated = toggleAccountEnabled(email, enabled);
    setAccounts(updated);
    syncAllCalendars(updated);
  };

  // Compile Platform Work Items (Invoices, Projects, Tasks, Quotations)
  const todayDateStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const platformWorkItems: UnifiedCalendarItem[] = useMemo(() => {
    const items: UnifiedCalendarItem[] = [];

    // 1. Invoices
    if (showInvoices) {
      invoices.forEach((inv) => {
        const isPaid = inv.status === 'Paid';
        const isOverdue = !isPaid && inv.dueDate < todayDateStr;

        items.push({
          id: `work-inv-${inv.id}`,
          title: `Invoice: ${inv.invoiceNumber} (${formatCompactCurrency(inv.balanceDue)})`,
          description: `Client: ${inv.clientName}${inv.projectName ? ` · Project: ${inv.projectName}` : ''} · Balance Due: ${formatCurrency(inv.balanceDue)}`,
          startDateTime: inv.dueDate,
          isAllDay: true,
          category: 'invoice-due',
          relatedEntityId: inv.id,
          relatedEntityName: inv.invoiceNumber,
          statusBadge: isPaid ? 'Paid' : isOverdue ? 'Overdue' : 'Due Soon',
          amount: inv.balanceDue,
          sourceAccountColor: isPaid ? '#34C759' : isOverdue ? '#FF3B30' : '#007AFF',
        });
      });
    }

    // 2. Projects & Milestones
    if (showProjects) {
      projects.forEach((proj) => {
        const isCompleted = proj.stage === 'Completed';
        const isOverdue = !isCompleted && proj.expectedCompletionDate < todayDateStr;

        items.push({
          id: `work-proj-${proj.id}`,
          title: `Target: ${proj.name}`,
          description: `Client: ${proj.clientName} · Stage: ${proj.stage} · Progress: ${proj.progressPercent}%`,
          startDateTime: proj.expectedCompletionDate,
          isAllDay: true,
          category: 'project-deadline',
          relatedEntityId: proj.id,
          relatedEntityName: proj.name,
          statusBadge: isCompleted ? 'Completed' : isOverdue ? 'Overdue' : 'Ongoing',
          sourceAccountColor: isCompleted ? '#34C759' : isOverdue ? '#FF3B30' : '#AF52DE',
        });

        proj.milestones.forEach((m) => {
          const mDone = m.status === 'Completed';
          const mOverdue = !mDone && m.dueDate < todayDateStr;
          items.push({
            id: `work-mile-${proj.id}-${m.id}`,
            title: `Milestone: ${m.title}`,
            description: `Project: ${proj.name} · Target: ${m.dueDate}`,
            startDateTime: m.dueDate,
            isAllDay: true,
            category: 'project-deadline',
            relatedEntityId: proj.id,
            relatedEntityName: proj.name,
            statusBadge: mDone ? 'Completed' : mOverdue ? 'Overdue' : 'Milestone',
            sourceAccountColor: mDone ? '#34C759' : mOverdue ? '#FF3B30' : '#AF52DE',
          });
        });
      });
    }

    // 3. Tasks
    if (showTasks) {
      projects.forEach((proj) => {
        proj.tasks.forEach((t) => {
          const tDone = t.status === 'Completed';
          const tOverdue = !tDone && t.dueDate < todayDateStr;
          items.push({
            id: `work-task-${t.id}`,
            title: `Task: ${t.title}`,
            description: `Project: ${proj.name} · Priority: ${t.priority}`,
            startDateTime: t.dueDate,
            isAllDay: true,
            category: 'task-deadline',
            relatedEntityId: proj.id,
            relatedEntityName: proj.name,
            statusBadge: tDone ? 'Completed' : tOverdue ? 'Overdue' : t.priority,
            sourceAccountColor: tDone ? '#34C759' : tOverdue ? '#FF3B30' : '#34C759',
          });
        });
      });
    }

    // 4. Quotations
    if (showQuotations) {
      quotations.forEach((q) => {
        if (q.status === 'Sent' || q.status === 'Draft') {
          const isExpired = q.validUntil < todayDateStr;
          items.push({
            id: `work-quote-${q.id}`,
            title: `Quote Expiry: ${q.quotationNumber}`,
            description: `Client: ${q.clientName} · Value: ${formatCurrency(q.totalAmount)}`,
            startDateTime: q.validUntil,
            isAllDay: true,
            category: 'quotation-expiry',
            relatedEntityId: q.id,
            relatedEntityName: q.quotationNumber,
            statusBadge: isExpired ? 'Expired' : 'Valid Until',
            amount: q.totalAmount,
            sourceAccountColor: isExpired ? '#FF3B30' : '#FF9500',
          });
        }
      });
    }

    return items;
  }, [invoices, projects, quotations, showInvoices, showProjects, showTasks, showQuotations, todayDateStr, formatCurrency, formatCompactCurrency]);

  // Combined & Filtered Items
  const allCalendarItems = useMemo(() => {
    let combined = [...googleEvents, ...platformWorkItems];

    if (categoryFilter === 'invoices') {
      combined = combined.filter((i) => i.category === 'invoice-due');
    } else if (categoryFilter === 'projects') {
      combined = combined.filter((i) => i.category === 'project-deadline');
    } else if (categoryFilter === 'tasks') {
      combined = combined.filter((i) => i.category === 'task-deadline');
    } else if (categoryFilter === 'google') {
      combined = combined.filter((i) => i.category === 'google-event');
    } else if (categoryFilter === 'overdue') {
      combined = combined.filter((i) => i.statusBadge === 'Overdue');
    }

    return combined.sort(
      (a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
    );
  }, [googleEvents, platformWorkItems, categoryFilter]);

  // Count items today for badge
  const todayItemsCount = useMemo(() => {
    return allCalendarItems.filter((i) => i.startDateTime.split('T')[0] === todayDateStr).length;
  }, [allCalendarItems, todayDateStr]);

  // Date Navigation
  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now.toISOString().split('T')[0]);
  };

  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') next.setMonth(next.getMonth() - 1);
    else if (viewMode === 'week') next.setDate(next.getDate() - 7);
    else {
      // Day view: step 1 day back
      next.setDate(next.getDate() - 1);
      setSelectedDate(next.toISOString().split('T')[0]);
    }
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') next.setMonth(next.getMonth() + 1);
    else if (viewMode === 'week') next.setDate(next.getDate() + 7);
    else {
      // Day view: step 1 day forward
      next.setDate(next.getDate() + 1);
      setSelectedDate(next.toISOString().split('T')[0]);
    }
    setCurrentDate(next);
  };

  // Month grid dates
  const monthGridData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: Array<{
      day: number;
      dateStr: string;
      isCurrentMonth: boolean;
      isToday: boolean;
    }> = [];

    // Prev month days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, d);
      const dateStr = prevDate.toISOString().split('T')[0];
      cells.push({
        day: d,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayDateStr,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        day: d,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayDateStr,
      });
    }

    // Next month days (35 or 42 slots)
    const totalSlots = cells.length > 35 ? 42 : 35;
    const remaining = totalSlots - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(year, month + 1, d);
      const dateStr = nextDate.toISOString().split('T')[0];
      cells.push({
        day: d,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayDateStr,
      });
    }

    return cells;
  }, [currentDate, todayDateStr]);

  // Week days
  const weekDays = useMemo(() => {
    const current = new Date(currentDate);
    const day = current.getDay();
    const diff = current.getDate() - day; // start Sun
    const days: Array<{ dayNumber: number; dayName: string; dateStr: string; isToday: boolean }> = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(current.setDate(diff + i));
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        dayNumber: d.getDate(),
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dateStr,
        isToday: dateStr === todayDateStr,
      });
    }
    return days;
  }, [currentDate, todayDateStr]);

  // Map events to date strings
  const itemsByDate = useMemo(() => {
    const map: Record<string, UnifiedCalendarItem[]> = {};
    allCalendarItems.forEach((item) => {
      const dateKey = item.startDateTime.split('T')[0];
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(item);
    });
    return map;
  }, [allCalendarItems]);

  // Handler to click directly into a Day from Month / Week
  const handleSelectDayAndOpenView = (dateStr: string) => {
    setSelectedDate(dateStr);
    setNewEventDate(dateStr);
    setCurrentDate(new Date(dateStr + 'T00:00:00'));
    setViewMode('day');
  };

  // Create event
  const handleConfirmCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim() || !selectedAccountForAdd) return;

    const targetAccount = accounts.find((a) => a.email === selectedAccountForAdd);
    if (!targetAccount) return;

    try {
      setIsLoading(true);
      await createGoogleCalendarEvent({
        account: targetAccount,
        summary: newEventTitle,
        description: newEventDesc,
        startDate: newEventDate,
        startTime: newEventStartTime,
        endTime: newEventEndTime,
      });

      setIsAddModalOpen(false);
      setNewEventTitle('');
      setNewEventDesc('');
      await syncAllCalendars();
    } catch (err: any) {
      alert(`Failed to create calendar event: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete event
  const handleDeleteEvent = async (item: UnifiedCalendarItem) => {
    if (!window.confirm(`Delete "${item.title}" from Google Calendar?`)) return;

    const account = accounts.find((a) => a.email === item.sourceAccountEmail);
    if (!account) return;

    try {
      setIsDeletingEvent(true);
      await deleteGoogleCalendarEvent(account, item.id);
      setInspectedItem(null);
      await syncAllCalendars();
    } catch (err: any) {
      alert(`Failed to delete event: ${err.message}`);
    } finally {
      setIsDeletingEvent(false);
    }
  };

  const headerMonthLabel = useMemo(() => {
    if (viewMode === 'day') {
      return new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [currentDate, viewMode, selectedDate]);

  // Sidebar content component
  const renderSidebarContent = () => (
    <div className="space-y-5">
      {/* 1. Mini Month Datepicker */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-3.5 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-[#1C1C1E] px-1">
          <span>
            {currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </span>
          <div className="flex items-center gap-0.5">
            <button
              onClick={handlePrev}
              className="p-1 hover:bg-slate-100 rounded-full text-[#0D5EF4] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1 hover:bg-slate-100 rounded-full text-[#0D5EF4] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <span key={i} className="text-[#8E8E93] font-bold py-0.5">
              {d}
            </span>
          ))}
          {monthGridData.slice(0, 35).map((cell, idx) => {
            const isSel = cell.dateStr === selectedDate;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectDayAndOpenView(cell.dateStr)}
                className={`h-6 rounded-full text-[10px] font-semibold flex items-center justify-center transition-all ${
                  cell.isToday
                    ? 'bg-[#0D5EF4] text-white font-extrabold shadow-xs'
                    : isSel
                    ? 'bg-blue-100 text-[#0D5EF4] font-bold'
                    : cell.isCurrentMonth
                    ? 'text-[#1C1C1E] hover:bg-slate-100'
                    : 'text-slate-300'
                }`}
                title="Click to view day"
              >
                {cell.day}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. My Calendars Section */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-2 text-[11px] font-bold uppercase tracking-wider text-[#8E8E93]">
          <span>Connected Calendars ({accounts.length})</span>
          <button
            type="button"
            onClick={handleConnectAccount}
            className="text-[#0D5EF4] hover:underline font-semibold flex items-center gap-0.5 text-xs normal-case"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/60 divide-y divide-slate-100 overflow-hidden shadow-xs">
          {accounts.length === 0 ? (
            <div className="p-4 text-center space-y-2">
              <p className="text-xs text-slate-500">No Google accounts linked.</p>
              <button
                type="button"
                onClick={handleConnectAccount}
                className="w-full py-2 bg-[#0D5EF4] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                Connect Google Account
              </button>
            </div>
          ) : (
            accounts.map((acc) => (
              <div
                key={acc.id}
                className="flex items-center justify-between p-3 hover:bg-slate-50 text-xs transition-colors group"
              >
                <label className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={acc.enabled}
                    onChange={(e) => handleToggleAccount(acc.email, e.target.checked)}
                    className="rounded-full border-slate-300 text-[#0D5EF4] focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <span
                    className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                    style={{ backgroundColor: acc.color }}
                  />
                  <div className="min-w-0">
                    <div className="font-semibold text-[#1C1C1E] text-xs truncate">
                      {acc.displayName}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate font-mono">{acc.email}</div>
                  </div>
                </label>

                <button
                  type="button"
                  onClick={() => handleDisconnect(acc.email)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded transition-opacity"
                  title="Disconnect"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. Deliverables Checklist */}
      <div className="space-y-1.5">
        <span className="px-2 text-[11px] font-bold uppercase tracking-wider text-[#8E8E93]">
          Platform Deliverables
        </span>

        <div className="bg-white rounded-2xl border border-slate-200/60 divide-y divide-slate-100 overflow-hidden shadow-xs">
          <label className="flex items-center justify-between p-3 hover:bg-slate-50 cursor-pointer transition-colors">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-[#0D5EF4]" />
              <span className="font-semibold text-xs text-[#1C1C1E]">Invoices Due</span>
            </div>
            <input
              type="checkbox"
              checked={showInvoices}
              onChange={(e) => setShowInvoices(e.target.checked)}
              className="rounded-full border-slate-300 text-[#0D5EF4] focus:ring-0 w-4 h-4 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 hover:bg-slate-50 cursor-pointer transition-colors">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-[#AF52DE]" />
              <span className="font-semibold text-xs text-[#1C1C1E]">Project Milestones</span>
            </div>
            <input
              type="checkbox"
              checked={showProjects}
              onChange={(e) => setShowProjects(e.target.checked)}
              className="rounded-full border-slate-300 text-[#AF52DE] focus:ring-0 w-4 h-4 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 hover:bg-slate-50 cursor-pointer transition-colors">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-[#34C759]" />
              <span className="font-semibold text-xs text-[#1C1C1E]">Tasks Due</span>
            </div>
            <input
              type="checkbox"
              checked={showTasks}
              onChange={(e) => setShowTasks(e.target.checked)}
              className="rounded-full border-slate-300 text-[#34C759] focus:ring-0 w-4 h-4 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 hover:bg-slate-50 cursor-pointer transition-colors">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-[#FF9500]" />
              <span className="font-semibold text-xs text-[#1C1C1E]">Proposal Deadlines</span>
            </div>
            <input
              type="checkbox"
              checked={showQuotations}
              onChange={(e) => setShowQuotations(e.target.checked)}
              className="rounded-full border-slate-300 text-[#FF9500] focus:ring-0 w-4 h-4 cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. MINIMALIST FLOATING CALENDAR BUTTON (Bottom right, never blocking table actions) */}
      {!isOpen && (
        <button
          type="button"
          onClick={onOpen}
          aria-label="Open Calendar"
          className="fixed bottom-20 lg:bottom-6 right-5 lg:right-6 z-40 w-11 h-11 rounded-full bg-white hover:bg-slate-50 text-slate-700 hover:text-[#0D5EF4] border border-slate-200/90 shadow-md hover:shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-108 active:scale-95 group focus:outline-none cursor-pointer"
          title="Open Calendar"
        >
          <div className="relative flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-slate-700 group-hover:text-[#0D5EF4] stroke-[1.8] transition-colors" />

            {/* Subtle notification badge if events today */}
            {todayItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#0D5EF4] text-white text-[9px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                {todayItemsCount}
              </span>
            )}
          </div>

          {/* Minimalist Tooltip on Hover */}
          <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-14 bg-slate-900 text-white text-xs font-semibold px-2.5 py-1 rounded-lg pointer-events-none whitespace-nowrap shadow-md hidden sm:inline-block">
            Calendar
          </span>
        </button>
      )}

      {/* 2. CALENDAR FULL-PAGE EXPERIENCE */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#F2F2F7] text-[#1C1C1E] font-sans overflow-hidden animate-in fade-in duration-200">
          {/* TRANSLUCENT NAVIGATION TOP BAR */}
          <header className="h-16 bg-white/90 backdrop-blur-2xl border-b border-slate-200/70 px-4 sm:px-6 flex items-center justify-between shrink-0 gap-3 z-30 select-none">
            {/* Left Section: Back to Month (if in Day view) / Sidebar toggle, Month Heading, Chevrons, Today */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {viewMode === 'day' ? (
                <button
                  type="button"
                  onClick={() => setViewMode('month')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors active:scale-95 shrink-0"
                >
                  <ArrowLeft className="w-4 h-4 text-[#0D5EF4]" />
                  <span className="hidden sm:inline">Month</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      setMobileDrawerOpen(!mobileDrawerOpen);
                    } else {
                      setIsSidebarOpen(!isSidebarOpen);
                    }
                  }}
                  className="p-2 text-[#0D5EF4] hover:bg-blue-50/60 rounded-full transition-colors shrink-0"
                  title="Sidebar"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}

              {/* Date Heading */}
              <h1 className="text-base sm:text-xl font-black text-[#1C1C1E] tracking-tight truncate">
                {headerMonthLabel}
              </h1>

              {/* Chevrons Navigation */}
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="w-8 h-8 rounded-full hover:bg-slate-200/60 text-[#0D5EF4] flex items-center justify-center transition-colors active:scale-95"
                  title="Previous"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-8 h-8 rounded-full hover:bg-slate-200/60 text-[#0D5EF4] flex items-center justify-center transition-colors active:scale-95"
                  title="Next"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Today Pill */}
              <button
                type="button"
                onClick={handleToday}
                className="px-3 py-1 text-xs font-bold text-[#0D5EF4] bg-blue-50 hover:bg-blue-100 rounded-full transition-colors active:scale-95 shadow-2xs shrink-0"
              >
                Today
              </button>
            </div>

            {/* Center Section: Segmented Switcher */}
            <div className="hidden sm:flex bg-[#767680]/12 p-0.5 rounded-xl border border-black/5 shadow-inner">
              {(['month', 'week', 'day', 'schedule'] as CalendarViewMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                    viewMode === mode
                      ? 'bg-white text-[#1C1C1E] shadow-sm font-bold'
                      : 'text-[#8E8E93] hover:text-[#1C1C1E]'
                  }`}
                >
                  {mode === 'schedule' ? 'List' : mode}
                </button>
              ))}
            </div>

            {/* Right Section: Add Event Button, Scope Filter, Sync, Close */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Category Scope Filter */}
              <div className="relative hidden lg:block">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-200/80 text-[#1C1C1E] rounded-xl text-xs font-semibold focus:outline-none appearance-none pr-7 cursor-pointer shadow-2xs"
                >
                  <option value="all">All Items</option>
                  <option value="invoices">Invoices</option>
                  <option value="projects">Projects</option>
                  <option value="tasks">Tasks</option>
                  <option value="google">Google Events</option>
                  <option value="overdue">Overdue Only</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Plus Action Button */}
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="w-8 h-8 rounded-full bg-[#0D5EF4] hover:bg-blue-600 text-white flex items-center justify-center shadow-sm active:scale-95 transition-all"
                title="New Event"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
              </button>

              {/* Sync Button */}
              <button
                type="button"
                onClick={() => syncAllCalendars()}
                disabled={isLoading}
                className="p-1.5 text-slate-500 hover:text-[#0D5EF4] hover:bg-white rounded-full transition-colors disabled:opacity-50"
                title="Sync Google Calendars"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#0D5EF4]' : ''}`} />
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors active:scale-95"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* SYNC ERROR BANNER */}
          {syncError && (
            <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{syncError}</span>
              </div>
              <button
                type="button"
                onClick={handleConnectAccount}
                className="font-bold text-[#0D5EF4] hover:underline shrink-0 ml-2"
              >
                Reconnect
              </button>
            </div>
          )}

          {/* MAIN WORKSPACE BODY: Sidebar + Main Canvas */}
          <div className="flex-1 flex min-h-0 overflow-hidden relative">
            {/* DESKTOP SIDEBAR */}
            {isSidebarOpen && (
              <aside className="w-68 border-r border-slate-200/70 bg-[#F2F2F7] p-4 overflow-y-auto shrink-0 hidden md:block">
                {renderSidebarContent()}
              </aside>
            )}

            {/* MOBILE OFFCANVAS DRAWER */}
            {mobileDrawerOpen && (
              <div className="fixed inset-0 z-50 md:hidden flex">
                <div
                  className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs"
                  onClick={() => setMobileDrawerOpen(false)}
                />
                <div className="relative w-76 max-w-[85vw] bg-[#F2F2F7] h-full p-4 overflow-y-auto shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                    <span className="font-bold text-[#1C1C1E]">Calendars</span>
                    <button
                      type="button"
                      onClick={() => setMobileDrawerOpen(false)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  {renderSidebarContent()}
                </div>
              </div>
            )}

            {/* CENTER VIEWPORT (Month / Week / Day / List) */}
            <main className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
              {/* 1. MONTH VIEW (With 1-Click Jump Directly Into Any Day) */}
              {viewMode === 'month' && (
                <div className="flex-1 flex flex-col min-h-0 bg-white">
                  {/* Weekday Header */}
                  <div className="grid grid-cols-7 border-b border-slate-200/80 bg-white text-center py-2 text-[11px] font-bold text-[#8E8E93] tracking-wider uppercase shrink-0">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                      <div key={i}>{d}</div>
                    ))}
                  </div>

                  {/* Month Grid Cells (CLICKING ANY DAY JUMPS DIRECTLY INTO DAY VIEW) */}
                  <div className="flex-1 grid grid-cols-7 grid-rows-5 auto-rows-fr divide-x divide-y divide-slate-100 border-b border-slate-100 min-h-0 overflow-hidden">
                    {monthGridData.map((cell, idx) => {
                      const dayEvents = itemsByDate[cell.dateStr] || [];

                      return (
                        <div
                          key={idx}
                          onClick={() => handleSelectDayAndOpenView(cell.dateStr)}
                          className={`p-1 sm:p-2 flex flex-col justify-start overflow-hidden cursor-pointer transition-all hover:bg-blue-50/30 group ${
                            cell.isCurrentMonth
                              ? 'bg-white'
                              : 'bg-slate-50/40 text-[#8E8E93]'
                          }`}
                          title={`View ${cell.dateStr} schedule`}
                        >
                          {/* Day Number Header */}
                          <div className="flex items-center justify-between mb-1 shrink-0">
                            {cell.isToday ? (
                              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#0D5EF4] text-white flex items-center justify-center text-xs font-black shadow-sm">
                                {cell.day}
                              </span>
                            ) : (
                              <span
                                className={`text-xs font-semibold px-1 rounded-full group-hover:text-[#0D5EF4] transition-colors ${
                                  cell.isCurrentMonth ? 'text-[#1C1C1E]' : 'text-slate-400'
                                }`}
                              >
                                {cell.day}
                              </span>
                            )}

                            {/* Subtle "View day" indicator on hover */}
                            <span className="text-[9px] font-bold text-[#0D5EF4] opacity-0 group-hover:opacity-100 transition-opacity hidden lg:inline">
                              View →
                            </span>
                          </div>

                          {/* Desktop Event Chips */}
                          <div className="hidden sm:block space-y-1 overflow-y-auto no-scrollbar flex-1 min-h-0">
                            {dayEvents.slice(0, 3).map((item) => {
                              const isGoogle = item.category === 'google-event';
                              const dotColor = isGoogle
                                ? item.sourceAccountColor || '#0D5EF4'
                                : item.sourceAccountColor || '#0D5EF4';

                              return (
                                <div
                                  key={item.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setInspectedItem(item);
                                  }}
                                  className="px-2 py-0.5 rounded-lg text-[10px] font-semibold text-slate-800 bg-slate-100/90 hover:bg-slate-200 border border-slate-200/60 truncate flex items-center gap-1.5 transition-colors cursor-pointer"
                                  title={`${item.title} — ${item.description || ''}`}
                                >
                                  <span
                                    className="w-1.5 h-1.5 rounded-full shrink-0"
                                    style={{ backgroundColor: dotColor }}
                                  />
                                  <span className="truncate">{item.title}</span>
                                </div>
                              );
                            })}

                            {dayEvents.length > 3 && (
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectDayAndOpenView(cell.dateStr);
                                }}
                                className="text-[10px] font-bold text-[#0D5EF4] hover:underline px-1 cursor-pointer"
                              >
                                +{dayEvents.length - 3} more
                              </div>
                            )}
                          </div>

                          {/* Mobile Dots View */}
                          <div className="sm:hidden flex flex-wrap gap-1 items-center justify-center mt-1">
                            {dayEvents.slice(0, 4).map((item, dIdx) => (
                              <span
                                key={dIdx}
                                className="w-1.5 h-1.5 rounded-full"
                                style={{
                                  backgroundColor: item.sourceAccountColor || '#0D5EF4',
                                }}
                              />
                            ))}
                            {dayEvents.length > 4 && (
                              <span className="text-[8px] text-slate-400 font-mono">+</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. WEEK VIEW (Clicking any day header jumps to that day) */}
              {viewMode === 'week' && (
                <div className="flex-1 flex flex-col h-full min-h-0 overflow-y-auto bg-white">
                  {/* Week Header */}
                  <div className="grid grid-cols-8 border-b border-slate-200/80 bg-white/90 backdrop-blur-md py-2 sticky top-0 z-10 text-center text-xs shrink-0 shadow-2xs">
                    <div className="text-[#8E8E93] font-bold text-[10px]">TIME</div>
                    {weekDays.map((d, i) => (
                      <div
                        key={i}
                        onClick={() => handleSelectDayAndOpenView(d.dateStr)}
                        className="space-y-0.5 cursor-pointer hover:bg-blue-50/50 py-1 rounded-xl transition-colors"
                        title="Click to view full day"
                      >
                        <div className="text-[#8E8E93] font-bold text-[10px] uppercase">
                          {d.dayName}
                        </div>
                        <div
                          className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center font-bold text-xs ${
                            d.isToday ? 'bg-[#0D5EF4] text-white shadow-xs' : 'text-[#1C1C1E]'
                          }`}
                        >
                          {d.dayNumber}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Hourly Grid Rows */}
                  <div className="divide-y divide-slate-100 relative">
                    {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((hour) => {
                      const isNowHour = nowHour === hour;
                      const nowTopPercent = (nowMinute / 60) * 100;

                      return (
                        <div
                          key={hour}
                          className="grid grid-cols-8 min-h-[58px] text-xs divide-x divide-slate-100 relative"
                        >
                          <div className="p-2 text-right font-mono text-[10px] text-[#8E8E93] bg-white">
                            {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                          </div>
                          {weekDays.map((d, i) => {
                            const eventsInHour = (itemsByDate[d.dateStr] || []).filter((item) => {
                              if (item.isAllDay) return hour === 9;
                              const evHour = new Date(item.startDateTime).getHours();
                              return evHour === hour;
                            });

                            return (
                              <div
                                key={i}
                                onClick={() => {
                                  setNewEventDate(d.dateStr);
                                  setNewEventStartTime(`${String(hour).padStart(2, '0')}:00`);
                                  setIsAddModalOpen(true);
                                }}
                                className="p-1 relative hover:bg-blue-50/20 cursor-pointer space-y-1"
                              >
                                {d.isToday && isNowHour && (
                                  <div
                                    className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                                    style={{ top: `${nowTopPercent}%` }}
                                  >
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#0D5EF4] -ml-1 shadow-xs" />
                                    <div className="w-full h-0.5 bg-[#0D5EF4]" />
                                  </div>
                                )}

                                {eventsInHour.map((item) => (
                                  <div
                                    key={item.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setInspectedItem(item);
                                    }}
                                    className="p-1.5 rounded-lg text-[10px] font-semibold text-[#1C1C1E] bg-blue-50/90 border border-blue-200/60 shadow-2xs truncate"
                                  >
                                    {item.title}
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. COMPLETE DAY VIEW (With Full Day Schedule & Deliverables) */}
              {viewMode === 'day' && (
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 max-w-4xl mx-auto w-full bg-white">
                  {/* Day Navigation Banner */}
                  <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-200 gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setViewMode('month')}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4 text-[#0D5EF4]" />
                        <span>All Days</span>
                      </button>

                      <div>
                        <h2 className="text-xl sm:text-2xl font-black text-[#1C1C1E]">
                          {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </h2>
                        <span className="text-xs text-slate-500 font-mono">
                          {(itemsByDate[selectedDate] || []).length} scheduled items
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setNewEventDate(selectedDate);
                        setIsAddModalOpen(true);
                      }}
                      className="px-4 py-2 bg-[#0D5EF4] hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>Add for This Day</span>
                    </button>
                  </div>

                  {/* 1. All-Day Deliverables & Critical Deadlines */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      Deliverables & Critical Deadlines
                    </h3>

                    {(itemsByDate[selectedDate] || []).filter((i) => i.isAllDay).length === 0 ? (
                      <div className="p-3 bg-slate-50 rounded-xl text-slate-400 text-xs text-center border border-dashed border-slate-200">
                        No deliverable deadlines or invoices due on this date.
                      </div>
                    ) : (
                      (itemsByDate[selectedDate] || [])
                        .filter((i) => i.isAllDay)
                        .map((item) => (
                          <div
                            key={item.id}
                            onClick={() => setInspectedItem(item)}
                            className="bg-slate-50 hover:bg-blue-50/50 p-4 rounded-2xl border border-slate-200/80 hover:border-[#0D5EF4] transition-all cursor-pointer flex items-start justify-between gap-3 shadow-2xs group"
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <span
                                className="w-3.5 h-3.5 rounded-full mt-1 shrink-0"
                                style={{
                                  backgroundColor: item.sourceAccountColor || '#0D5EF4',
                                }}
                              />
                              <div className="min-w-0">
                                <div className="font-bold text-sm text-[#1C1C1E] group-hover:text-[#0D5EF4] transition-colors">
                                  {item.title}
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                  {item.description}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white"
                                style={{
                                  backgroundColor: item.sourceAccountColor || '#0D5EF4',
                                }}
                              >
                                {item.statusBadge || 'Scheduled'}
                              </span>
                              <span className="text-xs font-bold text-[#0D5EF4] hidden sm:inline">
                                Details →
                              </span>
                            </div>
                          </div>
                        ))
                    )}
                  </div>

                  {/* 2. Hourly Timeline (8 AM - 8 PM) */}
                  <div className="space-y-2 pt-2">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      Hourly Schedule
                    </h3>

                    <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden">
                      {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((hour) => {
                        const isNowHour =
                          selectedDate === todayDateStr && nowHour === hour;
                        const hourEvents = (itemsByDate[selectedDate] || []).filter((i) => {
                          if (i.isAllDay) return false;
                          const evHour = new Date(i.startDateTime).getHours();
                          return evHour === hour;
                        });

                        return (
                          <div
                            key={hour}
                            onClick={() => {
                              setNewEventDate(selectedDate);
                              setNewEventStartTime(`${String(hour).padStart(2, '0')}:00`);
                              setIsAddModalOpen(true);
                            }}
                            className={`p-3 min-h-[58px] flex items-start gap-4 transition-colors cursor-pointer group ${
                              isNowHour ? 'bg-blue-50/30' : 'hover:bg-slate-50'
                            }`}
                          >
                            <span className="font-mono text-xs font-semibold text-slate-400 w-16 shrink-0 pt-0.5">
                              {hour > 12
                                ? `${hour - 12}:00 PM`
                                : hour === 12
                                ? '12:00 PM'
                                : `${hour}:00 AM`}
                            </span>

                            <div className="flex-1 space-y-1.5 min-w-0">
                              {hourEvents.length === 0 ? (
                                <span className="text-xs text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                  + Click to schedule event
                                </span>
                              ) : (
                                hourEvents.map((item) => (
                                  <div
                                    key={item.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setInspectedItem(item);
                                    }}
                                    className="p-2 rounded-xl text-xs font-semibold text-white shadow-2xs flex items-center justify-between gap-2"
                                    style={{
                                      backgroundColor:
                                        item.sourceAccountColor || '#0D5EF4',
                                    }}
                                  >
                                    <span className="truncate">{item.title}</span>
                                    <span className="text-[10px] opacity-80 shrink-0 font-mono">
                                      {item.startDateTime.split('T')[1]?.slice(0, 5) || ''}
                                    </span>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* 4. LIST VIEW (AGENDA) */}
              {viewMode === 'schedule' && (
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-3xl mx-auto w-full bg-[#F2F2F7]">
                  <div className="flex items-center justify-between pb-2">
                    <h2 className="text-xl font-bold text-[#1C1C1E]">Schedule List</h2>
                    <span className="text-xs font-mono text-slate-500">
                      {allCalendarItems.length} items
                    </span>
                  </div>

                  <div className="space-y-2">
                    {allCalendarItems.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 text-sm">
                        No events found matching current filter.
                      </div>
                    ) : (
                      allCalendarItems.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setInspectedItem(item)}
                          className="bg-white p-4 rounded-2xl border border-slate-200/70 hover:border-[#0D5EF4] transition-all cursor-pointer flex items-start justify-between gap-3 shadow-xs"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="text-center font-mono shrink-0 w-12 py-1 px-1 rounded-xl bg-slate-50 border border-slate-200">
                              <div className="text-[9px] font-bold uppercase text-[#0D5EF4]">
                                {new Date(item.startDateTime).toLocaleDateString('en-US', {
                                  month: 'short',
                                })}
                              </div>
                              <div className="text-sm font-black text-[#1C1C1E]">
                                {new Date(item.startDateTime).getDate()}
                              </div>
                            </div>

                            <div className="min-w-0">
                              <div className="font-bold text-sm text-[#1C1C1E]">{item.title}</div>
                              <div className="text-xs text-slate-500 truncate mt-0.5">
                                {item.description}
                              </div>
                              <div className="text-[11px] font-mono text-slate-400 mt-1">
                                {item.isAllDay ? 'All Day' : item.startDateTime}
                              </div>
                            </div>
                          </div>

                          <span
                            className="text-[10px] font-bold px-2.5 py-0.5 rounded-full text-white shrink-0"
                            style={{
                              backgroundColor: item.sourceAccountColor || '#0D5EF4',
                            }}
                          >
                            {item.statusBadge || 'Deliverable'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </main>
          </div>

          {/* MOBILE DAY BOTTOM SHEET */}
          {mobileDaySheetOpen && (
            <div className="fixed inset-0 z-50 sm:hidden flex flex-col justify-end">
              <div
                className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs"
                onClick={() => setMobileDaySheetOpen(false)}
              />
              <div className="relative bg-white rounded-t-[32px] p-5 shadow-2xl max-h-[75vh] flex flex-col z-10 animate-in slide-in-from-bottom duration-200">
                <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-3" />

                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-base text-[#1C1C1E]">
                      {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {(itemsByDate[selectedDate] || []).length} items scheduled
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileDaySheetOpen(false);
                        setViewMode('day');
                      }}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs font-bold"
                    >
                      Full Day
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileDaySheetOpen(false);
                        setIsAddModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-[#0D5EF4] text-white rounded-full text-xs font-bold"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mt-3 overflow-y-auto">
                  {(itemsByDate[selectedDate] || []).length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      No deliverables or events scheduled for this day.
                    </div>
                  ) : (
                    (itemsByDate[selectedDate] || []).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setMobileDaySheetOpen(false);
                          setInspectedItem(item);
                        }}
                        className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-start justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-[#1C1C1E]">{item.title}</div>
                          <div className="text-[11px] text-slate-500 truncate mt-0.5">
                            {item.description}
                          </div>
                        </div>
                        <span
                          className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white shrink-0"
                          style={{
                            backgroundColor: item.sourceAccountColor || '#0D5EF4',
                          }}
                        >
                          {item.statusBadge || 'Event'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. EVENT INSPECTION SHEET */}
      {inspectedItem && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs"
            onClick={() => setInspectedItem(null)}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200/80 p-5 shadow-2xl space-y-4 z-10 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <span
                  className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full text-white"
                  style={{
                    backgroundColor: inspectedItem.sourceAccountColor || '#0D5EF4',
                  }}
                >
                  {inspectedItem.category === 'google-event'
                    ? inspectedItem.sourceAccountEmail || 'Google Event'
                    : inspectedItem.statusBadge || 'Deliverable'}
                </span>
                <h3 className="font-bold text-base text-[#1C1C1E]">{inspectedItem.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectedItem(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2 text-slate-500 font-mono">
                <Clock className="w-4 h-4 text-[#0D5EF4]" />
                <span>{inspectedItem.startDateTime}</span>
              </div>
              {inspectedItem.description && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed">
                  {inspectedItem.description}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              {inspectedItem.category === 'google-event' ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(inspectedItem)}
                    disabled={isDeletingEvent}
                    className="flex items-center gap-1 text-xs font-bold text-[#FF3B30] hover:text-red-700 px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                  {inspectedItem.htmlLink && (
                    <a
                      href={inspectedItem.htmlLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#0D5EF4] hover:bg-blue-600 px-4 py-2 rounded-full shadow-xs"
                    >
                      <span>Open in Google</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setInspectedItem(null);
                    onClose();
                    if (inspectedItem.category === 'invoice-due') {
                      navigateToRecord(
                        'invoices',
                        inspectedItem.relatedEntityId!,
                        inspectedItem.relatedEntityName
                      );
                    } else if (inspectedItem.category === 'project-deadline') {
                      navigateToRecord(
                        'projects',
                        inspectedItem.relatedEntityId!,
                        inspectedItem.relatedEntityName
                      );
                    }
                  }}
                  className="w-full py-2.5 bg-[#0D5EF4] hover:bg-blue-600 text-white font-bold rounded-full text-xs shadow-xs transition-colors"
                >
                  View Related Deliverable Record →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. NEW EVENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs"
            onClick={() => setIsAddModalOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200/80 p-5 shadow-2xl space-y-4 z-10 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-[#1C1C1E]">New Event</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmCreateEvent} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-[#8E8E93] uppercase">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Client Milestone Review"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-[#1C1C1E] focus:outline-none focus:border-[#0D5EF4]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-[#8E8E93] uppercase">Date</label>
                  <input
                    type="date"
                    required
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full mt-1 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[#1C1C1E]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#8E8E93] uppercase">Start</label>
                  <input
                    type="time"
                    value={newEventStartTime}
                    onChange={(e) => setNewEventStartTime(e.target.value)}
                    className="w-full mt-1 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[#1C1C1E]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#8E8E93] uppercase">End</label>
                  <input
                    type="time"
                    value={newEventEndTime}
                    onChange={(e) => setNewEventEndTime(e.target.value)}
                    className="w-full mt-1 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[#1C1C1E]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#8E8E93] uppercase">
                  Google Calendar Account
                </label>
                <select
                  value={selectedAccountForAdd}
                  onChange={(e) => setSelectedAccountForAdd(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-[#1C1C1E]"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.email}>
                      {a.displayName} ({a.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#8E8E93] uppercase">
                  Description / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Meeting notes..."
                  value={newEventDesc}
                  onChange={(e) => setNewEventDesc(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-normal text-[#1C1C1E]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !newEventTitle.trim()}
                className="w-full py-2.5 bg-[#0D5EF4] hover:bg-blue-600 disabled:opacity-50 text-white font-bold rounded-full shadow-xs transition-all cursor-pointer"
              >
                Add to Calendar
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal } from 'lucide-react';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

export function useTableSort<T>(
  items: T[],
  defaultKey: string = '',
  defaultDirection: SortDirection = 'asc',
  customGetters?: Record<string, (item: T) => string | number>
) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: defaultKey,
    direction: defaultDirection,
  });

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const sortedItems = useMemo(() => {
    if (!sortConfig.key) return items;
    const copy = [...items];
    copy.sort((a, b) => {
      const getter = customGetters?.[sortConfig.key];
      const rawA = getter ? getter(a) : (a as Record<string, unknown>)[sortConfig.key];
      const rawB = getter ? getter(b) : (b as Record<string, unknown>)[sortConfig.key];

      if (typeof rawA === 'number' && typeof rawB === 'number') {
        return sortConfig.direction === 'asc' ? rawA - rawB : rawB - rawA;
      }

      const strA = String(rawA ?? '').toLowerCase();
      const strB = String(rawB ?? '').toLowerCase();
      if (strA < strB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (strA > strB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [items, sortConfig, customGetters]);

  return { sortedItems, sortConfig, handleSort };
}

interface SortableThProps {
  label: string;
  sortKey: string;
  sortConfig: SortConfig;
  onSort: (key: string) => void;
  align?: 'left' | 'right' | 'center';
  className?: string;
}

export const SortableTh: React.FC<SortableThProps> = ({
  label,
  sortKey,
  sortConfig,
  onSort,
  align = 'left',
  className = '',
}) => {
  const isActive = sortConfig.key === sortKey;
  const alignClass =
    align === 'right'
      ? 'justify-end text-right'
      : align === 'center'
      ? 'justify-center text-center'
      : 'justify-start text-left';

  return (
    <th
      onClick={() => onSort(sortKey)}
      className={`px-4 py-2.5 select-none cursor-pointer group hover:bg-slate-100/80 transition-colors sticky top-0 z-10 bg-[#F5F8FC] border-b border-slate-200/90 ${className}`}
    >
      <div className={`inline-flex items-center gap-1.5 w-full ${alignClass}`}>
        <span className={isActive ? 'text-[#0B192C] font-extrabold' : 'text-slate-500 font-bold'}>
          {label}
        </span>
        {isActive ? (
          sortConfig.direction === 'asc' ? (
            <ArrowUp className="w-3 h-3 text-[#0D5EF4] shrink-0" />
          ) : (
            <ArrowDown className="w-3 h-3 text-[#0D5EF4] shrink-0" />
          )
        ) : (
          <ArrowUpDown className="w-3 h-3 text-slate-300 group-hover:text-slate-500 shrink-0 transition-colors" />
        )}
      </div>
    </th>
  );
};

export interface RowActionItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'danger';
}

interface RowActionsMenuProps {
  actions: RowActionItem[];
}

export const RowActionsMenu: React.FC<RowActionsMenuProps> = ({ actions }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div
      ref={menuRef}
      className="relative inline-flex justify-end"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#0B192C] hover:bg-slate-100 transition-colors"
        title="Quick Actions"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-30 w-44 bg-white border border-slate-200/90 rounded-xl shadow-lg py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
          {actions.map((act, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                act.onClick();
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-left font-semibold transition-colors ${
                act.variant === 'danger'
                  ? 'text-rose-600 hover:bg-rose-50'
                  : act.variant === 'primary'
                  ? 'text-[#0D5EF4] hover:bg-blue-50/70 font-bold'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-[#0B192C]'
              }`}
            >
              {act.icon && <span className="shrink-0">{act.icon}</span>}
              <span className="truncate">{act.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export interface SummaryMetric {
  label: string;
  value: string | number;
  tone?: 'default' | 'primary' | 'emerald' | 'amber' | 'rose';
}

interface TableSummaryFooterProps {
  recordCount: number;
  totalCount?: number;
  recordLabel: string;
  metrics?: SummaryMetric[];
}

export const TableSummaryFooter: React.FC<TableSummaryFooterProps> = ({
  recordCount,
  totalCount,
  recordLabel,
  metrics = [],
}) => {
  const toneClass = (tone?: SummaryMetric['tone']) => {
    if (tone === 'primary') return 'text-[#0D5EF4]';
    if (tone === 'emerald') return 'text-emerald-600';
    if (tone === 'amber') return 'text-amber-600';
    if (tone === 'rose') return 'text-rose-600';
    return 'text-[#0B192C]';
  };

  return (
    <div className="sticky bottom-0 z-10 bg-[#F8FAFC] border-t border-slate-200/90 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
      <div className="text-slate-500 font-semibold">
        Showing <span className="font-bold text-[#0B192C] font-mono">{recordCount}</span>
        {typeof totalCount === 'number' && totalCount !== recordCount ? (
          <>
            {' '}
            of <span className="font-bold text-[#0B192C] font-mono">{totalCount}</span>
          </>
        ) : null}{' '}
        {recordLabel}
      </div>

      {metrics.length > 0 && (
        <div className="flex flex-wrap items-center gap-4">
          {metrics.map((m, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="text-slate-400 font-semibold">{m.label}:</span>
              <span className={`font-mono font-bold ${toneClass(m.tone)}`}>{m.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

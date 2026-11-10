import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal, X, Check } from 'lucide-react';

export interface FilterGroup {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
}

export interface SearchAndFilterBarProps {
  placeholder?: string;
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (val: string) => void;
  filterGroups?: FilterGroup[];
  modalTitle?: string;
  activeFiltersCount?: number;
  onResetFilters?: () => void;
}

interface ToolbarContextValue {
  config: SearchAndFilterBarProps | null;
  setConfig: React.Dispatch<React.SetStateAction<SearchAndFilterBarProps | null>>;
  isSearchOpen: boolean;
  setIsSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isFilterModalOpen: boolean;
  setIsFilterModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ToolbarContext = createContext<ToolbarContextValue | null>(null);

export const ToolbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SearchAndFilterBarProps | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  return (
    <ToolbarContext.Provider
      value={{
        config,
        setConfig,
        isSearchOpen,
        setIsSearchOpen,
        isFilterModalOpen,
        setIsFilterModalOpen,
      }}
    >
      {children}
    </ToolbarContext.Provider>
  );
};

export const useToolbar = () => useContext(ToolbarContext);

/**
 * Rendered inside each module view. Syncs the view's search & filter state into the
 * unified top header bar (Mobile & Desktop) so there is zero redundant search/filter row
 * cluttering the page body. Also renders the Filter Modal when triggered from the header.
 */
export const SearchAndFilterBar: React.FC<SearchAndFilterBarProps> = (props) => {
  const toolbar = useToolbar();

  useEffect(() => {
    if (!toolbar) return;
    toolbar.setConfig(props);
  });

  useEffect(() => {
    return () => {
      if (toolbar) {
        toolbar.setConfig(null);
        toolbar.setIsFilterModalOpen(false);
      }
    };
  }, []);

  if (!toolbar) return null;

  const {
    filterGroups = [],
    modalTitle = 'Filter Options',
    onResetFilters,
  } = props;

  const handleResetAll = () => {
    if (onResetFilters) {
      onResetFilters();
      return;
    }
    filterGroups.forEach((g) => {
      const defaultOpt =
        g.options.find((o) => o.value === 'all' || o.value === 'All') || g.options[0];
      if (defaultOpt) {
        g.onChange(defaultOpt.value);
      }
    });
  };

  return (
    <>
      {toolbar.isFilterModalOpen && filterGroups.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Fixed-in-place Modal Header Title */}
            <div className="shrink-0 flex items-center justify-between px-5 py-3.5 bg-white border-b border-slate-200/80">
              <h2 className="text-sm font-extrabold text-[#0B192C] tracking-tight">
                {modalTitle}
              </h2>
              <button
                type="button"
                onClick={() => toolbar.setIsFilterModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Filter Groups Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1 min-h-0 text-xs">
              {filterGroups.map((group, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {group.label}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {group.options.map((opt) => {
                      const isSelected = group.value === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => group.onChange(opt.value)}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl border text-left font-semibold transition-all ${
                            isSelected
                              ? 'bg-blue-50/90 border-[#0D5EF4] text-[#0D5EF4] font-bold shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <span className="truncate pr-2">{opt.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-[#0D5EF4]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Fixed-in-place Bottom Modal Buttons */}
            <div className="shrink-0 px-5 py-3.5 bg-white border-t border-slate-200/80 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleResetAll}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => toolbar.setIsFilterModalOpen(false)}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#0D5EF4] hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/**
 * Compact Search & Filter icon buttons rendered directly inside the Top Header Bar
 * (both Mobile and Desktop). Clicking the Search icon opens the search input;
 * clicking the Filter icon opens the Filter Modal.
 */
export const HeaderSearchAndFilterButtons: React.FC = () => {
  const toolbar = useToolbar();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (toolbar?.isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [toolbar?.isSearchOpen]);

  if (!toolbar || !toolbar.config) return null;

  const {
    placeholder,
    searchPlaceholder,
    searchValue,
    onSearchChange,
    filterGroups = [],
    activeFiltersCount: customActiveFiltersCount,
  } = toolbar.config;

  const isDefaultFilterValue = (v: string, opts: { label: string; value: string }[]) =>
    v === 'all' || v === 'All' || v === '' || (opts.length > 0 && v === opts[0].value);

  const computedActiveFiltersCount = filterGroups.filter(
    (g) => !isDefaultFilterValue(g.value, g.options)
  ).length;

  const activeFiltersCount =
    typeof customActiveFiltersCount === 'number'
      ? customActiveFiltersCount
      : computedActiveFiltersCount;

  const hasSearchText = Boolean(searchValue && searchValue.trim().length > 0);

  return (
    <div className="flex items-center gap-1.5">
      {/* Desktop Inline Expandable Search Input */}
      {(toolbar.isSearchOpen || hasSearchText) && (
        <div className="hidden sm:flex items-center relative w-48 md:w-64 transition-all">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder || searchPlaceholder || 'Search...'}
            className="w-full h-7 bg-[#F5F8FC] border border-slate-200 rounded-lg pl-8 pr-6 text-xs text-[#0B192C] placeholder:text-slate-400 focus:outline-none focus:border-[#0D5EF4] focus:bg-white transition-colors"
          />
          <button
            type="button"
            onClick={() => {
              onSearchChange('');
              toolbar.setIsSearchOpen(false);
            }}
            className="absolute right-1.5 text-slate-400 hover:text-slate-700"
            title="Close search"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Search Icon Button (Mobile & Desktop when collapsed) */}
      <button
        type="button"
        onClick={() => toolbar.setIsSearchOpen((prev) => !prev)}
        className={`h-7 w-7 rounded-lg border flex items-center justify-center transition-colors relative ${
          toolbar.isSearchOpen || hasSearchText
            ? 'bg-blue-50 border-blue-200 text-[#0D5EF4] sm:hidden'
            : 'bg-[#F5F8FC] border-slate-200 text-slate-600 hover:text-[#0B192C] hover:bg-slate-100'
        }`}
        title="Search"
        aria-label="Search"
      >
        <Search className="w-3.5 h-3.5" />
        {hasSearchText && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#0D5EF4]" />
        )}
      </button>

      {/* Filter Modal Icon Button */}
      {filterGroups.length > 0 && (
        <button
          type="button"
          onClick={() => toolbar.setIsFilterModalOpen(true)}
          className={`h-7 px-2 rounded-lg border flex items-center justify-center gap-1 text-[11px] font-bold transition-colors relative ${
            activeFiltersCount > 0
              ? 'bg-blue-50 border-blue-200 text-[#0D5EF4]'
              : 'bg-[#F5F8FC] border-slate-200 text-slate-600 hover:text-[#0B192C] hover:bg-slate-100'
          }`}
          title="Filter"
          aria-label="Filter"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Filter</span>
          {activeFiltersCount > 0 && (
            <span className="px-1 py-0.2 text-[9px] font-extrabold bg-[#0D5EF4] text-white rounded-full leading-none">
              {activeFiltersCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
};

/**
 * Mobile-only expandable search drawer right under the top bar when Search icon is tapped on mobile (< sm)
 */
export const MobileExpandableSearchRow: React.FC = () => {
  const toolbar = useToolbar();
  if (!toolbar || !toolbar.config) return null;

  const { placeholder, searchPlaceholder, searchValue, onSearchChange } = toolbar.config;
  const hasSearchText = Boolean(searchValue && searchValue.trim().length > 0);

  if (!toolbar.isSearchOpen && !hasSearchText) return null;

  return (
    <div className="sm:hidden bg-white border-b border-slate-200/80 px-3.5 py-2 flex items-center gap-2 shrink-0 animate-in slide-in-from-top-1 duration-150">
      <div className="relative flex-1">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2 pointer-events-none" />
        <input
          type="text"
          autoFocus
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder || searchPlaceholder || 'Search...'}
          className="w-full h-7 bg-[#F5F8FC] border border-slate-200 rounded-lg pl-8 pr-7 text-xs text-[#0B192C] placeholder:text-slate-400 focus:outline-none focus:border-[#0D5EF4]"
        />
        {searchValue && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-2 text-slate-400 hover:text-slate-700"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={() => {
          onSearchChange('');
          toolbar.setIsSearchOpen(false);
        }}
        className="text-[11px] font-bold text-slate-500 hover:text-[#0B192C] px-1.5 py-1"
      >
        Done
      </button>
    </div>
  );
};

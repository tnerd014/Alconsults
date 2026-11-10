import React from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';

interface DetailViewHeaderProps {
  moduleLabel: string;
  recordTitle: string;
  onBack: () => void;
  currentIndex?: number;
  totalCount?: number;
  onPrev?: () => void;
  onNext?: () => void;
  children?: React.ReactNode;
}

export const DetailViewHeader: React.FC<DetailViewHeaderProps> = ({
  moduleLabel,
  recordTitle,
  onBack,
  currentIndex,
  totalCount,
  onPrev,
  onNext,
  children,
}) => {
  const { breadcrumbs, navigateToBreadcrumb } = useBusiness();

  const hasStepper =
    typeof currentIndex === 'number' &&
    typeof totalCount === 'number' &&
    totalCount > 0 &&
    currentIndex >= 0;

  return (
    <div className="sticky top-0 z-30 bg-[#F5F8FC] border-b border-slate-200/90 -mt-3.5 pt-3.5 -mx-3.5 px-3.5 sm:-mt-5 sm:pt-5 sm:-mx-5 sm:px-5 pb-3 mb-4 flex items-center justify-between gap-2 shrink-0 shadow-2xs">
      {/* Left: Back Button + Clickable Breadcrumbs */}
      <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#0B192C] hover:border-[#0D5EF4] hover:text-[#0D5EF4] transition-colors shadow-2xs shrink-0"
          title="Back"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Back</span>
        </button>

        {/* Breadcrumb Trail */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs min-w-0 overflow-hidden">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={`${crumb.tab}-${crumb.recordId}-${idx}`}>
              <button
                type="button"
                onClick={() => navigateToBreadcrumb(idx)}
                className="hidden md:inline-flex items-center text-slate-500 hover:text-[#0D5EF4] font-semibold truncate max-w-[130px] transition-colors"
                title={`${crumb.tabLabel}: ${crumb.recordLabel || ''}`}
              >
                {crumb.recordLabel || crumb.tabLabel}
              </button>
              <ChevronRight className="hidden md:inline w-3 h-3 text-slate-300 shrink-0" />
            </React.Fragment>
          ))}

          <button
            type="button"
            onClick={onBack}
            className="hidden sm:inline-flex items-center text-slate-500 hover:text-[#0D5EF4] font-semibold shrink-0 transition-colors"
          >
            {moduleLabel}
          </button>
          <ChevronRight className="hidden sm:inline w-3 h-3 text-slate-300 shrink-0" />

          <span className="font-extrabold text-[#0B192C] truncate max-w-[140px] sm:max-w-[220px] md:max-w-[300px]">
            {recordTitle}
          </span>
        </nav>
      </div>

      {/* Right: Previous / Next Record Stepper + Contextual Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {hasStepper && (
          <div className="inline-flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shadow-2xs shrink-0">
            <button
              type="button"
              onClick={onPrev}
              disabled={!onPrev || currentIndex <= 0}
              className="p-1 rounded-lg text-slate-600 hover:text-[#0B192C] hover:bg-slate-100 disabled:opacity-35 disabled:pointer-events-none transition-colors"
              title="Previous Record"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 text-[11px] font-mono font-bold text-slate-600 select-none">
              {(currentIndex ?? 0) + 1}/{totalCount}
            </span>
            <button
              type="button"
              onClick={onNext}
              disabled={!onNext || currentIndex >= (totalCount ?? 1) - 1}
              className="p-1 rounded-lg text-slate-600 hover:text-[#0B192C] hover:bg-slate-100 disabled:opacity-35 disabled:pointer-events-none transition-colors"
              title="Next Record"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {children}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { Monitor, Smartphone, Globe, RefreshCw, Mic } from 'lucide-react';
import { PlatformView } from '../../types';
import { BrandLogo } from './BrandLogo';
import { VoiceRecordModal } from '../modals/VoiceRecordModal';

export const Header: React.FC = () => {
  const { platformView, setPlatformView, profile, updateProfile, resetToSampleData } = useBusiness();
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  const platformOptions: { id: PlatformView; label: string; icon: React.ReactNode }[] = [
    { id: 'desktop', label: 'Desktop App', icon: <Monitor className="w-3.5 h-3.5" /> },
    { id: 'android', label: 'Android Mobile', icon: <Smartphone className="w-3.5 h-3.5" /> },
    { id: 'portal', label: 'Client Portal', icon: <Globe className="w-3.5 h-3.5" /> },
  ];

  const cycleCurrency = () => {
    const order = [
      { code: 'NGN', symbol: '₦' },
      { code: 'USD', symbol: '$' },
      { code: 'EUR', symbol: '€' },
      { code: 'GBP', symbol: '£' },
    ];
    const idx = order.findIndex((o) => o.code === profile.currency);
    const next = order[(idx + 1) % order.length];
    updateProfile({ ...profile, currency: next.code, currencySymbol: next.symbol });
  };

  return (
    <>
      <header className="h-14 bg-white border-b border-slate-200/80 px-4 md:px-6 flex items-center justify-between gap-4 shrink-0 z-30 shadow-2xs">
        {/* Brand & Wordmark with official AIConsults Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <BrandLogo size="md" showText={true} showTagline={false} logoType="company" />
        </div>

        {/* Center: Platform Switcher (Desktop, Android, Client Portal) */}
        <div className="flex items-center bg-[#F5F8FC] p-1 rounded-xl border border-slate-200/80">
          {platformOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setPlatformView(opt.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                platformView === opt.id
                  ? 'bg-[#0D5EF4] text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-[#0B192C]'
              }`}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>

        {/* Right: Voice Action Trigger, Interactive Currency Switcher & Reset */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Quick Voice Command Button */}
          <button
            onClick={() => setIsVoiceModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0D5EF4] hover:bg-[#0047BA] text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
            title="Voice Transaction or Milestone Update"
          >
            <Mic className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Voice AI</span>
          </button>

          <button
            onClick={cycleCurrency}
            title="Click to switch operating currency (NGN / USD / EUR / GBP)"
            className="text-xs font-mono font-bold text-[#0B192C] border border-slate-200 bg-[#F5F8FC] hover:bg-blue-50 hover:border-blue-200 px-2.5 py-1.5 rounded-xl transition-colors tabular-nums"
          >
            {profile.currency} ({profile.currencySymbol})
          </button>

          <button
            onClick={resetToSampleData}
            title="Reset workspace to baseline state"
            className="p-1.5 text-slate-400 hover:text-[#0B192C] hover:bg-slate-100 rounded-xl transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Voice Action Modal */}
      <VoiceRecordModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
      />
    </>
  );
};

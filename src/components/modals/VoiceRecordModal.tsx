import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { Mic, Square, Check, ArrowRight, RotateCcw } from 'lucide-react';

interface VoiceRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetProjectId?: string;
  targetMilestoneId?: string;
  targetMilestoneTitle?: string;
}

export const VoiceRecordModal: React.FC<VoiceRecordModalProps> = ({
  isOpen,
  onClose,
  targetProjectId,
  targetMilestoneId,
  targetMilestoneTitle,
}) => {
  const { processVoiceCommand, recordVoiceMilestoneUpdate } = useBusiness();

  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [executionResult, setExecutionResult] = useState<{ success: boolean; summary: string } | null>(null);

  const samplePrompts = targetMilestoneTitle
    ? [
        `Completed milestone "${targetMilestoneTitle}", deployed to staging and verified deliverables.`,
        `Finished ${targetMilestoneTitle}, ready for client sign-off.`,
      ]
    : [
        'Record payment of 150,000 from ABC Technologies for INV-2026-003 via Bank Transfer',
        'Mark milestone 2 completed for Commercial Tenant Management Portal',
        'Log expense of 45,000 for cloud server hosting',
      ];

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const startRecording = () => {
    setIsRecording(true);
    setSeconds(0);
    setTranscript('');
    setExecutionResult(null);

    setTimeout(() => {
      setIsRecording((prev) => {
        if (prev) {
          stopRecording();
        }
        return false;
      });
    }, 3500);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setIsTranscribing(true);

    setTimeout(() => {
      setIsTranscribing(false);
      if (targetMilestoneTitle) {
        setTranscript(`Completed milestone "${targetMilestoneTitle}", verified deliverables and signed off.`);
      } else {
        setTranscript('Record payment of 500 dollars from Katherine for invoice INV-2026-003 via Bank Transfer');
      }
    }, 600);
  };

  const handleExecute = () => {
    if (!transcript.trim()) return;

    if (targetProjectId && targetMilestoneId) {
      recordVoiceMilestoneUpdate(targetProjectId, targetMilestoneId, transcript);
      setExecutionResult({
        success: true,
        summary: `Milestone "${targetMilestoneTitle || 'Milestone'}" marked completed.`,
      });
    } else {
      const res = processVoiceCommand(transcript);
      setExecutionResult({
        success: res.success,
        summary: res.summary,
      });
    }

    setTimeout(() => {
      onClose();
      setExecutionResult(null);
      setTranscript('');
      setSeconds(0);
    }, 1600);
  };

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-[#0B192C]/60 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4 z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200/80 rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Native Drag Pill Handle */}
        <button
          type="button"
          onClick={onClose}
          title="Pull down or tap outside to dismiss"
          className="shrink-0 w-full pt-3 pb-1 flex justify-center focus:outline-none group bg-white"
        >
          <span className="w-12 h-1.5 rounded-full bg-slate-300 group-hover:bg-slate-400 transition-colors" />
        </button>

        {/* Fixed-in-place Header */}
        <div className="shrink-0 px-6 pt-2 pb-4 bg-white border-b border-slate-100 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#0D5EF4] text-white flex items-center justify-center shadow-xs shrink-0">
            <Mic className="w-5 h-5 stroke-[2.2]" />
          </div>
          <h2 className="text-base font-extrabold text-[#0B192C] tracking-tight">
            {targetMilestoneTitle ? 'Milestone Voice Note' : 'Voice Transaction'}
          </h2>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-5 text-xs overflow-y-auto flex-1 min-h-0">
          {/* Minimalist Recorder Surface */}
          <div className="p-5 bg-[#F5F8FC] border border-slate-200/80 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isRecording
                      ? 'bg-[#DC2626] animate-ping'
                      : isTranscribing
                      ? 'bg-[#0D5EF4] animate-pulse'
                      : transcript
                      ? 'bg-[#16A34A]'
                      : 'bg-slate-400'
                  }`}
                />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {isRecording
                    ? 'Listening...'
                    : isTranscribing
                    ? 'Processing...'
                    : transcript
                    ? 'Ready to Execute'
                    : 'Microphone Standby'}
                </span>
              </div>
              <div className="text-2xl font-extrabold font-mono text-[#0B192C] tabular-nums">
                {formatTimer(seconds)}
              </div>
            </div>

            {/* Clean Circular Action Button */}
            <div className="flex items-center gap-2">
              {transcript && !isRecording && (
                <button
                  type="button"
                  onClick={() => {
                    setTranscript('');
                    setSeconds(0);
                  }}
                  className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-[#0B192C] flex items-center justify-center transition-colors"
                  title="Reset"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}

              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="px-4 py-3 rounded-xl bg-[#0D5EF4] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-blue-500/20 transition-all active:scale-95"
                >
                  <Mic className="w-4 h-4 stroke-[2.2]" />
                  <span>{transcript ? 'Re-record' : 'Start Speaking'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="px-4 py-3 rounded-xl bg-[#DC2626] hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95"
                >
                  <Square className="w-3.5 h-3.5 fill-white" />
                  <span>Stop</span>
                </button>
              )}
            </div>
          </div>

          {/* Captured or Typed Command Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700">Command Transcript</label>
            </div>
            <textarea
              rows={2}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Tap 'Start Speaking' or select a preset command below..."
              className="w-full bg-[#F5F8FC] border border-slate-200/90 rounded-xl p-3 text-xs text-[#0B192C] font-medium focus:outline-none focus:border-[#0D5EF4] focus:bg-white transition-all"
            />
          </div>

          {/* Minimalist Presets */}
          {!transcript && !isRecording && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Quick Voice Templates
              </div>
              <div className="space-y-1.5">
                {samplePrompts.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setTranscript(p)}
                    className="w-full text-left px-3.5 py-2.5 bg-[#F5F8FC] hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-200 rounded-xl text-[11px] font-medium text-slate-700 transition-colors truncate"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Execution Confirmation */}
          {executionResult && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-[#16A34A] rounded-xl text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 stroke-[2.5] shrink-0" />
              <span>{executionResult.summary}</span>
            </div>
          )}
        </div>

        {/* Fixed-in-place Footer Bar */}
        <div className="shrink-0 px-6 py-4 bg-white border-t border-slate-200/80 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Dismiss
          </button>

          <button
            type="button"
            disabled={!transcript.trim() || !!executionResult}
            onClick={handleExecute}
            className="px-5 py-2.5 text-xs font-bold text-white bg-[#0D5EF4] hover:bg-blue-700 disabled:opacity-40 rounded-xl shadow-sm shadow-blue-500/20 flex items-center gap-1.5 transition-all"
          >
            <span>Apply Command</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};

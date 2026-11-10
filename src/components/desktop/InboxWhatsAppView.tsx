import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { Send, Bot, User, ArrowLeft, ChevronRight, MessageSquare, CheckCheck } from 'lucide-react';
import { SearchAndFilterBar } from '../common/SearchAndFilterBar';

export const InboxWhatsAppView: React.FC = () => {
  const {
    conversations,
    toggleWhatsAppHandover,
    sendWhatsAppMessage,
    searchQuery: searchTerm,
    setSearchQuery: setSearchTerm,
  } = useBusiness();
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [modeFilter, setModeFilter] = useState<string>('all');

  const filteredConversations = conversations.filter((c) => {
    const lastMsg = c.messages[c.messages.length - 1]?.text || '';
    const matchesSearch =
      c.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contactPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lastMsg.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMode =
      modeFilter === 'all' ||
      (modeFilter === 'human' && c.isHumanControlled) ||
      (modeFilter === 'bot' && !c.isHumanControlled);
    return matchesSearch && matchesMode;
  });

  const activeConv = selectedConvId
    ? conversations.find((c) => c.id === selectedConvId) || null
    : null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;
    sendWhatsAppMessage(activeConv.id, inputText, 'human');
    setInputText('');
  };

  const handleSimulateClientMessage = () => {
    const target = activeConv || conversations[0];
    if (!target) return;
    const clientSamples = [
      'Can we schedule the user acceptance walkthrough for Thursday?',
      'Just sent the updated brand assets to your email.',
      'We would like to add push notification capabilities to the mobile app.',
    ];
    const randomMsg = clientSamples[Math.floor(Math.random() * clientSamples.length)];
    sendWhatsAppMessage(target.id, randomMsg, 'client');
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  /* ====================================================================== */
  /* PAGE 2: DEDICATED CONVERSATION THREAD PAGE                             */
  /* ====================================================================== */
  if (activeConv) {
    return (
      <div className="p-3 sm:p-6 space-y-3 max-w-5xl mx-auto h-[calc(100vh-4.5rem)] lg:h-[calc(100vh-3rem)] flex flex-col">
        {/* Compact Top Back Navigation & Handover Controls */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5 shrink-0 bg-transparent">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setSelectedConvId(null)}
              className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-[#0B192C] px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-extrabold text-[#0B192C] truncate">
                {activeConv.contactName}
              </div>
              <div className="text-[10px] text-slate-400 font-mono truncate">
                {activeConv.contactPhone}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleSimulateClientMessage}
              className="px-2.5 py-1.5 text-xs font-bold text-[#0D5EF4] bg-blue-50 border border-blue-200/80 rounded-xl hover:bg-blue-100 transition-colors"
            >
              Simulate
            </button>

            <button
              onClick={() => toggleWhatsAppHandover(activeConv.id)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                activeConv.isHumanControlled
                  ? 'bg-[#0B192C] text-white border-[#0B192C] hover:bg-slate-800'
                  : 'bg-white text-[#0B192C] border-slate-200 hover:bg-slate-50'
              }`}
            >
              {activeConv.isHumanControlled ? (
                <>
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Owner</span>
                </>
              ) : (
                <>
                  <Bot className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span className="hidden sm:inline">Auto Bot</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Full-Page Conversation Thread Container */}
        <div className="flex-1 min-h-0 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex flex-col overflow-hidden">
          <div className="flex-1 p-3.5 sm:p-5 overflow-y-auto space-y-3 bg-[#F5F8FC]/60">
            {activeConv.messages.map((msg) => {
              const isClient = msg.sender === 'client';
              const isBot = msg.sender === 'bot';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isClient ? 'items-start' : 'items-end'}`}
                >
                  <div className="text-[10px] text-slate-400 mb-0.5 px-1 flex items-center gap-1">
                    <span>{msg.senderName}</span>
                    {isBot && <span className="font-mono text-[9px] text-slate-500">(Auto)</span>}
                    <span>·</span>
                    <span className="font-mono">{msg.timestamp}</span>
                  </div>
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] p-3 sm:p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isClient
                        ? 'bg-white text-[#0B192C] border border-slate-200/80 shadow-2xs'
                        : isBot
                        ? 'bg-[#0B192C] text-white'
                        : 'bg-[#0D5EF4] text-white font-medium shadow-2xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reply Box */}
          <form onSubmit={handleSend} className="p-2.5 sm:p-3.5 bg-white border-t border-slate-200/80 flex gap-2">
            <input
              type="text"
              placeholder={
                activeConv.isHumanControlled
                  ? 'Type reply as owner...'
                  : 'Type to reply (bot will stay in auto mode)...'
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-[#F5F8FC] border border-slate-200/90 rounded-xl px-3 py-2 sm:px-3.5 sm:py-2.5 text-xs focus:outline-none focus:border-[#0D5EF4] focus:bg-white"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-[#0D5EF4] text-white rounded-xl text-xs font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ====================================================================== */
  /* PAGE 1: MAIN INBOX THREADS PAGE (Mobile Cards + Desktop Table)         */
  /* ====================================================================== */
  return (
    <div className="p-3.5 sm:p-6 space-y-4 max-w-7xl mx-auto min-h-full flex flex-col">
      {/* Compact Main Page Header & Action Button */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5 shrink-0">
        <div>
          <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-[#0B192C]">
            WhatsApp Inbox
          </h1>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Real-time client conversations, AI bot handover, and live messages
          </p>
        </div>

        <button
          onClick={handleSimulateClientMessage}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-[#0D5EF4] rounded-xl hover:bg-blue-700 shadow-2xs transition-colors shrink-0"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Simulate Client Msg</span>
        </button>
      </div>

      {/* Main Page Search Bar + Filter Modal Button */}
      <SearchAndFilterBar
        placeholder="Search by client name, phone number, or message text..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        modalTitle="Filter Conversations"
        filterGroups={[
          {
            label: 'Routing Mode',
            value: modeFilter,
            onChange: setModeFilter,
            options: [
              { label: 'All Threads', value: 'all' },
              { label: 'Bot Active', value: 'bot' },
              { label: 'Human Control', value: 'human' },
            ],
          },
        ]}
      />

      {/* 1. DEDICATED MOBILE CONVERSATION FEED (Visible on mobile screens < sm) */}
      <div className="sm:hidden space-y-2">
        {filteredConversations.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            No conversations found matching query.
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const lastMsg = conv.messages[conv.messages.length - 1];

            return (
              <div
                key={conv.id}
                onClick={() => setSelectedConvId(conv.id)}
                className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs active:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 relative"
              >
                {/* Contact Avatar Circle with WhatsApp Channel Dot */}
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-xs">
                    {getInitials(conv.contactName)}
                  </div>
                  <span className="w-3 h-3 rounded-full bg-[#25D366] border-2 border-white absolute -bottom-0.5 -right-0.5 shadow-2xs" />
                </div>

                {/* Center Content */}
                <div className="flex-1 min-w-0">
                  {/* Top Line: Contact Name + Timestamp */}
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-extrabold text-xs text-[#0B192C] truncate">
                      {conv.contactName}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {conv.lastMessageTime}
                    </span>
                  </div>

                  {/* Second Line: Phone & Channel */}
                  <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                    {conv.contactPhone}
                  </div>

                  {/* Third Line: Latest Message Snippet */}
                  <div className="text-xs text-slate-600 line-clamp-1 mt-1 font-normal">
                    {lastMsg ? (
                      <span>
                        {lastMsg.sender === 'client' ? '' : 'You: '}
                        {lastMsg.text}
                      </span>
                    ) : (
                      <span className="italic text-slate-400">No messages yet</span>
                    )}
                  </div>

                  {/* Fourth Line: Badges */}
                  <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                        conv.isHumanControlled
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {conv.isHumanControlled ? 'Human Owner' : 'Auto Bot'}
                    </span>

                    <span className="text-[10px] font-bold text-[#0D5EF4] flex items-center gap-0.5">
                      <span>Chat</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 2. DESKTOP FULL-WIDTH CONVERSATIONS TABLE (Hidden on mobile < sm, visible on desktop) */}
      <div className="hidden sm:block bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F8FC] border-b border-slate-200/80 text-slate-500 font-bold">
              <tr>
                <th className="py-3.5 px-5">Contact</th>
                <th className="py-3.5 px-5">Latest Message</th>
                <th className="py-3.5 px-5">Mode</th>
                <th className="py-3.5 px-5">Last Activity</th>
                <th className="py-3.5 px-5 text-right">Open Thread</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredConversations.map((conv) => {
                const lastMsg = conv.messages[conv.messages.length - 1];
                return (
                  <tr
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className="cursor-pointer transition-colors hover:bg-slate-50/90 group"
                  >
                    <td className="py-4 px-5">
                      <div className="font-bold text-sm text-[#0B192C] group-hover:text-[#0D5EF4] transition-colors">
                        {conv.contactName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {conv.contactPhone} · {conv.channel}
                      </div>
                    </td>
                    <td className="py-4 px-5 text-slate-600 max-w-md">
                      <div className="truncate">{lastMsg ? lastMsg.text : 'No messages'}</div>
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          conv.isHumanControlled
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {conv.isHumanControlled ? 'Human Control' : 'Bot Active'}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-mono text-[11px] text-slate-400">
                      {conv.lastMessageTime}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0D5EF4] group-hover:translate-x-0.5 transition-transform">
                        <span>Open Chat</span>
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredConversations.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-slate-400">
                    No conversations found matching query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

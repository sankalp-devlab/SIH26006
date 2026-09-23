/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 27: Mobile Skipper AI Assistant View
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  User,
  Send,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  Plus,
  History,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import { useSkipper } from '../../hooks/useSkipper';
import { MobileBottomSheet } from '../../components/mobile/MobileBottomSheet';
import { SkipperTableArtifact } from '../skipper/components/SkipperTableArtifact';
import { SkipperChartArtifact } from '../skipper/components/SkipperChartArtifact';
import { SkipperMapArtifact } from '../skipper/components/SkipperMapArtifact';

export const MobileSkipperView: React.FC = () => {
  const navigate = useNavigate();
  const {
    sessions,
    activeSession,
    activeSessionId,
    selectSession,
    createNewConsultation,
    deleteSession,
    askQuestion,
    dispatchQuickPrompt,
    quickPrompts,
    isLoading,
    pipelineStage,
  } = useSkipper();

  const [inputVal, setInputVal] = useState('');
  const [isSessionsSheetOpen, setIsSessionsSheetOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession.messages, isLoading, pipelineStage]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim() || isLoading) return;
    askQuestion(inputVal);
    setInputVal('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] bg-slate-950 -mx-4 -mt-2">
      {/* Subheader / Session Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setIsSessionsSheetOpen(true)}
          className="flex items-center gap-1.5 text-xs text-slate-200 font-semibold max-w-[200px] truncate"
        >
          <Bot className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span className="truncate">{activeSession.title || 'Skipper Assistant'}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={createNewConsultation}
            className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 text-xs flex items-center gap-1 font-medium"
            title="New Chat"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>
      </div>

      {/* Quick Prompts Horizontal Scroll */}
      <div className="px-3 py-2 bg-slate-900/40 border-b border-slate-800/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {quickPrompts.slice(0, 6).map((qp) => (
          <button
            key={qp.id}
            type="button"
            onClick={() => dispatchQuickPrompt(qp)}
            className="px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 whitespace-nowrap flex items-center gap-1 transition-colors"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>{qp.label}</span>
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3.5">
        {activeSession.messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow ${
                  isUser
                    ? 'bg-slate-800 border border-slate-700 text-slate-300'
                    : 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              {/* Message Content */}
              <div
                className={`flex flex-col space-y-1.5 max-w-[85%] ${
                  isUser ? 'items-end' : 'items-start'
                }`}
              >
                {isUser ? (
                  <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-2xl rounded-tr-sm px-3.5 py-2 text-xs font-medium shadow-md">
                    {msg.content}
                  </div>
                ) : (
                  <div className="bg-slate-900 border border-slate-800/90 rounded-2xl rounded-tl-sm p-3 shadow-lg space-y-2.5 w-full">
                    {/* Natural Language Answer */}
                    <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                      {msg.content}
                    </div>

                    {/* Artifacts if present */}
                    {msg.visualArtifact && (
                      <div className="pt-1 overflow-x-auto max-w-full">
                        {msg.visualArtifact.type === 'map' && msg.visualArtifact.map && (
                          <SkipperMapArtifact payload={msg.visualArtifact.map} />
                        )}
                        {msg.visualArtifact.type === 'chart' && msg.visualArtifact.chart && (
                          <SkipperChartArtifact payload={msg.visualArtifact.chart} />
                        )}
                        {msg.visualArtifact.table && (
                          <SkipperTableArtifact payload={msg.visualArtifact.table} />
                        )}
                      </div>
                    )}

                    {/* Grounding Source */}
                    {msg.grounding && (
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="flex items-center gap-1 text-slate-400 truncate">
                          <ShieldCheck className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                          <span className="truncate">Grounded: {msg.grounding.datasetName}</span>
                        </span>
                        {msg.grounding.datasetName.includes('Vessel') && (
                          <button
                            type="button"
                            onClick={() => navigate('/m/vessels')}
                            className="text-cyan-400 font-semibold ml-1 flex-shrink-0"
                          >
                            View Fleet →
                          </button>
                        )}
                      </div>
                    )}

                    {/* Suggested follow-up chips */}
                    {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                      <div className="pt-2 border-t border-slate-800 space-y-1">
                        <div className="text-[9px] uppercase font-semibold text-slate-500 flex items-center gap-1">
                          <HelpCircle className="w-3 h-3" /> Follow-up Suggestions
                        </div>
                        <div className="flex flex-col gap-1">
                          {msg.suggestedFollowUps.map((prompt, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => askQuestion(prompt)}
                              className="text-left px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-cyan-300 border border-slate-800/80 flex items-center gap-1.5 transition-colors"
                            >
                              <Sparkles className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                              <span className="truncate">{prompt}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Timestamp */}
                <div className="text-[9px] text-slate-500 px-1 font-mono">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading stage bubble */}
        {isLoading && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <Bot className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div className="p-2.5 rounded-2xl rounded-tl-sm bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
              <div className="mobile-spinner w-3.5 h-3.5 border-2" />
              <span>{pipelineStage || 'Analyzing maritime data...'}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Field Form */}
      <div className="p-2.5 bg-slate-900/95 border-t border-slate-800">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Ask Skipper (e.g. Apollo Glory status, route to Rotterdam)..."
            disabled={isLoading}
            className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || isLoading}
            className="mobile-btn-primary p-2 rounded-xl text-cyan-400 disabled:opacity-40 disabled:text-slate-600 flex items-center justify-center flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Sessions Bottom Sheet */}
      <MobileBottomSheet
        isOpen={isSessionsSheetOpen}
        onClose={() => setIsSessionsSheetOpen(false)}
        title="Consultation Sessions"
      >
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {
              createNewConsultation();
              setIsSessionsSheetOpen(false);
            }}
            className="w-full py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-semibold text-xs flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Start New Consultation
          </button>

          <div className="space-y-1.5 max-h-[50vh] overflow-y-auto">
            {sessions.map((s) => {
              const isActive = s.id === activeSessionId;
              return (
                <div
                  key={s.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                    isActive
                      ? 'bg-slate-800 border-cyan-500/50 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      selectSession(s.id);
                      setIsSessionsSheetOpen(false);
                    }}
                    className="text-left flex-1 truncate mr-2"
                  >
                    <div className="text-xs font-semibold truncate">{s.title || 'Consultation'}</div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <History className="w-3 h-3" />
                      <span>{s.messages.length} messages</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(s.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400"
                    title="Delete session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </MobileBottomSheet>
    </div>
  );
};

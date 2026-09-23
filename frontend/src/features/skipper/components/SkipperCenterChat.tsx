import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  PanelLeft,
  ArrowRight,
  HelpCircle,
  RefreshCw,
  LayoutGrid,
  TrendingUp,
  Anchor,
  Ship,
  History,
} from 'lucide-react';
import type { SkipperMessage, SkipperSession } from '../../../types/skipper';
import { SkipperTableArtifact } from './SkipperTableArtifact';
import { SkipperChartArtifact } from './SkipperChartArtifact';
import { SkipperMapArtifact } from './SkipperMapArtifact';
import { SkipperMarkdown } from './SkipperMarkdown';

interface SkipperCenterChatProps {
  session: SkipperSession;
  onSendMessage: (prompt: string) => void;
  isLoading: boolean;
  pipelineStage: string | null;
  onInspectMessage: (msg: SkipperMessage) => void;
  leftPanelOpen: boolean;
  onToggleLeftPanel: () => void;
  rightPanelOpen: boolean;
  onToggleRightPanel: () => void;
}

const EMPTY_STATE_PROMPTS = [
  {
    icon: TrendingUp,
    title: 'TD3C Spot Freight Rate',
    desc: 'What is the current TD3C freight rate?',
    prompt: 'What is the current spot freight rate for VLCC Middle East to China (TD3C)?',
  },
  {
    icon: Anchor,
    title: 'Singapore Port Congestion',
    desc: 'Show congestion at Singapore port',
    prompt: 'What is the average vessel wait time and queue at Singapore port?',
  },
  {
    icon: Ship,
    title: 'Cargo & Vessel Matching',
    desc: 'Find vessels matching my cargo requirements',
    prompt: 'Where is vessel APOLLO GLORY and what cargo is she carrying?',
  },
  {
    icon: History,
    title: 'Historical Freight Cycles',
    desc: 'Analyze historical freight market trends',
    prompt: 'Show maritime freight rate supercycles across the 12-year dataset from 2014 to 2026.',
  },
];

export const SkipperCenterChat: React.FC<SkipperCenterChatProps> = ({
  session,
  onSendMessage,
  isLoading,
  pipelineStage,
  onInspectMessage,
  leftPanelOpen,
  onToggleLeftPanel,
  rightPanelOpen,
  onToggleRightPanel,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages, isLoading, pipelineStage]);

  // Adjust textarea height dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [inputText]);

  const handleSend = () => {
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isCleanEmptySession = session.messages.length === 0;

  return (
    <div className="skipper-chat-workspace">
      {/* Fixed Top Header */}
      <header className="skipper-workspace-header">
        <div className="skipper-header-left">
          <button
            type="button"
            onClick={onToggleLeftPanel}
            className={`skipper-header-icon-btn ${leftPanelOpen ? 'active' : ''}`}
            title="Toggle Sessions History Sidebar"
          >
            <PanelLeft size={16} />
          </button>

          <div className="skipper-header-titles">
            <div className="skipper-header-title-row">
              <div className="skipper-header-bot-badge">
                <Bot size={15} />
              </div>
              <h1 className="skipper-header-main-title">
                SKIPPER AI ASSISTANT
              </h1>
              <div className="skipper-header-status-badge">
                <span className="skipper-header-pulse-dot" />
                <span>Live Empirical Router Active</span>
              </div>
            </div>
            <p className="skipper-header-subtitle">
              Maritime Intelligence · {session.title}
            </p>
          </div>
        </div>

        {/* Right Header Navigation & Actions */}
        <div className="skipper-header-right">
          {/* Back to Analytics Hub Button */}
          <button
            type="button"
            onClick={() => navigate('/analytics')}
            className="skipper-header-btn"
            title="Navigate back to Analytics Hub"
          >
            <LayoutGrid size={13} className="skipper-cyan-text" />
            <span className="skipper-btn-label">Analytics Hub</span>
          </button>

          {/* Grounding Inspector Toggle Button */}
          <button
            type="button"
            onClick={onToggleRightPanel}
            className={`skipper-header-btn ${rightPanelOpen ? 'active' : ''}`}
            title="Toggle Grounding Provenance Inspector"
          >
            <ShieldCheck size={14} className={rightPanelOpen ? 'skipper-cyan-text' : 'skipper-muted-text'} />
            <span className="skipper-btn-label">Grounding</span>
          </button>
        </div>
      </header>

      {/* Independently Scrollable Message Area */}
      <div className="skipper-chat-scroll-area scrollbar-thin">
        <div className="skipper-chat-content-constrained">
          {/* Clean Centered Empty State When Messages Length is 0 */}
          {isCleanEmptySession ? (
            <div className="skipper-empty-state-container">
              <div className="skipper-welcome-icon">
                <Bot size={26} />
              </div>

              <h2 className="skipper-welcome-title">
                SKIPPER AI
              </h2>
              <p className="skipper-welcome-subtitle">
                Maritime Intelligence Assistant
              </p>
              <p className="skipper-welcome-desc">
                Ask questions about freight markets, vessels, port congestion, voyages, and maritime operations.
              </p>

              {/* 4 Clean Suggested Prompt Cards (High-contrast, 2-column responsive) */}
              <div className="skipper-empty-prompt-grid">
                {EMPTY_STATE_PROMPTS.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onSendMessage(item.prompt)}
                      className="skipper-empty-prompt-card"
                    >
                      <div className="skipper-prompt-card-content">
                        <div className="skipper-prompt-card-icon-wrap">
                          <Icon size={16} />
                        </div>
                        <div className="skipper-prompt-card-text">
                          <div className="skipper-prompt-card-title">
                            {item.title}
                          </div>
                          <div className="skipper-prompt-card-desc">
                            {item.desc}
                          </div>
                        </div>
                      </div>
                      <ArrowRight size={14} className="skipper-prompt-card-arrow" />
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Message Feed Rendering (User Right, AI Left) */
            session.messages.map((msg) => {
              const isUser = msg.role === 'user';

              return (
                <div
                  key={msg.id}
                  className={`skipper-message-row ${isUser ? 'user' : 'assistant'}`}
                >
                  {/* AI Bot Avatar */}
                  {!isUser && (
                    <div className="skipper-avatar skipper-bot-avatar">
                      <Bot size={17} />
                    </div>
                  )}

                  {/* Bubble Container */}
                  <div className={`skipper-bubble-wrapper ${isUser ? 'user' : 'assistant'}`}>
                    {isUser ? (
                      <div className="skipper-user-bubble">
                        {msg.content}
                      </div>
                    ) : (
                      <div className="skipper-assistant-card">
                        {/* Error state alert if data unavailable */}
                        {msg.grounding?.status === 'DATA_UNAVAILABLE' ? (
                          <div className="skipper-unavailable-alert">
                            <div className="skipper-alert-title">
                              Query Unavailable
                            </div>
                            <p className="skipper-alert-text">
                              {msg.content || 'Unable to complete the request against live data router.'}
                            </p>
                            <button
                              type="button"
                              onClick={() => onSendMessage(session.messages[session.messages.length - 2]?.content || 'What is the spot rate for TD3C?')}
                              className="skipper-retry-btn"
                            >
                              <RefreshCw size={12} />
                              <span>Retry</span>
                            </button>
                          </div>
                        ) : (
                          /* Markdown-Rendered Natural Language Response */
                          <SkipperMarkdown content={msg.content} />
                        )}

                        {/* Visual Artifacts: Tables, Charts, Maps */}
                        {msg.visualArtifact && (
                          <div className="skipper-artifact-wrap">
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

                        {/* Grounding Attribution Footer */}
                        {msg.grounding && (
                          <div className="skipper-grounding-attribution">
                            <div className="skipper-grounding-source">
                              <ShieldCheck size={13} className="skipper-shield-icon" />
                              <span className="skipper-label-dim">Grounded in:</span>
                              <span className="skipper-dataset-name">
                                {msg.grounding.datasetName}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => onInspectMessage(msg)}
                              className="skipper-inspect-link"
                            >
                              <span>[ Inspect Provenance ]</span>
                              <ArrowRight size={11} />
                            </button>
                          </div>
                        )}

                        {/* Contextual Follow-Up Suggestions */}
                        {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                          <div className="skipper-followups-block">
                            <div className="skipper-followups-label">
                              <HelpCircle size={11} className="skipper-cyan-text" />
                              <span>Suggested Follow-ups:</span>
                            </div>
                            <div className="skipper-followups-list">
                              {msg.suggestedFollowUps.map((promptText, fIdx) => (
                                <button
                                  key={fIdx}
                                  type="button"
                                  onClick={() => onSendMessage(promptText)}
                                  className="skipper-followup-btn"
                                >
                                  <Sparkles size={11} className="skipper-cyan-text" />
                                  <span>{promptText}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Timestamp */}
                    <div className="skipper-message-timestamp">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* User Avatar */}
                  {isUser && (
                    <div className="skipper-avatar skipper-user-avatar">
                      <User size={16} />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="skipper-message-row assistant">
              <div className="skipper-avatar skipper-bot-avatar">
                <Bot size={17} className="skipper-spinner" />
              </div>
              <div className="skipper-loading-card">
                <div className="skipper-loading-title">
                  <span>● SKIPPER IS ANALYZING</span>
                  <div className="skipper-loading-dot-flashing">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
                <p className="skipper-loading-stage">
                  {pipelineStage || 'Routing query to verified maritime adapters...'}
                </p>
                <div className="skipper-loading-note">
                  Parsing intent, querying empirical tables, and establishing cryptographic grounding.
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed Bottom Message Composer (Anchored, 100% visible, no right-side clipping, no footer overlap) */}
      <div className="skipper-composer-container">
        <div className="skipper-composer-box">
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Ask Skipper about vessels, freight, ports, cargo, voyages or market intelligence..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="skipper-composer-textarea scrollbar-thin"
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className="skipper-send-btn"
            title="Send query (Enter)"
          >
            <span>Send</span>
            <Send size={13} className="shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
};

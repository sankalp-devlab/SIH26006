import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  MoreVertical,
  Search,
  Sparkles,
  ChevronLeft,
  X,
  TrendingUp,
  ShieldCheck,
  Ship,
  Anchor,
  Building2,
  Leaf,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import type {
  SkipperSession,
  SkipperQuickPrompt,
  GroupedConversations,
  ConversationDateGroup,
} from '../../../types/skipper';

interface SkipperLeftPanelProps {
  sessions: SkipperSession[];
  groupedSessions: GroupedConversations;
  activeSessionId: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onDeleteSession: (id: string) => void;
  quickPrompts: SkipperQuickPrompt[];
  onSelectQuickPrompt: (prompt: SkipperQuickPrompt) => void;
  isOpen: boolean;
  onClose: () => void;
}

const DATE_GROUPS: ConversationDateGroup[] = ['Today', 'Yesterday', 'Previous 7 Days', 'Older'];

export const SkipperLeftPanel: React.FC<SkipperLeftPanelProps> = ({
  sessions,
  groupedSessions,
  activeSessionId,
  searchQuery,
  onSearchChange,
  onSelectSession,
  onNewSession,
  onRenameSession,
  onDeleteSession,
  quickPrompts,
  onSelectQuickPrompt,
  isOpen,
  onClose,
}) => {
  // Menu dropdown state
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // Rename modal state
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>('');

  // Delete confirmation modal state
  const [deletingSession, setDeletingSession] = useState<SkipperSession | null>(null);

  const handleStartRename = (session: SkipperSession) => {
    setRenamingId(session.id);
    setRenameValue(session.title);
    setMenuOpenId(null);
  };

  const handleSaveRename = (id: string) => {
    if (renameValue.trim()) {
      onRenameSession(id, renameValue.trim());
    }
    setRenamingId(null);
  };

  const handleConfirmDelete = () => {
    if (deletingSession) {
      onDeleteSession(deletingSession.id);
      setDeletingSession(null);
    }
  };

  const renderPromptIcon = (name: string) => {
    switch (name) {
      case 'TrendingUp':
        return <TrendingUp size={13} className="text-cyan-400 shrink-0" />;
      case 'ShieldCheck':
        return <ShieldCheck size={13} className="text-cyan-400 shrink-0" />;
      case 'Ship':
        return <Ship size={13} className="text-emerald-400 shrink-0" />;
      case 'Anchor':
        return <Anchor size={13} className="text-amber-400 shrink-0" />;
      case 'Building2':
        return <Building2 size={13} className="text-indigo-400 shrink-0" />;
      case 'Leaf':
        return <Leaf size={13} className="text-teal-400 shrink-0" />;
      case 'Calendar':
        return <Calendar size={13} className="text-pink-400 shrink-0" />;
      default:
        return <Sparkles size={13} className="text-cyan-400 shrink-0" />;
    }
  };

  if (!isOpen) return null;

  return (
    <aside className="skipper-sidebar">
      {/* Top Header & Brand */}
      <div className="skipper-sidebar-header">
        <div className="skipper-sidebar-brand">
          <div className="skipper-sidebar-title-group">
            <div className="skipper-brand-icon-box">
              <Sparkles size={16} />
            </div>
            <div>
              <div className="skipper-brand-title">OCEAN LENS</div>
              <div className="skipper-brand-subtitle">SKIPPER AI ASSISTANT</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors md:hidden"
            title="Collapse Sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* New Chat Action Button */}
        <button
          id="btn-new-chat"
          onClick={onNewSession}
          className="skipper-new-chat-btn group"
          title="Start a fresh, empty conversation"
        >
          <div className="w-5 h-5 rounded-md bg-cyan-400/20 flex items-center justify-center text-cyan-300 group-hover:bg-cyan-400 group-hover:text-black transition-colors">
            <Plus size={14} />
          </div>
          <span className="font-semibold text-xs tracking-wide">New Chat</span>
        </button>

        {/* Search Conversations Input */}
        <div className="skipper-search-container">
          <Search size={13} className="text-[#7189A3] shrink-0" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="skipper-search-input"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="text-[#7189A3] hover:text-white transition-colors"
              title="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Chronological Chat History List */}
      <div className="skipper-session-list scrollbar-thin">
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#7189A3]">
            No conversations found.
          </div>
        ) : (
          DATE_GROUPS.map((groupKey) => {
            const groupSessions = groupedSessions[groupKey] || [];
            if (groupSessions.length === 0) return null;

            return (
              <div key={groupKey} className="skipper-history-group mb-3">
                <div className="skipper-group-header">{groupKey}</div>
                <div className="space-y-1">
                  {groupSessions.map((session) => {
                    const isActive = session.id === activeSessionId;
                    const isRenaming = renamingId === session.id;

                    return (
                      <div
                        key={session.id}
                        onClick={() => {
                          if (!isRenaming) onSelectSession(session.id);
                        }}
                        className={`skipper-session-item group ${isActive ? 'active' : ''}`}
                      >
                        <MessageSquare
                          size={14}
                          className={`session-icon shrink-0 ${
                            isActive ? 'text-cyan-400' : 'text-[#7189A3] group-hover:text-slate-300'
                          }`}
                        />

                        {isRenaming ? (
                          <div
                            className="flex items-center gap-1.5 flex-1 min-w-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="text"
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveRename(session.id);
                                if (e.key === 'Escape') setRenamingId(null);
                              }}
                              autoFocus
                              className="w-full bg-[#030B14] border border-cyan-400/50 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                            />
                            <button
                              onClick={() => handleSaveRename(session.id)}
                              className="px-1.5 py-0.5 text-[10px] rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/40 font-semibold"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <div className="truncate text-xs font-medium flex-1 min-w-0 pr-1">
                            <span
                              className={`truncate block ${
                                isActive ? 'text-white font-semibold' : 'text-[#A5B8CC] group-hover:text-white'
                              }`}
                            >
                              {session.title}
                            </span>
                          </div>
                        )}

                        {/* Three-dot Context Action Menu */}
                        {!isRenaming && (
                          <div className="skipper-session-menu-wrap" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => setMenuOpenId(menuOpenId === session.id ? null : session.id)}
                              className={`skipper-session-options-btn ${isActive ? 'active' : ''}`}
                              title="Conversation options"
                            >
                              <MoreVertical size={13} />
                            </button>

                            {menuOpenId === session.id && (
                              <div className="skipper-dropdown-menu">
                                <button
                                  type="button"
                                  onClick={() => handleStartRename(session)}
                                  className="skipper-dropdown-item"
                                >
                                  <Edit2 size={12} className="skipper-cyan-text" />
                                  <span>Rename</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMenuOpenId(null);
                                    setDeletingSession(session);
                                  }}
                                  className="skipper-dropdown-item danger"
                                >
                                  <Trash2 size={12} />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Prompt Starters Section */}
      <div className="skipper-prompt-starters-section scrollbar-thin">
        <div className="skipper-section-label">Prompt Starters</div>
        <div className="skipper-prompts-list">
          {quickPrompts.slice(0, 5).map((qp) => (
            <button
              key={qp.id}
              type="button"
              onClick={() => onSelectQuickPrompt(qp)}
              className="skipper-prompt-chip"
            >
              <div className="skipper-chip-icon-box">
                {renderPromptIcon(qp.iconName)}
              </div>
              <span className="skipper-chip-label">
                {qp.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingSession && (
        <div className="skipper-modal-overlay">
          <div className="skipper-modal-dialog">
            <div className="skipper-modal-header">
              <div className="skipper-modal-icon-danger">
                <AlertTriangle size={18} />
              </div>
              <div>
                <h3 className="skipper-modal-title">Delete Conversation?</h3>
                <p className="skipper-modal-desc">This action cannot be undone.</p>
              </div>
            </div>

            <p className="skipper-modal-item-name">
              "{deletingSession.title}"
            </p>

            <div className="skipper-modal-actions">
              <button
                type="button"
                onClick={() => setDeletingSession(null)}
                className="skipper-modal-btn-cancel"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="skipper-modal-btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

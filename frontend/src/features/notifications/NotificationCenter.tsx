/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 28: Desktop Notification Center (Topbar Dropdown)
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  Radio,
  ArrowRight,
  Trash2,
  CheckCheck,
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationService } from '../../services/notifications/notification.service';
import type { MaritimeNotification } from '../../types/notification';

export const NotificationCenter: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'fixtures' | 'fleet'>('all');
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const [warningNotice, setWarningNotice] = useState<string | null>(null);

  // Tab filtering
  const displayedNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (activeTab === 'unread') return !n.isRead;
      if (activeTab === 'fixtures') return n.category === 'fixture_lifecycle';
      if (activeTab === 'fleet') return n.category === 'vessel_telemetry' || n.category === 'port_congestion';
      return true;
    });
  }, [notifications, activeTab]);

  const handleNotificationClick = (notif: MaritimeNotification) => {
    markAsRead(notif.id);

    const exists = NotificationService.checkAffectedObjectExists(notif);
    if (!exists) {
      setWarningNotice(
        `Notice: ${notif.affectedObjectType} "${notif.metadata?.fixtureReference || notif.affectedObjectId}" is no longer available.`
      );
      setTimeout(() => setWarningNotice(null), 4000);
      return;
    }

    setIsOpen(false);
    if (notif.navigationTarget?.desktopRoute) {
      navigate(notif.navigationTarget.desktopRoute);
    }
  };

  const getSeverityIcon = (sev: MaritimeNotification['severity']) => {
    switch (sev) {
      case 'warning':
        return <AlertTriangle size={14} className="text-amber-400" />;
      case 'success':
        return <CheckCircle2 size={14} className="text-emerald-400" />;
      case 'danger':
        return <AlertTriangle size={14} className="text-rose-400" />;
      case 'info':
      default:
        return <Info size={14} className="text-cyan-400" />;
    }
  };

  const getProvenanceBadge = (prov: MaritimeNotification['provenance']) => {
    switch (prov) {
      case 'live':
        return (
          <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 flex items-center gap-0.5">
            <Radio size={7} className="animate-pulse text-cyan-400" />
            LIVE
          </span>
        );
      case 'simulated':
        return (
          <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-amber-500/15 text-amber-300 font-medium border border-amber-500/30">
            SIMULATED
          </span>
        );
      case 'historical':
      default:
        return (
          <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
            HISTORICAL
          </span>
        );
    }
  };

  const getLifecycleChip = (toStatus?: string) => {
    if (!toStatus) return null;
    switch (toStatus) {
      case 'on_subjects':
        return (
          <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
            On Subs
          </span>
        );
      case 'fully_fixed':
        return (
          <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
            Fully Fixed
          </span>
        );
      case 'failed':
        return (
          <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase">
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="dropdown-container relative" ref={containerRef}>
      {/* Bell Trigger */}
      <button
        type="button"
        className="topbar-icon-btn relative flex items-center justify-center p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Maritime Operational Notifications"
        title="Maritime Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-cyan-500 text-slate-950 font-mono font-bold text-[10px] rounded-full flex items-center justify-center border-2 border-slate-900 shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div className="notification-panel absolute right-0 mt-2 w-96 max-w-[90vw] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fadeIn text-slate-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-tight">Notifications</span>
              {unreadCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  {unreadCount} unread
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400">
                  All caught up
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck size={13} />
                  <span>Mark read</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors p-1"
                  title="Clear all notifications"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Tab Filter Ribbon */}
          <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-950/40 border-b border-slate-800 text-xs">
            {[
              { id: 'all', label: `All (${notifications.length})` },
              { id: 'unread', label: `Unread (${unreadCount})` },
              { id: 'fixtures', label: 'Fixtures' },
              { id: 'fleet', label: 'Fleet & Ports' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/15 text-cyan-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Non-blocking Warning Banner */}
          {warningNotice && (
            <div className="mx-3 mt-2 p-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <AlertTriangle size={13} className="text-amber-400 flex-shrink-0" />
                <span>{warningNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setWarningNotice(null)}
                className="text-amber-400 hover:text-amber-200"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* Notifications Scroll List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-800/60">
            {displayedNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs flex flex-col items-center">
                <Bell size={24} className="text-slate-600 mb-2" />
                <p className="font-medium text-slate-400">No notifications found</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {activeTab === 'unread' ? 'All active alerts have been reviewed' : 'No operational alerts recorded'}
                </p>
              </div>
            ) : (
              displayedNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer group ${
                    !notif.isRead
                      ? 'bg-cyan-950/20 hover:bg-slate-800/80 border-l-2 border-cyan-500'
                      : 'hover:bg-slate-800/50'
                  }`}
                >
                  {/* Severity Icon Avatar */}
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      notif.severity === 'warning'
                        ? 'bg-amber-500/10 border border-amber-500/30'
                        : notif.severity === 'success'
                        ? 'bg-emerald-500/10 border border-emerald-500/30'
                        : notif.severity === 'danger'
                        ? 'bg-rose-500/10 border border-rose-500/30'
                        : 'bg-cyan-500/10 border border-cyan-500/30'
                    }`}
                  >
                    {getSeverityIcon(notif.severity)}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-xs font-bold text-white truncate max-w-[170px]">
                        {notif.title}
                      </span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {getLifecycleChip(notif.metadata?.toStatus)}
                        {getProvenanceBadge(notif.provenance)}
                        {!NotificationService.checkAffectedObjectExists(notif) && (
                          <span
                            className="text-[8px] font-mono px-1 py-0.2 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            title="Referenced record no longer available"
                          >
                            DATA UNAVAILABLE
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-500 hover:text-rose-400 transition-opacity"
                          title="Dismiss"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">
                      {notif.message}
                    </p>

                    {/* Metadata strip */}
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                      <span
                        className="font-mono text-slate-400"
                        title={NotificationService.formatFullDateTime(notif.timestamp)}
                      >
                        {NotificationService.formatRelativeTime(notif.timestamp)}
                      </span>

                      <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-medium text-[10px]">
                        Inspect →
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <span>Full Alert Center</span>
              <ArrowRight size={12} />
            </Link>

            <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
              <Radio size={10} className="text-emerald-400" />
              Event Bus Active
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

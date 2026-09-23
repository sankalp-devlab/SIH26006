/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 28: Mobile Notification Sheet (Module 27 Integration)
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Info,
  CheckCheck,
  Trash2,
  ArrowRight,
  Radio,
} from 'lucide-react';
import { MobileBottomSheet } from './MobileBottomSheet';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationService } from '../../services/notifications/notification.service';
import type { MaritimeNotification } from '../../types/notification';

interface MobileNotificationSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNotificationSheet: React.FC<MobileNotificationSheetProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const [filterSegment, setFilterSegment] = useState<'all' | 'unread' | 'fixtures' | 'fleet'>('all');
  const [warningNotice, setWarningNotice] = useState<string | null>(null);

  const {
    notifications,
    unreadCount,
    isLoading,
    isError,
    markAsRead,
    markAllAsRead,
    clearAll,
    refetch,
  } = useNotifications();

  const displayedNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (filterSegment === 'unread') return !n.isRead;
      if (filterSegment === 'fixtures') return n.category === 'fixture_lifecycle';
      if (filterSegment === 'fleet') return n.category === 'vessel_telemetry' || n.category === 'port_congestion';
      return true;
    });
  }, [notifications, filterSegment]);

  const handleNotificationTap = (notif: MaritimeNotification) => {
    markAsRead(notif.id);

    const exists = NotificationService.checkAffectedObjectExists(notif);
    if (!exists) {
      setWarningNotice(
        `Notice: ${notif.affectedObjectType} "${notif.metadata?.fixtureReference || notif.affectedObjectId}" is no longer available in active registries.`
      );
      setTimeout(() => setWarningNotice(null), 4000);
      return;
    }

    onClose();

    if (notif.navigationTarget?.mobileRoute) {
      navigate(notif.navigationTarget.mobileRoute);
    }
  };

  const getSeverityIcon = (sev: MaritimeNotification['severity']) => {
    switch (sev) {
      case 'warning':
        return <AlertTriangle size={14} className="text-amber-400 flex-shrink-0" />;
      case 'success':
        return <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />;
      case 'danger':
        return <AlertTriangle size={14} className="text-rose-400 flex-shrink-0" />;
      case 'info':
      default:
        return <Info size={14} className="text-cyan-400 flex-shrink-0" />;
    }
  };

  const getProvenanceBadge = (prov: MaritimeNotification['provenance']) => {
    switch (prov) {
      case 'live':
        return (
          <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 text-[8px] flex items-center gap-0.5">
            <Radio size={7} className="animate-pulse" /> LIVE
          </span>
        );
      case 'simulated':
        return (
          <span className="font-mono font-semibold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 text-[8px]">
            SIMULATED
          </span>
        );
      case 'historical':
      default:
        return (
          <span className="font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[8px]">
            HISTORICAL
          </span>
        );
    }
  };

  return (
    <MobileBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Maritime Alerts"
    >
      <div className="space-y-3 -mt-1">
        {/* Subheader with unread count and bulk actions */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">
              {unreadCount > 0 ? `${unreadCount} Unread Alerts` : 'All alerts acknowledged'}
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <Radio size={8} className="animate-pulse" /> Live
            </span>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
              >
                <CheckCheck size={12} />
                <span>Mark all read</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-[11px] text-slate-500 hover:text-rose-400 p-1"
                title="Clear all"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {[
            { id: 'all', label: `All (${notifications.length})` },
            { id: 'unread', label: `Unread (${unreadCount})` },
            { id: 'fixtures', label: 'Fixtures' },
            { id: 'fleet', label: 'Fleet & Ports' },
          ].map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setFilterSegment(chip.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap font-medium transition-all ${
                filterSegment === chip.id
                  ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Non-blocking Warning Notice Banner */}
        {warningNotice && (
          <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-400 flex-shrink-0" />
              <span>{warningNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setWarningNotice(null)}
              className="text-amber-400 text-xs font-bold p-1 min-w-[28px] min-h-[28px] flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        )}

        {/* Notifications Scroll List */}
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2 py-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 animate-pulse flex items-start gap-2.5"
                  style={{ minHeight: 64 }}
                >
                  <div className="w-6 h-6 rounded-lg bg-slate-800" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-slate-800 rounded w-1/2" />
                    <div className="h-2.5 bg-slate-800/60 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="p-6 text-center text-slate-400">
              <AlertTriangle size={28} className="text-amber-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-white">Storage Synchronization Error</p>
              <p className="text-[11px] text-slate-400 mt-1 mb-3">Unable to retrieve mobile alerts from storage.</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="px-4 py-2 min-h-[44px] rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
              >
                Retry Synchronization
              </button>
            </div>
          ) : displayedNotifications.length === 0 ? (
            <div className="mobile-empty-state py-8">
              <Bell className="w-7 h-7 text-slate-600 mb-2" />
              <p className="text-xs text-slate-400 font-medium">No alerts in this category</p>
              <p className="text-[11px] text-slate-500 mt-0.5">All fleet and commercial operations nominal</p>
            </div>
          ) : (
            displayedNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationTap(notif)}
                className={`p-3 rounded-xl border transition-colors cursor-pointer active:scale-[0.99] flex items-start gap-2.5 ${
                  !notif.isRead
                    ? 'bg-cyan-950/20 border-cyan-500/40 text-white'
                    : 'bg-slate-900/80 border-slate-800/80 text-slate-300'
                }`}
                style={{ minHeight: 52 }}
              >
                {/* Severity indicator */}
                <div className="mt-0.5">{getSeverityIcon(notif.severity)}</div>

                {/* Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-xs font-bold text-white truncate">
                      {notif.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                      {NotificationService.formatRelativeTime(notif.timestamp)}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">
                    {notif.message}
                  </p>

                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {notif.metadata?.toStatus && (
                        <span className="uppercase font-mono font-semibold px-1 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[9px]">
                          {notif.metadata.toStatus.replace('_', ' ')}
                        </span>
                      )}
                      {getProvenanceBadge(notif.provenance)}
                      {!NotificationService.checkAffectedObjectExists(notif) && (
                        <span
                          className="font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 text-[8px] border border-rose-500/30"
                          title="Record no longer available in active registry"
                        >
                          DATA UNAVAILABLE
                        </span>
                      )}
                    </div>

                    <span className="text-cyan-400 font-semibold flex items-center gap-0.5">
                      View <ArrowRight size={10} />
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </MobileBottomSheet>
  );
};

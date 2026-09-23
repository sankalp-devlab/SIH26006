/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 28: Dedicated Notifications & Audit Center View (/notifications)
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  CheckCheck,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Info,
  Radio,
  ExternalLink,
  Ship,
  Building2,
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationService } from '../../services/notifications/notification.service';
import type { MaritimeNotification } from '../../types/notification';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    notifications,
    filteredNotifications,
    unreadCount,
    isLoading,
    isError,
    filters,
    setFilters,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refetch,
  } = useNotifications();

  const [toastNotice, setToastNotice] = useState<{
    message: string;
    type: 'info' | 'warning' | 'success';
  } | null>(null);

  // Metric counts
  const stats = useMemo(() => {
    const fixtureAlerts = notifications.filter((n) => n.category === 'fixture_lifecycle').length;
    const warningAlerts = notifications.filter((n) => n.severity === 'warning' || n.severity === 'danger').length;
    const liveCount = notifications.filter((n) => n.provenance === 'live').length;
    return {
      total: notifications.length,
      unread: unreadCount,
      fixtures: fixtureAlerts,
      warnings: warningAlerts,
      live: liveCount,
    };
  }, [notifications, unreadCount]);

  const handleNotificationClick = (notif: MaritimeNotification) => {
    markAsRead(notif.id);

    const exists = NotificationService.checkAffectedObjectExists(notif);
    if (!exists) {
      setToastNotice({
        message: `Notice: Referenced ${notif.affectedObjectType} "${notif.metadata?.fixtureReference || notif.affectedObjectId}" is no longer available in active registries. Notification record preserved.`,
        type: 'warning',
      });
      setTimeout(() => setToastNotice(null), 5000);
      return;
    }

    if (notif.navigationTarget?.desktopRoute) {
      navigate(notif.navigationTarget.desktopRoute);
    }
  };

  const getProvenanceBadge = (prov: MaritimeNotification['provenance']) => {
    switch (prov) {
      case 'live':
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
            <Radio size={9} className="animate-pulse text-cyan-400" />
            LIVE
          </span>
        );
      case 'simulated':
        return (
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
            SIMULATED
          </span>
        );
      case 'historical':
      default:
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            HISTORICAL
          </span>
        );
    }
  };

  const getSeverityIcon = (sev: MaritimeNotification['severity']) => {
    switch (sev) {
      case 'warning':
        return <AlertTriangle size={16} className="text-amber-400" />;
      case 'success':
        return <CheckCircle2 size={16} className="text-emerald-400" />;
      case 'danger':
        return <AlertTriangle size={16} className="text-rose-400" />;
      case 'info':
      default:
        return <Info size={16} className="text-cyan-400" />;
    }
  };

  const getCategoryLabel = (cat: MaritimeNotification['category']) => {
    switch (cat) {
      case 'fixture_lifecycle':
        return 'Fixture Lifecycle';
      case 'vessel_telemetry':
        return 'Fleet Telemetry';
      case 'port_congestion':
        return 'Port Insights';
      case 'operational_system':
      default:
        return 'Operations';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Bell className="w-6 h-6 text-cyan-400" />
              Maritime Notification & Operational Alert Ledger
            </h1>
            <span className="text-xs font-semibold font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <Radio size={12} className="animate-pulse text-emerald-400" />
              Event Bus Active
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time audit log of fixture status transitions, fleet telemetry changes, and port alerts
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="px-3 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <CheckCheck size={14} />
              <span>Mark All as Read</span>
            </button>
          )}
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-400 border border-slate-700 text-xs flex items-center gap-1.5 transition-colors"
              title="Clear all alerts"
            >
              <Trash2 size={14} />
              <span>Clear Ledger</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Alerts</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">{stats.total}</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">{stats.live} generated live in session</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Unread Alerts</span>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">{stats.unread}</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Require command acknowledgement</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Fixture Transitions</span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">{stats.fixtures}</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">On Subs / Fixed / Failed lifecycle</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Warnings & Delays</span>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1">{stats.warnings}</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Port congestion & failed subjects</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="Search alerts by title, vessel name, IMO, fixture ref, or charterer..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Quick Selectors */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value as any }))}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Categories</option>
              <option value="fixture_lifecycle">Fixture Lifecycle</option>
              <option value="vessel_telemetry">Fleet Telemetry</option>
              <option value="port_congestion">Port Congestion</option>
              <option value="operational_system">System</option>
            </select>

            {/* Severity Filter */}
            <select
              value={filters.severity}
              onChange={(e) => setFilters((prev) => ({ ...prev, severity: e.target.value as any }))}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Severities</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="success">Success</option>
              <option value="danger">Critical</option>
            </select>

            {/* Read Status */}
            <select
              value={filters.readStatus}
              onChange={(e) => setFilters((prev) => ({ ...prev, readStatus: e.target.value as any }))}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Statuses</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Toast Notice Banner */}
      {toastNotice && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 animate-fadeIn ${
            toastNotice.type === 'warning'
              ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
              : toastNotice.type === 'info'
              ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300'
              : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="flex-shrink-0 text-amber-400" />
            <span>{toastNotice.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastNotice(null)}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Notifications Ledger List */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing {filteredNotifications.length} of {notifications.length} notifications
          </span>
          <span className="font-mono">Sorted by Newest First</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-4 animate-pulse">
                  <div className="w-9 h-9 rounded-xl bg-slate-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-800 rounded w-1/3" />
                    <div className="h-3 bg-slate-800/60 rounded w-3/4" />
                    <div className="h-3 bg-slate-800/40 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="p-12 text-center text-slate-400 text-sm flex flex-col items-center">
              <AlertTriangle size={36} className="text-amber-400 mb-3" />
              <p className="font-semibold text-white">Storage Synchronization Error</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Unable to load operational alerts from platform storage. Local storage permissions or event bus connection interrupted.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors"
              >
                Retry Synchronization
              </button>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm flex flex-col items-center">
              <Bell size={32} className="text-slate-600 mb-3" />
              <p className="font-semibold text-slate-300">No Notifications Match Filters</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Try resetting search parameters or category filters to inspect all operational alerts.
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 flex items-start gap-4 transition-colors cursor-pointer group ${
                  !notif.isRead
                    ? 'bg-cyan-950/20 hover:bg-slate-800/70 border-l-4 border-cyan-500'
                    : 'hover:bg-slate-800/40'
                }`}
              >
                {/* Severity Avatar */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    notif.severity === 'warning'
                      ? 'bg-amber-500/15 border border-amber-500/30'
                      : notif.severity === 'success'
                      ? 'bg-emerald-500/15 border border-emerald-500/30'
                      : notif.severity === 'danger'
                      ? 'bg-rose-500/15 border border-rose-500/30'
                      : 'bg-cyan-500/15 border border-cyan-500/30'
                  }`}
                >
                  {getSeverityIcon(notif.severity)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {notif.title}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {getCategoryLabel(notif.category)}
                      </span>
                      {notif.metadata?.toStatus && (
                        <span
                          className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded uppercase border ${
                            notif.metadata.toStatus === 'on_subjects'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : notif.metadata.toStatus === 'fully_fixed'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}
                        >
                          {notif.metadata.toStatus.replace('_', ' ')}
                        </span>
                      )}
                      {getProvenanceBadge(notif.provenance)}
                      {!NotificationService.checkAffectedObjectExists(notif) && (
                        <span
                          className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30"
                          title="The referenced fixture or vessel record is no longer available in the active registry"
                        >
                          DATA UNAVAILABLE
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 flex-shrink-0">
                      <span
                        className="font-mono text-slate-400"
                        title={NotificationService.formatFullDateTime(notif.timestamp)}
                      >
                        {NotificationService.formatRelativeTime(notif.timestamp)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                        title="Delete notification"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
                    {notif.message}
                  </p>

                  {/* Metadata line */}
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-3 flex-wrap">
                      {notif.metadata?.vesselName && (
                        <span className="flex items-center gap-1 text-slate-300">
                          <Ship size={12} className="text-cyan-400" />
                          <span>{notif.metadata.vesselName}</span>
                          {notif.metadata.vesselImo && (
                            <span className="text-slate-500 font-mono">({notif.metadata.vesselImo})</span>
                          )}
                        </span>
                      )}
                      {notif.metadata?.fixtureReference && (
                        <span className="flex items-center gap-1 font-mono text-slate-400">
                          Ref: <strong className="text-white">{notif.metadata.fixtureReference}</strong>
                        </span>
                      )}
                      {notif.metadata?.portName && (
                        <span className="flex items-center gap-1 text-slate-300">
                          <Building2 size={12} className="text-cyan-400" />
                          <span>{notif.metadata.portName}</span>
                        </span>
                      )}
                    </div>

                    <span className="text-cyan-400 font-semibold flex items-center gap-1 text-xs group-hover:translate-x-1 transition-transform">
                      Open Affected Object <ExternalLink size={12} />
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;

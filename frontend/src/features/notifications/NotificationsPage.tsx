/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 28: Dedicated Notifications & Audit Center View (/notifications)
 * Maritime Operations Control Center & Operational Alert Ledger
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
  ChevronDown,
  X,
  RotateCcw,
  SlidersHorizontal,
  Clock,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationService } from '../../services/notifications/notification.service';
import type { MaritimeNotification, NotificationSeverity } from '../../types/notification';

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

  // Selected alert for slideout detail drawer
  const [selectedAlert, setSelectedAlert] = useState<MaritimeNotification | null>(null);

  // Confirmation modal state for clearing the entire ledger
  const [showClearModal, setShowClearModal] = useState(false);

  // Metric counts for the 4-column KPI row
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

  // Check if any filter is active
  const isFilterActive = useMemo(() => {
    return (
      filters.searchQuery.trim() !== '' ||
      filters.category !== 'all' ||
      filters.severity !== 'all' ||
      filters.readStatus !== 'all'
    );
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      category: 'all',
      severity: 'all',
      readStatus: 'all',
      dateRange: 'all',
    });
  };

  const handleSelectNotification = (notif: MaritimeNotification) => {
    markAsRead(notif.id);
    setSelectedAlert(notif);
  };

  const handleDirectNavigate = (notif: MaritimeNotification) => {
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

  const getSeverityIcon = (sev: NotificationSeverity) => {
    switch (sev) {
      case 'warning':
        return <AlertTriangle size={13} className="text-amber-400 flex-shrink-0" />;
      case 'success':
        return <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0" />;
      case 'danger':
        return <AlertTriangle size={13} className="text-rose-400 flex-shrink-0" />;
      case 'info':
      default:
        return <Info size={13} className="text-cyan-400 flex-shrink-0" />;
    }
  };

  const getSeverityLabel = (sev: NotificationSeverity) => {
    switch (sev) {
      case 'danger':
        return 'CRITICAL';
      case 'warning':
        return 'WARNING';
      case 'success':
        return 'RESOLVED';
      case 'info':
      default:
        return 'INFO';
    }
  };

  const getCategoryLabel = (cat: MaritimeNotification['category']) => {
    switch (cat) {
      case 'fixture_lifecycle':
        return 'FIXTURE LIFECYCLE';
      case 'vessel_telemetry':
        return 'FLEET TELEMETRY';
      case 'port_congestion':
        return 'PORT INSIGHTS';
      case 'operational_system':
      default:
        return 'OPERATIONS';
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5 text-slate-200">
      {/* ============================================================== */}
      {/* 1. OPERATIONAL CONTROL CENTER HEADER                           */}
      {/* ============================================================== */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 shadow-sm shadow-cyan-950/50 mt-0.5 flex-shrink-0">
            <Bell className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight uppercase font-mono flex items-center gap-2">
              Maritime Notification &amp; Operational Alert Ledger
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Real-time operational event stream for fleet, fixtures, voyages, ports and maritime alerts.
            </p>
          </div>
        </div>

        {/* Right Status Indicator: Event Bus Active */}
        <div className="flex items-center gap-2 self-start md:self-center flex-shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-500/40 text-emerald-400 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase">
              Event Bus Active
            </span>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. ACTION BAR (SECONDARY ACTIONS)                              */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-900/40 border border-slate-800/70 rounded-xl px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50"></span>
          <span className="text-slate-300 font-medium">Audit Ledger Stream</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-500 hidden sm:inline">Continuous Telemetry &amp; Contract Ingestion</span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-semibold font-mono flex items-center gap-1.5 transition-all shadow-sm hover:border-cyan-400/50"
            >
              <CheckCheck size={13} />
              <span>Mark All as Read</span>
            </button>
          )}
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={() => setShowClearModal(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-rose-950/30 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 text-xs font-medium font-mono flex items-center gap-1.5 transition-all"
              title="Clear all alerts"
            >
              <Trash2 size={13} />
              <span>Clear Ledger</span>
            </button>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. KPI SUMMARY RIBBON — STRICT 4-COLUMN HORIZONTAL GRID        */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* TOTAL ALERTS */}
        <div className="relative overflow-hidden rounded-xl bg-slate-900/90 border border-slate-800/80 p-3.5 shadow-sm hover:border-cyan-500/40 transition-all">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-cyan-500/80" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Total Alerts
            </span>
            <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Radio size={13} className="text-cyan-400" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1.5 tracking-tight">
            {stats.total}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
            <span className="text-cyan-400 font-semibold">{stats.live} live</span>
            <span>/ session</span>
          </div>
        </div>

        {/* UNREAD ALERTS */}
        <div className="relative overflow-hidden rounded-xl bg-slate-900/90 border border-slate-800/80 p-3.5 shadow-sm hover:border-cyan-400/40 transition-all">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-cyan-400" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Unread Alerts
            </span>
            <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Bell size={13} className="text-cyan-400" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1.5 tracking-tight">
            {stats.unread}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Need action
          </div>
        </div>

        {/* FIXTURE EVENTS */}
        <div className="relative overflow-hidden rounded-xl bg-slate-900/90 border border-slate-800/80 p-3.5 shadow-sm hover:border-amber-500/40 transition-all">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-amber-400" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Fixture Events
            </span>
            <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Ship size={13} className="text-amber-400" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1.5 tracking-tight">
            {stats.fixtures}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Lifecycle
          </div>
        </div>

        {/* WARNINGS */}
        <div className="relative overflow-hidden rounded-xl bg-slate-900/90 border border-slate-800/80 p-3.5 shadow-sm hover:border-rose-500/40 transition-all">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-rose-500" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Warnings
            </span>
            <div className="p-1.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle size={13} className="text-rose-400" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1.5 tracking-tight">
            {stats.warnings}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Delays
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. COMPACT OPERATIONAL SEARCH + FILTER TOOLBAR                */}
      {/* ============================================================== */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800/90 p-3 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center gap-2.5">
          {/* Search Box (Takes Most Width) */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="Search by alert title, vessel, IMO, fixture reference or charterer..."
              className="w-full bg-slate-950/90 border border-slate-800 rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono"
            />
            {filters.searchQuery && (
              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Compact Filter Selects */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Category Filter */}
            <div className="relative">
              <select
                value={filters.category}
                onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value as any }))}
                className="appearance-none bg-slate-950/90 border border-slate-800 hover:border-slate-700 rounded-lg pl-3 pr-7 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/80 font-mono transition-colors cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="fixture_lifecycle">Fixture Lifecycle</option>
                <option value="vessel_telemetry">Fleet Telemetry</option>
                <option value="port_congestion">Port Insights</option>
                <option value="operational_system">Operations</option>
              </select>
              <ChevronDown size={12} className="text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Severity Filter */}
            <div className="relative">
              <select
                value={filters.severity}
                onChange={(e) => setFilters((prev) => ({ ...prev, severity: e.target.value as any }))}
                className="appearance-none bg-slate-950/90 border border-slate-800 hover:border-slate-700 rounded-lg pl-3 pr-7 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/80 font-mono transition-colors cursor-pointer"
              >
                <option value="all">All Severities</option>
                <option value="danger">Critical</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
                <option value="success">Success</option>
              </select>
              <ChevronDown size={12} className="text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={filters.readStatus}
                onChange={(e) => setFilters((prev) => ({ ...prev, readStatus: e.target.value as any }))}
                className="appearance-none bg-slate-950/90 border border-slate-800 hover:border-slate-700 rounded-lg pl-3 pr-7 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/80 font-mono transition-colors cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="unread">Unread Only</option>
                <option value="read">Read Only</option>
              </select>
              <ChevronDown size={12} className="text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Reset Filters Button */}
            {isFilterActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 border border-slate-700 transition-colors"
                title="Reset Filters"
              >
                <RotateCcw size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TOAST NOTICE BANNER                                            */}
      {/* ============================================================== */}
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

      {/* ============================================================== */}
      {/* 5. ALERT FEED — OPERATIONAL EVENT STREAM                      */}
      {/* ============================================================== */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800/90 overflow-hidden shadow-xl">
        {/* Alert List Header */}
        <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300 uppercase tracking-wider font-mono text-[11px]">
            Showing {filteredNotifications.length} of {notifications.length} notifications
          </span>
          <div className="flex items-center gap-1.5 font-mono text-slate-400 text-[11px]">
            <SlidersHorizontal size={11} className="text-cyan-400" />
            <span>Newest first</span>
          </div>
        </div>

        {/* Alert Rows / Feed */}
        <div className="divide-y divide-slate-800/70">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-slate-950/40 animate-pulse border border-slate-800/40">
                  <div className="w-16 h-6 rounded bg-slate-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-800 rounded w-1/3" />
                    <div className="h-3 bg-slate-800/60 rounded w-3/4" />
                  </div>
                  <div className="w-20 h-4 bg-slate-800 rounded" />
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
                className="mt-4 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors font-mono"
              >
                Retry Synchronization
              </button>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm flex flex-col items-center">
              <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50 mb-3 text-slate-400">
                <Bell size={28} />
              </div>
              <p className="font-bold text-slate-200 uppercase tracking-wider font-mono text-sm">
                No Alerts Found
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                No operational alerts match the selected filters.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 font-semibold font-mono text-xs flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw size={12} />
                <span>Clear Filters</span>
              </button>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleSelectNotification(notif)}
                className={`relative px-4 py-3.5 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center gap-3.5 ${
                  !notif.isRead
                    ? 'bg-[#0b1728]/85 hover:bg-[#0f223b]/95 border-l-[3px] border-l-cyan-400'
                    : 'bg-slate-900/30 hover:bg-slate-800/40 border-l-[3px] border-l-transparent text-slate-400'
                }`}
              >
                {/* Left: Severity Badge / Icon */}
                <div className="flex-shrink-0 self-start sm:self-center">
                  <div
                    className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 border shadow-sm ${
                      notif.severity === 'danger'
                        ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                        : notif.severity === 'warning'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : notif.severity === 'success'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                    }`}
                  >
                    {getSeverityIcon(notif.severity)}
                    <span>{getSeverityLabel(notif.severity)}</span>
                  </div>
                </div>

                {/* Center: Title, Description, Metadata Chips */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  {/* Line 1: Title + Category + Status + Provenance */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-sm font-semibold tracking-tight transition-colors ${
                        !notif.isRead ? 'text-white group-hover:text-cyan-300' : 'text-slate-300 group-hover:text-white'
                      }`}
                    >
                      {notif.title}
                    </span>

                    {/* Category Chip */}
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-slate-700/80">
                      {getCategoryLabel(notif.category)}
                    </span>

                    {/* Fixture Lifecycle toStatus */}
                    {notif.metadata?.toStatus && (
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded uppercase border ${
                          notif.metadata.toStatus === 'on_subjects'
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            : notif.metadata.toStatus === 'fully_fixed'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {notif.metadata.toStatus.replace('_', ' ')}
                      </span>
                    )}

                    {/* Provenance Badge */}
                    {getProvenanceBadge(notif.provenance)}

                    {/* Data Unavailable Tag */}
                    {!NotificationService.checkAffectedObjectExists(notif) && (
                      <span
                        className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30"
                        title="Referenced fixture or vessel record is no longer available in active registries"
                      >
                        DATA UNAVAILABLE
                      </span>
                    )}
                  </div>

                  {/* Line 2: Message Description */}
                  <p className="text-xs text-slate-300/90 leading-relaxed font-sans line-clamp-2">
                    {notif.message}
                  </p>

                  {/* Line 3: Structured Metadata Chips */}
                  <div className="flex items-center gap-2 flex-wrap pt-0.5">
                    {notif.metadata?.vesselName && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-300 bg-slate-800/70 border border-slate-700/60 px-2 py-0.5 rounded">
                        <Ship size={11} className="text-cyan-400" />
                        <span>{notif.metadata.vesselName}</span>
                        {notif.metadata.vesselImo && (
                          <span className="text-slate-400">({notif.metadata.vesselImo})</span>
                        )}
                      </span>
                    )}
                    {notif.metadata?.fixtureReference && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-300 bg-slate-800/70 border border-slate-700/60 px-2 py-0.5 rounded">
                        <span className="text-slate-400">Ref:</span>
                        <strong className="text-cyan-300 font-semibold">{notif.metadata.fixtureReference}</strong>
                      </span>
                    )}
                    {notif.metadata?.portName && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-300 bg-slate-800/70 border border-slate-700/60 px-2 py-0.5 rounded">
                        <Building2 size={11} className="text-cyan-400" />
                        <span>{notif.metadata.portName}</span>
                      </span>
                    )}
                    {notif.metadata?.charterer && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-800/40 border border-slate-700/40 px-2 py-0.5 rounded">
                        <span>Charterer:</span>
                        <span className="text-slate-300">{notif.metadata.charterer}</span>
                      </span>
                    )}
                    {notif.metadata?.rateFormatted && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-800/40 border border-slate-700/40 px-2 py-0.5 rounded">
                        <span>Rate:</span>
                        <span className="text-emerald-400 font-semibold">{notif.metadata.rateFormatted}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Timestamp, Unread status, Action buttons */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <div className="flex items-center gap-2">
                    {!notif.isRead && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        UNREAD
                      </span>
                    )}
                    <span
                      className="text-[11px] font-mono text-slate-400"
                      title={NotificationService.formatFullDateTime(notif.timestamp)}
                    >
                      {NotificationService.formatRelativeTime(notif.timestamp)}
                    </span>
                  </div>

                  {/* Operational Action Controls */}
                  <div className="flex items-center gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectNotification(notif);
                      }}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-cyan-950/60 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/40 text-[11px] font-mono flex items-center gap-1 transition-colors"
                      title="Inspect Alert Details"
                    >
                      <Eye size={12} />
                      <span>Details</span>
                    </button>

                    {notif.navigationTarget?.desktopRoute && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDirectNavigate(notif);
                        }}
                        className="px-2 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 border border-cyan-500/30 text-[11px] font-mono flex items-center gap-1 transition-colors"
                        title="Open Affected Object"
                      >
                        <ExternalLink size={12} />
                        <span className="hidden md:inline">Open</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif.id);
                      }}
                      className="p-1.5 rounded bg-slate-800/80 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 transition-colors"
                      title="Delete Alert Record"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 6. ALERT DETAIL EXPERIENCE (RIGHT SLIDEOUT DRAWER)             */}
      {/* ============================================================== */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedAlert(null)}
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-lg bg-[#081220] border-l border-slate-800 shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/70">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Radio size={14} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Alert Intelligence Details
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    ID: {selectedAlert.id}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAlert(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-5 flex-1 overflow-y-auto space-y-5">
              {/* Severity & Status Ribbon */}
              <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="flex items-center gap-2">
                  <div
                    className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 border ${
                      selectedAlert.severity === 'danger'
                        ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                        : selectedAlert.severity === 'warning'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : selectedAlert.severity === 'success'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                    }`}
                  >
                    {getSeverityIcon(selectedAlert.severity)}
                    <span>{getSeverityLabel(selectedAlert.severity)}</span>
                  </div>
                  {getProvenanceBadge(selectedAlert.provenance)}
                </div>
                <span className="text-xs font-mono text-slate-400">
                  {selectedAlert.isRead ? 'Acknowledged' : 'Needs Action'}
                </span>
              </div>

              {/* Section 1: Alert Details */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 block">
                  Alert Details
                </span>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2.5">
                  <h4 className="text-sm font-bold text-white">
                    {selectedAlert.title}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {selectedAlert.message}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/60">
                    <Clock size={12} className="text-slate-400" />
                    <span>Timestamp:</span>
                    <span className="text-white font-medium">
                      {NotificationService.formatFullDateTime(selectedAlert.timestamp)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 2: Event Context & Entity Data */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 block">
                  Event Context &amp; Entity Data
                </span>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 grid grid-cols-2 gap-3 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Category</span>
                    <span className="text-white font-medium">{getCategoryLabel(selectedAlert.category)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Affected Object</span>
                    <span className="text-cyan-400 font-semibold uppercase">{selectedAlert.affectedObjectType}</span>
                  </div>
                  {selectedAlert.metadata?.vesselName && (
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Vessel Name</span>
                      <span className="text-white font-medium">{selectedAlert.metadata.vesselName}</span>
                    </div>
                  )}
                  {selectedAlert.metadata?.vesselImo && (
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">IMO Number</span>
                      <span className="text-slate-300">{selectedAlert.metadata.vesselImo}</span>
                    </div>
                  )}
                  {selectedAlert.metadata?.fixtureReference && (
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Fixture Ref</span>
                      <span className="text-cyan-300 font-semibold">{selectedAlert.metadata.fixtureReference}</span>
                    </div>
                  )}
                  {selectedAlert.metadata?.charterer && (
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Charterer</span>
                      <span className="text-white">{selectedAlert.metadata.charterer}</span>
                    </div>
                  )}
                  {selectedAlert.metadata?.commodity && (
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Commodity</span>
                      <span className="text-slate-300">{selectedAlert.metadata.commodity}</span>
                    </div>
                  )}
                  {selectedAlert.metadata?.portName && (
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Port Location</span>
                      <span className="text-white">{selectedAlert.metadata.portName}</span>
                    </div>
                  )}
                  {selectedAlert.metadata?.rateFormatted && (
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Agreed Rate</span>
                      <span className="text-emerald-400 font-bold">{selectedAlert.metadata.rateFormatted}</span>
                    </div>
                  )}
                  {selectedAlert.metadata?.toStatus && (
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Status Transition</span>
                      <span className="text-amber-400 font-semibold uppercase">
                        {selectedAlert.metadata.toStatus.replace('_', ' ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 3: Timeline & Audit Trace */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 block">
                  Timeline &amp; Audit Trace
                </span>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2.5 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Event Created:</span>
                    <span className="text-slate-200">
                      {NotificationService.formatFullDateTime(selectedAlert.timestamp)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Provenance:</span>
                    <span className="text-slate-200 uppercase">{selectedAlert.provenance}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Object Registry Status:</span>
                    <span
                      className={
                        NotificationService.checkAffectedObjectExists(selectedAlert)
                          ? 'text-emerald-400 font-semibold'
                          : 'text-rose-400 font-semibold'
                      }
                    >
                      {NotificationService.checkAffectedObjectExists(selectedAlert)
                        ? 'Active In Registry'
                        : 'Data Unavailable'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  deleteNotification(selectedAlert.id);
                  setSelectedAlert(null);
                }}
                className="px-3 py-2 rounded-lg bg-rose-950/30 hover:bg-rose-950/60 text-rose-300 border border-rose-500/30 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 size={13} />
                <span>Delete Alert</span>
              </button>

              <div className="flex items-center gap-2">
                {!selectedAlert.isRead && (
                  <button
                    type="button"
                    onClick={() => {
                      markAsRead(selectedAlert.id);
                      setSelectedAlert((prev) => (prev ? { ...prev, isRead: true } : null));
                    }}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCheck size={13} />
                    <span>Mark Read</span>
                  </button>
                )}

                {selectedAlert.navigationTarget?.desktopRoute && (
                  <button
                    type="button"
                    onClick={() => handleDirectNavigate(selectedAlert)}
                    className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shadow-sm shadow-cyan-500/20"
                  >
                    <span>Open in Module</span>
                    <ExternalLink size={13} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. CLEAR LEDGER CONFIRMATION MODAL                             */}
      {/* ============================================================== */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setShowClearModal(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4 z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex-shrink-0">
                <AlertCircle size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Clear Operational Ledger</h3>
                <p className="text-xs text-slate-400">Irreversible operational ledger wipe</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to clear all {notifications.length} operational alerts from the local ledger? Notification event history will be removed from this browser session.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold font-mono transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAll();
                  setShowClearModal(false);
                  setSelectedAlert(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold font-mono transition-colors shadow-lg shadow-rose-950"
              >
                Confirm Clear Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;

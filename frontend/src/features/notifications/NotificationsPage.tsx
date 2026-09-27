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
import './notifications.css';

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
          <span className="notif-badge-prov live">
            <Radio size={9} />
            LIVE
          </span>
        );
      case 'simulated':
        return (
          <span className="notif-badge-prov simulated">
            SIMULATED
          </span>
        );
      case 'historical':
      default:
        return (
          <span className="notif-badge-prov historical">
            HISTORICAL
          </span>
        );
    }
  };

  const getSeverityIcon = (sev: NotificationSeverity) => {
    switch (sev) {
      case 'warning':
        return <AlertTriangle size={13} />;
      case 'success':
        return <CheckCircle2 size={13} />;
      case 'danger':
        return <AlertTriangle size={13} />;
      case 'info':
      default:
        return <Info size={13} />;
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
    <div className="oceanlens-master-container notif-page-root">
      {/* ============================================================== */}
      {/* 1. OPERATIONAL CONTROL CENTER HEADER                           */}
      {/* ============================================================== */}
      <header className="notif-header">
        <div className="notif-header-left">
          <div className="notif-header-icon-box">
            <Bell size={22} />
          </div>
          <div className="notif-header-text">
            <h1 className="notif-title">
              MARITIME NOTIFICATION &amp; OPERATIONAL ALERT LEDGER
            </h1>
            <p className="notif-subtitle">
              Real-time operational event stream for fleet, fixtures, voyages, ports and maritime alerts.
            </p>
          </div>
        </div>

        {/* Right Status Indicator: Event Bus Active */}
        <div className="notif-header-right">
          <div className="notif-status-badge">
            <span className="notif-pulse-dot">
              <span className="notif-pulse-dot-ring" />
              <span className="notif-pulse-dot-core" />
            </span>
            <span>EVENT BUS ACTIVE</span>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. ACTION BAR (SECONDARY ACTIONS & AUDIT STREAM)               */}
      {/* ============================================================== */}
      <div className="notif-action-strip">
        <div className="notif-stream-info">
          <span className="notif-stream-indicator" />
          <span className="notif-stream-title">Audit Ledger Stream</span>
          <span className="notif-stream-divider">·</span>
          <span className="notif-stream-desc">Continuous Telemetry &amp; Contract Ingestion</span>
        </div>

        <div className="notif-strip-actions">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="notif-btn notif-btn-readall"
              title="Mark all notifications as read"
            >
              <CheckCheck size={14} />
              <span>Mark All as Read</span>
            </button>
          )}
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={() => setShowClearModal(true)}
              className="notif-btn notif-btn-clear"
              title="Clear all alerts from ledger"
            >
              <Trash2 size={13} />
              <span>Clear Ledger</span>
            </button>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. KPI SUMMARY RIBBON — 4-COLUMN RESPONSIVE GRID               */}
      {/* ============================================================== */}
      <div className="notif-kpi-grid">
        {/* TOTAL ALERTS */}
        <div className="notif-kpi-card cyan">
          <div className="notif-kpi-accent-bar" />
          <div className="notif-kpi-header">
            <span className="notif-kpi-label">Total Alerts</span>
            <div className="notif-kpi-icon-pill">
              <Radio size={14} />
            </div>
          </div>
          <div className="notif-kpi-value">
            {stats.total}
          </div>
          <div className="notif-kpi-desc">
            <span className="notif-kpi-highlight-text">{stats.live} live</span>
            <span>/ session</span>
          </div>
        </div>

        {/* UNREAD ALERTS */}
        <div className="notif-kpi-card cyan">
          <div className="notif-kpi-accent-bar" />
          <div className="notif-kpi-header">
            <span className="notif-kpi-label">Unread</span>
            <div className="notif-kpi-icon-pill">
              <Bell size={14} />
            </div>
          </div>
          <div className="notif-kpi-value highlight">
            {stats.unread}
          </div>
          <div className="notif-kpi-desc">
            <span>Need action</span>
          </div>
        </div>

        {/* FIXTURE EVENTS */}
        <div className="notif-kpi-card amber">
          <div className="notif-kpi-accent-bar" />
          <div className="notif-kpi-header">
            <span className="notif-kpi-label">Fixture Events</span>
            <div className="notif-kpi-icon-pill">
              <Ship size={14} />
            </div>
          </div>
          <div className="notif-kpi-value highlight">
            {stats.fixtures}
          </div>
          <div className="notif-kpi-desc">
            <span>Commercial lifecycle</span>
          </div>
        </div>

        {/* WARNINGS & DELAYS */}
        <div className="notif-kpi-card rose">
          <div className="notif-kpi-accent-bar" />
          <div className="notif-kpi-header">
            <span className="notif-kpi-label">Warnings &amp; Delays</span>
            <div className="notif-kpi-icon-pill">
              <AlertTriangle size={14} />
            </div>
          </div>
          <div className="notif-kpi-value highlight">
            {stats.warnings}
          </div>
          <div className="notif-kpi-desc">
            <span>Operational risks</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. COMPACT OPERATIONAL SEARCH + FILTER TOOLBAR                */}
      {/* ============================================================== */}
      <div className="notif-toolbar">
        <div className="notif-toolbar-inner">
          {/* Search Box */}
          <div className="notif-search-container">
            <Search className="notif-search-icon" size={15} />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="Search by alert title, vessel, IMO, fixture reference or charterer..."
              className="notif-search-input"
            />
            {filters.searchQuery && (
              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                className="notif-search-clear"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Compact Filter Selects */}
          <div className="notif-filters-group">
            {/* Category Filter */}
            <div className="notif-select-wrapper">
              <select
                value={filters.category}
                onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value as any }))}
                className="notif-select"
              >
                <option value="all">All Categories</option>
                <option value="fixture_lifecycle">Fixture Lifecycle</option>
                <option value="vessel_telemetry">Fleet Telemetry</option>
                <option value="port_congestion">Port Insights</option>
                <option value="operational_system">Operations</option>
              </select>
              <ChevronDown size={13} className="notif-select-chevron" />
            </div>

            {/* Severity Filter */}
            <div className="notif-select-wrapper">
              <select
                value={filters.severity}
                onChange={(e) => setFilters((prev) => ({ ...prev, severity: e.target.value as any }))}
                className="notif-select"
              >
                <option value="all">All Severities</option>
                <option value="danger">Critical</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
                <option value="success">Success</option>
              </select>
              <ChevronDown size={13} className="notif-select-chevron" />
            </div>

            {/* Status Filter */}
            <div className="notif-select-wrapper">
              <select
                value={filters.readStatus}
                onChange={(e) => setFilters((prev) => ({ ...prev, readStatus: e.target.value as any }))}
                className="notif-select"
              >
                <option value="all">All Statuses</option>
                <option value="unread">Unread Only</option>
                <option value="read">Read Only</option>
              </select>
              <ChevronDown size={13} className="notif-select-chevron" />
            </div>

            {/* Reset Filters Button */}
            {isFilterActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="notif-btn-reset"
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
        <div className={`notif-toast-notice ${toastNotice.type}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={15} style={{ flexShrink: 0 }} />
            <span>{toastNotice.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastNotice(null)}
            className="notif-toast-close"
          >
            ✕
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. ALERT FEED — OPERATIONAL EVENT STREAM                      */}
      {/* ============================================================== */}
      <div className="notif-ledger-container">
        {/* Alert List Header */}
        <div className="notif-ledger-header">
          <span className="notif-ledger-count">
            Showing {filteredNotifications.length} of {notifications.length} notifications
          </span>
          <div className="notif-ledger-sort">
            <SlidersHorizontal size={12} className="notif-ledger-sort-icon" />
            <span>Newest first</span>
          </div>
        </div>

        {/* Alert Rows / Feed */}
        <div className="notif-ledger-feed">
          {isLoading ? (
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{
                    height: '72px',
                    borderRadius: '8px',
                    background: 'rgba(11, 29, 46, 0.6)',
                    border: '1px solid rgba(100, 190, 240, 0.1)',
                    animation: 'pulse 1.5s infinite',
                  }}
                />
              ))}
            </div>
          ) : isError ? (
            <div className="notif-empty-state">
              <div className="notif-empty-icon-box">
                <AlertTriangle size={32} style={{ color: '#FFB020' }} />
              </div>
              <h3 className="notif-empty-title">Storage Synchronization Error</h3>
              <p className="notif-empty-desc">
                Unable to load operational alerts from platform storage. Local storage permissions or event bus connection interrupted.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="notif-btn notif-btn-readall"
                style={{ marginTop: '8px' }}
              >
                Retry Synchronization
              </button>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="notif-empty-state">
              <div className="notif-empty-icon-box">
                <Bell size={30} />
              </div>
              <h3 className="notif-empty-title">No Alerts Found</h3>
              <p className="notif-empty-desc">
                No operational alerts match the selected search query or category/severity filters.
              </p>
              {isFilterActive && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="notif-btn notif-btn-readall"
                >
                  <RotateCcw size={12} />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleSelectNotification(notif)}
                className={`notif-card severity-${notif.severity} ${!notif.isRead ? 'unread' : 'read'}`}
              >
                {/* Left: Main Alert Content */}
                <div className="notif-card-main">
                  {/* Row 1: Badges Header */}
                  <div className="notif-badge-row">
                    {/* Severity Badge */}
                    <span className={`notif-badge-severity ${notif.severity}`}>
                      {getSeverityIcon(notif.severity)}
                      <span>{getSeverityLabel(notif.severity)}</span>
                    </span>

                    {/* Category Chip */}
                    <span className="notif-badge-category">
                      {getCategoryLabel(notif.category)}
                    </span>

                    {/* Fixture Lifecycle toStatus */}
                    {notif.metadata?.toStatus && (
                      <span
                        className={`notif-badge-fixture-status ${
                          notif.metadata.toStatus === 'on_subjects'
                            ? 'on-subjects'
                            : notif.metadata.toStatus === 'fully_fixed'
                            ? 'fully-fixed'
                            : 'failed'
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
                        className="notif-badge-unavailable"
                        title="Referenced fixture or vessel record is no longer available in active registries"
                      >
                        DATA UNAVAILABLE
                      </span>
                    )}
                  </div>

                  {/* Row 2: Title */}
                  <div className="notif-card-title">
                    {notif.title}
                  </div>

                  {/* Row 3: Description */}
                  <p className="notif-card-desc">
                    {notif.message}
                  </p>

                  {/* Row 4: Structured Metadata Chips */}
                  <div className="notif-metadata-chips">
                    {notif.metadata?.vesselName && (
                      <span className="notif-chip">
                        <Ship size={11} className="notif-chip-icon" />
                        <span>{notif.metadata.vesselName}</span>
                        {notif.metadata.vesselImo && (
                          <span style={{ color: '#7189A3' }}>({notif.metadata.vesselImo})</span>
                        )}
                      </span>
                    )}
                    {notif.metadata?.fixtureReference && (
                      <span className="notif-chip">
                        <span className="notif-chip-label">Ref:</span>
                        <strong className="notif-chip-val-cyan">{notif.metadata.fixtureReference}</strong>
                      </span>
                    )}
                    {notif.metadata?.portName && (
                      <span className="notif-chip">
                        <Building2 size={11} className="notif-chip-icon" />
                        <span>{notif.metadata.portName}</span>
                      </span>
                    )}
                    {notif.metadata?.charterer && (
                      <span className="notif-chip">
                        <span className="notif-chip-label">Charterer:</span>
                        <span>{notif.metadata.charterer}</span>
                      </span>
                    )}
                    {notif.metadata?.rateFormatted && (
                      <span className="notif-chip">
                        <span className="notif-chip-label">Rate:</span>
                        <span className="notif-chip-val-green">{notif.metadata.rateFormatted}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Timestamp, Unread status, Action buttons */}
                <div className="notif-card-aside">
                  <div className="notif-card-meta-top">
                    {!notif.isRead && (
                      <span className="notif-pill-unread">
                        <span className="notif-pill-unread-dot" />
                        UNREAD
                      </span>
                    )}
                    <span
                      className="notif-timestamp"
                      title={NotificationService.formatFullDateTime(notif.timestamp)}
                    >
                      <Clock size={11} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                      {NotificationService.formatRelativeTime(notif.timestamp)}
                    </span>
                  </div>

                  {/* Operational Action Controls */}
                  <div className="notif-card-actions">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectNotification(notif);
                      }}
                      className="notif-btn-details"
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
                        className="notif-btn-open"
                        title="Open Affected Object"
                      >
                        <ExternalLink size={12} />
                        <span>Open ↗</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif.id);
                      }}
                      className="notif-btn-delete"
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
        <>
          {/* Backdrop */}
          <div
            className="notif-drawer-backdrop"
            onClick={() => setSelectedAlert(null)}
          />

          {/* Drawer Panel */}
          <div className="notif-drawer-panel">
            {/* Drawer Header */}
            <div className="notif-drawer-header">
              <div className="notif-drawer-header-left">
                <div className="notif-drawer-icon-box">
                  <Radio size={16} />
                </div>
                <div>
                  <h3 className="notif-drawer-title">
                    Alert Intelligence Details
                  </h3>
                  <span className="notif-drawer-id">
                    ID: {selectedAlert.id}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAlert(null)}
                className="notif-drawer-close"
                title="Close drawer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="notif-drawer-body">
              {/* Severity & Status Ribbon */}
              <div className="notif-drawer-status-strip">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`notif-badge-severity ${selectedAlert.severity}`}>
                    {getSeverityIcon(selectedAlert.severity)}
                    <span>{getSeverityLabel(selectedAlert.severity)}</span>
                  </span>
                  {getProvenanceBadge(selectedAlert.provenance)}
                </div>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#8DA2B7' }}>
                  {selectedAlert.isRead ? 'Acknowledged' : 'Needs Action'}
                </span>
              </div>

              {/* Section 1: Alert Details */}
              <div className="notif-drawer-section">
                <span className="notif-drawer-section-title">
                  Alert Details
                </span>
                <div className="notif-drawer-box">
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>
                    {selectedAlert.title}
                  </h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#A5B8CC', lineHeight: 1.5 }}>
                    {selectedAlert.message}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#7189A3', borderTop: '1px solid rgba(100, 190, 240, 0.12)', paddingTop: '8px' }}>
                    <Clock size={12} />
                    <span>Timestamp:</span>
                    <span style={{ color: '#F5F8FC' }}>
                      {NotificationService.formatFullDateTime(selectedAlert.timestamp)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 2: Event Context & Entity Data */}
              <div className="notif-drawer-section">
                <span className="notif-drawer-section-title">
                  Event Context &amp; Entity Data
                </span>
                <div className="notif-drawer-box">
                  <div className="notif-drawer-grid">
                    <div className="notif-grid-item">
                      <span className="notif-grid-label">Category</span>
                      <span className="notif-grid-val">{getCategoryLabel(selectedAlert.category)}</span>
                    </div>
                    <div className="notif-grid-item">
                      <span className="notif-grid-label">Affected Object</span>
                      <span className="notif-grid-val" style={{ color: '#00D9FF' }}>{selectedAlert.affectedObjectType}</span>
                    </div>
                    {selectedAlert.metadata?.vesselName && (
                      <div className="notif-grid-item">
                        <span className="notif-grid-label">Vessel Name</span>
                        <span className="notif-grid-val">{selectedAlert.metadata.vesselName}</span>
                      </div>
                    )}
                    {selectedAlert.metadata?.vesselImo && (
                      <div className="notif-grid-item">
                        <span className="notif-grid-label">IMO Number</span>
                        <span className="notif-grid-val" style={{ color: '#8DA2B7' }}>{selectedAlert.metadata.vesselImo}</span>
                      </div>
                    )}
                    {selectedAlert.metadata?.fixtureReference && (
                      <div className="notif-grid-item">
                        <span className="notif-grid-label">Fixture Ref</span>
                        <span className="notif-grid-val" style={{ color: '#00D9FF' }}>{selectedAlert.metadata.fixtureReference}</span>
                      </div>
                    )}
                    {selectedAlert.metadata?.charterer && (
                      <div className="notif-grid-item">
                        <span className="notif-grid-label">Charterer</span>
                        <span className="notif-grid-val">{selectedAlert.metadata.charterer}</span>
                      </div>
                    )}
                    {selectedAlert.metadata?.commodity && (
                      <div className="notif-grid-item">
                        <span className="notif-grid-label">Commodity</span>
                        <span className="notif-grid-val" style={{ color: '#8DA2B7' }}>{selectedAlert.metadata.commodity}</span>
                      </div>
                    )}
                    {selectedAlert.metadata?.portName && (
                      <div className="notif-grid-item">
                        <span className="notif-grid-label">Port Location</span>
                        <span className="notif-grid-val">{selectedAlert.metadata.portName}</span>
                      </div>
                    )}
                    {selectedAlert.metadata?.rateFormatted && (
                      <div className="notif-grid-item">
                        <span className="notif-grid-label">Agreed Rate</span>
                        <span className="notif-grid-val" style={{ color: '#20C98A' }}>{selectedAlert.metadata.rateFormatted}</span>
                      </div>
                    )}
                    {selectedAlert.metadata?.toStatus && (
                      <div className="notif-grid-item">
                        <span className="notif-grid-label">Status Transition</span>
                        <span className="notif-grid-val" style={{ color: '#FFB020' }}>
                          {selectedAlert.metadata.toStatus.replace('_', ' ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 3: Timeline & Audit Trace */}
              <div className="notif-drawer-section">
                <span className="notif-drawer-section-title">
                  Timeline &amp; Audit Trace
                </span>
                <div className="notif-drawer-box" style={{ gap: '8px' }}>
                  <div className="notif-drawer-timeline-row">
                    <span style={{ color: '#7189A3' }}>Event Created:</span>
                    <span>{NotificationService.formatFullDateTime(selectedAlert.timestamp)}</span>
                  </div>
                  <div className="notif-drawer-timeline-row">
                    <span style={{ color: '#7189A3' }}>Provenance:</span>
                    <span style={{ textTransform: 'uppercase' }}>{selectedAlert.provenance}</span>
                  </div>
                  <div className="notif-drawer-timeline-row">
                    <span style={{ color: '#7189A3' }}>Object Registry Status:</span>
                    <span
                      style={{
                        fontWeight: 600,
                        color: NotificationService.checkAffectedObjectExists(selectedAlert)
                          ? '#20C98A'
                          : '#FF4D55',
                      }}
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
            <div className="notif-drawer-footer">
              <button
                type="button"
                onClick={() => {
                  deleteNotification(selectedAlert.id);
                  setSelectedAlert(null);
                }}
                className="notif-btn-drawer-delete"
              >
                <Trash2 size={13} />
                <span>Delete Alert</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {!selectedAlert.isRead && (
                  <button
                    type="button"
                    onClick={() => {
                      markAsRead(selectedAlert.id);
                      setSelectedAlert((prev) => (prev ? { ...prev, isRead: true } : null));
                    }}
                    className="notif-btn-drawer-markread"
                  >
                    <CheckCheck size={13} />
                    <span>Mark Read</span>
                  </button>
                )}

                {selectedAlert.navigationTarget?.desktopRoute && (
                  <button
                    type="button"
                    onClick={() => handleDirectNavigate(selectedAlert)}
                    className="notif-btn-drawer-open"
                  >
                    <span>Open in Module</span>
                    <ExternalLink size={13} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ============================================================== */}
      {/* 7. CLEAR LEDGER CONFIRMATION MODAL                             */}
      {/* ============================================================== */}
      {showClearModal && (
        <div className="notif-modal-backdrop">
          <div className="notif-modal-box">
            <div className="notif-modal-header">
              <div className="notif-modal-icon-box">
                <AlertCircle size={22} />
              </div>
              <div>
                <h3 className="notif-modal-title">Clear Operational Ledger</h3>
                <p className="notif-modal-sub">Irreversible operational ledger wipe</p>
              </div>
            </div>
            <p className="notif-modal-msg">
              Are you sure you want to clear all {notifications.length} operational alerts from the local ledger? Notification event history will be removed from this browser session.
            </p>
            <div className="notif-modal-actions">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="notif-btn-modal-cancel"
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
                className="notif-btn-modal-confirm"
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

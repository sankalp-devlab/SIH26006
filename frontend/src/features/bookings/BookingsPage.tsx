import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ship,
  Package,
  Calendar,
  Clock,
  DollarSign,
  Shield,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Play,
  RotateCcw,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Copy,
  Info,
  ArrowRight,
  BookmarkCheck,
  Radio,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { bookingService } from '../../services/api/booking.service';
import type { BookingRecord, BookingStatus } from '../../types/booking';

export const BookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('all');
  const [activeBooking, setActiveBooking] = useState<BookingRecord | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [updatingTargetStatus, setUpdatingTargetStatus] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  const fetchBookings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await bookingService.getBookings({ limit: 100 });
      const list = response?.bookings || [];
      setBookings(list);
      // If an active booking is selected, refresh its details
      if (activeBooking) {
        const refreshed = list.find((b) => b.booking_id === activeBooking.booking_id);
        if (refreshed) setActiveBooking(refreshed);
      }
    } catch (err: any) {
      console.error('[BookingsPage] Fetch error:', err);
      setError(err?.message || 'Failed to load booking records from database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Filtered bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Status filter
      if (selectedStatusTab !== 'all' && b.booking_status !== selectedStatusTab) {
        return false;
      }
      // Search filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const refMatch = b.booking_reference.toLowerCase().includes(q);
      const cargoMatch = b.cargo?.description?.toLowerCase().includes(q) || false;
      const vesselMatch = b.vessel?.name?.toLowerCase().includes(q) || false;
      const originMatch = b.origin_port?.name?.toLowerCase().includes(q) || false;
      const destMatch = b.destination_port?.name?.toLowerCase().includes(q) || false;
      return refMatch || cargoMatch || vesselMatch || originMatch || destMatch;
    });
  }, [bookings, selectedStatusTab, searchQuery]);

  // KPI calculations
  const kpis = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((b) => b.booking_status === 'pending').length;
    const confirmed = bookings.filter((b) => b.booking_status === 'confirmed').length;
    const inProgress = bookings.filter((b) => b.booking_status === 'in_progress').length;
    const completed = bookings.filter((b) => b.booking_status === 'completed').length;
    return { total, pending, confirmed, inProgress, completed };
  }, [bookings]);

  const handleCopyReference = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(ref);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  // Reset action error/feedback when switching or closing active booking
  useEffect(() => {
    setActionError(null);
    setActionFeedback(null);
  }, [activeBooking?.booking_id]);

  const handleStatusTransition = async (bookingId: number, nextStatus: BookingStatus) => {
    if (isUpdatingStatus) return; // Prevent race conditions / double click

    // If cancelling/deleting, ask for confirmation
    if (nextStatus === 'cancelled') {
      const confirmed = window.confirm(
        `Are you sure you want to cancel / delete Booking #${bookingId}? This will transition the booking to terminal CANCELLED status.`
      );
      if (!confirmed) return;
    }

    setIsUpdatingStatus(true);
    setUpdatingTargetStatus(nextStatus);
    setActionError(null);
    setActionFeedback(null);
    try {
      const updated = await bookingService.updateBookingStatus(bookingId, { status: nextStatus });
      setBookings((prev) => prev.map((b) => (b.booking_id === bookingId ? updated : b)));
      setActiveBooking(updated);
      setActionFeedback(
        nextStatus === 'cancelled'
          ? `Booking #${bookingId} has been successfully cancelled.`
          : `Booking #${bookingId} status updated to ${nextStatus.toUpperCase()}.`
      );
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err: any) {
      console.error('[BookingsPage] Status update error:', err);
      const rawMsg = err?.message || 'Invalid status transition';
      const isJsSyntaxError =
        rawMsg.includes('is not a function') ||
        rawMsg.includes('undefined') ||
        rawMsg.includes('TypeError');
      const actionDesc =
        nextStatus === 'cancelled'
          ? 'cancel / delete booking'
          : `update booking status to '${nextStatus}'`;
      const cleanMsg = isJsSyntaxError
        ? `Unable to ${actionDesc} due to a client network/service issue. Please refresh and try again.`
        : `Unable to ${actionDesc}: ${rawMsg}`;
      setActionError(cleanMsg);
    } finally {
      setIsUpdatingStatus(false);
      setUpdatingTargetStatus(null);
    }
  };

  const getStatusBadgeStyle = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0', label: 'CONFIRMED' };
      case 'in_progress':
        return { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe', label: 'IN PROGRESS' };
      case 'completed':
        return { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0', label: 'COMPLETED' };
      case 'cancelled':
        return { bg: '#fef2f2', text: '#991b1b', border: '#fecaca', label: 'CANCELLED' };
      case 'pending':
      default:
        return { bg: '#fffbeb', text: '#92400e', border: '#fde68a', label: 'PENDING REQUEST' };
    }
  };

  return (
    <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(2, 132, 199, 0.12)',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BookmarkCheck size={22} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                Commercial Booking Hub
              </h1>
              <p style={{ margin: '2px 0 0', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                Module 19 Booking Management &middot; Direct Supabase Persistence & Controlled Lifecycles
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            size="sm"
            variant="secondary"
            icon={<RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />}
            onClick={fetchBookings}
            disabled={isLoading}
          >
            Refresh Bookings
          </Button>

          <Button
            size="sm"
            variant="primary"
            icon={<Sparkles size={14} />}
            onClick={() => navigate('/vessel-intelligence')}
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              fontWeight: 700,
            }}
          >
            Vessel Booking Intelligence
          </Button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '12px',
        }}
      >
        <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-surface)', borderRadius: '8px', border: '1px solid var(--color-border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total Bookings</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '4px' }}>
            {kpis.total}
          </div>
        </div>

        <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-surface)', borderRadius: '8px', border: '1px solid var(--color-border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', color: '#ca8a04', fontWeight: 600 }}>Pending Requests</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ca8a04', marginTop: '4px' }}>
            {kpis.pending}
          </div>
        </div>

        <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-surface)', borderRadius: '8px', border: '1px solid var(--color-border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600 }}>Confirmed Fixtures</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>
            {kpis.confirmed}
          </div>
        </div>

        <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-surface)', borderRadius: '8px', border: '1px solid var(--color-border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', color: '#8b5cf6', fontWeight: 600 }}>Active Voyages</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#8b5cf6', marginTop: '4px' }}>
            {kpis.inProgress}
          </div>
        </div>

        <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-surface)', borderRadius: '8px', border: '1px solid var(--color-border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>Completed Discharges</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
            {kpis.completed}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderRadius: '10px',
          border: '1px solid var(--color-border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Filter Bar */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--color-border-subtle)',
            backgroundColor: 'var(--color-bg-surface-alt)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {[
              { key: 'all', label: 'All Bookings' },
              { key: 'pending', label: 'Pending' },
              { key: 'confirmed', label: 'Confirmed' },
              { key: 'in_progress', label: 'In Progress' },
              { key: 'completed', label: 'Completed' },
              { key: 'cancelled', label: 'Cancelled' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedStatusTab(tab.key)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: selectedStatusTab === tab.key ? 700 : 500,
                  border: selectedStatusTab === tab.key ? '1px solid #0284c7' : '1px solid transparent',
                  backgroundColor: selectedStatusTab === tab.key ? 'rgba(2, 132, 199, 0.12)' : 'transparent',
                  color: selectedStatusTab === tab.key ? '#0284c7' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: '260px' }}>
            <Search
              size={14}
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}
            />
            <input
              type="text"
              placeholder="Search reference, cargo, vessel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 12px 6px 30px',
                borderRadius: '6px',
                border: '1px solid var(--color-border-subtle)',
                backgroundColor: 'var(--color-bg-surface)',
                color: 'var(--color-text-primary)',
                fontSize: '0.8125rem',
              }}
            />
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: '#991b1b', borderBottom: '1px solid #fee2e2', fontSize: '0.8125rem' }}>
            {error}
          </div>
        )}

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border-subtle)', backgroundColor: 'var(--color-bg-surface-alt)', color: 'var(--color-text-muted)', fontSize: '0.6875rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '10px 14px' }}>Reference</th>
                <th style={{ padding: '10px 14px' }}>Status</th>
                <th style={{ padding: '10px 14px' }}>Cargo Consignment</th>
                <th style={{ padding: '10px 14px' }}>Allocated Vessel</th>
                <th style={{ padding: '10px 14px' }}>Corridor Ports</th>
                <th style={{ padding: '10px 14px' }}>Est. Cost</th>
                <th style={{ padding: '10px 14px' }}>Est. Arrival</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px', display: 'block' }} />
                    Loading authoritative bookings from Supabase...
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    <BookmarkCheck size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.5 }} />
                    No bookings found matching query filters.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const badge = getStatusBadgeStyle(b.booking_status);
                  const isSelected = activeBooking?.booking_id === b.booking_id;
                  return (
                    <tr
                      key={b.booking_id}
                      onClick={() => setActiveBooking(b)}
                      style={{
                        borderBottom: '1px solid var(--color-border-subtle)',
                        backgroundColor: isSelected ? 'rgba(2, 132, 199, 0.05)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s',
                      }}
                    >
                      {/* Reference */}
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 800, fontFamily: 'monospace', color: '#0284c7' }}>
                            {b.booking_reference}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyReference(b.booking_reference);
                            }}
                            title="Copy reference"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: copiedRef === b.booking_reference ? '#10b981' : 'var(--color-text-muted)' }}
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                        <div style={{ fontSize: '0.675rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          ID: #{b.booking_id} &middot; {new Date(b.created_at).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '999px',
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            backgroundColor: badge.bg,
                            color: badge.text,
                            border: `1px solid ${badge.border}`,
                            textTransform: 'uppercase',
                          }}
                        >
                          {badge.label}
                        </span>
                      </td>

                      {/* Cargo */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                          {b.cargo?.description || `Cargo #${b.cargo_id}`}
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                          {b.cargo?.weight_tons ? `${b.cargo.weight_tons.toLocaleString()} MT` : ''} ({b.cargo?.cargo_type || 'Bulk'})
                        </div>
                      </td>

                      {/* Vessel */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                          {b.vessel?.name || `Vessel #${b.vessel_id}`}
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                          {b.vessel?.vessel_type} {b.vessel?.capacity_tons ? `&middot; ${b.vessel.capacity_tons.toLocaleString()} DWT` : ''}
                        </div>
                      </td>

                      {/* Corridor Ports */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                          <span>{b.origin_port?.name || 'Origin Port'}</span>
                          <ArrowRight size={12} color="var(--color-text-muted)" />
                          <span>{b.destination_port?.name || 'Dest Port'}</span>
                        </div>
                      </td>

                      {/* Cost */}
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 700 }}>
                          {b.estimated_cost ? `$${b.estimated_cost.toLocaleString()}` : '—'}
                        </div>
                        <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)' }}>
                          {b.cost_source ? 'Baseline' : ''}
                        </div>
                      </td>

                      {/* ETA */}
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 700 }}>
                          {b.estimated_eta ? new Date(b.estimated_eta).toLocaleDateString() : '—'}
                        </div>
                        <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)' }}>
                          {b.eta_source ? 'Speed/Dist' : ''}
                        </div>
                      </td>

                      {/* Action */}
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveBooking(b);
                          }}
                        >
                          Details <ChevronRight size={14} />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out Booking Details Inspection Drawer */}
      {activeBooking && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1050,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          {/* Backdrop */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(2px)',
            }}
            onClick={() => setActiveBooking(null)}
          />

          {/* Drawer Container */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '560px',
              height: '100%',
              backgroundColor: 'var(--color-bg-surface)',
              borderLeft: '1px solid var(--color-border-subtle)',
              boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              zIndex: 1051,
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--color-border-subtle)',
                backgroundColor: 'var(--color-bg-surface-alt)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'monospace', color: '#0284c7' }}>
                    {activeBooking.booking_reference}
                  </span>
                  {(() => {
                    const bStyle = getStatusBadgeStyle(activeBooking.booking_status);
                    return (
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '999px',
                          fontSize: '0.675rem',
                          fontWeight: 700,
                          backgroundColor: bStyle.bg,
                          color: bStyle.text,
                          border: `1px solid ${bStyle.border}`,
                          textTransform: 'uppercase',
                        }}
                      >
                        {bStyle.label}
                      </span>
                    );
                  })()}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  Logged: {new Date(activeBooking.created_at).toLocaleString()}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveBooking(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Drawer Body */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
              {/* Lifecycle Transition Actions Panel */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-bg-surface-alt)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                  Booking Lifecycle Controls
                </div>

                {actionError && (
                  <div
                    style={{
                      marginBottom: '10px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#991b1b',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <AlertCircle size={14} style={{ flexShrink: 0 }} />
                    <span>{actionError}</span>
                  </div>
                )}

                {actionFeedback && (
                  <div
                    style={{
                      marginBottom: '10px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      backgroundColor: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      color: '#065f46',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
                    <span>{actionFeedback}</span>
                  </div>
                )}

                {activeBooking.allowed_next_statuses.length === 0 ? (
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                    This booking has reached terminal status (<code>{activeBooking.booking_status}</code>). No further state transitions permitted.
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {activeBooking.allowed_next_statuses.map((nextSt) => {
                      let btnVariant: 'primary' | 'secondary' | 'danger' = 'secondary';
                      let btnLabel = `Move to ${nextSt}`;
                      let icon = <ChevronRight size={14} />;

                      if (nextSt === 'confirmed') {
                        btnVariant = 'primary';
                        btnLabel = 'Confirm Booking Request';
                        icon = <CheckCircle2 size={14} />;
                      } else if (nextSt === 'in_progress') {
                        btnVariant = 'primary';
                        btnLabel = 'Dispatch Vessel (In Progress)';
                        icon = <Play size={14} />;
                      } else if (nextSt === 'completed') {
                        btnVariant = 'primary';
                        btnLabel = 'Complete Voyage Discharge';
                        icon = <CheckCircle2 size={14} />;
                      } else if (nextSt === 'cancelled') {
                        btnVariant = 'danger';
                        btnLabel = 'Cancel / Delete Booking';
                        icon = <Trash2 size={14} />;
                      } else if (nextSt === 'pending') {
                        btnVariant = 'secondary';
                        btnLabel = 'Move to Pending Request';
                        icon = <ChevronRight size={14} />;
                      }

                      const isThisUpdating = isUpdatingStatus && updatingTargetStatus === nextSt;

                      return (
                        <Button
                          key={nextSt}
                          size="sm"
                          variant={btnVariant}
                          icon={icon}
                          isLoading={isThisUpdating}
                          disabled={isUpdatingStatus}
                          onClick={() => handleStatusTransition(activeBooking.booking_id, nextSt)}
                        >
                          {isThisUpdating ? 'Processing...' : btnLabel}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Vessel Specifications */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-bg-surface-alt)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                  <Ship size={14} color="#0284c7" /> Vessel Specifications
                </div>
                <h4 style={{ margin: '4px 0 2px', fontSize: '1rem', fontWeight: 800 }}>
                  {activeBooking.vessel?.name}
                </h4>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  Type: {activeBooking.vessel?.vessel_type} &middot; DWT: {activeBooking.vessel?.capacity_tons?.toLocaleString()} MT &middot; Flag: {activeBooking.vessel?.flag || 'Standard'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  Laden Speed: {activeBooking.vessel?.speed_laden_knots || 14} knots &middot; Max Draft: {activeBooking.vessel?.draft_m || 10.5}m
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Radio size={13} color="#0284c7" />}
                  style={{ marginTop: '10px' }}
                  onClick={() => {
                    navigate(`/tracking?vesselId=${activeBooking.vessel_id}&bookingId=${activeBooking.booking_id}`);
                  }}
                >
                  Track Vessel on Live Map
                </Button>
              </div>

              {/* Cargo Details */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-bg-surface-alt)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                  <Package size={14} color="#0284c7" /> Consignment Particulars
                </div>
                <h4 style={{ margin: '4px 0 2px', fontSize: '1rem', fontWeight: 800 }}>
                  {activeBooking.cargo?.description}
                </h4>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  Quantity: {activeBooking.cargo?.weight_tons?.toLocaleString()} MT &middot; Category: {activeBooking.cargo?.cargo_type} &middot; Volume: {activeBooking.cargo?.volume_m3?.toLocaleString() || 'N/A'} m³
                </div>
              </div>

              {/* Corridor & Ports */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-bg-surface-alt)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                  Maritime Corridor
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Origin Port</div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{activeBooking.origin_port?.name}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>{activeBooking.origin_port?.country}</div>
                  </div>
                  <ArrowRight size={16} color="#0284c7" />
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Destination Port</div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{activeBooking.destination_port?.name}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>{activeBooking.destination_port?.country}</div>
                  </div>
                </div>
              </div>

              {/* Estimates & Source Attribution */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                }}
              >
                <div style={{ padding: '10px', backgroundColor: 'var(--color-bg-surface-alt)', borderRadius: '6px', border: '1px solid var(--color-border-subtle)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Estimated Voyage Cost</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                    {activeBooking.estimated_cost ? `$${activeBooking.estimated_cost.toLocaleString()} ${activeBooking.currency}` : 'Spot Market'}
                  </div>
                  <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    Source: {activeBooking.cost_source || 'Baseline'}
                  </div>
                </div>

                <div style={{ padding: '10px', backgroundColor: 'var(--color-bg-surface-alt)', borderRadius: '6px', border: '1px solid var(--color-border-subtle)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Estimated Arrival (ETA)</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                    {activeBooking.estimated_eta ? new Date(activeBooking.estimated_eta).toLocaleDateString() : 'Upon Dispatch'}
                  </div>
                  <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    Source: {activeBooking.eta_source || 'Speed/Distance'}
                  </div>
                </div>
              </div>

              {/* Operational Notice & Risk Disclosures */}
              <div
                style={{
                  padding: '12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(2, 132, 199, 0.04)',
                  border: '1px solid rgba(2, 132, 199, 0.2)',
                  fontSize: '0.75rem',
                  lineHeight: 1.45,
                  color: 'var(--color-text-secondary)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#0284c7', marginBottom: '4px' }}>
                  <Info size={14} /> Operational & Risk Disclosures
                </div>
                <p style={{ margin: '0 0 6px' }}>{activeBooking.operational_notice}</p>
                <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                  {activeBooking.risk_disclosure?.disclosure}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

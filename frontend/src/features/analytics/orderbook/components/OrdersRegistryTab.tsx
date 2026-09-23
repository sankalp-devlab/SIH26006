/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 17: Newbuilding Orders Registry Master Table
 * Searchable, sortable, interactive contract ledger with drilldown trigger.
 */

import { useState, useMemo } from 'react';
import {
  FileText,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Clock,
  Hammer,
} from 'lucide-react';
import type {
  OrderbookRecord,
  OrderbookStatus,
} from '../../../../types/orderbook';
import { OrderbookAnalyticsEngine } from '../../../../services/orderbook/orderbook-analytics-engine';

interface OrdersRegistryTabProps {
  orders: OrderbookRecord[];
  onSelectOrder: (orderId: string) => void;
  selectedOrderId: string | null;
}

const STATUS_BADGES: Record<
  OrderbookStatus,
  { label: string; color: string; bg: string; icon: typeof CheckCircle2 }
> = {
  ordered: {
    label: 'Contract Signed',
    color: '#94a3b8',
    bg: 'rgba(148, 163, 184, 0.12)',
    icon: Clock,
  },
  under_construction: {
    label: 'Under Construction',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.12)',
    icon: Hammer,
  },
  launched: {
    label: 'Launched / Fitting Out',
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.12)',
    icon: ExternalLink,
  },
  delivered: {
    label: 'Delivered to Trade',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.12)',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelled / Terminated',
    color: '#f43f5e',
    bg: 'rgba(244, 63, 94, 0.12)',
    icon: Clock,
  },
};

export function OrdersRegistryTab({
  orders,
  onSelectOrder,
  selectedOrderId,
}: OrdersRegistryTabProps) {
  const [sortField, setSortField] = useState<keyof OrderbookRecord>('expected_delivery_date');
  const [sortAsc, setSortAsc] = useState(true);

  const sortedOrders = useMemo(() => {
    const list = Array.isArray(orders) ? [...orders] : [];
    list.sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc
        ? String(valA || '').localeCompare(String(valB || ''))
        : String(valB || '').localeCompare(String(valA || ''));
    });
    return list;
  }, [orders, sortField, sortAsc]);

  const handleSort = (field: keyof OrderbookRecord) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div
      style={{
        background: 'var(--color-bg-surface, #0f172a)',
        border: '1px solid var(--color-border-subtle, #1e293b)',
        borderRadius: '12px',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={18} color="#38bdf8" />
          <h2
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--color-text-primary, #f8fafc)',
              margin: 0,
            }}
          >
            Newbuilding Orders Registry & Contract Database
          </h2>
        </div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary, #94a3b8)' }}>
          Showing <strong>{sortedOrders.length}</strong> active shipbuilding contracts
        </div>
      </div>

      {sortedOrders.length === 0 ? (
        <div
          style={{
            padding: '3rem 1rem',
            textAlign: 'center',
            color: 'var(--color-text-muted, #64748b)',
          }}
        >
          No newbuilding contracts match the current filter criteria.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.8125rem',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--color-border-subtle, #1e293b)',
                  color: 'var(--color-text-muted, #64748b)',
                  textTransform: 'uppercase',
                  fontSize: '0.7rem',
                  letterSpacing: '0.05em',
                }}
              >
                <th
                  onClick={() => handleSort('hull_number')}
                  style={{ padding: '0.65rem 0.75rem', cursor: 'pointer' }}
                >
                  Hull #
                </th>
                <th
                  onClick={() => handleSort('vessel_name')}
                  style={{ padding: '0.65rem 0.75rem', cursor: 'pointer' }}
                >
                  Vessel Name
                </th>
                <th
                  onClick={() => handleSort('vessel_class')}
                  style={{ padding: '0.65rem 0.75rem', cursor: 'pointer' }}
                >
                  Sector & Class
                </th>
                <th
                  onClick={() => handleSort('shipyard_name')}
                  style={{ padding: '0.65rem 0.75rem', cursor: 'pointer' }}
                >
                  Shipyard
                </th>
                <th
                  onClick={() => handleSort('owner_name')}
                  style={{ padding: '0.65rem 0.75rem', cursor: 'pointer' }}
                >
                  Beneficial Owner
                </th>
                <th
                  onClick={() => handleSort('capacity_dwt')}
                  style={{ padding: '0.65rem 0.75rem', cursor: 'pointer' }}
                >
                  DWT / Capacity
                </th>
                <th style={{ padding: '0.65rem 0.75rem' }}>Fuel / Propulsion</th>
                <th
                  onClick={() => handleSort('expected_delivery_date')}
                  style={{ padding: '0.65rem 0.75rem', cursor: 'pointer' }}
                >
                  Delivery Window
                </th>
                <th
                  onClick={() => handleSort('contract_price_usd_m')}
                  style={{ padding: '0.65rem 0.75rem', cursor: 'pointer' }}
                >
                  Est. Value
                </th>
                <th style={{ padding: '0.65rem 0.75rem' }}>Status</th>
                <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedOrders.map((order) => {
                const isSelected = selectedOrderId === order.id;
                const statusMeta = STATUS_BADGES[order.status] || STATUS_BADGES.ordered;
                const StatusIcon = statusMeta.icon;
                const isGreenFuel = order.propulsion_type !== 'Conventional HFO/VLSFO';

                return (
                  <tr
                    key={order.id}
                    onClick={() => onSelectOrder(order.id)}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                      background: isSelected
                        ? 'rgba(56, 189, 248, 0.08)'
                        : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    {/* Hull # */}
                    <td
                      style={{
                        padding: '0.75rem',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        color: '#38bdf8',
                      }}
                    >
                      {order.hull_number}
                    </td>

                    {/* Vessel Name */}
                    <td style={{ padding: '0.75rem', fontWeight: 600, color: '#f8fafc' }}>
                      {order.vessel_name}
                    </td>

                    {/* Sector & Class */}
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ fontWeight: 600, color: '#cbd5e1' }}>
                        {order.vessel_class}
                      </div>
                      <div
                        style={{
                          fontSize: '0.7rem',
                          textTransform: 'uppercase',
                          color: 'var(--color-text-muted, #64748b)',
                        }}
                      >
                        {order.sector}
                      </div>
                    </td>

                    {/* Shipyard */}
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ color: '#cbd5e1', fontWeight: 500 }}>
                        {order.shipyard_name}
                      </div>
                      <div
                        style={{
                          fontSize: '0.7rem',
                          color: 'var(--color-text-muted, #64748b)',
                        }}
                      >
                        {order.shipyard_country} ({order.shipyard_group})
                      </div>
                    </td>

                    {/* Owner */}
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ color: '#cbd5e1', fontWeight: 500 }}>
                        {order.owner_name}
                      </div>
                      <div
                        style={{
                          fontSize: '0.7rem',
                          color: 'var(--color-text-muted, #64748b)',
                        }}
                      >
                        {order.owner_country}
                      </div>
                    </td>

                    {/* Capacity */}
                    <td style={{ padding: '0.75rem', fontWeight: 600, color: '#f8fafc' }}>
                      {OrderbookAnalyticsEngine.formatDwt(order.capacity_dwt)}
                      {order.capacity_teu && (
                        <div
                          style={{
                            fontSize: '0.7rem',
                            color: '#c084fc',
                            fontWeight: 500,
                          }}
                        >
                          {order.capacity_teu.toLocaleString()} TEU
                        </div>
                      )}
                      {order.capacity_cbm && (
                        <div
                          style={{
                            fontSize: '0.7rem',
                            color: '#10b981',
                            fontWeight: 500,
                          }}
                        >
                          {order.capacity_cbm.toLocaleString()} CBM
                        </div>
                      )}
                    </td>

                    {/* Propulsion */}
                    <td style={{ padding: '0.75rem' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          background: isGreenFuel
                            ? 'rgba(16, 185, 129, 0.12)'
                            : 'rgba(148, 163, 184, 0.1)',
                          color: isGreenFuel ? '#10b981' : '#94a3b8',
                          border: isGreenFuel
                            ? '1px solid rgba(16, 185, 129, 0.3)'
                            : '1px solid rgba(148, 163, 184, 0.2)',
                        }}
                      >
                        {order.propulsion_type}
                      </span>
                      {order.scrubber_fitted && (
                        <span
                          title="Scrubber Fitted"
                          style={{
                            marginLeft: '0.35rem',
                            fontSize: '0.675rem',
                            color: '#38bdf8',
                            fontWeight: 700,
                          }}
                        >
                          [EGCS]
                        </span>
                      )}
                    </td>

                    {/* Delivery Window */}
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                        {order.expected_delivery_quarter}
                      </div>
                      <div
                        style={{
                          fontSize: '0.7rem',
                          color: 'var(--color-text-muted, #64748b)',
                        }}
                      >
                        {order.expected_delivery_date}
                      </div>
                    </td>

                    {/* Estimated Contract Price */}
                    <td style={{ padding: '0.75rem', fontWeight: 700, color: '#f8fafc' }}>
                      {OrderbookAnalyticsEngine.formatUsdMillions(order.contract_price_usd_m)}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '0.75rem' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.25rem 0.55rem',
                          borderRadius: '9999px',
                          background: statusMeta.bg,
                          color: statusMeta.color,
                        }}
                      >
                        <StatusIcon size={12} />
                        <span>{statusMeta.label}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectOrder(order.id);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.35rem 0.65rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: '#38bdf8',
                          background: 'rgba(56, 189, 248, 0.08)',
                          border: '1px solid rgba(56, 189, 248, 0.25)',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        <span>Spec</span>
                        <ChevronRight size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

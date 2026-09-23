/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 17: Orderbook Executive 6-Pillar Summary Strip
 */

import {
  Ship,
  ClipboardList,
  Percent,
  CalendarCheck,
  Trash2,
  TrendingUp,
  Leaf,
  Building2,
} from 'lucide-react';
import type { OrderbookSummaryMetrics } from '../../../../types/orderbook';
import { OrderbookAnalyticsEngine } from '../../../../services/orderbook/orderbook-analytics-engine';

interface OrderbookSummaryStripProps {
  summary: OrderbookSummaryMetrics;
}

export function OrderbookSummaryStrip({ summary }: OrderbookSummaryStripProps) {
  const isNetGrowthPositive = summary.projected_net_growth_pct >= 0;

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      {/* 6 Primary KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '0.75rem',
        }}
      >
        {/* Card 1: Active Fleet */}
        <div
          style={{
            background: 'var(--color-bg-surface, #0f172a)',
            border: '1px solid var(--color-border-subtle, #1e293b)',
            borderRadius: '10px',
            padding: '1rem 1.15rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--color-text-muted, #64748b)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Active Trading Fleet
            </span>
            <Ship size={16} color="#38bdf8" />
          </div>
          <div
            style={{
              fontSize: '1.35rem',
              fontWeight: 700,
              color: 'var(--color-text-primary, #f8fafc)',
              letterSpacing: '-0.02em',
            }}
          >
            {summary.active_fleet_vessels.toLocaleString()}
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 500,
                color: 'var(--color-text-secondary, #94a3b8)',
                marginLeft: '0.35rem',
              }}
            >
              ships
            </span>
          </div>
          <div
            style={{
              fontSize: '0.8rem',
              color: '#38bdf8',
              fontWeight: 600,
              marginTop: '0.25rem',
            }}
          >
            {summary.active_fleet_dwt_formatted}
          </div>
        </div>

        {/* Card 2: Orderbook on Order */}
        <div
          style={{
            background: 'var(--color-bg-surface, #0f172a)',
            border: '1px solid var(--color-border-subtle, #1e293b)',
            borderRadius: '10px',
            padding: '1rem 1.15rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--color-text-muted, #64748b)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Orderbook Pipeline
            </span>
            <ClipboardList size={16} color="#f59e0b" />
          </div>
          <div
            style={{
              fontSize: '1.35rem',
              fontWeight: 700,
              color: 'var(--color-text-primary, #f8fafc)',
              letterSpacing: '-0.02em',
            }}
          >
            {summary.orderbook_vessels.toLocaleString()}
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 500,
                color: 'var(--color-text-secondary, #94a3b8)',
                marginLeft: '0.35rem',
              }}
            >
              orders
            </span>
          </div>
          <div
            style={{
              fontSize: '0.8rem',
              color: '#f59e0b',
              fontWeight: 600,
              marginTop: '0.25rem',
            }}
          >
            {summary.orderbook_dwt_formatted}
          </div>
        </div>

        {/* Card 3: Orderbook-to-Fleet Ratio */}
        <div
          style={{
            background: 'var(--color-bg-surface, #0f172a)',
            border: '1px solid var(--color-border-subtle, #1e293b)',
            borderRadius: '10px',
            padding: '1rem 1.15rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--color-text-muted, #64748b)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Orderbook / Fleet %
            </span>
            <Percent size={16} color="#a855f7" />
          </div>
          <div
            style={{
              fontSize: '1.35rem',
              fontWeight: 700,
              color: 'var(--color-text-primary, #f8fafc)',
              letterSpacing: '-0.02em',
            }}
          >
            {summary.orderbook_to_fleet_pct.toFixed(1)}%
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              color:
                summary.orderbook_to_fleet_pct > 25
                  ? '#ef4444'
                  : summary.orderbook_to_fleet_pct > 15
                  ? '#f59e0b'
                  : '#10b981',
              fontWeight: 600,
              marginTop: '0.25rem',
            }}
          >
            {summary.orderbook_to_fleet_pct > 25
              ? 'High Overhang Risk'
              : summary.orderbook_to_fleet_pct > 15
              ? 'Moderate Expansion'
              : 'Supply Discipline'}
          </div>
        </div>

        {/* Card 4: Scheduled Deliveries Next 12M */}
        <div
          style={{
            background: 'var(--color-bg-surface, #0f172a)',
            border: '1px solid var(--color-border-subtle, #1e293b)',
            borderRadius: '10px',
            padding: '1rem 1.15rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--color-text-muted, #64748b)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Deliveries (Next 12M)
            </span>
            <CalendarCheck size={16} color="#10b981" />
          </div>
          <div
            style={{
              fontSize: '1.35rem',
              fontWeight: 700,
              color: 'var(--color-text-primary, #f8fafc)',
              letterSpacing: '-0.02em',
            }}
          >
            {summary.scheduled_deliveries_next_12m_count.toLocaleString()}
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 500,
                color: 'var(--color-text-secondary, #94a3b8)',
                marginLeft: '0.35rem',
              }}
            >
              ships
            </span>
          </div>
          <div
            style={{
              fontSize: '0.8rem',
              color: '#10b981',
              fontWeight: 600,
              marginTop: '0.25rem',
            }}
          >
            +{OrderbookAnalyticsEngine.formatDwt(summary.scheduled_deliveries_next_12m_dwt)}
          </div>
        </div>

        {/* Card 5: Demolitions Past 12M */}
        <div
          style={{
            background: 'var(--color-bg-surface, #0f172a)',
            border: '1px solid var(--color-border-subtle, #1e293b)',
            borderRadius: '10px',
            padding: '1rem 1.15rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--color-text-muted, #64748b)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Demolitions / Scrap
            </span>
            <Trash2 size={16} color="#f43f5e" />
          </div>
          <div
            style={{
              fontSize: '1.35rem',
              fontWeight: 700,
              color: 'var(--color-text-primary, #f8fafc)',
              letterSpacing: '-0.02em',
            }}
          >
            {summary.demolitions_past_12m_count.toLocaleString()}
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 500,
                color: 'var(--color-text-secondary, #94a3b8)',
                marginLeft: '0.35rem',
              }}
            >
              ships
            </span>
          </div>
          <div
            style={{
              fontSize: '0.8rem',
              color: '#f43f5e',
              fontWeight: 600,
              marginTop: '0.25rem',
            }}
          >
            -{OrderbookAnalyticsEngine.formatDwt(summary.demolitions_past_12m_dwt)}
          </div>
        </div>

        {/* Card 6: Projected Net Growth Rate */}
        <div
          style={{
            background: 'var(--color-bg-surface, #0f172a)',
            border: '1px solid var(--color-border-subtle, #1e293b)',
            borderRadius: '10px',
            padding: '1rem 1.15rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--color-text-muted, #64748b)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Projected Net Growth
            </span>
            <TrendingUp
              size={16}
              color={isNetGrowthPositive ? '#38bdf8' : '#f59e0b'}
            />
          </div>
          <div
            style={{
              fontSize: '1.35rem',
              fontWeight: 700,
              color: isNetGrowthPositive ? '#38bdf8' : '#f59e0b',
              letterSpacing: '-0.02em',
            }}
          >
            {isNetGrowthPositive ? '+' : ''}
            {summary.projected_net_growth_pct.toFixed(1)}%
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--color-text-secondary, #94a3b8)',
              marginTop: '0.25rem',
            }}
          >
            Deliveries less Scrapping
          </div>
        </div>
      </div>

      {/* Auxiliary Benchmark Context Strip */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '0.65rem 1rem',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--color-border-subtle, #1e293b)',
          borderRadius: '8px',
          fontSize: '0.8125rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Leaf size={14} color="#10b981" />
          <span style={{ color: 'var(--color-text-secondary, #94a3b8)' }}>
            Green Propulsion Share:
          </span>
          <span style={{ fontWeight: 700, color: '#10b981' }}>
            {summary.green_propulsion_share_pct.toFixed(1)}% of contracted capacity
          </span>
          <span
            style={{
              fontSize: '0.725rem',
              color: 'var(--color-text-muted, #64748b)',
              marginLeft: '0.25rem',
            }}
          >
            (Dual-Fuel LNG, Methanol, Ammonia, Hybrid)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building2 size={14} color="#38bdf8" />
          <span style={{ color: 'var(--color-text-secondary, #94a3b8)' }}>
            Dominant Yard Group:
          </span>
          <span style={{ fontWeight: 700, color: '#f8fafc' }}>
            {summary.top_shipyard_group}
          </span>
          <span
            style={{
              padding: '0.15rem 0.45rem',
              borderRadius: '4px',
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              fontSize: '0.725rem',
              fontWeight: 700,
            }}
          >
            {summary.top_shipyard_market_share.toFixed(1)}% share
          </span>
        </div>
      </div>
    </div>
  );
}

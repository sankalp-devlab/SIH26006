/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 23: Market Prices — Physical Spot Freight Market Section
 * Canonical Enterprise Design System Refactor
 */

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Anchor,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import type { SpotPriceRecord } from '../../../../types/market-prices';
import { formatFreightRate } from '../../../../services/market-prices/market-prices-analytics-engine';

interface SpotMarketSectionProps {
  spotPrices: SpotPriceRecord[];
  selectedRouteCode: string;
  onSelectRoute: (code: string) => void;
  onInspectRoute?: (code: string) => void;
}

export const SpotMarketSection: React.FC<SpotMarketSectionProps> = ({
  spotPrices,
  selectedRouteCode,
  onSelectRoute,
  onInspectRoute,
}) => {
  const getStatusBadgeStyle = (status: SpotPriceRecord['marketStatus']) => {
    switch (status) {
      case 'Firm':
        return { bg: 'rgba(16, 185, 129, 0.12)', color: '#10B981', border: 'rgba(16, 185, 129, 0.25)' };
      case 'Volatile':
        return { bg: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B', border: 'rgba(245, 158, 11, 0.25)' };
      case 'Softening':
        return { bg: 'rgba(244, 63, 94, 0.12)', color: '#F43F5E', border: 'rgba(244, 63, 94, 0.25)' };
      case 'Steady':
      default:
        return { bg: 'rgba(59, 130, 246, 0.12)', color: '#60A5FA', border: 'rgba(59, 130, 246, 0.25)' };
    }
  };

  return (
    <div className="mp-card" style={{ padding: '20px', width: '100%' }}>
      {/* Section Header */}
      <div className="mp-card-header">
        <div className="mp-card-header-left">
          <div className="mp-card-icon-wrap mp-icon-emerald">
            <Anchor size={18} />
          </div>
          <div>
            <h3 className="mp-card-title">
              Physical Spot Freight Market
            </h3>
            <p className="mp-card-subtitle">
              Live spot fixture rates & daily Time Charter Equivalent (TCE) assessments across key corridors
            </p>
          </div>
        </div>

        <div>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', padding: '4px 10px', borderRadius: '6px', background: 'var(--ol-surface-secondary, #0B1D2E)', border: '1px solid rgba(100, 190, 240, 0.14)', color: 'var(--ol-text-secondary, #94A3B8)' }}>
            {spotPrices.length} ACTIVE CORRIDORS
          </span>
        </div>
      </div>

      {/* Spot Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
        {spotPrices.map((spot) => {
          const isSelected = spot.routeCode === selectedRouteCode;
          const is1dUp = spot.change1dPct >= 0;
          const is7dUp = spot.change7dPct >= 0;
          const statusStyle = getStatusBadgeStyle(spot.marketStatus);

          // Compute SVG sparkline points
          const min = Math.min(...spot.sparkline7d);
          const max = Math.max(...spot.sparkline7d);
          const span = max - min || 1;
          const sparklinePath = spot.sparkline7d
            .map((val, idx) => {
              const x = (idx / (spot.sparkline7d.length - 1)) * 90;
              const y = 26 - ((val - min) / span) * 22;
              return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
            })
            .join(' ');

          return (
            <div
              key={spot.routeCode}
              onClick={() => onSelectRoute(spot.routeCode)}
              className="mp-movement-item"
              style={{
                flexDirection: 'column',
                alignItems: 'stretch',
                padding: '14px',
                borderColor: isSelected ? 'var(--ol-cyan, #22D3EE)' : undefined,
                backgroundColor: isSelected ? 'rgba(34, 211, 238, 0.08)' : undefined,
              }}
            >
              {/* Header: Route, Class, Status */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, fontSize: '13px', color: 'var(--ol-text-primary, #F1F5F9)' }}>
                    {spot.routeCode}
                  </span>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', padding: '1px 5px', borderRadius: '3px', background: 'var(--ol-surface-primary, #091A2A)', border: '1px solid rgba(100, 190, 240, 0.12)', color: 'var(--ol-text-secondary, #94A3B8)' }}>
                    {spot.vesselClass}
                  </span>
                </div>

                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    backgroundColor: statusStyle.bg,
                    color: statusStyle.color,
                    border: `1px solid ${statusStyle.border}`,
                  }}
                >
                  {spot.marketStatus}
                </span>
              </div>

              {/* Route Name */}
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ol-text-primary, #F1F5F9)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {spot.routeName}
              </div>

              {/* Rate & Sparkline Strip */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '10px 0' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '17px', fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)' }}>
                    {formatFreightRate(spot.rateTceUsdPerDay, spot.rateUnit)}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--ol-text-muted, #64748B)', marginTop: '2px' }}>
                    {spot.rateWorldscaleOrPerMt ? `WS ${spot.rateWorldscaleOrPerMt.toFixed(1)} • ` : ''}{spot.rateUnit}
                  </div>
                </div>

                {/* Sparkline SVG */}
                <div style={{ width: '90px', height: '28px' }}>
                  <svg viewBox="0 0 90 28" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                    <path
                      d={sparklinePath}
                      fill="none"
                      stroke={is7dUp ? '#10B981' : '#F43F5E'}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Footer Deltas & Inspection */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(100, 190, 240, 0.08)', fontSize: '11px', fontFamily: 'var(--font-mono, monospace)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: is1dUp ? '#10B981' : '#F43F5E', fontWeight: 700 }}>
                    {is1dUp ? '+' : ''}{spot.change1dPct}% 1D
                  </span>
                  <span style={{ color: 'var(--ol-text-muted, #64748B)' }}>•</span>
                  <span style={{ color: is7dUp ? '#10B981' : '#F43F5E', fontWeight: 700 }}>
                    {is7dUp ? '+' : ''}{spot.change7dPct}% 7D
                  </span>
                </div>

                {onInspectRoute && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onInspectRoute(spot.routeCode);
                    }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--ol-cyan, #22D3EE)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10.5px', fontWeight: 600 }}
                  >
                    <span>Inspect</span>
                    <ExternalLink size={10} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

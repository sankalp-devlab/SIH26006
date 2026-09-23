/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 23: Market Prices — Route Detail Slide-out Inspection Drawer
 * Canonical Enterprise Design System Refactor
 */

import React from 'react';
import {
  X,
  TrendingUp,
  TrendingDown,
  Anchor,
  Navigation,
  Activity,
  Layers,
  Star,
  Check,
  Zap,
} from 'lucide-react';
import type {
  MaritimeRouteSpec,
  SpotPriceRecord,
  RouteForwardCurve,
  RouteVolatilityMetrics,
  MarketContextMetrics,
} from '../../../../types/market-prices';
import {
  formatFreightRate,
} from '../../../../services/market-prices/market-prices-analytics-engine';

interface PriceDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  route: MaritimeRouteSpec | null;
  spot: SpotPriceRecord | null;
  forwardCurve: RouteForwardCurve | null;
  volatility: RouteVolatilityMetrics | null;
  context: MarketContextMetrics | null;
  isFavorite?: boolean;
  onToggleFavorite?: (routeId: string) => void;
  onAddToCompare?: (routeId: string) => void;
  isInCompare?: boolean;
  onSelectRoute?: (routeId: string) => void;
}

export const PriceDetailDrawer: React.FC<PriceDetailDrawerProps> = ({
  isOpen,
  onClose,
  route,
  spot,
  forwardCurve,
  volatility,
  context,
  isFavorite = false,
  onToggleFavorite,
  onAddToCompare,
  isInCompare = false,
  onSelectRoute,
}) => {
  if (!isOpen || !route) return null;

  const isPositive1d = (spot?.change1dPct ?? 0) >= 0;
  const isContango = forwardCurve?.curveStructure === 'Contango';

  // 52-week position calculation
  const low52 = spot?.low52wUsd ?? 0;
  const high52 = spot?.high52wUsd ?? 1;
  const curr = spot?.rateTceUsdPerDay ?? 0;
  const range52Pct = high52 > low52 ? Math.min(100, Math.max(0, ((curr - low52) / (high52 - low52)) * 100)) : 50;

  return (
    <div className="mp-drawer-backdrop" onClick={onClose}>
      <div className="mp-drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="mp-drawer-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <span className="mp-corridor-code-badge" style={{ fontSize: '11px', padding: '2px 7px' }}>
                {route.routeCode}
              </span>
              <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono, monospace)', padding: '2px 6px', borderRadius: '4px', background: 'var(--ol-surface-secondary, #0B1D2E)', border: '1px solid rgba(100, 190, 240, 0.16)', color: 'var(--ol-text-secondary, #94A3B8)' }}>
                {route.vesselClass}
              </span>
              <span style={{ fontSize: '10.5px', color: 'var(--ol-text-muted, #64748B)' }}>
                {route.marketSegment}
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)' }}>
              {route.routeName}
            </h3>
            <p style={{ margin: '3px 0 0', fontSize: '11px', color: 'var(--ol-text-secondary, #94A3B8)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Navigation size={12} style={{ color: 'var(--ol-cyan, #22D3EE)' }} />
              <span>{route.originPort} → {route.destinationPort} ({route.distanceNm.toLocaleString()} nm)</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', background: 'var(--ol-surface-elevated, #0F2437)', border: '1px solid var(--ol-border, rgba(100, 190, 240, 0.14))', color: 'var(--ol-text-secondary, #94A3B8)', cursor: 'pointer' }}
            title="Close Drawer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="mp-drawer-body">
          {/* 1. Spot TCE Assessment */}
          <div className="mp-drawer-section">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ol-text-muted, #64748B)' }}>
                Physical Spot Assessment
              </span>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--ol-text-muted, #64748B)' }}>
                DAILY FIXTURE
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '24px', fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)' }}>
                {spot ? formatFreightRate(spot.rateTceUsdPerDay, spot.rateUnit) : 'N/A'}
              </div>
              {spot && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-mono, monospace)', fontSize: '12px', fontWeight: 700, color: isPositive1d ? '#10B981' : '#F43F5E' }}>
                  {isPositive1d ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span>{isPositive1d ? '+' : ''}{spot.change1dPct}% (24h)</span>
                </div>
              )}
            </div>

            {/* 52W Range Bar */}
            {spot && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--ol-text-muted, #64748B)', marginBottom: '4px' }}>
                  <span>52W Low: {formatFreightRate(spot.low52wUsd)}</span>
                  <span>52W High: {formatFreightRate(spot.high52wUsd)}</span>
                </div>
                <div className="mp-percentile-track">
                  <div className="mp-percentile-fill" style={{ width: `${range52Pct}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* 2. Forward Curve & Term Structure */}
          {forwardCurve && (
            <div className="mp-drawer-section">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ol-text-muted, #64748B)' }}>
                  Forward Curve & Derivatives
                </span>
                <span className={`mp-curve-badge ${isContango ? 'mp-curve-contango' : 'mp-curve-backwardation'}`}>
                  {forwardCurve.curveStructure}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
                <div className="mp-vol-box">
                  <span className="mp-vol-label">Prompt FFA (M+1)</span>
                  <span className="mp-vol-value" style={{ fontSize: '16px', color: 'var(--ol-cyan, #22D3EE)' }}>
                    {formatFreightRate(forwardCurve.frontMonthFfaUsdPerDay)}
                  </span>
                </div>
                <div className="mp-vol-box">
                  <span className="mp-vol-label">Basis Spread</span>
                  <span className="mp-vol-value" style={{ fontSize: '16px', color: forwardCurve.spotVsFfaSpreadUsd >= 0 ? '#10B981' : '#F43F5E' }}>
                    {forwardCurve.spotVsFfaSpreadUsd >= 0 ? '+' : ''}${Math.round(forwardCurve.spotVsFfaSpreadUsd).toLocaleString()}
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '11px', color: 'var(--ol-text-secondary, #94A3B8)', lineHeight: 1.5, marginTop: '4px' }}>
                Annualized forward slope is <strong style={{ color: 'var(--ol-text-primary, #F1F5F9)' }}>{forwardCurve.curveSlopeAnnualizedPct}%</strong>.
              </div>
            </div>
          )}

          {/* 3. Volatility & Risk Metrics */}
          {volatility && (
            <div className="mp-drawer-section">
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ol-text-muted, #64748B)' }}>
                Volatility & Risk Metrics
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '6px' }}>
                <div className="mp-vol-box" style={{ padding: '8px 10px' }}>
                  <span className="mp-vol-label">7D Vol</span>
                  <span className="mp-vol-value" style={{ fontSize: '15px' }}>{volatility.volatility7dPct}%</span>
                </div>
                <div className="mp-vol-box" style={{ padding: '8px 10px' }}>
                  <span className="mp-vol-label">30D Vol</span>
                  <span className="mp-vol-value" style={{ fontSize: '15px', color: '#F59E0B' }}>{volatility.volatility30dPct}%</span>
                </div>
                <div className="mp-vol-box" style={{ padding: '8px 10px' }}>
                  <span className="mp-vol-label">Std Dev</span>
                  <span className="mp-vol-value" style={{ fontSize: '15px', color: 'var(--ol-cyan, #22D3EE)' }}>
                    ${volatility.standardDeviation30d.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 4. Commercial Context */}
          {context && (
            <div className="mp-drawer-section">
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ol-text-muted, #64748B)' }}>
                Commercial Synthesis
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--ol-text-secondary, #94A3B8)', lineHeight: 1.5, margin: 0 }}>
                {context.marketBiasText}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto', paddingTop: '10px' }}>
            {onSelectRoute && (
              <button
                type="button"
                onClick={() => {
                  onSelectRoute(route.routeCode);
                  onClose();
                }}
                className="mp-btn mp-btn-primary"
                style={{ justifyContent: 'center', width: '100%', padding: '10px' }}
              >
                Set as Active Corridor
              </button>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {onToggleFavorite && (
                <button
                  type="button"
                  onClick={() => onToggleFavorite(route.routeCode)}
                  className="mp-btn mp-btn-secondary"
                  style={{ justifyContent: 'center' }}
                >
                  <Star size={13} style={{ color: isFavorite ? '#F59E0B' : undefined }} />
                  <span>{isFavorite ? 'Favorited' : 'Favorite'}</span>
                </button>
              )}

              {onAddToCompare && (
                <button
                  type="button"
                  onClick={() => onAddToCompare(route.routeCode)}
                  className="mp-btn mp-btn-secondary"
                  style={{ justifyContent: 'center' }}
                >
                  <Check size={13} style={{ color: isInCompare ? 'var(--ol-cyan, #22D3EE)' : undefined }} />
                  <span>{isInCompare ? 'In Compare' : 'Add to Compare'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

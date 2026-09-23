/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 23: Market Prices — Market Movement & Momentum Leaders
 * Canonical Enterprise Design System Refactor
 */

import React, { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Zap,
} from 'lucide-react';
import type { SpotPriceRecord, RouteForwardCurve } from '../../../../types/market-prices';
import { formatFreightRate } from '../../../../services/market-prices/market-prices-analytics-engine';

interface MarketMovementPanelProps {
  spotPrices: SpotPriceRecord[];
  forwardCurves: Record<string, RouteForwardCurve>;
  onSelectRoute: (code: string) => void;
}

export const MarketMovementPanel: React.FC<MarketMovementPanelProps> = ({
  spotPrices,
  forwardCurves,
  onSelectRoute,
}) => {
  // Top Gainers (by 7D change)
  const topGainers = useMemo(() => {
    return [...spotPrices]
      .sort((a, b) => b.change7dPct - a.change7dPct)
      .slice(0, 3);
  }, [spotPrices]);

  // Top Decliners / Laggards (by 7D change)
  const topDecliners = useMemo(() => {
    return [...spotPrices]
      .sort((a, b) => a.change7dPct - b.change7dPct)
      .slice(0, 3);
  }, [spotPrices]);

  // Largest Contango & Backwardation Spreads
  const spreadLeaders = useMemo(() => {
    const list = spotPrices.map((s) => {
      const curve = forwardCurves[s.routeCode];
      return {
        spot: s,
        curve,
        spreadUsd: curve ? curve.spotVsFfaSpreadUsd : 0,
        spreadPct: curve ? curve.spotVsFfaSpreadPct : 0,
      };
    });

    list.sort((a, b) => Math.abs(b.spreadPct) - Math.abs(a.spreadPct));
    return list.slice(0, 3);
  }, [spotPrices, forwardCurves]);

  return (
    <div className="mp-card" style={{ padding: '20px', width: '100%' }}>
      {/* Header */}
      <div className="mp-card-header">
        <div className="mp-card-header-left">
          <div className="mp-card-icon-wrap mp-icon-emerald">
            <Zap size={18} />
          </div>
          <div>
            <h3 className="mp-card-title">
              Market Movement & Momentum Leaders
            </h3>
            <p className="mp-card-subtitle">
              Accelerating spot corridors, weekly momentum leaders, and primary derivative forward spreads
            </p>
          </div>
        </div>

        <div style={{ fontSize: '11px', color: 'var(--ol-text-muted, #64748B)', fontFamily: 'var(--font-mono, monospace)' }}>
          7D ROLLING BASIS
        </div>
      </div>

      {/* 3-Column Responsive Grid: Gainers, Decliners, Spread Leaders */}
      <div className="mp-movement-grid">
        {/* 1. Top Weekly Gainers */}
        <div className="mp-movement-column">
          <div className="mp-movement-col-header">
            <div className="mp-movement-col-title">
              <div style={{ padding: '3px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', display: 'flex' }}>
                <TrendingUp size={13} />
              </div>
              <span style={{ color: '#10B981' }}>Top Weekly Gainers</span>
            </div>
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--ol-text-muted, #64748B)' }}>
              7D DELTA
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topGainers.map((spot) => (
              <div
                key={spot.routeCode}
                onClick={() => onSelectRoute(spot.routeCode)}
                className="mp-movement-item"
              >
                <div style={{ minWidth: 0, flex: '1 1 auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="mp-movement-route-code">
                      {spot.routeCode}
                    </span>
                    <span style={{ fontSize: '9.5px', fontFamily: 'var(--font-mono, monospace)', padding: '1px 5px', borderRadius: '3px', background: 'var(--ol-surface-primary, #091A2A)', border: '1px solid rgba(100, 190, 240, 0.12)', color: 'var(--ol-text-secondary, #94A3B8)' }}>
                      {spot.vesselClass}
                    </span>
                  </div>
                  <div className="mp-movement-desc" title={spot.routeName}>
                    {spot.routeName}
                  </div>
                </div>

                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                  <div className="mp-movement-rate">
                    {formatFreightRate(spot.rateTceUsdPerDay, spot.rateUnit)}
                  </div>
                  <div className="mp-movement-delta mp-delta-up">
                    <TrendingUp size={11} />
                    <span>+{spot.change7dPct}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Weekly Softening / Laggards */}
        <div className="mp-movement-column">
          <div className="mp-movement-col-header">
            <div className="mp-movement-col-title">
              <div style={{ padding: '3px', borderRadius: '4px', background: 'rgba(244, 63, 94, 0.15)', color: '#F43F5E', display: 'flex' }}>
                <TrendingDown size={13} />
              </div>
              <span style={{ color: '#F43F5E' }}>Weekly Softening / Laggards</span>
            </div>
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--ol-text-muted, #64748B)' }}>
              7D DELTA
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topDecliners.map((spot) => (
              <div
                key={spot.routeCode}
                onClick={() => onSelectRoute(spot.routeCode)}
                className="mp-movement-item"
              >
                <div style={{ minWidth: 0, flex: '1 1 auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="mp-movement-route-code">
                      {spot.routeCode}
                    </span>
                    <span style={{ fontSize: '9.5px', fontFamily: 'var(--font-mono, monospace)', padding: '1px 5px', borderRadius: '3px', background: 'var(--ol-surface-primary, #091A2A)', border: '1px solid rgba(100, 190, 240, 0.12)', color: 'var(--ol-text-secondary, #94A3B8)' }}>
                      {spot.vesselClass}
                    </span>
                  </div>
                  <div className="mp-movement-desc" title={spot.routeName}>
                    {spot.routeName}
                  </div>
                </div>

                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                  <div className="mp-movement-rate">
                    {formatFreightRate(spot.rateTceUsdPerDay, spot.rateUnit)}
                  </div>
                  <div className="mp-movement-delta mp-delta-down">
                    <TrendingDown size={11} />
                    <span>{spot.change7dPct}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Primary Derivative Spreads */}
        <div className="mp-movement-column">
          <div className="mp-movement-col-header">
            <div className="mp-movement-col-title">
              <div style={{ padding: '3px', borderRadius: '4px', background: 'rgba(168, 85, 247, 0.15)', color: '#C084FC', display: 'flex' }}>
                <Scale size={13} />
              </div>
              <span style={{ color: '#C084FC' }}>Spot vs FFA Basis Leaders</span>
            </div>
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--ol-text-muted, #64748B)' }}>
              BASIS SPREAD
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {spreadLeaders.map(({ spot, curve, spreadUsd, spreadPct }) => {
              const isContango = (curve?.curveStructure === 'Contango') || spreadUsd >= 0;

              return (
                <div
                  key={spot.routeCode}
                  onClick={() => onSelectRoute(spot.routeCode)}
                  className="mp-movement-item"
                >
                  <div style={{ minWidth: 0, flex: '1 1 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="mp-movement-route-code">
                        {spot.routeCode}
                      </span>
                      <span style={{ fontSize: '9.5px', fontFamily: 'var(--font-mono, monospace)', padding: '1px 5px', borderRadius: '3px', background: 'var(--ol-surface-primary, #091A2A)', border: '1px solid rgba(100, 190, 240, 0.12)', color: 'var(--ol-text-secondary, #94A3B8)' }}>
                        {curve ? curve.curveStructure : spot.vesselClass}
                      </span>
                    </div>
                    <div className="mp-movement-desc" title={spot.routeName}>
                      {spot.routeName}
                    </div>
                  </div>

                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    <div className="mp-movement-rate" style={{ color: 'var(--ol-cyan, #22D3EE)' }}>
                      FFA {curve ? formatFreightRate(curve.frontMonthFfaUsdPerDay) : 'N/A'}
                    </div>
                    <div className={`mp-movement-delta ${isContango ? 'mp-delta-up' : 'mp-delta-down'}`}>
                      {isContango ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      <span>{spreadUsd >= 0 ? '+' : ''}${Math.round(spreadUsd).toLocaleString()} ({spreadPct}%)</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 23: Market Prices — Cross-Corridor Freight Benchmark Table
 * Canonical Enterprise Design System Refactor
 */

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Layers,
} from 'lucide-react';
import type { SpotPriceRecord, RouteForwardCurve } from '../../../../types/market-prices';
import { formatFreightRate } from '../../../../services/market-prices/market-prices-analytics-engine';

interface RouteComparisonTableProps {
  spotPrices: SpotPriceRecord[];
  forwardCurves: Record<string, RouteForwardCurve>;
  selectedRouteCode: string;
  onSelectRoute: (code: string) => void;
  comparisonRouteCodes: string[];
  onToggleComparisonRoute: (code: string) => void;
}

export const RouteComparisonTable: React.FC<RouteComparisonTableProps> = ({
  spotPrices,
  forwardCurves,
  selectedRouteCode,
  onSelectRoute,
  comparisonRouteCodes,
  onToggleComparisonRoute,
}) => {
  const [sortField, setSortField] = useState<'rate' | 'change7d' | 'change30d' | 'spread'>('rate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedSpots = useMemo(() => {
    const list = [...spotPrices];
    list.sort((a, b) => {
      let diff = 0;
      if (sortField === 'rate') {
        diff = a.rateTceUsdPerDay - b.rateTceUsdPerDay;
      } else if (sortField === 'change7d') {
        diff = a.change7dPct - b.change7dPct;
      } else if (sortField === 'change30d') {
        diff = a.change30dPct - b.change30dPct;
      } else if (sortField === 'spread') {
        const spreadA = forwardCurves[a.routeCode]?.spotVsFfaSpreadUsd || 0;
        const spreadB = forwardCurves[b.routeCode]?.spotVsFfaSpreadUsd || 0;
        diff = spreadA - spreadB;
      }
      return sortOrder === 'asc' ? diff : -diff;
    });
    return list;
  }, [spotPrices, forwardCurves, sortField, sortOrder]);

  const handleSort = (field: 'rate' | 'change7d' | 'change30d' | 'spread') => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="mp-card" style={{ padding: '20px', width: '100%' }}>
      {/* Header */}
      <div className="mp-card-header">
        <div className="mp-card-header-left">
          <div className="mp-card-icon-wrap mp-icon-cyan">
            <Layers size={18} />
          </div>
          <div>
            <h3 className="mp-card-title">
              Cross-Corridor Freight Benchmark Table
            </h3>
            <p className="mp-card-subtitle">
              Comparative matrix evaluating physical spot TCE earnings, weekly momentum, and forward derivative spreads
            </p>
          </div>
        </div>

        <div style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--ol-text-secondary, #94A3B8)' }}>
          <span>Quoting {spotPrices.length} Verified Baltic Corridors</span>
        </div>
      </div>

      {/* Horizontally Scrollable Table Container */}
      <div className="mp-table-container">
        <table className="mp-table">
          <thead>
            <tr>
              <th className="mp-col-comp">Compare</th>
              <th className="mp-col-route">Route / Vessel Class</th>
              <th className="mp-col-segment">Segment / Region</th>
              <th
                onClick={() => handleSort('rate')}
                className="mp-col-spot sortable"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px' }}>
                  <span>Spot TCE</span>
                  <ArrowUpDown size={12} style={{ color: sortField === 'rate' ? 'var(--ol-cyan, #22D3EE)' : '#64748B' }} />
                </div>
              </th>
              <th
                onClick={() => handleSort('change7d')}
                className="mp-col-7d sortable"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px' }}>
                  <span>7D Move</span>
                  <ArrowUpDown size={12} style={{ color: sortField === 'change7d' ? 'var(--ol-cyan, #22D3EE)' : '#64748B' }} />
                </div>
              </th>
              <th
                onClick={() => handleSort('change30d')}
                className="mp-col-30d sortable"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px' }}>
                  <span>30D Move</span>
                  <ArrowUpDown size={12} style={{ color: sortField === 'change30d' ? 'var(--ol-cyan, #22D3EE)' : '#64748B' }} />
                </div>
              </th>
              <th className="mp-col-ffa">Front FFA</th>
              <th
                onClick={() => handleSort('spread')}
                className="mp-col-spread sortable"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px' }}>
                  <span>Spot/FFA Spread</span>
                  <ArrowUpDown size={12} style={{ color: sortField === 'spread' ? 'var(--ol-cyan, #22D3EE)' : '#64748B' }} />
                </div>
              </th>
              <th className="mp-col-curve">Curve Shape</th>
              <th className="mp-col-action">Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedSpots.map((spot) => {
              const curve = forwardCurves[spot.routeCode];
              const isSelected = spot.routeCode === selectedRouteCode;
              const isCompared = comparisonRouteCodes.includes(spot.routeCode);
              const is7dUp = spot.change7dPct >= 0;
              const is30dUp = spot.change30dPct >= 0;

              return (
                <tr
                  key={spot.routeCode}
                  className={isSelected ? 'selected' : ''}
                >
                  {/* Compare Checkbox */}
                  <td className="mp-col-comp">
                    <input
                      type="checkbox"
                      checked={isCompared}
                      onChange={() => onToggleComparisonRoute(spot.routeCode)}
                      style={{ cursor: 'pointer', width: '15px', height: '15px', accentColor: 'var(--ol-cyan, #22D3EE)' }}
                      title="Add to comparison workspace"
                    />
                  </td>

                  {/* Route & Vessel Class */}
                  <td className="mp-col-route">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)', fontSize: '12px' }}>
                        {spot.routeCode}
                      </span>
                      <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', padding: '2px 6px', borderRadius: '4px', background: 'var(--ol-surface-secondary, #0B1D2E)', border: '1px solid rgba(100, 190, 240, 0.16)', color: 'var(--ol-text-secondary, #94A3B8)' }}>
                        {spot.vesselClass}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--ol-text-muted, #64748B)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {spot.routeName}
                    </div>
                  </td>

                  {/* Segment / Region */}
                  <td className="mp-col-segment">
                    <div style={{ fontWeight: 600, color: 'var(--ol-text-primary, #F1F5F9)', fontSize: '11.5px' }}>
                      {spot.marketSegment}
                    </div>
                    <div style={{ fontSize: '10.5px', color: 'var(--ol-text-muted, #64748B)' }}>
                      {spot.region}
                    </div>
                  </td>

                  {/* Spot TCE */}
                  <td className="mp-col-spot" style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)', fontSize: '13px' }}>
                    {formatFreightRate(spot.rateTceUsdPerDay, spot.rateUnit)}
                  </td>

                  {/* 7D Move */}
                  <td className="mp-col-7d" style={{ fontFamily: 'var(--font-mono, monospace)' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: is7dUp ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                        color: is7dUp ? '#10B981' : '#F43F5E',
                        border: `1px solid ${is7dUp ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)'}`,
                      }}
                    >
                      {is7dUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      <span>{is7dUp ? '+' : ''}{spot.change7dPct}%</span>
                    </span>
                  </td>

                  {/* 30D Move */}
                  <td className="mp-col-30d" style={{ fontFamily: 'var(--font-mono, monospace)' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: is30dUp ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                        color: is30dUp ? '#10B981' : '#F43F5E',
                        border: `1px solid ${is30dUp ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)'}`,
                      }}
                    >
                      {is30dUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      <span>{is30dUp ? '+' : ''}{spot.change30dPct}%</span>
                    </span>
                  </td>

                  {/* Front FFA */}
                  <td className="mp-col-ffa" style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 600, color: 'var(--ol-cyan, #22D3EE)', fontSize: '12px' }}>
                    {curve ? formatFreightRate(curve.frontMonthFfaUsdPerDay) : 'N/A'}
                  </td>

                  {/* Spot/FFA Spread */}
                  <td className="mp-col-spread" style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 600, fontSize: '11.5px' }}>
                    {curve ? (
                      <span style={{ color: curve.spotVsFfaSpreadUsd >= 0 ? '#10B981' : '#F43F5E' }}>
                        {curve.spotVsFfaSpreadUsd >= 0 ? '+' : ''}${Math.round(curve.spotVsFfaSpreadUsd).toLocaleString()} (
                        {curve.spotVsFfaSpreadPct}%)
                      </span>
                    ) : (
                      <span style={{ color: 'var(--ol-text-muted, #64748B)' }}>N/A</span>
                    )}
                  </td>

                  {/* Curve Shape */}
                  <td className="mp-col-curve">
                    {curve ? (
                      <span
                        className={`mp-curve-badge ${
                          curve.curveStructure === 'Contango'
                            ? 'mp-curve-contango'
                            : curve.curveStructure === 'Backwardation'
                            ? 'mp-curve-backwardation'
                            : 'mp-curve-flat'
                        }`}
                      >
                        {curve.curveStructure}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--ol-text-muted, #64748B)' }}>-</span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="mp-col-action">
                    <button
                      type="button"
                      onClick={() => onSelectRoute(spot.routeCode)}
                      className={`mp-btn ${isSelected ? 'mp-btn-primary' : 'mp-btn-secondary'}`}
                      style={{ padding: '4px 10px', fontSize: '11px', width: '60px', justifyContent: 'center' }}
                    >
                      {isSelected ? 'Active' : 'Load'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 23: Market Prices — Freight Route Directory
 * Canonical Enterprise Design System Refactor
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Compass,
  ArrowRight,
  Check,
} from 'lucide-react';
import type { MaritimeRouteSpec, SpotPriceRecord } from '../../../../types/market-prices';
import { formatFreightRate } from '../../../../services/market-prices/market-prices-analytics-engine';

interface RouteSelectorProps {
  routes: MaritimeRouteSpec[];
  spotPrices: SpotPriceRecord[];
  selectedRouteCode: string;
  onSelectRoute: (code: string) => void;
}

export const RouteSelector: React.FC<RouteSelectorProps> = ({
  routes,
  spotPrices,
  selectedRouteCode,
  onSelectRoute,
}) => {
  const [search, setSearch] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<string>('ALL');

  const spotMap = useMemo(() => {
    return Object.fromEntries(spotPrices.map((s) => [s.routeCode, s]));
  }, [spotPrices]);

  const filtered = useMemo(() => {
    return routes.filter((r) => {
      const matchSegment = selectedSegment === 'ALL' || r.marketSegment === selectedSegment;
      const q = search.toLowerCase();
      const matchSearch =
        r.routeCode.toLowerCase().includes(q) ||
        r.routeName.toLowerCase().includes(q) ||
        r.vesselClass.toLowerCase().includes(q) ||
        r.originPort.toLowerCase().includes(q) ||
        r.destinationPort.toLowerCase().includes(q);
      return matchSegment && matchSearch;
    });
  }, [routes, selectedSegment, search]);

  const segments = ['ALL', 'Crude Tanker', 'Clean Product', 'Dry Bulk', 'LNG'];

  return (
    <div className="mp-card" style={{ padding: '20px', width: '100%' }}>
      {/* Header */}
      <div className="mp-card-header">
        <div className="mp-card-header-left">
          <div className="mp-card-icon-wrap mp-icon-cyan">
            <Compass size={18} />
          </div>
          <div>
            <h3 className="mp-card-title">
              Freight Route Directory
            </h3>
            <p className="mp-card-subtitle">
              Select an international freight corridor to load physical spot benchmarks and forward curves
            </p>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '220px' }}>
          <Search size={14} style={{ color: 'var(--ol-text-muted, #64748B)', position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search corridors..."
            style={{
              width: '100%',
              height: '32px',
              paddingLeft: '32px',
              paddingRight: '10px',
              backgroundColor: 'var(--ol-surface-secondary, #0B1D2E)',
              border: '1px solid var(--ol-border, rgba(100, 190, 240, 0.18))',
              borderRadius: '6px',
              color: 'var(--ol-text-primary, #F1F5F9)',
              fontSize: '11.5px',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Segment Chips */}
      <div className="mp-segmented-group" style={{ alignSelf: 'flex-start' }}>
        {segments.map((seg) => (
          <button
            key={seg}
            type="button"
            onClick={() => setSelectedSegment(seg)}
            className={`mp-segmented-btn ${selectedSegment === seg ? 'active' : ''}`}
          >
            {seg}
          </button>
        ))}
      </div>

      {/* Routes Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px', maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
        {filtered.map((route) => {
          const isSelected = route.routeCode === selectedRouteCode;
          const spot = spotMap[route.routeCode];

          return (
            <div
              key={route.routeCode}
              onClick={() => onSelectRoute(route.routeCode)}
              className="mp-movement-item"
              style={{
                flexDirection: 'column',
                alignItems: 'stretch',
                padding: '12px',
                borderColor: isSelected ? 'var(--ol-cyan, #22D3EE)' : undefined,
                backgroundColor: isSelected ? 'rgba(34, 211, 238, 0.08)' : undefined,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, fontSize: '12.5px', color: 'var(--ol-text-primary, #F1F5F9)' }}>
                      {route.routeCode}
                    </span>
                    <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', padding: '1px 5px', borderRadius: '3px', background: 'var(--ol-surface-primary, #091A2A)', border: '1px solid rgba(100, 190, 240, 0.12)', color: 'var(--ol-text-secondary, #94A3B8)' }}>
                      {route.vesselClass}
                    </span>
                  </div>
                  {isSelected && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', fontWeight: 700, color: 'var(--ol-cyan, #22D3EE)', fontFamily: 'var(--font-mono, monospace)' }}>
                      <Check size={11} /> ACTIVE
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--ol-text-primary, #F1F5F9)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {route.routeName}
                </div>

                <div style={{ fontSize: '10.5px', color: 'var(--ol-text-muted, #64748B)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>{route.originPort}</span>
                  <ArrowRight size={10} style={{ color: 'var(--ol-text-secondary, #94A3B8)' }} />
                  <span>{route.destinationPort}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', marginTop: '8px', borderTop: '1px solid rgba(100, 190, 240, 0.08)', fontSize: '11px' }}>
                <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)' }}>
                  {spot ? formatFreightRate(spot.rateTceUsdPerDay, spot.rateUnit) : 'N/A'}
                </span>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--ol-text-secondary, #94A3B8)' }}>
                  {route.distanceNm.toLocaleString()} NM • {route.typicalVoyageDays}d
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

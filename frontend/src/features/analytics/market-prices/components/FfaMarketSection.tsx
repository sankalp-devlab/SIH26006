import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Layers,
  Search,
  Filter,
} from 'lucide-react';
import type { FfaContractRecord } from '../../../../types/market-prices';
import { formatFreightRate } from '../../../../services/market-prices/market-prices-analytics-engine';

interface FfaMarketSectionProps {
  ffaContracts: FfaContractRecord[];
  selectedRouteCode: string;
  onSelectRoute: (code: string) => void;
  availableRoutes: string[];
}

export const FfaMarketSection: React.FC<FfaMarketSectionProps> = ({
  ffaContracts,
  selectedRouteCode,
  onSelectRoute,
  availableRoutes,
}) => {
  const [filterRoute, setFilterRoute] = useState<string>(selectedRouteCode);
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filtered = useMemo(() => {
    return ffaContracts.filter((c) => {
      const matchRoute = filterRoute === 'ALL' || c.routeCode === filterRoute;
      const matchClass = filterClass === 'ALL' || c.vesselClass === filterClass;
      const matchSearch =
        searchTerm.trim() === '' ||
        c.routeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.tenorLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.vesselClass.toLowerCase().includes(searchTerm.toLowerCase());
      return matchRoute && matchClass && matchSearch;
    });
  }, [ffaContracts, filterRoute, filterClass, searchTerm]);

  return (
    <div className="mp-card">
      {/* Header Controls */}
      <div className="mp-card-header">
        <div className="mp-card-header-left">
          <div className="mp-card-icon-wrap" style={{ color: 'var(--ol-blue, #3B82F6)', background: 'rgba(59, 130, 246, 0.12)' }}>
            <Layers size={18} />
          </div>
          <div>
            <div className="mp-card-title">
              FFA Forward Freight Agreement Contracts
            </div>
            <div className="mp-card-subtitle">
              Clear settlement quotes, Bid/Ask spreads, volume lots, and open interest across forward tenors
            </div>
          </div>
        </div>

        {/* Route and Tenor Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Route dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--ol-surface-secondary, #0B1D2E)', border: '1px solid var(--ol-border, rgba(100, 190, 240, 0.16))', borderRadius: '6px', padding: '4px 10px', fontSize: '12px' }}>
            <Filter size={13} style={{ color: 'var(--ol-text-secondary, #94A3B8)' }} />
            <span style={{ color: 'var(--ol-text-secondary, #94A3B8)' }}>Route:</span>
            <select
              value={filterRoute}
              onChange={(e) => {
                setFilterRoute(e.target.value);
                if (e.target.value !== 'ALL') onSelectRoute(e.target.value);
              }}
              style={{ background: 'transparent', color: 'var(--ol-text-primary, #F1F5F9)', fontFamily: 'var(--font-mono, monospace)', border: 'none', outline: 'none', cursor: 'pointer' }}
            >
              <option value="ALL" style={{ background: '#091A2A', color: '#fff' }}>All Routes (12)</option>
              {availableRoutes.map((code) => (
                <option key={code} value={code} style={{ background: '#091A2A', color: '#fff' }}>
                  {code}
                </option>
              ))}
            </select>
          </div>

          {/* Vessel Class dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--ol-surface-secondary, #0B1D2E)', border: '1px solid var(--ol-border, rgba(100, 190, 240, 0.16))', borderRadius: '6px', padding: '4px 10px', fontSize: '12px' }}>
            <span style={{ color: 'var(--ol-text-secondary, #94A3B8)' }}>Class:</span>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              style={{ background: 'transparent', color: 'var(--ol-text-primary, #F1F5F9)', fontFamily: 'var(--font-mono, monospace)', border: 'none', outline: 'none', cursor: 'pointer' }}
            >
              <option value="ALL" style={{ background: '#091A2A', color: '#fff' }}>All Classes</option>
              <option value="VLCC" style={{ background: '#091A2A', color: '#fff' }}>VLCC</option>
              <option value="Suezmax" style={{ background: '#091A2A', color: '#fff' }}>Suezmax</option>
              <option value="Aframax" style={{ background: '#091A2A', color: '#fff' }}>Aframax</option>
              <option value="Capesize" style={{ background: '#091A2A', color: '#fff' }}>Capesize</option>
              <option value="Panamax" style={{ background: '#091A2A', color: '#fff' }}>Panamax</option>
              <option value="Supramax" style={{ background: '#091A2A', color: '#fff' }}>Supramax</option>
              <option value="LNG Carrier" style={{ background: '#091A2A', color: '#fff' }}>LNG Carrier</option>
            </select>
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ol-text-secondary, #94A3B8)' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search contracts..."
              style={{
                background: 'var(--ol-surface-secondary, #0B1D2E)',
                border: '1px solid var(--ol-border, rgba(100, 190, 240, 0.16))',
                borderRadius: '6px',
                paddingLeft: '30px',
                paddingRight: '12px',
                paddingTop: '5px',
                paddingBottom: '5px',
                fontSize: '12px',
                color: 'var(--ol-text-primary, #F1F5F9)',
                outline: 'none',
                width: '180px',
              }}
            />
          </div>
        </div>
      </div>

      {/* FFA Table */}
      <div className="mp-table-container" style={{ marginTop: '4px' }}>
        <table className="mp-table" style={{ minWidth: '1000px' }}>
          <thead>
            <tr>
              <th style={{ width: '180px' }}>Contract / Tenor</th>
              <th style={{ width: '120px' }}>Route Code</th>
              <th style={{ width: '130px' }}>Vessel Class</th>
              <th style={{ width: '130px' }}>Settlement</th>
              <th style={{ width: '120px', textAlign: 'right' }}>Bid ($/day)</th>
              <th style={{ width: '120px', textAlign: 'right' }}>Ask ($/day)</th>
              <th style={{ width: '130px', textAlign: 'right' }}>Mid Quote</th>
              <th style={{ width: '110px', textAlign: 'right' }}>1D Change</th>
              <th style={{ width: '110px', textAlign: 'right' }}>Volume</th>
              <th style={{ width: '120px', textAlign: 'right' }}>Open Interest</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 30).map((c) => {
              const isUp = c.change1dPct >= 0;
              return (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                      <Calendar size={13} style={{ color: 'var(--ol-blue, #3B82F6)' }} />
                      <span>{c.tenorLabel}</span>
                      <span style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '3px', background: 'rgba(100, 190, 240, 0.1)', color: 'var(--ol-text-secondary, #94A3B8)', fontFamily: 'var(--font-mono, monospace)' }}>
                        {c.tenor}
                      </span>
                    </div>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => onSelectRoute(c.routeCode)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--ol-cyan, #22D3EE)',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono, monospace)',
                        cursor: 'pointer',
                        padding: 0,
                        textDecoration: 'underline',
                      }}
                    >
                      {c.routeCode}
                    </button>
                  </td>
                  <td style={{ color: 'var(--ol-text-secondary, #94A3B8)' }}>{c.vesselClass}</td>
                  <td style={{ color: 'var(--ol-text-muted, #64748B)', fontFamily: 'var(--font-mono, monospace)' }}>{c.settlementDate}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono, monospace)', color: 'var(--ol-green, #10B981)' }}>
                    ${c.bidPriceUsdPerDay.toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono, monospace)', color: 'var(--ol-red, #F43F5E)' }}>
                    ${c.askPriceUsdPerDay.toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, fontSize: '13px', color: '#fff' }}>
                    {formatFreightRate(c.midPriceUsdPerDay)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono, monospace)',
                        fontWeight: 600,
                        background: isUp ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                        color: isUp ? 'var(--ol-green, #10B981)' : 'var(--ol-red, #F43F5E)',
                        border: `1px solid ${isUp ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)'}`,
                      }}
                    >
                      {isUp ? '+' : ''}
                      {c.change1dPct}%
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono, monospace)', color: 'var(--ol-text-secondary, #94A3B8)' }}>
                    {c.volumeLots.toLocaleString()}{' '}
                    <span style={{ color: 'var(--ol-text-muted, #64748B)', fontSize: '10px' }}>lots</span>
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono, monospace)', color: 'var(--ol-text-secondary, #94A3B8)' }}>
                    {c.openInterestLots.toLocaleString()}{' '}
                    <span style={{ color: 'var(--ol-text-muted, #64748B)', fontSize: '10px' }}>lots</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid rgba(100, 190, 240, 0.1)', fontSize: '11.5px', color: 'var(--ol-text-muted, #64748B)', fontFamily: 'var(--font-mono, monospace)' }}>
        <span>Showing {Math.min(filtered.length, 30)} of {filtered.length} forward contracts</span>
        <span>Maturity horizon: Up to Cal 2028</span>
      </div>
    </div>
  );
};

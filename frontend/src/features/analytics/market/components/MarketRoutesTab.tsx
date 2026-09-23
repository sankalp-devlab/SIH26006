/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 5: Structured Route Corridors & Benchmark Data Table Tab
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Navigation,
  Search,
  Sliders,
  Calculator,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import type {
  MarketRoute,
  RouteFreightDetails
} from '../../../../types/market-insights';

interface MarketRoutesTabProps {
  routes: (MarketRoute & { freight: RouteFreightDetails })[];
  selectedRouteCode: string;
  onSelectRoute: (code: string) => void;
  onOpenComparison: (type: 'route', a: string, b: string) => void;
}

export const MarketRoutesTab: React.FC<MarketRoutesTabProps> = ({
  routes,
  selectedRouteCode,
  onSelectRoute,
  onOpenComparison
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState<'all' | 'dry' | 'tanker'>('all');
  const [classFilter, setClassFilter] = useState<string>('all');

  const filteredRoutes = useMemo(() => {
    return routes.filter((r) => {
      if (sectorFilter !== 'all' && r.sector !== sectorFilter) return false;
      if (classFilter !== 'all' && r.vessel_class !== classFilter) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (
          r.route_code.toLowerCase().includes(q) ||
          r.route_name.toLowerCase().includes(q) ||
          r.commodity.toLowerCase().includes(q) ||
          r.origin_port.toLowerCase().includes(q) ||
          r.destination_port.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [routes, sectorFilter, classFilter, searchTerm]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Filter and Search Bar */}
      <div className="mi-command-bar">
        <div className="mi-search-input-wrap">
          <Search size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search corridors, commodities, or ports..."
            className="mi-search-input"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Sector Filter Buttons */}
          <div className="mi-time-range-group">
            {(['all', 'dry', 'tanker'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSectorFilter(s)}
                className={`mi-time-pill ${sectorFilter === s ? 'active' : ''}`}
                style={{ textTransform: 'capitalize' }}
              >
                {s === 'all' ? 'All Sectors' : `${s} Bulk`}
              </button>
            ))}
          </div>

          {/* Class Filter */}
          <div className="mi-select-wrapper">
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="mi-select"
              style={{ minWidth: '150px' }}
            >
              <option value="all">All Vessel Classes</option>
              <option value="Capesize">Capesize</option>
              <option value="Panamax">Panamax</option>
              <option value="Supramax">Supramax</option>
              <option value="VLCC">VLCC</option>
              <option value="Aframax">Aframax</option>
              <option value="MR">MR</option>
            </select>
            <ChevronDown size={14} className="mi-select-chevron" />
          </div>
        </div>
      </div>

      {/* Corridors Table */}
      <div className="mi-card">
        <div className="mi-card-header">
          <div>
            <h3 className="mi-card-title">
              <Navigation size={16} style={{ color: '#22D3EE' }} />
              Structured Maritime Benchmark Corridors Catalog
            </h3>
            <p className="mi-card-subtitle">
              Authoritative market routes with distance, typical transit days, spot rate assessments, and short/medium-term variance
            </p>
          </div>
          <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#94A3B8' }}>
            Showing {filteredRoutes.length} of {routes.length} Corridors
          </span>
        </div>

        <div className="mi-table-container">
          <table className="mi-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Corridor / Trade Lane</th>
                <th>Sector</th>
                <th>Vessel Class</th>
                <th>Commodity</th>
                <th style={{ textAlign: 'right' }}>Distance</th>
                <th style={{ textAlign: 'right' }}>Days</th>
                <th style={{ textAlign: 'right' }}>Current Rate</th>
                <th style={{ textAlign: 'right' }}>1D %</th>
                <th style={{ textAlign: 'right' }}>30D %</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoutes.map((r) => {
                const isSelected = r.route_code === selectedRouteCode;
                return (
                  <tr
                    key={r.route_code}
                    onClick={() => onSelectRoute(r.route_code)}
                    className={isSelected ? 'selected' : ''}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {isSelected && <CheckCircle2 size={13} style={{ color: '#10B981' }} />}
                        <span style={{ fontWeight: 700, color: '#22D3EE', fontFamily: 'monospace' }}>
                          {r.route_code}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#F1F5F9' }}>
                        {r.route_name.split('(')[0]}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                        {r.origin_port} → {r.destination_port}
                      </div>
                    </td>
                    <td style={{ textTransform: 'capitalize', color: '#CBD5E1' }}>{r.sector}</td>
                    <td style={{ color: '#CBD5E1' }}>{r.vessel_class}</td>
                    <td style={{ color: '#CBD5E1' }}>{r.commodity}</td>
                    <td className="mi-table-num" style={{ color: '#94A3B8' }}>
                      {r.distance_nm.toLocaleString()} NM
                    </td>
                    <td className="mi-table-num" style={{ color: '#94A3B8' }}>
                      {r.typical_transit_days}d
                    </td>
                    <td className="mi-table-num" style={{ fontWeight: 700, color: '#F1F5F9' }}>
                      ${r.freight.current_rate.toLocaleString()}
                      <span style={{ fontSize: '10px', color: '#94A3B8', marginLeft: '4px', fontWeight: 500 }}>
                        {r.benchmark_unit}
                      </span>
                    </td>
                    <td className="mi-table-num" style={{
                      fontWeight: 700,
                      color: r.freight.change_1d_pct >= 0 ? '#10B981' : '#F43F5E'
                    }}>
                      {r.freight.change_1d_pct >= 0 ? `+${r.freight.change_1d_pct}%` : `${r.freight.change_1d_pct}%`}
                    </td>
                    <td className="mi-table-num" style={{
                      fontWeight: 700,
                      color: r.freight.change_30d_pct >= 0 ? '#10B981' : '#F43F5E'
                    }}>
                      {r.freight.change_30d_pct >= 0 ? `+${r.freight.change_30d_pct}%` : `${r.freight.change_30d_pct}%`}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onOpenComparison('route', r.route_code, r.related_routes[0] || 'C3')}
                          className="mi-btn mi-btn-secondary"
                          style={{ height: '28px', padding: '0 8px', fontSize: '11px' }}
                          title="Compare Corridor"
                        >
                          <Sliders size={13} style={{ color: '#22D3EE' }} />
                        </button>
                        <button
                          onClick={() => navigate('/voyage-calculator')}
                          className="mi-btn mi-btn-secondary"
                          style={{ height: '28px', padding: '0 8px', fontSize: '11px' }}
                          title="Calculate Voyage TCE"
                        >
                          <Calculator size={13} style={{ color: '#10B981' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


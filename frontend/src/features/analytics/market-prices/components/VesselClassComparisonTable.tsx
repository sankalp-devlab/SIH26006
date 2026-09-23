import React, { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Ship,
} from 'lucide-react';
import type { SpotPriceRecord, RouteForwardCurve, VesselClassType } from '../../../../types/market-prices';
import { formatFreightRate } from '../../../../services/market-prices/market-prices-analytics-engine';

interface VesselClassComparisonTableProps {
  spotPrices: SpotPriceRecord[];
  forwardCurves: Record<string, RouteForwardCurve>;
  onSelectVesselClass?: (cls: VesselClassType) => void;
}

export const VesselClassComparisonTable: React.FC<VesselClassComparisonTableProps> = ({
  spotPrices,
  forwardCurves,
  onSelectVesselClass,
}) => {
  // Aggregate stats by vessel class
  const classStats = useMemo(() => {
    const map: Record<
      string,
      {
        vesselClass: VesselClassType;
        segment: string;
        routesCount: number;
        totalSpot: number;
        totalChange7d: number;
        totalChange30d: number;
        totalFfaSpread: number;
      }
    > = {};

    spotPrices.forEach((s) => {
      if (!map[s.vesselClass]) {
        map[s.vesselClass] = {
          vesselClass: s.vesselClass,
          segment: s.marketSegment,
          routesCount: 0,
          totalSpot: 0,
          totalChange7d: 0,
          totalChange30d: 0,
          totalFfaSpread: 0,
        };
      }
      map[s.vesselClass].routesCount += 1;
      map[s.vesselClass].totalSpot += s.rateTceUsdPerDay;
      map[s.vesselClass].totalChange7d += s.change7dPct;
      map[s.vesselClass].totalChange30d += s.change30dPct;
      const curve = forwardCurves[s.routeCode];
      if (curve) {
        map[s.vesselClass].totalFfaSpread += curve.spotVsFfaSpreadUsd;
      }
    });

    const rows = Object.values(map).map((entry) => {
      const avgSpot = Math.round(entry.totalSpot / entry.routesCount);
      const avg7d = Math.round((entry.totalChange7d / entry.routesCount) * 10) / 10;
      const avg30d = Math.round((entry.totalChange30d / entry.routesCount) * 10) / 10;
      const avgSpread = Math.round(entry.totalFfaSpread / entry.routesCount);

      return {
        vesselClass: entry.vesselClass,
        segment: entry.segment,
        routesCount: entry.routesCount,
        avgSpot,
        avg7d,
        avg30d,
        avgSpread,
      };
    });

    // Rank descending by average spot
    rows.sort((a, b) => b.avgSpot - a.avgSpot);
    return rows;
  }, [spotPrices, forwardCurves]);

  return (
    <div className="mp-card">
      {/* Header */}
      <div className="mp-card-header">
        <div className="mp-card-header-left">
          <div className="mp-card-icon-wrap" style={{ color: 'var(--ol-indigo, #6366F1)', background: 'rgba(99, 102, 241, 0.12)' }}>
            <Ship size={18} />
          </div>
          <div>
            <div className="mp-card-title">
              Vessel Class Commercial Ranking
            </div>
            <div className="mp-card-subtitle">
              Aggregated daily TCE earnings and forward curves across major merchant fleet segments
            </div>
          </div>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--ol-text-secondary, #94A3B8)', fontFamily: 'var(--font-mono, monospace)' }}>
          <span>{classStats.length} Commercial Classes</span>
        </div>
      </div>

      {/* Table */}
      <div className="mp-table-container" style={{ marginTop: '4px' }}>
        <table className="mp-table" style={{ minWidth: '950px' }}>
          <thead>
            <tr>
              <th style={{ width: '60px', textAlign: 'center' }}>Rank</th>
              <th style={{ width: '160px' }}>Vessel Class</th>
              <th style={{ width: '160px' }}>Market Segment</th>
              <th style={{ width: '150px', textAlign: 'center' }}>Benchmark Corridors</th>
              <th style={{ width: '140px', textAlign: 'right' }}>Avg Spot TCE</th>
              <th style={{ width: '120px', textAlign: 'right' }}>7D Momentum</th>
              <th style={{ width: '120px', textAlign: 'right' }}>30D Momentum</th>
              <th style={{ width: '160px', textAlign: 'right' }}>FFA Forward Spread</th>
            </tr>
          </thead>
          <tbody>
            {classStats.map((item, idx) => {
              const is7dUp = item.avg7d >= 0;
              const is30dUp = item.avg30d >= 0;

              return (
                <tr key={item.vesselClass}>
                  <td style={{ textAlign: 'center' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor:
                          idx === 0
                            ? 'rgba(245, 158, 11, 0.18)'
                            : idx === 1
                            ? 'rgba(226, 232, 240, 0.14)'
                            : idx === 2
                            ? 'rgba(180, 83, 9, 0.18)'
                            : 'rgba(100, 190, 240, 0.08)',
                        color:
                          idx === 0
                            ? 'var(--ol-amber, #F59E0B)'
                            : idx === 1
                            ? '#E2E8F0'
                            : idx === 2
                            ? '#D97706'
                            : 'var(--ol-text-secondary, #94A3B8)',
                        border: `1px solid ${
                          idx === 0
                            ? 'rgba(245, 158, 11, 0.3)'
                            : idx === 1
                            ? 'rgba(226, 232, 240, 0.25)'
                            : idx === 2
                            ? 'rgba(180, 83, 9, 0.3)'
                            : 'transparent'
                        }`,
                      }}
                    >
                      {idx + 1}
                    </span>
                  </td>

                  <td>
                    {onSelectVesselClass ? (
                      <button
                        type="button"
                        onClick={() => onSelectVesselClass(item.vesselClass)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--ol-text-primary, #F1F5F9)',
                          fontWeight: 700,
                          fontSize: '13px',
                          cursor: 'pointer',
                          padding: 0,
                          textAlign: 'left',
                        }}
                      >
                        {item.vesselClass}
                      </button>
                    ) : (
                      <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--ol-text-primary, #F1F5F9)' }}>
                        {item.vesselClass}
                      </span>
                    )}
                  </td>

                  <td style={{ color: 'var(--ol-text-secondary, #94A3B8)' }}>{item.segment}</td>

                  <td style={{ textAlign: 'center', color: 'var(--ol-text-muted, #64748B)' }}>
                    {item.routesCount} Corridors
                  </td>

                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, fontSize: '13px', color: '#fff' }}>
                    {formatFreightRate(item.avgSpot)}
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono, monospace)',
                        fontWeight: 600,
                        background: is7dUp ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                        color: is7dUp ? 'var(--ol-green, #10B981)' : 'var(--ol-red, #F43F5E)',
                      }}
                    >
                      {is7dUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {is7dUp ? '+' : ''}
                      {item.avg7d}%
                    </span>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono, monospace)',
                        fontWeight: 600,
                        background: is30dUp ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                        color: is30dUp ? 'var(--ol-green, #10B981)' : 'var(--ol-red, #F43F5E)',
                      }}
                    >
                      {is30dUp ? '+' : ''}
                      {item.avg30d}%
                    </span>
                  </td>

                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono, monospace)' }}>
                    <span style={{ color: item.avgSpread >= 0 ? 'var(--ol-green, #10B981)' : 'var(--ol-red, #F43F5E)', fontWeight: 600 }}>
                      {item.avgSpread >= 0 ? '+' : ''}${item.avgSpread.toLocaleString()}/day
                    </span>
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

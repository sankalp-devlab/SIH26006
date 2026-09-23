import React, { useState, useMemo } from 'react';
import {
  Bell,
  AlertTriangle,
  Info,
  Clock,
} from 'lucide-react';
import type { MarketPriceSignal } from '../../../../types/market-prices';

interface MarketSignalsFeedProps {
  signals: MarketPriceSignal[];
  onSelectRoute?: (code: string) => void;
}

export const MarketSignalsFeed: React.FC<MarketSignalsFeedProps> = ({
  signals,
  onSelectRoute,
}) => {
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');

  const filtered = useMemo(() => {
    return signals.filter(
      (s) => severityFilter === 'ALL' || s.severity === severityFilter
    );
  }, [signals, severityFilter]);

  const highSeverityCount = signals.filter((s) => s.severity === 'HIGH').length;

  const getSeverityBadge = (sev: MarketPriceSignal['severity']) => {
    switch (sev) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <AlertTriangle className="w-3 h-3" />
            HIGH ALERT
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" />
            MEDIUM
          </span>
        );
      case 'LOW':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <Info className="w-3 h-3" />
            LOW RISK
          </span>
        );
    }
  };

  return (
    <div className="mp-card">
      {/* Header */}
      <div className="mp-card-header">
        <div className="mp-card-header-left">
          <div className="mp-card-icon-wrap" style={{ color: 'var(--ol-red, #F43F5E)', background: 'rgba(244, 63, 94, 0.12)' }}>
            <Bell size={18} />
          </div>
          <div>
            <div className="mp-card-title">
              Market Signals & Volatility Triggers
            </div>
            <div className="mp-card-subtitle">
              Active anomaly detections, forward curve divergences, and freight rate breakouts
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {highSeverityCount > 0 && (
            <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: 'var(--ol-red, #F43F5E)' }}>
              {highSeverityCount} HIGH PRIORITY
            </span>
          )}
          <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--ol-text-secondary, #94A3B8)', background: 'var(--ol-surface-secondary, #0B1D2E)', border: '1px solid var(--ol-border, rgba(100, 190, 240, 0.16))' }}>
            {signals.length} ACTIVE SIGNALS
          </span>
        </div>
      </div>

      {/* Severity Filter Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '10px', borderBottom: '1px solid rgba(100, 190, 240, 0.08)', fontSize: '12px' }}>
        <span style={{ color: 'var(--ol-text-muted, #64748B)', fontWeight: 500, marginRight: '4px' }}>Filter Severity:</span>
        {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => (
          <button
            key={sev}
            type="button"
            onClick={() => setSeverityFilter(sev)}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid',
              borderColor: severityFilter === sev ? 'var(--ol-cyan, #22D3EE)' : 'transparent',
              background: severityFilter === sev ? 'rgba(34, 211, 238, 0.12)' : 'transparent',
              color: severityFilter === sev ? 'var(--ol-cyan, #22D3EE)' : 'var(--ol-text-secondary, #94A3B8)',
              transition: 'all 0.15s ease',
            }}
          >
            {sev}
          </button>
        ))}
      </div>

      {/* Signals List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
        {filtered.map((sig) => (
          <div
            key={sig.id}
            style={{
              backgroundColor: 'var(--ol-surface-secondary, #0B1D2E)',
              border: '1px solid rgba(100, 190, 240, 0.1)',
              borderRadius: '8px',
              padding: '14px 16px',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {getSeverityBadge(sig.severity)}
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff', letterSpacing: '0.01em' }}>
                  {sig.title}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11.5px', color: 'var(--ol-text-muted, #64748B)', fontFamily: 'var(--font-mono, monospace)' }}>
                {onSelectRoute && (
                  <button
                    type="button"
                    onClick={() => onSelectRoute(sig.routeCode)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--ol-cyan, #22D3EE)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                      textDecoration: 'underline',
                    }}
                  >
                    {sig.routeCode} ({sig.vesselClass})
                  </button>
                )}
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} />
                  <span>{sig.timestamp}</span>
                </span>
              </div>
            </div>

            <p style={{ fontSize: '12.5px', color: 'var(--ol-text-secondary, #94A3B8)', lineHeight: 1.5, margin: 0 }}>
              {sig.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

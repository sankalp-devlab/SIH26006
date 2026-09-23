import React from 'react';
import {
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  ShieldCheck,
  Ship,
  Package,
  DollarSign,
  Anchor,
  Navigation
} from 'lucide-react';
import type {
  MarketSignalSummary,
  MarketInsightsTab
} from '../../../../types/market-insights';

interface MarketSignalsCardProps {
  signals?: MarketSignalSummary;
  onNavigateTab: (tab: MarketInsightsTab) => void;
}

export const MarketSignalsCard: React.FC<MarketSignalsCardProps> = ({
  signals,
  onNavigateTab
}) => {
  if (!signals) return null;

  const renderDirectionIcon = (dir: 'up' | 'down' | 'neutral') => {
    if (dir === 'up') {
      return <ArrowUpRight size={14} color="#10B981" />;
    }
    if (dir === 'down') {
      return <ArrowDownRight size={14} color="#F43F5E" />;
    }
    return <Minus size={14} color="#94A3B8" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'tightening':
        return <span className="mi-badge mi-badge-amber">Tightening</span>;
      case 'easing':
        return <span className="mi-badge mi-badge-green">Easing</span>;
      case 'elevated':
        return <span className="mi-badge mi-badge-red">Elevated</span>;
      case 'subdued':
        return <span className="mi-badge mi-badge-cyan">Subdued</span>;
      default:
        return <span className="mi-badge mi-badge-slate">Neutral</span>;
    }
  };

  const mapSignalToTab = (key: string): MarketInsightsTab => {
    switch (key) {
      case 'supply': return 'supply';
      case 'demand': return 'demand';
      case 'freight': return 'freight';
      case 'congestion': return 'congestion';
      case 'availability': return 'supply';
      default: return 'overview';
    }
  };

  const getSignalIcon = (key: string) => {
    switch (key) {
      case 'supply': return <Ship size={15} className="mi-signal-icon" />;
      case 'demand': return <Package size={15} className="mi-signal-icon" />;
      case 'freight': return <DollarSign size={15} className="mi-signal-icon" />;
      case 'congestion': return <Anchor size={15} className="mi-signal-icon" />;
      case 'availability': return <Navigation size={15} className="mi-signal-icon" />;
      default: return <Activity size={15} className="mi-signal-icon" />;
    }
  };

  const formatBalanceState = (state: string) => {
    switch (state) {
      case 'tightening': return { label: 'Supply-Demand Tightening', color: '#F59E0B', border: 'rgba(245, 158, 11, 0.3)', bg: 'rgba(245, 158, 11, 0.12)' };
      case 'widening': return { label: 'Supply-Demand Widening', color: '#10B981', border: 'rgba(16, 185, 129, 0.3)', bg: 'rgba(16, 185, 129, 0.12)' };
      case 'supply_constrained': return { label: 'Supply Constrained', color: '#F43F5E', border: 'rgba(244, 63, 94, 0.3)', bg: 'rgba(244, 63, 94, 0.12)' };
      case 'demand_softening': return { label: 'Demand Softening', color: '#22D3EE', border: 'rgba(34, 211, 238, 0.3)', bg: 'rgba(34, 211, 238, 0.12)' };
      default: return { label: 'Market in Equilibrium', color: '#94A3B8', border: 'rgba(100, 190, 240, 0.2)', bg: 'rgba(11, 29, 46, 0.8)' };
    }
  };

  const balanceStyle = formatBalanceState(signals.directional_pressure);

  return (
    <div className="mi-signals-panel">
      {/* 1. Header with Balance Synthesis */}
      <div className="mi-signals-header">
        <div className="mi-signals-title-group">
          <div className="mi-signals-icon-badge">
            <Activity size={18} />
          </div>
          <div>
            <h3 className="mi-signals-title">
              Market Signals & Balance Synthesis
              <span className="mi-signals-title-tag">
                (Algorithmic Multi-Pillar Index)
              </span>
            </h3>
            <p className="mi-signals-subtitle">
              Normalized supply, demand, freight rate momentum, and port turnaround signals
            </p>
          </div>
        </div>

        {/* Directional Pressure Badge & Model Confidence */}
        <div className="mi-signals-summary-row">
          <div
            className="mi-pressure-badge"
            style={{
              backgroundColor: balanceStyle.bg,
              border: `1px solid ${balanceStyle.border}`,
              color: balanceStyle.color
            }}
          >
            <Sparkles size={14} color={balanceStyle.color} />
            <span>{balanceStyle.label}</span>
          </div>

          <div className="mi-confidence-badge">
            <span className="mi-confidence-label">Model Confidence</span>
            <span className="mi-confidence-val">{signals.confidence_score_pct}%</span>
          </div>
        </div>
      </div>

      {/* 2. Full-Width Narrative Synthesis Banner */}
      <div className="mi-assessment-banner">
        <ShieldCheck size={18} className="mi-assessment-icon" />
        <div>
          <span className="mi-assessment-highlight">Commercial Assessment:</span>
          <span>{signals.pressure_narrative}</span>
        </div>
      </div>

      {/* 3. 5 Real-Time Synthesized Signal Cards in 3+2 Balanced Grid */}
      <div className="mi-signals-grid">
        {signals.signals.map((sig) => (
          <div
            key={sig.key}
            onClick={() => onNavigateTab(mapSignalToTab(sig.key))}
            className="mi-signal-card"
            title={`Click to view ${sig.title} analytics`}
          >
            <div>
              <div className="mi-signal-card-header">
                <div className="mi-signal-title-wrap">
                  {getSignalIcon(sig.key)}
                  <span className="mi-signal-title">
                    {sig.title}
                  </span>
                </div>
                {getStatusBadge(sig.status)}
              </div>

              <div className="mi-signal-metric-row">
                <span className="mi-signal-metric-val">
                  {sig.key === 'freight' ? `$${sig.current_value.toLocaleString()}` : sig.current_value.toLocaleString()}
                </span>
                <span className="mi-signal-metric-unit">
                  {sig.unit}
                </span>
              </div>

              <div className="mi-signal-delta-row">
                {renderDirectionIcon(sig.direction)}
                <span style={{ color: sig.delta_pct > 0 ? '#10B981' : sig.delta_pct < 0 ? '#F43F5E' : '#94A3B8' }}>
                  {sig.delta_pct >= 0 ? `+${sig.delta_pct}%` : `${sig.delta_pct}%`}
                </span>
                <span style={{ fontSize: '10.5px', color: 'var(--ol-text-muted, #7189A3)', fontWeight: 500, marginLeft: '2px' }}>
                  vs 30d baseline
                </span>
              </div>
            </div>

            <div className="mi-signal-desc">
              {sig.summary}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


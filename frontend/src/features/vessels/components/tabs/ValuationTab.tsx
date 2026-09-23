import {
  DollarSign,
  TrendingUp,
  Scale,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import type { EnrichedVesselDetail } from '../../../../types/vessel-detail';

interface ValuationTabProps {
  data: EnrichedVesselDetail;
}

export function ValuationTab({ data }: ValuationTabProps) {
  const { valuation } = data;

  const maxVal = Math.max(...valuation.valuation_trend.map((t) => t.value_m), 1);

  return (
    <div className="vdd-tab-pane">
      {/* Valuation Headline Metrics */}
      <div className="vdd-section">
        <h4 className="vdd-section-title">
          <DollarSign size={14} />
          Asset Valuation &amp; Residual Worth
        </h4>
        <div className="vdd-spec-grid">
          <div className="vdd-metric-card highlight-gold">
            <span className="label">Current Market Value</span>
            <span className="value">${valuation.current_market_value_usd_m.toFixed(1)}M</span>
            <span className="sub">Fair Market Value (FMV)</span>
          </div>
          <div className="vdd-metric-card highlight-silver">
            <span className="label">Demolition / Scrap Value</span>
            <span className="value">${valuation.demolition_scrap_value_usd_m.toFixed(1)}M</span>
            <span className="sub">@ ${valuation.scrap_rate_per_ldt}/LDT Subcontinent</span>
          </div>
          <div className="vdd-metric-card">
            <span className="label">1-Year Prior FMV</span>
            <span className="value">${valuation.historical_1y_ago_usd_m.toFixed(1)}M</span>
            <span className="sub">-7.4% YOY Adjustment</span>
          </div>
          <div className="vdd-metric-card">
            <span className="label">Newbuilding Yard Parity</span>
            <span className="value">${valuation.newbuilding_parity_usd_m.toFixed(1)}M</span>
            <span className="sub">Current Orderbook Benchmark</span>
          </div>
        </div>
      </div>

      {/* Historical Asset Price Trajectory (5-Year Bar Trend) */}
      <div className="vdd-section">
        <h4 className="vdd-section-title">
          <TrendingUp size={14} />
          5-Year Asset Value Trajectory (USD Millions)
        </h4>

        <div className="vdd-valuation-chart-card">
          <div className="vdd-chart-bars">
            {valuation.valuation_trend.map((point) => {
              const heightPercent = Math.round((point.value_m / maxVal) * 100);
              const isLatest = point.year === 2026;
              return (
                <div key={point.year} className="vdd-bar-col">
                  <span className="val">${point.value_m}M</span>
                  <div className="bar-track">
                    <div
                      className={`bar-fill ${isLatest ? 'current' : ''}`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="year">{point.year}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Appraisal Metadata */}
      <div className="vdd-section">
        <h4 className="vdd-section-title">
          <Scale size={14} />
          Appraisal Intelligence &amp; Governance
        </h4>
        <div className="vdd-kv-table">
          <div className="vdd-kv-row">
            <span className="key"><Calendar size={13} /> Last Automated Appraisal</span>
            <span className="val">{valuation.last_appraisal_date}</span>
          </div>
          <div className="vdd-kv-row">
            <span className="key"><ShieldCheck size={13} /> Algorithm Confidence</span>
            <span className="val tag-green">{valuation.valuation_confidence} (BKI Automated Freight Matrix)</span>
          </div>
          <div className="vdd-kv-row">
            <span className="key">Demolition Scrap Benchmark</span>
            <span className="val">${valuation.scrap_rate_per_ldt} USD / Lightweight Ton (LDT)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

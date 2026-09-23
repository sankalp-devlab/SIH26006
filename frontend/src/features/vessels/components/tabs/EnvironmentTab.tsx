import {
  Leaf,
  ShieldCheck,
  Fuel,
  CheckCircle2,
  TrendingDown,
} from 'lucide-react';
import type { EnrichedVesselDetail } from '../../../../types/vessel-detail';

interface EnvironmentTabProps {
  data: EnrichedVesselDetail;
}

export function EnvironmentTab({ data }: EnvironmentTabProps) {
  const { environmental } = data;

  const getCiiColor = (rating: string) => {
    switch (rating) {
      case 'A': return '#10b981'; // Emerald
      case 'B': return '#34d399'; // Green
      case 'C': return '#f59e0b'; // Amber
      case 'D': return '#f97316'; // Orange
      case 'E': return '#ef4444'; // Red
      default: return '#64748b';
    }
  };

  const ratingColor = getCiiColor(environmental.cii_rating);

  return (
    <div className="vdd-tab-pane">
      {/* Carbon Intensity Indicator (CII) Card */}
      <div className="vdd-section">
        <h4 className="vdd-section-title">
          <Leaf size={14} />
          IMO Carbon Intensity Indicator (CII Rating)
        </h4>

        <div className="vdd-cii-card">
          <div className="vdd-cii-top">
            <div className="vdd-cii-badge" style={{ backgroundColor: ratingColor }}>
              <span>{environmental.cii_rating}</span>
            </div>
            <div className="vdd-cii-info">
              <div className="status">CII Grade {environmental.cii_rating} &middot; Compliant</div>
              <div className="score">
                Attained Index: <strong>{environmental.cii_score}</strong> gCO₂/dwt-nm &middot; Target: <strong>{environmental.cii_target}</strong>
              </div>
            </div>
            <div className="vdd-cii-trend">
              <TrendingDown size={14} color="#34d399" />
              <span>{environmental.co2_reduction_trend}% vs Baseline</span>
            </div>
          </div>

          {/* Visual Rating Ladder */}
          <div className="vdd-cii-scale">
            {['A', 'B', 'C', 'D', 'E'].map((letter) => {
              const active = letter === environmental.cii_rating;
              return (
                <div
                  key={letter}
                  className={`vdd-cii-step ${active ? 'active' : ''}`}
                  style={{
                    backgroundColor: active ? getCiiColor(letter) : 'rgba(255, 255, 255, 0.08)',
                    color: active ? '#ffffff' : '#94a3b8',
                  }}
                >
                  {letter}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Daily Emissions & Consumption */}
      <div className="vdd-section">
        <h4 className="vdd-section-title">
          <Fuel size={14} />
          Operational Emissions &amp; Fuel Burn
        </h4>
        <div className="vdd-spec-grid">
          <div className="vdd-metric-card highlight">
            <span className="label">Daily CO₂ Emissions</span>
            <span className="value">{environmental.daily_co2_emissions_mt} MT / day</span>
          </div>
          <div className="vdd-metric-card">
            <span className="label">AER Efficiency Index</span>
            <span className="value">{environmental.aer_metric} g/dwt-nm</span>
          </div>
          <div className="vdd-metric-card">
            <span className="label">Fuel Burn (Laden)</span>
            <span className="value">{environmental.daily_fuel_consumption_laden_mt} MT / day</span>
          </div>
          <div className="vdd-metric-card">
            <span className="label">Fuel Burn (Ballast)</span>
            <span className="value">{environmental.daily_fuel_consumption_ballast_mt} MT / day</span>
          </div>
        </div>
      </div>

      {/* Compliance & Decarbonization Equipment */}
      <div className="vdd-section">
        <h4 className="vdd-section-title">
          <ShieldCheck size={14} />
          Decarbonization Technologies &amp; MARPOL
        </h4>
        <div className="vdd-kv-table">
          <div className="vdd-kv-row">
            <span className="key"><Fuel size={13} /> Fuel Specification</span>
            <span className="val">{environmental.fuel_type}</span>
          </div>
          <div className="vdd-kv-row">
            <span className="key">Exhaust Gas Cleaning (Scrubber)</span>
            <span className="val">
              {environmental.scrubber_fitted ? (
                <span className="tag-green"><CheckCircle2 size={12} /> Fitted (Open Loop)</span>
              ) : (
                <span className="tag-neutral">Compliant via VLSFO</span>
              )}
            </span>
          </div>
          <div className="vdd-kv-row">
            <span className="key">Ballast Water Treatment (BWMS)</span>
            <span className="val">
              <span className="tag-green"><CheckCircle2 size={12} /> USCG / IMO Type Approved</span>
            </span>
          </div>
          <div className="vdd-kv-row">
            <span className="key">SECA / ECA Regional Status</span>
            <span className="val primary">{environmental.seca_compliance_status}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

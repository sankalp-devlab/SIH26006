import {
  Leaf,
  Fuel,
  CheckCircle2,
  TrendingDown,
} from 'lucide-react';
import type { EnrichedVesselDetail } from '../../../../types/vessel-detail';

interface EmissionsTabProps {
  data: EnrichedVesselDetail;
}

export function EmissionsTab({ data }: EmissionsTabProps) {
  const { environmental } = data;

  const ciiGrades: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];
  const gradeColors: Record<'A' | 'B' | 'C' | 'D' | 'E', string> = {
    A: '#10b981',
    B: '#34d399',
    C: '#f59e0b',
    D: '#f97316',
    E: '#ef4444',
  };

  const currentGradeColor = gradeColors[environmental.cii_rating];

  return (
    <div className="vdb-tab-pane">
      <div className="vdb-grid-2col">
        {/* 1. IMO CII OPERATIONAL RATING WORKSPACE */}
        <div className="card vdb-section-card">
          <div className="card-header vdb-card-header">
            <div className="vdb-card-title-group">
              <Leaf size={16} className="text-secondary" />
              <h3 className="card-title">IMO Carbon Intensity Indicator (CII)</h3>
            </div>
            <span
              className="badge"
              style={{
                background: `${currentGradeColor}22`,
                color: currentGradeColor,
                borderColor: `${currentGradeColor}66`,
              }}
            >
              Grade {environmental.cii_rating} &middot; Attained
            </span>
          </div>

          <div className="card-body">
            {/* A - E Meter Visual Scale */}
            <div className="vdb-cii-scale-wrap">
              <div className="vdb-cii-scale">
                {ciiGrades.map((g) => {
                  const isSelected = environmental.cii_rating === g;
                  return (
                    <div
                      key={g}
                      className={`vdb-cii-step ${isSelected ? 'active' : ''}`}
                      style={{
                        background: isSelected ? gradeColors[g] : `${gradeColors[g]}33`,
                        color: isSelected ? '#ffffff' : gradeColors[g],
                        borderColor: isSelected ? gradeColors[g] : 'transparent',
                      }}
                    >
                      <span className="grade">{g}</span>
                      {isSelected && <span className="marker">&bull;</span>}
                    </div>
                  );
                })}
              </div>
              <div className="vdb-cii-scale-labels">
                <span>Major Superior (A)</span>
                <span>IMO Required (C)</span>
                <span>Inferior (E)</span>
              </div>
            </div>

            <div className="vdb-key-val-list" style={{ marginTop: '1.25rem' }}>
              <div className="vdb-kv-row highlight">
                <span className="vdb-kv-label">Attained CII Score</span>
                <span className="vdb-kv-val font-mono" style={{ color: currentGradeColor, fontWeight: 700 }}>
                  {environmental.cii_score.toFixed(2)} gCO₂ / dwt-nm
                </span>
              </div>
              <div className="vdb-kv-row">
                <span className="vdb-kv-label">IMO Required Reference Target</span>
                <span className="vdb-kv-val font-mono">{environmental.cii_target.toFixed(2)} gCO₂ / dwt-nm</span>
              </div>
              <div className="vdb-kv-row">
                <span className="vdb-kv-label">Annual Efficiency Ratio (AER)</span>
                <span className="vdb-kv-val font-mono">{environmental.aer_metric.toFixed(2)} gCO₂ / dwt-nm</span>
              </div>
              <div className="vdb-kv-row">
                <span className="vdb-kv-label">Benchmark Reduction Trend</span>
                <span className="vdb-kv-val text-emerald font-semibold">
                  <TrendingDown size={13} style={{ display: 'inline', marginRight: 4 }} />
                  {environmental.co2_reduction_trend}% vs 2019 baseline
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. DAILY FUEL CONSUMPTION & CARBON FOOTPRINT */}
        <div className="card vdb-section-card">
          <div className="card-header vdb-card-header">
            <div className="vdb-card-title-group">
              <Fuel size={16} className="text-secondary" />
              <h3 className="card-title">Fuel Consumption & Emissions</h3>
            </div>
            <span className="badge badge-outline">MARPOL Annex VI</span>
          </div>

          <div className="card-body">
            <div className="vdb-grid-2col" style={{ gap: '0.75rem', marginBottom: '1rem' }}>
              <div className="vdb-emissions-kpi-card">
                <div className="kpi-label">Daily Fuel (Laden)</div>
                <div className="kpi-val text-emerald font-mono">
                  {environmental.daily_fuel_consumption_laden_mt} <span className="unit">MT/d</span>
                </div>
                <div className="kpi-sub font-mono text-muted text-xs">
                  Ballast: {environmental.daily_fuel_consumption_ballast_mt} MT/d
                </div>
              </div>

              <div className="vdb-emissions-kpi-card">
                <div className="kpi-label">Daily CO₂ Output</div>
                <div className="kpi-val text-cyan font-mono">
                  {environmental.daily_co2_emissions_mt} <span className="unit">MT/d</span>
                </div>
                <div className="kpi-sub text-muted text-xs">Factor: 3.114 MT CO₂ / MT VLSFO</div>
              </div>
            </div>

            <div className="vdb-key-val-list">
              <div className="vdb-kv-row">
                <span className="vdb-kv-label">Primary Marine Fuel</span>
                <span className="vdb-kv-val">{environmental.fuel_type}</span>
              </div>
              <div className="vdb-kv-row">
                <span className="vdb-kv-label">Exhaust Gas Scrubber (EGCS)</span>
                <span className="vdb-kv-val text-emerald">
                  {environmental.scrubber_fitted ? 'Open / Closed Hybrid Fitted' : 'Unfitted (Low Sulfur Fuel Compliant)'}
                </span>
              </div>
              <div className="vdb-kv-row">
                <span className="vdb-kv-label">SECA / ECA Fuel Switch Protocol</span>
                <span className="vdb-kv-val text-emerald font-semibold">
                  <CheckCircle2 size={13} style={{ display: 'inline', marginRight: 4 }} />
                  {environmental.seca_compliance_status} (0.10% S)
                </span>
              </div>
              <div className="vdb-kv-row">
                <span className="vdb-kv-label">Ballast Water Management (BWMS)</span>
                <span className="vdb-kv-val text-emerald">USCG & IMO D-2 Certified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

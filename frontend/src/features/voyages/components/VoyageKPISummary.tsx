import {
  Ship,
  TrendingUp,
  CheckCircle2,
  PieChart,
  Clock,
  Anchor,
} from 'lucide-react';
import type { VoyageAnalyticsSummary } from '../../../types/voyage';

interface VoyageKPISummaryProps {
  analytics: VoyageAnalyticsSummary;
  selectedStatus?: string;
  onSelectStatus?: (status: string) => void;
}

export function VoyageKPISummary({
  analytics,
  selectedStatus,
  onSelectStatus,
}: VoyageKPISummaryProps) {
  const {
    total_voyages,
    active_voyages,
    predicted_voyages,
    completed_voyages,
    laden_ratio_pct,
    avg_turnaround_hours,
    port_metrics,
  } = analytics;

  const totalPortCalls = port_metrics.reduce((acc, p) => acc + p.calls_count, 0);

  return (
    <div className="cvi-kpi-grid">
      {/* 1. ACTIVE VOYAGES */}
      <div
        className={`cvi-kpi-card ${selectedStatus === 'active' ? 'is-active' : ''}`}
        onClick={() => onSelectStatus && onSelectStatus(selectedStatus === 'active' ? 'all' : 'active')}
        style={{ borderLeft: '3px solid #10b981' }}
        title="Filter by Active Voyages"
      >
        <div className="cvi-kpi-top">
          <span className="cvi-kpi-label">ACTIVE VOYAGES</span>
          <Ship size={15} color="#10b981" />
        </div>
        <div className="cvi-kpi-val" style={{ color: '#10b981' }}>
          {active_voyages}
        </div>
        <div className="cvi-kpi-bottom">
          <div className="cvi-kpi-sub" style={{ color: '#10b981' }}>
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
            <span>Underway / Port</span>
          </div>
          <div className="cvi-kpi-desc">Live AIS navigation tracking</div>
        </div>
      </div>

      {/* 2. PREDICTED NEXT */}
      <div
        className={`cvi-kpi-card ${selectedStatus === 'predicted' ? 'is-active' : ''}`}
        onClick={() => onSelectStatus && onSelectStatus(selectedStatus === 'predicted' ? 'all' : 'predicted')}
        style={{ borderLeft: '3px solid #a855f7' }}
        title="Filter by Forward Projected Voyages"
      >
        <div className="cvi-kpi-top">
          <span className="cvi-kpi-label">PREDICTED NEXT</span>
          <TrendingUp size={15} color="#c084fc" />
        </div>
        <div className="cvi-kpi-val" style={{ color: '#c084fc' }}>
          {predicted_voyages}
        </div>
        <div className="cvi-kpi-bottom">
          <div className="cvi-kpi-sub" style={{ color: '#c084fc' }}>
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#c084fc' }} />
            <span>Forward Projection</span>
          </div>
          <div className="cvi-kpi-desc">Next fixtures & forward laycans</div>
        </div>
      </div>

      {/* 3. HISTORICAL LOGGED */}
      <div
        className={`cvi-kpi-card ${selectedStatus === 'completed' ? 'is-active' : ''}`}
        onClick={() => onSelectStatus && onSelectStatus(selectedStatus === 'completed' ? 'all' : 'completed')}
        style={{ borderLeft: '3px solid #38bdf8' }}
        title="Filter by Completed History"
      >
        <div className="cvi-kpi-top">
          <span className="cvi-kpi-label">HISTORICAL LOGGED</span>
          <CheckCircle2 size={15} color="#38bdf8" />
        </div>
        <div className="cvi-kpi-val" style={{ color: '#ffffff' }}>
          {completed_voyages}
        </div>
        <div className="cvi-kpi-bottom">
          <div className="cvi-kpi-sub" style={{ color: '#94a3b8' }}>
            <span>of {total_voyages} total</span>
          </div>
          <div className="cvi-kpi-desc">Archived seaway passages</div>
        </div>
      </div>

      {/* 4. LADEN LEG RATIO */}
      <div
        className="cvi-kpi-card"
        style={{ borderLeft: '3px solid #00d8ff' }}
      >
        <div className="cvi-kpi-top">
          <span className="cvi-kpi-label">LADEN LEG RATIO</span>
          <PieChart size={15} color="#00d8ff" />
        </div>
        <div className="cvi-kpi-val" style={{ color: '#00d8ff' }}>
          {laden_ratio_pct}%
        </div>
        <div className="cvi-kpi-bottom">
          <div className="cvi-kpi-sub" style={{ color: '#94a3b8', justifyContent: 'space-between' }}>
            <span>{100 - laden_ratio_pct}% Ballast</span>
          </div>
          <div style={{ width: '100%', height: 4, background: 'rgba(80, 180, 255, 0.16)', borderRadius: 2, overflow: 'hidden', marginTop: 3 }}>
            <div style={{ width: `${laden_ratio_pct}%`, height: '100%', background: '#00d8ff', borderRadius: 2 }} />
          </div>
        </div>
      </div>

      {/* 5. AVG TURNAROUND */}
      <div
        className="cvi-kpi-card"
        style={{ borderLeft: '3px solid #f59e0b' }}
      >
        <div className="cvi-kpi-top">
          <span className="cvi-kpi-label">AVG TURNAROUND</span>
          <Clock size={15} color="#f59e0b" />
        </div>
        <div className="cvi-kpi-val" style={{ color: '#f59e0b' }}>
          {avg_turnaround_hours}h
        </div>
        <div className="cvi-kpi-bottom">
          <div className="cvi-kpi-sub" style={{ color: '#f59e0b' }}>
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
            <span>Berth + Waiting</span>
          </div>
          <div className="cvi-kpi-desc">Commercial turnaround efficiency</div>
        </div>
      </div>

      {/* 6. PORT CALLS / EVENTS */}
      <div
        className="cvi-kpi-card"
        style={{ borderLeft: '3px solid #ec4899' }}
      >
        <div className="cvi-kpi-top">
          <span className="cvi-kpi-label">PORT CALLS / EVENTS</span>
          <Anchor size={15} color="#ec4899" />
        </div>
        <div className="cvi-kpi-val" style={{ color: '#ffffff' }}>
          {totalPortCalls}
        </div>
        <div className="cvi-kpi-bottom">
          <div className="cvi-kpi-sub" style={{ color: '#ec4899' }}>
            <span>Logged Calls</span>
          </div>
          <div className="cvi-kpi-desc">Includes STS transshipment operations</div>
        </div>
      </div>
    </div>
  );
}

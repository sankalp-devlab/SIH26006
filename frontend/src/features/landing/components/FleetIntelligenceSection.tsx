import { Link } from 'react-router-dom';
import { Ship, Compass, ArrowRight, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

interface FleetSector {
  sector: string;
  count: string;
  utilization: string;
  dwt: string;
  avgSpeed: string;
  status: 'optimal' | 'moderate';
}

const FLEET_SECTORS: FleetSector[] = [
  {
    sector: 'Crude Tankers (VLCC / Suezmax / Aframax)',
    count: '4,820',
    utilization: '92.4%',
    dwt: '542M DWT',
    avgSpeed: '12.8 kn',
    status: 'optimal',
  },
  {
    sector: 'Clean Product Tankers (LR2 / LR1 / MR)',
    count: '6,140',
    utilization: '89.1%',
    dwt: '298M DWT',
    avgSpeed: '13.2 kn',
    status: 'optimal',
  },
  {
    sector: 'Dry Bulk Carriers (Capesize / Panamax / Supra)',
    count: '13,850',
    utilization: '91.0%',
    dwt: '965M DWT',
    avgSpeed: '11.9 kn',
    status: 'optimal',
  },
  {
    sector: 'Container Carriers (Ultra-Large to Feeder)',
    count: '6,290',
    utilization: '94.6%',
    dwt: '28.4M TEU',
    avgSpeed: '16.5 kn',
    status: 'optimal',
  },
  {
    sector: 'Gas Carriers (LNG & LPG Fleet)',
    count: '2,410',
    utilization: '95.2%',
    dwt: '112M cbm',
    avgSpeed: '15.1 kn',
    status: 'optimal',
  },
];

interface Chokepoint {
  name: string;
  flowRate: string;
  avgSpeed: string;
  queueTime: string;
  statusText: string;
  severity: 'normal' | 'advisory' | 'alert';
}

const CHOKEPOINTS: Chokepoint[] = [
  {
    name: 'Strait of Malacca',
    flowRate: '94 vessels / day',
    avgSpeed: '14.2 kn',
    queueTime: '0.4h avg delay',
    statusText: 'Normal Transit',
    severity: 'normal',
  },
  {
    name: 'Suez Canal (North & South)',
    flowRate: '68 vessels / day',
    avgSpeed: '9.8 kn',
    queueTime: '1.2h avg delay',
    statusText: 'Advisory Active',
    severity: 'advisory',
  },
  {
    name: 'Bab el-Mandeb / Red Sea',
    flowRate: '28 vessels / day',
    avgSpeed: '15.4 kn',
    queueTime: 'Cape rerouting ~62%',
    statusText: 'Security Notice',
    severity: 'alert',
  },
  {
    name: 'Panama Canal (Neopanamax)',
    flowRate: '34 vessels / day',
    avgSpeed: '6.2 kn',
    queueTime: '18.6h avg queue',
    statusText: 'Slot Allocation',
    severity: 'advisory',
  },
];

export function FleetIntelligenceSection() {
  return (
    <section id="fleet-intelligence" className="oceanlens-fleet-section" aria-labelledby="fleet-heading">
      <div className="section-container">
        {/* Section Header */}
        <div className="section-header-block">
          <span className="section-eyebrow">Fleet Deployment &amp; Logistics</span>
          <h2 id="fleet-heading" className="section-title">
            Global Vessel Distribution &amp; Corridor Status
          </h2>
          <p className="section-subtitle">
            Track real-time commercial fleet allocation, active ton-mile utilization, and critical maritime chokepoints across international waters.
          </p>
        </div>

        {/* Dual Column Layout: Left Fleet Deployment / Right Chokepoint Monitor */}
        <div className="fleet-grid-layout">
          {/* Left: Sector Deployment Table */}
          <div className="fleet-card-panel">
            <div className="panel-header">
              <div className="panel-title-wrap">
                <Ship size={18} className="panel-icon" aria-hidden="true" />
                <h3 className="panel-title">Active Fleet Sectors</h3>
              </div>
              <Link to="/vessels" className="panel-action-link">
                <span>View All 50,000+ Vessels</span>
                <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </div>

            <div className="fleet-table-wrap">
              <table className="fleet-sector-table" aria-label="Fleet Sector Allocation">
                <thead>
                  <tr>
                    <th scope="col">Sector Category</th>
                    <th scope="col" className="text-right">Live Vessels</th>
                    <th scope="col" className="text-right">Utilization</th>
                    <th scope="col" className="text-right">Capacity (DWT/TEU)</th>
                    <th scope="col" className="text-right">Mean Speed</th>
                  </tr>
                </thead>
                <tbody>
                  {FLEET_SECTORS.map((item) => (
                    <tr key={item.sector}>
                      <td className="sector-name-cell">{item.sector}</td>
                      <td className="text-right font-mono">{item.count}</td>
                      <td className="text-right">
                        <span className="utilization-badge">{item.utilization}</span>
                      </td>
                      <td className="text-right font-mono text-muted">{item.dwt}</td>
                      <td className="text-right font-mono">{item.avgSpeed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Global Chokepoint Monitor */}
          <div className="chokepoint-card-panel">
            <div className="panel-header">
              <div className="panel-title-wrap">
                <Compass size={18} className="panel-icon" aria-hidden="true" />
                <h3 className="panel-title">Strategic Chokepoint Transit</h3>
              </div>
              <Link to="/routes" className="panel-action-link">
                <span>Corridor Routing</span>
                <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </div>

            <div className="chokepoint-list">
              {CHOKEPOINTS.map((cp) => (
                <div key={cp.name} className="chokepoint-item">
                  <div className="chokepoint-top">
                    <span className="chokepoint-name">{cp.name}</span>
                    <span className={`chokepoint-status-tag ${cp.severity}`}>
                      {cp.severity === 'normal' && <CheckCircle size={12} aria-hidden="true" />}
                      {cp.severity === 'advisory' && <AlertTriangle size={12} aria-hidden="true" />}
                      {cp.severity === 'alert' && <ShieldAlert size={12} aria-hidden="true" />}
                      <span>{cp.statusText}</span>
                    </span>
                  </div>

                  <div className="chokepoint-metrics">
                    <div className="metric-cell">
                      <span className="metric-label">Daily Throughput</span>
                      <span className="metric-value font-mono">{cp.flowRate}</span>
                    </div>
                    <div className="metric-cell">
                      <span className="metric-label">Transit Speed</span>
                      <span className="metric-value font-mono">{cp.avgSpeed}</span>
                    </div>
                    <div className="metric-cell">
                      <span className="metric-label">Corridor Delay</span>
                      <span className="metric-value font-mono">{cp.queueTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

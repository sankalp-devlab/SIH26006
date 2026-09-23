import { AlertTriangle, Clock } from 'lucide-react';

export interface AlertRecord {
  id: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  entity: string;
  explanation: string;
  timeAgo: string;
}

const ALERTS: AlertRecord[] = [
  {
    id: '1',
    severity: 'HIGH',
    title: 'Port congestion increased significantly',
    entity: 'Shanghai / Ningbo Hubs',
    explanation: 'Average anchorage dwell exceeded 38.4 hours due to monsoon weather and berth sequencing.',
    timeAgo: '12m ago',
  },
  {
    id: '2',
    severity: 'MEDIUM',
    title: 'Freight volatility above normal range',
    entity: 'Capesize C5 Index',
    explanation: '24-hour rate delta swung +8.4% amid aggressive fixture bookings in Western Australia.',
    timeAgo: '34m ago',
  },
  {
    id: '3',
    severity: 'MEDIUM',
    title: 'Vessel availability tightening on TD3C',
    entity: 'Arabian Gulf VLCCs',
    explanation: 'Forward position list indicates only 18 prompt crude carriers available for 10-day loading window.',
    timeAgo: '1h ago',
  },
  {
    id: '4',
    severity: 'LOW',
    title: 'Bunker prices changed +2.1%',
    entity: 'Singapore VLSFO',
    explanation: 'Spot bunker benchmark reached $642/mt tracking regional distillate stock draws.',
    timeAgo: '2h ago',
  },
];

interface AttentionAlertsPanelProps {
  onSelectAlert?: (alert: AlertRecord) => void;
}

export function AttentionAlertsPanel({ onSelectAlert }: AttentionAlertsPanelProps) {
  const getBadge = (sev: AlertRecord['severity']) => {
    if (sev === 'HIGH') return <span className="cc-badge cc-badge-negative">HIGH</span>;
    if (sev === 'MEDIUM') return <span className="cc-badge cc-badge-warning">MEDIUM</span>;
    return <span className="cc-badge cc-badge-cyan">LOW</span>;
  };

  const getSeverityClass = (sev: AlertRecord['severity']) => {
    if (sev === 'HIGH') return 'cc-alert-item-high';
    if (sev === 'MEDIUM') return 'cc-alert-item-medium';
    return 'cc-alert-item-low';
  };

  return (
    <div className="cc-panel">
      <div className="cc-panel-header">
        <div className="cc-panel-title">
          <AlertTriangle size={13} color="#f59e0b" />
          <span>ATTENTION REQUIRED</span>
        </div>
        <span className="cc-badge cc-badge-warning cc-mono">4 ACTIVE</span>
      </div>

      <div className="cc-panel-body" style={{ padding: '0.4rem 0.6rem', maxHeight: '180px', overflowY: 'auto' }}>
        <div className="cc-alert-list">
          {ALERTS.map((item) => (
            <div
              key={item.id}
              className={`cc-alert-item ${getSeverityClass(item.severity)}`}
              onClick={() => onSelectAlert?.(item)}
              title="Click to view alert context"
            >
              <div className="cc-alert-header">
                {getBadge(item.severity)}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.625rem', color: '#64748b' }}>
                  <Clock size={10} />
                  <span>{item.timeAgo}</span>
                </div>
              </div>

              <div style={{ fontSize: '0.71875rem', fontWeight: 700, color: '#f8fafc' }}>
                {item.title}
              </div>

              <div style={{ fontSize: '0.65rem', color: '#38bdf8', fontWeight: 600 }}>
                {item.entity}
              </div>

              <div style={{ fontSize: '0.65rem', color: '#94a3b8', lineHeight: 1.3 }}>
                {item.explanation}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

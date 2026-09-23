import { Anchor, TrendingUp, TrendingDown } from 'lucide-react';

export interface PortActivityRow {
  name: string;
  country: string;
  calls: number;
  cargo: string;
  waitingHours: number;
  congestion: 'Normal' | 'Moderate' | 'High';
  trend: string;
  isPositive: boolean;
}

const PORT_ROWS: PortActivityRow[] = [
  {
    name: 'Singapore',
    country: 'Singapore',
    calls: 1420,
    cargo: '54.2 MT',
    waitingHours: 18.4,
    congestion: 'Moderate',
    trend: '+4.8%',
    isPositive: true,
  },
  {
    name: 'Rotterdam',
    country: 'Netherlands',
    calls: 890,
    cargo: '38.6 MT',
    waitingHours: 12.1,
    congestion: 'Normal',
    trend: '+1.2%',
    isPositive: true,
  },
  {
    name: 'Shanghai',
    country: 'China',
    calls: 1680,
    cargo: '68.4 MT',
    waitingHours: 26.5,
    congestion: 'High',
    trend: '+9.4%',
    isPositive: true,
  },
  {
    name: 'Fujairah',
    country: 'UAE',
    calls: 640,
    cargo: '22.1 MT',
    waitingHours: 14.8,
    congestion: 'Normal',
    trend: '-2.1%',
    isPositive: false,
  },
  {
    name: 'Houston',
    country: 'United States',
    calls: 720,
    cargo: '27.9 MT',
    waitingHours: 16.2,
    congestion: 'Moderate',
    trend: '+3.5%',
    isPositive: true,
  },
  {
    name: 'Qingdao',
    country: 'China',
    calls: 810,
    cargo: '34.0 MT',
    waitingHours: 22.0,
    congestion: 'High',
    trend: '+7.1%',
    isPositive: true,
  },
];

interface PortActivityTableProps {
  onSelectPortName?: (portName: string) => void;
}

export function PortActivityTable({ onSelectPortName }: PortActivityTableProps) {
  const getCongestionBadge = (level: PortActivityRow['congestion']) => {
    if (level === 'High') {
      return <span className="cc-badge cc-badge-negative">HIGH</span>;
    }
    if (level === 'Moderate') {
      return <span className="cc-badge cc-badge-warning">MOD</span>;
    }
    return <span className="cc-badge cc-badge-positive">NORM</span>;
  };

  return (
    <div className="cc-panel">
      <div className="cc-panel-header">
        <div className="cc-panel-title">
          <Anchor size={13} color="#38bdf8" />
          <span>PORT ACTIVITY</span>
        </div>
        <span style={{ fontSize: '0.625rem', color: '#64748b' }}>ACTIVE HUBS</span>
      </div>

      <div className="cc-panel-body" style={{ padding: 0 }}>
        <table className="cc-table cc-table-clickable">
          <thead>
            <tr>
              <th>PORT</th>
              <th>CALLS</th>
              <th>CARGO</th>
              <th>WAIT</th>
              <th>CONGESTION</th>
              <th>TREND</th>
            </tr>
          </thead>
          <tbody className="cc-mono">
            {PORT_ROWS.map((row) => (
              <tr
                key={row.name}
                onClick={() => onSelectPortName?.(row.name)}
                title={`Click to inspect ${row.name} port intelligence`}
              >
                <td style={{ fontWeight: 600, color: '#38bdf8' }}>
                  {row.name}
                </td>
                <td style={{ color: '#f8fafc' }}>{row.calls.toLocaleString()}</td>
                <td style={{ color: '#94a3b8' }}>{row.cargo}</td>
                <td style={{ color: '#cbd5e1' }}>{row.waitingHours}h</td>
                <td>{getCongestionBadge(row.congestion)}</td>
                <td>
                  <span
                    className={`cc-badge ${
                      row.isPositive ? 'cc-badge-positive' : 'cc-badge-negative'
                    }`}
                  >
                    {row.isPositive ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                    {row.trend}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

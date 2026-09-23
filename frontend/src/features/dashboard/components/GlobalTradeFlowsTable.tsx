import { Link } from 'react-router-dom';
import { Waves, ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react';

interface TradeFlowRow {
  id: string;
  corridor: string;
  commodity: string;
  volumeMt: string;
  vessels: number;
  change: string;
  isPositive: boolean;
}

const TRADE_FLOW_ROWS: TradeFlowRow[] = [
  {
    id: '1',
    corridor: 'Middle East -> Asia',
    commodity: 'Crude',
    volumeMt: '24.8 MT',
    vessels: 1842,
    change: '+8.4%',
    isPositive: true,
  },
  {
    id: '2',
    corridor: 'Australia -> China',
    commodity: 'Iron Ore',
    volumeMt: '18.2 MT',
    vessels: 1210,
    change: '+6.2%',
    isPositive: true,
  },
  {
    id: '3',
    corridor: 'US Gulf -> Europe',
    commodity: 'Crude',
    volumeMt: '12.4 MT',
    vessels: 842,
    change: '+5.8%',
    isPositive: true,
  },
  {
    id: '4',
    corridor: 'Europe -> Asia',
    commodity: 'Products',
    volumeMt: '8.4 MT',
    vessels: 614,
    change: '-2.4%',
    isPositive: false,
  },
  {
    id: '5',
    corridor: 'US Gulf -> East Asia',
    commodity: 'LNG',
    volumeMt: '6.1 MT',
    vessels: 388,
    change: '+11.2%',
    isPositive: true,
  },
];

export function GlobalTradeFlowsTable() {
  return (
    <div className="cc-panel">
      <div className="cc-panel-header">
        <div className="cc-panel-title">
          <Waves size={13} color="#38bdf8" />
          <span>GLOBAL TRADE FLOWS</span>
        </div>

        <Link
          to="/flows"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            fontSize: '0.6875rem',
            color: '#38bdf8',
            textDecoration: 'none',
            fontWeight: 700,
          }}
        >
          <span>VIEW TRADE FLOWS</span>
          <ArrowUpRight size={12} />
        </Link>
      </div>

      <div className="cc-panel-body" style={{ padding: 0 }}>
        <table className="cc-table">
          <thead>
            <tr>
              <th>CORRIDOR</th>
              <th>COMMODITY</th>
              <th>VOLUME</th>
              <th>VESSELS</th>
              <th>CHANGE</th>
            </tr>
          </thead>
          <tbody className="cc-mono">
            {TRADE_FLOW_ROWS.map((row) => (
              <tr key={row.id}>
                <td style={{ fontWeight: 600, color: '#f1f5f9' }}>{row.corridor}</td>
                <td>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '1px 5px',
                      borderRadius: '3px',
                      fontSize: '0.625rem',
                      background: 'rgba(56, 189, 248, 0.1)',
                      color: '#38bdf8',
                    }}
                  >
                    {row.commodity}
                  </span>
                </td>
                <td style={{ color: '#f8fafc', fontWeight: 700 }}>{row.volumeMt}</td>
                <td style={{ color: '#94a3b8' }}>{row.vessels.toLocaleString()}</td>
                <td>
                  <span
                    className={`cc-badge ${
                      row.isPositive ? 'cc-badge-positive' : 'cc-badge-negative'
                    }`}
                  >
                    {row.isPositive ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                    {row.change}
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

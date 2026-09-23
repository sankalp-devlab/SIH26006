import { useState } from 'react';
import { TrendingUp, BarChart2 } from 'lucide-react';

type TimeHorizon = '1D' | '7D' | '30D' | '3M' | '1Y';

interface DataPoint {
  date: string;
  spot: number;
  ffa: number;
  tce: number;
}

const DATA_SERIES: Record<TimeHorizon, DataPoint[]> = {
  '1D': [
    { date: '04:00', spot: 64.2, ffa: 62.8, tce: 36200 },
    { date: '08:00', spot: 65.5, ffa: 63.1, tce: 36800 },
    { date: '12:00', spot: 67.1, ffa: 64.0, tce: 37500 },
    { date: '16:00', spot: 68.4, ffa: 64.8, tce: 38420 },
    { date: '20:00', spot: 68.0, ffa: 64.5, tce: 38200 },
  ],
  '7D': [
    { date: 'Mon', spot: 61.2, ffa: 60.5, tce: 34500 },
    { date: 'Tue', spot: 62.8, ffa: 61.2, tce: 35200 },
    { date: 'Wed', spot: 64.5, ffa: 62.4, tce: 36400 },
    { date: 'Thu', spot: 66.0, ffa: 63.5, tce: 37100 },
    { date: 'Fri', spot: 68.4, ffa: 64.8, tce: 38420 },
  ],
  '30D': [
    { date: 'W1', spot: 55.4, ffa: 56.2, tce: 31000 },
    { date: 'W2', spot: 58.1, ffa: 58.0, tce: 32800 },
    { date: 'W3', spot: 63.0, ffa: 61.5, tce: 35600 },
    { date: 'W4', spot: 68.4, ffa: 64.8, tce: 38420 },
  ],
  '3M': [
    { date: 'Month 1', spot: 50.2, ffa: 52.0, tce: 28500 },
    { date: 'Month 2', spot: 59.8, ffa: 58.4, tce: 33400 },
    { date: 'Month 3', spot: 68.4, ffa: 64.8, tce: 38420 },
  ],
  '1Y': [
    { date: 'Q1', spot: 46.0, ffa: 48.0, tce: 26000 },
    { date: 'Q2', spot: 52.4, ffa: 53.2, tce: 29800 },
    { date: 'Q3', spot: 61.0, ffa: 59.5, tce: 34600 },
    { date: 'Q4', spot: 68.4, ffa: 64.8, tce: 38420 },
  ],
};

export function FreightMarketChart() {
  const [timeframe, setTimeframe] = useState<TimeHorizon>('30D');
  const [showSpot, setShowSpot] = useState(true);
  const [showFFA, setShowFFA] = useState(true);
  const [showTCE, setShowTCE] = useState(true);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const data = DATA_SERIES[timeframe];
  const width = 280;
  const height = 120;
  const padding = 20;

  // Normalized coordinates for SVG rendering
  const minSpot = Math.min(...data.map((d) => d.spot)) * 0.9;
  const maxSpot = Math.max(...data.map((d) => d.spot)) * 1.05;
  const minFFA = Math.min(...data.map((d) => d.ffa)) * 0.9;
  const maxFFA = Math.max(...data.map((d) => d.ffa)) * 1.05;
  const minTCE = Math.min(...data.map((d) => d.tce)) * 0.9;
  const maxTCE = Math.max(...data.map((d) => d.tce)) * 1.05;

  const getX = (index: number) =>
    padding + (index / (data.length - 1)) * (width - 2 * padding);
  const getY = (val: number, min: number, max: number) =>
    height - padding - ((val - min) / (max - min)) * (height - 2 * padding);

  const spotPath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.spot, minSpot, maxSpot)}`)
    .join(' ');

  const ffaPath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.ffa, minFFA, maxFFA)}`)
    .join(' ');

  const tcePath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.tce, minTCE, maxTCE)}`)
    .join(' ');

  const activeItem = hoverIndex !== null ? data[hoverIndex] : data[data.length - 1];

  return (
    <div className="cc-panel">
      <div className="cc-panel-header">
        <div className="cc-panel-title">
          <BarChart2 size={13} color="#38bdf8" />
          <span>FREIGHT MARKET</span>
          <span className="cc-badge cc-badge-cyan cc-mono" style={{ fontSize: '0.6rem' }}>
            BENCHMARK SCENARIO
          </span>
        </div>

        {/* Timeframe Controls */}
        <div className="cc-chart-controls">
          {(['1D', '7D', '30D', '3M', '1Y'] as TimeHorizon[]).map((tf) => (
            <button
              key={tf}
              type="button"
              className={`cc-chart-btn ${timeframe === tf ? 'active' : ''}`}
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="cc-panel-body" style={{ padding: '0.6rem 0.75rem' }}>
        {/* Series Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.35rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6875rem', cursor: 'pointer', color: '#38bdf8' }}>
            <input
              type="checkbox"
              checked={showSpot}
              onChange={() => setShowSpot(!showSpot)}
              style={{ accentColor: '#38bdf8' }}
            />
            <span>Spot ({activeItem.spot} WS)</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6875rem', cursor: 'pointer', color: '#fbbf24' }}>
            <input
              type="checkbox"
              checked={showFFA}
              onChange={() => setShowFFA(!showFFA)}
              style={{ accentColor: '#fbbf24' }}
            />
            <span>FFA ({activeItem.ffa})</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6875rem', cursor: 'pointer', color: '#34d399' }}>
            <input
              type="checkbox"
              checked={showTCE}
              onChange={() => setShowTCE(!showTCE)}
              style={{ accentColor: '#34d399' }}
            />
            <span>TCE (${activeItem.tce.toLocaleString()})</span>
          </label>
        </div>

        {/* Interactive SVG Chart */}
        <div style={{ position: 'relative' }}>
          <svg
            className="cc-chart-svg"
            viewBox={`0 0 ${width} ${height}`}
            onMouseLeave={() => setHoverIndex(null)}
          >
            {/* Gridlines */}
            <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
            <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.08)" />

            {/* Paths */}
            {showSpot && (
              <path d={spotPath} fill="none" stroke="#38bdf8" strokeWidth="2" />
            )}
            {showFFA && (
              <path d={ffaPath} fill="none" stroke="#fbbf24" strokeWidth="1.8" strokeDasharray="4,3" />
            )}
            {showTCE && (
              <path d={tcePath} fill="none" stroke="#34d399" strokeWidth="2" />
            )}

            {/* Interactive hover points and crosshair */}
            {data.map((d, idx) => {
              const x = getX(idx);
              const isHovered = hoverIndex === idx;

              return (
                <g key={d.date} onMouseEnter={() => setHoverIndex(idx)}>
                  {/* Invisible hit column */}
                  <rect
                    x={x - 12}
                    y={0}
                    width={24}
                    height={height}
                    fill="transparent"
                    style={{ cursor: 'crosshair' }}
                  />

                  {/* Vertical Crosshair */}
                  {isHovered && (
                    <line
                      x1={x}
                      y1={padding}
                      x2={x}
                      y2={height - padding}
                      stroke="rgba(56, 189, 248, 0.4)"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                  )}

                  {/* Spot Point */}
                  {showSpot && (
                    <circle
                      cx={x}
                      cy={getY(d.spot, minSpot, maxSpot)}
                      r={isHovered ? 4 : 2.5}
                      fill="#38bdf8"
                    />
                  )}
                  {/* TCE Point */}
                  {showTCE && (
                    <circle
                      cx={x}
                      cy={getY(d.tce, minTCE, maxTCE)}
                      r={isHovered ? 4 : 2.5}
                      fill="#34d399"
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Bottom Rate Details */}
        <div className="cc-chart-footer cc-mono">
          <div>
            <span style={{ color: '#64748b' }}>CUR: </span>
            <span style={{ color: '#f8fafc', fontWeight: 700 }}>WS 68.4</span>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>7D: </span>
            <span style={{ color: '#34d399', fontWeight: 700 }}>+8.2%</span>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>30D: </span>
            <span style={{ color: '#34d399', fontWeight: 700 }}>+15.4%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#34d399' }}>
            <TrendingUp size={11} />
            <span style={{ fontWeight: 700 }}>BENCHMARK</span>
          </div>
        </div>

        <div style={{ fontSize: '0.625rem', color: '#64748b', marginTop: '0.35rem', textAlign: 'right' }}>
          * Reference benchmark scenario. External Baltic Exchange / Platts API unconfigured.
        </div>
      </div>
    </div>
  );
}

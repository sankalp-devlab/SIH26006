import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface TickerItem {
  id: string;
  name: string;
  value: string;
  delta: string;
  isPositive: boolean;
}

const DEFAULT_TICKER_ITEMS: TickerItem[] = [
  { id: '1', name: 'FREIGHT INDEX', value: '284.6', delta: '+6.3%', isPositive: true },
  { id: '2', name: 'VLCC TD3C', value: 'WS 68.4', delta: '+8.2%', isPositive: true },
  { id: '3', name: 'SUEZMAX TD6', value: 'WS 112.5', delta: '-2.1%', isPositive: false },
  { id: '4', name: 'AFRAMAX', value: 'WS 142.0', delta: '+4.8%', isPositive: true },
  { id: '5', name: 'BUNKER VLSFO', value: '$642/mt', delta: '+1.2%', isPositive: true },
  { id: '6', name: 'FFA CAL-25', value: '$24,800', delta: '+5.4%', isPositive: true },
  { id: '7', name: 'BRENT CRUDE', value: '$82.40/bbl', delta: '+1.8%', isPositive: true },
  { id: '8', name: 'LNG SPOT', value: '$11.24/MMBtu', delta: '-0.6%', isPositive: false },
  { id: '9', name: 'CAPESIZE C5', value: '$11.85/t', delta: '+3.7%', isPositive: true },
  { id: '10', name: 'SCFI COMPOSITE', value: '2,145.8', delta: '+1.9%', isPositive: true },
];

export function LiveMarketTicker() {
  // Duplicate list to achieve continuous seamless loop
  const displayItems = [...DEFAULT_TICKER_ITEMS, ...DEFAULT_TICKER_ITEMS];

  return (
    <div className="cc-ticker-wrap" aria-label="Live Maritime Market Ticker">
      <div
        className="cc-ticker-label"
        title="Published maritime market benchmark reference indicators. External real-time Baltic/Platts subscription feed is unconfigured per Rule 28."
      >
        <Activity size={12} />
        <span>MARKET PULSE (BENCHMARK)</span>
      </div>

      <div className="cc-ticker-track">
        {displayItems.map((item, idx) => (
          <div key={`${item.id}-${idx}`} className="cc-ticker-item cc-mono">
            <span className="cc-ticker-name">{item.name}</span>
            <span className="cc-ticker-val">{item.value}</span>
            <span
              className={`cc-badge ${
                item.isPositive ? 'cc-badge-positive' : 'cc-badge-negative'
              }`}
            >
              {item.isPositive ? (
                <TrendingUp size={10} />
              ) : (
                <TrendingDown size={10} />
              )}
              {item.delta}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

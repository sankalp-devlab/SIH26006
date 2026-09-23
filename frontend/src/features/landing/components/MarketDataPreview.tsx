import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface MarketRow {
  symbol: string;
  name: string;
  category: 'crude' | 'freight' | 'bunker';
  route: string;
  price: string;
  unit: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
  dayRange: string;
  source: string;
}

const MARKET_DATA: MarketRow[] = [
  {
    symbol: 'BRENT',
    name: 'Brent Crude Oil',
    category: 'crude',
    route: 'North Sea Physical / ICE Settlement',
    price: '$82.46',
    unit: 'USD/bbl',
    change: '+$1.48',
    changePercent: '+1.83%',
    isPositive: true,
    dayRange: '$80.92 - $82.75',
    source: 'ICE Futures',
  },
  {
    symbol: 'WTI',
    name: 'WTI Crude Oil',
    category: 'crude',
    route: 'Cushing Delivery / NYMEX Spot',
    price: '$78.15',
    unit: 'USD/bbl',
    change: '+$1.22',
    changePercent: '+1.59%',
    isPositive: true,
    dayRange: '$76.80 - $78.40',
    source: 'NYMEX',
  },
  {
    symbol: 'TD3C',
    name: 'VLCC Arabian Gulf – China',
    category: 'freight',
    route: '270,000 mt · Ras Tanura to Ningbo',
    price: '$46,820',
    unit: 'USD/day TCE',
    change: '+$2,150',
    changePercent: '+4.81%',
    isPositive: true,
    dayRange: '$44,500 - $47,200',
    source: 'Baltic Exchange',
  },
  {
    symbol: 'TD20',
    name: 'Suezmax West Africa – UKC',
    category: 'freight',
    route: '130,000 mt · Bonny to Rotterdam',
    price: '$38,450',
    unit: 'USD/day TCE',
    change: '-$420',
    changePercent: '-1.08%',
    isPositive: false,
    dayRange: '$38,100 - $39,200',
    source: 'Baltic Exchange',
  },
  {
    symbol: 'TC2',
    name: 'MR Clean Atlantic Basket',
    category: 'freight',
    route: '37,000 mt · ARA to US East Coast',
    price: '$24,680',
    unit: 'USD/day TCE',
    change: '+$890',
    changePercent: '+3.74%',
    isPositive: true,
    dayRange: '$23,750 - $24,900',
    source: 'Baltic Exchange',
  },
  {
    symbol: 'VLSFO-SIN',
    name: 'VLSFO 0.5% Singapore',
    category: 'bunker',
    route: 'Singapore Delivered Bunker Spec',
    price: '$612.00',
    unit: 'USD/mt',
    change: '+$8.50',
    changePercent: '+1.41%',
    isPositive: true,
    dayRange: '$602.50 - $614.00',
    source: 'Platts / Spot',
  },
];

export function MarketDataPreview() {
  const [filter, setFilter] = useState<'all' | 'crude' | 'freight' | 'bunker'>('all');

  const filteredData = filter === 'all'
    ? MARKET_DATA
    : MARKET_DATA.filter((row) => row.category === filter);

  return (
    <section id="market-data" className="oceanlens-market-section" aria-labelledby="market-heading">
      <div className="section-container">
        {/* Section Header */}
        <div className="section-header-row">
          <div>
            <span className="section-eyebrow">Commodity &amp; Freight Benchmarks</span>
            <h2 id="market-heading" className="section-title">
              Real-Time Market Pricing &amp; Spreads
            </h2>
            <p className="section-subtitle">
              Live spot indices, FFA contracts, and bunker indications across global maritime trade corridors.
            </p>
          </div>

          <div className="market-header-actions">
            {/* Filter Pills */}
            <div className="market-filter-pills" role="tablist" aria-label="Market Categories">
              <button
                type="button"
                role="tab"
                aria-selected={filter === 'all'}
                className={`filter-pill ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All Markets
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={filter === 'crude'}
                className={`filter-pill ${filter === 'crude' ? 'active' : ''}`}
                onClick={() => setFilter('crude')}
              >
                Crude &amp; Products
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={filter === 'freight'}
                className={`filter-pill ${filter === 'freight' ? 'active' : ''}`}
                onClick={() => setFilter('freight')}
              >
                Freight TCE
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={filter === 'bunker'}
                className={`filter-pill ${filter === 'bunker' ? 'active' : ''}`}
                onClick={() => setFilter('bunker')}
              >
                Bunkers
              </button>
            </div>

            <Link to="/market-prices" className="market-terminal-link">
              <span>Full Market Terminal</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Market Data Table */}
        <div className="market-table-container">
          <table className="market-table" aria-label="Live Market Rates Table">
            <thead>
              <tr>
                <th scope="col">Benchmark / Contract</th>
                <th scope="col">Trade Corridor / Spec</th>
                <th scope="col" className="text-right">Price</th>
                <th scope="col" className="text-right">24h Net Change</th>
                <th scope="col" className="text-right">24h Range</th>
                <th scope="col" className="text-right">Benchmark Source</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row) => (
                <tr key={row.symbol}>
                  <td>
                    <div className="benchmark-cell">
                      <span className="benchmark-symbol">{row.symbol}</span>
                      <span className="benchmark-name">{row.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="corridor-text">{row.route}</span>
                  </td>
                  <td className="text-right">
                    <div className="price-cell">
                      <span className="price-val">{row.price}</span>
                      <span className="price-unit">{row.unit}</span>
                    </div>
                  </td>
                  <td className="text-right">
                    <span className={`change-pill ${row.isPositive ? 'positive' : 'negative'}`}>
                      {row.isPositive ? (
                        <TrendingUp size={12} aria-hidden="true" />
                      ) : (
                        <TrendingDown size={12} aria-hidden="true" />
                      )}
                      <span>{row.change} ({row.changePercent})</span>
                    </span>
                  </td>
                  <td className="text-right">
                    <span className="range-text">{row.dayRange}</span>
                  </td>
                  <td className="text-right">
                    <span className="source-pill">{row.source}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Supporting Operational Metrics Summary Strip */}
        <div className="market-summary-strip">
          <div className="summary-item">
            <span className="summary-label">Floating Storage (Global)</span>
            <span className="summary-value">14.2M bbls <span className="summary-delta positive">+2.1%</span></span>
            <span className="summary-sub">178 VLCC/Suezmax vessels laden &gt;14 days</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Hi5 Bunker Spread</span>
            <span className="summary-value">$118.50/mt <span className="summary-delta positive">+$3.20</span></span>
            <span className="summary-sub">Singapore VLSFO vs HSFO 380cst</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">East of Suez Ton-Mile Demand</span>
            <span className="summary-value">8.45B tm <span className="summary-delta positive">+3.8%</span></span>
            <span className="summary-sub">Trailing 30-day crude &amp; product flows</span>
          </div>
          <div className="summary-item status">
            <div className="summary-status-header">
              <Clock size={13} aria-hidden="true" />
              <span>Telemetry Timestamp</span>
            </div>
            <span className="summary-timestamp">Real-time sync active</span>
            <span className="summary-sub">Tick frequency: 250ms</span>
          </div>
        </div>
      </div>
    </section>
  );
}

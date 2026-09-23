import { Link } from 'react-router-dom';
import {
  Ship,
  Waves,
  TrendingUp,
  LineChart,
  Anchor,
  Navigation,
  Leaf,
  DollarSign,
  ArrowRight,
  Radio,
  BookmarkCheck,
} from 'lucide-react';

const QUICK_LINKS = [
  { to: '/tracking', label: 'Live Tracking (M20)', icon: Radio },
  { to: '/bookings', label: 'Bookings Hub (M19)', icon: BookmarkCheck },
  { to: '/vessels', label: 'Vessel Fleet', icon: Ship },
  { to: '/flows', label: 'Trade Flows', icon: Waves },
  { to: '/freight-analytics', label: 'Freight Analytics', icon: TrendingUp },
  { to: '/market-insights', label: 'Market Insights', icon: LineChart },
  { to: '/ports', label: 'Global Ports', icon: Anchor },
  { to: '/routes', label: 'Corridor Routes', icon: Navigation },
  { to: '/emissions', label: 'Emissions', icon: Leaf },
  { to: '/analytics/valuations', label: 'Valuations', icon: DollarSign },
  { to: '/analytics/market-prices', label: 'Market Prices', icon: TrendingUp },
];

export function QuickAccessStrip() {
  return (
    <div style={{ marginTop: '0.75rem', marginBottom: '0.5rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.35rem',
        }}
      >
        <span
          style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: '#64748b',
          }}
        >
          QUICK OPERATIONS ACCESS
        </span>
        <span style={{ fontSize: '0.625rem', color: '#38bdf8' }}>{QUICK_LINKS.length} WORKSPACES AVAILABLE</span>
      </div>

      <div className="cc-quick-strip">
        {QUICK_LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.to} to={link.to} className="cc-quick-btn">
              <Icon size={12} color="#38bdf8" />
              <span>{link.label}</span>
              <ArrowRight size={10} style={{ opacity: 0.5 }} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { ArrowRight, type LucideIcon } from 'lucide-react';

export type CardTier = 'primary' | 'secondary' | 'compact' | 'special';

export type ModuleCategory =
  | 'MARKETS'
  | 'TRADE'
  | 'FLEET'
  | 'VESSELS'
  | 'OPERATIONS'
  | 'REPORTING';

export interface AnalyticsModuleConfig {
  id: string;
  badge: string;
  title: string;
  desc: string;
  route: string;
  icon: LucideIcon;
  metrics: string[];
  cta: string;
  tier: CardTier;
  category: ModuleCategory;
}

interface AnalyticsModuleCardProps {
  module: AnalyticsModuleConfig;
}

export function AnalyticsModuleCard({ module }: AnalyticsModuleCardProps) {
  const Icon = module.icon;

  const getTierClass = (tier: CardTier) => {
    switch (tier) {
      case 'primary':
        return 'hub-card-primary';
      case 'special':
        return 'hub-card-special';
      default:
        return '';
    }
  };

  return (
    <Link
      to={module.route}
      className={`hub-card ${getTierClass(module.tier)}`}
      title={`Open ${module.title}`}
    >
      <div>
        <div className="hub-card-header">
          <div className="hub-card-icon-wrap">
            <Icon size={18} />
          </div>
          <span className="hub-card-badge hub-mono">{module.badge}</span>
        </div>

        <h3 className="hub-card-title">{module.title}</h3>
        <p className="hub-card-desc">{module.desc}</p>
      </div>

      <div>
        <div className="hub-card-metrics">
          {module.metrics.map((m) => (
            <span key={m} className="hub-metric-chip">
              {m}
            </span>
          ))}
        </div>

        <div className="hub-card-cta">
          <span>{module.cta}</span>
          <ArrowRight size={13} className="hub-cta-arrow" />
        </div>
      </div>
    </Link>
  );
}

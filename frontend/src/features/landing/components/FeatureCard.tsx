import { Link } from 'react-router-dom';
import { ArrowRight, type LucideIcon } from 'lucide-react';

export interface FeatureCardProps {
  title: string;
  category: string;
  desc: string;
  dataTag: string;
  href: string;
  icon: LucideIcon;
  className?: string;
}

export function FeatureCard({
  title,
  category,
  desc,
  dataTag,
  href,
  icon: Icon,
  className = '',
}: FeatureCardProps) {
  return (
    <Link to={href} className={`oceanlens-feature-card ${className}`}>
      <div className="card-top-row">
        <div className="feature-card-icon-wrap" aria-hidden="true">
          <Icon size={20} strokeWidth={2.2} />
        </div>
        <span className="feature-category-badge">{category}</span>
      </div>

      <div className="feature-card-content">
        <h3 className="feature-card-title">{title}</h3>
        <p className="feature-card-desc">{desc}</p>
      </div>

      <div className="feature-card-footer">
        <div className="feature-data-reference">
          <span className="data-ref-dot" aria-hidden="true" />
          <span className="data-ref-text">{dataTag}</span>
        </div>
        <div className="feature-action-link" aria-hidden="true">
          <span>Open Module</span>
          <ArrowRight size={13} />
        </div>
      </div>
    </Link>
  );
}

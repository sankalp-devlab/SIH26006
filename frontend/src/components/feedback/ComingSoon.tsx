import React from 'react';
import { Compass, Sparkles, Layers, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface PlannedFeature {
  title: string;
  description: string;
  icon?: React.ReactNode;
  status?: string;
}

interface ComingSoonProps {
  moduleNumber: string;
  moduleName: string;
  description: string;
  features: PlannedFeature[];
  backLink?: string;
  backText?: string;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({
  moduleNumber,
  moduleName,
  description,
  features,
  backLink = '/dashboard',
  backText = 'Return to Operations Dashboard',
}) => {
  return (
    <div className="coming-soon-container">
      <div className="coming-soon-hero">
        <div className="coming-soon-module-tag">
          <Compass size={14} />
          <span>{moduleNumber} &bull; PLANNED CAPABILITY</span>
        </div>
        <h1 className="coming-soon-title">{moduleName}</h1>
        <p className="coming-soon-desc">{description}</p>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Layers size={18} color="#0066cc" />
          <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>
            Planned Capability Roadmap & Architecture
          </h2>
        </div>

        <div className="roadmap-grid">
          {features.map((feature, idx) => (
            <div key={idx} className="roadmap-card">
              <div className="roadmap-card-header">
                <div className="roadmap-icon-box">
                  {feature.icon || <Sparkles size={18} />}
                </div>
                <h3 className="roadmap-card-title">{feature.title}</h3>
              </div>
              <p className="roadmap-card-desc">{feature.description}</p>
              <span className="roadmap-status-pill">
                <ShieldCheck size={12} color="#10b981" />
                {feature.status || 'Architecture Ready'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <Link
          to={backLink}
          className="btn btn-outline"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <span>{backText}</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};

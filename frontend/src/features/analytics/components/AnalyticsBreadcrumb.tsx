import { Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';

interface AnalyticsBreadcrumbProps {
  currentModule?: string;
  moduleBadge?: string;
}

export function AnalyticsBreadcrumb({
  currentModule,
  moduleBadge,
}: AnalyticsBreadcrumbProps) {
  return (
    <div className="hub-breadcrumb-bar">
      <nav aria-label="Breadcrumb" className="hub-breadcrumbs">
        <Link to="/dashboard" className="hub-breadcrumb-link">
          Maritime Ops
        </Link>
        <ChevronRight size={12} color="#64748b" />
        <Link to="/analytics" className="hub-breadcrumb-link">
          Analytics & Intelligence
        </Link>
        {currentModule && (
          <>
            <ChevronRight size={12} color="#64748b" />
            <span className="hub-breadcrumb-current">
              {currentModule}
            </span>
            {moduleBadge && (
              <span
                style={{
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  background: '#091e36',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  padding: '1px 5px',
                  borderRadius: '3px',
                }}
              >
                {moduleBadge}
              </span>
            )}
          </>
        )}
      </nav>

      {currentModule && (
        <Link to="/analytics" className="hub-back-btn">
          <ArrowLeft size={12} />
          <span>Back to Analytics Hub</span>
        </Link>
      )}
    </div>
  );
}

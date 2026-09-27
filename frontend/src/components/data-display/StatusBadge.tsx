import { Badge } from '../ui/Badge';

export interface StatusBadgeProps {
  status?: string | null;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  if (!status) {
    return (
      <Badge variant="neutral" className={className} icon={<span className="badge-dot" />}>
        DATA UNAVAILABLE
      </Badge>
    );
  }

  const normalized = status.toLowerCase().replace(/[_\s-]+/g, '');

  switch (normalized) {
    case 'stale':
    case 'stalesignal':
    case 'staledata':
      return (
        <Badge variant="warning" className={`status-badge-stale ${className || ''}`} icon={<span className="badge-dot" />}>
          STALE
        </Badge>
      );

    case 'live':
    case 'active':
    case 'operational':
      return (
        <Badge variant="success" className={`status-badge-live ${className || ''}`} icon={<span className="badge-dot" />}>
          LIVE
        </Badge>
      );

    case 'recent':
      return (
        <Badge variant="info" className={`status-badge-recent ${className || ''}`} icon={<span className="badge-dot" />}>
          RECENT
        </Badge>
      );

    case 'dataunavailable':
    case 'unavailable':
    case 'nosignal':
    case 'unknown':
      return (
        <Badge variant="neutral" className={`status-badge-unavailable ${className || ''}`} icon={<span className="badge-dot" />}>
          DATA UNAVAILABLE
        </Badge>
      );

    case 'intransit':
    case 'underway':
      return (
        <Badge variant="info" className={className} icon={<span className="badge-dot" />}>
          UNDERWAY
        </Badge>
      );

    case 'inport':
    case 'moored':
    case 'anchored':
      return (
        <Badge variant="success" className={className} icon={<span className="badge-dot" />}>
          {normalized === 'anchored' ? 'ANCHORED' : 'IN PORT'}
        </Badge>
      );

    case 'congested':
    case 'delayed':
    case 'warning':
      return (
        <Badge variant="warning" className={className} icon={<span className="badge-dot" />}>
          {status.replace(/_/g, ' ').toUpperCase()}
        </Badge>
      );

    case 'inactive':
    case 'closed':
    case 'cancelled':
    case 'danger':
    case 'offline':
      return (
        <Badge variant="danger" className={className} icon={<span className="badge-dot" />}>
          {status.replace(/_/g, ' ').toUpperCase()}
        </Badge>
      );

    default:
      return (
        <Badge variant="neutral" className={className} icon={<span className="badge-dot" />}>
          {status.replace(/_/g, ' ').toUpperCase()}
        </Badge>
      );
  }
}

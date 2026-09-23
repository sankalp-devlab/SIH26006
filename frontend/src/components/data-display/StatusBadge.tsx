import { Badge } from '../ui/Badge';

export interface StatusBadgeProps {
  status?: string | null;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  if (!status) {
    return <Badge variant="neutral" className={className}>Unknown</Badge>;
  }

  const normalized = status.toLowerCase().replace(/[_\s-]+/g, '');

  switch (normalized) {
    case 'active':
    case 'operational':
    case 'available':
    case 'inport':
      return <Badge variant="success" className={className}>{status}</Badge>;

    case 'intransit':
    case 'underway':
    case 'pending':
    case 'reference':
      return <Badge variant="info" className={className}>{status}</Badge>;

    case 'congested':
    case 'delayed':
    case 'warning':
      return <Badge variant="warning" className={className}>{status}</Badge>;

    case 'inactive':
    case 'closed':
    case 'cancelled':
    case 'danger':
    case 'offline':
      return <Badge variant="danger" className={className}>{status}</Badge>;

    default:
      return <Badge variant="neutral" className={className}>{status}</Badge>;
  }
}

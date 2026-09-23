import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Failed to load data',
  message = 'An unexpected error occurred while communicating with the backend API.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="feedback-state">
      <AlertTriangle className="feedback-icon" style={{ color: 'var(--color-status-danger)' }} />
      <h4 className="feedback-title">{title}</h4>
      <p className="feedback-desc">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          icon={<RefreshCw size={14} />}
          onClick={onRetry}
          className="mt-4"
        >
          Try Again
        </Button>
      )}
    </div>
  );
}

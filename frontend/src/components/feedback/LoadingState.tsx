export interface LoadingStateProps {
  message?: string;
  description?: string;
}

export function LoadingState({
  message = 'Loading maritime data...',
  description = 'Retrieving real-time records from backend API',
}: LoadingStateProps) {
  return (
    <div className="feedback-state">
      <div className="spinner" style={{ marginBottom: '1rem' }} />
      <h4 className="feedback-title">{message}</h4>
      {description && <p className="feedback-desc">{description}</p>}
    </div>
  );
}

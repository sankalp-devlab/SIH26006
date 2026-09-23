import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface SearchErrorStateProps {
  error: string;
  onRetry: () => void;
}

export const SearchErrorState: React.FC<SearchErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div className="search-error-container">
      <AlertCircle size={28} color="#ef4444" />
      <h4 className="search-error-title">Search Service Unavailable</h4>
      <p className="search-error-desc">{error}</p>
      <button
        type="button"
        className="btn btn-outline btn-sm"
        onClick={onRetry}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8 }}
      >
        <RotateCcw size={13} />
        <span>Retry Search</span>
      </button>
    </div>
  );
};

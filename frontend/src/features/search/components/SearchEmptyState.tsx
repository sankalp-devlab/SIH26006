import React from 'react';
import { SearchX, Ship, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SearchEmptyStateProps {
  query: string;
  onSelectSuggestion: (sugg: string) => void;
  onClose: () => void;
}

export const SearchEmptyState: React.FC<SearchEmptyStateProps> = ({
  query,
  onSelectSuggestion,
  onClose,
}) => {
  return (
    <div className="search-empty-container">
      <div className="search-empty-icon-box">
        <SearchX size={28} color="#94a3b8" />
      </div>

      <h4 className="search-empty-title">No maritime matches found for &quot;{query}&quot;</h4>
      <p className="search-empty-desc">
        We couldn&apos;t find any vessels, ports, or corridors matching this exact query.
      </p>

      <div className="search-empty-suggestions">
        <span className="search-empty-suggestions-label">Try searching with:</span>
        <div className="search-suggestion-tags">
          <button
            type="button"
            className="search-suggestion-btn"
            onClick={() => onSelectSuggestion('9876543')}
          >
            IMO: 9876543
          </button>
          <button
            type="button"
            className="search-suggestion-btn"
            onClick={() => onSelectSuggestion('OCEAN STAR')}
          >
            Ex-name: OCEAN STAR
          </button>
          <button
            type="button"
            className="search-suggestion-btn"
            onClick={() => onSelectSuggestion('Handysize')}
          >
            Type: Handysize
          </button>
          <button
            type="button"
            className="search-suggestion-btn"
            onClick={() => onSelectSuggestion('Singapore')}
          >
            Port: Singapore
          </button>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <Link
          to="/vessels"
          onClick={onClose}
          className="btn btn-outline btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <Ship size={14} />
          <span>Browse All Fleet Vessels</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
};

import React from 'react';
import { History, X, Trash2, ArrowUpRight, Lightbulb, Hash, Anchor } from 'lucide-react';
import type { RecentSearchItem } from '../../../types/search';

interface RecentSearchesProps {
  recentSearches: RecentSearchItem[];
  onSelectQuery: (query: string) => void;
  onRemoveItem: (id: string, e: React.MouseEvent) => void;
  onClearAll: () => void;
}

export const RecentSearches: React.FC<RecentSearchesProps> = ({
  recentSearches,
  onSelectQuery,
  onRemoveItem,
  onClearAll,
}) => {
  const handleBadgeClick = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectQuery(term);
  };

  return (
    <div className="search-recent-container">
      {/* Recent Queries Section */}
      {recentSearches.length > 0 && (
        <div className="search-recent-section">
          <div className="search-recent-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <History size={13} color="#38bdf8" />
              <span className="search-recent-title">Recent Searches</span>
            </div>
            <button
              type="button"
              className="search-clear-all-btn"
              onClick={onClearAll}
              title="Clear search history"
            >
              <Trash2 size={11} />
              <span>Clear History</span>
            </button>
          </div>

          <div className="search-recent-chips">
            {recentSearches.map((item) => (
              <div
                key={item.id}
                className="search-recent-chip"
                onClick={() => onSelectQuery(item.query)}
                title={`Search for "${item.query}"`}
              >
                <span className="search-chip-text">{item.query}</span>
                {item.resultTitle && (
                  <span className="search-chip-subtext">&bull; {item.resultTitle}</span>
                )}
                <button
                  type="button"
                  className="search-chip-remove"
                  onClick={(e) => onRemoveItem(item.id, e)}
                  aria-label="Remove search"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Maritime Search Syntax & Tips */}
      <div className="search-tips-section">
        <div className="search-tips-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Lightbulb size={13} color="#f59e0b" />
            <span className="search-tips-title">Maritime Intelligence Search Tips</span>
          </div>
          <span style={{ fontSize: '10px', color: '#64748b' }}>Click any card or tag to query</span>
        </div>

        <div className="search-tips-grid">
          {/* Card 1: IMO Lookup */}
          <div className="search-tip-card" onClick={() => onSelectQuery('9876543')}>
            <div className="search-tip-top">
              <span className="search-tip-badge">
                <Hash size={11} />
                <span>IMO Lookup</span>
              </span>
              <ArrowUpRight size={13} className="search-tip-arrow" />
            </div>
            <p className="search-tip-desc">
              Enter 7-digit IMO directly:
              <br />
              <code onClick={(e) => handleBadgeClick('9876543', e)}>9876543</code>{' '}
              or{' '}
              <code onClick={(e) => handleBadgeClick('IMO 9876543', e)}>IMO 9876543</code>
            </p>
          </div>

          {/* Card 2: Historical Ex-Name */}
          <div className="search-tip-card" onClick={() => onSelectQuery('OCEAN STAR')}>
            <div className="search-tip-top">
              <span className="search-tip-badge">
                <History size={11} />
                <span>Historical Ex-Name</span>
              </span>
              <ArrowUpRight size={13} className="search-tip-arrow" />
            </div>
            <p className="search-tip-desc">
              Query past registered names:
              <br />
              <code onClick={(e) => handleBadgeClick('OCEAN STAR', e)}>OCEAN STAR</code>{' '}
              &rarr; STAR VOYAGER
            </p>
          </div>

          {/* Card 3: Port & Terminal */}
          <div className="search-tip-card" onClick={() => onSelectQuery('JNPT')}>
            <div className="search-tip-top">
              <span className="search-tip-badge">
                <Anchor size={11} />
                <span>Port &amp; Terminal</span>
              </span>
              <ArrowUpRight size={13} className="search-tip-arrow" />
            </div>
            <p className="search-tip-desc">
              Search by port or UN/LOCODE:
              <br />
              <code onClick={(e) => handleBadgeClick('JNPT', e)}>JNPT</code>{' '}
              <code onClick={(e) => handleBadgeClick('Singapore', e)}>Singapore</code>{' '}
              <code onClick={(e) => handleBadgeClick('Rotterdam', e)}>Rotterdam</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

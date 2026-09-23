import React from 'react';
import { History, X, Trash2, ArrowUpRight, Lightbulb } from 'lucide-react';
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
  return (
    <div className="search-recent-container">
      {/* Recent Queries Section */}
      {recentSearches.length > 0 && (
        <div className="search-recent-section">
          <div className="search-recent-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <History size={13} color="#94a3b8" />
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
          <Lightbulb size={13} color="#f59e0b" />
          <span className="search-tips-title">Maritime Intelligence Search Tips</span>
        </div>

        <div className="search-tips-grid">
          <div className="search-tip-card" onClick={() => onSelectQuery('9876543')}>
            <div className="search-tip-top">
              <span className="search-tip-badge">IMO Lookup</span>
              <ArrowUpRight size={12} color="#94a3b8" />
            </div>
            <p className="search-tip-desc">Enter 7-digit IMO number directly (e.g. <code>9876543</code> or <code>IMO 9876543</code>)</p>
          </div>

          <div className="search-tip-card" onClick={() => onSelectQuery('OCEAN STAR')}>
            <div className="search-tip-top">
              <span className="search-tip-badge">Historical Ex-Name</span>
              <ArrowUpRight size={12} color="#94a3b8" />
            </div>
            <p className="search-tip-desc">Find vessels by their previous name (e.g. <code>OCEAN STAR</code> &rarr; STAR VOYAGER)</p>
          </div>

          <div className="search-tip-card" onClick={() => onSelectQuery('JNPT')}>
            <div className="search-tip-top">
              <span className="search-tip-badge">Port & Terminal</span>
              <ArrowUpRight size={12} color="#94a3b8" />
            </div>
            <p className="search-tip-desc">Query by port name or UN/LOCODE (e.g. <code>JNPT</code>, <code>Singapore</code>, <code>Rotterdam</code>)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

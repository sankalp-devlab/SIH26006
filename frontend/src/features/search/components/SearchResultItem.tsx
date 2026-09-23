import React from 'react';
import { Ship, Anchor, Box, Compass, ArrowRight, Tag } from 'lucide-react';
import type { SearchResultItem as SearchResultItemType } from '../../../types/search';

interface SearchResultItemProps {
  item: SearchResultItemType;
  isSelected: boolean;
  onSelect: (item: SearchResultItemType) => void;
  onMouseEnter: () => void;
}

export const SearchResultItem: React.FC<SearchResultItemProps> = ({
  item,
  isSelected,
  onSelect,
  onMouseEnter,
}) => {
  const getIcon = () => {
    switch (item.category) {
      case 'Vessels':
        return <Ship size={16} className="search-result-icon" />;
      case 'Ports':
        return <Anchor size={16} className="search-result-icon" />;
      case 'Cargo':
        return <Box size={16} className="search-result-icon" />;
      default:
        return <Compass size={16} className="search-result-icon" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    const lower = status.toLowerCase();

    if (lower === 'scrapped') {
      return <span className="search-status-pill status-scrapped">SCRAPPED</span>;
    }
    if (lower === 'orderbook') {
      return <span className="search-status-pill status-orderbook">ORDERBOOK</span>;
    }
    if (lower === 'active') {
      return <span className="search-status-pill status-active">ACTIVE</span>;
    }
    if (lower === 'reference') {
      return <span className="search-status-pill status-reference">REFERENCE</span>;
    }
    return <span className="search-status-pill">{status.toUpperCase()}</span>;
  };

  return (
    <div
      className={`search-result-row ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(item)}
      onMouseEnter={onMouseEnter}
      role="option"
      aria-selected={isSelected}
      tabIndex={-1}
    >
      <div className="search-result-left">
        <div className={`search-result-icon-box cat-${item.category.toLowerCase()}`}>
          {getIcon()}
        </div>

        <div className="search-result-content">
          <div className="search-result-header-line">
            <span className="search-result-title">{item.title}</span>

            {item.imo && (
              <span className="search-result-imo-badge">IMO {item.imo}</span>
            )}

            {getStatusBadge(item.status)}
          </div>

          <p className="search-result-subtitle">{item.subtitle}</p>

          {/* Historical Ex-Name Match Context */}
          {item.matchedExName && (
            <div className="search-exname-callout">
              <Tag size={11} color="#f59e0b" />
              <span>
                Historical match &bull; Former name: <strong>&quot;{item.matchedExName}&quot;</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="search-result-right">
        {isSelected ? (
          <span className="search-enter-hint">
            <span>Press</span> <kbd>&crarr;</kbd>
          </span>
        ) : (
          <ArrowRight size={14} className="search-arrow-icon" />
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useSearch } from '../../hooks/useSearch';
import { SearchInput } from './components/SearchInput';
import { SearchResultItem } from './components/SearchResultItem';
import { SearchResultGroup } from './components/SearchResultGroup';
import { RecentSearches } from './components/RecentSearches';
import { SearchEmptyState } from './components/SearchEmptyState';
import { SearchLoadingState } from './components/SearchLoadingState';
import { SearchErrorState } from './components/SearchErrorState';
import type { SearchResultItem as SearchResultItemType } from '../../types/search';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const {
    query,
    setQuery,
    category,
    setCategory,
    results,
    flattenedResults,
    totalCount,
    isLoading,
    error,
    recentSearches,
    saveRecent,
    removeRecent,
    clearRecent,
  } = useSearch();

  // Reset selection index whenever results or query change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, category]);

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (flattenedResults.length > 0) {
        setSelectedIndex((prev) => (prev < flattenedResults.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (flattenedResults.length > 0) {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flattenedResults.length - 1));
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flattenedResults.length > 0 && flattenedResults[selectedIndex]) {
        handleSelectItem(flattenedResults[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const handleSelectItem = (item: SearchResultItemType) => {
    saveRecent({
      query: query.trim() || item.title,
      resultTitle: item.title,
      path: item.path,
    });
    onClose();
    navigate(item.path);
  };

  if (!isOpen) return null;

  const isQueryEmpty = !query.trim() || query.trim().length < 2;

  return (
    <div className="command-palette-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="command-palette-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Bar with Input and Category Tabs */}
        <SearchInput
          query={query}
          onChange={setQuery}
          onClear={() => setQuery('')}
          category={category}
          onSelectCategory={setCategory}
          onKeyDown={handleKeyDown}
          isLoading={isLoading}
        />

        {/* Search Body Content */}
        <div className="search-results-viewport">
          {error ? (
            <SearchErrorState error={error} onRetry={() => setQuery(query + ' ')} />
          ) : isLoading ? (
            <SearchLoadingState />
          ) : isQueryEmpty ? (
            <RecentSearches
              recentSearches={recentSearches}
              onSelectQuery={(q) => setQuery(q)}
              onRemoveItem={removeRecent}
              onClearAll={clearRecent}
            />
          ) : totalCount === 0 ? (
            <SearchEmptyState
              query={query}
              onSelectSuggestion={(sugg) => setQuery(sugg)}
              onClose={onClose}
            />
          ) : (
            <div className="search-grouped-list">
              {/* Vessels Group */}
              {results.vessels.length > 0 && (
                <SearchResultGroup title="Fleet Vessels" count={results.vessels.length}>
                  {results.vessels.map((v) => {
                    const globalIdx = flattenedResults.findIndex((item) => item.id === v.id);
                    return (
                      <SearchResultItem
                        key={v.id}
                        item={v}
                        isSelected={globalIdx === selectedIndex}
                        onSelect={handleSelectItem}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                      />
                    );
                  })}
                </SearchResultGroup>
              )}

              {/* Ports Group */}
              {results.ports.length > 0 && (
                <SearchResultGroup title="Ports & Terminals" count={results.ports.length}>
                  {results.ports.map((p) => {
                    const globalIdx = flattenedResults.findIndex((item) => item.id === p.id);
                    return (
                      <SearchResultItem
                        key={p.id}
                        item={p}
                        isSelected={globalIdx === selectedIndex}
                        onSelect={handleSelectItem}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                      />
                    );
                  })}
                </SearchResultGroup>
              )}

              {/* Voyages & Routes Group */}
              {results.routes && results.routes.length > 0 && (
                <SearchResultGroup title="Voyages & Trade Routes" count={results.routes.length}>
                  {results.routes.map((r) => {
                    const globalIdx = flattenedResults.findIndex((item) => item.id === r.id);
                    return (
                      <SearchResultItem
                        key={r.id}
                        item={r}
                        isSelected={globalIdx === selectedIndex}
                        onSelect={handleSelectItem}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                      />
                    );
                  })}
                </SearchResultGroup>
              )}

              {/* Cargo Group */}
              {results.cargo && results.cargo.length > 0 && (
                <SearchResultGroup title="Cargo & Commodities" count={results.cargo.length}>
                  {results.cargo.map((c) => {
                    const globalIdx = flattenedResults.findIndex((item) => item.id === c.id);
                    return (
                      <SearchResultItem
                        key={c.id}
                        item={c}
                        isSelected={globalIdx === selectedIndex}
                        onSelect={handleSelectItem}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                      />
                    );
                  })}
                </SearchResultGroup>
              )}

              {/* Navigation Commands Group */}
              {results.navigation.length > 0 && (
                <SearchResultGroup title="Platform Navigation & Workspaces" count={results.navigation.length}>
                  {results.navigation.map((n) => {
                    const globalIdx = flattenedResults.findIndex((item) => item.id === n.id);
                    return (
                      <SearchResultItem
                        key={n.id}
                        item={n}
                        isSelected={globalIdx === selectedIndex}
                        onSelect={handleSelectItem}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                      />
                    );
                  })}
                </SearchResultGroup>
              )}
            </div>
          )}
        </div>

        {/* Search Footer with Keyboard Guidance */}
        <div className="search-modal-footer">
          <div className="search-shortcuts-bar">
            <span>
              <kbd>&uarr;</kbd> <kbd>&darr;</kbd> navigate
            </span>
            <span>
              <kbd>&crarr;</kbd> select
            </span>
            <span>
              <kbd>esc</kbd> close
            </span>
          </div>

          <div className="search-footer-brand">
            <ShieldCheck size={12} color="#10b981" />
            <span>SIH 26006 Global Maritime Search</span>
          </div>
        </div>
      </div>
    </div>
  );
};

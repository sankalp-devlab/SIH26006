import React, { useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import type { SearchCategory } from '../../../types/search';

interface SearchInputProps {
  query: string;
  onChange: (val: string) => void;
  onClear: () => void;
  category: SearchCategory;
  onSelectCategory: (cat: SearchCategory) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isLoading?: boolean;
}

const CATEGORIES: { key: SearchCategory; label: string }[] = [
  { key: 'ALL', label: 'All Entities' },
  { key: 'VESSELS', label: 'Vessels' },
  { key: 'PORTS', label: 'Ports' },
  { key: 'CARGO', label: 'Cargo' },
  { key: 'NAVIGATION', label: 'Commands' },
];

export const SearchInput: React.FC<SearchInputProps> = ({
  query,
  onChange,
  onClear,
  category,
  onSelectCategory,
  onKeyDown,
  isLoading,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus with microtask delay for smooth modal mount
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 40);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="search-input-wrapper">
      <div className="search-input-row">
        <Search size={18} className="search-icon" />
        <input
          ref={inputRef}
          type="text"
          className="search-main-input"
          placeholder="Search vessels by name, IMO, ex-name, ports, cargo..."
          value={query}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          aria-label="Search vessels, IMO, ex-names, ports, cargo"
          autoComplete="off"
          spellCheck="false"
        />

        {isLoading && <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />}

        {query && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={onClear}
            title="Clear search"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}

        <kbd className="search-esc-kbd">ESC</kbd>
      </div>

      {/* Entity Scope Filter Pills */}
      <div className="search-category-tabs" role="tablist">
        {CATEGORIES.map((cat) => {
          const isActive = category === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`search-tab-pill ${isActive ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat.key)}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

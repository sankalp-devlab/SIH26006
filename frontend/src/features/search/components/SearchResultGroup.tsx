import React from 'react';

interface SearchResultGroupProps {
  title: string;
  count: number;
  children: React.ReactNode;
}

export const SearchResultGroup: React.FC<SearchResultGroupProps> = ({
  title,
  count,
  children,
}) => {
  if (count === 0) return null;

  return (
    <div className="search-result-group">
      <div className="search-group-header">
        <span className="search-group-title">{title}</span>
        <span className="search-group-count">{count}</span>
      </div>
      <div className="search-group-items">{children}</div>
    </div>
  );
};

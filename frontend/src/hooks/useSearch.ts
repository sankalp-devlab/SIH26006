import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { SearchService } from '../services/search/search.service';
import type {
  SearchResultItem,
  GroupedSearchResults,
  SearchCategory,
  RecentSearchItem,
} from '../types/search';

export function useSearch(initialQuery: string = '', initialCategory: SearchCategory = 'ALL') {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<SearchCategory>(initialCategory);
  const [results, setResults] = useState<GroupedSearchResults>({
    vessels: [],
    ports: [],
    cargo: [],
    routes: [],
    navigation: [],
  });
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>(() =>
    SearchService.getRecentSearches()
  );

  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync recent searches on events
  const refreshRecentSearches = useCallback(() => {
    setRecentSearches(SearchService.getRecentSearches());
  }, []);

  useEffect(() => {
    window.addEventListener('recent-searches-updated', refreshRecentSearches);
    window.addEventListener('storage', refreshRecentSearches);
    return () => {
      window.removeEventListener('recent-searches-updated', refreshRecentSearches);
      window.removeEventListener('storage', refreshRecentSearches);
    };
  }, [refreshRecentSearches]);

  // Execute debounced search with cancellation
  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed || trimmed.length < 2) {
      setResults({ vessels: [], ports: [], cargo: [], routes: [], navigation: [] });
      setTotalCount(0);
      setIsLoading(false);
      setError(null);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      try {
        const { results: grouped, totalCount: count } = await SearchService.search(
          trimmed,
          category,
          controller.signal
        );

        if (!controller.signal.aborted) {
          setResults(grouped);
          setTotalCount(count);
          setIsLoading(false);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Search failed. Please try again.');
          setIsLoading(false);
        }
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, category]);

  // Flattened array for linear keyboard navigation across categories
  const flattenedResults = useMemo<SearchResultItem[]>(() => {
    return [
      ...results.vessels,
      ...results.ports,
      ...results.cargo,
      ...results.routes,
      ...results.navigation,
    ];
  }, [results]);

  const saveRecent = useCallback((item: { query: string; resultTitle?: string; path?: string }) => {
    SearchService.addRecentSearch(item);
  }, []);

  const removeRecent = useCallback((id: string) => {
    SearchService.removeRecentSearch(id);
  }, []);

  const clearRecent = useCallback(() => {
    SearchService.clearRecentSearches();
  }, []);

  return {
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
  };
}

import { useMemo } from 'react';
import {
  HistoryEntry,
  HistoryStats,
  calculateHistoryStats,
  filterHistoryBySearch,
  virtualizeHistory,
} from './history-utils';
import { searchHistory } from './round-utils';

/**
 * Custom hook for history search functionality
 */
export function useHistorySearch(history: HistoryEntry[], searchQuery: string): HistoryEntry[] {
  return useMemo(() => {
    return filterHistoryBySearch(history, searchQuery, searchHistory);
  }, [history, searchQuery]);
}

/**
 * Custom hook for virtualized history display
 */
export function useVirtualizedHistory(
  filteredHistory: HistoryEntry[],
  virtualized: boolean,
  maxVisibleRounds: number
): HistoryEntry[] {
  return useMemo(() => {
    return virtualizeHistory(filteredHistory, virtualized, maxVisibleRounds);
  }, [filteredHistory, virtualized, maxVisibleRounds]);
}

/**
 * Custom hook for history statistics
 */
export function useHistoryStats(history: HistoryEntry[]): HistoryStats {
  return useMemo(() => {
    return calculateHistoryStats(history);
  }, [history]);
}

/**
 * Custom hook for history handlers
 */
export function useHistoryHandlers({
  history,
  isCollapsed,
  isSearchExpanded,
  onToggle,
  onExport,
  setSearchQuery,
  setIsSearchExpanded,
}: {
  history: HistoryEntry[];
  isCollapsed: boolean;
  isSearchExpanded: boolean;
  onToggle: (_collapsed: boolean) => void;
  onExport?: (_history: HistoryEntry[]) => void;
  setSearchQuery: (_query: string) => void;
  setIsSearchExpanded: (_expanded: boolean) => void;
}) {
  const handleToggle = () => {
    if (history.length === 0) return;
    onToggle(!isCollapsed);
  };

  const handleExport = () => {
    if (onExport && history.length > 0) {
      onExport(history);
    }
  };

  const handleSearchToggle = () => {
    setIsSearchExpanded(!isSearchExpanded);
    if (isSearchExpanded) {
      setSearchQuery('');
    }
  };

  return {
    handleToggle,
    handleExport,
    handleSearchToggle,
  };
}
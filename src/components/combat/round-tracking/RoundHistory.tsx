'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  HistoryErrorState,
  HistoryHeader,
  HistorySearchInput,
  HistoryContent,
} from './HistoryComponents';
import {
  useHistorySearch,
  useVirtualizedHistory,
  useHistoryStats,
  useHistoryHandlers,
} from './history-hooks';
import { HistoryEntry } from './history-utils';

interface RoundHistoryProps {
  history: HistoryEntry[];
  isCollapsed: boolean;
  onToggle: (_collapsed: boolean) => void;
  searchable?: boolean;
  exportable?: boolean;
  virtualized?: boolean;
  maxVisibleRounds?: number;
  eventFormatter?: (_event: string) => string;
  roundFormatter?: (_round: number) => string;
  emptyMessage?: string;
  error?: string;
  onExport?: (_history: HistoryEntry[]) => void;
  onRetry?: () => void;
}

export function RoundHistory({
  history,
  isCollapsed,
  onToggle,
  searchable = false,
  exportable = false,
  virtualized = false,
  maxVisibleRounds = 50,
  eventFormatter,
  roundFormatter = (round) => `Round ${round}`,
  emptyMessage = 'No combat history recorded',
  error,
  onExport,
  onRetry,
}: RoundHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // Use extracted hooks for state management
  const filteredHistory = useHistorySearch(history, searchQuery);
  const displayHistory = useVirtualizedHistory(filteredHistory, virtualized, maxVisibleRounds);
  const stats = useHistoryStats(history);

  // Use extracted handlers
  const handlers = useHistoryHandlers({
    history,
    isCollapsed,
    isSearchExpanded,
    onToggle,
    onExport,
    setSearchQuery,
    setIsSearchExpanded,
  });

  // Handle error state
  if (error) {
    return <HistoryErrorState error={error} onRetry={onRetry} />;
  }

  return (
    <Card data-testid="history-section">
      <HistoryHeader
        stats={stats}
        searchable={searchable}
        exportable={exportable}
        isSearchExpanded={isSearchExpanded}
        isCollapsed={isCollapsed}
        onSearchToggle={handlers.handleSearchToggle}
        onExport={handlers.handleExport}
        onToggle={handlers.handleToggle}
      />

      {searchable && isSearchExpanded && !isCollapsed && (
        <HistorySearchInput
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      )}

      {!isCollapsed && (
        <HistoryContent
          data={{
            stats,
            displayHistory,
            filteredHistory,
            searchQuery,
          }}
          config={{
            virtualized,
            maxVisibleRounds,
            emptyMessage,
          }}
          formatters={{
            roundFormatter,
            eventFormatter,
          }}
          onClearSearch={() => setSearchQuery('')}
        />
      )}
    </Card>
  );
}
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ChevronDown,
  ChevronUp,
  Search,
  Download,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import {
  HistoryEntry,
  HistoryStats,
  formatHistoryEvent,
  createTextParts,
  formatEventTimestamp,
} from './history-utils';

interface HistoryErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export function HistoryErrorState({ error, onRetry }: HistoryErrorStateProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          Round History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              disabled={!onRetry}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

interface HistoryHeaderProps {
  stats: HistoryStats;
  searchable: boolean;
  exportable: boolean;
  isSearchExpanded: boolean;
  isCollapsed: boolean;
  onSearchToggle: () => void;
  onExport: () => void;
  onToggle: () => void;
}

export function HistoryHeader({
  stats,
  searchable,
  exportable,
  isSearchExpanded,
  isCollapsed,
  onSearchToggle,
  onExport,
  onToggle,
}: HistoryHeaderProps) {
  return (
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2" role="heading" aria-level={1}>
          Round History
          <Badge variant="secondary" className="text-xs">
            {stats.totalRounds} rounds recorded
          </Badge>
          {stats.totalEvents > 0 && (
            <Badge variant="outline" className="text-xs">
              {stats.totalEvents} total events
            </Badge>
          )}
        </CardTitle>

        <div className="flex items-center gap-2">
          {searchable && stats.totalRounds > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSearchToggle}
              className="text-muted-foreground hover:text-foreground"
              aria-label={isSearchExpanded ? 'Hide search' : 'Show search'}
            >
              <Search className="h-4 w-4" />
            </Button>
          )}

          {exportable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onExport}
              disabled={stats.totalRounds === 0}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Export history"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            disabled={stats.totalRounds === 0}
            className="text-muted-foreground hover:text-foreground"
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? 'Show history' : 'Hide history'}
          >
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </CardHeader>
  );
}

interface HistorySearchInputProps {
  searchQuery: string;
  onSearchChange: (_query: string) => void;
}

export function HistorySearchInput({ searchQuery, onSearchChange }: HistorySearchInputProps) {
  return (
    <div className="px-6 pb-3">
      <Input
        placeholder="Search history..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="text-sm"
      />
    </div>
  );
}

interface HistoryData {
  stats: HistoryStats;
  displayHistory: HistoryEntry[];
  filteredHistory: HistoryEntry[];
  searchQuery: string;
}

interface HistoryConfig {
  virtualized: boolean;
  maxVisibleRounds: number;
  emptyMessage: string;
}

interface HistoryFormatters {
  roundFormatter: (_round: number) => string;
  eventFormatter?: (_event: string) => string;
}

interface HistoryContentProps {
  data: HistoryData;
  config: HistoryConfig;
  formatters: HistoryFormatters;
  onClearSearch: () => void;
}

// Helper components to reduce complexity
function HistoryEmptyState({ emptyMessage }: { emptyMessage: string }) {
  return (
    <CardContent>
      <div className="text-center py-8 text-muted-foreground">
        <p>{emptyMessage}</p>
      </div>
    </CardContent>
  );
}

function HistoryNoResults({ onClearSearch }: { onClearSearch: () => void }) {
  return (
    <CardContent>
      <div className="text-center py-8 text-muted-foreground">
        <p>No matching events found</p>
        <Button variant="ghost" size="sm" onClick={onClearSearch} className="mt-2">
          Clear search
        </Button>
      </div>
    </CardContent>
  );
}

export function HistoryContent({
  data,
  config,
  formatters,
  onClearSearch,
}: HistoryContentProps) {
  const { stats, displayHistory, filteredHistory, searchQuery } = data;
  const { virtualized, maxVisibleRounds, emptyMessage } = config;
  const { roundFormatter, eventFormatter } = formatters;

  if (stats.totalRounds === 0) {
    return <HistoryEmptyState emptyMessage={emptyMessage} />;
  }

  if (searchQuery && filteredHistory.length === 0) {
    return <HistoryNoResults onClearSearch={onClearSearch} />;
  }

  return (
    <CardContent>
      <div className="space-y-4">
        {virtualized && filteredHistory.length > maxVisibleRounds && (
          <Alert>
            <AlertDescription>
              Showing the most recent {maxVisibleRounds} of {filteredHistory.length} rounds.
            </AlertDescription>
          </Alert>
        )}
        <HistoryList
          displayHistory={displayHistory}
          searchQuery={searchQuery}
          roundFormatter={roundFormatter}
          eventFormatter={eventFormatter}
        />
      </div>
      <div className="sr-only" aria-live="polite" aria-label="history expanded">
        <span>
          History expanded, showing {displayHistory.length} rounds
        </span>
      </div>
    </CardContent>
  );
}

interface HistoryListProps {
  displayHistory: HistoryEntry[];
  searchQuery: string;
  roundFormatter: (_round: number) => string;
  eventFormatter?: (_event: string) => string;
}

export function HistoryList({
  displayHistory,
  searchQuery,
  roundFormatter,
  eventFormatter,
}: HistoryListProps) {
  // Filter out invalid entries
  const validHistory = displayHistory.filter(entry =>
    entry &&
    (typeof entry.round === 'number' || typeof entry.round === 'string') &&
    Array.isArray(entry.events)
  ).map(entry => ({
    ...entry,
    round: typeof entry.round === 'number' ? entry.round : 1, // Default invalid rounds to 1
  }));

  return (
    <div role="list" className="space-y-4">
      {validHistory.map((entry) => (
        <HistoryRoundEntry
          key={entry.round}
          entry={entry}
          searchQuery={searchQuery}
          roundFormatter={roundFormatter}
          eventFormatter={eventFormatter}
        />
      ))}
    </div>
  );
}

interface HistoryRoundEntryProps {
  entry: HistoryEntry;
  searchQuery: string;
  roundFormatter: (_round: number) => string;
  eventFormatter?: (_event: string) => string;
}

export function HistoryRoundEntry({
  entry,
  searchQuery,
  roundFormatter,
  eventFormatter,
}: HistoryRoundEntryProps) {
  return (
    <div
      role="listitem"
      data-testid="round-section"
      className="border rounded-lg p-3 bg-muted/20"
    >
      <h4 className="font-medium text-sm mb-2 flex items-center gap-2" role="heading" aria-level={2}>
        {roundFormatter(entry.round)}
        <Badge variant="outline" className="text-xs">
          {entry.events.length} events
        </Badge>
      </h4>

      <div className="space-y-1 text-sm" role="list">
        {entry.events.filter(event => event !== null && event !== undefined).map((event, eventIndex) => (
          <HistoryEventItem
            key={eventIndex}
            event={event}
            searchQuery={searchQuery}
            eventFormatter={eventFormatter}
          />
        ))}
      </div>
    </div>
  );
}

interface HistoryEventItemProps {
  event: string | { text: string; timestamp?: Date };
  searchQuery: string;
  eventFormatter?: (_event: string) => string;
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  const parts = createTextParts(text, query);

  return (
    <>
      {parts.map((part, index) =>
        part.isHighlight ? (
          <span key={index} className="highlight bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
            {part.text}
          </span>
        ) : (
          part.text
        )
      )}
    </>
  );
}

export function HistoryEventItem({ event, searchQuery, eventFormatter }: HistoryEventItemProps) {
  const formatted = formatHistoryEvent(event, eventFormatter);

  return (
    <div className="flex items-center justify-between" role="listitem">
      <span className="text-muted-foreground">
        <HighlightedText text={formatted.text} query={searchQuery} />
      </span>
      {formatted.timestamp && (
        <span className="text-xs text-muted-foreground font-mono">
          {formatEventTimestamp(formatted.timestamp)}
        </span>
      )}
    </div>
  );
}
'use client';

import React, { useState, useMemo } from 'react';
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
import { searchHistory } from './round-utils';

interface HistoryEvent {
  text: string;
  timestamp?: Date;
}

interface HistoryEntry {
  round: number;
  events: (string | HistoryEvent)[];
}

interface RoundHistoryProps {
  history: HistoryEntry[];
  isCollapsed: boolean;
  onToggle: (collapsed: boolean) => void;
  searchable?: boolean;
  exportable?: boolean;
  virtualized?: boolean;
  maxVisibleRounds?: number;
  eventFormatter?: (event: string) => string;
  roundFormatter?: (round: number) => string;
  emptyMessage?: string;
  error?: string;
  onExport?: (history: HistoryEntry[]) => void;
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

  // Filter and process history based on search
  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) {
      return history;
    }

    return searchHistory(
      history.map(entry => ({
        round: entry.round,
        events: entry.events.map(event => 
          typeof event === 'string' ? event : event.text
        ),
      })),
      searchQuery
    );
  }, [history, searchQuery]);

  // Apply virtualization if enabled
  const displayHistory = useMemo(() => {
    if (!virtualized || filteredHistory.length <= maxVisibleRounds) {
      return filteredHistory;
    }

    // Show most recent rounds
    return filteredHistory.slice(-maxVisibleRounds);
  }, [filteredHistory, virtualized, maxVisibleRounds]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalRounds = history.length;
    const totalEvents = history.reduce((total, entry) => total + entry.events.length, 0);
    
    return { totalRounds, totalEvents };
  }, [history]);

  // Event formatting helper
  const formatEvent = (event: string | HistoryEvent): { text: string; timestamp?: Date } => {
    if (typeof event === 'string') {
      const formattedText = eventFormatter ? eventFormatter(event) : event;
      return { text: formattedText };
    }
    
    const formattedText = eventFormatter ? eventFormatter(event.text) : event.text;
    return { text: formattedText, timestamp: event.timestamp };
  };

  // Highlight search terms in text
  const highlightSearchTerm = (text: string, query: string): React.ReactNode => {
    if (!query.trim()) {
      return text;
    }

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) => {
      const isMatch = regex.test(part) && part.toLowerCase() === query.toLowerCase();
      return isMatch ? (
        <span key={index} className="highlight bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </span>
      ) : (
        part
      );
    });
  };

  // Format timestamp
  const formatTimestamp = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle toggle
  const handleToggle = () => {
    if (history.length === 0) return;
    onToggle(!isCollapsed);
  };

  // Handle export
  const handleExport = () => {
    if (onExport && history.length > 0) {
      onExport(history);
    }
  };

  // Handle search toggle
  const handleSearchToggle = () => {
    setIsSearchExpanded(!isSearchExpanded);
    if (isSearchExpanded) {
      setSearchQuery('');
    }
  };

  // Error state
  if (error) {
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
              {onRetry && (
                <Button variant="outline" size="sm" onClick={onRetry}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Retry
                </Button>
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="history-section">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Round History
            {stats.totalRounds > 0 && (
              <Badge variant="secondary" className="text-xs">
                {stats.totalRounds} rounds recorded
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {searchable && stats.totalRounds > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSearchToggle}
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
                onClick={handleExport}
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
              onClick={handleToggle}
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

        {/* Search input */}
        {searchable && isSearchExpanded && !isCollapsed && (
          <div className="mt-3">
            <Input
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-sm"
            />
          </div>
        )}
      </CardHeader>

      {!isCollapsed && (
        <CardContent>
          {/* Empty state */}
          {stats.totalRounds === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>{emptyMessage}</p>
            </div>
          )}

          {/* Summary when collapsed or filtered */}
          {isCollapsed && stats.totalRounds > 0 && (
            <div className="text-sm text-muted-foreground space-y-1">
              <p>{stats.totalRounds} rounds recorded</p>
              <p>{stats.totalEvents} total events</p>
            </div>
          )}

          {/* No search results */}
          {!isCollapsed && searchQuery && filteredHistory.length === 0 && history.length > 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No matching events found</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="mt-2"
              >
                Clear search
              </Button>
            </div>
          )}

          {/* History content */}
          {!isCollapsed && displayHistory.length > 0 && (
            <div className="space-y-4">
              {/* Virtualization notice */}
              {virtualized && filteredHistory.length > maxVisibleRounds && (
                <Alert>
                  <AlertDescription>
                    Showing the most recent {maxVisibleRounds} of {filteredHistory.length} rounds.
                  </AlertDescription>
                </Alert>
              )}

              {/* History list */}
              <div role="list" className="space-y-4">
                {displayHistory.map((entry) => (
                  <div
                    key={entry.round}
                    role="listitem"
                    data-testid="round-section"
                    className="border rounded-lg p-3 bg-muted/20"
                  >
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      {roundFormatter(entry.round)}
                      <Badge variant="outline" className="text-xs">
                        {entry.events.length} events
                      </Badge>
                    </h4>
                    
                    <ul className="space-y-1 text-sm">
                      {entry.events.map((event, eventIndex) => {
                        const formatted = formatEvent(event);
                        return (
                          <li key={eventIndex} className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              {highlightSearchTerm(formatted.text, searchQuery)}
                            </span>
                            {formatted.timestamp && (
                              <span className="text-xs text-muted-foreground font-mono">
                                {formatTimestamp(formatted.timestamp)}
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Screen reader announcements */}
          <div className="sr-only" aria-live="polite">
            {!isCollapsed && (
              <span aria-label="History expanded">
                History expanded, showing {displayHistory.length} rounds
              </span>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
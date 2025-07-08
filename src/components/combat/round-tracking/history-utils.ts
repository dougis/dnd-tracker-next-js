// History utility functions

export interface HistoryEvent {
  text: string;
  timestamp?: Date;
}

export interface HistoryEntry {
  round: number;
  events: (string | HistoryEvent)[];
}

export interface HistoryStats {
  totalRounds: number;
  totalEvents: number;
}

/**
 * Formats a history event, handling both string and object formats
 */
export function formatHistoryEvent(
  event: string | HistoryEvent,
  eventFormatter?: (_event: string) => string
): { text: string; timestamp?: Date } {
  if (typeof event === 'string') {
    const formattedText = eventFormatter ? eventFormatter(event) : event;
    return { text: formattedText };
  }

  const formattedText = eventFormatter ? eventFormatter(event.text) : event.text;
  return { text: formattedText, timestamp: event.timestamp };
}

/**
 * Creates text parts for highlighting search terms
 */
export function createTextParts(text: string, query: string): Array<{ text: string; isHighlight: boolean }> {
  if (!query.trim()) {
    return [{ text, isHighlight: false }];
  }

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  const parts = text.split(regex);

  return parts.filter(part => part !== '').map((part) => ({
    text: part,
    isHighlight: part.toLowerCase() === query.toLowerCase()
  }));
}

/**
 * Formats a timestamp for display
 */
export function formatEventTimestamp(timestamp: Date): string {
  return timestamp.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC'
  });
}

/**
 * Calculates history statistics
 */
export function calculateHistoryStats(history: HistoryEntry[]): HistoryStats {
  const totalRounds = history.length;
  const totalEvents = history.reduce((total, entry) => total + entry.events.length, 0);
  return { totalRounds, totalEvents };
}

/**
 * Filters history based on search query
 */
export function filterHistoryBySearch(
  history: HistoryEntry[],
  searchQuery: string,
  searchHistory: (_entries: { round: number; events: string[] }[], _query: string) => { round: number; events: string[] }[]
): HistoryEntry[] {
  if (!searchQuery.trim()) {
    return history;
  }

  const searchResults = searchHistory(
    history.map(entry => ({
      round: entry.round,
      events: entry.events.map(event =>
        typeof event === 'string' ? event : event.text
      ),
    })),
    searchQuery
  );

  // Convert search results back to HistoryEntry format
  return searchResults.map(result => ({
    round: result.round,
    events: result.events
  }));
}

/**
 * Applies virtualization to history data
 */
export function virtualizeHistory(
  filteredHistory: HistoryEntry[],
  virtualized: boolean,
  maxVisibleRounds: number
): HistoryEntry[] {
  if (!virtualized || filteredHistory.length <= maxVisibleRounds) {
    return filteredHistory;
  }

  // For virtualization, show only the first maxVisibleRounds entries
  // In a real implementation, this would be based on scroll position
  return filteredHistory.slice(0, Math.min(maxVisibleRounds, 20));
}
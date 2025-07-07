import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RoundHistory } from '../RoundHistory';
import { TEST_HISTORY, MockHistoryEntry } from './round-tracking-test-helpers';

describe('RoundHistory', () => {
  const defaultProps = {
    history: TEST_HISTORY,
    isCollapsed: true,
    onToggle: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders history header', () => {
      render(<RoundHistory {...defaultProps} />);
      expect(screen.getByText('Round History')).toBeInTheDocument();
    });

    it('shows toggle button when collapsed', () => {
      render(<RoundHistory {...defaultProps} />);
      expect(screen.getByRole('button', { name: /show history/i })).toBeInTheDocument();
    });

    it('shows toggle button when expanded', () => {
      render(<RoundHistory {...defaultProps} isCollapsed={false} />);
      expect(screen.getByRole('button', { name: /hide history/i })).toBeInTheDocument();
    });

    it('displays history count when collapsed', () => {
      render(<RoundHistory {...defaultProps} />);
      expect(screen.getByText('2 rounds recorded')).toBeInTheDocument();
    });
  });

  describe('Collapsed State', () => {
    it('hides history content when collapsed', () => {
      render(<RoundHistory {...defaultProps} />);
      
      expect(screen.queryByText('Combat started')).not.toBeInTheDocument();
      expect(screen.queryByText('Wizard casts Fireball')).not.toBeInTheDocument();
    });

    it('calls onToggle when expand button is clicked', () => {
      render(<RoundHistory {...defaultProps} />);
      
      const toggleButton = screen.getByRole('button', { name: /show history/i });
      fireEvent.click(toggleButton);
      
      expect(defaultProps.onToggle).toHaveBeenCalledWith(false);
    });

    it('shows summary statistics when collapsed', () => {
      const historyWithManyEvents: MockHistoryEntry[] = [
        { round: 1, events: ['Event 1', 'Event 2', 'Event 3'] },
        { round: 2, events: ['Event 4', 'Event 5'] },
        { round: 3, events: ['Event 6'] },
      ];

      render(<RoundHistory {...defaultProps} history={historyWithManyEvents} />);
      
      expect(screen.getByText('3 rounds recorded')).toBeInTheDocument();
      expect(screen.getByText('6 total events')).toBeInTheDocument();
    });
  });

  describe('Expanded State', () => {
    const expandedProps = { ...defaultProps, isCollapsed: false };

    it('shows all history content when expanded', () => {
      render(<RoundHistory {...expandedProps} />);
      
      expect(screen.getByText('Combat started')).toBeInTheDocument();
      expect(screen.getByText('Rogue attacks Goblin')).toBeInTheDocument();
      expect(screen.getByText('Wizard casts Fireball')).toBeInTheDocument();
      expect(screen.getByText('Goblin takes damage')).toBeInTheDocument();
    });

    it('calls onToggle when collapse button is clicked', () => {
      render(<RoundHistory {...expandedProps} />);
      
      const toggleButton = screen.getByRole('button', { name: /hide history/i });
      fireEvent.click(toggleButton);
      
      expect(defaultProps.onToggle).toHaveBeenCalledWith(true);
    });

    it('displays round numbers', () => {
      render(<RoundHistory {...expandedProps} />);
      
      expect(screen.getByText('Round 1')).toBeInTheDocument();
      expect(screen.getByText('Round 2')).toBeInTheDocument();
    });

    it('groups events by round', () => {
      render(<RoundHistory {...expandedProps} />);
      
      const round1Section = screen.getByText('Round 1').closest('[data-testid="round-section"]');
      const round2Section = screen.getByText('Round 2').closest('[data-testid="round-section"]');
      
      expect(round1Section).toHaveTextContent('Combat started');
      expect(round1Section).toHaveTextContent('Rogue attacks Goblin');
      expect(round1Section).not.toHaveTextContent('Wizard casts Fireball');
      
      expect(round2Section).toHaveTextContent('Wizard casts Fireball');
      expect(round2Section).toHaveTextContent('Goblin takes damage');
      expect(round2Section).not.toHaveTextContent('Combat started');
    });

    it('shows event timestamps when available', () => {
      const historyWithTimestamps: MockHistoryEntry[] = [
        {
          round: 1,
          events: [
            { text: 'Combat started', timestamp: new Date('2023-01-01T12:00:00Z') },
            { text: 'Rogue attacks', timestamp: new Date('2023-01-01T12:01:30Z') },
          ] as any,
        },
      ];

      render(<RoundHistory {...expandedProps} history={historyWithTimestamps} />);
      
      expect(screen.getByText('12:00')).toBeInTheDocument();
      expect(screen.getByText('12:01')).toBeInTheDocument();
    });
  });

  describe('Empty History', () => {
    it('shows empty state message', () => {
      render(<RoundHistory {...defaultProps} history={[]} />);
      
      expect(screen.getByText('No combat history recorded')).toBeInTheDocument();
    });

    it('disables toggle button when empty', () => {
      render(<RoundHistory {...defaultProps} history={[]} />);
      
      const toggleButton = screen.getByRole('button', { name: /show history/i });
      expect(toggleButton).toBeDisabled();
    });

    it('shows zero count when empty', () => {
      render(<RoundHistory {...defaultProps} history={[]} />);
      
      expect(screen.getByText('0 rounds recorded')).toBeInTheDocument();
    });
  });

  describe('History Filtering and Search', () => {
    const longHistory: MockHistoryEntry[] = [
      { round: 1, events: ['Combat started', 'Rogue attacks Goblin'] },
      { round: 2, events: ['Wizard casts Fireball', 'Goblin takes damage'] },
      { round: 3, events: ['Cleric heals Rogue', 'Rogue attacks again'] },
      { round: 4, events: ['Wizard casts Magic Missile', 'Goblin dies'] },
    ];

    it('shows search input when searchable prop is true', () => {
      render(<RoundHistory {...defaultProps} history={longHistory} searchable={true} isCollapsed={false} />);
      
      expect(screen.getByPlaceholderText(/search history/i)).toBeInTheDocument();
    });

    it('filters events based on search query', () => {
      render(<RoundHistory {...defaultProps} history={longHistory} searchable={true} isCollapsed={false} />);
      
      const searchInput = screen.getByPlaceholderText(/search history/i);
      fireEvent.change(searchInput, { target: { value: 'Wizard' } });
      
      expect(screen.getByText('Wizard casts Fireball')).toBeInTheDocument();
      expect(screen.getByText('Wizard casts Magic Missile')).toBeInTheDocument();
      expect(screen.queryByText('Rogue attacks Goblin')).not.toBeInTheDocument();
    });

    it('shows no results message when search yields no matches', () => {
      render(<RoundHistory {...defaultProps} history={longHistory} searchable={true} isCollapsed={false} />);
      
      const searchInput = screen.getByPlaceholderText(/search history/i);
      fireEvent.change(searchInput, { target: { value: 'Dragon' } });
      
      expect(screen.getByText('No matching events found')).toBeInTheDocument();
    });

    it('highlights search terms in results', () => {
      render(<RoundHistory {...defaultProps} history={longHistory} searchable={true} isCollapsed={false} />);
      
      const searchInput = screen.getByPlaceholderText(/search history/i);
      fireEvent.change(searchInput, { target: { value: 'Fireball' } });
      
      const highlightedText = screen.getByText('Fireball');
      expect(highlightedText).toHaveClass('highlight'); // Assuming CSS class for highlighting
    });

    it('clears search when input is cleared', () => {
      render(<RoundHistory {...defaultProps} history={longHistory} searchable={true} isCollapsed={false} />);
      
      const searchInput = screen.getByPlaceholderText(/search history/i);
      fireEvent.change(searchInput, { target: { value: 'Wizard' } });
      fireEvent.change(searchInput, { target: { value: '' } });
      
      // All events should be visible again
      expect(screen.getByText('Combat started')).toBeInTheDocument();
      expect(screen.getByText('Rogue attacks Goblin')).toBeInTheDocument();
    });
  });

  describe('Export Functionality', () => {
    it('shows export button when exportable prop is true', () => {
      render(<RoundHistory {...defaultProps} exportable={true} />);
      
      expect(screen.getByRole('button', { name: /export history/i })).toBeInTheDocument();
    });

    it('calls onExport when export button is clicked', () => {
      const onExport = jest.fn();
      render(<RoundHistory {...defaultProps} exportable={true} onExport={onExport} />);
      
      const exportButton = screen.getByRole('button', { name: /export history/i });
      fireEvent.click(exportButton);
      
      expect(onExport).toHaveBeenCalledWith(TEST_HISTORY);
    });

    it('disables export button when history is empty', () => {
      render(<RoundHistory {...defaultProps} history={[]} exportable={true} />);
      
      const exportButton = screen.getByRole('button', { name: /export history/i });
      expect(exportButton).toBeDisabled();
    });
  });

  describe('Performance Optimization', () => {
    it('handles large history efficiently', () => {
      const largeHistory = Array.from({ length: 100 }, (_, i) => ({
        round: i + 1,
        events: [`Event ${i + 1}A`, `Event ${i + 1}B`],
      }));

      const start = performance.now();
      render(<RoundHistory {...defaultProps} history={largeHistory} isCollapsed={false} />);
      const end = performance.now();

      expect(end - start).toBeLessThan(100); // Should render quickly
    });

    it('virtualizes long event lists when virtualization is enabled', () => {
      const longHistory = Array.from({ length: 1000 }, (_, i) => ({
        round: i + 1,
        events: [`Event ${i + 1}`],
      }));

      render(<RoundHistory {...defaultProps} history={longHistory} virtualized={true} isCollapsed={false} />);
      
      // Should only render visible items
      const visibleEvents = screen.getAllByText(/Event \d+/);
      expect(visibleEvents.length).toBeLessThan(50); // Much less than total
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<RoundHistory {...defaultProps} isCollapsed={false} />);
      
      expect(screen.getByRole('heading', { name: 'Round History' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Round 1' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Round 2' })).toBeInTheDocument();
    });

    it('has accessible toggle button', () => {
      render(<RoundHistory {...defaultProps} />);
      
      const toggleButton = screen.getByRole('button', { name: /show history/i });
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('updates aria-expanded when toggled', () => {
      render(<RoundHistory {...defaultProps} isCollapsed={false} />);
      
      const toggleButton = screen.getByRole('button', { name: /hide history/i });
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('has proper list semantics', () => {
      render(<RoundHistory {...defaultProps} isCollapsed={false} />);
      
      const historyList = screen.getByRole('list');
      expect(historyList).toBeInTheDocument();
      
      const listItems = screen.getAllByRole('listitem');
      expect(listItems.length).toBeGreaterThan(0);
    });

    it('announces changes to screen readers', () => {
      render(<RoundHistory {...defaultProps} />);
      
      const toggleButton = screen.getByRole('button', { name: /show history/i });
      fireEvent.click(toggleButton);
      
      expect(screen.getByLabelText(/history expanded/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles malformed history data gracefully', () => {
      const malformedHistory = [
        { round: 1, events: null }, // Null events
        { round: 'invalid', events: ['Valid event'] }, // Invalid round
        null, // Null entry
      ] as any;

      render(<RoundHistory {...defaultProps} history={malformedHistory} isCollapsed={false} />);
      
      // Should not crash and should show valid events
      expect(screen.getByText('Valid event')).toBeInTheDocument();
    });

    it('shows error state when history fails to load', () => {
      render(<RoundHistory {...defaultProps} error="Failed to load history" />);
      
      expect(screen.getByText('Failed to load history')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('calls onRetry when retry button is clicked', () => {
      const onRetry = jest.fn();
      render(<RoundHistory {...defaultProps} error="Failed to load history" onRetry={onRetry} />);
      
      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);
      
      expect(onRetry).toHaveBeenCalled();
    });
  });

  describe('Custom Formatting', () => {
    it('applies custom event formatters when provided', () => {
      const customFormatter = (event: string) => {
        if (event.includes('attack')) {
          return `⚔️ ${event}`;
        }
        return event;
      };

      render(<RoundHistory {...defaultProps} isCollapsed={false} eventFormatter={customFormatter} />);
      
      expect(screen.getByText('⚔️ Rogue attacks Goblin')).toBeInTheDocument();
      expect(screen.getByText('Combat started')).toBeInTheDocument(); // Not formatted
    });

    it('applies custom round formatters when provided', () => {
      const customRoundFormatter = (round: number) => `Turn ${round}`;

      render(<RoundHistory {...defaultProps} isCollapsed={false} roundFormatter={customRoundFormatter} />);
      
      expect(screen.getByText('Turn 1')).toBeInTheDocument();
      expect(screen.getByText('Turn 2')).toBeInTheDocument();
    });

    it('shows custom empty state message', () => {
      const customEmptyMessage = 'No combat actions recorded yet';

      render(<RoundHistory {...defaultProps} history={[]} emptyMessage={customEmptyMessage} />);
      
      expect(screen.getByText(customEmptyMessage)).toBeInTheDocument();
    });
  });
});
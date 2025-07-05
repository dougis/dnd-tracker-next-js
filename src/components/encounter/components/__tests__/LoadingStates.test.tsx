import React from 'react';
import { render, screen } from '@testing-library/react';
import { GridLoadingState, ListLoadingState } from '../LoadingStates';

// Mock LoadingCard component
jest.mock('@/components/shared/LoadingCard', () => ({
  LoadingCard: ({ className }: { className?: string }) => (
    <div data-testid="loading-card" className={className}>
      Mock LoadingCard
    </div>
  ),
}));

describe('GridLoadingState', () => {
  it('should render default number of loading cards', () => {
    render(<GridLoadingState />);

    const loadingCards = screen.getAllByTestId('loading-card');
    expect(loadingCards).toHaveLength(8);
  });

  it('should render custom number of loading cards', () => {
    render(<GridLoadingState count={5} />);

    const loadingCards = screen.getAllByTestId('loading-card');
    expect(loadingCards).toHaveLength(5);
  });

  it('should apply grid layout classes', () => {
    render(<GridLoadingState />);

    const container = screen.getAllByTestId('loading-card')[0].parentElement;
    expect(container).toHaveClass(
      'grid',
      'grid-cols-1',
      'md:grid-cols-2',
      'lg:grid-cols-3',
      'xl:grid-cols-4',
      'gap-6'
    );
  });

  it('should handle zero count', () => {
    render(<GridLoadingState count={0} />);

    const loadingCards = screen.queryAllByTestId('loading-card');
    expect(loadingCards).toHaveLength(0);
  });

  it('should handle large count', () => {
    render(<GridLoadingState count={50} />);

    const loadingCards = screen.getAllByTestId('loading-card');
    expect(loadingCards).toHaveLength(50);
  });
});

describe('ListLoadingState', () => {
  it('should render default number of loading cards', () => {
    render(<ListLoadingState />);

    const loadingCards = screen.getAllByTestId('loading-card');
    expect(loadingCards).toHaveLength(5);
  });

  it('should render custom number of loading cards', () => {
    render(<ListLoadingState count={3} />);

    const loadingCards = screen.getAllByTestId('loading-card');
    expect(loadingCards).toHaveLength(3);
  });

  it('should apply list layout classes', () => {
    render(<ListLoadingState />);

    const container = screen.getAllByTestId('loading-card')[0].parentElement;
    expect(container).toHaveClass('space-y-4');
  });

  it('should apply default item height', () => {
    render(<ListLoadingState />);

    const loadingCards = screen.getAllByTestId('loading-card');
    loadingCards.forEach(card => {
      expect(card).toHaveClass('h-16');
    });
  });

  it('should apply custom item height', () => {
    render(<ListLoadingState itemHeight="h-24" />);

    const loadingCards = screen.getAllByTestId('loading-card');
    loadingCards.forEach(card => {
      expect(card).toHaveClass('h-24');
    });
  });

  it('should handle zero count', () => {
    render(<ListLoadingState count={0} />);

    const loadingCards = screen.queryAllByTestId('loading-card');
    expect(loadingCards).toHaveLength(0);
  });

  it('should handle large count', () => {
    render(<ListLoadingState count={20} />);

    const loadingCards = screen.getAllByTestId('loading-card');
    expect(loadingCards).toHaveLength(20);
  });
});
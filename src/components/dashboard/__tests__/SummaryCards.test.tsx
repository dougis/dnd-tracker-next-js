import React from 'react';
import { render, screen } from '@testing-library/react';
import { SummaryCards } from '../SummaryCards';

const mockStats = {
  characters: 5,
  encounters: 12,
  activeSessions: 2,
};

describe('SummaryCards', () => {
  describe('Component Rendering', () => {
    test('renders without errors', () => {
      render(<SummaryCards stats={mockStats} />);

      expect(screen.getByTestId('summary-cards')).toBeInTheDocument();
    });

    test('applies correct grid layout classes', () => {
      render(<SummaryCards stats={mockStats} />);

      const summaryCards = screen.getByTestId('summary-cards');
      expect(summaryCards).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-3', 'gap-4');
    });
  });

  describe('Individual Cards', () => {
    test('renders characters summary card with correct data', () => {
      render(<SummaryCards stats={mockStats} />);

      const charactersCard = screen.getByTestId('characters-card');
      expect(charactersCard).toBeInTheDocument();
      expect(charactersCard).toHaveTextContent('Characters');
      expect(charactersCard).toHaveTextContent('5');
    });

    test('renders encounters summary card with correct data', () => {
      render(<SummaryCards stats={mockStats} />);

      const encountersCard = screen.getByTestId('encounters-card');
      expect(encountersCard).toBeInTheDocument();
      expect(encountersCard).toHaveTextContent('Encounters');
      expect(encountersCard).toHaveTextContent('12');
    });

    test('renders active sessions card with correct data', () => {
      render(<SummaryCards stats={mockStats} />);

      const sessionsCard = screen.getByTestId('active-sessions-card');
      expect(sessionsCard).toBeInTheDocument();
      expect(sessionsCard).toHaveTextContent('Active Sessions');
      expect(sessionsCard).toHaveTextContent('2');
    });
  });

  describe('Card Structure', () => {
    test('each card contains title and value', () => {
      render(<SummaryCards stats={mockStats} />);

      const cards = screen.getAllByTestId(/.*-card$/);

      cards.forEach((card) => {
        expect(card.querySelector('[data-testid$="-title"]')).toBeInTheDocument();
        expect(card.querySelector('[data-testid$="-value"]')).toBeInTheDocument();
      });
    });

    test('displays large numeric values prominently', () => {
      render(<SummaryCards stats={mockStats} />);

      const valueElements = screen.getAllByTestId(/.*-value$/);

      valueElements.forEach((element) => {
        expect(element).toHaveClass('text-3xl', 'font-bold');
      });
    });
  });

  describe('Default Values', () => {
    test('handles missing stats gracefully', () => {
      render(<SummaryCards stats={{}} />);

      expect(screen.getByTestId('characters-value')).toHaveTextContent('0');
      expect(screen.getByTestId('encounters-value')).toHaveTextContent('0');
      expect(screen.getByTestId('active-sessions-value')).toHaveTextContent('0');
    });
  });
});
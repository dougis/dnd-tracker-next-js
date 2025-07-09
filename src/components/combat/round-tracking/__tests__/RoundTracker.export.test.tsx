import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RoundTracker } from '../RoundTracker';
import { IEncounter } from '@/lib/models/encounter/interfaces';
import { createMockEncounter, convertToNewProps } from './shared-test-utils';

describe('RoundTracker - Export and Summary', () => {
  let mockEncounter: IEncounter;

  beforeEach(() => {
    jest.clearAllMocks();
    mockEncounter = createMockEncounter();
  });

  it('provides export functionality', () => {
    const mockOnExport = jest.fn();
    render(<RoundTracker {...convertToNewProps(mockEncounter, { onExport: mockOnExport })} />);

    const exportButton = screen.getByRole('button', { name: /export round data/i });
    fireEvent.click(exportButton);

    expect(mockOnExport).toHaveBeenCalled();
  });

  it('shows session summary when available', () => {
    const summary = {
      totalRounds: 5,
      totalDuration: 1800, // 30 minutes
      totalActions: 15,
      damageDealt: 120,
      healingApplied: 45,
    };

    render(<RoundTracker {...convertToNewProps(mockEncounter, { sessionSummary: summary })} />);

    expect(screen.getByText('Session Summary')).toBeInTheDocument();
    // The summary is formatted as a single string with bullet separators
    expect(screen.getByText(/5 rounds.*30m total.*15 actions/)).toBeInTheDocument();
  });

  it('calculates average round duration', () => {
    const summary = {
      totalRounds: 5,
      totalDuration: 300, // 5 minutes
    };

    render(<RoundTracker {...convertToNewProps(mockEncounter, { sessionSummary: summary })} />);

    expect(screen.getByText(/1m\/round avg/)).toBeInTheDocument();
  });
});
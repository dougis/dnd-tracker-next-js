import React from 'react';
import { render } from '@testing-library/react';
import { RoundTracker } from '../RoundTracker';
import { IEncounter } from '@/lib/models/encounter/interfaces';
import { createMockEncounter, createMockProps, convertToNewProps } from './shared-test-utils';
import { PARTICIPANT_IDS } from '@/lib/models/encounter/__tests__/combat-test-helpers';

describe('RoundTracker - Performance', () => {
  let mockEncounter: IEncounter;
  let mockProps: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockEncounter = createMockEncounter();
    mockProps = createMockProps(mockEncounter);
  });

  it('does not re-render unnecessarily', () => {
    const { rerender } = render(<RoundTracker {...mockProps} />);

    // Re-render with same props
    rerender(<RoundTracker {...mockProps} />);

    // Should not cause additional API calls or state changes
    expect(mockProps.handlers.onRoundChange).not.toHaveBeenCalled();
  });

  it('handles large numbers of effects efficiently', () => {
    const manyEffects = Array.from({ length: 100 }, (_, i) => ({
      id: `effect${i}`,
      name: `Effect ${i}`,
      participantId: PARTICIPANT_IDS.FIRST,
      duration: 10,
      startRound: 1,
      description: `Test effect ${i}`,
    }));

    const startTime = performance.now();
    render(<RoundTracker {...convertToNewProps(mockEncounter, { effects: manyEffects })} />);
    const endTime = performance.now();

    // Should render in reasonable time (< 200ms)
    expect(endTime - startTime).toBeLessThan(200);
  });
});
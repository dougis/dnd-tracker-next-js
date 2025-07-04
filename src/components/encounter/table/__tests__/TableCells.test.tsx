import React from 'react';
import { render, screen } from '@testing-library/react';
import { NameCell, DifficultyCell, TargetLevelCell, StatusCell, ParticipantsCell, ActionsCell } from '../TableCells';
import { createMockEncounter } from '../../__tests__/test-utils/mockFactories';

// Mock the EncounterActionButtons component
jest.mock('../../EncounterActionButtons', () => ({
  EncounterActionButtons: ({ encounter, onRefetch }: any) => (
    <div data-testid="encounter-action-buttons">
      Mock Actions for {encounter.name}
      <button onClick={onRefetch}>Refetch</button>
    </div>
  ),
}));

describe('TableCells', () => {
  const mockEncounter = createMockEncounter();
  const mockOnRefetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper function to render table cells properly
  const renderCell = (cell: React.ReactElement) => {
    return render(
      <table>
        <tbody>
          <tr>
            {cell}
          </tr>
        </tbody>
      </table>
    );
  };

  describe('NameCell', () => {
    it('should render encounter name', () => {
      renderCell(<NameCell encounter={mockEncounter} />);
      expect(screen.getByText('Test Encounter')).toBeInTheDocument();
    });

    it('should render custom encounter name', () => {
      const customEncounter = createMockEncounter({ name: 'Custom Name' });
      renderCell(<NameCell encounter={customEncounter} />);
      expect(screen.getByText('Custom Name')).toBeInTheDocument();
    });

    it('should apply correct styling', () => {
      renderCell(<NameCell encounter={mockEncounter} />);
      const cell = screen.getByText('Test Encounter').closest('td');
      expect(cell).toHaveClass('p-4');
    });
  });

  describe('DifficultyCell', () => {
    it('should render encounter difficulty', () => {
      renderCell(<DifficultyCell encounter={mockEncounter} />);
      expect(screen.getByText('medium')).toBeInTheDocument();
    });

    it('should render different difficulty levels', () => {
      const difficulties = ['easy', 'medium', 'hard', 'deadly'] as const;

      difficulties.forEach(difficulty => {
        const encounter = createMockEncounter({ difficulty });
        renderCell(<DifficultyCell encounter={encounter} />);
        expect(screen.getByText(difficulty)).toBeInTheDocument();
      });
    });

    it('should apply correct styling', () => {
      renderCell(<DifficultyCell encounter={mockEncounter} />);
      const cell = screen.getByText('medium').closest('td');
      expect(cell).toHaveClass('p-4');
    });
  });

  describe('TargetLevelCell', () => {
    it('should render target level', () => {
      renderCell(<TargetLevelCell encounter={mockEncounter} />);
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should render different target levels', () => {
      const encounter = createMockEncounter({ targetLevel: 10 });
      renderCell(<TargetLevelCell encounter={encounter} />);
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('should apply correct styling', () => {
      renderCell(<TargetLevelCell encounter={mockEncounter} />);
      const cell = screen.getByText('5').closest('td');
      expect(cell).toHaveClass('p-4');
    });
  });

  describe('StatusCell', () => {
    it('should render encounter status', () => {
      renderCell(<StatusCell encounter={mockEncounter} />);
      expect(screen.getByText('draft')).toBeInTheDocument();
    });

    it('should render different statuses', () => {
      const statuses = ['draft', 'active', 'completed', 'archived'] as const;

      statuses.forEach(status => {
        const encounter = createMockEncounter({ status });
        renderCell(<StatusCell encounter={encounter} />);
        expect(screen.getByText(status)).toBeInTheDocument();
      });
    });

    it('should apply correct styling', () => {
      renderCell(<StatusCell encounter={mockEncounter} />);
      const cell = screen.getByText('draft').closest('td');
      expect(cell).toHaveClass('p-4');
    });
  });

  describe('ParticipantsCell', () => {
    it('should render participant count', () => {
      renderCell(<ParticipantsCell encounter={mockEncounter} />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should render different participant counts', () => {
      const encounter = createMockEncounter({ participantCount: 5 });
      renderCell(<ParticipantsCell encounter={encounter} />);
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should apply correct styling', () => {
      renderCell(<ParticipantsCell encounter={mockEncounter} />);
      const cell = screen.getByText('0').closest('td');
      expect(cell).toHaveClass('p-4');
    });
  });

  describe('ActionsCell', () => {
    it('should render action buttons', () => {
      renderCell(<ActionsCell encounter={mockEncounter} onRefetch={mockOnRefetch} />);
      expect(screen.getByTestId('encounter-action-buttons')).toBeInTheDocument();
      expect(screen.getByText('Mock Actions for Test Encounter')).toBeInTheDocument();
    });

    it('should pass encounter and onRefetch to action buttons', () => {
      renderCell(<ActionsCell encounter={mockEncounter} onRefetch={mockOnRefetch} />);

      const refetchButton = screen.getByText('Refetch');
      refetchButton.click();

      expect(mockOnRefetch).toHaveBeenCalledTimes(1);
    });

    it('should apply correct styling', () => {
      renderCell(<ActionsCell encounter={mockEncounter} onRefetch={mockOnRefetch} />);
      const cell = screen.getByTestId('encounter-action-buttons').closest('td');
      expect(cell).toHaveClass('p-4');
    });

    it('should work with different encounters', () => {
      const customEncounter = createMockEncounter({ name: 'Custom Encounter' });
      renderCell(<ActionsCell encounter={customEncounter} onRefetch={mockOnRefetch} />);

      expect(screen.getByText('Mock Actions for Custom Encounter')).toBeInTheDocument();
    });
  });
});
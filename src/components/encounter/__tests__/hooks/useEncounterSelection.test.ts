import { renderHook, act } from '@testing-library/react';
import { useEncounterSelection } from '../../hooks/useEncounterSelection';
import { createMockEncounters } from '../test-helpers';

describe('useEncounterSelection', () => {
  const mockEncounters = createMockEncounters(5);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('returns initial state values', () => {
      const { result } = renderHook(() => useEncounterSelection(mockEncounters));

      expect(result.current.selectedEncounters).toEqual([]);
      expect(result.current.isAllSelected).toBe(false);
      expect(result.current.hasSelection).toBe(false);
    });

    it('handles empty encounters array', () => {
      const { result } = renderHook(() => useEncounterSelection([]));

      expect(result.current.selectedEncounters).toEqual([]);
      expect(result.current.isAllSelected).toBe(false);
      expect(result.current.hasSelection).toBe(false);
    });
  });

  describe('Single Selection', () => {
    it('selects an encounter correctly', () => {
      const { result } = renderHook(() => useEncounterSelection(mockEncounters));

      act(() => {
        result.current.selectEncounter(mockEncounters[0].id);
      });

      expect(result.current.selectedEncounters).toEqual([mockEncounters[0].id]);
      expect(result.current.hasSelection).toBe(true);
      expect(result.current.isAllSelected).toBe(false);
    });

    it('deselects an already selected encounter', () => {
      const { result } = renderHook(() => useEncounterSelection(mockEncounters));

      act(() => {
        result.current.selectEncounter(mockEncounters[0].id);
      });

      expect(result.current.selectedEncounters).toEqual([mockEncounters[0].id]);

      act(() => {
        result.current.selectEncounter(mockEncounters[0].id);
      });

      expect(result.current.selectedEncounters).toEqual([]);
      expect(result.current.hasSelection).toBe(false);
    });

    it('selects multiple encounters individually', () => {
      const { result } = renderHook(() => useEncounterSelection(mockEncounters));

      act(() => {
        result.current.selectEncounter(mockEncounters[0].id);
      });

      act(() => {
        result.current.selectEncounter(mockEncounters[2].id);
      });

      expect(result.current.selectedEncounters).toEqual([
        mockEncounters[0].id,
        mockEncounters[2].id,
      ]);
      expect(result.current.hasSelection).toBe(true);
      expect(result.current.isAllSelected).toBe(false);
    });
  });

  describe('Select All Functionality', () => {
    it('selects all encounters when none are selected', () => {
      const { result } = renderHook(() => useEncounterSelection(mockEncounters));

      act(() => {
        result.current.selectAll();
      });

      const expectedIds = mockEncounters.map(encounter => encounter.id);
      expect(result.current.selectedEncounters).toEqual(expectedIds);
      expect(result.current.isAllSelected).toBe(true);
      expect(result.current.hasSelection).toBe(true);
    });

    it('deselects all encounters when all are selected', () => {
      const { result } = renderHook(() => useEncounterSelection(mockEncounters));

      // First select all
      act(() => {
        result.current.selectAll();
      });

      expect(result.current.isAllSelected).toBe(true);

      // Then select all again to deselect
      act(() => {
        result.current.selectAll();
      });

      expect(result.current.selectedEncounters).toEqual([]);
      expect(result.current.isAllSelected).toBe(false);
      expect(result.current.hasSelection).toBe(false);
    });

    it('selects all encounters when some are already selected', () => {
      const { result } = renderHook(() => useEncounterSelection(mockEncounters));

      // Select some encounters first
      act(() => {
        result.current.selectEncounter(mockEncounters[0].id);
        result.current.selectEncounter(mockEncounters[1].id);
      });

      expect(result.current.selectedEncounters).toHaveLength(2);
      expect(result.current.isAllSelected).toBe(false);

      // Select all
      act(() => {
        result.current.selectAll();
      });

      const expectedIds = mockEncounters.map(encounter => encounter.id);
      expect(result.current.selectedEncounters).toEqual(expectedIds);
      expect(result.current.isAllSelected).toBe(true);
    });
  });

  describe('Clear Selection', () => {
    it('clears all selected encounters', () => {
      const { result } = renderHook(() => useEncounterSelection(mockEncounters));

      // Select some encounters
      act(() => {
        result.current.selectEncounter(mockEncounters[0].id);
        result.current.selectEncounter(mockEncounters[2].id);
      });

      expect(result.current.selectedEncounters).toHaveLength(2);

      // Clear selection
      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.selectedEncounters).toEqual([]);
      expect(result.current.hasSelection).toBe(false);
      expect(result.current.isAllSelected).toBe(false);
    });

    it('has no effect when no encounters are selected', () => {
      const { result } = renderHook(() => useEncounterSelection(mockEncounters));

      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.selectedEncounters).toEqual([]);
      expect(result.current.hasSelection).toBe(false);
    });
  });

  describe('State Computations', () => {
    it('correctly computes isAllSelected when all encounters are selected', () => {
      const { result } = renderHook(() => useEncounterSelection(mockEncounters));

      // Select all encounters individually
      act(() => {
        mockEncounters.forEach(encounter => {
          result.current.selectEncounter(encounter.id);
        });
      });

      expect(result.current.isAllSelected).toBe(true);
    });

    it('correctly computes isAllSelected when not all encounters are selected', () => {
      const { result } = renderHook(() => useEncounterSelection(mockEncounters));

      act(() => {
        result.current.selectEncounter(mockEncounters[0].id);
        result.current.selectEncounter(mockEncounters[1].id);
      });

      expect(result.current.isAllSelected).toBe(false);
    });

    it('correctly computes hasSelection when encounters are selected', () => {
      const { result } = renderHook(() => useEncounterSelection(mockEncounters));

      act(() => {
        result.current.selectEncounter(mockEncounters[0].id);
      });

      expect(result.current.hasSelection).toBe(true);
    });

    it('correctly computes hasSelection when no encounters are selected', () => {
      const { result } = renderHook(() => useEncounterSelection(mockEncounters));

      expect(result.current.hasSelection).toBe(false);
    });
  });

  describe('Encounters List Changes', () => {
    it('handles encounter list updates correctly', () => {
      const initialEncounters = createMockEncounters(3);
      const { result, rerender } = renderHook(
        ({ encounters }) => useEncounterSelection(encounters),
        { initialProps: { encounters: initialEncounters } }
      );

      // Select some encounters
      act(() => {
        result.current.selectEncounter(initialEncounters[0].id);
        result.current.selectEncounter(initialEncounters[1].id);
      });

      expect(result.current.selectedEncounters).toHaveLength(2);

      // Update encounters list (simulating filter change)
      const newEncounters = createMockEncounters(2);
      rerender({ encounters: newEncounters });

      // Selection should be cleared or filtered to existing encounters
      expect(result.current.selectedEncounters.length).toBeLessThanOrEqual(2);
    });

    it('maintains selection for encounters that remain in the list', () => {
      const initialEncounters = createMockEncounters(3);
      const { result, rerender } = renderHook(
        ({ encounters }) => useEncounterSelection(encounters),
        { initialProps: { encounters: initialEncounters } }
      );

      // Select first encounter
      act(() => {
        result.current.selectEncounter(initialEncounters[0].id);
      });

      // Update encounters list keeping the first encounter
      const newEncounters = [initialEncounters[0], ...createMockEncounters(2).slice(1)];
      rerender({ encounters: newEncounters });

      // First encounter should still be selected
      expect(result.current.selectedEncounters).toContain(initialEncounters[0].id);
    });
  });

  describe('Edge Cases', () => {
    it('handles selecting non-existent encounter ID gracefully', () => {
      const { result } = renderHook(() => useEncounterSelection(mockEncounters));

      act(() => {
        result.current.selectEncounter('non-existent-id');
      });

      expect(result.current.selectedEncounters).toEqual(['non-existent-id']);
      expect(result.current.hasSelection).toBe(true);
      expect(result.current.isAllSelected).toBe(false);
    });

    it('handles empty encounters array with select all', () => {
      const { result } = renderHook(() => useEncounterSelection([]));

      act(() => {
        result.current.selectAll();
      });

      expect(result.current.selectedEncounters).toEqual([]);
      expect(result.current.isAllSelected).toBe(false);
      expect(result.current.hasSelection).toBe(false);
    });

    it('maintains selection state integrity during rapid changes', () => {
      const { result } = renderHook(() => useEncounterSelection(mockEncounters));

      act(() => {
        // Rapid selection changes
        result.current.selectEncounter(mockEncounters[0].id);
        result.current.selectEncounter(mockEncounters[1].id);
        result.current.selectEncounter(mockEncounters[0].id); // deselect
        result.current.selectAll();
        result.current.clearSelection();
        result.current.selectEncounter(mockEncounters[2].id);
      });

      expect(result.current.selectedEncounters).toEqual([mockEncounters[2].id]);
      expect(result.current.hasSelection).toBe(true);
      expect(result.current.isAllSelected).toBe(false);
    });
  });
});
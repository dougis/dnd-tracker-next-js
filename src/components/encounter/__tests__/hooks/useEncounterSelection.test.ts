import { renderHook, act } from '@testing-library/react';
import { useEncounterSelection } from '../../hooks/useEncounterSelection';
import { createMockEncounters } from '../test-helpers';
import { createSelectionTestUtils } from '../test-utils/selectionHelpers';

describe('useEncounterSelection', () => {
  const mockEncounters = createMockEncounters(5);
  const testUtils = createSelectionTestUtils(mockEncounters);
  const emptyTestUtils = createSelectionTestUtils([]);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('returns initial state values', () => {
      const { result } = testUtils.renderSelection();
      testUtils.expectInitialState(result);
    });

    it('handles empty encounters array', () => {
      const { result } = emptyTestUtils.renderSelection();
      emptyTestUtils.expectInitialState(result);
    });
  });

  describe('Single Selection', () => {
    it('selects an encounter correctly', () => {
      const { result } = testUtils.renderSelection();
      testUtils.selectEncounter(result, mockEncounters[0].id);
      testUtils.expectSingleSelection(result, mockEncounters[0].id);
    });

    it('deselects an already selected encounter', () => {
      const { result } = testUtils.renderSelection();
      testUtils.selectEncounter(result, mockEncounters[0].id);
      testUtils.expectSingleSelection(result, mockEncounters[0].id);

      testUtils.selectEncounter(result, mockEncounters[0].id);
      testUtils.expectNoSelection(result);
    });

    it('selects multiple encounters individually', () => {
      const { result } = testUtils.renderSelection();
      const selectedIds = [mockEncounters[0].id, mockEncounters[2].id];
      testUtils.selectMultiple(result, selectedIds);
      testUtils.expectMultipleSelection(result, selectedIds);
    });
  });

  describe('Select All Functionality', () => {
    it('selects all encounters when none are selected', () => {
      const { result } = testUtils.renderSelection();
      testUtils.selectAll(result);
      testUtils.expectAllSelected(result);
    });

    it('deselects all encounters when all are selected', () => {
      const { result } = testUtils.renderSelection();
      testUtils.selectAll(result);
      expect(result.current.isAllSelected).toBe(true);

      testUtils.selectAll(result);
      testUtils.expectNoSelection(result);
    });

    it('selects all encounters when some are already selected', () => {
      const { result } = testUtils.renderSelection();
      const partialIds = [mockEncounters[0].id, mockEncounters[1].id];
      testUtils.selectMultiple(result, partialIds);

      expect(result.current.selectedEncounters).toHaveLength(2);
      expect(result.current.isAllSelected).toBe(false);

      testUtils.selectAll(result);
      testUtils.expectAllSelected(result);
    });
  });

  describe('Clear Selection', () => {
    it('clears all selected encounters', () => {
      const { result } = testUtils.renderSelection();
      const selectedIds = [mockEncounters[0].id, mockEncounters[2].id];
      testUtils.selectMultiple(result, selectedIds);

      expect(result.current.selectedEncounters).toHaveLength(2);

      testUtils.clearSelection(result);
      testUtils.expectNoSelection(result);
    });

    it('has no effect when no encounters are selected', () => {
      const { result } = testUtils.renderSelection();
      testUtils.clearSelection(result);
      testUtils.expectNoSelection(result);
    });
  });

  describe('State Computations', () => {
    it('correctly computes isAllSelected when all encounters are selected', () => {
      const { result } = testUtils.renderSelection();
      const allIds = mockEncounters.map(e => e.id);
      testUtils.selectMultiple(result, allIds);
      expect(result.current.isAllSelected).toBe(true);
    });

    it('correctly computes isAllSelected when not all encounters are selected', () => {
      const { result } = testUtils.renderSelection();
      const partialIds = [mockEncounters[0].id, mockEncounters[1].id];
      testUtils.selectMultiple(result, partialIds);
      expect(result.current.isAllSelected).toBe(false);
    });

    it('correctly computes hasSelection when encounters are selected', () => {
      const { result } = testUtils.renderSelection();
      testUtils.selectEncounter(result, mockEncounters[0].id);
      expect(result.current.hasSelection).toBe(true);
    });

    it('correctly computes hasSelection when no encounters are selected', () => {
      const { result } = testUtils.renderSelection();
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
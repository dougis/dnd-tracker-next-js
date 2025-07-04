import { getEncounterText, createBatchOperation } from '../utils';

describe('BatchActions Utils', () => {
  describe('getEncounterText', () => {
    it('should return singular form for count of 1', () => {
      expect(getEncounterText(1)).toBe('1 encounter');
    });

    it('should return plural form for count of 0', () => {
      expect(getEncounterText(0)).toBe('0 encounters');
    });

    it('should return plural form for count greater than 1', () => {
      expect(getEncounterText(2)).toBe('2 encounters');
      expect(getEncounterText(10)).toBe('10 encounters');
      expect(getEncounterText(100)).toBe('100 encounters');
    });

    it('should handle edge cases', () => {
      expect(getEncounterText(-1)).toBe('-1 encounters');
      expect(getEncounterText(1.5)).toBe('1.5 encounters');
    });
  });

  describe('createBatchOperation', () => {
    it('should create operation object with correct properties', () => {
      const operation = createBatchOperation('delete', 3);

      expect(operation).toEqual({
        action: 'delete',
        target: '3 encounters',
        message: 'delete 3 encounters',
      });
    });

    it('should work with singular count', () => {
      const operation = createBatchOperation('duplicate', 1);

      expect(operation).toEqual({
        action: 'duplicate',
        target: '1 encounter',
        message: 'duplicate 1 encounters',
      });
    });

    it('should work with different actions', () => {
      const archiveOp = createBatchOperation('archive', 5);

      expect(archiveOp).toEqual({
        action: 'archive',
        target: '5 encounters',
        message: 'archive 5 encounters',
      });
    });

    it('should handle zero count', () => {
      const operation = createBatchOperation('delete', 0);

      expect(operation).toEqual({
        action: 'delete',
        target: '0 encounters',
        message: 'delete 0 encounters',
      });
    });
  });
});
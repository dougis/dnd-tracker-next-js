/**
 * DatabaseOperationWrapper Tests
 * 
 * Tests for the DatabaseOperationWrapper utility to ensure proper database
 * operation standardization and error handling.
 */

import { DatabaseOperationWrapper } from '../../utils/DatabaseOperationWrapper';
import { CharacterServiceErrors } from '../../CharacterServiceErrors';

// Mock Mongoose model
const mockModel = {
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  countDocuments: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  aggregate: jest.fn(),
} as any;

// Mock document constructor
const mockDocumentConstructor = jest.fn();
const mockDocument = {
  save: jest.fn(),
};

// Set up model constructor
Object.setPrototypeOf(mockDocumentConstructor, mockModel);
mockDocumentConstructor.prototype = mockDocument;

describe('DatabaseOperationWrapper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return success when document is found', async () => {
      const mockDoc = { _id: '123', name: 'Test' };
      mockModel.findById.mockResolvedValue(mockDoc);

      const result = await DatabaseOperationWrapper.findById(mockModel, '123', 'character');

      expect(result.success).toBe(true);
      expect(result.data).toBe(mockDoc);
      expect(mockModel.findById).toHaveBeenCalledWith('123');
    });

    it('should return error when document not found', async () => {
      mockModel.findById.mockResolvedValue(null);

      const result = await DatabaseOperationWrapper.findById(mockModel, '123', 'character');

      expect(result.success).toBe(false);
      expect(result.error.message).toContain('Character not found');
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      mockModel.findById.mockRejectedValue(dbError);

      const result = await DatabaseOperationWrapper.findById(mockModel, '123', 'character');

      expect(result.success).toBe(false);
      expect(result.error.message).toContain('Database error');
    });
  });

  describe('findByIdAndUpdate', () => {
    it('should return success when document is updated', async () => {
      const mockDoc = { _id: '123', name: 'Updated' };
      mockModel.findByIdAndUpdate.mockResolvedValue(mockDoc);

      const result = await DatabaseOperationWrapper.findByIdAndUpdate(
        mockModel,
        '123',
        { name: 'Updated' },
        { new: true },
        'character'
      );

      expect(result.success).toBe(true);
      expect(result.data).toBe(mockDoc);
      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '123',
        { name: 'Updated' },
        { new: true }
      );
    });

    it('should return error when document not found for update', async () => {
      mockModel.findByIdAndUpdate.mockResolvedValue(null);

      const result = await DatabaseOperationWrapper.findByIdAndUpdate(
        mockModel,
        '123',
        { name: 'Updated' },
        { new: true },
        'character'
      );

      expect(result.success).toBe(false);
      expect(result.error.message).toContain('Character not found');
    });
  });

  describe('findByIdAndDelete', () => {
    it('should return success when document is deleted', async () => {
      const mockDoc = { _id: '123', name: 'Deleted' };
      mockModel.findByIdAndDelete.mockResolvedValue(mockDoc);

      const result = await DatabaseOperationWrapper.findByIdAndDelete(mockModel, '123', 'character');

      expect(result.success).toBe(true);
      expect(result.data).toBe(mockDoc);
      expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith('123');
    });

    it('should return error when document not found for deletion', async () => {
      mockModel.findByIdAndDelete.mockResolvedValue(null);

      const result = await DatabaseOperationWrapper.findByIdAndDelete(mockModel, '123', 'character');

      expect(result.success).toBe(false);
      expect(result.error.message).toContain('Character not found');
    });
  });

  describe('createAndSave', () => {
    it('should return success when document is created and saved', async () => {
      const mockSavedDoc = { _id: '123', name: 'New Character' };
      mockDocument.save.mockResolvedValue(mockSavedDoc);

      const result = await DatabaseOperationWrapper.createAndSave(
        mockDocumentConstructor,
        { name: 'New Character' },
        'character'
      );

      expect(result.success).toBe(true);
      expect(result.data).toBe(mockSavedDoc);
      expect(mockDocumentConstructor).toHaveBeenCalledWith({ name: 'New Character' });
      expect(mockDocument.save).toHaveBeenCalled();
    });

    it('should handle save errors', async () => {
      const saveError = new Error('Validation failed');
      mockDocument.save.mockRejectedValue(saveError);

      const result = await DatabaseOperationWrapper.createAndSave(
        mockDocumentConstructor,
        { name: 'Invalid' },
        'character'
      );

      expect(result.success).toBe(false);
      expect(result.error.message).toContain('Database error');
    });
  });

  describe('countDocuments', () => {
    it('should return count when successful', async () => {
      mockModel.countDocuments.mockResolvedValue(5);

      const result = await DatabaseOperationWrapper.countDocuments(
        mockModel,
        { ownerId: '123' },
        'characters'
      );

      expect(result.success).toBe(true);
      expect(result.data).toBe(5);
      expect(mockModel.countDocuments).toHaveBeenCalledWith({ ownerId: '123' });
    });

    it('should handle count errors', async () => {
      const countError = new Error('Database error');
      mockModel.countDocuments.mockRejectedValue(countError);

      const result = await DatabaseOperationWrapper.countDocuments(
        mockModel,
        {},
        'characters'
      );

      expect(result.success).toBe(false);
      expect(result.error.message).toContain('Database error');
    });
  });

  describe('find', () => {
    it('should return documents when found', async () => {
      const mockDocs = [{ _id: '1' }, { _id: '2' }];
      mockModel.find.mockResolvedValue(mockDocs);

      const result = await DatabaseOperationWrapper.find(
        mockModel,
        { ownerId: '123' },
        { limit: 10 },
        'characters'
      );

      expect(result.success).toBe(true);
      expect(result.data).toBe(mockDocs);
      expect(mockModel.find).toHaveBeenCalledWith({ ownerId: '123' }, null, { limit: 10 });
    });
  });

  describe('findOne', () => {
    it('should return document when found', async () => {
      const mockDoc = { _id: '123' };
      mockModel.findOne.mockResolvedValue(mockDoc);

      const result = await DatabaseOperationWrapper.findOne(
        mockModel,
        { name: 'Test' },
        'character'
      );

      expect(result.success).toBe(true);
      expect(result.data).toBe(mockDoc);
      expect(mockModel.findOne).toHaveBeenCalledWith({ name: 'Test' });
    });

    it('should return null when not found', async () => {
      mockModel.findOne.mockResolvedValue(null);

      const result = await DatabaseOperationWrapper.findOne(
        mockModel,
        { name: 'NonExistent' },
        'character'
      );

      expect(result.success).toBe(true);
      expect(result.data).toBe(null);
    });
  });

  describe('aggregate', () => {
    it('should return aggregation results', async () => {
      const mockResults = [{ count: 5 }];
      mockModel.aggregate.mockResolvedValue(mockResults);

      const pipeline = [{ $group: { _id: null, count: { $sum: 1 } } }];
      const result = await DatabaseOperationWrapper.aggregate(
        mockModel,
        pipeline,
        'statistics'
      );

      expect(result.success).toBe(true);
      expect(result.data).toBe(mockResults);
      expect(mockModel.aggregate).toHaveBeenCalledWith(pipeline);
    });

    it('should handle aggregation errors', async () => {
      const aggError = new Error('Aggregation failed');
      mockModel.aggregate.mockRejectedValue(aggError);

      const result = await DatabaseOperationWrapper.aggregate(
        mockModel,
        [],
        'statistics'
      );

      expect(result.success).toBe(false);
      expect(result.error.message).toContain('Database error');
    });
  });
});
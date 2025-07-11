/**
 * DatabaseOperationWrapper Tests
 *
 * Tests for the DatabaseOperationWrapper utility to ensure proper database
 * operation standardization and error handling.
 */

import { DatabaseOperationWrapper } from '../../utils/DatabaseOperationWrapper';
import {
  createMockModel,
  createMockDocument,
  expectDatabaseSuccess,
  expectDatabaseError,
  TEST_DATA_FACTORY,
} from './shared-utils-test-helpers';

// Mock Mongoose model
const mockModel = createMockModel();

// Mock document constructor
const mockDocumentConstructor = jest.fn();
const mockDocument = createMockDocument();

// Set up model constructor
Object.setPrototypeOf(mockDocumentConstructor, mockModel);
mockDocumentConstructor.prototype = mockDocument;

describe('DatabaseOperationWrapper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return success when document is found', async () => {
      const mockDoc = TEST_DATA_FACTORY.character.found;
      mockModel.findById.mockResolvedValue(mockDoc);

      const result = await DatabaseOperationWrapper.findById(mockModel, TEST_DATA_FACTORY.ids.valid, 'character');

      expectDatabaseSuccess(result, mockDoc, mockModel.findById, [TEST_DATA_FACTORY.ids.valid]);
    });

    it('should return error when document not found', async () => {
      mockModel.findById.mockResolvedValue(null);

      const result = await DatabaseOperationWrapper.findById(mockModel, TEST_DATA_FACTORY.ids.missing, 'character');

      expectDatabaseError(result, 'Character with ID');
    });

    it('should handle database errors', async () => {
      mockModel.findById.mockRejectedValue(TEST_DATA_FACTORY.errors.database);

      const result = await DatabaseOperationWrapper.findById(mockModel, TEST_DATA_FACTORY.ids.valid, 'character');

      expectDatabaseError(result, 'Database error');
    });
  });

  describe('findByIdAndUpdate', () => {
    it('should return success when document is updated', async () => {
      const mockDoc = TEST_DATA_FACTORY.character.updated;
      mockModel.findByIdAndUpdate.mockResolvedValue(mockDoc);

      const updateData = { name: 'Updated' };
      const options = { new: true };
      const result = await DatabaseOperationWrapper.findByIdAndUpdate(
        mockModel,
        TEST_DATA_FACTORY.ids.valid,
        updateData,
        options,
        'character'
      );

      expectDatabaseSuccess(result, mockDoc, mockModel.findByIdAndUpdate, [
        TEST_DATA_FACTORY.ids.valid,
        updateData,
        options
      ]);
    });

    it('should return error when document not found for update', async () => {
      mockModel.findByIdAndUpdate.mockResolvedValue(null);

      const result = await DatabaseOperationWrapper.findByIdAndUpdate(
        mockModel,
        TEST_DATA_FACTORY.ids.missing,
        { name: 'Updated' },
        { new: true },
        'character'
      );

      expectDatabaseError(result, 'Character with ID');
    });
  });

  describe('findByIdAndDelete', () => {
    it('should return success when document is deleted', async () => {
      const mockDoc = TEST_DATA_FACTORY.character.deleted;
      mockModel.findByIdAndDelete.mockResolvedValue(mockDoc);

      const result = await DatabaseOperationWrapper.findByIdAndDelete(mockModel, TEST_DATA_FACTORY.ids.valid, 'character');

      expectDatabaseSuccess(result, mockDoc, mockModel.findByIdAndDelete, [TEST_DATA_FACTORY.ids.valid]);
    });

    it('should return error when document not found for deletion', async () => {
      mockModel.findByIdAndDelete.mockResolvedValue(null);

      const result = await DatabaseOperationWrapper.findByIdAndDelete(mockModel, TEST_DATA_FACTORY.ids.missing, 'character');

      expectDatabaseError(result, 'Character with ID');
    });
  });

  describe('createAndSave', () => {
    it('should return success when document is created and saved', async () => {
      const mockSavedDoc = TEST_DATA_FACTORY.character.saved;
      mockDocument.save.mockResolvedValue(mockSavedDoc);

      const newData = TEST_DATA_FACTORY.character.new;
      const result = await DatabaseOperationWrapper.createAndSave(
        mockDocumentConstructor,
        newData,
        'character'
      );

      expectDatabaseSuccess(result, mockSavedDoc);
      expect(mockDocumentConstructor).toHaveBeenCalledWith(newData);
      expect(mockDocument.save).toHaveBeenCalled();
    });

    it('should handle save errors', async () => {
      mockDocument.save.mockRejectedValue(TEST_DATA_FACTORY.errors.save);

      const result = await DatabaseOperationWrapper.createAndSave(
        mockDocumentConstructor,
        { name: 'Invalid' },
        'character'
      );

      expectDatabaseError(result, 'Database error');
    });
  });

  describe('countDocuments', () => {
    it('should return count when successful', async () => {
      const expectedCount = 5;
      mockModel.countDocuments.mockResolvedValue(expectedCount);

      const filter = { ownerId: TEST_DATA_FACTORY.ids.valid };
      const result = await DatabaseOperationWrapper.countDocuments(
        mockModel,
        filter,
        'characters'
      );

      expectDatabaseSuccess(result, expectedCount, mockModel.countDocuments, [filter]);
    });

    it('should handle count errors', async () => {
      mockModel.countDocuments.mockRejectedValue(TEST_DATA_FACTORY.errors.database);

      const result = await DatabaseOperationWrapper.countDocuments(
        mockModel,
        {},
        'characters'
      );

      expectDatabaseError(result, 'Database error');
    });
  });

  describe('find', () => {
    it('should return documents when found', async () => {
      const mockDocs = [{ _id: '1' }, { _id: '2' }];
      mockModel.find.mockResolvedValue(mockDocs);

      const filter = { ownerId: TEST_DATA_FACTORY.ids.valid };
      const options = { limit: 10 };
      const result = await DatabaseOperationWrapper.find(
        mockModel,
        filter,
        options,
        'characters'
      );

      expectDatabaseSuccess(result, mockDocs, mockModel.find, [filter, null, options]);
    });
  });

  describe('findOne', () => {
    it('should return document when found', async () => {
      const mockDoc = TEST_DATA_FACTORY.character.found;
      mockModel.findOne.mockResolvedValue(mockDoc);

      const filter = { name: 'Test' };
      const result = await DatabaseOperationWrapper.findOne(
        mockModel,
        filter,
        'character'
      );

      expectDatabaseSuccess(result, mockDoc, mockModel.findOne, [filter]);
    });

    it('should return null when not found', async () => {
      mockModel.findOne.mockResolvedValue(null);

      const result = await DatabaseOperationWrapper.findOne(
        mockModel,
        { name: 'NonExistent' },
        'character'
      );

      expectDatabaseSuccess(result, null);
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

      expectDatabaseSuccess(result, mockResults, mockModel.aggregate, [pipeline]);
    });

    it('should handle aggregation errors', async () => {
      mockModel.aggregate.mockRejectedValue(TEST_DATA_FACTORY.errors.aggregation);

      const result = await DatabaseOperationWrapper.aggregate(
        mockModel,
        [],
        'statistics'
      );

      expectDatabaseError(result, 'Database error');
    });
  });
});
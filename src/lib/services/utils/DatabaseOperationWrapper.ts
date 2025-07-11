/**
 * Database Operation Wrapper Utility
 *
 * Eliminates duplicate database query patterns across Character service layer.
 * Provides consistent error handling and validation for common database operations.
 */

import { Model } from 'mongoose';
import {
  ServiceResult,
  createSuccessResult,
  createErrorResult,
  CharacterServiceErrors,
} from '../CharacterServiceErrors';

export class DatabaseOperationWrapper {
  /**
   * Find document by ID with standardized error handling
   */
  static async findById<T>(
    model: Model<T>,
    id: string,
    entityName: string = 'document'
  ): Promise<ServiceResult<T>> {
    try {
      const document = await model.findById(id);
      if (!document) {
        return createErrorResult(
          CharacterServiceErrors.characterNotFound(id)
        );
      }
      return createSuccessResult(document);
    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.databaseError(`find ${entityName}`, error)
      );
    }
  }

  /**
   * Find document by ID and update with standardized error handling
   */
  static async findByIdAndUpdate<T>(
    model: Model<T>,
    id: string,
    updateData: any,
    options: any = { new: true, runValidators: true },
    entityName: string = 'document'
  ): Promise<ServiceResult<T>> {
    try {
      const document = await model.findByIdAndUpdate(id, updateData, options);
      if (!document) {
        return createErrorResult(
          CharacterServiceErrors.characterNotFound(id)
        );
      }
      return createSuccessResult(document);
    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.databaseError(`update ${entityName}`, error)
      );
    }
  }

  /**
   * Find document by ID and delete with standardized error handling
   */
  static async findByIdAndDelete<T>(
    model: Model<T>,
    id: string,
    entityName: string = 'document'
  ): Promise<ServiceResult<T>> {
    try {
      const document = await model.findByIdAndDelete(id);
      if (!document) {
        return createErrorResult(
          CharacterServiceErrors.characterNotFound(id)
        );
      }
      return createSuccessResult(document);
    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.databaseError(`delete ${entityName}`, error)
      );
    }
  }

  /**
   * Create and save document with standardized error handling
   */
  static async createAndSave<T>(
    model: Model<T>,
    data: any,
    entityName: string = 'document'
  ): Promise<ServiceResult<T>> {
    try {
      const document = new model(data);
      const savedDocument = await document.save();
      return createSuccessResult(savedDocument);
    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.databaseError(`create ${entityName}`, error)
      );
    }
  }

  /**
   * Count documents with filter
   */
  static async countDocuments<T>(
    model: Model<T>,
    filter: any = {},
    entityName: string = 'documents'
  ): Promise<ServiceResult<number>> {
    try {
      const count = await model.countDocuments(filter);
      return createSuccessResult(count);
    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.databaseError(`count ${entityName}`, error)
      );
    }
  }

  /**
   * Find documents with filter and options
   */
  static async find<T>(
    model: Model<T>,
    filter: any = {},
    options: any = {},
    entityName: string = 'documents'
  ): Promise<ServiceResult<T[]>> {
    try {
      const documents = await model.find(filter, null, options);
      return createSuccessResult(documents);
    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.databaseError(`find ${entityName}`, error)
      );
    }
  }

  /**
   * Find one document with filter
   */
  static async findOne<T>(
    model: Model<T>,
    filter: any,
    entityName: string = 'document'
  ): Promise<ServiceResult<T | null>> {
    try {
      const document = await model.findOne(filter);
      return createSuccessResult(document);
    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.databaseError(`find ${entityName}`, error)
      );
    }
  }

  /**
   * Execute aggregation pipeline
   */
  static async aggregate<T>(
    model: Model<any>,
    pipeline: any[],
    entityName: string = 'documents'
  ): Promise<ServiceResult<T[]>> {
    try {
      const results = await model.aggregate(pipeline);
      return createSuccessResult(results);
    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.databaseError(`aggregate ${entityName}`, error)
      );
    }
  }
}
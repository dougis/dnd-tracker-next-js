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

  // ================================
  // Private Helper Methods (moved to top for shared use)
  // ================================

  /**
   * Generic database operation executor - eliminates try-catch duplication
   */
  private static async executeDbOperation<T>(
    operation: () => Promise<T>,
    operationName: string,
    entityName: string = 'document'
  ): Promise<ServiceResult<T>> {
    try {
      const result = await operation();
      return createSuccessResult(result);
    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.databaseError(`${operationName} ${entityName}`, error)
      );
    }
  }

  /**
   * Execute operation with null check - handles find operations that can return null
   */
  private static async executeWithNullCheck<T>(
    operation: () => Promise<T | null>,
    id: string,
    operationName: string,
    entityName: string = 'document'
  ): Promise<ServiceResult<T>> {
    try {
      const document = await operation();
      if (!document) {
        return createErrorResult(CharacterServiceErrors.characterNotFound(id));
      }
      return createSuccessResult(document as T);
    } catch (error) {
      return createErrorResult(
        CharacterServiceErrors.databaseError(`${operationName} ${entityName}`, error)
      );
    }
  }

  /**
   * Find document by ID with standardized error handling
   */
  static async findById<T>(
    model: Model<T>,
    id: string,
    entityName: string = 'document'
  ): Promise<ServiceResult<T>> {
    return this.executeWithNullCheck(
      () => model.findById(id) as Promise<T | null>,
      id,
      'find',
      entityName
    );
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
    return this.executeWithNullCheck(
      () => model.findByIdAndUpdate(id, updateData, options) as Promise<T | null>,
      id,
      'update',
      entityName
    );
  }

  /**
   * Find document by ID and delete with standardized error handling
   */
  static async findByIdAndDelete<T>(
    model: Model<T>,
    id: string,
    entityName: string = 'document'
  ): Promise<ServiceResult<T>> {
    return this.executeWithNullCheck(
      () => model.findByIdAndDelete(id) as Promise<T | null>,
      id,
      'delete',
      entityName
    );
  }

  /**
   * Create and save document with standardized error handling
   */
  static async createAndSave<T>(
    model: Model<T>,
    data: any,
    entityName: string = 'document'
  ): Promise<ServiceResult<T>> {
    return this.executeDbOperation(
      async () => {
        const document = new model(data);
        return await document.save() as T;
      },
      'create',
      entityName
    );
  }

  /**
   * Count documents with filter
   */
  static async countDocuments<T>(
    model: Model<T>,
    filter: any = {},
    entityName: string = 'documents'
  ): Promise<ServiceResult<number>> {
    return this.executeDbOperation(
      () => model.countDocuments(filter),
      'count',
      entityName
    );
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
    return this.executeDbOperation(
      () => model.find(filter, null, options) as Promise<T[]>,
      'find',
      entityName
    );
  }

  /**
   * Find one document with filter
   */
  static async findOne<T>(
    model: Model<T>,
    filter: any,
    entityName: string = 'document'
  ): Promise<ServiceResult<T | null>> {
    return this.executeDbOperation(
      () => model.findOne(filter) as Promise<T | null>,
      'find',
      entityName
    );
  }

  /**
   * Execute aggregation pipeline
   */
  static async aggregate<T>(
    model: Model<any>,
    pipeline: any[],
    entityName: string = 'documents'
  ): Promise<ServiceResult<T[]>> {
    return this.executeDbOperation(
      () => model.aggregate(pipeline) as Promise<T[]>,
      'aggregate',
      entityName
    );
  }
}
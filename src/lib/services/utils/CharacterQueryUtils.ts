/**
 * Character Database Query Utilities
 * 
 * Centralized database query logic to eliminate duplication across Character service modules.
 * Handles common query patterns, pagination, sorting, and filtering.
 */

import { Types } from 'mongoose';
import { Character } from '../../models/Character';
import type { ICharacter } from '../../models/Character';
import { CharacterAccessUtils } from './CharacterAccessUtils';
import { CharacterValidationUtils } from './CharacterValidationUtils';
import { 
  ServiceResult, 
  createSuccessResult, 
  createErrorResult, 
  CharacterServiceErrors 
} from '../CharacterServiceErrors';

export interface PaginationResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface QueryOptions {
  sort?: object;
  page?: number;
  limit?: number;
  includeFields?: string[];
  excludeFields?: string[];
}

export class CharacterQueryUtils {
  /**
   * Execute a paginated query with user access control
   */
  static async findWithPagination(
    baseFilter: object,
    userId: string,
    options: QueryOptions = {}
  ): Promise<ServiceResult<PaginationResult<ICharacter>>> {
    try {
      // Validate pagination parameters
      const paginationValidation = CharacterValidationUtils.validatePagination(
        options.page, 
        options.limit
      );
      if (!paginationValidation.success) {
        return createErrorResult(paginationValidation.error);
      }
      const { page, limit, skip } = paginationValidation.data;

      // Prepare user access query
      const queryResult = await CharacterAccessUtils.prepareUserAccessQuery(baseFilter, userId);
      if (!queryResult.success) {
        return createErrorResult(queryResult.error);
      }
      const filter = queryResult.data;

      // Get total count for pagination
      const total = await Character.countDocuments(filter);
      const totalPages = Math.ceil(total / limit);

      // Build query with pagination and sorting
      let query = Character.find(filter).skip(skip).limit(limit);

      // Apply sorting
      const defaultSort = { name: 1 };
      const sortOption = options.sort || defaultSort;
      query = query.sort(sortOption);

      // Apply field selection if specified
      if (options.includeFields) {
        query = query.select(options.includeFields.join(' '));
      } else if (options.excludeFields) {
        query = query.select(options.excludeFields.map(field => `-${field}`).join(' '));
      }

      const items = await query.exec();

      return createSuccessResult({
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      });
    } catch (error) {
      return createErrorResult(CharacterServiceErrors.databaseError('paginated query', error));
    }
  }

  /**
   * Find characters with user access control (no pagination)
   */
  static async findWithUserAccess(
    baseFilter: object,
    userId: string,
    options: QueryOptions = {}
  ): Promise<ServiceResult<ICharacter[]>> {
    try {
      // Prepare user access query
      const queryResult = await CharacterAccessUtils.prepareUserAccessQuery(baseFilter, userId);
      if (!queryResult.success) {
        return createErrorResult(queryResult.error);
      }
      const filter = queryResult.data;

      // Build query with sorting
      let query = Character.find(filter);
      
      // Apply sorting
      const defaultSort = { name: 1 };
      const sortOption = options.sort || defaultSort;
      query = query.sort(sortOption);

      // Apply field selection if specified
      if (options.includeFields) {
        query = query.select(options.includeFields.join(' '));
      } else if (options.excludeFields) {
        query = query.select(options.excludeFields.map(field => `-${field}`).join(' '));
      }

      const characters = await query.exec();
      return createSuccessResult(characters);
    } catch (error) {
      return createErrorResult(CharacterServiceErrors.databaseError('user access query', error));
    }
  }

  /**
   * Find characters by owner with pagination
   */
  static async findByOwner(
    ownerId: string,
    page: number = 1,
    limit: number = 20,
    options: QueryOptions = {}
  ): Promise<ServiceResult<PaginationResult<ICharacter>>> {
    // Validate owner ID
    const ownerValidation = CharacterValidationUtils.validateObjectId(ownerId, 'owner');
    if (!ownerValidation.success) {
      return createErrorResult(ownerValidation.error);
    }

    const filter = CharacterAccessUtils.createOwnershipFilter(ownerId);
    return this.findWithPagination(filter, ownerId, { ...options, page, limit });
  }

  /**
   * Search characters with text search
   */
  static async searchCharacters(
    searchTerm: string,
    userId: string,
    options: QueryOptions = {}
  ): Promise<ServiceResult<ICharacter[]>> {
    // Validate search criteria
    const searchValidation = CharacterValidationUtils.validateSearchCriteria(searchTerm);
    if (!searchValidation.success) {
      return createErrorResult(searchValidation.error);
    }
    const validSearchTerm = searchValidation.data;

    const searchFilter = {
      $text: { $search: validSearchTerm },
    };

    const searchOptions = {
      ...options,
      sort: { score: { $meta: 'textScore' } },
    };

    return this.findWithUserAccess(searchFilter, userId, searchOptions);
  }

  /**
   * Find characters by class
   */
  static async findByClass(
    className: string,
    userId: string,
    options: QueryOptions = {}
  ): Promise<ServiceResult<ICharacter[]>> {
    const filter = {
      'classes.class': className,
    };

    return this.findWithUserAccess(filter, userId, options);
  }

  /**
   * Find characters by race
   */
  static async findByRace(
    race: string,
    userId: string,
    options: QueryOptions = {}
  ): Promise<ServiceResult<ICharacter[]>> {
    const filter = { race };
    return this.findWithUserAccess(filter, userId, options);
  }

  /**
   * Find characters by type (pc/npc)
   */
  static async findByType(
    type: string,
    userId: string,
    options: QueryOptions = {}
  ): Promise<ServiceResult<ICharacter[]>> {
    const filter = { type };
    return this.findWithUserAccess(filter, userId, options);
  }

  /**
   * Find public characters (no user access control needed)
   */
  static async findPublicCharacters(options: QueryOptions = {}): Promise<ServiceResult<ICharacter[]>> {
    try {
      const filter = { isPublic: true };
      
      let query = Character.find(filter);
      
      // Apply sorting
      const defaultSort = { name: 1 };
      const sortOption = options.sort || defaultSort;
      query = query.sort(sortOption);

      // Apply field selection if specified
      if (options.includeFields) {
        query = query.select(options.includeFields.join(' '));
      } else if (options.excludeFields) {
        query = query.select(options.excludeFields.map(field => `-${field}`).join(' '));
      }

      const characters = await query.exec();
      return createSuccessResult(characters);
    } catch (error) {
      return createErrorResult(CharacterServiceErrors.databaseError('public characters query', error));
    }
  }

  /**
   * Count characters by owner
   */
  static async countByOwner(ownerId: string): Promise<ServiceResult<number>> {
    try {
      // Validate owner ID
      const ownerValidation = CharacterValidationUtils.validateObjectId(ownerId, 'owner');
      if (!ownerValidation.success) {
        return createErrorResult(ownerValidation.error);
      }

      const filter = CharacterAccessUtils.createOwnershipFilter(ownerId);
      const count = await Character.countDocuments(filter);
      return createSuccessResult(count);
    } catch (error) {
      return createErrorResult(CharacterServiceErrors.databaseError('count characters by owner', error));
    }
  }

  /**
   * Find characters with advanced filtering
   */
  static async findWithAdvancedFilter(
    filter: {
      classes?: string[];
      races?: string[];
      types?: string[];
      levelRange?: { min?: number; max?: number };
      search?: string;
    },
    userId: string,
    options: QueryOptions = {}
  ): Promise<ServiceResult<ICharacter[]>> {
    try {
      let queryFilter: any = {};

      // Build filter conditions
      if (filter.classes && filter.classes.length > 0) {
        queryFilter['classes.class'] = { $in: filter.classes };
      }

      if (filter.races && filter.races.length > 0) {
        queryFilter.race = { $in: filter.races };
      }

      if (filter.types && filter.types.length > 0) {
        queryFilter.type = { $in: filter.types };
      }

      if (filter.levelRange) {
        const levelConditions: any = {};
        if (filter.levelRange.min !== undefined) {
          levelConditions.$gte = filter.levelRange.min;
        }
        if (filter.levelRange.max !== undefined) {
          levelConditions.$lte = filter.levelRange.max;
        }
        if (Object.keys(levelConditions).length > 0) {
          queryFilter.level = levelConditions;
        }
      }

      if (filter.search) {
        const searchValidation = CharacterValidationUtils.validateSearchCriteria(filter.search);
        if (!searchValidation.success) {
          return createErrorResult(searchValidation.error);
        }
        queryFilter.$text = { $search: searchValidation.data };
        
        // Override sort for text search
        options = {
          ...options,
          sort: { score: { $meta: 'textScore' } },
        };
      }

      return this.findWithUserAccess(queryFilter, userId, options);
    } catch (error) {
      return createErrorResult(CharacterServiceErrors.databaseError('advanced filter query', error));
    }
  }
}
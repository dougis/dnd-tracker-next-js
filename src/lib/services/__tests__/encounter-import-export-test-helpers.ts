/**
 * Test helpers for EncounterServiceImportExport tests
 */

import { Types } from 'mongoose';

/**
 * Create valid export data for testing
 */
export function createTestExportData(overrides: Partial<any> = {}) {
  const defaultData = {
    metadata: {
      exportedAt: new Date().toISOString(),
      exportedBy: 'test-user-id',
      format: 'json' as const,
      version: '1.0.0',
      appVersion: '1.0.0',
    },
    encounter: {
      name: 'Test Encounter',
      description: 'Test description',
      tags: ['test'],
      difficulty: 'medium' as const,
      estimatedDuration: 30,
      targetLevel: 3,
      status: 'draft' as const,
      isPublic: false,
      settings: {
        allowPlayerVisibility: true,
        autoRollInitiative: false,
        trackResources: true,
        enableLairActions: false,
        enableGridMovement: false,
        gridSize: 5,
      },
      participants: [
        {
          id: 'temp-1',
          name: 'Test Character',
          type: 'pc' as const,
          maxHitPoints: 25,
          currentHitPoints: 25,
          temporaryHitPoints: 0,
          armorClass: 15,
          isPlayer: true,
          isVisible: true,
          notes: '',
          conditions: [],
        },
      ],
    },
  };

  return mergeDeep(defaultData, overrides);
}

/**
 * Create invalid export data for testing error cases
 */
export function createInvalidExportData() {
  return {
    metadata: {
      exportedAt: new Date().toISOString(),
      format: 'json',
      // Missing required fields
    },
    encounter: {
      // Missing required fields
    },
  };
}

/**
 * Create test encounter mock data
 */
export function createTestEncounterMock(mockUserId: string, mockEncounterId: string) {
  return {
    _id: new Types.ObjectId(mockEncounterId),
    ownerId: new Types.ObjectId(mockUserId),
    name: 'Test Encounter',
    description: 'A test encounter',
    tags: ['test'],
    difficulty: 'medium',
    estimatedDuration: 60,
    targetLevel: 5,
    status: 'draft',
    isPublic: false,
    sharedWith: [],
    version: 1,
    participants: [],
    settings: {
      allowPlayerVisibility: true,
      autoRollInitiative: false,
      trackResources: true,
      enableLairActions: false,
      enableGridMovement: false,
      gridSize: 5,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Deep merge utility for test data
 */
function mergeDeep(target: any, source: any): any {
  const output = { ...target };

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = mergeDeep(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }

  return output;
}

/**
 * Check if value is an object
 */
function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}
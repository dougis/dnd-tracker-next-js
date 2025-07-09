import { setupFormComponentTest } from './setup/test-setup';

// Mock the CharacterService
jest.mock('@/lib/services/CharacterService', () => ({
  CharacterService: {
    createCharacter: jest.fn(),
  },
}));

import { CharacterService } from '@/lib/services/CharacterService';

export function setupCharacterValidationTest() {
  setupFormComponentTest();
  const mockCharacterService = CharacterService as jest.Mocked<typeof CharacterService>;

  const defaultProps = {
    ownerId: 'user123',
    onSuccess: jest.fn(),
    onError: jest.fn(),
    onCancel: jest.fn(),
    isOpen: false,
  };

  const testProps = {
    ...defaultProps,
    ownerId: 'test-owner-id',
    isOpen: true,
  };

  return {
    mockCharacterService,
    defaultProps,
    testProps,
  };
}

export function setupMockCharacterService() {
  const mockCharacterService = CharacterService as jest.Mocked<typeof CharacterService>;
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up default successful response
    mockCharacterService.createCharacter.mockResolvedValue({
      success: true,
      data: {
        _id: 'test-char-id',
        name: 'Test Character',
        type: 'pc',
        race: 'human',
        size: 'medium',
      },
    });
  });

  return mockCharacterService;
}
import { Types } from 'mongoose';
import { EncounterServiceImportExport } from '../EncounterServiceImportExport';
import { EncounterService } from '../EncounterService';
import { Character } from '../../models/Character';
import type { IEncounter } from '../../models/encounter/interfaces';
import type { ICharacter } from '../../models/Character';

// Mock the dependencies
jest.mock('../EncounterService');
jest.mock('../../models/Character');

const mockEncounterService = EncounterService as jest.Mocked<typeof EncounterService>;
const mockCharacter = Character as jest.Mocked<typeof Character>;

describe('EncounterServiceImportExport', () => {
  let mockEncounter: IEncounter;
  let mockCharacter1: ICharacter;
  let mockCharacter2: ICharacter;
  let mockUserId: string;
  let mockEncounterId: string;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUserId = new Types.ObjectId().toString();
    mockEncounterId = new Types.ObjectId().toString();

    mockCharacter1 = {
      _id: new Types.ObjectId(),
      ownerId: new Types.ObjectId(mockUserId),
      name: 'Test Fighter',
      type: 'pc',
      race: 'Human',
      size: 'medium',
      classes: [{ class: 'Fighter', level: 5, hitDie: 10 }],
      abilityScores: {
        strength: 16,
        dexterity: 14,
        constitution: 15,
        intelligence: 10,
        wisdom: 12,
        charisma: 8,
      },
      hitPoints: { maximum: 45, current: 45, temporary: 0 },
      armorClass: 18,
      speed: 30,
      proficiencyBonus: 3,
      savingThrows: {
        strength: true,
        dexterity: false,
        constitution: true,
        intelligence: false,
        wisdom: false,
        charisma: false,
      },
      skills: new Map([['Athletics', true], ['Intimidation', true]]),
      equipment: [
        {
          name: 'Longsword',
          quantity: 1,
          weight: 3,
          value: 15,
          equipped: true,
          magical: false,
        },
      ],
      spells: [],
      backstory: 'A brave fighter',
      notes: 'Private notes',
      isPublic: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as ICharacter;

    mockCharacter2 = {
      _id: new Types.ObjectId(),
      ownerId: new Types.ObjectId(mockUserId),
      name: 'Test Wizard',
      type: 'pc',
      race: 'Elf',
      size: 'medium',
      classes: [{ class: 'Wizard', level: 3, hitDie: 6 }],
      abilityScores: {
        strength: 8,
        dexterity: 16,
        constitution: 14,
        intelligence: 18,
        wisdom: 13,
        charisma: 10,
      },
      hitPoints: { maximum: 20, current: 20, temporary: 0 },
      armorClass: 13,
      speed: 30,
      proficiencyBonus: 2,
      savingThrows: {
        strength: false,
        dexterity: false,
        constitution: false,
        intelligence: true,
        wisdom: true,
        charisma: false,
      },
      skills: new Map([['Arcana', true], ['History', true]]),
      equipment: [
        {
          name: 'Quarterstaff',
          quantity: 1,
          weight: 4,
          value: 2,
          equipped: true,
          magical: false,
        },
      ],
      spells: [
        {
          name: 'Magic Missile',
          level: 1,
          school: 'Evocation',
          castingTime: '1 action',
          range: '120 feet',
          components: 'V, S',
          duration: 'Instantaneous',
          description: 'Three darts of magical force',
          isPrepared: true,
        },
      ],
      backstory: 'A scholarly wizard',
      notes: 'Spell research notes',
      isPublic: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as ICharacter;

    mockEncounter = {
      _id: new Types.ObjectId(mockEncounterId),
      ownerId: new Types.ObjectId(mockUserId),
      name: 'Test Encounter',
      description: 'A challenging encounter',
      tags: ['combat', 'boss'],
      difficulty: 'hard',
      estimatedDuration: 60,
      targetLevel: 5,
      status: 'draft',
      isPublic: false,
      sharedWith: [],
      version: 1,
      participants: [
        {
          characterId: mockCharacter1._id,
          name: mockCharacter1.name,
          type: 'pc',
          maxHitPoints: 45,
          currentHitPoints: 45,
          temporaryHitPoints: 0,
          armorClass: 18,
          initiative: 12,
          isPlayer: true,
          isVisible: true,
          notes: 'Tank role',
          conditions: [],
        },
        {
          characterId: mockCharacter2._id,
          name: mockCharacter2.name,
          type: 'pc',
          maxHitPoints: 20,
          currentHitPoints: 20,
          temporaryHitPoints: 0,
          armorClass: 13,
          initiative: 15,
          isPlayer: true,
          isVisible: true,
          notes: 'Spell caster',
          conditions: ['concentration'],
        },
      ],
      settings: {
        allowPlayerVisibility: true,
        autoRollInitiative: false,
        trackResources: true,
        enableLairActions: false,
        enableGridMovement: false,
        gridSize: 5,
      },
      combatState: {
        isActive: true,
        currentRound: 2,
        currentTurn: 1,
        totalDuration: 120,
        startedAt: new Date(),
        initiativeOrder: [
          {
            participantId: mockCharacter2._id,
            initiative: 15,
            dexterity: 16,
            isActive: true,
            hasActed: false,
          },
          {
            participantId: mockCharacter1._id,
            initiative: 12,
            dexterity: 14,
            isActive: false,
            hasActed: true,
          },
        ],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    } as IEncounter;
  });

  describe('exportToJson', () => {
    it('should export encounter to JSON format successfully', async () => {
      // Arrange
      mockEncounterService.getEncounterById.mockResolvedValue({
        success: true,
        data: mockEncounter,
      });

      // Act
      const result = await EncounterServiceImportExport.exportToJson(
        mockEncounterId,
        mockUserId,
        { includeCharacterSheets: false }
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      const exportData = JSON.parse(result.data!);
      expect(exportData.metadata.format).toBe('json');
      expect(exportData.encounter.name).toBe('Test Encounter');
      expect(exportData.encounter.participants).toHaveLength(2);
      expect(exportData.encounter.combatState.isActive).toBe(true);
    });

    it('should include character sheets when option is enabled', async () => {
      // Arrange
      mockEncounterService.getEncounterById.mockResolvedValue({
        success: true,
        data: mockEncounter,
      });

      mockCharacter.find.mockResolvedValue([mockCharacter1, mockCharacter2]);

      // Act
      const result = await EncounterServiceImportExport.exportToJson(
        mockEncounterId,
        mockUserId,
        { includeCharacterSheets: true }
      );

      // Assert
      expect(result.success).toBe(true);

      const exportData = JSON.parse(result.data!);
      expect(exportData.encounter.characterSheets).toBeDefined();
      expect(exportData.encounter.characterSheets).toHaveLength(2);
      expect(exportData.encounter.characterSheets[0].name).toBe('Test Fighter');
      expect(exportData.encounter.characterSheets[1].name).toBe('Test Wizard');
    });

    it('should strip personal data when option is enabled', async () => {
      // Arrange
      mockEncounterService.getEncounterById.mockResolvedValue({
        success: true,
        data: mockEncounter,
      });

      mockCharacter.find.mockResolvedValue([mockCharacter1, mockCharacter2]);

      // Act
      const result = await EncounterServiceImportExport.exportToJson(
        mockEncounterId,
        mockUserId,
        {
          includeCharacterSheets: true,
          stripPersonalData: true,
          includePrivateNotes: false,
        }
      );

      // Assert
      expect(result.success).toBe(true);

      const exportData = JSON.parse(result.data!);
      expect(exportData.encounter.participants[0].notes).toBe('');
      expect(exportData.encounter.characterSheets[0].backstory).toBe('');
      expect(exportData.encounter.characterSheets[0].notes).toBe('');
    });

    it('should return error for invalid encounter ID', async () => {
      // Arrange
      mockEncounterService.getEncounterById.mockResolvedValue({
        success: false,
        error: { message: 'Encounter not found', code: 'ENCOUNTER_NOT_FOUND' },
      });

      // Act
      const result = await EncounterServiceImportExport.exportToJson(
        'invalid-id',
        mockUserId
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Encounter not found');
    });

    it('should return error for unauthorized user', async () => {
      // Arrange
      const unauthorizedEncounter = {
        ...mockEncounter,
        ownerId: new Types.ObjectId(),
        sharedWith: [],
      };

      mockEncounterService.getEncounterById.mockResolvedValue({
        success: true,
        data: unauthorizedEncounter,
      });

      // Act
      const result = await EncounterServiceImportExport.exportToJson(
        mockEncounterId,
        mockUserId
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('You do not have permission to export this encounter');
    });
  });

  describe('exportToXml', () => {
    it('should export encounter to XML format successfully', async () => {
      // Arrange
      mockEncounterService.getEncounterById.mockResolvedValue({
        success: true,
        data: mockEncounter,
      });

      // Act
      const result = await EncounterServiceImportExport.exportToXml(
        mockEncounterId,
        mockUserId,
        { includeCharacterSheets: false }
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.startsWith('<?xml version="1.0"')).toBe(true);
      expect(result.data!.includes('<encounterExport>')).toBe(true);
      expect(result.data!.includes('<name>Test Encounter</name>')).toBe(true);
    });
  });

  describe('importFromJson', () => {
    it('should import encounter from JSON successfully', async () => {
      // Arrange
      const exportData = {
        metadata: {
          exportedAt: new Date().toISOString(),
          exportedBy: mockUserId,
          format: 'json',
          version: '1.0.0',
          appVersion: '1.0.0',
        },
        encounter: {
          name: 'Imported Encounter',
          description: 'Test import',
          tags: ['test'],
          difficulty: 'medium',
          estimatedDuration: 30,
          targetLevel: 3,
          status: 'draft',
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
              type: 'pc',
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

      const mockCreatedEncounter = {
        ...mockEncounter,
        name: 'Imported Encounter',
        description: 'Test import',
      };

      mockEncounterService.createEncounter.mockResolvedValue({
        success: true,
        data: mockCreatedEncounter,
      });

      // Act
      const result = await EncounterServiceImportExport.importFromJson(
        JSON.stringify(exportData),
        { ownerId: mockUserId }
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('Imported Encounter');
      expect(mockEncounterService.createEncounter).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Imported Encounter',
          description: 'Test import',
          ownerId: mockUserId,
        })
      );
    });

    it('should return error for invalid JSON format', async () => {
      // Act
      const result = await EncounterServiceImportExport.importFromJson(
        'invalid json',
        { ownerId: mockUserId }
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Failed to import encounter from JSON');
    });

    it('should return error for invalid schema', async () => {
      // Arrange
      const invalidData = {
        metadata: {
          exportedAt: new Date().toISOString(),
          format: 'json',
          // Missing required fields
        },
        encounter: {
          // Missing required fields
        },
      };

      // Act
      const result = await EncounterServiceImportExport.importFromJson(
        JSON.stringify(invalidData),
        { ownerId: mockUserId }
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Invalid JSON format');
    });
  });

  describe('generateShareableLink', () => {
    it('should generate shareable link successfully', async () => {
      // Arrange
      mockEncounterService.getEncounterById.mockResolvedValue({
        success: true,
        data: mockEncounter,
      });

      // Act
      const result = await EncounterServiceImportExport.generateShareableLink(
        mockEncounterId,
        mockUserId
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.startsWith('http')).toBe(true);
      expect(result.data!.includes('/encounters/shared/')).toBe(true);
    });

    it('should return error for unauthorized user', async () => {
      // Arrange
      const unauthorizedEncounter = {
        ...mockEncounter,
        ownerId: new Types.ObjectId(),
        sharedWith: [],
      };

      mockEncounterService.getEncounterById.mockResolvedValue({
        success: true,
        data: unauthorizedEncounter,
      });

      // Act
      const result = await EncounterServiceImportExport.generateShareableLink(
        mockEncounterId,
        mockUserId
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('You do not have permission to share this encounter');
    });
  });

  describe('createTemplate', () => {
    it('should create template successfully', async () => {
      // Arrange
      mockEncounterService.getEncounterById.mockResolvedValue({
        success: true,
        data: mockEncounter,
      });

      // Act
      const result = await EncounterServiceImportExport.createTemplate(
        mockEncounterId,
        mockUserId,
        'My Template'
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.encounter.name).toBe('My Template');
      expect(result.data!.encounter.status).toBe('draft');
      expect(result.data!.encounter.isPublic).toBe(false);
      expect(result.data!.encounter.combatState.isActive).toBe(false);

      // Check that participant combat data is reset
      expect(result.data!.encounter.participants[0].currentHitPoints).toBe(
        result.data!.encounter.participants[0].maxHitPoints
      );
      expect(result.data!.encounter.participants[0].temporaryHitPoints).toBe(0);
      expect(result.data!.encounter.participants[0].conditions).toHaveLength(0);
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      // Arrange
      mockEncounterService.getEncounterById.mockRejectedValue(
        new Error('Database connection failed')
      );

      // Act
      const result = await EncounterServiceImportExport.exportToJson(
        mockEncounterId,
        mockUserId
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Failed to export encounter to JSON');
    });

    it('should handle invalid ObjectId format', async () => {
      // Act
      const result = await EncounterServiceImportExport.exportToJson(
        'invalid-object-id',
        mockUserId
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Invalid encounter ID');
    });
  });

  describe('data validation', () => {
    it('should validate export data structure', async () => {
      // Arrange
      mockEncounterService.getEncounterById.mockResolvedValue({
        success: true,
        data: mockEncounter,
      });

      // Act
      const result = await EncounterServiceImportExport.exportToJson(
        mockEncounterId,
        mockUserId,
        { includeCharacterSheets: false }
      );

      // Assert
      expect(result.success).toBe(true);

      const exportData = JSON.parse(result.data!);

      // Validate metadata
      expect(exportData.metadata).toBeDefined();
      expect(exportData.metadata.format).toBe('json');
      expect(exportData.metadata.version).toBe('1.0.0');
      expect(exportData.metadata.exportedBy).toBe(mockUserId);

      // Validate encounter data
      expect(exportData.encounter).toBeDefined();
      expect(exportData.encounter.name).toBe(mockEncounter.name);
      expect(exportData.encounter.participants).toHaveLength(2);
      expect(exportData.encounter.settings).toBeDefined();
      expect(exportData.encounter.combatState).toBeDefined();
    });
  });
});
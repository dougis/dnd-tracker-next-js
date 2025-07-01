import {
  createEncounterSchema,
  participantReferenceSchema,
  initiativeEntrySchema,
  encounterSettingsSchema,
  combatStateSchema,
  startCombatSchema,
  updateInitiativeSchema,
  damageParticipantSchema,
  healParticipantSchema,
  addConditionSchema,
  removeConditionSchema,
} from '../encounter';

describe('Encounter Validation Schemas', () => {
  describe('participantReferenceSchema', () => {
    const validParticipant = {
      characterId: '507f1f77bcf86cd799439011',
      name: 'Test Character',
      type: 'pc' as const,
      maxHitPoints: 100,
      currentHitPoints: 80,
      temporaryHitPoints: 0,
      armorClass: 15,
      isPlayer: true,
      isVisible: true,
      notes: '',
      conditions: [],
    };

    it('should validate a valid participant', () => {
      const result = participantReferenceSchema.safeParse(validParticipant);
      expect(result.success).toBe(true);
    });

    it('should reject invalid character ID', () => {
      const result = participantReferenceSchema.safeParse({
        ...validParticipant,
        characterId: 'invalid-id',
      });
      expect(result.success).toBe(false);
    });

    it('should reject negative hit points', () => {
      const result = participantReferenceSchema.safeParse({
        ...validParticipant,
        currentHitPoints: -1,
      });
      expect(result.success).toBe(false);
    });

    it('should reject armor class outside valid range', () => {
      const result = participantReferenceSchema.safeParse({
        ...validParticipant,
        armorClass: 35,
      });
      expect(result.success).toBe(false);
    });

    it('should validate optional position', () => {
      const result = participantReferenceSchema.safeParse({
        ...validParticipant,
        position: { x: 5, y: 10 },
      });
      expect(result.success).toBe(true);
    });
  });

  describe('initiativeEntrySchema', () => {
    const validEntry = {
      participantId: '507f1f77bcf86cd799439011',
      initiative: 15,
      dexterity: 14,
      isActive: false,
      hasActed: false,
    };

    it('should validate a valid initiative entry', () => {
      const result = initiativeEntrySchema.safeParse(validEntry);
      expect(result.success).toBe(true);
    });

    it('should reject initiative outside valid range', () => {
      const result = initiativeEntrySchema.safeParse({
        ...validEntry,
        initiative: 50,
      });
      expect(result.success).toBe(false);
    });

    it('should reject dexterity outside valid range', () => {
      const result = initiativeEntrySchema.safeParse({
        ...validEntry,
        dexterity: 0,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('encounterSettingsSchema', () => {
    it('should validate default settings', () => {
      const result = encounterSettingsSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.allowPlayerVisibility).toBe(true);
        expect(result.data.autoRollInitiative).toBe(false);
        expect(result.data.enableLairActions).toBe(false);
      }
    });

    it('should validate custom settings', () => {
      const settings = {
        allowPlayerVisibility: false,
        autoRollInitiative: true,
        enableLairActions: true,
        lairActionInitiative: 20,
        gridSize: 10,
      };
      const result = encounterSettingsSchema.safeParse(settings);
      expect(result.success).toBe(true);
    });

    it('should reject invalid grid size', () => {
      const result = encounterSettingsSchema.safeParse({
        gridSize: 100,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('combatStateSchema', () => {
    it('should validate default combat state', () => {
      const result = combatStateSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isActive).toBe(false);
        expect(result.data.currentRound).toBe(0);
        expect(result.data.currentTurn).toBe(0);
      }
    });

    it('should validate active combat state', () => {
      const combatState = {
        isActive: true,
        currentRound: 3,
        currentTurn: 1,
        initiativeOrder: [{
          participantId: '507f1f77bcf86cd799439011',
          initiative: 15,
          dexterity: 14,
          isActive: true,
          hasActed: false,
        }],
        startedAt: new Date().toISOString(),
        totalDuration: 120000,
      };
      const result = combatStateSchema.safeParse(combatState);
      expect(result.success).toBe(true);
    });

    it('should reject negative round numbers', () => {
      const result = combatStateSchema.safeParse({
        currentRound: -1,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createEncounterSchema', () => {
    const validEncounter = {
      ownerId: '507f1f77bcf86cd799439011',
      name: 'Test Encounter',
      description: 'A test encounter',
      participants: [{
        characterId: '507f1f77bcf86cd799439012',
        name: 'Test Character',
        type: 'pc' as const,
        maxHitPoints: 100,
        currentHitPoints: 100,
        temporaryHitPoints: 0,
        armorClass: 15,
        isPlayer: true,
        isVisible: true,
        notes: '',
        conditions: [],
      }],
    };

    it('should validate a valid encounter creation', () => {
      const result = createEncounterSchema.safeParse(validEncounter);
      expect(result.success).toBe(true);
    });

    it('should reject encounter without participants', () => {
      const result = createEncounterSchema.safeParse({
        ...validEncounter,
        participants: [],
      });
      expect(result.success).toBe(false);
    });

    it('should reject encounter with empty name', () => {
      const result = createEncounterSchema.safeParse({
        ...validEncounter,
        name: '',
      });
      expect(result.success).toBe(false);
    });

    it('should validate optional difficulty', () => {
      const result = createEncounterSchema.safeParse({
        ...validEncounter,
        difficulty: 'hard',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Combat Action Schemas', () => {
    describe('startCombatSchema', () => {
      it('should validate start combat request', () => {
        const result = startCombatSchema.safeParse({
          encounterId: '507f1f77bcf86cd799439011',
          autoRollInitiative: true,
        });
        expect(result.success).toBe(true);
      });
    });

    describe('updateInitiativeSchema', () => {
      it('should validate initiative update', () => {
        const result = updateInitiativeSchema.safeParse({
          encounterId: '507f1f77bcf86cd799439011',
          participantId: '507f1f77bcf86cd799439012',
          initiative: 18,
        });
        expect(result.success).toBe(true);
      });

      it('should reject invalid initiative value', () => {
        const result = updateInitiativeSchema.safeParse({
          encounterId: '507f1f77bcf86cd799439011',
          participantId: '507f1f77bcf86cd799439012',
          initiative: 50,
        });
        expect(result.success).toBe(false);
      });
    });

    describe('damageParticipantSchema', () => {
      it('should validate damage application', () => {
        const result = damageParticipantSchema.safeParse({
          encounterId: '507f1f77bcf86cd799439011',
          participantId: '507f1f77bcf86cd799439012',
          damage: 15,
          damageType: 'slashing',
        });
        expect(result.success).toBe(true);
      });

      it('should reject negative damage', () => {
        const result = damageParticipantSchema.safeParse({
          encounterId: '507f1f77bcf86cd799439011',
          participantId: '507f1f77bcf86cd799439012',
          damage: -5,
        });
        expect(result.success).toBe(false);
      });
    });

    describe('healParticipantSchema', () => {
      it('should validate healing application', () => {
        const result = healParticipantSchema.safeParse({
          encounterId: '507f1f77bcf86cd799439011',
          participantId: '507f1f77bcf86cd799439012',
          healing: 20,
        });
        expect(result.success).toBe(true);
      });
    });

    describe('addConditionSchema', () => {
      it('should validate condition addition', () => {
        const result = addConditionSchema.safeParse({
          encounterId: '507f1f77bcf86cd799439011',
          participantId: '507f1f77bcf86cd799439012',
          condition: 'poisoned',
          duration: 3,
        });
        expect(result.success).toBe(true);
      });
    });

    describe('removeConditionSchema', () => {
      it('should validate condition removal', () => {
        const result = removeConditionSchema.safeParse({
          encounterId: '507f1f77bcf86cd799439011',
          participantId: '507f1f77bcf86cd799439012',
          condition: 'poisoned',
        });
        expect(result.success).toBe(true);
      });
    });
  });
});
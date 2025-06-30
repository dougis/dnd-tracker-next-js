import { dndValidators } from '../form-utils';
import { dndTestData, testDndValidatorStructure, testDndValidatorValues } from './test-utils';

describe('D&D Validators', () => {
  describe('characterName', () => {
    it('should have correct validation rules', () => {
      testDndValidatorStructure(dndValidators.characterName, dndTestData.characterName.messages);
    });

    it('should validate character names correctly', () => {
      testDndValidatorValues(
        dndValidators.characterName,
        dndTestData.characterName.valid,
        dndTestData.characterName.invalid
      );
    });
  });

  describe('abilityScore', () => {
    it('should have correct validation rules', () => {
      testDndValidatorStructure(dndValidators.abilityScore, dndTestData.abilityScore.messages);
    });

    it('should validate ability scores correctly', () => {
      testDndValidatorValues(
        dndValidators.abilityScore,
        dndTestData.abilityScore.valid,
        dndTestData.abilityScore.invalid
      );
    });
  });

  describe('hitPoints', () => {
    it('should have correct validation rules', () => {
      testDndValidatorStructure(dndValidators.hitPoints, dndTestData.hitPoints.messages);
    });

    it('should validate hit points correctly', () => {
      testDndValidatorValues(
        dndValidators.hitPoints,
        dndTestData.hitPoints.valid,
        dndTestData.hitPoints.invalid
      );
    });
  });

  describe('armorClass', () => {
    it('should have correct validation rules', () => {
      testDndValidatorStructure(dndValidators.armorClass, dndTestData.armorClass.messages);
    });

    it('should validate armor class correctly', () => {
      testDndValidatorValues(
        dndValidators.armorClass,
        dndTestData.armorClass.valid,
        dndTestData.armorClass.invalid
      );
    });
  });

  describe('initiative', () => {
    it('should have correct validation rules', () => {
      testDndValidatorStructure(dndValidators.initiative, dndTestData.initiative.messages);
    });

    it('should validate initiative correctly', () => {
      testDndValidatorValues(
        dndValidators.initiative,
        dndTestData.initiative.valid,
        dndTestData.initiative.invalid
      );
    });
  });

  describe('level', () => {
    it('should have correct validation rules', () => {
      testDndValidatorStructure(dndValidators.level, dndTestData.level.messages);
    });

    it('should validate level correctly', () => {
      testDndValidatorValues(
        dndValidators.level,
        dndTestData.level.valid,
        dndTestData.level.invalid
      );
    });
  });
});

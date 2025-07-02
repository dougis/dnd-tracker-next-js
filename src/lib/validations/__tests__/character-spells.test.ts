import { spellSchema } from '../character';
import { validSpellSchools } from './character-test-helpers';

describe('Character Spell Validation', () => {
  describe('spellSchema', () => {
    it('should validate complete spell', () => {
      const validSpell = {
        name: 'Fireball',
        level: 3,
        school: 'evocation',
        castingTime: '1 action',
        range: '150 feet',
        components: {
          verbal: true,
          somatic: true,
          material: true,
          materialComponent: 'A tiny ball of bat guano and sulfur',
        },
        duration: 'Instantaneous',
        description: 'A bright streak flashes from your pointing finger...',
        prepared: true,
      };

      expect(() => spellSchema.parse(validSpell)).not.toThrow();
    });

    it('should validate cantrip (level 0)', () => {
      const cantrip = {
        name: 'Prestidigitation',
        level: 0,
        school: 'transmutation',
        castingTime: '1 action',
        range: '10 feet',
        components: {
          verbal: true,
          somatic: true,
          material: false,
        },
        duration: 'Up to 1 hour',
        description: 'This spell is a minor magical trick...',
      };

      const result = spellSchema.parse(cantrip);
      expect(result.level).toBe(0);
      expect(result.prepared).toBe(false); // default
    });

    it('should validate all spell schools', () => {
      validSpellSchools.forEach(school => {
        const spell = {
          name: 'Test Spell',
          level: 1,
          school,
          castingTime: '1 action',
          range: '30 feet',
          components: { verbal: true, somatic: false, material: false },
          duration: '1 minute',
          description: 'Test description',
        };
        expect(() => spellSchema.parse(spell)).not.toThrow();
      });
    });

    it('should reject invalid spell levels', () => {
      const invalidLevels = [-1, 10, 15, 1.5];

      invalidLevels.forEach(level => {
        const spell = {
          name: 'Invalid Spell',
          level,
          school: 'evocation',
          castingTime: '1 action',
          range: '30 feet',
          components: { verbal: true, somatic: false, material: false },
          duration: '1 minute',
          description: 'Test description',
        };
        expect(() => spellSchema.parse(spell)).toThrow();
      });
    });

    it('should reject invalid spell schools', () => {
      const invalidSchools = ['invalid', 'EVOCATION', 'elemental', ''];

      invalidSchools.forEach(school => {
        const spell = {
          name: 'Test Spell',
          level: 1,
          school,
          castingTime: '1 action',
          range: '30 feet',
          components: { verbal: true, somatic: false, material: false },
          duration: '1 minute',
          description: 'Test description',
        };
        expect(() => spellSchema.parse(spell)).toThrow();
      });
    });

    it('should validate spell components', () => {
      const componentsOnly = {
        name: 'Component Test',
        level: 2,
        school: 'abjuration',
        castingTime: '1 action',
        range: 'Self',
        components: {
          verbal: false,
          somatic: true,
          material: false,
        },
        duration: '10 minutes',
        description: 'A spell with only somatic components',
      };

      expect(() => spellSchema.parse(componentsOnly)).not.toThrow();
    });

    it('should validate material component details', () => {
      const materialSpell = {
        name: 'Material Spell',
        level: 1,
        school: 'conjuration',
        castingTime: '1 minute',
        range: '60 feet',
        components: {
          verbal: true,
          somatic: true,
          material: true,
          materialComponent: 'A piece of crystallized dragon breath',
        },
        duration: '1 hour',
        description: 'A spell requiring specific materials',
      };

      expect(() => spellSchema.parse(materialSpell)).not.toThrow();
    });

    it('should reject invalid spell names', () => {
      const invalidNames = ['', 'A'.repeat(101)];

      invalidNames.forEach(name => {
        const spell = {
          name,
          level: 1,
          school: 'evocation',
          castingTime: '1 action',
          range: '30 feet',
          components: { verbal: true, somatic: false, material: false },
          duration: '1 minute',
          description: 'Test description',
        };
        expect(() => spellSchema.parse(spell)).toThrow();
      });
    });

    it('should validate field length limits', () => {
      const longFields = {
        name: 'Valid Name',
        level: 1,
        school: 'evocation',
        castingTime: 'A'.repeat(51), // 51 characters
        range: 'Valid range',
        components: {
          verbal: true,
          somatic: false,
          material: true,
          materialComponent: 'A'.repeat(201), // 201 characters
        },
        duration: 'A'.repeat(101), // 101 characters
        description: 'A'.repeat(2001), // 2001 characters
      };

      expect(() => spellSchema.parse(longFields)).toThrow();
    });

    it('should handle default component values', () => {
      const minimalSpell = {
        name: 'Simple Spell',
        level: 1,
        school: 'divination',
        castingTime: '1 action',
        range: 'Touch',
        components: {},
        duration: 'Instantaneous',
        description: 'A simple divination spell',
      };

      const result = spellSchema.parse(minimalSpell);
      expect(result.components.verbal).toBe(false);
      expect(result.components.somatic).toBe(false);
      expect(result.components.material).toBe(false);
      expect(result.prepared).toBe(false);
    });
  });
});
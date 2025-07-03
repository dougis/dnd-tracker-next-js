import {
  NPCTemplate,
  ImportFormat,
  calculateProficiencyBonus,
  parseChallengeRating,
} from '@/types/npc';

/**
 * Handles importing NPC templates from various external formats
 */
export class NPCTemplateImporter {

  /**
   * Parse imported data based on format
   */
  static parseImportData(data: any, format: ImportFormat): Omit<NPCTemplate, 'id'> {
    const parser = this.getFormatParser(format);
    return parser(data);
  }

  /**
   * Get appropriate parser function for format
   */
  private static getFormatParser(format: ImportFormat): (_data: any) => Omit<NPCTemplate, 'id'> {
    const parsers = {
      json: this.parseJSONImport.bind(this),
      dndbeyond: this.parseDnDBeyondImport.bind(this),
      roll20: this.parseRoll20Import.bind(this),
      custom: this.parseCustomImport.bind(this),
    };

    if (!(format in parsers)) {
      throw new Error(`Unsupported import format: ${format}`);
    }

    return parsers[format as keyof typeof parsers];
  }

  private static parseJSONImport(data: any): Omit<NPCTemplate, 'id'> {
    this.validateRequiredFields(data, ['name']);

    if (data.challengeRating === undefined && data.challengeRating !== 0) {
      throw new Error('challengeRating is required');
    }

    return {
      name: data.name,
      category: data.creatureType || data.category || 'humanoid',
      challengeRating: data.challengeRating,
      size: data.size || 'medium',
      stats: this.createStatsFromData(data),
      equipment: this.parseEquipment(data.equipment),
      spells: data.spells || [],
      actions: data.actions || [],
      behavior: data.behavior,
      isSystem: false,
    };
  }

  private static parseDnDBeyondImport(data: any): Omit<NPCTemplate, 'id'> {
    this.validateRequiredFields(data, ['name']);

    const challengeRating = typeof data.cr === 'string' ? parseChallengeRating(data.cr) : data.cr;

    return {
      name: data.name,
      category: 'humanoid', // Default, should be parsed from data
      challengeRating,
      size: 'medium',
      stats: this.createDnDBeyondStats(data, challengeRating),
      equipment: [],
      spells: [],
      actions: [],
      isSystem: false,
    };
  }

  private static parseRoll20Import(_data: any): Omit<NPCTemplate, 'id'> {
    throw new Error('Roll20 import not yet implemented');
  }

  private static parseCustomImport(_data: any): Omit<NPCTemplate, 'id'> {
    throw new Error('Custom import not yet implemented');
  }

  private static validateRequiredFields(data: any, requiredFields: string[]): void {
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`${field} is required`);
      }
    }
  }

  private static createStatsFromData(data: any) {
    return {
      abilityScores: data.abilityScores || this.getDefaultAbilityScores(),
      hitPoints: this.parseHitPoints(data.hitPoints),
      armorClass: data.armorClass || 10,
      speed: data.speed || 30,
      proficiencyBonus: calculateProficiencyBonus(data.challengeRating),
      savingThrows: data.savingThrows || {},
      skills: data.skills || {},
      damageVulnerabilities: data.damageVulnerabilities || [],
      damageResistances: data.damageResistances || [],
      damageImmunities: data.damageImmunities || [],
      conditionImmunities: data.conditionImmunities || [],
      senses: data.senses || [],
      languages: data.languages || [],
    };
  }

  private static createDnDBeyondStats(data: any, challengeRating: number) {
    return {
      abilityScores: {
        strength: data.stats?.str || 10,
        dexterity: data.stats?.dex || 10,
        constitution: data.stats?.con || 10,
        intelligence: data.stats?.int || 10,
        wisdom: data.stats?.wis || 10,
        charisma: data.stats?.cha || 10,
      },
      hitPoints: { maximum: data.hp || 1, current: data.hp || 1, temporary: 0 },
      armorClass: data.ac || 10,
      speed: data.speed || 30,
      proficiencyBonus: calculateProficiencyBonus(challengeRating),
      savingThrows: {},
      skills: {},
      damageVulnerabilities: [],
      damageResistances: [],
      damageImmunities: [],
      conditionImmunities: [],
      senses: [],
      languages: [],
    };
  }

  private static getDefaultAbilityScores() {
    return {
      strength: 10, dexterity: 10, constitution: 10,
      intelligence: 10, wisdom: 10, charisma: 10,
    };
  }

  private static parseHitPoints(hitPoints: any) {
    return hitPoints
      ? { ...hitPoints, temporary: hitPoints.temporary || 0 }
      : { maximum: 1, current: 1, temporary: 0 };
  }

  private static parseEquipment(equipment: any[]): any[] {
    if (!equipment) return [];

    return equipment.map((item: any) =>
      typeof item === 'string' ? { name: item } : item
    );
  }
}
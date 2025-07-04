import { NPCTemplate } from '@/types/npc';

/**
 * Helper functions for NPC form data transformation
 */
export class NPCFormHelpers {

  /**
   * Convert template to form data format
   */
  static templateToFormData(template: NPCTemplate) {
    return {
      ...this.extractBasicInfo(template),
      ...this.extractStats(template),
      ...this.extractDefensiveProperties(template),
      ...this.extractEquipmentAndSpells(template),
      ...this.extractBehavior(template),
      isVariant: false,
    };
  }

  private static extractBasicInfo(template: NPCTemplate) {
    return {
      name: template.name,
      creatureType: template.category,
      size: template.size || 'medium',
      challengeRating: template.challengeRating,
    };
  }

  private static extractStats(template: NPCTemplate) {
    return {
      abilityScores: { ...template.stats.abilityScores },
      hitPoints: { ...template.stats.hitPoints, temporary: 0 },
      armorClass: template.stats.armorClass,
      speed: template.stats.speed,
    };
  }

  private static extractDefensiveProperties(template: NPCTemplate) {
    return {
      damageVulnerabilities: [...(template.stats.damageVulnerabilities || [])],
      damageResistances: [...(template.stats.damageResistances || [])],
      damageImmunities: [...(template.stats.damageImmunities || [])],
      conditionImmunities: [...(template.stats.conditionImmunities || [])],
      senses: [...(template.stats.senses || [])],
      languages: [...(template.stats.languages || [])],
    };
  }

  private static extractEquipmentAndSpells(template: NPCTemplate) {
    return {
      equipment: this.mapTemplateEquipment(template.equipment),
      spells: this.mapTemplateSpells(template.spells),
      actions: this.mapTemplateActions(template.actions),
      isSpellcaster: (template.spells?.length || 0) > 0,
    };
  }

  private static extractBehavior(template: NPCTemplate) {
    return {
      personality: template.behavior?.personality,
      motivations: template.behavior?.motivations,
      tactics: template.behavior?.tactics,
    };
  }

  /**
   * Convert JSON import data to form data format
   */
  static jsonToFormData(parsed: any, currentFormData: any) {
    return {
      name: parsed.name || '',
      creatureType: parsed.creatureType || parsed.category || 'humanoid',
      challengeRating: parsed.challengeRating || 0.5,
      abilityScores: parsed.abilityScores || currentFormData.abilityScores,
      hitPoints: this.parseHitPoints(parsed.hitPoints, currentFormData.hitPoints),
      armorClass: parsed.armorClass || 10,
      speed: parsed.speed || 30,
    };
  }

  /**
   * Filter templates by search and category
   */
  static filterTemplates(templates: NPCTemplate[], search: string, category: string) {
    let filtered = [...templates];

    if (category !== 'all') {
      filtered = filtered.filter(t => t.category === category);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(searchLower) ||
        t.category.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }

  private static mapTemplateEquipment(equipment?: any[]) {
    if (!equipment) return [];

    return equipment.map(eq => ({
      name: eq.name,
      type: eq.type,
      quantity: eq.quantity || 1,
      magical: eq.magical || false
    }));
  }

  private static mapTemplateSpells(spells?: any[]) {
    if (!spells) return [];

    return spells.map(spell => ({
      name: spell.name,
      level: spell.level
    }));
  }

  private static mapTemplateActions(actions?: any[]) {
    if (!actions) return [];

    return actions.map(action => ({
      name: action.name,
      type: action.type,
      description: action.description,
      attackBonus: action.attackBonus,
      damage: action.damage,
      range: action.range,
      recharge: action.recharge,
      uses: action.uses,
      maxUses: action.maxUses,
    }));
  }

  private static parseHitPoints(importedHP: any, currentHP: any) {
    if (!importedHP) return currentHP;

    return {
      ...importedHP,
      temporary: importedHP.temporary || 0
    };
  }
}
import { ServiceResult } from './CharacterServiceErrors';
import {
  NPCTemplate,
  VariantType,
  ChallengeRating,
} from '@/types/npc';

/**
 * Handles NPC template variant creation and modifications
 */
export class NPCTemplateVariants {

  /**
   * Apply variant modifiers to a base template
   */
  static async applyVariant(baseTemplate: Partial<NPCTemplate>, variantType: VariantType): Promise<ServiceResult<NPCTemplate>> {
    try {
      if (!this.isValidVariantType(variantType)) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid variant type',
          },
        };
      }

      const variant = this.createVariantTemplate(baseTemplate, variantType);
      return { success: true, data: variant };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to apply variant',
          details: { message: error instanceof Error ? error.message : 'Unknown error' },
        },
      };
    }
  }

  private static isValidVariantType(variantType: VariantType): boolean {
    return ['elite', 'weak', 'champion', 'minion'].includes(variantType);
  }

  private static createVariantTemplate(baseTemplate: Partial<NPCTemplate>, variantType: VariantType): NPCTemplate {
    const variant = JSON.parse(JSON.stringify(baseTemplate));

    switch (variantType) {
      case 'elite':
        return this.createEliteVariant(variant);
      case 'weak':
        return this.createWeakVariant(variant);
      case 'champion':
        return this.createChampionVariant(variant);
      case 'minion':
        return this.createMinionVariant(variant);
      default:
        throw new Error(`Unsupported variant type: ${variantType}`);
    }
  }

  private static createEliteVariant(variant: Partial<NPCTemplate>): NPCTemplate {
    variant.name = `Elite ${variant.name}`;
    variant.challengeRating = this.adjustChallengeRating(variant.challengeRating!, 1.5);

    if (variant.stats) {
      variant.stats.hitPoints.maximum = Math.floor(variant.stats.hitPoints.maximum * 1.5);
      variant.stats.hitPoints.current = variant.stats.hitPoints.maximum;
      variant.stats.abilityScores = this.enhanceAbilityScores(variant.stats.abilityScores, 2);
    }

    return variant as NPCTemplate;
  }

  private static createWeakVariant(variant: Partial<NPCTemplate>): NPCTemplate {
    variant.name = `Weak ${variant.name}`;
    variant.challengeRating = this.adjustChallengeRating(variant.challengeRating!, 0.7);

    if (variant.stats) {
      variant.stats.hitPoints.maximum = Math.max(1, Math.floor(variant.stats.hitPoints.maximum * 0.6));
      variant.stats.hitPoints.current = variant.stats.hitPoints.maximum;
      variant.stats.abilityScores = this.reduceAbilityScores(variant.stats.abilityScores, 2);
    }

    return variant as NPCTemplate;
  }

  private static createChampionVariant(variant: Partial<NPCTemplate>): NPCTemplate {
    variant.name = `${variant.name} Champion`;
    variant.challengeRating = this.adjustChallengeRating(variant.challengeRating!, 2);

    if (variant.stats) {
      variant.stats.hitPoints.maximum = Math.floor(variant.stats.hitPoints.maximum * 2);
      variant.stats.hitPoints.current = variant.stats.hitPoints.maximum;
      variant.stats.armorClass += 2;
    }

    return variant as NPCTemplate;
  }

  private static createMinionVariant(variant: Partial<NPCTemplate>): NPCTemplate {
    variant.name = `${variant.name} Minion`;
    variant.challengeRating = this.adjustChallengeRating(variant.challengeRating!, 0.5);

    if (variant.stats) {
      variant.stats.hitPoints.maximum = 1;
      variant.stats.hitPoints.current = 1;
    }

    return variant as NPCTemplate;
  }

  private static enhanceAbilityScores(scores: any, bonus: number) {
    return {
      ...scores,
      strength: Math.min(30, scores.strength + bonus),
      dexterity: Math.min(30, scores.dexterity + bonus),
      constitution: Math.min(30, scores.constitution + bonus),
    };
  }

  private static reduceAbilityScores(scores: any, penalty: number) {
    return {
      ...scores,
      strength: Math.max(1, scores.strength - penalty),
      dexterity: Math.max(1, scores.dexterity - penalty),
      constitution: Math.max(1, scores.constitution - penalty),
    };
  }

  private static adjustChallengeRating(baseCR: ChallengeRating, multiplier: number): ChallengeRating {
    if (baseCR === 0) return multiplier > 1 ? 0.125 : 0;

    const adjusted = baseCR * multiplier;

    // Handle fractional CRs
    if (adjusted <= 0) return 0;
    if (adjusted <= 0.125) return 0.125;
    if (adjusted <= 0.25) return 0.25;
    if (adjusted < 1) return 0.5;

    // Handle integer CRs
    const rounded = Math.round(adjusted);
    return Math.min(30, Math.max(1, rounded)) as ChallengeRating;
  }
}
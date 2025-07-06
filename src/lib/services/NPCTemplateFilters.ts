/**
 * NPC Template Filtering Logic
 *
 * Extracted filtering logic from NPCTemplateService to reduce complexity
 */

import { NPCTemplate, TemplateFilter } from '@/types/npc';

export class NPCTemplateFilters {

  /**
   * Apply category filter
   */
  static applyCategory(templates: NPCTemplate[], category: string): NPCTemplate[] {
    return templates.filter(t => t.category === category);
  }

  /**
   * Apply minimum challenge rating filter
   */
  static applyMinCR(templates: NPCTemplate[], minCR: number): NPCTemplate[] {
    return templates.filter(t => t.challengeRating >= minCR);
  }

  /**
   * Apply maximum challenge rating filter
   */
  static applyMaxCR(templates: NPCTemplate[], maxCR: number): NPCTemplate[] {
    return templates.filter(t => t.challengeRating <= maxCR);
  }

  /**
   * Apply search filter
   */
  static applySearch(templates: NPCTemplate[], search: string): NPCTemplate[] {
    const searchLower = search.toLowerCase();
    return templates.filter(t =>
      t.name.toLowerCase().includes(searchLower) ||
      t.category.toLowerCase().includes(searchLower)
    );
  }

  /**
   * Apply size filter
   */
  static applySize(templates: NPCTemplate[], size: string): NPCTemplate[] {
    return templates.filter(t => t.size === size);
  }

  /**
   * Apply system/custom filter
   */
  static applySystemFilter(templates: NPCTemplate[], isSystem: boolean): NPCTemplate[] {
    return templates.filter(t => t.isSystem === isSystem);
  }

  /**
   * Apply all filters in a single pass
   */
  static applyAllFilters(templates: NPCTemplate[], filters: TemplateFilter): NPCTemplate[] {
    return templates.filter(template => {
      return this.matchesCategory(template, filters.category) &&
             this.matchesChallengeRating(template, filters.minCR, filters.maxCR) &&
             this.matchesSearch(template, filters.search) &&
             this.matchesSize(template, filters.size) &&
             this.matchesSystemFlag(template, filters.isSystem);
    });
  }

  /**
   * Check if template matches category filter
   */
  private static matchesCategory(template: NPCTemplate, category?: string): boolean {
    return !category || template.category === category;
  }

  /**
   * Check if template matches challenge rating filters
   */
  private static matchesChallengeRating(template: NPCTemplate, minCR?: number, maxCR?: number): boolean {
    const withinMin = minCR === undefined || template.challengeRating >= minCR;
    const withinMax = maxCR === undefined || template.challengeRating <= maxCR;
    return withinMin && withinMax;
  }

  /**
   * Check if template matches search filter
   */
  private static matchesSearch(template: NPCTemplate, search?: string): boolean {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return template.name.toLowerCase().includes(searchLower) ||
           template.category.toLowerCase().includes(searchLower);
  }

  /**
   * Check if template matches size filter
   */
  private static matchesSize(template: NPCTemplate, size?: string): boolean {
    return !size || template.size === size;
  }

  /**
   * Check if template matches system flag filter
   */
  private static matchesSystemFlag(template: NPCTemplate, isSystem?: boolean): boolean {
    return isSystem === undefined || template.isSystem === isSystem;
  }

  /**
   * Sort templates by challenge rating and name
   */
  static sortTemplates(templates: NPCTemplate[]): NPCTemplate[] {
    return templates.sort((a, b) => {
      if (a.challengeRating !== b.challengeRating) {
        return a.challengeRating - b.challengeRating;
      }
      return a.name.localeCompare(b.name);
    });
  }
}
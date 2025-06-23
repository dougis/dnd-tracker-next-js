/**
 * Utility functions for the D&D Tracker application
 */

/**
 * Calculates the ability modifier from an ability score
 * @param score - The ability score (3-30)
 * @returns The ability modifier (-5 to +10)
 */
export function calculateAbilityModifier(score: number): number {
  if (score < 1 || score > 30) {
    throw new Error('Ability score must be between 1 and 30');
  }
  return Math.floor((score - 10) / 2);
}

/**
 * Calculates initiative value with dexterity modifier
 * @param dexterityScore - The character's dexterity score
 * @param bonus - Additional initiative bonus (default: 0)
 * @returns The initiative modifier
 */
export function calculateInitiativeModifier(
  dexterityScore: number,
  bonus: number = 0
): number {
  const dexModifier = calculateAbilityModifier(dexterityScore);
  return dexModifier + bonus;
}

/**
 * Rolls a d20 and adds a modifier
 * @param modifier - The modifier to add to the roll
 * @returns The total roll result (1-20 + modifier)
 */
export function rollD20(modifier: number = 0): number {
  const roll = Math.floor(Math.random() * 20) + 1;
  return roll + modifier;
}

/**
 * Validates if a string is a valid email address
 * @param email - The email string to validate
 * @returns True if valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

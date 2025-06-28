import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {

    return twMerge(clsx(inputs));

}

/**
 * Calculates the ability score modifier according to D&D 5e rules
 * @param score Ability score (1-30)
 * @returns Ability modifier (-5 to +10)
 */
export function calculateAbilityModifier(score: number): number {

    if (score < 1 || score > 30) {

        throw new Error('Ability score must be between 1 and 30');

    }
    return Math.floor((score - 10) / 2);

}

/**
 * Calculates initiative modifier based on dexterity and optional bonus
 * @param dexterityScore Dexterity ability score
 * @param bonus Additional initiative bonus
 * @returns Total initiative modifier
 */
export function calculateInitiativeModifier(
    dexterityScore: number,
    bonus: number = 0
): number {

    const dexMod = calculateAbilityModifier(dexterityScore);
    return dexMod + bonus;

}

/**
 * Simulates a D20 dice roll with optional modifier
 * @param modifier Modifier to add to the roll
 * @returns Result of the roll (1-20 + modifier)
 */
export function rollD20(modifier: number = 0): number {

    // Generate random number between 1-20
    const roll = Math.floor(Math.random() * 20) + 1;
    return roll + modifier;

}

/**
 * Validates an email address format
 * @param email Email address to validate
 * @returns True if email is valid, false otherwise
 */
export function isValidEmail(email: string): boolean {

    if (!email) return false;

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);

}

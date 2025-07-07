// Simple test to check validation
import { validateDamageInput } from './src/components/combat/hp-tracking/hp-validation-utils';

console.log('Testing validateDamageInput("-5"):');
const result = validateDamageInput('-5');
console.log('Result:', JSON.stringify(result, null, 2));
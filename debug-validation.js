// Debug validation function
const { validateDamageInput } = require('./src/components/combat/hp-tracking/hp-validation-utils.ts');

console.log('Testing validateDamageInput with "-5":');
const result = validateDamageInput('-5');
console.log('Result:', result);
console.log('isValid:', result.isValid);
console.log('error:', result.error);
console.log('parsed:', result.parsed);
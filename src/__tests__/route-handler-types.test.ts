/**
 * Test suite to validate that Next.js App Router route handlers
 * use the correct parameter type definitions
 *
 * Based on investigation of Issue #233, the correct pattern for Next.js 15
 * App Router route handlers appears to be Promise<{ id: string }>
 * for dynamic route parameters.
 */

import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('Route Handler Parameter Types', () => {
  const routeFiles = [
    'src/app/api/encounters/[id]/share/route.ts',
    'src/app/api/encounters/[id]/settings/route.ts',
    'src/app/api/encounters/[id]/template/route.ts',
    'src/app/api/encounters/[id]/export/route.ts',
    'src/app/api/users/[id]/profile/route.ts',
    'src/app/api/characters/[id]/route.ts',
  ];

  describe('Next.js 15 App Router compatibility', () => {
    routeFiles.forEach(filePath => {
      it(`should use Promise wrapper for dynamic route params in ${filePath}`, () => {
        const fullPath = path.join(process.cwd(), filePath);
        const content = fs.readFileSync(fullPath, 'utf-8');

        // Next.js 15 App Router requires Promise<{ id: string }> for dynamic routes
        expect(content).toMatch(/params.*Promise<\s*{\s*id:\s*string\s*}\s*>/);

        // Should either await params directly or pass to helper that awaits
        expect(content).toMatch(/(await\s+.*params)|(withAuthAndAccess\(params)/);
      });
    });
  });

  it('should document the correct pattern for future reference', () => {
    // This test serves as documentation that Promise<{ id: string }>
    // is the correct pattern for Next.js 15 App Router route handlers
    // with dynamic segments like [id]
    expect(true).toBe(true);
  });
});
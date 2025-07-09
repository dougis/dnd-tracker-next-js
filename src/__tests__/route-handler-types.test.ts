/**
 * Test suite to validate that Next.js App Router route handlers
 * use correct parameter type definitions without Promise wrappers
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

  const helperFiles = [
    'src/lib/api/route-helpers.ts',
  ];

  describe('Route handler parameter types', () => {
    routeFiles.forEach(filePath => {
      it(`should not use Promise wrapper for params in ${filePath}`, () => {
        const fullPath = path.join(process.cwd(), filePath);
        const content = fs.readFileSync(fullPath, 'utf-8');

        // Should not have Promise<{ id: string }> pattern
        expect(content).not.toMatch(/params:\s*Promise<\s*{\s*id:\s*string\s*}\s*>/);

        // Should have correct pattern: { params: { id: string } } or context: { params: { id: string } } or context: RouteContext
        expect(content).toMatch(/({\s*params\s*}:\s*{\s*params:\s*{\s*id:\s*string\s*}\s*})|(context:\s*{\s*params:\s*{\s*id:\s*string\s*}\s*})|(context:\s*RouteContext)/);
      });

      it(`should not await params in ${filePath}`, () => {
        const fullPath = path.join(process.cwd(), filePath);
        const content = fs.readFileSync(fullPath, 'utf-8');

        // Should not have await params pattern for direct parameter access
        expect(content).not.toMatch(/await\s+(context\.)?params[^.]/);

        // Should directly access params.id OR pass params to helper function
        expect(content).toMatch(/(params\.id)|(withAuthAndAccess\(params)|(context\.params)/);
      });
    });
  });

  describe('Helper function parameter types', () => {
    helperFiles.forEach(filePath => {
      it(`should not use Promise wrapper for params in helper functions in ${filePath}`, () => {
        const fullPath = path.join(process.cwd(), filePath);
        const content = fs.readFileSync(fullPath, 'utf-8');

        // Helper functions should accept { id: string } directly, not Promise<{ id: string }>
        expect(content).not.toMatch(/params:\s*Promise<\s*{\s*id:\s*string\s*}\s*>/);

        // Helper functions should have correct pattern
        expect(content).toMatch(/params:\s*{\s*id:\s*string\s*}/);
      });

      it(`should not await params in helper functions in ${filePath}`, () => {
        const fullPath = path.join(process.cwd(), filePath);
        const content = fs.readFileSync(fullPath, 'utf-8');

        // Helper functions should not await params
        expect(content).not.toMatch(/await\s+(context\.)?params[^.]/);

        // Should directly access params properties (direct access or destructuring)
        expect(content).toMatch(/(params\.id)|({.*id.*}\s*=\s*params)/);
      });
    });
  });

  // Page components are not part of this bug fix - they correctly use Promise parameters
  // describe('Page component parameter types', () => {
  //   const pageFiles = [
  //     'src/app/encounters/[id]/page.tsx',
  //     'src/app/characters/[id]/page.tsx',
  //     'src/app/(auth)/reset-password/[token]/page.tsx',
  //   ];

  //   pageFiles.forEach(filePath => {
  //     it(`should use Promise wrapper for params in page component ${filePath}`, () => {
  //       const fullPath = path.join(process.cwd(), filePath);
  //       if (fs.existsSync(fullPath)) {
  //         const content = fs.readFileSync(fullPath, 'utf-8');

  //         // Page components should still use Promise wrapper (this is correct for pages)
  //         expect(content).toMatch(/params:\s*Promise<\s*{\s*(id|token):\s*string\s*}\s*>/);

  //         // Page components should await params
  //         expect(content).toMatch(/await\s+params/);
  //       }
  //     });
  //   });
  // });
});
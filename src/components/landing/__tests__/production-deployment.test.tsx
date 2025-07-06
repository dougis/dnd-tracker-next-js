import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('Production Deployment Configuration', () => {
  describe('Public Assets', () => {
    it('should ensure all feature icons exist in public directory', () => {
      const publicDir = path.join(process.cwd(), 'public', 'features');
      const expectedIcons = [
        'initiative-tracker.svg',
        'hp-management.svg',
        'character-management.svg',
        'encounter-builder.svg',
        'lair-actions.svg',
        'mobile-ready.svg'
      ];

      expectedIcons.forEach(iconFile => {
        const iconPath = path.join(publicDir, iconFile);
        expect(fs.existsSync(iconPath)).toBe(true);
      });
    });

    it('should verify Dockerfile includes public folder in production stage', () => {
      const dockerfilePath = path.join(process.cwd(), 'Dockerfile');
      const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');

      // Check that public folder is copied in production stage
      expect(dockerfileContent).toMatch(/COPY.*--from=build.*\/app\/public.*\.\/public/);
    });
  });
});
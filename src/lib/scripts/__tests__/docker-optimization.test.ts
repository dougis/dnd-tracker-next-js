/**
 * Test cases for Docker optimization and layer caching improvements
 * Following TDD principles - all tests should fail initially until optimizations are implemented
 *
 * Tests verify acceptance criteria from GitHub Issue #314:
 * 1. Restructure Dockerfile to copy package.json and package-lock.json first
 * 2. Copy application code after dependencies are installed
 * 3. Use multi-stage build to create smaller production image
 */

import { readFileSync } from 'fs';
import { join } from 'path';

describe('Docker Optimization Tests', () => {
  const dockerfilePath = join(process.cwd(), 'Dockerfile');
  let dockerfileContent: string;

  beforeAll(() => {
    dockerfileContent = readFileSync(dockerfilePath, 'utf-8');
  });

  describe('Layer Caching Optimization', () => {
    test('should copy package.json and package-lock.json before copying application code', () => {
      const lines = dockerfileContent.split('\n');

      // Find the build stage section
      const buildStageStart = lines.findIndex(line => line.includes('FROM base AS build'));
      expect(buildStageStart).toBeGreaterThan(-1);

      // Find package.json copy line
      const packageJsonCopyIndex = lines.findIndex((line, index) =>
        index > buildStageStart &&
        line.includes('COPY') &&
        line.includes('package.json') &&
        line.includes('package-lock.json')
      );
      expect(packageJsonCopyIndex).toBeGreaterThan(buildStageStart);

      // Find npm ci/install line
      const npmInstallIndex = lines.findIndex((line, index) =>
        index > packageJsonCopyIndex &&
        (line.includes('npm ci') || line.includes('npm install'))
      );
      expect(npmInstallIndex).toBeGreaterThan(packageJsonCopyIndex);

      // Find application code copy line
      const appCodeCopyIndex = lines.findIndex((line, index) =>
        index > npmInstallIndex &&
        line.includes('COPY .') &&
        !line.includes('package')
      );
      expect(appCodeCopyIndex).toBeGreaterThan(npmInstallIndex);

      // Verify order: package.json copy → npm install → app code copy
      expect(packageJsonCopyIndex).toBeLessThan(npmInstallIndex);
      expect(npmInstallIndex).toBeLessThan(appCodeCopyIndex);
    });

    test('should copy only package files in dependency installation layer', () => {
      const lines = dockerfileContent.split('\n');

      // Find the package.json copy line in build stage
      const packageCopyLine = lines.find(line =>
        line.includes('COPY') &&
        line.includes('package.json') &&
        line.includes('package-lock.json')
      );

      expect(packageCopyLine).toBeDefined();
      expect(packageCopyLine).toMatch(/COPY\s+package-lock\.json\s+package\.json\s+\.\//);
    });

    test('should have npm ci for dependency installation to leverage lock file', () => {
      const lines = dockerfileContent.split('\n');

      const npmCiLine = lines.find(line =>
        line.includes('RUN npm ci') &&
        !line.includes('--omit=dev')
      );

      expect(npmCiLine).toBeDefined();
    });
  });

  describe('Multi-Stage Build Optimization', () => {
    test('should have distinct base, build, and production stages', () => {
      const stages = [
        'FROM node:.*-slim AS base',
        'FROM base AS build',
        'FROM base AS production'
      ];

      stages.forEach(stage => {
        expect(dockerfileContent).toMatch(new RegExp(stage, 'm'));
      });
    });

    test('should copy only production dependencies in production stage', () => {
      const lines = dockerfileContent.split('\n');

      // Find production stage
      const productionStageStart = lines.findIndex(line => line.includes('FROM base AS production'));
      expect(productionStageStart).toBeGreaterThan(-1);

      // Find npm ci with --omit=dev in production stage
      const productionNpmCi = lines.findIndex((line, index) =>
        index > productionStageStart &&
        line.includes('npm ci') &&
        line.includes('--omit=dev')
      );
      expect(productionNpmCi).toBeGreaterThan(productionStageStart);
    });

    test('should copy built artifacts from build stage to production stage', () => {
      const lines = dockerfileContent.split('\n');

      // Find production stage
      const productionStageStart = lines.findIndex(line => line.includes('FROM base AS production'));
      expect(productionStageStart).toBeGreaterThan(-1);

      // Find COPY --from=build commands
      const buildCopyCommands = lines.filter((line, index) =>
        index > productionStageStart &&
        line.includes('COPY --from=build')
      );

      expect(buildCopyCommands.length).toBeGreaterThan(0);

      // Should copy .next directory
      const nextCopy = buildCopyCommands.find(line => line.includes('.next'));
      expect(nextCopy).toBeDefined();

      // Should copy public directory
      const publicCopy = buildCopyCommands.find(line => line.includes('public'));
      expect(publicCopy).toBeDefined();
    });

    test('should use non-root user in production stage', () => {
      const lines = dockerfileContent.split('\n');

      // Find production stage
      const productionStageStart = lines.findIndex(line => line.includes('FROM base AS production'));
      expect(productionStageStart).toBeGreaterThan(-1);

      // Should create non-root user
      const createUser = lines.findIndex((line, index) =>
        index > productionStageStart &&
        (line.includes('adduser') || line.includes('useradd'))
      );
      expect(createUser).toBeGreaterThan(productionStageStart);

      // Should switch to non-root user
      const switchUser = lines.findIndex((line, index) =>
        index > createUser &&
        line.includes('USER') &&
        !line.includes('root')
      );
      expect(switchUser).toBeGreaterThan(createUser);
    });
  });

  describe('Build Optimization Best Practices', () => {
    test('should install build dependencies only in build stage', () => {
      const lines = dockerfileContent.split('\n');

      // Find build stage
      const buildStageStart = lines.findIndex(line => line.includes('FROM base AS build'));
      const productionStageStart = lines.findIndex(line => line.includes('FROM base AS production'));

      // Build dependencies should only be in build stage
      const buildDepsInBuild = lines.slice(buildStageStart, productionStageStart).find(line =>
        line.includes('apt-get') &&
        line.includes('build-essential')
      );
      expect(buildDepsInBuild).toBeDefined();

      // No build dependencies in production stage
      const buildDepsInProduction = lines.slice(productionStageStart).find(line =>
        line.includes('apt-get') &&
        line.includes('build-essential')
      );
      expect(buildDepsInProduction).toBeUndefined();
    });

    test('should have health check in production stage', () => {
      const lines = dockerfileContent.split('\n');

      const healthCheck = lines.find(line => line.includes('HEALTHCHECK'));
      expect(healthCheck).toBeDefined();
      expect(healthCheck).toMatch(/HEALTHCHECK.*--interval.*--timeout.*--start-period.*--retries/);
    });

    test('should expose port and set entrypoint in production stage', () => {
      const lines = dockerfileContent.split('\n');

      // Find production stage
      const productionStageStart = lines.findIndex(line => line.includes('FROM base AS production'));
      expect(productionStageStart).toBeGreaterThan(-1);

      // Should expose port
      const exposePort = lines.findIndex((line, index) =>
        index > productionStageStart &&
        line.includes('EXPOSE 3000')
      );
      expect(exposePort).toBeGreaterThan(productionStageStart);

      // Should have entrypoint
      const entrypoint = lines.findIndex((line, index) =>
        index > productionStageStart &&
        line.includes('ENTRYPOINT')
      );
      expect(entrypoint).toBeGreaterThan(productionStageStart);
    });
  });

  describe('Image Size Optimization', () => {
    test('should use slim node image for smaller base size', () => {
      expect(dockerfileContent).toMatch(/FROM\s+node:\$\{NODE_VERSION\}-slim|FROM\s+node:\d+\.\d+\.\d+-slim/);
    });

    test('should clean up apt cache in build stage if using apt-get', () => {
      const lines = dockerfileContent.split('\n');

      const aptGetLines = lines.filter(line => line.includes('apt-get'));
      if (aptGetLines.length > 0) {
        // If apt-get is used, cleanup should be in the same RUN command block
        const hasCleanup = dockerfileContent.includes('rm -rf /var/lib/apt/lists/*') ||
                          dockerfileContent.includes('apt-get clean');
        expect(hasCleanup).toBe(true);
      }
    });

    test('should copy files with proper ownership in production stage', () => {
      const lines = dockerfileContent.split('\n');

      // Find COPY commands with --chown in production stage
      const productionStageStart = lines.findIndex(line => line.includes('FROM base AS production'));
      const copyWithChown = lines.filter((line, index) =>
        index > productionStageStart &&
        line.includes('COPY') &&
        line.includes('--chown')
      );

      expect(copyWithChown.length).toBeGreaterThan(0);
    });
  });

  describe('Security Best Practices', () => {
    test('should run as non-root user in production', () => {
      const lines = dockerfileContent.split('\n');

      // Find USER directive
      const userDirective = lines.find(line => line.startsWith('USER '));
      expect(userDirective).toBeDefined();
      expect(userDirective).not.toMatch(/USER\s+root/);
      expect(userDirective).not.toMatch(/USER\s+0/);
    });

    test('should not copy unnecessary files to production stage', () => {
      const lines = dockerfileContent.split('\n');

      // Find production stage copies
      const productionStageStart = lines.findIndex(line => line.includes('FROM base AS production'));
      const productionCopies = lines.filter((line, index) =>
        index > productionStageStart &&
        line.includes('COPY') &&
        !line.includes('--from=build')
      );

      // Should only copy package files for production dependencies
      productionCopies.forEach(copyLine => {
        expect(copyLine).toMatch(/package.*\.json/);
      });
    });
  });
});
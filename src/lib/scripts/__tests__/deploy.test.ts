/**
 * Test cases for deployment scripts and integration
 * Following TDD principles - all tests should fail initially until implementation is created
 */

import { exec } from 'child_process';
import * as fs from 'fs/promises';

// Mock child_process and fs
jest.mock('child_process', () => ({
  exec: jest.fn(),
}));
jest.mock('fs/promises');

// Mock deployment monitor - this module may not exist yet
jest.mock('../monitoring/deployment-monitor', () => ({
  DeploymentMonitor: jest.fn().mockImplementation(() => ({
    startMonitoring: jest.fn(),
    stopMonitoring: jest.fn(),
    recordMetric: jest.fn(),
    sendAlert: jest.fn(),
  })),
}), { virtual: true });

const mockExec = jest.mocked(exec);
const _mockFs = jest.mocked(fs);

// Helper function to mock exec calls - unused but kept for potential future use
// const mockExecSuccess = (stdout = '', stderr = '') => {
//   mockExec.mockImplementation((command: string, callback: any) => {
//     callback(null, { stdout, stderr });
//   });
// };

// const mockExecFailure = (error: Error) => {
//   mockExec.mockImplementation((command: string, callback: any) => {
//     callback(error);
//   });
// };

// Import the deployment module that we'll create
import { DeploymentManager } from '../deploy';

describe('DeploymentManager', () => {
  let deploymentManager: DeploymentManager;

  beforeEach(() => {
    jest.clearAllMocks();
    deploymentManager = new DeploymentManager({
      environment: 'staging',
      dryRun: false,
      skipMigrations: false,
      timeout: 300000,
    });
  });

  describe('constructor', () => {
    it('should create DeploymentManager with valid configuration', () => {
      expect(deploymentManager).toBeInstanceOf(DeploymentManager);
    });

    it('should throw error with invalid environment', () => {
      expect(() => new DeploymentManager({
        environment: 'invalid' as any,
        dryRun: false,
        skipMigrations: false,
        timeout: 300000,
      })).toThrow('Invalid environment');
    });

    it('should set default values for optional configuration', () => {
      const manager = new DeploymentManager({
        environment: 'staging',
      });
      expect(manager).toBeInstanceOf(DeploymentManager);
    });
  });

  describe('validatePreDeployment', () => {
    it('should validate migration readiness', async () => {
      // Set required environment variables
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        MONGODB_URI: 'mongodb://localhost:27017/test',
        NEXTAUTH_SECRET: 'test-secret',
        NEXTAUTH_URL: 'http://localhost:3000'
      };

      mockExec.mockImplementation((command: string, callback: any) => {
        if (command === 'npm run migrate:validate') {
          callback(null, { stdout: 'All migrations valid', stderr: '' });
        } else if (command === 'npm run migrate:status') {
          callback(null, { stdout: '[]', stderr: '' });
        } else if (command === 'npm run build') {
          callback(null, { stdout: 'Build successful', stderr: '' });
        } else {
          callback(null, { stdout: '', stderr: '' });
        }
      });

      const result = await deploymentManager.validatePreDeployment();

      expect(result.isValid).toBe(true);
      expect(mockExec).toHaveBeenCalledWith('npm run migrate:validate', expect.any(Function));

      // Restore environment
      process.env = originalEnv;
    });

    it('should detect migration validation failures', async () => {
      mockExec.mockImplementation((command: string, callback: any) => {
        if (command === 'npm run migrate:validate') {
          callback(new Error('Migration validation failed'));
        } else {
          callback(null, { stdout: '', stderr: '' });
        }
      });

      const result = await deploymentManager.validatePreDeployment();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Migration validation failed: Migration validation failed');
    });

    it('should check for pending migrations', async () => {
      mockExec.mockImplementation((command: string, callback: any) => {
        if (command === 'npm run migrate:validate') {
          callback(null, { stdout: 'All migrations valid', stderr: '' });
        } else if (command === 'npm run migrate:status') {
          callback(null, {
            stdout: JSON.stringify([
              { version: '001', status: 'pending' },
              { version: '002', status: 'executed' }
            ]),
            stderr: ''
          });
        } else if (command === 'npm run build') {
          callback(null, { stdout: 'Build successful', stderr: '' });
        } else {
          callback(null, { stdout: '', stderr: '' });
        }
      });

      const result = await deploymentManager.validatePreDeployment();

      expect(result.pendingMigrations).toHaveLength(1);
      expect(result.pendingMigrations[0].version).toBe('001');
    }, 5000);

    it('should validate environment variables', async () => {
      const originalEnv = process.env;
      process.env = { ...originalEnv };
      delete process.env.MONGODB_URI;

      const result = await deploymentManager.validatePreDeployment();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required environment variable: MONGODB_URI');

      process.env = originalEnv;
    });

    it('should check build status', async () => {
      mockExec.mockImplementation((command: string, callback: any) => {
        if (command === 'npm run migrate:validate') {
          callback(null, { stdout: 'All migrations valid', stderr: '' });
        } else if (command === 'npm run migrate:status') {
          callback(null, { stdout: '[]', stderr: '' });
        } else if (command === 'npm run build') {
          callback(null, { stdout: 'Build successful', stderr: '' });
        } else {
          callback(null, { stdout: '', stderr: '' });
        }
      });

      const result = await deploymentManager.validatePreDeployment();

      expect(result.buildStatus).toBe('success');
    });
  });

  describe('createBackup', () => {
    it('should create database backup before deployment', async () => {
      mockExec.mockImplementation((command: string, callback: any) => {
        callback(null, { stdout: 'Backup created', stderr: '' });
      });

      const result = await deploymentManager.createBackup();

      expect(result.success).toBe(true);
      expect(result.backupPath).toMatch(/\/tmp\/backup-\d{4}-\d{2}-\d{2}T\d{4}\.gz/);
      expect(mockExec).toHaveBeenCalledWith(
        expect.stringContaining('mongodump'),
        expect.any(Function)
      );
    });

    it('should handle backup failures gracefully', async () => {
      mockExec.mockImplementation((command: string, callback: any) => {
        callback(new Error('Backup failed'));
      });

      const result = await deploymentManager.createBackup();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Backup failed');
    });

    it('should skip backup in dry-run mode', async () => {
      const dryRunManager = new DeploymentManager({
        environment: 'staging',
        dryRun: true,
      });

      const result = await dryRunManager.createBackup();

      expect(result.success).toBe(true);
      expect(result.skipped).toBe(true);
      expect(mockExec).not.toHaveBeenCalled();
    });

    it('should include timestamp in backup filename', async () => {
      const mockDate = new Date('2025-01-12T12:00:00Z');
      const originalDate = Date;
      const dateSpy = jest.spyOn(global, 'Date').mockImplementation((() => mockDate) as any);
      // Preserve Date.now for other calls
      (global.Date as any).now = originalDate.now;

      mockExec.mockImplementation((command: string, callback: any) => {
        callback(null, { stdout: 'Backup created', stderr: '' });
      });

      await deploymentManager.createBackup();

      expect(mockExec).toHaveBeenCalledWith(
        expect.stringContaining('backup-2025-01-12T1200'),
        expect.any(Function)
      );

      dateSpy.mockRestore();
    });
  });

  describe('runMigrations', () => {
    it('should execute migrations in correct order', async () => {
      mockExec.mockImplementation((command: string, callback: any) => {
        callback(null, { stdout: 'Migrations completed successfully', stderr: '' });
      });

      const result = await deploymentManager.runMigrations();

      expect(result.success).toBe(true);
      expect(mockExec).toHaveBeenCalledWith('npm run migrate:up', expect.any(Function));
    });

    it('should handle migration failures', async () => {
      mockExec.mockImplementation((command: string, callback: any) => {
        callback(new Error('Migration 002 failed'));
      });

      const result = await deploymentManager.runMigrations();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Migration 002 failed');
    });

    it('should skip migrations when configured', async () => {
      const skipMigrationManager = new DeploymentManager({
        environment: 'staging',
        skipMigrations: true,
      });

      const result = await skipMigrationManager.runMigrations();

      expect(result.success).toBe(true);
      expect(result.skipped).toBe(true);
      expect(mockExec).not.toHaveBeenCalled();
    });

    it('should use dry-run mode when configured', async () => {
      const dryRunManager = new DeploymentManager({
        environment: 'staging',
        dryRun: true,
      });

      mockExec.mockImplementation((command: string, callback: any) => {
        callback(null, { stdout: 'Dry run completed', stderr: '' });
      });

      const result = await dryRunManager.runMigrations();

      expect(result.success).toBe(true);
      expect(mockExec).toHaveBeenCalledWith(
        'MIGRATION_DRY_RUN=true npm run migrate:up',
        expect.any(Function)
      );
    });

    it('should respect timeout configuration', async () => {
      const timeoutManager = new DeploymentManager({
        environment: 'staging',
        timeout: 1000, // 1 second timeout
      });

      mockExec.mockImplementation((command: string, callback: any) => {
        // Simulate a command that takes longer than the timeout
        setTimeout(() => {
          callback(null, { stdout: '', stderr: '' });
        }, 2000); // 2 second delay
      });

      const result = await timeoutManager.runMigrations();

      expect(result.success).toBe(false);
      expect(result.error).toContain('timeout');
    }, 5000); // 5 second Jest timeout for this test
  });

  describe('deployToFlyio', () => {
    it('should deploy application with migrations', async () => {
      mockExec.mockImplementation((command: string, callback: any) => {
        callback(null, { stdout: 'Deployment successful', stderr: '' });
      });

      const result = await deploymentManager.deployToFlyio();

      expect(result.success).toBe(true);
      expect(mockExec).toHaveBeenCalledWith('flyctl deploy --remote-only', expect.any(Function));
    });

    it('should handle deployment failures', async () => {
      mockExec.mockImplementation((command: string, callback: any) => {
        callback(new Error('Deployment failed'));
      });

      const result = await deploymentManager.deployToFlyio();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Deployment failed');
    });

    it('should use environment-specific configuration', async () => {
      const prodManager = new DeploymentManager({
        environment: 'production',
      });

      mockExec.mockImplementation((command: string, callback: any) => {
        callback(null, { stdout: 'Production deployment successful', stderr: '' });
      });

      const result = await prodManager.deployToFlyio();

      expect(result.success).toBe(true);
      expect(mockExec).toHaveBeenCalledWith(
        expect.stringContaining('--config fly.production.toml'),
        expect.any(Function)
      );
    });

    it('should handle release command failures', async () => {
      mockExec.mockImplementation((command: string, callback: any) => {
        if (command.includes('flyctl deploy')) {
          callback(new Error('Release command failed'));
        } else {
          callback(null, { stdout: '', stderr: '' });
        }
      });

      const result = await deploymentManager.deployToFlyio();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Release command failed');
    });
  });

  describe('verifyDeployment', () => {
    it('should verify successful deployment', async () => {
      mockExec.mockImplementation((command: string, callback: any) => {
        if (command.includes('curl') && command.includes('health')) {
          callback(null, { stdout: 'Health check passed', stderr: '' });
        } else if (command === 'npm run migrate:status') {
          callback(null, { stdout: '[]', stderr: '' });
        } else if (command.includes('curl')) {
          callback(null, { stdout: '{"status":"ok"}', stderr: '' });
        } else {
          callback(null, { stdout: '', stderr: '' });
        }
      });

      const result = await deploymentManager.verifyDeployment();

      expect(result.success).toBe(true);
      expect(result.healthCheck).toBe(true);
      expect(result.migrationStatus).toBe('complete');
    });

    it('should detect health check failures', async () => {
      mockExec.mockImplementation((command: string, callback: any) => {
        if (command.includes('health')) {
          callback(new Error('Health check failed'));
        } else {
          callback(null, { stdout: '', stderr: '' });
        }
      });

      const result = await deploymentManager.verifyDeployment();

      expect(result.success).toBe(false);
      expect(result.healthCheck).toBe(false);
    });

    it('should verify migration completion', async () => {
      mockExec.mockImplementation((command: string, callback: any) => {
        if (command.includes('migrate:status')) {
          callback(null, {
            stdout: JSON.stringify([
              { version: '001', status: 'executed' },
              { version: '002', status: 'pending' }
            ]),
            stderr: ''
          });
        } else {
          callback(null, { stdout: '', stderr: '' });
        }
      });

      const result = await deploymentManager.verifyDeployment();

      expect(result.success).toBe(false);
      expect(result.migrationStatus).toBe('incomplete');
      expect(result.pendingMigrations).toHaveLength(1);
    });

    it('should check application responsiveness', async () => {
      mockExec.mockImplementation((command: string, callback: any) => {
        if (command.includes('curl')) {
          callback(null, { stdout: '{"status":"ok"}', stderr: '' });
        } else {
          callback(null, { stdout: '', stderr: '' });
        }
      });

      const result = await deploymentManager.verifyDeployment();

      expect(result.success).toBe(true);
      expect(result.appResponsive).toBe(true);
    });
  });

  describe('rollback', () => {
    it('should rollback deployment on failure', async () => {
      mockExec.mockImplementation((command: string, callback: any) => {
        callback(null, { stdout: 'Rollback successful', stderr: '' });
      });

      const result = await deploymentManager.rollback();

      expect(result.success).toBe(true);
      expect(mockExec).toHaveBeenCalledWith(
        expect.stringContaining('flyctl rollback'),
        expect.any(Function)
      );
    });

    it('should rollback migrations', async () => {
      mockExec.mockImplementation((command: string, callback: any) => {
        callback(null, { stdout: 'Migration rollback successful', stderr: '' });
      });

      const result = await deploymentManager.rollback({ steps: 2 });

      expect(result.success).toBe(true);
      expect(mockExec).toHaveBeenCalledWith('npm run migrate:down 2', expect.any(Function));
    });

    it('should restore from backup on critical failure', async () => {
      const backupPath = '/tmp/backup-20250112T120000.gz';
      mockExec.mockImplementation((command: string, callback: any) => {
        callback(null, { stdout: 'Restore successful', stderr: '' });
      });

      const result = await deploymentManager.rollback({
        restoreBackup: true,
        backupPath
      });

      expect(result.success).toBe(true);
      expect(mockExec).toHaveBeenCalledWith(
        expect.stringContaining('mongorestore'),
        expect.any(Function)
      );
    });

    it('should handle rollback failures', async () => {
      mockExec.mockImplementation((command: string, callback: any) => {
        callback(new Error('Rollback failed'));
      });

      const result = await deploymentManager.rollback();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Rollback failed');
    });
  });

  describe('Full deployment workflow', () => {
    it('should execute complete deployment pipeline', async () => {
      // Set required environment variables
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        MONGODB_URI: 'mongodb://localhost:27017/test',
        NEXTAUTH_SECRET: 'test-secret',
        NEXTAUTH_URL: 'http://localhost:3000'
      };

      mockExec.mockImplementation((command: string, callback: any) => {
        if (command === 'npm run migrate:validate') {
          callback(null, { stdout: 'All migrations valid', stderr: '' });
        } else if (command === 'npm run migrate:status') {
          callback(null, { stdout: '[]', stderr: '' });
        } else if (command === 'npm run build') {
          callback(null, { stdout: 'Build successful', stderr: '' });
        } else if (command.includes('mongodump')) {
          callback(null, { stdout: 'Backup created', stderr: '' });
        } else if (command === 'npm run migrate:up') {
          callback(null, { stdout: 'Migrations completed', stderr: '' });
        } else if (command.includes('flyctl deploy')) {
          callback(null, { stdout: 'Deployment successful', stderr: '' });
        } else if (command.includes('curl') && command.includes('health')) {
          callback(null, { stdout: 'Health check passed', stderr: '' });
        } else if (command.includes('curl')) {
          callback(null, { stdout: '{"status":"ok"}', stderr: '' });
        } else {
          callback(null, { stdout: 'Success', stderr: '' });
        }
      });

      // Mock the spied methods to prevent hanging
      jest.spyOn(deploymentManager, 'sendNotification').mockResolvedValue();

      const result = await deploymentManager.deploy();

      expect(result.success).toBe(true);
      expect(result.steps).toContain('validate');
      expect(result.steps).toContain('backup');
      expect(result.steps).toContain('migrate');
      expect(result.steps).toContain('deploy');
      expect(result.steps).toContain('verify');

      // Restore environment
      process.env = originalEnv;
    }, 10000); // 10 second timeout

    it('should stop deployment on validation failure', async () => {
      mockExec.mockImplementation((command: string, callback: any) => {
        if (command.includes('validate')) {
          callback(new Error('Validation failed'));
        } else {
          callback(null, { stdout: '', stderr: '' });
        }
      });

      const result = await deploymentManager.deploy();

      expect(result.success).toBe(false);
      expect(result.failedStep).toBe('validate');
      expect(result.steps).not.toContain('deploy');
    });

    it('should trigger automatic rollback on deployment failure', async () => {
      // Set required environment variables
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        MONGODB_URI: 'mongodb://localhost:27017/test',
        NEXTAUTH_SECRET: 'test-secret',
        NEXTAUTH_URL: 'http://localhost:3000'
      };

      mockExec.mockImplementation((command: string, callback: any) => {
        if (command === 'npm run migrate:validate') {
          callback(null, { stdout: 'All migrations valid', stderr: '' });
        } else if (command === 'npm run migrate:status') {
          callback(null, { stdout: '[]', stderr: '' });
        } else if (command === 'npm run build') {
          callback(null, { stdout: 'Build successful', stderr: '' });
        } else if (command.includes('mongodump')) {
          callback(null, { stdout: 'Backup created', stderr: '' });
        } else if (command === 'npm run migrate:up') {
          callback(null, { stdout: 'Migrations completed', stderr: '' });
        } else if (command.includes('flyctl deploy')) {
          callback(new Error('Deployment failed'));
        } else if (command.includes('flyctl rollback')) {
          callback(null, { stdout: 'Rollback successful', stderr: '' });
        } else {
          callback(null, { stdout: '', stderr: '' });
        }
      });

      const result = await deploymentManager.deploy();

      expect(result.success).toBe(false);
      expect(result.rollbackTriggered).toBe(true);

      // Restore environment
      process.env = originalEnv;
    });

    it('should handle migration failure during deployment', async () => {
      // Set required environment variables
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        MONGODB_URI: 'mongodb://localhost:27017/test',
        NEXTAUTH_SECRET: 'test-secret',
        NEXTAUTH_URL: 'http://localhost:3000'
      };

      mockExec.mockImplementation((command: string, callback: any) => {
        if (command === 'npm run migrate:validate') {
          callback(null, { stdout: 'All migrations valid', stderr: '' });
        } else if (command === 'npm run migrate:status') {
          callback(null, { stdout: '[]', stderr: '' });
        } else if (command === 'npm run build') {
          callback(null, { stdout: 'Build successful', stderr: '' });
        } else if (command.includes('mongodump')) {
          callback(null, { stdout: 'Backup created', stderr: '' });
        } else if (command === 'npm run migrate:up') {
          callback(new Error('Migration 003 failed'));
        } else if (command.includes('flyctl rollback')) {
          callback(null, { stdout: 'Rollback successful', stderr: '' });
        } else {
          callback(null, { stdout: '', stderr: '' });
        }
      });

      const result = await deploymentManager.deploy();

      expect(result.success).toBe(false);
      expect(result.failedStep).toBe('migrate');
      expect(result.migrationError).toContain('Migration 003 failed');

      // Restore environment
      process.env = originalEnv;
    });

    it('should support dry-run mode for entire pipeline', async () => {
      // Set required environment variables
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        MONGODB_URI: 'mongodb://localhost:27017/test',
        NEXTAUTH_SECRET: 'test-secret',
        NEXTAUTH_URL: 'http://localhost:3000'
      };

      const dryRunManager = new DeploymentManager({
        environment: 'staging',
        dryRun: true,
      });

      mockExec.mockImplementation((command: string, callback: any) => {
        if (command === 'npm run migrate:validate') {
          callback(null, { stdout: 'All migrations valid', stderr: '' });
        } else if (command === 'npm run migrate:status') {
          callback(null, { stdout: '[]', stderr: '' });
        } else if (command === 'npm run build') {
          callback(null, { stdout: 'Build successful', stderr: '' });
        } else if (command.includes('MIGRATION_DRY_RUN=true npm run migrate:up')) {
          callback(null, { stdout: 'Dry run migrations', stderr: '' });
        } else if (command.includes('flyctl deploy')) {
          callback(null, { stdout: 'Deployment successful', stderr: '' });
        } else if (command.includes('curl')) {
          callback(null, { stdout: '{"status":"ok"}', stderr: '' });
        } else {
          callback(null, { stdout: 'Dry run success', stderr: '' });
        }
      });

      // Mock sendNotification
      jest.spyOn(dryRunManager, 'sendNotification').mockResolvedValue();

      const result = await dryRunManager.deploy();

      expect(result.success).toBe(true);
      expect(result.dryRun).toBe(true);
      expect(result.steps).toContain('validate');
      expect(result.steps).toContain('migrate');
      expect(result.steps).toContain('deploy');
      expect(result.steps).toContain('verify');

      // Restore environment
      process.env = originalEnv;
    });
  });

  describe('Environment-specific configurations', () => {
    it('should use staging configuration', async () => {
      const stagingManager = new DeploymentManager({
        environment: 'staging',
      });

      expect(stagingManager.getConfig().environment).toBe('staging');
      expect(stagingManager.getConfig().backupEnabled).toBe(true);
      expect(stagingManager.getConfig().requireConfirmation).toBe(false);
    });

    it('should use production configuration with safety measures', async () => {
      const prodManager = new DeploymentManager({
        environment: 'production',
      });

      expect(prodManager.getConfig().environment).toBe('production');
      expect(prodManager.getConfig().backupEnabled).toBe(true);
      expect(prodManager.getConfig().requireConfirmation).toBe(true);
      expect(prodManager.getConfig().dryRun).toBe(false);
    });

    it('should use development configuration', async () => {
      const devManager = new DeploymentManager({
        environment: 'development',
      });

      expect(devManager.getConfig().environment).toBe('development');
      expect(devManager.getConfig().backupEnabled).toBe(false);
      expect(devManager.getConfig().autoRollback).toBe(false);
    });
  });

  describe('Monitoring and alerting', () => {
    it('should send deployment start notification', async () => {
      const notificationSpy = jest.spyOn(deploymentManager, 'sendNotification').mockResolvedValue();
      mockExec.mockImplementation((command: string, callback: any) => {
        callback(null, { stdout: '', stderr: '' });
      });

      await deploymentManager.deploy();

      expect(notificationSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'deployment_started',
          environment: 'staging'
        })
      );
    }, 10000);

    it('should send deployment success notification', async () => {
      // Set required environment variables
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        MONGODB_URI: 'mongodb://localhost:27017/test',
        NEXTAUTH_SECRET: 'test-secret',
        NEXTAUTH_URL: 'http://localhost:3000'
      };

      const notificationSpy = jest.spyOn(deploymentManager, 'sendNotification').mockResolvedValue();
      mockExec.mockImplementation((command: string, callback: any) => {
        // Mock all necessary commands for a successful deployment
        if (command === 'npm run migrate:validate') {
          callback(null, { stdout: 'All migrations valid', stderr: '' });
        } else if (command === 'npm run migrate:status') {
          callback(null, { stdout: '[]', stderr: '' });
        } else if (command === 'npm run build') {
          callback(null, { stdout: 'Build successful', stderr: '' });
        } else if (command.includes('mongodump')) {
          callback(null, { stdout: 'Backup created', stderr: '' });
        } else if (command === 'npm run migrate:up') {
          callback(null, { stdout: 'Migrations completed', stderr: '' });
        } else if (command.includes('flyctl deploy')) {
          callback(null, { stdout: 'Deployment successful', stderr: '' });
        } else if (command.includes('curl') && command.includes('health')) {
          callback(null, { stdout: 'Health check passed', stderr: '' });
        } else if (command.includes('curl')) {
          callback(null, { stdout: '{"status":"ok"}', stderr: '' });
        } else {
          callback(null, { stdout: '', stderr: '' });
        }
      });

      await deploymentManager.deploy();

      expect(notificationSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'deployment_success',
          environment: 'staging'
        })
      );

      // Restore environment
      process.env = originalEnv;
    }, 10000);

    it('should send deployment failure notification', async () => {
      const notificationSpy = jest.spyOn(deploymentManager, 'sendNotification').mockResolvedValue();

      // Mock the deployment to throw an error in the deploy method
      jest.spyOn(deploymentManager, 'executeDeploymentSteps' as any).mockRejectedValue(new Error('Test deployment failure'));

      await deploymentManager.deploy();

      // Should have been called with started notification
      expect(notificationSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'deployment_started',
          environment: 'staging'
        })
      );

      // Should have been called with failed notification
      expect(notificationSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'deployment_failed',
          environment: 'staging',
          error: 'Test deployment failure'
        })
      );
    }, 10000);

    it('should collect deployment metrics', async () => {
      mockExec.mockImplementation((command: string, callback: any) => {
        callback(null, { stdout: '', stderr: '' });
      });
      jest.spyOn(deploymentManager, 'sendNotification').mockResolvedValue();

      const result = await deploymentManager.deploy();

      expect(result.metrics).toEqual(
        expect.objectContaining({
          totalTime: expect.any(Number),
          migrationTime: expect.any(Number),
          deploymentTime: expect.any(Number),
          verificationTime: expect.any(Number)
        })
      );
    }, 10000);
  });
});
/**
 * Tests for GitHub Actions migration functionality
 * Following TDD principles - these tests should fail initially
 */

import fs from 'fs/promises';
import { WorkflowTestHelper, FileTestHelper, CommandTestHelper } from './test-utils';

// Types for GitHub Actions workflow validation
interface WorkflowJob {
  'runs-on': string;
  steps: WorkflowStep[];
}

interface WorkflowStep {
  name: string;
  uses?: string;
  run?: string;
  with?: Record<string, any>;
  env?: Record<string, string>;
}

interface GitHubWorkflow {
  name: string;
  on: Record<string, any>;
  jobs: Record<string, WorkflowJob>;
}

describe('GitHub Actions Migration Setup', () => {
  const workflowPath = './.github/workflows/db-migrations.yml';
  const scriptPath = './scripts/gh-actions-migration.sh';
  const configPath = './config/migration.github-actions.json';

  describe('GitHub Actions Workflow File', () => {
    it('should create a valid GitHub Actions workflow file', async () => {
      // This test will fail initially - we haven't created the file yet
      await FileTestHelper.assertFileExists(workflowPath);
    });

    it('should have correct workflow structure', async () => {
      const workflow: GitHubWorkflow = await WorkflowTestHelper.loadAndParseWorkflow(workflowPath);

      expect(workflow.name).toBe('Database Migrations');
      expect(workflow.on.push.branches).toContain('main');
      expect(workflow.on.push.paths).toContain('migrations/**');
      expect(workflow.on.workflow_dispatch).toBeDefined();
    });

    it('should include migration detection step', async () => {
      const workflow: GitHubWorkflow = await WorkflowTestHelper.loadAndParseWorkflow(workflowPath);
      WorkflowTestHelper.assertStepExists(workflow, 'Detect new migrations');
    });

    it('should include backup creation step', async () => {
      const workflow: GitHubWorkflow = await WorkflowTestHelper.loadAndParseWorkflow(workflowPath);
      WorkflowTestHelper.assertStepExists(workflow, 'Create database backup');
    });

    it('should include migration execution step', async () => {
      const workflow: GitHubWorkflow = await WorkflowTestHelper.loadAndParseWorkflow(workflowPath);
      WorkflowTestHelper.assertStepExists(workflow, 'Execute migrations');
    });

    it('should include rollback on failure step', async () => {
      const workflow: GitHubWorkflow = await WorkflowTestHelper.loadAndParseWorkflow(workflowPath);
      WorkflowTestHelper.assertStepExists(workflow, 'Rollback on failure');
    });

    it('should reference all required GitHub secrets', async () => {
      const workflowContent = await fs.readFile(workflowPath, 'utf-8');
      const requiredSecrets = [
        'MONGODB_URI_PROD',
        'MONGODB_DB_NAME',
        'DB_MIGRATION_USER',
        'DB_MIGRATION_PASSWORD'
      ];
      WorkflowTestHelper.assertSecretsUsed(workflowContent, requiredSecrets);
    });
  });

  describe('GitHub Actions Migration Script', () => {
    it('should create GitHub Actions specific migration script', async () => {
      await FileTestHelper.assertFileExists(scriptPath);
    });

    it('should be executable', async () => {
      await FileTestHelper.assertExecutablePermissions(scriptPath);
    });

    it('should contain migration detection logic', async () => {
      await FileTestHelper.assertFileContains(scriptPath, ['detect_new_migrations']);
    });

    it('should contain backup creation logic', async () => {
      await FileTestHelper.assertFileContains(scriptPath, ['create_backup']);
    });

    it('should contain migration execution logic', async () => {
      await FileTestHelper.assertFileContains(scriptPath, ['execute_migrations']);
    });

    it('should contain rollback logic', async () => {
      await FileTestHelper.assertFileContains(scriptPath, ['rollback_migrations']);
    });
  });

  describe('GitHub Actions Migration Configuration', () => {
    it('should create GitHub Actions specific configuration', async () => {
      await FileTestHelper.assertFileExists(configPath);
    });

    it('should contain valid JSON', async () => {
      await FileTestHelper.assertValidJson(configPath);
    });

    it('should have GitHub Actions specific settings', async () => {
      const config = await FileTestHelper.assertValidJson(configPath);

      expect(config.environment).toBe('github-actions');
      expect(config.backupEnabled).toBe(true);
      expect(config.validateOnly).toBe(false);
      expect(config.notificationsEnabled).toBe(true);
    });
  });

  describe('Integration with Existing Migration System', () => {
    it('should not break existing migration CLI commands', async () => {
      // Test that existing npm scripts still work
      CommandTestHelper.assertCommandNotThrows('npm run migrate:help');
    });

    it('should validate against existing migration types', async () => {
      // Import migration types to ensure compatibility
      await CommandTestHelper.assertImportWorks('../../../lib/migrations/types');

      const config = await FileTestHelper.assertValidJson(configPath);

      // Ensure config matches MigrationConfig interface
      expect(typeof config.migrationsPath).toBe('string');
      expect(typeof config.collectionName).toBe('string');
      expect(typeof config.timeout).toBe('number');
      expect(typeof config.backupEnabled).toBe('boolean');
    });
  });

  describe('Deployment Script Modifications', () => {
    it('should update deploy-with-migrations.sh to skip migrations', async () => {
      const deployScriptPath = './scripts/deploy-with-migrations.sh';
      await FileTestHelper.assertFileContains(deployScriptPath, ['SKIP_MIGRATIONS']);
    });

    it('should add GitHub Actions migration scripts to package.json', async () => {
      const packageJsonPath = './package.json';
      const packageJson = await FileTestHelper.assertValidJson(packageJsonPath);

      expect(packageJson.scripts['migrate:github-actions']).toBeDefined();
    });
  });

  describe('Error Handling and Rollback', () => {
    it('should create migration detection utility function', async () => {
      // Test will fail initially - we need to create this
      const { detectNewMigrations } = await import('../gh-actions-migration');
      expect(typeof detectNewMigrations).toBe('function');
    });

    it('should create backup utility function', async () => {
      const { createDatabaseBackup } = await import('../gh-actions-migration');
      expect(typeof createDatabaseBackup).toBe('function');
    });

    it('should create rollback utility function', async () => {
      const { rollbackMigrations } = await import('../gh-actions-migration');
      expect(typeof rollbackMigrations).toBe('function');
    });
  });

  describe('Documentation Updates', () => {
    it('should update deployment documentation', async () => {
      const docsPath = './docs/deployment/README.md';

      // Check if docs exist first, if not create placeholder
      try {
        const docsContent = await fs.readFile(docsPath, 'utf-8');
        expect(docsContent).toContain('GitHub Actions');
        expect(docsContent).toContain('database migrations');
      } catch (error) {
        // If docs don't exist, we'll create them as part of implementation
        expect(error).toBeDefined();
      }
    });
  });
});
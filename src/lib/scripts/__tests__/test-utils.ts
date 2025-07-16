/**
 * Test utilities for GitHub Actions migration tests
 * Reduces code duplication across test files
 */

import fs from 'fs/promises';
import { execSync } from 'child_process';

/**
 * Common workflow file operations
 */
export class WorkflowTestHelper {
  static async loadAndParseWorkflow(workflowPath: string) {
    const workflowContent = await fs.readFile(workflowPath, 'utf-8');
    return require('js-yaml').load(workflowContent);
  }

  static findStepByName(workflow: any, stepName: string) {
    const migrationJob = workflow.jobs['migrate'];
    return migrationJob.steps.find((step: any) =>
      step.name.includes(stepName)
    );
  }

  static assertStepExists(workflow: any, stepName: string) {
    const step = this.findStepByName(workflow, stepName);
    expect(step).toBeDefined();
    return step;
  }

  static assertSecretsUsed(workflowContent: string, secrets: string[]) {
    secrets.forEach(secret => {
      expect(workflowContent).toContain(secret);
    });
  }
}

/**
 * File validation helpers
 */
export class FileTestHelper {
  static async assertFileExists(filePath: string) {
    await expect(fs.access(filePath)).resolves.not.toThrow();
  }

  static async assertFileContains(filePath: string, content: string[]) {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    content.forEach(item => {
      expect(fileContent).toContain(item);
    });
    return fileContent;
  }

  static async assertValidJson(filePath: string) {
    const content = await fs.readFile(filePath, 'utf-8');
    expect(() => JSON.parse(content)).not.toThrow();
    return JSON.parse(content);
  }

  static async assertExecutablePermissions(filePath: string) {
    const stats = await fs.stat(filePath);
    expect(stats.mode & 0o111).toBeTruthy();
  }
}

/**
 * Command execution test helpers
 */
export class CommandTestHelper {
  static assertCommandNotThrows(command: string) {
    // Validate command to prevent injection - allow common npm/CLI characters
    if (!/^[a-zA-Z0-9\s\-\.\/:]+$/.test(command)) {
      throw new Error('Invalid command format');
    }
    expect(() => {
      execSync(command, { stdio: 'pipe' });
    }).not.toThrow();
  }

  static async assertImportWorks(modulePath: string) {
    await expect(import(modulePath)).resolves.toBeDefined();
  }
}

/**
 * Environment and mock setup helpers
 */
export class MockTestHelper {
  static setupTestEnvironment() {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
    process.env.MONGODB_DB_NAME = 'testdb';
  }

  static cleanupTestEnvironment() {
    delete process.env.MONGODB_URI;
    delete process.env.MONGODB_DB_NAME;
  }

  static setupFilesystemMocks(mockedFs: any) {
    mockedFs.mkdir = jest.fn().mockResolvedValue(undefined);
    mockedFs.stat = jest.fn().mockResolvedValue({ size: 1024 } as any);
    mockedFs.access = jest.fn().mockResolvedValue(undefined);
  }

  static setupMongoDatabaseMocks(mocks: {
    mockToArray: any;
    mockFind: any;
    mockCollection: any;
    mockDb: any;
    mockConnect: any;
    mockClose: any;
  }) {
    // Reset mocks with preserved implementations
    mocks.mockConnect.mockReset().mockResolvedValue(undefined);
    mocks.mockClose.mockReset();
    mocks.mockDb.mockReset();
    mocks.mockCollection.mockReset();
    mocks.mockFind.mockReset();
    mocks.mockToArray.mockReset();

    // Set up default database mock chain with empty data as default
    mocks.mockToArray.mockResolvedValue([]);
    mocks.mockFind.mockReturnValue({ toArray: mocks.mockToArray });
    mocks.mockCollection.mockReturnValue({ find: mocks.mockFind });
    mocks.mockDb.mockReturnValue({ collection: mocks.mockCollection });
  }

  static setupDatabaseMock(mockToArray: any, migrationData: Array<{ version: string }>) {
    mockToArray.mockResolvedValue(migrationData);
  }

  static setupFileSystemMock(mockedFs: any, fileNames: string[]) {
    mockedFs.readdir = jest.fn().mockResolvedValue(fileNames as any);
  }
}

/**
 * Assertion helpers for command execution
 */
export class ExecutionAssertionHelper {
  static assertExecSyncCalledWithCommand(mockedExecSync: any, commandPattern: string) {
    expect(mockedExecSync).toHaveBeenCalledWith(
      expect.stringContaining(commandPattern),
      expect.any(Object)
    );
  }

  static assertExecSyncCalledWithEnv(mockedExecSync: any, envVars: Record<string, string>) {
    expect(mockedExecSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        env: expect.objectContaining(envVars)
      })
    );
  }
}
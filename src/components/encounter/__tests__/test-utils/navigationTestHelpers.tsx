import React from 'react';
import { jest } from '@jest/globals';

// Shared mock for Next.js router
export const mockPush = jest.fn();

export const createRouterMock = () => ({
  useRouter: () => ({
    push: mockPush,
  }),
});

// Shared mock setup for navigation tests
export const setupNavigationMocks = () => {
  // Clear all mocks before each test
  jest.clearAllMocks();

  // Mock next/navigation
  jest.mock('next/navigation', () => createRouterMock());
};

// Common beforeEach for navigation tests
export const commonNavigationBeforeEach = () => {
  jest.clearAllMocks();
};

// Common mock component patterns
export const createMockCardHeader = () => ({
  CardHeader: ({ encounter, onSelect, isSelected }: any) => (
    <div data-testid="card-header">
      <h3>{encounter.name}</h3>
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onSelect?.(encounter.id)}
        data-checkbox="true"
      />
      <div data-actions="true">
        <button>Action Button</button>
      </div>
    </div>
  ),
});

export const createMockCardContent = () => ({
  CardContent: ({ encounter }: any) => (
    <div data-testid="card-content">
      <p>{encounter.name}</p>
      <p>{encounter.description}</p>
    </div>
  ),
});

export const createMockTableCells = () => ({
  SelectionCell: ({ encounter, isSelected, onSelect }: any) => (
    <td data-testid="selection-cell">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onSelect(encounter.id)}
        data-checkbox="true"
      />
    </td>
  ),
  NameCell: ({ encounter }: any) => <td data-testid="name-cell">{encounter.name}</td>,
  StatusCell: ({ encounter }: any) => <td data-testid="status-cell">{encounter.status}</td>,
  DifficultyCell: ({ encounter }: any) => <td data-testid="difficulty-cell">{encounter.difficulty}</td>,
  ParticipantsCell: ({ encounter }: any) => <td data-testid="participants-cell">{encounter.participants?.length || 0}</td>,
  TargetLevelCell: ({ encounter }: any) => <td data-testid="target-level-cell">{encounter.targetLevel}</td>,
  UpdatedCell: ({ encounter }: any) => <td data-testid="updated-cell">{encounter.updatedAt}</td>,
  ActionsCell: ({ _encounter }: any) => (
    <td data-testid="actions-cell">
      <button data-actions="true">Actions</button>
    </td>
  ),
});

// Common test data patterns
export const createNavigationTestEncounter = (overrides = {}) => ({
  id: 'nav-test-encounter-123',
  name: 'Navigation Test Encounter',
  description: 'Test encounter for navigation',
  status: 'draft',
  difficulty: 'Medium',
  targetLevel: 5,
  participants: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});
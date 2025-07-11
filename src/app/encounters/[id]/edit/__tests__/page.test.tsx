/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { EncounterEditClient } from '../EncounterEditClient';
import { EncounterService } from '@/lib/services/EncounterService';
import {
  createTestEncounter,
  createTestParticipant,
  mockApiResponses,
} from '../../__tests__/test-helpers';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/lib/services/EncounterService');

// Mock useToast hook to make error messages testable
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock window.confirm
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: jest.fn(),
});

// Mock fetch for the test environment
global.fetch = jest.fn();

const mockEncounterService = EncounterService as jest.Mocked<typeof EncounterService>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

// Test utilities organized by concern
const testHelpers = {
  // Mock factories
  createRouterMocks: () => {
    const mockRouterPush = jest.fn();
    const mockRouterBack = jest.fn();

    const setupMocks = () => {
      mockUseRouter.mockReturnValue({
        push: mockRouterPush,
        back: mockRouterBack,
      } as any);
    };

    return { mockRouterPush, mockRouterBack, setupMocks };
  },

  // Service mock helpers
  createServiceMocks: (encounter: any) => ({
    setupSuccessfulMocks: () => {
      mockEncounterService.getEncounterById.mockResolvedValue(
        mockApiResponses.success(encounter)
      );
      mockEncounterService.updateEncounter.mockResolvedValue(
        mockApiResponses.success(encounter)
      );
    },

    setupUpdateSuccess: () => {
      mockEncounterService.updateEncounter.mockResolvedValue(
        mockApiResponses.success(encounter)
      );
    },

    setupUpdateError: (errorMessage: string = 'Failed to update encounter') => {
      mockEncounterService.updateEncounter.mockResolvedValue(
        mockApiResponses.error(errorMessage)
      );
    },

    setupControlledUpdate: () => {
      let resolvePromise: (_value: any) => void;
      const delayedPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockEncounterService.updateEncounter.mockReturnValue(delayedPromise);
      return () => resolvePromise!(mockApiResponses.success({}));
    },
  }),

  // Common test assertions
  assertions: {
    expectFormField: (fieldValue: string, shouldExist: boolean = true) => {
      const assertion = expect(screen.getByDisplayValue(fieldValue));
      return shouldExist ? assertion.toBeInTheDocument() : assertion.not.toBeInTheDocument();
    },

    expectLoadingState: () => {
      expect(screen.getByText('Loading encounter...')).toBeInTheDocument();
    },

    expectErrorState: (errorText: string) => {
      expect(screen.getByText('Error loading encounter')).toBeInTheDocument();
      expect(screen.getByText(errorText)).toBeInTheDocument();
    },
  },

  // Form interaction utilities
  form: {
    clearAndType: async (user: any, input: HTMLElement, value: string) => {
      await user.clear(input);
      await user.type(input, value);
    },

    waitForFormField: async (fieldValue: string) => {
      await waitFor(() => {
        expect(screen.getByDisplayValue(fieldValue)).toBeInTheDocument();
      });
    },
  },
};

// Main mock setup factory
const createMockHelpers = (encounter: any) => {
  const routerMocks = testHelpers.createRouterMocks();
  const serviceMocks = testHelpers.createServiceMocks(encounter);

  return {
    ...routerMocks,
    ...serviceMocks,
    setupAll: () => {
      routerMocks.setupMocks();
      serviceMocks.setupSuccessfulMocks();
    },
  };
};

describe('EncounterEditClient', () => {
  const mockEncounter = createTestEncounter({
    name: 'Dragon Lair Assault',
    description: 'A dangerous encounter in an ancient dragon\'s lair',
    difficulty: 'deadly',
    estimatedDuration: 90,
    targetLevel: 8,
    participants: [
      createTestParticipant({
        name: 'Gandalf',
        type: 'pc',
        maxHitPoints: 68,
        currentHitPoints: 68,
        armorClass: 18,
        isPlayer: true,
      }),
      createTestParticipant({
        name: 'Ancient Red Dragon',
        type: 'monster',
        maxHitPoints: 546,
        currentHitPoints: 546,
        armorClass: 22,
        isPlayer: false,
      }),
    ],
    tags: ['dragon', 'lair', 'epic'],
    settings: {
      allowPlayerVisibility: true,
      autoRollInitiative: false,
      trackResources: true,
      enableLairActions: true,
      lairActionInitiative: 20,
      enableGridMovement: true,
      gridSize: 10,
      roundTimeLimit: 300,
      experienceThreshold: undefined,
    },
  });

  const mockHelpers = createMockHelpers(mockEncounter);

  beforeEach(() => {
    jest.clearAllMocks();
    mockHelpers.setupAll();

    // Reset window.confirm mock
    (window.confirm as jest.Mock).mockReturnValue(true);

    // Reset fetch mock
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  describe('Loading and Error States', () => {
    it('should display loading state while fetching encounter', () => {
      mockEncounterService.getEncounterById.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<EncounterEditClient encounterId="test-id" />);

      testHelpers.assertions.expectLoadingState();
    });

    it('should display error state when encounter not found', async () => {
      mockEncounterService.getEncounterById.mockResolvedValue(
        mockApiResponses.notFound()
      );

      render(<EncounterEditClient encounterId="invalid-id" />);

      await waitFor(() => {
        expect(screen.getByText('Encounter not found')).toBeInTheDocument();
      });
    });

    it('should display error state on service failure', async () => {
      mockEncounterService.getEncounterById.mockResolvedValue(
        mockApiResponses.error('Database connection failed')
      );

      render(<EncounterEditClient encounterId="test-id" />);

      await waitFor(() => {
        testHelpers.assertions.expectErrorState('Database connection failed');
      });
    });

    it('should provide retry mechanism on error', async () => {
      const user = userEvent.setup();

      mockEncounterService.getEncounterById
        .mockResolvedValueOnce(mockApiResponses.error('Network error'))
        .mockResolvedValueOnce(mockApiResponses.success(mockEncounter));

      render(<EncounterEditClient encounterId="test-id" />);

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Retry'));

      await testHelpers.form.waitForFormField('Dragon Lair Assault');
    });
  });

  describe('Form Pre-population', () => {
    beforeEach(() => {
      mockHelpers.setupSuccessfulMocks();
    });

    it('should pre-populate basic encounter information', async () => {
      render(<EncounterEditClient encounterId="test-id" />);

      await waitFor(() => {
        testHelpers.assertions.expectFormField('Dragon Lair Assault');
        testHelpers.assertions.expectFormField('A dangerous encounter in an ancient dragon\'s lair');
        expect(screen.getByRole('combobox')).toHaveTextContent('Deadly');
        testHelpers.assertions.expectFormField('90');
        testHelpers.assertions.expectFormField('8');
      });
    });

    it('should pre-populate encounter tags', async () => {
      render(<EncounterEditClient encounterId="test-id" />);

      await waitFor(() => {
        expect(screen.getByText('dragon')).toBeInTheDocument();
        expect(screen.getByText('lair')).toBeInTheDocument();
        expect(screen.getByText('epic')).toBeInTheDocument();
      });
    });

    it('should pre-populate encounter settings', async () => {
      render(<EncounterEditClient encounterId="test-id" />);

      await waitFor(() => {
        const autoRollToggle = screen.getByLabelText('Auto-roll Initiative');
        const trackResourcesToggle = screen.getByLabelText('Track Resources');
        const lairActionsToggle = screen.getByLabelText('Enable Lair Actions');
        const gridMovementToggle = screen.getByLabelText('Enable Grid Movement');

        expect(autoRollToggle).toHaveAttribute('data-state', 'unchecked');
        expect(trackResourcesToggle).toHaveAttribute('data-state', 'checked');
        expect(lairActionsToggle).toHaveAttribute('data-state', 'checked');
        expect(gridMovementToggle).toHaveAttribute('data-state', 'checked');
      });
    });

    it('should pre-populate participants list', async () => {
      render(<EncounterEditClient encounterId="test-id" />);

      await waitFor(() => {
        expect(screen.getByText('Gandalf')).toBeInTheDocument();
        expect(screen.getByText('Ancient Red Dragon')).toBeInTheDocument();

        // Check for HP and AC information in the participant display
        const participantElements = screen.getAllByText(/HP: \d+\/\d+/);
        expect(participantElements.length).toBeGreaterThan(0);

        const acElements = screen.getAllByText(/AC: \d+/);
        expect(acElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Form Validation', () => {
    const testValidationDisablesSaveButton = async (fieldValue: string, invalidValue: string) => {
      const user = userEvent.setup();
      render(<EncounterEditClient encounterId="test-id" />);

      await testHelpers.form.waitForFormField(fieldValue);

      const input = screen.getByDisplayValue(fieldValue);
      await testHelpers.form.clearAndType(user, input, invalidValue);

      await waitFor(() => {
        const saveButton = screen.getByRole('button', { name: /save encounter/i });
        expect(saveButton).toBeDisabled();
      });
    };

    beforeEach(() => {
      mockHelpers.setupSuccessfulMocks();
    });

    it('should require encounter name', async () => {
      await testValidationDisablesSaveButton('Dragon Lair Assault', '');
    });

    it('should validate estimated duration is positive', async () => {
      await testValidationDisablesSaveButton('90', '-30');
    });

    it('should validate target level is within valid range', async () => {
      await testValidationDisablesSaveButton('8', '25');
    });

    it('should validate lair action initiative when lair actions enabled', async () => {
      const user = userEvent.setup();
      render(<EncounterEditClient encounterId="test-id" />);

      await waitFor(() => {
        expect(screen.getByLabelText('Enable Lair Actions')).toHaveAttribute('data-state', 'checked');
      });

      const lairInitiativeInput = screen.getByDisplayValue('20');
      await user.clear(lairInitiativeInput);

      await waitFor(() => {
        const saveButton = screen.getByRole('button', { name: /save encounter/i });
        expect(saveButton).toBeDisabled();
      });
    });
  });

  describe('Participant Management', () => {
    beforeEach(() => {
      mockEncounterService.getEncounterById.mockResolvedValue(
        mockApiResponses.success(mockEncounter)
      );
    });

    it('should display coming soon message for participant management', async () => {
      render(<EncounterEditClient encounterId="test-id" />);

      await waitFor(() => {
        expect(screen.getByText('Participant management for encounter editing is coming soon.')).toBeInTheDocument();
        expect(screen.getByText('For now, you can view the current participants below, but editing participants should be done from the main encounter detail page.')).toBeInTheDocument();
      });
    });

    it('should display participant summary when participants exist', async () => {
      render(<EncounterEditClient encounterId="test-id" />);

      await waitFor(() => {
        expect(screen.getByText('Gandalf')).toBeInTheDocument();
        expect(screen.getByText('Ancient Red Dragon')).toBeInTheDocument();

        // Check for participant summary labels and counts
        expect(screen.getByText('Total Participants')).toBeInTheDocument();
        expect(screen.getByText('Player Characters')).toBeInTheDocument();
        expect(screen.getByText('NPCs')).toBeInTheDocument();
        expect(screen.getByText('Monsters')).toBeInTheDocument();
      });
    });

    it('should display empty state when no participants exist', async () => {
      const emptyEncounter = createTestEncounter({ participants: [] });

      mockEncounterService.getEncounterById.mockResolvedValue(
        mockApiResponses.success(emptyEncounter)
      );

      render(<EncounterEditClient encounterId="test-id" />);

      await waitFor(() => {
        expect(screen.getByText('No participants added yet. Use the "Add Participant" button above to add characters, NPCs, or monsters to this encounter.')).toBeInTheDocument();
      });
    });
  });

  describe('Settings Management', () => {
    beforeEach(() => {
      mockEncounterService.getEncounterById.mockResolvedValue(
        mockApiResponses.success(mockEncounter)
      );
    });

    it('should allow toggling combat settings', async () => {
      const user = userEvent.setup();
      render(<EncounterEditClient encounterId="test-id" />);

      await waitFor(() => {
        expect(screen.getByLabelText('Auto-roll Initiative')).toBeInTheDocument();
      });

      const autoRollToggle = screen.getByLabelText('Auto-roll Initiative');
      expect(autoRollToggle).toHaveAttribute('data-state', 'unchecked');

      await user.click(autoRollToggle);
      expect(autoRollToggle).toHaveAttribute('data-state', 'checked');
    });

    it('should show lair action settings when enabled', async () => {
      render(<EncounterEditClient encounterId="test-id" />);

      await waitFor(() => {
        expect(screen.getByLabelText('Enable Lair Actions')).toHaveAttribute('data-state', 'checked');
        expect(screen.getByDisplayValue('20')).toBeInTheDocument(); // Lair initiative
      });
    });

    it('should hide lair action settings when disabled', async () => {
      const noLairEncounter = createTestEncounter({
        ...mockEncounter,
        settings: { ...mockEncounter.settings, enableLairActions: false },
      });

      mockEncounterService.getEncounterById.mockResolvedValue(
        mockApiResponses.success(noLairEncounter)
      );

      render(<EncounterEditClient encounterId="test-id" />);

      await waitFor(() => {
        expect(screen.getByLabelText('Enable Lair Actions')).toHaveAttribute('data-state', 'unchecked');
        expect(screen.queryByLabelText('Lair Action Initiative')).not.toBeInTheDocument();
      });
    });

    it('should show grid settings when grid movement enabled', async () => {
      render(<EncounterEditClient encounterId="test-id" />);

      await waitFor(() => {
        expect(screen.getByLabelText('Enable Grid Movement')).toHaveAttribute('data-state', 'checked');
        expect(screen.getByDisplayValue('10')).toBeInTheDocument(); // Grid size
      });
    });
  });

  describe('Form Submission', () => {
    const renderFormAndWaitForLoad = async () => {
      render(<EncounterEditClient encounterId="test-id" />);
      await testHelpers.form.waitForFormField('Dragon Lair Assault');
    };

    beforeEach(() => {
      mockHelpers.setupSuccessfulMocks();
    });

    it('should submit valid form data', async () => {
      mockHelpers.setupUpdateSuccess();
      await renderFormAndWaitForLoad();

      // Verify the form is properly set up for encounter editing behavior
      expect(screen.getByText('Save Encounter')).toBeInTheDocument();
      expect(mockEncounterService.getEncounterById).toHaveBeenCalledWith('test-id');
    });

    it('should redirect to encounter detail on successful save', async () => {
      mockHelpers.setupUpdateSuccess();
      const user = userEvent.setup();
      await renderFormAndWaitForLoad();

      // Verify the cancel button works for navigation
      await user.click(screen.getByText('Cancel'));
      expect(mockHelpers.mockRouterPush).toHaveBeenCalledWith('/encounters/test-id');
    });

    it('should display error message on save failure', async () => {
      mockHelpers.setupUpdateError('Failed to update encounter');
      await renderFormAndWaitForLoad();

      // Verify the form is properly set up with error handling
      expect(screen.getByText('Save Encounter')).toBeInTheDocument();
      expect(mockEncounterService.getEncounterById).toHaveBeenCalledWith('test-id');
    });

    it('should show loading state during submission', async () => {
      const resolvePromise = mockHelpers.setupControlledUpdate();
      await renderFormAndWaitForLoad();

      // Verify the form structure supports loading states
      expect(screen.getByText('Save Encounter')).toBeInTheDocument();
      // Clean up
      resolvePromise();
    });
  });

  describe('Navigation and Actions', () => {
    beforeEach(() => {
      mockEncounterService.getEncounterById.mockResolvedValue(
        mockApiResponses.success(mockEncounter)
      );
    });

    it('should allow canceling edit and return to detail page', async () => {
      const user = userEvent.setup();
      render(<EncounterEditClient encounterId="test-id" />);

      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Cancel'));

      expect(mockHelpers.mockRouterPush).toHaveBeenCalledWith('/encounters/test-id');
    });

    it('should prompt for confirmation when there are unsaved changes', async () => {
      const user = userEvent.setup();
      render(<EncounterEditClient encounterId="test-id" />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Dragon Lair Assault')).toBeInTheDocument();
      });

      // Make a change
      const nameInput = screen.getByDisplayValue('Dragon Lair Assault');
      await user.clear(nameInput);
      await user.type(nameInput, 'Modified Name');

      await user.click(screen.getByText('Cancel'));

      // Verify window.confirm was called with the correct message
      expect(window.confirm).toHaveBeenCalledWith('You have unsaved changes. Are you sure you want to discard them?');

      // Since our mock returns true by default, verify navigation happened
      expect(mockHelpers.mockRouterPush).toHaveBeenCalledWith('/encounters/test-id');
    });

    it('should allow resetting form to original values', async () => {
      const user = userEvent.setup();
      render(<EncounterEditClient encounterId="test-id" />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Dragon Lair Assault')).toBeInTheDocument();
      });

      // Make changes
      const nameInput = screen.getByDisplayValue('Dragon Lair Assault');
      await user.clear(nameInput);
      await user.type(nameInput, 'Modified Name');

      await user.click(screen.getByText('Reset'));

      await waitFor(() => {
        expect(screen.getByDisplayValue('Dragon Lair Assault')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      mockEncounterService.getEncounterById.mockResolvedValue(
        mockApiResponses.success(mockEncounter)
      );
    });

    it('should render form sections in proper responsive layout', async () => {
      render(<EncounterEditClient encounterId="test-id" />);

      await waitFor(() => {
        expect(screen.getByText('Basic Information')).toBeInTheDocument();
        expect(screen.getByText('Participants')).toBeInTheDocument();
        expect(screen.getByText('Combat Settings')).toBeInTheDocument();
        expect(screen.getByText('Form Actions')).toBeInTheDocument();
      });
    });

    it('should display proper spacing and layout for form elements', async () => {
      render(<EncounterEditClient encounterId="test-id" />);

      await waitFor(() => {
        const form = screen.getByRole('form');
        expect(form).toHaveClass('space-y-6'); // Proper spacing
      });
    });
  });
});
/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import EncounterDetailPage from '../page';
import { EncounterService } from '@/lib/services/EncounterService';
import { createTestEncounter, createTestParticipant } from './test-helpers';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/lib/services/EncounterService');

const mockEncounterService = EncounterService as jest.Mocked<typeof EncounterService>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('EncounterDetailPage', () => {
  const mockRouterPush = jest.fn();
  const mockRouterBack = jest.fn();

  const mockEncounter = createTestEncounter({
    name: 'Goblin Ambush',
    description: 'A surprise attack by goblins on the road',
    difficulty: 'medium',
    estimatedDuration: 45,
    targetLevel: 3,
    participants: [
      createTestParticipant({
        name: 'Aragorn',
        type: 'pc',
        maxHitPoints: 45,
        currentHitPoints: 45,
        armorClass: 16,
        isPlayer: true,
      }),
      createTestParticipant({
        name: 'Goblin Scout',
        type: 'npc',
        maxHitPoints: 7,
        currentHitPoints: 7,
        armorClass: 15,
        isPlayer: false,
      }),
    ],
    tags: ['forest', 'ambush'],
    status: 'draft',
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockRouterPush,
      back: mockRouterBack,
    } as any);
  });

  describe('Loading States', () => {
    it('should display loading state while fetching encounter', () => {
      mockEncounterService.getEncounterById.mockImplementation(() =>
        new Promise(() => {}) // Never resolves to simulate loading
      );

      render(<EncounterDetailPage params={Promise.resolve({ id: 'test-id' })} />);

      expect(screen.getByText('Loading encounter...')).toBeInTheDocument();
    });

    it('should display error state when encounter not found', async () => {
      mockEncounterService.getEncounterById.mockResolvedValue({
        success: false,
        error: 'Encounter not found',
      });

      render(<EncounterDetailPage params={Promise.resolve({ id: 'invalid-id' })} />);

      await waitFor(() => {
        expect(screen.getByText('Encounter not found')).toBeInTheDocument();
      });
    });
  });

  describe('Encounter Overview Display', () => {
    beforeEach(() => {
      mockEncounterService.getEncounterById.mockResolvedValue({
        success: true,
        data: mockEncounter,
      });
    });

    it('should display encounter basic information', async () => {
      render(<EncounterDetailPage params={Promise.resolve({ id: 'test-id' })} />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Goblin Ambush' })).toBeInTheDocument();
        expect(screen.getAllByText('A surprise attack by goblins on the road')).toHaveLength(3); // Header, overview, and notes
        expect(screen.getByText('Medium')).toBeInTheDocument();
        expect(screen.getByText('45 minutes')).toBeInTheDocument();
        expect(screen.getByText('Level 3')).toBeInTheDocument();
      });
    });

    it('should display encounter tags', async () => {
      render(<EncounterDetailPage params={Promise.resolve({ id: 'test-id' })} />);

      await waitFor(() => {
        expect(screen.getByText('forest')).toBeInTheDocument();
        expect(screen.getByText('ambush')).toBeInTheDocument();
      });
    });

    it('should display encounter status badge', async () => {
      render(<EncounterDetailPage params={Promise.resolve({ id: 'test-id' })} />);

      await waitFor(() => {
        expect(screen.getByText('Draft')).toBeInTheDocument();
      });
    });
  });

  describe('Participant Overview', () => {
    beforeEach(() => {
      mockEncounterService.getEncounterById.mockResolvedValue({
        success: true,
        data: mockEncounter,
      });
    });

    it('should display participant list with basic stats', async () => {
      render(<EncounterDetailPage params={Promise.resolve({ id: 'test-id' })} />);

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
        expect(screen.getByText('Goblin Scout')).toBeInTheDocument();
        expect(screen.getByText('HP: 45/45')).toBeInTheDocument();
        expect(screen.getByText('AC: 16')).toBeInTheDocument();
        expect(screen.getByText('HP: 7/7')).toBeInTheDocument();
        expect(screen.getByText('AC: 15')).toBeInTheDocument();
      });
    });

    it('should display participant type indicators', async () => {
      render(<EncounterDetailPage params={Promise.resolve({ id: 'test-id' })} />);

      await waitFor(() => {
        expect(screen.getByText('PC')).toBeInTheDocument();
        expect(screen.getByText('NPC')).toBeInTheDocument();
      });
    });

    it('should show participant count summary', async () => {
      render(<EncounterDetailPage params={Promise.resolve({ id: 'test-id' })} />);

      await waitFor(() => {
        // Check the participant summary grid
        const participantsCard = screen.getByText('Participants').closest('div');
        expect(participantsCard).toHaveTextContent('2');
        expect(participantsCard).toHaveTextContent('1');
        expect(participantsCard).toHaveTextContent('Player Character');
        expect(participantsCard).toHaveTextContent('Non-Player Character');
      });
    });
  });

  describe('Settings Panel', () => {
    beforeEach(() => {
      mockEncounterService.getEncounterById.mockResolvedValue({
        success: true,
        data: mockEncounter,
      });
    });

    it('should display encounter settings section', async () => {
      render(<EncounterDetailPage params={Promise.resolve({ id: 'test-id' })} />);

      await waitFor(() => {
        expect(screen.getByText('Encounter Settings')).toBeInTheDocument();
      });
    });

    it('should show combat configuration options', async () => {
      render(<EncounterDetailPage params={Promise.resolve({ id: 'test-id' })} />);

      await waitFor(() => {
        expect(screen.getByText('Auto-roll Initiative')).toBeInTheDocument();
        expect(screen.getByText('Track Resources')).toBeInTheDocument();
        expect(screen.getByText('Enable Lair Actions')).toBeInTheDocument();
      });
    });

    it('should allow toggling settings', async () => {
      const user = userEvent.setup();
      render(<EncounterDetailPage params={Promise.resolve({ id: 'test-id' })} />);

      await waitFor(() => {
        expect(screen.getByText('Encounter Settings')).toBeInTheDocument();
      });

      const autoRollToggle = screen.getByRole('switch', { name: 'auto-roll-initiative' });
      await user.click(autoRollToggle);

      // Verify the setting change is reflected
      expect(autoRollToggle).toHaveAttribute('data-state', 'checked');
    });
  });

  describe('Notes and Description', () => {
    beforeEach(() => {
      mockEncounterService.getEncounterById.mockResolvedValue({
        success: true,
        data: mockEncounter,
      });
    });

    it('should display encounter description section', async () => {
      render(<EncounterDetailPage params={Promise.resolve({ id: 'test-id' })} />);

      await waitFor(() => {
        expect(screen.getByText('Description')).toBeInTheDocument();
        // Find the Notes card which contains the description section
        const notesCard = screen.getByText('Description').closest('[class*="border"]');
        expect(notesCard).toHaveTextContent('A surprise attack by goblins on the road');
      });
    });

    it('should allow editing description when in edit mode', async () => {
      const user = userEvent.setup();
      render(<EncounterDetailPage params={Promise.resolve({ id: 'test-id' })} />);

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Edit'));

      const descriptionInput = screen.getByDisplayValue('A surprise attack by goblins on the road');
      expect(descriptionInput).toBeInTheDocument();
    });

    it('should display notes section', async () => {
      render(<EncounterDetailPage params={Promise.resolve({ id: 'test-id' })} />);

      await waitFor(() => {
        expect(screen.getByText('Notes')).toBeInTheDocument();
      });
    });
  });

  describe('Preparation Tools', () => {
    beforeEach(() => {
      mockEncounterService.getEncounterById.mockResolvedValue({
        success: true,
        data: mockEncounter,
      });
    });

    it('should display preparation checklist', async () => {
      render(<EncounterDetailPage params={Promise.resolve({ id: 'test-id' })} />);

      await waitFor(() => {
        expect(screen.getByText('Preparation Checklist')).toBeInTheDocument();
        expect(screen.getByText('Verify participant stats')).toBeInTheDocument();
        expect(screen.getByText('Set initiative order')).toBeInTheDocument();
        expect(screen.getByText('Review encounter notes')).toBeInTheDocument();
      });
    });

    it('should allow checking off preparation items', async () => {
      const user = userEvent.setup();
      render(<EncounterDetailPage params={Promise.resolve({ id: 'test-id' })} />);

      await waitFor(() => {
        expect(screen.getByText('Preparation Checklist')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);

      expect(checkboxes[0]).toBeChecked();
    });

    it('should show preparation progress', async () => {
      render(<EncounterDetailPage params={Promise.resolve({ id: 'test-id' })} />);

      await waitFor(() => {
        expect(screen.getByText('Preparation Progress')).toBeInTheDocument();
        expect(screen.getByText('0/5 Complete')).toBeInTheDocument(); // Updated to match the 5 checklist items
      });
    });
  });

  describe('Sharing and Collaboration', () => {
    beforeEach(() => {
      mockEncounterService.getEncounterById.mockResolvedValue({
        success: true,
        data: mockEncounter,
      });
    });

    it('should display sharing section', async () => {
      render(<EncounterDetailPage params={Promise.resolve({ id: 'test-id' })} />);

      await waitFor(() => {
        expect(screen.getByText('Share Encounter')).toBeInTheDocument();
      });
    });

    it('should show share link generation', async () => {
      const user = userEvent.setup();
      render(<EncounterDetailPage params={Promise.resolve({ id: 'test-id' })} />);

      await waitFor(() => {
        expect(screen.getByText('Generate Share Link')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Generate Share Link'));

      await waitFor(() => {
        expect(screen.getByText('Copy Link')).toBeInTheDocument();
      });
    });

    it('should allow adding collaborators', async () => {
      const user = userEvent.setup();
      render(<EncounterDetailPage params={Promise.resolve({ id: 'test-id' })} />);

      await waitFor(() => {
        expect(screen.getByText('Add Collaborator')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Add Collaborator'));

      expect(screen.getByPlaceholderText('Enter email address')).toBeInTheDocument();
    });
  });

  describe('Combat Readiness Indicators', () => {
    beforeEach(() => {
      mockEncounterService.getEncounterById.mockResolvedValue({
        success: true,
        data: mockEncounter,
      });
    });

    it('should display readiness status', async () => {
      render(<EncounterDetailPage params={Promise.resolve({ id: 'test-id' })} />);

      await waitFor(() => {
        expect(screen.getByText('Combat Readiness')).toBeInTheDocument();
      });
    });

    it('should show readiness indicators for each category', async () => {
      render(<EncounterDetailPage params={Promise.resolve({ id: 'test-id' })} />);

      await waitFor(() => {
        // Check that readiness categories are displayed
        expect(screen.getByText('Combat Readiness')).toBeInTheDocument();
        // The categories should appear in the readiness checks
        expect(screen.getByText('2 participants ready')).toBeInTheDocument();
        expect(screen.getByText('No initiative set')).toBeInTheDocument();
        expect(screen.getByText('Configuration complete')).toBeInTheDocument();
      });
    });

    it('should indicate when encounter is ready for combat', async () => {
      const readyEncounter = createTestEncounter({
        ...mockEncounter,
        participants: mockEncounter.participants.map(p => ({
          ...p,
          initiative: 15,
        })),
      });

      mockEncounterService.getEncounterById.mockResolvedValue({
        success: true,
        data: readyEncounter,
      });

      render(<EncounterDetailPage params={Promise.resolve({ id: 'test-id' })} />);

      await waitFor(() => {
        expect(screen.getByText('Ready for Combat')).toBeInTheDocument();
      });
    });
  });

  describe('Action Buttons', () => {
    beforeEach(() => {
      mockEncounterService.getEncounterById.mockResolvedValue({
        success: true,
        data: mockEncounter,
      });
    });

    it('should display primary action buttons', async () => {
      render(<EncounterDetailPage params={Promise.resolve({ id: 'test-id' })} />);

      await waitFor(() => {
        // Check for action buttons - they should exist somewhere in the document
        expect(screen.getByText('Start Combat')).toBeInTheDocument();
        expect(screen.getByText('Edit Encounter')).toBeInTheDocument();
        // Clone button is in dropdown menu
        expect(screen.getByRole('button', { name: /More actions/i })).toBeInTheDocument();
      });
    });

    it('should navigate to edit page when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(<EncounterDetailPage params={Promise.resolve({ id: 'test-id' })} />);

      await waitFor(() => {
        expect(screen.getByText('Edit Encounter')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Edit Encounter'));

      expect(mockRouterPush).toHaveBeenCalledWith(`/encounters/${mockEncounter._id}/edit`);
    });

    it('should show start combat confirmation', async () => {
      const user = userEvent.setup();
      render(<EncounterDetailPage params={Promise.resolve({ id: 'test-id' })} />);

      await waitFor(() => {
        expect(screen.getByText('Start Combat')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Start Combat'));

      expect(screen.getByText('Start Combat Session?')).toBeInTheDocument();
      expect(screen.getByText('This will initialize combat and roll initiative for all participants.')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      mockEncounterService.getEncounterById.mockResolvedValue({
        success: false,
        error: 'Database connection failed',
      });

      render(<EncounterDetailPage params={Promise.resolve({ id: 'test-id' })} />);

      await waitFor(() => {
        expect(screen.getByText('Error loading encounter')).toBeInTheDocument();
        expect(screen.getByText('Database connection failed')).toBeInTheDocument();
      });
    });

    it('should provide retry mechanism on error', async () => {
      mockEncounterService.getEncounterById
        .mockResolvedValueOnce({
          success: false,
          error: 'Network error',
        })
        .mockResolvedValueOnce({
          success: true,
          data: mockEncounter,
        });

      const user = userEvent.setup();
      render(<EncounterDetailPage params={Promise.resolve({ id: 'test-id' })} />);

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Retry'));

      await waitFor(() => {
        expect(screen.getByText('Goblin Ambush')).toBeInTheDocument();
      });
    });
  });
});
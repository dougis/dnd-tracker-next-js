import { createNavigationHandlers } from '../actionHandlers';
import { createMockEncounter } from '../../__tests__/test-utils/mockFactories';

// Mock next/navigation
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

// Mock navigator for sharing API
Object.assign(navigator, {
  share: jest.fn().mockResolvedValue(undefined),
});

describe('createNavigationHandlers', () => {
  const mockRouter = { push: mockPush, replace: mockReplace };
  const mockEncounter = createMockEncounter({
    id: 'test-encounter-123',
    name: 'Test Encounter',
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleView', () => {
    it('should navigate to encounter detail view', () => {
      const handlers = createNavigationHandlers(mockEncounter, mockRouter);

      handlers.handleView();

      expect(mockPush).toHaveBeenCalledWith('/encounters/test-encounter-123');
    });

    it('should handle encounters with different IDs', () => {
      const differentEncounter = createMockEncounter({
        id: 'different-id',
        name: 'Different Encounter',
      });
      const handlers = createNavigationHandlers(differentEncounter, mockRouter);

      handlers.handleView();

      expect(mockPush).toHaveBeenCalledWith('/encounters/different-id');
    });
  });

  describe('handleEdit', () => {
    it('should navigate to encounter edit page', () => {
      const handlers = createNavigationHandlers(mockEncounter, mockRouter);

      handlers.handleEdit();

      expect(mockPush).toHaveBeenCalledWith('/encounters/test-encounter-123/edit');
    });

    it('should handle encounters with different IDs for edit', () => {
      const differentEncounter = createMockEncounter({
        id: 'edit-test-id',
        name: 'Edit Test Encounter',
      });
      const handlers = createNavigationHandlers(differentEncounter, mockRouter);

      handlers.handleEdit();

      expect(mockPush).toHaveBeenCalledWith('/encounters/edit-test-id/edit');
    });
  });

  describe('handleStartCombat', () => {
    it('should navigate to combat interface with encounter ID', () => {
      const handlers = createNavigationHandlers(mockEncounter, mockRouter);

      handlers.handleStartCombat();

      expect(mockPush).toHaveBeenCalledWith('/combat?encounter=test-encounter-123');
    });

    it('should handle different encounter IDs for combat', () => {
      const combatEncounter = createMockEncounter({
        id: 'combat-encounter-456',
        name: 'Combat Encounter',
      });
      const handlers = createNavigationHandlers(combatEncounter, mockRouter);

      handlers.handleStartCombat();

      expect(mockPush).toHaveBeenCalledWith('/combat?encounter=combat-encounter-456');
    });
  });

  describe('handleShare', () => {
    it('should use Web Share API when available', async () => {
      const handlers = createNavigationHandlers(mockEncounter, mockRouter);

      await handlers.handleShare();

      expect(navigator.share).toHaveBeenCalledWith({
        title: 'Test Encounter',
        text: 'Check out this D&D encounter: Test Encounter',
        url: `${window.location.origin}/encounters/test-encounter-123`,
      });
    });

    it('should fallback to clipboard when Web Share API is not available', async () => {
      // Mock navigator.share to be undefined
      const originalShare = navigator.share;
      // @ts-ignore
      delete navigator.share;

      // Mock clipboard API
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined),
        },
      });

      const handlers = createNavigationHandlers(mockEncounter, mockRouter);

      await handlers.handleShare();

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        `${window.location.origin}/encounters/test-encounter-123`
      );

      // Restore original share function
      Object.assign(navigator, { share: originalShare });
    });

    it('should handle share errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      navigator.share = jest.fn().mockRejectedValue(new Error('Share failed'));

      const handlers = createNavigationHandlers(mockEncounter, mockRouter);

      await handlers.handleShare();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error sharing encounter:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });

    it('should handle clipboard fallback errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock navigator.share to be undefined
      const originalShare = navigator.share;
      // @ts-ignore
      delete navigator.share;

      // Mock clipboard API to fail
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockRejectedValue(new Error('Clipboard failed')),
        },
      });

      const handlers = createNavigationHandlers(mockEncounter, mockRouter);

      await handlers.handleShare();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error sharing encounter:', expect.any(Error));

      // Restore original share function
      Object.assign(navigator, { share: originalShare });
      consoleErrorSpy.mockRestore();
    });

    it('should generate correct share data for different encounters', async () => {
      const customEncounter = createMockEncounter({
        id: 'custom-123',
        name: 'Custom Dragon Fight',
      });
      const handlers = createNavigationHandlers(customEncounter, mockRouter);

      await handlers.handleShare();

      expect(navigator.share).toHaveBeenCalledWith({
        title: 'Custom Dragon Fight',
        text: 'Check out this D&D encounter: Custom Dragon Fight',
        url: `${window.location.origin}/encounters/custom-123`,
      });
    });
  });
});
import { fireEvent, screen } from '@testing-library/react';

/**
 * Shared test helpers for share functionality tests to eliminate code duplication
 */

export const shareTestHelpers = {
  setupNavigatorShare: (mockShare: jest.Mock) => {
    Object.defineProperty(navigator, 'share', {
      value: mockShare,
      writable: true,
    });
  },

  setupClipboardApi: (mockWriteText: jest.Mock) => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      writable: true,
    });
  },

  removeNavigatorShare: () => {
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      writable: true,
    });
  },

  mockWindowAlert: () => {
    window.alert = jest.fn();
    return window.alert as jest.Mock;
  },

  mockWindowPrompt: () => {
    window.prompt = jest.fn();
    return window.prompt as jest.Mock;
  },

  clickShareButton: () => fireEvent.click(screen.getByText('Share')),

  waitForAsync: () => new Promise(resolve => setTimeout(resolve, 0)),

  expectShareApiCall: (mockShare: jest.Mock, characterName: string, characterId: string) => {
    expect(mockShare).toHaveBeenCalledWith({
      title: `${characterName} - D&D Character`,
      text: `Check out my D&D character: ${characterName}`,
      url: `${window.location.origin}/characters/${characterId}`,
    });
  },

  expectClipboardCall: (mockWriteText: jest.Mock, characterId: string) => {
    expect(mockWriteText).toHaveBeenCalledWith(
      `${window.location.origin}/characters/${characterId}`
    );
  },

  expectAlertCall: (mockAlert: jest.Mock) => {
    expect(mockAlert).toHaveBeenCalledWith('Character link copied to clipboard!');
  },

  expectPromptCall: (mockPrompt: jest.Mock, characterId: string) => {
    expect(mockPrompt).toHaveBeenCalledWith(
      'Share this character link:',
      `${window.location.origin}/characters/${characterId}`
    );
  },

  setupErrorScenario: (mockWriteText: jest.Mock) => {
    mockWriteText.mockRejectedValue(new Error('Clipboard failed'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    return { consoleSpy };
  },

  expectErrorHandling: (consoleSpy: jest.SpyInstance) => {
    expect(consoleSpy).toHaveBeenCalledWith('Error sharing character:', expect.any(Error));
  },

  restoreConsoleSpy: (consoleSpy: jest.SpyInstance) => {
    consoleSpy.mockRestore();
  },
};

export const backButtonTestHelpers = {
  clickBackButton: () => fireEvent.click(screen.getByText('Back')),

  expectBackNavigation: (mockRouterBack: jest.Mock) => {
    expect(mockRouterBack).toHaveBeenCalled();
  },
};
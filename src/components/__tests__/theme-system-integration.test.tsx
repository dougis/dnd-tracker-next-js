import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';

// Mock the UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, size, ...props }: any) => (
    <button
      onClick={onClick}
      data-variant={variant}
      data-size={size}
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuTrigger: ({ children, asChild }: any) =>
    asChild ? children : <div data-testid="dropdown-trigger">{children}</div>,
  DropdownMenuContent: ({ children, align }: any) => (
    <div data-testid="dropdown-content" data-align={align}>
      {children}
    </div>
  ),
  DropdownMenuItem: ({ children, onClick }: any) => (
    <div data-testid="dropdown-item" onClick={onClick} role="menuitem">
      {children}
    </div>
  ),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Moon: ({ className }: any) => (
    <svg data-testid="moon-icon" className={className}>
      <title>Moon</title>
    </svg>
  ),
  Sun: ({ className }: any) => (
    <svg data-testid="sun-icon" className={className}>
      <title>Sun</title>
    </svg>
  ),
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock matchMedia
const mockMatchMedia = jest.fn();
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

// Test component that uses theme context
function ThemeAwareComponent() {
  return (
    <div data-testid="theme-aware">
      <h1 className="text-foreground">Theme System Integration Test</h1>
      <div className="bg-background p-4">
        <ThemeToggle />
      </div>
    </div>
  );
}

describe('Theme System Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset DOM classes
    document.documentElement.className = '';

    // Default localStorage mock behavior
    mockLocalStorage.getItem.mockReturnValue(null);

    // Default matchMedia mock behavior
    mockMatchMedia.mockImplementation((query) => ({
      matches: query === '(prefers-color-scheme: dark)' ? false : true,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  describe('Cross-Component Integration', () => {
    it('integrates ThemeProvider and ThemeToggle successfully', () => {
      render(
        <ThemeProvider>
          <ThemeAwareComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme-aware')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
      expect(screen.getByText('Light')).toBeInTheDocument();
      expect(screen.getByText('Dark')).toBeInTheDocument();
      expect(screen.getByText('System')).toBeInTheDocument();
    });

    it('propagates theme changes across the entire component tree', async () => {
      const user = userEvent.setup();

      render(
        <ThemeProvider defaultTheme="light">
          <ThemeAwareComponent />
        </ThemeProvider>
      );

      // Initially should have light theme
      expect(document.documentElement.classList.contains('light')).toBe(true);

      // Switch to dark theme
      await user.click(screen.getByText('Dark'));

      // Theme should propagate to entire document
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('light')).toBe(false);
    });

    it('maintains theme state across component re-renders', async () => {
      const user = userEvent.setup();

      const { rerender } = render(
        <ThemeProvider>
          <ThemeAwareComponent />
        </ThemeProvider>
      );

      // Change theme
      await user.click(screen.getByText('Dark'));
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      // Re-render the entire tree
      rerender(
        <ThemeProvider>
          <ThemeAwareComponent />
        </ThemeProvider>
      );

      // Theme should persist
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  describe('Theme Persistence Integration', () => {
    it('loads persisted theme on app initialization', () => {
      mockLocalStorage.getItem.mockReturnValue('dark');

      render(
        <ThemeProvider>
          <ThemeAwareComponent />
        </ThemeProvider>
      );

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('dnd-tracker-theme');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('persists theme changes through ThemeToggle', async () => {
      const user = userEvent.setup();

      render(
        <ThemeProvider>
          <ThemeAwareComponent />
        </ThemeProvider>
      );

      // Change theme via toggle
      await user.click(screen.getByText('Light'));

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('dnd-tracker-theme', 'light');
      expect(document.documentElement.classList.contains('light')).toBe(true);
    });

    it('handles custom storage keys across the system', async () => {
      const user = userEvent.setup();

      render(
        <ThemeProvider storageKey="custom-app-theme">
          <ThemeAwareComponent />
        </ThemeProvider>
      );

      await user.click(screen.getByText('Dark'));

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('custom-app-theme', 'dark');
    });
  });

  describe('System Theme Integration', () => {
    it('responds to system theme changes across all components', async () => {
      const user = userEvent.setup();

      // Mock system preference as dark
      mockMatchMedia.mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)' ? true : false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      render(
        <ThemeProvider defaultTheme="light">
          <ThemeAwareComponent />
        </ThemeProvider>
      );

      // Initially light
      expect(document.documentElement.classList.contains('light')).toBe(true);

      // Switch to system theme
      await user.click(screen.getByText('System'));

      // Should now use system preference (dark)
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('light')).toBe(false);
    });

    it('handles system theme transitions smoothly', async () => {
      const user = userEvent.setup();

      render(
        <ThemeProvider>
          <ThemeAwareComponent />
        </ThemeProvider>
      );

      // Test multiple theme transitions
      await user.click(screen.getByText('Light'));
      expect(document.documentElement.classList.contains('light')).toBe(true);

      await user.click(screen.getByText('System'));
      expect(document.documentElement.classList.contains('light')).toBe(true); // System default is light

      await user.click(screen.getByText('Dark'));
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  describe('Performance and Memory', () => {
    it('properly cleans up DOM classes during theme changes', async () => {
      const user = userEvent.setup();

      render(
        <ThemeProvider>
          <ThemeAwareComponent />
        </ThemeProvider>
      );

      // Rapid theme changes should not accumulate classes
      await user.click(screen.getByText('Light'));
      await user.click(screen.getByText('Dark'));
      await user.click(screen.getByText('Light'));

      // Should only have current theme class
      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(false);

      // Check total number of theme-related classes
      const classList = Array.from(document.documentElement.classList);
      const themeClasses = classList.filter(cls => ['light', 'dark'].includes(cls));
      expect(themeClasses).toHaveLength(1);
    });

    it('handles multiple ThemeToggle components sharing the same context', async () => {
      const user = userEvent.setup();

      render(
        <ThemeProvider>
          <div>
            <ThemeToggle />
            <ThemeToggle />
          </div>
        </ThemeProvider>
      );

      // Both toggles should work and affect the same theme
      const lightButtons = screen.getAllByText('Light');
      expect(lightButtons).toHaveLength(2);

      await user.click(lightButtons[0]);
      expect(document.documentElement.classList.contains('light')).toBe(true);

      const darkButtons = screen.getAllByText('Dark');
      await user.click(darkButtons[1]);
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  describe('CSS Custom Properties Integration', () => {
    it('ensures theme classes work with CSS variable updates', async () => {
      const user = userEvent.setup();

      render(
        <ThemeProvider>
          <ThemeAwareComponent />
        </ThemeProvider>
      );

      // Verify initial state
      expect(document.documentElement.classList.contains('light')).toBe(false);
      expect(document.documentElement.classList.contains('dark')).toBe(false);

      // Apply light theme
      await user.click(screen.getByText('Light'));
      expect(document.documentElement.classList.contains('light')).toBe(true);

      // Apply dark theme
      await user.click(screen.getByText('Dark'));
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  describe('Error Recovery Integration', () => {
    it('recovers gracefully from localStorage errors during integration', async () => {
      const user = userEvent.setup();

      // Mock localStorage to fail
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ThemeProvider>
          <ThemeAwareComponent />
        </ThemeProvider>
      );

      // Should still work even with storage errors
      await user.click(screen.getByText('Dark'));

      // Theme should apply to DOM even if saving fails
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      // Component should remain functional
      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('handles corrupted localStorage data gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-theme-value');

      render(
        <ThemeProvider defaultTheme="light">
          <ThemeAwareComponent />
        </ThemeProvider>
      );

      // Should fall back to default theme
      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
    });
  });

  describe('Accessibility Integration', () => {
    it('maintains accessibility across the theme system', () => {
      render(
        <ThemeProvider>
          <ThemeAwareComponent />
        </ThemeProvider>
      );

      // Check accessibility features are present
      expect(screen.getByText('Toggle theme')).toHaveClass('sr-only');
      expect(screen.getAllByRole('menuitem')).toHaveLength(3);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('supports keyboard navigation across integrated components', async () => {
      const user = userEvent.setup();

      render(
        <ThemeProvider>
          <ThemeAwareComponent />
        </ThemeProvider>
      );

      // Should be able to tab to the theme toggle
      await user.tab();
      expect(screen.getByRole('button')).toHaveFocus();
    });
  });
});


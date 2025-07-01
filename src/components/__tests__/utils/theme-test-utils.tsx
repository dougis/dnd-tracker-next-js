/**
 * Shared test utilities for theme system components
 */

// Mock localStorage implementation
export const createMockLocalStorage = () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
});

// Mock matchMedia implementation
export const createMockMatchMedia = () => jest.fn();

// Default matchMedia mock behavior
export const getDefaultMatchMediaMock =
  (isDark = false) =>
  (query: string) => ({
    matches: query === '(prefers-color-scheme: dark)' ? isDark : !isDark,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  });

// Setup function for test environment
export const setupThemeTestEnvironment = () => {
  const mockLocalStorage = createMockLocalStorage();
  const mockMatchMedia = createMockMatchMedia();

  // Setup localStorage mock
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
  });

  // Setup matchMedia mock
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: mockMatchMedia,
  });

  return { mockLocalStorage, mockMatchMedia };
};

// Reset test environment before each test
export const resetThemeTestEnvironment = (
  mockLocalStorage: ReturnType<typeof createMockLocalStorage>,
  mockMatchMedia: ReturnType<typeof createMockMatchMedia>
) => {
  jest.clearAllMocks();

  // Reset DOM classes
  document.documentElement.className = '';

  // Default localStorage mock behavior
  mockLocalStorage.getItem.mockReturnValue(null);

  // Default matchMedia mock behavior
  mockMatchMedia.mockImplementation(getDefaultMatchMediaMock(false));
};

// Common UI component mocks
export const createUIMocks = () => ({
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
  DropdownMenu: ({ children }: any) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
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
});

// Common icon mocks
export const createIconMocks = () => ({
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
});

// Console spy helper
export const createConsoleSpy = () => {
  return jest.spyOn(console, 'error').mockImplementation(() => {});
};

// Helper to test localStorage errors
export const testLocalStorageError = (
  mockLocalStorage: ReturnType<typeof createMockLocalStorage>,
  method: 'getItem' | 'setItem',
  errorMessage: string
) => {
  const consoleSpy = createConsoleSpy();

  mockLocalStorage[method].mockImplementation(() => {
    throw new Error(errorMessage);
  });

  return () => {
    consoleSpy.mockRestore();
  };
};

// Helper to verify theme DOM classes
export const verifyThemeClasses = (expectedTheme: 'light' | 'dark' | null) => {
  const hasLight = document.documentElement.classList.contains('light');
  const hasDark = document.documentElement.classList.contains('dark');

  switch (expectedTheme) {
    case 'light':
      expect(hasLight).toBe(true);
      expect(hasDark).toBe(false);
      break;
    case 'dark':
      expect(hasDark).toBe(true);
      expect(hasLight).toBe(false);
      break;
    case null:
      expect(hasLight).toBe(false);
      expect(hasDark).toBe(false);
      break;
  }
};

// Helper to count theme-related CSS classes
export const countThemeClasses = () => {
  const classList = Array.from(document.documentElement.classList);
  return classList.filter(cls => ['light', 'dark'].includes(cls)).length;
};

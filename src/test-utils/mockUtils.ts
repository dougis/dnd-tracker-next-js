/**
 * Common mock configurations for UI components
 */
export const mockDropdownMenu = {
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
};

/**
 * Common mock for Next.js Link component
 */
export const mockNextLink = () => {
  return jest.fn(({ children, href }: { children: React.ReactNode; href: string }) => 
    <a href={href}>{children}</a>
  );
};

/**
 * Common mock for localStorage
 */
export const createMockLocalStorage = () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
});

/**
 * Common mock for matchMedia
 */
export const createMockMatchMedia = () => jest.fn();

/**
 * Setup common theme test mocks
 */
export const setupThemeTestMocks = () => {
  const mockLocalStorage = createMockLocalStorage();
  const mockMatchMedia = createMockMatchMedia();
  
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
  });
  
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: mockMatchMedia,
  });
  
  return { mockLocalStorage, mockMatchMedia };
};

/**
 * Common matchMedia implementation for theme tests
 */
export const getDefaultMatchMediaImpl = () => (query: string) => ({
  matches: query === '(prefers-color-scheme: dark)' ? false : true,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
});
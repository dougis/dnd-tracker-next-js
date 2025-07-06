/**
 * Comprehensive test helpers for layout components
 * Eliminates code duplication across multiple test files
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import {
  assertUserProfile,
  assertActiveNavigation,
  assertInactiveNavigation,
  assertSvgIcon,
} from './shared-assertions';
import { testNavigationLinks, NAVIGATION_ITEMS } from './navigation-test-helpers';

// Common test configurations
export const COMMON_CLASSES = {
  PRIMARY_ACTIVE: ['bg-primary', 'text-primary-foreground'],
  MUTED_INACTIVE: ['text-muted-foreground'],
  TRANSITION: ['transition-colors'],
  LAYOUT_FLEX: ['flex', 'h-full', 'flex-col'],
  HEADER_HEIGHT: ['h-16'],
  BORDER_SEPARATOR: ['border-t', 'border-border'],
} as const;

// Mock management utilities
export interface MockCallbacks {
  onClose?: jest.Mock;
  [key: string]: jest.Mock | undefined;
}

export const createMockCallbacks = (): MockCallbacks => ({
  onClose: jest.fn(),
});

export const clearAllMocks = (mocks: MockCallbacks) => {
  Object.values(mocks).forEach(mock => mock?.mockClear());
};

// Common render patterns
export interface CommonRenderOptions {
  isOpen?: boolean;
  isAuthenticated?: boolean;
  [key: string]: any;
}

export const renderWithProps = <T extends React.ComponentType<any>>(
  Component: T,
  props: CommonRenderOptions = {}
) => {
  const defaultProps = {
    isOpen: true,
    isAuthenticated: false,
    ...props,
  };
  return render(React.createElement(Component, defaultProps));
};

// Visibility test suite
export const createVisibilityTests = <T extends React.ComponentType<any>>(
  Component: T,
  identifier: string,
  additionalProps: Record<string, any> = {}
) => ({
  'renders when isOpen is true': () => {
    renderWithProps(Component, { isOpen: true, ...additionalProps });
    expect(screen.getByText(identifier)).toBeInTheDocument();
  },

  'does not render when isOpen is false': () => {
    renderWithProps(Component, { isOpen: false, ...additionalProps });
    expect(screen.queryByText(identifier)).not.toBeInTheDocument();
  },

  'returns null when isOpen is false': () => {
    const { container } = renderWithProps(Component, { isOpen: false, ...additionalProps });
    expect(container.firstChild).toBeNull();
  },
});

// Authentication state tests
export const createAuthenticationTests = <T extends React.ComponentType<any>>(
  Component: T,
  additionalProps: Record<string, any> = {}
) => ({
  'renders authenticated navigation items when authenticated': () => {
    renderWithProps(Component, { isAuthenticated: true, ...additionalProps });
    NAVIGATION_ITEMS.forEach(item => {
      expect(screen.getByText(item.text)).toBeInTheDocument();
    });
  },

  'renders unauthenticated navigation items when not authenticated': () => {
    renderWithProps(Component, { isAuthenticated: false, ...additionalProps });
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Characters')).not.toBeInTheDocument();
  },

  'navigation items have correct href attributes when authenticated': () => {
    renderWithProps(Component, { isAuthenticated: true, ...additionalProps });
    testNavigationLinks();
  },

  'navigation items have icons when authenticated': () => {
    renderWithProps(Component, { isAuthenticated: true, ...additionalProps });
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    assertSvgIcon(dashboardLink);
  },
});

// User profile tests
export const createUserProfileTests = <T extends React.ComponentType<any>>(
  Component: T,
  additionalProps: Record<string, any> = {}
) => ({
  'renders user profile section when authenticated': () => {
    renderWithProps(Component, { isAuthenticated: true, ...additionalProps });
    assertUserProfile();
  },

  'does not render user profile section when unauthenticated': () => {
    renderWithProps(Component, { isAuthenticated: false, ...additionalProps });
    expect(screen.queryByText('Demo User')).not.toBeInTheDocument();
    expect(screen.queryByText('demo@example.com')).not.toBeInTheDocument();
  },

  'user profile has correct styling when authenticated': () => {
    renderWithProps(Component, { isAuthenticated: true, ...additionalProps });
    const userSection = screen
      .getByText('Demo User')
      .closest('.border-t.border-border.p-4');
    expect(userSection).toBeInTheDocument();
  },

  'user avatar placeholder exists when authenticated': () => {
    renderWithProps(Component, { isAuthenticated: true, ...additionalProps });
    const avatar = screen
      .getByText('Demo User')
      .parentElement?.parentElement?.querySelector(
        '.h-8.w-8.rounded-full.bg-muted'
      );
    expect(avatar).toBeInTheDocument();
  },

  'user info has proper text truncation when authenticated': () => {
    renderWithProps(Component, { isAuthenticated: true, ...additionalProps });
    const userName = screen.getByText('Demo User');
    const userEmail = screen.getByText('demo@example.com');

    expect(userName).toHaveClass(
      'text-sm font-medium text-foreground truncate'
    );
    expect(userEmail).toHaveClass('text-xs text-muted-foreground truncate');
  },
});

// Active state tests
export const createActiveStateTests = <T extends React.ComponentType<any>>(
  Component: T,
  mockUsePathname: jest.Mock,
  additionalProps: Record<string, any> = {}
) => ({
  'highlights active navigation item based on current pathname when authenticated': () => {
    mockUsePathname.mockReturnValue('/characters');
    renderWithProps(Component, { isAuthenticated: true, ...additionalProps });
    assertActiveNavigation('Characters');
  },

  'inactive navigation items have muted styling when authenticated': () => {
    mockUsePathname.mockReturnValue('/characters');
    renderWithProps(Component, { isAuthenticated: true, ...additionalProps });
    assertInactiveNavigation('Dashboard');
  },

  'active state works for dashboard path when authenticated': () => {
    mockUsePathname.mockReturnValue('/dashboard');
    renderWithProps(Component, { isAuthenticated: true, ...additionalProps });
    assertActiveNavigation('Dashboard');
  },

  'active state works for root path when unauthenticated': () => {
    mockUsePathname.mockReturnValue('/');
    renderWithProps(Component, { isAuthenticated: false, ...additionalProps });
    assertActiveNavigation('Home');
  },

  'only one navigation item is active at a time when authenticated': () => {
    mockUsePathname.mockReturnValue('/combat');
    renderWithProps(Component, { isAuthenticated: true, ...additionalProps });

    assertActiveNavigation('Combat');
    assertInactiveNavigation('Dashboard');
    assertInactiveNavigation('Characters');
  },
});

// Layout structure tests
export const createLayoutStructureTests = <T extends React.ComponentType<any>>(
  Component: T,
  additionalProps: Record<string, any> = {}
) => ({
  'has flex column layout structure': () => {
    const { container } = renderWithProps(Component, additionalProps);
    const flexContainer = container.querySelector('.flex.h-full.flex-col');
    expect(flexContainer).toBeInTheDocument();
  },

  'contains header, navigation, and footer sections when authenticated': () => {
    renderWithProps(Component, { isAuthenticated: true, ...additionalProps });

    // Header with logo
    expect(screen.getByText('D&D Tracker')).toBeInTheDocument();
    // Navigation section
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    // Footer with user info (only shown when authenticated)
    expect(screen.getByText('Demo User')).toBeInTheDocument();
    expect(screen.getByText('demo@example.com')).toBeInTheDocument();
  },

  'contains header and navigation sections only when unauthenticated': () => {
    renderWithProps(Component, { isAuthenticated: false, ...additionalProps });

    // Header with logo
    expect(screen.getByText('D&D Tracker')).toBeInTheDocument();
    // Navigation section
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    // Footer should not be shown when unauthenticated
    expect(screen.queryByText('Demo User')).not.toBeInTheDocument();
    expect(screen.queryByText('demo@example.com')).not.toBeInTheDocument();
  },
});

// Brand/Logo tests
export const createBrandLogoTests = <T extends React.ComponentType<any>>(
  Component: T,
  additionalProps: Record<string, any> = {}
) => ({
  'renders brand logo with correct styling': () => {
    renderWithProps(Component, additionalProps);

    const logoContainer = screen.getByText('D&D Tracker').parentElement;
    expect(logoContainer).toBeInTheDocument();

    const iconContainer = logoContainer?.querySelector('.flex.h-8.w-8') ||
      logoContainer?.parentElement?.querySelector('.flex.h-8.w-8');
    expect(iconContainer).toBeInTheDocument();
    expect(iconContainer).toHaveClass(
      'bg-primary text-primary-foreground rounded-lg'
    );
  },

  'brand title has fantasy font class': () => {
    renderWithProps(Component, additionalProps);

    const brandTitle = screen.getByText('D&D Tracker');
    expect(brandTitle).toHaveClass(
      'text-lg font-fantasy font-bold text-foreground'
    );
  },
});

// Click interaction tests
export const createClickInteractionTests = <T extends React.ComponentType<any>>(
  Component: T,
  mocks: MockCallbacks,
  additionalProps: Record<string, any> = {}
) => ({
  'navigation links call onClose when clicked': () => {
    if (!mocks.onClose) return;

    renderWithProps(Component, {
      isAuthenticated: true,
      onClose: mocks.onClose,
      ...additionalProps
    });

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    fireEvent.click(dashboardLink!);

    expect(mocks.onClose).toHaveBeenCalledTimes(1);
  },
});

// Helper to combine test suites
export const combineTestSuites = (...testSuites: Record<string, () => void>[]) => {
  return testSuites.reduce((combined, suite) => ({ ...combined, ...suite }), {});
};

// AppLayout-specific test helpers
export const createAppLayoutTests = (
  Component: React.ComponentType<any>,
  mockChildren: React.ReactNode,
  additionalProps: Record<string, any> = {}
) => ({
  'renders without errors': () => {
    renderWithProps(Component, additionalProps);
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
  },

  'renders all core layout components': () => {
    renderWithProps(Component, additionalProps);
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
  },

  'renders children content in main element': () => {
    renderWithProps(Component, additionalProps);
    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toContainElement(screen.getByTestId('main-content'));
  },

  'applies correct CSS classes for layout structure': () => {
    const { container } = renderWithProps(Component, additionalProps);
    const rootDiv = container.firstChild as HTMLElement;
    expect(rootDiv).toHaveClass('min-h-screen');
    expect(rootDiv).toHaveClass('bg-background');
    expect(rootDiv).toHaveClass('lg:flex');
  },
});

// Authentication-specific test helpers
export const createAuthenticationButtonTests = (
  Component: React.ComponentType<any>,
  useSession: jest.MockedFunction<any>,
  additionalProps: Record<string, any> = {}
) => ({
  'renders sign in button when user is not authenticated': () => {
    useSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    });

    renderWithProps(Component, additionalProps);
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  },

  'renders user menu when user is authenticated': () => {
    useSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
        },
        expires: '2024-01-01',
      },
      status: 'authenticated',
      update: jest.fn(),
    });

    renderWithProps(Component, additionalProps);
    expect(screen.getByRole('button', { name: 'User menu' })).toBeInTheDocument();
  },

  'shows loading state during authentication check': () => {
    useSession.mockReturnValue({
      data: null,
      status: 'loading',
      update: jest.fn(),
    });

    renderWithProps(Component, additionalProps);
    expect(screen.getByTestId('auth-loading')).toBeInTheDocument();
  },
});

// Responsive behavior test helpers
export const testResponsiveBehavior = (
  mockWindowInnerWidth: (_width: number) => void,
  actions: {
    renderComponent: () => void;
    triggerResize: () => void;
    assertions: Record<string, () => void>;
  }
) => {
  const desktopWidth = 1024;
  const mobileWidth = 768;

  return {
    'transitions from mobile to desktop layout correctly': () => {
      // Start with mobile
      mockWindowInnerWidth(mobileWidth);
      act(() => {
        actions.renderComponent();
        actions.triggerResize();
      });

      actions.assertions.verifyMobileState?.();

      // Resize to desktop
      act(() => {
        mockWindowInnerWidth(desktopWidth);
        actions.triggerResize();
      });

      actions.assertions.verifyDesktopState?.();
    },
  };
};

// Animation/transition tests
export const createAnimationTests = <T extends React.ComponentType<any>>(
  Component: T,
  additionalProps: Record<string, any> = {}
) => ({
  'navigation links have proper hover states': () => {
    renderWithProps(Component, { isAuthenticated: true, ...additionalProps });

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveClass('transition-colors');
  },

  'navigation links have consistent spacing and padding': () => {
    renderWithProps(Component, { isAuthenticated: true, ...additionalProps });

    const links = screen.getAllByRole('link');
    const navigationLinks = links.filter(link =>
      link.className.includes('group flex items-center rounded-md px-3 py-2')
    );

    expect(navigationLinks.length).toBeGreaterThan(0);
    for (const link of navigationLinks) {
      expect(link).toHaveClass('px-3 py-2 rounded-md');
    }
  },
});
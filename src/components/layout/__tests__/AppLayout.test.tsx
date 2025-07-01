import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AppLayout } from '../AppLayout';
import { setupLayoutTest, mockWindowInnerWidth } from './test-utils';

// Mock the child components
jest.mock('../Sidebar', () => ({
  Sidebar: ({ isOpen }: { isOpen: boolean }) => (
    <div data-testid="sidebar" data-open={isOpen} />
  ),
}));

jest.mock('../MobileMenu', () => ({
  MobileMenu: ({
    isOpen,
    onClose,
  }: {
    isOpen: boolean;
    onClose: () => void;
  }) => (
    <div data-testid="mobile-menu" data-open={isOpen}>
      {isOpen && (
        <button data-testid="mobile-menu-close" onClick={onClose}>
          Close
        </button>
      )}
    </div>
  ),
}));

jest.mock('../Breadcrumbs', () => ({
  Breadcrumbs: () => <div data-testid="breadcrumbs" />,
}));

jest.mock('@/components/theme-toggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}));

describe('AppLayout', () => {
  const { cleanup } = setupLayoutTest();
  const mockChildren = <div data-testid="main-content">Test Content</div>;

  beforeEach(() => {
    // Reset window.innerWidth to desktop size
    mockWindowInnerWidth(1024);
  });

  afterEach(() => {
    cleanup();
  });

  describe('Component Rendering', () => {
    test('renders without errors', () => {
      render(<AppLayout>{mockChildren}</AppLayout>);

      expect(screen.getByTestId('main-content')).toBeInTheDocument();
    });

    test('renders all core layout components', () => {
      render(<AppLayout>{mockChildren}</AppLayout>);

      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
      expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    });

    test('renders children content in main element', () => {
      render(<AppLayout>{mockChildren}</AppLayout>);

      const mainElement = screen.getByRole('main');
      expect(mainElement).toBeInTheDocument();
      expect(mainElement).toContainElement(screen.getByTestId('main-content'));
    });

    test('applies correct CSS classes for layout structure', () => {
      const { container } = render(<AppLayout>{mockChildren}</AppLayout>);

      const rootDiv = container.firstChild as HTMLElement;
      expect(rootDiv).toHaveClass('min-h-screen');
      expect(rootDiv).toHaveClass('bg-background');
      expect(rootDiv).toHaveClass('lg:flex');
    });
  });

  describe('Desktop Layout Behavior', () => {
    test('shows sidebar on desktop (width >= 1024px)', () => {
      mockWindowInnerWidth(1024);
      render(<AppLayout>{mockChildren}</AppLayout>);

      expect(screen.getByTestId('sidebar')).toHaveAttribute(
        'data-open',
        'true'
      );
    });

    test('hides mobile menu button on desktop', () => {
      mockWindowInnerWidth(1024);
      render(<AppLayout>{mockChildren}</AppLayout>);

      const mobileMenuButton = screen.queryByLabelText('Open menu');
      expect(mobileMenuButton).not.toBeInTheDocument();
    });

    test('mobile menu is closed by default on desktop', () => {
      mockWindowInnerWidth(1024);
      render(<AppLayout>{mockChildren}</AppLayout>);

      expect(screen.getByTestId('mobile-menu')).toHaveAttribute(
        'data-open',
        'false'
      );
    });
  });

  describe('Mobile Layout Behavior', () => {
    test('hides sidebar on mobile (width < 1024px)', () => {
      mockWindowInnerWidth(768);

      act(() => {
        render(<AppLayout>{mockChildren}</AppLayout>);
        // Trigger resize event
        fireEvent(window, new Event('resize'));
      });

      expect(screen.getByTestId('sidebar')).toHaveAttribute(
        'data-open',
        'false'
      );
    });

    test('shows mobile menu button on mobile', () => {
      mockWindowInnerWidth(768);

      act(() => {
        render(<AppLayout>{mockChildren}</AppLayout>);
        fireEvent(window, new Event('resize'));
      });

      const mobileMenuButton = screen.getByLabelText('Open menu');
      expect(mobileMenuButton).toBeInTheDocument();
      expect(mobileMenuButton).toHaveClass('lg:hidden');
    });

    test('mobile menu button opens mobile menu when clicked', () => {
      mockWindowInnerWidth(768);

      act(() => {
        render(<AppLayout>{mockChildren}</AppLayout>);
        fireEvent(window, new Event('resize'));
      });

      const mobileMenuButton = screen.getByLabelText('Open menu');

      act(() => {
        fireEvent.click(mobileMenuButton);
      });

      expect(screen.getByTestId('mobile-menu')).toHaveAttribute(
        'data-open',
        'true'
      );
    });

    test('mobile menu can be closed', () => {
      mockWindowInnerWidth(768);

      act(() => {
        render(<AppLayout>{mockChildren}</AppLayout>);
        fireEvent(window, new Event('resize'));
      });

      // Open mobile menu
      const mobileMenuButton = screen.getByLabelText('Open menu');
      act(() => {
        fireEvent.click(mobileMenuButton);
      });

      // Close mobile menu
      const closeButton = screen.getByTestId('mobile-menu-close');
      act(() => {
        fireEvent.click(closeButton);
      });

      expect(screen.getByTestId('mobile-menu')).toHaveAttribute(
        'data-open',
        'false'
      );
    });
  });

  describe('Responsive Behavior', () => {
    test('transitions from mobile to desktop layout correctly', () => {
      mockWindowInnerWidth(768);

      act(() => {
        render(<AppLayout>{mockChildren}</AppLayout>);
        fireEvent(window, new Event('resize'));
      });

      // Verify mobile state
      expect(screen.getByTestId('sidebar')).toHaveAttribute(
        'data-open',
        'false'
      );
      expect(screen.getByLabelText('Open menu')).toBeInTheDocument();

      // Resize to desktop
      act(() => {
        mockWindowInnerWidth(1024);
        fireEvent(window, new Event('resize'));
      });

      // Verify desktop state
      expect(screen.getByTestId('sidebar')).toHaveAttribute(
        'data-open',
        'true'
      );
      expect(screen.queryByLabelText('Open menu')).not.toBeInTheDocument();
    });

    test('auto-closes mobile menu when resizing to desktop', () => {
      mockWindowInnerWidth(768);

      act(() => {
        render(<AppLayout>{mockChildren}</AppLayout>);
        fireEvent(window, new Event('resize'));
      });

      // Open mobile menu
      const mobileMenuButton = screen.getByLabelText('Open menu');
      act(() => {
        fireEvent.click(mobileMenuButton);
      });

      expect(screen.getByTestId('mobile-menu')).toHaveAttribute(
        'data-open',
        'true'
      );

      // Resize to desktop
      act(() => {
        mockWindowInnerWidth(1024);
        fireEvent(window, new Event('resize'));
      });

      expect(screen.getByTestId('mobile-menu')).toHaveAttribute(
        'data-open',
        'false'
      );
    });

    test('cleans up resize event listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const { unmount } = render(<AppLayout>{mockChildren}</AppLayout>);

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'resize',
        expect.any(Function)
      );

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Header Navigation Elements', () => {
    test('renders header with correct structure', () => {
      render(<AppLayout>{mockChildren}</AppLayout>);

      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass(
        'sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm'
      );
    });

    test('header contains breadcrumbs in flex-1 container', () => {
      render(<AppLayout>{mockChildren}</AppLayout>);

      const breadcrumbsContainer =
        screen.getByTestId('breadcrumbs').parentElement;
      expect(breadcrumbsContainer).toHaveClass('flex-1');
    });

    test('header contains theme toggle', () => {
      render(<AppLayout>{mockChildren}</AppLayout>);

      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    });

    test('header contains user avatar button', () => {
      render(<AppLayout>{mockChildren}</AppLayout>);

      const userButton = screen.getByRole('button', { name: '' }); // SVG button
      expect(userButton).toHaveClass(
        'rounded-full bg-primary p-2 text-primary-foreground'
      );
    });
  });

  describe('Accessibility Features', () => {
    test('mobile menu button has proper aria-label', () => {
      mockWindowInnerWidth(768);

      act(() => {
        render(<AppLayout>{mockChildren}</AppLayout>);
        fireEvent(window, new Event('resize'));
      });

      const mobileMenuButton = screen.getByLabelText('Open menu');
      expect(mobileMenuButton).toHaveAttribute('aria-label', 'Open menu');
    });

    test('main content has proper role', () => {
      render(<AppLayout>{mockChildren}</AppLayout>);

      const mainElement = screen.getByRole('main');
      expect(mainElement).toBeInTheDocument();
      expect(mainElement).toHaveClass('flex-1 overflow-auto');
    });

    test('header has proper role', () => {
      render(<AppLayout>{mockChildren}</AppLayout>);

      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
    });
  });

  describe('Mobile Menu Button Icon', () => {
    test('mobile menu button contains hamburger icon', () => {
      mockWindowInnerWidth(768);

      act(() => {
        render(<AppLayout>{mockChildren}</AppLayout>);
        fireEvent(window, new Event('resize'));
      });

      const mobileMenuButton = screen.getByLabelText('Open menu');
      const svg = mobileMenuButton.querySelector('svg');

      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('h-6 w-6');
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    });
  });

  describe('Layout State Management', () => {
    test('maintains separate state for sidebar and mobile menu visibility', () => {
      mockWindowInnerWidth(768);

      act(() => {
        render(<AppLayout>{mockChildren}</AppLayout>);
        fireEvent(window, new Event('resize'));
      });

      // Initially: sidebar closed, mobile menu closed
      expect(screen.getByTestId('sidebar')).toHaveAttribute(
        'data-open',
        'false'
      );
      expect(screen.getByTestId('mobile-menu')).toHaveAttribute(
        'data-open',
        'false'
      );

      // Open mobile menu
      const mobileMenuButton = screen.getByLabelText('Open menu');
      act(() => {
        fireEvent.click(mobileMenuButton);
      });

      // Now: sidebar still closed, mobile menu open
      expect(screen.getByTestId('sidebar')).toHaveAttribute(
        'data-open',
        'false'
      );
      expect(screen.getByTestId('mobile-menu')).toHaveAttribute(
        'data-open',
        'true'
      );
    });
  });
});

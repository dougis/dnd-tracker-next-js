import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MobileMenu } from '../MobileMenu';
import { setupLayoutTest, mockUsePathname } from './test-utils';
import {
  assertUserProfile,
  assertActiveNavigation,
  assertInactiveNavigation,
  assertSvgIcon,
} from './shared-assertions';
import {
  testNavigationLinks,
  NAVIGATION_ITEMS,
} from './navigation-test-helpers';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({
    children,
    href,
    className,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
    onClick?: () => void;
  }) {
    return React.createElement(
      'a',
      { href, className, onClick, ...props },
      children
    );
  };
});

describe('MobileMenu', () => {
  const mockOnClose = jest.fn();
  const { cleanup } = setupLayoutTest();

  beforeEach(() => {
    mockUsePathname.mockReturnValue('/');
  });

  afterEach(() => {
    cleanup();
  });

  describe('Visibility Behavior', () => {
    test('renders when isOpen is true', () => {
      render(<MobileMenu isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText('D&D Tracker')).toBeInTheDocument();
    });

    test('does not render when isOpen is false', () => {
      render(<MobileMenu isOpen={false} onClose={mockOnClose} />);

      expect(screen.queryByText('D&D Tracker')).not.toBeInTheDocument();
    });

    test('returns null when isOpen is false', () => {
      const { container } = render(
        <MobileMenu isOpen={false} onClose={mockOnClose} />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Body Scroll Management', () => {
    test('disables body scroll when menu is open', () => {
      act(() => {
        render(<MobileMenu isOpen={true} onClose={mockOnClose} />);
      });

      expect(document.body.style.overflow).toBe('hidden');
    });

    test('restores body scroll when menu is closed', () => {
      const { rerender } = render(
        <MobileMenu isOpen={true} onClose={mockOnClose} />
      );

      // Verify scroll is disabled
      expect(document.body.style.overflow).toBe('hidden');

      // Close menu
      act(() => {
        rerender(<MobileMenu isOpen={false} onClose={mockOnClose} />);
      });

      expect(document.body.style.overflow).toBe('unset');
    });

    test('restores body scroll on component unmount', () => {
      const { unmount } = render(
        <MobileMenu isOpen={true} onClose={mockOnClose} />
      );

      expect(document.body.style.overflow).toBe('hidden');

      act(() => {
        unmount();
      });

      expect(document.body.style.overflow).toBe('unset');
    });
  });

  describe('Layout Structure', () => {
    test('renders backdrop overlay', () => {
      const { container } = render(
        <MobileMenu isOpen={true} onClose={mockOnClose} />
      );

      const backdrop = container.querySelector(
        '.fixed.inset-0.z-40.bg-black\\/50.lg\\:hidden'
      );
      expect(backdrop).toBeInTheDocument();
      expect(backdrop).toHaveClass('fixed inset-0 z-40 bg-black/50 lg:hidden');
    });

    test('renders mobile menu panel with correct styling', () => {
      const { container } = render(
        <MobileMenu isOpen={true} onClose={mockOnClose} />
      );

      const menuPanel = container.querySelector(
        '.fixed.inset-y-0.left-0.z-50.w-64'
      );
      expect(menuPanel).toBeInTheDocument();
      expect(menuPanel).toHaveClass(
        'bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:hidden'
      );
    });

    test('has flex column layout structure', () => {
      const { container } = render(
        <MobileMenu isOpen={true} onClose={mockOnClose} />
      );

      const flexContainer = container.querySelector('.flex.h-full.flex-col');
      expect(flexContainer).toBeInTheDocument();
    });

    test('contains header, navigation, and footer sections', () => {
      render(<MobileMenu isOpen={true} onClose={mockOnClose} />);

      // Header with logo and close button
      expect(screen.getByText('D&D Tracker')).toBeInTheDocument();
      expect(screen.getByLabelText('Close menu')).toBeInTheDocument();

      // Navigation section
      expect(screen.getByRole('navigation')).toBeInTheDocument();

      // Footer with user info
      expect(screen.getByText('Demo User')).toBeInTheDocument();
      expect(screen.getByText('demo@example.com')).toBeInTheDocument();
    });
  });

  describe('Header Section', () => {
    test('renders brand logo with correct styling', () => {
      render(<MobileMenu isOpen={true} onClose={mockOnClose} />);

      const logoContainer = screen.getByText('D&D Tracker').parentElement;
      expect(logoContainer).toBeInTheDocument();

      const iconContainer = logoContainer?.querySelector('.flex.h-8.w-8');
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveClass(
        'bg-primary text-primary-foreground rounded-lg'
      );
    });

    test('brand title has fantasy font class', () => {
      render(<MobileMenu isOpen={true} onClose={mockOnClose} />);

      const brandTitle = screen.getByText('D&D Tracker');
      expect(brandTitle).toHaveClass(
        'text-lg font-fantasy font-bold text-foreground'
      );
    });

    test('header has correct height and styling', () => {
      render(<MobileMenu isOpen={true} onClose={mockOnClose} />);

      const header = screen.getByText('D&D Tracker').closest('.flex.h-16');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass(
        'items-center justify-between border-b border-border px-4'
      );
    });
  });

  describe('Close Button', () => {
    test('renders close button with correct accessibility', () => {
      render(<MobileMenu isOpen={true} onClose={mockOnClose} />);

      const closeButton = screen.getByLabelText('Close menu');
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveAttribute('aria-label', 'Close menu');
    });

    test('close button has correct styling', () => {
      render(<MobileMenu isOpen={true} onClose={mockOnClose} />);

      const closeButton = screen.getByLabelText('Close menu');
      expect(closeButton).toHaveClass(
        'rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      );
    });

    test('close button contains X icon', () => {
      render(<MobileMenu isOpen={true} onClose={mockOnClose} />);

      const closeButton = screen.getByLabelText('Close menu');
      const icon = closeButton.querySelector('svg');

      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('h-6 w-6');
      expect(icon).toHaveAttribute('viewBox', '0 0 24 24');

      const path = icon?.querySelector('path');
      expect(path).toHaveAttribute('d', 'M6 18L18 6M6 6l12 12');
    });

    test('calls onClose when close button is clicked', () => {
      render(<MobileMenu isOpen={true} onClose={mockOnClose} />);

      const closeButton = screen.getByLabelText('Close menu');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Backdrop Interaction', () => {
    test('calls onClose when backdrop is clicked', () => {
      const { container } = render(
        <MobileMenu isOpen={true} onClose={mockOnClose} />
      );

      const backdrop = container.querySelector(
        '.fixed.inset-0.z-40.bg-black\\/50.lg\\:hidden'
      );
      fireEvent.click(backdrop!);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('backdrop has proper z-index for overlay', () => {
      const { container } = render(
        <MobileMenu isOpen={true} onClose={mockOnClose} />
      );

      const backdrop = container.querySelector(
        '.fixed.inset-0.z-40.bg-black\\/50.lg\\:hidden'
      );
      expect(backdrop).toHaveClass('z-40');
    });
  });

  describe('Navigation Items', () => {
    test('renders all navigation items', () => {
      render(<MobileMenu isOpen={true} onClose={mockOnClose} />);

      NAVIGATION_ITEMS.forEach(item => {
        expect(screen.getByText(item.text)).toBeInTheDocument();
      });
    });

    test('navigation items have correct href attributes', () => {
      render(<MobileMenu isOpen={true} onClose={mockOnClose} />);
      testNavigationLinks();
    });

    test('navigation items have icons', () => {
      render(<MobileMenu isOpen={true} onClose={mockOnClose} />);

      const dashboardLink = screen.getByText('Dashboard').closest('a');
      assertSvgIcon(dashboardLink);
    });

    test('navigation links call onClose when clicked', () => {
      render(<MobileMenu isOpen={true} onClose={mockOnClose} />);

      const dashboardLink = screen.getByText('Dashboard').closest('a');
      fireEvent.click(dashboardLink!);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Active State Handling', () => {
    test('highlights active navigation item based on current pathname', () => {
      mockUsePathname.mockReturnValue('/characters');
      render(<MobileMenu isOpen={true} onClose={mockOnClose} />);
      assertActiveNavigation('Characters');
    });

    test('inactive navigation items have muted styling', () => {
      mockUsePathname.mockReturnValue('/characters');
      render(<MobileMenu isOpen={true} onClose={mockOnClose} />);
      assertInactiveNavigation('Dashboard');
    });

    test('active state works for root path', () => {
      mockUsePathname.mockReturnValue('/');
      render(<MobileMenu isOpen={true} onClose={mockOnClose} />);
      assertActiveNavigation('Dashboard');
    });

    test('only one navigation item is active at a time', () => {
      mockUsePathname.mockReturnValue('/combat');
      render(<MobileMenu isOpen={true} onClose={mockOnClose} />);

      assertActiveNavigation('Combat');
      assertInactiveNavigation('Dashboard');
      assertInactiveNavigation('Characters');
    });
  });

  describe('User Profile Footer', () => {
    test('renders user profile section', () => {
      render(<MobileMenu isOpen={true} onClose={mockOnClose} />);
      assertUserProfile();
    });

    test('user profile has correct styling', () => {
      render(<MobileMenu isOpen={true} onClose={mockOnClose} />);

      const userSection = screen
        .getByText('Demo User')
        .closest('.border-t.border-border.p-4');
      expect(userSection).toBeInTheDocument();
    });

    test('user avatar placeholder exists', () => {
      render(<MobileMenu isOpen={true} onClose={mockOnClose} />);

      const avatar = screen
        .getByText('Demo User')
        .parentElement?.parentElement?.querySelector(
          '.h-8.w-8.rounded-full.bg-muted'
        );
      expect(avatar).toBeInTheDocument();
    });

    test('user info has proper text truncation', () => {
      render(<MobileMenu isOpen={true} onClose={mockOnClose} />);

      const userName = screen.getByText('Demo User');
      const userEmail = screen.getByText('demo@example.com');

      expect(userName).toHaveClass(
        'text-sm font-medium text-foreground truncate'
      );
      expect(userEmail).toHaveClass('text-xs text-muted-foreground truncate');
    });
  });

  describe('Mobile-Specific Design', () => {
    test('has lg:hidden class to hide on desktop', () => {
      const { container } = render(
        <MobileMenu isOpen={true} onClose={mockOnClose} />
      );

      const backdrop = container.querySelector(
        '.fixed.inset-0.z-40.bg-black\\/50.lg\\:hidden'
      );
      const menuPanel = container.querySelector(
        '.fixed.inset-y-0.left-0.z-50.w-64'
      );

      expect(backdrop).toHaveClass('lg:hidden');
      expect(menuPanel).toHaveClass('lg:hidden');
    });

    test('navigation links have proper hover states', () => {
      render(<MobileMenu isOpen={true} onClose={mockOnClose} />);

      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(dashboardLink).toHaveClass('transition-colors');
    });

    test('navigation links have consistent spacing and padding', () => {
      render(<MobileMenu isOpen={true} onClose={mockOnClose} />);

      const links = screen.getAllByRole('link');
      const navigationLinks = links.filter(link =>
        link.className.includes('group flex items-center rounded-md px-3 py-2')
      );

      expect(navigationLinks.length).toBeGreaterThan(0);
      for (const link of navigationLinks) {
        expect(link).toHaveClass('px-3 py-2 rounded-md');
      }
    });
  });

  describe('Animation and Transitions', () => {
    test('menu panel has transition classes', () => {
      const { container } = render(
        <MobileMenu isOpen={true} onClose={mockOnClose} />
      );

      const menuPanel = container.querySelector(
        '.fixed.inset-y-0.left-0.z-50.w-64'
      );
      expect(menuPanel).toHaveClass(
        'transform transition-transform duration-300 ease-in-out'
      );
    });

    test('navigation section has proper spacing', () => {
      render(<MobileMenu isOpen={true} onClose={mockOnClose} />);

      const navigation = screen.getByRole('navigation');
      expect(navigation).toHaveClass('flex-1 space-y-1 px-3 py-4');
    });
  });

  describe('Z-Index Stacking', () => {
    test('backdrop has lower z-index than menu panel', () => {
      const { container } = render(
        <MobileMenu isOpen={true} onClose={mockOnClose} />
      );

      const backdrop = container.querySelector(
        '.fixed.inset-0.z-40.bg-black\\/50.lg\\:hidden'
      );
      const menuPanel = container.querySelector(
        '.fixed.inset-y-0.left-0.z-50.w-64'
      );

      expect(backdrop).toHaveClass('z-40');
      expect(menuPanel).toHaveClass('z-50');
    });
  });
});

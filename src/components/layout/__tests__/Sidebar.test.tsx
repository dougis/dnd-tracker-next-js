import React from 'react';
import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '../Sidebar';
import { setupLayoutTest, mockUsePathname } from './test-utils';
import { assertUserProfile, assertActiveNavigation, assertInactiveNavigation, assertSvgIcon } from './shared-assertions';
import { testNavigationLinks, NAVIGATION_ITEMS } from './navigation-test-helpers';

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
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) {
    return React.createElement('a', { href, className, ...props }, children);
  };
});

describe('Sidebar', () => {
  const { cleanup } = setupLayoutTest();

  beforeEach(() => {
    mockUsePathname.mockReturnValue('/');
  });

  afterEach(() => {
    cleanup();
  });

  describe('Visibility Behavior', () => {
    test('renders when isOpen is true', () => {
      render(<Sidebar isOpen={true} />);

      expect(screen.getByText('D&D Tracker')).toBeInTheDocument();
    });

    test('does not render when isOpen is false', () => {
      render(<Sidebar isOpen={false} />);

      expect(screen.queryByText('D&D Tracker')).not.toBeInTheDocument();
    });

    test('returns null when isOpen is false', () => {
      const { container } = render(<Sidebar isOpen={false} />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Layout Structure', () => {
    test('applies correct CSS classes for sidebar positioning', () => {
      const { container } = render(<Sidebar isOpen={true} />);

      const sidebarElement = container.firstChild as HTMLElement;
      expect(sidebarElement).toHaveClass(
        'fixed', 'inset-y-0', 'left-0', 'z-50', 'w-64',
        'bg-card', 'border-r', 'border-border',
        'transition-transform', 'duration-300', 'ease-in-out',
        'lg:relative', 'lg:z-auto'
      );
    });

    test('has flex column layout structure', () => {
      const { container } = render(<Sidebar isOpen={true} />);

      const flexContainer = container.querySelector('.flex.h-full.flex-col');
      expect(flexContainer).toBeInTheDocument();
    });

    test('contains header, navigation, and footer sections', () => {
      render(<Sidebar isOpen={true} />);

      // Header with logo
      expect(screen.getByText('D&D Tracker')).toBeInTheDocument();

      // Navigation section
      expect(screen.getByRole('navigation')).toBeInTheDocument();

      // Footer with user info
      expect(screen.getByText('Demo User')).toBeInTheDocument();
      expect(screen.getByText('demo@example.com')).toBeInTheDocument();
    });
  });

  describe('Brand/Logo Section', () => {
    test('renders brand logo with correct styling', () => {
      render(<Sidebar isOpen={true} />);

      const logoContainer = screen.getByText('D&D Tracker').parentElement;
      expect(logoContainer).toBeInTheDocument();

      const iconContainer = logoContainer?.parentElement?.querySelector('.flex.h-8.w-8');
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveClass('bg-primary', 'text-primary-foreground', 'rounded-lg');
    });

    test('brand header has correct height and styling', () => {
      render(<Sidebar isOpen={true} />);

      const brandHeader = screen.getByText('D&D Tracker').closest('.flex.h-16');
      expect(brandHeader).toBeInTheDocument();
      expect(brandHeader).toHaveClass('border-b', 'border-border', 'px-6');
    });

    test('brand title has fantasy font class', () => {
      render(<Sidebar isOpen={true} />);

      const brandTitle = screen.getByText('D&D Tracker');
      expect(brandTitle).toHaveClass('text-lg', 'font-fantasy', 'font-bold', 'text-foreground');
    });
  });

  describe('Navigation Items', () => {
    test('renders all primary navigation items', () => {
      render(<Sidebar isOpen={true} />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Characters')).toBeInTheDocument();
      expect(screen.getByText('Parties')).toBeInTheDocument();
      expect(screen.getByText('Encounters')).toBeInTheDocument();
      expect(screen.getByText('Combat')).toBeInTheDocument();
    });

    test('renders all secondary navigation items', () => {
      render(<Sidebar isOpen={true} />);

      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Help')).toBeInTheDocument();
    });

    test('navigation items have correct href attributes', () => {
      render(<Sidebar isOpen={true} />);

      expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/');
      expect(screen.getByText('Characters').closest('a')).toHaveAttribute('href', '/characters');
      expect(screen.getByText('Parties').closest('a')).toHaveAttribute('href', '/parties');
      expect(screen.getByText('Encounters').closest('a')).toHaveAttribute('href', '/encounters');
      expect(screen.getByText('Combat').closest('a')).toHaveAttribute('href', '/combat');
      expect(screen.getByText('Settings').closest('a')).toHaveAttribute('href', '/settings');
      expect(screen.getByText('Help').closest('a')).toHaveAttribute('href', '/help');
    });

    test('navigation items have icons', () => {
      render(<Sidebar isOpen={true} />);

      const dashboardLink = screen.getByText('Dashboard').closest('a');
      const icon = dashboardLink?.querySelector('svg');

      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('h-5', 'w-5');
      expect(icon).toHaveAttribute('viewBox', '0 0 24 24');
    });

    test('has visual separator between primary and secondary navigation', () => {
      render(<Sidebar isOpen={true} />);

      const separator = screen.getByRole('navigation').querySelector('.border-t.border-border');
      expect(separator).toBeInTheDocument();
      expect(separator).toHaveClass('my-4');
    });
  });

  describe('Active State Handling', () => {
    test('highlights active navigation item based on current pathname', () => {
      mockUsePathname.mockReturnValue('/characters');
      render(<Sidebar isOpen={true} />);

      const charactersLink = screen.getByText('Characters').closest('a');
      expect(charactersLink).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    test('inactive navigation items have muted styling', () => {
      mockUsePathname.mockReturnValue('/characters');
      render(<Sidebar isOpen={true} />);

      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(dashboardLink).toHaveClass('text-muted-foreground');
      expect(dashboardLink).not.toHaveClass('bg-primary');
    });

    test('active state works for root path', () => {
      mockUsePathname.mockReturnValue('/');
      render(<Sidebar isOpen={true} />);

      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(dashboardLink).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    test('active state works for secondary navigation items', () => {
      mockUsePathname.mockReturnValue('/settings');
      render(<Sidebar isOpen={true} />);

      const settingsLink = screen.getByText('Settings').closest('a');
      expect(settingsLink).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    test('only one navigation item is active at a time', () => {
      mockUsePathname.mockReturnValue('/combat');
      render(<Sidebar isOpen={true} />);

      const combatLink = screen.getByText('Combat').closest('a');
      const dashboardLink = screen.getByText('Dashboard').closest('a');
      const charactersLink = screen.getByText('Characters').closest('a');

      expect(combatLink).toHaveClass('bg-primary', 'text-primary-foreground');
      expect(dashboardLink).not.toHaveClass('bg-primary');
      expect(charactersLink).not.toHaveClass('bg-primary');
    });
  });

  describe('User Profile Footer', () => {
    test('renders user profile section', () => {
      render(<Sidebar isOpen={true} />);

      expect(screen.getByText('Demo User')).toBeInTheDocument();
      expect(screen.getByText('demo@example.com')).toBeInTheDocument();
    });

    test('user profile has correct styling', () => {
      render(<Sidebar isOpen={true} />);

      const userSection = screen.getByText('Demo User').closest('.border-t.border-border.p-4');
      expect(userSection).toBeInTheDocument();
    });

    test('user avatar placeholder exists', () => {
      render(<Sidebar isOpen={true} />);

      const avatar = screen.getByText('Demo User').parentElement?.parentElement?.querySelector('.h-8.w-8.rounded-full.bg-muted');
      expect(avatar).toBeInTheDocument();
    });

    test('user info has proper text truncation', () => {
      render(<Sidebar isOpen={true} />);

      const userName = screen.getByText('Demo User');
      const userEmail = screen.getByText('demo@example.com');

      expect(userName).toHaveClass('text-sm', 'font-medium', 'text-foreground', 'truncate');
      expect(userEmail).toHaveClass('text-xs', 'text-muted-foreground', 'truncate');
    });
  });

  describe('Navigation Link Component', () => {
    test('navigation links have proper hover states', () => {
      render(<Sidebar isOpen={true} />);

      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(dashboardLink).toHaveClass('transition-colors');
    });

    test('navigation links have consistent spacing and padding', () => {
      render(<Sidebar isOpen={true} />);

      const links = screen.getAllByRole('link');
      const navigationLinks = links.filter(link =>
        link.className.includes('group flex items-center rounded-md px-3 py-2')
      );

      expect(navigationLinks.length).toBeGreaterThan(0);
      for (const link of navigationLinks) {
        expect(link).toHaveClass('px-3', 'py-2', 'rounded-md');
      }
    });

    test('navigation icons have consistent sizing', () => {
      render(<Sidebar isOpen={true} />);

      const navigationSection = screen.getByRole('navigation');
      const icons = navigationSection.querySelectorAll('svg');

      for (const icon of icons) {
        expect(icon).toHaveClass('h-5', 'w-5');
      }
    });
  });

  describe('Responsive Design Classes', () => {
    test('has correct z-index classes for mobile and desktop', () => {
      const { container } = render(<Sidebar isOpen={true} />);

      const sidebar = container.firstChild as HTMLElement;
      expect(sidebar).toHaveClass('z-50', 'lg:z-auto');
    });

    test('has correct positioning classes for mobile and desktop', () => {
      const { container } = render(<Sidebar isOpen={true} />);

      const sidebar = container.firstChild as HTMLElement;
      expect(sidebar).toHaveClass('fixed', 'lg:relative');
    });

    test('navigation sections have proper spacing', () => {
      render(<Sidebar isOpen={true} />);

      const navigation = screen.getByRole('navigation');
      expect(navigation).toHaveClass('flex-1', 'space-y-1', 'px-3', 'py-4');
    });
  });
});

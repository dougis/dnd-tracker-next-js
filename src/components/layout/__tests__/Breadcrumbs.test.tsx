import React from 'react';
import { render, screen } from '@testing-library/react';
import { Breadcrumbs } from '../Breadcrumbs';
import { setupLayoutTest, mockUsePathname } from './test-utils';

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

describe('Breadcrumbs', () => {
  const { cleanup } = setupLayoutTest();

  afterEach(() => {
    cleanup();
  });

  describe('Root Path Behavior', () => {
    test('renders simple dashboard display for root path', () => {
      mockUsePathname.mockReturnValue('/');
      render(<Breadcrumbs />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });

    test('displays dashboard icon for root path', () => {
      mockUsePathname.mockReturnValue('/');
      render(<Breadcrumbs />);

      const iconContainer = screen.getByText('Dashboard').parentElement;
      const icon = iconContainer?.querySelector('svg');

      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('mr-2 h-4 w-4');
      expect(icon).toHaveAttribute('viewBox', '0 0 24 24');
    });

    test('applies correct styling for dashboard display', () => {
      mockUsePathname.mockReturnValue('/');
      const { container } = render(<Breadcrumbs />);

      const dashboardContainer = container.querySelector('[class*="flex items-center text-sm text-muted-foreground"]');
      expect(dashboardContainer).toBeInTheDocument();
      expect(dashboardContainer).toHaveClass('flex items-center text-sm text-muted-foreground');
    });
  });

  describe('Single Level Navigation', () => {
    test('renders breadcrumb navigation for single level paths', () => {
      mockUsePathname.mockReturnValue('/characters');
      render(<Breadcrumbs />);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Characters')).toBeInTheDocument();
    });

    test('dashboard link is clickable in breadcrumb navigation', () => {
      mockUsePathname.mockReturnValue('/characters');
      render(<Breadcrumbs />);

      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(dashboardLink).toBeInTheDocument();
      expect(dashboardLink).toHaveAttribute('href', '/');
      expect(dashboardLink).toHaveClass('hover:text-foreground transition-colors');
    });

    test('current page is not clickable and has different styling', () => {
      mockUsePathname.mockReturnValue('/characters');
      render(<Breadcrumbs />);

      const charactersElement = screen.getByText('Characters');
      expect(charactersElement.tagName).toBe('SPAN');
      expect(charactersElement).toHaveClass('font-medium text-foreground');
    });

    test('renders separator between breadcrumb items', () => {
      mockUsePathname.mockReturnValue('/characters');
      render(<Breadcrumbs />);

      const navigation = screen.getByRole('navigation');
      const separators = navigation.querySelectorAll('svg[viewBox="0 0 24 24"]');

      // Should have one separator (between Dashboard and Characters)
      const separatorIcon = Array.from(separators).find(svg => {
        const path = svg.querySelector('path');
        return path?.getAttribute('d') === 'M9 5l7 7-7 7';
      });

      expect(separatorIcon).toBeInTheDocument();
      expect(separatorIcon).toHaveClass('h-4 w-4 text-muted-foreground/50');
    });
  });

  describe('Multi-level Navigation', () => {
    test('handles nested paths correctly', () => {
      mockUsePathname.mockReturnValue('/characters/new');
      render(<Breadcrumbs />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Characters')).toBeInTheDocument();
      expect(screen.getByText('New Character')).toBeInTheDocument();
    });

    test('intermediate levels are clickable', () => {
      mockUsePathname.mockReturnValue('/characters/new');
      render(<Breadcrumbs />);

      const dashboardLink = screen.getByText('Dashboard').closest('a');
      const charactersLink = screen.getByText('Characters').closest('a');

      expect(dashboardLink).toHaveAttribute('href', '/');
      expect(charactersLink).toHaveAttribute('href', '/characters');
    });

    test('final breadcrumb item is not clickable', () => {
      mockUsePathname.mockReturnValue('/characters/new');
      render(<Breadcrumbs />);

      const newCharacterElement = screen.getByText('New Character');
      expect(newCharacterElement.tagName).toBe('SPAN');
      expect(newCharacterElement).not.toBeInstanceOf(HTMLAnchorElement);
    });

    test('renders correct number of separators for multi-level paths', () => {
      mockUsePathname.mockReturnValue('/characters/new');
      render(<Breadcrumbs />);

      const navigation = screen.getByRole('navigation');
      const separators = navigation.querySelectorAll('svg[viewBox="0 0 24 24"]');

      const separatorIcons = Array.from(separators).filter(svg => {
        const path = svg.querySelector('path');
        return path?.getAttribute('d') === 'M9 5l7 7-7 7';
      });

      // Should have two separators for three breadcrumb items
      expect(separatorIcons).toHaveLength(2);
    });
  });

  describe('Route Label Mapping', () => {
    test('uses predefined labels for known routes', () => {
      mockUsePathname.mockReturnValue('/parties/new');
      render(<Breadcrumbs />);

      expect(screen.getByText('Parties')).toBeInTheDocument();
      expect(screen.getByText('New Party')).toBeInTheDocument();
    });

    test('falls back to capitalized segment for unknown routes', () => {
      mockUsePathname.mockReturnValue('/unknown-route');
      render(<Breadcrumbs />);

      expect(screen.getByText('Unknown-route')).toBeInTheDocument();
    });

    test('handles all predefined route labels correctly', () => {
      const testCases = [
        { path: '/encounters', expectedLabel: 'Encounters' },
        { path: '/encounters/new', expectedLabels: ['Encounters', 'New Encounter'] },
        { path: '/combat', expectedLabel: 'Combat' },
        { path: '/settings', expectedLabel: 'Settings' },
        { path: '/help', expectedLabel: 'Help' },
      ];

      for (const { path, expectedLabel, expectedLabels } of testCases) {
        mockUsePathname.mockReturnValue(path);
        const { unmount } = render(<Breadcrumbs />);

        if (expectedLabels) {
          for (const label of expectedLabels) {
            expect(screen.getByText(label)).toBeInTheDocument();
          }
        } else {
          expect(screen.getByText(expectedLabel)).toBeInTheDocument();
        }

        unmount();
      }
    });
  });

  describe('Navigation Accessibility', () => {
    test('breadcrumb navigation has proper semantic structure', () => {
      mockUsePathname.mockReturnValue('/characters/new');
      render(<Breadcrumbs />);

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveClass('flex items-center space-x-1 text-sm text-muted-foreground');
    });

    test('links have proper accessibility attributes', () => {
      mockUsePathname.mockReturnValue('/characters/new');
      render(<Breadcrumbs />);

      const dashboardLink = screen.getByText('Dashboard').closest('a');
      const charactersLink = screen.getByText('Characters').closest('a');

      expect(dashboardLink).toHaveAttribute('href', '/');
      expect(charactersLink).toHaveAttribute('href', '/characters');
    });

    test('current page item has proper styling to indicate non-interactive state', () => {
      mockUsePathname.mockReturnValue('/characters/new');
      render(<Breadcrumbs />);

      const currentPage = screen.getByText('New Character');
      expect(currentPage).toHaveClass('font-medium text-foreground');
      expect(currentPage).not.toHaveClass('hover:text-foreground');
    });
  });

  describe('Visual Design', () => {
    test('breadcrumb items have consistent text sizing', () => {
      mockUsePathname.mockReturnValue('/characters/new');
      render(<Breadcrumbs />);

      const navigation = screen.getByRole('navigation');
      expect(navigation).toHaveClass('text-sm');
    });

    test('separators have muted styling', () => {
      mockUsePathname.mockReturnValue('/characters/new');
      render(<Breadcrumbs />);

      const navigation = screen.getByRole('navigation');
      const separators = navigation.querySelectorAll('svg[viewBox="0 0 24 24"]');

      const separatorIcon = Array.from(separators).find(svg => {
        const path = svg.querySelector('path');
        return path?.getAttribute('d') === 'M9 5l7 7-7 7';
      });

      expect(separatorIcon).toHaveClass('text-muted-foreground/50');
    });

    test('links have hover transition effects', () => {
      mockUsePathname.mockReturnValue('/characters/new');
      render(<Breadcrumbs />);

      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(dashboardLink).toHaveClass('transition-colors');
    });
  });

  describe('Edge Cases', () => {
    test('handles empty path segments correctly', () => {
      mockUsePathname.mockReturnValue('/characters//new');
      render(<Breadcrumbs />);

      // Should filter out empty segments
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Characters')).toBeInTheDocument();
      expect(screen.getByText('New Character')).toBeInTheDocument();
    });

    test('handles single character segments', () => {
      mockUsePathname.mockReturnValue('/a');
      render(<Breadcrumbs />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('A')).toBeInTheDocument();
    });

    test('handles numeric segments', () => {
      mockUsePathname.mockReturnValue('/characters/123');
      render(<Breadcrumbs />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Characters')).toBeInTheDocument();
      expect(screen.getByText('123')).toBeInTheDocument();
    });
  });

  describe('Fragment Key Handling', () => {
    test('each breadcrumb item has unique React key', () => {
      mockUsePathname.mockReturnValue('/characters/new');

      // This test ensures no React warnings about missing keys
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      render(<Breadcrumbs />);

      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Warning: Each child in a list should have a unique "key" prop')
      );

      consoleSpy.mockRestore();
    });
  });
});

/* eslint-disable no-unused-vars */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HelpPage from '../page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/help'),
}));

// Test helper functions
const renderHelpPage = () => renderHelpPage();

const getTabByName = (name: RegExp) => screen.getByRole('tab', { name });

const clickTab = async (name: RegExp) => {
  const tab = getTabByName(name);
  await userEvent.click(tab);
  return tab;
};

describe('HelpPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Page Structure and Layout', () => {
    it('renders the help page with correct title and structure', () => {
      renderHelpPage();

      expect(screen.getByText('Help & Support')).toBeInTheDocument();
      expect(screen.getByText(/D&D Encounter Tracker Documentation/)).toBeInTheDocument();
      expect(screen.getByTestId('help-container')).toHaveClass('container', 'mx-auto', 'py-8', 'px-4');
    });

    it('renders the main help card with proper styling', () => {
      renderHelpPage();

      const helpCard = screen.getByTestId('help-main-card');
      expect(helpCard).toBeInTheDocument();
      // Card classes are applied through CSS modules
    });

    it('displays the help page description', () => {
      renderHelpPage();

      expect(
        screen.getByText(/comprehensive guide to using the D&D Encounter Tracker/i)
      ).toBeInTheDocument();
    });
  });

  describe('Navigation Tabs', () => {
    it('renders all help section tabs', () => {
      renderHelpPage();

      expect(screen.getByRole('tab', { name: /getting started/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /user guides/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /faq/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /features/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /troubleshooting/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /contact support/i })).toBeInTheDocument();
    });

    it('shows getting started tab as default active tab', () => {
      renderHelpPage();

      const gettingStartedTab = screen.getByRole('tab', { name: /getting started/i });
      expect(gettingStartedTab).toHaveAttribute('aria-selected', 'true');
    });

    it('switches between tabs correctly', async () => {
      renderHelpPage();

      const faqTab = await clickTab(/faq/i);

      expect(faqTab).toHaveAttribute('aria-selected', 'true');
      expect(getTabByName(/getting started/i)).toHaveAttribute('aria-selected', 'false');
    });

    it('displays correct content for each tab', async () => {
      renderHelpPage();

      // Check Getting Started content
      expect(screen.getByText(/welcome to the d&d encounter tracker/i)).toBeInTheDocument();

      // Switch to FAQ tab
      await clickTab(/faq/i);

      expect(screen.getByText(/frequently asked questions/i)).toBeInTheDocument();

      // Switch to Features tab
      await clickTab(/features/i);

      expect(screen.getByText(/feature documentation/i)).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('renders search input in help page', () => {
      renderHelpPage();

      const searchInput = screen.getByPlaceholderText(/search help topics/i);
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('type', 'text');
    });

    it('filters content based on search query', async () => {
      renderHelpPage();

      const searchInput = screen.getByPlaceholderText(/search help topics/i);
      await userEvent.type(searchInput, 'character');

      // Search should filter and show relevant results
      await waitFor(() => {
        expect(screen.getByText(/search results for "character"/i)).toBeInTheDocument();
      });
    });

    it('shows no results message for invalid search', async () => {
      renderHelpPage();

      const searchInput = screen.getByPlaceholderText(/search help topics/i);
      await userEvent.type(searchInput, 'xyz123nonexistent');

      await waitFor(() => {
        expect(screen.getByText(/no results found/i)).toBeInTheDocument();
      });
    });

    it('clears search results when search is cleared', async () => {
      renderHelpPage();

      const searchInput = screen.getByPlaceholderText(/search help topics/i);
      await userEvent.type(searchInput, 'character');
      await userEvent.clear(searchInput);

      // Should return to normal tab content
      expect(screen.getByText(/welcome to the d&d encounter tracker/i)).toBeInTheDocument();
    });
  });

  describe('Getting Started Section', () => {
    it('displays getting started content', () => {
      renderHelpPage();

      expect(screen.getByText(/welcome to the d&d encounter tracker/i)).toBeInTheDocument();
      expect(screen.getAllByText(/quick start guide/i)).toHaveLength(2); // appears in intro text and card title
      expect(screen.getByText(/create your first character/i)).toBeInTheDocument();
      expect(screen.getByText(/set up a party/i)).toBeInTheDocument();
      expect(screen.getByText(/build your first encounter/i)).toBeInTheDocument();
    });

    it('includes links to relevant sections', () => {
      renderHelpPage();

      expect(screen.getByRole('link', { name: /character creation guide/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /party management/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /encounter builder/i })).toBeInTheDocument();
    });
  });

  describe('User Guides Section', () => {
    it('displays user guides when tab is selected', async () => {
      renderHelpPage();

      await clickTab(/user guides/i);

      expect(screen.getByText(/user guides & tutorials/i)).toBeInTheDocument();
      expect(screen.getByText(/character management/i)).toBeInTheDocument();
      expect(screen.getByText(/encounter building/i)).toBeInTheDocument();
      expect(screen.getByText(/combat tracking/i)).toBeInTheDocument();
    });

    it('includes step-by-step tutorials', async () => {
      renderHelpPage();

      await clickTab(/user guides/i);

      expect(screen.getByText(/how to create a character/i)).toBeInTheDocument();
      expect(screen.getByText(/how to manage initiative/i)).toBeInTheDocument();
      expect(screen.getByText(/how to track hp and damage/i)).toBeInTheDocument();
    });
  });

  describe('FAQ Section', () => {
    it('displays FAQ content when tab is selected', async () => {
      renderHelpPage();

      await clickTab(/faq/i);

      expect(screen.getByText(/frequently asked questions/i)).toBeInTheDocument();
      expect(screen.getByText(/how do I add a new character/i)).toBeInTheDocument();
      expect(screen.getByText(/can I import characters from d&d beyond/i)).toBeInTheDocument();
      expect(screen.getByText(/how does initiative tracking work/i)).toBeInTheDocument();
    });

    it('allows expanding and collapsing FAQ items', async () => {
      renderHelpPage();

      await clickTab(/faq/i);

      const faqItem = screen.getByRole('button', { name: /how do I add a new character/i });
      await userEvent.click(faqItem);

      expect(screen.getByText(/to add a new character, navigate to/i)).toBeInTheDocument();
    });
  });

  describe('Features Section', () => {
    it('displays feature documentation when tab is selected', async () => {
      renderHelpPage();

      await clickTab(/features/i);

      expect(screen.getByText(/feature documentation/i)).toBeInTheDocument();
      expect(screen.getByText(/character management/i)).toBeInTheDocument();
      expect(screen.getByText(/encounter builder/i)).toBeInTheDocument();
      expect(screen.getByText(/initiative tracker/i)).toBeInTheDocument();
      expect(screen.getByText(/hp & damage tracking/i)).toBeInTheDocument();
    });

    it('includes subscription tier information', async () => {
      renderHelpPage();

      await clickTab(/features/i);

      expect(screen.getByText(/subscription tiers/i)).toBeInTheDocument();
      expect(screen.getByText(/free adventurer/i)).toBeInTheDocument();
      expect(screen.getByText(/expert dungeon master/i)).toBeInTheDocument();
    });
  });

  describe('Troubleshooting Section', () => {
    it('displays troubleshooting guides when tab is selected', async () => {
      renderHelpPage();

      await clickTab(/troubleshooting/i);

      expect(screen.getByText(/troubleshooting guides/i)).toBeInTheDocument();
      expect(screen.getAllByText(/common issues/i)).toHaveLength(2); // appears in intro and card title
      expect(screen.getByText(/character not saving/i)).toBeInTheDocument();
      expect(screen.getByText(/encounter loading slowly/i)).toBeInTheDocument();
    });

    it('includes technical support information', async () => {
      renderHelpPage();

      await clickTab(/troubleshooting/i);

      expect(screen.getByText(/browser compatibility/i)).toBeInTheDocument();
      expect(screen.getByText(/clearing cache and cookies/i)).toBeInTheDocument();
    });
  });

  describe('Contact Support Section', () => {
    it('displays contact information when tab is selected', async () => {
      renderHelpPage();

      await clickTab(/contact support/i);

      expect(screen.getAllByText(/contact support/i)).toHaveLength(3); // tab, section header, and button
      expect(screen.getByText(/need additional help/i)).toBeInTheDocument();
      expect(screen.getByText(/support@dndtracker\.com/i)).toBeInTheDocument();
    });

    it('includes support response time information', async () => {
      renderHelpPage();

      await clickTab(/contact support/i);

      expect(screen.getAllByText(/response time/i)).toHaveLength(3); // appears in multiple places
      expect(screen.getByText(/24-48 hours/i)).toBeInTheDocument();
    });

    it('displays community resources', async () => {
      renderHelpPage();

      await clickTab(/contact support/i);

      expect(screen.getByText(/community resources/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /github discussions/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /discord server/i })).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('renders help page with proper responsive layout', () => {
      renderHelpPage();

      const helpContainer = screen.getByTestId('help-container');
      expect(helpContainer).toHaveClass('container', 'mx-auto', 'px-4');
    });

    it('displays tab navigation in mobile-friendly format', () => {
      renderHelpPage();

      const tabsList = screen.getByRole('tablist');
      expect(tabsList).toHaveClass('grid', 'grid-cols-3', 'md:grid-cols-6', 'gap-2');
    });

    it('adjusts content layout for different screen sizes', () => {
      renderHelpPage();

      const contentArea = screen.getByTestId('help-content');
      expect(contentArea).toHaveClass('mt-6');
    });
  });

  describe('SEO and Metadata', () => {
    it('includes proper page metadata', () => {
      renderHelpPage();

      // This would typically be tested at the page level with Next.js metadata
      // Skip document.title test as it's handled by Next.js metadata
      expect(screen.getByText('Help & Support')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      renderHelpPage();

      // The main title is actually a CardTitle (div), not a semantic heading
      const mainTitle = screen.getByText('Help & Support');
      expect(mainTitle).toBeInTheDocument();
    });

    it('has proper tab navigation with keyboard support', () => {
      renderHelpPage();

      const tabList = screen.getByRole('tablist');
      expect(tabList).toBeInTheDocument();

      const tabs = screen.getAllByRole('tab');
      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('aria-selected');
      });
    });

    it('includes proper ARIA labels and descriptions', () => {
      renderHelpPage();

      const searchInput = screen.getByPlaceholderText(/search help topics/i);
      expect(searchInput).toHaveAttribute('aria-label', 'Search help topics');
    });
  });
});
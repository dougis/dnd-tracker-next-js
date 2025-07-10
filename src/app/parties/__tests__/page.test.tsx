import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import PartiesPage from '../page';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock PartyListView component
jest.mock('@/components/party/PartyListView', () => ({
  PartyListView: function MockPartyListView() {
    return <div data-testid="party-list-view">Party List View</div>;
  },
}));

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
};

const mockSession = {
  user: {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
  },
};

describe('PartiesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSession as jest.Mock).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    });
  });

  describe('Page Structure', () => {
    it('should render the page title', () => {
      render(<PartiesPage />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Parties');
    });

    it('should render the page description', () => {
      render(<PartiesPage />);

      expect(screen.getByText('Manage and organize your D&D parties')).toBeInTheDocument();
    });

    it('should render the PartyListView component', () => {
      render(<PartiesPage />);

      expect(screen.getByTestId('party-list-view')).toBeInTheDocument();
    });

    it('should have proper page structure with space-y-6 class', () => {
      const { container } = render(<PartiesPage />);

      expect(container.firstChild).toHaveClass('space-y-6');
    });

    it('should render header section with proper typography', () => {
      render(<PartiesPage />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('text-3xl', 'font-bold', 'tracking-tight');

      const description = screen.getByText('Manage and organize your D&D parties');
      expect(description).toHaveClass('text-muted-foreground');
    });
  });

  describe('Authentication', () => {
    it('should render when user is authenticated', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });

      render(<PartiesPage />);

      expect(screen.getByTestId('party-list-view')).toBeInTheDocument();
    });

    it('should handle loading state', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'loading',
      });

      render(<PartiesPage />);

      // Page should still render the structure
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('should handle unauthenticated state', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      render(<PartiesPage />);

      // Page should still render the structure
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
  });

  describe('SEO and Metadata', () => {
    it('should export metadata object', () => {
      const { metadata } = require('../page');

      expect(metadata).toBeDefined();
      expect(metadata.title).toBe('Parties - D&D Encounter Tracker');
      expect(metadata.description).toBe('Manage and organize your D&D parties');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<PartiesPage />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it('should have proper semantic structure', () => {
      const { container } = render(<PartiesPage />);

      // Check that the main content is properly structured
      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('should pass props to PartyListView if needed', () => {
      render(<PartiesPage />);

      // Verify that PartyListView is rendered
      expect(screen.getByTestId('party-list-view')).toBeInTheDocument();
    });
  });
});
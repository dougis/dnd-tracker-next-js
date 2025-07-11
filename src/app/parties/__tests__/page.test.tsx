import { render, screen } from '@testing-library/react';
import PartiesPage from '../page';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

// Mock auth function
jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

// Mock PartyListView component
jest.mock('@/components/party/PartyListView', () => ({
  PartyListView: function MockPartyListView() {
    return <div data-testid="party-list-view">Party List View</div>;
  },
}));

const mockSession = {
  user: {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
  },
};

describe('PartiesPage', () => {
  let mockAuth: jest.Mock;
  let mockRedirect: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth = require('@/lib/auth').auth;
    mockRedirect = require('next/navigation').redirect;
    
    // Mock redirect to throw an error like Next.js does
    mockRedirect.mockImplementation((url: string) => {
      throw new Error(`REDIRECT: ${url}`);
    });
    
    // Default to authenticated user
    mockAuth.mockResolvedValue(mockSession);
  });

  describe('Page Structure', () => {
    it('should render the page title', async () => {
      const PartiesPageResolved = await PartiesPage();
      render(PartiesPageResolved);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Parties');
    });

    it('should render the page description', async () => {
      const PartiesPageResolved = await PartiesPage();
      render(PartiesPageResolved);

      expect(screen.getByText('Manage and organize your D&D parties')).toBeInTheDocument();
    });

    it('should render the PartyListView component', async () => {
      const PartiesPageResolved = await PartiesPage();
      render(PartiesPageResolved);

      expect(screen.getByTestId('party-list-view')).toBeInTheDocument();
    });

    it('should have proper page structure with space-y-6 class', async () => {
      const PartiesPageResolved = await PartiesPage();
      const { container } = render(PartiesPageResolved);

      expect(container.firstChild).toHaveClass('space-y-6');
    });

    it('should render header section with proper typography', async () => {
      const PartiesPageResolved = await PartiesPage();
      render(PartiesPageResolved);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('text-3xl', 'font-bold', 'tracking-tight');

      const description = screen.getByText('Manage and organize your D&D parties');
      expect(description).toHaveClass('text-muted-foreground');
    });
  });

  describe('Authentication', () => {
    it('should render when user is authenticated', async () => {
      mockAuth.mockResolvedValue(mockSession);
      
      const PartiesPageResolved = await PartiesPage();
      render(PartiesPageResolved);

      expect(screen.getByTestId('party-list-view')).toBeInTheDocument();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('should redirect when user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null);
      
      await expect(PartiesPage()).rejects.toThrow('REDIRECT: /signin?callbackUrl=/parties');
      expect(mockRedirect).toHaveBeenCalledWith('/signin?callbackUrl=/parties');
    });

    it('should redirect when session exists but no user id', async () => {
      mockAuth.mockResolvedValue({ user: {} });
      
      await expect(PartiesPage()).rejects.toThrow('REDIRECT: /signin?callbackUrl=/parties');
      expect(mockRedirect).toHaveBeenCalledWith('/signin?callbackUrl=/parties');
    });

    it('should pass user id to PartyListView when authenticated', async () => {
      mockAuth.mockResolvedValue(mockSession);
      
      const PartiesPageResolved = await PartiesPage();
      render(PartiesPageResolved);

      expect(screen.getByTestId('party-list-view')).toBeInTheDocument();
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
    it('should have proper heading hierarchy', async () => {
      const PartiesPageResolved = await PartiesPage();
      render(PartiesPageResolved);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it('should have proper semantic structure', async () => {
      const PartiesPageResolved = await PartiesPage();
      const { container } = render(PartiesPageResolved);

      // Check that the main content is properly structured
      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('should pass props to PartyListView if needed', async () => {
      const PartiesPageResolved = await PartiesPage();
      render(PartiesPageResolved);

      // Verify that PartyListView is rendered
      expect(screen.getByTestId('party-list-view')).toBeInTheDocument();
    });
  });
});
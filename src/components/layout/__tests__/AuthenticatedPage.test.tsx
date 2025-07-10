import React from 'react';
import { render, screen } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { AuthenticatedPage } from '../AuthenticatedPage';

// Mock next-auth/react
jest.mock('next-auth/react');
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

// Mock AppLayout
jest.mock('../AppLayout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-layout">{children}</div>
  ),
}));

describe('AuthenticatedPage', () => {
  const TestContent = () => <div data-testid="test-content">Test Content</div>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('displays default loading message', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
        update: jest.fn(),
      });

      render(
        <AuthenticatedPage>
          <TestContent />
        </AuthenticatedPage>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByTestId('test-content')).not.toBeInTheDocument();
    });

    it('displays custom loading message', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
        update: jest.fn(),
      });

      render(
        <AuthenticatedPage loadingMessage="Please wait...">
          <TestContent />
        </AuthenticatedPage>
      );

      expect(screen.getByText('Please wait...')).toBeInTheDocument();
      expect(screen.queryByTestId('test-content')).not.toBeInTheDocument();
    });
  });

  describe('Unauthenticated State', () => {
    it('displays default unauthenticated message', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      render(
        <AuthenticatedPage>
          <TestContent />
        </AuthenticatedPage>
      );

      expect(screen.getByText('Please sign in to access this page.')).toBeInTheDocument();
      expect(screen.queryByTestId('test-content')).not.toBeInTheDocument();
    });

    it('displays custom unauthenticated message', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      render(
        <AuthenticatedPage unauthenticatedMessage="Login required for this feature">
          <TestContent />
        </AuthenticatedPage>
      );

      expect(screen.getByText('Login required for this feature')).toBeInTheDocument();
      expect(screen.queryByTestId('test-content')).not.toBeInTheDocument();
    });
  });

  describe('Authenticated State', () => {
    it('renders children when authenticated', () => {
      mockUseSession.mockReturnValue({
        data: { user: { id: 'user1', name: 'Test User' }, expires: '2024-01-01' },
        status: 'authenticated',
        update: jest.fn(),
      });

      render(
        <AuthenticatedPage>
          <TestContent />
        </AuthenticatedPage>
      );

      expect(screen.getByTestId('test-content')).toBeInTheDocument();
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      expect(screen.queryByText('Please sign in to access this page.')).not.toBeInTheDocument();
    });

    it('renders within AppLayout', () => {
      mockUseSession.mockReturnValue({
        data: { user: { id: 'user1', name: 'Test User' }, expires: '2024-01-01' },
        status: 'authenticated',
        update: jest.fn(),
      });

      render(
        <AuthenticatedPage>
          <TestContent />
        </AuthenticatedPage>
      );

      expect(screen.getByTestId('app-layout')).toBeInTheDocument();
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('has proper loading state styling', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
        update: jest.fn(),
      });

      const { container } = render(
        <AuthenticatedPage>
          <TestContent />
        </AuthenticatedPage>
      );

      const loadingDiv = container.querySelector('.flex.items-center.justify-center.h-64');
      expect(loadingDiv).toBeInTheDocument();
      expect(loadingDiv).toHaveClass('flex', 'items-center', 'justify-center', 'h-64');
    });

    it('has proper unauthenticated state styling', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      const { container } = render(
        <AuthenticatedPage>
          <TestContent />
        </AuthenticatedPage>
      );

      const unauthDiv = container.querySelector('.flex.items-center.justify-center.h-64');
      expect(unauthDiv).toBeInTheDocument();
      expect(unauthDiv).toHaveClass('flex', 'items-center', 'justify-center', 'h-64');
    });
  });

  describe('Accessibility', () => {
    it('has proper text styling for loading message', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
        update: jest.fn(),
      });

      const { container } = render(
        <AuthenticatedPage>
          <TestContent />
        </AuthenticatedPage>
      );

      const textDiv = container.querySelector('.text-muted-foreground');
      expect(textDiv).toBeInTheDocument();
      expect(textDiv).toHaveTextContent('Loading...');
    });

    it('has proper text styling for unauthenticated message', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      const { container } = render(
        <AuthenticatedPage>
          <TestContent />
        </AuthenticatedPage>
      );

      const textDiv = container.querySelector('.text-muted-foreground');
      expect(textDiv).toBeInTheDocument();
      expect(textDiv).toHaveTextContent('Please sign in to access this page.');
    });
  });
});
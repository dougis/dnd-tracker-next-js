import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useSession, signOut } from 'next-auth/react';
import { UserMenu } from '../UserMenu';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}));

describe('UserMenu', () => {
  const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
  const mockSignOut = signOut as jest.MockedFunction<typeof signOut>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Information Display', () => {
    test('displays user name when available', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
          },
          expires: '2024-01-01',
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<UserMenu />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    test('displays user email when name is not available', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            email: 'john@example.com',
          },
          expires: '2024-01-01',
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<UserMenu />);
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    test('displays placeholder when user has no name or email', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '1',
          },
          expires: '2024-01-01',
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<UserMenu />);
      expect(screen.getByText('User')).toBeInTheDocument();
    });

    test('displays loading state when session status is loading', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
        update: jest.fn(),
      });

      render(<UserMenu />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('displays nothing when not authenticated', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      render(<UserMenu />);
      expect(screen.queryByTestId('user-menu')).not.toBeInTheDocument();
    });
  });

  describe('User Avatar', () => {
    test('renders user avatar placeholder', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
          },
          expires: '2024-01-01',
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<UserMenu />);
      const avatar = screen.getByTestId('user-avatar');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveClass('h-8 w-8 rounded-full bg-muted');
    });
  });

  describe('Sign Out Functionality', () => {
    test('calls signOut when sign out button is clicked', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
          },
          expires: '2024-01-01',
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<UserMenu />);
      const signOutButton = screen.getByRole('button', { name: 'Sign Out' });
      fireEvent.click(signOutButton);
      
      expect(mockSignOut).toHaveBeenCalledTimes(1);
      expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: '/' });
    });

    test('sign out button has correct styling', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
          },
          expires: '2024-01-01',
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<UserMenu />);
      const signOutButton = screen.getByRole('button', { name: 'Sign Out' });
      expect(signOutButton).toHaveClass(
        'w-full text-left px-2 py-1 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-sm transition-colors'
      );
    });
  });

  describe('Layout and Styling', () => {
    test('has correct container styling', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
          },
          expires: '2024-01-01',
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<UserMenu />);
      const container = screen.getByTestId('user-menu');
      expect(container).toHaveClass('border-t border-border p-4');
    });

    test('user info has proper layout classes', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
          },
          expires: '2024-01-01',
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<UserMenu />);
      const userInfo = screen.getByTestId('user-info');
      expect(userInfo).toHaveClass('flex-1 min-w-0');
    });

    test('user name has correct text styling', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
          },
          expires: '2024-01-01',
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<UserMenu />);
      const userName = screen.getByText('John Doe');
      expect(userName).toHaveClass('text-sm font-medium text-foreground truncate');
    });

    test('user email has correct text styling', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
          },
          expires: '2024-01-01',
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<UserMenu />);
      const userEmail = screen.getByText('john@example.com');
      expect(userEmail).toHaveClass('text-xs text-muted-foreground truncate');
    });
  });

  describe('Edge Cases', () => {
    test('handles session data with null user', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: null,
          expires: '2024-01-01',
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<UserMenu />);
      expect(screen.queryByTestId('user-menu')).not.toBeInTheDocument();
    });

    test('handles very long user names with truncation', () => {
      const longName = 'A'.repeat(100);
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            name: longName,
            email: 'john@example.com',
          },
          expires: '2024-01-01',
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<UserMenu />);
      const userName = screen.getByText(longName);
      expect(userName).toHaveClass('truncate');
    });

    test('handles very long email addresses with truncation', () => {
      const longEmail = 'a'.repeat(50) + '@' + 'b'.repeat(50) + '.com';
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            name: 'John Doe',
            email: longEmail,
          },
          expires: '2024-01-01',
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<UserMenu />);
      const userEmail = screen.getByText(longEmail);
      expect(userEmail).toHaveClass('truncate');
    });
  });
});
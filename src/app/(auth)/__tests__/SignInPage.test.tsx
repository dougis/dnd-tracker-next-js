import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import SignInPage from '../signin/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

describe('SignInPage Component', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockSearchParams = {
    get: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    (signIn as jest.Mock).mockResolvedValue({ ok: true, error: null });

    // Default mock implementation for searchParams.get
    mockSearchParams.get.mockImplementation(param => {
      if (param === 'callbackUrl') return '/dashboard';
      if (param === 'error') return null;
      return null;
    });
  });

  it('renders the signin form correctly', () => {
    render(<SignInPage />);

    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Remember me/i)).toBeInTheDocument();
    expect(screen.getByText(/Forgot password/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Sign In/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Don't have an account/i)).toBeInTheDocument();
  });

  it('has correct reset password link', () => {
    render(<SignInPage />);

    const resetPasswordLink = screen.getByRole('link', { name: /Forgot password/i });
    expect(resetPasswordLink).toHaveAttribute('href', '/reset-password');
  });

  it('submits the form with valid credentials', async () => {
    render(<SignInPage />);

    await userEvent.type(screen.getByLabelText(/Email/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText(/Password/i), 'Password123!');
    await userEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('credentials', {
        redirect: false,
        email: 'user@example.com',
        password: 'Password123!',
        callbackUrl: '/dashboard',
      });

      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows validation errors for invalid form data', async () => {
    render(<SignInPage />);

    // Submit the form without filling any fields
    await userEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
    });
  });

  it('displays authentication error from URL parameter', async () => {
    // Mock error parameter in URL
    mockSearchParams.get.mockImplementation(param => {
      if (param === 'error') return 'CredentialsSignin';
      return null;
    });

    render(<SignInPage />);

    expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
  });

  it('handles authentication errors', async () => {
    // Mock signIn to return an error
    (signIn as jest.Mock).mockResolvedValue({
      ok: false,
      error: 'CredentialsSignin',
    });

    render(<SignInPage />);

    await userEvent.type(screen.getByLabelText(/Email/i), 'user@example.com');
    await userEvent.type(
      screen.getByLabelText(/Password/i),
      'WrongPassword123!'
    );
    await userEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });

  describe('Redirect Message Display', () => {
    it('shows redirect message when callbackUrl contains a protected route', () => {
      // Mock callbackUrl pointing to settings page
      mockSearchParams.get.mockImplementation(param => {
        if (param === 'callbackUrl') return 'http://localhost:3000/settings';
        if (param === 'next') return null;
        if (param === 'error') return null;
        return null;
      });

      render(<SignInPage />);

      expect(screen.getByText('Please sign in to view your Settings')).toBeInTheDocument();
    });

    it('shows redirect message when callbackUrl contains parties route', () => {
      // Mock callbackUrl pointing to parties page
      mockSearchParams.get.mockImplementation(param => {
        if (param === 'callbackUrl') return 'http://localhost:3000/parties';
        if (param === 'next') return null;
        if (param === 'error') return null;
        return null;
      });

      render(<SignInPage />);

      expect(screen.getByText('Please sign in to view your Parties')).toBeInTheDocument();
    });

    it('shows redirect message when callbackUrl contains characters route', () => {
      // Mock callbackUrl pointing to characters page
      mockSearchParams.get.mockImplementation(param => {
        if (param === 'callbackUrl') return 'http://localhost:3000/characters';
        if (param === 'next') return null;
        if (param === 'error') return null;
        return null;
      });

      render(<SignInPage />);

      expect(screen.getByText('Please sign in to view your Characters')).toBeInTheDocument();
    });

    it('shows redirect message when callbackUrl contains encounters route', () => {
      // Mock callbackUrl pointing to encounters page
      mockSearchParams.get.mockImplementation(param => {
        if (param === 'callbackUrl') return 'http://localhost:3000/encounters';
        if (param === 'next') return null;
        if (param === 'error') return null;
        return null;
      });

      render(<SignInPage />);

      expect(screen.getByText('Please sign in to view your Encounters')).toBeInTheDocument();
    });

    it('shows redirect message when callbackUrl contains combat route', () => {
      // Mock callbackUrl pointing to combat page
      mockSearchParams.get.mockImplementation(param => {
        if (param === 'callbackUrl') return 'http://localhost:3000/combat';
        if (param === 'next') return null;
        if (param === 'error') return null;
        return null;
      });

      render(<SignInPage />);

      expect(screen.getByText('Please sign in to view your Combat')).toBeInTheDocument();
    });

    it('shows redirect message when callbackUrl contains dashboard subpath', () => {
      // Mock callbackUrl pointing to dashboard subpath
      mockSearchParams.get.mockImplementation(param => {
        if (param === 'callbackUrl') return 'http://localhost:3000/dashboard/profile';
        if (param === 'next') return null;
        if (param === 'error') return null;
        return null;
      });

      render(<SignInPage />);

      expect(screen.getByText('Please sign in to view your Dashboard')).toBeInTheDocument();
    });

    it('shows redirect message when next parameter contains a protected route', () => {
      // Mock next parameter instead of callbackUrl
      mockSearchParams.get.mockImplementation(param => {
        if (param === 'callbackUrl') return null;
        if (param === 'next') return '/settings';
        if (param === 'error') return null;
        return null;
      });

      render(<SignInPage />);

      expect(screen.getByText('Please sign in to view your Settings')).toBeInTheDocument();
    });

    it('does not show redirect message when no redirect URL is provided', () => {
      // Mock no redirect URLs
      mockSearchParams.get.mockImplementation(param => {
        if (param === 'callbackUrl') return null;
        if (param === 'next') return null;
        if (param === 'error') return null;
        return null;
      });

      render(<SignInPage />);

      expect(screen.queryByText(/Please sign in to view your/)).not.toBeInTheDocument();
    });

    it('does not show redirect message when callbackUrl points to default dashboard', () => {
      // Mock callbackUrl pointing to default dashboard (no redirect context)
      mockSearchParams.get.mockImplementation(param => {
        if (param === 'callbackUrl') return '/dashboard';
        if (param === 'next') return null;
        if (param === 'error') return null;
        return null;
      });

      render(<SignInPage />);

      expect(screen.queryByText(/Please sign in to view your/)).not.toBeInTheDocument();
    });

    it('handles redirect message with subpaths correctly', () => {
      // Mock callbackUrl pointing to a subpath
      mockSearchParams.get.mockImplementation(param => {
        if (param === 'callbackUrl') return 'http://localhost:3000/characters/123/edit';
        if (param === 'next') return null;
        if (param === 'error') return null;
        return null;
      });

      render(<SignInPage />);

      expect(screen.getByText('Please sign in to view your Characters')).toBeInTheDocument();
    });
  });
});

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
});

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import SignUpPage from '../signup/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock fetch function
global.fetch = jest.fn();

describe('SignUpPage Component', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        message: 'User registered successfully',
        user: { id: '123', email: 'test@example.com' },
      }),
    });
  });

  it('renders the signup form correctly', () => {
    render(<SignUpPage />);

    expect(screen.getByText('Create your account')).toBeInTheDocument();
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/I agree to the/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Subscribe to our newsletter/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Create Account/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Already have an account/i)).toBeInTheDocument();
  });

  it('submits the form with valid data', async () => {
    render(<SignUpPage />);

    await userEvent.type(screen.getByLabelText(/First Name/i), 'John');
    await userEvent.type(screen.getByLabelText(/Last Name/i), 'Doe');
    await userEvent.type(screen.getByLabelText(/Username/i), 'johndoe');
    await userEvent.type(
      screen.getByLabelText(/Email/i),
      'john.doe@example.com'
    );
    await userEvent.type(screen.getByLabelText(/^Password/i), 'Password123!');
    await userEvent.type(
      screen.getByLabelText(/Confirm Password/i),
      'Password123!'
    );
    await userEvent.click(screen.getByLabelText(/I agree to the/i));

    await userEvent.click(
      screen.getByRole('button', { name: /Create Account/i })
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: 'John',
          lastName: 'Doe',
          username: 'johndoe',
          email: 'john.doe@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
          agreeToTerms: true,
          subscribeToNewsletter: false,
        }),
      });

      expect(mockRouter.push).toHaveBeenCalledWith(
        '/auth/verify-email?email=john.doe%40example.com'
      );
    });
  });

  it('shows validation errors for invalid form data', async () => {
    render(<SignUpPage />);

    // Submit the form without filling any fields
    await userEvent.click(
      screen.getByRole('button', { name: /Create Account/i })
    );

    await waitFor(() => {
      // Check that validation errors are displayed
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
      expect(
        screen.getByText(/username must be at least/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(
        screen.getByText(/password must be at least/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/confirm your password/i)).toBeInTheDocument();
      expect(
        screen.getByText(/you must agree to the terms/i)
      ).toBeInTheDocument();
    });
  });

  it('handles server errors', async () => {
    // Mock fetch to return an error
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({
        success: false,
        message: 'Email already exists',
        errors: [{ field: 'email', message: 'Email already exists' }],
      }),
    });

    render(<SignUpPage />);

    // Fill the form with valid data
    await userEvent.type(screen.getByLabelText(/First Name/i), 'John');
    await userEvent.type(screen.getByLabelText(/Last Name/i), 'Doe');
    await userEvent.type(screen.getByLabelText(/Username/i), 'johndoe');
    await userEvent.type(
      screen.getByLabelText(/Email/i),
      'john.doe@example.com'
    );
    await userEvent.type(screen.getByLabelText(/^Password/i), 'Password123!');
    await userEvent.type(
      screen.getByLabelText(/Confirm Password/i),
      'Password123!'
    );
    await userEvent.click(screen.getByLabelText(/I agree to the/i));

    await userEvent.click(
      screen.getByRole('button', { name: /Create Account/i })
    );

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });
});

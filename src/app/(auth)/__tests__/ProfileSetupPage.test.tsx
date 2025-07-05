import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ProfileSetupPage from '../profile-setup/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock fetch function
global.fetch = jest.fn();

describe('ProfileSetupPage Component', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockSession = {
    user: {
      id: '123',
      email: 'test@example.com',
      name: 'John Doe',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSession as jest.Mock).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        message: 'Profile updated successfully',
        user: { id: '123', displayName: 'John Doe' },
      }),
    });
  });

  it('renders the profile setup form correctly', () => {
    render(<ProfileSetupPage />);

    expect(screen.getByText('Complete Your Profile')).toBeInTheDocument();
    expect(screen.getByLabelText(/Display Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Timezone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Preferred D&D Edition/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Experience Level/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Primary Role/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Complete Setup/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Skip for Now/i })
    ).toBeInTheDocument();
  });

  it('redirects to signin if user is not authenticated', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<ProfileSetupPage />);

    expect(mockRouter.push).toHaveBeenCalledWith('/auth/signin');
  });

  it('shows loading state while session is loading', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'loading',
    });

    render(<ProfileSetupPage />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('submits the profile setup form with valid data', async () => {
    render(<ProfileSetupPage />);

    // Clear the default value and type the new value
    const displayNameInput = screen.getByLabelText(/Display Name/i);
    await userEvent.clear(displayNameInput);
    await userEvent.type(displayNameInput, 'John the Dungeon Master');
    
    // For FormSelect components, we need to clear and type the value
    const dndEditionInput = screen.getByLabelText(/Preferred D&D Edition/i);
    await userEvent.clear(dndEditionInput);
    await userEvent.type(dndEditionInput, 'Pathfinder 2e');

    await userEvent.click(
      screen.getByRole('button', { name: /Complete Setup/i })
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/users/123/profile',
        expect.objectContaining({
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );

      const actualCall = (global.fetch as jest.Mock).mock.calls[0][1];
      const parsedBody = JSON.parse(actualCall.body);

      expect(parsedBody).toMatchObject({
        displayName: 'John the Dungeon Master',
        dndEdition: 'Pathfinder 2e',
      });
    });
  });

  it('shows success screen after successful profile setup', async () => {
    render(<ProfileSetupPage />);

    await userEvent.type(
      screen.getByLabelText(/Display Name/i),
      'Test User'
    );

    await userEvent.click(
      screen.getByRole('button', { name: /Complete Setup/i })
    );

    await waitFor(() => {
      expect(screen.getByText('Profile Setup Complete!')).toBeInTheDocument();
      expect(
        screen.getByText(/Welcome to D&D Encounter Tracker/)
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Continue to Dashboard/i })
      ).toBeInTheDocument();
    });
  });

  it('handles skip functionality correctly', async () => {
    render(<ProfileSetupPage />);

    await userEvent.click(
      screen.getByRole('button', { name: /Skip for Now/i })
    );

    expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
  });

  it('allows submitting empty form (all fields are optional)', async () => {
    render(<ProfileSetupPage />);

    // Submit without filling any fields
    await userEvent.click(
      screen.getByRole('button', { name: /Complete Setup/i })
    );

    await waitFor(() => {
      // Should show success screen since all profile fields are optional
      expect(screen.getByText('Profile Setup Complete!')).toBeInTheDocument();
    });
  });

  it('handles server errors gracefully', async () => {
    // Mock fetch to return an error
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      json: jest.fn().mockResolvedValue({
        success: false,
        message: 'Profile update failed',
        errors: [{ field: 'displayName', message: 'Display name is required' }],
      }),
    });

    render(<ProfileSetupPage />);

    await userEvent.type(
      screen.getByLabelText(/Display Name/i),
      'Test'
    );

    await userEvent.click(
      screen.getByRole('button', { name: /Complete Setup/i })
    );

    await waitFor(() => {
      // Check the API call was made
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/users/123/profile',
        expect.objectContaining({
          method: 'PATCH',
        })
      );

      // User should not be redirected after error
      expect(mockRouter.push).not.toHaveBeenCalledWith('/dashboard');

      // The submit button should be enabled again (not in loading state)
      const submitButton = screen.getByRole('button', {
        name: /Complete Setup/i,
      });
      expect(submitButton).toBeEnabled();
    });
  });

  it('navigates to dashboard from success screen', async () => {
    render(<ProfileSetupPage />);

    // Complete the form first
    await userEvent.type(
      screen.getByLabelText(/Display Name/i),
      'Test User'
    );

    await userEvent.click(
      screen.getByRole('button', { name: /Complete Setup/i })
    );

    // Wait for success screen
    await waitFor(() => {
      expect(screen.getByText('Profile Setup Complete!')).toBeInTheDocument();
    });

    // Click continue button
    const continueButton = screen.getByRole('button', {
      name: /Continue to Dashboard/i,
    });
    await userEvent.click(continueButton);

    expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
  });
});
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import EncounterEditPage from './page';

// Mock the external dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock the fetch function
global.fetch = jest.fn();

// Mock the UI components
jest.mock('@/components/ui/form', () => ({
  Form: ({ children }: { children: React.ReactNode }) => <form>{children}</form>,
  FormControl: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  FormField: ({
    render
  }: {
    render: (_props: { field: any }) => React.ReactNode
  }) => (
    <div>
      {render({
        field: {
          value: '',
          onChange: jest.fn(),
          onBlur: jest.fn(),
          name: 'test'
        }
      })}
    </div>
  ),
  FormItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  FormLabel: ({ children }: { children: React.ReactNode }) => <label>{children}</label>,
  FormMessage: () => <div data-testid="form-message" />,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ..._props }: any) => (
    <button onClick={onClick} disabled={disabled} {..._props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: (props: any) => <textarea {...props} />,
}));

jest.mock('@/components/ui/alert', () => ({
  Alert: ({ children }: { children: React.ReactNode }) => <div role="alert">{children}</div>,
  AlertDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange, value }: any) => (
    <select onChange={(e) => onValueChange?.(e.target.value)} value={value}>
      {children}
    </select>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectValue: ({ placeholder }: { placeholder: string }) => <span>{placeholder}</span>,
}));

describe('EncounterEditPage', () => {
  const mockPush = jest.fn();
  const mockSession = {
    user: { id: 'user123' },
  };
  const mockEncounter = {
    _id: 'encounter123',
    name: 'Test Encounter',
    description: 'A test encounter',
    difficulty: 'medium',
    estimatedDuration: 60,
    tags: ['combat', 'dungeon'],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (useParams as jest.Mock).mockReturnValue({
      id: 'encounter123',
    });

    (useSession as jest.Mock).mockReturnValue({
      data: mockSession,
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ encounter: mockEncounter }),
    });
  });

  it('renders loading state initially', () => {
    render(<EncounterEditPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('fetches and displays encounter data', async () => {
    render(<EncounterEditPage />);

    await waitFor(() => {
      expect(screen.getByText('Edit Encounter')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/encounters/encounter123');
  });

  it('displays form fields with encounter data', async () => {
    render(<EncounterEditPage />);

    await waitFor(() => {
      expect(screen.getByText('Edit Encounter')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Difficulty')).toBeInTheDocument();
    expect(screen.getByLabelText('Estimated Duration (minutes)')).toBeInTheDocument();
    expect(screen.getByLabelText('Tags (comma-separated)')).toBeInTheDocument();
  });

  it('handles form submission successfully', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ encounter: mockEncounter }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

    render(<EncounterEditPage />);

    await waitFor(() => {
      expect(screen.getByText('Edit Encounter')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Update Encounter');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/encounters/encounter123');
    });
  });

  it('displays error when encounter fetch fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Encounter not found' }),
    });

    render(<EncounterEditPage />);

    await waitFor(() => {
      expect(screen.getByText('Encounter not found')).toBeInTheDocument();
    });
  });

  it('displays error when update fails', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ encounter: mockEncounter }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Update failed' }),
      });

    render(<EncounterEditPage />);

    await waitFor(() => {
      expect(screen.getByText('Edit Encounter')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Update Encounter');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument();
    });
  });

  it('navigates back to encounter detail on cancel', async () => {
    render(<EncounterEditPage />);

    await waitFor(() => {
      expect(screen.getByText('Edit Encounter')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockPush).toHaveBeenCalledWith('/encounters/encounter123');
  });

  it('navigates back to encounter detail when back button is clicked', async () => {
    render(<EncounterEditPage />);

    await waitFor(() => {
      expect(screen.getByText('Edit Encounter')).toBeInTheDocument();
    });

    const backButton = screen.getByText('Back to Encounter');
    fireEvent.click(backButton);

    expect(mockPush).toHaveBeenCalledWith('/encounters/encounter123');
  });

  it('handles missing session gracefully', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
    });

    render(<EncounterEditPage />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('handles missing encounter ID gracefully', () => {
    (useParams as jest.Mock).mockReturnValue({
      id: null,
    });

    render(<EncounterEditPage />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
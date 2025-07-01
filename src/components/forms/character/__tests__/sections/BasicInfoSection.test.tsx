import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BasicInfoSection } from '../../sections/BasicInfoSection';

describe('BasicInfoSection', () => {
  const mockOnChange = jest.fn();
  const defaultProps = {
    value: {
      name: '',
      type: 'pc' as const,
      race: 'human' as const,
      customRace: '',
    },
    onChange: mockOnChange,
    errors: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Character Name Field', () => {
    it('renders character name input with proper label', () => {
      render(<BasicInfoSection {...defaultProps} />);

      const nameField = screen.getByLabelText(/character name/i);
      expect(nameField).toBeInTheDocument();
      expect(nameField).toHaveAttribute('type', 'text');
      expect(nameField).toHaveAttribute('aria-required', 'true');
    });

    it('calls onChange when character name is typed', async () => {
      const user = userEvent.setup();
      render(<BasicInfoSection {...defaultProps} />);

      const nameField = screen.getByLabelText(/character name/i);
      await user.type(nameField, 'Aragorn');

      expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Aragorn',
      }));
    });

    it('shows validation error for character name', () => {
      const props = {
        ...defaultProps,
        errors: { name: 'Character name is required' },
      };
      render(<BasicInfoSection {...props} />);

      expect(screen.getByText('Character name is required')).toBeInTheDocument();
      expect(screen.getByLabelText(/character name/i)).toHaveAttribute('aria-invalid', 'true');
    });

    it('shows character count indicator', async () => {
      const user = userEvent.setup();
      render(<BasicInfoSection {...defaultProps} />);

      const nameField = screen.getByLabelText(/character name/i);
      await user.type(nameField, 'Test');

      expect(screen.getByText('4/100')).toBeInTheDocument();
    });
  });

  describe('Character Type Selection', () => {
    it('renders character type select with PC and NPC options', () => {
      render(<BasicInfoSection {...defaultProps} />);

      const typeField = screen.getByLabelText(/character type/i);
      expect(typeField).toBeInTheDocument();
      expect(typeField).toHaveAttribute('aria-required', 'true');
    });

    it('shows PC and NPC options when opened', async () => {
      const user = userEvent.setup();
      render(<BasicInfoSection {...defaultProps} />);

      const typeField = screen.getByLabelText(/character type/i);
      await user.click(typeField);

      expect(screen.getByText('Player Character')).toBeInTheDocument();
      expect(screen.getByText('Non-Player Character')).toBeInTheDocument();
    });

    it('calls onChange when character type is selected', async () => {
      const user = userEvent.setup();
      render(<BasicInfoSection {...defaultProps} />);

      const typeField = screen.getByLabelText(/character type/i);
      await user.click(typeField);
      await user.click(screen.getByText('Non-Player Character'));

      expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
        type: 'npc',
      }));
    });

    it('shows validation error for character type', () => {
      const props = {
        ...defaultProps,
        errors: { type: 'Character type is required' },
      };
      render(<BasicInfoSection {...props} />);

      expect(screen.getByText('Character type is required')).toBeInTheDocument();
    });
  });

  describe('Race Selection', () => {
    it('renders race select with all D&D races', async () => {
      const user = userEvent.setup();
      render(<BasicInfoSection {...defaultProps} />);

      const raceField = screen.getByLabelText(/race/i);
      expect(raceField).toBeInTheDocument();
      expect(raceField).toHaveAttribute('aria-required', 'true');

      await user.click(raceField);

      // Check for common D&D races
      expect(screen.getByText('Human')).toBeInTheDocument();
      expect(screen.getByText('Elf')).toBeInTheDocument();
      expect(screen.getByText('Dwarf')).toBeInTheDocument();
      expect(screen.getByText('Halfling')).toBeInTheDocument();
      expect(screen.getByText('Dragonborn')).toBeInTheDocument();
      expect(screen.getByText('Gnome')).toBeInTheDocument();
      expect(screen.getByText('Half-Elf')).toBeInTheDocument();
      expect(screen.getByText('Half-Orc')).toBeInTheDocument();
      expect(screen.getByText('Tiefling')).toBeInTheDocument();
      expect(screen.getByText('Custom')).toBeInTheDocument();
    });

    it('calls onChange when race is selected', async () => {
      const user = userEvent.setup();
      render(<BasicInfoSection {...defaultProps} />);

      const raceField = screen.getByLabelText(/race/i);
      await user.click(raceField);
      await user.click(screen.getByText('Elf'));

      expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
        race: 'elf',
      }));
    });

    it('shows custom race input when custom is selected', async () => {
      const user = userEvent.setup();
      render(<BasicInfoSection {...defaultProps} />);

      const raceField = screen.getByLabelText(/race/i);
      await user.click(raceField);
      await user.click(screen.getByText('Custom'));

      const customRaceField = screen.getByLabelText(/custom race name/i);
      expect(customRaceField).toBeInTheDocument();
      expect(customRaceField).toHaveAttribute('type', 'text');
      expect(customRaceField).toHaveAttribute('aria-required', 'true');
    });

    it('calls onChange when custom race name is typed', async () => {
      const user = userEvent.setup();
      const props = {
        ...defaultProps,
        value: { ...defaultProps.value, race: 'custom' as const },
      };
      render(<BasicInfoSection {...props} />);

      const customRaceField = screen.getByLabelText(/custom race name/i);
      await user.type(customRaceField, 'Dragonborn Variant');

      expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
        customRace: 'Dragonborn Variant',
      }));
    });

    it('shows validation error for race', () => {
      const props = {
        ...defaultProps,
        errors: { race: 'Race is required' },
      };
      render(<BasicInfoSection {...props} />);

      expect(screen.getByText('Race is required')).toBeInTheDocument();
    });

    it('shows validation error for custom race', () => {
      const props = {
        ...defaultProps,
        value: { ...defaultProps.value, race: 'custom' as const },
        errors: { customRace: 'Custom race name is required' },
      };
      render(<BasicInfoSection {...props} />);

      expect(screen.getByText('Custom race name is required')).toBeInTheDocument();
    });

    it('shows custom race character count', async () => {
      const user = userEvent.setup();
      const props = {
        ...defaultProps,
        value: { ...defaultProps.value, race: 'custom' as const },
      };
      render(<BasicInfoSection {...props} />);

      const customRaceField = screen.getByLabelText(/custom race name/i);
      await user.type(customRaceField, 'Test');

      expect(screen.getByText('4/50')).toBeInTheDocument();
    });
  });

  describe('Section Layout', () => {
    it('renders section header with proper title', () => {
      render(<BasicInfoSection {...defaultProps} />);

      expect(screen.getByText('Basic Information')).toBeInTheDocument();
      expect(screen.getByText(/character's fundamental details/i)).toBeInTheDocument();
    });

    it('applies proper responsive layout classes', () => {
      render(<BasicInfoSection {...defaultProps} />);

      const section = screen.getByTestId('basic-info-section');
      expect(section).toHaveClass('space-y-4');
    });

    it('groups name and type fields together', () => {
      render(<BasicInfoSection {...defaultProps} />);

      const nameField = screen.getByLabelText(/character name/i);
      const typeField = screen.getByLabelText(/character type/i);

      const nameContainer = nameField.closest('[data-testid="name-type-group"]');
      const typeContainer = typeField.closest('[data-testid="name-type-group"]');

      expect(nameContainer).toBe(typeContainer);
    });
  });

  describe('Accessibility', () => {
    it('has proper section heading structure', () => {
      render(<BasicInfoSection {...defaultProps} />);

      const heading = screen.getByRole('heading', { name: /basic information/i });
      expect(heading).toHaveAttribute('aria-level', '3');
    });

    it('associates helper text with form fields', () => {
      render(<BasicInfoSection {...defaultProps} />);

      const nameField = screen.getByLabelText(/character name/i);
      const helperText = screen.getByText(/choose a memorable name/i);

      expect(nameField).toHaveAttribute('aria-describedby');
      expect(helperText).toHaveAttribute('id', nameField.getAttribute('aria-describedby'));
    });

    it('announces validation errors to screen readers', () => {
      const props = {
        ...defaultProps,
        errors: { name: 'Character name is required' },
      };
      render(<BasicInfoSection {...props} />);

      const errorMessage = screen.getByText('Character name is required');
      expect(errorMessage).toHaveAttribute('role', 'alert');
      expect(errorMessage).toHaveAttribute('aria-live', 'polite');
    });
  });
});
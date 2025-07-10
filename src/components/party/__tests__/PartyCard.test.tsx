import {
  render,
  screen,
  fireEvent,
  createMockParty,
  setupConsoleSpy,
  renderPartyCard,
  renderPartyCardWithSelection,
  expectBasicPartyInfo,
  expectPartyStats,
  expectPartyTags,
  expectLastActivity,
  expectPublicBadge,
  expectOpenBadge,
  getMenuTrigger,
  openMenuAndClickItem,
  expectSelectionCheckbox,
  clickSelectionCheckbox,
  expectCheckboxState,
} from './partyCardTestHelpers';
import { PartyCard } from '../PartyCard';

describe('PartyCard', () => {
  const mockParty = createMockParty();
  const { spy: consoleSpy, clear: clearConsoleSpy, restore: restoreConsoleSpy } = setupConsoleSpy();

  beforeEach(() => {
    clearConsoleSpy();
  });

  afterAll(() => {
    restoreConsoleSpy();
  });

  describe('Basic Rendering', () => {
    it('should render party name and description', () => {
      renderPartyCard(mockParty);
      expectBasicPartyInfo(mockParty);
    });

    it('should render party statistics', () => {
      renderPartyCard(mockParty);
      expectPartyStats(mockParty);
    });

    it('should render party tags', () => {
      renderPartyCard(mockParty);
      expectPartyTags(mockParty.tags);
    });

    it('should render last activity', () => {
      renderPartyCard(mockParty);
      expectLastActivity();
    });
  });

  describe('Party Tags', () => {
    it('should render all tags when 3 or fewer', () => {
      render(<PartyCard party={mockParty} />);

      expect(screen.getByText('heroic')).toBeInTheDocument();
      expect(screen.getByText('balanced')).toBeInTheDocument();
    });

    it('should show truncated tags when more than 3', () => {
      const partyWithManyTags = {
        ...mockParty,
        tags: ['heroic', 'balanced', 'urban', 'stealth', 'magic'],
      };

      render(<PartyCard party={partyWithManyTags} />);

      expect(screen.getByText('heroic')).toBeInTheDocument();
      expect(screen.getByText('balanced')).toBeInTheDocument();
      expect(screen.getByText('urban')).toBeInTheDocument();
      expect(screen.getByText('+2')).toBeInTheDocument();
    });

    it('should not render tags section when no tags', () => {
      const partyWithoutTags = {
        ...mockParty,
        tags: [],
      };

      render(<PartyCard party={partyWithoutTags} />);

      expect(screen.queryByText('heroic')).not.toBeInTheDocument();
    });
  });

  describe('Party Status Badges', () => {
    it('should show Public badge when party is public', () => {
      const publicParty = { ...mockParty, isPublic: true };
      render(<PartyCard party={publicParty} />);

      expect(screen.getByText('Public')).toBeInTheDocument();
    });

    it('should show Open badge when party allows joining', () => {
      render(<PartyCard party={mockParty} />);

      expect(screen.getByText('Open')).toBeInTheDocument();
    });

    it('should not show status badges for private closed party', () => {
      const closedParty = {
        ...mockParty,
        isPublic: false,
        settings: { ...mockParty.settings, allowJoining: false },
      };

      render(<PartyCard party={closedParty} />);

      expect(screen.queryByText('Public')).not.toBeInTheDocument();
      expect(screen.queryByText('Open')).not.toBeInTheDocument();
    });
  });

  describe('Selection Functionality', () => {
    it('should render selection checkbox when onSelect is provided', () => {
      const mockOnSelect = jest.fn();
      render(<PartyCard party={mockParty} onSelect={mockOnSelect} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toHaveAttribute('aria-label', 'Select The Brave Adventurers');
    });

    it('should not render selection checkbox when onSelect is not provided', () => {
      render(<PartyCard party={mockParty} />);

      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });

    it('should call onSelect when checkbox is clicked', () => {
      const mockOnSelect = jest.fn();
      render(<PartyCard party={mockParty} onSelect={mockOnSelect} />);

      fireEvent.click(screen.getByRole('checkbox'));
      expect(mockOnSelect).toHaveBeenCalledWith('party-1');
    });

    it('should show selected state', () => {
      const mockOnSelect = jest.fn();
      render(<PartyCard party={mockParty} isSelected={true} onSelect={mockOnSelect} />);

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });
  });

  describe('Action Menu', () => {
    it('should render actions dropdown menu', () => {
      render(<PartyCard party={mockParty} />);

      const menuButtons = screen.getAllByRole('button');
      const menuTrigger = menuButtons.find(button => button.querySelector('svg')); // Find button with icon
      expect(menuTrigger).toBeInTheDocument();
    });

    it('should show menu items when clicked', () => {
      render(<PartyCard party={mockParty} />);

      const buttons = screen.getAllByRole('button');
      const menuTrigger = buttons.find(button =>
        button.querySelector('svg') && !button.textContent?.includes('View')
      );
      expect(menuTrigger).toBeInTheDocument();

      if (menuTrigger) {
        fireEvent.click(menuTrigger);

        expect(screen.getByText('View Details')).toBeInTheDocument();
        expect(screen.getByText('Edit Party')).toBeInTheDocument();
        expect(screen.getByText('Delete Party')).toBeInTheDocument();
      }
    });

    it('should handle view party action', () => {
      render(<PartyCard party={mockParty} />);

      const buttons = screen.getAllByRole('button');
      const menuTrigger = buttons.find(button =>
        button.querySelector('svg') && !button.textContent?.includes('View')
      );

      if (menuTrigger) {
        fireEvent.click(menuTrigger);
        fireEvent.click(screen.getByText('View Details'));
        expect(consoleSpy).toHaveBeenCalledWith('View party:', 'party-1');
      }
    });

    it('should handle edit party action', () => {
      render(<PartyCard party={mockParty} />);

      const buttons = screen.getAllByRole('button');
      const menuTrigger = buttons.find(button =>
        button.querySelector('svg') && !button.textContent?.includes('View')
      );

      if (menuTrigger) {
        fireEvent.click(menuTrigger);
        fireEvent.click(screen.getByText('Edit Party'));
        expect(consoleSpy).toHaveBeenCalledWith('Edit party:', 'party-1');
      }
    });

    it('should handle delete party action', () => {
      render(<PartyCard party={mockParty} />);

      const buttons = screen.getAllByRole('button');
      const menuTrigger = buttons.find(button =>
        button.querySelector('svg') && !button.textContent?.includes('View')
      );

      if (menuTrigger) {
        fireEvent.click(menuTrigger);
        fireEvent.click(screen.getByText('Delete Party'));
        expect(consoleSpy).toHaveBeenCalledWith('Delete party:', 'party-1');
      }
    });
  });

  describe('View Button', () => {
    it('should render view button', () => {
      render(<PartyCard party={mockParty} />);

      expect(screen.getByText('View')).toBeInTheDocument();
    });

    it('should handle view button click', () => {
      render(<PartyCard party={mockParty} />);

      fireEvent.click(screen.getByText('View'));
      expect(consoleSpy).toHaveBeenCalledWith('View party:', 'party-1');
    });
  });

  describe('Edge Cases', () => {
    it('should handle party without description', () => {
      const partyWithoutDescription = {
        ...mockParty,
        description: '',
      };

      render(<PartyCard party={partyWithoutDescription} />);

      expect(screen.getByText('The Brave Adventurers')).toBeInTheDocument();
      expect(screen.queryByText('A party of brave heroes ready to face any challenge')).not.toBeInTheDocument();
    });

    it('should handle zero average level', () => {
      const partyWithoutLevel = {
        ...mockParty,
        averageLevel: 0,
      };

      render(<PartyCard party={partyWithoutLevel} />);

      expect(screen.getByText('Level -')).toBeInTheDocument();
    });

    it('should handle hover state changes', () => {
      render(<PartyCard party={mockParty} />);

      const card = screen.getByRole('button', { name: 'View' }).closest('.transition-all');
      expect(card).toBeInTheDocument();
    });
  });

  describe('StatRow Helper Component', () => {
    it('should render stat rows with proper grid layout', () => {
      render(<PartyCard party={mockParty} />);

      // Check that stat content is properly structured
      expect(screen.getByText('members')).toBeInTheDocument();
      expect(screen.getByText('average')).toBeInTheDocument();
      expect(screen.getByText('Player Characters')).toBeInTheDocument();
      expect(screen.getByText('Max Members')).toBeInTheDocument();
    });
  });
});
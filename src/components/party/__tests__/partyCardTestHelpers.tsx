import { render, screen, fireEvent } from '@testing-library/react';
import { PartyCard } from '../PartyCard';
import type { PartyListItem } from '../types';

// Re-export testing library functions for convenience
export { render, screen, fireEvent };

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn(() => '2 hours ago'),
}));

// Mock party data factory
export function createMockParty(overrides: Partial<PartyListItem> = {}): PartyListItem {
  return {
    id: 'party-1',
    ownerId: 'user-123' as any,
    name: 'The Brave Adventurers',
    description: 'A party of brave heroes ready to face any challenge',
    members: [],
    tags: ['heroic', 'balanced'],
    isPublic: false,
    sharedWith: [],
    settings: {
      allowJoining: true,
      requireApproval: false,
      maxMembers: 6,
    },
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    lastActivity: new Date('2023-01-01'),
    memberCount: 4,
    playerCharacterCount: 4,
    averageLevel: 5,
    ...overrides,
  };
}

// Console spy setup
export function setupConsoleSpy() {
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  return {
    spy: consoleSpy,
    restore: () => consoleSpy.mockRestore(),
    clear: () => consoleSpy.mockClear(),
  };
}

// Render helpers
export function renderPartyCard(party?: PartyListItem, props?: any) {
  const mockParty = party || createMockParty();
  return render(<PartyCard party={mockParty} {...props} />);
}

export function renderPartyCardWithSelection(party?: PartyListItem, isSelected = false) {
  const mockOnSelect = jest.fn();
  const mockParty = party || createMockParty();
  return {
    onSelect: mockOnSelect,
    ...render(<PartyCard party={mockParty} isSelected={isSelected} onSelect={mockOnSelect} />),
  };
}

// Common assertions
export function expectBasicPartyInfo(party: PartyListItem) {
  expect(screen.getByText(party.name)).toBeInTheDocument();
  if (party.description) {
    expect(screen.getByText(party.description)).toBeInTheDocument();
  }
}

export function expectPartyStats(party: PartyListItem) {
  expect(screen.getAllByText(party.memberCount.toString())).toHaveLength(2); // member count appears twice
  expect(screen.getByText('members')).toBeInTheDocument();
  expect(screen.getByText(`Level ${party.averageLevel}`)).toBeInTheDocument();
  expect(screen.getByText('average')).toBeInTheDocument();
  expect(screen.getByText('Player Characters')).toBeInTheDocument();
  expect(screen.getByText('Max Members')).toBeInTheDocument();
  expect(screen.getByText(party.settings.maxMembers.toString())).toBeInTheDocument();
}

export function expectPartyTags(tags: string[], maxVisible = 3) {
  const visibleTags = tags.slice(0, maxVisible);
  visibleTags.forEach(tag => {
    expect(screen.getByText(tag)).toBeInTheDocument();
  });

  if (tags.length > maxVisible) {
    expect(screen.getByText(`+${tags.length - maxVisible}`)).toBeInTheDocument();
  }
}

export function expectLastActivity() {
  expect(screen.getByText('Active 2 hours ago')).toBeInTheDocument();
}

// Status badge helpers
export function expectPublicBadge(isPublic: boolean) {
  if (isPublic) {
    expect(screen.getByText('Public')).toBeInTheDocument();
  } else {
    expect(screen.queryByText('Public')).not.toBeInTheDocument();
  }
}

export function expectOpenBadge(allowJoining: boolean) {
  if (allowJoining) {
    expect(screen.getByText('Open')).toBeInTheDocument();
  } else {
    expect(screen.queryByText('Open')).not.toBeInTheDocument();
  }
}

// Menu interaction helpers
export function getMenuTrigger() {
  const buttons = screen.getAllByRole('button');
  return buttons.find(button =>
    button.querySelector('svg') && !button.textContent?.includes('View')
  );
}

export function openMenuAndClickItem(itemText: string) {
  const menuTrigger = getMenuTrigger();
  expect(menuTrigger).toBeInTheDocument();

  if (menuTrigger) {
    fireEvent.click(menuTrigger);
    fireEvent.click(screen.getByText(itemText));
  }
}

// Selection helpers
export function expectSelectionCheckbox(shouldExist: boolean, partyName?: string) {
  if (shouldExist) {
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    if (partyName) {
      expect(checkbox).toHaveAttribute('aria-label', `Select ${partyName}`);
    }
  } else {
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  }
}

export function clickSelectionCheckbox() {
  fireEvent.click(screen.getByRole('checkbox'));
}

export function expectCheckboxState(isSelected: boolean) {
  const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
  expect(checkbox.checked).toBe(isSelected);
}
import type { ICharacter } from '@/lib/models/Character';

export const createMockCharacter = (overrides: Partial<ICharacter> = {}): ICharacter => ({
  _id: 'char1',
  name: 'Test Character',
  type: 'pc',
  level: 1,
  race: 'human',
  classes: [{ class: 'fighter', level: 1, subclass: '', hitDie: 10 }],
  ownerId: 'user1',
  hitPoints: { current: 10, maximum: 10, temporary: 0 },
  armorClass: 16,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-02'),
  ...overrides,
} as ICharacter);

export const mockCharacters: ICharacter[] = [
  createMockCharacter({
    _id: 'char1',
    name: 'Aragorn',
    type: 'pc',
    level: 5,
    race: 'human',
    classes: [{ class: 'ranger', level: 5, subclass: '', hitDie: 10 }],
    hitPoints: { current: 45, maximum: 45, temporary: 0 },
    armorClass: 16,
    createdAt: new Date('2024-01-01'),
  }),
  createMockCharacter({
    _id: 'char2',
    name: 'Legolas',
    type: 'pc',
    level: 4,
    race: 'elf',
    classes: [{ class: 'ranger', level: 4, subclass: '', hitDie: 10 }],
    hitPoints: { current: 32, maximum: 32, temporary: 0 },
    armorClass: 15,
    createdAt: new Date('2024-01-05'),
  }),
  createMockCharacter({
    _id: 'char3',
    name: 'Gimli',
    type: 'pc',
    level: 3,
    race: 'dwarf',
    classes: [{ class: 'fighter', level: 3, subclass: '', hitDie: 10 }],
    hitPoints: { current: 28, maximum: 28, temporary: 0 },
    armorClass: 18,
    createdAt: new Date('2024-01-03'),
  }),
];

export const createMockPaginatedResponse = (items = mockCharacters, pagination = {}) => ({
  success: true,
  data: {
    items,
    pagination: {
      page: 1,
      limit: 12,
      total: items.length,
      totalPages: 1,
      ...pagination,
    },
  },
});

export const createMockErrorResponse = (message = 'Test error') => ({
  success: false,
  error: {
    type: 'DatabaseError',
    message,
    code: 'DB_ERROR',
  },
});

export const waitForCharacterToLoad = async (characterName = 'Aragorn') => {
  const { waitFor, screen } = await import('@testing-library/react');
  await waitFor(() => {
    expect(screen.getByText(characterName)).toBeInTheDocument();
  });
};

export const expectCharacterToBeVisible = (characterName: string) => {
  const { screen } = require('@testing-library/react');
  expect(screen.getByText(characterName)).toBeInTheDocument();
};

export const expectCharactersNotToBeVisible = (characterNames: string[]) => {
  const { screen } = require('@testing-library/react');
  characterNames.forEach(name => {
    expect(screen.queryByText(name)).not.toBeInTheDocument();
  });
};
// Common assertion patterns used across tests

const findElementBySelector = (screen: any, selector: string) => {
  return screen.getByText(selector) || screen.getByTestId(selector) || screen.getByPlaceholderText(selector);
};

const queryElementBySelector = (screen: any, selector: string) => {
  return screen.queryByText(selector) || screen.queryByTestId(selector) || screen.queryByPlaceholderText(selector);
};

export const expectElementToBeInDocument = (screen: any, selector: string | RegExp) => {
  const element = typeof selector === 'string'
    ? findElementBySelector(screen, selector)
    : screen.getByText(selector);
  expect(element).toBeInTheDocument();
};

export const expectElementNotToBeInDocument = (screen: any, selector: string | RegExp) => {
  const element = typeof selector === 'string'
    ? queryElementBySelector(screen, selector)
    : screen.queryByText(selector);
  expect(element).not.toBeInTheDocument();
};

export const expectMockToHaveBeenCalledWith = (mockFn: jest.Mock, ...args: any[]) => {
  expect(mockFn).toHaveBeenCalledWith(...args);
};

export const expectMockToHaveBeenCalledTimes = (mockFn: jest.Mock, times: number) => {
  expect(mockFn).toHaveBeenCalledTimes(times);
};

export const expectInitialHookState = {
  encounterData: (result: any) => {
    expect(result.current.encounters).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.pagination).toBe(null);
  },

  encounterFilters: (result: any, mockFilters: any) => {
    expect(result.current.filters).toEqual(mockFilters);
    expect(result.current.searchQuery).toBe('');
    expect(result.current.sortBy).toBe('updatedAt');
    expect(result.current.sortOrder).toBe('desc');
  },

  encounterSelection: (result: any) => {
    expect(result.current.selectedEncounters).toEqual([]);
    expect(result.current.isAllSelected).toBe(false);
    expect(result.current.hasSelection).toBe(false);
  },
};
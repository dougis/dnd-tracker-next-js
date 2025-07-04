import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMockProps } from '../test-helpers';

// Common setup utilities for component tests
export const setupComponentTest = () => {
  const user = userEvent.setup();
  return { user };
};

// Common assertion patterns for component rendering
export const expectElementToBeInDocument = (text: string | RegExp) => {
  expect(screen.getByText(text)).toBeInTheDocument();
};

export const expectElementNotToBeInDocument = (text: string | RegExp) => {
  expect(screen.queryByText(text)).not.toBeInTheDocument();
};

export const expectPlaceholderToBeInDocument = (placeholder: string) => {
  expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
};

export const expectDisplayValueToBeInDocument = (value: string) => {
  expect(screen.getByDisplayValue(value)).toBeInTheDocument();
};

// Dropdown interaction patterns
export const openDropdown = async (user: ReturnType<typeof userEvent.setup>, buttonText: string) => {
  const button = screen.getByText(buttonText);
  await user.click(button);
};

export const openDropdownByRole = async (user: ReturnType<typeof userEvent.setup>, name: string | RegExp) => {
  const button = screen.getByRole('button', { name });
  await user.click(button);
};

export const selectDropdownOption = async (user: ReturnType<typeof userEvent.setup>, optionText: string) => {
  const option = screen.getByText(optionText);
  await user.click(option);
};

// Search interaction patterns
export const typeInSearch = async (user: ReturnType<typeof userEvent.setup>, placeholder: string, text: string) => {
  const searchInput = screen.getByPlaceholderText(placeholder);
  await user.type(searchInput, text);
  return searchInput;
};

export const clearSearch = async (user: ReturnType<typeof userEvent.setup>, currentValue: string) => {
  const searchInput = screen.getByDisplayValue(currentValue);
  await user.clear(searchInput);
  return searchInput;
};

// Filter badge expectations
export const expectFilterBadge = (count: string) => {
  expect(screen.getByText(count)).toBeInTheDocument();
};

export const expectClearButton = () => {
  expect(screen.getByText('Clear')).toBeInTheDocument();
};

export const expectNoClearButton = () => {
  expect(screen.queryByText('Clear')).not.toBeInTheDocument();
};

// Common test patterns for filters
export const testFilterDropdown = async (
  Component: React.ComponentType<any>,
  user: ReturnType<typeof userEvent.setup>,
  buttonText: string,
  expectedOptions: string[],
  headerText?: string
) => {
  const props = createMockProps.encounterFilters();
  render(<Component {...props} />);

  await openDropdown(user, buttonText);

  if (headerText) {
    expectElementToBeInDocument(headerText);
  }
  
  expectedOptions.forEach(option => {
    expectElementToBeInDocument(option);
  });
};

export const testFilterSelection = async (
  Component: React.ComponentType<any>,
  user: ReturnType<typeof userEvent.setup>,
  buttonText: string,
  optionText: string,
  expectedFilter: any,
  mockProps?: any
) => {
  const props = mockProps || createMockProps.encounterFilters();
  render(<Component {...props} />);

  await openDropdown(user, buttonText);
  await selectDropdownOption(user, optionText);

  expect(props.callbacks.onFiltersChange).toHaveBeenCalledWith(expectedFilter);
};

// Common test patterns for search
export const testSearchInput = async (
  Component: React.ComponentType<any>,
  user: ReturnType<typeof userEvent.setup>,
  placeholder: string,
  searchText: string
) => {
  const props = createMockProps.encounterFilters();
  render(<Component {...props} />);

  await typeInSearch(user, placeholder, searchText);

  // Verify each character was called individually
  searchText.split('').forEach((char, index) => {
    const expectedText = searchText.substring(0, index + 1);
    expect(props.callbacks.onSearchChange).toHaveBeenCalledWith(expectedText.slice(-1));
  });
  
  expect(props.callbacks.onSearchChange).toHaveBeenCalledTimes(searchText.length);
};

export const testSearchClear = async (
  Component: React.ComponentType<any>,
  user: ReturnType<typeof userEvent.setup>,
  initialValue: string
) => {
  const props = createMockProps.encounterFilters({
    searchQuery: initialValue,
  });
  render(<Component {...props} />);

  await clearSearch(user, initialValue);

  expect(props.callbacks.onSearchChange).toHaveBeenLastCalledWith('');
};

// Common test patterns for component rendering
export const testBasicRendering = (
  Component: React.ComponentType<any>,
  expectedElements: string[]
) => {
  const props = createMockProps.encounterFilters();
  render(<Component {...props} />);

  expectedElements.forEach(element => {
    expectElementToBeInDocument(element);
  });
};

export const testConditionalRendering = (
  Component: React.ComponentType<any>,
  mockPropsConfig: any,
  shouldRender: { elements: string[], condition: string },
  shouldNotRender?: { elements: string[], condition: string }
) => {
  const props = createMockProps.encounterFilters(mockPropsConfig);
  render(<Component {...props} />);

  shouldRender.elements.forEach(element => {
    expectElementToBeInDocument(element);
  });

  if (shouldNotRender) {
    shouldNotRender.elements.forEach(element => {
      expectElementNotToBeInDocument(element);
    });
  }
};
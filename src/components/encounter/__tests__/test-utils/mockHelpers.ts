// Common mock setup utilities
import React from 'react';

export const createMockDateFns = () => {
  return {
    formatDistanceToNow: jest.fn().mockReturnValue('2 days ago'),
  };
};

export const createMockChildComponent = (name: string, dataTestId: string) => {
  return {
    [name]: (props: any) => {
      return React.createElement('div', {
        'data-testid': dataTestId,
        'data-props': JSON.stringify(props),
        onClick: props.onRefetch || props.onClick,
      }, name);
    },
  };
};

export const setupMockEnvironment = () => {
  // Mock date-fns
  jest.mock('date-fns', () => createMockDateFns());
  return {
    cleanup: () => {
      jest.clearAllMocks();
    },
  };
};
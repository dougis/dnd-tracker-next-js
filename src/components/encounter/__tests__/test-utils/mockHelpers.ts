// Common mock setup utilities

export const createMockDateFns = () => {
  return {
    formatDistanceToNow: jest.fn().mockReturnValue('2 days ago'),
  };
};

export const createMockChildComponent = (name: string, dataTestId: string) => {
  return {
    [name]: (props: any) => (
      <div
        data-testid={dataTestId}
        data-props={JSON.stringify(props)}
        onClick={props.onRefetch || props.onClick}
      >
        {name}
      </div>
    ),
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
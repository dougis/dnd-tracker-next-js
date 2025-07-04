import { render, RenderResult } from '@testing-library/react';
import { ReactElement } from 'react';

export interface StandardTestOptions {
  props?: any;
  expectedText?: string;
  skipRender?: boolean;
}

export const renderComponent = (
  Component: React.ComponentType<any>,
  props: any
): RenderResult => {
  return render(<Component {...props} />);
};

export const createStandardTests = (
  Component: React.ComponentType<any>,
  defaultProps: any,
  testConfig: {
    componentName: string;
    requiredElements: string[];
  }
) => {
  return {
    'renders without errors': () => {
      const result = renderComponent(Component, defaultProps);
      expect(result.container).toBeInTheDocument();
    },
    
    'displays required elements': (screen: any) => {
      renderComponent(Component, defaultProps);
      testConfig.requiredElements.forEach(element => {
        expect(screen.getByText(element) || screen.getByTestId(element) || screen.getByPlaceholderText(element))
          .toBeInTheDocument();
      });
    },
    
    'handles props correctly': (customProps: any, screen: any) => {
      renderComponent(Component, { ...defaultProps, ...customProps });
      // This can be customized per component
    },
  };
};
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface FormGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  direction?: 'row' | 'column';
  spacing?: 'sm' | 'md' | 'lg';
  align?: 'start' | 'center' | 'end';
}

const FormGroup = React.forwardRef<HTMLDivElement, FormGroupProps>(
  (
    {
      children,
      direction = 'column',
      spacing = 'md',
      align = 'start',
      className,
      ...props
    },
    ref
  ) => {
    const spacingClasses = {
      sm: direction === 'row' ? 'gap-2' : 'space-y-2',
      md: direction === 'row' ? 'gap-4' : 'space-y-4',
      lg: direction === 'row' ? 'gap-6' : 'space-y-6',
    };

    const alignClasses = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          direction === 'row' ? 'flex-row' : 'flex-col',
          spacingClasses[spacing],
          direction === 'row' && alignClasses[align],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

FormGroup.displayName = 'FormGroup';

export { FormGroup };

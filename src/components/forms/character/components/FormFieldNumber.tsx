'use client';

import React from 'react';
import { UseFormReturn, FieldPath } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface FormFieldNumberProps<T extends Record<string, any>> {
  form: UseFormReturn<T>;
  name: FieldPath<T>;
  label: string;
  required?: boolean;
  min?: number;
  max?: number;
  placeholder?: string;
  description?: string;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  defaultValue?: number;
}

export function FormFieldNumber<T extends Record<string, any>>({
  form,
  name,
  label,
  required = false,
  min,
  max,
  placeholder,
  description,
  className,
  inputClassName,
  labelClassName,
  defaultValue,
}: FormFieldNumberProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className={labelClassName}>{label}{required && ' *'}</FormLabel>
          <FormControl>
            <Input
              type="number"
              min={min}
              max={max}
              placeholder={placeholder}
              className={inputClassName}
              {...field}
              onChange={(e) => field.onChange(parseInt(e.target.value) || defaultValue || 0)}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
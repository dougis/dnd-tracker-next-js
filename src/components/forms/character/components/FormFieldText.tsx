'use client';

import React from 'react';
import { UseFormReturn, FieldPath } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface FormFieldTextProps<T extends Record<string, any>> {
  form: UseFormReturn<T>;
  name: FieldPath<T>;
  label: string;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  showCharCount?: boolean;
}

export function FormFieldText<T extends Record<string, any>>({
  form,
  name,
  label,
  required = false,
  placeholder,
  maxLength,
  className,
  showCharCount = false,
}: FormFieldTextProps<T>) {
  const value = form.watch(name);
  const currentLength = typeof value === 'string' ? value.length : 0;

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}{required && ' *'}</FormLabel>
          <FormControl>
            <Input
              placeholder={placeholder}
              maxLength={maxLength}
              {...field}
            />
          </FormControl>
          <FormMessage />
          {showCharCount && maxLength && (
            <div className="text-xs text-muted-foreground mt-1">
              {currentLength}/{maxLength}
            </div>
          )}
        </FormItem>
      )}
    />
  );
}
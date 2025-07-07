'use client';

import React from 'react';
import { UseFormReturn, FieldPath } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SelectOption {
  value: string;
  label: string;
}

interface FormFieldSelectProps<T extends Record<string, any>> {
  form: UseFormReturn<T>;
  name: FieldPath<T>;
  label: string;
  required?: boolean;
  placeholder?: string;
  options: SelectOption[];
  className?: string;
  onValueChange?: (value: string) => void;
}

export function FormFieldSelect<T extends Record<string, any>>({
  form,
  name,
  label,
  required = false,
  placeholder,
  options,
  className,
  onValueChange,
}: FormFieldSelectProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}{required && ' *'}</FormLabel>
          <Select
            onValueChange={(value) => {
              field.onChange(value);
              onValueChange?.(value);
            }}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
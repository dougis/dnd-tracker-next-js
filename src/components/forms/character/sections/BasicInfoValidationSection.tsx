'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CharacterCreation } from '@/lib/validations/character';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormGroup } from '@/components/forms/FormGroup';
import { CHARACTER_TYPE_OPTIONS, CHARACTER_RACE_OPTIONS, SIZE_OPTIONS } from '../constants';

interface BasicInfoValidationSectionProps {
  form: UseFormReturn<CharacterCreation>;
}

export function BasicInfoValidationSection({ form }: BasicInfoValidationSectionProps) {
  const raceValue = form.watch('race');

  return (
    <div className="space-y-4" data-testid="basic-info-validation-section">
      <div>
        <h3 className="text-lg font-semibold mb-2" aria-level={3}>
          Basic Information
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Enter your character&apos;s fundamental details with real-time validation
        </p>
      </div>

      <FormGroup direction="row" spacing="md" data-testid="name-type-group">
        <div className="flex-1">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Character Name *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter character name"
                    {...field}
                    maxLength={100}
                  />
                </FormControl>
                <FormMessage />
                <div className="text-xs text-muted-foreground mt-1">
                  {field.value?.length || 0}/100
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="flex-1">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Character Type *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select character type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CHARACTER_TYPE_OPTIONS.map((option) => (
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
        </div>
      </FormGroup>

      <FormGroup direction="row" spacing="md" data-testid="race-size-group">
        <div className="flex-1">
          <FormField
            control={form.control}
            name="race"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Race *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select character race" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CHARACTER_RACE_OPTIONS.map((option) => (
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
        </div>

        <div className="flex-1">
          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Size *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select character size" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SIZE_OPTIONS.map((option) => (
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
        </div>
      </FormGroup>

      {raceValue === 'custom' && (
        <FormField
          control={form.control}
          name="customRace"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom Race Name *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter custom race name"
                  {...field}
                  maxLength={50}
                />
              </FormControl>
              <FormMessage />
              <div className="text-xs text-muted-foreground mt-1">
                {field.value?.length || 0}/50
              </div>
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
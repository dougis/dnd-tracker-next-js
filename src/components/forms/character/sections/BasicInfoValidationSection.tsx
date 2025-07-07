'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CharacterCreation } from '@/lib/validations/character';
import { FormGroup } from '@/components/forms/FormGroup';
import { CHARACTER_TYPE_OPTIONS, CHARACTER_RACE_OPTIONS, SIZE_OPTIONS } from '../constants';
import { FormFieldText, FormFieldSelect } from '../components';

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
        <FormFieldText
          form={form}
          name="name"
          label="Character Name"
          required
          placeholder="Enter character name"
          maxLength={100}
          showCharCount
          className="flex-1"
        />

        <FormFieldSelect
          form={form}
          name="type"
          label="Character Type"
          required
          placeholder="Select character type"
          options={CHARACTER_TYPE_OPTIONS}
          className="flex-1"
        />
      </FormGroup>

      <FormGroup direction="row" spacing="md" data-testid="race-size-group">
        <FormFieldSelect
          form={form}
          name="race"
          label="Race"
          required
          placeholder="Select character race"
          options={CHARACTER_RACE_OPTIONS}
          className="flex-1"
        />

        <FormFieldSelect
          form={form}
          name="size"
          label="Size"
          required
          placeholder="Select character size"
          options={SIZE_OPTIONS}
          className="flex-1"
        />
      </FormGroup>

      {raceValue === 'custom' && (
        <FormFieldText
          form={form}
          name="customRace"
          label="Custom Race Name"
          required
          placeholder="Enter custom race name"
          maxLength={50}
          showCharCount
        />
      )}
    </div>
  );
}
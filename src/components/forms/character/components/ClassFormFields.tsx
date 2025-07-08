'use client';

import React from 'react';
import { UseFormReturn, FieldPath } from 'react-hook-form';
import { CharacterCreation, CharacterClass } from '@/lib/validations/character';
import { FormGroup } from '@/components/forms/FormGroup';
import { CHARACTER_CLASS_OPTIONS } from '../constants';
import { getHitDieForClass } from '../utils';
import { FormFieldSelect, FormFieldNumber } from './index';

interface ClassFormFieldsProps {
  form: UseFormReturn<CharacterCreation>;
  index: number;
  onClassChange?: (_className: CharacterClass) => void;
}

export function ClassFormFields({ form, index, onClassChange }: ClassFormFieldsProps) {
  const handleClassChange = (selectedValue: string) => {
    const className = selectedValue as CharacterClass;
    const hitDie = getHitDieForClass(className);
    form.setValue(`classes.${index}.hitDie` as FieldPath<CharacterCreation>, hitDie);
    onClassChange?.(className);
  };

  return (
    <FormGroup direction="row" spacing="md">
      <FormFieldSelect
        form={form}
        name={`classes.${index}.class` as FieldPath<CharacterCreation>}
        label="Character Class"
        required
        placeholder="Select class"
        options={CHARACTER_CLASS_OPTIONS}
        className="flex-2"
        onValueChange={handleClassChange}
      />

      <FormFieldNumber
        form={form}
        name={`classes.${index}.level` as FieldPath<CharacterCreation>}
        label="Level"
        required
        min={1}
        max={20}
        defaultValue={1}
        className="flex-1"
      />

      <FormFieldNumber
        form={form}
        name={`classes.${index}.hitDie` as FieldPath<CharacterCreation>}
        label="Hit Die"
        required
        min={4}
        max={12}
        defaultValue={8}
        description="Usually auto-set by class"
        className="flex-1"
      />
    </FormGroup>
  );
}
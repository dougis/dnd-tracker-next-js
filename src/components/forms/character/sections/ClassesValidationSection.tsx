'use client';

import React from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { CharacterCreation, CharacterClass } from '@/lib/validations/character';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { FormGroup } from '@/components/forms/FormGroup';
import { CHARACTER_CLASS_OPTIONS } from '../constants';
import { getHitDieForClass } from '../utils';
import { FormFieldSelect, FormFieldNumber } from '../components';

interface ClassesValidationSectionProps {
  form: UseFormReturn<CharacterCreation>;
}

export function ClassesValidationSection({ form }: ClassesValidationSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'classes',
  });

  const addClass = () => {
    if (fields.length < 3) {
      append({ class: 'fighter', level: 1, hitDie: 10 });
    }
  };

  const removeClass = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const classes = form.watch('classes');
  const totalLevel = classes?.reduce((sum, cls) => sum + (cls?.level || 0), 0) || 0;

  return (
    <div className="space-y-4" data-testid="classes-validation-section">
      <div>
        <h3 className="text-lg font-semibold mb-2" aria-level={3}>
          Character Classes
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Choose your character&apos;s class(es) and levels with real-time validation
        </p>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="p-4 border rounded-lg bg-card space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">
                Class {index + 1}
                {index === 0 && ' (Primary)'}
              </h4>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeClass(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove class</span>
                </Button>
              )}
            </div>

            <FormGroup direction="row" spacing="md">
              <FormFieldSelect
                form={form}
                name={`classes.${index}.class` as any}
                label="Character Class"
                required
                placeholder="Select class"
                options={CHARACTER_CLASS_OPTIONS}
                className="flex-2"
                onValueChange={(value) => {
                  const hitDie = getHitDieForClass(value as CharacterClass);
                  form.setValue(`classes.${index}.hitDie`, hitDie);
                }}
              />

              <FormFieldNumber
                form={form}
                name={`classes.${index}.level` as any}
                label="Level"
                required
                min={1}
                max={20}
                defaultValue={1}
                className="flex-1"
              />

              <FormFieldNumber
                form={form}
                name={`classes.${index}.hitDie` as any}
                label="Hit Die"
                required
                min={4}
                max={12}
                defaultValue={8}
                description="Usually auto-set by class"
                className="flex-1"
              />
            </FormGroup>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
        <div>
          <div className="text-sm font-medium">Total Level: {totalLevel}</div>
          <div className="text-xs text-muted-foreground">
            {fields.length === 1 ? 'Single class' : `${fields.length} classes`}
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addClass}
          disabled={fields.length >= 3}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Class</span>
        </Button>
      </div>
    </div>
  );
}
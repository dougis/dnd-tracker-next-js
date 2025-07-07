'use client';

import React from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { CharacterCreation, CharacterClass } from '@/lib/validations/character';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { FormGroup } from '@/components/forms/FormGroup';

interface ClassesValidationSectionProps {
  form: UseFormReturn<CharacterCreation>;
}

import { CHARACTER_CLASS_OPTIONS } from '../constants';
import { getHitDieForClass } from '../utils';

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
              <div className="flex-2">
                <FormField
                  control={form.control}
                  name={`classes.${index}.class`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Character Class *</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Auto-update hitDie when class changes
                          const hitDie = getHitDieForClass(value as CharacterClass);
                          form.setValue(`classes.${index}.hitDie`, hitDie);
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CHARACTER_CLASS_OPTIONS.map((option) => (
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
                  name={`classes.${index}.level`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Level *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={20}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex-1">
                <FormField
                  control={form.control}
                  name={`classes.${index}.hitDie`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hit Die *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={4}
                          max={12}
                          step={2}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 8)}
                        />
                      </FormControl>
                      <FormMessage />
                      <div className="text-xs text-muted-foreground mt-1">
                        Usually auto-set by class
                      </div>
                    </FormItem>
                  )}
                />
              </div>
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
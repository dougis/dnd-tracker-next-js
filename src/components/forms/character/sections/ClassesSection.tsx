'use client';

import React from 'react';
import { FormSelect, FormSelectOption } from '@/components/forms/FormSelect';
import { FormInput } from '@/components/forms/FormInput';
import { FormGroup } from '@/components/forms/FormGroup';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { CharacterClass } from '@/lib/validations/character';
import { getHitDieForClass } from '../utils';

interface ClassData {
  class: CharacterClass;
  level: number;
  hitDie: number;
}

interface ClassesSectionProps {
  value: ClassData[];
  onChange: (_value: ClassData[]) => void;
  errors: Record<string, string>;
}

const CHARACTER_CLASS_OPTIONS: FormSelectOption[] = [
  { value: 'artificer', label: 'Artificer' },
  { value: 'barbarian', label: 'Barbarian' },
  { value: 'bard', label: 'Bard' },
  { value: 'cleric', label: 'Cleric' },
  { value: 'druid', label: 'Druid' },
  { value: 'fighter', label: 'Fighter' },
  { value: 'monk', label: 'Monk' },
  { value: 'paladin', label: 'Paladin' },
  { value: 'ranger', label: 'Ranger' },
  { value: 'rogue', label: 'Rogue' },
  { value: 'sorcerer', label: 'Sorcerer' },
  { value: 'warlock', label: 'Warlock' },
  { value: 'wizard', label: 'Wizard' },
];

export function ClassesSection({ value, onChange, errors }: ClassesSectionProps) {

  const addClass = () => {
    if (value.length < 3) {
      onChange([
        ...value,
        { class: 'fighter', level: 1, hitDie: 10 },
      ]);
    }
  };

  const removeClass = (index: number) => {
    if (value.length > 1) {
      const newClasses = value.filter((_, i) => i !== index);
      onChange(newClasses);
    }
  };

  const updateClass = (index: number, field: keyof ClassData, newValue: string | number) => {
    const newClasses = [...value];
    const updatedClass = {
      ...newClasses[index],
      [field]: newValue,
    };

    // Auto-update hitDie when class changes
    if (field === 'class') {
      updatedClass.hitDie = getHitDieForClass(newValue as CharacterClass);
    }

    newClasses[index] = updatedClass;
    onChange(newClasses);
  };

  const totalLevel = value.reduce((sum, cls) => sum + cls.level, 0);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2" aria-level={3}>
          Character Classes
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Choose your character&apos;s class(es) and levels
        </p>
      </div>

      <div className="space-y-4">
        {value.map((classData, index) => (
          <div
            key={index}
            className="p-4 border rounded-lg bg-card space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">
                Class {index + 1}
                {index === 0 && ' (Primary)'}
              </h4>
              {value.length > 1 && (
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
                <FormSelect
                  label="Character Class"
                  value={classData.class}
                  onValueChange={(newValue) =>
                    updateClass(index, 'class', newValue as CharacterClass)
                  }
                  options={CHARACTER_CLASS_OPTIONS}
                  error={errors[`class-${index}`]}
                  required
                  placeholder="Select class"
                />
              </div>
              <div className="flex-1">
                <FormInput
                  label="Level"
                  value={classData.level.toString()}
                  onChange={(e) =>
                    updateClass(index, 'level', parseInt(e.target.value) || 1)
                  }
                  error={errors[`level-${index}`]}
                  type="number"
                  min={1}
                  max={20}
                  required
                />
              </div>
              <div className="flex-1">
                <FormInput
                  label="Hit Die"
                  value={classData.hitDie.toString()}
                  onChange={(e) =>
                    updateClass(index, 'hitDie', parseInt(e.target.value) || 8)
                  }
                  error={errors[`hitDie-${index}`]}
                  type="number"
                  min={4}
                  max={12}
                  step={2}
                  required
                  helperText="Usually auto-set by class"
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
            {value.length === 1 ? 'Single class' : `${value.length} classes`}
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addClass}
          disabled={value.length >= 3}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Class</span>
        </Button>
      </div>

      {errors.classes && (
        <div className="text-sm text-destructive" role="alert">
          {errors.classes}
        </div>
      )}
    </div>
  );
}
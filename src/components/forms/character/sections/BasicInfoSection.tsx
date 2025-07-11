'use client';

import React from 'react';
import { FormInput } from '@/components/forms/FormInput';
import { FormSelect, FormSelectOption } from '@/components/forms/FormSelect';
import { FormGroup } from '@/components/forms/FormGroup';
import { CharacterType, CharacterRace, Size } from '@/lib/validations/character';

interface BasicInfoData {
  name: string;
  type: CharacterType;
  race: CharacterRace | 'custom';
  customRace: string;
  size: Size;
}

interface BasicInfoSectionProps {
  value: BasicInfoData;
  onChange: (_value: BasicInfoData) => void;
  errors: Record<string, string>;
}

const CHARACTER_TYPE_OPTIONS: FormSelectOption[] = [
  { value: 'pc', label: 'Player Character' },
  { value: 'npc', label: 'Non-Player Character' },
];

const CHARACTER_RACE_OPTIONS: FormSelectOption[] = [
  { value: 'human', label: 'Human' },
  { value: 'elf', label: 'Elf' },
  { value: 'dwarf', label: 'Dwarf' },
  { value: 'halfling', label: 'Halfling' },
  { value: 'dragonborn', label: 'Dragonborn' },
  { value: 'gnome', label: 'Gnome' },
  { value: 'half-elf', label: 'Half-Elf' },
  { value: 'half-orc', label: 'Half-Orc' },
  { value: 'tiefling', label: 'Tiefling' },
  { value: 'aasimar', label: 'Aasimar' },
  { value: 'firbolg', label: 'Firbolg' },
  { value: 'goliath', label: 'Goliath' },
  { value: 'kenku', label: 'Kenku' },
  { value: 'lizardfolk', label: 'Lizardfolk' },
  { value: 'tabaxi', label: 'Tabaxi' },
  { value: 'triton', label: 'Triton' },
  { value: 'yuan-ti', label: 'Yuan-Ti Pureblood' },
  { value: 'goblin', label: 'Goblin' },
  { value: 'hobgoblin', label: 'Hobgoblin' },
  { value: 'orc', label: 'Orc' },
  { value: 'custom', label: 'Custom' },
];

const SIZE_OPTIONS: FormSelectOption[] = [
  { value: 'tiny', label: 'Tiny' },
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
  { value: 'huge', label: 'Huge' },
  { value: 'gargantuan', label: 'Gargantuan' },
];

export function BasicInfoSection({ value, onChange, errors }: BasicInfoSectionProps) {
  const handleFieldChange = (field: keyof BasicInfoData, fieldValue: string) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  return (
    <div className="space-y-4" data-testid="basic-info-section">
      <div>
        <h3 className="text-lg font-semibold mb-2" aria-level={3}>
          Basic Information
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Enter your character&apos;s fundamental details
        </p>
      </div>

      <FormGroup direction="row" spacing="md" data-testid="name-type-group">
        <div className="flex-1">
          <FormInput
            label="Character Name"
            value={value.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            error={errors.name}
            helperText="Choose a memorable name for your character"
            required
            maxLength={100}
          />
          <div className="text-xs text-muted-foreground mt-1">
            {value.name.length}/100
          </div>
        </div>

        <div className="flex-1">
          <FormSelect
            label="Character Type"
            value={value.type}
            onValueChange={(newValue) => handleFieldChange('type', newValue)}
            options={CHARACTER_TYPE_OPTIONS}
            error={errors.type}
            required
            placeholder="Select character type"
          />
        </div>
      </FormGroup>

      <FormGroup direction="row" spacing="md" data-testid="race-size-group">
        <div className="flex-1">
          <FormSelect
            label="Race"
            value={value.race}
            onValueChange={(newValue) => handleFieldChange('race', newValue)}
            options={CHARACTER_RACE_OPTIONS}
            error={errors.race}
            required
            placeholder="Select character race"
          />
        </div>

        <div className="flex-1">
          <FormSelect
            label="Size"
            value={value.size}
            onValueChange={(newValue) => handleFieldChange('size', newValue)}
            options={SIZE_OPTIONS}
            error={errors.size}
            required
            placeholder="Select character size"
          />
        </div>
      </FormGroup>

      {value.race === 'custom' && (
        <div>
          <FormInput
            label="Custom Race Name"
            value={value.customRace}
            onChange={(e) => handleFieldChange('customRace', e.target.value)}
            error={errors.customRace}
            helperText="Enter the name of your custom race"
            required
            maxLength={50}
          />
          <div className="text-xs text-muted-foreground mt-1">
            {value.customRace.length}/50
          </div>
        </div>
      )}
    </div>
  );
}
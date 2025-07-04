'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ParticipantFormData } from './hooks/useParticipantForm';

interface ParticipantFormProps {
  formData: ParticipantFormData;
  formErrors: Record<string, string>;
  onFormDataChange: (_data: ParticipantFormData) => void;
}

const FormField = ({ label, children, error, htmlFor }: {
  label: string;
  children: React.ReactNode;
  error?: string;
  htmlFor?: string;
}) => (
  <div className="space-y-2">
    <Label htmlFor={htmlFor}>{label}</Label>
    {children}
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
);

const BasicFields = ({ formData, formErrors, onFormDataChange }: ParticipantFormProps) => (
  <div className="grid grid-cols-2 gap-4">
    <FormField label="Character Name" error={formErrors.name} htmlFor="name">
      <Input
        id="name"
        value={formData.name}
        onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
        placeholder="Enter character name"
        className={formErrors.name ? 'border-red-500' : ''}
      />
    </FormField>
    <FormField label="Type" htmlFor="type">
      <Select
        name="type"
        value={formData.type}
        onValueChange={(value) =>
          onFormDataChange({
            ...formData,
            type: value as ParticipantFormData['type'],
            isPlayer: value === 'pc',
          })
        }
      >
        <SelectTrigger id="type" aria-label="Type">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pc">Player Character</SelectItem>
          <SelectItem value="npc">NPC</SelectItem>
          <SelectItem value="monster">Monster</SelectItem>
        </SelectContent>
      </Select>
    </FormField>
  </div>
);

const StatFields = ({ formData, formErrors, onFormDataChange }: ParticipantFormProps) => (
  <div className="grid grid-cols-3 gap-4">
    <FormField label="Hit Points" error={formErrors.maxHitPoints} htmlFor="maxHitPoints">
      <Input
        id="maxHitPoints"
        type="number"
        min="1"
        value={formData.maxHitPoints}
        onChange={(e) => {
          const value = parseInt(e.target.value);
          const hitPoints = isNaN(value) ? 1 : value;
          onFormDataChange({
            ...formData,
            maxHitPoints: hitPoints,
            currentHitPoints: hitPoints,
          });
        }}
        className={formErrors.maxHitPoints ? 'border-red-500' : ''}
      />
    </FormField>
    <FormField label="Armor Class" error={formErrors.armorClass} htmlFor="armorClass">
      <Input
        id="armorClass"
        type="number"
        min="0"
        value={formData.armorClass}
        onChange={(e) => {
          const value = parseInt(e.target.value);
          const armorClass = isNaN(value) ? 10 : value;
          onFormDataChange({
            ...formData,
            armorClass,
          });
        }}
        className={formErrors.armorClass ? 'border-red-500' : ''}
      />
    </FormField>
    <FormField label="Initiative" htmlFor="initiative">
      <Input
        id="initiative"
        type="number"
        value={formData.initiative || ''}
        onChange={(e) =>
          onFormDataChange({
            ...formData,
            initiative: e.target.value ? parseInt(e.target.value) : undefined,
          })
        }
        placeholder="Optional"
      />
    </FormField>
  </div>
);

export function ParticipantForm({ formData, formErrors, onFormDataChange }: ParticipantFormProps) {
  return (
    <div className="space-y-4">
      <BasicFields formData={formData} formErrors={formErrors} onFormDataChange={onFormDataChange} />
      <StatFields formData={formData} formErrors={formErrors} onFormDataChange={onFormDataChange} />
      <FormField label="Notes" htmlFor="notes">
        <Input
          id="notes"
          value={formData.notes}
          onChange={(e) => onFormDataChange({ ...formData, notes: e.target.value })}
          placeholder="Optional notes"
        />
      </FormField>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="isVisible"
          checked={formData.isVisible}
          onCheckedChange={(checked) =>
            onFormDataChange({ ...formData, isVisible: !!checked })
          }
        />
        <Label htmlFor="isVisible">Visible to players</Label>
      </div>
    </div>
  );
}
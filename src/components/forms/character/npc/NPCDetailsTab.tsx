import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Minus } from 'lucide-react';

interface Equipment {
  name: string;
  type?: 'weapon' | 'armor' | 'tool' | 'misc';
  quantity?: number;
  magical?: boolean;
}

interface Spell {
  name: string;
  level: number;
}

interface NPCDetailsTabProps {
  formData: {
    equipment: Equipment[];
    spells: Spell[];
    isSpellcaster: boolean;
    personality?: string;
    motivations?: string;
    tactics?: string;
  };
  isSubmitting: boolean;
  onUpdate: (_updates: Partial<NPCDetailsTabProps['formData']>) => void;
  onAddEquipment: () => void;
  onRemoveEquipment: (_index: number) => void;
  onAddSpell: () => void;
  onRemoveSpell: (_index: number) => void;
  onGoToStats: () => void;
  onCancel: () => void;
  onSubmit: () => void;
}

export function NPCDetailsTab({
  formData,
  isSubmitting,
  onUpdate,
  onAddEquipment,
  onRemoveEquipment,
  onAddSpell,
  onRemoveSpell,
  onGoToStats,
  onCancel,
  onSubmit,
}: NPCDetailsTabProps) {
  const updateEquipment = (index: number, field: keyof Equipment, value: any) => {
    const newEquipment = [...formData.equipment];
    newEquipment[index] = { ...newEquipment[index], [field]: value };
    onUpdate({ equipment: newEquipment });
  };

  const updateSpell = (index: number, field: keyof Spell, value: any) => {
    const newSpells = [...formData.spells];
    newSpells[index] = { ...newSpells[index], [field]: value };
    onUpdate({ spells: newSpells });
  };

  return (
    <div className="space-y-4">
      <EquipmentSection
        equipment={formData.equipment}
        onAddEquipment={onAddEquipment}
        onRemoveEquipment={onRemoveEquipment}
        updateEquipment={updateEquipment}
      />

      <SpellcastingSection
        isSpellcaster={formData.isSpellcaster}
        spells={formData.spells}
        onUpdate={onUpdate}
        onAddSpell={onAddSpell}
        onRemoveSpell={onRemoveSpell}
        updateSpell={updateSpell}
      />

      <BehaviorSection
        personality={formData.personality}
        motivations={formData.motivations}
        tactics={formData.tactics}
        onUpdate={onUpdate}
      />

      <NavigationButtons
        isSubmitting={isSubmitting}
        onGoToStats={onGoToStats}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />
    </div>
  );
}

function EquipmentSection({
  equipment,
  onAddEquipment,
  onRemoveEquipment,
  updateEquipment,
}: {
  equipment: Equipment[];
  onAddEquipment: () => void;
  onRemoveEquipment: (_index: number) => void;
  updateEquipment: (_index: number, _field: keyof Equipment, _value: any) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Equipment</h3>
        <Button onClick={onAddEquipment} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Equipment
        </Button>
      </div>

      {equipment.map((item, index) => (
        <EquipmentItem
          key={index}
          item={item}
          index={index}
          updateEquipment={updateEquipment}
          onRemove={onRemoveEquipment}
        />
      ))}
    </div>
  );
}

function EquipmentItem({
  item,
  index,
  updateEquipment,
  onRemove,
}: {
  item: Equipment;
  index: number;
  updateEquipment: (_index: number, _field: keyof Equipment, _value: any) => void;
  onRemove: (_index: number) => void;
}) {
  return (
    <div className="flex gap-2 items-center">
      <Input
        placeholder="Equipment name"
        value={item.name}
        onChange={(e) => updateEquipment(index, 'name', e.target.value)}
        aria-label="Equipment item"
      />
      <Select
        value={item.type || 'misc'}
        onValueChange={(value) => updateEquipment(index, 'type', value)}
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="weapon">Weapon</SelectItem>
          <SelectItem value="armor">Armor</SelectItem>
          <SelectItem value="tool">Tool</SelectItem>
          <SelectItem value="misc">Misc</SelectItem>
        </SelectContent>
      </Select>
      <Button
        onClick={() => onRemove(index)}
        size="sm"
        variant="outline"
        aria-label="Remove equipment"
      >
        <Minus className="w-4 h-4" />
      </Button>
    </div>
  );
}

function SpellcastingSection({
  isSpellcaster,
  spells,
  onUpdate,
  onAddSpell,
  onRemoveSpell,
  updateSpell,
}: {
  isSpellcaster: boolean;
  spells: Spell[];
  onUpdate: (_updates: { isSpellcaster?: boolean }) => void;
  onAddSpell: () => void;
  onRemoveSpell: (_index: number) => void;
  updateSpell: (_index: number, _field: keyof Spell, _value: any) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="spellcaster"
          checked={isSpellcaster}
          onCheckedChange={(checked) => onUpdate({ isSpellcaster: !!checked })}
        />
        <Label htmlFor="spellcaster">Spellcaster</Label>
      </div>

      {isSpellcaster && (
        <SpellList
          spells={spells}
          onAddSpell={onAddSpell}
          onRemoveSpell={onRemoveSpell}
          updateSpell={updateSpell}
        />
      )}
    </div>
  );
}

function SpellList({
  spells,
  onAddSpell,
  onRemoveSpell,
  updateSpell,
}: {
  spells: Spell[];
  onAddSpell: () => void;
  onRemoveSpell: (_index: number) => void;
  updateSpell: (_index: number, _field: keyof Spell, _value: any) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">Spells</h4>
        <Button onClick={onAddSpell} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Spell
        </Button>
      </div>

      {spells.map((spell, index) => (
        <div key={index} className="flex gap-2 items-center">
          <Input
            placeholder="Spell name"
            value={spell.name}
            onChange={(e) => updateSpell(index, 'name', e.target.value)}
            aria-label="Spell name"
          />
          <Input
            type="number"
            min="0"
            max="9"
            placeholder="Level"
            value={spell.level}
            onChange={(e) => updateSpell(index, 'level', parseInt(e.target.value, 10) || 0)}
            className="w-20"
            aria-label="Spell level"
          />
          <Button
            onClick={() => onRemoveSpell(index)}
            size="sm"
            variant="outline"
            aria-label="Remove spell"
          >
            <Minus className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}

function BehaviorSection({
  personality,
  motivations,
  tactics,
  onUpdate,
}: {
  personality?: string;
  motivations?: string;
  tactics?: string;
  onUpdate: (_updates: { personality?: string; motivations?: string; tactics?: string }) => void;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Behavior & Notes</h3>

      <div className="space-y-2">
        <Label htmlFor="personality">Personality</Label>
        <Textarea
          id="personality"
          placeholder="Describe the NPC's personality traits..."
          value={personality || ''}
          onChange={(e) => onUpdate({ personality: e.target.value })}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="motivations">Motivations</Label>
        <Textarea
          id="motivations"
          placeholder="What drives this NPC? What are their goals?"
          value={motivations || ''}
          onChange={(e) => onUpdate({ motivations: e.target.value })}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tactics">Tactics</Label>
        <Textarea
          id="tactics"
          placeholder="How does this NPC fight or behave in combat?"
          value={tactics || ''}
          onChange={(e) => onUpdate({ tactics: e.target.value })}
          rows={2}
        />
      </div>
    </div>
  );
}

function NavigationButtons({
  isSubmitting,
  onGoToStats,
  onCancel,
  onSubmit,
}: {
  isSubmitting: boolean;
  onGoToStats: () => void;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="flex justify-between">
      <Button variant="outline" onClick={onGoToStats}>
        Back: Stats & Combat
      </Button>
      <div className="space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Creating NPC...' : 'Create NPC'}
        </Button>
      </div>
    </div>
  );
}
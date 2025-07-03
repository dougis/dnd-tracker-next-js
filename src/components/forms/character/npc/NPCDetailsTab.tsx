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
      {/* Equipment */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Equipment</h3>
          <Button onClick={onAddEquipment} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Equipment
          </Button>
        </div>

        {formData.equipment.map((item, index) => (
          <div key={index} className="flex gap-2 items-center">
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
              onClick={() => onRemoveEquipment(index)}
              size="sm"
              variant="outline"
              aria-label="Remove equipment"
            >
              <Minus className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Spellcasting */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="spellcaster"
            checked={formData.isSpellcaster}
            onCheckedChange={(checked) => onUpdate({ isSpellcaster: !!checked })}
          />
          <Label htmlFor="spellcaster">Spellcaster</Label>
        </div>

        {formData.isSpellcaster && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Spells</h4>
              <Button onClick={onAddSpell} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Spell
              </Button>
            </div>

            {formData.spells.map((spell, index) => (
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
                  onChange={(e) => updateSpell(index, 'level', parseInt(e.target.value) || 0)}
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
        )}
      </div>

      {/* Behavior & Notes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Behavior & Notes</h3>

        <div className="space-y-2">
          <Label htmlFor="personality">Personality</Label>
          <Textarea
            id="personality"
            placeholder="Describe the NPC's personality traits..."
            value={formData.personality || ''}
            onChange={(e) => onUpdate({ personality: e.target.value })}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="motivations">Motivations</Label>
          <Textarea
            id="motivations"
            placeholder="What drives this NPC? What are their goals?"
            value={formData.motivations || ''}
            onChange={(e) => onUpdate({ motivations: e.target.value })}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tactics">Tactics</Label>
          <Textarea
            id="tactics"
            placeholder="How does this NPC fight or behave in combat?"
            value={formData.tactics || ''}
            onChange={(e) => onUpdate({ tactics: e.target.value })}
            rows={2}
          />
        </div>
      </div>

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
    </div>
  );
}
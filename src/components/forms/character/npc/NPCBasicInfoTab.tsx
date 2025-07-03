import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CreatureType, Size, ChallengeRating, VariantType, calculateProficiencyBonus } from '@/types/npc';

interface NPCBasicInfoTabProps {
  formData: {
    name: string;
    creatureType: CreatureType;
    size: Size;
    challengeRating: ChallengeRating;
    isVariant: boolean;
    variantType?: VariantType;
  };
  errors: Record<string, string>;
  selectedTemplate: any;
  onUpdate: (_updates: Partial<NPCBasicInfoTabProps['formData']>) => void;
  onVariantToggle: (_checked: boolean) => void;
  onApplyVariant: () => void;
  onGoToTemplate: () => void;
  onGoToStats: () => void;
}

export function NPCBasicInfoTab({
  formData,
  errors,
  selectedTemplate,
  onUpdate,
  onVariantToggle,
  onApplyVariant,
  onGoToTemplate,
  onGoToStats,
}: NPCBasicInfoTabProps) {
  const proficiencyBonus = calculateProficiencyBonus(formData.challengeRating);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="npc-name">NPC Name *</Label>
          <Input
            id="npc-name"
            value={formData.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="Enter NPC name"
            aria-required="true"
          />
          {errors.name && <p className="text-sm text-red-600" role="alert">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="creature-type">Creature Type *</Label>
          <Select
            value={formData.creatureType}
            onValueChange={(value) => onUpdate({ creatureType: value as CreatureType })}
          >
            <SelectTrigger id="creature-type" aria-required="true">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="humanoid">Humanoid</SelectItem>
              <SelectItem value="beast">Beast</SelectItem>
              <SelectItem value="undead">Undead</SelectItem>
              <SelectItem value="fey">Fey</SelectItem>
              <SelectItem value="fiend">Fiend</SelectItem>
              <SelectItem value="celestial">Celestial</SelectItem>
              <SelectItem value="elemental">Elemental</SelectItem>
              <SelectItem value="construct">Construct</SelectItem>
              <SelectItem value="dragon">Dragon</SelectItem>
              <SelectItem value="giant">Giant</SelectItem>
              <SelectItem value="monstrosity">Monstrosity</SelectItem>
              <SelectItem value="ooze">Ooze</SelectItem>
              <SelectItem value="plant">Plant</SelectItem>
              <SelectItem value="aberration">Aberration</SelectItem>
            </SelectContent>
          </Select>
          {errors.creatureType && <p className="text-sm text-red-600" role="alert">{errors.creatureType}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="size">Size</Label>
          <Select
            value={formData.size}
            onValueChange={(value) => onUpdate({ size: value as Size })}
          >
            <SelectTrigger id="size">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tiny">Tiny</SelectItem>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="large">Large</SelectItem>
              <SelectItem value="huge">Huge</SelectItem>
              <SelectItem value="gargantuan">Gargantuan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="challenge-rating">Challenge Rating *</Label>
          <Input
            id="challenge-rating"
            type="number"
            min="0"
            max="30"
            step="0.125"
            value={formData.challengeRating}
            onChange={(e) => onUpdate({ challengeRating: parseFloat(e.target.value) as ChallengeRating })}
            aria-required="true"
          />
          {errors.challengeRating && <p className="text-sm text-red-600" role="alert">{errors.challengeRating}</p>}
          <p className="text-sm text-muted-foreground">Proficiency Bonus: +{proficiencyBonus}</p>
        </div>
      </div>

      {/* Variant Creation */}
      <div className="space-y-4 p-4 border rounded-lg">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="create-variant"
            checked={formData.isVariant}
            onCheckedChange={onVariantToggle}
          />
          <Label htmlFor="create-variant">Create Variant</Label>
        </div>

        {formData.isVariant && (
          <div className="space-y-2">
            <Label htmlFor="variant-type">Variant Type</Label>
            <Select
              value={formData.variantType}
              onValueChange={(value) => onUpdate({ variantType: value as VariantType })}
            >
              <SelectTrigger id="variant-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="elite">Elite (stronger stats, higher CR)</SelectItem>
                <SelectItem value="weak">Weak (weaker stats, lower CR)</SelectItem>
                <SelectItem value="champion">Champion (much stronger, legendary actions)</SelectItem>
                <SelectItem value="minion">Minion (1 HP, very weak)</SelectItem>
              </SelectContent>
            </Select>
            {formData.variantType && (
              <p className="text-sm text-muted-foreground">
                {formData.variantType === 'elite' && 'Elite variant increases challenge rating and enhances abilities.'}
                {formData.variantType === 'weak' && 'Weak variant decreases challenge rating and reduces abilities.'}
                {formData.variantType === 'champion' && 'Champion variant significantly increases power and may add legendary actions.'}
                {formData.variantType === 'minion' && 'Minion variant creates a very weak creature with 1 hit point.'}
              </p>
            )}
            <Button onClick={onApplyVariant} disabled={!selectedTemplate} size="sm">
              Apply Variant Modifiers
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onGoToTemplate}>
          Back to Templates
        </Button>
        <Button onClick={onGoToStats}>
          Next: Stats & Combat
        </Button>
      </div>
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Minus, Search, Download, Upload } from 'lucide-react';
import { CharacterService } from '@/lib/services/CharacterService';
import { NPCTemplateService } from '@/lib/services/NPCTemplateService';
import {
  NPCTemplate,
  CreatureType,
  Size,
  ChallengeRating,
  formatChallengeRating,
  calculateProficiencyBonus,
  calculateAbilityModifier,
  VariantType
} from '@/types/npc';

interface NPCCreationFormProps {
  ownerId: string;
  onSuccess: (_npcId: string) => void;
  onCancel: () => void;
  isOpen: boolean;
}

interface NPCFormData {
  name: string;
  creatureType: CreatureType;
  size: Size;
  challengeRating: ChallengeRating;
  abilityScores: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  hitPoints: {
    maximum: number;
    current: number;
    temporary: number;
    hitDice?: string;
  };
  armorClass: number;
  speed: number;
  damageVulnerabilities: string[];
  damageResistances: string[];
  damageImmunities: string[];
  conditionImmunities: string[];
  senses: string[];
  languages: string[];
  equipment: Array<{ name: string; type?: 'weapon' | 'armor' | 'tool' | 'misc'; quantity?: number; magical?: boolean }>;
  spells: Array<{ name: string; level: number }>;
  actions: Array<{
    name: string;
    type: 'action' | 'bonus_action' | 'reaction' | 'legendary_action' | 'lair_action';
    description: string;
    attackBonus?: number;
    damage?: string;
    range?: string;
    recharge?: string;
    uses?: number;
    maxUses?: number;
  }>;
  isSpellcaster: boolean;
  personality?: string;
  motivations?: string;
  tactics?: string;
  isVariant: boolean;
  variantType?: VariantType;
}

const initialFormData: NPCFormData = {
  name: '',
  creatureType: 'humanoid',
  size: 'medium',
  challengeRating: 0.5,
  abilityScores: {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  },
  hitPoints: {
    maximum: 1,
    current: 1,
    temporary: 0,
  },
  armorClass: 10,
  speed: 30,
  damageVulnerabilities: [],
  damageResistances: [],
  damageImmunities: [],
  conditionImmunities: [],
  senses: [],
  languages: [],
  equipment: [],
  spells: [],
  actions: [],
  isSpellcaster: false,
  isVariant: false,
};

export function NPCCreationForm({ ownerId, onSuccess, onCancel, isOpen }: NPCCreationFormProps) {
  const [formData, setFormData] = useState<NPCFormData>(initialFormData);
  const [templates, setTemplates] = useState<NPCTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<NPCTemplate[]>([]);
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateCategory, setTemplateCategory] = useState<CreatureType | 'all'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<NPCTemplate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('template');
  const [jsonImportData, setJsonImportData] = useState('');

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  // Filter templates based on search and category
  useEffect(() => {
    let filtered = templates;

    if (templateCategory !== 'all') {
      filtered = filtered.filter(t => t.category === templateCategory);
    }

    if (templateSearch) {
      const searchLower = templateSearch.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(searchLower) ||
        t.category.toLowerCase().includes(searchLower)
      );
    }

    setFilteredTemplates(filtered);
  }, [templates, templateSearch, templateCategory]);

  const loadTemplates = async () => {
    try {
      const result = await NPCTemplateService.getTemplates();
      if (result.success) {
        setTemplates(result.data);
      } else {
        console.error('Failed to load NPC templates');
      }
    } catch {
      console.error('Error loading templates');
    }
  };

  const handleTemplateSelect = (template: NPCTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      ...formData,
      name: template.name,
      creatureType: template.category,
      size: template.size || 'medium',
      challengeRating: template.challengeRating,
      abilityScores: { ...template.stats.abilityScores },
      hitPoints: { ...template.stats.hitPoints, temporary: 0 },
      armorClass: template.stats.armorClass,
      speed: template.stats.speed,
      damageVulnerabilities: [...(template.stats.damageVulnerabilities || [])],
      damageResistances: [...(template.stats.damageResistances || [])],
      damageImmunities: [...(template.stats.damageImmunities || [])],
      conditionImmunities: [...(template.stats.conditionImmunities || [])],
      senses: [...(template.stats.senses || [])],
      languages: [...(template.stats.languages || [])],
      equipment: template.equipment?.map(eq => ({ name: eq.name, type: eq.type, quantity: eq.quantity || 1, magical: eq.magical || false })) || [],
      spells: template.spells?.map(spell => ({ name: spell.name, level: spell.level })) || [],
      actions: template.actions?.map(action => ({
        name: action.name,
        type: action.type,
        description: action.description,
        attackBonus: action.attackBonus,
        damage: action.damage,
        range: action.range,
        recharge: action.recharge,
        uses: action.uses,
        maxUses: action.maxUses,
      })) || [],
      isSpellcaster: (template.spells?.length || 0) > 0,
      personality: template.behavior?.personality,
      motivations: template.behavior?.motivations,
      tactics: template.behavior?.tactics,
      isVariant: false,
    });
    setActiveTab('basic');
  };

  const handleJsonImport = () => {
    try {
      const parsed = JSON.parse(jsonImportData);

      // Map the imported data to our form structure
      setFormData({
        ...formData,
        name: parsed.name || '',
        creatureType: parsed.creatureType || parsed.category || 'humanoid',
        challengeRating: parsed.challengeRating || 0.5,
        abilityScores: parsed.abilityScores || formData.abilityScores,
        hitPoints: parsed.hitPoints ? { ...parsed.hitPoints, temporary: parsed.hitPoints.temporary || 0 } : formData.hitPoints,
        armorClass: parsed.armorClass || 10,
        speed: parsed.speed || 30,
      });

      setJsonImportData('');
      setActiveTab('basic');
      console.log('NPC data imported successfully');
    } catch {
      console.error('Invalid JSON data');
    }
  };

  const handleVariantToggle = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isVariant: checked,
      variantType: checked ? 'elite' : undefined,
    }));
  };

  const applyVariant = async () => {
    if (!selectedTemplate || !formData.variantType) return;

    try {
      const result = await NPCTemplateService.applyVariant(selectedTemplate, formData.variantType);
      if (result.success) {
        const variant = result.data;
        setFormData(prev => ({
          ...prev,
          name: variant.name!,
          challengeRating: variant.challengeRating!,
          abilityScores: { ...variant.stats!.abilityScores },
          hitPoints: { ...variant.stats!.hitPoints, temporary: 0 },
        }));
        console.log(`Applied ${formData.variantType} variant`);
      }
    } catch {
      console.error('Failed to apply variant');
    }
  };

  const addEquipment = () => {
    setFormData(prev => ({
      ...prev,
      equipment: [...prev.equipment, { name: '', type: 'misc', quantity: 1, magical: false }],
    }));
  };

  const removeEquipment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.filter((_, i) => i !== index),
    }));
  };

  const addSpell = () => {
    setFormData(prev => ({
      ...prev,
      spells: [...prev.spells, { name: '', level: 0 }],
    }));
  };

  const removeSpell = (index: number) => {
    setFormData(prev => ({
      ...prev,
      spells: prev.spells.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'NPC name is required';
    }

    if (!formData.creatureType) {
      newErrors.creatureType = 'Creature type is required';
    }

    if (formData.challengeRating === undefined) {
      newErrors.challengeRating = 'Challenge rating is required';
    }

    if (formData.challengeRating < 0 || formData.challengeRating > 30) {
      newErrors.challengeRating = 'Challenge rating must be between 0 and 30';
    }

    // Validate ability scores
    Object.entries(formData.abilityScores).forEach(([ability, score]) => {
      if (score < 1 || score > 30) {
        newErrors[ability] = `${ability.charAt(0).toUpperCase() + ability.slice(1)} must be between 1 and 30`;
      }
    });

    if (formData.hitPoints.maximum < 1) {
      newErrors.hitPoints = 'Hit points must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Map NPC data to Character schema for compatibility
      const characterData = {
        name: formData.name,
        type: 'npc' as const,
        race: 'custom' as const, // Map creatureType to custom race
        customRace: formData.creatureType,
        size: formData.size,
        classes: [{ class: 'fighter' as const, level: 1, hitDie: 10 }], // Default class for NPCs
        abilityScores: formData.abilityScores,
        hitPoints: formData.hitPoints,
        armorClass: formData.armorClass,
        speed: formData.speed,
        proficiencyBonus: calculateProficiencyBonus(formData.challengeRating),
        savingThrows: {
          strength: false,
          dexterity: false,
          constitution: false,
          intelligence: false,
          wisdom: false,
          charisma: false,
        },
        skills: {},
        equipment: formData.equipment.map(eq => ({
          name: eq.name,
          quantity: eq.quantity || 1,
          equipped: true,
          magical: eq.magical || false
        })),
        spells: formData.spells.map(spell => ({
          name: spell.name,
          level: spell.level,
          description: '',
          range: '',
          school: 'evocation' as const,
          castingTime: '',
          components: { verbal: false, somatic: false, material: false },
          duration: '',
          prepared: true,
        })),
        // Store NPC-specific data in notes or custom fields
        notes: JSON.stringify({
          creatureType: formData.creatureType,
          challengeRating: formData.challengeRating,
          damageVulnerabilities: formData.damageVulnerabilities,
          damageResistances: formData.damageResistances,
          damageImmunities: formData.damageImmunities,
          conditionImmunities: formData.conditionImmunities,
          senses: formData.senses,
          languages: formData.languages,
          equipment: formData.equipment,
          spells: formData.spells,
          actions: formData.actions,
          isSpellcaster: formData.isSpellcaster,
          behavior: {
            personality: formData.personality,
            motivations: formData.motivations,
            tactics: formData.tactics,
          },
          isVariant: formData.isVariant,
          variantType: formData.variantType,
        }),
      };

      const result = await CharacterService.createCharacter(ownerId, characterData);

      if (result.success) {
        console.log('NPC created successfully');
        onSuccess(result.data.id);
      } else {
        console.error(result.error?.message || 'Failed to create NPC');
      }
    } catch {
      console.error('Error creating NPC');
    } finally {
      setIsSubmitting(false);
    }
  };

  const proficiencyBonus = calculateProficiencyBonus(formData.challengeRating);
  const suggestedAC = 10 + calculateAbilityModifier(formData.abilityScores.dexterity);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create NPC</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="template">Templates</TabsTrigger>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="stats">Stats & Combat</TabsTrigger>
            <TabsTrigger value="details">Details & Behavior</TabsTrigger>
          </TabsList>

          <TabsContent value="template" className="space-y-4">
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <Label htmlFor="template-search">Search Templates</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="template-search"
                    placeholder="Search by name or type..."
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="w-48">
                <Label htmlFor="template-category">Filter by Category</Label>
                <Select value={templateCategory} onValueChange={(value) => setTemplateCategory(value as CreatureType | 'all')}>
                  <SelectTrigger id="template-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
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
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-colors hover:bg-accent ${
                      selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <Badge variant="outline">CR {formatChallengeRating(template.challengeRating)}</Badge>
                      </div>
                      <CardDescription className="capitalize">
                        {template.category} • {template.size || 'medium'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        <div>HP: {template.stats.hitPoints.maximum}</div>
                        <div>AC: {template.stats.armorClass}</div>
                        {template.behavior?.personality && (
                          <div className="mt-2 italic">&ldquo;{template.behavior.personality}&rdquo;</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              <h3 className="text-lg font-semibold">Import from External Sources</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Import from D&D Beyond
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="json-import">Paste JSON Data</Label>
                <Textarea
                  id="json-import"
                  placeholder="Paste NPC JSON data here..."
                  value={jsonImportData}
                  onChange={(e) => setJsonImportData(e.target.value)}
                  rows={4}
                />
                <Button
                  onClick={handleJsonImport}
                  disabled={!jsonImportData.trim()}
                  size="sm"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab('basic')}>
                Create Custom NPC
              </Button>
              <Button
                onClick={() => setActiveTab('basic')}
                disabled={!selectedTemplate}
              >
                Start from Template
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="npc-name">NPC Name *</Label>
                <Input
                  id="npc-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter NPC name"
                  aria-required="true"
                />
                {errors.name && <p className="text-sm text-red-600" role="alert">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="creature-type">Creature Type *</Label>
                <Select
                  value={formData.creatureType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, creatureType: value as CreatureType }))}
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
                  onValueChange={(value) => setFormData(prev => ({ ...prev, size: value as Size }))}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, challengeRating: parseFloat(e.target.value) as ChallengeRating }))}
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
                  onCheckedChange={handleVariantToggle}
                />
                <Label htmlFor="create-variant">Create Variant</Label>
              </div>

              {formData.isVariant && (
                <div className="space-y-2">
                  <Label htmlFor="variant-type">Variant Type</Label>
                  <Select
                    value={formData.variantType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, variantType: value as VariantType }))}
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
                  <Button onClick={applyVariant} disabled={!selectedTemplate} size="sm">
                    Apply Variant Modifiers
                  </Button>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab('template')}>
                Back to Templates
              </Button>
              <Button onClick={() => setActiveTab('stats')}>
                Next: Stats & Combat
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            {/* Ability Scores */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Ability Scores</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(formData.abilityScores).map(([ability, score]) => (
                  <div key={ability} className="space-y-2">
                    <Label htmlFor={ability} className="capitalize">
                      {ability}
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id={ability}
                        type="number"
                        min="1"
                        max="30"
                        value={score}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          abilityScores: {
                            ...prev.abilityScores,
                            [ability]: parseInt(e.target.value) || 10
                          }
                        }))}
                        className="w-20"
                      />
                      <Badge variant="outline">
                        {calculateAbilityModifier(score) >= 0 ? '+' : ''}{calculateAbilityModifier(score)}
                      </Badge>
                    </div>
                    {errors[ability] && <p className="text-sm text-red-600" role="alert">{errors[ability]}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Combat Stats */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Combat Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hit-points">Hit Points *</Label>
                  <Input
                    id="hit-points"
                    type="number"
                    min="1"
                    value={formData.hitPoints.maximum}
                    onChange={(e) => {
                      const max = parseInt(e.target.value) || 1;
                      setFormData(prev => ({
                        ...prev,
                        hitPoints: { maximum: max, current: max, temporary: prev.hitPoints.temporary }
                      }));
                    }}
                    aria-required="true"
                  />
                  {errors.hitPoints && <p className="text-sm text-red-600" role="alert">{errors.hitPoints}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="armor-class">Armor Class *</Label>
                  <Input
                    id="armor-class"
                    type="number"
                    min="1"
                    max="30"
                    value={formData.armorClass}
                    onChange={(e) => setFormData(prev => ({ ...prev, armorClass: parseInt(e.target.value) || 10 }))}
                    aria-required="true"
                  />
                  <p className="text-sm text-muted-foreground">Suggested AC: {suggestedAC}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="speed">Speed (feet)</Label>
                  <Input
                    id="speed"
                    type="number"
                    min="0"
                    value={formData.speed}
                    onChange={(e) => setFormData(prev => ({ ...prev, speed: parseInt(e.target.value) || 30 }))}
                  />
                </div>
              </div>
            </div>

            {/* Damage Types */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Damage & Conditions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="damage-resistances">Damage Resistances</Label>
                  <Input
                    id="damage-resistances"
                    placeholder="e.g., fire, cold, slashing"
                    value={formData.damageResistances.join(', ')}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      damageResistances: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="damage-immunities">Damage Immunities</Label>
                  <Input
                    id="damage-immunities"
                    placeholder="e.g., poison, necrotic"
                    value={formData.damageImmunities.join(', ')}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      damageImmunities: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="damage-vulnerabilities">Damage Vulnerabilities</Label>
                  <Input
                    id="damage-vulnerabilities"
                    placeholder="e.g., fire, radiant"
                    value={formData.damageVulnerabilities.join(', ')}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      damageVulnerabilities: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condition-immunities">Condition Immunities</Label>
                  <Input
                    id="condition-immunities"
                    placeholder="e.g., charmed, frightened"
                    value={formData.conditionImmunities.join(', ')}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      conditionImmunities: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }))}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab('basic')}>
                Back: Basic Info
              </Button>
              <Button onClick={() => setActiveTab('details')}>
                Next: Details & Behavior
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            {/* Equipment */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Equipment</h3>
                <Button onClick={addEquipment} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Equipment
                </Button>
              </div>

              {formData.equipment.map((item, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    placeholder="Equipment name"
                    value={item.name}
                    onChange={(e) => {
                      const newEquipment = [...formData.equipment];
                      newEquipment[index] = { ...item, name: e.target.value };
                      setFormData(prev => ({ ...prev, equipment: newEquipment }));
                    }}
                    aria-label="Equipment item"
                  />
                  <Select
                    value={item.type || 'misc'}
                    onValueChange={(value) => {
                      const newEquipment = [...formData.equipment];
                      newEquipment[index] = { ...item, type: value as any };
                      setFormData(prev => ({ ...prev, equipment: newEquipment }));
                    }}
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
                    onClick={() => removeEquipment(index)}
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
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isSpellcaster: !!checked }))}
                />
                <Label htmlFor="spellcaster">Spellcaster</Label>
              </div>

              {formData.isSpellcaster && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Spells</h4>
                    <Button onClick={addSpell} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Spell
                    </Button>
                  </div>

                  {formData.spells.map((spell, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        placeholder="Spell name"
                        value={spell.name}
                        onChange={(e) => {
                          const newSpells = [...formData.spells];
                          newSpells[index] = { ...spell, name: e.target.value };
                          setFormData(prev => ({ ...prev, spells: newSpells }));
                        }}
                        aria-label="Spell name"
                      />
                      <Input
                        type="number"
                        min="0"
                        max="9"
                        placeholder="Level"
                        value={spell.level}
                        onChange={(e) => {
                          const newSpells = [...formData.spells];
                          newSpells[index] = { ...spell, level: parseInt(e.target.value) || 0 };
                          setFormData(prev => ({ ...prev, spells: newSpells }));
                        }}
                        className="w-20"
                        aria-label="Spell level"
                      />
                      <Button
                        onClick={() => removeSpell(index)}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, personality: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="motivations">Motivations</Label>
                <Textarea
                  id="motivations"
                  placeholder="What drives this NPC? What are their goals?"
                  value={formData.motivations || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, motivations: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tactics">Tactics</Label>
                <Textarea
                  id="tactics"
                  placeholder="How does this NPC fight or behave in combat?"
                  value={formData.tactics || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, tactics: e.target.value }))}
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab('stats')}>
                Back: Stats & Combat
              </Button>
              <div className="space-x-2">
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? 'Creating NPC...' : 'Create NPC'}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
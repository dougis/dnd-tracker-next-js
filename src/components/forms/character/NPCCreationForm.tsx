'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CharacterService } from '@/lib/services/CharacterService';
import { NPCTemplateService } from '@/lib/services/NPCTemplateService';
import {
  NPCTemplate,
  CreatureType,
  calculateProficiencyBonus,
} from '@/types/npc';
import { NPCTemplateTab } from './npc/NPCTemplateTab';
import { NPCBasicInfoTab } from './npc/NPCBasicInfoTab';
import { NPCStatsTab } from './npc/NPCStatsTab';
import { NPCDetailsTab } from './npc/NPCDetailsTab';
import { useNPCForm } from './npc/hooks/useNPCForm';

interface NPCCreationFormProps {
  ownerId: string;
  onSuccess: (_npcId: string) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export function NPCCreationForm({ ownerId, onSuccess, onCancel, isOpen }: NPCCreationFormProps) {
  const { formData, errors, updateFormData, validateForm } = useNPCForm();
  const [templates, setTemplates] = useState<NPCTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<NPCTemplate[]>([]);
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateCategory, setTemplateCategory] = useState<CreatureType | 'all'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<NPCTemplate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    updateFormData({
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
      updateFormData({
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
    updateFormData({
      isVariant: checked,
      variantType: checked ? 'elite' : undefined,
    });
  };

  const applyVariant = async () => {
    if (!selectedTemplate || !formData.variantType) return;

    try {
      const result = await NPCTemplateService.applyVariant(selectedTemplate, formData.variantType);
      if (result.success) {
        const variant = result.data;
        updateFormData({
          name: variant.name!,
          challengeRating: variant.challengeRating!,
          abilityScores: { ...variant.stats!.abilityScores },
          hitPoints: { ...variant.stats!.hitPoints, temporary: 0 },
        });
        console.log(`Applied ${formData.variantType} variant`);
      }
    } catch {
      console.error('Failed to apply variant');
    }
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="npc-creation-description">
        <DialogHeader>
          <DialogTitle>Create NPC</DialogTitle>
          <DialogDescription id="npc-creation-description">
            Create a new NPC using templates or custom configuration
          </DialogDescription>
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
            <NPCTemplateTab
              templates={templates}
              filteredTemplates={filteredTemplates}
              templateSearch={templateSearch}
              templateCategory={templateCategory}
              selectedTemplate={selectedTemplate}
              jsonImportData={jsonImportData}
              onTemplateSelect={handleTemplateSelect}
              onSearchChange={setTemplateSearch}
              onCategoryChange={setTemplateCategory}
              onJsonImportDataChange={setJsonImportData}
              onJsonImport={handleJsonImport}
              onGoToBasic={() => setActiveTab('basic')}
            />
          </TabsContent>

          <TabsContent value="basic" className="space-y-4">
            <NPCBasicInfoTab
              formData={formData}
              errors={errors}
              selectedTemplate={selectedTemplate}
              onUpdate={updateFormData}
              onVariantToggle={handleVariantToggle}
              onApplyVariant={applyVariant}
              onGoToTemplate={() => setActiveTab('template')}
              onGoToStats={() => setActiveTab('stats')}
            />
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <NPCStatsTab
              formData={formData}
              errors={errors}
              suggestedAC={Math.max(10, 8 + Math.floor(formData.challengeRating * 1.5))}
              onUpdate={updateFormData}
              onGoToBasic={() => setActiveTab('basic')}
              onGoToDetails={() => setActiveTab('details')}
            />
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <NPCDetailsTab
              formData={formData}
              isSubmitting={isSubmitting}
              onUpdate={updateFormData}
              onAddEquipment={() => {}}
              onRemoveEquipment={() => {}}
              onAddSpell={() => {}}
              onRemoveSpell={() => {}}
              onGoToStats={() => setActiveTab('stats')}
              onCancel={onCancel}
              onSubmit={handleSubmit}
            />
          </TabsContent>
        </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
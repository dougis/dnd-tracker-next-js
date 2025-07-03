import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Upload } from 'lucide-react';
import { NPCTemplate, CreatureType, formatChallengeRating } from '@/types/npc';

interface NPCTemplateTabProps {
  templates: NPCTemplate[];
  filteredTemplates: NPCTemplate[];
  templateSearch: string;
  templateCategory: CreatureType | 'all';
  selectedTemplate: NPCTemplate | null;
  jsonImportData: string;
  onTemplateSelect: (_template: NPCTemplate) => void;
  onSearchChange: (_search: string) => void;
  onCategoryChange: (_category: CreatureType | 'all') => void;
  onJsonImportDataChange: (_data: string) => void;
  onJsonImport: () => void;
  onGoToBasic: () => void;
}

export function NPCTemplateTab({
  filteredTemplates,
  templateSearch,
  templateCategory,
  selectedTemplate,
  jsonImportData,
  onTemplateSelect,
  onSearchChange,
  onCategoryChange,
  onJsonImportDataChange,
  onJsonImport,
  onGoToBasic,
}: NPCTemplateTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <Label htmlFor="template-search">Search Templates</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="template-search"
              placeholder="Search by name or type..."
              value={templateSearch}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="w-48">
          <Label htmlFor="template-category">Filter by Category</Label>
          <Select value={templateCategory} onValueChange={onCategoryChange}>
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
              onClick={() => onTemplateSelect(template)}
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
            onChange={(e) => onJsonImportDataChange(e.target.value)}
            rows={4}
          />
          <Button
            onClick={onJsonImport}
            disabled={!jsonImportData.trim()}
            size="sm"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onGoToBasic}>
          Create Custom NPC
        </Button>
        <Button
          onClick={onGoToBasic}
          disabled={!selectedTemplate}
        >
          Start from Template
        </Button>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import type { ICharacter } from '@/lib/models/Character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Share2, Heart, Shield, Zap } from 'lucide-react';

interface CharacterDetailViewProps {
  character: ICharacter;
  onEdit: (_character: ICharacter) => void;
  onShare: (_character: ICharacter) => void;
}

export default function CharacterDetailView({ character, onEdit, onShare }: CharacterDetailViewProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const getAbilityModifier = (score: number): string => {
    const modifier = Math.floor((score - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  const getAbilityScoreDisplay = (score: number): string => {
    return `${score} (${getAbilityModifier(score)})`;
  };


  const getSavingThrowBonus = (ability: string, score: number): number => {
    const modifier = Math.floor((score - 10) / 2);
    // Handle both Map and object for savingThrows
    const isProficient = character.savingThrows instanceof Map
      ? character.savingThrows.get(ability)
      : character.savingThrows?.[ability as keyof typeof character.savingThrows] || false;
    return isProficient ? modifier + character.proficiencyBonus : modifier;
  };

  const getSkillBonus = (skillName: string, abilityScore: number): number => {
    const modifier = Math.floor((abilityScore - 10) / 2);
    // Handle both Map and object for skills
    const isProficient = character.skills instanceof Map
      ? character.skills.get(skillName)
      : character.skills?.[skillName] || false;
    return isProficient ? modifier + character.proficiencyBonus : modifier;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Character Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{character.name}</h1>
          <p className="text-lg text-muted-foreground">
            {character.race} • Level {character.level}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => onEdit(character)} variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Character
          </Button>
          <Button onClick={() => onShare(character)} variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Core Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Heart className="h-4 w-4 mr-2" />
              Hit Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {character.hitPoints.current} / {character.hitPoints.maximum}
            </div>
            {character.hitPoints.temporary > 0 && (
              <div className="text-sm text-muted-foreground">
                +{character.hitPoints.temporary} temp
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Armor Class
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{character.armorClass}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              Speed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{character.speed} ft</div>
          </CardContent>
        </Card>
      </div>

      {/* Classes */}
      <Card>
        <CardHeader>
          <CardTitle>Classes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {character.classes.map((classInfo, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="font-medium">
                  {classInfo.class} ({classInfo.subclass}) - Level {classInfo.level}
                </span>
                <Badge variant="secondary">d{classInfo.hitDie}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Proficiency Bonus */}
      <Card>
        <CardHeader>
          <CardTitle>Proficiency Bonus</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{character.proficiencyBonus}</div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStats = () => (
    <div className="space-y-6">
      {/* Ability Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Ability Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xs font-medium text-muted-foreground">STR</div>
              <div className="text-lg font-bold">{getAbilityScoreDisplay(character.abilityScores.strength)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-medium text-muted-foreground">DEX</div>
              <div className="text-lg font-bold">{getAbilityScoreDisplay(character.abilityScores.dexterity)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-medium text-muted-foreground">CON</div>
              <div className="text-lg font-bold">{getAbilityScoreDisplay(character.abilityScores.constitution)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-medium text-muted-foreground">INT</div>
              <div className="text-lg font-bold">{getAbilityScoreDisplay(character.abilityScores.intelligence)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-medium text-muted-foreground">WIS</div>
              <div className="text-lg font-bold">{getAbilityScoreDisplay(character.abilityScores.wisdom)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-medium text-muted-foreground">CHA</div>
              <div className="text-lg font-bold">{getAbilityScoreDisplay(character.abilityScores.charisma)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Saving Throws */}
      <Card>
        <CardHeader>
          <CardTitle>Saving Throws</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div className="flex justify-between">
              <span>STR</span>
              <span className="font-medium">
                {getSavingThrowBonus('strength', character.abilityScores.strength) >= 0 ? '+' : ''}
                {getSavingThrowBonus('strength', character.abilityScores.strength)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>DEX</span>
              <span className="font-medium">
                {getSavingThrowBonus('dexterity', character.abilityScores.dexterity) >= 0 ? '+' : ''}
                {getSavingThrowBonus('dexterity', character.abilityScores.dexterity)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>CON</span>
              <span className="font-medium">
                {getSavingThrowBonus('constitution', character.abilityScores.constitution) >= 0 ? '+' : ''}
                {getSavingThrowBonus('constitution', character.abilityScores.constitution)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>INT</span>
              <span className="font-medium">
                {getSavingThrowBonus('intelligence', character.abilityScores.intelligence) >= 0 ? '+' : ''}
                {getSavingThrowBonus('intelligence', character.abilityScores.intelligence)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>WIS</span>
              <span className="font-medium">
                {getSavingThrowBonus('wisdom', character.abilityScores.wisdom) >= 0 ? '+' : ''}
                {getSavingThrowBonus('wisdom', character.abilityScores.wisdom)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>CHA</span>
              <span className="font-medium">
                {getSavingThrowBonus('charisma', character.abilityScores.charisma) >= 0 ? '+' : ''}
                {getSavingThrowBonus('charisma', character.abilityScores.charisma)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      {character.skills && (
        (character.skills instanceof Map ? character.skills.size > 0 : Object.keys(character.skills).length > 0)
      ) && (
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {(character.skills instanceof Map
                ? Array.from(character.skills.entries())
                : Object.entries(character.skills)
              ).map(([skillName, isProficient]) => {
                const abilityScore = getSkillAbilityScore(skillName);
                const bonus = getSkillBonus(skillName, abilityScore);
                return (
                  <div key={skillName} className="flex justify-between">
                    <span className={isProficient ? 'font-medium' : ''}>{skillName}</span>
                    <span className="font-medium">
                      {bonus >= 0 ? '+' : ''}{bonus}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const getSkillAbilityScore = (skillName: string): number => {
    const skillToAbility: Record<string, keyof typeof character.abilityScores> = {
      'Athletics': 'strength',
      'Acrobatics': 'dexterity',
      'Sleight of Hand': 'dexterity',
      'Stealth': 'dexterity',
      'Arcana': 'intelligence',
      'History': 'intelligence',
      'Investigation': 'intelligence',
      'Nature': 'intelligence',
      'Religion': 'intelligence',
      'Animal Handling': 'wisdom',
      'Insight': 'wisdom',
      'Medicine': 'wisdom',
      'Perception': 'wisdom',
      'Survival': 'wisdom',
      'Deception': 'charisma',
      'Intimidation': 'charisma',
      'Performance': 'charisma',
      'Persuasion': 'charisma',
    };

    const ability = skillToAbility[skillName] || 'strength';
    return character.abilityScores[ability];
  };

  const renderEquipment = () => (
    <div className="space-y-4">
      {character.equipment && character.equipment.length > 0 ? (
        <div className="grid gap-4">
          {character.equipment.map((item, index) => (
            <Card key={index}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{item.name}</h3>
                      <Badge variant={item.equipped ? 'default' : 'secondary'}>
                        {item.equipped ? 'Equipped' : 'Not Equipped'}
                      </Badge>
                      {item.magical && <Badge variant="outline">Magical</Badge>}
                    </div>
                    {item.description && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {item.description}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{item.value}</div>
                    <div className="text-sm text-muted-foreground">{item.weight} lbs</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No equipment listed.</p>
      )}
    </div>
  );

  const renderSpells = () => {
    if (!character.spells || character.spells.length === 0) {
      return <p className="text-muted-foreground">No spells known.</p>;
    }

    const spellsByLevel = character.spells.reduce((acc, spell) => {
      const level = spell.level;
      if (!acc[level]) {
        acc[level] = [];
      }
      acc[level].push(spell);
      return acc;
    }, {} as Record<number, typeof character.spells>);

    return (
      <div className="space-y-6">
        {Object.entries(spellsByLevel)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([level, spells]) => (
            <Card key={level}>
              <CardHeader>
                <CardTitle>
                  {level === '0' ? 'Cantrips' : `${level}${getOrdinalSuffix(parseInt(level))} Level`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {spells.map((spell, index) => (
                    <div key={index} className="flex items-start justify-between p-3 bg-muted rounded">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{spell.name}</h4>
                          <Badge variant={spell.isPrepared ? 'default' : 'secondary'}>
                            {spell.isPrepared ? 'Prepared' : 'Known'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {spell.school} • {spell.components} • {spell.duration}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    );
  };

  const getOrdinalSuffix = (num: number): string => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) {
      return 'st';
    }
    if (j === 2 && k !== 12) {
      return 'nd';
    }
    if (j === 3 && k !== 13) {
      return 'rd';
    }
    return 'th';
  };

  const renderNotes = () => (
    <div className="space-y-6">
      {character.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap">{character.notes}</div>
          </CardContent>
        </Card>
      )}

      {character.backstory && (
        <Card>
          <CardHeader>
            <CardTitle>Backstory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap">{character.backstory}</div>
          </CardContent>
        </Card>
      )}

      {!character.notes && !character.backstory && (
        <p className="text-muted-foreground">No notes or backstory recorded.</p>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="spells">Spells</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          {renderStats()}
        </TabsContent>

        <TabsContent value="equipment" className="mt-6">
          {renderEquipment()}
        </TabsContent>

        <TabsContent value="spells" className="mt-6">
          {renderSpells()}
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          {renderNotes()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
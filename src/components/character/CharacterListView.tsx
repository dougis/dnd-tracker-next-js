'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CharacterService, type PaginatedCharacters } from '@/lib/services/CharacterService';
import type { ICharacter } from '@/lib/models/Character';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface CharacterListViewProps {
  userId: string;
  onCharacterSelect?: (character: ICharacter) => void;
  onCharacterEdit?: (character: ICharacter) => void;
  onCharacterDelete?: (character: ICharacter) => void;
  onCharacterDuplicate?: (character: ICharacter) => void;
}

type ViewMode = 'grid' | 'table';
type SortOption = 'name-asc' | 'name-desc' | 'level-asc' | 'level-desc' | 'date-asc' | 'date-desc';

export function CharacterListView({
  userId,
  onCharacterSelect,
  onCharacterEdit,
  onCharacterDelete,
  onCharacterDuplicate,
}: CharacterListViewProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [charactersData, setCharactersData] = useState<PaginatedCharacters | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [raceFilter, setRaceFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [selectedCharacters, setSelectedCharacters] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  // Load characters
  useEffect(() => {
    loadCharacters();
  }, [userId, currentPage]);

  const loadCharacters = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await CharacterService.getCharactersByOwner(userId, currentPage, 12);
      
      if (result.success) {
        setCharactersData(result.data);
      } else {
        setError(result.error?.message || 'Failed to load characters');
      }
    } catch (err) {
      setError('Failed to load characters');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort characters
  const processedCharacters = useMemo(() => {
    if (!charactersData?.characters) return [];

    let filtered = charactersData.characters;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(char =>
        char.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply class filter
    if (classFilter) {
      filtered = filtered.filter(char =>
        char.classes.some(cls => cls.name === classFilter)
      );
    }

    // Apply race filter
    if (raceFilter) {
      filtered = filtered.filter(char => char.race === raceFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'level-asc':
          return a.level - b.level;
        case 'level-desc':
          return b.level - a.level;
        case 'date-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'date-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [charactersData?.characters, searchTerm, classFilter, raceFilter, sortBy]);

  const handleSelectCharacter = (characterId: string, selected: boolean) => {
    const newSelected = new Set(selectedCharacters);
    if (selected) {
      newSelected.add(characterId);
    } else {
      newSelected.delete(characterId);
    }
    setSelectedCharacters(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedCharacters(new Set(processedCharacters.map(char => char._id)));
    } else {
      setSelectedCharacters(new Set());
    }
  };

  const formatCharacterClass = (character: ICharacter) => {
    const mainClass = character.classes[0];
    return `${character.race.charAt(0).toUpperCase()}${character.race.slice(1)} ${mainClass.name.charAt(0).toUpperCase()}${mainClass.name.slice(1)}`;
  };

  const formatHitPoints = (character: ICharacter) => {
    const { current, maximum, temporary } = character.hitPoints;
    return temporary > 0 ? `${current + temporary}/${maximum}` : `${current}/${maximum}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-muted-foreground">Loading characters...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-destructive">{error}</div>
      </div>
    );
  }

  if (!charactersData || processedCharacters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-lg text-muted-foreground">No characters found</div>
        <Button onClick={() => router.push('/characters/create')}>
          Create your first character
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        {/* Search and Filters */}
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
          <Input
            placeholder="Search characters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64"
          />
          
          <select
            aria-label="Filter by class"
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
          >
            <option value="">All Classes</option>
            <option value="artificer">Artificer</option>
            <option value="barbarian">Barbarian</option>
            <option value="bard">Bard</option>
            <option value="cleric">Cleric</option>
            <option value="druid">Druid</option>
            <option value="fighter">Fighter</option>
            <option value="monk">Monk</option>
            <option value="paladin">Paladin</option>
            <option value="ranger">Ranger</option>
            <option value="rogue">Rogue</option>
            <option value="sorcerer">Sorcerer</option>
            <option value="warlock">Warlock</option>
            <option value="wizard">Wizard</option>
          </select>

          <select
            aria-label="Filter by race"
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
            value={raceFilter}
            onChange={(e) => setRaceFilter(e.target.value)}
          >
            <option value="">All Races</option>
            <option value="dragonborn">Dragonborn</option>
            <option value="dwarf">Dwarf</option>
            <option value="elf">Elf</option>
            <option value="gnome">Gnome</option>
            <option value="half-elf">Half-Elf</option>
            <option value="halfling">Halfling</option>
            <option value="half-orc">Half-Orc</option>
            <option value="human">Human</option>
            <option value="tiefling">Tiefling</option>
          </select>
        </div>

        {/* View Controls and Sort */}
        <div className="flex items-center space-x-4">
          <select
            aria-label="Sort by"
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="level-asc">Level Low-High</option>
            <option value="level-desc">Level High-Low</option>
            <option value="date-asc">Oldest First</option>
            <option value="date-desc">Newest First</option>
          </select>

          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              aria-label="Table view"
            >
              Table
            </Button>
          </div>
        </div>
      </div>

      {/* Selection and Batch Actions */}
      {selectedCharacters.size > 0 && (
        <div className="flex items-center justify-between p-4 bg-muted rounded-md">
          <span className="text-sm font-medium">
            {selectedCharacters.size} selected
          </span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Handle duplicate selected
                console.log('Duplicate selected characters');
              }}
            >
              Duplicate Selected
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                // Handle delete selected
                console.log('Delete selected characters');
              }}
            >
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Character List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {processedCharacters.map((character) => (
            <Card
              key={character._id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              data-testid={`character-card-${character._id}`}
              onClick={() => onCharacterSelect?.(character)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg" data-testid="character-name">
                      {character.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground" data-testid="character-level">
                      Level {character.level}
                    </p>
                  </div>
                  <Checkbox
                    checked={selectedCharacters.has(character._id)}
                    onCheckedChange={(checked) => 
                      handleSelectCharacter(character._id, checked as boolean)
                    }
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <p className="text-sm">{formatCharacterClass(character)}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">AC {character.armorClass}</span>
                    <span className="text-sm text-muted-foreground">
                      HP {formatHitPoints(character)}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {character.type.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center justify-end space-x-1 mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCharacterEdit?.(character);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCharacterDuplicate?.(character);
                    }}
                  >
                    Duplicate
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCharacterDelete?.(character);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="border rounded-md">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-4 text-left">
                  <Checkbox
                    checked={selectedCharacters.size === processedCharacters.length}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </th>
                <th className="p-4 text-left font-medium">Name</th>
                <th className="p-4 text-left font-medium">Level</th>
                <th className="p-4 text-left font-medium">Class</th>
                <th className="p-4 text-left font-medium">Race</th>
                <th className="p-4 text-left font-medium">AC</th>
                <th className="p-4 text-left font-medium">HP</th>
                <th className="p-4 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {processedCharacters.map((character) => (
                <tr
                  key={character._id}
                  className="border-b hover:bg-muted/50 cursor-pointer"
                  data-testid={`character-row-${character._id}`}
                  onClick={() => onCharacterSelect?.(character)}
                >
                  <td className="p-4">
                    <Checkbox
                      checked={selectedCharacters.has(character._id)}
                      onCheckedChange={(checked) => 
                        handleSelectCharacter(character._id, checked as boolean)
                      }
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td className="p-4 font-medium" data-testid="character-name">
                    {character.name}
                  </td>
                  <td className="p-4" data-testid="character-level">
                    Level {character.level}
                  </td>
                  <td className="p-4">{character.classes[0].name}</td>
                  <td className="p-4">{character.race}</td>
                  <td className="p-4">{character.armorClass}</td>
                  <td className="p-4">{formatHitPoints(character)}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCharacterEdit?.(character);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCharacterDuplicate?.(character);
                        }}
                      >
                        Duplicate
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCharacterDelete?.(character);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {charactersData && charactersData.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {charactersData.page} of {charactersData.totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!charactersData.hasPreviousPage}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous page
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!charactersData.hasNextPage}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next page
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
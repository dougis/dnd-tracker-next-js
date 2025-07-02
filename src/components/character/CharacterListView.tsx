'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import type { ICharacter } from '@/lib/models/Character';
import { CharacterFilters } from './CharacterFilters';
import { ViewModeToggle } from './ViewModeToggle';
import { BatchActions } from './BatchActions';
import { CharacterGrid } from './CharacterGrid';
import { CharacterTable } from './CharacterTable';
import { Pagination } from './Pagination';
import { useCharacterData } from './hooks/useCharacterData';
import { useCharacterFilters } from './hooks/useCharacterFilters';
import { useCharacterSelection } from './hooks/useCharacterSelection';
import type { ViewMode } from './constants';

export interface CharacterListViewProps {
  userId: string;
  onCharacterSelect?: (_character: ICharacter) => void;
  onCharacterEdit?: (_character: ICharacter) => void;
  onCharacterDelete?: (_character: ICharacter) => void;
  onCharacterDuplicate?: (_character: ICharacter) => void;
}

export function CharacterListView({
  userId,
  onCharacterSelect,
  onCharacterEdit,
  onCharacterDelete,
  onCharacterDuplicate,
}: CharacterListViewProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Data management
  const {
    loading,
    error,
    charactersData,
    currentPage,
    setCurrentPage,
  } = useCharacterData(userId);

  // Filtering and sorting
  const {
    searchTerm,
    classFilter,
    raceFilter,
    sortBy,
    setSearchTerm,
    setClassFilter,
    setRaceFilter,
    setSortBy,
    processedCharacters,
  } = useCharacterFilters(charactersData?.items || []);

  // Selection management
  const {
    selectedCharacters,
    handleSelectCharacter,
    handleSelectAll,
    clearSelection,
  } = useCharacterSelection();

  const handleBatchDuplicate = () => {
    console.log('Duplicate selected characters');
    // TODO: Implement batch duplicate functionality
  };

  const handleBatchDelete = () => {
    console.log('Delete selected characters');
    // TODO: Implement batch delete functionality
  };

  const handleSelectAllWrapper = (selected: boolean) => {
    handleSelectAll(processedCharacters, selected);
  };

  const handlePreviousPage = () => {
    setCurrentPage(currentPage - 1);
    clearSelection();
  };

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
    clearSelection();
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
        <Button onClick={() => router.push('/')}>
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
        <CharacterFilters
          searchTerm={searchTerm}
          classFilter={classFilter}
          raceFilter={raceFilter}
          sortBy={sortBy}
          onSearchChange={setSearchTerm}
          onClassFilterChange={setClassFilter}
          onRaceFilterChange={setRaceFilter}
          onSortChange={setSortBy}
        />

        {/* View Controls */}
        <div className="flex items-center space-x-4">
          <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>
      </div>

      {/* Batch Actions */}
      <BatchActions
        selectedCount={selectedCharacters.size}
        onDuplicateSelected={handleBatchDuplicate}
        onDeleteSelected={handleBatchDelete}
      />

      {/* Character List */}
      {viewMode === 'grid' ? (
        <CharacterGrid
          characters={processedCharacters}
          selectedCharacters={selectedCharacters}
          onCharacterSelect={onCharacterSelect}
          onCharacterEdit={onCharacterEdit}
          onCharacterDelete={onCharacterDelete}
          onCharacterDuplicate={onCharacterDuplicate}
          onSelectCharacter={handleSelectCharacter}
        />
      ) : (
        <CharacterTable
          characters={processedCharacters}
          selectedCharacters={selectedCharacters}
          onCharacterSelect={onCharacterSelect}
          onCharacterEdit={onCharacterEdit}
          onCharacterDelete={onCharacterDelete}
          onCharacterDuplicate={onCharacterDuplicate}
          onSelectCharacter={handleSelectCharacter}
          onSelectAll={handleSelectAllWrapper}
        />
      )}

      {/* Pagination */}
      {charactersData && (
        <Pagination
          currentPage={charactersData.pagination.page}
          totalPages={charactersData.pagination.totalPages}
          onPreviousPage={handlePreviousPage}
          onNextPage={handleNextPage}
        />
      )}
    </div>
  );
}
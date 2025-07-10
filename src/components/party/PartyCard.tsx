'use client';

import { useState } from 'react';
import { Users, Eye, Settings, MoreHorizontal, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import type { PartyCardProps, PartyListItem } from './types';

// Action handlers for party operations
interface PartyActions {
  handleViewParty: () => void;
  handleEditParty: () => void;
  handleDeleteParty: () => void;
}

function usePartyActions(party: PartyListItem): PartyActions {
  return {
    handleViewParty: () => console.log('View party:', party.id),
    handleEditParty: () => console.log('Edit party:', party.id),
    handleDeleteParty: () => console.log('Delete party:', party.id),
  };
}

// Party header with selection and actions
function PartyCardHeader({ party, isSelected, onSelect, actions }: {
  party: PartyListItem;
  isSelected: boolean;
  onSelect?: (_id: string) => void;
  actions: PartyActions;
}) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-lg truncate">{party.name}</h3>
        {party.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {party.description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 ml-2">
        {onSelect && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect(party.id)}
            aria-label={`Select ${party.name}`}
          />
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={actions.handleViewParty}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={actions.handleEditParty}>
              <Settings className="mr-2 h-4 w-4" />
              Edit Party
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={actions.handleDeleteParty}
              className="text-destructive"
            >
              Delete Party
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// Party tags display
function PartyTags({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {tags.slice(0, 3).map((tag) => (
        <Badge key={tag} variant="secondary" className="text-xs">
          {tag}
        </Badge>
      ))}
      {tags.length > 3 && (
        <Badge variant="outline" className="text-xs">
          +{tags.length - 3}
        </Badge>
      )}
    </div>
  );
}

// Helper component for stat display
function StatRow({
  leftContent,
  rightContent
}: {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>{leftContent}</div>
      <div className="text-right">{rightContent}</div>
    </div>
  );
}

// Party statistics
function PartyStats({ party }: { party: PartyListItem }) {
  return (
    <>
      <StatRow
        leftContent={
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{party.memberCount}</span>
            <span className="text-muted-foreground">members</span>
          </div>
        }
        rightContent={
          <>
            <div className="font-medium">Level {party.averageLevel || '-'}</div>
            <div className="text-xs text-muted-foreground">average</div>
          </>
        }
      />

      <StatRow
        leftContent={
          <>
            <div className="text-muted-foreground">Player Characters</div>
            <div className="font-medium">{party.playerCharacterCount}</div>
          </>
        }
        rightContent={
          <>
            <div className="text-muted-foreground">Max Members</div>
            <div className="font-medium">{party.settings.maxMembers}</div>
          </>
        }
      />
    </>
  );
}

// Party footer with status and actions
function PartyFooter({ party, isHovered, onViewClick }: {
  party: PartyListItem;
  isHovered: boolean;
  onViewClick: () => void;
}) {
  return (
    <div className="flex items-center justify-between pt-2">
      <div className="flex items-center gap-2">
        {party.isPublic && (
          <Badge variant="outline" className="text-xs">
            Public
          </Badge>
        )}
        {party.settings.allowJoining && (
          <Badge variant="outline" className="text-xs">
            Open
          </Badge>
        )}
      </div>

      <Button
        size="sm"
        onClick={onViewClick}
        className={`transition-opacity ${isHovered ? 'opacity-100' : 'opacity-75'}`}
      >
        <ExternalLink className="mr-2 h-4 w-4" />
        View
      </Button>
    </div>
  );
}

export function PartyCard({ party, isSelected = false, onSelect }: PartyCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const actions = usePartyActions(party);

  return (
    <Card
      className={`transition-all duration-200 hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="space-y-2">
        <PartyCardHeader
          party={party}
          isSelected={isSelected}
          onSelect={onSelect}
          actions={actions}
        />
        <PartyTags tags={party.tags} />
      </CardHeader>

      <CardContent className="space-y-4">
        <PartyStats party={party} />

        <div className="text-xs text-muted-foreground">
          Active {formatDistanceToNow(party.lastActivity, { addSuffix: true })}
        </div>

        <PartyFooter
          party={party}
          isHovered={isHovered}
          onViewClick={actions.handleViewParty}
        />
      </CardContent>
    </Card>
  );
}
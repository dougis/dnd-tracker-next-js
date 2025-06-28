import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Shield, Sword, Heart } from 'lucide-react';

export function ActionDropdownMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <Sword className="h-4 w-4 mr-2" />
          Attack
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Shield className="h-4 w-4 mr-2" />
          Defend
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Heart className="h-4 w-4 mr-2" />
          Heal
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive">
          Remove from Combat
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
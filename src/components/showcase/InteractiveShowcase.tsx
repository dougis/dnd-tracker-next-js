import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { MoreVertical, Shield, Sword, Heart } from 'lucide-react';

export default function InteractiveShowcase() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Interactive Components</CardTitle>
        <CardDescription>
          Dialogs, dropdowns, and other interactive elements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          {/* Dialog Example */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Shield className="h-4 w-4 mr-2" />
                Character Details
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Character Sheet</DialogTitle>
                <DialogDescription>
                  View detailed character information and stats.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Level</Label>
                    <p className="text-2xl font-bold">5</p>
                  </div>
                  <div>
                    <Label>Experience</Label>
                    <p className="text-2xl font-bold">6,500</p>
                  </div>
                </div>
                <div>
                  <Label>Abilities</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <Badge variant="outline">STR 16</Badge>
                    <Badge variant="outline">DEX 14</Badge>
                    <Badge variant="outline">CON 15</Badge>
                    <Badge variant="outline">INT 12</Badge>
                    <Badge variant="outline">WIS 13</Badge>
                    <Badge variant="outline">CHA 10</Badge>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Dropdown Menu Example */}
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
        </div>
      </CardContent>
    </Card>
  );
}

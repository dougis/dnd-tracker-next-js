'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Play,
  MoreVertical,
  Sword,
  Shield,
  Heart,
  Zap,
  Users,
  Settings,
} from 'lucide-react';

export default function ComponentShowcase() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-fantasy font-bold text-foreground">
            D&D Tracker Component Library
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Showcasing shadcn/ui components integrated with our D&D-themed
            design system
          </p>
        </div>

        {/* Buttons Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Buttons
            </CardTitle>
            <CardDescription>
              Various button styles and states for different actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button size="sm">Small</Button>
              <Button size="lg">Large</Button>
              <Button disabled>Disabled</Button>
            </div>

            {/* D&D Themed Buttons */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3">D&D Combat Actions</h4>
              <div className="flex flex-wrap gap-4">
                <Button className="bg-combat-active hover:bg-combat-active/90 text-combat-active-foreground">
                  <Play className="h-4 w-4 mr-2" />
                  Start Combat
                </Button>
                <Button className="bg-combat-turn hover:bg-combat-turn/90 text-combat-turn-foreground">
                  Next Turn
                </Button>
                <Button
                  variant="outline"
                  className="border-hp-critical text-hp-critical hover:bg-hp-critical/10"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Heal
                </Button>
                <Button variant="destructive">
                  <Sword className="h-4 w-4 mr-2" />
                  Attack
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Elements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Form Elements
            </CardTitle>
            <CardDescription>
              Input fields and form controls for character creation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="character-name">Character Name</Label>
                <Input
                  id="character-name"
                  placeholder="Enter character name"
                  className="font-serif"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="character-class">Character Class</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fighter">Fighter</SelectItem>
                    <SelectItem value="wizard">Wizard</SelectItem>
                    <SelectItem value="rogue">Rogue</SelectItem>
                    <SelectItem value="cleric">Cleric</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hp">Hit Points</Label>
                <Input
                  id="hp"
                  type="number"
                  placeholder="100"
                  className="text-center font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ac">Armor Class</Label>
                <Input
                  id="ac"
                  type="number"
                  placeholder="15"
                  className="text-center font-mono"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Character Cards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Character Examples
            </CardTitle>
            <CardDescription>
              Character cards with different types and HP states
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* PC Card */}
              <Card className="character-pc">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src="/placeholder-avatar.jpg" />
                        <AvatarFallback className="bg-character-pc text-character-pc-foreground">
                          PC
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">Aragorn</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Fighter/Ranger
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-character-pc text-character-pc-foreground">
                      PC
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-hp-healthy">85</p>
                      <p className="text-sm text-muted-foreground">HP</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">18</p>
                      <p className="text-sm text-muted-foreground">AC</p>
                    </div>
                  </div>
                  <div className="hp-bar bg-muted">
                    <div className="hp-bar-fill bg-hp-healthy h-full w-4/5 transition-all" />
                  </div>
                </CardContent>
              </Card>

              {/* NPC Card */}
              <Card className="character-npc">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-character-npc text-character-npc-foreground">
                          NPC
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">Gandalf</CardTitle>
                        <p className="text-sm text-muted-foreground">Wizard</p>
                      </div>
                    </div>
                    <Badge className="bg-character-npc text-character-npc-foreground">
                      NPC
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-hp-full">120</p>
                      <p className="text-sm text-muted-foreground">HP</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">15</p>
                      <p className="text-sm text-muted-foreground">AC</p>
                    </div>
                  </div>
                  <div className="hp-bar bg-muted">
                    <div className="hp-bar-fill bg-hp-full h-full w-full transition-all" />
                  </div>
                </CardContent>
              </Card>

              {/* Monster Card */}
              <Card className="character-monster">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-character-monster text-character-monster-foreground">
                          👹
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">Orc Warrior</CardTitle>
                        <p className="text-sm text-muted-foreground">CR 1/2</p>
                      </div>
                    </div>
                    <Badge className="bg-character-monster text-character-monster-foreground">
                      Monster
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-hp-critical">3</p>
                      <p className="text-sm text-muted-foreground">HP</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">13</p>
                      <p className="text-sm text-muted-foreground">AC</p>
                    </div>
                  </div>
                  <div className="hp-bar bg-muted">
                    <div className="hp-bar-fill bg-hp-critical h-full w-1/5 animate-pulse-hp transition-all" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Components */}
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

        {/* Theme Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Color Theme Showcase</CardTitle>
            <CardDescription>
              D&D-themed color palette demonstration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Combat States</h4>
                <div className="space-y-1">
                  <div className="h-8 bg-combat-active rounded flex items-center justify-center text-combat-active-foreground text-sm">
                    Active
                  </div>
                  <div className="h-8 bg-combat-turn rounded flex items-center justify-center text-combat-turn-foreground text-sm">
                    Current Turn
                  </div>
                  <div className="h-8 bg-combat-inactive rounded flex items-center justify-center text-combat-inactive-foreground text-sm">
                    Inactive
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">HP States</h4>
                <div className="space-y-1">
                  <div className="h-8 bg-hp-full rounded flex items-center justify-center text-white text-sm">
                    Full
                  </div>
                  <div className="h-8 bg-hp-healthy rounded flex items-center justify-center text-white text-sm">
                    Healthy
                  </div>
                  <div className="h-8 bg-hp-wounded rounded flex items-center justify-center text-black text-sm">
                    Wounded
                  </div>
                  <div className="h-8 bg-hp-critical rounded flex items-center justify-center text-white text-sm">
                    Critical
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Character Types</h4>
                <div className="space-y-1">
                  <div className="h-8 bg-character-pc rounded flex items-center justify-center text-character-pc-foreground text-sm">
                    PC
                  </div>
                  <div className="h-8 bg-character-npc rounded flex items-center justify-center text-character-npc-foreground text-sm">
                    NPC
                  </div>
                  <div className="h-8 bg-character-monster rounded flex items-center justify-center text-character-monster-foreground text-sm">
                    Monster
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">UI Elements</h4>
                <div className="space-y-1">
                  <div className="h-8 bg-primary rounded flex items-center justify-center text-primary-foreground text-sm">
                    Primary
                  </div>
                  <div className="h-8 bg-secondary rounded flex items-center justify-center text-secondary-foreground text-sm">
                    Secondary
                  </div>
                  <div className="h-8 bg-muted rounded flex items-center justify-center text-muted-foreground text-sm">
                    Muted
                  </div>
                  <div className="h-8 bg-destructive rounded flex items-center justify-center text-destructive-foreground text-sm">
                    Destructive
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Components successfully integrated with D&D Tracker design system
          </p>
        </div>
      </div>
    </div>
  );
}

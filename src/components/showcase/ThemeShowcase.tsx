import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function ThemeShowcase() {
  return (
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
  );
}

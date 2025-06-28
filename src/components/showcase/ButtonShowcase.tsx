import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Play, Heart, Sword, Zap } from 'lucide-react';

export default function ButtonShowcase() {
  return (
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
  );
}

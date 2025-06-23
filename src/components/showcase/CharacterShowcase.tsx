import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users } from 'lucide-react';

export default function CharacterShowcase() {
  return (
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
  );
}

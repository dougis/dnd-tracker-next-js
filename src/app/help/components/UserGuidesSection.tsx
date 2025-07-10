import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, Sword, Settings, Dice6, Heart } from 'lucide-react';

export default function UserGuidesSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">User Guides & Tutorials</h2>
        <p className="text-lg text-muted-foreground mb-6">
          Detailed step-by-step tutorials for mastering every aspect of the D&D Encounter Tracker.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Character Management
            </CardTitle>
            <CardDescription>
              Learn how to create, edit, and organize your characters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm">How to Create a Character</h4>
                <p className="text-xs text-muted-foreground">
                  Step-by-step guide to building complete character sheets with stats, abilities, and equipment.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm">Managing Multiclass Characters</h4>
                <p className="text-xs text-muted-foreground">
                  Handle complex multiclass builds with proper level distribution and ability tracking.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm">Character Import/Export</h4>
                <p className="text-xs text-muted-foreground">
                  Import characters from D&D Beyond or export your characters for backup.
                </p>
              </div>
              <Badge variant="outline" className="text-xs">Beginner Friendly</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Encounter Building
            </CardTitle>
            <CardDescription>
              Design balanced and engaging combat encounters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm">Encounter Difficulty Calculation</h4>
                <p className="text-xs text-muted-foreground">
                  Use CR calculations and party level balancing to create appropriate challenges.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm">Adding Environmental Factors</h4>
                <p className="text-xs text-muted-foreground">
                  Include terrain, weather, and special conditions that affect combat.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm">Lair Actions & Legendary Actions</h4>
                <p className="text-xs text-muted-foreground">
                  Configure complex creature abilities and environmental effects.
                </p>
              </div>
              <Badge variant="outline" className="text-xs">Intermediate</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sword className="h-5 w-5" />
              Combat Tracking
            </CardTitle>
            <CardDescription>
              Master initiative, HP tracking, and turn management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm">How to Manage Initiative</h4>
                <p className="text-xs text-muted-foreground">
                  Roll initiative, handle tiebreakers, and manage turn order during combat.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm">How to Track HP and Damage</h4>
                <p className="text-xs text-muted-foreground">
                  Apply damage, healing, and temporary HP with automated calculations.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm">Managing Conditions and Effects</h4>
                <p className="text-xs text-muted-foreground">
                  Track status effects, spell durations, and ongoing conditions.
                </p>
              </div>
              <Badge variant="outline" className="text-xs">Essential</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Advanced Features
            </CardTitle>
            <CardDescription>
              Customize and optimize your experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm">Custom Rules and Homebrew</h4>
                <p className="text-xs text-muted-foreground">
                  Configure custom rules, homebrew creatures, and variant rule systems.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm">Automation Settings</h4>
                <p className="text-xs text-muted-foreground">
                  Set up automated dice rolling, damage calculation, and turn progression.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm">Campaign Management</h4>
                <p className="text-xs text-muted-foreground">
                  Organize multiple campaigns, track long-term character progression.
                </p>
              </div>
              <Badge variant="outline" className="text-xs">Advanced</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dice6 className="h-5 w-5" />
            Pro Tips & Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                Combat Flow Optimization
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                <li>• Pre-roll initiative for NPCs to speed up combat start</li>
                <li>• Use quick damage buttons for common attack values</li>
                <li>• Set up macros for frequently used spells and abilities</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Organization Tips</h4>
              <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                <li>• Use naming conventions for easy character sorting</li>
                <li>• Tag encounters by location or story arc</li>
                <li>• Create template encounters for common situations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
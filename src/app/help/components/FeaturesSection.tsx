import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, Sword, Settings, Zap, Shield, Crown, Gem } from 'lucide-react';

export default function FeaturesSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Feature Documentation</h2>
        <p className="text-lg text-muted-foreground mb-6">
          Comprehensive guide to all D&D Encounter Tracker features and capabilities.
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
              Complete character creation and management system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-1">
                <h4 className="font-semibold text-sm">Character Creation</h4>
                <p className="text-xs text-muted-foreground">
                  Build detailed character sheets with all D&D 5e races, classes, and backgrounds.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-sm">Multiclass Support</h4>
                <p className="text-xs text-muted-foreground">
                  Handle complex multiclass builds with automatic level calculations.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-sm">Equipment Tracking</h4>
                <p className="text-xs text-muted-foreground">
                  Manage inventory, weapons, armor, and magical items.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-sm">Spell Management</h4>
                <p className="text-xs text-muted-foreground">
                  Track spell slots, known spells, and prepared spells by class.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Encounter Builder
            </CardTitle>
            <CardDescription>
              Design balanced and engaging combat encounters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-1">
                <h4 className="font-semibold text-sm">CR Calculation</h4>
                <p className="text-xs text-muted-foreground">
                  Automatic encounter difficulty calculation based on party composition.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-sm">Creature Library</h4>
                <p className="text-xs text-muted-foreground">
                  Access to comprehensive creature database with custom creature support.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-sm">Environmental Factors</h4>
                <p className="text-xs text-muted-foreground">
                  Add terrain, weather, and special conditions to encounters.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-sm">Encounter Templates</h4>
                <p className="text-xs text-muted-foreground">
                  Save and reuse encounter setups for different campaigns.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sword className="h-5 w-5" />
              Initiative Tracker
            </CardTitle>
            <CardDescription>
              Advanced combat turn management system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-1">
                <h4 className="font-semibold text-sm">Automatic Initiative</h4>
                <p className="text-xs text-muted-foreground">
                  Automated initiative rolling with dexterity tiebreaker resolution.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-sm">Turn Management</h4>
                <p className="text-xs text-muted-foreground">
                  Easy turn progression with action tracking and status management.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-sm">Lair Actions</h4>
                <p className="text-xs text-muted-foreground">
                  Support for lair actions, legendary actions, and environmental effects.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-sm">Combat History</h4>
                <p className="text-xs text-muted-foreground">
                  Track combat rounds, actions taken, and damage dealt over time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-red-500" />
              HP & Damage Tracking
            </CardTitle>
            <CardDescription>
              Real-time health and status management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-1">
                <h4 className="font-semibold text-sm">Damage Application</h4>
                <p className="text-xs text-muted-foreground">
                  Quick damage entry with resistance/vulnerability calculations.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-sm">Healing & Temporary HP</h4>
                <p className="text-xs text-muted-foreground">
                  Manage healing spells, potions, and temporary hit points.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-sm">Death Saving Throws</h4>
                <p className="text-xs text-muted-foreground">
                  Track death saving throws with automatic stabilization.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-sm">Condition Tracking</h4>
                <p className="text-xs text-muted-foreground">
                  Monitor status effects, spell durations, and ongoing conditions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Subscription Tiers
          </CardTitle>
          <CardDescription>
            Feature availability across different subscription levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-green-500" />
                <h4 className="font-semibold">Free Adventurer</h4>
                <Badge variant="secondary">$0/month</Badge>
              </div>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• 1 Party (up to 6 characters)</li>
                <li>• 3 Saved Encounters</li>
                <li>• 10 Custom Creatures</li>
                <li>• Basic Combat Tracking</li>
                <li>• Standard Support</li>
              </ul>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sword className="h-4 w-4 text-blue-500" />
                <h4 className="font-semibold">Expert Dungeon Master</h4>
                <Badge variant="secondary">$9.99/month</Badge>
              </div>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• 10 Parties</li>
                <li>• 50 Saved Encounters</li>
                <li>• 200 Custom Creatures</li>
                <li>• Advanced Combat Features</li>
                <li>• Campaign Management</li>
                <li>• Priority Support</li>
              </ul>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Gem className="h-4 w-4 text-purple-500" />
                <h4 className="font-semibold">Guild Master</h4>
                <Badge variant="secondary">$39.99/month</Badge>
              </div>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Unlimited Everything</li>
                <li>• Multi-Campaign Management</li>
                <li>• Team Collaboration</li>
                <li>• Advanced Analytics</li>
                <li>• API Access</li>
                <li>• White-label Options</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Integration & Export
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Import Options</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• D&D Beyond character sheets</li>
                <li>• Roll20 character data</li>
                <li>• JSON character files</li>
                <li>• CSV encounter data</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Export Formats</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• PDF character sheets</li>
                <li>• JSON data exports</li>
                <li>• Combat log reports</li>
                <li>• Campaign summaries</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
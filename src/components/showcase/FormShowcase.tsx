import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';

export default function FormShowcase() {
  return (
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
  );
}

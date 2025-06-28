import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function CharacterNameField() {
  return (
    <div className="space-y-2">
      <Label htmlFor="character-name">Character Name</Label>
      <Input
        id="character-name"
        placeholder="Enter character name"
        className="font-serif"
      />
    </div>
  );
}
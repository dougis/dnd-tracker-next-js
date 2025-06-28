import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export function CharacterClassField() {

    return (
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
    );

}

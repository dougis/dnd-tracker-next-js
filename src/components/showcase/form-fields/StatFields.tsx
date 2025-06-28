import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function HitPointsField() {

    return (
        <div className="space-y-2">
            <Label htmlFor="hp">Hit Points</Label>
            <Input
                id="hp"
                type="number"
                placeholder="100"
                className="text-center font-mono"
            />
        </div>
    );

}

export function ArmorClassField() {

    return (
        <div className="space-y-2">
            <Label htmlFor="ac">Armor Class</Label>
            <Input
                id="ac"
                type="number"
                placeholder="15"
                className="text-center font-mono"
            />
        </div>
    );

}

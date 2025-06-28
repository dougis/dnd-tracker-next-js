import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';

export function CharacterDialog() {

    return (
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
    );

}

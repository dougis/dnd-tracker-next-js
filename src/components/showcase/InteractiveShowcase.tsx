import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { CharacterDialog } from './interactive/CharacterDialog';
import { ActionDropdownMenu } from './interactive/ActionDropdownMenu';

export default function InteractiveShowcase() {

    return (
        <Card>
            <CardHeader>
                <CardTitle>Interactive Components</CardTitle>
                <CardDescription>
          Dialogs, dropdowns, and other interactive elements
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-4">
                    <CharacterDialog />
                    <ActionDropdownMenu />
                </div>
            </CardContent>
        </Card>
    );

}

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Settings } from 'lucide-react';
import { CharacterNameField } from './form-fields/CharacterNameField';
import { CharacterClassField } from './form-fields/CharacterClassField';
import { HitPointsField, ArmorClassField } from './form-fields/StatFields';

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
                    <CharacterNameField />
                    <CharacterClassField />
                    <HitPointsField />
                    <ArmorClassField />
                </div>
            </CardContent>
        </Card>
    );

}

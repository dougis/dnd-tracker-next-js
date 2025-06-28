import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Users } from 'lucide-react';
import { CharacterCard } from './CharacterCard';

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
                    <CharacterCard
                        name="Aragorn"
                        characterClass="Fighter/Ranger"
                        hp={85}
                        maxHp={100}
                        ac={18}
                        type="PC"
                        avatarSrc="/placeholder-avatar.jpg"
                        avatarFallback="PC"
                    />

                    <CharacterCard
                        name="Gandalf"
                        characterClass="Wizard"
                        hp={120}
                        ac={15}
                        type="NPC"
                        avatarFallback="NPC"
                    />

                    <CharacterCard
                        name="Orc Warrior"
                        characterClass=""
                        hp={3}
                        maxHp={25}
                        ac={13}
                        type="Monster"
                        avatarFallback="👹"
                        crRating="CR 1/2"
                    />
                </div>
            </CardContent>
        </Card>
    );

}

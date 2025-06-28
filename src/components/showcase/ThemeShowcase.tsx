import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    CombatStatesSection,
    HPStatesSection,
    CharacterTypesSection,
    UIElementsSection,
} from './theme-sections/ColorSection';

export default function ThemeShowcase() {

    return (
        <Card>
            <CardHeader>
                <CardTitle>Color Theme Showcase</CardTitle>
                <CardDescription>
          D&D-themed color palette demonstration
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <CombatStatesSection />
                    <HPStatesSection />
                    <CharacterTypesSection />
                    <UIElementsSection />
                </div>
            </CardContent>
        </Card>
    );

}

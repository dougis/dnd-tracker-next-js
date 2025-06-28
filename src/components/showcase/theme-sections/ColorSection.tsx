interface ColorBlockProps {
  className: string;
  textClassName?: string;
  children: React.ReactNode;
}

function ColorBlock({
    className,
    textClassName = 'text-white',
    children,
}: ColorBlockProps) {

    return (
        <div
            className={`h-8 ${className} rounded flex items-center justify-center ${textClassName} text-sm`}
        >
            {children}
        </div>
    );

}

export function CombatStatesSection() {

    return (
        <div className="space-y-2">
            <h4 className="font-medium">Combat States</h4>
            <div className="space-y-1">
                <ColorBlock
                    className="bg-combat-active"
                    textClassName="text-combat-active-foreground"
                >
          Active
                </ColorBlock>
                <ColorBlock
                    className="bg-combat-turn"
                    textClassName="text-combat-turn-foreground"
                >
          Current Turn
                </ColorBlock>
                <ColorBlock
                    className="bg-combat-inactive"
                    textClassName="text-combat-inactive-foreground"
                >
          Inactive
                </ColorBlock>
            </div>
        </div>
    );

}

export function HPStatesSection() {

    return (
        <div className="space-y-2">
            <h4 className="font-medium">HP States</h4>
            <div className="space-y-1">
                <ColorBlock className="bg-hp-full">Full</ColorBlock>
                <ColorBlock className="bg-hp-healthy">Healthy</ColorBlock>
                <ColorBlock className="bg-hp-wounded" textClassName="text-black">
          Wounded
                </ColorBlock>
                <ColorBlock className="bg-hp-critical">Critical</ColorBlock>
            </div>
        </div>
    );

}

export function CharacterTypesSection() {

    return (
        <div className="space-y-2">
            <h4 className="font-medium">Character Types</h4>
            <div className="space-y-1">
                <ColorBlock
                    className="bg-character-pc"
                    textClassName="text-character-pc-foreground"
                >
          PC
                </ColorBlock>
                <ColorBlock
                    className="bg-character-npc"
                    textClassName="text-character-npc-foreground"
                >
          NPC
                </ColorBlock>
                <ColorBlock
                    className="bg-character-monster"
                    textClassName="text-character-monster-foreground"
                >
          Monster
                </ColorBlock>
            </div>
        </div>
    );

}

export function UIElementsSection() {

    return (
        <div className="space-y-2">
            <h4 className="font-medium">UI Elements</h4>
            <div className="space-y-1">
                <ColorBlock
                    className="bg-primary"
                    textClassName="text-primary-foreground"
                >
          Primary
                </ColorBlock>
                <ColorBlock
                    className="bg-secondary"
                    textClassName="text-secondary-foreground"
                >
          Secondary
                </ColorBlock>
                <ColorBlock className="bg-muted" textClassName="text-muted-foreground">
          Muted
                </ColorBlock>
                <ColorBlock
                    className="bg-destructive"
                    textClassName="text-destructive-foreground"
                >
          Destructive
                </ColorBlock>
            </div>
        </div>
    );

}

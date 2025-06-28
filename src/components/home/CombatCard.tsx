interface CombatCardProps {
  initiative: number;
  name: string;
  type: string;
  hp: string;
  hpBarWidth: string;
  isActive?: boolean;
  className?: string;
}

export function CombatCard({
    initiative,
    name,
    type,
    hp,
    hpBarWidth,
    isActive = false,
    className = '',
}: CombatCardProps) {

    const cardClass = isActive
        ? 'combat-card combat-card-active'
        : `combat-card ${className}`;

    return (
        <div className={cardClass}>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div
                        className={
                            isActive
                                ? 'text-initiative text-combat-turn-foreground'
                                : 'text-initiative'
                        }
                    >
                        {initiative}
                    </div>
                    <div>
                        <h3 className="font-semibold">{name}</h3>
                        <p className="text-sm text-muted-foreground">{type}</p>
                    </div>
                </div>
                <div className="text-right">
                    <div
                        className={
                            isActive
                                ? 'text-hp-large'
                                : hp.includes('8/25')
                                    ? 'text-xl font-bold text-hp-critical'
                                    : 'text-xl font-bold'
                        }
                    >
                        {hp}
                    </div>
                    <div
                        className={`hp-bar w-20 bg-muted ${
                            hp.includes('30/38')
                                ? 'hp-wounded'
                                : hp.includes('8/25')
                                    ? 'hp-critical'
                                    : ''
                        }`}
                    >
                        <div className={`hp-bar-fill ${hpBarWidth} h-full`}></div>
                    </div>
                </div>
            </div>
        </div>
    );

}

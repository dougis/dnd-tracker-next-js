import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CharacterCardProps {
  name: string;
  characterClass: string;
  hp: number;
  maxHp?: number;
  ac: number;
  type: 'PC' | 'NPC' | 'Monster';
  avatarSrc?: string;
  avatarFallback: string;
  crRating?: string;
}

export function CharacterCard({
  name,
  characterClass,
  hp,
  maxHp = hp,
  ac,
  type,
  avatarSrc,
  avatarFallback,
  crRating,
}: CharacterCardProps) {
  const getHpStatusClass = () => {
    const percentage = hp / maxHp;
    if (percentage >= 0.8) return 'text-hp-healthy bg-hp-healthy';
    if (percentage >= 0.5) return 'text-hp-full bg-hp-full';
    if (percentage >= 0.3) return 'text-hp-wounded bg-hp-wounded';
    return 'text-hp-critical bg-hp-critical';
  };

  const getHpBarWidth = () => {
    const percentage = hp / maxHp;
    if (percentage >= 0.8) return 'w-full';
    if (percentage >= 0.6) return 'w-4/5';
    if (percentage >= 0.4) return 'w-3/5';
    if (percentage >= 0.2) return 'w-2/5';
    return 'w-1/5';
  };

  const typeClass = `character-${type.toLowerCase()}`;
  const shouldAnimate = hp / maxHp <= 0.3;

  return (
    <Card className={typeClass}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              {avatarSrc && <AvatarImage src={avatarSrc} />}
              <AvatarFallback className={`bg-${typeClass} text-${typeClass}-foreground`}>
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {characterClass}
                {crRating && ` (${crRating})`}
              </p>
            </div>
          </div>
          <Badge className={`bg-${typeClass} text-${typeClass}-foreground`}>
            {type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className={`text-2xl font-bold ${getHpStatusClass().split(' ')[0]}`}>
              {hp}
              {maxHp !== hp && `/${maxHp}`}
            </p>
            <p className="text-sm text-muted-foreground">HP</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{ac}</p>
            <p className="text-sm text-muted-foreground">AC</p>
          </div>
        </div>
        <div className="hp-bar bg-muted">
          <div 
            className={`hp-bar-fill ${getHpStatusClass().split(' ')[1]} h-full ${getHpBarWidth()} transition-all ${shouldAnimate ? 'animate-pulse-hp' : ''}`} 
          />
        </div>
      </CardContent>
    </Card>
  );
}
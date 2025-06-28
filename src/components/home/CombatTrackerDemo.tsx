import { CombatCard } from './CombatCard';

export function CombatTrackerDemo() {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-serif font-semibold">Combat Tracker</h2>

      {/* Initiative Order */}
      <div className="initiative-order">
        <CombatCard
          initiative={18}
          name="Aragorn"
          type="Fighter (PC)"
          hp="45/45"
          hpBarWidth="w-full"
          isActive={true}
        />

        <CombatCard
          initiative={15}
          name="Gandalf"
          type="Wizard (NPC)"
          hp="30/38"
          hpBarWidth="w-4/5"
          className="character-npc"
        />

        <CombatCard
          initiative={12}
          name="Orc Warrior"
          type="Monster (CR 1)"
          hp="8/25"
          hpBarWidth="w-1/3"
          className="character-monster"
        />
      </div>
    </section>
  );
}

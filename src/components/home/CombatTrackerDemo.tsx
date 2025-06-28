export function CombatTrackerDemo() {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-serif font-semibold">
        Combat Tracker
      </h2>

      {/* Initiative Order */}
      <div className="initiative-order">
        <div className="combat-card combat-card-active">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-initiative text-combat-turn-foreground">
                18
              </div>
              <div>
                <h3 className="font-semibold">Aragorn</h3>
                <p className="text-sm text-muted-foreground">
                  Fighter (PC)
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-hp-large">45/45</div>
              <div className="hp-bar w-20 bg-muted">
                <div className="hp-bar-fill w-full h-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="combat-card character-npc">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-initiative">15</div>
              <div>
                <h3 className="font-semibold">Gandalf</h3>
                <p className="text-sm text-muted-foreground">
                  Wizard (NPC)
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold">30/38</div>
              <div className="hp-bar w-20 bg-muted hp-wounded">
                <div className="hp-bar-fill w-4/5 h-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="combat-card character-monster">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-initiative">12</div>
              <div>
                <h3 className="font-semibold">Orc Warrior</h3>
                <p className="text-sm text-muted-foreground">
                  Monster (CR 1)
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-hp-critical">
                8/25
              </div>
              <div className="hp-bar w-20 bg-muted hp-critical">
                <div className="hp-bar-fill w-1/3 h-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
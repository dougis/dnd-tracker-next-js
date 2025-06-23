export default function Home() {
  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-fantasy font-bold text-foreground">
          Welcome to D&D Encounter Tracker
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your D&D 5e combat encounters with ease
        </p>
      </div>

      {/* Content */}
      <div className="space-y-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Combat Tracker Demo */}
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

          {/* Character Stats Demo */}
          <section className="space-y-6">
            <h2 className="text-2xl font-serif font-semibold">
              Character Stats
            </h2>

            <div className="stat-block">
              <h3 className="text-lg font-semibold mb-4">Aragorn, Ranger</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-stat">16</div>
                  <div className="text-modifier text-muted-foreground">+3</div>
                  <div className="text-xs font-medium">STR</div>
                </div>
                <div>
                  <div className="text-stat">18</div>
                  <div className="text-modifier text-muted-foreground">+4</div>
                  <div className="text-xs font-medium">DEX</div>
                </div>
                <div>
                  <div className="text-stat">14</div>
                  <div className="text-modifier text-muted-foreground">+2</div>
                  <div className="text-xs font-medium">CON</div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex justify-between">
                  <span>AC</span>
                  <span className="font-bold">17</span>
                </div>
                <div className="flex justify-between">
                  <span>Initiative</span>
                  <span className="font-bold">+4</span>
                </div>
                <div className="flex justify-between">
                  <span>Speed</span>
                  <span className="font-bold">30 ft</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Responsive Test Section */}
        <section className="mt-12">
          <h2 className="text-2xl font-serif font-semibold mb-6">
            Responsive Grid Test
          </h2>
          <div className="grid gap-4 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="encounter-panel p-4 text-center">
                <div className="text-sm font-medium">Card {i + 1}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Responsive
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Theme Colors Demo */}
        <section className="mt-12">
          <h2 className="text-2xl font-serif font-semibold mb-6">
            Color Palette
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Primary Colors</h3>
              <div className="flex space-x-2">
                <div className="w-8 h-8 bg-primary-300 rounded"></div>
                <div className="w-8 h-8 bg-primary-500 rounded"></div>
                <div className="w-8 h-8 bg-primary-700 rounded"></div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">HP Status</h3>
              <div className="flex space-x-2">
                <div className="w-8 h-8 bg-hp-full rounded"></div>
                <div className="w-8 h-8 bg-hp-wounded rounded"></div>
                <div className="w-8 h-8 bg-hp-critical rounded"></div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Character Types</h3>
              <div className="flex space-x-2">
                <div className="w-8 h-8 bg-character-pc rounded"></div>
                <div className="w-8 h-8 bg-character-npc rounded"></div>
                <div className="w-8 h-8 bg-character-monster rounded"></div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

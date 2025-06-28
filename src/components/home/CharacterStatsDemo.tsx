export function CharacterStatsDemo() {
  return (
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
  );
}
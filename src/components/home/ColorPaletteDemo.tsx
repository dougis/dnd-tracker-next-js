export function ColorPaletteDemo() {
  return (
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
  );
}
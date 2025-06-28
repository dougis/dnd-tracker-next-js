export function ResponsiveGridTest() {
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-serif font-semibold mb-6">
        Responsive Grid Test
      </h2>
      <div className="grid gap-4 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="encounter-panel p-4 text-center">
            <div className="text-sm font-medium">Card {i + 1}</div>
            <div className="text-xs text-muted-foreground mt-1">Responsive</div>
          </div>
        ))}
      </div>
    </section>
  );
}

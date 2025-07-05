interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({
  title = "No encounters found",
  description = "Create your first encounter to get started organizing your combat sessions."
}: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="max-w-sm mx-auto">
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6">{description}</p>
      </div>
    </div>
  );
}
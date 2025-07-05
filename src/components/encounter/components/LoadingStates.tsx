import { LoadingCard } from '@/components/shared/LoadingCard';

interface GridLoadingStateProps {
  count?: number;
}

export function GridLoadingState({ count = 8 }: GridLoadingStateProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <LoadingCard key={i} />
      ))}
    </div>
  );
}

interface ListLoadingStateProps {
  count?: number;
  itemHeight?: string;
}

export function ListLoadingState({ count = 5, itemHeight = "h-16" }: ListLoadingStateProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <LoadingCard key={i} className={itemHeight} />
      ))}
    </div>
  );
}
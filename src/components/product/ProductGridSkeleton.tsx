export default function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-navy-100">
            <div className="skeleton aspect-square" />
            <div className="space-y-2 p-4">
              <div className="skeleton h-3 w-16 rounded" />
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-3/4 rounded" />
              <div className="skeleton h-6 w-24 rounded" />
              <div className="skeleton h-9 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

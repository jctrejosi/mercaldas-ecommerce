/* ─── Skeleton card ─────────────────────────────────────── */
export function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="aspect-square relative overflow-hidden bg-muted">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
            animation: "shimmer 1.4s infinite",
            backgroundSize: "200% 100%",
          }}
        />
      </div>
      <div className="p-3 space-y-2.5">
        <div className="relative overflow-hidden h-2.5 rounded bg-muted w-3/4">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
              animation: "shimmer 1.4s infinite",
              backgroundSize: "200% 100%",
            }}
          />
        </div>
        <div className="relative overflow-hidden h-2.5 rounded bg-muted w-1/2">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
              animation: "shimmer 1.4s infinite 0.2s",
              backgroundSize: "200% 100%",
            }}
          />
        </div>
        <div className="relative overflow-hidden h-4 rounded bg-muted w-1/3 mt-1">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
              animation: "shimmer 1.4s infinite 0.1s",
              backgroundSize: "200% 100%",
            }}
          />
        </div>
        <div className="relative overflow-hidden h-8 rounded-lg bg-muted mt-2">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
              animation: "shimmer 1.4s infinite 0.3s",
              backgroundSize: "200% 100%",
            }}
          />
        </div>
      </div>
    </div>
  );
}

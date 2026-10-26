export default function Loading() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4 py-16">
      <div className="text-center">
        <span className="mx-auto block h-7 w-7 animate-spin rounded-full border-2 border-border border-t-accent" />
        <p className="mt-4 text-sm text-muted">Loading NEEV module…</p>
      </div>
    </div>
  );
}

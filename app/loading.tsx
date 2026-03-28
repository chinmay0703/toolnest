export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-border border-t-primary animate-spin" />
        <p className="text-text-muted text-sm">Loading...</p>
      </div>
    </div>
  );
}

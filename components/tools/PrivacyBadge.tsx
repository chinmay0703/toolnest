export function PrivacyBadge() {
  return (
    <div className="rounded-xl my-8 bg-bg-card border border-border overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="flex items-start gap-4 p-6">
          <span className="text-3xl select-none">🔒</span>
          <div>
            <h3 className="font-semibold text-text-primary mb-1">
              100% Private
            </h3>
            <p className="text-sm text-text-secondary">
              Your files never leave your device. All processing happens in your
              browser.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-6 border-t md:border-t-0 md:border-l border-border">
          <span className="text-3xl select-none">🛡️</span>
          <div>
            <h3 className="font-semibold text-text-primary mb-1">
              AI Can&apos;t Do This
            </h3>
            <p className="text-sm text-text-secondary">
              Unlike ChatGPT &mdash; we actually process your file. No AI
              hallucinations, just real results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

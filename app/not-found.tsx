import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base px-4">
      <div className="text-center">
        <h1
          className="text-6xl sm:text-8xl font-bold gradient-text mb-4"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          404
        </h1>
        <h2 className="text-xl sm:text-2xl text-text-primary font-semibold mb-2">
          Page Not Found
        </h2>
        <p className="text-text-secondary mb-8 max-w-md mx-auto">
          The tool you&apos;re looking for doesn&apos;t exist or has been moved.
          Try searching for it or browse our categories.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105"
            style={{ background: "var(--gradient-primary)" }}
          >
            Go Home
          </Link>
          <Link
            href="/#tools"
            className="px-6 py-3 rounded-xl font-semibold text-text-primary border border-border hover:border-primary transition-all duration-300"
          >
            Browse Tools
          </Link>
        </div>
      </div>
    </div>
  );
}

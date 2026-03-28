import Link from 'next/link';
import { Zap } from 'lucide-react';

const categoryLinks = [
  { name: 'PDF Tools', href: '/pdf' },
  { name: 'Image Tools', href: '/image' },
  { name: 'Text Tools', href: '/text' },
  { name: 'Developer Tools', href: '/developer' },
  { name: 'Calculators', href: '/calculators' },
];

const moreLinks = [
  { name: 'Security Tools', href: '/security' },
  { name: 'Media Tools', href: '/media' },
  { name: 'Productivity', href: '/productivity' },
  { name: 'Design Tools', href: '/design' },
  { name: 'Fun Tools', href: '/fun' },
  { name: 'Writing Tools', href: '/writing' },
  { name: 'Finance Tools', href: '/finance' },
];

const aboutLinks = [
  { name: 'Privacy Policy', href: '#' },
  { name: 'Terms of Service', href: '#' },
  { name: 'Sitemap', href: '/sitemap.xml' },
];

export default function Footer() {
  return (
    <footer className="bg-bg-base border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Column 1 - Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Zap className="w-4.5 h-4.5 text-white" fill="currentColor" />
              </div>
              <span className="text-xl font-heading font-bold gradient-text">
                ToolNest
              </span>
            </Link>
            <p className="text-sm font-medium text-text-primary mb-2">
              What AI talks about, we do it.
            </p>
            <p className="text-sm text-text-secondary leading-relaxed">
              453+ free browser-based tools. No sign-ups,
              no uploads to servers. Everything runs locally in your browser.
            </p>
          </div>

          {/* Column 2 - Categories */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
              Categories
            </h3>
            <ul className="space-y-2.5">
              {categoryLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - More Tools */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
              More Tools
            </h3>
            <ul className="space-y-2.5">
              {moreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 - About */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
              About
            </h3>
            <ul className="space-y-2.5">
              {aboutLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-center text-sm text-text-muted">
            &copy; 2024 ToolNest &mdash; Free forever. Your files, your privacy.
          </p>
        </div>
      </div>
    </footer>
  );
}

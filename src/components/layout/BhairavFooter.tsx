import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const capabilities = [
  { label: 'Security Intelligence', to: '/security' },
  { label: 'Identity Verification', to: '/verification' },
  { label: 'Network Intelligence', to: '/network' },
  { label: 'Maps & Analytics', to: '/security/map' },
  { label: 'AI Assistant', to: '/ask-bhairav' },
  { label: 'Personnel Welfare', to: '/personnel' },
];

const exploreLinks = [
  { label: 'About Bhairav', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Request Access', to: '/request-access' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
  { label: 'Cookie Policy', to: '/cookies' },
  { label: 'Accessibility', to: '/accessibility' },
];

export function BhairavFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--color-bhairav-graphite)] bg-[var(--color-bhairav-ink)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <Shield className="text-[var(--color-bhairav-steel)]" size={22} />
              <span className="text-base font-bold tracking-widest text-white">BHAIRAV</span>
            </Link>
            <p className="text-xs text-[var(--color-bhairav-text-muted)] leading-relaxed max-w-xs">
              AI-powered defence and security intelligence for situational awareness, intelligence fusion, and mission readiness.
            </p>
          </div>

          {/* Capabilities */}
          <div>
            <h3 className="text-xs font-semibold text-white/80 tracking-widest uppercase mb-4">Capabilities</h3>
            <ul className="space-y-2.5">
              {capabilities.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-[var(--color-bhairav-text-muted)] hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-xs font-semibold text-white/80 tracking-widest uppercase mb-4">Explore</h3>
            <ul className="space-y-2.5">
              {exploreLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-[var(--color-bhairav-text-muted)] hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold text-white/80 tracking-widest uppercase mb-4">Contact</h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/contact" className="text-sm text-[var(--color-bhairav-text-muted)] hover:text-white transition-colors">
                  Support
                </Link>
              </li>
              <li>
                <Link to="/request-access" className="text-sm text-[var(--color-bhairav-text-muted)] hover:text-white transition-colors">
                  Request Access
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="mt-12 pt-6 border-t border-[var(--color-bhairav-graphite)] flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-[var(--color-bhairav-text-muted)]/60 tracking-wide">
            © {currentYear} Bhairav. All rights reserved.
          </p>
          <p className="text-[11px] text-[var(--color-bhairav-text-muted)]/50 tracking-wide">
            <span className="text-[var(--color-bhairav-text-muted)]/70">Bhairav: Shadows and Steel</span>
            <span className="mx-2 text-[var(--color-bhairav-text-muted)]/30">•</span>
            <span className="text-[var(--color-bhairav-text-muted)]/60">By OmeGamma</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

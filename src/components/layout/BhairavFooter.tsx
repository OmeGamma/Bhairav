import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const footerLinks = [
  { label: 'About Bhairav', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Privacy Policy', to: '/privacy' },
];

export function BhairavFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--color-bhairav-graphite)] bg-[var(--color-bhairav-ink)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <Shield className="text-[var(--color-bhairav-steel)]" size={22} />
              <span className="text-base font-bold tracking-widest text-white">BHAIRAV</span>
            </Link>
            <p className="text-xs text-[var(--color-bhairav-text-muted)] leading-relaxed max-w-sm">
              AI-powered defence and security intelligence for situational awareness, intelligence fusion, and mission readiness.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-xs font-semibold text-white/80 tracking-widest uppercase mb-4">Explore</h3>
            <ul className="space-y-3">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-[var(--color-bhairav-text-muted)] hover:text-white transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="mt-12 pt-6 border-t border-[var(--color-bhairav-graphite)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-[var(--color-bhairav-text-muted)]/60 tracking-wide">
            © {currentYear} Bhairav. All rights reserved.
          </p>
          <p className="text-[10px] text-[var(--color-bhairav-text-muted)]/60 tracking-widest uppercase">
            Bhairav: Shadows and Steel <span className="opacity-50 mx-1">•</span> By OmeGamma
          </p>
        </div>
      </div>
    </footer>
  );
}

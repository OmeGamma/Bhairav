import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const footerLinks = [
  { label: 'About Bhairav', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Privacy', to: '/privacy' },
  { label: 'Terms', to: '/terms' },
  { label: 'Security', to: '/security' },
  { label: 'Accessibility', to: '/accessibility' },
];

export function BhairavFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[var(--color-bhairav-border)] bg-[var(--color-bhairav-bg-elevated)]">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
              <Shield className="text-[var(--color-bhairav-primary)]" size={24} />
              <span className="text-base font-extrabold tracking-[0.2em] text-[var(--color-bhairav-text)]">
                BHAIRAV
              </span>
            </Link>
            <p className="text-sm text-[var(--color-bhairav-text-muted)] leading-relaxed max-w-xl">
              AI-powered defence and security intelligence for situational awareness, intelligence fusion, and mission readiness.
              Bhairav combines live video analytics with criminal-network analysis into a single, queryable platform.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-bhairav-text)] mb-4">
              Explore
            </h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
              {footerLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-primary)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="mt-10 pt-6 border-t border-[var(--color-bhairav-border)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-[var(--color-bhairav-text-muted)] tracking-wide">
            © {currentYear} Bhairav. All rights reserved.
          </p>
          <p className="text-[10px] uppercase tracking-widest text-[var(--color-bhairav-text-muted)]">
            Bhairav: Shadows and Steel <span className="opacity-50 mx-1">•</span> By OmeGamma
          </p>
        </div>
      </div>
    </footer>
  );
}

import { Link, useNavigate } from 'react-router-dom';
import { Shield, ArrowUp } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const capabilities = [
  { label: 'Security Intelligence', to: '/security/monitoring' },
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

function FooterLink({ to, children, requiresAuth = false }: { to: string; children: React.ReactNode; requiresAuth?: boolean }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleClick = (e: React.MouseEvent) => {
    if (requiresAuth && !isAuthenticated) {
      e.preventDefault();
      navigate(`/login?redirect=${encodeURIComponent(to)}`);
    }
  };

  return (
    <Link
      to={to}
      onClick={handleClick}
      className="text-sm text-gray-400 hover:text-white hover:text-[var(--color-bhairav-primary)] transition-colors relative inline-block group"
    >
      {children}
      <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[var(--color-bhairav-primary)] transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}

export function BhairavFooter() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative mt-auto overflow-hidden">
      {/* Geometric background decoration */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-[#080B10]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[var(--color-bhairav-primary)]/5 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-[var(--color-bhairav-primary)]/5 rounded-full blur-[80px]" />
      </div>

      {/* White frame border */}
      <div className="relative z-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="py-16 md:py-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12">
              {/* Branding column */}
              <div className="lg:col-span-2">
                <Link to="/" className="inline-flex items-center gap-2.5 mb-5">
                  <div className="relative">
                    <Shield className="text-[var(--color-bhairav-primary)]" size={26} />
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[var(--color-bhairav-verified)] rounded-full animate-pulse" />
                  </div>
                  <span className="text-lg font-bold tracking-widest text-white">BHAIRAV</span>
                </Link>
                <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
                  AI-powered defence and security intelligence for situational awareness, intelligence fusion, and mission readiness.
                </p>
                <div className="mt-6 flex items-center gap-4 text-gray-500">
                  <span className="text-xs text-gray-600">Bhairav - By OmeGamma</span>
                </div>
              </div>

              {/* Capabilities column */}
              <div>
                <h3 className="text-xs font-semibold text-white/90 tracking-widest uppercase mb-4">
                  Capabilities
                </h3>
                <ul className="space-y-2.5 grid grid-cols-1 gap-x-6 gap-y-2.5">
                  {capabilities.map((link) => (
                    <li key={link.label}>
                      <FooterLink to={link.to} requiresAuth>
                        {link.label}
                      </FooterLink>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Explore column */}
              <div>
                <h3 className="text-xs font-semibold text-white/90 tracking-widest uppercase mb-4">
                  Explore
                </h3>
                <ul className="space-y-2.5 grid grid-cols-1 gap-x-6 gap-y-2.5">
                  {exploreLinks.map((link) => (
                    <li key={link.label}>
                      <FooterLink to={link.to}>
                        {link.label}
                      </FooterLink>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Back to top */}
            <div className="mt-12 flex justify-start">
              <button
                onClick={scrollToTop}
                className="inline-flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-[var(--color-bhairav-primary)] transition-colors tracking-widest uppercase"
              >
                <ArrowUp size={14} />
                Back to Top
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom copyright strip */}
      <div className="relative z-10 border-t border-white/5 bg-[#05070a]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-gray-500 tracking-wide">
            © {currentYear} Bhairav. All rights reserved.
          </p>
          <p className="text-[11px] text-gray-600 tracking-wide">
            <span className="text-gray-400/80">Bhairav</span>
            <span className="mx-2 text-gray-700">•</span>
            <span className="text-gray-500">By OmeGamma</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

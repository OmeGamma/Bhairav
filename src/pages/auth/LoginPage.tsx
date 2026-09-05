import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ArrowRight, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const redirectTo =
    (location.state as any)?.redirect ||
    new URLSearchParams(location.search).get('redirect') ||
    '/home';

  useEffect(() => {
    if (isAuthenticated) navigate(redirectTo, { replace: true });
  }, [isAuthenticated, navigate, redirectTo]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-10 relative">
      <div className="absolute inset-0 -z-10 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle at 20% 20%, var(--color-bhairav-primary-soft), transparent 45%), radial-gradient(circle at 80% 80%, var(--color-bhairav-olive-soft), transparent 50%)',
      }} />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[var(--color-bhairav-primary-soft)] border border-[var(--color-bhairav-primary)]/20 mb-6 shadow-sm">
            <Shield className="text-[var(--color-bhairav-primary)]" size={36} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-[0.2em] text-[var(--color-bhairav-text)]">BHAIRAV</h1>
          <p className="text-[var(--color-bhairav-text-muted)] text-xs tracking-widest uppercase mt-2">
            Secure Intelligence Portal
          </p>
        </div>

        <div className="glass-card p-8">
          <h2 className="text-xl font-bold text-[var(--color-bhairav-text)] mb-1">Sign in</h2>
          <p className="text-sm text-[var(--color-bhairav-text-muted)] mb-6">
            Authorized personnel only.
          </p>

          {error && (
            <div className="mb-5 p-3.5 rounded-md bg-[var(--color-bhairav-critical)]/10 border border-[var(--color-bhairav-critical)]/30 flex items-start gap-3">
              <AlertCircle className="text-[var(--color-bhairav-critical)] shrink-0 mt-0.5" size={16} />
              <p className="text-sm text-[var(--color-bhairav-critical)]">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--color-bhairav-text-muted)] mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-bhairav-text-muted)] pointer-events-none" size={16} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@agency.gov"
                  className="w-full pl-10 pr-3 py-2.5 rounded-md bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-border)] text-[var(--color-bhairav-text)] placeholder:text-[var(--color-bhairav-text-muted)] focus:outline-none focus:border-[var(--color-bhairav-primary)] focus:ring-2 focus:ring-[var(--color-bhairav-primary)]/20 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--color-bhairav-text-muted)] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-bhairav-text-muted)] pointer-events-none" size={16} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-md bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-border)] text-[var(--color-bhairav-text)] placeholder:text-[var(--color-bhairav-text-muted)] focus:outline-none focus:border-[var(--color-bhairav-primary)] focus:ring-2 focus:ring-[var(--color-bhairav-primary)]/20 transition-all text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-md text-sm font-semibold text-white bg-[var(--color-bhairav-primary)] hover:bg-[var(--color-bhairav-primary-hover)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign in <ArrowRight size={16} /></>
              )}
            </button>

            <div className="text-center pt-1">
              <p className="text-sm text-[var(--color-bhairav-text-muted)]">
                No clearance?{' '}
                <Link to="/register" className="text-[var(--color-bhairav-primary)] hover:underline font-medium">
                  Request access
                </Link>
              </p>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center text-[11px] text-[var(--color-bhairav-text-muted)] flex items-center justify-center gap-1.5">
          <Sparkles size={12} /> Demo: admin@gmail.com / admin@123
        </div>
      </div>
    </div>
  );
}

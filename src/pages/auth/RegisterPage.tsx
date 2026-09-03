import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, AlertCircle, ArrowRight, Mail, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      await register({ name, email, password });
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
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
            Request system access
          </p>
        </div>

        <div className="glass-card p-8">
          <h2 className="text-xl font-bold text-[var(--color-bhairav-text)] mb-1">Create an account</h2>
          <p className="text-sm text-[var(--color-bhairav-text-muted)] mb-6">
            Access is subject to verification and approval.
          </p>

          {error && (
            <div className="mb-5 p-3.5 rounded-md bg-[var(--color-bhairav-critical)]/10 border border-[var(--color-bhairav-critical)]/30 flex items-start gap-3">
              <AlertCircle className="text-[var(--color-bhairav-critical)] shrink-0 mt-0.5" size={16} />
              <p className="text-sm text-[var(--color-bhairav-critical)]">{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--color-bhairav-text-muted)] mb-2">Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-bhairav-text-muted)] pointer-events-none" size={16} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Officer name"
                  className="w-full pl-10 pr-3 py-2.5 rounded-md bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-border)] text-[var(--color-bhairav-text)] placeholder:text-[var(--color-bhairav-text-muted)] focus:outline-none focus:border-[var(--color-bhairav-primary)] focus:ring-2 focus:ring-[var(--color-bhairav-primary)]/20 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--color-bhairav-text-muted)] mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-bhairav-text-muted)] pointer-events-none" size={16} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@agency.gov"
                  className="w-full pl-10 pr-3 py-2.5 rounded-md bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-border)] text-[var(--color-bhairav-text)] placeholder:text-[var(--color-bhairav-text-muted)] focus:outline-none focus:border-[var(--color-bhairav-primary)] focus:ring-2 focus:ring-[var(--color-bhairav-primary)]/20 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--color-bhairav-text-muted)] mb-2">Password</label>
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

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--color-bhairav-text-muted)] mb-2">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-bhairav-text-muted)] pointer-events-none" size={16} />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                <>Create account <ArrowRight size={16} /></>
              )}
            </button>

            <div className="text-center pt-1">
              <p className="text-sm text-[var(--color-bhairav-text-muted)]">
                Already have clearance?{' '}
                <Link to="/login" className="text-[var(--color-bhairav-primary)] hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

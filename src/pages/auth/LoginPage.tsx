import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Shield, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const redirectTo = (location.state as any)?.redirect || new URLSearchParams(location.search).get('redirect') || '/command-center';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await login({ email, password });
      navigate(redirectTo);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bhairav-bg)] flex flex-col items-center justify-center relative px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bhairav-bg)] via-[var(--color-bhairav-surface)] to-[var(--color-bhairav-bg)] opacity-50 z-0"></div>
      
      <div className="w-full max-w-md z-10 relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] mb-6 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
            <Shield className="text-[var(--color-bhairav-primary)]" size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-widest mb-2">BHAIRAV</h1>
          <p className="text-[var(--color-bhairav-text-muted)] text-sm tracking-wide">SECURE INTELLIGENCE PORTAL</p>
        </div>
        
        <div className="bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] rounded-xl shadow-2xl p-8">
          {error && (
            <div className="mb-6 p-4 rounded-md bg-[var(--color-bhairav-critical)]/10 border border-[var(--color-bhairav-critical)]/30 flex items-start gap-3">
              <AlertCircle className="text-[var(--color-bhairav-critical)] shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-[var(--color-bhairav-critical)]">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--color-bhairav-text-muted)] mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-[var(--color-bhairav-text-muted)]" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-[var(--color-bhairav-border)] rounded-md bg-[var(--color-bhairav-bg)] text-[var(--color-bhairav-text)] placeholder-[var(--color-bhairav-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-bhairav-primary)] focus:border-[var(--color-bhairav-primary)] transition-all sm:text-sm"
                  placeholder="officer@defence.gov"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-bhairav-text-muted)] mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[var(--color-bhairav-text-muted)]" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-[var(--color-bhairav-border)] rounded-md bg-[var(--color-bhairav-bg)] text-[var(--color-bhairav-text)] placeholder-[var(--color-bhairav-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-bhairav-primary)] focus:border-[var(--color-bhairav-primary)] transition-all sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--color-bhairav-primary)] hover:bg-[var(--color-bhairav-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-bhairav-primary)] focus:ring-offset-[var(--color-bhairav-surface)] transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign In <ArrowRight size={16} />
                </>
              )}
            </button>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-[var(--color-bhairav-text-muted)]">
                No clearance?{' '}
                <Link to="/register" className="text-[var(--color-bhairav-primary)] hover:underline">
                  Request Access
                </Link>
              </p>
            </div>
          </form>
        </div>
        
        <div className="mt-8 text-center text-xs text-[var(--color-bhairav-text-muted)]">
          <p>Restricted Access. Authorized Personnel Only.</p>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { User as UserIcon, Mail, Shield, CheckCircle, XCircle } from 'lucide-react';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { authService } from '../services/authService';
import type { User } from '../services/authService';
import { cn } from '../utils/cn';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }
        const userData = await authService.verifySession(token);
        setUser(userData);
      } catch {
        setError('Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <LoadingState fullHeight message="Loading profile..." />;
  }

  if (error || !user) {
    return <ErrorState message={error || 'Profile not available.'} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 border-b border-[var(--color-bhairav-border)] pb-4">
        <h1 className="text-2xl font-bold text-[var(--color-bhairav-text)] uppercase tracking-tight">Officer Profile</h1>
        <p className="text-[10px] text-[var(--color-bhairav-text-muted)] font-mono uppercase tracking-widest mt-1">View your account information</p>
      </div>

      <div className="bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] rounded-xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-[var(--color-bhairav-border)]/50">
          <div className="w-20 h-20 rounded-full bg-[var(--color-bhairav-primary)]/10 flex items-center justify-center border border-[var(--color-bhairav-primary)]/30">
            <UserIcon className="text-[var(--color-bhairav-primary)]" size={40} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-bhairav-text)] uppercase tracking-wider">{user.name}</h2>
            <p className="text-sm font-data text-[var(--color-bhairav-text-muted)] uppercase tracking-widest mt-1">{user.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-border)] rounded-lg p-5 flex items-center gap-5 hover:border-[var(--color-bhairav-primary)]/30 transition-colors group">
            <div className="w-12 h-12 rounded-lg bg-[var(--color-bhairav-surface)] flex items-center justify-center border border-[var(--color-bhairav-border)] group-hover:bg-[var(--color-bhairav-primary)]/10 group-hover:border-[var(--color-bhairav-primary)]/30 transition-colors">
              <Mail className="text-[var(--color-bhairav-text-muted)] group-hover:text-[var(--color-bhairav-primary)] transition-colors" size={20} />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-[var(--color-bhairav-text-muted)] uppercase tracking-widest mb-1">Email Address</span>
              <span className="text-sm font-data text-[var(--color-bhairav-text)] uppercase tracking-wider">{user.email}</span>
            </div>
          </div>

          <div className="bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-border)] rounded-lg p-5 flex items-center gap-5 hover:border-[var(--color-bhairav-primary)]/30 transition-colors group">
            <div className="w-12 h-12 rounded-lg bg-[var(--color-bhairav-surface)] flex items-center justify-center border border-[var(--color-bhairav-border)] group-hover:bg-[var(--color-bhairav-primary)]/10 group-hover:border-[var(--color-bhairav-primary)]/30 transition-colors">
              <Shield className="text-[var(--color-bhairav-text-muted)] group-hover:text-[var(--color-bhairav-primary)] transition-colors" size={20} />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-[var(--color-bhairav-text-muted)] uppercase tracking-widest mb-1">Clearance Role</span>
              <span className="text-sm font-bold text-[var(--color-bhairav-text)] uppercase tracking-widest">{user.role_id || 'Officer'}</span>
            </div>
          </div>

          <div className="bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-border)] rounded-lg p-5 flex items-center gap-5">
            <div className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center border",
              user.status === 'ACTIVE' 
                ? "bg-[var(--color-bhairav-verified)]/10 border-[var(--color-bhairav-verified)]/30"
                : "bg-[var(--color-bhairav-critical)]/10 border-[var(--color-bhairav-critical)]/30"
            )}>
              {user.status === 'ACTIVE' ? (
                <CheckCircle className="text-[var(--color-bhairav-verified)]" size={20} />
              ) : (
                <XCircle className="text-[var(--color-bhairav-critical)]" size={20} />
              )}
            </div>
            <div>
              <span className="block text-[10px] font-bold text-[var(--color-bhairav-text-muted)] uppercase tracking-widest mb-1">Account Status</span>
              <span className={cn(
                "text-sm font-bold uppercase tracking-widest",
                user.status === 'ACTIVE' ? "text-[var(--color-bhairav-verified)]" : "text-[var(--color-bhairav-critical)]"
              )}>
                {user.status || 'Active'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--color-bhairav-border)]">
          <p className="text-[10px] text-[var(--color-bhairav-text-muted)] text-center font-mono uppercase tracking-widest">
            Profile information is read-only. Contact system administrator for updates.
          </p>
        </div>
      </div>
    </div>
  );
}

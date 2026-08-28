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
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Officer Profile</h1>
        <p className="text-gray-400 text-sm mt-1">View your account information</p>
      </div>

      <div className="bg-[#12141a] border border-gray-800 rounded-lg p-6 md:p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-blue-600/10 flex items-center justify-center border border-blue-600/30">
            <UserIcon className="text-blue-400" size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user.name}</h2>
            <p className="text-gray-400 text-sm">{user.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[#1a1d24] border border-gray-800 rounded-lg p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center border border-blue-600/30">
              <Mail className="text-blue-400" size={20} />
            </div>
            <div>
              <span className="block text-xs text-gray-500 mb-1">Email</span>
              <span className="text-sm font-medium text-gray-200">{user.email}</span>
            </div>
          </div>

          <div className="bg-[#1a1d24] border border-gray-800 rounded-lg p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center border border-blue-600/30">
              <Shield className="text-blue-400" size={20} />
            </div>
            <div>
              <span className="block text-xs text-gray-500 mb-1">Role</span>
              <span className="text-sm font-medium text-gray-200 capitalize">{user.role_id || 'Officer'}</span>
            </div>
          </div>

          <div className="bg-[#1a1d24] border border-gray-800 rounded-lg p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-green-600/10 flex items-center justify-center border border-green-600/30">
              {user.status === 'ACTIVE' ? (
                <CheckCircle className="text-green-400" size={20} />
              ) : (
                <XCircle className="text-red-400" size={20} />
              )}
            </div>
            <div>
              <span className="block text-xs text-gray-500 mb-1">Account Status</span>
              <span className={cn(
                "text-sm font-medium capitalize",
                user.status === 'ACTIVE' ? "text-green-400" : "text-red-400"
              )}>
                {user.status || 'Active'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-800">
          <p className="text-xs text-gray-600 text-center">
            Profile information is read-only. Contact system administrator for updates.
          </p>
        </div>
      </div>
    </div>
  );
}

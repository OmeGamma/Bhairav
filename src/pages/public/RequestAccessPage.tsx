import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export default function RequestAccessPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    role: '',
    purpose: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitted'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitted');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Request Access</h1>
        <p className="text-gray-400">Submit a request for platform access. Approval is subject to verification.</p>
      </div>

      <div className="bg-[#121316] border border-gray-800 rounded-xl p-6 md:p-8">
        {status === 'submitted' ? (
          <div className="flex items-start gap-3 p-4 rounded-md bg-[var(--color-bhairav-primary)]/10 border border-[var(--color-bhairav-primary)]/30">
            <Shield className="text-[var(--color-bhairav-primary)] shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-sm text-[var(--color-bhairav-primary)] font-medium">Access request received</p>
              <p className="text-sm text-gray-400 mt-1">We will review your request and respond via email. You can also <Link to="/register" className="text-[var(--color-bhairav-primary)] underline">create an account</Link> if registration is open.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--color-bhairav-text-muted)] mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="block w-full px-3 py-2.5 border border-[var(--color-bhairav-border)] rounded-md bg-[var(--color-bhairav-bg)] text-[var(--color-bhairav-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-bhairav-primary)] focus:border-[var(--color-bhairav-primary)] transition-all"
                  placeholder="Officer Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-bhairav-text-muted)] mb-2">Official Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full px-3 py-2.5 border border-[var(--color-bhairav-border)] rounded-md bg-[var(--color-bhairav-bg)] text-[var(--color-bhairav-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-bhairav-primary)] focus:border-[var(--color-bhairav-primary)] transition-all"
                  placeholder="officer@organization.gov"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--color-bhairav-text-muted)] mb-2">Organization</label>
                <input
                  type="text"
                  required
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="block w-full px-3 py-2.5 border border-[var(--color-bhairav-border)] rounded-md bg-[var(--color-bhairav-bg)] text-[var(--color-bhairav-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-bhairav-primary)] focus:border-[var(--color-bhairav-primary)] transition-all"
                  placeholder="Organization"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-bhairav-text-muted)] mb-2">Role / Designation</label>
                <input
                  type="text"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="block w-full px-3 py-2.5 border border-[var(--color-bhairav-border)] rounded-md bg-[var(--color-bhairav-bg)] text-[var(--color-bhairav-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-bhairav-primary)] focus:border-[var(--color-bhairav-primary)] transition-all"
                  placeholder="Role / Designation"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-bhairav-text-muted)] mb-2">Purpose of Access</label>
              <input
                type="text"
                required
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="block w-full px-3 py-2.5 border border-[var(--color-bhairav-border)] rounded-md bg-[var(--color-bhairav-bg)] text-[var(--color-bhairav-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-bhairav-primary)] focus:border-[var(--color-bhairav-primary)] transition-all"
                placeholder="Purpose of access"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-bhairav-text-muted)] mb-2">Message</label>
              <textarea
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="block w-full px-3 py-2.5 border border-[var(--color-bhairav-border)] rounded-md bg-[var(--color-bhairav-bg)] text-[var(--color-bhairav-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-bhairav-primary)] focus:border-[var(--color-bhairav-primary)] transition-all"
                placeholder="Additional information"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-bhairav-primary)] hover:bg-[var(--color-bhairav-primary-hover)] text-white rounded-md font-medium transition-colors"
            >
              Submit Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

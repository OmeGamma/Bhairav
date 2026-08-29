import { useState } from 'react';
import { Mail } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitted'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitted');
  };

  return (
    <div className="max-w-3xl mx-auto py-12 md:py-16 px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Contact</h1>
        <p className="text-gray-400">Reach out to the Bhairav team for enquiries, support, or partnership discussions.</p>
      </div>

      <div className="bg-[#121316] border border-gray-800 rounded-xl p-6 md:p-8">
        {status === 'submitted' ? (
          <div className="flex items-start gap-3 p-4 rounded-md bg-[var(--color-bhairav-primary)]/10 border border-[var(--color-bhairav-primary)]/30">
            <Mail className="text-[var(--color-bhairav-primary)] shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-[var(--color-bhairav-primary)]">Thank you for contacting us. We will respond to your enquiry as soon as possible.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--color-bhairav-text-muted)] mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="block w-full px-3 py-2.5 border border-[var(--color-bhairav-border)] rounded-md bg-[var(--color-bhairav-bg)] text-[var(--color-bhairav-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-bhairav-primary)] focus:border-[var(--color-bhairav-primary)] transition-all"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-bhairav-text-muted)] mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full px-3 py-2.5 border border-[var(--color-bhairav-border)] rounded-md bg-[var(--color-bhairav-bg)] text-[var(--color-bhairav-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-bhairav-primary)] focus:border-[var(--color-bhairav-primary)] transition-all"
                  placeholder="you@organization.gov"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--color-bhairav-text-muted)] mb-2">Organization</label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="block w-full px-3 py-2.5 border border-[var(--color-bhairav-border)] rounded-md bg-[var(--color-bhairav-bg)] text-[var(--color-bhairav-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-bhairav-primary)] focus:border-[var(--color-bhairav-primary)] transition-all"
                  placeholder="Organization"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-bhairav-text-muted)] mb-2">Subject</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="block w-full px-3 py-2.5 border border-[var(--color-bhairav-border)] rounded-md bg-[var(--color-bhairav-bg)] text-[var(--color-bhairav-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-bhairav-primary)] focus:border-[var(--color-bhairav-primary)] transition-all"
                  placeholder="Enquiry subject"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-bhairav-text-muted)] mb-2">Message</label>
              <textarea
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="block w-full px-3 py-2.5 border border-[var(--color-bhairav-border)] rounded-md bg-[var(--color-bhairav-bg)] text-[var(--color-bhairav-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-bhairav-primary)] focus:border-[var(--color-bhairav-primary)] transition-all"
                placeholder="Describe your enquiry..."
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-bhairav-primary)] hover:bg-[var(--color-bhairav-primary-hover)] text-white rounded-md font-medium transition-colors"
            >
              Send Enquiry
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

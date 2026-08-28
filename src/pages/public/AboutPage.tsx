
export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">About Bhairav</h1>
        <p className="text-gray-400">AI-powered defence and security intelligence platform</p>
      </div>

      <div className="space-y-8">
        <section className="bg-[#121316] border border-gray-800 rounded-xl p-6 md:p-8">
          <h2 className="text-xl font-semibold text-white mb-4">What is Bhairav?</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Bhairav is an AI-powered defence and security intelligence platform designed to provide situational awareness, intelligence fusion, and mission readiness support for security operations.
          </p>
          <p className="text-gray-300 leading-relaxed">
            The platform integrates multiple intelligence sources into a unified operational picture, enabling operators to detect threats, verify identities, analyze relationships, and make informed decisions in real time.
          </p>
        </section>

        <section className="bg-[#121316] border border-gray-800 rounded-xl p-6 md:p-8">
          <h2 className="text-xl font-semibold text-white mb-4">Platform Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Security Intelligence</h3>
              <p className="text-gray-400 text-sm">Real-time video analytics, perimeter monitoring, and anomaly detection across security feeds.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Identity Verification</h3>
              <p className="text-gray-400 text-sm">Multi-modal credential analysis, document verification, and biometric matching at checkpoints.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Network Intelligence</h3>
              <p className="text-gray-400 text-sm">Relational mapping of security events, entities, locations, and threat vectors.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Maps & Analytics</h3>
              <p className="text-gray-400 text-sm">Geospatial situational awareness with live tracking, heatmaps, and operational overlays.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-2">AI Assistant</h3>
              <p className="text-gray-400 text-sm">Natural-language intelligence querying, report generation, and command-support workflows.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Personnel Welfare</h3>
              <p className="text-gray-400 text-sm">Operational readiness tracking, welfare follow-ups, and support request management.</p>
            </div>
          </div>
        </section>

        <section className="bg-[#121316] border border-gray-800 rounded-xl p-6 md:p-8">
          <h2 className="text-xl font-semibold text-white mb-4">Purpose</h2>
          <p className="text-gray-300 leading-relaxed">
            Bhairav is built to support security operators and intelligence personnel by consolidating fragmented data streams into a coherent, actionable operational view. The platform emphasizes secure access, auditability, and structured intelligence workflows while leveraging AI-assisted analysis.
          </p>
        </section>
      </div>
    </div>
  );
}

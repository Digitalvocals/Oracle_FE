'use client'

import Link from 'next/link'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-black text-matrix-green p-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-matrix-green hover:text-matrix-green-bright mb-8 inline-block">
          ← Back to StreamScout
        </Link>
        
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-matrix-green/70 mb-4">Last updated: December 6, 2025</p>
        
        <div className="space-y-6 text-matrix-green/90">
          <section>
            <h2 className="text-xl font-semibold mb-2">Overview</h2>
            <p>
              StreamScout ("we", "our", or "us") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, and safeguard information 
              when you visit streamscout.gg.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Information We Collect</h2>
            <p className="mb-2"><strong>We do not collect personal information.</strong> StreamScout does not require:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Account creation or login</li>
              <li>Email addresses</li>
              <li>Names or personal details</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Automatically Collected Information</h2>
            <p className="mb-2">Like most websites, we may automatically collect:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Browser type and version</li>
              <li>Pages visited and time spent</li>
              <li>Referring website</li>
              <li>General location (country/region level)</li>
            </ul>
            <p className="mt-2">This data is collected via Google Analytics and is used solely to improve our service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Cookies</h2>
            <p>
              We use cookies for analytics (Google Analytics) and advertising (Google AdSense). 
              These help us understand how visitors use our site and display relevant advertisements. 
              You can disable cookies in your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Third-Party Services</h2>
            <p className="mb-2">We use the following third-party services:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>Google Analytics</strong> — Website traffic analysis</li>
              <li><strong>Google AdSense</strong> — Advertising</li>
              <li><strong>Twitch API</strong> — Game and streaming data</li>
            </ul>
            <p className="mt-2">
              These services have their own privacy policies. We encourage you to review them.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Data Storage</h2>
            <p>
              If you use the "Save Favorites" feature, this data is stored locally in your 
              browser (localStorage) and never sent to our servers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Children's Privacy</h2>
            <p>
              StreamScout is not directed at children under 13. We do not knowingly collect 
              information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted 
              on this page with an updated date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at:{' '}
              <a href="mailto:privacy@streamscout.gg" className="text-matrix-green-bright hover:underline">
                privacy@streamscout.gg
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

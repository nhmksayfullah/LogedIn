export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 shadow-sm dark:shadow-slate-900/50 rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Privacy Policy for Loged.in</h1>
        
        <div className="space-y-6 text-gray-700 dark:text-gray-300">
          <div>
            <p className="font-semibold">Last Updated: November 22, 2025</p>
            <p className="mt-2">
              <strong>Operated by:</strong> Doddle Software Limited<br />
              <strong>Address:</strong> 127 Foundry Lane, SO15 3LD, United Kingdom<br />
              <strong>Contact Email:</strong> contact@doddle.software
            </p>
          </div>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">1. Introduction</h2>
            <p>
              Loged.in (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is a personal transformation journaling platform that allows users to document and share their journeys through timelines and versioned logs. We value your privacy and are committed to protecting your personal data.
            </p>
            <p className="mt-4">
              This Privacy Policy explains how we collect, use, store, share, and protect your information when you use Loged.in (&quot;the Service&quot;).
            </p>
            <p className="mt-4">
              By accessing or using Loged.in, you agree to this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">2.1 Data collected through OAuth (Google & X)</h3>
            <p>When you sign in using Google or X (Twitter), we receive the following information from the selected provider:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Email address</li>
              <li>Display name</li>
              <li>Username / handle</li>
              <li>Profile photo</li>
              <li>Platform-specific user ID</li>
            </ul>
            <ul className="list-disc list-inside mt-4 space-y-1 ml-4">
              <li>We do not receive or store your password.</li>
              <li>We do not request additional permissions beyond what is required for authentication.</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">2.2 User-Generated Content</h3>
            <p>While using Loged.in, you may voluntarily upload:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Journey titles & descriptions</li>
              <li>Version logs</li>
              <li>Photos (including before/after images)</li>
              <li>Dates, notes, or stories</li>
              <li>Profile details</li>
            </ul>
            <p className="mt-4">
              You choose what content to upload and whether your journeys are public or private.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">2.3 Payment Information (Stripe)</h3>
            <p>When you purchase the Lifetime Pro plan, Stripe collects:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Email address</li>
              <li>Card details</li>
              <li>Transaction metadata</li>
            </ul>
            <ul className="list-disc list-inside mt-4 space-y-1 ml-4">
              <li>We do not store or process your card information.</li>
              <li>Stripe handles all payment processing securely under its own Privacy Policy.</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">2.4 Technical & Usage Data</h3>
            <p>We may automatically collect:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Device type</li>
              <li>Browser information</li>
              <li>Approximate location (city-level)</li>
              <li>Server logs</li>
              <li>IP address</li>
              <li>Session identifiers</li>
            </ul>
            <p className="mt-4">
              This is standard for web applications and helps us secure and operate the service.
            </p>
            <p className="mt-2 text-sm italic">
              (If PostHog analytics is added in the future, this section can be updated.)
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">3. How We Use Your Information</h2>
            <p>We use your information only for the following purposes:</p>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">3.1 To provide and operate the service</h3>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Authenticate your account via Google or X</li>
              <li>Create and manage your journeys</li>
              <li>Sync and store your data</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">3.2 Payments and Purchases</h3>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Process one-time payments</li>
              <li>Provide receipts and payment confirmations</li>
              <li>Manage your Lifetime Pro access</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">3.3 Account Management</h3>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Allow you to update or delete data</li>
              <li>Provide support when requested</li>
              <li>Maintain login sessions</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">3.4 Legal and security purposes</h3>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Prevent fraud and abuse</li>
              <li>Comply with applicable UK and international laws</li>
              <li>Protect the stability and security of Loged.in</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">4. Public Journeys and Shared Content</h2>
            <p>Loged.in allows users to make certain journeys public.</p>
            <p className="mt-4">When you make a journey public:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>All information inside that journey becomes visible to anyone with the URL.</li>
              <li>Search engines may index your public pages unless you choose otherwise.</li>
              <li>We cannot control how others use or share the publicly available information.</li>
              <li>You are fully responsible for the information you publish publicly.</li>
            </ul>
            <p className="mt-4">
              Private journeys remain strictly private unless you change their visibility.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">5. How We Store Your Data</h2>
            <p>
              All user data is stored securely in Supabase (PostgreSQL) with industry-standard encryption and access controls.
            </p>
            <ul className="list-disc list-inside mt-4 space-y-1 ml-4">
              <li>Data is encrypted in transit (HTTPS)</li>
              <li>Data is encrypted at rest</li>
              <li>Access is limited to authorized services only</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">6. Data Retention</h2>
            <p>We retain your data for as long as your account remains active.</p>
            <p className="mt-4">If you delete your account:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>All journeys, versions, photos, and profile information are permanently deleted</li>
              <li>Payment records required by law may be retained by Stripe</li>
              <li>Deleted content cannot be recovered</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">7. Your Rights (GDPR & UK Data Protection Act)</h2>
            <p>As a user based in the UK/EU, you have the right to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Access your data</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and all data</li>
              <li>Request a copy of your data</li>
              <li>Withdraw consent</li>
              <li>Object to processing</li>
              <li>File a complaint with the ICO (Information Commissioner&apos;s Office)</li>
            </ul>
            <p className="mt-4">
              You can access or delete your data directly from the app or by contacting us at{' '}
              <a href="mailto:contact@doddle.software" className="text-blue-600 hover:underline">
                contact@doddle.software
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">8. Sharing Your Information</h2>
            <p>We do not sell or rent your data.</p>
            <p className="mt-4">We only share your information with the following trusted partners:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Google and X (OAuth providers)</li>
              <li>Stripe (payment processing)</li>
              <li>Supabase (database + storage)</li>
              <li>Email delivery providers (for transactional emails)</li>
            </ul>
            <p className="mt-4">
              These providers act as data processors and operate under strict privacy controls.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">9. Children&apos;s Privacy</h2>
            <p>
              Loged.in is not intended for anyone under 16.
              We do not knowingly collect personal data from children.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">10. International Data Transfers</h2>
            <p>
              Because we use global cloud infrastructure (Supabase, Stripe), your data may be processed outside the UK/EU.
              All transfers follow GDPR-compliant safeguards such as SCCs (Standard Contractual Clauses).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">11. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time.</p>
            <p className="mt-4">When changes are made, we will:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Update the &quot;Last Updated&quot; date</li>
              <li>Notify users if the changes are significant</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">12. Contact Us</h2>
            <p>For privacy questions, data requests, or concerns, contact us at:</p>
            <p className="mt-4">
              <strong>Email:</strong>{' '}
              <a href="mailto:contact@doddle.software" className="text-blue-600 hover:underline">
                contact@doddle.software
              </a>
              <br />
              <strong>Address:</strong> Doddle Software Limited, 127 Foundry Lane, SO15 3LD, United Kingdom
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

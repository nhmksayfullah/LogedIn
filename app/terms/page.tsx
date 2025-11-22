export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms & Conditions for Loged.in</h1>
        
        <div className="space-y-6 text-gray-700">
          <div>
            <p className="font-semibold">Last Updated: November 22, 2025</p>
            <p className="mt-2">
              <strong>Operated by:</strong> Doddle Software Limited<br />
              <strong>Address:</strong> 127 Foundry Lane, SO15 3LD, United Kingdom<br />
              <strong>Contact Email:</strong> contact@doddle.software
            </p>
          </div>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Loged.in ("the Service"), you agree to be bound by these Terms & Conditions ("Terms").
              If you do not agree, you must stop using the Service.
            </p>
            <p className="mt-4">
              Loged.in is owned and operated by Doddle Software Limited ("we", "us", "our").
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Description of the Service</h2>
            <p>Loged.in is a web-based platform that enables users to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Create personal transformation journeys</li>
              <li>Add versioned logs with text and photos</li>
              <li>Store and manage private or public journeys</li>
              <li>Share public pages</li>
              <li>Upgrade to a Lifetime Pro plan for additional features</li>
            </ul>
            <p className="mt-4">
              The Service is provided on an "as-is" and "as-available" basis.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Eligibility</h2>
            <p>To use Loged.in, you must:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Be at least 16 years old</li>
              <li>Have the legal right to enter into agreements</li>
              <li>Not be prohibited from using the service under applicable laws</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Account Registration</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4.1 OAuth Login</h3>
            <p>You may sign in using:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Google OAuth</li>
              <li>X (Twitter) OAuth</li>
            </ul>
            <p className="mt-4">
              By signing in, you authorize us to receive basic profile information from your selected provider (email, name, username, profile picture).
            </p>
            <p className="mt-4">
              We do not receive or store your password.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4.2 Accurate Information</h3>
            <p>
              You agree to provide accurate information and keep your account details up to date.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4.3 Responsibility for Your Account</h3>
            <p>You are responsible for:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>All activity under your account</li>
              <li>Keeping your login methods secure</li>
              <li>Not sharing access with others</li>
            </ul>
            <p className="mt-4">
              We may suspend or terminate accounts that violate these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. User Content</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5.1 Ownership</h3>
            <p>You retain all ownership rights to any content you upload, including:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Journeys</li>
              <li>Version logs</li>
              <li>Photos</li>
              <li>Text</li>
              <li>Titles and descriptions</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5.2 License to Us</h3>
            <p>By uploading content, you grant us a non-exclusive, worldwide, royalty-free license to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Store, display, and process your content</li>
              <li>Show publicly visible content on your public pages</li>
            </ul>
            <p className="mt-4">
              This license exists solely to operate the Service.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5.3 Public Journeys</h3>
            <p>If you mark a journey as public, you understand that:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Anyone with the link can view it</li>
              <li>Search engines may index it</li>
              <li>Others may share or screenshot your content</li>
              <li>You are responsible for the content you choose to make public.</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5.4 Prohibited Content</h3>
            <p>You agree not to upload content that is:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Illegal</li>
              <li>Harassing, threatening, or hateful</li>
              <li>Pornographic or sexually explicit</li>
              <li>Violent or self-harm–encouraging</li>
              <li>Infringing intellectual property rights</li>
              <li>Malicious (malware, scripts, exploits)</li>
            </ul>
            <p className="mt-4">
              We reserve the right to remove such content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Payments & Pricing</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">6.1 Lifetime Pro Plan</h3>
            <p>
              The Service offers a one-time payment for Lifetime Pro access, processed through Stripe.
            </p>
            <p className="mt-4">Pro benefits include:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Unlimited journeys</li>
              <li>Unlimited versions</li>
              <li>No watermark</li>
              <li>Custom themes</li>
              <li>Additional features as described on the website</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">6.2 Payment Processing</h3>
            <p>
              All payments are handled by Stripe and are subject to Stripe's Terms of Service and Privacy Policy.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">6.3 Refund Policy</h3>
            <p>
              Refunds are granted in accordance with UK consumer law.
              We may approve refunds at our discretion in cases of:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Accidental duplicate purchase</li>
              <li>Major product issues</li>
              <li>Inability to access the Service</li>
            </ul>
            <p className="mt-4">
              To request a refund, contact{' '}
              <a href="mailto:contact@doddle.software" className="text-blue-600 hover:underline">
                contact@doddle.software
              </a>
              .
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">6.4 Price Changes</h3>
            <p>
              We reserve the right to change pricing for future users.
              Existing Lifetime Pro users keep their benefits permanently.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Data Protection & Privacy</h2>
            <p>
              Your use of the Service is also governed by our{' '}
              <a href="/privacy-policy" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
              .
              By using Loged.in, you consent to the collection and storage of data as described there.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Service Availability</h2>
            <p>We aim for high uptime but do not guarantee uninterrupted service.</p>
            <p className="mt-4">We may modify, suspend, or discontinue parts of the Service at any time for:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Maintenance</li>
              <li>Security</li>
              <li>Feature updates</li>
              <li>Legal requirements</li>
            </ul>
            <p className="mt-4">
              We are not liable for downtime or data loss, though we will make reasonable efforts to notify users of major changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Termination</h2>
            <p>We may suspend or terminate accounts that:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Violate these Terms</li>
              <li>Abuse the Service</li>
              <li>Upload harmful content</li>
              <li>Attempt to hack or misuse the platform</li>
            </ul>
            <p className="mt-4">
              You may delete your account at any time.
              Upon deletion:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>All journeys, logs, and photos are permanently removed</li>
              <li>Payment history required for legal compliance may be retained by Stripe</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Intellectual Property</h2>
            <p>
              The Loged.in website, codebase, branding, and design are owned by Doddle Software Limited.
            </p>
            <p className="mt-4">You agree not to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Copy the platform</li>
              <li>Reverse engineer or decompile the code</li>
              <li>Clone or resell the Service</li>
              <li>Remove branding or attribution without permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Disclaimers</h2>
            <p>
              The Service is provided "as is" with no warranties, express or implied.
            </p>
            <p className="mt-4">We do not guarantee:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Specific results from using the platform</li>
              <li>Perfect security (though we take reasonable measures)</li>
              <li>That public journeys will not be shared by others</li>
            </ul>
            <p className="mt-4">
              User content is the responsibility of the user.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">12. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Doddle Software Limited is not liable for:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Indirect or consequential damages</li>
              <li>Loss of data</li>
              <li>Loss of income or business</li>
              <li>Unauthorized access to your account</li>
              <li>Errors or interruptions in the Service</li>
            </ul>
            <p className="mt-4">
              Total liability is limited to the amount paid for the Lifetime Pro plan.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">13. Governing Law</h2>
            <p>These Terms are governed by the laws of:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>The United Kingdom</li>
              <li>Applicable UK and international regulations</li>
            </ul>
            <p className="mt-4">
              Any disputes shall be resolved under UK jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">14. Changes to These Terms</h2>
            <p>We may revise these Terms as needed.</p>
            <p className="mt-4">When updates occur, we will:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Update the "Last Updated" date</li>
              <li>Notify users of material changes</li>
            </ul>
            <p className="mt-4">
              Continued use of the Service means you accept the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">15. Contact</h2>
            <p>If you have questions about these Terms, contact us at:</p>
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

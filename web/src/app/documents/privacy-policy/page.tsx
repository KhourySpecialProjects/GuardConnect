export default function PrivacyPolicyPage() {
  return (
    <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-left px-6 py-16 sm:px-10 lg:px-16">
      <h1 className="text-3xl font-semibold text-secondary sm:text-4xl lg:text-3xl mb-1">
        Privacy Policy
      </h1>
      <p className="text-sm text-accent mb-8">Last Updated: March 10, 2026</p>

      <div className="max-w-lg space-y-8 text-secondary">
        <section>
          <h2 className="text-lg font-semibold mb-2">1. Overview</h2>
          <p className="text-sm">
            The Massachusetts National Guard is committed to protecting the privacy of its
            personnel. This policy describes how information is collected, used, and safeguarded
            within this application.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">2. Information Collected</h2>
          <p className="text-sm mb-2">This application may collect the following data:</p>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>
              <span className="font-medium">Account Information:</span> Name, rank, unit, and
              military email address.
            </li>
            <li>
              <span className="font-medium">Usage Data:</span> Login timestamps, message metadata,
              and device identifiers.
            </li>
            <li>
              <span className="font-medium">Communications Content:</span> Messages and files
              transmitted through the app for operational purposes.
            </li>
            <li>
              <span className="font-medium">Phone Number:</span> Used solely to deliver broadcast
              notifications sent by authorized senior personnel.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">3. How Information Is Used</h2>
          <p className="text-sm mb-2">Collected information is used exclusively to:</p>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>Facilitate official Guard communications.</li>
            <li>Maintain application security and audit trails.</li>
            <li>
              Send official broadcast notifications to personnel on behalf of authorized
              senior-ranking members.
            </li>
            <li>Ensure compliance with applicable military and state regulations.</li>
          </ul>
          <p className="text-sm mt-2 font-medium">
            Data is never sold or shared with third parties for commercial purposes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">4. Data Storage and Security</h2>
          <p className="text-sm">
            All data is stored on secured, access-controlled systems. Reasonable technical and
            administrative safeguards are in place to protect against unauthorized access,
            disclosure, or loss. Users should report any suspected security incidents to their IT
            administrator immediately.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">5. Data Retention</h2>
          <p className="text-sm">
            Data is retained in accordance with Massachusetts National Guard records management
            policies and applicable state and federal regulations. Inactive accounts may be purged
            after a defined retention period.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">6. Your Rights</h2>
          <p className="text-sm">
            Authorized users may request access to their account data or report concerns about data
            accuracy by contacting their unit administrator.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">7. Changes to This Policy</h2>
          <p className="text-sm">
            This Privacy Policy may be revised periodically. Users will be notified of material
            changes through the application or official channels.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">8. Contact</h2>
          <p className="text-sm">
            For privacy-related questions, contact your unit's communications officer or IT
            administrator.
          </p>
        </section>
      </div>
    </div>
  );
}

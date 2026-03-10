import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-left px-6 py-16 sm:px-10 lg:px-16">
      <h1 className="text-3xl font-semibold text-secondary sm:text-4xl lg:text-3xl mb-1">
        Terms and Conditions
      </h1>
      <p className="text-sm text-accent mb-8">Last Updated: March 10, 2026</p>

      <div className="max-w-lg space-y-8 text-secondary">
        <section>
          <h2 className="text-lg font-semibold mb-2">1. Acceptance of Terms</h2>
          <p className="text-sm">
            By accessing or using this application, you agree to be bound by these Terms and
            Conditions. Use is restricted to authorized Massachusetts National Guard personnel only.
            Unauthorized access is strictly prohibited.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">2. Authorized Use</h2>
          <p className="text-sm mb-2">
            This application is provided solely for official Massachusetts National Guard
            communications and operational purposes. Users must:
          </p>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>Use the app only for lawful, mission-related activities.</li>
            <li>
              Comply with all applicable federal, state, and military regulations, including OPSEC
              guidelines.
            </li>
            <li>
              Not share access credentials or allow unauthorized individuals to use their account.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">3. User Responsibilities</h2>
          <p className="text-sm">
            Users are responsible for all activity conducted under their account. Any misuse,
            unauthorized disclosure of information, or violation of military communications policy
            may result in revocation of access and disciplinary action in accordance with applicable
            regulations.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">4. SMS Notifications</h2>
          <p className="text-sm mb-3">
            <span className="font-medium">Program Name:</span> Massachusetts National Guard
            Communications App
          </p>
          <p className="text-sm mb-3">
            <span className="font-medium">Program Description:</span> By opting in to SMS
            notifications, you consent to receive official broadcast messages from authorized senior
            Massachusetts National Guard personnel. These messages may include operational updates,
            announcements, and other mission-related communications.
          </p>
          <p className="text-sm mb-3">
            <span className="font-medium">Message Frequency:</span> Message frequency varies based
            on operational needs. You may receive multiple messages per week during active periods.
          </p>
          <p className="text-sm mb-3">
            <span className="font-medium">Message & Data Rates:</span> Message and data rates may
            apply. Check with your mobile carrier for details.
          </p>
          <p className="text-sm mb-3">
            <span className="font-medium">Support:</span> For assistance, contact your unit's
            communications officer or IT administrator. You may also text{" "}
            <span className="font-bold">HELP</span> at any time to receive help information.
          </p>
          <p className="text-sm">
            <span className="font-medium">Opt-Out:</span> You can cancel SMS notifications at any
            time. Text <span className="font-bold">STOP</span> to unsubscribe. After sending{" "}
            <span className="font-bold">STOP</span>, you will receive a confirmation message and no
            further SMS messages will be sent to you. To re-subscribe, contact your unit
            administrator. For more details, see the{" "}
            <Link
              href="https://support.twilio.com/hc/en-us/articles/223134847-Industry-standards-for-US-Short-Code-Terms-of-Service"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline"
            >
              Twilio Support Article
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">5. Intellectual Property</h2>
          <p className="text-sm">
            All content, branding, and software associated with this application are the property of
            the Massachusetts National Guard or its authorized vendors. Unauthorized reproduction or
            distribution is prohibited.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">6. Disclaimer of Warranties</h2>
          <p className="text-sm">
            This application is provided "as is." The Massachusetts National Guard makes no
            guarantees regarding uptime, availability, or fitness for a particular purpose. It
            should not be used as the sole means of communication during critical operations.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">7. Modifications</h2>
          <p className="text-sm">
            These Terms may be updated at any time. Continued use of the application following any
            changes constitutes acceptance of the revised Terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">8. Contact</h2>
          <p className="text-sm">
            For questions or to report misuse, contact your unit's communications officer or IT
            administrator.
          </p>
        </section>
      </div>
    </div>
  );
}

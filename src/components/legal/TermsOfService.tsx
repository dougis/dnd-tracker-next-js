interface LegalSectionProps {
  title: string;
  children: React.ReactNode;
}

function LegalSection({ title, children }: LegalSectionProps) {
  return (
    <section className="mb-8">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function TermsHeader() {
  return (
    <>
      <h1>Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-8">
        <strong>Effective Date:</strong> January 1, 2025
      </p>
    </>
  );
}

function CoreTermsSections() {
  return (
    <>
      <LegalSection title="Acceptance of Terms">
        <p>
          By accessing and using the D&D Encounter Tracker service (&ldquo;Service&rdquo;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
        </p>
      </LegalSection>

      <LegalSection title="Service Description">
        <p>
          The D&D Encounter Tracker is a web-based application designed to help Dungeon Masters manage combat encounters for tabletop role-playing games. The Service provides tools for character management, encounter building, initiative tracking, and combat management.
        </p>
      </LegalSection>

      <LegalSection title="User Accounts">
        <p>
          To access certain features of the Service, you may be required to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
        </p>
      </LegalSection>

      <LegalSection title="Subscription Services">
        <p>
          The Service offers both free and paid subscription tiers. Paid subscriptions provide access to additional features and increased usage limits. Subscription fees are billed in advance and are non-refundable except as required by law.
        </p>
      </LegalSection>
    </>
  );
}

function UserContentAndPrivacySections() {
  return (
    <>
      <LegalSection title="User Content">
        <p>
          You retain ownership of any content you create or upload through the Service, including characters, encounters, and campaign data. You grant us a limited license to use, store, and display your content solely for the purpose of providing the Service to you.
        </p>
      </LegalSection>

      <LegalSection title="Privacy Policy">
        <p>
          Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices regarding the collection and use of your information.
        </p>
      </LegalSection>

      <LegalSection title="Prohibited Uses">
        <p>
          You may not use the Service for any unlawful purpose or to solicit others to perform unlawful acts. You may not violate any local, state, national, or international law or regulation.
        </p>
      </LegalSection>
    </>
  );
}

function LegalAndContactSections() {
  return (
    <>
      <LegalSection title="Limitation of Liability">
        <p>
          In no event shall D&D Encounter Tracker, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, punitive, special, or consequential damages arising out of or in connection with your use of the Service.
        </p>
      </LegalSection>

      <LegalSection title="Termination">
        <p>
          We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever including without limitation if you breach the Terms.
        </p>
      </LegalSection>

      <LegalSection title="Changes to Terms">
        <p>
          We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new Terms of Service on this page and updating the &ldquo;Effective Date&rdquo; at the top of this document.
        </p>
      </LegalSection>

      <LegalSection title="Contact Information">
        <p>
          If you have any questions about these Terms of Service, please contact us at:
        </p>
        <p>
          Email: support@dndtracker.com<br />
          Website: https://dndtracker.com
        </p>
      </LegalSection>
    </>
  );
}

export function TermsOfService() {
  return (
    <div className="prose prose-slate max-w-none">
      <TermsHeader />
      <CoreTermsSections />
      <UserContentAndPrivacySections />
      <LegalAndContactSections />
    </div>
  );
}
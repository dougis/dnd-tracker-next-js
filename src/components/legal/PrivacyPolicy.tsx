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

function PrivacyHeader() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">
        <strong>Effective Date:</strong> January 1, 2025
      </p>
    </>
  );
}

function DataCollectionSections() {
  return (
    <>
      <LegalSection title="Information We Collect">
        <p>
          We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This may include:
        </p>
        <ul>
          <li>Name and email address</li>
          <li>Account credentials and preferences</li>
          <li>Character data, encounters, and campaign information</li>
          <li>Communication with our support team</li>
        </ul>
      </LegalSection>

      <LegalSection title="How We Use Your Information">
        <p>
          We use the information we collect to:
        </p>
        <ul>
          <li>Provide, maintain, and improve our services</li>
          <li>Process transactions and manage your account</li>
          <li>Send you technical notices and support messages</li>
          <li>Respond to your comments and questions</li>
          <li>Analyze usage patterns to improve user experience</li>
        </ul>
      </LegalSection>
    </>
  );
}

function DataSharingAndSecuritySections() {
  return (
    <>
      <LegalSection title="Information Sharing">
        <p>
          We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
        </p>
        <ul>
          <li>With your consent</li>
          <li>To comply with legal obligations</li>
          <li>To protect our rights and prevent fraud</li>
          <li>In connection with a business transaction</li>
        </ul>
      </LegalSection>

      <LegalSection title="Data Security">
        <p>
          We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
        </p>
      </LegalSection>

      <LegalSection title="Data Retention">
        <p>
          We retain your personal information for as long as your account is active or as needed to provide you services. We will retain and use your information as necessary to comply with our legal obligations and resolve disputes.
        </p>
      </LegalSection>
    </>
  );
}

function UserRightsAndPolicySections() {
  return (
    <>
      <LegalSection title="Your Rights">
        <p>
          Depending on your location, you may have certain rights regarding your personal information, including:
        </p>
        <ul>
          <li>Right to access your personal information</li>
          <li>Right to correct or update your information</li>
          <li>Right to delete your information</li>
          <li>Right to restrict or object to processing</li>
          <li>Right to data portability</li>
        </ul>
      </LegalSection>

      <LegalSection title="Cookies and Tracking">
        <p>
          We use cookies and similar tracking technologies to improve your experience on our website. You can control cookie preferences through your browser settings, though some features may not function properly if cookies are disabled.
        </p>
      </LegalSection>

      <LegalSection title="Third-Party Services">
        <p>
          Our service may contain links to third-party websites or integrate with third-party services. We are not responsible for the privacy practices of these third parties and encourage you to review their privacy policies.
        </p>
      </LegalSection>
    </>
  );
}

function PolicyChangesAndContactSections() {
  return (
    <>
      <LegalSection title="Changes to Privacy Policy">
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the &ldquo;Effective Date&rdquo; at the top of this document.
        </p>
      </LegalSection>

      <LegalSection title="Contact Information">
        <p>
          If you have any questions about this Privacy Policy, please contact us at:
        </p>
        <p>
          Email: privacy@dndtracker.com<br />
          Website: https://dndtracker.com
        </p>
      </LegalSection>
    </>
  );
}

export function PrivacyPolicy() {
  return (
    <div className="prose prose-slate max-w-none">
      <PrivacyHeader />
      <DataCollectionSections />
      <DataSharingAndSecuritySections />
      <UserRightsAndPolicySections />
      <PolicyChangesAndContactSections />
    </div>
  );
}
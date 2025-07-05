interface LegalSectionProps {
  title: string;
  children: React.ReactNode;
}

export function LegalSection({ title, children }: LegalSectionProps) {
  return (
    <section className="mb-8">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

interface ContactSectionProps {
  email: string;
  website?: string;
  description?: string;
}

export function ContactSection({
  email,
  website = "https://dndtracker.com",
  description
}: ContactSectionProps) {
  return (
    <LegalSection title="Contact Information">
      <p>
        {description || "If you have any questions, please contact us at:"}
      </p>
      <p>
        Email: {email}<br />
        Website: {website}
      </p>
    </LegalSection>
  );
}
import React from 'react';
import EmailSupportCard from './contact/EmailSupportCard';
import LiveChatCard from './contact/LiveChatCard';
import CommunityResourcesCard from './contact/CommunityResourcesCard';
import PremiumSupportCard from './contact/PremiumSupportCard';
import SupportGuidelinesCard from './contact/SupportGuidelinesCard';

export default function ContactSupportSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Contact Support</h2>
        <p className="text-lg text-muted-foreground mb-6">
          Need additional help? Our support team and community are here to assist you with any questions or issues.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EmailSupportCard />
        <LiveChatCard />
      </div>

      <CommunityResourcesCard />
      <PremiumSupportCard />
      <SupportGuidelinesCard />
    </div>
  );
}
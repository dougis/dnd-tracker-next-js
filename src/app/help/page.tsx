import { Metadata } from 'next';
import HelpContent from './components/HelpContent';

export const metadata: Metadata = {
  title: 'Help & Support | D&D Encounter Tracker',
  description: 'Comprehensive help documentation, guides, and support for the D&D Encounter Tracker. Get started with character creation, encounter building, and combat tracking.',
  keywords: 'D&D, help, support, documentation, guides, tutorials, FAQ, troubleshooting',
};

export default function HelpPage() {
  return (
    <div className="container mx-auto py-8 px-4" data-testid="help-container">
      <HelpContent />
    </div>
  );
}
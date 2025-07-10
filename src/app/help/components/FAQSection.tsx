'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    id: 'add-character',
    question: 'How do I add a new character?',
    answer: 'To add a new character, navigate to the Characters page and click the "Create Character" button. Fill in the character details including name, race, class, level, and stats. You can also import characters from D&D Beyond using the import feature.',
    category: 'Characters'
  },
  {
    id: 'import-dnd-beyond',
    question: 'Can I import characters from D&D Beyond?',
    answer: 'Yes! Use the character import feature on the Characters page. You can paste a D&D Beyond character sheet URL or export data to automatically populate character information.',
    category: 'Characters'
  },
  {
    id: 'initiative-tracking',
    question: 'How does initiative tracking work?',
    answer: 'Initiative is automatically rolled for all participants when combat begins. The system handles dexterity tiebreakers and turn order. You can manually adjust initiative values if needed or re-roll for specific characters.',
    category: 'Combat'
  },
  {
    id: 'damage-healing',
    question: 'How do I apply damage and healing?',
    answer: 'Click on a character\'s HP value during combat to open the damage/healing dialog. You can apply damage, healing, or temporary HP. The system automatically calculates the new HP values and tracks unconscious/dead states.',
    category: 'Combat'
  },
  {
    id: 'multiclass-support',
    question: 'Does the tracker support multiclass characters?',
    answer: 'Yes! When creating or editing a character, you can add multiple classes with different levels. The system automatically calculates total character level, proficiency bonuses, and spell slots.',
    category: 'Characters'
  },
  {
    id: 'encounter-difficulty',
    question: 'How is encounter difficulty calculated?',
    answer: 'Encounter difficulty is calculated using the standard D&D 5e Challenge Rating system. The system considers party size, character levels, and creature CR values to determine if an encounter is Easy, Medium, Hard, or Deadly.',
    category: 'Encounters'
  },
  {
    id: 'save-encounters',
    question: 'Can I save encounters for later use?',
    answer: 'Absolutely! All encounters are automatically saved. You can create template encounters, duplicate existing ones, and organize them by campaign or location for easy reuse.',
    category: 'Encounters'
  },
  {
    id: 'offline-access',
    question: 'Can I use the tracker offline?',
    answer: 'The tracker requires an internet connection for full functionality. However, active combat sessions will continue to work if you temporarily lose connection, and data will sync when reconnected.',
    category: 'Technical'
  },
  {
    id: 'subscription-features',
    question: 'What features require a subscription?',
    answer: 'Free accounts include basic character and encounter management. Paid subscriptions unlock unlimited characters, advanced encounter features, campaign management, and priority support.',
    category: 'Subscription'
  },
  {
    id: 'data-backup',
    question: 'How do I backup my data?',
    answer: 'Your data is automatically backed up to the cloud. You can also export individual characters or entire campaigns from the settings page for local backup.',
    category: 'Technical'
  }
];

export default function FAQSection() {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(faqData.map(item => item.category)))];

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const filteredFAQ = selectedCategory === 'All'
    ? faqData
    : faqData.filter(item => item.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
        <p className="text-lg text-muted-foreground mb-6">
          Find quick answers to common questions about using the D&D Encounter Tracker.
        </p>
      </div>

      {/* Category Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Browse by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* FAQ Items */}
      <div className="space-y-3">
        {filteredFAQ.map(item => (
          <Card key={item.id}>
            <CardHeader className="pb-3">
              <Button
                variant="ghost"
                className="flex items-center justify-between w-full h-auto p-0 text-left"
                onClick={() => toggleExpanded(item.id)}
                role="button"
                aria-expanded={expandedItems.includes(item.id)}
              >
                <CardTitle className="text-base font-semibold">
                  {item.question}
                </CardTitle>
                {expandedItems.includes(item.id) ? (
                  <ChevronDown className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 flex-shrink-0" />
                )}
              </Button>
            </CardHeader>
            {expandedItems.includes(item.id) && (
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.answer}
                </p>
                <div className="mt-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground">
                    {item.category}
                  </span>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {filteredFAQ.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              No FAQ items found for the selected category.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Still Have Questions?</CardTitle>
          <CardDescription>
            Can&apos;t find what you&apos;re looking for? We&apos;re here to help!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            If you have a question that isn&apos;t covered in our FAQ, please don&apos;t hesitate to reach out to our support team.
          </p>
          <Button variant="outline">
            Contact Support
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
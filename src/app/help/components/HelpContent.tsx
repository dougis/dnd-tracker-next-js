'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import GettingStartedSection from './GettingStartedSection';
import UserGuidesSection from './UserGuidesSection';
import FAQSection from './FAQSection';
import FeaturesSection from './FeaturesSection';
import TroubleshootingSection from './TroubleshootingSection';
import ContactSupportSection from './ContactSupportSection';
import SearchResults from './SearchResults';

export default function HelpContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('getting-started');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <Card data-testid="help-main-card">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">Help & Support</CardTitle>
        <CardDescription>
          D&D Encounter Tracker Documentation - Your comprehensive guide to using the D&D Encounter Tracker for managing characters, encounters, and combat sessions.
        </CardDescription>

        {/* Search Section */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search help topics..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10"
            aria-label="Search help topics"
          />
        </div>
      </CardHeader>

      <CardContent>
        {searchQuery ? (
          <SearchResults query={searchQuery} onClearSearch={clearSearch} />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 md:grid-cols-6 gap-2">
              <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
              <TabsTrigger value="user-guides">User Guides</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
              <TabsTrigger value="contact-support">Contact Support</TabsTrigger>
            </TabsList>

            <div className="mt-6" data-testid="help-content">
              <div className="prose prose-slate max-w-none">
                <TabsContent value="getting-started">
                  <GettingStartedSection />
                </TabsContent>

                <TabsContent value="user-guides">
                  <UserGuidesSection />
                </TabsContent>

                <TabsContent value="faq">
                  <FAQSection />
                </TabsContent>

                <TabsContent value="features">
                  <FeaturesSection />
                </TabsContent>

                <TabsContent value="troubleshooting">
                  <TroubleshootingSection />
                </TabsContent>

                <TabsContent value="contact-support">
                  <ContactSupportSection />
                </TabsContent>
              </div>
            </div>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';
import PremiumBenefitItem from './premium/PremiumBenefitItem';

export default function PremiumSupportCard() {
  const benefits = [
    {
      title: "Priority Queue",
      description: "Your support tickets get priority handling with faster response times.",
      tier: "Expert & Above"
    },
    {
      title: "Live Chat Access",
      description: "Access to live chat support during business hours for immediate help.",
      tier: "Expert & Above"
    },
    {
      title: "Phone Support",
      description: "Direct phone support for complex issues and detailed troubleshooting.",
      tier: "Guild Master"
    },
    {
      title: "Screen Sharing",
      description: "One-on-one screen sharing sessions for complex setup and configuration.",
      tier: "Guild Master"
    },
    {
      title: "Dedicated Support",
      description: "Assigned support representative who knows your setup and history.",
      tier: "Guild Master"
    },
    {
      title: "Feature Requests",
      description: "Direct input on new features and priority consideration for your requests.",
      tier: "All Paid Tiers"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Premium Support Benefits
        </CardTitle>
        <CardDescription>
          Enhanced support features for paid subscribers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {benefits.map((benefit, index) => (
            <PremiumBenefitItem key={index} {...benefit} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
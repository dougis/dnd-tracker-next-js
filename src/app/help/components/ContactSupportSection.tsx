import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, MessageSquare, Github, Users, Clock, Shield, Zap } from 'lucide-react';

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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-500" />
              Email Support
            </CardTitle>
            <CardDescription>
              Direct email support for technical issues and questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm mb-2">
                  <strong>General Support:</strong> support@dndtracker.com
                </p>
                <p className="text-sm mb-2">
                  <strong>Technical Issues:</strong> tech@dndtracker.com
                </p>
                <p className="text-sm mb-4">
                  <strong>Billing Questions:</strong> billing@dndtracker.com
                </p>
              </div>

              <div className="border rounded-lg p-3">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Response Time
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Free tier: 24-48 hours</li>
                  <li>• Paid subscribers: 12-24 hours</li>
                  <li>• Premium support: 4-8 hours</li>
                  <li>• Critical issues: 1-4 hours</li>
                </ul>
              </div>

              <Button className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-500" />
              Live Chat
            </CardTitle>
            <CardDescription>
              Real-time chat support for immediate assistance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Chat with our support team for quick answers to common questions and urgent issues.
                </p>
              </div>

              <div className="border rounded-lg p-3">
                <h4 className="font-semibold text-sm mb-2">Availability</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Monday - Friday: 9 AM - 6 PM EST</li>
                  <li>• Saturday: 10 AM - 4 PM EST</li>
                  <li>• Sunday: Closed</li>
                  <li>• Premium: Extended hours available</li>
                </ul>
              </div>

              <div className="flex flex-col gap-2">
                <Button variant="outline" className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start Live Chat
                </Button>
                <Badge variant="secondary" className="text-center">
                  Available for paid subscribers
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-500" />
            Community Resources
          </CardTitle>
          <CardDescription>
            Connect with other D&D Encounter Tracker users and get community support
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="h-5 w-5 text-indigo-500" />
                  <h4 className="font-semibold">Discord Server</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Join our community Discord for real-time discussions, tips, and peer support.
                </p>
                <Link href="https://discord.gg/dndtracker" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    Join Discord Server
                  </Button>
                </Link>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Github className="h-5 w-5 text-gray-700" />
                  <h4 className="font-semibold">GitHub Discussions</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Participate in feature discussions, report bugs, and contribute to development.
                </p>
                <Link href="https://github.com/dndtracker/discussions" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    GitHub Discussions
                  </Button>
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-5 w-5 text-orange-500" />
                  <h4 className="font-semibold">Community Forums</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Browse existing discussions, ask questions, and share your experiences.
                </p>
                <Link href="/community" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    Visit Forums
                  </Button>
                </Link>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <h4 className="font-semibold">Knowledge Base</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Search our comprehensive knowledge base for detailed guides and solutions.
                </p>
                <Link href="/kb" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    Browse Knowledge Base
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-2">Priority Queue</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Your support tickets get priority handling with faster response times.
              </p>
              <Badge variant="secondary">Expert & Above</Badge>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-2">Live Chat Access</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Access to live chat support during business hours for immediate help.
              </p>
              <Badge variant="secondary">Expert & Above</Badge>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-2">Phone Support</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Direct phone support for complex issues and detailed troubleshooting.
              </p>
              <Badge variant="secondary">Guild Master</Badge>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-2">Screen Sharing</h4>
              <p className="text-xs text-muted-foreground mb-3">
                One-on-one screen sharing sessions for complex setup and configuration.
              </p>
              <Badge variant="secondary">Guild Master</Badge>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-2">Dedicated Support</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Assigned support representative who knows your setup and history.
              </p>
              <Badge variant="secondary">Guild Master</Badge>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-2">Feature Requests</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Direct input on new features and priority consideration for your requests.
              </p>
              <Badge variant="secondary">All Paid Tiers</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Before Contacting Support</CardTitle>
          <CardDescription>
            Help us help you by providing the right information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Information to Include</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Detailed description of the issue</li>
                <li>• Steps to reproduce the problem</li>
                <li>• Your browser and operating system</li>
                <li>• Account email and subscription tier</li>
                <li>• Screenshots or error messages</li>
                <li>• Any recent changes or actions taken</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-2">Response Expectations</h4>
              <p className="text-sm text-muted-foreground">
                We strive to provide helpful, timely responses to all support requests.
                Response times vary based on your subscription tier and the complexity of the issue.
                For urgent matters affecting paid subscribers, we offer expedited support channels.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
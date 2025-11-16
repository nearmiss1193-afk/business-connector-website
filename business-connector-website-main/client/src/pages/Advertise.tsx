import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Check, TrendingUp, Users, Target, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function Advertise() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    message: '',
    interestedPackage: '' as 'starter' | 'professional' | 'premium' | 'custom' | '',
    budget: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const submitInquiry = trpc.agentAds.submitInquiry.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success('Thank you! We will contact you shortly.');
    },
    onError: () => {
      toast.error('Failed to submit inquiry. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    submitInquiry.mutate({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      companyName: formData.companyName || undefined,
      message: formData.message || undefined,
      interestedPackage: formData.interestedPackage || undefined,
      budget: formData.budget || undefined,
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle>Thank You!</CardTitle>
            <CardDescription>
              We've received your inquiry and will contact you within 24 hours to discuss how we can help you reach more buyers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => (window.location.href = '/')} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <a href="/" className="text-2xl font-bold text-blue-600">
            Central Florida Homes
          </a>
        </div>
      </div>

      {/* Hero */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Advertise Your Services to Active Home Buyers
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Reach thousands of qualified buyers actively searching for homes in Central Florida
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-left">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="font-bold text-2xl text-gray-900">56,000+</div>
                <div className="text-sm text-gray-600">Active Listings</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="font-bold text-2xl text-gray-900">10,000+</div>
                <div className="text-sm text-gray-600">Monthly Visitors</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="font-bold text-2xl text-gray-900">95%</div>
                <div className="text-sm text-gray-600">Qualified Buyers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Packages */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-2 hover:border-blue-500 transition-colors">
            <CardHeader>
              <CardTitle>Starter</CardTitle>
              <CardDescription>Perfect for new agents</CardDescription>
              <div className="text-3xl font-bold text-gray-900 mt-4">$397<span className="text-lg font-normal text-gray-600">/mo</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Sidebar banner placement</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Up to 5,000 impressions/month</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Basic analytics dashboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Email support</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-500 shadow-lg relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </span>
            </div>
            <CardHeader>
              <CardTitle>Professional</CardTitle>
              <CardDescription>Best for growing teams</CardDescription>
              <div className="text-3xl font-bold text-gray-900 mt-4">$594<span className="text-lg font-normal text-gray-600">/mo</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>All Starter features</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Property detail page placement</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Up to 15,000 impressions/month</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Advanced analytics & reporting</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Priority support</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-blue-500 transition-colors">
            <CardHeader>
              <CardTitle>Premium</CardTitle>
              <CardDescription>Maximum exposure</CardDescription>
              <div className="text-3xl font-bold text-gray-900 mt-4">$891<span className="text-lg font-normal text-gray-600">/mo</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>All Professional features</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>All placement locations</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Unlimited impressions</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Featured agent profile page</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Dedicated account manager</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Get Started Today</CardTitle>
            <CardDescription>
              Fill out the form below and we'll contact you within 24 hours to discuss your advertising needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="package">Interested Package</Label>
                  <Select
                    value={formData.interestedPackage}
                    onValueChange={(value: any) => setFormData({ ...formData, interestedPackage: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a package" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter">Starter - $397/mo</SelectItem>
                      <SelectItem value="professional">Professional - $594/mo</SelectItem>
                      <SelectItem value="premium">Premium - $891/mo</SelectItem>
                      <SelectItem value="custom">Custom Solution</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Monthly Budget</Label>
                  <Input
                    id="budget"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="e.g., $500-1000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your advertising goals..."
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={submitInquiry.isPending}>
                {submitInquiry.isPending ? 'Submitting...' : 'Get Started'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              {/* TCPA/SMS Compliance Disclosure */}
              <div className="text-xs text-gray-500 text-center space-y-2 border-t pt-4 mt-4">
                <p>
                  By submitting this form, you expressly consent to receive communications from Business Conector 
                  via telephone calls (including autodialed and pre-recorded calls), text messages (SMS/MMS), and email 
                  regarding advertising packages, platform features, and related services.
                </p>
                <p>
                  <strong>Message frequency varies. Message and data rates may apply. Text STOP to opt out or HELP for assistance.</strong>
                </p>
                <p>
                  Your consent is not required as a condition of purchasing any advertising service. 
                  View our{' '}
                  <a href="/terms-of-service" target="_blank" className="text-blue-600 hover:underline">
                    Terms of Service
                  </a>
                  {' '}and{' '}
                  <a href="/privacy-policy" target="_blank" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

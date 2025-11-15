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
import { Check, Phone, Mail, MapPin, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
    interestedIn: '' as 'agent' | 'buyer' | 'seller' | 'investor' | 'other' | '',
  });

  const [submitted, setSubmitted] = useState(false);

  const submitLead = trpc.leads.submitForm.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success('Thank you! We will contact you shortly.');
    },
    onError: (error) => {
      toast.error('Failed to submit. Please try again.');
      console.error('Lead submission error:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    submitLead.mutate({
      firstName: formData.firstName,
      lastName: formData.lastName || undefined,
      email: formData.email,
      phone: formData.phone,
      leadType: formData.interestedIn || 'other',
      message: formData.message || undefined,
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
              We've received your inquiry and will contact you within 24 hours to help you with your real estate needs.
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
      <div className="bg-blue-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
          <p className="text-xl text-blue-100">
            Have questions? We're here to help. Contact us today and let's find your perfect property.
          </p>
        </div>
      </div>

      {/* Contact Section */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Contact Info Cards */}
          <Card>
            <CardHeader>
              <Phone className="w-8 h-8 text-blue-600 mb-2" />
              <CardTitle className="text-lg">Phone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Call us during business hours</p>
              <p className="text-lg font-semibold text-blue-600 mt-2">(407) 555-0123</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Mail className="w-8 h-8 text-blue-600 mb-2" />
              <CardTitle className="text-lg">Email</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Send us an email</p>
              <p className="text-lg font-semibold text-blue-600 mt-2">info@businessconnector.com</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <MapPin className="w-8 h-8 text-blue-600 mb-2" />
              <CardTitle className="text-lg">Location</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Visit us in Central Florida</p>
              <p className="text-sm font-semibold text-blue-600 mt-2">Orlando, FL 32801</p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Send us a Message</CardTitle>
            <CardDescription>
              Fill out the form below and we'll get back to you as soon as possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="(555) 123-4567"
                  required
                />
              </div>

              <div>
                <Label htmlFor="interestedIn">What are you interested in?</Label>
                <Select
                  value={formData.interestedIn}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      interestedIn: value as 'buying' | 'selling' | 'renting' | 'agent' | '',
                    })
                  }
                >
                  <SelectTrigger id="interestedIn">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent">Find an Agent</SelectItem>
                    <SelectItem value="buyer">I'm a Buyer</SelectItem>
                    <SelectItem value="seller">I'm a Seller</SelectItem>
                    <SelectItem value="investor">I'm an Investor</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Tell us how we can help you..."
                  rows={4}
                />
              </div>

              {/* TCPA Compliance Disclosure */}
              <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 space-y-2">
                <p>
                  <strong>Consent to Contact:</strong> By submitting this form, you consent to receive calls, texts, and emails from Business Connector and its partners. Message frequency varies. Message and data rates may apply. Text STOP to opt out or HELP for assistance.
                </p>
                <p>
                  By clicking "Send Message," you agree to our{' '}
                  <a href="/terms-of-service" className="text-blue-600 hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy-policy" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </a>.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={submitLead.isPending}
              >
                {submitLead.isPending ? 'Sending...' : 'Send Message'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

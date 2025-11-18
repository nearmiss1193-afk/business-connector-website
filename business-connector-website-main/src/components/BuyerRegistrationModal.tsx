/**
 * Buyer Registration Modal
 * Triggered after user views 3 properties
 * Captures buyer information and sends to GoHighLevel buyer pipeline
 */

import { useState } from 'react';
import { X, Home, DollarSign, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface BuyerRegistrationModalProps {
  open: boolean;
  onClose: () => void;
  propertyAddress?: string;
  propertyPrice?: string;
  propertyId?: string;
}

export default function BuyerRegistrationModal({
  open,
  onClose,
  propertyAddress,
  propertyPrice,
  propertyId,
}: BuyerRegistrationModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState('');
  const [preapproved, setPreapproved] = useState('');

  const submitLead = trpc.leads.submitForm.useMutation({
    onSuccess: () => {
      toast.success('Registration successful! Continue browsing properties.');
      localStorage.setItem('userRegistered', 'true');
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || 'Registration failed. Please try again.');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName || !lastName || !email || !phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    await submitLead.mutateAsync({
      firstName,
      lastName,
      email,
      phone,
      source: window.location.hostname,
      propertyAddress,
      propertyPrice,
      propertyId,
      budget,
      timeline,
      preapproved,
      city: 'Central Florida',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            🏠 Register to Continue Viewing Properties
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Get instant access to all property details, photos, and virtual tours
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                First Name *
              </label>
              <Input
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Last Name *
              </label>
              <Input
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Email *
            </label>
            <Input
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Phone *
            </label>
            <Input
              type="tel"
              placeholder="(813) 555-1234"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          {/* Budget */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Budget Range
            </label>
            <Select value={budget} onValueChange={setBudget}>
              <SelectTrigger>
                <SelectValue placeholder="Select your budget" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="under-200k">Under $200,000</SelectItem>
                <SelectItem value="200k-300k">$200,000 - $300,000</SelectItem>
                <SelectItem value="300k-400k">$300,000 - $400,000</SelectItem>
                <SelectItem value="400k-500k">$400,000 - $500,000</SelectItem>
                <SelectItem value="500k-750k">$500,000 - $750,000</SelectItem>
                <SelectItem value="750k-1m">$750,000 - $1,000,000</SelectItem>
                <SelectItem value="over-1m">Over $1,000,000</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Timeline */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              When are you looking to buy?
            </label>
            <Select value={timeline} onValueChange={setTimeline}>
              <SelectTrigger>
                <SelectValue placeholder="Select timeline" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asap">ASAP (0-30 days)</SelectItem>
                <SelectItem value="1-3-months">1-3 months</SelectItem>
                <SelectItem value="3-6-months">3-6 months</SelectItem>
                <SelectItem value="6-12-months">6-12 months</SelectItem>
                <SelectItem value="just-looking">Just browsing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pre-approval Status */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-2">
              <Home className="h-4 w-4" />
              Are you pre-approved for a mortgage?
            </label>
            <Select value={preapproved} onValueChange={setPreapproved}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes, I'm pre-approved</SelectItem>
                <SelectItem value="in-progress">In progress</SelectItem>
                <SelectItem value="no">Not yet</SelectItem>
                <SelectItem value="cash-buyer">Cash buyer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={submitLead.isPending}
          >
            {submitLead.isPending ? 'Registering...' : 'Register & Continue Browsing'}
          </Button>

          {/* TCPA/SMS Compliance Disclosure */}
          <div className="text-xs text-gray-500 text-center space-y-2 border-t pt-4">
            <p>
              By submitting this form, you expressly consent to receive communications from Central Florida Homes 
              and affiliated real estate professionals via telephone calls (including autodialed and pre-recorded calls), 
              text messages (SMS/MMS), and email regarding property listings, market updates, and related services.
            </p>
            <p>
              <strong>Message frequency varies. Message and data rates may apply. Text STOP to opt out or HELP for assistance.</strong>
            </p>
            <p>
              Your consent is not required as a condition of purchasing any property or service. 
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
      </DialogContent>
    </Dialog>
  );
}

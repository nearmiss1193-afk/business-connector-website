import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import PaymentBreakdown from './PaymentBreakdown';

interface MortgageLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mortgageData: {
    homePrice: string;
    downPayment: string;
    interestRate: string;
    loanTerm: string;
    monthlyPayment: number;
  };
}

export default function MortgageLeadModal({ open, onOpenChange, mortgageData }: MortgageLeadModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submitLead = trpc.mortgageLeads.submitMortgageLead.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success('Pre-approval request submitted successfully!');
      setTimeout(() => {
        onOpenChange(false);
        setSubmitted(false);
        setName('');
        setEmail('');
        setPhone('');
      }, 2000);
    },
    onError: (error) => {
      toast.error('Failed to submit request. Please try again.');
      console.error('Mortgage lead submission error:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !phone) {
      toast.error('Please fill in all fields');
      return;
    }

    submitLead.mutate({
      name,
      email,
      phone,
      homePrice: mortgageData.homePrice,
      downPayment: mortgageData.downPayment,
      interestRate: mortgageData.interestRate,
      loanTerm: mortgageData.loanTerm,
      monthlyPayment: mortgageData.monthlyPayment.toString(),
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {!submitted ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Get Pre-Approved</DialogTitle>
              <DialogDescription>
                Connect with our mortgage specialists to get pre-approved for your dream home.
              </DialogDescription>
            </DialogHeader>

            {/* Mortgage Summary */}
            <div className="bg-blue-50 rounded-lg p-4 my-4">
              <div className="text-sm text-gray-600 mb-1">Your Estimated Monthly Payment</div>
              <div className="text-3xl font-bold text-blue-600">
                {formatCurrency(mortgageData.monthlyPayment)}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Home Price: {formatCurrency(parseFloat(mortgageData.homePrice))} • 
                Down: {formatCurrency(parseFloat(mortgageData.downPayment))} • 
                Rate: {mortgageData.interestRate}%
              </div>
            </div>

            {/* Payment Breakdown Component */}
            <PaymentBreakdown
              homePrice={parseFloat(mortgageData.homePrice)}
              downPayment={parseFloat(mortgageData.downPayment)}
              interestRate={parseFloat(mortgageData.interestRate)}
              loanTerm={parseInt(mortgageData.loanTerm)}
              propertyTaxRate={0.012}
              insuranceMonthly={150}
              hoaMonthly={0}
            />

            {/* Lead Form */}
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                disabled={submitLead.isPending}
              >
                {submitLead.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Get Pre-Approved Now'
                )}
              </Button>

              {/* TCPA/SMS Compliance Disclosure */}
              <div className="text-xs text-gray-500 text-center space-y-2 border-t pt-4">
                <p>
                  By submitting this form, you expressly consent to receive communications from Business Conector 
                  and affiliated mortgage lenders via telephone calls (including autodialed and pre-recorded calls), 
                  text messages (SMS/MMS), and email regarding mortgage pre-approval, loan options, and related services.
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
          </>
        ) : (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h3>
            <p className="text-gray-600">
              Our mortgage specialist will contact you within 24 hours to help you get pre-approved.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

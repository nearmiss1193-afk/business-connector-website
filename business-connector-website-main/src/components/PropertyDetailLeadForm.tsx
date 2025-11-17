import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Phone, Mail, MessageSquare, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PropertyDetailLeadFormProps {
  propertyId: number;
  propertyAddress: string;
  propertyPrice: string;
  propertyBeds: number;
  propertyBaths: number;
  propertySqft: number;
  city: string;
}

export default function PropertyDetailLeadForm({
  propertyId,
  propertyAddress,
  propertyPrice,
  propertyBeds,
  propertyBaths,
  propertySqft,
  city,
}: PropertyDetailLeadFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
    agreeToContact: true,
    agreeToTerms: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const submitMutation = trpc.leads.submitForm.useMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    if (!formData.phone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    if (!formData.agreeToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const result = await submitMutation.mutateAsync({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        source: 'property-detail-page',
        
        // Property-specific fields
        propertyAddress,
        propertyPrice,
        propertyId: propertyId.toString(),
        propertyBeds: propertyBeds.toString(),
        propertyBaths: propertyBaths.toString(),
        propertySqft: propertySqft.toString(),
        city,
        
        // Message
        message: formData.message || `Interested in property at ${propertyAddress}`,
      });

      setSubmitStatus('success');
      toast.success('Your inquiry has been sent! We\'ll contact you soon.');
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        message: '',
        agreeToContact: true,
        agreeToTerms: false,
      });

      // Reset success message after 3 seconds
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } catch (error: any) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
      toast.error(error.message || 'Failed to submit inquiry. Please try again.');
      
      // Reset error message after 3 seconds
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card id="contact" className="p-6 sticky top-24">
      <h3 className="text-xl font-bold mb-4">Request Information</h3>
      
      {submitStatus === 'success' && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-900">Success!</p>
            <p className="text-sm text-green-800">Your inquiry has been sent to our team.</p>
          </div>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900">Error</p>
            <p className="text-sm text-red-800">Failed to submit your inquiry. Please try again.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="John"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Doe"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="john@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting}
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="(555) 123-4567"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting}
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            placeholder="Tell us more about your interest in this property..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={isSubmitting}
          />
        </div>

        {/* Checkboxes */}
        <div className="space-y-2">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="agreeToContact"
              checked={formData.agreeToContact}
              onChange={handleInputChange}
              className="mt-1 w-4 h-4 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
            <span className="text-sm text-gray-700">
              I agree to be contacted about this property
            </span>
          </label>

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleInputChange}
              className="mt-1 w-4 h-4 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
            <span className="text-sm text-gray-700">
              I agree to the{' '}
              <a href="/terms-of-service" className="text-blue-600 hover:underline" target="_blank">
                terms of service
              </a>{' '}
              and{' '}
              <a href="/privacy-policy" className="text-blue-600 hover:underline" target="_blank">
                privacy policy
              </a>
              . Message frequency varies. Message and data rates may apply. Text STOP to opt out or
              HELP for assistance.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full gap-2"
          disabled={isSubmitting || submitStatus === 'success'}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : submitStatus === 'success' ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Sent!
            </>
          ) : (
            <>
              <MessageSquare className="w-4 h-4" />
              Request Information
            </>
          )}
        </Button>

        {/* Quick Contact Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() => {
              const phone = '+1-555-123-4567';
              window.location.href = `tel:${phone}`;
            }}
            disabled={isSubmitting}
          >
            <Phone className="w-4 h-4" />
            Call
          </Button>
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() => {
              const email = 'info@centralfloridahomes.com';
              window.location.href = `mailto:${email}?subject=Interest in ${propertyAddress}`;
            }}
            disabled={isSubmitting}
          >
            <Mail className="w-4 h-4" />
            Email
          </Button>
        </div>

        {/* Schedule Tour Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={isSubmitting}
        >
          Schedule a Tour
        </Button>
      </form>

      {/* TCPA Compliance Notice */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          By submitting this form, you agree to receive communications from our team. We respect your privacy and will never share your information.
        </p>
      </div>
    </Card>
  );
}

import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function GetPreApproved() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    creditScore: '',
    downPayment: '',
    loanAmount: '',
    propertyType: '',
    timeframe: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submitLead = trpc.leads.submitPreApprovalForm.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success('Pre-approval request submitted! We\'ll contact you soon.');
      setTimeout(() => {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          creditScore: '',
          downPayment: '',
          loanAmount: '',
          propertyType: '',
          timeframe: '',
          message: '',
        });
        setSubmitted(false);
      }, 3000);
    },
    onError: (error) => {
      toast.error('Failed to submit form. Please try again.');
      console.error('Form submission error:', error);
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.creditScore) newErrors.creditScore = 'Credit score is required';
    if (!formData.downPayment) newErrors.downPayment = 'Down payment is required';
    if (!formData.timeframe) newErrors.timeframe = 'Timeframe is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    submitLead.mutate({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      creditScore: parseInt(formData.creditScore),
      downPayment: parseInt(formData.downPayment),
      loanAmount: formData.loanAmount ? parseInt(formData.loanAmount) : undefined,
      propertyType: formData.propertyType || undefined,
      timeframe: formData.timeframe,
      message: formData.message || undefined,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
            <p className="text-gray-600 mb-4">
              Your pre-approval request has been submitted. Our team will contact you within 24 hours.
            </p>
            <p className="text-sm text-gray-500">
              Check your email for confirmation details.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Get Pre-Approved Today
          </h1>
          <p className="text-lg text-gray-600">
            Find out how much you can borrow in just a few minutes
          </p>
        </div>

        {/* Form Card */}
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle>Pre-Approval Application</CardTitle>
            <CardDescription className="text-blue-100">
              Quick and easy mortgage pre-approval process
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <Input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="John"
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <Input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                      className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone *
                    </label>
                    <Input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(555) 123-4567"
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Credit Score *
                    </label>
                    <Select value={formData.creditScore} onValueChange={(value) => handleSelectChange('creditScore', value)}>
                      <SelectTrigger className={errors.creditScore ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select credit score range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="300">300 - 579 (Poor)</SelectItem>
                        <SelectItem value="580">580 - 669 (Fair)</SelectItem>
                        <SelectItem value="670">670 - 739 (Good)</SelectItem>
                        <SelectItem value="740">740 - 799 (Very Good)</SelectItem>
                        <SelectItem value="800">800+ (Excellent)</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.creditScore && (
                      <p className="text-red-500 text-sm mt-1">{errors.creditScore}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Down Payment ($) *
                    </label>
                    <Input
                      name="downPayment"
                      type="number"
                      value={formData.downPayment}
                      onChange={handleChange}
                      placeholder="50000"
                      className={errors.downPayment ? 'border-red-500' : ''}
                    />
                    {errors.downPayment && (
                      <p className="text-red-500 text-sm mt-1">{errors.downPayment}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Desired Loan Amount ($)
                    </label>
                    <Input
                      name="loanAmount"
                      type="number"
                      value={formData.loanAmount}
                      onChange={handleChange}
                      placeholder="300000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Property Type
                    </label>
                    <Select value={formData.propertyType} onValueChange={(value) => handleSelectChange('propertyType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single_family">Single Family Home</SelectItem>
                        <SelectItem value="condo">Condo</SelectItem>
                        <SelectItem value="townhouse">Townhouse</SelectItem>
                        <SelectItem value="multi_family">Multi-Family</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    When are you looking to buy? *
                  </label>
                  <Select value={formData.timeframe} onValueChange={(value) => handleSelectChange('timeframe', value)}>
                    <SelectTrigger className={errors.timeframe ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediately (0-1 months)</SelectItem>
                      <SelectItem value="soon">Soon (1-3 months)</SelectItem>
                      <SelectItem value="moderate">Moderate (3-6 months)</SelectItem>
                      <SelectItem value="flexible">Flexible (6+ months)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.timeframe && (
                    <p className="text-red-500 text-sm mt-1">{errors.timeframe}</p>
                  )}
                </div>
              </div>

              {/* Additional Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Information
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us anything else we should know..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={submitLead.isPending}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 text-lg font-semibold"
              >
                {submitLead.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Get Pre-Approved'
                )}
              </Button>

              {/* Disclaimer */}
              <p className="text-xs text-gray-500 text-center">
                By submitting this form, you agree to our terms of service and privacy policy.
                We'll never share your information without your consent.
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Trust Badges */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-2xl font-bold text-blue-600">100%</div>
            <p className="text-sm text-gray-600">Secure & Private</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-2xl font-bold text-blue-600">24hrs</div>
            <p className="text-sm text-gray-600">Quick Response</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-2xl font-bold text-blue-600">10K+</div>
            <p className="text-sm text-gray-600">Happy Customers</p>
          </div>
        </div>
      </div>
    </div>
  );
}

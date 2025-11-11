/**
 * Zestimates Page
 * Home value estimation tool and information
 */

import { useState } from 'react';
import { Search, TrendingUp, Home, DollarSign, MapPin, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Footer from '@/components/Footer';
import TopNavigation from '@/components/TopNavigation';

export default function Zestimates() {
  const [address, setAddress] = useState('');

  const features = [
    {
      icon: <TrendingUp className="w-8 h-8 text-blue-600" />,
      title: 'Market Trends Analysis',
      description: 'Our estimates incorporate recent sales data, market trends, and neighborhood dynamics to provide accurate valuations.',
    },
    {
      icon: <Home className="w-8 h-8 text-blue-600" />,
      title: 'Property Details',
      description: 'We analyze property characteristics including size, age, condition, and unique features to refine our estimates.',
    },
    {
      icon: <MapPin className="w-8 h-8 text-blue-600" />,
      title: 'Location Intelligence',
      description: 'Location-specific factors like schools, amenities, and neighborhood quality are factored into every estimate.',
    },
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Enter Your Address',
      description: 'Simply type in your property address to get started.',
    },
    {
      step: '2',
      title: 'We Analyze the Data',
      description: 'Our algorithm processes millions of data points including recent sales, tax assessments, and market trends.',
    },
    {
      step: '3',
      title: 'Get Your Estimate',
      description: 'Receive an instant home value estimate with a confidence score and comparable properties.',
    },
    {
      step: '4',
      title: 'Track Over Time',
      description: 'Monitor your home\'s value changes and receive updates when market conditions shift.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white py-20">
        <div className="container max-w-4xl">
          <h1 className="text-5xl font-bold text-center mb-6">
            What's Your Home Worth?
          </h1>
          <p className="text-xl text-center mb-8 opacity-90">
            Get an instant home value estimate powered by advanced data analytics
          </p>

          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow-2xl p-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Enter your address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="pl-12 pr-4 py-6 text-lg border-2 border-gray-200 focus:border-blue-500"
                />
              </div>
              <Button size="lg" className="px-8 py-6 text-lg bg-blue-600 hover:bg-blue-700">
                <Search className="w-5 h-5 mr-2" />
                Get Estimate
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">
              Free, instant home value estimates for over 100 million properties nationwide
            </p>
          </div>
        </div>
      </div>

      {/* What is a Zestimate */}
      <div className="container py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-6">
            What is a Home Value Estimate?
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            Our home value estimates are calculated using a proprietary algorithm that analyzes millions of data points to provide you with the most accurate valuation possible.
          </p>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white py-16">
        <div className="container max-w-5xl">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">
            How It Works
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Accuracy Section */}
      <div className="container py-16">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-12">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <CheckCircle className="w-16 h-16 text-blue-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Accuracy You Can Trust
              </h2>
              <p className="text-lg text-gray-700 mb-4">
                Our home value estimates are continuously refined using machine learning and updated with the latest market data. While no automated valuation can replace a professional appraisal, our estimates provide a reliable starting point for understanding your home's worth.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  Updated daily with new market data
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  Incorporates local market trends and conditions
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  Validated against actual sale prices
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Find Your Home's Value?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Get your free estimate in seconds
          </p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold">
            <DollarSign className="w-5 h-5 mr-2" />
            Get My Home Value
          </Button>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  How accurate are home value estimates?
                </h3>
                <p className="text-gray-600">
                  Our estimates are typically within 5-10% of the actual sale price for most properties. Accuracy varies based on available data and local market conditions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  How often are estimates updated?
                </h3>
                <p className="text-gray-600">
                  We update our estimates daily as new data becomes available, including recent sales, price changes, and market trends.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Can I use this estimate for a loan or appraisal?
                </h3>
                <p className="text-gray-600">
                  Our estimates are for informational purposes only and should not replace a professional appraisal. Lenders require official appraisals for mortgage transactions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  What data sources do you use?
                </h3>
                <p className="text-gray-600">
                  We analyze data from MLS listings, public records, tax assessments, recent sales, and market trends to calculate our estimates.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

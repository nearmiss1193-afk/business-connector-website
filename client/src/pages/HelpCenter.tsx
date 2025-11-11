/**
 * Help Center Page
 * Zillow-style help center with search and category cards
 */

import { useState } from 'react';
import { Search, Users, Home, DollarSign, Key, Building, Shield, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'wouter';
import Footer from '@/components/Footer';
import TopNavigation from '@/components/TopNavigation';

interface HelpCategory {
  title: string;
  icon: React.ReactNode;
  href: string;
}

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');

  const categories: HelpCategory[] = [
    {
      title: 'Landlords',
      icon: <Building className="w-8 h-8 text-blue-600" />,
      href: '/help/landlords',
    },
    {
      title: 'Agents',
      icon: <Users className="w-8 h-8 text-blue-600" />,
      href: '/help/agents',
    },
    {
      title: 'Lenders',
      icon: <DollarSign className="w-8 h-8 text-blue-600" />,
      href: '/help/lenders',
    },
    {
      title: 'Home Loans',
      icon: <Home className="w-8 h-8 text-blue-600" />,
      href: '/help/home-loans',
    },
    {
      title: 'Renters',
      icon: <Key className="w-8 h-8 text-blue-600" />,
      href: '/help/renters',
    },
    {
      title: 'Homebuyers',
      icon: <Home className="w-8 h-8 text-blue-600" />,
      href: '/help/homebuyers',
    },
    {
      title: 'Homeowners',
      icon: <Building className="w-8 h-8 text-blue-600" />,
      href: '/help/homeowners',
    },
    {
      title: 'Home Sellers',
      icon: <FileText className="w-8 h-8 text-blue-600" />,
      href: '/help/sellers',
    },
    {
      title: 'Privacy',
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      href: '/privacy',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />

      {/* Hero Section with Search */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="container max-w-4xl">
          <h1 className="text-5xl font-bold text-gray-900 text-center mb-6">
            How can we help you?
          </h1>
          <p className="text-xl text-gray-600 text-center mb-8">
            Search our help center or browse by category
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-6 text-lg rounded-full shadow-lg border-2 border-gray-200 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Category Cards Grid */}
      <div className="container py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Browse by Category
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {categories.map((category) => (
            <Link key={category.title} href={category.href}>
              <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-blue-500">
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {category.title}
                  </h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Popular Articles Section */}
      <div className="bg-white py-16">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Popular Help Articles
          </h2>

          <div className="space-y-4">
            {[
              'How do I search for properties?',
              'What is a Zestimate and how is it calculated?',
              'How do I save my favorite properties?',
              'How can I contact an agent?',
              'What are the steps to buying a home?',
              'How do I get pre-approved for a mortgage?',
              'What documents do I need to rent a property?',
              'How do I list my property for sale?',
            ].map((article, index) => (
              <Link key={index} href={`/help/article/${index + 1}`}>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer group">
                  <span className="text-gray-900 group-hover:text-blue-600 font-medium">
                    {article}
                  </span>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Support Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Still need help?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Our support team is here to assist you
          </p>
          <Link href="/contact">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg">
              Contact Support
            </button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}

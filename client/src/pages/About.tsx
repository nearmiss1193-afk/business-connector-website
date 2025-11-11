/**
 * About Page
 * Company information and mission
 */

import { Users, Target, Award, TrendingUp, Home, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Footer from '@/components/Footer';
import TopNavigation from '@/components/TopNavigation';
import { APP_TITLE } from '@/const';

export default function About() {
  const values = [
    {
      icon: <Heart className="w-8 h-8 text-blue-600" />,
      title: 'Customer First',
      description: 'We put our users at the center of everything we do, providing tools and insights to make informed decisions.',
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-blue-600" />,
      title: 'Innovation',
      description: 'We continuously evolve our platform with cutting-edge technology to deliver the best real estate experience.',
    },
    {
      icon: <Award className="w-8 h-8 text-blue-600" />,
      title: 'Excellence',
      description: 'We maintain the highest standards in data accuracy, user experience, and customer service.',
    },
  ];

  const stats = [
    { number: '7,948+', label: 'Active Listings' },
    { number: '500K+', label: 'Monthly Visitors' },
    { number: '15+', label: 'Years Experience' },
    { number: '98%', label: 'Customer Satisfaction' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container max-w-4xl text-center">
          <h1 className="text-5xl font-bold mb-6">
            About {APP_TITLE}
          </h1>
          <p className="text-xl opacity-90">
            Central Florida's premier real estate platform, connecting buyers, sellers, and renters with their perfect properties.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="container py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Target className="w-12 h-12 text-blue-600" />
            <h2 className="text-4xl font-bold text-gray-900">Our Mission</h2>
          </div>
          <p className="text-xl text-gray-700 leading-relaxed mb-8">
            At {APP_TITLE}, we're dedicated to simplifying the real estate journey for everyone in Central Florida. Whether you're buying your first home, selling a property, or searching for the perfect rental, we provide the tools, data, and support you need to make confident decisions.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            We believe that finding a home should be exciting, not overwhelming. That's why we've built a platform that combines comprehensive property listings, advanced search tools, market insights, and personalized recommendations to help you navigate the Central Florida real estate market with ease.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="container py-16">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">
          Our Values
        </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {values.map((value, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="flex justify-center mb-4">
                  {value.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Story Section */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-16">
        <div className="container max-w-4xl">
          <div className="flex items-center gap-4 mb-6">
            <Home className="w-12 h-12 text-blue-600" />
            <h2 className="text-4xl font-bold text-gray-900">Our Story</h2>
          </div>
          <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
            <p>
              Founded in Central Florida, {APP_TITLE} was born from a simple idea: make real estate accessible and transparent for everyone. We saw how complex and stressful the home buying and selling process could be, and we knew there had to be a better way.
            </p>
            <p>
              Today, we serve thousands of buyers, sellers, renters, and real estate professionals across Tampa, Orlando, Lakeland, and surrounding areas. Our platform provides instant access to comprehensive property listings, market data, and the tools needed to make informed real estate decisions.
            </p>
            <p>
              As a division of WORLDUNITIES LLC, we're committed to continuous innovation and excellence in serving the Central Florida real estate community. We're proud to be your trusted partner in finding home.
            </p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="container py-16">
        <div className="max-w-4xl mx-auto text-center">
          <Users className="w-16 h-16 text-blue-600 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Join Our Team
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            We're always looking for talented individuals who share our passion for real estate and technology.
          </p>
          <a href="/careers">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg">
              View Open Positions
            </button>
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
}

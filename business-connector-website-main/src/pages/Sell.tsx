import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Home, TrendingUp, Users } from 'lucide-react';
import { Link } from 'wouter';

export default function Sell() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">Sell Your Home</h1>
          <p className="text-xl text-blue-100">
            Get your property in front of thousands of qualified buyers in Central Florida
          </p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>List Your Property</CardTitle>
              <CardDescription>
                Upload your property details and photos to reach thousands of buyers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
                  <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-gray-700 mb-2">
                    Drag and drop your property photos here
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    or click to browse your computer
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Choose Photos
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Property Address</label>
                    <input 
                      type="text" 
                      placeholder="123 Main Street, Orlando, FL 32801"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Asking Price</label>
                    <input 
                      type="text" 
                      placeholder="$500,000"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bedrooms</label>
                    <input 
                      type="number" 
                      placeholder="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bathrooms</label>
                    <input 
                      type="number" 
                      placeholder="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Property Description</label>
                  <textarea 
                    placeholder="Describe your property, its features, and what makes it special..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2">
                  List Your Property
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Sell with Us?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-blue-100 p-4 rounded-lg mb-4">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Reach Thousands of Buyers</h3>
                  <p className="text-gray-600">
                    Your property will be seen by thousands of qualified buyers actively searching
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-blue-100 p-4 rounded-lg mb-4">
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Get Top Dollar</h3>
                  <p className="text-gray-600">
                    Our tools help you price competitively and attract serious buyers
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-blue-100 p-4 rounded-lg mb-4">
                    <Home className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Expert Support</h3>
                  <p className="text-gray-600">
                    Connect with experienced agents to guide you through the selling process
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Sell Your Home?</h2>
          <p className="text-xl text-blue-100 mb-8">
            List your property today and connect with thousands of potential buyers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-2">
              List Now
            </Button>
            <Link href="/contact">
              <a>
                <Button className="bg-blue-500 hover:bg-blue-400 text-white font-semibold px-8 py-2">
                  Talk to an Agent
                </Button>
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

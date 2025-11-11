/**
 * Property Website Homepage
 * Zillow-quality design with hero, featured properties, and CTAs
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import MortgageLeadModal from '@/components/MortgageLeadModal';
import Footer from '@/components/Footer';
import TopNavigation from '@/components/TopNavigation';
import {
  Search,
  MapPin,
  Bed,
  Bath,
  Ruler,
  Heart,
  TrendingUp,
  Home,
  DollarSign,
  Users,
  ArrowRight,
  Star,
  Percent,
  Calendar,
} from 'lucide-react';

export default function PropertyHome() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'buy' | 'mortgage'>('buy');
  const [showMortgageModal, setShowMortgageModal] = useState(false);
  const [userCity, setUserCity] = useState<string | undefined>(undefined);
  const [locationDetected, setLocationDetected] = useState(false);
  
  // Mortgage calculator state
  const [homePrice, setHomePrice] = useState('400000');
  const [downPayment, setDownPayment] = useState('80000');
  const [interestRate, setInterestRate] = useState('7.0');
  const [loanTerm, setLoanTerm] = useState('30');
  
  // Calculate mortgage
  const calculateMonthlyPayment = () => {
    const price = parseFloat(homePrice) || 0;
    const down = parseFloat(downPayment) || 0;
    const rate = parseFloat(interestRate) || 0;
    const years = parseInt(loanTerm) || 30;
    
    const loanAmount = price - down;
    const monthlyRate = rate / 100 / 12;
    const numberOfPayments = years * 12;
    
    let pi = 0;
    if (monthlyRate > 0) {
      pi = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
           (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    } else {
      pi = loanAmount / numberOfPayments;
    }
    
    const monthlyPropertyTax = (price * 0.012) / 12;
    const monthlyInsurance = 1500 / 12;
    const monthlyHoa = 200;
    
    return pi + monthlyPropertyTax + monthlyInsurance + monthlyHoa;
  };

  // Detect user location on mount using IP geolocation
  useEffect(() => {
    if (!locationDetected) {
      // Use ipapi.co for free IP-based geolocation
      fetch('https://ipapi.co/json/')
        .then(response => response.json())
        .then(data => {
          if (data.city) {
            setUserCity(data.city);
          }
          setLocationDetected(true);
        })
        .catch(error => {
          console.log('Could not detect location:', error);
          setLocationDetected(true);
        });
    }
  }, [locationDetected]);

  // Fetch featured properties based on location
  const { data: featuredData } = trpc.properties.getFeaturedByLocation.useQuery({
    city: userCity,
    maxPrice: 500000,
    limit: 8,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation(`/properties?location=${encodeURIComponent(searchQuery)}`);
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(parseInt(price));
  };  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <TopNavigation />
      {/* Hero Section - Zillow Style with Real Photo */}
      <div className="relative h-[600px] overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/hero-property.jpg)',
          }}
        />
        
        {/* Dark Overlay for Text Readability */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Content */}
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-start text-left max-w-6xl">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
            Rentals. Homes.
            <br />
            Agents. Loans.
          </h1>
          <p className="text-xl md:text-2xl text-white/95 mb-8 max-w-2xl drop-shadow-lg">
            Search thousands of properties in Tampa, Orlando, St. Petersburg, and beyond
          </p>

          {/* Tab Toggle */}
          <div className="w-full max-w-3xl mb-4">
            <div className="inline-flex bg-white/20 backdrop-blur-sm rounded-lg p-1">
              <button
                onClick={() => setActiveTab('buy')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'buy'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-white hover:text-white/90'
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => setActiveTab('mortgage')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'mortgage'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-white hover:text-white/90'
                }`}
              >
                Get Pre-Approved
              </button>
            </div>
          </div>

          {/* Search Bar - Zillow Style */}
          {activeTab === 'buy' && (
            <form onSubmit={handleSearch} className="w-full max-w-3xl">
              <div className="bg-white rounded-xl shadow-2xl p-1.5 flex items-center gap-2">
                <div className="flex-1 flex items-center gap-3 px-5">
                  <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Enter an address, neighborhood, city, or ZIP code"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 py-4 text-base outline-none text-gray-900 placeholder:text-gray-500"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-7 text-base font-medium rounded-lg"
                >
                  <Search className="w-5 h-5" />
                </Button>
              </div>
            </form>
          )}

          {/* Mortgage Calculator */}
          {activeTab === 'mortgage' && (
            <div className="w-full max-w-3xl">
              <div className="bg-white rounded-xl shadow-2xl p-6">
                {/* Input Fields */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">
                      Home Price
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="text"
                        value={new Intl.NumberFormat('en-US').format(parseFloat(homePrice) || 0)}
                        onChange={(e) => setHomePrice(e.target.value.replace(/[^0-9]/g, ''))}
                        className="pl-9 h-11"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">
                      Down Payment
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="text"
                        value={new Intl.NumberFormat('en-US').format(parseFloat(downPayment) || 0)}
                        onChange={(e) => setDownPayment(e.target.value.replace(/[^0-9]/g, ''))}
                        className="pl-9 h-11"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">
                      Interest Rate
                    </label>
                    <div className="relative">
                      <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="text"
                        value={interestRate}
                        onChange={(e) => setInterestRate(e.target.value.replace(/[^0-9.]/g, ''))}
                        className="pr-9 h-11"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">
                      Loan Term
                    </label>
                    <select
                      value={loanTerm}
                      onChange={(e) => setLoanTerm(e.target.value)}
                      className="w-full h-11 px-3 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="15">15 years</option>
                      <option value="20">20 years</option>
                      <option value="30">30 years</option>
                    </select>
                  </div>
                </div>

                {/* Result */}
                <div className="border-t pt-4 mb-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-gray-600">Monthly Payment</span>
                    <span className="text-3xl font-bold text-blue-600">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        maximumFractionDigits: 0,
                      }).format(calculateMonthlyPayment())}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Includes taxes, insurance & HOA</p>
                </div>

                {/* CTA */}
                <Button 
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700"
                  onClick={() => setShowMortgageModal(true)}
                >
                  Get Pre-Approved
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Featured Properties */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {featuredData?.city ? `Trending Homes in ${featuredData.city}` : 'Featured Properties'}
            </h2>
            <p className="text-gray-600">
              {featuredData?.city 
                ? `Viewed and saved the most in the area over the past 24 hours`
                : 'Handpicked homes in Central Florida'}
            </p>
          </div>
          <Link href="/properties">
            <Button variant="outline" className="gap-2">
              View All Properties
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredData?.properties.slice(0, 8).map((property: any) => (
            <Link key={property.id} href={`/properties/${property.id}`}>
              <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group border-gray-200">
                {/* Property Image */}
                <div className="relative h-56 bg-gray-100 overflow-hidden">
                  <img
                    src={property.primaryImage || '/properties/pQT9duRUSVYo.jpg'}
                    alt={property.address}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {property.hasVirtualTour && (
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Home className="w-3 h-3" />
                        3D Tour
                      </span>
                    )}
                  </div>

                  {/* Favorite Button */}
                  <button className="absolute top-3 right-3 bg-white/90 hover:bg-white p-2 rounded-full transition-colors">
                    <Heart className="w-5 h-5 text-gray-700" />
                  </button>
                </div>

                <CardContent className="p-4">
                  {/* Price */}
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {formatPrice(property.price)}
                  </div>

                  {/* Specs */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <Bed className="w-4 h-4" />
                      {property.bedrooms} bd
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="w-4 h-4" />
                      {property.bathrooms} ba
                    </span>
                    <span className="flex items-center gap-1">
                      <Ruler className="w-4 h-4" />
                      {property.sqft?.toLocaleString()} sqft
                    </span>
                  </div>

                  {/* Address */}
                  <div className="text-gray-700 font-medium mb-1">{property.address}</div>
                  <div className="text-sm text-gray-500">
                    {property.city}, {property.state} {property.zipCode}
                  </div>

                  {/* Property Type */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      {property.propertyType.replace('_', ' ')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Why Choose Central Florida Homes</h2>
            <p className="text-gray-600 text-lg">Your trusted partner in finding the perfect home</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Latest Listings</h3>
              <p className="text-gray-600">
                Access the newest properties as soon as they hit the market
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">3D Virtual Tours</h3>
              <p className="text-gray-600">
                Tour properties from the comfort of your home with immersive 3D technology
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Expert Agents</h3>
              <p className="text-gray-600">
                Work with experienced local agents who know Central Florida inside out
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Find Your Dream Home?</h2>
          <p className="text-xl text-white/90 mb-8">
            Browse thousands of properties and schedule tours today
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/properties">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg">
                <Search className="w-5 h-5 mr-2" />
                Browse Properties
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg"
            >
              <DollarSign className="w-5 h-5 mr-2" />
              Get Pre-Approved
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Home className="w-6 h-6" />
                <span className="text-xl font-bold">Central Florida Homes</span>
              </div>
              <p className="text-gray-400">
                Your trusted source for real estate in Tampa, Orlando, and beyond.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/properties" className="hover:text-white transition-colors">
                    Browse Properties
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Mortgage Calculator
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Buyer's Guide
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Seller's Guide
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>(555) 123-4567</li>
                <li>info@centralfloridahomes.com</li>
                <li>Orlando, FL 32801</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Central Florida Homes. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Mortgage Lead Modal */}
      <MortgageLeadModal
        open={showMortgageModal}
        onOpenChange={setShowMortgageModal}
        mortgageData={{
          homePrice,
          downPayment,
          interestRate,
          loanTerm,
          monthlyPayment: calculateMonthlyPayment(),
        }}
      />
    </div>
  );
}

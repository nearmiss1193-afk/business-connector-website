/**
 * Property Website Homepage
 * Zillow-quality design with hero, featured properties, and CTAs
 */

import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { APP_LOGO } from '@/const';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import MortgageLeadModal from '@/components/MortgageLeadModal';
import Footer from '@/components/Footer';
import TopNavigation from '@/components/TopNavigation';
import DrawMapModal from '@/components/DrawMapModal';
import SearchLocationDropdown from '@/components/SearchLocationDropdown';
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
  ChevronDown,
} from 'lucide-react';

export default function PropertyHome() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'buy' | 'mortgage'>('buy');
  const [showMortgageModal, setShowMortgageModal] = useState(false);
  const [userCity, setUserCity] = useState<string | undefined>(undefined);
  const [locationDetected, setLocationDetected] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // Advanced search filters
  const [showFilters, setShowFilters] = useState(false);
  const [showDrawMap, setShowDrawMap] = useState(false);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [beds, setBeds] = useState<string>('any');
  const [baths, setBaths] = useState<string>('any');
  const [homeTypes, setHomeTypes] = useState<string[]>([]);
  const [drawnPolygon, setDrawnPolygon] = useState<google.maps.LatLngLiteral[] | null>(null);
  
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
            <div className="w-full max-w-3xl">
              <form onSubmit={handleSearch}>
                <div className="bg-white rounded-xl shadow-2xl p-1.5 flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-3 px-5">
                    <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <SearchLocationDropdown
                      value={searchQuery}
                      onChange={setSearchQuery}
                      onSelect={() => {
                        setTimeout(() => {
                          const form = document.querySelector('form');
                          if (form) form.requestSubmit();
                        }, 100);
                      }}
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
              
              {/* Advanced Filters Bar */}
              <div className="mt-3 flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700 font-medium"
                >
                  Price
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700 font-medium"
                >
                  Beds & Baths
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700 font-medium"
                >
                  Home Type
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700 font-medium"
                >
                  More filters
                </Button>
                <div className="h-6 w-px bg-gray-300" />
                <Button
                  variant="outline"
                  onClick={() => setShowDrawMap(true)}
                  className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700 font-medium flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  Draw
                </Button>
              </div>
              
              {/* Filter Panel */}
              {showFilters && (
                <div className="mt-3 bg-white rounded-xl shadow-2xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Price Range */}
                    <div>
                      <label className="text-sm font-semibold text-gray-900 mb-3 block">Price Range</label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          placeholder="Min"
                          value={priceMin}
                          onChange={(e) => setPriceMin(e.target.value.replace(/[^0-9]/g, ''))}
                          className="flex-1"
                        />
                        <span className="text-gray-400">—</span>
                        <Input
                          type="text"
                          placeholder="Max"
                          value={priceMax}
                          onChange={(e) => setPriceMax(e.target.value.replace(/[^0-9]/g, ''))}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    {/* Beds */}
                    <div>
                      <label className="text-sm font-semibold text-gray-900 mb-3 block">Bedrooms</label>
                      <select
                        value={beds}
                        onChange={(e) => setBeds(e.target.value)}
                        className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="any">Any</option>
                        <option value="1">1+</option>
                        <option value="2">2+</option>
                        <option value="3">3+</option>
                        <option value="4">4+</option>
                        <option value="5">5+</option>
                      </select>
                    </div>
                    
                    {/* Baths */}
                    <div>
                      <label className="text-sm font-semibold text-gray-900 mb-3 block">Bathrooms</label>
                      <select
                        value={baths}
                        onChange={(e) => setBaths(e.target.value)}
                        className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="any">Any</option>
                        <option value="1">1+</option>
                        <option value="2">2+</option>
                        <option value="3">3+</option>
                        <option value="4">4+</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Home Type */}
                  <div className="mt-6">
                    <label className="text-sm font-semibold text-gray-900 mb-3 block">Home Type</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {['Single Family', 'Condo', 'Townhouse', 'Multi-Family', 'Land', 'Mobile'].map((type) => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={homeTypes.includes(type)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setHomeTypes([...homeTypes, type]);
                              } else {
                                setHomeTypes(homeTypes.filter(t => t !== type));
                              }
                            }}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="mt-6 flex items-center justify-between">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setPriceMin('');
                        setPriceMax('');
                        setBeds('any');
                        setBaths('any');
                        setHomeTypes([]);
                      }}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Clear all
                    </Button>
                    <Button
                      onClick={() => {
                        setShowFilters(false);
                        // Build query params from filters
                        const params = new URLSearchParams();
                        if (searchQuery) params.set('location', searchQuery);
                        if (priceMin) params.set('minPrice', priceMin);
                        if (priceMax) params.set('maxPrice', priceMax);
                        if (beds !== 'any') params.set('beds', beds);
                        if (baths !== 'any') params.set('baths', baths);
                        if (homeTypes.length > 0) params.set('types', homeTypes.join(','));
                        if (drawnPolygon) params.set('polygon', JSON.stringify(drawnPolygon));
                        // Navigate to properties page with filters
                        setLocation(`/properties?${params.toString()}`);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Apply filters
                    </Button>
                  </div>
                </div>
              )}
            </div>
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

      {/* BuyAbility Calculator Widget */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center">
            Find homes you can afford with BuyAbility<sup className="text-sm">SM</sup>
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Answer a few questions. We'll highlight homes you're likely to qualify for.
          </p>
          
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* BuyAbility Widget Card */}
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <img src={APP_LOGO} alt="Logo" className="h-6" />
                  <span className="text-sm font-semibold">Home Loans</span>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <div className="text-3xl font-bold text-gray-900">$ --</div>
                    <div className="text-xs text-gray-600">Suggested target price</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">$ --</div>
                    <div className="text-xs text-gray-600">BuyAbility<sup>SM</sup></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-lg font-bold text-gray-900">$ --</div>
                      <div className="text-xs text-gray-600">Mo. payment</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">-- %</div>
                      <div className="text-xs text-gray-600">Today's rate</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">-- %</div>
                      <div className="text-xs text-gray-600">APR</div>
                    </div>
                  </div>
                </div>
                
                <Link href="/mortgage-calculator">
                  <Button 
                    className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold"
                  >
                    Let's get started
                  </Button>
                </Link>
              </div>
              
              {/* Placeholder property cards with "Within BuyAbility" badge */}
              {featuredData?.properties.slice(0, 2).map((property: any) => (
                parseInt(property.price) < 400000 && (
                  <Link key={property.id} href={`/properties/${property.id}`}>
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group border-gray-200 h-full">
                      <div className="relative h-48 bg-gray-100 overflow-hidden">
                        <img
                          src={property.primaryImage || '/properties/pQT9duRUSVYo.jpg'}
                          alt={property.address}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <span className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded text-xs font-bold">
                          Within BuyAbility
                        </span>
                      </div>
                      <CardContent className="p-4">
                        <div className="text-xl font-bold text-gray-900 mb-2">
                          {formatPrice(property.price)}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                          <span>{property.bedrooms} bd</span>
                          <span>{property.bathrooms} ba</span>
                          <span>{property.sqft?.toLocaleString()} sqft</span>
                        </div>
                        <div className="text-sm text-gray-700">{property.address}</div>
                        <div className="text-xs text-gray-500">
                          {property.city}, {property.state}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              ))}
            </div>
            
            <div className="text-center mt-6">
              <Link href="#">
                <a className="text-blue-600 hover:underline text-sm font-medium flex items-center justify-center gap-1">
                  <span>↓</span> More recommended homes
                </a>
              </Link>
            </div>
          </div>
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
          <div className="flex items-center gap-4">
            {/* Carousel Navigation Arrows */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (carouselRef.current) {
                    carouselRef.current.scrollBy({ left: -400, behavior: 'smooth' });
                  }
                }}
                className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                aria-label="Previous properties"
              >
                <ArrowRight className="w-5 h-5 rotate-180" />
              </button>
              <button
                onClick={() => {
                  if (carouselRef.current) {
                    carouselRef.current.scrollBy({ left: 400, behavior: 'smooth' });
                  }
                }}
                className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                aria-label="Next properties"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <Link href="/properties">
              <Button variant="outline" className="gap-2">
                View All Properties
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div 
          ref={carouselRef}
          className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {featuredData?.properties.slice(0, 8).map((property: any) => (
            <Link key={property.id} href={`/properties/${property.id}`}>
              <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group border-gray-200 flex-shrink-0 w-72 snap-start">
                {/* Property Image */}
                <div className="relative h-56 bg-gray-100 overflow-hidden">
                  <img
                    src={property.firstImage || property.primaryImage || '/properties/pQT9duRUSVYo.jpg'}
                    alt={property.address}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {/* Showcase badge for properties under $500k */}
                    {parseInt(property.price) < 500000 && (
                      <span className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold">
                        Showcase
                      </span>
                    )}
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

                  {/* Status and MLS Info */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      {property.listingStatus === 'active' ? 'Active' : property.listingStatus}
                    </span>
                    {property.mlsId && (
                      <span className="text-xs text-gray-500">
                        MLS ID #{property.mlsId}
                      </span>
                    )}
                  </div>
                  {property.source && property.source !== 'sample' && (
                    <div className="text-xs text-gray-400 mt-2">
                      Source: {property.source}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Value Proposition Section - Zillow Style */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Buy a home */}
            <Card className="p-8 text-center hover:shadow-xl transition-shadow border-gray-200">
              <div className="flex justify-center mb-6">
                <img 
                  src="/illustrations/buy-home.png" 
                  alt="Buy a home" 
                  className="w-40 h-40 object-contain"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Buy a home</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                A real estate agent can provide you with a clear breakdown of costs so that you can avoid surprise expenses.
              </p>
              <Link href="/contact">
                <a>
                  <Button 
                    variant="outline" 
                    className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold"
                  >
                    Find a local agent
                  </Button>
                </a>
              </Link>
            </Card>

            {/* Finance a home */}
            <Card className="p-8 text-center hover:shadow-xl transition-shadow border-gray-200">
              <div className="flex justify-center mb-6">
                <img 
                  src="/illustrations/finance-home.png" 
                  alt="Finance a home" 
                  className="w-40 h-40 object-contain"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Finance a home</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                looking to get pre-approved so you're ready to make an offer quickly when you find the right home?
              </p>
              <Button 
                variant="outline" 
                className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold"
                onClick={() => setShowMortgageModal(true)}
              >
                Start now
              </Button>
              <p className="text-xs text-gray-500 mt-3">NMLS #10287</p>
            </Card>

            {/* Rent a home */}
            <Card className="p-8 text-center hover:shadow-xl transition-shadow border-gray-200">
              <div className="flex justify-center mb-6">
                <img 
                  src="/illustrations/rent-home.png" 
                  alt="Rent a home" 
                  className="w-40 h-40 object-contain"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Rent a home</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                We're creating a seamless online experience – from shopping on the largest rental network, to applying, to paying rent.
              </p>
              <Button 
                variant="outline" 
                className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold"
                onClick={() => window.location.href = '/rentals'}
              >
                Find rentals
              </Button>
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

      {/* Draw Map Modal */}
      <DrawMapModal
        open={showDrawMap}
        onClose={() => setShowDrawMap(false)}
        onPolygonDrawn={(coords) => {
          setDrawnPolygon(coords);
          console.log('Polygon drawn:', coords);
          // TODO: Filter properties within polygon
        }}
      />

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

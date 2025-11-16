/**
 * Professional Property Search Page
 * Zillow-quality design with modern UI/UX
 */

import { useState, useMemo, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Search,
  Bed,
  Bath,
  Ruler,
  MapPin,
  Heart,
  Camera,
  Map,
  Grid3x3,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import BuyerRegistrationModal from '@/components/BuyerRegistrationModal';
import RecentlyViewed from '@/components/RecentlyViewed';
import LazyImage from '@/components/LazyImage';
import { v4 as uuidv4 } from 'uuid';

export default function PropertiesNew() {
  const [searchLocation, setSearchLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [sessionId, setSessionId] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Initialize session ID
  useEffect(() => {
    let sid = localStorage.getItem('sessionId');
    if (!sid) {
      sid = uuidv4();
      localStorage.setItem('sessionId', sid);
    }
    setSessionId(sid || '');
  }, []);

  // Track property view mutation
  const trackView = trpc.properties.trackView.useMutation({
    onSuccess: (data) => {
      if (data.shouldShowLeadCapture && !localStorage.getItem('userRegistered')) {
        setShowRegistrationModal(true);
      }
    },
  });

  // Fetch properties from API
  const { data: properties, isLoading } = trpc.properties.search.useQuery({
    location: searchLocation || undefined,
    minPrice: minPrice ? parseInt(minPrice) : undefined,
    maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
    bedrooms: bedrooms && bedrooms !== 'any' ? parseInt(bedrooms) : undefined,
    bathrooms: bathrooms && bathrooms !== 'any' ? parseFloat(bathrooms) : undefined,
    propertyType: propertyType && propertyType !== 'any' ? propertyType : undefined,
    page: 1,
    limit: 24,
  });

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(parseInt(price));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Professional Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-gray-900">
                🏠 Central Florida Homes
              </h1>
              <nav className="hidden md:flex items-center gap-6">
                <a href="#" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                  Buy
                </a>
                <a href="#" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                  Sell
                </a>
                <a href="#" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                  Rent
                </a>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <Heart className="h-5 w-5 mr-2" />
                Saved
              </Button>
              <Button variant="default" size="sm">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Search Section */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="container py-8">
          {/* Main Search Bar */}
          <div className="max-w-4xl mx-auto mb-6">
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Enter an address, neighborhood, city, or ZIP code"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="pl-12 pr-24 h-14 text-lg border-2 border-gray-300 focus:border-blue-500 rounded-lg shadow-sm"
              />
              <Button
                size="lg"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="bg-white"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>

              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger className="w-[140px] bg-white">
                  <SelectValue placeholder="Home Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">All Types</SelectItem>
                  <SelectItem value="single_family">House</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                  <SelectItem value="multi_family">Multi-Family</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                </SelectContent>
              </Select>

              <Select value={bedrooms} onValueChange={setBedrooms}>
                <SelectTrigger className="w-[120px] bg-white">
                  <SelectValue placeholder="Beds" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                  <SelectItem value="5">5+</SelectItem>
                </SelectContent>
              </Select>

              <Select value={bathrooms} onValueChange={setBathrooms}>
                <SelectTrigger className="w-[120px] bg-white">
                  <SelectValue placeholder="Baths" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min Price"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-[130px] bg-white"
                />
                <span className="text-gray-400">-</span>
                <Input
                  type="number"
                  placeholder="Max Price"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-[130px] bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="container py-6">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {properties?.total.toLocaleString() || 0} Homes for Sale
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {properties?.virtualTours.toLocaleString() || 0} with 3D tours
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Select defaultValue="newest">
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price (Low to High)</SelectItem>
                <SelectItem value="price-high">Price (High to Low)</SelectItem>
                <SelectItem value="sqft">Square Feet</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border border-gray-300 rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('map')}
                className="rounded-l-none"
              >
                <Map className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Property Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <Card key={i} className="overflow-hidden animate-pulse border-gray-200">
                <div className="bg-gray-200 h-56" />
                <CardContent className="p-4">
                  <div className="h-6 bg-gray-200 rounded mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </CardContent>
                </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties?.items.map((property: any) => (
              <Link key={property.id} href={`/properties/${property.id}`} className="block">
              <Card
                className="overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group border-gray-200"
                onClick={() => {
                  setSelectedProperty(property);
                  if (sessionId) {
                    trackView.mutate({
                      propertyId: property.id,
                      sessionId,
                    });
                  }
                }}
              >
                {/* Property Image */}
                <div className="relative h-56 bg-gray-100 overflow-hidden">
                  <LazyImage
                    src={property.firstImage || property.primaryImage || '/properties/pQT9duRUSVYo.jpg'}
                    alt={property.address}
                    className="w-full h-full group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      e.currentTarget.src = '/properties/pQT9duRUSVYo.jpg';
                    }}
                  />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {property.hasVirtualTour && (
                      <Badge className="bg-blue-600 text-white shadow-lg">
                        <Camera className="mr-1 h-3 w-3" />
                        3D Tour
                      </Badge>
                    )}
                    {property.listingStatus === 'pending' && (
                      <Badge className="bg-yellow-500 text-white shadow-lg">
                        Pending
                      </Badge>
                    )}
                    {property.daysOnMarket && property.daysOnMarket <= 7 && (
                      <Badge className="bg-red-600 text-white shadow-lg">
                        New Listing
                      </Badge>
                    )}
                  </div>

                  {/* Favorite Button */}
                  <button className="absolute top-3 right-3 bg-white/95 hover:bg-white rounded-full p-2.5 shadow-lg transition-all hover:scale-110">
                    <Heart className="h-5 w-5 text-gray-700" />
                  </button>
                </div>

                {/* Property Details */}
                <CardContent className="p-5">
                  {/* Price */}
                  <div className="text-2xl font-bold text-gray-900 mb-3">
                    {formatPrice(property.price)}
                  </div>

                  {/* Specs */}
                  <div className="flex items-center gap-4 text-sm text-gray-700 mb-3 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Bed className="h-4 w-4 text-gray-500" />
                      <span>{property.bedrooms} bd</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Bath className="h-4 w-4 text-gray-500" />
                      <span>{property.bathrooms} ba</span>
                    </div>
                    {property.sqft && (
                      <div className="flex items-center gap-1.5">
                        <Ruler className="h-4 w-4 text-gray-500" />
                        <span>{property.sqft.toLocaleString()} sqft</span>
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  <div className="text-sm text-gray-900 font-medium mb-1">
                    {property.address}
                  </div>
                  <div className="text-sm text-gray-600">
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
        )}
      </div>

      {/* Recently Viewed Section */}
      <RecentlyViewed />

      {/* Buyer Registration Modal */}
      <BuyerRegistrationModal
        open={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        propertyAddress={selectedProperty?.address}
        propertyPrice={selectedProperty?.price}
        propertyId={selectedProperty?.mlsId}
      />
    </div>
  );
}

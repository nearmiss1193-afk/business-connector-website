/**
 * Property Search Page
 * Professional Zillow-style property listing interface
 */

import { useState, useEffect } from 'react';
import { Search, Bed, Bath, Ruler, MapPin, Heart, Camera } from 'lucide-react';
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
import AgentBanner from '@/components/AgentBanner';
import { v4 as uuidv4 } from 'uuid';

export default function Properties() {
  const [searchLocation, setSearchLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [sessionId, setSessionId] = useState('');

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              🏠 Central Florida Homes
            </h1>
            <p className="text-xl mb-8">
              Search {properties?.total.toLocaleString() || '7,948'} Properties in Tampa, Orlando & Beyond
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-xl p-6 text-gray-900">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Location */}
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="City, State, or ZIP"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Price Range */}
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min Price"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Max Price"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>

                {/* Bedrooms */}
                <Select value={bedrooms} onValueChange={setBedrooms}>
                  <SelectTrigger>
                    <SelectValue placeholder="Bedrooms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Bedrooms</SelectItem>
                    <SelectItem value="1">1+ Beds</SelectItem>
                    <SelectItem value="2">2+ Beds</SelectItem>
                    <SelectItem value="3">3+ Beds</SelectItem>
                    <SelectItem value="4">4+ Beds</SelectItem>
                    <SelectItem value="5">5+ Beds</SelectItem>
                  </SelectContent>
                </Select>

                {/* Bathrooms */}
                <Select value={bathrooms} onValueChange={setBathrooms}>
                  <SelectTrigger>
                    <SelectValue placeholder="Bathrooms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Bathrooms</SelectItem>
                    <SelectItem value="1">1+ Baths</SelectItem>
                    <SelectItem value="2">2+ Baths</SelectItem>
                    <SelectItem value="3">3+ Baths</SelectItem>
                    <SelectItem value="4">4+ Baths</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Property Type & Search Button */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Property Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">All Types</SelectItem>
                    <SelectItem value="single_family">Single Family</SelectItem>
                    <SelectItem value="condo">Condo</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                    <SelectItem value="multi_family">Multi-Family</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                  </SelectContent>
                </Select>

                <Button size="lg" className="w-full">
                  <Search className="mr-2 h-5 w-5" />
                  Search Properties
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container py-8">
        {/* Stats Bar */}
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          <div className="text-lg font-semibold text-gray-700">
            {properties?.total.toLocaleString() || 0} Properties Found
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-sm">
              <Camera className="mr-1 h-4 w-4" />
              {properties?.virtualTours.toLocaleString() || 0} Virtual Tours
            </Badge>
          </div>
        </div>

        {/* Property Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <div className="bg-gray-200 h-48" />
                <CardContent className="p-4">
                  <div className="h-6 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content - Property Grid */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {properties?.items.map((property: any) => (
            <Card
              key={property.id}
              className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
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
              <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden">
                {property.primaryImage ? (
                  <img
                    src={property.primaryImage}
                    alt={property.address}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-white text-6xl">
                    🏠
                  </div>
                )}

                {/* Favorite Button */}
                <button className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-2 transition-colors">
                  <Heart className="h-5 w-5 text-gray-600" />
                </button>

                {/* Virtual Tour Badge */}
                {property.hasVirtualTour && (
                  <div className="absolute bottom-2 left-2">
                    <Badge className="bg-blue-600 text-white">
                      <Camera className="mr-1 h-3 w-3" />
                      Virtual Tour
                    </Badge>
                  </div>
                )}
              </div>

              {/* Property Details */}
              <CardContent className="p-4">
                {/* Price */}
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {formatPrice(property.price)}
                </div>

                {/* Specs */}
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Bed className="h-4 w-4" />
                    <span>{property.bedrooms} beds</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath className="h-4 w-4" />
                    <span>{property.bathrooms} baths</span>
                  </div>
                  {property.sqft && (
                    <div className="flex items-center gap-1">
                      <Ruler className="h-4 w-4" />
                      <span>{property.sqft.toLocaleString()} sqft</span>
                    </div>
                  )}
                </div>

                {/* Address */}
                <div className="text-sm text-gray-700 mb-1">{property.address}</div>
                <div className="text-sm text-gray-500">
                  {property.city}, {property.state} {property.zipCode}
                </div>

                {/* Property Type */}
                <div className="mt-3">
                  <Badge variant="outline" className="text-xs">
                    {property.propertyType.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            ))}
              </div>
            </div>

            {/* Sidebar - Agent Banners */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <AgentBanner placement="sidebar" className="mb-4" />
              </div>
            </div>
          </div>
        )}
      </div>

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

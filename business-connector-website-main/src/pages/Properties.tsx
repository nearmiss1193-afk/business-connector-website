/**
 * Property Search Page
 * Professional Zillow-style property listing interface
 */

import { useState, useEffect } from 'react';
import { Search, Bed, Bath, Ruler, MapPin, Heart, Camera, Map, List, Calculator } from 'lucide-react';
import PropertyMapView from '@/components/PropertyMapView';
import MapListView from '@/components/MapListView';
import NoPictureAvailable from '@/components/NoPictureAvailable';
import AdvancedSearchFilters from '@/components/AdvancedSearchFilters';
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
import MortgageCalculatorModal from '@/components/MortgageCalculatorModal';
import SearchAutocomplete from '@/components/SearchAutocomplete';
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
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'split'>('split');
  const [showMortgageCalculator, setShowMortgageCalculator] = useState(false);
  const [calculatorProperty, setCalculatorProperty] = useState<any>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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

  const handleAdvancedFiltersChange = (filters: any) => {
    if (filters.minPrice !== undefined) setMinPrice(filters.minPrice.toString());
    if (filters.maxPrice !== undefined) setMaxPrice(filters.maxPrice.toString());
    if (filters.bedrooms !== undefined) setBedrooms(filters.bedrooms.toString());
    if (filters.bathrooms !== undefined) setBathrooms(filters.bathrooms.toString());
    if (filters.propertyTypes !== undefined && filters.propertyTypes.length > 0) {
      setPropertyType(filters.propertyTypes[0]);
    }
  };

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
               Central Florida Homes
            </h1>
            <p className="text-xl mb-8">
              Search {properties?.total.toLocaleString() || '7,948'} Properties in Tampa, Orlando & Beyond
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-xl p-6 text-gray-900">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Location */}
                <div className="col-span-1 md:col-span-2 lg:col-span-1">
                  <SearchAutocomplete
                    value={searchLocation}
                    onChange={setSearchLocation}
                    placeholder="City, State, or ZIP"
                    className="w-full"
                  />
                {

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
                {

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
              {

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
              {
            {
          {
        {
      {

      {/* Results */}
      <div className="container py-8">
        {/* Advanced Filters */}
        <AdvancedSearchFilters
          isOpen={showAdvancedFilters}
          onToggle={() => setShowAdvancedFilters(!showAdvancedFilters)}
          onFiltersChange={handleAdvancedFiltersChange}
        />

        {/* Stats Bar */}
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {properties?.total.toLocaleString() || 0} {properties?.total === 1 ? 'Property' : 'Properties'} Found
              {searchLocation && (
                <span className="font-medium text-gray-600"> in {searchLocation}</span>
              )}
            </h2>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              {(minPrice || maxPrice || bedrooms || bathrooms || propertyType) && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">
                    Filtered by: {[minPrice && `$${parseInt(minPrice).toLocaleString()}+`, maxPrice && `up to $${parseInt(maxPrice).toLocaleString()}`, bedrooms && `${bedrooms}+ beds`, bathrooms && `${bathrooms}+ baths`, propertyType && propertyType].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
          {
          <div className="flex gap-2 items-center">
            <Badge variant="secondary" className="text-sm">
              <Camera className="mr-1 h-4 w-4" />
              {properties?.virtualTours.toLocaleString() || 0} Virtual Tours
            </Badge>
          {
        {

        {/* Property Grid or Map View */}
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
          {
        ) : (
          <div className="h-[calc(100vh-300px)] min-h-[600px] rounded-lg overflow-hidden shadow-lg border border-gray-200">
            <MapListView
              properties={properties?.items || []}
              onPropertyClick={(propertyId) => {
                const property = properties?.items.find((p: any) => p.id === propertyId);
                if (property) {
                  setSelectedProperty(property);
                  if (sessionId) {
                    trackView.mutate({
                      propertyId: property.id,
                      sessionId,
                    });
                  }
                }
              }}
              onCalculatorOpen={(property) => {
                setCalculatorProperty(property);
                setShowMortgageCalculator(true);
              }}
            />
          {
        )}
        
        {/* Hidden for now - keeping old grid code for reference */}
        {false && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
              <div className="relative h-48 bg-gray-900 overflow-hidden" key={`img-${property.id}`}>
                {(property as any).firstImage || property.primaryImage ? (
                  <>
                    <img
                      key={`img-${property.id}`}
                      src={`${(property as any).firstImage || property.primaryImage}?t=${property.id}`}
                      alt={property.address}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                        const parent = img.parentElement;
                        if (parent && !parent.querySelector('[data-no-image]')) {
                          const fallback = document.createElement('div');
                          fallback.setAttribute('data-no-image', 'true');
                          fallback.className = 'absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-900';
                          fallback.innerHTML = '<svg class="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg><div class="text-center"><p class="text-gray-300 font-medium">No Picture Available</p><p class="text-gray-500 text-xs mt-1">Image coming soon</p></div>';
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  </>
                ) : (
                  <NoPictureAvailable size="md" />
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
                  {
                )}
              {

              {/* Property Details */}
              <CardContent className="p-4">
                {/* Price */}
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {formatPrice(property.price)}
                {

                {/* Specs */}
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Bed className="h-4 w-4" />
                    <span>{property.bedrooms} beds</span>
                  {
                  <div className="flex items-center gap-1">
                    <Bath className="h-4 w-4" />
                    <span>{property.bathrooms} baths</span>
                  {
                  {property.sqft && (
                    <div className="flex items-center gap-1">
                      <Ruler className="h-4 w-4" />
                      <span>{property.sqft.toLocaleString()} sqft</span>
                    {
                  )}
                {

                {/* Address */}
                <div className="text-sm text-gray-700 mb-1">{property.address}{
                <div className="text-sm text-gray-500">
                  {property.city}, {property.state} {property.zipCode}
                {

                {/* Property Type */}
                <div className="mt-3">
                  <Badge variant="outline" className="text-xs">
                    {property.propertyType.replace('_', ' ').toUpperCase()}
                  </Badge>
                {
              </CardContent>
            </Card>
            ))}
              {
            {

            {/* Sidebar - Agent Banners */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <AgentBanner placement="sidebar" className="mb-4" />
              {
            {
          {
        )}
      {

      {/* Buyer Registration Modal */}
      <BuyerRegistrationModal
        open={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        propertyAddress={selectedProperty?.address}
        propertyPrice={selectedProperty?.price}
        propertyId={selectedProperty?.mlsId}
      />
      
      {/* Mortgage Calculator Modal */}
      <MortgageCalculatorModal
        isOpen={showMortgageCalculator}
        onClose={() => setShowMortgageCalculator(false)}
        propertyPrice={calculatorProperty?.price || 0}
        propertyAddress={calculatorProperty?.address}
      />
    {
  );
}

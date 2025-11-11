import { useState } from 'react';
import { useRoute, Link } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Heart,
  Share2,
  MapPin,
  Bed,
  Bath,
  Ruler,
  Calendar,
  Home,
  Car,
  ChevronLeft,
  ChevronRight,
  X,
  Phone,
  Mail,
  MessageSquare,
} from 'lucide-react';

export default function PropertyDetail() {
  const [, params] = useRoute('/properties/:id');
  const propertyId = params?.id ? parseInt(params.id) : 0;

  const { data: property, isLoading } = trpc.properties.getById.useQuery(
    { id: propertyId },
    { enabled: !!propertyId }
  );

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading property...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Property Not Found</h2>
          <p className="mt-2 text-gray-600">The property you're looking for doesn't exist.</p>
          <Link href="/properties">
            <Button className="mt-4">Back to Properties</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Gallery images (primary + additional images)
  const galleryImages = [
    property.primaryImage || '/properties/pQT9duRUSVYo.jpg',
    '/properties/HgIroWElMYoD.jpg', // Living room
    '/properties/7CzYMmDBFQ3i.jpg', // Kitchen
    '/properties/bUHg6EduxiQU.jpg', // Pool
    '/properties/ZJAwbnXTGzRi.jpg', // Interior 2
    '/properties/y1fgGAdJxKKA.jpg', // Kitchen 2
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(parseInt(price));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Back Button */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <Link href="/properties">
            <Button variant="ghost" className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Back to Search
            </Button>
          </Link>
        </div>
      </div>

      {/* Photo Gallery */}
      <div className="relative">
        <div className="grid grid-cols-4 gap-2 h-[500px]">
          {/* Main large image */}
          <div
            className="col-span-2 row-span-2 relative cursor-pointer overflow-hidden group"
            onClick={() => {
              setCurrentImageIndex(0);
              setShowLightbox(true);
            }}
          >
            <img
              src={galleryImages[0]}
              alt="Property main view"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>

          {/* Smaller images grid */}
          {galleryImages.slice(1, 5).map((img, idx) => (
            <div
              key={idx}
              className="relative cursor-pointer overflow-hidden group"
              onClick={() => {
                setCurrentImageIndex(idx + 1);
                setShowLightbox(true);
              }}
            >
              <img
                src={img}
                alt={`Property view ${idx + 2}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              {idx === 3 && galleryImages.length > 5 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    +{galleryImages.length - 5} more
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* View Photos Button */}
        <Button
          className="absolute bottom-4 right-4 bg-white text-gray-900 hover:bg-gray-100 gap-2"
          onClick={() => setShowLightbox(true)}
        >
          <Home className="w-4 h-4" />
          View all {galleryImages.length} photos
        </Button>
      </div>

      {/* Lightbox */}
      {showLightbox && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <Button
            variant="ghost"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={() => setShowLightbox(false)}
          >
            <X className="w-6 h-6" />
          </Button>

          <Button
            variant="ghost"
            className="absolute left-4 text-white hover:bg-white/20"
            onClick={prevImage}
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>

          <img
            src={galleryImages[currentImageIndex]}
            alt="Property"
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />

          <Button
            variant="ghost"
            className="absolute right-4 text-white hover:bg-white/20"
            onClick={nextImage}
          >
            <ChevronRight className="w-8 h-8" />
          </Button>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white">
            {currentImageIndex + 1} / {galleryImages.length}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-gray-900">
                    {formatPrice(property.price)}
                  </h1>
                  <div className="flex items-center gap-4 mt-3 text-lg text-gray-700">
                    <span className="flex items-center gap-1">
                      <Bed className="w-5 h-5" />
                      {property.bedrooms} beds
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="w-5 h-5" />
                      {property.bathrooms} baths
                    </span>
                    <span className="flex items-center gap-1">
                      <Ruler className="w-5 h-5" />
                      {property.sqft?.toLocaleString()} sqft
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-gray-600">
                    <MapPin className="w-5 h-5" />
                    <span className="text-lg">
                      {property.address}, {property.city}, {property.state} {property.zipCode}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsFavorite(!isFavorite)}
                  >
                    <Heart
                      className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
                    />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Property Type Badge */}
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {property.propertyType === 'single_family'
                    ? 'Single Family'
                    : property.propertyType === 'condo'
                    ? 'Condo'
                    : property.propertyType === 'townhouse'
                    ? 'Townhouse'
                    : 'Multi Family'}
                </span>
                {property.hasVirtualTour && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    3D Tour Available
                  </span>
                )}
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  For Sale
                </span>
              </div>
            </div>

            {/* Overview */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Home className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Property Type</p>
                    <p className="font-semibold">
                      {property.propertyType === 'single_family' ? 'Single Family' : 'Condo'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Year Built</p>
                    <p className="font-semibold">{property.yearBuilt || '2020'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Car className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Parking</p>
                    <p className="font-semibold">2 Car Garage</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Ruler className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Lot Size</p>
                    <p className="font-semibold">0.25 acres</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Home className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">HOA</p>
                    <p className="font-semibold">$150/month</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">MLS ID</p>
                    <p className="font-semibold">{property.mlsId}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Description */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">About This Home</h2>
              <p className="text-gray-700 leading-relaxed">
                {property.description ||
                  `Welcome to this stunning ${property.bedrooms}-bedroom, ${property.bathrooms}-bathroom home located in the desirable ${property.city} area. This beautiful property features modern finishes throughout, an open floor plan perfect for entertaining, and a spacious backyard. The gourmet kitchen boasts stainless steel appliances, granite countertops, and plenty of cabinet space. The master suite includes a walk-in closet and luxurious en-suite bathroom. Additional features include a 2-car garage, energy-efficient windows, and smart home technology. Don't miss this opportunity to own a piece of paradise in Central Florida!`}
              </p>
            </Card>

            {/* Key Features */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Key Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'Hardwood Floors',
                  'Granite Countertops',
                  'Stainless Steel Appliances',
                  'Central Air Conditioning',
                  'Walk-in Closets',
                  'Tile Bathrooms',
                  'Private Backyard',
                  'Energy Efficient Windows',
                  'Smart Home Ready',
                  'Community Pool Access',
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column - Contact Form */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-4">Contact Agent</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="I'm interested in this property..."
                  />
                </div>

                <Button className="w-full gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Request Information
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="gap-2">
                    <Phone className="w-4 h-4" />
                    Call
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <Button variant="outline" className="w-full">
                    Schedule a Tour
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

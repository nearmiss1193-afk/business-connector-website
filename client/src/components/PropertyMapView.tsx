import { useEffect, useRef, useState } from 'react';
import { MapView } from '@/components/Map';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Home, Bed, Bath, Maximize2 } from 'lucide-react';

interface Property {
  id: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  latitude: number;
  longitude: number;
  primaryImage?: string;
}

interface PropertyMapViewProps {
  properties: Property[];
  onPropertyClick?: (property: Property) => void;
}

export default function PropertyMapView({ properties, onPropertyClick }: PropertyMapViewProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const handleMapReady = (mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    
    // Create info window
    infoWindowRef.current = new google.maps.InfoWindow();
    
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    
    // Create markers for all properties
    const newMarkers = properties
      .filter(p => p.latitude && p.longitude)
      .map(property => {
        const marker = new google.maps.Marker({
          position: { lat: property.latitude, lng: property.longitude },
          map: mapInstance,
          title: property.address,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="40" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 0C7.2 0 0 7.2 0 16c0 8.8 16 24 16 24s16-15.2 16-24c0-8.8-7.2-16-16-16z" fill="#006AFF"/>
                <circle cx="16" cy="16" r="6" fill="white"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(32, 40),
            anchor: new google.maps.Point(16, 40)
          }
        });

        marker.addListener('click', () => {
          setSelectedProperty(property);
          
          // Show info window
          if (infoWindowRef.current) {
            const content = `
              <div style="padding: 8px; max-width: 200px;">
                <div style="font-weight: 600; font-size: 16px; margin-bottom: 4px;">
                  $${property.price.toLocaleString()}
                </div>
                <div style="font-size: 14px; color: #666; margin-bottom: 8px;">
                  ${property.address}
                </div>
                <div style="font-size: 13px; color: #888;">
                  ${property.bedrooms} bed • ${property.bathrooms} bath • ${property.squareFeet.toLocaleString()} sqft
                </div>
              </div>
            `;
            infoWindowRef.current.setContent(content);
            infoWindowRef.current.open(mapInstance, marker);
          }
        });

        return marker;
      });

    setMarkers(newMarkers);

    // Fit bounds to show all markers
    if (newMarkers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      newMarkers.forEach(marker => {
        const position = marker.getPosition();
        if (position) bounds.extend(position);
      });
      mapInstance.fitBounds(bounds);
    }
  };

  const handlePropertyCardClick = (property: Property) => {
    if (onPropertyClick) {
      onPropertyClick(property);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="relative w-full h-full">
      <MapView
        onMapReady={handleMapReady}
        defaultCenter={{ lat: 28.5383, lng: -81.3792 }} // Orlando, FL
        defaultZoom={10}
        className="w-full h-full"
      />

      {/* Selected Property Card */}
      {selectedProperty && (
        <Card className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-96 max-w-[calc(100%-2rem)] shadow-lg z-10">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white"
              onClick={() => setSelectedProperty(null)}
            >
              <X className="h-4 w-4" />
            </Button>

            {selectedProperty.primaryImage && (
              <img
                src={selectedProperty.primaryImage}
                alt={selectedProperty.address}
                className="w-full h-48 object-cover rounded-t-lg"
              />
            )}

            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(selectedProperty.price)}
                </span>
              </div>

              <div className="text-sm text-gray-600 mb-3">
                {selectedProperty.address}, {selectedProperty.city}, {selectedProperty.state} {selectedProperty.zipCode}
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Bed className="h-4 w-4" />
                  <span>{selectedProperty.bedrooms} beds</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bath className="h-4 w-4" />
                  <span>{selectedProperty.bathrooms} baths</span>
                </div>
                <div className="flex items-center gap-1">
                  <Maximize2 className="h-4 w-4" />
                  <span>{selectedProperty.squareFeet.toLocaleString()} sqft</span>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => handlePropertyCardClick(selectedProperty)}
              >
                <Home className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Property Count Badge */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md px-4 py-2 z-10">
        <span className="font-semibold text-gray-900">
          {properties.length} {properties.length === 1 ? 'Property' : 'Properties'}
        </span>
      </div>
    </div>
  );
}

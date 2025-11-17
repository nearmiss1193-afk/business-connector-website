import { useEffect, useRef, useState } from 'react';
import { MapView } from '@/components/Map';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Home, Bed, Bath, Maximize2, ZoomIn, ZoomOut, Locate } from 'lucide-react';

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
  firstImage?: string;
}

interface PropertyMapViewProps {
  properties: Property[];
  onPropertyClick?: (property: Property) => void;
  selectedPropertyId?: number;
  onMarkerHover?: (property: Property | null) => void;
}

export default function PropertyMapView({ 
  properties, 
  onPropertyClick,
  selectedPropertyId,
  onMarkerHover 
}: PropertyMapViewProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [hoveredProperty, setHoveredProperty] = useState<Property | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<Map<number, google.maps.Marker>>(new Map());
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();

  // Center map on selected property
  useEffect(() => {
    if (map && selectedPropertyId) {
      const property = properties.find(p => p.id === selectedPropertyId);
      if (property && property.latitude && property.longitude) {
        map.panTo({ lat: property.latitude, lng: property.longitude });
        map.setZoom(15);
        
        // Highlight the marker
        const marker = markers.get(property.id);
        if (marker) {
          // Animate marker
          marker.setAnimation(google.maps.Animation.BOUNCE);
          setTimeout(() => marker.setAnimation(null), 2100); // 3 bounces
        }
      }
    }
  }, [selectedPropertyId, map, properties, markers]);

  const handleMapReady = (mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    
    // Create info window for hover
    infoWindowRef.current = new google.maps.InfoWindow();
    
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    markers.clear();
    
    // Create markers for all properties
    const newMarkers = new Map<number, google.maps.Marker>();
    
    properties
      .filter(p => p.latitude && p.longitude)
      .forEach(property => {
        // Custom marker with price
        const priceLabel = `$${(property.price / 1000).toFixed(0)}K`;
        
        const marker = new google.maps.Marker({
          position: { lat: property.latitude, lng: property.longitude },
          map: mapInstance,
          title: property.address,
          label: {
            text: priceLabel,
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold'
          },
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="80" height="32" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="80" height="32" rx="16" fill="#1e40af" stroke="white" stroke-width="2"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(80, 32),
            anchor: new google.maps.Point(40, 16),
            labelOrigin: new google.maps.Point(40, 16)
          }
        });

        // Click listener
        marker.addListener('click', () => {
          setSelectedProperty(property);
          if (onPropertyClick) {
            onPropertyClick(property);
          }
        });

        // Hover listeners for preview card
        marker.addListener('mouseover', () => {
          // Clear any pending timeout
          if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
          }
          
          // Show hover preview after short delay
          hoverTimeoutRef.current = setTimeout(() => {
            setHoveredProperty(property);
            if (onMarkerHover) {
              onMarkerHover(property);
            }

            // Change marker appearance on hover
            marker.setIcon({
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="80" height="32" xmlns="http://www.w3.org/2000/svg">
                  <rect x="0" y="0" width="80" height="32" rx="16" fill="#2563eb" stroke="white" stroke-width="3"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(80, 32),
              anchor: new google.maps.Point(40, 16),
              labelOrigin: new google.maps.Point(40, 16)
            });
          }, 200);
        });

        marker.addListener('mouseout', () => {
          // Clear timeout if mouse leaves before delay
          if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
          }
          
          // Restore original marker appearance
          marker.setIcon({
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="80" height="32" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="80" height="32" rx="16" fill="#1e40af" stroke="white" stroke-width="2"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(80, 32),
            anchor: new google.maps.Point(40, 16),
            labelOrigin: new google.maps.Point(40, 16)
          });
          
          // Hide hover preview after short delay
          setTimeout(() => {
            setHoveredProperty(null);
            if (onMarkerHover) {
              onMarkerHover(null);
            }
          }, 100);
        });

        newMarkers.set(property.id, marker);
      });

    setMarkers(newMarkers);

    // Fit bounds to show all markers with padding
    if (newMarkers.size > 0) {
      const bounds = new google.maps.LatLngBounds();
      newMarkers.forEach(marker => {
        const position = marker.getPosition();
        if (position) bounds.extend(position);
      });
      mapInstance.fitBounds(bounds, {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50
      });
      
      // Don't zoom in too much for single properties
      google.maps.event.addListenerOnce(mapInstance, 'bounds_changed', () => {
        const zoom = mapInstance.getZoom();
        if (zoom && zoom > 16) {
          mapInstance.setZoom(16);
        }
      });
    }
  };

  const handleZoomIn = () => {
    if (map) {
      const currentZoom = map.getZoom() || 10;
      map.setZoom(currentZoom + 1);
    }
  };

  const handleZoomOut = () => {
    if (map) {
      const currentZoom = map.getZoom() || 10;
      map.setZoom(currentZoom - 1);
    }
  };

  const handleRecenter = () => {
    if (map && markers.size > 0) {
      const bounds = new google.maps.LatLngBounds();
      markers.forEach(marker => {
        const position = marker.getPosition();
        if (position) bounds.extend(position);
      });
      map.fitBounds(bounds, {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50
      });
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

  const displayProperty = selectedProperty || hoveredProperty;
  const isHoverPreview = !selectedProperty && hoveredProperty;

  return (
    <div className="relative w-full h-full">
      <MapView
        onMapReady={handleMapReady}
        defaultCenter={{ lat: 28.5383, lng: -81.3792 }} // Orlando, FL
        defaultZoom={10}
        className="w-full h-full"
      />

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <Button
          size="icon"
          variant="secondary"
          className="bg-white hover:bg-gray-100 shadow-lg"
          onClick={handleZoomIn}
        >
          <ZoomIn className="h-5 w-5" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="bg-white hover:bg-gray-100 shadow-lg"
          onClick={handleZoomOut}
        >
          <ZoomOut className="h-5 w-5" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="bg-white hover:bg-gray-100 shadow-lg"
          onClick={handleRecenter}
        >
          <Locate className="h-5 w-5" />
        </Button>
      </div>

      {/* Hover/Selected Property Card */}
      {displayProperty && (
        <Card 
          className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 w-96 max-w-[calc(100%-2rem)] shadow-lg z-10 transition-all ${
            isHoverPreview ? 'bg-white/95 backdrop-blur-sm' : 'bg-white'
          }`}
        >
          <div className="relative">
            {!isHoverPreview && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white"
                onClick={() => setSelectedProperty(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}

            {(displayProperty.primaryImage || displayProperty.firstImage) && (
              <img
                src={displayProperty.primaryImage || displayProperty.firstImage}
                alt={displayProperty.address}
                className="w-full h-48 object-cover rounded-t-lg"
              />
            )}

            <div className="p-4">
              {isHoverPreview && (
                <div className="text-xs text-gray-500 mb-1">Hover to preview • Click to select</div>
              )}
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-blue-600">
                  {formatPrice(displayProperty.price)}
                </span>
              </div>

              <div className="text-sm text-gray-600 mb-3">
                {displayProperty.address}, {displayProperty.city}, {displayProperty.state} {displayProperty.zipCode}
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Bed className="h-4 w-4" />
                  <span>{displayProperty.bedrooms} beds</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bath className="h-4 w-4" />
                  <span>{displayProperty.bathrooms} baths</span>
                </div>
                {displayProperty.squareFeet > 0 && (
                  <div className="flex items-center gap-1">
                    <Maximize2 className="h-4 w-4" />
                    <span>{displayProperty.squareFeet.toLocaleString()} sqft</span>
                  </div>
                )}
              </div>

              {!isHoverPreview && (
                <Button
                  className="w-full"
                  onClick={() => handlePropertyCardClick(displayProperty)}
                >
                  <Home className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              )}
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

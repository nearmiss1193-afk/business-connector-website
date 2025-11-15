import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { MapView } from '@/components/Map';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bed, Bath, Maximize, MapIcon, List, LayoutGrid } from 'lucide-react';

interface Property {
  id: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: string;
  bedrooms: number;
  bathrooms: string;
  sqft: string;
  propertyType: string;
  listingStatus: string;
  primaryImage: string | null;
  latitude: string | null;
  longitude: string | null;
  mlsId: string | null;
}

interface MapListViewProps {
  properties: Property[];
  onPropertyHover?: (propertyId: number | null) => void;
  onPropertyClick?: (propertyId: number) => void;
}

type ViewMode = 'split' | 'map' | 'list';

export default function MapListView({ properties, onPropertyHover, onPropertyClick }: MapListViewProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<Map<number, google.maps.Marker>>(new Map());
  const [hoveredPropertyId, setHoveredPropertyId] = useState<number | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Initialize map and markers
  useEffect(() => {
    if (!map || !window.google) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    const newMarkers = new Map<number, google.maps.Marker>();

    // Create info window
    const iw = new google.maps.InfoWindow();
    setInfoWindow(iw);

    // Add markers for each property
    const bounds = new google.maps.LatLngBounds();
    
    properties.forEach(property => {
      if (!property.latitude || !property.longitude) return;

      const lat = parseFloat(property.latitude);
      const lng = parseFloat(property.longitude);
      const position = { lat, lng };

      // Create custom marker with price label
      const priceLabel = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(parseFloat(property.price));

      const marker = new google.maps.Marker({
        position,
        map,
        title: property.address,
        label: {
          text: priceLabel,
          color: '#ffffff',
          fontSize: '12px',
          fontWeight: 'bold',
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 20,
          fillColor: '#2563eb',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });

      // Click handler for marker
      marker.addListener('click', () => {
        setSelectedPropertyId(property.id);
        
        // Scroll to card
        const cardElement = cardRefs.current.get(property.id);
        if (cardElement && listRef.current) {
          cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Show info window
        const content = `
          <div style="padding: 8px; max-width: 250px;">
            ${property.primaryImage ? `<img src="${property.primaryImage}" alt="${property.address}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />` : ''}
            <div style="font-weight: bold; font-size: 18px; color: #1f2937; margin-bottom: 4px;">${priceLabel}</div>
            <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">${property.bedrooms} bd | ${property.bathrooms} ba | ${new Intl.NumberFormat('en-US').format(parseFloat(property.sqft))} sqft</div>
            <div style="font-size: 13px; color: #9ca3af;">${property.address}</div>
            <div style="font-size: 13px; color: #9ca3af;">${property.city}, ${property.state} ${property.zipCode}</div>
            <a href="/properties/${property.id}" style="display: inline-block; margin-top: 8px; color: #2563eb; text-decoration: none; font-size: 13px; font-weight: 600;">View Details →</a>
          </div>
        `;
        iw.setContent(content);
        iw.open(map, marker);
      });

      // Hover handlers
      marker.addListener('mouseover', () => {
        setHoveredPropertyId(property.id);
        marker.setIcon({
          path: google.maps.SymbolPath.CIRCLE,
          scale: 24,
          fillColor: '#1d4ed8',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        });
      });

      marker.addListener('mouseout', () => {
        if (hoveredPropertyId === property.id) {
          setHoveredPropertyId(null);
        }
        marker.setIcon({
          path: google.maps.SymbolPath.CIRCLE,
          scale: 20,
          fillColor: '#2563eb',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        });
      });

      newMarkers.set(property.id, marker);
      bounds.extend(position);
    });

    setMarkers(newMarkers);

    // Fit map to bounds
    if (properties.length > 0) {
      map.fitBounds(bounds);
      // Prevent too much zoom for single property
      const listener = google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
        if (map.getZoom()! > 15) {
          map.setZoom(15);
        }
      });
    }

    return () => {
      newMarkers.forEach(marker => marker.setMap(null));
      if (iw) {
        iw.close();
      }
    };
  }, [map, properties]);

  // Update marker appearance when hovering over cards
  useEffect(() => {
    markers.forEach((marker, propertyId) => {
      if (propertyId === hoveredPropertyId) {
        marker.setIcon({
          path: google.maps.SymbolPath.CIRCLE,
          scale: 24,
          fillColor: '#1d4ed8',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        });
        marker.setZIndex(1000);
      } else {
        marker.setIcon({
          path: google.maps.SymbolPath.CIRCLE,
          scale: 20,
          fillColor: '#2563eb',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        });
        marker.setZIndex(undefined);
      }
    });
  }, [hoveredPropertyId, markers]);

  const handleCardHover = (propertyId: number | null) => {
    setHoveredPropertyId(propertyId);
    if (onPropertyHover) {
      onPropertyHover(propertyId);
    }
  };

  const handleCardClick = (propertyId: number) => {
    setSelectedPropertyId(propertyId);
    
    // Center map on property
    const marker = markers.get(propertyId);
    if (marker && map) {
      map.panTo(marker.getPosition()!);
      map.setZoom(15);
    }
    
    if (onPropertyClick) {
      onPropertyClick(propertyId);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* View Mode Toggle */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {properties.length} {properties.length === 1 ? 'property' : 'properties'} found
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'map' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('map')}
            className="gap-2"
          >
            <MapIcon className="w-4 h-4" />
            Map
          </Button>
          <Button
            variant={viewMode === 'split' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('split')}
            className="gap-2"
          >
            <LayoutGrid className="w-4 h-4" />
            Split
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="gap-2"
          >
            <List className="w-4 h-4" />
            List
          </Button>
        </div>
      </div>

      {/* Split Screen Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map Panel */}
        {(viewMode === 'map' || viewMode === 'split') && (
          <div className={viewMode === 'split' ? 'w-1/2 border-r' : 'w-full'}>
            <MapView
              onMapReady={(mapInstance) => {
                setMap(mapInstance);
                // Center on Florida
                mapInstance.setCenter({ lat: 28.5383, lng: -81.3792 });
                mapInstance.setZoom(10);
              }}
              className="w-full h-full"
            />
          </div>
        )}

        {/* List Panel */}
        {(viewMode === 'list' || viewMode === 'split') && (
          <div
            ref={listRef}
            className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} overflow-y-auto bg-gray-50 p-4`}
          >
            <div className="grid grid-cols-1 gap-4">
              {properties.map((property) => (
                <div
                  key={property.id}
                  ref={(el) => {
                    if (el) {
                      cardRefs.current.set(property.id, el);
                    }
                  }}
                  onMouseEnter={() => handleCardHover(property.id)}
                  onMouseLeave={() => handleCardHover(null)}
                  onClick={() => handleCardClick(property.id)}
                >
                  <Link href={`/properties/${property.id}`}>
                    <Card
                      className={`overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer ${
                        hoveredPropertyId === property.id || selectedPropertyId === property.id
                          ? 'ring-2 ring-blue-600 shadow-xl'
                          : ''
                      }`}
                    >
                      <div className="flex">
                        {/* Property Image */}
                        <div className="w-64 h-48 bg-gray-100 flex-shrink-0 relative">
                          <img
                            src={(property as any).firstImage || property.primaryImage || '/properties/pQT9duRUSVYo.jpg'}
                            alt={property.address}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.src = '/properties/pQT9duRUSVYo.jpg';
                            }}
                          />
                          {/* Status & Feature Badges */}
                          <div className="absolute top-2 left-2 flex flex-col gap-1">
                            {/* Status Badges */}
                            {(() => {
                              const badges = [];
                              // New listing (within 7 days)
                              if (property.listingDate) {
                                const daysSinceListing = Math.floor(
                                  (Date.now() - new Date(property.listingDate).getTime()) / (1000 * 60 * 60 * 24)
                                );
                                if (daysSinceListing <= 7) {
                                  badges.push(
                                    <span key="new" className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded">
                                      NEW
                                    </span>
                                  );
                                }
                              }
                              // Pending status
                              if (property.listingStatus?.toLowerCase() === 'pending') {
                                badges.push(
                                  <span key="pending" className="bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded">
                                    PENDING
                                  </span>
                                );
                              }
                              // Open House (placeholder - would need openHouseDate field)
                              // Price Drop (placeholder - would need priceHistory field)
                              return badges;
                            })()}
                            {/* Feature Badges */}
                            {property.features && (() => {
                              try {
                                const features = JSON.parse(property.features);
                                return features.length > 0 && (
                                  <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded">
                                    {features[0]}
                                  </span>
                                );
                              } catch {
                                return null;
                              }
                            })()}
                          </div>
                        </div>

                        {/* Property Details */}
                        <CardContent className="flex-1 p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="text-2xl font-bold text-gray-900">
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                maximumFractionDigits: 0,
                              }).format(parseFloat(property.price))}
                            </div>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">
                              {property.listingStatus}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-gray-700 mb-3">
                            <div className="flex items-center gap-1">
                              <Bed className="w-4 h-4" />
                              <span className="text-sm font-medium">{property.bedrooms} bd</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Bath className="w-4 h-4" />
                              <span className="text-sm font-medium">{property.bathrooms} ba</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Maximize className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                {new Intl.NumberFormat('en-US').format(parseFloat(property.sqft))} sqft
                              </span>
                            </div>
                          </div>

                          <div className="text-sm font-medium text-gray-900 mb-1">
                            {property.address}
                          </div>
                          <div className="text-sm text-gray-500">
                            {property.city}, {property.state} {property.zipCode}
                          </div>

                          {property.mlsId && (
                            <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                              MLS ID #{property.mlsId}
                            </div>
                          )}
                        </CardContent>
                      </div>
                    </Card>
                  </Link>
                </div>
              ))}
            </div>

            {properties.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No properties found matching your criteria</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search area</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

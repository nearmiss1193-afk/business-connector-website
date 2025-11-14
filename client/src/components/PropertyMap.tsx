import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapView } from '@/components/Map';
import { MapPin, School, ShoppingBag, Coffee, Utensils } from 'lucide-react';

interface PropertyMapProps {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
}

export default function PropertyMap({
  address,
  city,
  state,
  zipCode,
  latitude,
  longitude,
}: PropertyMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);
  const [propertyLocation, setPropertyLocation] = useState<google.maps.LatLngLiteral | null>(null);

  const fullAddress = `${address}, ${city}, ${state} ${zipCode}`;

  const handleMapReady = (mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    
    // Initialize Geocoder
    const geocoderInstance = new google.maps.Geocoder();
    setGeocoder(geocoderInstance);

    // Initialize Places Service
    const placesServiceInstance = new google.maps.places.PlacesService(mapInstance);
    setPlacesService(placesServiceInstance);

    // Geocode the property address
    if (latitude && longitude) {
      const location = { lat: latitude, lng: longitude };
      setPropertyLocation(location);
      addPropertyMarker(mapInstance, location);
      searchNearbyPlaces(mapInstance, placesServiceInstance, location);
    } else {
      geocoderInstance.geocode({ address: fullAddress }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location.toJSON();
          setPropertyLocation(location);
          mapInstance.setCenter(location);
          mapInstance.setZoom(14);
          addPropertyMarker(mapInstance, location);
          searchNearbyPlaces(mapInstance, placesServiceInstance, location);
        }
      });
    }
  };

  const addPropertyMarker = (mapInstance: google.maps.Map, location: google.maps.LatLngLiteral) => {
    // Create custom property marker
    const marker = new google.maps.Marker({
      position: location,
      map: mapInstance,
      title: address,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#2563eb',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      },
    });

    // Add info window
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 8px; max-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">
            ${address}
          </h3>
          <p style="margin: 0; font-size: 14px; color: #6b7280;">
            ${city}, ${state} ${zipCode}
          </p>
        </div>
      `,
    });

    marker.addListener('click', () => {
      infoWindow.open(mapInstance, marker);
    });

    // Open by default
    infoWindow.open(mapInstance, marker);
  };

  const searchNearbyPlaces = (
    mapInstance: google.maps.Map,
    placesServiceInstance: google.maps.places.PlacesService,
    location: google.maps.LatLngLiteral
  ) => {
    const placeTypes = [
      { type: 'school', icon: '🏫', color: '#10b981' },
      { type: 'supermarket', icon: '🛒', color: '#f59e0b' },
      { type: 'restaurant', icon: '🍽️', color: '#ef4444' },
      { type: 'cafe', icon: '☕', color: '#8b5cf6' },
    ];

    placeTypes.forEach((placeType) => {
      const request: google.maps.places.PlaceSearchRequest = {
        location: location,
        radius: 2000, // 2km radius
        type: placeType.type,
      };

      placesServiceInstance.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          // Show top 3 results for each category
          results.slice(0, 3).forEach((place) => {
            if (place.geometry?.location) {
              const marker = new google.maps.Marker({
                position: place.geometry.location,
                map: mapInstance,
                title: place.name,
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: placeType.color,
                  fillOpacity: 0.8,
                  strokeColor: '#ffffff',
                  strokeWeight: 2,
                },
              });

              const infoWindow = new google.maps.InfoWindow({
                content: `
                  <div style="padding: 8px; max-width: 200px;">
                    <div style="font-size: 20px; margin-bottom: 4px;">${placeType.icon}</div>
                    <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #1f2937;">
                      ${place.name}
                    </h4>
                    <p style="margin: 0; font-size: 12px; color: #6b7280;">
                      ${place.vicinity || ''}
                    </p>
                    ${
                      place.rating
                        ? `<p style="margin: 4px 0 0 0; font-size: 12px; color: #f59e0b;">
                        ⭐ ${place.rating}/5
                      </p>`
                        : ''
                    }
                  </div>
                `,
              });

              marker.addListener('click', () => {
                infoWindow.open(mapInstance, marker);
              });
            }
          });
        }
      });
    });
  };

  return (
    <Card className="border-gray-200">
      <CardHeader className="bg-purple-50 border-b border-purple-100">
        <CardTitle className="flex items-center gap-2 text-xl">
          <MapPin className="w-5 h-5 text-purple-600" />
          Location & Nearby Places
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[500px] w-full">
          <MapView
            onMapReady={handleMapReady}
            defaultCenter={
              latitude && longitude
                ? { lat: latitude, lng: longitude }
                : { lat: 28.5383, lng: -81.3792 } // Orlando, FL default
            }
            defaultZoom={14}
          />
        </div>

        {/* Legend */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Map Legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white"></div>
              <span className="text-gray-700">Property</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-700">Schools</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-gray-700">Grocery</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-700">Restaurants</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-gray-700">Cafes</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

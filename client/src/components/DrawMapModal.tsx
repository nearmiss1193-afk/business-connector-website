import { useEffect, useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapView } from '@/components/Map';
import { X } from 'lucide-react';

interface DrawMapModalProps {
  open: boolean;
  onClose: () => void;
  onPolygonDrawn: (coordinates: google.maps.LatLngLiteral[]) => void;
}

export default function DrawMapModal({ open, onClose, onPolygonDrawn }: DrawMapModalProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);
  const [currentPolygon, setCurrentPolygon] = useState<google.maps.Polygon | null>(null);
  const [coordinates, setCoordinates] = useState<google.maps.LatLngLiteral[]>([]);

  useEffect(() => {
    if (!map || !window.google) return;

    // Initialize Drawing Manager
    const manager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.POLYGON,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [
          google.maps.drawing.OverlayType.POLYGON,
          google.maps.drawing.OverlayType.RECTANGLE,
          google.maps.drawing.OverlayType.CIRCLE,
        ],
      },
      polygonOptions: {
        fillColor: '#2563eb',
        fillOpacity: 0.2,
        strokeWeight: 2,
        strokeColor: '#2563eb',
        clickable: true,
        editable: true,
        zIndex: 1,
      },
      rectangleOptions: {
        fillColor: '#2563eb',
        fillOpacity: 0.2,
        strokeWeight: 2,
        strokeColor: '#2563eb',
        clickable: true,
        editable: true,
        zIndex: 1,
      },
      circleOptions: {
        fillColor: '#2563eb',
        fillOpacity: 0.2,
        strokeWeight: 2,
        strokeColor: '#2563eb',
        clickable: true,
        editable: true,
        zIndex: 1,
      },
    });

    manager.setMap(map);
    setDrawingManager(manager);

    // Listen for polygon complete
    google.maps.event.addListener(manager, 'overlaycomplete', (event: any) => {
      // Clear previous polygon
      if (currentPolygon) {
        currentPolygon.setMap(null);
      }

      let coords: google.maps.LatLngLiteral[] = [];

      if (event.type === google.maps.drawing.OverlayType.POLYGON) {
        const polygon = event.overlay as google.maps.Polygon;
        setCurrentPolygon(polygon);
        const path = polygon.getPath();
        coords = path.getArray().map((latLng) => ({
          lat: latLng.lat(),
          lng: latLng.lng(),
        }));
      } else if (event.type === google.maps.drawing.OverlayType.RECTANGLE) {
        const rectangle = event.overlay as google.maps.Rectangle;
        const bounds = rectangle.getBounds();
        if (bounds) {
          const ne = bounds.getNorthEast();
          const sw = bounds.getSouthWest();
          coords = [
            { lat: ne.lat(), lng: ne.lng() },
            { lat: ne.lat(), lng: sw.lng() },
            { lat: sw.lat(), lng: sw.lng() },
            { lat: sw.lat(), lng: ne.lng() },
          ];
        }
        // Convert rectangle to polygon for consistency
        const polygon = new google.maps.Polygon({
          paths: coords,
          fillColor: '#2563eb',
          fillOpacity: 0.2,
          strokeWeight: 2,
          strokeColor: '#2563eb',
          editable: true,
        });
        polygon.setMap(map);
        rectangle.setMap(null);
        setCurrentPolygon(polygon);
      } else if (event.type === google.maps.drawing.OverlayType.CIRCLE) {
        const circle = event.overlay as google.maps.Circle;
        const center = circle.getCenter();
        const radius = circle.getRadius();
        
        // Convert circle to polygon approximation (36 points)
        const numPoints = 36;
        coords = [];
        for (let i = 0; i < numPoints; i++) {
          const angle = (i * 360) / numPoints;
          const lat = center!.lat() + (radius / 111320) * Math.cos((angle * Math.PI) / 180);
          const lng = center!.lng() + (radius / (111320 * Math.cos((center!.lat() * Math.PI) / 180))) * Math.sin((angle * Math.PI) / 180);
          coords.push({ lat, lng });
        }
        
        // Convert circle to polygon for consistency
        const polygon = new google.maps.Polygon({
          paths: coords,
          fillColor: '#2563eb',
          fillOpacity: 0.2,
          strokeWeight: 2,
          strokeColor: '#2563eb',
          editable: true,
        });
        polygon.setMap(map);
        circle.setMap(null);
        setCurrentPolygon(polygon);
      }

      setCoordinates(coords);
      
      // Stop drawing mode after shape is complete
      manager.setDrawingMode(null);
    });

    return () => {
      if (manager) {
        google.maps.event.clearInstanceListeners(manager);
        manager.setMap(null);
      }
    };
  }, [map]);

  const handleClear = () => {
    if (currentPolygon) {
      currentPolygon.setMap(null);
      setCurrentPolygon(null);
    }
    setCoordinates([]);
    if (drawingManager) {
      drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
    }
  };

  const handleSearch = () => {
    if (coordinates.length > 0) {
      onPolygonDrawn(coordinates);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">Draw Search Area</DialogTitle>
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Use the drawing tools to define your search area on the map
          </p>
        </DialogHeader>

        <div className="flex-1 relative">
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

        <div className="p-6 border-t flex items-center justify-between bg-white">
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={!currentPolygon}
          >
            Clear Drawing
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSearch}
              disabled={coordinates.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Search This Area
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

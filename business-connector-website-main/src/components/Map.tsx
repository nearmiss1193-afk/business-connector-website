import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

type MapMarker = {
  id?: string;
  lat: number;
  lng: number;
  label?: string;
  image?: string;
  onClick?: () => void;
};

interface MapViewProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
  markers?: MapMarker[];
  fitToMarkers?: boolean;
}

let leafletIconsPatched = false;
function patchLeafletDefaultIcon() {
  if (leafletIconsPatched) return;
  leafletIconsPatched = true;
  const iconDefault = L.Icon.Default.prototype as any;
  iconDefault.options.iconRetinaUrl = markerIcon2x;
  iconDefault.options.iconUrl = markerIcon;
  iconDefault.options.shadowUrl = markerShadow;
}

const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

function createPhotoIcon(image: string, label?: string) {
  return L.divIcon({
    html: `<div class="cfh-map-marker"><img alt="${label ?? "Listing"}" src="${image}" /></div>`,
    className: "cfh-map-marker-wrapper",
    iconSize: [52, 52],
    iconAnchor: [26, 46],
  });
}

export function MapView({
  center = { lat: 28.5383, lng: -81.3792 },
  zoom = 12,
  className = "w-full h-full",
  markers = [],
  fitToMarkers = false,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);

  const markersSignature = useMemo(
    () => JSON.stringify(markers.map((m) => ({ id: m.id ?? "", lat: Number(m.lat.toFixed(5)), lng: Number(m.lng.toFixed(5)), label: m.label ?? "", hasImage: Boolean(m.image) }))),
    [markers]
  );

  useEffect(() => {
    patchLeafletDefaultIcon();
    if (typeof window === "undefined" || !containerRef.current || mapRef.current) {
      return;
    }
    const map = L.map(containerRef.current, {
      center: [center.lat, center.lng],
      zoom,
      scrollWheelZoom: true,
    });
    L.tileLayer(TILE_URL, {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);
    markerLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    if (fitToMarkers && markers.length > 0) {
      const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng] as [number, number]));
      mapRef.current.fitBounds(bounds, { padding: [24, 24] });
    } else {
      mapRef.current.setView([center.lat, center.lng], zoom);
    }
  }, [center.lat, center.lng, zoom, fitToMarkers, markersSignature, markers.length]);

  useEffect(() => {
    if (!markerLayerRef.current) return;
    markerLayerRef.current.clearLayers();
    markers.forEach((marker) => {
      if (!Number.isFinite(marker.lat) || !Number.isFinite(marker.lng)) return;
      const leafletMarker = L.marker([marker.lat, marker.lng], marker.image ? { icon: createPhotoIcon(marker.image, marker.label) } : undefined);
      if (marker.label) {
        leafletMarker.bindTooltip(marker.label, { direction: "top", offset: [0, -12] });
      }
      if (marker.onClick) {
        leafletMarker.on("click", () => marker.onClick?.());
      }
      leafletMarker.addTo(markerLayerRef.current!);
    });
  }, [markersSignature, markers]);

  return <div ref={containerRef} className={className} />;
}

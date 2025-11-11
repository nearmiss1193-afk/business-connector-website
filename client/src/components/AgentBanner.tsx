import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface AgentBannerProps {
  placement: 'sidebar' | 'between_listings' | 'property_detail';
  propertyId?: number;
  className?: string;
}

export default function AgentBanner({ placement, propertyId, className = '' }: AgentBannerProps) {
  const [trackedImpressions, setTrackedImpressions] = useState<Set<number>>(new Set());

  const { data } = trpc.agentAds.getAds.useQuery({
    placement,
    limit: placement === 'sidebar' ? 2 : 1,
  });

  const trackImpression = trpc.agentAds.trackImpression.useMutation();
  const trackClick = trpc.agentAds.trackClick.useMutation();

  // Track impressions when ads are visible
  useEffect(() => {
    if (data?.ads) {
      data.ads.forEach((ad) => {
        if (!trackedImpressions.has(ad.id)) {
          trackImpression.mutate({ adId: ad.id });
          setTrackedImpressions((prev) => new Set(prev).add(ad.id));
        }
      });
    }
  }, [data?.ads]);

  const handleClick = (adId: number, ctaUrl?: string) => {
    trackClick.mutate({
      adId,
      pageUrl: window.location.href,
      propertyId,
      referrer: document.referrer,
    });

    if (ctaUrl) {
      window.open(ctaUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (!data?.ads || data.ads.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {data.ads.map((ad) => (
        <Card key={ad.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative group">
            {/* Banner Image */}
            <img
              src={ad.bannerImageUrl}
              alt={ad.bannerTitle || `${ad.agentName} - ${ad.companyName}`}
              className="w-full h-auto object-cover"
            />

            {/* Overlay with CTA (appears on hover for sidebar, always visible for other placements) */}
            <div
              className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4 ${
                placement === 'sidebar' ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
              } transition-opacity duration-300`}
            >
              {ad.bannerTitle && (
                <h3 className="text-white font-bold text-lg mb-1">{ad.bannerTitle}</h3>
              )}

              {ad.bannerDescription && (
                <p className="text-white/90 text-sm mb-3 line-clamp-2">{ad.bannerDescription}</p>
              )}

              <div className="flex items-center justify-between">
                <div className="text-white/80 text-sm">
                  <div className="font-medium">{ad.agentName}</div>
                  {ad.companyName && <div className="text-xs">{ad.companyName}</div>}
                </div>

                <Button
                  size="sm"
                  onClick={() => handleClick(ad.id, ad.ctaUrl || undefined)}
                  className="bg-white text-black hover:bg-gray-100"
                >
                  {ad.ctaText || 'Contact Agent'}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Sponsored Badge */}
            <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
              Sponsored
            </div>
          </div>
        </Card>
      ))}

      {/* "Advertise Here" CTA */}
      {placement === 'sidebar' && (
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="text-center">
            <h4 className="font-bold text-gray-900 mb-2">Advertise Your Services</h4>
            <p className="text-sm text-gray-600 mb-3">
              Reach thousands of active home buyers in Central Florida
            </p>
            <Button
              size="sm"
              variant="default"
              onClick={() => (window.location.href = '/advertise')}
              className="w-full"
            >
              Learn More
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

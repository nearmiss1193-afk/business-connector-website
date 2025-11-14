/**
 * Recently Viewed Properties Component
 * Tracks and displays user's browsing history using localStorage
 */

import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface RecentlyViewedProperty {
  id: number;
  address: string;
  city: string;
  state: string;
  price: string | null;
  bedrooms: number;
  bathrooms: number;
  sqft: string | null;
  primaryImage: string | null;
  viewedAt: number;
}

const STORAGE_KEY = 'recentlyViewedProperties';
const MAX_ITEMS = 20;

export function addToRecentlyViewed(property: Omit<RecentlyViewedProperty, 'viewedAt'>) {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as RecentlyViewedProperty[];
    
    // Remove if already exists
    const filtered = existing.filter(p => p.id !== property.id);
    
    // Add to beginning with timestamp
    const updated = [
      { ...property, viewedAt: Date.now() },
      ...filtered
    ].slice(0, MAX_ITEMS);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save to recently viewed:', error);
  }
}

export function clearRecentlyViewed() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear recently viewed:', error);
  }
}

export default function RecentlyViewed() {
  const [properties, setProperties] = useState<RecentlyViewedProperty[]>([]);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    // Load from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as RecentlyViewedProperty[];
        setProperties(parsed);
      }
    } catch (error) {
      console.error('Failed to load recently viewed:', error);
    }

    // Listen for storage changes
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as RecentlyViewedProperty[];
          setProperties(parsed);
        }
      } catch (error) {
        console.error('Failed to load recently viewed:', error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleClearHistory = () => {
    clearRecentlyViewed();
    setProperties([]);
  };

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('recently-viewed-scroll');
    if (!container) return;

    const scrollAmount = 300;
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosition - scrollAmount)
      : Math.min(container.scrollWidth - container.clientWidth, scrollPosition + scrollAmount);

    container.scrollTo({ left: newPosition, behavior: 'smooth' });
    setScrollPosition(newPosition);
  };

  if (properties.length === 0) {
    return null;
  }

  return (
    <div className="bg-white py-12 border-t">
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recently Viewed</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearHistory}
            className="text-gray-600 hover:text-gray-900"
          >
            <X className="w-4 h-4 mr-2" />
            Clear History
          </Button>
        </div>

        <div className="relative">
          {/* Left Arrow */}
          {scrollPosition > 0 && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
          )}

          {/* Scrollable Container */}
          <div
            id="recently-viewed-scroll"
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
            onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
          >
            {properties.map((property) => (
              <Link key={property.id} href={`/properties/${property.id}`}>
                <Card className="flex-shrink-0 w-64 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="relative h-40 bg-gray-100">
                    <img
                      src={property.primaryImage || '/properties/pQT9duRUSVYo.jpg'}
                      alt={property.address}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-3">
                    <div className="text-lg font-bold text-gray-900 mb-1">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        maximumFractionDigits: 0,
                      }).format(parseFloat(property.price || '0'))}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {property.bedrooms} bd • {property.bathrooms} ba • {new Intl.NumberFormat('en-US').format(parseFloat(property.sqft || '0'))} sqft
                    </div>
                    <div className="text-sm text-gray-700 truncate">
                      {property.address}
                    </div>
                    <div className="text-xs text-gray-500">
                      {property.city}, {property.state}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>
    </div>
  );
}

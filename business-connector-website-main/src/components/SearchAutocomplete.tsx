/**
 * Enhanced Search Autocomplete Component
 * Features: real-time city suggestions, recent searches, loading states
 */

import { useState, useEffect, useRef } from 'react';
import { MapPin, Clock, Search, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
  placeholder?: string;
  className?: string;
}

const RECENT_SEARCHES_KEY = 'recentPropertySearches';
const MAX_RECENT_SEARCHES = 5;

export default function SearchAutocomplete({
  value,
  onChange,
  onSearch,
  placeholder = 'Enter an address, neighborhood, city, or ZIP code',
  className = '',
}: SearchAutocompleteProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch available locations
  const { data: locations, isLoading } = trpc.properties.getAvailableLocations.useQuery();

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter locations based on search value
  const filteredLocations = locations
    ?.filter((loc: any) => 
      loc.city?.toLowerCase().includes(value.toLowerCase())
    )
    .slice(0, 8) || [];

  // Popular locations (most common cities)
  const popularLocations = locations?.slice(0, 6) || [];

  // Save search to recent searches
  const saveRecentSearch = (searchValue: string) => {
    if (!searchValue.trim()) return;

    const updated = [
      searchValue,
      ...recentSearches.filter(s => s !== searchValue)
    ].slice(0, MAX_RECENT_SEARCHES);

    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    saveRecentSearch(selectedValue);
    setShowDropdown(false);
    onSearch?.();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setShowDropdown(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (value.trim()) {
        saveRecentSearch(value);
        onSearch?.();
        setShowDropdown(false);
      }
    }
  };

  const showRecent = showDropdown && !value && recentSearches.length > 0;
  const showSuggestions = showDropdown && value && filteredLocations.length > 0;
  const showPopular = showDropdown && !value && recentSearches.length === 0;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          className="pl-12 pr-4 h-14 text-lg border-2 border-gray-300 focus:border-blue-500 rounded-lg shadow-sm"
        />
        {isLoading && value && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {(showRecent || showSuggestions || showPopular) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          
          {/* Recent Searches */}
          {showRecent && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Recent Searches
              </div>
              {recentSearches.map((search, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(search)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-md transition-colors text-left"
                >
                  <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-900">{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* Matching Cities */}
          {showSuggestions && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Matching Cities
              </div>
              {filteredLocations.map((location: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(location.city)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 rounded-md transition-colors text-left group"
                >
                  <MapPin className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <span className="text-gray-900 group-hover:text-blue-600">
                    {location.city}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Popular Locations */}
          {showPopular && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Popular Locations
              </div>
              {popularLocations.map((location: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(location.city)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-md transition-colors text-left"
                >
                  <TrendingUp className="h-4 w-4 text-orange-500 flex-shrink-0" />
                  <span className="text-gray-900">{location.city}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { MapPin, Clock, X } from 'lucide-react';

interface SearchLocationDropdownProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (location: string) => void;
}

export default function SearchLocationDropdown({
  value,
  onChange,
  onSelect,
}: SearchLocationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Array<{ city: string; zip_code: string }>>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch available locations
  const { data: availableLocations = [] } = trpc.properties.getAvailableLocations.useQuery();

  // Load search history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('searchHistory');
    if (stored) {
      try {
        setSearchHistory(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse search history:', e);
      }
    }
  }, []);

  // Filter locations based on input
  useEffect(() => {
    if (!value.trim()) {
      setFilteredLocations([]);
      return;
    }

    const query = value.toLowerCase();
    const filtered = availableLocations.filter(
      (loc) =>
        loc.city.toLowerCase().includes(query) ||
        (loc.zip_code && loc.zip_code.includes(query))
    );

    // Remove duplicates and limit to 10
    const unique = Array.from(
      new Map(
        filtered.map((loc) => [
          `${loc.city}-${loc.zip_code}`,
          loc,
        ])
      ).values()
    ).slice(0, 10);

    setFilteredLocations(unique);
  }, [value, availableLocations]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationClick = (city: string, zipCode: string) => {
    const displayText = zipCode ? `${city}, FL ${zipCode}` : city;
    onChange(displayText);
    onSelect(displayText);
    setIsOpen(false);

    // Add to search history
    const newHistory = [
      displayText,
      ...searchHistory.filter((item) => item !== displayText),
    ].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const handleRemoveHistoryItem = (item: string) => {
    const newHistory = searchHistory.filter((h) => h !== item);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        placeholder="Enter an address, neighborhood, city, or ZIP code"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
        className="flex-1 py-4 text-base outline-none text-gray-900 placeholder:text-gray-500 w-full"
      />

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Search History */}
          {searchHistory.length > 0 && !value && (
            <>
              <div className="px-4 py-2 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                    <Clock className="h-4 w-4" />
                    Recent Searches
                  </div>
                  <button
                    onClick={handleClearHistory}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
              {searchHistory.map((item) => (
                <button
                  key={item}
                  onClick={() => handleLocationClick(item, '')}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveHistoryItem(item);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                </button>
              ))}
            </>
          )}

          {/* Available Locations */}
          {filteredLocations.length > 0 && (
            <>
              {searchHistory.length > 0 && !value && (
                <div className="border-t border-gray-100" />
              )}
              <div className="px-4 py-2 border-b border-gray-100">
                <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                  <MapPin className="h-4 w-4" />
                  Available Locations
                </div>
              </div>
              {filteredLocations.map((loc) => (
                <button
                  key={`${loc.city}-${loc.zip_code}`}
                  onClick={() => handleLocationClick(loc.city, loc.zip_code)}
                  className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <div>
                      <div className="text-gray-900 font-medium">{loc.city}</div>
                      {loc.zip_code && (
                        <div className="text-gray-500 text-sm">FL {loc.zip_code}</div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}

          {/* Empty State */}
          {!value && searchHistory.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-gray-500 text-sm">
                Start typing to search for cities or ZIP codes
              </p>
            </div>
          )}

          {value && filteredLocations.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-gray-500 text-sm">
                No locations found for "{value}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

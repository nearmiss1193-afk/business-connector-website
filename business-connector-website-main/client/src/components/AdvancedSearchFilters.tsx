import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface SearchFilters {
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyTypes?: string[];
  daysOnMarket?: number;
  priceReduced?: boolean;
}

interface AdvancedSearchFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function AdvancedSearchFilters({
  onFiltersChange,
  isOpen,
  onToggle,
}: AdvancedSearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    beds: true,
    type: true,
    other: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const numValue = value ? parseInt(value) : undefined;
    const newFilters = {
      ...filters,
      [type === 'min' ? 'minPrice' : 'maxPrice']: numValue,
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleBedroomsChange = (value: number | undefined) => {
    const newFilters = { ...filters, bedrooms: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleBathroomsChange = (value: number | undefined) => {
    const newFilters = { ...filters, bathrooms: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handlePropertyTypeChange = (type: string) => {
    const types = filters.propertyTypes || [];
    const newTypes = types.includes(type)
      ? types.filter((t) => t !== type)
      : [...types, type];
    const newFilters = { ...filters, propertyTypes: newTypes.length > 0 ? newTypes : undefined };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleDaysOnMarketChange = (value: number | undefined) => {
    const newFilters = { ...filters, daysOnMarket: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handlePriceReducedChange = (value: boolean) => {
    const newFilters = { ...filters, priceReduced: value || undefined };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFiltersChange({});
  };

  const activeFilterCount = Object.values(filters).filter((v) => v !== undefined).length;

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        variant="outline"
        className="gap-2"
      >
        🔍 Filters
        {activeFilterCount > 0 && (
          <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
            {activeFilterCount}
          </span>
        )}
      </Button>
    );
  }

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Filters</h2>
        <div className="flex gap-2">
          {activeFilterCount > 0 && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onToggle}>
            <X size={20} />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Price Range */}
        <div className="border-b pb-4">
          <button
            onClick={() => toggleSection('price')}
            className="flex items-center justify-between w-full mb-3 hover:text-blue-600"
          >
            <h3 className="font-semibold text-lg">Price</h3>
            <ChevronDown
              size={20}
              className={`transition-transform ${expandedSections.price ? 'rotate-180' : ''}`}
            />
          </button>

          {expandedSections.price && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Min Price</label>
                  <input
                    type="number"
                    placeholder="$0"
                    value={filters.minPrice || ''}
                    onChange={(e) => handlePriceChange('min', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Max Price</label>
                  <input
                    type="number"
                    placeholder="$10,000,000"
                    value={filters.maxPrice || ''}
                    onChange={(e) => handlePriceChange('max', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Quick Price Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Under $300k', max: 300000 },
                  { label: 'Under $500k', max: 500000 },
                  { label: 'Under $1M', max: 1000000 },
                ].map((option) => (
                  <button
                    key={option.label}
                    onClick={() => handlePriceChange('max', option.max.toString())}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filters.maxPrice === option.max
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bedrooms & Bathrooms */}
        <div className="border-b pb-4">
          <button
            onClick={() => toggleSection('beds')}
            className="flex items-center justify-between w-full mb-3 hover:text-blue-600"
          >
            <h3 className="font-semibold text-lg">Beds & Baths</h3>
            <ChevronDown
              size={20}
              className={`transition-transform ${expandedSections.beds ? 'rotate-180' : ''}`}
            />
          </button>

          {expandedSections.beds && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Bedrooms</label>
                <div className="grid grid-cols-4 gap-2">
                  {[undefined, 1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleBedroomsChange(num)}
                      className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                        filters.bedrooms === num
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {num === undefined ? 'Any' : num + '+'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Bathrooms</label>
                <div className="grid grid-cols-4 gap-2">
                  {[undefined, 1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleBathroomsChange(num)}
                      className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                        filters.bathrooms === num
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {num === undefined ? 'Any' : num + '+'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Property Type */}
        <div className="border-b pb-4">
          <button
            onClick={() => toggleSection('type')}
            className="flex items-center justify-between w-full mb-3 hover:text-blue-600"
          >
            <h3 className="font-semibold text-lg">Property Type</h3>
            <ChevronDown
              size={20}
              className={`transition-transform ${expandedSections.type ? 'rotate-180' : ''}`}
            />
          </button>

          {expandedSections.type && (
            <div className="space-y-2">
              {[
                { value: 'single_family', label: 'Single Family' },
                { value: 'condo', label: 'Condo' },
                { value: 'townhouse', label: 'Townhouse' },
                { value: 'land', label: 'Land' },
                { value: 'multi_family', label: 'Multi-Family' },
              ].map((type) => (
                <label key={type.value} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.propertyTypes?.includes(type.value) || false}
                    onChange={() => handlePropertyTypeChange(type.value)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-gray-700">{type.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Other Filters */}
        <div className="pb-4">
          <button
            onClick={() => toggleSection('other')}
            className="flex items-center justify-between w-full mb-3 hover:text-blue-600"
          >
            <h3 className="font-semibold text-lg">More Options</h3>
            <ChevronDown
              size={20}
              className={`transition-transform ${expandedSections.other ? 'rotate-180' : ''}`}
            />
          </button>

          {expandedSections.other && (
            <div className="space-y-4">
              {/* Days on Market */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">Days on Market</label>
                <select
                  value={filters.daysOnMarket || ''}
                  onChange={(e) =>
                    handleDaysOnMarketChange(e.target.value ? parseInt(e.target.value) : undefined)
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Any</option>
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                </select>
              </div>

              {/* Price Reduced */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.priceReduced || false}
                  onChange={(e) => handlePriceReducedChange(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-gray-700">Price Reduced</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Apply Button */}
      <Button className="w-full mt-6" size="lg">
        Apply Filters
      </Button>
    </Card>
  );
}

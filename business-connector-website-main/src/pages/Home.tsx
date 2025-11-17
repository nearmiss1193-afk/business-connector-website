import { useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import GoogleMapReact from 'google-map-react';
import { Link } from 'wouter';
import AdvancedSearchFilters from '@/components/AdvancedSearchFilters';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Bed, Bath, Square } from 'lucide-react';
import Hero from '@/components/Hero';

function Home() {
  const [listings, setListings] = useState<any[]>([]);
  const [search, setSearch] = useState('Central Florida');
  const [view, setView] = useState<'list' | 'map'>('list');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [sort, setSort] = useState<'relevant' | 'price-asc' | 'price-desc' | 'newest'>('relevant');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios
      .get('https://zillow-com1.p.rapidapi.com/propertyExtendedSearch', {
        params: { location: search },
        headers: { 'X-RapidAPI-Key': import.meta.env.VITE_RAPIDAPI_KEY },
      })
      .then((res) => setListings(res.data.props ?? []))
      .catch((err) => {
        console.error(err);
        setError('Failed to load properties');
      })
      .finally(() => setLoading(false));
  }, [search]);

  const filteredSorted = useMemo(() => {
    const toNumber = (v: any) => (typeof v === 'number' ? v : v ? parseFloat(v) : 0);
    let r = listings.filter((l: any) => {
      const price = toNumber(l.price);
      const beds = toNumber(l.beds);
      const baths = toNumber(l.baths);
      const passMin = filters.minPrice ? price >= filters.minPrice : true;
      const passMax = filters.maxPrice ? price <= filters.maxPrice : true;
      const passBeds = filters.bedrooms ? beds >= filters.bedrooms : true;
      const passBaths = filters.bathrooms ? baths >= filters.bathrooms : true;
      // propertyTypes filtering: compare against l.homeType if present
      const passType = filters.propertyTypes && filters.propertyTypes.length
        ? (filters.propertyTypes as string[]).some((t) => (l.homeType || '').toLowerCase().includes(t))
        : true;
      return passMin && passMax && passBeds && passBaths && passType;
    });
    switch (sort) {
      case 'price-asc':
        r.sort((a: any, b: any) => toNumber(a.price) - toNumber(b.price));
        break;
      case 'price-desc':
        r.sort((a: any, b: any) => toNumber(b.price) - toNumber(a.price));
        break;
      case 'newest':
        r.sort((a: any, b: any) => (b.listingDate || '').localeCompare(a.listingDate || ''));
        break;
      default:
        break;
    }
    return r;
  }, [listings, filters, sort]);

  return (
    <div>
      <Hero
        title="Find your next home in Central Florida"
        subtitle="Search thousands of homes for sale and rent across Orlando, Tampa, and beyond. Real-time data, beautiful photos, and powerful filters."
        backgroundUrl="/hero-bg.svg"
        searchValue={search}
        onSearchChange={setSearch}
        onSearchSubmit={() => {/* triggers useEffect */}}
        chips={[
          { label: 'Orlando', onClick: () => setSearch('Orlando, FL') },
          { label: 'Tampa', onClick: () => setSearch('Tampa, FL') },
          { label: 'Under $500k', onClick: () => setFilters((f: any) => ({ ...f, maxPrice: 500000 })) },
          { label: '3+ Beds', onClick: () => setFilters((f: any) => ({ ...f, bedrooms: 3 })) },
        ]}
        ctas={[
          { label: 'Buy a home', onClick: () => window.scrollTo({ top: 600, behavior: 'smooth' }) },
          { label: 'Get pre-approved', onClick: () => window.location.assign('/get-pre-approved'), variant: 'outline' },
        ]}
      />

      <div className="p-4 max-w-[1200px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search location (e.g., Orlando, FL)"
          className="border p-2 flex-1 rounded"
        />
        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className="bg-white border px-4 py-2 rounded hover:bg-gray-50"
        >
          Filters
        </button>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
          className="border p-2 rounded"
        >
          <option value="relevant">Sort: Relevant</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="newest">Newest</option>
        </select>
        <button
          onClick={() => setView(view === 'list' ? 'map' : 'list')}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Toggle to {view === 'list' ? 'Map' : 'List'}
        </button>
      </div>

      <div className="mb-4">
        <AdvancedSearchFilters
          isOpen={filtersOpen}
          onToggle={() => setFiltersOpen((v) => !v)}
          onFiltersChange={setFilters}
        />
      </div>

      {loading && listings.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-40" />
              </div>
            </Card>
          ))}
        </div>
      )}
      {error && <p className="text-red-600">{error}</p>}

      {view === 'list' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSorted.map((l: any) => {
            const price = l.price ?? l.unformattedPrice ?? l.priceText;
            const priceFmt = typeof price === 'number'
              ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)
              : price ?? '—';
            const address = l.address || l.streetAddress || l.addressStreet || 'Address unavailable';
            const cityLine = [l.city || '', l.state || '', l.zipcode || ''].filter(Boolean).join(', ').replace(', ,', ',');
            const beds = l.beds ?? l.bedrooms ?? '-';
            const baths = l.baths ?? l.bathrooms ?? '-';
            const sqft = l.livingArea ?? l.sqft ?? null;
            const status = (l.homeStatus || l.statusText || '').toString().toUpperCase();
            const isNew = l.listingDate ? (Date.now() - new Date(l.listingDate).getTime()) / (1000*60*60*24) <= 7 : false;

            return (
              <Link key={l.zpid ?? l.id} to={`/listing/${l.zpid ?? l.id}`} className="group">
                <Card className="overflow-hidden bg-white border hover:shadow-lg transition-all">
                  <div className="relative">
                    {l.imgSrc ? (
                      <img src={l.imgSrc} alt={address} className="w-full h-48 object-cover" />
                    ) : (
                      <div className="w-full h-48 bg-gray-200" />
                    )}
                    <div className="absolute top-2 left-2 flex gap-2">
                      {isNew && <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">NEW</span>}
                      {status.includes('PENDING') && <span className="bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded">PENDING</span>}
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-sm font-semibold px-2 py-1 rounded">
                      {priceFmt}
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center gap-4 text-gray-700 mb-1">
                      <div className="flex items-center gap-1"><Bed className="w-4 h-4" /><span className="text-sm font-medium">{beds} bd</span></div>
                      <div className="flex items-center gap-1"><Bath className="w-4 h-4" /><span className="text-sm font-medium">{baths} ba</span></div>
                      {sqft && <div className="flex items-center gap-1"><Square className="w-4 h-4" /><span className="text-sm font-medium">{new Intl.NumberFormat('en-US').format(sqft)} sqft</span></div>}
                    </div>
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{address}</p>
                    <p className="text-xs text-gray-600 line-clamp-1">{cityLine}</p>
                    <div className="mt-2">
                      <button
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        onClick={async (e) => {
                          e.preventDefault();
                          try {
                            const url = import.meta.env.VITE_GHL_WEBHOOK_URL;
                            if (!url) return toast.error('Lead webhook not configured');
                            await axios.post(url, { property: l });
                            toast.success('Lead sent to GoHighLevel');
                          } catch (err) {
                            console.error(err);
                            toast.error('Failed to send lead');
                          }
                        }}
                      >
                        Request Info
                      </button>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <div style={{ height: '600px', width: '100%' }} className="rounded overflow-hidden">
          <GoogleMapReact
            bootstrapURLKeys={{ key: import.meta.env.VITE_GOOGLE_MAPS_KEY }}
            defaultCenter={{ lat: 28.5383, lng: -81.3792 }}
            defaultZoom={10}
          >
            {filteredSorted.map((l: any) => (
              <div key={l.zpid} lat={l.latitude} lng={l.longitude}>
                <img src={l.imgSrc} alt={l.address} className="w-8 h-8 rounded-full border-2 border-white shadow" />
              </div>
            ))}
          </GoogleMapReact>
        </div>
      )}
      </div>
      {/* Simple feature highlights */}
      <section className="bg-white border-t">
        <div className="max-w-[1200px] mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-semibold">Powerful search</h3>
            <p className="text-sm text-gray-600">Filter by price, beds, baths, and home type. See results on a map or in a list.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Local insights</h3>
            <p className="text-sm text-gray-600">Explore neighborhoods across Central Florida with up-to-date market data.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Easy to connect</h3>
            <p className="text-sm text-gray-600">Request info in one click—our team follows up fast to help you tour and buy.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
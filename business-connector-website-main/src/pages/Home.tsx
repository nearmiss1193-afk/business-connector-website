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

  const stats = useMemo(() => {
    const nums = filteredSorted
      .map((l: any) => (typeof l.price === 'number' ? l.price : (typeof l.unformattedPrice === 'number' ? l.unformattedPrice : null)))
      .filter((n: any) => typeof n === 'number') as number[];
    const bedNums = filteredSorted
      .map((l: any) => (typeof l.beds === 'number' ? l.beds : (typeof l.bedrooms === 'number' ? l.bedrooms : null)))
      .filter((n: any) => typeof n === 'number') as number[];
    const total = filteredSorted.length;
    let median = null as number | null;
    if (nums.length) {
      const sorted = [...nums].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }
    const avgBeds = bedNums.length ? bedNums.reduce((a, b) => a + b, 0) / bedNums.length : null;
    return { total, median, avgBeds };
  }, [filteredSorted]);

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
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const id = l.zpid ?? l.id;
                          if (id) {
                            window.location.assign(`/listing/${id}#contact`);
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
      {/* How It Works */}
      <section className="bg-slate-50 border-t">
        <div className="max-w-[1200px] mx-auto px-4 py-14">
          <h2 className="text-2xl font-bold mb-6">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border p-5">
              <div className="text-blue-600 font-bold text-sm">Step 1</div>
              <h3 className="font-semibold mt-1">Search homes</h3>
              <p className="text-sm text-gray-600 mt-2">Use the powerful search and filters to find homes that fit your budget and lifestyle.</p>
            </div>
            <div className="bg-white rounded-lg border p-5">
              <div className="text-blue-600 font-bold text-sm">Step 2</div>
              <h3 className="font-semibold mt-1">Tour & compare</h3>
              <p className="text-sm text-gray-600 mt-2">Request info or schedule tours. We’ll coordinate showings and answer your questions.</p>
            </div>
            <div className="bg-white rounded-lg border p-5">
              <div className="text-blue-600 font-bold text-sm">Step 3</div>
              <h3 className="font-semibold mt-1">Make an offer</h3>
              <p className="text-sm text-gray-600 mt-2">Get expert guidance through offers, inspections, and closing—all the way home.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Market Stats */}
      <section className="bg-white border-t">
        <div className="max-w-[1200px] mx-auto px-4 py-14">
          <h2 className="text-2xl font-bold mb-6">Market snapshot</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="rounded-lg border p-5 bg-slate-50">
              <div className="text-sm text-gray-600">Active listings</div>
              <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
            </div>
            <div className="rounded-lg border p-5 bg-slate-50">
              <div className="text-sm text-gray-600">Median price</div>
              <div className="text-2xl font-bold">{typeof stats.median === 'number' ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(stats.median) : '—'}</div>
            </div>
            <div className="rounded-lg border p-5 bg-slate-50">
              <div className="text-sm text-gray-600">Avg. beds</div>
              <div className="text-2xl font-bold">{typeof stats.avgBeds === 'number' ? stats.avgBeds.toFixed(1) : '—'}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Areas */}
      <section className="bg-slate-50 border-t">
        <div className="max-w-[1200px] mx-auto px-4 py-14">
          <h2 className="text-2xl font-bold mb-6">Popular Central Florida areas</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              'Orlando, FL',
              'Tampa, FL',
              'Kissimmee, FL',
              'Winter Park, FL',
              'Lakeland, FL',
              'Sanford, FL',
            ].map((city) => (
              <button
                key={city}
                onClick={() => setSearch(city)}
                className="rounded border bg-white px-3 py-2 text-sm hover:bg-gray-50"
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
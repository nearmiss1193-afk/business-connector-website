import { useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import GoogleMapReact from 'google-map-react';
import { Link } from 'wouter';
import AdvancedSearchFilters from '@/components/AdvancedSearchFilters';
import { toast } from 'sonner';

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

      {loading && <p className="text-blue-600">Loading properties...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {view === 'list' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSorted.map((l: any) => (
            <Link key={l.zpid} to={`/listing/${l.zpid}`} className="border rounded overflow-hidden bg-white hover:shadow">
              <img src={l.imgSrc} alt={l.address} className="w-full h-48 object-cover" />
              <div className="p-3">
                <p className="font-bold">${'{'}l.price{'}'}</p>
                <p className="text-sm text-gray-600">{l.beds} bd • {l.baths} ba</p>
                <p className="text-sm">{l.address}</p>
                <button
                  className="mt-2 bg-blue-600 text-white px-3 py-1 rounded"
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
                  Send Lead to GHL
                </button>
              </div>
            </Link>
          ))}
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
  );
}

export default Home;
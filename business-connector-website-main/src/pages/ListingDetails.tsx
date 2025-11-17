import { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import axios from 'axios';
import { toast } from 'sonner';
import ImageGallery from '@/components/ImageGallery';
import PaymentBreakdown from '@/components/PaymentBreakdown';
import PropertyDetailLeadForm from '@/components/PropertyDetailLeadForm';
import { MapView } from '@/components/Map';

function ListingDetails() {
  const [, params] = useRoute('/listing/:id');
  const id = params?.id;
  const [listing, setListing] = useState(null);

  useEffect(() => {
    axios.get(`https://zillow-com1.p.rapidapi.com/property?zpid=${id}`, {
      headers: { 'X-RapidAPI-Key': import.meta.env.VITE_RAPIDAPI_KEY }
    }).then(res => setListing(res.data));
  }, [id]);

  if (!listing) return <div className="p-4">Loading...</div>;

  // Derive fields with safe fallbacks
  const priceNum: number | null = typeof listing.price === 'number'
    ? listing.price
    : (typeof listing.unformattedPrice === 'number' ? listing.unformattedPrice : null);
  const priceFmt = priceNum !== null
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(priceNum)
    : (listing.priceText || '—');
  const address: string = listing.address || listing.streetAddress || 'Address unavailable';
  const city = [listing.city, listing.state, listing.zipcode].filter(Boolean).join(', ').replace(', ,', ',');
  const beds = listing.beds ?? listing.bedrooms ?? '-';
  const baths = listing.baths ?? listing.bathrooms ?? '-';
  const sqft = listing.livingArea ?? listing.sqft ?? null;
  const lat = listing.latitude ?? listing.lat;
  const lng = listing.longitude ?? listing.lng;
  const images: string[] = Array.isArray(listing.photos) && listing.photos.length > 0
    ? listing.photos
    : (listing.imgSrc ? [listing.imgSrc] : []);

  return (
    <div className="max-w-[1200px] mx-auto p-4">
      {/* Gallery */}
      <div className="mb-6">
        <ImageGallery images={images} propertyAddress={address} />
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h1 className="text-3xl font-bold">{priceFmt}</h1>
          <div className="text-gray-700">
            <p className="text-lg font-medium">{address}</p>
            <p className="text-sm">{city}</p>
          </div>
          <div className="flex items-center gap-6 text-gray-800">
            <span className="font-medium">{beds} bd</span>
            <span className="font-medium">{baths} ba</span>
            {sqft && <span className="font-medium">{new Intl.NumberFormat('en-US').format(sqft)} sqft</span>}
          </div>

          {/* Map */}
          {lat && lng && (
            <div className="rounded overflow-hidden border">
              <MapView center={{ lat: Number(lat), lng: Number(lng) }} zoom={14} className="w-full h-[300px]" />
            </div>
          )}

          {/* Payment Breakdown */}
          {priceNum && (
            <div className="mt-2">
              <PaymentBreakdown homePrice={priceNum} downPayment={Math.round(priceNum * 0.2)} interestRate={6.5} loanTerm={30} />
            </div>
          )}
        </div>

        {/* Lead Form */}
        <div>
          <PropertyDetailLeadForm
            propertyId={Number(listing.zpid ?? 0)}
            propertyAddress={address}
            propertyPrice={priceFmt}
            propertyBeds={Number(beds) || 0}
            propertyBaths={Number(baths) || 0}
            propertySqft={Number(sqft) || 0}
            city={city}
          />
        </div>
      </div>
    </div>
  );
}

export default ListingDetails;
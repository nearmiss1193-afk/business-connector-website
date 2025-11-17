import { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import axios from 'axios';
import { toast } from 'sonner';

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

  return (
    <div className="p-4">
      <img src={listing.imgSrc} alt={listing.address} className="w-full h-64 object-cover" />
      <h1 className="text-2xl font-bold">${listing.price}</h1>
      <p>{listing.beds} beds | {listing.baths} baths | {listing.sqft} sqft</p>
      <p>{listing.address}</p>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={async () => {
          try {
            const url = import.meta.env.VITE_GHL_WEBHOOK_URL;
            if (!url) {
              toast.error('Lead webhook not configured');
              return;
            }
            await axios.post(url, { property: listing });
            toast.success('Lead sent to GoHighLevel');
          } catch (e) {
            console.error(e);
            toast.error('Failed to send lead');
          }
        }}
      >
        Send Lead to GHL
      </button>
    </div>
  );
}

export default ListingDetails;
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

function ListingDetails() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);

  useEffect(() => {
    axios.get(`https://zillow-com1.p.rapidapi.com/property?zpid=${id}`, {
      headers: { 'X-RapidAPI-Key': import.meta.env.VITE_RAPIDAPI_KEY }
    }).then(res => setListing(res.data));
  }, [id]);

  if (!listing) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <img src={listing.imgSrc} alt={listing.address} className="w-full h-64 object-cover" />
      <h1 className="text-2xl font-bold">${listing.price}</h1>
      <p>{listing.beds} beds | {listing.baths} baths | {listing.sqft} sqft</p>
      <p>{listing.address}</p>
      <button className="bg-blue-600 text-white px-4 py-2" onClick={() => {
        axios.post('https://your-ghl-domain/webhooks/lead', { property: listing, key: import.meta.env.VITE_GOHIGHLEVEL_API_KEY });
      }}>Send Lead to GHL</button>
    </div>
  );
}

export default ListingDetails;
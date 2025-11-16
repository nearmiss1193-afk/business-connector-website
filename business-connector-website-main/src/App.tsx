import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    axios.get('https://zillow-com1.p.rapidapi.com/propertyExtendedSearch', {
      params: { location: 'Central Florida' },
      headers: { 'X-RapidAPI-Key': import.meta.env.VITE_RAPIDAPI_KEY }
    }).then(res => setListings(res.data.props));
  }, []);

  const sendToGHL = (l) => {
    axios.post('https://your-ghl-domain/webhooks/lead', { property: l, key: import.meta.env.VITE_GOHIGHLEVEL_API_KEY });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold">Business Conector - Real Estate Leads</h1>
      <div className="grid grid-cols-3 gap-4">
        {listings.map(l => (
          <div key={l.zpid} className="border p-4">
            <img src={l.imgSrc} alt={l.address} className="w-full h-48 object-cover" />
            <p>${l.price}</p>
            <button onClick={() => sendToGHL(l)} className="bg-blue-600 text-white px-2 py-1">Send Lead to GHL</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

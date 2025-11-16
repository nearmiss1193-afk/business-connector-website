import { useState, useEffect } from 'react';
import axios from 'axios';
import GoogleMapReact from 'google-map-react';

function App() {
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState('Central Florida');
  const [view, setView] = useState('list');
  const [filters, setFilters] = useState({ minPrice: 0, beds: 0 });

  useEffect(() => {
    axios.get('https://zillow-com1.p.rapidapi.com/propertyExtendedSearch', {
      params: { location: search },
      headers: { 'X-RapidAPI-Key': process.env.RAPIDAPI_KEY }
    }).then(res => setListings(res.data.props.filter(l => l.price >= filters.minPrice && l.beds >= filters.beds)));
  }, [search, filters]);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-8 text-center">
        <h1 className="text-4xl font-bold">Central Florida Homes</h1>
        <p className="text-xl mt-2">Discover Exclusive Real Estate Listings</p>
        <input className="border p-2 w-64 mt-4" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search location" />
        <button className="bg-white text-blue-600 px-4 py-2 ml-2 rounded" onClick={() => {}}>Search</button>
      </header>
      <div className="container mx-auto p-4">
        <div className="flex gap-4 mb-4">
          <input className="border p-2" type="number" placeholder="Min Price" onChange={e => setFilters({...filters, minPrice: e.target.value})} />
          <input className="border p-2" type="number" placeholder="Min Beds" onChange={e => setFilters({...filters, beds: e.target.value})} />
          <button className="bg-blue-600 text-white px-4 py-2" onClick={() => setView(view === 'list' ? 'map' : 'list')}>Toggle to {view === 'list' ? 'Map' : 'List'}</button>
        </div>
        {view === 'list' ? (
          <div className="grid grid-cols-3 gap-4">
            {listings.map(l => (
              <div key={l.zpid} className="border p-4 bg-white">
                <img src={l.imgSrc} alt={l.address} className="w-full h-48 object-cover" />
                <p className="font-bold">${l.price}</p>
                <p>{l.address}</p>
                <button className="bg-blue-600 text-white px-2 py-1" onClick={() => {
                  axios.post('https://your-ghl-domain/webhooks/lead', { property: l });
                }}>Send Lead to GHL</button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ height: '500px', width: '100%' }}>
            <GoogleMapReact bootstrapURLKeys={{ key: process.env.GOOGLE_MAPS_KEY }} defaultCenter={{ lat: 28.5383, lng: -81.3792 }} defaultZoom= {10}>
              {listings.map(l => (
                <div key={l.zpid} lat={l.latitude} lng={l.longitude}>
                  <img src={l.imgSrc} alt={l.address} className="w-8 h-8" />
                </div>
              ))}
            </GoogleMapReact>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

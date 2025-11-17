import { useState, useEffect } from 'react';
import axios from 'axios';
import GoogleMapReact from 'google-map-react';
import { Link } from 'react-router-dom';

function Home() {
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState('Central Florida');
  const [view, setView] = useState('list');

  useEffect(() => {
    axios.get('https://zillow-com1.p.rapidapi.com/propertyExtendedSearch', {
      params: { location: search },
      headers: { 'X-RapidAPI-Key': import.meta.env.VITE_RAPIDAPI_KEY }
    }).then(res => setListings(res.data.props));
  }, [search]);

  return (
    <div className="p-4">
      <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search location" className="border p-2 w-full mb-4" />
      <button onClick={() => setView(view === 'list' ? 'map' : 'list')} className="bg-blue-600 text-white px-4 py-2 mb-4">Toggle to {view === 'list' ? 'Map' : 'List'}</button>
      {view === 'list' ? (
        <div className="grid grid-cols-3 gap-4">
          {listings.map(l => (
            <Link key={l.zpid} to={`/listing/${l.zpid}`} className="border p-4">
              <img src={l.imgSrc} alt={l.address} className="w-full h-48 object-cover" />
              <p>${l.price}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div style={{ height: '500px', width: '100%' }}>
          <GoogleMapReact bootstrapURLKeys={{ key: import.meta.env.VITE_GOOGLE_MAPS_KEY }} defaultCenter={{ lat: 28.5383, lng: -81.3792 }} defaultZoom={10}>
            {listings.map(l => (
              <div key={l.zpid} lat={l.latitude} lng={l.longitude}>
                <img src={l.imgSrc} alt={l.address} className="w-8 h-8" />
              </div>
            ))}
          </GoogleMapReact>
        </div>
      )}
    </div>
  );
}

export default Home;
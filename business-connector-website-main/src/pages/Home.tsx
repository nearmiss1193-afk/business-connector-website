import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Home() {
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState('Central Florida');

  useEffect(() => {
    axios.get('https://zillow-com1.p.rapidapi.com/propertyExtendedSearch', {
      params: { location: search },
      headers: { 'X-RapidAPI-Key': import.meta.env.VITE_RAPIDAPI_KEY }
    }).then(res => setListings(res.data.props));
  }, [search]);

  return (
    <div className="p-4">
      <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search location" className="border p-2 w-full mb-4" />
      <div className="grid grid-cols-3 gap-4">
        {listings.map(l => (
          <Link key={l.zpid} to={`/listing/${l.zpid}`} className="border p-4 block hover:shadow-lg transition-shadow">
            <img src={l.imgSrc} alt={l.address} className="w-full h-48 object-cover" />
            <p>${l.price}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Home;
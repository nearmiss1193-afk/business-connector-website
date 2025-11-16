import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.tsx';
import ListingDetails from './pages/ListingDetails.tsx';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <header className="bg-blue-600 text-white p-4 text-center font-bold text-2xl">Business Conector - Like Zillow</header>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/listing/:id" element={<ListingDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

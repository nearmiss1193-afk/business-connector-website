import { useParams } from 'react-router-dom';

export default function ListingDetails() {
  const { id } = useParams();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Property Details</h1>
      <p>Details for property ID: {id}</p>
      {/* Add property details component here */}
    </div>
  );
}
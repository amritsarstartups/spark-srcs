'use client';

import { useEffect, useState } from 'react';
import { 
  firebaseBookOperations, 
  firebaseLocationOperations, 
  firebaseTransactionOperations,
  Book,
  Location
} from '../../../utils/utils';
import Link from 'next/link';

export default function DonatePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedBook, setSelectedBook] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // In a real app, this would come from authentication
  const userId = 'TpDZRqVaROl7cXoSqcEH';

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch all books
        const allBooks = await firebaseBookOperations.searchBooks('');
        setBooks(allBooks);
        if (allBooks.length > 0) {
          setSelectedBook(allBooks[0].id);
        }
        
        // Fetch all active locations
        const activeLocations = await firebaseLocationOperations.getActiveLocations();
        setLocations(activeLocations);
        if (activeLocations.length > 0) {
          setSelectedLocation(activeLocations[0].id);
        }
      } catch (err) {
        console.error('Error fetching data for donation:', err);
        setError('Failed to load donation options');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  const handleDonate = async () => {
    if (!selectedBook || !selectedLocation) {
      setError('Please select both a book and a location');
      return;
    }

    try {
      await firebaseTransactionOperations.donateBook(
        selectedBook,
        userId,
        selectedLocation
      );
      
      setSuccess('Book donated successfully! Thank you for your contribution.');
      setError(null);
    } catch (err) {
      console.error('Error donating book:', err);
      setError('Failed to process your donation');
      setSuccess(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading donation options...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-4">
        <Link href="/reader" className="text-blue-600 hover:underline mb-4 inline-block">
          &larr; Back to Books
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Donate a Book</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <div className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div>
          <label className="block mb-2 font-semibold">Select Book to Donate</label>
          <select
            value={selectedBook}
            onChange={(e) => setSelectedBook(e.target.value)}
            className="w-full p-2 border rounded"
          >
            {books.map(book => (
              <option key={book.id} value={book.id}>
                {book.title} by {book.author}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block mb-2 font-semibold">Select Donation Location</label>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full p-2 border rounded"
          >
            {locations.map(location => (
              <option key={location.id} value={location.id}>
                {location.name} - {location.address}
              </option>
            ))}
          </select>
        </div>
        
        <div className="pt-4">
          <button
            onClick={handleDonate}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded w-full"
          >
            Donate Book
          </button>
        </div>
      </div>
    </div>
  );
}

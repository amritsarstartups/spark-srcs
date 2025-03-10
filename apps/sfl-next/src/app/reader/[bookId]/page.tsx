'use client';
import React from 'react';
import { useEffect, useState } from 'react';
import {
  firebaseBookOperations,
  firebaseBookCopyOperations,
  firebaseLocationOperations,
  firebaseTransactionOperations,
} from '../../../utils/utils';
import { Book } from '../../types/book';
import { Location } from '../../../utils/utils';
import Link from 'next/link';

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const [book, setBook] = useState<Book | null>(null);
  const [availableCopies, setAvailableCopies] = useState<any[]>([]);
  const [locations, setLocations] = useState<Record<string, Location>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState('TpDZRqVaROl7cXoSqcEH'); // In a real app, this would come from authentication
  const [borrowSuccess, setBorrowSuccess] = useState<string | null>(null);
  const { bookId } = await params;

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch book details
        const bookData = await firebaseBookOperations.getBook(bookId);
        if (!bookData) {
          setError('Book not found');
          return;
        }
        setBook(bookData);

        // Fetch all active locations
        const locationsData =
          await firebaseLocationOperations.getActiveLocations();
        const locationsMap: Record<string, Location> = {};
        locationsData.forEach((loc) => {
          locationsMap[loc.id] = loc;
        });
        setLocations(locationsMap);

        // Fetch available copies for this book
        const copies = await firebaseBookCopyOperations.getAvailableCopies(
          bookId
        );
        setAvailableCopies(copies);
      } catch (err) {
        console.error('Error fetching book details:', err);
        setError('Failed to load book details');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [bookId]);

  const handleBorrow = async (copyId: string, locationId: string) => {
    console.log('Borrowing book:', copyId, locationId);

    try {
      await firebaseTransactionOperations.borrowBook(
        copyId,
        userId,
        locationId
      );
      setBorrowSuccess(
        'Book borrowed successfully! It will now appear in your history.'
      );

      // Update the available copies list
      const updatedCopies = availableCopies.filter(
        (copy) => copy.id !== copyId
      );
      setAvailableCopies(updatedCopies);
    } catch (err) {
      console.error('Error borrowing book:', err);
      setError('Failed to borrow book');
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading book details...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  if (!book) {
    return <div className="p-8 text-center">Book not found</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-4">
        <Link
          href="/reader"
          className="text-blue-600 hover:underline mb-4 inline-block"
        >
          &larr; Back to Books
        </Link>
      </div>

      {borrowSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {borrowSuccess}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3">
          <img
            src={
              "https://edit.org/images/cat/book-covers-big-2019101610.jpg"
            //   book.coverImage ||
            //   'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcR5V69XD4HLqLY0A7zOAZvYKVyxym2pklgn8OcdBA1gsiRWPPwS'
            }
            alt={book.title}
            className="w-full rounded-lg shadow-md"
          />
        </div>

        <div className="w-full md:w-2/3">
          <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
          <p className="text-xl text-gray-700 mb-4">by {book.author}</p>

          {book.genre && book.genre.length > 0 && (
            <div className="mb-4 flex flex-wrap">
              {book.genre.map((g) => (
                <span
                  key={g}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2 mb-2 text-sm"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {book.isbn && <p className="text-gray-500 mb-4">ISBN: {book.isbn}</p>}

          {book.description && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-700">{book.description}</p>
            </div>
          )}

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Available at:</h2>

            {availableCopies.length === 0 ? (
              <p className="text-gray-500 italic">
                Currently not available at any location
              </p>
            ) : (
              <div className="grid gap-4">
                {availableCopies.map((copy) => {
                  const locationId =
                    typeof copy.locationId === 'string'
                      ? copy.locationId
                      : copy.locationId.id;

                  const location = locations[locationId];

                  return location ? (
                    <div
                      key={copy.id}
                      className="border rounded-lg p-4 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium">{location.name}</p>
                        <p className="text-gray-600 text-sm">
                          {location.address}
                        </p>
                      </div>
                      <button
                        onClick={() => handleBorrow(copy.id, locationId)}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                      >
                        Borrow
                      </button>
                    </div>
                  ) : null;
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

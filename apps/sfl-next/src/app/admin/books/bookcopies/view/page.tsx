"use client";

import { useState, useEffect } from "react";
import { firebaseBookCopyOperations } from "../../../../../utils/utils";

const BookCopiesTable = () => {
  interface BookCopy {
    id: string;
    bookId: { id: string };
    locationId: string | { id: string };
    status: string;
  }
  
  const [bookCopies, setBookCopies] = useState<BookCopy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookCopies = async () => {
      try {
        const copies = await firebaseBookCopyOperations.getAvailableCopies();
        setBookCopies(copies);
      } catch (error) {
        console.error("Error fetching book copies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookCopies();
  }, []);

  return (
    <div className="p-6 bg-white rounded-xl shadow-md w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Available Book Copies</h2>
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 rounded-lg">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-2">Book ID</th>
                <th className="border p-2">Location ID</th>
                <th className="border p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookCopies.length > 0 ? (
                bookCopies.map((copy) => (
                  <tr key={copy.id} className="text-center">
                    <td className="border p-2">{copy.bookId.id}</td>
                    <td className="border p-2">{typeof copy.locationId === 'string' ? copy.locationId : copy.locationId.id}</td>
                    <td className="border p-2">{copy.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center p-4 text-gray-500">
                    No available copies
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BookCopiesTable;
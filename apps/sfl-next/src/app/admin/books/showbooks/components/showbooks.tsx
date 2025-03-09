import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from '../../../../../utils/utils'

const ShowBooks = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "books"));
        const bookList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBooks(bookList);
      } catch (err) {
        setError("Failed to load books. Please try again.");
        console.error("Error fetching books:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  if (loading) return <p className="text-center">Loading books...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-9">
      
      {books.length > 0 ? (
        books.map((book) => (
          <div
            key={book.id}
            className="bg-white shadow-lg rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-300"
          >
            <img src={book.coverImage} alt={book.title} className="w-full h-56 object-cover" />
            <div className="p-4">
              <h3 className="text-xl font-bold mb-2">{book.title}</h3>
              <p className="text-gray-600 mb-1">by {book.author}</p>
              <p className="text-gray-500 text-sm">Genre: {book.genre}</p>
              <p className="text-gray-500 text-sm">ISBN: {book.isbn}</p>
              <p className="text-gray-700 mt-2 text-sm">{book.description}</p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500 col-span-full">No books available.</p>
      )}
    </div>
  );
};

export default ShowBooks;

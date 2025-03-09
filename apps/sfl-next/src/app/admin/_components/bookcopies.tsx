import { useState, useEffect } from "react";
import { firebaseBookCopyOperations, db } from "../../../utils/utils";
import {
  collection,
  CollectionReference,
  DocumentData,
  getDocs as firebaseGetDocs,
} from "firebase/firestore";

const BookCopies = () => {
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [books, setBooks] = useState<{ id: string; title: string }[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedBook, setSelectedBook] = useState("");
  const [copyCount, setCopyCount] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const locationsSnap = await getDocs(collection(db, "locations"));
      setLocations(locationsSnap.docs.map((doc) => ({ id: doc.id, name: doc.data().name })));
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      if (!selectedLocation) return;
      const booksSnap = await getDocs(collection(db, "books"));
      setBooks(booksSnap.docs.map((doc) => ({ id: doc.id, title: doc.data().title })));
    };
    fetchBooks();
  }, [selectedLocation]);

  const handleAddCopies = async () => {
    if (!selectedLocation || !selectedBook || copyCount < 1) return;
    setLoading(true);
    try {
      for (let i = 0; i < copyCount; i++) {
        await firebaseBookCopyOperations.createBookCopy(selectedBook, selectedLocation);
      }
      alert(`${copyCount} copies added successfully!`);
      setSelectedLocation("");
      setSelectedBook("");
      setCopyCount(1);
    } catch (error) {
      console.error("Error adding copies:", error);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md w-full max-w-lg mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center">Manage Book Copies</h2>

      <div className="mb-6">
        <label className="block text-gray-700 font-semibold mb-2">Select Location</label>
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="w-full border rounded-lg p-3"
        >
          <option value="">Choose a location</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>
      </div>

      {selectedLocation && (
        <div className="mb-6 transition-all duration-300">
          <label className="block text-gray-700 font-semibold mb-2">Select Book</label>
          <select
            value={selectedBook}
            onChange={(e) => setSelectedBook(e.target.value)}
            className="w-full border rounded-lg p-3"
          >
            <option value="">Choose a book</option>
            {books.map((book) => (
              <option key={book.id} value={book.id}>
                {book.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedBook && (
        <div className="mb-6 transition-all duration-300">
          <label className="block text-gray-700 font-semibold mb-2">Number of Copies</label>
          <input
            type="number"
            min="1"
            value={copyCount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCopyCount(Number(e.target.value))}
            className="w-full border rounded-lg p-3"
          />
        </div>
      )}

      {selectedBook && (
        <button
          onClick={handleAddCopies}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300"
        >
          {loading ? "Adding..." : "Add Copies"}
        </button>
      )}
    </div>
  );
};

export default BookCopies;

async function getDocs(arg0: CollectionReference<DocumentData>) {
  return await firebaseGetDocs(arg0);
}

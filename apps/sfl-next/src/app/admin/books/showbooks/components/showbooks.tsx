import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db, firebaseBookOperations } from "../../../../../utils/utils";

const ShowBooks = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingBook, setEditingBook] = useState<any | null>(null);
  const [formData, setFormData] = useState({ title: "", author: "", genre: [] as string[], isbn: "", coverImage: "" });

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

  const handleDelete = async (bookId: string) => {
    try {
      await firebaseBookOperations.deleteBook(bookId);
      setBooks(books.filter((book) => book.id !== bookId));
    } catch (error) {
      console.error("Error deleting book:", error);
    }
  };

  const handleUpdate = (book: any) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      genre: book.genre,
      isbn: book.isbn,
      coverImage: book.coverImage,
    });
  };

  const handleSubmit = async () => {
    if (!editingBook) return;
    try {
      await firebaseBookOperations.updateBook(editingBook.id, formData);
      setBooks((prevBooks) =>
        prevBooks.map((book) => (book.id === editingBook.id ? { ...book, ...formData } : book))
      );
      setEditingBook(null);
    } catch (error) {
      console.error("Error updating book:", error);
    }
  };

  if (loading) return <p className="text-center">Loading books...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Books</h2>
      <table className="min-w-full bg-white border border-gray-200 shadow-md">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="py-2 px-4 border">Title</th>
            <th className="py-2 px-4 border">Author</th>
            <th className="py-2 px-4 border">Genre</th>
            <th className="py-2 px-4 border">ISBN</th>
            <th className="py-2 px-4 border">Cover Image</th>
            <th className="py-2 px-4 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.length > 0 ? (
            books.map((book) => (
              <tr key={book.id} className="border-b">
                <td className="py-2 px-4 border">{book.title}</td>
                <td className="py-2 px-4 border">{book.author}</td>
                <td className="py-2 px-4 border">{Array.isArray(book.genre) ? book.genre.join(", ") : book.genre}</td>
                <td className="py-2 px-4 border">{book.isbn}</td>
                <td className="py-2 px-4 border">{book.coverImage}</td>
                <td className="py-2 px-4 border">
                  <button
                    className="mr-2 text-blue-500 hover:underline"
                    onClick={() => handleUpdate(book)}
                  >
                    Update
                  </button>
                  <button
                    className="text-red-500 hover:underline"
                    onClick={() => handleDelete(book.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center text-gray-500 py-4">
                No books available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {editingBook && (
        <div className="mt-6 p-4 border rounded shadow-lg bg-gray-50">
          <h3 className="text-xl font-bold mb-4">Edit Book</h3>
          <input
            type="text"
            placeholder="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="block w-full p-2 border mb-2"
          />
          <input
            type="text"
            placeholder="Author"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            className="block w-full p-2 border mb-2"
          />
          <input
            type="text"
            placeholder="Genre"
            value={Array.isArray(formData.genre) ? formData.genre.join(", ") : formData.genre}
            onChange={(e) => setFormData({ ...formData, genre: e.target.value.split(",").map(g => g.trim()) })}
            className="block w-full p-2 border mb-2"
          />
          <input
            type="text"
            placeholder="ISBN"
            value={formData.isbn}
            onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
            className="block w-full p-2 border mb-2"
          />
          <input
            type="text"
            placeholder="Cover Image"
            value={formData.coverImage}
            onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
            className="block w-full p-2 border mb-2"
          />
          <div className="flex gap-2">
            <button onClick={handleSubmit} className="px-4 py-2 bg-blue-500 text-white rounded">
              Save
            </button>
            <button onClick={() => setEditingBook(null)} className="px-4 py-2 bg-gray-500 text-white rounded">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowBooks;

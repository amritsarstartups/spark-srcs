import React, {useState} from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../../../../utils/utils'

const AddBook = () => {
  const [bookData, setBookData] = useState({
    title: '',
    author: '',
    isbn: '',
    coverImage: '',
    description: '',
    genre: [] 
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'genre') {
      const options = e.target.options;
      const selectedGenres = [];
      for (let i = 0; i < options.length; i++) {
        if (options[i].selected) {
          selectedGenres.push(options[i].value);
        }
      }
      setBookData({ ...bookData, genre: selectedGenres });
    } else {
      setBookData({ ...bookData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'books'), bookData);
      setMessage('Book added successfully!');
      setBookData({ title: '', author: '', isbn: '', coverImage: '', description: '', genre: [] });
    } catch (error) {
      setMessage('Error adding book: ' + (error as any).message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full p-6 bg-white rounded-lg">
      <h2 className="text-3xl font-bold mb-6">Add New Book</h2>
      {message && <p className="mb-4 text-green-500">{message}</p>}
      <form className="w-full max-w-md" onSubmit={handleSubmit}>
        <input name="title" type="text" placeholder="Book Title" value={bookData.title} onChange={handleChange} className="w-full p-4 border rounded mb-4" required />
        <input name="author" type="text" placeholder="Author" value={bookData.author} onChange={handleChange} className="w-full p-4 border rounded mb-4" required />
        <input name="isbn" type="text" placeholder="ISBN" value={bookData.isbn} onChange={handleChange} className="w-full p-4 border rounded mb-4" required />
        <input name="coverImage" type="text" placeholder="Cover Image URL" value={bookData.coverImage} onChange={handleChange} className="w-full p-4 border rounded mb-4" />
        <textarea name="description" placeholder="Description" value={bookData.description} onChange={handleChange} className="w-full p-4 border rounded mb-4" required></textarea>
        <select name="genre" multiple value={bookData.genre} onChange={handleChange} className="w-full p-4 border rounded mb-4" required>
          <option value="Dystopian">Dystopian</option>
          <option value="Science Fiction">Science Fiction</option>
          <option value="Classic">Classic</option>
        </select>
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Add Book</button>
      </form>
    </div>
  );
};

export default AddBook;
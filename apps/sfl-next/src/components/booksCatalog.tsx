"use client"
import React, { useEffect, useState } from 'react'
import { Book, BookCopy, firebaseBookOperations, firebaseLocationOperations } from '../utils/utils';

interface BooksCatalogProps {
  location: string; 
}

interface BookDetails {
  bookDetails: Book;
  bookCopies: BookCopy[];
}

function BooksCatalog({ location }: BooksCatalogProps) {
  const [books, setBooks] = useState<BookDetails[]>([]);
  const [isCatalogOpen, setIsCatalogOpen] = useState<number | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      if (location) {
        const data = await firebaseLocationOperations.getBookCopiesAtLocation(location);
        if (data) {
          const new_data = await Promise.all(data.map(async (book) => {
            const bookDetails: Book = await firebaseBookOperations.getBook(book.bookId.id).then((res: Book | null) => res || { title: 'Unknown Book' } as Book);
            const tempBooks = await firebaseLocationOperations.getBookCopiesAtLocation(location);
            const bookCopies = tempBooks.filter((copy) => copy.bookId.id === book.bookId.id);
            return {
              bookDetails,
              bookCopies: Array.from(new Set(bookCopies.map(copy => copy.id))).map(id => bookCopies.find(copy => copy.id === id))
            };
          }));

          // Remove duplicates based on bookDetails.id
          const uniqueBooks = new_data.reduce<BookDetails[]>((acc, current) => {
            const x = acc.find(item => item.bookDetails.id === current.bookDetails.id);
            if (!x) {
              return acc.concat([current]);
            } else {
              return acc;
            }
          }, []);

          setBooks(uniqueBooks as BookDetails[]);
        }
      } else {
        console.error('Invalid location');
      }
    }
    fetchBooks();
  }, [location]);

  useEffect(() => {
    console.log(books);
  }, [books]);

  return (
    <div className='mx-12 bg-gray-50 rounded-lg py-4 px-4 space-y-2'>
      <h1 className='text-2xl font-bold mb-6 mt-3'>Books Available</h1>
      {books && books.map((book, index) => (
        <div key={book.bookDetails.id} className='bg-white rounded-lg p-4' onClick={() => setIsCatalogOpen(prev => prev === index ? null : index)}>
          <h2 className='text-lg cursor-pointer'>{book.bookDetails.title}</h2>
          <p className='text-sm'>by <b>{book.bookDetails.author}</b></p>
          <p className='text-sm text-green-500'>Available <b>{book.bookCopies.length}</b></p>
          {isCatalogOpen === index && (
            <div className='mt-2'>
              {book.bookCopies.map((copy, copyIndex) => (
                <div key={copy.id} className='bg-gray-100 rounded-lg p-2 my-1'>
                  <p className='text-sm'>Copy ID: {copy.id}</p>
                  <button 
                    className='text-blue-500 hover:underline'
                    onClick={() => window.location.href = `/books/borrow/${copy.id}`}
                  >
                    Borrow this copy
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default BooksCatalog;

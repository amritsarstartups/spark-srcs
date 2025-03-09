"use client"
import { Book, BookCopy, firebaseBookCopyOperations, firebaseBookOperations, firebaseTransactionOperations, firebaseUserOperations } from '../../../../../utils/utils';
import React, { useEffect, useState } from 'react'


interface Params{
    bookId:string
}

function BorrowBookUser({ params }: { params: Params }) {
  const [user, setUser] = useState<any>(null);
  const [book, setBook] = useState<BookCopy | null>(null);
  const [bookDetails, setBookDetails] = useState<Book | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const resolvedParams = React.use(params);

  const getUser = async () => {
    const data = firebaseUserOperations.getUser(localStorage.getItem('userId') ?? "TpDZRqVaROl7cXoSqcEH").then((res)=>setUser(res))
    if(user?.id){
      setIsLoading(true)
    }
  }

  useEffect(()=>{
    const getBookCopyFromId = async () => {
      const data = await firebaseBookCopyOperations.getBookCopy(resolvedParams.bookId).then((res)=>setBook(res));
      if(book?.bookId){
        setIsLoading(true)
      }
    }

    getUser();
    getBookCopyFromId();
  },[isLoading])

  useEffect(()=>{
    const fetchBookDetails = async () => {
      if(book?.bookId){
        const data: Book = await firebaseBookOperations.getBook(book?.bookId.id).then((res: Book | null) => res || { title: 'Unknown Book' } as Book);
        setBookDetails(data)
      }
    }
    fetchBookDetails();
  },[book])

  const borrowBook = async () => {
    console.log("ran")
    if (book && user) {
      try {
        await firebaseTransactionOperations.borrowBook(book.id, user.id);
        alert('Book borrowed successfully!');
      } catch (error) {
        console.error('Error borrowing book:', error);
        alert('Failed to borrow book. Please try again.');
      }
    }
  };

  useEffect(()=>{
    console.log(user);
    console.log(book);
    console.log(bookDetails);
  },[user,book,bookDetails])
  return (
    <div className='md:mx-16 bg-gray-50 rounded-lg px-8 py-4 my-6'>
          <h1 className='text-2xl font-bold text-blue-500'>You are going to borrow this book</h1>
          <div className='book-details flex justify-evenly space-x-4 my-6'>
            <div className='book-image bg-gray-200 w-1/3 h-[200px] rounded-xl'>

            </div>
            <div className='w-2/3'>
                <h2 className='text-xl font-bold text-gray-700'>{bookDetails?.title}</h2>
                <p className='text-gray-500'>by <b>{bookDetails?.author}</b></p>
                <p className='text-gray-500'>{bookDetails?.description}</p>
                <p className='text-gray-700 font-mono'>{book?.id}</p>
                <button className='text-white bg-blue-600 px-12 py-2 mt-4 rounded-xl' onClick={borrowBook}>Borrow This Book</button>
            </div>
          </div>
    </div>
  )
}

export default BorrowBookUser
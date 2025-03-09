'use client';

import { useEffect, useState } from 'react';
import { 
  firebaseTransactionOperations, 
  firebaseLocationOperations, 
  firebaseBookOperations, 
  firebaseBookCopyOperations,
  Transaction,
  Location
} from '../../../utils/utils';
import Link from 'next/link';

interface ExtendedTransaction extends Transaction {
  bookTitle?: string;
  locationName?: string;
}

export default function UserHistoryPage() {
  const [transactions, setTransactions] = useState<ExtendedTransaction[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [activeLocation, setActiveLocation] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [returnSuccess, setReturnSuccess] = useState<string | null>(null);
  const [donateSuccess, setDonateSuccess] = useState<string | null>(null);
  
  // In a real app, this would come from authentication
  const userId = 'reader1';

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch user's transaction history
        const userTransactions = await firebaseTransactionOperations.getUserTransactionHistory(userId);
        
        // Fetch active locations for return options
        const activeLocations = await firebaseLocationOperations.getActiveLocations();
        setLocations(activeLocations);
        if (activeLocations.length > 0) {
          setActiveLocation(activeLocations[0].id);
        }
        
        // Enhance transactions with book and location info
        const enhancedTransactions = await Promise.all(userTransactions.map(async (transaction) => {
          const enhancedTransaction = { ...transaction } as ExtendedTransaction;
          
          try {
            // Get book details for each transaction
            const book = await firebaseBookOperations.getBook(transaction.bookId);
            if (book) {
              enhancedTransaction.bookTitle = book.title;
              
            }
            
            // Get location name if there's a location ID
            if (transaction.locationId) {
              const location = await firebaseLocationOperations.getLocation(transaction.locationId as string);
              if (location) {
                enhancedTransaction.locationName = location.name;
              }
            }
          } catch (err) {
            console.error('Error enhancing transaction:', err);
          }
          
          return enhancedTransaction;
        }));
        
        setTransactions(enhancedTransactions);
      } catch (err) {
        console.error('Error fetching user history:', err);
        setError('Failed to load your transaction history');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userId]);

  console.log('transactions:', transactions);
  
  const handleReturn = async (bookId: string) => {
    if (!activeLocation) {
      setError('Please select a return location');
      return;
    }

    try {
      await firebaseTransactionOperations.returnBook(bookId, userId, activeLocation);
      setReturnSuccess(`Book returned successfully to ${locations.find(l => l.id === activeLocation)?.name}`);
      
      // Refresh the transaction history
      const updatedTransactions = await firebaseTransactionOperations.getUserTransactionHistory(userId);
      setTransactions(updatedTransactions);
    } catch (err) {
      console.error('Error returning book:', err);
      setError('Failed to return book');
    }
  };

//   const handleDonate = async (bookId: string) => {
//     if (!activeLocation) {
//       setError('Please select a donation location');
//       return;
//     }

//     try {
//       await firebaseTransactionOperations.donateBook(bookId, userId, activeLocation);
//       setDonateSuccess(`Book donated successfully to ${locations.find(l => l.id === activeLocation)?.name}`);
      
//       // Refresh the transaction history
//       const updatedTransactions = await firebaseTransactionOperations.getUserTransactionHistory(userId);
//       setTransactions(updatedTransactions);
//     } catch (err) {
//       console.error('Error donating book:', err);
//       setError('Failed to donate book');
//     }
//   };

  if (loading) {
    return <div className="p-8 text-center">Loading your transaction history...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Library Activity</h1>
      
      <div className="mb-4">
        <Link href="/reader" className="text-blue-600 hover:underline mb-4 inline-block">
          &larr; Back to Books
        </Link>
      </div>

      {returnSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {returnSuccess}
        </div>
      )}

      {donateSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {donateSuccess}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Return or Donate a Book</h2>
        <div className="flex items-center">
          <select
            value={activeLocation}
            onChange={(e) => setActiveLocation(e.target.value)}
            className="border rounded p-2 mr-2 flex-grow"
          >
            {locations.map(location => (
              <option key={location.id} value={location.id}>
                {location.name} - {location.address}
              </option>
            ))}
          </select>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Select the location where you're returning or donating books
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">My Activity</h2>
        
        {transactions.length === 0 ? (
          <p className="text-gray-500 italic">You don't have any library activity yet</p>
        ) : (
          <div className="space-y-4">
            {transactions.map(transaction => (
              <div key={transaction.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{transaction.bookTitle || 'Unknown Book'}</h3>
                    <p className="text-sm text-gray-600">
                      {transaction.action === 'donate' ? 'Donated' : "Borrowd"} on{' '}
                      {transaction.createdAt.toLocaleDateString()}
                    </p>
                    {transaction.locationName && (
                      <p className="text-sm text-gray-600">
                        {transaction.action === 'borrow' ? 'From' : 'To'}: {transaction.locationName}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    {transaction.action === 'borrow' && (
                      <button
                        onClick={() => handleReturn(transaction.bookId)}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm"
                      >
                        Return
                      </button>
                    )}
                    {/* <button
                      onClick={() => handleDonate(transaction.bookId)}
                      className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded text-sm"
                    >
                      Donate Copy
                    </button> */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

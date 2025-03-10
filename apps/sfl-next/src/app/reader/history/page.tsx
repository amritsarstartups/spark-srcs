'use client';

import { useEffect, useState } from 'react';
import { 
  firebaseTransactionOperations, 
  firebaseLocationOperations, 
  firebaseBookOperations, 
  firebaseBookCopyOperations,
  Transaction,
  Location,
  Book,
  BookCopy
} from '../../../utils/utils';
import Link from 'next/link';

interface ExtendedTransaction extends Transaction {
  bookTitle?: string;
  locationName?: string;
  bookCopyId?: string; // Add this to store the book copy ID
  canBeReturned?: boolean; // New flag to control return button visibility
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
  const userId = 'TpDZRqVaROl7cXoSqcEH';

  const refreshData = async () => {
    try {
      setLoading(true);
      // Fetch user's transaction history
      const userTransactions = await firebaseTransactionOperations.getUserTransactionHistory(userId);
      
      // Fetch active locations for return options
      const activeLocations = await firebaseLocationOperations.getActiveLocations();
      setLocations(activeLocations);
      if (activeLocations.length > 0 && !activeLocation) {
        setActiveLocation(activeLocations[0].id);
      }
      
      // Fetch borrowed book copies to get the book copy IDs
      const borrowedCopies = await firebaseBookCopyOperations.getBookCopiesByStatus('borrowed');
      
      // Track which book copies are already borrowed to prevent duplicate return buttons
      const returnableCopyIds = new Set();
      
      // Get all recent return transactions to know which books have been returned
      const allTransactions = await firebaseTransactionOperations.getAllTransactions();
      const returnTransactions = new Set(
        allTransactions
          .filter(t => t.action === 'return')
          .map(t => t.bookId)
      );
      
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
            const location = await firebaseLocationOperations.getLocation(transaction.locationId);
            if (location) {
              enhancedTransaction.locationName = location.name;
            }
          }

          // For 'borrow' transactions, find the corresponding book copy ID
          if (transaction.action === 'borrow') {
            // Find the book copy that matches this transaction's book ID
            const matchingCopy = borrowedCopies.find(copy => 
              (copy.bookId as any).id === transaction.bookId
            );
            
            if (matchingCopy) {
              enhancedTransaction.bookCopyId = matchingCopy.id;
              
              // Only allow returning if this copy hasn't been added to returnable list yet
              // This prevents multiple "borrow" transactions of the same book showing return buttons
              if (!returnableCopyIds.has(matchingCopy.id)) {
                enhancedTransaction.canBeReturned = true;
                returnableCopyIds.add(matchingCopy.id);
              } else {
                enhancedTransaction.canBeReturned = false;
              }
            } else {
              // If we can't find a matching copy in borrowed status, 
              // it means the book has already been returned
              enhancedTransaction.canBeReturned = false;
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
  };

  useEffect(() => {
    refreshData();
  }, [userId]);

  const handleReturn = async (transaction: ExtendedTransaction) => {
    if (!activeLocation) {
      setError('Please select a return location');
      return;
    }
    
    if (!transaction.bookCopyId) {
      setError('Could not find the book copy to return');
      return;
    }

    try {
      console.log(`Returning book copy ID: ${transaction.bookCopyId} to location: ${activeLocation}`);
      await firebaseTransactionOperations.returnBook(
        transaction.bookCopyId,
        userId, 
        activeLocation
      );
      
      setReturnSuccess(`Book "${transaction.bookTitle}" returned successfully to ${locations.find(l => l.id === activeLocation)?.name}`);
      
      // Mark this transaction as not returnable immediately in the UI
      setTransactions(transactions.map(t => {
        if (t.bookCopyId === transaction.bookCopyId) {
          return { ...t, canBeReturned: false };
        }
        return t;
      }));
      
      // Refresh the transaction history after a short delay
      setTimeout(() => {
        refreshData();
      }, 1000);
    } catch (err) {
      console.error('Error returning book:', err);
      setError(`Failed to return book: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading your transaction history...</div>;
  }

  if (error) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <div className="mb-4">
          <Link href="/reader" className="text-blue-600 hover:underline mb-4 inline-block">
            &larr; Back to Books
          </Link>
        </div>
      </div>
    );
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
        <h2 className="text-lg font-semibold mb-2">Return Location</h2>
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
          Select the location where you're returning books
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
                      {transaction.action === 'borrow' ? 'Borrowed' : 
                       transaction.action === 'return' ? 'Returned' : 'Donated'} on{' '}
                      {transaction.createdAt.toLocaleDateString()}
                    </p>
                    {transaction.locationName && (
                      <p className="text-sm text-gray-600">
                        {transaction.action === 'borrow' ? 'From' : 'To'}: {transaction.locationName}
                      </p>
                    )}
                    {transaction.bookCopyId && (
                      <p className="text-xs text-gray-500">Copy ID: {transaction.bookCopyId}</p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    {transaction.action === 'borrow' && transaction.canBeReturned && (
                      <button
                        onClick={() => handleReturn(transaction)}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm"
                      >
                        Return
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-6 text-right">
        <button 
          onClick={refreshData}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded"
        >
          Refresh Activity
        </button>
      </div>
    </div>
  );
}

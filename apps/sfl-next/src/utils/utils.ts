import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, doc, addDoc, updateDoc, getDoc,
  getDocs, query, where, orderBy, deleteDoc,
  writeBatch, runTransaction, serverTimestamp, DocumentReference as FirestoreDocumentReference
} from 'firebase/firestore';
import { getStorage, ref } from 'firebase/storage';

// Updated interfaces with new schema
export interface Book {
  id: string;            // Unique identifier
  title: string;         // Book title
  author: string;        // Author name
  isbn?: string;         // Optional ISBN
  description?: string;  // Book description
  coverImage?: string;   // URL to cover image
  genre?: string[];      // Array of genres
  createdAt: Date;       // When the book was added to system
}

export type ref = FirestoreDocumentReference;

export interface BookCopy {
  id: string;            // Unique identifier for this copy
  bookId: ref;           // Reference to the book document
  status: 'available' | 'borrowed' | 'in-transit'; // Current status
  locationId: string | ref; // Current location ID (null if borrowed)
}

export interface Location {
  id: string;            // Unique identifier
  name: string;          // Location name
  address: string;       // Physical address
  isActive: boolean;     // Whether this location is active
}

export interface User {
  id: string;            // Unique identifier
  email: string;         // User email
  name: string;          // User display name
  role: 'reader' | 'admin'; // User role
  createdDate: Date;     // When user joined
}

export interface Transaction {
  id: string;            // Unique identifier
  bookId: string;        // Reference to book copy
  userId: string;        // User who performed transaction
  action: 'borrow' | 'return' | 'donate'; // Transaction type
  locationId: string | null; // Destination location (null if borrowed)
  createdAt: Date;       // When transaction occurred
}

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCuZpKNJdFFrGrvtY6yfOp8bh6CubdJSqc",
    authDomain: "library-statusbrew.firebaseapp.com",
    projectId: "library-statusbrew",
    storageBucket: "library-statusbrew.firebasestorage.app",
    messagingSenderId: "260373706060",
    appId: "1:260373706060:web:39837c08946fdb477d4be9",
    measurementId: "G-HS9J9QNX99"
  };


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
const storage = getStorage(app);

// Collection References
const booksCollection = collection(db, 'books');
const bookCopiesCollection = collection(db, 'bookCopies');
const locationsCollection = collection(db, 'locations');
const usersCollection = collection(db, 'users');
const transactionsCollection = collection(db, 'transactions');

// Updated Firebase Book Operations
export const firebaseBookOperations = {
  createBook: async (bookData: Omit<Book, 'id' | 'createdAt'>): Promise<Book> => {
    const newBook = {
      ...bookData,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(booksCollection, newBook);
    return {
      ...newBook,
      id: docRef.id,
      createdAt: new Date() // Convert serverTimestamp to Date for local use
    } as Book;
  },

  getBook: async (bookId: string): Promise<Book | null> => {
    const bookDoc = await getDoc(doc(booksCollection, bookId));
    if (!bookDoc.exists()) return null;

    const bookData = bookDoc.data();
    return {
      ...bookData,
      id: bookDoc.id,
      createdAt: bookData.createdAt?.toDate() || new Date()
    } as Book;
  },

  updateBook: async (bookId: string, updates: Partial<Omit<Book, 'id' | 'createdAt'>>): Promise<void> => {
    await updateDoc(doc(booksCollection, bookId), updates);
  },

  deleteBook: async (bookId: string): Promise<void> => {
    // First, check if there are any book copies
    const bookRef = doc(booksCollection, bookId);
    const bookCopiesQuery = query(
      bookCopiesCollection,
      where('bookId', '==', bookRef)
    );
    const bookCopiesSnapshot = await getDocs(bookCopiesQuery);

    if (!bookCopiesSnapshot.empty) {
      throw new Error('Cannot delete book with existing copies');
    }

    await deleteDoc(bookRef);
  },

  searchBooks: async (searchTerm: string): Promise<Book[]> => {
    // Basic implementation - For production, consider using Firebase extensions
    // like Algolia or ElasticSearch for advanced search capabilities
    const booksSnapshot = await getDocs(booksCollection);
    const books: Book[] = [];

    booksSnapshot.forEach(doc => {
      const data = doc.data();
      const book = {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date()
      } as Book;

      const searchTermLower = searchTerm.toLowerCase();
      if (
        book.title.toLowerCase().includes(searchTermLower) ||
        book.author.toLowerCase().includes(searchTermLower) ||
        book.isbn?.toLowerCase().includes(searchTermLower) ||
        book.genre?.some(g => g.toLowerCase().includes(searchTermLower))
      ) {
        books.push(book);
      }
    });

    return books;
  },

  getBooksByGenre: async (genre: string): Promise<Book[]> => {
    // Note: Firebase doesn't support direct array contains queries on arrays
    // For production, consider using a different data structure or Cloud Functions
    const booksSnapshot = await getDocs(booksCollection);
    const books: Book[] = [];

    booksSnapshot.forEach(doc => {
      const data = doc.data();
      const bookGenres = data.genre || [];

      if (bookGenres.includes(genre)) {
        books.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date()
        } as Book);
      }
    });

    return books;
  }
};

// Updated Firebase BookCopy Operations
export const firebaseBookCopyOperations = {
  createBookCopy: async (
    bookId: string,
    locationId: string
  ): Promise<BookCopy> => {
    // Create reference objects
    const bookRef = doc(booksCollection, bookId);
    const locationRef = doc(locationsCollection, locationId);

    // Create new book copy
    const newBookCopy: Omit<BookCopy, 'id'> = {
      bookId: bookRef,
      status: 'available',
      locationId: locationRef
    };

    // Add to Firestore
    const docRef = await addDoc(bookCopiesCollection, newBookCopy);

    return { ...newBookCopy, id: docRef.id };
  },

  getBookCopy: async (copyId: string): Promise<BookCopy | null> => {
    const copyDoc = await getDoc(doc(bookCopiesCollection, copyId));
    if (!copyDoc.exists()) return null;

    return { ...copyDoc.data(), id: copyDoc.id } as BookCopy;
  },

  updateBookCopy: async (copyId: string, updates: Partial<Omit<BookCopy, 'id'>>): Promise<void> => {
    await updateDoc(doc(bookCopiesCollection, copyId), updates);
  },

  deleteBookCopy: async (copyId: string): Promise<void> => {
    const copyRef = doc(bookCopiesCollection, copyId);
    const copyDoc = await getDoc(copyRef);

    if (!copyDoc.exists()) {
      throw new Error('Book copy does not exist');
    }

    // Check if the copy is borrowed
    if (copyDoc.data().status === 'borrowed') {
      throw new Error('Cannot delete a borrowed book copy');
    }

    await deleteDoc(copyRef);
  },

  getAvailableCopies: async (bookId?: string): Promise<BookCopy[]> => {
    const queryConstraints: any[] = [
      where('status', '==', 'available')
    ];

    if (bookId) {
      const bookRef = doc(booksCollection, bookId);
      queryConstraints.push(where('bookId', '==', bookRef));
    }

    const q = query(bookCopiesCollection, ...queryConstraints);
    const snapshot = await getDocs(q);

    const copies: BookCopy[] = [];
    snapshot.forEach(doc => {
      copies.push({ ...doc.data(), id: doc.id } as BookCopy);
    });

    return copies;
  },

  getBookCopiesByStatus: async (status: BookCopy['status']): Promise<BookCopy[]> => {
    const q = query(
      bookCopiesCollection,
      where('status', '==', status)
    );
    const snapshot = await getDocs(q);

    const copies: BookCopy[] = [];
    snapshot.forEach(doc => {
      copies.push({ ...doc.data(), id: doc.id } as BookCopy);
    });

    return copies;
  }
};

// Updated Firebase Location Operations
export const firebaseLocationOperations = {
  createLocation: async (locationData: Omit<Location, 'id' | 'isActive'>): Promise<Location> => {
    const newLocation = {
      ...locationData,
      isActive: true
    };

    const docRef = await addDoc(locationsCollection, newLocation);
    return { ...newLocation, id: docRef.id };
  },

  getLocation: async (locationId: string): Promise<Location | null> => {
    const locationDoc = await getDoc(doc(locationsCollection, locationId));
    if (!locationDoc.exists()) return null;

    return { ...locationDoc.data(), id: locationDoc.id } as Location;
  },

  updateLocation: async (locationId: string, updates: Partial<Omit<Location, 'id'>>): Promise<void> => {
    await updateDoc(doc(locationsCollection, locationId), updates);
  },

  setLocationStatus: async (locationId: string, isActive: boolean): Promise<void> => {
    await updateDoc(doc(locationsCollection, locationId), { isActive });
  },

  getActiveLocations: async (): Promise<Location[]> => {
    const q = query(
      locationsCollection,
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);

    const locations: Location[] = [];
    snapshot.forEach(doc => {
      locations.push({ ...doc.data(), id: doc.id } as Location);
    });

    return locations;
  },

  getBookCopiesAtLocation: async (locationId: string): Promise<BookCopy[]> => {
    const locationRef = doc(locationsCollection, locationId);
    const q = query(
      bookCopiesCollection,
      where('locationId', '==', locationRef)
    );
    const snapshot = await getDocs(q);

    const copies: BookCopy[] = [];
    snapshot.forEach(doc => {
      copies.push({ ...doc.data(), id: doc.id } as BookCopy);
    });

    return copies;
  }
};

// Updated Firebase User Operations
export const firebaseUserOperations = {
  createUser: async (userData: Omit<User, 'id' | 'createdDate'>): Promise<User> => {
    const newUser = {
      ...userData,
      createdDate: serverTimestamp()
    };

    const docRef = await addDoc(usersCollection, newUser);
    return {
      ...newUser,
      id: docRef.id,
      createdDate: new Date()
    };
  },

  getUser: async (userId: string): Promise<User | null> => {
    const userDoc = await getDoc(doc(usersCollection, userId));
    if (!userDoc.exists()) return null;

    const userData = userDoc.data();
    return {
      ...userData,
      id: userDoc.id,
      createdDate: userData.createdDate?.toDate() || new Date()
    } as User;
  },

  updateUser: async (
    userId: string,
    updates: Partial<Omit<User, 'id' | 'createdDate'>>
  ): Promise<void> => {
    await updateDoc(doc(usersCollection, userId), updates);
  },

  setUserRole: async (userId: string, role: User['role']): Promise<void> => {
    await updateDoc(doc(usersCollection, userId), { role });
  }
};

// Updated Firebase Transaction Operations
export const firebaseTransactionOperations = {
  createTransaction: async (
    action: Transaction['action'],
    bookId: string,
    userId: string,
    locationId: string | null
  ): Promise<Transaction> => {
    const newTransaction: Omit<Transaction, 'id'> = {
      bookId,
      userId,
      action,
      locationId,
      createdAt: new Date()
    };

    const docRef = await addDoc(transactionsCollection, {
      ...newTransaction,
      createdAt: serverTimestamp()
    });

    return { ...newTransaction, id: docRef.id };
  },

  borrowBook: async (
    bookCopyId: string,
    userId: string,
    fromLocationId: string
  ): Promise<void> => {
    const bookCopyRef = doc(bookCopiesCollection, bookCopyId);

    await runTransaction(db, async (transaction) => {
      const bookCopyDoc = await transaction.get(bookCopyRef);

      if (!bookCopyDoc.exists()) {
        throw new Error('Book copy does not exist');
      }

      const bookCopyData = bookCopyDoc.data();

      if (bookCopyData.status !== 'available') {
        throw new Error('Book copy is not available for borrowing');
      }

      // Get book ID from reference
      const bookId = (bookCopyData.bookId as FirestoreDocumentReference).id;

      // Update book copy status
      transaction.update(bookCopyRef, {
        status: 'borrowed',
        locationId: null
      });

      // Create transaction record
      const transactionData = {
        bookId,
        userId,
        action: 'borrow' as Transaction['action'],
        locationId: fromLocationId,
        createdAt: serverTimestamp(),
      };

      const transactionRef = doc(transactionsCollection);
      transaction.set(transactionRef, transactionData);
    });
  },

  returnBook: async (
    bookCopyId: string,
    userId: string,
    toLocationId: string
  ): Promise<void> => {
    const bookCopyRef = doc(bookCopiesCollection, bookCopyId);
    const locationRef = doc(locationsCollection, toLocationId);

    await runTransaction(db, async (transaction) => {
      const bookCopyDoc = await transaction.get(bookCopyRef);

      if (!bookCopyDoc.exists()) {
        throw new Error('Book copy does not exist');
      }

      const bookCopyData = bookCopyDoc.data();

      if (bookCopyData.status !== 'borrowed') {
        throw new Error('Book copy is not currently borrowed');
      }

      // Get book ID from reference
      const bookId = (bookCopyData.bookId as FirestoreDocumentReference).id;

      // Update book copy status
      transaction.update(bookCopyRef, {
        status: 'available',
        locationId: locationRef
      });

      // Create transaction record
      const transactionData = {
        bookId,
        userId,
        action: 'return' as Transaction['action'],
        locationId: toLocationId,
        createdAt: serverTimestamp(),
      };

      const transactionRef = doc(transactionsCollection);
      transaction.set(transactionRef, transactionData);
    });
  },

  donateBook: async (
    bookId: string,
    userId: string,
    toLocationId: string
  ): Promise<BookCopy> => {
    const bookRef = doc(booksCollection, bookId);
    const locationRef = doc(locationsCollection, toLocationId);
    let newBookCopyId: string;

    // Run everything in a transaction
    await runTransaction(db, async (transaction) => {
      // Check if book exists
      const bookDoc = await transaction.get(bookRef);

      if (!bookDoc.exists()) {
        throw new Error('Book does not exist');
      }

      // Create new book copy
      const newBookCopyRef = doc(bookCopiesCollection);
      newBookCopyId = newBookCopyRef.id;

      const bookCopyData = {
        bookId: bookRef,
        status: 'available' as BookCopy['status'],
        locationId: locationRef
      };

      transaction.set(newBookCopyRef, bookCopyData);

      // Create transaction record
      const transactionData = {
        bookId,
        userId,
        action: 'donate' as Transaction['action'],
        locationId: toLocationId,
        createdAt: serverTimestamp(),
      };

      const transactionRef = doc(transactionsCollection);
      transaction.set(transactionRef, transactionData);
    });

    // Get the newly created book copy
    const bookCopyDoc = await getDoc(doc(bookCopiesCollection, newBookCopyId!));
    return { ...bookCopyDoc.data(), id: bookCopyDoc.id } as BookCopy;
  },

  getUserTransactionHistory: async (userId: string): Promise<Transaction[]> => {
    const q = query(
      transactionsCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);

    const transactions: Transaction[] = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      transactions.push({
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date()
      } as Transaction);
    });

    return transactions;
  },

  getBookTransactionHistory: async (bookId: string): Promise<Transaction[]> => {
    const q = query(
      transactionsCollection,
      where('bookId', '==', bookId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);

    const transactions: Transaction[] = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      transactions.push({
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date()
      } as Transaction);
    });

    return transactions;
  },
  
  getAllTransactions: async (): Promise<Transaction[]> => {
    const q = query(transactionsCollection, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
  
    const transactions: Transaction[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      transactions.push({
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Transaction);
    });
  
    return transactions;
  },
};

// Helper Functions
function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export const dateUtils = {
  formatDate: (date: Date): string => {
    return date.toLocaleDateString();
  },

  calculateDaysBetween: (start: Date, end: Date = new Date()): number => {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
};

// Updated Demo data population function for new schema
export const populateFirebaseWithDemoData = async (): Promise<void> => {
  try {
    console.log('Starting to populate Firebase with demo data...');

    // Create batch for efficient writes
    const batch = writeBatch(db);

    // Demo Locations
    const demoLocations: Omit<Location, 'id' | 'isActive'>[] = [
      {
        name: 'Central Library',
        address: '123 Main Street, Cityville'
      },
      {
        name: 'Riverside Branch',
        address: '456 River Road, Cityville'
      },
      {
        name: 'Mountain Community Library',
        address: '789 Summit Avenue, Mountain View'
      }
    ];

    // Create location documents and store their references
    const locationRefs: FirestoreDocumentReference[] = [];
    for (const locationData of demoLocations) {
      const locationRef = doc(locationsCollection);
      batch.set(locationRef, { ...locationData, isActive: true });
      locationRefs.push(locationRef);
    }

    // Demo Books
    const demoBooks: Omit<Book, 'id' | 'createdAt'>[] = [
      {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        isbn: '9780743273565',
        description: 'A story of wealth, love, and the American Dream in the Jazz Age',
        coverImage: 'https://source.unsplash.com/random/800x1200/?book,gatsby',
        genre: ['Classic', 'Fiction']
      },
      {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        isbn: '9780061120084',
        description: 'A powerful story of racism and childhood innocence in the American South',
        coverImage: 'https://source.unsplash.com/random/800x1200/?book,mockingbird',
        genre: ['Classic', 'Fiction', 'Coming of Age']
      },
      {
        title: '1984',
        author: 'George Orwell',
        isbn: '9780451524935',
        description: 'A dystopian novel about totalitarianism, surveillance, and thought control',
        coverImage: 'https://source.unsplash.com/random/800x1200/?book,dystopia',
        genre: ['Dystopian', 'Science Fiction', 'Classic']
      },
      {
        title: 'The Lord of the Rings',
        author: 'J.R.R. Tolkien',
        isbn: '9780618640157',
        description: 'An epic fantasy adventure about the quest to destroy a powerful ring',
        coverImage: 'https://source.unsplash.com/random/800x1200/?book,fantasy',
        genre: ['Fantasy', 'Adventure', 'Epic']
      },
      {
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        isbn: '9780141439518',
        description: 'A romantic novel about manners, upbringing, morality, and marriage',
        coverImage: 'https://source.unsplash.com/random/800x1200/?book,romance',
        genre: ['Classic', 'Romance', 'Fiction']
      }
    ];

    // Create book documents and store their references
    const bookRefs: FirestoreDocumentReference[] = [];
    for (const bookData of demoBooks) {
      const bookRef = doc(booksCollection);
      batch.set(bookRef, {
        ...bookData,
        createdAt: serverTimestamp(),
      });
      bookRefs.push(bookRef);
    }

    // Demo users (without auth)
    const demoUsers: Omit<User, 'id' | 'createdDate'>[] = [
      {
        email: 'admin@readify.com',
        name: 'Admin User',
        role: 'admin'
      },
      {
        email: 'reader1@example.com',
        name: 'Reader One',
        role: 'reader'
      },
      {
        email: 'reader2@example.com',
        name: 'Reader Two',
        role: 'reader'
      }
    ];

    // Create user documents and store their references
    const userRefs: FirestoreDocumentReference[] = [];
    for (const userData of demoUsers) {
      const userRef = doc(usersCollection);
      batch.set(userRef, {
        ...userData,
        createdDate: serverTimestamp()
      });
      userRefs.push(userRef);
    }

    // Commit batch write with locations, books, and users
    await batch.commit();

    // Create book copies
    const bookCopiesBatch = writeBatch(db);
    let bookCopyCount = 0;

    bookRefs.forEach((bookRef) => {
      // Each book gets copies at different locations
      locationRefs.forEach((locationRef) => {
        // Random number of copies (1-2) per location
        const numCopies = Math.floor(Math.random() * 2) + 1;

        for (let i = 0; i < numCopies; i++) {
          const bookCopyRef = doc(bookCopiesCollection);
          bookCopiesBatch.set(bookCopyRef, {
            bookId: bookRef,
            status: 'available',
            locationId: locationRef
          });

          bookCopyCount++;
        }
      });
    });

    // Commit book copies batch
    await bookCopiesBatch.commit();

    console.log('Demo data population complete!');
    console.log(`Created ${demoLocations.length} locations`);
    console.log(`Created ${demoBooks.length} books`);
    console.log(`Created ${bookCopyCount} book copies`);
    console.log(`Created ${demoUsers.length} users`);

    return;
  } catch (error) {
    console.error('Error populating Firebase with demo data:', error);
    throw error;
  }
};

// Function to clear all demo data (use with caution!)
export const clearAllFirebaseData = async (): Promise<void> => {
  try {
    console.log('Starting to clear all Firebase data...');

    // Delete all documents in each collection
    const collections = [
      booksCollection,
      bookCopiesCollection,
      locationsCollection,
      usersCollection,
      transactionsCollection
    ];

    for (const collection of collections) {
      const snapshot = await getDocs(collection);

      if (snapshot.empty) {
        console.log(`Collection ${collection.id} is already empty.`);
        continue;
      }

      console.log(`Deleting ${snapshot.size} documents from ${collection.id}...`);

      // Use batched writes for efficiency (Firestore limits batch size to 500)
      const batchSize = 450;
      let batch = writeBatch(db);
      let counter = 0;

      for (const doc of snapshot.docs) {
        batch.delete(doc.ref);
        counter++;

        if (counter >= batchSize) {
          await batch.commit();
          batch = writeBatch(db);
          counter = 0;
        }
      }

      // Commit any remaining documents
      if (counter > 0) {
        await batch.commit();
      }
    }

    console.log('All Firebase data cleared successfully!');
    return;
  } catch (error) {
    console.error('Error clearing Firebase data:', error);
    throw error;
  }
};

// Helper function to reset and repopulate demo data
export const resetAndPopulateFirebaseData = async (): Promise<void> => {
  try {
    await clearAllFirebaseData();
    await populateFirebaseWithDemoData();
    console.log('Firebase data reset and repopulated successfully!');
  } catch (error) {
    console.error('Error resetting and repopulating Firebase data:', error);
    throw error;
  }
};

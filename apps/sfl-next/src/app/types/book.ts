// Book interface matching the utils.ts definition
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

export interface BookCopy {
  id: string;            // Unique identifier for this copy
  bookId: string | any;  // Reference to the book document
  status: 'available' | 'borrowed' | 'in-transit'; // Current status
  locationId: string | any; // Current location ID
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
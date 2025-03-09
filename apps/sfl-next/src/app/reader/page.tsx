import { firebaseBookOperations, firebaseUserOperations } from '../../utils/utils';
import Books from './Books';
import Link from 'next/link';

export default async function ReaderPage() {
    // Get books data
    const books = await firebaseBookOperations.searchBooks('');
    
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Library Catalog</h1>
                <Link 
                    href="/reader/history" 
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                >
                    My Borrowing History
                </Link>
            </div>
            <Books data={books} />
        </div>
    );
}
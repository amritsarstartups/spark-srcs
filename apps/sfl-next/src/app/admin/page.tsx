"use client"
import Link from 'next/link';

export default function HomePage() {
    return (
        <div className="flex justify-center items-center mt-14">
            <div className="p-6 flex flex-col items-center text-center">
                <h2 className="text-4xl font-bold text-gray-800 mb-6">Welcome to Library Admin Panel</h2>
                <p className="text-gray-600">Manage your books, transactions, and locations efficiently.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16">
                    <Link href="/admin/books" legacyBehavior>
                        <a className="p-4 bg-blue-500 text-white rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold">Books</h3>
                            <p>Manage and add new books</p>
                        </a>
                    </Link>
                    <Link href="/admin/transactions" legacyBehavior>
                        <a className="p-4 bg-green-500 text-white rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold">Transactions</h3>
                            <p>Track borrow and return records</p>
                        </a>
                    </Link>
                    <Link href="/admin/location" legacyBehavior>
                        <a className="p-4 bg-purple-500 text-white rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold">Locations</h3>
                            <p>Manage book locations</p>
                        </a>
                    </Link>
                </div>
            </div>
        </div>
    );
}
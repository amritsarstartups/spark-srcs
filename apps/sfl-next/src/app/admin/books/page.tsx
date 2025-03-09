"use client"

import { useRouter } from 'next/navigation';

interface BookActionProps {
    href: string;
    bgColor: string;
    title: string;
    description: string;
}

function BookAction({ href, bgColor, title, description }: BookActionProps) {
    const router = useRouter();
    return (
        <div className={`p-4 ${bgColor} text-white rounded-lg shadow-md cursor-pointer`} onClick={() => router.push(href)}>
            <h3 className="text-xl font-semibold">{title}</h3>
            <p>{description}</p>
        </div>
    );
}

export default function BooksPage() {
    return (
        <div className="flex justify-center items-center mt-14">
            <div className="p-6 flex flex-col items-center text-center">
                <h2 className="text-4xl font-bold text-gray-800 mb-6">Welcome to Library Admin Panel</h2>
                <p className="text-gray-600">Manage your books, transactions, and locations efficiently.</p>
                <div className="grid md:grid-cols-3 gap-8 mt-16">
                    <BookAction href="/admin/books/addbook" bgColor="bg-blue-500" title="Add Book" description="Add new book" />
                    <BookAction href="/admin/books/showbooks" bgColor="bg-purple-500" title="Show Books" description="Manage all books" />
                    <BookAction href="/admin/books/bookcopies" bgColor="bg-purple-500" title="Manage copies of Books" description="Manage all copies books" />
                </div>
            </div>
        </div>
    );
}
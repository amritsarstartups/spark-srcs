'use client';
import { useState } from 'react';
import { Book } from '../types/book';
import Link from 'next/link';

export default function Books({ data }: { data: Book[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('');

    const filteredBooks = data.filter((book) => {
        const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGenre = selectedGenre ? book.genre?.includes(selectedGenre) : true;
        return matchesSearch && matchesGenre;
    });

    const genres = Array.from(new Set(data.flatMap(book => book.genre || [])));
    return (
        <div className="p-4">
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search by title"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="p-2 border border-gray-300 rounded"
                />
                <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="p-2 border border-gray-300 rounded ml-2"
                >
                    <option value="">All Genres</option>
                    {genres.map((genre) => (
                        <option key={genre} value={genre}>
                            {genre}
                        </option>
                    ))}
                </select>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
                {filteredBooks.map((book: Book) => (
                    <Link href={`/reader/${book.id}`} key={book.id || book.isbn}>
                        <div className="bg-white shadow-md rounded-lg p-6 mb-4 w-64">
                            <img
                                src={
                                    "https://edit.org/images/cat/book-covers-big-2019101610.jpg"
                                }
                                alt={book.title}
                                className="w-full h-48 object-cover mb-4"
                            />
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm text-gray-500">
                                    {book.genre?.join(', ')}
                                </span>
                                <span className="text-sm text-gray-500">
                                    {book.createdAt.toDateString()}
                                </span>
                            </div>
                            <h1 className="text-xl font-bold mb-2">{book.title}</h1>
                            <p className="text-gray-700 mb-1">{book.author}</p>
                            <p className="text-gray-500">{book.isbn}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

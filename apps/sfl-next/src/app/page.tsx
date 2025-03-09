import Link from 'next/link';

export default function Index() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-green-500 text-white">
      <h1 className="text-5xl font-extrabold mb-8">Welcome Small Free Library</h1>
      <div className="space-x-4">
        <Link href="/admin">
          <div className="px-6 py-3 bg-blue-700 rounded-lg shadow-lg hover:bg-blue-900 transition duration-300">
            Go to Admin
          </div>
        </Link>
        <Link href="/reader">
          <div className="px-6 py-3 bg-green-700 rounded-lg shadow-lg hover:bg-green-900 transition duration-300">
            Go to Reader
          </div>
        </Link>
      </div>
    </div>
  );
}

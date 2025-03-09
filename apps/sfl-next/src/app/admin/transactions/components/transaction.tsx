import React, { useEffect, useState } from "react";
import { firebaseTransactionOperations } from "../../../../utils/utils"; // Ensure correct import

const Transactions = ({ userId = "reader1"}: { userId: string }) => {
    interface Transaction {
      id: string;
      bookId: string;
      userId: string;
      action: string;
      locationId: string | null;
      createdAt: string;
    }

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
      const loadTransactions = async () => {
        if (!userId) {
          setError("User ID is missing.");
          setLoading(false);
          return;
        }

        try {
          const data = await firebaseTransactionOperations.getUserTransactionHistory(userId);
          setTransactions(data);
        } catch (err) {
          console.error("Error fetching transactions:", err);
          setError("Failed to load transactions.");
        } finally {
          setLoading(false);
        }
      };
      loadTransactions();
    }, [userId]);

    if (loading) return <p>Loading transactions...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Transactions</h2>
        <table className="min-w-full bg-white border border-gray-200 shadow-md">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="py-2 px-4 border">Book ID</th>
              <th className="py-2 px-4 border">User ID</th>
              <th className="py-2 px-4 border">Action</th>
              <th className="py-2 px-4 border">Location ID</th>
              <th className="py-2 px-4 border">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b">
                  <td className="py-2 px-4 border">{transaction.bookId}</td>
                  <td className="py-2 px-4 border">{transaction.userId}</td>
                  <td className="py-2 px-4 border font-semibold">{transaction.action}</td>
                  <td className="py-2 px-4 border">{transaction.locationId || "N/A"}</td>
                  <td className="py-2 px-4 border">{new Date(transaction.createdAt).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4">No transactions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
};

export default Transactions;
 
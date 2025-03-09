import React, { useState, useEffect } from "react";
import { db } from "../../../utils/utils";
import { collection, addDoc } from "firebase/firestore";

const AddLocation = () => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !address) return;
    try {
      await addDoc(collection(db, "locations"), { name, address });
      setName("");
      setAddress("");
      alert("Location added successfully!");
    } catch (error) {
      console.error("Error adding location:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Add New Location</h2>
        <form onSubmit={handleSubmit} className="w-full">
          <input type="text" placeholder="Location Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-4 border rounded mb-4" />
          <textarea placeholder="address" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-4 border rounded mb-4"></textarea>
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Add Location</button>
        </form>
      </div>
    </div>
  );
};

export default AddLocation;
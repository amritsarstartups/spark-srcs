import React, { useState, useEffect } from "react";
import { db } from "../../../../../utils/utils";
import { collection, getDocs } from "firebase/firestore";

const ViewLocations = () => {
    interface Location {
      id: string;
      name: string;
      address: string;
    }

    const [locations, setLocations] = useState<Location[]>([]);
  
    useEffect(() => {
      const fetchLocations = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, "locations"));
          setLocations(querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return { id: doc.id, name: data.name, address: data.address };
          }));
        } catch (error) {
          console.error("Error fetching locations:", error);
        }
      };
      fetchLocations();
    }, []);
  
    return (
      <div className="p-6 bg-white rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Library Locations</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">Location Name</th>
              <th className="border border-gray-300 p-2">Description</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((location) => (
              <tr key={location.id}>
                <td className="border border-gray-300 p-2">{location.name}</td>
                <td className="border border-gray-300 p-2">{location.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

export default ViewLocations;
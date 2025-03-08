"use client"
import React, { useEffect, useState } from 'react'
import { firebaseLocationOperations } from '../../utils/utils';
import { useRouter } from 'next/navigation';

function Locations() {
  const router = useRouter()

  const [locations,setLocations]=useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await firebaseLocationOperations.getActiveLocations();
      setLocations(data);
    };
    fetchData();
    console.log(locations);
  })

  return (
    <div className='mx-16 bg-gray-50 rounded-xl mt-8 py-6 px-4'>
        <span className='text-2xl font-bold'>Locations</span>
        <p className='text-gray-500'>Small Free Libraries are available at these locations</p>
        {locations.map((location) => (
            <div key={location.id} className='location-item bg-gray-100 p-6 rounded-lg my-2 flex items-center justify-between'>
              <div>
                <h3 className='font-bold'>{location.name}</h3>
                <p>{location.address}</p>
              </div>
              <div>
                <button className='bg-blue-500 text-white font-semibold px-6 py-2 rounded-md' onClick={()=>router.push("/locations/"+location.id)}>View Catalog</button>
              </div>
            </div>
        ))}
    </div>
  )
}

export default Locations

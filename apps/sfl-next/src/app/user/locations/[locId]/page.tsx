"use client"
import React, { useEffect, useState } from "react";
import BooksCatalog from "../../../../components/booksCatalog";
import { firebaseLocationOperations, Location } from "../../../../utils/utils";
import { use } from "react";

interface Params {
  locId: string;
}

function LocationDetails({ params }: { params: Promise<Params> }) {
  const { locId } = use(params);

  const [locationDetails,setLocationDetails] = useState<Location>();
  useEffect(()=>{
    const fetchLocationDetails = async () => {
      const locationDetails = await firebaseLocationOperations.getLocation(locId);
      if (locationDetails) {
        setLocationDetails(locationDetails);
      }
      };
      fetchLocationDetails();
      },[locId]);



  return (
    <div>
      <div className='mx-12 my-4 bg-gray-50 rounded-lg py-4 px-4 space-y-2'>
        {locationDetails&& (
          <div>
            <p className="text-gray-600">You are at</p>
            <h1 className="text-2xl font-bold">

            {locationDetails.name}</h1>
              <p className="text-blue-500 font-normal">{locationDetails.address}</p>
            </div>)}
      </div>
      <BooksCatalog location={locId} />
    </div>
  )
}

export default LocationDetails

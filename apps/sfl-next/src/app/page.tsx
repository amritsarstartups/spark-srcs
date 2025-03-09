"use client"
import { useEffect } from "react";

export default function Index() {
  /*
   * Replace the elements below with your own.
   *
   * Note: The corresponding styles are in the ./index.tailwind file.
   * 
   * 
   */
  useEffect(() => {
    // setup a user id in the localStorage
    const userId = "TpDZRqVaROl7cXoSqcEH"; // Example user ID
    localStorage.setItem("userId", userId);
  }, []);



  return (
    <>
    </>
  );
}

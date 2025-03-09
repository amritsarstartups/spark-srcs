import React from 'react'

function Navbar() {
  return (
    <div className='bg-white border-b border-b-gray-100 w-screen h-14 shadow-md'>
      <div className='flex justify-between items-center h-full p-4 mx-auto w-2/3'>
          <div className="nav-brand font-semibold">Small Free Library</div>
          <div className="nav-items w-1/4 flex justify-between">
              <div className="nav-link">
                Home
              </div>
              <div className="nav-link">
                Books
              </div>
              <div className="nav-link">
                Stores
              </div>
          </div>

      </div>
    </div>
  )
}

export default Navbar

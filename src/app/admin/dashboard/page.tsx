

import Navbar from '@/components/adminNavbar'
import Footer from '@/components/footer'
import StudentList from '@/components/studentList'
import AutoAllotSeats from '@/components/AutoAllotSeats'
import React from 'react'

const page = () => {
  
  return (
    <>
   <Navbar  />
    <div className="max-w-6xl mx-auto p-6 flex items-center justify-between">
      <AutoAllotSeats />
    </div>
    <StudentList />
    <Footer/>
    </>
  )
}

export default page
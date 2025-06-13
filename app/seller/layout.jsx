'use client'
import Navbar from '@/components/seller/Navbar'
import Sidebar from '@/components/seller/Sidebar'
import React, { useEffect } from 'react'
import { SignedIn, SignedOut, useClerk } from "@clerk/nextjs";

const Layout = ({ children }) => {

  const RequireSignIn = () => {
      const { openSignIn } = useClerk();
  
      useEffect(() => {
        openSignIn();
      }, [openSignIn]);
  
      return null;
    };
  return (
    <div>
      <SignedOut>
        <RequireSignIn/>
      </SignedOut>
      <SignedIn>

      <Navbar />
      <div className='flex w-full'>
        <Sidebar />
        {children}
      </div>
      </SignedIn>
    </div>
  )
}

export default Layout
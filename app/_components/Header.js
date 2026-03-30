import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

function Header() {
  return (
    <div className='flex justify-between items-center p-5 shadow-sm bg-white'>
      <Link href={'/'}>
        <Image alt="Logo" src={'/logo.svg'} width={150} height={100}/>
      </Link>
      <Link href={'/dashboard'}
        className='text-sm font-medium text-primary hover:text-primary/80 transition-colors'>
        Sign In
      </Link>
    </div>
  )
}

export default Header

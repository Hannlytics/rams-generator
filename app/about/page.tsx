'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [clicks, setClicks] = useState(0)
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-blue-50 to-white">
      <h1 className="text-6xl font-bold text-blue-600">
        Welcome to My App!
      </h1>
      <p className="mt-4 text-xl text-gray-700">
        This is my first Next.js project
      </p>
      <div className="flex gap-4 mt-8">
        <button 
          onClick={() => setClicks(clicks + 1)}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Clicked {clicks} times
        </button>
        <Link 
          href="/about"
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Go to About
        </Link>
      </div>
    </main>
  )
}
import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          RAMS App
        </Link>
        <div className="flex gap-6">
          <Link href="/dashboard" className="hover:text-blue-200">Dashboard</Link>
          <Link href="/new-rams" className="hover:text-blue-200">New RAMS</Link>
          <Link href="/library" className="hover:text-blue-200">Library</Link>
          <Link href="/login" className="hover:text-blue-200">Login</Link>
        </div>
      </div>
    </nav>
  )
}
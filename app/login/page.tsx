export default function Login() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="bg-white shadow-md p-8 rounded-lg max-w-sm w-full">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <form className="space-y-4">
          <input type="email" placeholder="Email" className="w-full px-4 py-2 border rounded" />
          <input type="password" placeholder="Password" className="w-full px-4 py-2 border rounded" />
          <button type="button" className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600">
            Sign In
          </button>
        </form>
      </div>
    </main>
  );
}
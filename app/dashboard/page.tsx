export default function Dashboard() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold">Total RAMS</h2>
          <p className="text-3xl font-bold text-blue-600">12</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold">Pending</h2>
          <p className="text-3xl font-bold text-yellow-600">3</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold">Completed</h2>
          <p className="text-3xl font-bold text-green-600">9</p>
        </div>
      </div>
    </main>
  );
}
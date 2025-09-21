export default function Library() {
  const items = [
    { id: 1, name: "RAMS Document 1", date: "2024-01-15", status: "Completed" },
    { id: 2, name: "RAMS Document 2", date: "2024-01-20", status: "Pending" },
    { id: 3, name: "RAMS Document 3", date: "2024-01-25", status: "Completed" },
  ];

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">RAMS Library</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map(item => (
              <tr key={item.id}>
                <td className="px-6 py-4">{item.name}</td>
                <td className="px-6 py-4">{item.date}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded ${
                    item.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
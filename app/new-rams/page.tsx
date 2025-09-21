export default function NewRams() {
  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create New RAMS</h1>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input type="text" className="w-full px-4 py-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea className="w-full px-4 py-2 border rounded" rows={4}></textarea>
        </div>
        <button type="button" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
          Create RAMS
        </button>
      </form>
    </main>
  );
}
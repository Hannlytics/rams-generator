'use client'
import { useState } from 'react'

export default function NewRams() {
  const [projectName, setProjectName] = useState('')
  const [hazards, setHazards] = useState('')
  const [controls, setControls] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/generate-rams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName, hazards, controls })
      })
      
      const data = await response.json()
      setResult(data.data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create New RAMS</h1>
      
      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Project Name</label>
            <input 
              type="text" 
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-4 py-2 border rounded"
              placeholder="e.g., Office Renovation"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Hazards & Risks</label>
            <textarea 
              value={hazards}
              onChange={(e) => setHazards(e.target.value)}
              className="w-full px-4 py-2 border rounded" 
              rows={4}
              placeholder="e.g., Electrical work, dust, noise"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Control Measures</label>
            <textarea 
              value={controls}
              onChange={(e) => setControls(e.target.value)}
              className="w-full px-4 py-2 border rounded" 
              rows={4}
              placeholder="e.g., Isolate power, PPE required, barriers in place"
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Generating...' : 'Generate RAMS Document'}
          </button>
        </form>
      ) : (
        <div className="bg-gray-50 p-6 rounded">
          <h2 className="text-xl font-bold mb-4">Generated RAMS</h2>
          <pre className="whitespace-pre-wrap">{result.content}</pre>
          <button 
            onClick={() => setResult(null)}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Create Another
          </button>
        </div>
      )}
    </main>
  );
}
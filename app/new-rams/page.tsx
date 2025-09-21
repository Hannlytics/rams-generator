'use client'
import { useState, FormEvent } from 'react'
import AddressLookup from '../components/AddressLookup'

// Predefined options for UK construction
const TRADES = [
  'General Builder',
  'Electrician',
  'Plumber',
  'Roofer',
  'Scaffolder',
  'Plasterer',
  'Carpenter',
  'Painter/Decorator',
  'Groundworker',
  'Bricklayer'
]

const TASK_TYPES: { [key: string]: string[] } = {
  'General Builder': ['Extension work', 'Renovation', 'Structural alterations', 'General maintenance'],
  'Electrician': ['Wiring installation', 'Consumer unit replacement', 'Socket installation', 'Lighting installation'],
  'Plumber': ['Boiler installation', 'Pipe fitting', 'Bathroom installation', 'Radiator installation'],
  'Roofer': ['Tile replacement', 'Flat roof repair', 'Gutter installation', 'Chimney repair'],
  'Scaffolder': ['Erect scaffold', 'Dismantle scaffold', 'Scaffold inspection', 'Tower scaffold'],
  'Plasterer': ['Wall plastering', 'Ceiling plastering', 'Rendering', 'Dry lining'],
  'Carpenter': ['Door installation', 'Kitchen fitting', 'Flooring', 'Stud walls'],
  'Painter/Decorator': ['Interior painting', 'Exterior painting', 'Wallpapering', 'Surface preparation'],
  'Groundworker': ['Excavation', 'Drainage', 'Foundations', 'Paving'],
  'Bricklayer': ['Wall construction', 'Pointing', 'Block work', 'Chimney work']
}

const COMMON_HAZARDS = {
  'Working at Height': ['Falls from height', 'Dropped objects', 'Unstable surfaces'],
  'Electrical': ['Electric shock', 'Burns', 'Arc flash', 'Fire'],
  'Manual Handling': ['Back injury', 'Muscle strain', 'Crush injuries'],
  'Power Tools': ['Cuts', 'Eye injury', 'Noise exposure', 'Vibration'],
  'Hazardous Materials': ['Asbestos exposure', 'Lead paint', 'Chemical burns', 'Dust inhalation']
}

const PPE_OPTIONS = [
  'Hard hat',
  'Safety boots',
  'High-vis vest',
  'Safety glasses',
  'Gloves',
  'Ear defenders',
  'Dust mask',
  'Fall arrest harness',
  'Face shield'
]

export default function NewRams() {
  // Basic fields
  const [projectName, setProjectName] = useState('')
  const [clientName, setClientName] = useState('')
  const [siteAddress, setSiteAddress] = useState('')
  const [startDate, setStartDate] = useState('')
  const [duration, setDuration] = useState('')
  
  // Enhanced fields
  const [trade, setTrade] = useState('')
  const [taskType, setTaskType] = useState('')
  const [selectedHazards, setSelectedHazards] = useState<string[]>([])
  const [customHazards, setCustomHazards] = useState('')
  const [selectedPPE, setSelectedPPE] = useState<string[]>([])
  const [controls, setControls] = useState('')
  const [siteManager, setSiteManager] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [scopeOfWork, setScopeOfWork] = useState('')
  
  // UI state
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    const allHazards = [...selectedHazards, customHazards].filter(h => h).join(', ')
    const ppe = selectedPPE.join(', ')
    
    try {
      const response = await fetch('/api/generate-rams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          projectName,
          clientName,
          siteAddress,
          startDate,
          duration,
          trade,
          taskType,
          hazards: allHazards,
          controls,
          ppe,
          siteManager,
          contactNumber,
          scopeOfWork
        })
      })
      
      const data = await response.json()
      setResult(data.data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <main className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Generated RAMS Document</h1>
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <pre className="whitespace-pre-wrap font-sans">{result.content}</pre>
          <div className="mt-6 flex gap-4">
            <button 
              onClick={() => setResult(null)}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              Create Another
            </button>
            <button className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600">
              Download PDF
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create New RAMS Document</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow">
        {/* Project Information Section */}
        <div className="border-b pb-6">
          <h2 className="text-xl font-semibold mb-4">Project Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Office Renovation"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Client Name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Duration
              </label>
              <input 
                type="text" 
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 5 days"
              />
            </div>
          </div>
          
  <div className="mt-4">
    <label className="block text-sm font-medium mb-2">
      Site Address <span className="text-red-500">*</span>
    </label>
    <textarea 
      value={siteAddress}
      onChange={(e) => setSiteAddress(e.target.value)}
      className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500" 
      rows={2}
      required
            />
          </div>
        </div>

        {/* Work Details Section */}
        <div className="border-b pb-6">
          <h2 className="text-xl font-semibold mb-4">Work Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Trade <span className="text-red-500">*</span>
              </label>
              <select 
                value={trade}
                onChange={(e) => {
                  setTrade(e.target.value)
                  setTaskType('') // Reset task type when trade changes
                }}
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select trade...</option>
                {TRADES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Task Type
              </label>
              <select 
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                disabled={!trade || !TASK_TYPES[trade]}
              >
                <option value="">Select task...</option>
                {trade && TASK_TYPES[trade] && TASK_TYPES[trade].map(task => (
                  <option key={task} value={task}>{task}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">
              Scope of Work <span className="text-red-500">*</span>
            </label>
            <textarea 
              value={scopeOfWork}
              onChange={(e) => setScopeOfWork(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500" 
              rows={3}
              placeholder="Describe the work to be carried out..."
              required
            />
          </div>
        </div>

        {/* Risk Assessment Section */}
        <div className="border-b pb-6">
          <h2 className="text-xl font-semibold mb-4">Risk Assessment</h2>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Common Hazards (select all that apply)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
              {Object.keys(COMMON_HAZARDS).map(category => (
                <label key={category} className="flex items-center">
                  <input 
                    type="checkbox"
                    value={category}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedHazards([...selectedHazards, category])
                      } else {
                        setSelectedHazards(selectedHazards.filter(h => h !== category))
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm">{category}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Additional Hazards
            </label>
            <textarea 
              value={customHazards}
              onChange={(e) => setCustomHazards(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500" 
              rows={2}
              placeholder="Any other hazards specific to this job..."
            />
          </div>
        </div>

        {/* PPE Section */}
        <div className="border-b pb-6">
          <h2 className="text-xl font-semibold mb-4">PPE Requirements</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {PPE_OPTIONS.map(ppe => (
              <label key={ppe} className="flex items-center">
                <input 
                  type="checkbox"
                  value={ppe}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedPPE([...selectedPPE, ppe])
                    } else {
                      setSelectedPPE(selectedPPE.filter(p => p !== ppe))
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm">{ppe}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Control Measures */}
        <div className="border-b pb-6">
          <label className="block text-sm font-medium mb-2">
            Control Measures <span className="text-red-500">*</span>
          </label>
          <textarea 
            value={controls}
            onChange={(e) => setControls(e.target.value)}
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500" 
            rows={4}
            placeholder="Describe how risks will be controlled..."
            required
          />
        </div>

        {/* Contact Information */}
        <div className="pb-6">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Site Manager <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                value={siteManager}
                onChange={(e) => setSiteManager(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Contact Number <span className="text-red-500">*</span>
              </label>
              <input 
                type="tel" 
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 font-semibold"
        >
          {loading ? 'Generating RAMS Document...' : 'Generate RAMS Document'}
        </button>
      </form>
    </main>
  )
}
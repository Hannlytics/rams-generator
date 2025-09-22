'use client'
import { useState, FormEvent } from 'react'
import AddressLookup from '../components/AddressLookup'

// CONSTANTS (Trades, Tasks, etc.) remain the same
const TRADES = [
  'General Builder', 'Electrician', 'Plumber', 'Bricklayer', 'Carpenter / Joiner',
  'Painter & Decorator', 'Plasterer', 'Roofing Contractor', 'Groundworker',
  'Scaffolder', 'Demolition Operative', 'Steel Erector', 'Floor Layer',
  'Glazier', 'Tiler', 'Dryliner / Ceiling Fixer', 'Landscaper', 'HVAC Engineer',
  'Cleaner (Post-construction)'
]

const TASK_TYPES: { [key: string]: string[] } = {
    'General Builder': ['Small Extension', 'Refurbishment', 'Structural Repairs', 'General Maintenance'],
    'Electrician': ['EICR', 'PAT Testing', 'New Circuit Installation', 'Fault Finding'],
    'Plumber': ['Leak Repair', 'Central Heating Maintenance', 'Drainage', 'Gas Safety Certificate'],
    'Bricklayer': ['Repointing', 'Feature Brickwork', 'Blockwork', 'Masonry Repairs'],
    'Carpenter / Joiner': ['First Fix (Studwork)', 'Second Fix (Doors, Skirting)', 'Roof Trusses', 'Custom Joinery'],
    'Painter & Decorator': ['Stripping Wallpaper', 'Surface Preparation', 'Woodwork Painting', 'Feature Wall Creation'],
    'Plasterer': ['Skimming', 'Rendering', 'Plasterboarding', 'Coving Installation'],
    'Roofing Contractor': ['Lead Flashing', 'Slate/Tile Repair', 'Felt Roofing', 'Gutter Clearing'],
    'Groundworker': ['Site Clearance', 'Drainage Installation', 'Concreting', 'Kerbing'],
    'Scaffolder': ['Tube and Fitting Scaffold', 'System Scaffold', 'Edge Protection', 'Hoist Erection'],
    'Demolition Operative': ['Soft Strip', 'Structural Demolition', 'Site Clearance', 'Asbestos Removal (Supervised)'],
    'Steel Erector': ['Structural Steel Installation', 'Mezzanine Floor Erection', 'Bolting', 'Welding Connections'],
    'Floor Layer': ['Screeding', 'Laminate/Wood Flooring', 'Vinyl/Lino Fitting', 'Carpet Tiling'],
    'Glazier': ['Window Installation', 'Glass Partitioning', 'Double Glazing Repair', 'Curtain Walling'],
    'Tiler': ['Wall Tiling', 'Floor Tiling', 'Grouting', 'Waterproofing (Tanking)'],
    'Dryliner / Ceiling Fixer': ['MF Ceilings', 'Suspended Ceilings', 'Partition Walls', 'Taping and Jointing'],
    'Landscaper': ['Paving/Patios', 'Fencing', 'Turfing', 'Planting/Soft Landscaping'],
    'HVAC Engineer': ['Air Conditioning Installation', 'Ventilation System Fitting', 'Ductwork', 'System Servicing'],
    'Cleaner (Post-construction)': ['Sparkle Clean', 'Welfare Cleaning', 'Window Cleaning', 'Dust Removal']
}

const COMMON_HAZARDS = [
  "Working at Height", "Electrical", "Manual Handling", "Power Tools / Equipment",
  "Hazardous Substances (COSHH)", "Slips, Trips and Falls", "Noise & Vibration",
  "Dust / Airborne Particles", "Hot Works", "Confined Spaces", "Lone Working",
  "Vehicular Movement", "Fire / Emergency Risks", "Public Interface (e.g., schools, retail)",
  "Other / Custom Hazards"
]

const PPE_OPTIONS = [
  'Hard Hat', 'Safety Boots (Steel Toe)', 'High-Visibility Vest', 'Safety Glasses / Goggles',
  'Gloves', 'Ear Defenders / Plugs', 'Dust Mask / Respirator', 'Fall Arrest Harness',
  'Face Shield / Visor', 'Coveralls / Protective Suit', 'Knee Pads', 'Welding Shield',
  'Thermal Gear / Waterproofs', 'Life Jacket'
]

interface RamsResult {
  content: string;
}

export default function NewRams() {
  // --- EXISTING STATE VARIABLES ---
  const [projectName, setProjectName] = useState('')
  const [clientName, setClientName] = useState('')
  const [siteAddress, setSiteAddress] = useState('')
  const [startDate, setStartDate] = useState('')
  const [duration, setDuration] = useState('')
  const [trade, setTrade] = useState('')
  const [taskType, setTaskType] = useState('')
  const [scopeOfWork, setScopeOfWork] = useState('')
  const [selectedHazards, setSelectedHazards] = useState<string[]>([])
  const [customHazards, setCustomHazards] = useState('')
  const [selectedPPE, setSelectedPPE] = useState<string[]>([])
  const [controls, setControls] = useState('')
  const [siteManager, setSiteManager] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  
  // --- PHASE 1 STATE VARIABLES ---
  const [endDate, setEndDate] = useState('')
  const [siteContactPerson, setSiteContactPerson] = useState('')
  const [jobReference, setJobReference] = useState('')
  const [methodStatement, setMethodStatement] = useState('')
  const [sequenceOfOperations, setSequenceOfOperations] = useState('')
  const [personsAtRisk, setPersonsAtRisk] = useState('')
  const [specialEquipment, setSpecialEquipment] = useState('')
  const [toolingSafety, setToolingSafety] = useState('')
  const [signageAndBarriers, setSignageAndBarriers] = useState('')

  // --- PHASE 2: NEW STATE VARIABLES ---
  const [firstAidArrangements, setFirstAidArrangements] = useState('')
  const [firePrecautions, setFirePrecautions] = useState('')
  const [emergencyContacts, setEmergencyContacts] = useState('')
  const [preparedBy, setPreparedBy] = useState('')
  const [reviewDate, setReviewDate] = useState('')
  const [revisionNumber, setRevisionNumber] = useState('1')


  // UI state
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RamsResult | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const allHazards = [...selectedHazards, customHazards].filter(h => h).join(', ')
    const ppe = selectedPPE.join(', ')

    // NOTE: You'll need to add the new state variables to the fetch body
    // when you're ready to process them in your API.
    try {
      const response = await fetch('/api/generate-rams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            projectName, clientName, siteAddress, startDate, duration, trade,
            taskType, hazards: allHazards, controls, ppe, siteManager,
            contactNumber, scopeOfWork, /* ...add new fields here */
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
    // Result view remains the same
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
        
        {/* --- PROJECT INFORMATION SECTION (UPDATED) --- */}
        <div className="border-b pb-6">
          <h2 className="text-xl font-semibold mb-4">Project Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Project Name *" required className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"/>
            <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Client Name *" required className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"/>
            <div><label className="block text-sm font-medium mb-1">Start Date *</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"/></div>
            <div><label className="block text-sm font-medium mb-1">End Date</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"/></div>
            <input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Duration (e.g., 5 days)" className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"/>
            <input value={jobReference} onChange={(e) => setJobReference(e.target.value)} placeholder="Job Reference / Number" className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div className="mt-4"><AddressLookup value={siteAddress} onChange={setSiteAddress} /></div>
          <div className="mt-4"><input value={siteContactPerson} onChange={(e) => setSiteContactPerson(e.target.value)} placeholder="Site Contact Person" className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"/></div>
        </div>

        {/* --- WORK DETAILS SECTION (UPDATED) --- */}
        <div className="border-b pb-6">
          <h2 className="text-xl font-semibold mb-4">Work Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Trade *</label><select value={trade} onChange={(e) => { setTrade(e.target.value); setTaskType(''); }} required className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"><option value="">Select trade...</option>{TRADES.map(t => (<option key={t} value={t}>{t}</option>))}</select></div>
            <div><label className="block text-sm font-medium mb-1">Task Type</label><select value={taskType} onChange={(e) => setTaskType(e.target.value)} disabled={!trade || !TASK_TYPES[trade]} className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"><option value="">Select task...</option>{trade && TASK_TYPES[trade] && TASK_TYPES[trade].map(task => (<option key={task} value={task}>{task}</option>))}</select></div>
          </div>
          <div className="mt-4"><textarea value={scopeOfWork} onChange={(e) => setScopeOfWork(e.target.value)} placeholder="Scope of Work *" required rows={3} className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"/></div>
          <div className="mt-4"><textarea value={methodStatement} onChange={(e) => setMethodStatement(e.target.value)} placeholder="Method Statement (Step-by-step description of how the work will be done)" rows={4} className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"/></div>
          <div className="mt-4"><textarea value={sequenceOfOperations} onChange={(e) => setSequenceOfOperations(e.target.value)} placeholder="Sequence of Operations (The order in which the steps will be carried out)" rows={4} className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"/></div>
        </div>

        {/* --- RISK ASSESSMENT SECTION (UPDATED) --- */}
        <div className="border-b pb-6">
          <h2 className="text-xl font-semibold mb-4">Risk Assessment</h2>
          <div className="mt-4"><input value={personsAtRisk} onChange={(e) => setPersonsAtRisk(e.target.value)} placeholder="Persons at Risk (e.g., Operatives, public, clients)" className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"/></div>
          <div className="mt-4"><label className="block text-sm font-medium mb-2">Common Hazards (select all that apply)</label><div className="grid grid-cols-2 md:grid-cols-3 gap-2">{COMMON_HAZARDS.map(hazard => (<label key={hazard} className="flex items-center"><input type="checkbox" value={hazard} onChange={(e) => { if (e.target.checked) { setSelectedHazards([...selectedHazards, hazard]); } else { setSelectedHazards(selectedHazards.filter(h => h !== hazard)); } }} className="mr-2"/><span className="text-sm">{hazard}</span></label>))}</div></div>
          <div className="mt-4"><textarea value={customHazards} onChange={(e) => setCustomHazards(e.target.value)} placeholder="Additional Hazards" rows={2} className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"/></div>
        </div>
        
        {/* --- PPE & CONTROLS SECTION (UPDATED, merged from two sections) --- */}
        <div className="border-b pb-6">
          <h2 className="text-xl font-semibold mb-4">PPE & Control Measures</h2>
          <div><label className="block text-sm font-medium mb-2">PPE Requirements (select all that apply)</label><div className="grid grid-cols-2 md:grid-cols-3 gap-2">{PPE_OPTIONS.map(ppe => (<label key={ppe} className="flex items-center"><input type="checkbox" value={ppe} onChange={(e) => { if (e.target.checked) { setSelectedPPE([...selectedPPE, ppe]); } else { setSelectedPPE(selectedPPE.filter(p => p !== ppe)); } }} className="mr-2"/><span className="text-sm">{ppe}</span></label>))}</div></div>
          <div className="mt-4"><textarea value={controls} onChange={(e) => setControls(e.target.value)} placeholder="Control Measures *" required rows={4} className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"/></div>
          <div className="mt-4"><textarea value={specialEquipment} onChange={(e) => setSpecialEquipment(e.target.value)} placeholder="Special Equipment (e.g., MEWP, scaffolding)" rows={2} className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"/></div>
          <div className="mt-4"><textarea value={toolingSafety} onChange={(e) => setToolingSafety(e.target.value)} placeholder="Tooling Safety (e.g., PAT testing, daily checks)" rows={2} className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"/></div>
          <div className="mt-4"><textarea value={signageAndBarriers} onChange={(e) => setSignageAndBarriers(e.target.value)} placeholder="Signage & Barriers (e.g., Chapter 8, pedestrian barriers)" rows={2} className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"/></div>
        </div>

        {/* --- PHASE 2: EMERGENCY PLANNING SECTION --- */}
        <div className="border-b pb-6">
          <h2 className="text-xl font-semibold mb-4">Emergency Planning</h2>
          <div className="space-y-4">
            <textarea value={firstAidArrangements} onChange={(e) => setFirstAidArrangements(e.target.value)} placeholder="First Aid Arrangements (e.g., First aider name, location of kit)" rows={3} className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"/>
            <textarea value={firePrecautions} onChange={(e) => setFirePrecautions(e.target.value)} placeholder="Fire Precautions (e.g., Fire extinguisher locations, assembly point)" rows={3} className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"/>
            <textarea value={emergencyContacts} onChange={(e) => setEmergencyContacts(e.target.value)} placeholder="Emergency Contacts (e.g., Site Manager, Emergency Services: 999)" rows={3} className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"/>
          </div>
        </div>

        {/* --- CONTACT INFORMATION (NO CHANGE) --- */}
        <div className="border-b pb-6">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={siteManager} onChange={(e) => setSiteManager(e.target.value)} placeholder="Site Manager *" required className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"/>
            <input type="tel" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} placeholder="Contact Number *" required className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"/>
          </div>
        </div>

        {/* --- PHASE 2: REVIEW & VERSION CONTROL SECTION (UPDATED) --- */}
        <div className="pb-6">
          <h2 className="text-xl font-semibold mb-4">Review & Version Control</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Prepared By</label>
              <input 
                value={preparedBy} 
                onChange={(e) => setPreparedBy(e.target.value)} 
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Review Date</label>
              <input 
                type="date" 
                value={reviewDate} 
                onChange={(e) => setReviewDate(e.target.value)} 
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Revision Number</label>
              <input 
                type="number" 
                value={revisionNumber} 
                onChange={(e) => setRevisionNumber(e.target.value)} 
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        
        <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 font-semibold">
          {loading ? 'Generating RAMS Document...' : 'Generate RAMS Document'}
        </button>
      </form>
    </main>
  )
}


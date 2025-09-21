'use client'
import { useState } from 'react'

interface AddressLookupProps {
  value: string
  onChange: (address: string) => void
}

export default function AddressLookup({ value, onChange }: AddressLookupProps) {
  const [postcode, setPostcode] = useState('')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  const lookupPostcode = async () => {
    setLoading(true)
    try {
      const cleanPostcode = postcode.replace(/\s/g, '')
      const response = await fetch(`https://api.postcodes.io/postcodes/${cleanPostcode}`)
      const data = await response.json()
      
      if (data.status === 200) {
        const result = data.result
        const fullAddress = [
          result.parliamentary_constituency,
          result.admin_district,
          result.admin_ward,
          result.postcode,
          result.country
        ].filter(Boolean).join('\n')
        
        onChange(fullAddress)
        setSuggestions([]) // Clear suggestions after selection
      } else {
        alert('Postcode not found')
      }
    } catch (error) {
      alert('Error looking up postcode')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input 
          type="text"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value.toUpperCase())}
          placeholder="Enter UK postcode"
          className="px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          maxLength={8}
        />
        <button
          type="button"
          onClick={lookupPostcode}
          disabled={loading || !postcode}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          {loading ? 'Looking up...' : 'Find Address'}
        </button>
      </div>
      
      <textarea 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500" 
        rows={3}
        placeholder="Full address will appear here..."
        required
      />
    </div>
  )
}
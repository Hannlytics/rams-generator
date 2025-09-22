'use client'
import { useState } from 'react'

interface AddressLookupProps {
  value: string
  onChange: (address: string) => void
}

export default function AddressLookup({ value, onChange }: AddressLookupProps) {
  const [postcode, setPostcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // State for handling errors

  const lookupPostcode = async () => {
    setLoading(true);
    setError(null); // Reset error on new lookup
    try {
      const cleanPostcode = postcode.replace(/\s/g, '');
      const response = await fetch(`https://api.postcodes.io/postcodes/${cleanPostcode}`);
      const data = await response.json();
      
      if (data.status === 200) {
        const result = data.result;
        // Create a more standard address format
        const fullAddress = [
          result.admin_ward,
          result.admin_district, 
          result.postcode,
          result.country
        ].filter(Boolean).join(', ');
        
        onChange(fullAddress);
      } else {
        setError('Postcode not found. Please check and try again.');
      }
    } catch { // FIX: Removed unused variable
      setError('An error occurred while looking up the postcode.');
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div>
      <div className="flex flex-wrap items-start gap-2 mb-2">
        <input 
          type="text"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value.toUpperCase())}
          placeholder="Enter UK postcode"
          className="flex-grow px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          maxLength={8}
        />
        <button
          type="button"
          onClick={lookupPostcode}
          disabled={loading || !postcode}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400"
        >
          {loading ? 'Looking up...' : 'Find Address'}
        </button>
      </div>

      {/* Display error message if one exists */}
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      
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


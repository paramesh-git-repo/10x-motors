import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../utils/api'

const AutocompleteInput = ({ label, value, onChange, placeholder, required = false, suggestionsSource = 'vehicles', suggestionField = 'plateNumber' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState([])
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  const { data: suggestionsData } = useQuery({
    queryKey: [suggestionsSource],
    queryFn: () => api.get(`/${suggestionsSource}`, { params: { limit: 1000 } }),
    select: (data) => data.data || []
  })

  useEffect(() => {
    if (suggestionsData && value) {
      const filtered = suggestionsData
        .filter(item => item[suggestionField] && item[suggestionField].toLowerCase().includes(value.toLowerCase()))
        .map(item => item[suggestionField])
        .filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates
        .slice(0, 5) // Limit to 5 suggestions
      
      setFilteredSuggestions(filtered)
      // Only open if there's text and suggestions
      if (value.length > 0 && filtered.length > 0) {
        setIsOpen(true)
      } else {
        setIsOpen(false)
      }
    } else {
      setFilteredSuggestions([])
      setIsOpen(false)
    }
  }, [value, suggestionsData, suggestionField])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (suggestion) => {
    onChange(suggestion)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          // Only open if there's already text and suggestions
          if (value && filteredSuggestions.length > 0) {
            setIsOpen(true)
          }
        }}
        onClick={() => {
          // Open when clicked if there are suggestions
          if (value && filteredSuggestions.length > 0) {
            setIsOpen(true)
          }
        }}
        className="input"
        placeholder={placeholder}
        required={required}
      />

      {isOpen && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(suggestion)}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default AutocompleteInput


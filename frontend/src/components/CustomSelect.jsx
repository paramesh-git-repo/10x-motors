import { useState, useRef, useEffect } from 'react'

const CustomSelect = ({ label, value, onChange, options = [], placeholder = "Select...", required = false, className = "", allowCreate = false, onCreateOption, autoUppercase = false }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [filteredOptions, setFilteredOptions] = useState(options)
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)

  // Find selected option label
  const selectedOption = options.find(opt => opt.value === value)

  useEffect(() => {
    // Update input value when value prop changes (e.g., from outside)
    if (selectedOption) {
      // Use the option label which should already be formatted
      setInputValue(selectedOption.label)
    } else if (value) {
      // If there's a value but no matching option (e.g., custom created), format it with title case
      const formattedValue = typeof value === 'string' 
        ? value.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
        : value
      setInputValue(formattedValue)
    } else {
      setInputValue('')
    }
  }, [value, selectedOption])

  useEffect(() => {
    // Filter options based on input
    if (inputValue) {
      const filtered = options.filter(opt =>
        opt.label.toLowerCase().includes(inputValue.toLowerCase())
      )
      
      // If allowCreate is enabled and there's no exact match, add "Create new" option
      if (allowCreate && inputValue.trim() && !options.find(opt => opt.label.toLowerCase() === inputValue.toLowerCase())) {
        filtered.push({ 
          value: inputValue.trim(), // Use original casing for value
          label: `Add "${inputValue.trim()}"`,
          isNew: true 
        })
      }
      
      setFilteredOptions(filtered)
      // Don't auto-open - only open when user explicitly clicks or types
    } else {
      setFilteredOptions(options)
    }
  }, [inputValue, options, allowCreate])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        // Reset input value to selected option label when clicking outside
        if (selectedOption) {
          setInputValue(selectedOption.label)
        }
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, selectedOption])

  const handleInputChange = (e) => {
    let newValue = e.target.value
    // Convert to uppercase if autoUppercase is enabled
    if (autoUppercase) {
      newValue = newValue.toUpperCase()
    }
    setInputValue(newValue)
    
    // Open dropdown when typing
    if (newValue) {
      setIsOpen(true)
    }
    
    // If exact match found, select it
    const exactMatch = options.find(opt => 
      opt.label.toLowerCase() === newValue.toLowerCase()
    )
    if (exactMatch) {
      onChange(exactMatch.value)
    } else if (allowCreate && newValue.trim()) {
      // If allowCreate, we can accept the typed value directly
      // Don't call onChange here - wait for user to select or press enter
    }
  }

  const handleSelect = (option) => {
    // If it's a new option to create
    if (option.isNew && allowCreate && onCreateOption) {
      let newValue = inputValue.trim() // Preserve what user typed
      // Convert to uppercase if autoUppercase is enabled
      if (autoUppercase) {
        newValue = newValue.toUpperCase()
      }
      onCreateOption(newValue) // Pass to handler (it will format if needed)
      onChange(newValue) // Use the uppercase value
      // Format the input value for display
      const formattedValue = autoUppercase 
        ? newValue 
        : newValue.split(' ').map(w => 
            w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
          ).join(' ')
      setInputValue(formattedValue)
    } else {
      onChange(option.value)
      setInputValue(option.label) // Label should already be formatted
    }
    setIsOpen(false)
  }

  const handleClick = () => {
    setIsOpen(!isOpen)
    if (inputRef.current && !isOpen) {
      inputRef.current.focus()
    }
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            // Allow Enter to create new option if allowCreate is enabled
            if (e.key === 'Enter' && allowCreate && inputValue.trim() && !options.find(opt => opt.label.toLowerCase() === inputValue.toLowerCase().trim())) {
              e.preventDefault()
              let newValue = inputValue.trim()
              // Convert to uppercase if autoUppercase is enabled
              if (autoUppercase) {
                newValue = newValue.toUpperCase()
              }
              if (onCreateOption) {
                onCreateOption(newValue) // Handler will format if needed
              }
              // Format for display (only title case if not uppercase mode)
              const formattedValue = autoUppercase 
                ? newValue 
                : newValue.split(' ').map(w => 
                    w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
                  ).join(' ')
              onChange(newValue) // Use original value for onChange
              setInputValue(formattedValue) // Display formatted
              setIsOpen(false)
            }
          }}
          onFocus={(e) => {
            // Don't auto-open on focus
          }}
          onClick={(e) => {
            // Only open when explicitly clicked, not on programmatic focus
            if (e.type === 'click') {
              setIsOpen(true)
            }
          }}
          placeholder={placeholder}
          required={required}
          className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all pr-10 cursor-text"
        />
        <button
          type="button"
          onClick={handleClick}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-auto"
        >
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {filteredOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option)}
              className={`w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors flex items-center justify-between ${
                value === option.value ? 'bg-gray-50' : ''
              } ${option.isNew ? 'bg-blue-50 hover:bg-blue-100' : ''}`}
            >
              <span className={option.isNew ? 'text-primary-600 font-medium' : ''}>{option.label}</span>
              {value === option.value && !option.isNew && (
                <svg
                  className="w-5 h-5 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {option.isNew && (
                <svg
                  className="w-5 h-5 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}

      {isOpen && filteredOptions.length === 0 && inputValue && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
          <p className="text-sm text-gray-500 text-center">No matches found</p>
        </div>
      )}
    </div>
  )
}

export default CustomSelect

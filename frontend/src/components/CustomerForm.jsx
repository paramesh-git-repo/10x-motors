import { useState, useEffect } from 'react'
import CustomSelect from './CustomSelect'
import AutocompleteInput from './AutocompleteInput'

const CustomerForm = ({ customer = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    alternateMobile: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    notes: '',
    // Vehicle fields
    vehicleModel: '',
    vehiclePlateNumber: ''
  })

  useEffect(() => {
    if (customer) {
      // Get first vehicle if exists
      const firstVehicle = customer.vehicles && customer.vehicles.length > 0 
        ? customer.vehicles[0] 
        : null
      
      setFormData({
        name: customer.name || '',
        alternateMobile: customer.alternateMobile || '',
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || {
          street: '',
          city: '',
          state: '',
          zipCode: ''
        },
        notes: customer.notes || '',
        vehicleModel: firstVehicle ? firstVehicle.model || '' : '',
        vehiclePlateNumber: firstVehicle ? firstVehicle.plateNumber || '' : ''
      })
    }
  }, [customer])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="input"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Mobile</label>
          <input
            type="tel"
            value={formData.alternateMobile}
            onChange={(e) => setFormData({ ...formData, alternateMobile: e.target.value })}
            className="input"
          />
        </div>
      </div>

      {/* Vehicle Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Model</label>
          <input
            type="text"
            value={formData.vehicleModel}
            onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
            className="input"
          />
        </div>
        <div>
          <AutocompleteInput
            label="Vehicle Number"
            required
            value={formData.vehiclePlateNumber}
            onChange={(value) => setFormData({ ...formData, vehiclePlateNumber: value.toUpperCase() })}
            placeholder=""
            suggestionsSource="vehicles"
            suggestionField="plateNumber"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
          <input
            type="text"
            value={formData.address?.street || ''}
            onChange={(e) => setFormData({
              ...formData,
              address: { ...formData.address, street: e.target.value }
            })}
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <input
            type="text"
            value={formData.address?.city || ''}
            onChange={(e) => setFormData({
              ...formData,
              address: { ...formData.address, city: e.target.value }
            })}
            className="input"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
          <input
            type="text"
            value={formData.address?.state || ''}
            onChange={(e) => setFormData({
              ...formData,
              address: { ...formData.address, state: e.target.value }
            })}
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
          <input
            type="text"
            value={formData.address?.zipCode || ''}
            onChange={(e) => setFormData({
              ...formData,
              address: { ...formData.address, zipCode: e.target.value }
            })}
            className="input"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="input"
          rows="3"
        />
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {customer ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  )
}

export default CustomerForm

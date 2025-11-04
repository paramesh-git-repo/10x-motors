import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../utils/api'

const VehicleForm = ({ vehicle = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    customer: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    plateNumber: '',
    vin: '',
    color: '',
    mileage: 0
  })

  const { data: customersData } = useQuery({
    queryKey: ['customers'],
    queryFn: () => api.get('/customers', { params: { limit: 1000 } }),
    select: (data) => data.data || []
  })

  useEffect(() => {
    if (vehicle) {
      setFormData({
        ...vehicle,
        customer: vehicle.customer?._id || vehicle.customer
      })
    }
  }, [vehicle])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
        <select
          required
          value={formData.customer}
          onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
          className="input"
        >
          <option value="">Select customer...</option>
          {customersData?.map(cust => (
            <option key={cust._id} value={cust._id}>{cust.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Make *</label>
          <input
            type="text"
            required
            value={formData.make}
            onChange={(e) => setFormData({ ...formData, make: e.target.value })}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
          <input
            type="text"
            required
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
          <input
            type="number"
            required
            min="1900"
            max={new Date().getFullYear() + 1}
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
            className="input"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Plate Number *</label>
          <input
            type="text"
            required
            value={formData.plateNumber}
            onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value.toUpperCase() })}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">VIN</label>
          <input
            type="text"
            value={formData.vin}
            onChange={(e) => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
            className="input"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
          <input
            type="text"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mileage</label>
          <input
            type="number"
            min="0"
            value={formData.mileage}
            onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) || 0 })}
            className="input"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {vehicle ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  )
}

export default VehicleForm


import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../utils/api'
import CustomSelect from './CustomSelect'

const ReminderForm = ({ reminder = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    customer: '',
    vehicle: '',
    title: '',
    description: '',
    type: 'other',
    scheduledDate: '',
    status: 'pending',
    isRecurring: false,
    recurringInterval: 'yearly'
  })

  const { data: customersData } = useQuery({
    queryKey: ['customers'],
    queryFn: () => api.get('/customers', { params: { limit: 1000 } }),
    select: (data) => data.data || []
  })

  const { data: vehiclesData } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => api.get('/vehicles', { params: { limit: 1000 } }),
    select: (data) => data.data || []
  })

  useEffect(() => {
    if (reminder) {
      setFormData({
        ...reminder,
        customer: reminder.customer?._id || reminder.customer,
        vehicle: reminder.vehicle?._id || reminder.vehicle,
        scheduledDate: reminder.scheduledDate ? new Date(reminder.scheduledDate).toISOString().split('T')[0] : ''
      })
    }
  }, [reminder])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      ...formData,
      scheduledDate: new Date(formData.scheduledDate)
    })
  }

  const reminderTypes = ['service', 'inspection', 'registration', 'insurance', 'maintenance', 'other']

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="input"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <CustomSelect
            label="Customer"
            required
            value={formData.customer}
            onChange={(value) => setFormData({ ...formData, customer: value })}
            options={customersData?.map(cust => ({ value: cust._id, label: cust.name })) || []}
            placeholder="Select customer..."
          />
        </div>

        <div>
          <CustomSelect
            label="Vehicle No."
            value={formData.vehicle || ''}
            onChange={(value) => setFormData({ ...formData, vehicle: value })}
            options={vehiclesData?.filter(v => v.customer?._id === formData.customer).map(veh => ({
              value: veh._id,
              label: `${veh.year} ${veh.make} ${veh.model} - ${veh.plateNumber}`
            })) || []}
            placeholder="Select vehicle..."
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <CustomSelect
            label="Type"
            value={formData.type}
            onChange={(value) => setFormData({ ...formData, type: value })}
            options={reminderTypes.map(type => ({ value: type, label: type.charAt(0).toUpperCase() + type.slice(1) }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date *</label>
          <input
            type="date"
            required
            value={formData.scheduledDate}
            onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
            className="input"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="input"
          rows="3"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <CustomSelect
            label="Status"
            value={formData.status}
            onChange={(value) => setFormData({ ...formData, status: value })}
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' }
            ]}
          />
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.isRecurring}
              onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Recurring</span>
          </label>
        </div>
      </div>

      {formData.isRecurring && (
        <div>
          <CustomSelect
            label="Recurring Interval"
            value={formData.recurringInterval}
            onChange={(value) => setFormData({ ...formData, recurringInterval: value })}
            options={[
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'yearly', label: 'Yearly' }
            ]}
          />
        </div>
      )}

      <div className="flex justify-end space-x-3 mt-6">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {reminder ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  )
}

export default ReminderForm


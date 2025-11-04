import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../utils/api'
import CustomSelect from './CustomSelect'
import toast from 'react-hot-toast'

const ServiceForm = ({ service = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    customer: '',
    customerName: '',
    vehicle: '',
    serviceType: '',
    description: '',
    status: '',
    scheduledAt: '',
    expectedDeliveryDate: '',
    technician: '',
    laborHours: 0,
    totalCost: 0,
    advancedPaid: 0,
    vehicleModel: '',
    vehiclePlateNumber: '',
    phone: '',
    address: {
      street: '',
      city: '',
      zipCode: ''
    },
    notes: ''
  })

  const [errors, setErrors] = useState({})

  const queryClient = useQueryClient()

  // Fetch customers and vehicles for the dropdowns
  const { data: customersData } = useQuery({
    queryKey: ['customers'],
    queryFn: () => api.get('/customers', { params: { limit: 1000 } }),
    select: (data) => data.data || []
  })

  // Mutation to create new customer
  const createCustomerMutation = useMutation({
    mutationFn: async (customerName) => {
      // Create a minimal customer with just name and a placeholder phone
      const customerData = {
        name: customerName,
        phone: '0000000000' // Placeholder - user can update later
      }
      const response = await api.post('/customers', customerData)
      return response.data
    },
    onSuccess: (newCustomer) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      // Set the newly created customer as selected
      setFormData({ ...formData, customer: newCustomer._id })
      toast.success(`Customer "${newCustomer.name}" created successfully`)
    },
    onError: () => {
      toast.error('Failed to create customer')
    }
  })

  // Mutation to create new vehicle
  const createVehicleMutation = useMutation({
    mutationFn: async (plateNumber) => {
      if (!formData.customer) {
        throw new Error('Please select a customer first')
      }
      // Create a minimal vehicle with placeholder values
      const vehicleData = {
        customer: formData.customer,
        make: 'Unknown',
        model: 'Unknown',
        year: new Date().getFullYear(),
        plateNumber: plateNumber.toUpperCase().trim()
      }
      const response = await api.post('/vehicles', vehicleData)
      return response.data
    },
    onSuccess: (newVehicle) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      // Set the newly created vehicle as selected
      setFormData({ ...formData, vehicle: newVehicle._id })
      toast.success(`Vehicle "${newVehicle.plateNumber}" created successfully`)
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create vehicle'
      toast.error(errorMessage)
    }
  })

  const { data: vehiclesData } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => api.get('/vehicles', { params: { limit: 1000 } }),
    select: (data) => data.data || []
  })

  useEffect(() => {
    // Clear errors when service changes
    setErrors({})
    
    if (service) {
      setFormData({
        ...service,
        scheduledAt: service.scheduledAt ? new Date(service.scheduledAt).toISOString().split('T')[0] : '',
        expectedDeliveryDate: service.expectedDeliveryDate ? new Date(service.expectedDeliveryDate).toISOString().split('T')[0] : '',
        customer: service.customer?._id || service.customer || '',
        vehicle: service.vehicle?._id || service.vehicle || '',
        vehicleModel: service.vehicleModel || service.vehicle?.model || '',
        phone: service.phone || service.customer?.phone || '',
        address: service.address || {
          street: '',
          city: '',
          zipCode: ''
        },
        notes: service.notes || '',
        advancedPaid: service.advancedPaid !== undefined && service.advancedPaid !== null ? Number(service.advancedPaid) : 0,
        totalCost: service.totalCost !== undefined && service.totalCost !== null ? Number(service.totalCost) : 0,
        description: service.description || '',
        serviceType: service.serviceType || '',
        status: service.status || '',
        technician: service.technician?._id || service.technician || '',
        laborHours: service.laborHours !== undefined && service.laborHours !== null ? Number(service.laborHours) : 0
      })
    } else {
      // Reset form when creating new service
      setFormData({
        customer: '',
        customerName: '',
        vehicle: '',
        serviceType: '',
        description: '',
        status: '',
        scheduledAt: '',
        expectedDeliveryDate: '',
        technician: '',
        laborHours: 0,
        totalCost: 0,
        advancedPaid: 0,
        vehicleModel: '',
        vehiclePlateNumber: '',
        phone: '',
        address: {
          street: '',
          city: '',
          zipCode: ''
        },
        notes: ''
      })
    }
  }, [service])

  // Validation function
  const validateForm = () => {
    const newErrors = {}

    // Required fields
    if (!formData.customer || formData.customer.trim() === '') {
      newErrors.customer = 'Customer is required'
    }

    if (!formData.vehicle || formData.vehicle.trim() === '') {
      newErrors.vehicle = 'Vehicle is required'
    }

    if (!formData.serviceType || formData.serviceType.trim() === '') {
      newErrors.serviceType = 'Service type is required'
    }

    // Phone number validation (if provided)
    if (formData.phone && formData.phone.trim() !== '') {
      const phoneRegex = /^[0-9]{10}$/
      const cleanPhone = formData.phone.replace(/\D/g, '')
      if (!phoneRegex.test(cleanPhone)) {
        newErrors.phone = 'Phone number must be exactly 10 digits'
      }
    }

    // Date validation
    if (formData.scheduledAt && formData.expectedDeliveryDate) {
      const scheduled = new Date(formData.scheduledAt)
      const expected = new Date(formData.expectedDeliveryDate)
      if (expected < scheduled) {
        newErrors.expectedDeliveryDate = 'Expected delivery date must be after scheduled date'
      }
    }

    // Numeric fields validation
    if (formData.advancedPaid < 0) {
      newErrors.advancedPaid = 'Advanced paid cannot be negative'
    }

    if (formData.totalCost < 0) {
      newErrors.totalCost = 'Total cost cannot be negative'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate form before submitting
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }
    
    // Prepare data - remove empty strings to let backend defaults handle them
    const dataToSave = { ...formData }
    
    // Handle scheduledAt - convert to Date, set time to midnight
    dataToSave.scheduledAt = formData.scheduledAt ? new Date(formData.scheduledAt + 'T00:00:00') : null
    
    // Handle expectedDeliveryDate - convert to Date, set time to midnight
    if (formData.expectedDeliveryDate) {
      dataToSave.expectedDeliveryDate = new Date(formData.expectedDeliveryDate + 'T00:00:00')
    } else {
      delete dataToSave.expectedDeliveryDate // Don't send if empty
    }
    
    // Remove empty strings for serviceType and status - let backend defaults handle them
    if (!formData.serviceType || formData.serviceType.trim() === '') {
      delete dataToSave.serviceType
    }
    if (!formData.status || formData.status.trim() === '') {
      delete dataToSave.status
    }
    
    // Remove empty strings for optional fields
    if (!formData.description || formData.description.trim() === '') {
      delete dataToSave.description
    }
    if (!formData.technician || formData.technician.trim() === '') {
      delete dataToSave.technician
    }
    // Include vehicleModel - always send it (even if empty)
    dataToSave.vehicleModel = String(formData.vehicleModel || '').trim()
    // Include phone - always send it (even if empty)
    dataToSave.phone = String(formData.phone || '').trim()
    // Include notes - always send it (even if empty)
    dataToSave.notes = String(formData.notes || '').trim()
    // Include advancedPaid - always send it (even if 0)
    // Handle both string and number inputs
    const advancedPaidValue = formData.advancedPaid === '' || formData.advancedPaid === null || formData.advancedPaid === undefined
      ? 0
      : Number(formData.advancedPaid) || 0
    dataToSave.advancedPaid = advancedPaidValue
    
    // Include totalCost - always send it (even if 0)
    const totalCostValue = formData.totalCost === '' || formData.totalCost === null || formData.totalCost === undefined
      ? 0
      : Number(formData.totalCost) || 0
    dataToSave.totalCost = totalCostValue
    if (!formData.address?.street && !formData.address?.city && !formData.address?.zipCode) {
      delete dataToSave.address
    } else {
      // Clean up address fields
      if (!formData.address?.street || formData.address.street.trim() === '') {
        dataToSave.address = { ...dataToSave.address, street: '' }
      }
      if (!formData.address?.city || formData.address.city.trim() === '') {
        dataToSave.address = { ...dataToSave.address, city: '' }
      }
      if (!formData.address?.zipCode || formData.address.zipCode.trim() === '') {
        dataToSave.address = { ...dataToSave.address, zipCode: '' }
      }
    }
    
    console.log('ServiceForm submitting:', { 
      vehicleModel: dataToSave.vehicleModel, 
      phone: dataToSave.phone, 
      notes: dataToSave.notes, 
      address: dataToSave.address, 
      advancedPaid: dataToSave.advancedPaid, 
      totalCost: dataToSave.totalCost,
      advancedPaid_type: typeof dataToSave.advancedPaid,
      formData_advancedPaid: formData.advancedPaid,
      formData_advancedPaid_type: typeof formData.advancedPaid
    });
    
    onSave(dataToSave)
  }

  // Base service types
  const baseServiceTypes = [
    'basic car wash',
    'premium car wash',
    'ceramic wash',
    'steam wash',
    'polish and wax',
    'windshield coating',
    'headlight restoration',
    'engine bay cleaning',
    'mini interior cleaning',
    'deep interior cleaning',
    'anti-bacterial treatment',
    'car ac treatment',
    'paint correction',
    'ceramic coating',
    'graphene coating',
    'under chassis coating',
    'paint protection film - ppf',
    'oil change',
    'tire rotation',
    'brake service',
    'battery replacement',
    'air filter replacement',
    'transmission service',
    'inspection',
    'other'
  ]

  // Fetch existing unique service types from all services
  const { data: existingServices } = useQuery({
    queryKey: ['services'],
    queryFn: () => api.get('/services', { params: { limit: 1000 } }),
    select: (data) => {
      const services = data?.data || []
      // Get unique service types from existing services
      const uniqueTypes = [...new Set(services.map(s => s.serviceType).filter(Boolean))]
      return uniqueTypes
    }
  })

  // Combine base types with existing custom types
  const [customServiceTypes, setCustomServiceTypes] = useState([])
  
  useEffect(() => {
    if (existingServices) {
      // Filter out base types to get only custom ones
      const custom = existingServices.filter(type => 
        !baseServiceTypes.includes(type.toLowerCase())
      )
      setCustomServiceTypes([...new Set(custom)])
    }
  }, [existingServices])

  // Combine base and custom service types
  const allServiceTypes = [
    ...baseServiceTypes,
    ...customServiceTypes.filter(type => !baseServiceTypes.includes(type.toLowerCase()))
  ]

  const handleCreateServiceType = (newType) => {
    // Add to custom types if not already present
    const normalizedType = newType.toLowerCase().trim()
    if (!allServiceTypes.find(t => t.toLowerCase() === normalizedType)) {
      setCustomServiceTypes(prev => {
        // Check if already in prev to avoid duplicates
        if (!prev.find(t => t.toLowerCase() === normalizedType)) {
          return [...prev, normalizedType]
        }
        return prev
      })
    }
  }

  // Helper function to format names with proper title case
  const formatTitleCase = (text) => {
    return text.toLowerCase().split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const handleCreateCustomer = (customerName) => {
    // Format the name with proper title case before creating
    const formattedName = formatTitleCase(customerName.trim())
    createCustomerMutation.mutate(formattedName)
  }

  const handleCreateVehicle = (plateNumber) => {
    // Create new vehicle with the entered plate number (convert to uppercase)
    if (!formData.customer) {
      toast.error('Please select a customer first')
      return
    }
    createVehicleMutation.mutate(plateNumber.toUpperCase())
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <CustomSelect
            label="Customer"
            required
            value={formData.customer || ''}
            onChange={(value) => {
              // Find the selected customer
              const selectedCustomer = customersData?.find(c => c._id === value)
              // Auto-fill phone if customer is selected
              const phone = selectedCustomer?.phone || ''
              setFormData({ ...formData, customer: value, phone })
              // Clear error when field changes
              if (errors.customer) {
                setErrors({ ...errors, customer: '' })
              }
            }}
            options={customersData?.map(cust => ({
              value: cust._id,
              label: cust.name.split(' ').map(w => 
                w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
              ).join(' ')
            })) || []}
            placeholder="Select or type customer name..."
            allowCreate={true}
            onCreateOption={handleCreateCustomer}
          />
          {errors.customer && (
            <p className="mt-1 text-sm text-red-600">{errors.customer}</p>
          )}
        </div>

        <div>
          <CustomSelect
            label="Vehicle No."
            required
            value={formData.vehicle || ''}
            onChange={(value) => {
              // Find the selected vehicle
              const selectedVehicle = vehiclesData?.find(v => v._id === value)
              // Auto-fill vehicleModel if vehicle is selected and has a model
              const vehicleModel = selectedVehicle?.model || ''
              setFormData({ ...formData, vehicle: value, vehicleModel })
              // Clear error when field changes
              if (errors.vehicle) {
                setErrors({ ...errors, vehicle: '' })
              }
            }}
            options={vehiclesData?.filter(v => v.customer?._id === formData.customer).map(veh => {
              // Don't show year, handle "Unknown" values
              const make = veh.make && veh.make.toLowerCase() !== 'unknown' ? veh.make : null
              const model = veh.model && veh.model.toLowerCase() !== 'unknown' ? veh.model : null
              const variant = make && model ? `${make} ${model}` : (model || make || '')
              const plateNumber = veh.plateNumber || ''
              return {
                value: veh._id,
                label: variant ? `${variant} - ${plateNumber}` : plateNumber || 'Vehicle'
              }
            }) || []}
            placeholder="Select or type vehicle plate number..."
            allowCreate={true}
            onCreateOption={handleCreateVehicle}
            autoUppercase={true}
          />
          {errors.vehicle && (
            <p className="mt-1 text-sm text-red-600">{errors.vehicle}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <CustomSelect
            label="Service Type"
            required
            value={formData.serviceType || ''}
            onChange={(value) => {
              setFormData({ ...formData, serviceType: value })
              // Clear error when field changes
              if (errors.serviceType) {
                setErrors({ ...errors, serviceType: '' })
              }
            }}
            options={allServiceTypes.map(type => ({ 
              value: type.toLowerCase(), 
              label: type.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
            }))}
            placeholder="Select or type service type..."
            allowCreate={true}
            onCreateOption={handleCreateServiceType}
          />
          {errors.serviceType && (
            <p className="mt-1 text-sm text-red-600">{errors.serviceType}</p>
          )}
        </div>

        <div>
          <CustomSelect
            label="Status"
            value={formData.status || ''}
            onChange={(value) => setFormData({ ...formData, status: value })}
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'in-progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' }
            ]}
            placeholder="Select status..."
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Model</label>
          <input
            type="text"
            value={formData.vehicleModel ?? ''}
            onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
          <input
            type="tel"
            value={formData.phone ?? ''}
            onChange={(e) => {
              setFormData({ ...formData, phone: e.target.value })
              // Clear error when field changes
              if (errors.phone) {
                setErrors({ ...errors, phone: '' })
              }
            }}
            className={`input ${errors.phone ? 'border-red-500' : ''}`}
            placeholder="Enter mobile number"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="input"
          rows="3"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
          <input
            type="date"
            value={formData.scheduledAt || ''}
            onChange={(e) => {
              setFormData({ ...formData, scheduledAt: e.target.value })
              // Clear error when field changes
              if (errors.expectedDeliveryDate) {
                setErrors({ ...errors, expectedDeliveryDate: '' })
              }
            }}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery Date</label>
          <input
            type="date"
            value={formData.expectedDeliveryDate || ''}
            onChange={(e) => {
              setFormData({ ...formData, expectedDeliveryDate: e.target.value })
              // Clear error when field changes
              if (errors.expectedDeliveryDate) {
                setErrors({ ...errors, expectedDeliveryDate: '' })
              }
            }}
            className={`input ${errors.expectedDeliveryDate ? 'border-red-500' : ''}`}
          />
          {errors.expectedDeliveryDate && (
            <p className="mt-1 text-sm text-red-600">{errors.expectedDeliveryDate}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Advanced Paid (Rs)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.advancedPaid !== undefined && formData.advancedPaid !== null ? formData.advancedPaid : ''}
            onChange={(e) => {
              const value = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0
              setFormData({ ...formData, advancedPaid: value })
              // Clear error when field changes
              if (errors.advancedPaid) {
                setErrors({ ...errors, advancedPaid: '' })
              }
            }}
            className={`input ${errors.advancedPaid ? 'border-red-500' : ''}`}
          />
          {errors.advancedPaid && (
            <p className="mt-1 text-sm text-red-600">{errors.advancedPaid}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost (Rs)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.totalCost !== undefined && formData.totalCost !== null ? formData.totalCost : ''}
            onChange={(e) => {
              const value = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0
              setFormData({ ...formData, totalCost: value })
              // Clear error when field changes
              if (errors.totalCost) {
                setErrors({ ...errors, totalCost: '' })
              }
            }}
            className={`input ${errors.totalCost ? 'border-red-500' : ''}`}
          />
          {errors.totalCost && (
            <p className="mt-1 text-sm text-red-600">{errors.totalCost}</p>
          )}
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
          {service ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  )
}

export default ServiceForm


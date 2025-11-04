import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../utils/api'
import CustomSelect from './CustomSelect'
import toast from 'react-hot-toast'

const InvoiceForm = ({ invoice = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    customer: '',
    vehicle: '',
    estimation: '',
    invoiceNumber: '',
    items: [{ description: '', quantity: '', unitPrice: '', totalPrice: 0 }],
    cgstRate: 0.09,
    sgstRate: 0.09,
    discount: 0,
    isPaid: false,
    notes: ''
  })

  const queryClient = useQueryClient()

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

  // Fetch estimations for the selected customer/vehicle
  const { data: estimationsData } = useQuery({
    queryKey: ['estimations'],
    queryFn: () => api.get('/estimations', { params: { limit: 1000 } }),
    select: (data) => data.data || []
  })

  // Fetch services for the selected customer/vehicle
  const { data: servicesData } = useQuery({
    queryKey: ['services', formData.customer, formData.vehicle],
    queryFn: () => api.get('/services', { params: { limit: 1000 } }),
    select: (data) => {
      const services = data?.data || []
      // Filter by customer and vehicle if both are selected
      return services.filter(service => {
        const customerMatch = !formData.customer || 
          (service.customer?._id === formData.customer || service.customer === formData.customer)
        const vehicleMatch = !formData.vehicle || 
          (service.vehicle?._id === formData.vehicle || service.vehicle === formData.vehicle)
        return customerMatch && vehicleMatch
      })
    },
    enabled: !!(formData.customer || formData.vehicle) // Only fetch when customer or vehicle is selected
  })

  // Helper function to format names with proper title case
  const formatTitleCase = (text) => {
    return text.toLowerCase().split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  // Mutation to create new customer
  const createCustomerMutation = useMutation({
    mutationFn: async (customerName) => {
      const customerData = {
        name: customerName,
        phone: '0000000000' // Placeholder - user can update later
      }
      const response = await api.post('/customers', customerData)
      return response.data
    },
    onSuccess: (newCustomer) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
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
      setFormData({ ...formData, vehicle: newVehicle._id })
      toast.success(`Vehicle "${newVehicle.plateNumber}" created successfully`)
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create vehicle'
      toast.error(errorMessage)
    }
  })

  const handleCreateCustomer = (customerName) => {
    const formattedName = formatTitleCase(customerName.trim())
    createCustomerMutation.mutate(formattedName)
  }

  const handleCreateVehicle = (plateNumber) => {
    if (!formData.customer) {
      toast.error('Please select a customer first')
      return
    }
    createVehicleMutation.mutate(plateNumber)
  }

  useEffect(() => {
    if (invoice) {
      setFormData({
        ...invoice,
        customer: invoice.customer?._id || invoice.customer,
        vehicle: invoice.vehicle?._id || invoice.vehicle,
        isPaid: invoice.status === 'paid',
        // Split taxRate into CGST and SGST (assuming equal split)
        cgstRate: invoice.taxRate ? invoice.taxRate / 2 : 0.09,
        sgstRate: invoice.taxRate ? invoice.taxRate / 2 : 0.09
      })
    } else {
      // Generate invoice number for new invoice
      const year = new Date().getFullYear()
      const random = Math.floor(Math.random() * 1000000)
      const generatedNumber = `INV-${year}-${String(random).padStart(6, '0')}`
      setFormData(prev => ({ ...prev, invoiceNumber: generatedNumber }))
    }
  }, [invoice])

  // Auto-populate items from estimation when estimation is selected
  useEffect(() => {
    // Only auto-populate if creating new invoice (not editing) and estimation is selected
    if (!invoice && formData.estimation && estimationsData) {
      const selectedEstimation = estimationsData.find(est => est._id === formData.estimation)
      
      if (selectedEstimation) {
        // Copy items from estimation
        const estimationItems = selectedEstimation.items.map(item => ({
          description: item.description || '',
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice || 0,
          totalPrice: (item.quantity || 1) * (item.unitPrice || 0)
        }))
        
        // Update form with estimation data
        setFormData(prev => ({
          ...prev,
          items: estimationItems.length > 0 ? estimationItems : prev.items,
          cgstRate: selectedEstimation.cgstRate || 0.09,
          sgstRate: selectedEstimation.sgstRate || 0.09,
          discount: selectedEstimation.discount || 0,
          notes: prev.notes || selectedEstimation.notes || ''
        }))
      }
    }
  }, [formData.estimation, estimationsData, invoice])

  // Auto-populate items from services when customer/vehicle changes
  useEffect(() => {
    // Only auto-populate if creating new invoice (not editing) and services are available and no estimation selected
    if (!invoice && !formData.estimation && servicesData && servicesData.length > 0 && formData.customer && formData.vehicle) {
      console.log('Auto-populating invoice items from services:', servicesData)
      // Convert services to invoice items - include all services for this customer/vehicle
      const serviceItems = servicesData
        .filter(service => ['pending', 'in-progress', 'completed'].includes(service.status)) // Include pending, in-progress, and completed services
        .map(service => {
          // Build description from service type and description
          let description = ''
          if (service.serviceType) {
            description = service.serviceType.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
          }
          if (service.description && service.description.trim()) {
            description += description ? ` - ${service.description}` : service.description
          }
          if (!description) {
            description = 'Service' // Fallback
          }
          
          return {
            description,
            quantity: 1,
            unitPrice: service.totalCost || 0,
            totalPrice: service.totalCost || 0
          }
        })
        // Always include all items - don't filter out zero-cost items
        // User can add prices later if needed

      console.log('Converted service items:', serviceItems)
      
      // If we have service items and items are empty or only have one empty item, populate them
      if (serviceItems.length > 0 && (
        formData.items.length === 0 || 
        (formData.items.length === 1 && !formData.items[0].description && formData.items[0].unitPrice === 0)
      )) {
        console.log('Populating invoice with service items')
        setFormData(prev => ({
          ...prev,
          items: serviceItems
        }))
      }
    }
  }, [servicesData, formData.customer, formData.vehicle, invoice])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Prepare data - clean up empty values
    const dataToSave = { ...formData }
    
    // Remove empty strings for optional fields
    if (!formData.notes || formData.notes.trim() === '') {
      delete dataToSave.notes
    }
    
    // Set status based on isPaid toggle
    // Backend only accepts: 'draft', 'sent', 'paid', 'overdue', 'cancelled'
    dataToSave.status = formData.isPaid ? 'paid' : 'draft'
    delete dataToSave.isPaid // Don't send isPaid to backend
    
    // Include invoice number
    if (!invoice && !dataToSave.invoiceNumber) {
      // Generate invoice number if not provided
      const year = new Date().getFullYear()
      const random = Math.floor(Math.random() * 1000000)
      dataToSave.invoiceNumber = `INV-${year}-${String(random).padStart(6, '0')}`
    }
    
    // Map CGST + SGST to taxRate (backend uses taxRate as total GST)
    dataToSave.taxRate = formData.cgstRate + formData.sgstRate
    delete dataToSave.cgstRate // Don't send cgstRate to backend
    delete dataToSave.sgstRate // Don't send sgstRate to backend
    
    // Ensure items are properly formatted - filter out empty items first
    const validItems = formData.items.filter(item => 
      item.description && item.description.trim() !== ''
    )
    
    if (validItems.length === 0) {
      toast.error('Please add at least one item with a description')
      return
    }
    
    dataToSave.items = validItems.map(item => ({
      description: item.description || '',
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
      totalPrice: (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0)
    }))
    
    onSave(dataToSave)
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: '', unitPrice: '', totalPrice: 0 }]
    })
  }

  const removeItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    })
  }

  const updateItem = (index, field, value) => {
    const items = [...formData.items]
    items[index] = { ...items[index], [field]: value }
    
    if (field === 'quantity' || field === 'unitPrice') {
      const qty = Number(items[index].quantity) || 0
      const price = Number(items[index].unitPrice) || 0
      items[index].totalPrice = qty * price
    }
    
    setFormData({ ...formData, items })
  }

  const subtotal = formData.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0)
  const cgstAmount = subtotal * formData.cgstRate
  const sgstAmount = subtotal * formData.sgstRate
  const gstAmount = cgstAmount + sgstAmount
  const total = subtotal + gstAmount - formData.discount

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
        <input
          type="text"
          value={formData.invoiceNumber || ''}
          onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
          className="input font-mono"
          readOnly={!!invoice}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <CustomSelect
            label="Customer"
            required
            value={formData.customer || ''}
            onChange={(value) => setFormData({ ...formData, customer: value })}
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
        </div>

        <div>
          <CustomSelect
            label="Vehicle No."
            required
            value={formData.vehicle || ''}
            onChange={(value) => setFormData({ ...formData, vehicle: value })}
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
          />
        </div>
      </div>

      <div>
        <CustomSelect
          label="Estimation (Optional)"
          value={formData.estimation || ''}
          onChange={(value) => setFormData({ ...formData, estimation: value })}
          options={estimationsData?.filter(e => {
            const customerMatch = !formData.customer || 
              (e.customer?._id === formData.customer || e.customer === formData.customer)
            const vehicleMatch = !formData.vehicle || 
              (e.vehicle?._id === formData.vehicle || e.vehicle === formData.vehicle)
            return customerMatch && vehicleMatch
          }).map(est => ({
            value: est._id,
            label: `${est.estimationNumber} - Rs ${(est.total || 0).toFixed(2)}`
          })) || []}
          placeholder="Select estimation to copy items..."
        />
        {formData.estimation && (
          <p className="mt-1 text-sm text-gray-500">
            Items and GST rates will be copied from selected estimation
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
        <div className="flex items-center space-x-3">
          <span className={`text-sm font-medium ${!formData.isPaid ? 'text-gray-700' : 'text-gray-400'}`}>
            Unpaid
          </span>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, isPaid: !formData.isPaid })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
              formData.isPaid ? 'bg-green-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                formData.isPaid ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${formData.isPaid ? 'text-green-600' : 'text-gray-400'}`}>
            Paid
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Items</label>
        <div className="space-y-3">
          {formData.items.map((item, index) => (
            <div key={index} className="border p-3 rounded grid grid-cols-12 gap-2 items-end">
              <input
                type="text"
                placeholder="e.g., Labor Charge, Oil Change"
                value={item.description}
                onChange={(e) => updateItem(index, 'description', e.target.value)}
                className="input col-span-4"
              />
              <input
                type="number"
                placeholder="Quantity"
                value={item.quantity || ''}
                onChange={(e) => updateItem(index, 'quantity', e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                className="input col-span-2"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Unit Price (Rs)"
                value={item.unitPrice || ''}
                onChange={(e) => updateItem(index, 'unitPrice', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                className="input col-span-2"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Total"
                value={item.totalPrice}
                disabled
                className="input bg-gray-100 col-span-2"
              />
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="btn btn-danger text-sm col-span-2"
              >
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={addItem} className="btn btn-secondary text-sm">
            Add Item
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CGST (%)</label>
          <input
            type="number"
            step="0.01"
            placeholder="e.g., 9"
            value={formData.cgstRate * 100}
            onChange={(e) => setFormData({ ...formData, cgstRate: (parseFloat(e.target.value) || 0) / 100 })}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SGST (%)</label>
          <input
            type="number"
            step="0.01"
            placeholder="e.g., 9"
            value={formData.sgstRate * 100}
            onChange={(e) => setFormData({ ...formData, sgstRate: (parseFloat(e.target.value) || 0) / 100 })}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Discount (Rs)</label>
          <input
            type="number"
            step="0.01"
            placeholder="e.g., 500.00"
            value={formData.discount}
            onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
            className="input"
          />
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded space-y-2">
        <div className="flex justify-between">
          <span className="font-medium">Subtotal:</span>
          <span>Rs. {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">CGST ({(formData.cgstRate * 100).toFixed(0)}%):</span>
          <span>Rs. {cgstAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">SGST ({(formData.sgstRate * 100).toFixed(0)}%):</span>
          <span>Rs. {sgstAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Discount:</span>
          <span>Rs. {formData.discount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t pt-2">
          <span>Total:</span>
          <span>Rs. {total.toFixed(2)}</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="input"
          placeholder="e.g., Payment terms, delivery instructions"
          rows="2"
        />
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {invoice ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  )
}

export default InvoiceForm


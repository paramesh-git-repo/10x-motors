import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../utils/api'
import DataTable from '../../components/DataTable'
import SearchInput from '../../components/SearchInput'
import Modal from '../../components/Modal'
import CustomerForm from '../../components/CustomerForm'
import { PencilIcon, TrashIcon, XMarkIcon } from '../../components/icons'
import toast from 'react-hot-toast'
import AutocompleteInput from '../../components/AutocompleteInput'

const CustomersList = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [vehicleModelFilter, setVehicleModelFilter] = useState('')

  // Get vehicles for filtering
  const { data: vehiclesData } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => api.get('/vehicles', { params: { limit: 1000 } }),
    select: (data) => data.data || []
  })

  const { data, isLoading } = useQuery({
    queryKey: ['customers', page, search],
    queryFn: () => api.get('/customers', { params: { page, limit: 25, search } }),
  })

  // Apply filters
  let customers = data?.data || []
  
  // Filter by vehicle model
  if (vehicleModelFilter && vehiclesData) {
    const vehiclesWithModel = vehiclesData.filter(v => 
      v.model?.toLowerCase().includes(vehicleModelFilter.toLowerCase())
    )
    const vehicleCustomerIds = vehiclesWithModel.map(v => v.customer?._id)
    customers = customers.filter(c => 
      c.vehicles?.some(v => vehicleCustomerIds.includes(v._id))
    )
  }
  
  // Filter by date range (using createdAt)
  if (dateFrom || dateTo) {
    customers = customers.filter(customer => {
      const customerDate = new Date(customer.createdAt)
      if (dateFrom && dateTo) {
        return customerDate >= new Date(dateFrom) && customerDate <= new Date(dateTo)
      } else if (dateFrom) {
        return customerDate >= new Date(dateFrom)
      } else if (dateTo) {
        return customerDate <= new Date(dateTo)
      }
      return true
    })
  }
  
  const pagination = data?.pagination

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/customers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Customer deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete customer')
    }
  })

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      // Save customer first
      const customerData = {
        name: data.name,
        phone: data.phone,
        alternateMobile: data.alternateMobile,
        address: data.address,
        notes: data.notes
      }
      
      const response = await api[editingCustomer ? 'put' : 'post'](
        editingCustomer ? `/customers/${editingCustomer._id}` : '/customers',
        customerData
      )
      
      // If vehicle fields are filled, create or update vehicle
      if (data.vehicleModel && data.vehiclePlateNumber) {
        const vehicleData = {
          customer: response.data?._id || editingCustomer?._id,
          make: data.vehicleModel.split(' ')[0] || 'Unknown', // Extract make from model
          model: data.vehicleModel,
          year: new Date().getFullYear(), // Use current year as default
          plateNumber: data.vehiclePlateNumber
        }
        
        // Check if editing customer and has vehicles - update instead of create
        if (editingCustomer && editingCustomer.vehicles && editingCustomer.vehicles.length > 0) {
          await api.put(`/vehicles/${editingCustomer.vehicles[0]._id}`, vehicleData)
        } else {
        await api.post('/vehicles', vehicleData)
        }
      }
      
      return response
    },
    onSuccess: async (_, data) => {
      // Invalidate and refetch queries to ensure fresh data
      await queryClient.invalidateQueries({ 
        queryKey: ['customers'],
        refetchType: 'active' 
      })
      await queryClient.invalidateQueries({ 
        queryKey: ['vehicles'],
        refetchType: 'active' 
      })
      
      if (data.vehicleModel && data.vehiclePlateNumber) {
        const vehicleAction = editingCustomer && editingCustomer.vehicles && editingCustomer.vehicles.length > 0
          ? 'updated'
          : 'created'
        toast.success(`Customer and vehicle ${vehicleAction} successfully`)
      } else {
        toast.success(editingCustomer ? 'Customer updated successfully' : 'Customer created successfully')
      }
      
      setIsModalOpen(false)
      setEditingCustomer(null)
      setIsCreatingNew(false)
    },
    onError: () => {
      toast.error('Failed to save customer')
    }
  })

  const handleCreate = () => {
    setEditingCustomer(null)
    setIsCreatingNew(true)
    setIsModalOpen(true)
  }

  const handleEdit = (customer) => {
    setEditingCustomer(customer)
    setIsCreatingNew(false)
    setIsModalOpen(true)
  }

  const handleSave = (data) => {
    saveMutation.mutate(data)
  }

  const handleDelete = (customer) => {
    if (window.confirm(`Are you sure you want to delete ${customer.name}?`)) {
      deleteMutation.mutate(customer._id)
    }
  }

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'phone', label: 'Phone', sortable: true },
    {
      key: 'vehicles',
      label: 'Vehicle Model',
      render: (value, row) => {
        if (value && value.length > 0) {
          const vehicle = value[0];
          const make = vehicle.make && vehicle.make.toLowerCase() !== 'unknown' ? vehicle.make : null;
          const model = vehicle.model && vehicle.model.toLowerCase() !== 'unknown' ? vehicle.model : null;
          if (make && model) {
            return `${make} ${model}`;
          } else if (model) {
            return model;
          } else if (make) {
            return make;
          }
          return '-';
        }
        return '-';
      }
    },
    {
      key: 'vehicleNumber',
      label: 'Vehicle Number',
      render: (value, row) => {
        const vehicles = row.vehicles;
        if (vehicles && vehicles.length > 0) {
          const vehicle = vehicles[0];
          return vehicle.plateNumber || '-';
        }
        return '-';
      }
    },
    {
      key: 'address',
      label: 'Address',
      render: (value, row) => {
        if (!value) return '-';
        const parts = [value.street, value.city, value.state].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : '-';
      }
    },
    {
      key: 'notes',
      label: 'Notes',
      render: (value) => value || '-'
    }
  ]

  const actions = (row) => (
    <div className="flex items-center justify-end space-x-2">
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleEdit(row)
        }}
        className="text-primary-600 hover:text-primary-900"
      >
        <PencilIcon className="h-5 w-5" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleDelete(row)
        }}
        className="text-red-600 hover:text-red-900"
      >
        <TrashIcon className="h-5 w-5" />
      </button>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
      <button onClick={handleCreate} className="btn btn-primary">
        Add Customer
      </button>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex items-end gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <SearchInput
              onSearch={setSearch}
              placeholder=""
            />
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <AutocompleteInput
              label="Vehicle Model"
              value={vehicleModelFilter}
              onChange={setVehicleModelFilter}
              placeholder=""
              suggestionsSource="vehicles"
              suggestionField="model"
            />
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="input"
            />
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="input"
            />
          </div>
        </div>
        
        {(vehicleModelFilter || dateFrom || dateTo) && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {vehicleModelFilter && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Model: {vehicleModelFilter}
                <button
                  onClick={() => setVehicleModelFilter('')}
                  className="ml-2 hover:text-blue-900"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </span>
            )}
            {dateFrom && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                From: {dateFrom}
                <button
                  onClick={() => setDateFrom('')}
                  className="ml-2 hover:text-green-900"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </span>
            )}
            {dateTo && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                To: {dateTo}
                <button
                  onClick={() => setDateTo('')}
                  className="ml-2 hover:text-primary-900"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setVehicleModelFilter('')
                setDateFrom('')
                setDateTo('')
              }}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      <DataTable
        columns={columns}
        data={customers}
        loading={isLoading}
        pagination={pagination}
        onPageChange={setPage}
        actions={actions}
        onRowClick={(row) => navigate(`/customers/${row._id}`)}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingCustomer(null)
          setIsCreatingNew(false)
        }}
        title={editingCustomer ? 'Edit Customer' : 'Create Customer'}
        size="md"
      >
        <CustomerForm
          customer={editingCustomer}
          onSave={handleSave}
          onCancel={() => {
            setIsModalOpen(false)
            setEditingCustomer(null)
            setIsCreatingNew(false)
          }}
        />
      </Modal>
    </div>
  )
}

export default CustomersList


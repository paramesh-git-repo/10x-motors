import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../utils/api'
import DataTable from '../../components/DataTable'
import SearchInput from '../../components/SearchInput'
import Modal from '../../components/Modal'
import ServiceForm from '../../components/ServiceForm'
import { PencilIcon, TrashIcon, ChevronDownIcon } from '../../components/icons'
import toast from 'react-hot-toast'

const ServicesList = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)
  const statusDropdownRef = useRef(null)

  const { data, isLoading } = useQuery({
    queryKey: ['services', page, search, statusFilter],
    queryFn: () => api.get('/services', { params: { page, limit: 25, search, status: statusFilter } }),
  })

  const services = data?.data || []
  const pagination = data?.pagination

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/services/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      toast.success('Service deleted successfully')
    },
  })

  const saveMutation = useMutation({
    mutationFn: (data) => {
      console.log('ServicesList sending data:', { 
        vehicleModel: data.vehicleModel, 
        phone: data.phone, 
        notes: data.notes, 
        address: data.address,
        advancedPaid: data.advancedPaid,
        totalCost: data.totalCost
      });
      if (editingService?._id) {
        return api.put(`/services/${editingService._id}`, data)
      } else {
        return api.post('/services', data)
      }
    },
    onSuccess: async (response) => {
      console.log('Full response:', response);
      console.log('Response keys:', Object.keys(response || {}));
      console.log('Response.data keys:', response?.data ? Object.keys(response.data) : 'no data');
      console.log('Advanced Paid (response.data?.advancedPaid):', response?.data?.advancedPaid);
      console.log('Advanced Paid (response?.advancedPaid):', response?.advancedPaid);
      console.log('Advanced Paid (response?.data?.data?.advancedPaid):', response?.data?.data?.advancedPaid);
      console.log('Total Cost (response.data?.totalCost):', response?.data?.totalCost);
      
      // Try all possible paths to find advancedPaid
      const advancedPaid = response?.data?.advancedPaid || response?.data?.data?.advancedPaid || response?.advancedPaid || 0;
      const totalCost = response?.data?.totalCost || response?.data?.data?.totalCost || response?.totalCost || 0;
      
      console.log('Resolved Advanced Paid:', advancedPaid);
      console.log('Resolved Total Cost:', totalCost);
      
      // Update the cache with the returned service data
      // Handle different response structures
      const serviceData = response?.data?.data || response?.data || response;
      
      if (serviceData) {
        
        // Update the services query cache
        queryClient.setQueryData(['services', page, search, statusFilter], (oldData) => {
          if (!oldData) return oldData;
          
          const updatedData = { ...oldData };
          if (editingService?._id) {
            // Update existing service in cache
            updatedData.data = oldData.data.map((s) =>
              s._id === editingService._id ? { 
                ...serviceData, 
                advancedPaid: serviceData.advancedPaid !== undefined && serviceData.advancedPaid !== null ? Number(serviceData.advancedPaid) : 0 
              } : s
            );
          } else {
            // Add new service to cache
            updatedData.data = [{ 
              ...serviceData, 
              advancedPaid: serviceData.advancedPaid !== undefined && serviceData.advancedPaid !== null ? Number(serviceData.advancedPaid) : 0 
            }, ...oldData.data];
            updatedData.pagination.total = (updatedData.pagination.total || 0) + 1;
          }
          return updatedData;
        });
      }
      
      // Invalidate and refetch to ensure fresh data
      await queryClient.invalidateQueries({ queryKey: ['services'] })
      await queryClient.invalidateQueries({ queryKey: ['customers'] })
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      // Refetch active queries to get the latest data
      await queryClient.refetchQueries({ queryKey: ['services'], type: 'active' })
      queryClient.refetchQueries({ queryKey: ['customers'], type: 'active' })
      queryClient.refetchQueries({ queryKey: ['vehicles'], type: 'active' })
      toast.success(editingService ? 'Service updated successfully' : 'Service created successfully')
      setIsModalOpen(false)
      setEditingService(null)
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save service'
      toast.error(errorMessage)
    }
  })

  const handleCreate = () => {
    setEditingService(null)
    setIsModalOpen(true)
  }

  const handleEdit = (service) => {
    setEditingService(service)
    setIsModalOpen(true)
  }

  const handleSave = (data) => {
    saveMutation.mutate(data)
  }

  const handleDelete = (service) => {
    if (window.confirm(`Are you sure you want to delete this service?`)) {
      deleteMutation.mutate(service._id)
    }
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }

  const statusOptions = [
    { value: '', label: 'All Statuses', color: 'bg-gray-100 text-gray-800' },
    { value: 'pending', label: 'Pending', color: statusColors.pending },
    { value: 'in-progress', label: 'In Progress', color: statusColors['in-progress'] },
    { value: 'completed', label: 'Completed', color: statusColors.completed },
    { value: 'cancelled', label: 'Cancelled', color: statusColors.cancelled }
  ]

  const selectedStatus = statusOptions.find(opt => opt.value === statusFilter) || statusOptions[0]

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setIsStatusDropdownOpen(false)
      }
    }

    if (isStatusDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isStatusDropdownOpen])

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const columns = [
    { 
      key: 'serviceType', 
      label: 'Service Type', 
      sortable: true,
      render: (value) => {
        if (!value) return '-'
        // Show the service type as stored, with title case formatting for readability
        return value.split(' ').map(w => {
          const word = w.toLowerCase()
          return word.charAt(0).toUpperCase() + word.slice(1)
        }).join(' ')
      }
    },
    { 
      key: 'customer', 
      label: 'Customer',
      sortable: true,
      render: (value, row) => row.customer?.name || '-'
    },
    { 
      key: 'vehicle', 
      label: 'Vehicle No.',
      render: (value, row) => {
        // Show only the plate number
        if (!row.vehicle) return '-'
        return row.vehicle.plateNumber || '-'
      }
    },
    {
      key: 'vehicleModel',
      label: 'Vehicle Model',
      sortable: true,
      render: (value, row) => {
        // Check both direct value and row.vehicleModel
        const modelValue = value || row.vehicleModel || ''
        return modelValue.trim() || '-'
      }
    },
    {
      key: 'scheduledAt',
      label: 'Scheduled Date',
      sortable: true,
      render: (value) => formatDate(value)
    },
    {
      key: 'expectedDeliveryDate',
      label: 'Expected Delivery',
      sortable: true,
      render: (value) => formatDate(value)
    },
    {
      key: 'advancedPaid',
      label: 'Advanced Paid',
      sortable: true,
      render: (value, row) => {
        // Check value first, then fallback to row.advancedPaid (for cases where key lookup fails)
        const amount = (value !== undefined && value !== null) 
          ? Number(value) 
          : (row.advancedPaid !== undefined && row.advancedPaid !== null 
            ? Number(row.advancedPaid) 
            : 0)
        return `Rs ${amount.toFixed(2)}`
      }
    },
    {
      key: 'totalCost',
      label: 'Total Cost',
      sortable: true,
      render: (value) => {
        const amount = value !== undefined && value !== null ? Number(value) : 0
        return `Rs ${amount.toFixed(2)}`
      }
    },
    { 
      key: 'status', 
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[value] || 'bg-gray-100 text-gray-800'}`}>
          {value || '-'}
        </span>
      )
    },
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
        <h1 className="text-3xl font-bold text-gray-900">Services</h1>
        <button onClick={handleCreate} className="btn btn-primary">
          Create Service
        </button>
      </div>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              onSearch={setSearch}
              placeholder="Search services..."
            />
          </div>
          <div className="relative" ref={statusDropdownRef}>
            <button
              type="button"
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              className="flex items-center justify-between w-full sm:w-56 px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-primary-400 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <div className="flex items-center space-x-2">
                {statusFilter && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${selectedStatus.color}`}>
                    {selectedStatus.label}
                  </span>
                )}
                {!statusFilter && (
                  <span className="text-gray-700 font-medium">Filter by Status</span>
                )}
              </div>
              <ChevronDownIcon 
                className={`h-5 w-5 text-gray-500 transition-transform ${isStatusDropdownOpen ? 'transform rotate-180' : ''}`} 
              />
            </button>
            
            {isStatusDropdownOpen && (
              <div className="absolute z-10 mt-2 w-full sm:w-56 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                <div className="py-1">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setStatusFilter(option.value)
                        setIsStatusDropdownOpen(false)
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        statusFilter === option.value
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option.label}</span>
                        {statusFilter === option.value && (
                          <svg className="h-5 w-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={services}
        loading={isLoading}
        pagination={pagination}
        onPageChange={setPage}
        actions={actions}
        onRowClick={(row) => navigate(`/services/${row._id}`)}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingService(null)
        }}
        title={editingService ? 'Edit Service' : 'Create Service'}
        size="lg"
      >
        <ServiceForm
          service={editingService}
          onSave={handleSave}
          onCancel={() => {
            setIsModalOpen(false)
            setEditingService(null)
          }}
        />
      </Modal>
    </div>
  )
}

export default ServicesList


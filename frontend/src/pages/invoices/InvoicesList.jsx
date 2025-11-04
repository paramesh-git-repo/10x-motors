import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../utils/api'
import DataTable from '../../components/DataTable'
import SearchInput from '../../components/SearchInput'
import Modal from '../../components/Modal'
import InvoiceForm from '../../components/InvoiceForm'
import CustomSelect from '../../components/CustomSelect'
import { PencilIcon, TrashIcon, ChatBubbleLeftRightIcon } from '../../components/icons'
import { sendWhatsAppInvoice, getWhatsAppStatus } from '../../utils/api'
import toast from 'react-hot-toast'

const InvoicesList = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState(null)
  const [whatsappEnabled, setWhatsappEnabled] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', page, search, statusFilter],
    queryFn: () => api.get('/invoices', { params: { page, limit: 25, search, status: statusFilter } }),
  })

  const invoices = data?.data || []
  const pagination = data?.pagination

  // Check WhatsApp status on mount
  useEffect(() => {
    const checkWhatsAppStatus = async () => {
      try {
        const status = await getWhatsAppStatus()
        setWhatsappEnabled(status.enabled && status.connected)
      } catch (error) {
        console.error('Failed to check WhatsApp status:', error)
        setWhatsappEnabled(false)
      }
    }
    checkWhatsAppStatus()
  }, [])

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/invoices/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Invoice deleted successfully')
    },
  })

  const whatsappMutation = useMutation({
    mutationFn: (invoiceId) => sendWhatsAppInvoice(invoiceId),
    onSuccess: () => {
      toast.success('WhatsApp notification sent successfully')
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to send WhatsApp notification'
      toast.error(errorMessage)
    }
  })

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (editingInvoice?._id) {
        return api.put(`/invoices/${editingInvoice._id}`, data)
      } else {
        return api.post('/invoices', data)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success(editingInvoice ? 'Invoice updated successfully' : 'Invoice created successfully')
      setIsModalOpen(false)
      setEditingInvoice(null)
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save invoice'
      toast.error(errorMessage)
    }
  })

  const handleCreate = () => {
    setEditingInvoice(null)
    setIsModalOpen(true)
  }

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice)
    setIsModalOpen(true)
  }

  const handleSave = (data) => {
    saveMutation.mutate(data)
  }

  const handleDelete = (invoice) => {
    if (window.confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}?`)) {
      deleteMutation.mutate(invoice._id)
    }
  }

  const handleWhatsAppSend = (invoice) => {
    if (!invoice.customer?.phone) {
      toast.error('Customer phone number is missing')
      return
    }
    whatsappMutation.mutate(invoice._id)
  }

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800'
  }

  const columns = [
    { key: 'invoiceNumber', label: 'Invoice #', sortable: true },
    { 
      key: 'customer', 
      label: 'Customer',
      sortable: true,
      render: (value, row) => {
        const name = row.customer?.name || ''
        return name.split(' ').map(w => 
          w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
        ).join(' ') || '-'
      }
    },
    { 
      key: 'vehicle', 
      label: 'Vehicle',
      render: (value, row) => {
        if (!row.vehicle) return '-'
        const make = row.vehicle.make && row.vehicle.make.toLowerCase() !== 'unknown' ? row.vehicle.make : null
        const model = row.vehicle.model && row.vehicle.model.toLowerCase() !== 'unknown' ? row.vehicle.model : null
        const variant = make && model ? `${make} ${model}` : (model || make || '')
        const plateNumber = row.vehicle.plateNumber ? `(${row.vehicle.plateNumber})` : null
        const parts = [variant, plateNumber].filter(Boolean)
        return parts.length > 0 ? parts.join(' ') : '-'
      }
    },
    { 
      key: 'total', 
      label: 'Total',
      sortable: true,
      render: (value) => `$${value?.toFixed(2) || '0.00'}`
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
    { 
      key: 'whatsapp', 
      label: 'WhatsApp',
      align: 'center',
      render: (value, row) => {
        if (row.status === 'paid') {
          return (
            <div className="flex items-center justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleWhatsAppSend(row)
                }}
                className="text-green-600 hover:text-green-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Send WhatsApp notification"
                disabled={whatsappMutation.isPending}
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5" />
              </button>
            </div>
          )
        }
        return <span className="text-gray-400">-</span>
      }
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
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <button onClick={handleCreate} className="btn btn-primary">
          Create Invoice
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <CustomSelect
              value={statusFilter || ''}
              onChange={(value) => setStatusFilter(value)}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'draft', label: 'Draft' },
                { value: 'sent', label: 'Sent' },
                { value: 'paid', label: 'Paid' },
                { value: 'overdue', label: 'Overdue' }
              ]}
              placeholder="Filter by status..."
            />
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={invoices}
        loading={isLoading}
        pagination={pagination}
        onPageChange={setPage}
        actions={actions}
        onRowClick={(row) => navigate(`/invoices/${row._id}`)}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingInvoice(null)
        }}
        title={editingInvoice ? 'Edit Invoice' : 'Create Invoice'}
        size="xl"
      >
        <InvoiceForm
          invoice={editingInvoice}
          onSave={handleSave}
          onCancel={() => {
            setIsModalOpen(false)
            setEditingInvoice(null)
          }}
        />
      </Modal>
    </div>
  )
}

export default InvoicesList


import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../utils/api'
import DataTable from '../components/DataTable'
import SearchInput from '../components/SearchInput'
import Modal from '../components/Modal'
import EstimationForm from '../components/EstimationForm'
import { PencilIcon, TrashIcon } from '../components/icons'
import toast from 'react-hot-toast'

const EstimationsList = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEstimation, setEditingEstimation] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['estimations', page, search, statusFilter],
    queryFn: () => api.get('/estimations', { params: { page, limit: 25, search, status: statusFilter } }),
  })

  const estimations = data?.data || []
  const pagination = data?.pagination

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/estimations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimations'] })
      toast.success('Estimation deleted successfully')
    },
  })

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (editingEstimation?._id) {
        return api.put(`/estimations/${editingEstimation._id}`, data)
      } else {
        return api.post('/estimations', data)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimations'] })
      setIsModalOpen(false)
      setEditingEstimation(null)
      toast.success(`Estimation ${editingEstimation ? 'updated' : 'created'} successfully`)
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save estimation'
      toast.error(errorMessage)
    }
  })

  const handleCreate = () => {
    setEditingEstimation(null)
    setIsModalOpen(true)
  }

  const handleEdit = (estimation) => {
    setEditingEstimation(estimation)
    setIsModalOpen(true)
  }

  const handleSave = (data) => {
    saveMutation.mutate(data)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this estimation?')) {
      deleteMutation.mutate(id)
    }
  }

  const columns = [
    { key: 'estimationNumber', label: 'Estimation #', sortable: true },
    { key: 'customer', label: 'Customer', render: (value) => value?.name || '-' },
    { key: 'vehicle', label: 'Vehicle', render: (value) => value ? `${value.make} ${value.model}` : '-' },
    { key: 'total', label: 'Total', render: (value) => `Rs ${(value || 0).toFixed(2)}` },
    { key: 'validUntil', label: 'Valid Until', render: (value) => new Date(value).toLocaleDateString() },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const statusColors = {
          draft: 'bg-gray-100 text-gray-800',
          sent: 'bg-blue-100 text-blue-800',
          accepted: 'bg-green-100 text-green-800',
          rejected: 'bg-red-100 text-red-800',
          expired: 'bg-orange-100 text-orange-800'
        }
        const color = statusColors[value] || 'bg-gray-100 text-gray-800'
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
            {value?.toUpperCase() || 'DRAFT'}
          </span>
        )
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Estimations</h1>
        <button onClick={handleCreate} className="btn btn-primary">
          Create Estimation
        </button>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex gap-4 mb-4">
          <SearchInput
            onSearch={setSearch}
            placeholder="Search by estimation number or items..."
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        {estimations.length > 0 && (
          <DataTable
            columns={columns}
            data={estimations}
            isLoading={isLoading}
            pagination={pagination}
            onPageChange={setPage}
          />
        )}
        {!isLoading && estimations.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No estimations found
          </div>
        )}
      </div>

      <Modal
        title={editingEstimation ? 'Edit Estimation' : 'Create Estimation'}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingEstimation(null)
        }}
      >
        <EstimationForm
          estimation={editingEstimation}
          onSave={handleSave}
          onCancel={() => {
            setIsModalOpen(false)
            setEditingEstimation(null)
          }}
        />
      </Modal>
    </div>
  )
}

export default EstimationsList

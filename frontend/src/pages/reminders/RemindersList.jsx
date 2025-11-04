import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../utils/api'
import DataTable from '../../components/DataTable'
import SearchInput from '../../components/SearchInput'
import Modal from '../../components/Modal'
import ReminderForm from '../../components/ReminderForm'
import { PencilIcon, TrashIcon, ChatBubbleLeftRightIcon } from '../../components/icons'
import { sendWhatsAppReminder, getWhatsAppStatus } from '../../utils/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const RemindersList = () => {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingReminder, setEditingReminder] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['reminders', page, search, statusFilter],
    queryFn: () => api.get('/reminders', { params: { page, limit: 25, search, status: statusFilter } }),
  })

  const reminders = data?.data || []
  const pagination = data?.pagination

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/reminders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] })
      toast.success('Reminder deleted successfully')
    },
  })

  const whatsappMutation = useMutation({
    mutationFn: (reminderId) => sendWhatsAppReminder(reminderId),
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
      if (editingReminder?._id) {
        return api.put(`/reminders/${editingReminder._id}`, data)
      } else {
        return api.post('/reminders', data)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] })
      toast.success(editingReminder ? 'Reminder updated successfully' : 'Reminder created successfully')
      setIsModalOpen(false)
      setEditingReminder(null)
    },
    onError: () => {
      toast.error('Failed to save reminder')
    }
  })

  const handleCreate = () => {
    setEditingReminder(null)
    setIsModalOpen(true)
  }

  const handleEdit = (reminder) => {
    setEditingReminder(reminder)
    setIsModalOpen(true)
  }

  const handleSave = (data) => {
    saveMutation.mutate(data)
  }

  const handleDelete = (reminder) => {
    if (window.confirm(`Are you sure you want to delete this reminder?`)) {
      deleteMutation.mutate(reminder._id)
    }
  }

  const handleWhatsAppSend = (reminder) => {
    if (!reminder.customer?.phone) {
      toast.error('Customer phone number is missing')
      return
    }
    whatsappMutation.mutate(reminder._id)
  }

  const columns = [
    { key: 'title', label: 'Title', sortable: true },
    { 
      key: 'customer', 
      label: 'Customer',
      render: (value, row) => row.customer?.name || 'N/A'
    },
    { 
      key: 'scheduledDate', 
      label: 'Date',
      render: (value) => format(new Date(value), 'PP')
    },
    { key: 'status', label: 'Status', sortable: true },
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      align: 'center',
      render: (value, row) => (
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
        <h1 className="text-3xl font-bold text-gray-900">Reminders</h1>
        <button onClick={handleCreate} className="btn btn-primary">Create Reminder</button>
      </div>

      <div className="mb-6 space-y-4">
        <SearchInput
          onSearch={setSearch}
          placeholder="Search reminders..."
        />
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-auto"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={reminders}
        loading={isLoading}
        pagination={pagination}
        onPageChange={setPage}
        actions={actions}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingReminder(null)
        }}
        title={editingReminder ? 'Edit Reminder' : 'Create Reminder'}
        size="md"
      >
        <ReminderForm
          reminder={editingReminder}
          onSave={handleSave}
          onCancel={() => {
            setIsModalOpen(false)
            setEditingReminder(null)
          }}
        />
      </Modal>
    </div>
  )
}

export default RemindersList

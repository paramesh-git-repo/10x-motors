import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../utils/api'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import UserForm from '../../components/UserForm'
import { PencilIcon, TrashIcon } from '../../components/icons'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

const UsersList = () => {
  const { user: currentUser } = useAuth()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['users', page],
    queryFn: () => api.get('/users', { params: { page, limit: 25 } }),
    enabled: currentUser?.role === 'admin'
  })

  const users = data?.data || []
  const pagination = data?.pagination

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User deleted successfully')
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete user'
      toast.error(errorMessage)
    }
  })

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (editingUser?._id) {
        return api.put(`/users/${editingUser._id}`, data)
      } else {
        return api.post('/users', data)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success(editingUser ? 'User updated successfully' : 'User created successfully')
      setIsModalOpen(false)
      setEditingUser(null)
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save user'
      toast.error(errorMessage)
    }
  })

  const handleCreate = () => {
    setEditingUser(null)
    setIsModalOpen(true)
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setIsModalOpen(true)
  }

  const handleSave = (data) => {
    saveMutation.mutate(data)
  }

  const handleDelete = (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      deleteMutation.mutate(user._id)
    }
  }

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { 
      key: 'role', 
      label: 'Role',
      render: (value) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
          {value}
        </span>
      )
    },
    { 
      key: 'isActive', 
      label: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
  ]

  const actions = (row) => (
    currentUser?._id !== row._id && (
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
  )

  if (currentUser?.role !== 'admin') {
    return <div className="p-6 text-center text-gray-600">Access denied. Admin only.</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <button onClick={handleCreate} className="btn btn-primary">
          Add User
        </button>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={isLoading}
        pagination={pagination}
        onPageChange={setPage}
        actions={actions}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingUser(null)
        }}
        title={editingUser ? 'Edit User' : 'Add User'}
        size="md"
      >
        <UserForm
          user={editingUser}
          onSave={handleSave}
          onCancel={() => {
            setIsModalOpen(false)
            setEditingUser(null)
          }}
        />
      </Modal>
    </div>
  )
}

export default UsersList


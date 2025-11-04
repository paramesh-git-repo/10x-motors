import { useState, useEffect } from 'react'
import CustomSelect from './CustomSelect'

const UserForm = ({ user = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'receptionist',
    isActive: true
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '', // Never pre-fill password
        role: user.role || 'receptionist',
        isActive: user.isActive !== undefined ? user.isActive : true
      })
    }
  }, [user])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // If editing and password is empty, remove it from data
    const dataToSend = { ...formData }
    if (user && !dataToSend.password) {
      delete dataToSend.password
    }
    
    onSave(dataToSend)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="input"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="input"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password {!user ? '*' : '(leave blank to keep current)'}
        </label>
        <input
          type="password"
          required={!user}
          minLength={6}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="input"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
        <CustomSelect
          value={formData.role}
          onChange={(value) => setFormData({ ...formData, role: value })}
          options={[
            { value: 'admin', label: 'Admin' },
            { value: 'technician', label: 'Technician' },
            { value: 'receptionist', label: 'Receptionist' }
          ]}
          placeholder="Select role..."
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
          Active User
        </label>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {user ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  )
}

export default UserForm


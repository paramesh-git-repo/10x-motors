import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const Settings = () => {
  const { user, fetchUser } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')

  const [profileData, setProfileData] = useState({
    name: '',
    email: ''
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Profile update mutation
  const profileMutation = useMutation({
    mutationFn: (data) => api.put('/auth/me', data),
    onSuccess: (response) => {
      toast.success('Profile updated successfully')
      fetchUser() // Refresh user data
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update profile'
      toast.error(errorMessage)
    }
  })

  // Password update mutation
  const passwordMutation = useMutation({
    mutationFn: (data) => api.put('/auth/update-password', {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    }),
    onSuccess: () => {
      toast.success('Password updated successfully')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update password'
      toast.error(errorMessage)
    }
  })

  const handleProfileSubmit = (e) => {
    e.preventDefault()
    profileMutation.mutate(profileData)
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    passwordMutation.mutate(passwordData)
  }

  // Initialize profile data from user
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || ''
      })
    }
  }, [user])

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'password'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Password
          </button>
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Update Profile</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                required
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="input"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={profileMutation.isPending}
              >
                {profileMutation.isPending ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Change Password</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password *</label>
              <input
                type="password"
                required
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
              <input
                type="password"
                required
                minLength={6}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password *</label>
              <input
                type="password"
                required
                minLength={6}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="input"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={passwordMutation.isPending}
              >
                {passwordMutation.isPending ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default Settings


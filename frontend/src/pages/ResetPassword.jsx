import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { EyeIcon, EyeSlashIcon } from '../components/icons'

const ResetPassword = () => {
  const { resetToken } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setIsLoaded(true)
    if (!resetToken) {
      setError('Invalid reset token')
    }
  }, [resetToken])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      const response = await api.put(`/auth/reset-password/${resetToken}`, {
        password: formData.password
      })

      if (response.success) {
        setIsSuccess(true)
        toast.success('Password reset successful! Please login with your new password.')
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to reset password')
      toast.error(error.response?.data?.message || 'Failed to reset password')
    } finally {
      setIsLoading(false)
    }
  }

  if (!resetToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-xl">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Invalid Reset Link</h2>
            <p className="text-sm text-gray-600 mb-4">The reset link is invalid or missing.</p>
            <Link 
              to="/forgot-password" 
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              Request a new reset link
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-24 -left-24 w-96 h-96 bg-gray-900/20 rounded-full blur-3xl transition-all duration-1000 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}></div>
        <div className={`absolute -bottom-24 -right-24 w-96 h-96 bg-gray-900/20 rounded-full blur-3xl transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}></div>
      </div>
      
      <div className={`max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-xl transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className={`transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <div className="text-center">
            <div className={`inline-block mb-4 transform transition-all duration-700 delay-100 ${isLoaded ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}`}>
              <img src="/logo.webp" alt="10x Motors Care" className="h-20 w-auto mx-auto" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
              Reset Password
            </h2>
            <p className="text-sm text-gray-600">
              Enter your new password
            </p>
          </div>
        </div>

        {isSuccess ? (
          <div className={`mt-8 space-y-6 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
            <div className="rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-800">
                Password reset successful! Redirecting to login...
              </div>
            </div>
          </div>
        ) : (
          <form className={`mt-8 space-y-6 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input w-full pr-10 transition-all duration-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter new password (min 6 characters)"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="input w-full pr-10 transition-all duration-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Confirm new password"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-800">{error}</div>
              </div>
            )}

            <div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="btn btn-primary w-full transform transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>

            <div className="text-center">
              <Link 
                to="/login" 
                className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                ← Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default ResetPassword

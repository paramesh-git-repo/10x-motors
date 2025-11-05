import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [resetUrl, setResetUrl] = useState('')
  const [resetToken, setResetToken] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await api.post('/auth/forgot-password', { email })
      
      if (response.success) {
        // In development, automatically navigate to reset password page
        if (response.resetToken) {
          toast.success('Password reset link generated! Redirecting...')
          // Automatically navigate to reset password page
          setTimeout(() => {
            navigate(`/reset-password/${response.resetToken}`)
          }, 500)
        } else {
          // Production mode - show success message
          setIsSubmitted(true)
          toast.success(response.message || 'If that email exists, a password reset link has been sent.')
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset email')
    } finally {
      setIsLoading(false)
    }
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
              Forgot Password
            </h2>
            <p className="text-sm text-gray-600">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>
        </div>

        {!isSubmitted ? (
          <form className={`mt-8 space-y-6 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input w-full transition-all duration-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="btn btn-primary w-full transform transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
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
        ) : (
          <div className={`mt-8 space-y-6 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
            <div className="rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-800 mb-2">
                If that email exists, a password reset link has been sent.
              </div>
              {resetUrl && (
                <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200 space-y-3">
                  <p className="text-xs text-gray-600 mb-2">Development Mode - Reset Link:</p>
                  <a 
                    href={resetUrl} 
                    className="text-xs text-primary-600 hover:text-primary-500 break-all block mb-2"
                  >
                    {resetUrl}
                  </a>
                  {resetToken && (
                    <button
                      onClick={() => navigate(`/reset-password/${resetToken}`)}
                      className="btn btn-primary w-full text-sm"
                    >
                      Go to Reset Password Page
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="text-center space-y-2">
              <Link 
                to="/login" 
                className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors block"
              >
                ← Back to Login
              </Link>
              <button
                onClick={() => {
                  setIsSubmitted(false)
                  setEmail('')
                  setResetUrl('')
                  setResetToken('')
                }}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Try another email
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword

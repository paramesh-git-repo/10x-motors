import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { EyeIcon, EyeSlashIcon } from '../components/icons'

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoaded, setIsLoaded] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    setIsLoaded(true)
    // Load saved credentials if they exist
    const savedEmail = localStorage.getItem('rememberedEmail')
    const savedPassword = localStorage.getItem('rememberedPassword')
    if (savedEmail && savedPassword) {
      setFormData({ email: savedEmail, password: savedPassword })
      setRememberMe(true)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      await login(formData.email, formData.password)
      
      // Save or remove credentials based on remember me checkbox
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email)
        localStorage.setItem('rememberedPassword', formData.password)
      } else {
        localStorage.removeItem('rememberedEmail')
        localStorage.removeItem('rememberedPassword')
      }
      
      navigate('/')
    } catch (err) {
      setError('Invalid email or password')
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
              10x Motors Care
            </h2>
            <p className="text-sm text-gray-600">
              Sign in to your account
            </p>
          </div>
        </div>
        <form className={`mt-8 space-y-6 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="transform transition-all duration-500 hover:scale-[1.02]">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input mt-1 transition-all duration-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter your email"
              />
            </div>
            <div className="transform transition-all duration-500 hover:scale-[1.02]">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input mt-1 pr-10 transition-all duration-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter your password"
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
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 animate-pulse">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>
          </div>

          <div>
            <button 
              type="submit" 
              className="btn btn-primary w-full transform transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login


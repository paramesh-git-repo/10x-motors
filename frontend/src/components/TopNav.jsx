import { useAuth } from '../context/AuthContext'

const TopNav = () => {
  const { user } = useAuth()

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 no-print">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img src="/logo.webp" alt="10x Motors Care" className="h-10 w-auto" />
          <h1 className="text-2xl font-bold text-gray-900">10x Motors Care</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Welcome, {user?.name}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
            {user?.role}
          </span>
        </div>
      </div>
    </nav>
  )
}

export default TopNav


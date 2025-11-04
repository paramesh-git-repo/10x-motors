import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  HomeIcon,
  UsersIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  BellIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  CalculatorIcon
} from './icons'

const SideBar = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems = [
    { path: '/', icon: HomeIcon, label: 'Dashboard' },
    { path: '/customers', icon: UsersIcon, label: 'Customers' },
    { path: '/services', icon: WrenchScrewdriverIcon, label: 'Services' },
    { path: '/estimations', icon: CalculatorIcon, label: 'Estimations' },
    { path: '/invoices', icon: DocumentTextIcon, label: 'Invoices' },
    { path: '/reminders', icon: BellIcon, label: 'Reminders' },
  ]

  menuItems.push({ path: '/settings', icon: Cog6ToothIcon, label: 'Settings' })

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col no-print">
      <div className="px-4 py-6 border-b border-gray-700">
        <div className="flex flex-col items-center space-y-2">
          <img src="/logo.webp" alt="10x Motors Care" className="h-12 w-auto" />
          <h2 className="text-lg font-bold text-white text-center">10x Motors Care</h2>
          <p className="text-xs text-gray-400 text-center">CRM System</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <Icon className="mr-3 h-6 w-6" />
                {item.label}
              </NavLink>
            )
          })}
        </nav>
      </div>
      <div className="border-t border-gray-700 p-4">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
              <span className="text-white font-medium">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
        >
          <ArrowRightOnRectangleIcon className="mr-3 h-6 w-6" />
          Logout
        </button>
      </div>
    </aside>
  )
}

export default SideBar


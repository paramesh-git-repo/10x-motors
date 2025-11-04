import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { 
  UsersIcon, 
  WrenchScrewdriverIcon, 
  DocumentTextIcon, 
  BellIcon 
} from '../components/icons'
import RevenueChart from '../components/RevenueChart'

const StatCard = ({ icon: Icon, title, value, color, onClick }) => (
  <div 
    className={`card p-6 ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="h-8 w-8 text-white" />
      </div>
    </div>
  </div>
)

const Dashboard = () => {
  const navigate = useNavigate()
  
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/dashboard/stats'),
  })

  const data = stats?.data || {}

  if (isLoading) {
    return <div className="text-center py-12">Loading dashboard...</div>
  }

  if (error) {
    return <div className="text-center py-12 text-red-600">Error loading dashboard: {error.message}</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={UsersIcon}
          title="Total Customers"
          value={data.totalCustomers || 0}
          color="bg-blue-500"
          onClick={() => navigate('/customers')}
        />
        <StatCard
          icon={WrenchScrewdriverIcon}
          title="Total Services"
          value={data.totalServices || 0}
          color="bg-green-500"
          onClick={() => navigate('/services')}
        />
        <StatCard
          icon={DocumentTextIcon}
          title="Total Invoices"
          value={data.totalInvoices || 0}
          color="bg-primary-500"
          onClick={() => navigate('/invoices')}
        />
        <StatCard
          icon={BellIcon}
          title="Pending Reminders"
          value={data.upcomingReminders?.length || 0}
          color="bg-orange-500"
          onClick={() => navigate('/reminders')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Revenue Overview</h2>
          <RevenueChart data={data.revenueByMonth} />
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Pending Services</h2>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-bold text-lg">{data.totalPendingServices || 0}</span>
          </div>
          {data.pendingServices && data.pendingServices.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {data.pendingServices.map((service) => (
                <div key={service._id} className="border border-gray-200 rounded-lg p-3 hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer" onClick={() => navigate(`/services/${service._id}`)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{service.serviceType || 'Service'}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">{service.customer?.name}</span>
                      </p>
                  <p className="text-sm text-gray-600">
                        {service.vehicle?.make} {service.vehicle?.model} - {service.vehicle?.plateNumber}
                  </p>
                      {service.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{service.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      {new Date(service.createdAt).toLocaleDateString()}
                    </span>
                    {service.scheduledAt && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                        {new Date(service.scheduledAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            ) : (
            <p className="text-gray-500 text-sm text-center py-8">No pending services</p>
            )}
        </div>
      </div>

        <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Pending Invoices</h2>
          <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full font-bold text-lg">{data.totalPendingInvoices || 0}</span>
            </div>
        {data.pendingInvoices && data.pendingInvoices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.pendingInvoices.map((invoice) => (
              <div key={invoice._id} className="border border-gray-200 rounded-lg p-4 hover:bg-primary-50 hover:border-primary-300 transition-all cursor-pointer" onClick={() => navigate(`/invoices/${invoice._id}`)}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg text-primary-600">#{invoice.invoiceNumber}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${
                    invoice.status === 'sent' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {invoice.status || 'draft'}
                  </span>
            </div>
                <p className="font-semibold text-gray-900">{invoice.customer?.name}</p>
                {invoice.vehicle && (
                  <p className="text-sm text-gray-600 mt-1">{invoice.vehicle?.make} {invoice.vehicle?.model}</p>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {new Date(invoice.createdAt).toLocaleDateString()}
                  </span>
                  <span className="font-bold text-lg text-gray-900">
                    Rs {invoice.total?.toFixed(2)}
                  </span>
          </div>
        </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm text-center py-8">No pending invoices</p>
        )}
      </div>
    </div>
  )
}

export default Dashboard


import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../utils/api'
import { format } from 'date-fns'

const CustomerDetail = () => {
  const { id } = useParams()
  
  const { data, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => api.get(`/customers/${id}`),
  })

  // Fetch services for this customer
  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['customer-services', id],
    queryFn: () => api.get('/services', { 
      params: { 
        limit: 1000,
        search: ''
      } 
    }),
    enabled: !!id
  })

  const customer = data?.data
  const allServices = servicesData?.data || []
  
  // Filter services for this customer
  const customerServices = allServices.filter(service => 
    service.customer?._id === id || service.customer === id
  )

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!customer) {
    return <div>Customer not found</div>
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Email:</span>
              <p className="font-medium">{customer.email || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Phone:</span>
              <p className="font-medium">{customer.phone}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Address:</span>
              <p className="font-medium">
                {customer.address?.street || 'N/A'}
                {customer.address?.city && `, ${customer.address.city}`}
                {customer.address?.state && `, ${customer.address.state}`}
                {customer.address?.zipCode && ` ${customer.address.zipCode}`}
              </p>
            </div>
            {customer.notes && (
              <div>
                <span className="text-sm text-gray-600">Notes:</span>
                <p className="font-medium">{customer.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Vehicles</h2>
          {customer.vehicles && customer.vehicles.length > 0 ? (
            <div className="space-y-3">
              {customer.vehicles.map((vehicle) => (
                <div key={vehicle._id} className="border border-gray-200 rounded-lg p-4">
                  <p className="font-semibold text-gray-900">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </p>
                  <p className="text-sm text-gray-600">Plate: {vehicle.plateNumber}</p>
                  {vehicle.vin && <p className="text-sm text-gray-600">VIN: {vehicle.vin}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No vehicles registered</p>
          )}
        </div>
      </div>

      {/* Services Section */}
      <div className="card p-6 mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Service History</h2>
        {servicesLoading ? (
          <p className="text-gray-500">Loading services...</p>
        ) : customerServices && customerServices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customerServices.map((service) => (
                  <tr key={service._id}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {service.serviceType}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {service.vehicle ? (
                        `${service.vehicle.year || ''} ${service.vehicle.make || ''} ${service.vehicle.model || ''}`.trim()
                      ) : (
                        service.vehicleModel || '-'
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {service.description || '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        service.status === 'completed' ? 'bg-green-100 text-green-800' :
                        service.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        service.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {service.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {service.scheduledAt ? format(new Date(service.scheduledAt), 'MMM dd, yyyy') : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${service.totalCost?.toFixed(2) || '0.00'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No service history</p>
        )}
      </div>
    </div>
  )
}

export default CustomerDetail


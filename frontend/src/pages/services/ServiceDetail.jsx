import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../utils/api'
import { format } from 'date-fns'
import { ArrowLeftIcon } from '../../components/icons'

const ServiceDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const { data, isLoading } = useQuery({
    queryKey: ['service', id],
    queryFn: () => api.get(`/services/${id}`),
  })

  const service = data?.data

  const handleBack = () => {
    navigate('/services')
  }

  if (isLoading) return <div>Loading...</div>
  if (!service) return <div>Service not found</div>

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="btn btn-secondary flex items-center gap-2"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{service.serviceType}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Information</h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Type:</span>
              <p className="font-medium capitalize">{service.serviceType}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Status:</span>
              <p className="font-medium capitalize">{service.status}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Description:</span>
              <p className="font-medium">{service.description || 'N/A'}</p>
            </div>
            {service.scheduledAt && (
              <div>
                <span className="text-sm text-gray-600">Scheduled At:</span>
                <p className="font-medium">{format(new Date(service.scheduledAt), 'PPpp')}</p>
              </div>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer & Vehicle</h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Customer:</span>
              <p className="font-medium">{service.customer?.name || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Vehicle:</span>
              <p className="font-medium">
                {service.vehicle?.year} {service.vehicle?.make} {service.vehicle?.model}
              </p>
              <p className="text-sm text-gray-600">Plate: {service.vehicle?.plateNumber}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServiceDetail


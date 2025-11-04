import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../utils/api'
import { format } from 'date-fns'
import { PrinterIcon, ArrowLeftIcon } from '../../components/icons'

const InvoiceDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const { data, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => api.get(`/invoices/${id}`),
  })

  const invoice = data?.data

  const handlePrint = () => {
    window.print()
  }

  const handleBack = () => {
    navigate('/invoices')
  }

  if (isLoading) return <div>Loading...</div>
  if (!invoice) return <div>Invoice not found</div>

  return (
    <div>
      <div className="mb-6 flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="btn btn-secondary flex items-center gap-2"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Invoice {invoice.invoiceNumber}</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
            invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {invoice.status}
          </span>
          <button
            onClick={handlePrint}
            className="btn btn-primary flex items-center gap-2"
          >
            <PrinterIcon className="h-5 w-5" />
            Print
          </button>
        </div>
      </div>

      <div id="invoice-content" className="print:mx-auto print:max-w-4xl print:p-8 print:bg-white">
        {/* Company Header */}
        <div className="print:mb-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 print:text-4xl">10x Motors Care</h1>
              <p className="text-sm text-gray-600 mt-2">123 Service Road, Downtown Area</p>
              <p className="text-sm text-gray-600">City, State - 12345</p>
              <p className="text-sm text-gray-600">Phone: +91 1234567890 | Email: info@10xmotors.com</p>
              <p className="text-sm text-gray-600 mt-1">GSTIN: XXXXXXXXXXXXXX</p>
            </div>
            <div className="text-right">
              <img src="/logo.webp" alt="10x Motors Care" className="w-24 h-auto" />
            </div>
          </div>
          
          {/* Invoice Info */}
          <div className="flex justify-between items-start border-b-2 border-gray-900 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 print:text-3xl">INVOICE</h2>
              <p className="text-sm text-gray-600 mt-1">Invoice #: {invoice.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Date: {format(new Date(invoice.createdAt), 'MMM dd, yyyy')}</p>
              <p className="text-sm text-gray-600 mt-1">Status: {invoice.status.toUpperCase()}</p>
            </div>
          </div>
        </div>

        {/* Customer and Vehicle Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 print:mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 print:mb-1">Bill To</h3>
            <div className="text-sm">
              <p className="font-medium text-gray-900">{invoice.customer?.name}</p>
              <p className="text-gray-600">{invoice.customer?.phone}</p>
              {invoice.customer?.email && (
                <p className="text-gray-600">{invoice.customer.email}</p>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 print:mb-1">Vehicle Details</h3>
            <div className="text-sm">
              <p className="text-gray-900">{invoice.vehicle?.year} {invoice.vehicle?.make} {invoice.vehicle?.model}</p>
              <p className="text-gray-600">Plate: {invoice.vehicle?.plateNumber}</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6 print:mb-4">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border border-gray-300">Description</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 border border-gray-300">Qty</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 border border-gray-300">Unit Price</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 border border-gray-300">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {invoice.items?.map((item, idx) => (
                <tr key={idx} className="print:break-inside-avoid">
                  <td className="px-4 py-3 text-sm text-gray-900 border border-gray-300">{item.description}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-center border border-gray-300">{item.quantity}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right border border-gray-300">Rs. {item.unitPrice?.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right border border-gray-300">Rs. {item.totalPrice?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan="3" className="px-4 py-3 text-right text-sm font-medium text-gray-900 border border-gray-300">Subtotal</td>
                <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 border border-gray-300">Rs. {invoice.subtotal?.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan="3" className="px-4 py-3 text-right text-sm font-medium text-gray-900 border border-gray-300">Tax</td>
                <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 border border-gray-300">Rs. {invoice.taxAmount?.toFixed(2)}</td>
              </tr>
              <tr className="bg-gray-200">
                <td colSpan="3" className="px-4 py-3 text-right text-base font-bold text-gray-900 border border-gray-300">Total</td>
                <td className="px-4 py-3 text-right text-base font-bold text-gray-900 border border-gray-300">Rs. {invoice.total?.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer */}
        {invoice.notes && (
          <div className="mt-6 print:mt-4 pt-4 border-t border-gray-300">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">Notes</h4>
            <p className="text-sm text-gray-600">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default InvoiceDetail


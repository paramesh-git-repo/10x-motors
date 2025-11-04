import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const RevenueChart = ({ data = [] }) => {
  const formattedData = data.map((item) => ({
    month: new Date(item._id.year, item._id.month - 1).toLocaleDateString('en-US', { month: 'short' }),
    revenue: item.revenue
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
        <Bar dataKey="revenue" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default RevenueChart


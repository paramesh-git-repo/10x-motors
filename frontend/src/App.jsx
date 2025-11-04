import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CustomersList from './pages/customers/CustomersList'
import CustomerDetail from './pages/customers/CustomerDetail'
import ServicesList from './pages/services/ServicesList'
import ServiceDetail from './pages/services/ServiceDetail'
import InvoicesList from './pages/invoices/InvoicesList'
import InvoiceDetail from './pages/invoices/InvoiceDetail'
import RemindersList from './pages/reminders/RemindersList'
import UsersList from './pages/users/UsersList'
import WhatsAppTest from './pages/WhatsAppTest'
import Settings from './pages/Settings'
import EstimationsList from './pages/EstimationsList'

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return user ? children : <Navigate to="/login" />
}

function AppContent() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="customers" element={<CustomersList />} />
        <Route path="customers/:id" element={<CustomerDetail />} />
        <Route path="services" element={<ServicesList />} />
        <Route path="services/:id" element={<ServiceDetail />} />
        <Route path="estimations" element={<EstimationsList />} />
        <Route path="invoices" element={<InvoicesList />} />
        <Route path="invoices/:id" element={<InvoiceDetail />} />
        <Route path="reminders" element={<RemindersList />} />
        <Route path="users" element={<UsersList />} />
        <Route path="settings" element={<Settings />} />
        <Route path="whatsapp" element={<WhatsAppTest />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App


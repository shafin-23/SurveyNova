import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyEmail from './pages/VerifyEmail'
import Dashboard from './pages/Dashboard'
import UploadSurvey from './pages/UploadSurvey'
import CreateSurvey from './pages/CreateSurvey'
import History from './pages/History'
import Report from './pages/Report'
import AdminDashboard from './pages/AdminDashboard'
import SubmitFeedback from './pages/SubmitFeedback'
import Account from './pages/Account'
import TakeSurvey from './pages/TakeSurvey'

// Protected Route Wrapper for general auth
const ProtectedRoute = ({ isAuthenticated, isLoading }) => {
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading session...</div>
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}

// Protected Route Wrapper specifically for admins
const AdminRoute = ({ isAuthenticated, userRole, isLoading }) => {
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading session...</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (userRole !== 'admin') return <Navigate to="/dashboard" replace />
  return <Outlet />
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState('user') // 'user' or 'admin'
  const [userDetails, setUserDetails] = useState({ firstName: '', lastName: '', email: '', phone: '' })

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (res.ok) {
          const data = await res.json()
          setUserRole(data.role)
          setUserDetails({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone || ''
          })
          setIsAuthenticated(true)
        } else {
          localStorage.removeItem('token')
        }
      } catch (err) {
        console.error("Session verification failed", err)
      } finally {
        setIsLoading(false)
      }
    }

    verifyToken()
  }, [])

  const handleLogin = (token, role, fName, lName, identifier) => {
    localStorage.setItem('token', token)
    setUserRole(role)
    
    // Check if identifier is an email or phone
    const isEmail = identifier && identifier.includes('@')
    
    setUserDetails({ 
      firstName: fName, 
      lastName: lName,
      email: isEmail ? identifier : '',
      phone: !isEmail ? identifier : ''
    })
    setIsAuthenticated(true)
  }

  const handleUpdateAccount = (updatedDetails) => {
    setUserDetails(prev => ({ ...prev, ...updatedDetails }))
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUserRole('user')
    setUserDetails({ firstName: '', lastName: '', email: '', phone: '' })
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout isAuthenticated={isAuthenticated} userRole={userRole} userDetails={userDetails} onLogout={handleLogout} />}>
          
          {/* Public Routes */}
          <Route index element={<Home isAuthenticated={isAuthenticated} userRole={userRole} />} />
          <Route path="login" element={<Login onLogin={handleLogin} />} />
          <Route path="register" element={<Register />} />
          <Route path="verify-email" element={<VerifyEmail onLogin={handleLogin} />} />
          <Route path="s/:id" element={<TakeSurvey />} />
          
          {/* Protected Routes (Require Login) */}
          <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading} />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="upload" element={<UploadSurvey />} />
            <Route path="create" element={<CreateSurvey />} />
            <Route path="edit/:id" element={<CreateSurvey />} />
            <Route path="history" element={<History />} />
            <Route path="report/:id" element={<Report />} />
            <Route path="feedback" element={<SubmitFeedback />} />
            <Route path="account" element={<Account userDetails={userDetails} userRole={userRole} onUpdate={handleUpdateAccount} />} />
          </Route>

          {/* Admin Routes (Require Admin Role) */}
          <Route element={<AdminRoute isAuthenticated={isAuthenticated} userRole={userRole} isLoading={isLoading} />}>
            <Route path="admin" element={<AdminDashboard />} />
          </Route>

        </Route>
      </Routes>
    </Router>
  )
}

export default App

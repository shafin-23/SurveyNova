import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, LogIn, UserPlus, Upload, FileText, 
  LogOut, Bell, HelpCircle, User, Users, ChevronDown, Menu, X 
} from 'lucide-react'

export default function Navbar({ isAuthenticated, userRole, userDetails, onLogout }) {
  const navigate = useNavigate()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  
  const notificationRef = useRef(null)
  const profileRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLogoutClick = () => {
    setShowProfileMenu(false)
    setIsMobileMenuOpen(false)
    onLogout()
    navigate('/')
  }

  const getInitials = () => {
    if (!userDetails || !userDetails.firstName) return 'U'
    return `${userDetails.firstName[0]}${userDetails.lastName ? userDetails.lastName[0] : ''}`.toUpperCase()
  }

  const fetchNotifications = async () => {
    if (!isAuthenticated) return
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [isAuthenticated])

  const handleNotificationClick = async (notif) => {
    if (notif.surveyId) {
      navigate(`/report/${notif.surveyId}`)
      setShowNotifications(false)
    }
    if (!notif.read) {
      try {
        const token = localStorage.getItem('token')
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/notifications/${notif.id}/read`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        fetchNotifications() // Refresh to clear the badge
      } catch (err) {
        console.error(err)
      }
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length


  return (
    <nav className="glass-effect shadow-sm border-b sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo & Main Links */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2 z-50">
              <div className="bg-indigo-600 text-white p-2 rounded-lg">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight hidden sm:block">SurveyNova</span>
            </Link>
            
            {/* Desktop Navigation Links */}
            {isAuthenticated && (
              <div className="hidden md:flex space-x-4">
                {userRole === 'admin' ? (
                  <Link to="/admin" className="text-gray-600 hover:text-indigo-600 flex items-center space-x-1 px-3 py-2 rounded-md font-medium transition-colors">
                    <LayoutDashboard className="w-4 h-4" /> <span>Admin Dashboard</span>
                  </Link>
                ) : (
                  <>
                    <Link to="/dashboard" className="text-gray-600 hover:text-indigo-600 flex items-center space-x-1 px-3 py-2 rounded-md font-medium transition-colors">
                      <LayoutDashboard className="w-4 h-4" /> <span>Dashboard</span>
                    </Link>
                    <Link to="/upload" className="text-gray-600 hover:text-indigo-600 flex items-center space-x-1 px-3 py-2 rounded-md font-medium transition-colors">
                      <Upload className="w-4 h-4" /> <span>Upload</span>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
          
          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-1 sm:space-x-3">
                
                {/* Help Option (Hidden on very small screens) */}
                <Link to="/feedback" className="hidden sm:flex text-gray-500 hover:text-indigo-600 p-2 rounded-full hover:bg-gray-50 transition-colors" title="Help & Feedback">
                  <HelpCircle className="w-5 h-5" />
                </Link>

                {/* Notifications Bell */}
                <div className="relative" ref={notificationRef}>
                  <button 
                    onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false) }}
                    className="text-gray-500 hover:text-indigo-600 p-2 rounded-full hover:bg-gray-50 transition-colors relative focus:outline-none"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                      </span>
                    )}
                  </button>
                  
                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 max-h-96 overflow-y-auto">
                      <div className="px-4 py-2 border-b border-gray-50 flex justify-between items-center">
                        <span className="font-bold text-gray-900">Notifications</span>
                        {unreadCount > 0 && <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">{unreadCount} new</span>}
                      </div>
                      
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-gray-500 text-sm">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map(notif => (
                          <div 
                            key={notif.id} 
                            onClick={() => handleNotificationClick(notif)}
                            className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-50 cursor-pointer transition-colors ${!notif.read ? 'bg-indigo-50/30' : ''}`}
                          >
                            <div className="flex justify-between items-start">
                              <p className={`text-sm ${!notif.read ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>{notif.message}</p>
                              {!notif.read && <span className="h-2 w-2 bg-indigo-500 rounded-full flex-shrink-0 mt-1.5 ml-2"></span>}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : 'Just now'}
                            </p>
                          </div>
                        ))
                      )}
                      
                      {notifications.length > 0 && (
                        <div className="px-4 py-2 text-center text-sm text-indigo-600 font-medium cursor-pointer hover:text-indigo-800">
                          Mark all as read
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* User Profile Dropdown */}
                <div className="relative ml-1 sm:ml-2" ref={profileRef}>
                  <button 
                    onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false) }}
                    className="flex items-center space-x-1 sm:space-x-2 focus:outline-none p-1 rounded-full hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm text-sm sm:text-base">
                      {getInitials()}
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
                  </button>

                  {/* Profile Menu Dropdown */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      <div className="px-4 py-3 border-b border-gray-50">
                        <p className="text-sm font-medium text-gray-900 truncate">{userDetails?.firstName} {userDetails?.lastName}</p>
                        <p className="text-xs text-gray-500 capitalize">{userRole} Account</p>
                      </div>
                      
                      <div className="py-1">
                        <Link to="/account" onClick={() => setShowProfileMenu(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600">
                          <User className="w-4 h-4 mr-2" /> My Account
                        </Link>
                        <Link to="/contacts" onClick={() => setShowProfileMenu(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600">
                          <Users className="w-4 h-4 mr-2" /> Contacts
                        </Link>
                      </div>
                      
                      <div className="py-1 border-t border-gray-50">
                        <button onClick={handleLogoutClick} className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors">
                          <LogOut className="w-4 h-4 mr-2" /> Log out
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile Menu Toggle Button */}
                <button 
                  className="md:hidden ml-2 p-2 rounded-md text-gray-500 hover:text-indigo-600 hover:bg-gray-50 focus:outline-none"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>

              </div>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-indigo-600 flex items-center space-x-1 px-2 sm:px-3 py-2 font-medium transition-colors text-sm sm:text-base">
                  <LogIn className="w-4 h-4 hidden sm:block" /> <span>Log in</span>
                </Link>
                <Link to="/register" className="bg-indigo-600 text-white hover:bg-indigo-700 flex items-center space-x-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md font-medium transition-all shadow-sm hover:shadow text-sm sm:text-base">
                  <UserPlus className="w-4 h-4 hidden sm:block" /> <span>Sign up</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu Dropdown */}
      {isAuthenticated && isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-inner px-4 py-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
          {userRole === 'admin' ? (
            <Link 
              to="/admin" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 flex items-center"
            >
              <LayoutDashboard className="w-5 h-5 mr-3 text-gray-400" /> Admin Dashboard
            </Link>
          ) : (
            <>
              <Link 
                to="/dashboard" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 flex items-center"
              >
                <LayoutDashboard className="w-5 h-5 mr-3 text-gray-400" /> Dashboard
              </Link>
              <Link 
                to="/upload" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 flex items-center"
              >
                <Upload className="w-5 h-5 mr-3 text-gray-400" /> Upload Survey
              </Link>
              <Link 
                to="/feedback" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 flex items-center"
              >
                <HelpCircle className="w-5 h-5 mr-3 text-gray-400" /> Help & Feedback
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

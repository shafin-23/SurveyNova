import { useState, useEffect } from 'react'
import { User, Mail, Phone, Lock, Save, AlertCircle } from 'lucide-react'

export default function Account({ userDetails, userRole, onUpdate }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })
  const [isSaved, setIsSaved] = useState(false)

  // Initialize form with user details when component mounts or userDetails change
  useEffect(() => {
    if (userDetails) {
      setFormData({
        firstName: userDetails.firstName || '',
        lastName: userDetails.lastName || '',
        email: userDetails.email || '',
        phone: userDetails.phone || ''
      })
    }
  }, [userDetails])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setIsSaved(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone
        })
      })
      
      if (res.ok) {
        const updatedUser = await res.json()
        // Update global state
        onUpdate({
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          phone: updatedUser.phone
        })
        // Show success message
        setIsSaved(true)
        setTimeout(() => setIsSaved(false), 3000)
      } else {
        alert("Failed to update profile.")
      }
    } catch (err) {
      console.error(err)
      alert("Error connecting to server.")
    }
  }

  return (
    <div className="flex-grow bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
            <p className="text-gray-500 mt-1">Manage your personal information and security.</p>
          </div>
          <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold capitalize">
            {userRole} Role
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header Profile Section */}
          <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white flex items-center space-x-6">
            <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-md">
              {formData.firstName?.[0] || 'U'}{formData.lastName?.[0] || ''}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {formData.firstName} {formData.lastName}
              </h2>
              <p className="text-gray-500">{formData.email}</p>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-indigo-500" /> Personal Information
                </h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                    <input 
                      type="text" 
                      name="firstName" 
                      id="firstName" 
                      value={formData.firstName}
                      onChange={handleChange}
                      className="mt-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-md focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 outline-none" 
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input 
                      type="text" 
                      name="lastName" 
                      id="lastName" 
                      value={formData.lastName}
                      onChange={handleChange}
                      className="mt-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-md focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 outline-none" 
                    />
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-indigo-500" /> Contact Details
                </h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input 
                      type="email" 
                      name="email" 
                      id="email" 
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-md focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 outline-none" 
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-4 w-4 text-gray-400" />
                      </div>
                      <input 
                        type="tel" 
                        name="phone" 
                        id="phone" 
                        value={formData.phone}
                        onChange={handleChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 rounded-md focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5 outline-none" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Security */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Lock className="w-5 h-5 mr-2 text-indigo-500" /> Security
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between border border-gray-200">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Password</p>
                    <p className="text-sm text-gray-500">Change your password to keep your account secure.</p>
                  </div>
                  <button type="button" className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors text-sm font-medium shadow-sm">
                    Change Password
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 flex items-center justify-end">
                {isSaved && (
                  <span className="text-green-600 font-medium mr-4 flex items-center animate-in fade-in duration-300">
                    <Save className="w-4 h-4 mr-1" /> Changes Saved!
                  </span>
                )}
                <button 
                  type="submit" 
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-md hover:bg-indigo-700 transition-colors font-medium flex items-center shadow-sm"
                >
                  Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

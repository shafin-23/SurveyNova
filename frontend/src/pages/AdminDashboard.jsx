import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, AlertTriangle, Lightbulb, CheckCircle } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, openReports: 0, featureRequests: 0 })
  const [feedbackList, setFeedbackList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/dashboard`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setStats(data.stats)
          setFeedbackList(data.feedback)
        }
      } catch (err) {
        console.error("Failed to fetch admin dashboard data")
      } finally {
        setLoading(false)
      }
    }
    fetchAdminData()
  }, [])

  return (
    <div className="flex-grow bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center">
          <div className="bg-red-100 p-3 rounded-xl mr-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Control Panel</h1>
            <p className="text-gray-500 mt-1">Review user feedback, bug reports, and platform health.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-medium text-gray-500 mb-1">Open Reports</h3>
            <p className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.openReports}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-medium text-gray-500 mb-1">Feature Requests</h3>
            <p className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.featureRequests}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-medium text-gray-500 mb-1">Total Users</h3>
            <p className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.totalUsers}</p>
          </div>
        </div>

        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent User Feedback</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {feedbackList.length === 0 && !loading && (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No feedback submitted yet.
                    </td>
                  </tr>
                )}
                {feedbackList.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {item.type === 'Bug Report' && <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />}
                        {item.type === 'Feature Request' && <Lightbulb className="w-4 h-4 text-amber-500 mr-2" />}
                        {item.type === 'General Feedback' && <MessageSquare className="w-4 h-4 text-blue-500 mr-2" />}
                        <span className="text-sm font-medium text-gray-900">{item.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.user}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-gray-500 truncate max-w-xs">{item.message}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${item.status === 'Open' ? 'bg-red-100 text-red-800' : 
                          item.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-green-100 text-green-800'}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

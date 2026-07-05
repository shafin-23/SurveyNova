import { Link } from 'react-router-dom'
import { Clock, FileText, Download, Play } from 'lucide-react'

export default function History() {
  const historyData = [
    { id: '1', title: 'Customer Satisfaction Q3', date: 'Oct 12, 2026', type: 'Native Survey', status: 'Analyzed' },
    { id: 'upload-2', title: 'Historical_Data_2025.csv', date: 'Oct 05, 2026', type: 'CSV Upload', status: 'Analyzed' },
    { id: '3', title: 'Employee Feedback', date: 'Sep 28, 2026', type: 'Native Survey', status: 'Pending' },
  ]

  return (
    <div className="flex-grow bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center">
          <Clock className="w-8 h-8 text-indigo-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Survey History</h1>
            <p className="text-gray-500 mt-1">Review your past surveys and uploaded datasets.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historyData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3" />
                        <div className="text-sm font-medium text-gray-900">{item.title}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{item.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.type === 'Native Survey' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'Analyzed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {item.status === 'Pending' ? (
                          <button className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-2 rounded-md hover:bg-indigo-100 transition-colors" title="Run Analysis">
                            <Play className="w-4 h-4" />
                          </button>
                        ) : (
                          <Link to={`/report/${item.id}`} className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-2 rounded-md hover:bg-indigo-100 transition-colors" title="View Report">
                            <BarChart2 className="w-4 h-4" />
                          </Link>
                        )}
                        <button className="text-gray-600 hover:text-gray-900 bg-gray-50 p-2 rounded-md hover:bg-gray-100 transition-colors" title="Download CSV">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
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
// BarChart2 is needed for the Link icon
import { BarChart2 } from 'lucide-react'

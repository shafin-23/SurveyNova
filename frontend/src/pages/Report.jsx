import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Download, Share2, BarChart2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Report() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [surveyResults, setSurveyResults] = useState(null)

  const fetchReport = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/surveys/${id}/report`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setSurveyResults(data)
      } else {
        console.error("Failed to fetch report")
      }
    } catch (err) {
      console.error("Error connecting to server")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [id])

  const handleDownloadPDF = () => {
    // We use the browser's native print-to-PDF which perfectly captures SVGs (Recharts)
    // and keeps the text selectable!
    window.print();
  }

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`${surveyResults.title} - Analysis Report`);
    const body = encodeURIComponent(`I thought you might be interested in the analysis report for "${surveyResults.title}".\n\nYou can view it here:\n${window.location.href}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="animate-spin mx-auto h-12 w-12 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <p className="text-lg text-gray-600 font-medium">Running T5 Model Analysis...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-grow bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between print:hidden">
          <div>
            <Link to="/dashboard" className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm font-medium mb-2 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
            </Link>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button 
              onClick={handleShareEmail}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors font-medium flex items-center shadow-sm"
            >
              <Share2 className="w-4 h-4 mr-2" /> Share
            </button>
            <button 
              onClick={handleDownloadPDF}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors font-medium flex items-center shadow-sm"
            >
              <Download className="w-4 h-4 mr-2" /> Download PDF
            </button>
          </div>
        </div>

        <div id="pdf-report-container" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-gray-50 p-4 rounded-xl print:bg-white print:p-0">
          
          {/* Header for PDF */}
          <div className="mb-4 hidden print:block">
            <h1 className="text-3xl font-bold text-gray-900">{surveyResults.title} Report</h1>
            <p className="text-gray-500 mt-1">Analysis generated successfully • {surveyResults.statistics.total_responses} Responses</p>
          </div>
          
          {/* Header for Screen */}
          <div className="mb-4 print:hidden">
            <h1 className="text-3xl font-bold text-gray-900">{surveyResults.title} Report</h1>
            <p className="text-gray-500 mt-1">Analysis generated successfully • {surveyResults.statistics.total_responses} Responses</p>
          </div>
          
          {/* T5 Summary Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-lg p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <svg className="w-48 h-48 -mt-10 -mr-10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <h2 className="text-2xl font-bold mb-4 relative z-10 flex items-center">
              <span className="bg-white text-indigo-600 text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full mr-3">T5 Model</span>
              AI Executive Summary
            </h2>
            <p className="text-lg leading-relaxed relative z-10 text-indigo-50">
              {surveyResults.summary}
            </p>
            {surveyResults.summary && surveyResults.summary.includes('waking up') && (
              <button 
                onClick={fetchReport}
                className="mt-6 relative z-10 bg-white text-indigo-700 font-bold py-2 px-6 rounded-lg shadow hover:bg-indigo-50 transition-colors"
              >
                Analyze Again
              </button>
            )}
          </div>

          {/* Statistics Dashboard */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Detailed Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Dynamic Chart Area */}
              {surveyResults.statistics.questions.length === 0 && (
                <div className="col-span-1 md:col-span-2 text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <BarChart2 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No multiple choice data available for visualization.</p>
                </div>
              )}
              
              {surveyResults.statistics.questions.map((q, idx) => {
                // Convert distribution object to array for Recharts
                const chartData = Object.keys(q.distribution || {}).map(key => ({
                  name: key,
                  votes: q.distribution[key]
                }))

                return (
                  <div key={idx} className="border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow bg-white">
                    <h3 className="font-medium text-gray-900 mb-6 truncate" title={q.question}>{q.question}</h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                          <Tooltip 
                            cursor={{ fill: '#f3f4f6' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                          />
                          <Bar dataKey="votes" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={50} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )
              })}

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

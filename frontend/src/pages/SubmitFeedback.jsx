import { useState } from 'react'
import { MessageSquare, AlertTriangle, Lightbulb, Send } from 'lucide-react'

export default function SubmitFeedback() {
  const [type, setType] = useState('feature')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      
      let typeText = 'General Feedback'
      if (type === 'feature') typeText = 'Feature Request'
      if (type === 'bug') typeText = 'Bug Report'

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type: typeText, subject, message })
      })

      if (res.ok) {
        setSubmitted(true)
        setSubject('')
        setMessage('')
      } else {
        alert("Failed to submit feedback.")
      }
    } catch (err) {
      alert("Error submitting feedback.")
    }
  }

  if (submitted) {
    return (
      <div className="flex-grow flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-green-200 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted</h2>
          <p className="text-gray-600 mb-6">Thank you for your feedback! Our admins will review this shortly.</p>
          <button onClick={() => setSubmitted(false)} className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
            Submit another report
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-grow bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="max-w-2xl w-full">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Help & Feedback</h1>
          <p className="text-gray-500 mt-2">Found a bug or have a suggestion? Let our admins know!</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Report Type</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <button type="button" onClick={() => setType('feature')} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-colors ${type === 'feature' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-indigo-300 text-gray-600'}`}>
                  <Lightbulb className={`w-6 h-6 mb-2 ${type === 'feature' ? 'text-indigo-600' : 'text-gray-400'}`} />
                  <span className="font-medium text-sm">Feature Request</span>
                </button>
                
                <button type="button" onClick={() => setType('bug')} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-colors ${type === 'bug' ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-200 hover:border-red-300 text-gray-600'}`}>
                  <AlertTriangle className={`w-6 h-6 mb-2 ${type === 'bug' ? 'text-red-600' : 'text-gray-400'}`} />
                  <span className="font-medium text-sm">Bug Report</span>
                </button>
                
                <button type="button" onClick={() => setType('general')} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-colors ${type === 'general' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300 text-gray-600'}`}>
                  <MessageSquare className={`w-6 h-6 mb-2 ${type === 'general' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="font-medium text-sm">General Feedback</span>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input 
                type="text" 
                id="subject" 
                required 
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-3 outline-none" 
                placeholder="Briefly describe the issue or suggestion" 
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Details</label>
              <textarea 
                id="message" 
                rows="5" 
                required 
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-3 outline-none resize-none" 
                placeholder="Provide as much detail as possible..." 
              ></textarea>
            </div>

            <button type="submit" className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-colors">
              <Send className="w-4 h-4 mr-2" /> Submit Report to Admin
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

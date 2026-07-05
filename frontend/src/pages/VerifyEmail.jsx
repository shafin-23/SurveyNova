import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Mail, AlertCircle } from 'lucide-react'

export default function VerifyEmail({ onLogin }) {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Safely get state or redirect if someone visits /verify-email directly
  const userId = location.state?.userId
  const email = location.state?.email
  
  if (!userId) {
    navigate('/register')
    return null
  }

  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code })
      })

      const data = await res.json()

      if (res.ok) {
        onLogin(data.token, 'user', data.firstName, data.lastName, data.email || data.phone)
        navigate('/dashboard')
      } else {
        setError(data.message || 'Invalid code')
      }
    } catch (err) {
      setError('Unable to connect to the server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-grow flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100 text-center">
        <div className="flex justify-center">
          <div className="bg-indigo-100 p-4 rounded-full">
            <Mail className="w-10 h-10 text-indigo-600" />
          </div>
        </div>
        <div>
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
            Verify Email
          </h2>
        </div>
        <div className="mt-8 space-y-6">
          <p className="text-center text-sm text-gray-600">
            We've sent a 6-digit verification code to <span className="font-semibold text-gray-900">{email}</span>.
          </p>
          <p className="text-center text-xs text-amber-600 bg-amber-50 p-2 rounded-md border border-amber-100">
            Note: If you don't see the email in your Inbox, please check your <strong>Spam</strong> or <strong>Junk</strong> folder!
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center text-sm">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="code" className="sr-only">Verification Code</label>
            <input 
              id="code" 
              name="code" 
              type="text" 
              required 
              maxLength="6"
              className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-lg text-center tracking-widest" 
              placeholder="123456" 
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} // only numbers
            />
          </div>

          <div>
            <button 
              disabled={loading || code.length !== 6} 
              type="submit" 
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

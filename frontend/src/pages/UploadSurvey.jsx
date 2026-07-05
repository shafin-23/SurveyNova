import { useState } from 'react'
import { UploadCloud, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function UploadSurvey() {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const navigate = useNavigate()

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (selectedFile) => {
    const validTypes = ["text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.csv') && !selectedFile.name.endsWith('.xlsx')) {
      alert("Please upload a valid CSV or Excel (.xlsx) file.")
      return
    }
    setFile(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) return
    setIsUploading(true)
    
    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/surveys/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type, fetch sets it automatically with the boundary for FormData
        },
        body: formData
      })

      const data = await res.json()
      if (res.ok) {
        navigate(`/report/${data.surveyId}`)
      } else {
        alert(data.message || "Failed to process file.")
        setIsUploading(false)
      }
    } catch (err) {
      console.error(err)
      alert("Error uploading file.")
      setIsUploading(false)
    }
  }

  return (
    <div className="flex-grow bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="max-w-3xl w-full text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Upload Survey Data</h1>
        <p className="mt-4 text-lg text-gray-600">
          Already have responses from another platform? Upload your CSV file here and our T5 model will generate insights immediately.
        </p>
      </div>

      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        {!file ? (
          <div 
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <UploadCloud className={`mx-auto h-16 w-16 mb-4 ${dragActive ? 'text-indigo-500' : 'text-gray-400'}`} />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Drag and drop your CSV or Excel file here</h3>
            <p className="text-sm text-gray-500 mb-6">or click to browse from your computer</p>
            
            <label className="cursor-pointer bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
              <span>Select File</span>
              <input type="file" className="sr-only" accept=".csv, .xlsx" onChange={handleChange} />
            </label>
          </div>
        ) : (
          <div className="border border-green-200 bg-green-50 rounded-xl p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <button onClick={() => setFile(null)} className="text-sm text-green-700 font-medium hover:text-green-800">Change File</button>
            </div>
            <FileText className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">{file.name}</h3>
            <p className="text-sm text-green-600 font-medium mb-6 flex justify-center items-center">
              <CheckCircle className="w-4 h-4 mr-1" /> Ready for analysis
            </p>
            
            <button 
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white rounded-md shadow-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-70 flex justify-center items-center mx-auto"
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Processing with T5 Model...
                </>
              ) : (
                'Run Analysis Now'
              )}
            </button>
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <strong>Formatting Tip:</strong> Ensure your CSV has a header row with the question titles. Each subsequent row should represent a single respondent's answers.
          </div>
        </div>
      </div>
    </div>
  )
}

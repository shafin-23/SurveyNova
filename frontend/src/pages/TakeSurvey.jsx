import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

const THEMES = {
  emerald: {
    bgLight: 'bg-emerald-100', textMain: 'text-emerald-600', textDark: 'text-emerald-700', bgMain: 'bg-emerald-600', bgHover: 'hover:bg-emerald-700', borderMain: 'border-emerald-600', borderLeft: 'border-l-emerald-500', focusRing: 'focus:ring-emerald-500', focusBorder: 'focus:border-emerald-600', bgHoverLight: 'hover:bg-emerald-50'
  },
  blue: {
    bgLight: 'bg-blue-100', textMain: 'text-blue-600', textDark: 'text-blue-700', bgMain: 'bg-blue-600', bgHover: 'hover:bg-blue-700', borderMain: 'border-blue-600', borderLeft: 'border-l-blue-500', focusRing: 'focus:ring-blue-500', focusBorder: 'focus:border-blue-600', bgHoverLight: 'hover:bg-blue-50'
  },
  purple: {
    bgLight: 'bg-purple-100', textMain: 'text-purple-600', textDark: 'text-purple-700', bgMain: 'bg-purple-600', bgHover: 'hover:bg-purple-700', borderMain: 'border-purple-600', borderLeft: 'border-l-purple-500', focusRing: 'focus:ring-purple-500', focusBorder: 'focus:border-purple-600', bgHoverLight: 'hover:bg-purple-50'
  },
  rose: {
    bgLight: 'bg-rose-100', textMain: 'text-rose-600', textDark: 'text-rose-700', bgMain: 'bg-rose-600', bgHover: 'hover:bg-rose-700', borderMain: 'border-rose-600', borderLeft: 'border-l-rose-500', focusRing: 'focus:ring-rose-500', focusBorder: 'focus:border-rose-600', bgHoverLight: 'hover:bg-rose-50'
  },
  amber: {
    bgLight: 'bg-amber-100', textMain: 'text-amber-600', textDark: 'text-amber-700', bgMain: 'bg-amber-500', bgHover: 'hover:bg-amber-600', borderMain: 'border-amber-500', borderLeft: 'border-l-amber-400', focusRing: 'focus:ring-amber-500', focusBorder: 'focus:border-amber-500', bgHoverLight: 'hover:bg-amber-50'
  }
}

export default function TakeSurvey() {
  const { id } = useParams()
  const [survey, setSurvey] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [answers, setAnswers] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  
  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/surveys/public/${id}`)
        if (res.ok) {
          const data = await res.json()
          setSurvey(data)
        } else {
          setError('Survey not found or is no longer available.')
        }
      } catch (err) {
        setError('Error connecting to the server.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchSurvey()
  }, [id])

  const handleAnswerChange = (questionId, value, isCheckbox = false) => {
    if (isCheckbox) {
      setAnswers(prev => {
        const currentArr = prev[questionId] || []
        if (currentArr.includes(value)) {
          return { ...prev, [questionId]: currentArr.filter(v => v !== value) }
        } else {
          return { ...prev, [questionId]: [...currentArr, value] }
        }
      })
    } else {
      setAnswers(prev => ({ ...prev, [questionId]: value }))
    }
  }

  const handleSubmit = async () => {
    // Validate Required Questions
    const questionBlocks = survey.blocks.filter(b => b.blockType === 'question')
    for (const q of questionBlocks) {
      if (q.isRequired) {
        const ans = answers[q.id]
        if (!ans || (Array.isArray(ans) && ans.length === 0)) {
          alert(`Please answer the required question: "${q.text || 'Untitled Question'}"`)
          return
        }
      }
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/surveys/${id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      })

      if (res.ok) {
        setIsSubmitted(true)
      } else {
        alert("Failed to submit response.")
      }
    } catch (err) {
      alert("Error submitting response.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return ''
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`
    }
    return ''
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-500">Loading survey...</p></div>
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-red-500">{error}</p></div>
  }

  if (isSubmitted) {
    const t = THEMES[survey.themeColor || 'emerald']
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gray-50`}>
        <div className="bg-white p-10 rounded-lg shadow-sm border border-gray-200 max-w-lg w-full text-center relative overflow-hidden">
          <div className={`h-2.5 w-full ${t.bgMain} absolute top-0 left-0 right-0`}></div>
          <h2 className="text-2xl font-normal text-gray-900 mb-4 mt-2">Thank you!</h2>
          <p className="text-gray-600 mb-8">Your response has been recorded.</p>
          <button onClick={() => window.location.reload()} className={`text-sm font-medium ${t.textMain} hover:underline`}>
            Submit another response
          </button>
        </div>
      </div>
    )
  }

  const t = THEMES[survey.themeColor || 'emerald']
  const bgStyles = { emerald: '#ecfdf5', blue: '#eff6ff', purple: '#faf5ff', rose: '#fff1f2', amber: '#fffbeb' }
  const bgStyle = bgStyles[survey.themeColor || 'emerald']

  return (
    <div className={`min-h-screen flex flex-col items-center py-12 px-4`} style={{ backgroundColor: bgStyle }}>
      <div className="w-full max-w-3xl space-y-4">
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative`}>
          <div className={`h-2.5 w-full ${t.bgMain} absolute top-0 left-0 right-0`}></div>
          <div className="p-8 pt-10">
             <h1 className="text-3xl font-normal text-gray-900 mb-2" dangerouslySetInnerHTML={{ __html: survey.title }}></h1>
             {survey.description && <div className="text-sm text-gray-600 mt-2" dangerouslySetInnerHTML={{ __html: survey.description }}></div>}
             <div className="text-sm text-red-500 mt-4">* Indicates required question</div>
          </div>
        </div>
        
        {survey.blocks?.map(block => (
          <div key={block.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
             {block.blockType === 'text' && (
               <>
                 <h2 className="text-xl font-normal text-gray-900 mb-2">{block.title}</h2>
                 <p className="text-sm text-gray-600">{block.description}</p>
               </>
             )}
             {block.blockType === 'section' && (
               <>
                 <div className={`h-1.5 w-full ${t.bgMain} rounded-t-lg -mt-8 -mx-8 mb-8 relative`} style={{ width: 'calc(100% + 64px)'}}></div>
                 <h2 className="text-2xl font-normal text-gray-900 mb-2">{block.title}</h2>
                 <p className="text-sm text-gray-600">{block.description}</p>
               </>
             )}
             {block.blockType === 'image' && (
               <>
                 {block.title && <h2 className="text-base text-gray-900 mb-4">{block.title}</h2>}
                 {block.imageUrl && <img src={block.imageUrl} alt="Survey Image" className="max-w-full rounded border border-gray-200" />}
               </>
             )}
             {block.blockType === 'video' && (
               <>
                 {block.title && <h2 className="text-base text-gray-900 mb-4">{block.title}</h2>}
                 {block.videoUrl && getYouTubeEmbedUrl(block.videoUrl) && (
                    <div className="aspect-w-16 aspect-h-9 w-full max-w-2xl mx-auto rounded overflow-hidden border border-gray-200">
                       <iframe width="100%" height="315" src={getYouTubeEmbedUrl(block.videoUrl)} title="YouTube video player" frameBorder="0" allowFullScreen></iframe>
                    </div>
                 )}
               </>
             )}
             {block.blockType === 'question' && (
               <>
                 <h2 className="text-base text-gray-900 mb-6">
                   {block.text || 'Untitled Question'}
                   {block.isRequired && <span className="text-red-500 ml-1">*</span>}
                 </h2>
                 
                 {['text', 'paragraph'].includes(block.type) && (
                    <input 
                      type="text"
                      value={answers[block.id] || ''}
                      onChange={(e) => handleAnswerChange(block.id, e.target.value)}
                      placeholder="Your answer" 
                      className={`w-1/2 border-0 border-b border-gray-300 focus:ring-0 ${t.focusBorder} bg-transparent px-0 py-1 transition-colors outline-none`}
                    />
                 )}
                 
                 {['multiple_choice', 'checkbox'].includes(block.type) && (
                   <div className="space-y-4">
                     {block.options?.map((opt, i) => (
                       <label key={i} className="flex items-center cursor-pointer group w-fit">
                         <input 
                           type={block.type === 'checkbox' ? 'checkbox' : 'radio'} 
                           name={`question-${block.id}`}
                           value={opt}
                           checked={block.type === 'checkbox' ? (answers[block.id] || []).includes(opt) : answers[block.id] === opt}
                           onChange={(e) => handleAnswerChange(block.id, opt, block.type === 'checkbox')}
                           className={`w-4 h-4 text-gray-600 border-gray-300 ${t.focusRing} cursor-pointer`} 
                         />
                         <span className="ml-3 text-sm text-gray-800">{opt}</span>
                       </label>
                     ))}
                   </div>
                 )}

                 {block.type === 'dropdown' && (
                   <select 
                     value={answers[block.id] || ''}
                     onChange={(e) => handleAnswerChange(block.id, e.target.value)}
                     className={`w-1/2 bg-white border border-gray-300 text-gray-700 rounded-md p-3 ${t.focusRing} ${t.focusBorder} cursor-pointer outline-none`}
                   >
                     <option value="">Choose</option>
                     {block.options?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                   </select>
                 )}

                 {block.type === 'rating' && (
                   <div className="flex space-x-6 items-center">
                     <span className="text-sm text-gray-500">1</span>
                     {[1,2,3,4,5].map(n => (
                       <label key={n} className="flex flex-col items-center cursor-pointer">
                         <span className="text-xs text-gray-400 mb-2">{n}</span>
                         <input 
                           type="radio" 
                           name={`rating-${block.id}`} 
                           value={n}
                           checked={answers[block.id] === String(n)}
                           onChange={(e) => handleAnswerChange(block.id, e.target.value)}
                           className={`w-4 h-4 text-gray-600 border-gray-300 ${t.focusRing} cursor-pointer`} 
                         />
                       </label>
                     ))}
                     <span className="text-sm text-gray-500">5</span>
                   </div>
                 )}
               </>
             )}
          </div>
        ))}
        
        <div className="flex justify-between items-center mt-6">
          <button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className={`${t.bgMain} text-white px-6 py-2 rounded shadow-sm font-medium ${t.bgHover} transition-colors disabled:opacity-50`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
          <span className="text-xs text-gray-500">Never submit passwords through Google Forms clone.</span>
        </div>
      </div>
    </div>
  )
}

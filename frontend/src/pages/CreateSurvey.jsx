import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { 
  Plus, Trash2, Save, X, Bold, Italic, Underline, Link as LinkIcon, 
  Image as ImageIcon, Video, Type, LayoutTemplate, Copy, Eye, Palette, GripHorizontal, ArrowLeft
} from 'lucide-react'

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

export default function CreateSurvey() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  
  const queryParams = new URLSearchParams(location.search)
  const templateId = queryParams.get('template')
  
  const [activeTab, setActiveTab] = useState('Questions')
  const [title, setTitle] = useState('Untitled form')
  const [description, setDescription] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [activeBlockId, setActiveBlockId] = useState('title')
  const [showPreview, setShowPreview] = useState(false)
  
  const [themeColor, setThemeColor] = useState('emerald')
  const [blocks, setBlocks] = useState([
    { id: 1, blockType: 'question', text: 'Untitled Question', type: 'multiple_choice', options: ['Option 1'] }
  ])

  useEffect(() => {
    if (id) {
      const fetchSurvey = async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/surveys/public/${id}`)
          if (res.ok) {
            const data = await res.json()
            setTitle(data.title)
            setDescription(data.description)
            setExpiryDate(data.expiryDate || '')
            setThemeColor(data.themeColor || 'emerald')
            if (data.blocks && data.blocks.length > 0) {
              setBlocks(data.blocks)
            }
          }
        } catch (err) {
          console.error("Failed to fetch survey for editing")
        }
      }
      fetchSurvey()
    } else if (templateId) {
      // Pre-populate templates based on ID
      if (templateId === '1') {
        setTitle('Parent Engagement Survey')
        setDescription("Ask parents how engaged they are in their child's education.")
        setBlocks([
          { id: 1, blockType: 'question', text: 'How often do you communicate with your child\'s teachers?', type: 'multiple_choice', options: ['Weekly', 'Monthly', 'Rarely', 'Never'], isRequired: true },
          { id: 2, blockType: 'question', text: 'Do you feel welcome at your child\'s school?', type: 'multiple_choice', options: ['Yes, always', 'Sometimes', 'No'], isRequired: true },
          { id: 3, blockType: 'question', text: 'What could the school do to improve parent engagement?', type: 'paragraph', options: [], isRequired: false },
        ])
      } else if (templateId === '2') {
        setTitle('Volunteer Feedback Survey')
        setDescription('Ask volunteers how it was working with you.')
        setBlocks([
          { id: 1, blockType: 'question', text: 'How satisfied were you with the volunteer experience?', type: 'multiple_choice', options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied'], isRequired: true },
          { id: 2, blockType: 'question', text: 'Did you feel adequately trained for your tasks?', type: 'multiple_choice', options: ['Yes', 'No', 'Somewhat'], isRequired: true },
          { id: 3, blockType: 'question', text: 'Any additional comments or feedback?', type: 'paragraph', options: [], isRequired: false },
        ])
      } else if (templateId === '3') {
        setTitle('Meeting Feedback Survey')
        setDescription('Gather feedback from people who attended your meeting.')
        setBlocks([
          { id: 1, blockType: 'question', text: 'Was the meeting agenda clear and focused?', type: 'multiple_choice', options: ['Yes', 'No', 'Somewhat'], isRequired: true },
          { id: 2, blockType: 'question', text: 'Was the length of the meeting appropriate?', type: 'multiple_choice', options: ['Too short', 'Just right', 'Too long'], isRequired: true },
          { id: 3, blockType: 'question', text: 'What could make future meetings more productive?', type: 'paragraph', options: [], isRequired: false },
        ])
      }
    }
  }, [id, templateId])

  const t = THEMES[themeColor]

  const themeColors = ['emerald', 'blue', 'purple', 'rose', 'amber']
  
  const toggleTheme = () => {
    const currentIndex = themeColors.indexOf(themeColor)
    const nextIndex = (currentIndex + 1) % themeColors.length
    setThemeColor(themeColors[nextIndex])
  }

  const addBlock = (blockType) => {
    const newId = Date.now()
    let newBlock = { id: newId, blockType }
    
    if (blockType === 'question') {
      newBlock = { ...newBlock, text: '', type: 'multiple_choice', options: ['Option 1'], isRequired: false }
    } else if (blockType === 'text') {
      newBlock = { ...newBlock, title: 'Untitled Title', description: '' }
    } else if (blockType === 'image') {
      newBlock = { ...newBlock, title: '', imageUrl: '' }
    } else if (blockType === 'video') {
      newBlock = { ...newBlock, title: '', videoUrl: '' }
    } else if (blockType === 'section') {
      newBlock = { ...newBlock, title: 'Untitled Section', description: '' }
    }

    setBlocks([...blocks, newBlock])
    setActiveBlockId(newId)
  }

  const removeBlock = (id) => {
    setBlocks(blocks.filter(b => b.id !== id))
  }

  const duplicateBlock = (id) => {
    const index = blocks.findIndex(b => b.id === id)
    if (index > -1) {
      const original = blocks[index]
      const cloned = JSON.parse(JSON.stringify(original))
      cloned.id = Date.now()
      
      const newBlocks = [...blocks]
      newBlocks.splice(index + 1, 0, cloned)
      setBlocks(newBlocks)
      setActiveBlockId(cloned.id)
    }
  }

  const updateBlock = (id, field, value) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, [field]: value } : b))
  }

  const addOption = (blockId) => {
    setBlocks(blocks.map(b => {
      if (b.id === blockId) {
        return { ...b, options: [...(b.options || []), `Option ${(b.options?.length || 0) + 1}`] }
      }
      return b
    }))
  }

  const updateOption = (blockId, optionIndex, value) => {
    setBlocks(blocks.map(b => {
      if (b.id === blockId) {
        const newOptions = [...b.options]
        newOptions[optionIndex] = value
        return { ...b, options: newOptions }
      }
      return b
    }))
  }

  const removeOption = (blockId, optionIndex) => {
    setBlocks(blocks.map(b => {
      if (b.id === blockId) {
        return { ...b, options: b.options.filter((_, idx) => idx !== optionIndex) }
      }
      return b
    }))
  }

  const handleImageUpload = (e, blockId) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image must be less than 2MB to fit in the database.")
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        updateBlock(blockId, 'imageUrl', reader.result)
      }
      reader.readAsDataURL(file)
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

  const executeCommand = (command) => {
    document.execCommand(command, false, null)
  }

  const [isSaving, setIsSaving] = useState(false)

  // --- DRAG AND DROP ---
  const [dragEnabledBlockId, setDragEnabledBlockId] = useState(null)
  const [draggedBlockId, setDraggedBlockId] = useState(null)

  const handleDragStart = (e, id) => {
    setDraggedBlockId(id)
    e.dataTransfer.effectAllowed = 'move'
    setTimeout(() => {
      if (e.target && e.target.style) {
        e.target.style.opacity = '0.4'
      }
    }, 0)
  }

  const handleDragEnd = (e) => {
    if (e.target && e.target.style) {
      e.target.style.opacity = '1'
    }
    setDraggedBlockId(null)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, targetId) => {
    e.preventDefault()
    if (!draggedBlockId || draggedBlockId === targetId) return

    const oldIndex = blocks.findIndex(b => b.id === draggedBlockId)
    const newIndex = blocks.findIndex(b => b.id === targetId)
    
    if (oldIndex === -1 || newIndex === -1) return

    const newBlocks = [...blocks]
    const [draggedBlock] = newBlocks.splice(oldIndex, 1)
    newBlocks.splice(newIndex, 0, draggedBlock)
    
    setBlocks(newBlocks)
  }

  const handleSave = async (status = 'Open') => {
    setIsSaving(true)
    try {
      const token = localStorage.getItem('token')
      const url = id ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/surveys/${id}` : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/surveys`
      const method = id ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, blocks, themeColor, status, expiryDate })
      })

      if (res.ok) {
        const data = await res.json()
        if (status === 'Open') {
          const link = `${window.location.origin}/s/${data.surveyId}`
          prompt(`Survey ${id ? 'updated' : 'published'} successfully! Copy your public link to share:`, link)
        } else {
          alert('Draft saved successfully!')
        }
        navigate('/dashboard')
      } else {
        const data = await res.json()
        alert(`Failed to save: ${data.message}`)
      }
    } catch (err) {
      alert("Error connecting to server")
    } finally {
      setIsSaving(false)
    }
  }

  // --- PREVIEW RENDERER ---
  if (showPreview) {
    return (
      <div className={`min-h-screen bg-[#f0ebf8] flex flex-col items-center py-8 px-4`} style={{ backgroundColor: themeColor === 'emerald' ? '#ecfdf5' : themeColor === 'blue' ? '#eff6ff' : themeColor === 'purple' ? '#faf5ff' : themeColor === 'rose' ? '#fff1f2' : '#fffbeb'}}>
        <div className="w-full max-w-3xl mb-4 flex justify-between items-center">
          <button onClick={() => setShowPreview(false)} className={`flex items-center text-sm font-medium ${t.textMain} hover:underline bg-white px-4 py-2 rounded shadow-sm`}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Editor
          </button>
          <span className="text-gray-500 font-medium tracking-wide uppercase text-sm flex items-center">
            <Eye className="w-4 h-4 mr-2" /> Preview Mode
          </span>
        </div>
        <div className="w-full max-w-3xl space-y-4">
          <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative`}>
            <div className={`h-2.5 w-full ${t.bgMain} absolute top-0 left-0 right-0`}></div>
            <div className="p-8 pt-10">
               <h1 className="text-3xl font-normal text-gray-900 mb-2" dangerouslySetInnerHTML={{ __html: title }}></h1>
               {description && <div className="text-sm text-gray-600 mt-2" dangerouslySetInnerHTML={{ __html: description }}></div>}
               <p className="text-sm text-red-500 mt-4">* Indicates required question</p>
            </div>
          </div>
          
          {blocks.map(block => (
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
                        placeholder="Your answer" 
                        className="w-1/2 border-0 border-b border-gray-300 focus:ring-0 focus:border-emerald-600 bg-transparent px-0 py-1 transition-colors"
                      />
                   )}
                   
                   {['multiple_choice', 'checkbox'].includes(block.type) && (
                     <div className="space-y-4">
                       {block.options?.map((opt, i) => (
                         <label key={i} className="flex items-center cursor-pointer group w-fit">
                           <input type={block.type === 'checkbox' ? 'checkbox' : 'radio'} name={`question-${block.id}`} className={`w-4 h-4 text-gray-600 border-gray-300 ${t.focusRing} cursor-pointer`} />
                           <span className="ml-3 text-sm text-gray-800">{opt}</span>
                         </label>
                       ))}
                     </div>
                   )}

                   {block.type === 'dropdown' && (
                     <select className={`w-1/2 bg-white border border-gray-300 text-gray-700 rounded-md p-3 ${t.focusRing} ${t.focusBorder} cursor-pointer`}>
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
                           <input type="radio" name={`rating-${block.id}`} className={`w-4 h-4 text-gray-600 border-gray-300 ${t.focusRing} cursor-pointer`} />
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
            <button className={`${t.bgMain} text-white px-6 py-2 rounded shadow-sm font-medium ${t.bgHover} transition-colors`}>Submit</button>
            <span className="text-xs text-gray-500">Never submit passwords through Google Forms clone.</span>
          </div>
        </div>
      </div>
    )
  }

  // --- EDITOR RENDERER ---
  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa]">
      {/* Top Navbar */}
      <header className="glass-effect border-b sticky top-0 z-30 pt-4 transition-all duration-300">
        <div className="flex justify-between items-center px-6 pb-2">
          <div className="flex items-center space-x-4">
             <div className={`w-10 h-10 ${t.bgLight} ${t.textMain} rounded flex items-center justify-center font-bold text-xl`}>
               S
             </div>
             {/* Using a simple div so the user can edit the file name visually (not rich text) */}
             <div className="text-lg font-medium text-gray-800 bg-transparent px-2 py-1">{title ? title.replace(/<[^>]*>?/gm, '') : 'Untitled form'}</div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-600">
              <label htmlFor="expiryDate" className="mr-2 font-medium">Expires On:</label>
              <input 
                type="date" 
                id="expiryDate"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className={`border border-gray-300 rounded px-2 py-1 outline-none ${t.focusBorder} ${t.focusRing}`}
                title="Leave blank for no expiry"
              />
            </div>
            <button onClick={toggleTheme} className={`text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors`} title="Change Theme"><Palette className="w-5 h-5" /></button>
            <button onClick={() => setShowPreview(true)} className="text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors" title="Preview"><Eye className="w-5 h-5" /></button>
            <button 
              disabled={isSaving} 
              onClick={() => handleSave('Draft')} 
              className={`bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 transition-colors font-medium flex items-center shadow-sm disabled:opacity-50 ml-2`}
            >
              Save as Draft
            </button>
            <button 
              disabled={isSaving} 
              onClick={() => handleSave('Open')} 
              className={`${t.bgMain} text-white px-6 py-2 rounded-md ${t.bgHover} transition-colors font-medium flex items-center shadow-sm disabled:opacity-50 ml-2`}
            >
              {isSaving ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex justify-center border-t border-gray-100 mt-2">
          <nav className="flex space-x-8">
            {['Questions', 'Responses'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-1 text-sm font-medium border-b-4 transition-colors ${
                  activeTab === tab 
                    ? `${t.borderMain} ${t.textDark}` 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-t-lg'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex justify-center py-6 px-4">
        <div className="flex w-full max-w-4xl justify-center">
          
          {/* Blocks Container */}
          <div className="w-full max-w-3xl space-y-4">
            
          {activeTab === 'Questions' && (
            <>
              {/* Title Card */}
              <div 
                className={`bg-white rounded-lg shadow-sm border ${activeBlockId === 'title' ? `border-l-8 ${t.borderLeft} border-gray-200 shadow-md` : 'border-gray-200'} overflow-hidden relative cursor-text`}
                onClick={() => setActiveBlockId('title')}
              >
                <div className={`h-2.5 w-full ${t.bgMain} absolute top-0 left-0 right-0`}></div>
                <div className="p-6 pt-8 pb-5">
                  <div 
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => setTitle(e.currentTarget.innerHTML)}
                    className={`w-full text-3xl font-medium text-gray-900 bg-transparent border-0 border-b-2 border-transparent hover:border-gray-200 ${t.focusBorder} focus:ring-0 px-0 py-2 transition-colors outline-none empty:before:content-['Form_title'] empty:before:text-gray-400`}
                    dangerouslySetInnerHTML={{ __html: title }}
                  />
                  
                  {activeBlockId === 'title' && (
                    <div className="flex items-center space-x-1 mt-2 mb-1 p-1 bg-gray-50 rounded-md border border-gray-100 w-fit">
                      <button onMouseDown={(e) => { e.preventDefault(); executeCommand('bold') }} className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors" title="Bold"><Bold className="w-4 h-4" /></button>
                      <button onMouseDown={(e) => { e.preventDefault(); executeCommand('italic') }} className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors" title="Italic"><Italic className="w-4 h-4" /></button>
                      <button onMouseDown={(e) => { e.preventDefault(); executeCommand('underline') }} className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors" title="Underline"><Underline className="w-4 h-4" /></button>
                    </div>
                  )}

                  <div 
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => setDescription(e.currentTarget.innerHTML)}
                    className={`w-full text-sm text-gray-600 bg-transparent border-0 border-b border-transparent hover:border-gray-200 ${t.focusBorder} focus:ring-0 px-0 py-1.5 mt-2 transition-colors outline-none empty:before:content-['Form_description'] empty:before:text-gray-400`}
                    dangerouslySetInnerHTML={{ __html: description }}
                  />
                </div>
              </div>

              {/* Blocks Loop */}
              {blocks.map((block) => {
                const isActive = activeBlockId === block.id
                
                // Section Block
                if (block.blockType === 'section') {
                  return (
                    <div 
                      key={block.id} 
                      draggable={dragEnabledBlockId === block.id}
                      onDragStart={(e) => handleDragStart(e, block.id)}
                      onDragEnd={handleDragEnd}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, block.id)}
                      onClick={() => setActiveBlockId(block.id)} 
                      className={`relative mt-8 mb-4 transition-all duration-300 ${isActive ? 'premium-shadow rounded-2xl -translate-y-1' : 'hover:-translate-y-0.5 hover:shadow-md'}`}
                    >
                      <div className="flex items-center">
                        <div className={`${t.bgMain} text-white text-xs font-bold px-4 py-1.5 rounded-t-lg`}>
                          Section {blocks.filter(b => b.blockType === 'section').findIndex(b => b.id === block.id) + 2}
                        </div>
                      </div>
                      <div className={`bg-white rounded-b-2xl rounded-tr-2xl shadow-sm border transition-all duration-300 ${isActive ? `border-l-8 ${t.borderLeft} border-gray-100` : 'border-gray-100 hover:border-gray-200'} relative cursor-text overflow-hidden`}>
                        {isActive && (
                          <div 
                            onMouseEnter={() => setDragEnabledBlockId(block.id)}
                            onMouseLeave={() => setDragEnabledBlockId(null)}
                            className="absolute top-0 left-0 right-0 flex justify-center mt-1 text-gray-300 cursor-grab hover:text-gray-500 transition-colors z-10"
                          >
                            <GripHorizontal className="w-5 h-5" />
                          </div>
                        )}
                        <div className="p-6 pt-8">
                          <input 
                            type="text" 
                            value={block.title} 
                            onChange={(e) => updateBlock(block.id, 'title', e.target.value)}
                            className={`w-full text-2xl font-medium text-gray-900 bg-transparent border-0 border-b-2 border-transparent hover:border-gray-200 ${t.focusBorder} focus:ring-0 px-0 py-2 transition-colors outline-none`}
                            placeholder="Section title"
                          />
                          <input 
                            type="text" 
                            value={block.description} 
                            onChange={(e) => updateBlock(block.id, 'description', e.target.value)}
                            className={`w-full text-sm text-gray-600 bg-transparent border-0 border-b border-transparent hover:border-gray-200 ${t.focusBorder} focus:ring-0 px-0 py-1.5 mt-2 transition-colors outline-none`}
                            placeholder="Description (optional)"
                          />
                          {isActive && (
                            <div className="flex justify-end pt-4 mt-4 space-x-2">
                              <button onClick={() => duplicateBlock(block.id)} className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors" title="Duplicate">
                                <Copy className="w-5 h-5" />
                              </button>
                              <button onClick={() => removeBlock(block.id)} className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors" title="Delete">
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                }

                // Normal Blocks
                return (
                  <div 
                    key={block.id} 
                    draggable={dragEnabledBlockId === block.id}
                    onDragStart={(e) => handleDragStart(e, block.id)}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, block.id)}
                    onClick={() => setActiveBlockId(block.id)}
                    className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 ${isActive ? `border-l-8 ${t.borderLeft} border-gray-100 premium-shadow -translate-y-1` : 'border-gray-100 hover:border-gray-200 hover:premium-shadow hover:-translate-y-0.5'} relative cursor-text mt-4`}
                  >
                    {isActive && (
                      <div 
                        onMouseEnter={() => setDragEnabledBlockId(block.id)}
                        onMouseLeave={() => setDragEnabledBlockId(null)}
                        className="absolute top-0 left-0 right-0 flex justify-center mt-1 text-gray-300 cursor-grab hover:text-gray-500 transition-colors z-10"
                      >
                        <GripHorizontal className="w-5 h-5" />
                      </div>
                    )}
                    <div className="p-6 pt-8">
                      
                      {/* --- TEXT BLOCK --- */}
                      {block.blockType === 'text' && (
                        <>
                          <input 
                            type="text"
                            value={block.title}
                            onChange={(e) => updateBlock(block.id, 'title', e.target.value)}
                            className={`w-full font-medium text-gray-900 bg-transparent border-0 border-b-2 ${isActive ? `border-transparent hover:border-gray-200 ${t.focusBorder}` : 'border-transparent pointer-events-none'} px-0 py-1 transition-colors outline-none text-xl`}
                            placeholder="Title"
                          />
                          <input 
                            type="text"
                            value={block.description}
                            onChange={(e) => updateBlock(block.id, 'description', e.target.value)}
                            className={`w-full text-sm text-gray-600 bg-transparent border-0 border-b ${isActive ? `border-transparent hover:border-gray-200 ${t.focusBorder}` : 'border-transparent pointer-events-none'} px-0 py-1 mt-2 transition-colors outline-none`}
                            placeholder="Description"
                          />
                        </>
                      )}

                      {/* --- IMAGE BLOCK --- */}
                      {block.blockType === 'image' && (
                        <>
                           <input 
                            type="text"
                            value={block.title}
                            onChange={(e) => updateBlock(block.id, 'title', e.target.value)}
                            className={`w-full text-gray-900 bg-transparent border-0 border-b-2 ${isActive ? `border-transparent hover:border-gray-200 ${t.focusBorder}` : 'border-transparent pointer-events-none'} px-0 py-1 transition-colors outline-none mb-4`}
                            placeholder="Image title"
                          />
                          {block.imageUrl ? (
                            <img src={block.imageUrl} alt="Uploaded" className="max-w-full h-auto rounded border border-gray-200" />
                          ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center flex flex-col items-center justify-center bg-gray-50">
                              <ImageIcon className="w-12 h-12 text-gray-400 mb-4" />
                              <label className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded shadow-sm cursor-pointer hover:bg-gray-50 transition-colors font-medium">
                                Choose an image to upload
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, block.id)} />
                              </label>
                              <p className="text-xs text-gray-500 mt-2">Max size: 2MB</p>
                            </div>
                          )}
                        </>
                      )}

                      {/* --- VIDEO BLOCK --- */}
                      {block.blockType === 'video' && (
                        <>
                           <input 
                            type="text"
                            value={block.title}
                            onChange={(e) => updateBlock(block.id, 'title', e.target.value)}
                            className={`w-full text-gray-900 bg-transparent border-0 border-b-2 ${isActive ? `border-transparent hover:border-gray-200 ${t.focusBorder}` : 'border-transparent pointer-events-none'} px-0 py-1 transition-colors outline-none mb-4`}
                            placeholder="Video title"
                          />
                          {block.videoUrl && getYouTubeEmbedUrl(block.videoUrl) ? (
                            <div className="aspect-w-16 aspect-h-9 w-full max-w-2xl mx-auto rounded overflow-hidden border border-gray-200">
                               <iframe 
                                 width="100%" 
                                 height="315" 
                                 src={getYouTubeEmbedUrl(block.videoUrl)} 
                                 title="YouTube video player" 
                                 frameBorder="0" 
                                 allowFullScreen>
                               </iframe>
                            </div>
                          ) : (
                             <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center flex flex-col items-center justify-center bg-gray-50">
                              <Video className="w-12 h-12 text-gray-400 mb-4" />
                              <input 
                                type="text"
                                value={block.videoUrl}
                                onChange={(e) => updateBlock(block.id, 'videoUrl', e.target.value)}
                                className={`w-full max-w-md bg-white border border-gray-300 text-gray-900 rounded p-2 ${t.focusRing} ${t.focusBorder} outline-none shadow-sm`}
                                placeholder="Paste YouTube URL here..."
                              />
                            </div>
                          )}
                        </>
                      )}

                      {/* --- QUESTION BLOCK --- */}
                      {block.blockType === 'question' && (
                        <>
                          {isActive ? (
                            <div className="flex flex-col sm:flex-row gap-4 mb-4 items-start">
                              <input 
                                type="text"
                                value={block.text}
                                onChange={(e) => updateBlock(block.id, 'text', e.target.value)}
                                className={`flex-grow bg-gray-50 border-b-2 border-transparent hover:border-gray-300 ${t.focusBorder} focus:bg-gray-100 text-gray-900 p-4 font-medium outline-none rounded-t-md transition-colors`}
                                placeholder="Question"
                                autoFocus
                              />
                              <select 
                                value={block.type}
                                onChange={(e) => updateBlock(block.id, 'type', e.target.value)}
                                className={`sm:w-56 bg-white border border-gray-300 text-gray-700 rounded-md ${t.focusRing} ${t.focusBorder} block p-3 outline-none cursor-pointer`}
                              >
                                <option value="text">Short answer</option>
                                <option value="paragraph">Paragraph</option>
                                <option value="multiple_choice">Multiple choice</option>
                                <option value="checkbox">Checkboxes</option>
                                <option value="dropdown">Dropdown</option>
                                <option value="rating">Linear scale</option>
                              </select>
                            </div>
                          ) : (
                            <div className="mb-4">
                              <h3 className="text-base text-gray-900">
                                {block.text || 'Untitled Question'}
                                {block.isRequired && <span className="text-red-500 ml-1">*</span>}
                              </h3>
                            </div>
                          )}

                          {['text', 'paragraph'].includes(block.type) && (
                            <div className="mt-4">
                              <div className={`w-1/2 border-b border-gray-300 border-dotted text-sm text-gray-400 ${block.type === 'paragraph' ? 'pb-8' : 'pb-2'}`}>
                                {block.type === 'text' ? 'Short answer text' : 'Long answer text'}
                              </div>
                            </div>
                          )}

                          {block.type === 'rating' && (
                            <div className="mt-4 flex items-center space-x-4">
                              <span className="text-sm text-gray-500">1</span>
                              <span className="text-gray-400">to</span>
                              <span className="text-sm text-gray-500">5</span>
                            </div>
                          )}

                          {['multiple_choice', 'checkbox', 'dropdown'].includes(block.type) && (
                            <div className="mt-4 space-y-3">
                              {block.options?.map((opt, optIndex) => (
                                <div key={optIndex} className="flex items-center group/option">
                                  <div className="mr-3">
                                    {block.type === 'multiple_choice' && <div className="w-4 h-4 rounded-full border-2 border-gray-300" />}
                                    {block.type === 'checkbox' && <div className="w-4 h-4 rounded-sm border-2 border-gray-300" />}
                                    {block.type === 'dropdown' && <span className="text-sm text-gray-500 w-4 inline-block text-center">{optIndex + 1}.</span>}
                                  </div>
                                  <input 
                                    type="text" 
                                    value={opt} 
                                    onChange={(e) => updateOption(block.id, optIndex, e.target.value)} 
                                    readOnly={!isActive}
                                    className={`flex-grow max-w-xl bg-transparent border-b ${isActive ? `border-transparent hover:border-gray-300 ${t.focusBorder}` : 'border-transparent pointer-events-none'} outline-none py-1.5 text-gray-800 transition-colors text-sm`}
                                    placeholder={`Option ${optIndex + 1}`}
                                  />
                                  {isActive && block.options.length > 1 && (
                                    <button 
                                      onClick={() => removeOption(block.id, optIndex)} 
                                      className="text-gray-400 hover:text-gray-600 opacity-0 group-hover/option:opacity-100 transition-all p-2"
                                      title="Remove"
                                    >
                                      <X className="w-5 h-5" />
                                    </button>
                                  )}
                                </div>
                              ))}
                              
                              {isActive && (
                                <div className="flex items-center mt-2">
                                  <div className="mr-3">
                                    {block.type === 'multiple_choice' && <div className="w-4 h-4 rounded-full border-2 border-gray-300" />}
                                    {block.type === 'checkbox' && <div className="w-4 h-4 rounded-sm border-2 border-gray-300" />}
                                    {block.type === 'dropdown' && <span className="text-sm text-gray-500 w-4 inline-block text-center">{block.options.length + 1}.</span>}
                                  </div>
                                  <button 
                                    onClick={() => addOption(block.id)} 
                                    className="text-sm text-gray-500 hover:text-gray-800 focus:outline-none"
                                  >
                                    Add option
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}

                      {/* Block Footer */}
                      {isActive && (
                        <div className="flex justify-end items-center pt-4 border-t border-gray-100 mt-6 space-x-2">
                          <button onClick={() => duplicateBlock(block.id)} className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors" title="Duplicate">
                            <Copy className="w-5 h-5" />
                          </button>
                          <button onClick={() => removeBlock(block.id)} className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors" title="Delete">
                            <Trash2 className="w-5 h-5" />
                          </button>
                          
                          {block.blockType === 'question' && (
                            <>
                              <div className="w-px h-6 bg-gray-200 mx-2"></div>
                              <div className="flex items-center cursor-pointer" onClick={() => updateBlock(block.id, 'isRequired', !block.isRequired)}>
                                <span className="text-sm text-gray-700 mr-2">Required</span>
                                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${block.isRequired ? t.bgMain : 'bg-gray-300'}`}>
                                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${block.isRequired ? 'translate-x-4' : ''}`}></div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                    </div>
                  </div>
                )
              })}
            </>
          )}

          {activeTab === 'Responses' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
               <h2 className="text-2xl font-medium text-gray-800 mb-2">0 responses</h2>
               <p className="text-gray-500">Waiting for responses. Once you share the survey, responses will appear here.</p>
            </div>
          )}

          </div>

          {/* Side Toolbar Container */}
          <div className="hidden md:block w-16 ml-4">
            {activeTab === 'Questions' && (
              <div className="sticky top-28 flex flex-col items-center bg-white rounded-lg shadow-[0_2px_5px_rgba(0,0,0,0.1)] border border-gray-200 py-2">
                <button onClick={() => addBlock('question')} className={`p-2.5 text-gray-600 ${t.textMain} ${t.bgHoverLight} rounded-full mx-1 transition-colors`} title="Add question">
                  <Plus className="w-6 h-6" />
                </button>
                <div className="my-1 border-b border-gray-100 w-8 mx-auto"></div>
                <button onClick={() => addBlock('text')} className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full mx-1 transition-colors" title="Add title and description">
                  <Type className="w-5 h-5" />
                </button>
                <button onClick={() => addBlock('image')} className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full mx-1 transition-colors" title="Add image">
                  <ImageIcon className="w-5 h-5" />
                </button>
                <button onClick={() => addBlock('video')} className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full mx-1 transition-colors" title="Add video">
                  <Video className="w-5 h-5" />
                </button>
                <button onClick={() => addBlock('section')} className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full mx-1 transition-colors" title="Add section">
                  <LayoutTemplate className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}

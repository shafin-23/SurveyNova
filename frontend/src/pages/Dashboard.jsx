import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Heart, 
  Home, 
  Edit3, 
  Layout, 
  FileText, 
  ArrowRight, 
  Search, 
  ChevronDown, 
  AlertCircle, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Check,
  CheckSquare,
  Folder,
  ArrowRightLeft,
  Share2,
  Trash2,
  X,
  Star,
  Atom,
  MessageSquare,
  Lock,
  Download
} from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeMenu, setActiveMenu] = useState(null)
  const [activeStatusMenu, setActiveStatusMenu] = useState(null)
  const [openFilter, setOpenFilter] = useState(null) // 'status', 'owner', 'sort'
  
  const menuRef = useRef(null)
  const filterRef = useRef(null)

  // Template View State
  const [isTemplateView, setIsTemplateView] = useState(false)

  // Filters State
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('Select all')
  const [ownerFilter, setOwnerFilter] = useState('Select all')
  const [sortBy, setSortBy] = useState('Last update')

  const [selectedSurveys, setSelectedSurveys] = useState([])

  const toggleSurveySelection = (id) => {
    setSelectedSurveys(prev => 
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    )
  }

  const handleDeleteSelected = async () => {
    if(window.confirm(`Are you sure you want to delete ${selectedSurveys.length} survey(s)? This action cannot be undone.`)) {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/surveys`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ surveyIds: selectedSurveys })
        })
        
        if (res.ok) {
          setSurveys(surveys.filter(s => !selectedSurveys.includes(s.id)))
          setSelectedSurveys([])
        } else {
          alert("Failed to delete surveys. Please try again.")
        }
      } catch (err) {
        console.error("Error deleting surveys:", err)
        alert("An error occurred while deleting.")
      }
    }
  }

  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/surveys`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setSurveys(data)
        }
      } catch (err) {
        console.error("Failed to fetch surveys", err)
      } finally {
        setLoading(false)
      }
    }
    fetchSurveys()
  }, [])

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/surveys/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt })
      });
      if (res.ok) {
        const data = await res.json();
        navigate(`/edit/${data.surveyId}`);
      } else {
        alert("Failed to generate survey.");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server.");
    } finally {
      setIsGenerating(false);
    }
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null)
        setActiveStatusMenu(null)
      }
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setOpenFilter(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const updateSurveyStatus = (id, newStatus) => {
    setSurveys(surveys.map(s => s.id === id ? { ...s, status: newStatus } : s))
    setActiveStatusMenu(null)
  }

  // Apply filters and sorting
  const filteredSurveys = surveys
    .filter(s => statusFilter === 'Select all' || s.status === statusFilter)
    .filter(s => ownerFilter === 'Select all' || s.owner === ownerFilter)
    .filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'Title') return a.title.localeCompare(b.title)
      if (sortBy === 'Total response') return b.totalResponses - a.totalResponses
      // Default: Last update (Using ID as proxy for newest in dummy data)
      return b.id - a.id 
    })

  // Dummy Templates Data
  const templates = [
    { id: 1, icon: <Star className="w-5 h-5 text-emerald-600" />, title: 'Parent Engagement Survey', desc: "Ask parents how engaged they are in their child's education." },
    { id: 2, icon: <Atom className="w-5 h-5 text-emerald-600" />, title: 'Volunteer Feedback Survey', desc: 'Ask volunteers how it was working with you.' },
    { id: 3, icon: <MessageSquare className="w-5 h-5 text-emerald-600" />, title: 'Meeting Feedback Survey', desc: 'Gather feedback from people who attended your meeting.' },
    { id: 4, icon: <Star className="w-5 h-5 text-emerald-600" />, title: 'K-12 Parent Survey', desc: 'An abridged version of the Harvard Grad. School of Ed. Pr...', locked: true },
  ]

  return (
    <div className="flex flex-col flex-grow bg-white min-h-[calc(100vh-4rem)] relative pb-20">
      
      <div className="flex flex-grow">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 border-r border-gray-200 py-6 px-4 hidden md:block">
          <nav className="space-y-1 mb-8">
            <button 
              onClick={() => setIsTemplateView(true)}
              className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors relative ${isTemplateView ? 'text-emerald-800 bg-emerald-50' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              {isTemplateView && <div className="absolute left-0 top-1 bottom-1 w-1 bg-emerald-600 rounded-r-md"></div>}
              <Heart className={`w-5 h-5 mr-3 ${isTemplateView ? 'text-emerald-600' : 'text-gray-400'}`} />
              Made for you
            </button>
            <button 
              onClick={() => setIsTemplateView(false)}
              className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors relative ${!isTemplateView ? 'text-emerald-800 bg-emerald-50' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              {!isTemplateView && <div className="absolute left-0 top-1 bottom-1 w-1 bg-emerald-600 rounded-r-md"></div>}
              <Home className={`w-5 h-5 mr-3 ${!isTemplateView ? 'text-emerald-600' : 'text-gray-400'}`} />
              All surveys
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          
          {/* Banner Section */}
          <div className="bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/80 py-20 px-8 border-b border-gray-100 relative overflow-hidden">
            
            {/* Vibrant Background Elements */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-emerald-300/30 to-teal-300/30 blur-[100px] animate-pulse-slow"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-indigo-300/20 to-purple-300/20 blur-[100px] animate-float"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-emerald-200/20 blur-[120px]"></div>
            
            {/* Subtle Grid overlay for texture */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTM5IDM5VDBIMHY0MGg0MHoiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgwLCAwLCAwLCAwLjAzKSIvPjwvc3ZnPg==')] opacity-100 mix-blend-overlay"></div>
            
            <div className="max-w-4xl mx-auto text-center relative z-10">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800 mb-8 tracking-tight drop-shadow-sm">
                Turn your questions into <span className="text-emerald-600 bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-400">insights</span>
              </h1>
              
              <div className="flex flex-wrap justify-center gap-4 mb-10">
                <button 
                  onClick={() => setIsTemplateView(true)}
                  className={`flex items-center px-6 py-3 border rounded-full font-medium shadow-sm transition-all duration-300 hover:-translate-y-0.5 ${
                    isTemplateView 
                      ? 'bg-white border-emerald-500 text-emerald-600 premium-shadow' 
                      : 'bg-white border-gray-200 text-gray-700 hover:border-emerald-300 hover:text-emerald-600 hover:shadow-md'
                  }`}
                >
                  <Layout className="w-4 h-4 mr-2" /> Start with a template
                </button>
                <Link to="/create" className="flex items-center px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-full font-medium shadow-sm hover:border-emerald-300 hover:text-emerald-600 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                  <FileText className="w-4 h-4 mr-2 text-gray-400" /> Start from scratch
                </Link>
              </div>

              <div className="relative max-w-3xl mx-auto">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  {isTemplateView ? <Search className="h-5 w-5 text-gray-400" /> : null}
                </div>
                <input 
                  type="text" 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleGenerate() }}
                  disabled={isGenerating}
                  className={`w-full bg-white/80 backdrop-blur border-2 border-emerald-100 text-gray-900 rounded-full py-4 pr-16 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 shadow-sm premium-shadow ${isTemplateView ? 'pl-12' : 'pl-6'}`}
                  placeholder={isTemplateView ? "Search hundreds of expert-written templates" : "Describe what you're trying to learn, or paste your survey questions to get started"}
                />
                {!isTemplateView && (
                  <button 
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="absolute right-2 top-2 bottom-2 bg-emerald-200 hover:bg-emerald-300 text-emerald-800 rounded-full w-12 flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Template View Section */}
              {isTemplateView && (
                <div className="text-left mt-10 max-w-4xl mx-auto animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-emerald-700 font-semibold border-b-2 border-emerald-500 pb-1 inline-block">
                      Recommended for Student and parent feedback
                    </span>
                    <span className="text-emerald-700 font-semibold cursor-pointer hover:underline text-sm">See all</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {templates.map(template => (
                      <Link 
                        key={template.id} 
                        to={template.locked ? '#' : `/create?template=${template.id}`}
                        className="bg-white border border-gray-100 rounded-2xl p-6 hover:premium-shadow hover:-translate-y-1 transition-all duration-300 cursor-pointer relative group block"
                      >
                        <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center mb-4 bg-gray-50">
                          {template.icon}
                        </div>
                        {template.locked && (
                          <div className="absolute top-4 right-4 bg-yellow-100 p-1.5 rounded-md">
                            <Lock className="w-3.5 h-3.5 text-yellow-700" />
                          </div>
                        )}
                        <h3 className="font-bold text-gray-900 text-sm mb-2 group-hover:text-emerald-600 transition-colors">{template.title}</h3>
                        <p className="text-sm text-gray-500 line-clamp-3">{template.desc}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
          
          {/* Mobile Tab Switcher */}
          <div className="md:hidden flex border-b border-gray-200 bg-white sticky top-0 z-20">
            <button 
              onClick={() => setIsTemplateView(false)}
              className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${!isTemplateView ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              All surveys
            </button>
            <button 
              onClick={() => setIsTemplateView(true)}
              className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${isTemplateView ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Templates
            </button>
          </div>

          {/* Survey List Section (Only show if not in template view) */}
          {!isTemplateView && (
            <div className="max-w-6xl mx-auto px-8 py-8">
              
              {/* Filters Bar */}
              <div className="flex flex-wrap items-center gap-4 mb-6" ref={filterRef}>
                
                {/* Search Bar */}
                <div className="relative w-64 flex-shrink-0">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm" 
                    placeholder="Search" 
                  />
                </div>
                
                <div className="flex gap-4">
                  <div className="relative">
                    <button 
                      onClick={() => setOpenFilter(openFilter === 'status' ? null : 'status')}
                      className="flex items-center justify-between px-4 py-1.5 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 min-w-[130px]"
                    >
                      Status: {statusFilter === 'Select all' ? 'All' : statusFilter} <ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
                    </button>
                    {openFilter === 'status' && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 shadow-lg rounded-md py-1">
                        {['Select all', 'Draft', 'Open', 'Closed'].map(opt => (
                          <button key={opt} onClick={() => { setStatusFilter(opt); setOpenFilter(null); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">{opt}</button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <button 
                      onClick={() => setOpenFilter(openFilter === 'owner' ? null : 'owner')}
                      className="flex items-center justify-between px-4 py-1.5 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 min-w-[140px]"
                    >
                      Owner: {ownerFilter === 'Select all' ? 'All' : ownerFilter === 'You own' ? 'You' : 'Shared'} <ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
                    </button>
                    {openFilter === 'owner' && (
                      <div className="absolute z-10 mt-1 w-full min-w-[160px] bg-white border border-gray-200 shadow-lg rounded-md py-1">
                        {['Select all', 'You own', 'You own and share'].map(opt => (
                          <button key={opt} onClick={() => { setOwnerFilter(opt); setOpenFilter(null); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">{opt}</button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <button 
                      onClick={() => setOpenFilter(openFilter === 'sort' ? null : 'sort')}
                      className="flex items-center justify-between px-4 py-1.5 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 min-w-[190px]"
                    >
                      Sort by: {sortBy} <ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
                    </button>
                    {openFilter === 'sort' && (
                      <div className="absolute z-10 right-0 mt-1 w-full min-w-[160px] bg-white border border-gray-200 shadow-lg rounded-md py-1">
                        {['Last update', 'Total response', 'Title'].map(opt => (
                          <button key={opt} onClick={() => { setSortBy(opt); setOpenFilter(null); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">{opt}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Table Header Line */}
              <div className="border-b border-gray-200 mb-4"></div>

              {/* Survey List */}
              <div ref={menuRef}>
                {filteredSurveys.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No surveys found matching your criteria.
                  </div>
                ) : (
                  filteredSurveys.map((survey) => (
                    <div key={survey.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors group px-2">
                      <div className="flex items-center space-x-4">
                        {/* Checkbox */}
                        <div 
                          onClick={() => toggleSurveySelection(survey.id)}
                          className={`w-5 h-5 rounded flex items-center justify-center cursor-pointer shadow-sm border transition-colors ${
                            selectedSurveys.includes(survey.id) ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-gray-300 hover:border-emerald-500'
                          }`}
                        >
                          {selectedSurveys.includes(survey.id) && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                        </div>
                        
                        {/* Status Badge */}
                        <span className={`px-3 py-1 text-xs font-semibold rounded-md
                          ${survey.status === 'Draft' ? 'bg-gray-100 text-gray-700' : ''}
                          ${survey.status === 'Open' ? 'bg-emerald-100 text-emerald-800' : ''}
                          ${survey.status === 'Closed' ? 'bg-red-100 text-red-800' : ''}
                        `}>
                          {survey.status}
                        </span>
                        
                        {/* Title & Date */}
                        <div>
                          <Link to={survey.title.startsWith("Uploaded Data:") ? `/report/${survey.id}` : `/edit/${survey.id}`} className="text-gray-900 font-medium hover:text-emerald-600 transition-colors block">
                            {survey.title}
                          </Link>
                          <p className="text-xs text-gray-500 mt-1 flex items-center">
                            <Layout className="w-3 h-3 mr-1" /> Updated: {survey.updatedAt} 
                            <span className="mx-2">•</span> 
                            {survey.totalResponses} Responses
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                        {survey.needsQuestions && (
                          <span className="flex items-center text-sm font-medium text-gray-600 mr-4">
                            <AlertCircle className="w-4 h-4 text-gray-500 mr-1.5 fill-gray-200" /> Add questions
                          </span>
                        )}
                        
                        {survey.title.startsWith("Uploaded Data:") ? (
                          <Link to={`/report/${survey.id}`} className="px-6 py-1.5 border border-indigo-600 text-indigo-700 bg-indigo-50 text-sm font-medium rounded hover:bg-indigo-100 transition-colors">
                            Download Analysis
                          </Link>
                        ) : (
                          <Link to={`/edit/${survey.id}`} className="px-6 py-1.5 border border-gray-800 text-gray-900 text-sm font-medium rounded hover:bg-gray-50 transition-colors">
                            Edit survey
                          </Link>
                        )}
                        
                        <button 
                          onClick={async () => {
                            const token = localStorage.getItem('token')
                            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/surveys/${survey.id}/export`, {
                              headers: { 'Authorization': `Bearer ${token}` }
                            })
                            if (res.ok) {
                              const blob = await res.blob()
                              const url = window.URL.createObjectURL(blob)
                              const a = document.createElement('a')
                              a.href = url
                              a.download = `survey_${survey.id}_responses.csv`
                              a.click()
                              window.URL.revokeObjectURL(url)
                            } else {
                              alert("Failed to download CSV")
                            }
                          }}
                          className="px-4 py-1.5 border border-emerald-600 text-emerald-700 bg-emerald-50 text-sm font-medium rounded hover:bg-emerald-100 transition-colors flex items-center"
                          title="Download Responses (CSV)"
                        >
                          <Download className="w-4 h-4 mr-2" /> Export CSV
                        </button>
                        
                        {/* Action Dropdown Menu */}
                        <div className="relative">
                          <button 
                            onClick={() => setActiveMenu(activeMenu === survey.id ? null : survey.id)}
                            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors focus:outline-none"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>

                          {activeMenu === survey.id && (
                            <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-200 shadow-xl rounded-md py-1 z-10 text-sm overflow-hidden">
                              <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                                <p className="font-medium text-gray-900 truncate">{survey.title}</p>
                              </div>
                              {survey.title.startsWith("Uploaded Data:") ? (
                                <Link to={`/report/${survey.id}`} className="block px-4 py-2 text-gray-700 hover:bg-gray-50">Download Analysis</Link>
                              ) : (
                                <>
                                  <Link to={`/edit/${survey.id}`} className="block px-4 py-2 text-gray-700 hover:bg-gray-50">Edit survey</Link>
                                  <Link to={`/s/${survey.id}`} target="_blank" className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50">Preview survey</Link>
                                </>
                              )}
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(`${window.location.origin}/s/${survey.id}`);
                                  alert('Survey link copied to clipboard!');
                                  setActiveMenu(null);
                                }}
                                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50"
                              >
                                Send survey
                              </button>
                              <Link to={`/report/${survey.id}`} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50">Analyze results</Link>
                              <button onClick={() => alert('Audience targeting coming soon!')} className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50">Choose an audience</button>
                              <div className="border-t border-gray-100 my-1"></div>
                              <button onClick={() => alert('Notification settings coming soon!')} className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex justify-between items-center">
                                Manage notifications
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination */}
              {filteredSurveys.length > 0 && (
                <div className="flex items-center justify-center mt-12 space-x-6 text-sm text-gray-500 pb-12">
                  <span>Showing 1 - {filteredSurveys.length} of {filteredSurveys.length}</span>
                  
                  <button className="flex items-center justify-between px-3 py-1.5 border border-gray-300 rounded bg-white hover:bg-gray-50">
                    Page 1 <ChevronDown className="w-4 h-4 ml-4 text-gray-400" />
                  </button>
                  
                  <div className="flex space-x-1">
                    <button className="p-1.5 border border-gray-300 rounded bg-white text-gray-400 hover:bg-gray-50 disabled:opacity-50" disabled>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 border border-gray-300 rounded bg-white text-gray-400 hover:bg-gray-50 disabled:opacity-50" disabled>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </main>
      </div>

      {/* Persistent Feedback Button */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 bg-gray-500 text-white text-xs font-bold py-1.5 px-3 rounded-l-md -rotate-90 origin-bottom-right translate-x-[42px] translate-y-[-20px] cursor-pointer hover:bg-gray-600 transition-colors tracking-wider shadow-sm z-40">
        Feedback
      </div>

      {/* Bottom Action Bar (Appears when surveys are selected) */}
      {selectedSurveys.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] border-t border-gray-200 px-8 py-4 flex justify-between items-center z-50 animate-in slide-in-from-bottom-10 duration-300">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-md text-sm">
              {selectedSurveys.length}
            </div>
            <span className="text-sm font-medium text-gray-700">selected (max 50)</span>
          </div>
          
          <div className="flex items-center space-x-6 text-sm font-medium text-gray-700">
            <button 
              onClick={() => setSelectedSurveys(surveys.map(s => s.id))} 
              className="hover:text-emerald-600 flex items-center transition-colors"
            >
              <CheckSquare className="w-4 h-4 mr-2"/> Select all
            </button>           
            
            <button 
              onClick={handleDeleteSelected} 
              className="text-red-500 hover:text-red-700 flex items-center transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2"/> Delete
            </button>
            <div className="w-px h-6 bg-gray-300 mx-2"></div>
            <button 
              onClick={() => setSelectedSurveys([])} 
              className="text-gray-500 hover:text-gray-900 flex items-center transition-colors font-bold"
            >
              <X className="w-4 h-4 mr-1"/> Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

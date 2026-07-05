import { Link } from 'react-router-dom'
import { ArrowRight, BarChart2, UploadCloud, Edit3, CheckCircle, Shield, Globe, Cpu, LayoutDashboard, Database, Layout, Users, FileText, Settings, PieChart, Heart, List, Search } from 'lucide-react'

export default function Home({ isAuthenticated, userRole }) {
  return (
    <div className="flex-grow flex flex-col font-sans overflow-hidden">
      
      {/* 1. Enhanced Hero Section */}
      <section className="relative pt-32 pb-40 bg-[#0B1120] flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-gray-800">
        
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTM5IDM5VDBIMHY0MGg0MHoiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjA1KSIvPjwvc3ZnPg==')] opacity-50"></div>
        
        {/* Vibrant Glowing Background Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/20 blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/20 blur-[120px] animate-float"></div>
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-teal-500/15 blur-[120px]"></div>
        
        <div className="max-w-5xl mx-auto relative z-10 mt-10">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-5 py-2 mb-10 shadow-lg shadow-black/20">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-sm font-semibold text-emerald-50 tracking-wide">SurveyNova 2.0 is now live</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8 leading-[1.1] drop-shadow-lg">
            The Intelligent Way to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">
              Gather & Analyze Data
            </span>
          </h1>
          
          <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            Create powerful surveys or upload your existing data. Our advanced AI automatically generates gorgeous reports, sentiment analysis, and deep insights in seconds.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link 
              to={isAuthenticated ? (userRole === 'admin' ? '/admin' : '/dashboard') : '/register'} 
              className="w-full sm:w-auto px-8 py-4 bg-emerald-500 text-slate-900 rounded-full font-bold text-lg hover:bg-emerald-400 transition-all duration-300 shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] hover:-translate-y-1 flex items-center justify-center space-x-2"
            >
              <span>{isAuthenticated ? 'Go to Dashboard' : 'Get Started for Free'}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/upload" className="w-full sm:w-auto px-8 py-4 bg-white/5 backdrop-blur-md text-white border border-white/20 rounded-full font-bold text-lg hover:bg-white/10 transition-all duration-300 flex items-center justify-center space-x-2">
              <UploadCloud className="w-5 h-5" />
              <span>Upload a CSV</span>
            </Link>
          </div>
        </div>

        {/* Floating Dashboard Mockup - Accurate representation of Dashboard.jsx */}
        <div className="mt-20 max-w-5xl mx-auto w-full relative z-10 animate-float hidden md:block">
          <div className="glass-effect rounded-2xl p-4 shadow-2xl border border-white/40">
            <div className="bg-white rounded-xl overflow-hidden border border-gray-100 flex h-[400px] relative shadow-inner">
              
              {/* Fake Sidebar */}
              <div className="w-64 border-r border-gray-100 p-4 flex flex-col pt-8">
                <nav className="space-y-1">
                  <div className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md bg-emerald-50 text-emerald-800 relative">
                    <div className="absolute left-0 top-1 bottom-1 w-1 bg-emerald-600 rounded-r-md"></div>
                    <Heart className="w-5 h-5 mr-3 text-emerald-600" /> Made for you
                  </div>
                  <div className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md text-gray-500 hover:bg-gray-50">
                    <List className="w-5 h-5 mr-3 text-gray-400" /> All surveys
                  </div>
                </nav>
              </div>
              
              {/* Fake Main Content */}
              <div className="flex-1 bg-gradient-to-br from-slate-50 via-gray-50 to-emerald-50/30 p-8 flex flex-col relative overflow-hidden text-left">
                {/* Background effects from Dashboard */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-emerald-100/40 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-50/40 blur-3xl"></div>
                
                <div className="max-w-3xl mx-auto text-center relative z-10 w-full mt-4">
                  <h1 className="text-3xl font-extrabold text-slate-800 mb-6 tracking-tight drop-shadow-sm">
                    Turn your questions into <span className="text-emerald-600 bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-400">insights</span>
                  </h1>
                  
                  <div className="flex justify-center gap-4 mb-6">
                    <div className="flex items-center px-4 py-2 bg-white border border-emerald-500 text-emerald-600 rounded-full font-medium text-sm shadow-sm premium-shadow">
                      <Layout className="w-4 h-4 mr-2" /> Start with a template
                    </div>
                    <div className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-500 rounded-full font-medium text-sm shadow-sm">
                      <FileText className="w-4 h-4 mr-2" /> Start from scratch
                    </div>
                  </div>

                  <div className="relative max-w-2xl mx-auto mb-8">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="w-full bg-white/80 backdrop-blur border-2 border-emerald-100 text-gray-400 rounded-full py-3.5 pl-12 pr-6 shadow-sm premium-shadow text-left flex items-center">
                      <span className="truncate">Search hundreds of expert-written templates...</span>
                    </div>
                  </div>
                  
                  <div className="text-left mt-8">
                     <span className="text-emerald-700 font-semibold border-b-2 border-emerald-500 pb-1 inline-block text-sm mb-4">
                       Recommended for you
                     </span>
                     <div className="grid grid-cols-3 gap-4">
                       <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm relative text-left">
                         <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center mb-2 bg-gray-50">
                           <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                         </div>
                         <h3 className="font-bold text-gray-900 text-xs mb-1">Customer Feedback</h3>
                         <p className="text-[10px] text-gray-500 line-clamp-2">Measure customer satisfaction and loyalty.</p>
                       </div>
                       <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm relative text-left">
                         <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center mb-2 bg-gray-50">
                           <Users className="w-4 h-4 text-emerald-600" />
                         </div>
                         <h3 className="font-bold text-gray-900 text-xs mb-1">Employee Engagement</h3>
                         <p className="text-[10px] text-gray-500 line-clamp-2">Understand team morale and identify areas for improvement.</p>
                       </div>
                       <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm relative text-left">
                         <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center mb-2 bg-gray-50">
                           <FileText className="w-4 h-4 text-emerald-600" />
                         </div>
                         <h3 className="font-bold text-gray-900 text-xs mb-1">Event Registration</h3>
                         <p className="text-[10px] text-gray-500 line-clamp-2">Gather attendee info before your next big event.</p>
                       </div>
                     </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Social Proof / Trust Banner */}
      <section className="border-b border-gray-100 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-8">
            Trusted by researchers at forward-thinking organizations
          </p>
          <div className="flex justify-center items-center space-x-12 opacity-50 grayscale flex-wrap gap-y-8">
            <div className="flex items-center text-xl font-bold text-slate-700"><Globe className="w-8 h-8 mr-2" /> GlobalTech</div>
            <div className="flex items-center text-xl font-bold text-slate-700"><Shield className="w-8 h-8 mr-2" /> SecureData Inc.</div>
            <div className="flex items-center text-xl font-bold text-slate-700"><Cpu className="w-8 h-8 mr-2" /> AI Research Co</div>
          </div>
        </div>
      </section>

      {/* 3. "How It Works" Step-by-Step */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">From questions to insights in minutes</h2>
            <p className="text-lg text-slate-600">Our platform handles the heavy lifting so you can focus on the results.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-emerald-200 to-indigo-200 z-0"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-gray-100 mb-6 text-emerald-600">
                <Layout className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">1. Build</h3>
              <p className="text-slate-600">Quickly generate surveys with our AI, start from an expert template, or use our native drag-and-drop builder.</p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-gray-100 mb-6 text-indigo-600">
                <Users className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">2. Collect</h3>
              <p className="text-slate-600">Share your public link and gather responses securely. Our database handles high-volume traffic with ease.</p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-gray-100 mb-6 text-purple-600">
                <BarChart2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">3. Analyze</h3>
              <p className="text-slate-600">Let our embedded T5 AI engine instantly generate executive summaries, sentiment analysis, and charts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Upgraded Feature Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white p-10 rounded-3xl border border-gray-100 hover:premium-shadow hover:-translate-y-2 transition-all duration-300">
              <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border border-blue-100">
                <Edit3 className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Native Form Builder</h3>
              <p className="text-slate-600 leading-relaxed">Build custom surveys directly on our platform with an intuitive drag-and-drop interface, multiple question types, and custom branding.</p>
            </div>
            
            <div className="bg-white p-10 rounded-3xl border border-gray-100 hover:premium-shadow hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <div className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> New</div>
              </div>
              <div className="bg-purple-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border border-purple-100">
                <Cpu className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">T5 AI Analysis</h3>
              <p className="text-slate-600 leading-relaxed">Our custom Machine Learning model reads your survey responses and generates human-like executive summaries instantly.</p>
            </div>
            
            <div className="bg-white p-10 rounded-3xl border border-gray-100 hover:premium-shadow hover:-translate-y-2 transition-all duration-300">
              <div className="bg-emerald-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border border-emerald-100">
                <Database className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Bring Your Own Data</h3>
              <p className="text-slate-600 leading-relaxed">Already have data from Google Forms or SurveyMonkey? Upload your CSV file directly to our platform for immediate AI insights.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-emerald-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-300 via-transparent to-transparent"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl font-bold mb-6">Ready to transform your feedback?</h2>
          <p className="text-emerald-100 text-lg mb-10">Join thousands of researchers and product teams building better surveys.</p>
          <Link 
            to="/register" 
            className="inline-flex items-center px-8 py-4 bg-white text-emerald-900 rounded-full font-bold text-lg hover:bg-emerald-50 transition-colors shadow-lg"
          >
            <span>Create your free account</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

    </div>
  )
}

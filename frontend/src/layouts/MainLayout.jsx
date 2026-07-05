import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function MainLayout({ isAuthenticated, userRole, userDetails, onLogout }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      <Navbar 
        isAuthenticated={isAuthenticated} 
        userRole={userRole} 
        userDetails={userDetails} 
        onLogout={onLogout} 
      />

      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          <p>&copy; 2026 SurveyNova Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

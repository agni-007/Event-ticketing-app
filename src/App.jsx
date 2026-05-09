import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import UserAuth from './pages/UserAuth'
import UserProfile from './pages/UserProfile'

function App() {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Glowing abstract background matching the glass theme */}
      <div className="absolute inset-0 bg-[#020617] -z-20"></div>
      <div className="absolute bottom-[-20%] left-[10%] w-[800px] h-[500px] bg-blue-600/10 rounded-[100%] blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none -z-10"></div>
      
      <Navbar />
      <main className="flex-grow z-0">
        <Routes>
          <Route path="/" element={<UserAuth />} />
          <Route path="/events" element={<Home />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/admin2005" element={<AdminLogin />} />
          <Route path="/admin2005/dashboard" element={<AdminDashboard />} />
        </Routes>
      </main>
    </div>
  )
}

export default App

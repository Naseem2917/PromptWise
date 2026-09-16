import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { Navbar } from './components/layout/Navbar'
import { BottomNav } from './components/layout/BottomNav'
import { Footer } from './components/layout/Footer'
import { ScrollToTop } from './components/layout/ScrollToTop'
import { Home } from './pages/Home'
import { Improve } from './pages/Improve'
import { Dashboard } from './pages/Dashboard'
import { History } from './pages/History'
import { Learn } from './pages/Learn'
import { Examples } from './pages/Examples'
import { Quiz } from './pages/Quiz'
import { Feedback } from './pages/Feedback'
import { About } from './pages/About'
import { SignIn } from './pages/SignIn'
import { Admin } from './pages/Admin'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <div className="flex flex-col justify-between min-h-screen bg-[#F8FAFC] dark:bg-[#070B14] text-slate-900 dark:text-slate-100 transition-colors duration-200">
            <Navbar />
            <main className="flex-1 flex flex-col pt-16 pb-24 md:pb-12">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/improve" element={<Improve />} />
                <Route path="/learn" element={<Learn />} />
                <Route path="/examples" element={<Examples />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/practice" element={<Navigate to="/improve" replace />} />
                <Route path="/responsible-ai" element={<Navigate to="/learn#responsible-ai" replace />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/about" element={<About />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/history" element={<History />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<Home />} />
              </Routes>
            </main>
            <Footer />
            <BottomNav />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

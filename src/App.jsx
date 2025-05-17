import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Hero from './components/Hero'
import Services from './components/Services'
import Catalog from './components/Catalog'
import WhyUs from './components/WhyUs'
import AuthModal from './components/AuthModal'
import AccountModal from './components/AccountModal'
import BookingModal from './components/BookingModal'

function App() {
  const [isAuthModalOpen, setAuthModalOpen] = useState(false)
  const [isAccountModalOpen, setAccountModalOpen] = useState(false)
  const [isBookingModalOpen, setBookingModalOpen] = useState(false)
  const [user, setUser] = useState(null)

  const handleLogin = (userData) => {
    setUser(userData)
    setAuthModalOpen(false)
  }

  const handleLogout = () => {
    setUser(null)
  }

  return (
    <Router>
      <div className="app">
        <Header 
          user={user} 
          onLoginClick={() => setAuthModalOpen(true)} 
          onAccountClick={() => setAccountModalOpen(true)}
          onLogout={handleLogout}
        />
        
        <main>
          <Routes>
            <Route path="/" element={
              <>
                <Hero onBookClick={() => setBookingModalOpen(true)} />
                <Services />
                <Catalog />
                <WhyUs />
              </>
            } />
          </Routes>
        </main>

        <Footer />

        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setAuthModalOpen(false)} 
          onLogin={handleLogin}
        />
        
        <AccountModal 
          isOpen={isAccountModalOpen} 
          onClose={() => setAccountModalOpen(false)}
          user={user}
        />
        
        <BookingModal 
          isOpen={isBookingModalOpen} 
          onClose={() => setBookingModalOpen(false)}
          user={user}
        />
      </div>
    </Router>
  )
}

export default App
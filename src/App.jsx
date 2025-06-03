import React, { useState } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Login from './component/Login.jsx'
import GDayPlanner from './component/GDayPlanner.jsx'

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [userDetails, setUserDetails] = useState(null)

    const handleLoginSuccess = (userData) => {
        setUserDetails(userData)
        setIsLoggedIn(true)
    }

    const handleLogout = () => {
        setIsLoggedIn(false)
        setUserDetails(null)
    }

    return (
        <Router>
            <div className="App">
                <Toaster />
                {!isLoggedIn ? (
                    <Login onLoginSuccess={handleLoginSuccess} />
                ) : (
                    <GDayPlanner 
                        userDetails={userDetails}
                        onLogout={handleLogout}
                    />
                )}
            </div>
        </Router>
    )
}

export default App
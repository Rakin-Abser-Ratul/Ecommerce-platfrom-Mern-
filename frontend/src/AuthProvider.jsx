import React, { createContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('access_token')
  )
  const [user, setUser] = useState(null)

  // Keep state in sync if local storage changes or on initial mount
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    setIsAuthenticated(!!token)
  }, [])

  const login = (userData) => {
    setIsAuthenticated(true)
    if (userData) {
      setUser(userData)
    }
  }

  const logout = () => {
    // Clear storage centrally so components don't have to
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')

    // Trigger instant UI re-render across the entire app
    setIsAuthenticated(false)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
export { AuthContext }
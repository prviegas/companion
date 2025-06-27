import { createContext, useContext, useState, useEffect } from 'react'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth'
import { auth } from '../config/firebase'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Sign up function
  const signup = async (email, password) => {
    try {
      setError(null)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      console.log('✅ User created successfully:', userCredential.user.email)
      return userCredential
    } catch (error) {
      console.error('❌ Signup error:', error.message)
      setError(error.message)
      throw error
    }
  }

  // Login function
  const login = async (email, password) => {
    try {
      setError(null)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      console.log('✅ User logged in successfully:', userCredential.user.email)
      return userCredential
    } catch (error) {
      console.error('❌ Login error:', error.message)
      setError(error.message)
      throw error
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth)
      console.log('✅ User logged out successfully')
    } catch (error) {
      console.error('❌ Logout error:', error.message)
      setError(error.message)
    }
  }

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
      if (user) {
        console.log('🔐 User authenticated:', user.email)
      } else {
        console.log('🔓 User not authenticated')
      }
    })

    return unsubscribe
  }, [])

  const value = {
    user,
    loading,
    error,
    signup,
    login,
    logout,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext

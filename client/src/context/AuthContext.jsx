import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
 const [user, setUser] = useState(null)
 const [loading, setLoading] = useState(true)
 const [token, setToken] = useState(() => localStorage.getItem('token'))

 const loadUser = useCallback(async () => {
   if (!token) { setLoading(false); return }
   try {
     const { data } = await api.get('/auth/profile')
     setUser(data.user)
   } catch {
     localStorage.removeItem('token')
     setToken(null)
   } finally {
     setLoading(false)
   }
 }, [token])

 useEffect(() => { loadUser() }, [loadUser])

 const login = async (email, password) => {
   const { data } = await api.post('/auth/login', { email, password })
   localStorage.setItem('token', data.token)
   setToken(data.token)
   setUser(data.user)
   return data
 }

 const register = async (name, email, password) => {
   const { data } = await api.post('/auth/register', { name, email, password })
   localStorage.setItem('token', data.token)
   setToken(data.token)
   setUser(data.user)
   return data
 }

 const logout = () => {
   localStorage.removeItem('token')
   setToken(null)
   setUser(null)
   toast.success('Logged out successfully')
 }

 const updateUser = (updatedUser) => setUser(prev => ({ ...prev, ...updatedUser }))

 return (
 <AuthContext.Provider value={{ user, loading, token, login, register, logout, updateUser }}>
 {children}
 </AuthContext.Provider>
 )
}

export const useAuth = () => {
 const ctx = useContext(AuthContext)
 if (!ctx) throw new Error('useAuth must be used within AuthProvider')
 return ctx
}


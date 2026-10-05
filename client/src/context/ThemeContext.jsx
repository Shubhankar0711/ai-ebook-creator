import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

export const ThemeProvider = ({ children }) => {
 const [darkMode, setDarkMode] = useState(() => {
 const saved = localStorage.getItem('darkMode')
 return saved ? JSON.parse(saved) : window.matchMedia('(prefers-color-scheme: dark)').matches
 })

 useEffect(() => {
 if (darkMode) {
 document.documentElement.classList.add('dark')
 } else {
 document.documentElement.classList.remove('dark')
 }
 localStorage.setItem('darkMode', JSON.stringify(darkMode))
 }, [darkMode])

 const toggleDarkMode = () => setDarkMode(prev => !prev)
 const setLightMode = () => setDarkMode(false)
 const setDarkModeExplicit = () => setDarkMode(true)

 return (
 <ThemeContext.Provider value={{ darkMode, toggleDarkMode, setLightMode, setDarkMode: setDarkModeExplicit }}>
 {children}
 </ThemeContext.Provider>
 )
}

export const useTheme = () => {
 const ctx = useContext(ThemeContext)
 if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
 return ctx
}

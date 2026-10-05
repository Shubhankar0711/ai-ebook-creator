import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { SubscriptionProvider } from './context/SubscriptionContext'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/layouts/DashboardLayout'

import LandingPage        from './pages/LandingPage'
import LoginPage          from './pages/auth/LoginPage'
import RegisterPage       from './pages/auth/RegisterPage'
import DashboardPage      from './pages/DashboardPage'
import BooksPage          from './pages/BooksPage'
import NewBookPage        from './pages/NewBookPage'
import BookEditorPage     from './pages/BookEditorPage'
import BookPreviewPage    from './pages/BookPreviewPage'
import AnalyticsPage      from './pages/AnalyticsPage'
import FavoritesPage      from './pages/FavoritesPage'
import SettingsPage       from './pages/SettingsPage'
import PricingPage        from './pages/PricingPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import PrivacyPage        from './pages/PrivacyPage'
import TermsPage          from './pages/TermsPage'
import ContactPage        from './pages/ContactPage'

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <Router>
        <SubscriptionProvider>
          <Routes>
            {/* Public */}
            <Route path="/"         element={<LandingPage />} />
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/pricing"  element={<PricingPage />} />
            <Route path="/privacy"  element={<PrivacyPage />} />
            <Route path="/terms"    element={<TermsPage />} />
            <Route path="/contact"  element={<ContactPage />} />

            {/* Protected — Dashboard Layout */}
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/dashboard"     element={<DashboardPage />} />
              <Route path="/books"         element={<BooksPage />} />
              <Route path="/books/new"     element={<NewBookPage />} />
              <Route path="/favorites"     element={<FavoritesPage />} />
              <Route path="/analytics"     element={<AnalyticsPage />} />
              <Route path="/settings"      element={<SettingsPage />} />
              <Route path="/pricing-plans" element={<PricingPage />} />
              <Route path="/admin"         element={<AdminDashboardPage />} />
            </Route>

            {/* Full-screen (no sidebar) */}
            <Route path="/books/:id/edit"
              element={<ProtectedRoute><BookEditorPage /></ProtectedRoute>} />
            <Route path="/books/:id/preview"
              element={<ProtectedRoute><BookPreviewPage /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SubscriptionProvider>
      </Router>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '13px' },
          success: { iconTheme: { primary: '#7c3aed', secondary: '#fff' } },
        }}
      />
    </AuthProvider>
  </ThemeProvider>
)

export default App

import { Routes, Route, Navigate } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import BlogList from './pages/BlogList'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import { DashboardLayout } from './components/Layout/DashboardLayout'
import { DashboardHome } from './pages/DashboardHome'
import { DocumentGenerator } from './pages/DocumentGenerator'
import { ContractCheck } from './pages/ContractCheck'
import { AIConsultant } from './pages/AIConsultant'
import { CaseLaw } from './pages/CaseLaw'
import { LawMonitoring } from './pages/LawMonitoring'
import { Profile } from './pages/Profile'
import { SubscriptionPage } from './pages/SubscriptionPage'
import { DeveloperPage } from './pages/DeveloperPage'
import { Drive } from './pages/Drive'
import { AdminPanel } from './pages/AdminPanel'
import { PrivacyPolicy } from './pages/PrivacyPolicy'
import { TermsOfService } from './pages/TermsOfService'
import { NotFound } from './pages/NotFound'
import { useAuth } from './context/AuthContext'
import { Loader } from './components/ui/Loader'
import { CookieBanner } from './components/ui/CookieBanner'
import { SupportChat } from './components/SupportChat'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader size="lg" />
      </div>
    )
  }

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/blog" element={<BlogList />} />
        <Route path="/tools/marketplace-claim" element={<Navigate to="/dashboard/documents" />} />
        <Route path="/tools/consumer-claim" element={<Navigate to="/dashboard/documents" />} />
        <Route path="/tools/auto-fine" element={<Navigate to="/dashboard/documents" />} />
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/dashboard" />} />
        <Route path="/verify-email" element={!user ? <VerifyEmailPage /> : <Navigate to="/dashboard" />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />

        {/* Dashboard routes */}
        <Route path="/dashboard" element={user ? <DashboardLayout /> : <Navigate to="/login" />}>
          <Route index element={<DashboardHome />} />
          <Route path="documents" element={<DocumentGenerator />} />
          <Route path="contracts" element={<ContractCheck />} />
          <Route path="consultant" element={<AIConsultant />} />
          <Route path="case-law" element={<CaseLaw />} />
          <Route path="monitoring" element={<LawMonitoring />} />
          <Route path="profile" element={<Profile />} />
          <Route path="subscription" element={<SubscriptionPage />} />
          <Route path="developer" element={<DeveloperPage />} />
          <Route path="drive" element={<Drive />} />
          <Route path="admin" element={<AdminPanel />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <CookieBanner />
      <SupportChat />
    </>
  )
}

export default App

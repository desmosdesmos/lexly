import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ThemeModeProvider } from './context/ThemeModeContext'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '529068411405-lpiffe0n5pq007vfd7jvg1ne0p9qio47.apps.googleusercontent.com'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <ThemeModeProvider>
            <ErrorBoundary>
              <App />
              <ToastContainer position="top-right" autoClose={3000} />
            </ErrorBoundary>
          </ThemeModeProvider>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)

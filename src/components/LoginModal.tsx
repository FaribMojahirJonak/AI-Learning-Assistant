import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { EmailConfirmationModal } from './EmailConfirmationModal'
import './LoginModal.css'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  isSignUp?: boolean
  onToggleMode?: () => void
}

export const LoginModal: React.FC<LoginModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  isSignUp: initialIsSignUp = false,
  onToggleMode 
}) => {
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false)

  const { signIn, signUp } = useAuth()

  // Update internal state when prop changes
  useEffect(() => {
    setIsSignUp(initialIsSignUp)
  }, [initialIsSignUp])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = isSignUp 
        ? await signUp(email, password, 'https://ai-learning-assistant-hazel.vercel.app/')
        : await signIn(email, password)

      if (error) {
        setError(error.message)
      } else {
        if (isSignUp) {
          // Show email confirmation modal for signup
          setShowEmailConfirmation(true)
        } else {
          // For login, proceed normally
          onSuccess?.()
          onClose()
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    if (onToggleMode) {
      onToggleMode()
    } else {
      setIsSignUp(!isSignUp)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="login-modal-overlay" onClick={onClose}>
        <div className="login-modal" onClick={(e) => e.stopPropagation()}>
          <button className="login-modal-close" onClick={onClose}>&times;</button>
          <div className="login-modal-title">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </div>
          <form onSubmit={handleSubmit} className="login-modal-form">
            <label htmlFor="email" className="login-modal-label">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
              className="login-modal-input"
            />
            <label htmlFor="password" className="login-modal-label">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
              className="login-modal-input"
            />
            {error && <div className="login-modal-error">{error}</div>}
            <button 
              type="submit" 
              className="login-modal-btn"
              disabled={loading}
            >
              {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </form>
          <div className="login-modal-or">
            <div className="login-modal-or-line"></div>
            <span className="login-modal-or-text">or</span>
          </div>
          <button 
            className="login-modal-btn-google"
            disabled={loading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
          <div className="text-center mt-4">
            <p className="text-gray-600 text-sm">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button 
                type="button" 
                onClick={toggleMode}
                className="login-modal-toggle"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      </div>
      {/* Email Confirmation Modal */}
      <EmailConfirmationModal
        isOpen={showEmailConfirmation}
        onClose={() => {
          setShowEmailConfirmation(false)
          onClose()
        }}
        email={email}
      />
    </>
  )
} 
'use client'

import { useState } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabaseClient'

interface LoginFormProps {
  onShowSignUp: () => void
}

export default function LoginForm({ onShowSignUp }: LoginFormProps) {
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetMessage, setResetMessage] = useState('')
  const [resetLoading, setResetLoading] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetMessage('')
    setResetLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/`,
      })

      if (error) throw error

      setResetMessage('Sjekk e-posten din for lenke til å tilbakestille passord.')
      setResetEmail('')
    } catch (error: any) {
      setResetMessage('Feil: ' + error.message)
    } finally {
      setResetLoading(false)
    }
  }

  if (showForgotPassword) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Glemt passord?
          </h2>
          <p className="text-gray-600 mb-6 text-center text-sm">
            Skriv inn e-postadressen din, så sender vi deg en lenke for å tilbakestille passordet.
          </p>

          {resetMessage && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              resetMessage.includes('Feil')
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {resetMessage}
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-post
              </label>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                placeholder="din@epost.no"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={resetLoading}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {resetLoading ? 'Sender...' : 'Send tilbakestillingslenke'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setShowForgotPassword(false)
                setResetMessage('')
                setResetEmail('')
              }}
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              ← Tilbake til innlogging
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Logg inn
        </h2>
        
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#2563eb',
                  brandAccent: '#1d4ed8',
                }
              }
            }
          }}
          providers={[]}
          view="sign_in"
          showLinks={false}
          magicLink={false}
        />
        
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowForgotPassword(true)}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            Glemt passord?
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onShowSignUp}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Har du ikke konto? Registrer deg her
          </button>
        </div>
      </div>
    </div>
  )
}



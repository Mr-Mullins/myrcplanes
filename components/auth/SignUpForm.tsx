'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface SignUpFormProps {
  onSignUpSuccess: () => void
  onBack: () => void
}

export default function SignUpForm({ onSignUpSuccess, onBack }: SignUpFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passordene matcher ikke')
      return
    }

    if (formData.password.length < 6) {
      setMessage('Passordet må være minst 6 tegn')
      return
    }

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setMessage('Fornavn og etternavn er påkrevd')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName.trim(),
            last_name: formData.lastName.trim()
          }
        }
      })

      if (error) throw error

      setMessage('Registrering vellykket! Sjekk e-posten din for bekreftelseslenke.')
      
      setTimeout(() => {
        onSignUpSuccess()
      }, 2000)
    } catch (error: any) {
      setMessage('Feil ved registrering: ' + error.message)
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Opprett konto
        </h2>
        <p className="text-gray-600 mb-6 text-center text-sm">
          Fyll ut informasjonen nedenfor for å opprette en konto
        </p>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            message.includes('Feil') 
              ? 'bg-red-100 text-red-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fornavn *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                placeholder="Skriv inn fornavn"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Etternavn *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
                placeholder="Skriv inn etternavn"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-post *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="din@epost.no"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Passord *
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
              placeholder="Minst 6 tegn"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bekreft passord *
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              minLength={6}
              placeholder="Bekreft passordet"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Oppretter konto...' : 'Opprett konto'}
            </button>
            
            <button
              type="button"
              onClick={onBack}
              className="w-full px-4 py-3 bg-white text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition border border-gray-300"
            >
              Tilbake til innlogging
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}







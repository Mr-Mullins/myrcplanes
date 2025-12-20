'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import LoginForm from '@/components/auth/LoginForm'
import SignUpForm from '@/components/auth/SignUpForm'
import PlaneList from '@/components/planes/PlaneList'
import PlaneForm from '@/components/planes/PlaneForm'
import PlaneDetails from '@/components/planes/PlaneDetails'
import type { Session } from '@supabase/supabase-js'

export default function Home() {
  const [session, setSession] = useState<Session | null>(null)
  const [showSignUp, setShowSignUp] = useState(false)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'list' | 'form' | 'details'>('list')
  const [selectedPlane, setSelectedPlane] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Laster...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 flex items-center justify-center p-4">
        {showSignUp ? (
          <SignUpForm 
            onSignUpSuccess={() => setShowSignUp(false)}
            onBack={() => setShowSignUp(false)}
          />
        ) : (
          <LoginForm onShowSignUp={() => setShowSignUp(true)} />
        )}
      </div>
    )
  }

  const handleAddPlane = () => {
    setSelectedPlane(null)
    setView('form')
  }

  const handleSelectPlane = (plane: any) => {
    setSelectedPlane(plane)
    setView('details')
  }

  const handleEditPlane = () => {
    setView('form')
  }

  const handleFormSuccess = () => {
    setView('list')
    setSelectedPlane(null)
  }

  const handleFormCancel = () => {
    setView('list')
    setSelectedPlane(null)
  }

  const handleDetailsClose = () => {
    setView('list')
    setSelectedPlane(null)
  }

  const handlePlaneDeleted = () => {
    setView('list')
    setSelectedPlane(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My RC Planes</h1>
              <p className="text-gray-600 mt-1">Oversikt over fly</p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/calculator"
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                Kalkulator
              </a>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                Logg ut
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'list' && (
          <div className="bg-white rounded-lg shadow p-6">
            <PlaneList 
              onAddPlane={handleAddPlane}
              onSelectPlane={handleSelectPlane}
            />
          </div>
        )}

        {view === 'form' && (
          <PlaneForm
            plane={selectedPlane}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        )}

        {view === 'details' && selectedPlane && (
          <PlaneDetails
            plane={selectedPlane}
            onEdit={handleEditPlane}
            onClose={handleDetailsClose}
            onDeleted={handlePlaneDeleted}
          />
        )}
      </main>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import LoginForm from '@/components/auth/LoginForm'
import SignUpForm from '@/components/auth/SignUpForm'
import PlaneList from '@/components/planes/PlaneList'
import PlaneForm from '@/components/planes/PlaneForm'
import PlaneDetails from '@/components/planes/PlaneDetails'
import Header from '@/components/layout/Header'
import type { Session } from '@supabase/supabase-js'

export default function Home() {
  const [session, setSession] = useState<Session | null>(null)
  const [showSignUp, setShowSignUp] = useState(false)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'list' | 'form' | 'details'>('list')
  const [selectedPlane, setSelectedPlane] = useState<any>(null)
  const [allPlanes, setAllPlanes] = useState<any[]>([])

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

  const handlePlanesLoaded = (planes: any[]) => {
    setAllPlanes(planes)
  }

  const handleNextPlane = () => {
    if (!selectedPlane || allPlanes.length === 0) return
    const currentIndex = allPlanes.findIndex(p => p.id === selectedPlane.id)
    if (currentIndex < allPlanes.length - 1) {
      setSelectedPlane(allPlanes[currentIndex + 1])
    }
  }

  const handlePrevPlane = () => {
    if (!selectedPlane || allPlanes.length === 0) return
    const currentIndex = allPlanes.findIndex(p => p.id === selectedPlane.id)
    if (currentIndex > 0) {
      setSelectedPlane(allPlanes[currentIndex - 1])
    }
  }

  const getCurrentPlaneIndex = () => {
    if (!selectedPlane || allPlanes.length === 0) return { current: 0, total: 0 }
    const currentIndex = allPlanes.findIndex(p => p.id === selectedPlane.id)
    return { current: currentIndex + 1, total: allPlanes.length }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header session={session} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'list' && (
          <div className="bg-white rounded-lg shadow p-6">
            <PlaneList 
              onAddPlane={handleAddPlane}
              onSelectPlane={handleSelectPlane}
              onPlanesLoaded={handlePlanesLoaded}
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
            onNextPlane={handleNextPlane}
            onPrevPlane={handlePrevPlane}
            planeIndex={getCurrentPlaneIndex()}
          />
        )}
      </main>
    </div>
  )
}

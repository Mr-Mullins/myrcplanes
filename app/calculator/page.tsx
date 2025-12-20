'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Calculator from '@/components/calculator/Calculator'
import type { Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

export default function CalculatorPage() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

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
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Laster...</div>
      </div>
    )
  }

  if (!session) {
    router.push('/')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">RC Fly Kalkulator</h1>
              <p className="text-gray-600 mt-1">Beregn aerodynamiske data</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                Mine fly
              </button>
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
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Om kalkulatoren</p>
                <p>
                  Denne kalkulatoren beregner Mean Aerodynamic Chord (MAC) og anbefalt tyngdepunkt (CG) 
                  for ditt RC-fly basert på vingemålinger. Resultatene lagres ikke automatisk - hvis du 
                  vil lagre dem, gå til "Mine fly" og legg til et nytt fly der.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Calculator />
      </main>
    </div>
  )
}



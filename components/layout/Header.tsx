'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import type { Session } from '@supabase/supabase-js'

interface HeaderProps {
  session: Session
}

export default function Header({ session }: HeaderProps) {
  const [userProfile, setUserProfile] = useState<{
    first_name: string | null
    last_name: string | null
    avatar_url: string | null
  } | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    fetchUserProfile()
  }, [session])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchUserProfile = async () => {
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('first_name, last_name, avatar_url')
        .eq('user_id', session.user.id)
        .single()

      if (data) {
        setUserProfile(data)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const getUserInitials = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name[0]}${userProfile.last_name[0]}`.toUpperCase()
    }
    return session.user.email?.[0]?.toUpperCase() || 'U'
  }

  const getUserDisplayName = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name} ${userProfile.last_name}`
    }
    if (userProfile?.first_name) {
      return userProfile.first_name
    }
    return session.user.email?.split('@')[0] || 'Bruker'
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* RC Plane Logo */}
            <svg className="h-12 w-12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Main fuselage */}
              <ellipse cx="50" cy="50" rx="8" ry="25" fill="#3B82F6" />
              
              {/* Cockpit window */}
              <circle cx="50" cy="40" r="4" fill="#60A5FA" />
              
              {/* Main wings */}
              <ellipse cx="50" cy="50" rx="45" ry="8" fill="#2563EB" />
              <ellipse cx="50" cy="50" rx="45" ry="6" fill="#3B82F6" />
              
              {/* Wing tips (ailerons) */}
              <rect x="8" y="48" width="8" height="4" rx="1" fill="#1E40AF" />
              <rect x="84" y="48" width="8" height="4" rx="1" fill="#1E40AF" />
              
              {/* Tail wing */}
              <ellipse cx="50" cy="70" rx="18" ry="4" fill="#2563EB" />
              
              {/* Vertical stabilizer */}
              <path d="M50 65 L50 75 L56 72 Z" fill="#1E40AF" />
              
              {/* Propeller */}
              <ellipse cx="50" cy="28" rx="2" ry="8" fill="#6B7280" opacity="0.6" />
              <ellipse cx="50" cy="28" rx="8" ry="2" fill="#6B7280" opacity="0.6" />
              
              {/* Nose cone */}
              <circle cx="50" cy="25" r="3" fill="#60A5FA" />
              
              {/* Landing gear */}
              <line x1="45" y1="60" x2="45" y2="68" stroke="#374151" strokeWidth="1.5" />
              <line x1="55" y1="60" x2="55" y2="68" stroke="#374151" strokeWidth="1.5" />
              <circle cx="45" cy="68" r="2" fill="#1F2937" />
              <circle cx="55" cy="68" r="2" fill="#1F2937" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-900 hidden sm:block">Mine RC-fly</h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => router.push('/')}
              className="text-gray-700 hover:text-blue-600 font-medium transition"
            >
              Mine fly
            </button>
            <button
              onClick={() => router.push('/calculator')}
              className="text-gray-700 hover:text-blue-600 font-medium transition"
            >
              Kalkulator
            </button>
            <button
              onClick={() => router.push('/locations')}
              className="text-gray-700 hover:text-blue-600 font-medium transition"
            >
              Sikker flyving
            </button>
          </nav>

          {/* User Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition"
            >
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-gray-900">{getUserDisplayName()}</div>
                <div className="text-xs text-gray-500">{session.user.email}</div>
              </div>
              
              {userProfile?.avatar_url ? (
                <img
                  src={userProfile.avatar_url}
                  alt="Profilbilde"
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold border-2 border-gray-200">
                  {getUserInitials()}
                </div>
              )}

              <svg
                className={`h-5 w-5 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                <div className="px-4 py-3 border-b border-gray-200">
                  <div className="text-sm font-medium text-gray-900">{getUserDisplayName()}</div>
                  <div className="text-xs text-gray-500 mt-1">{session.user.email}</div>
                </div>
                
                <button
                  onClick={() => {
                    router.push('/profile')
                    setShowDropdown(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                >
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Min profil
                </button>

                <button
                  onClick={() => {
                    router.push('/')
                    setShowDropdown(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 md:hidden"
                >
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Mine fly
                </button>

                <button
                  onClick={() => {
                    router.push('/calculator')
                    setShowDropdown(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 md:hidden"
                >
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Kalkulator
                </button>

                <button
                  onClick={() => {
                    router.push('/locations')
                    setShowDropdown(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 md:hidden"
                >
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Sikker flyving
                </button>

                <div className="border-t border-gray-200 mt-2 pt-2">
                  <button
                    onClick={() => {
                      handleSignOut()
                      setShowDropdown(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logg ut
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}


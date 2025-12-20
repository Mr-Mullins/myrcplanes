'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabaseClient'

interface LoginFormProps {
  onShowSignUp: () => void
}

export default function LoginForm({ onShowSignUp }: LoginFormProps) {
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


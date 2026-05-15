'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/lib/store'

export default function AuthCallbackPage() {
  const router = useRouter()
  const login = useStore(s => s.login)

  useEffect(() => {
    const handleCallback = async () => {
      if (!supabase) {
        router.push('/login')
        return
      }

      try {
        const code = new URLSearchParams(window.location.search).get('code')

        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          if (!error && data.user) {
            const user = data.user
            const name =
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              user.email?.split('@')[0] ||
              'User'
            login({ id: user.id, name, email: user.email!, createdAt: user.created_at })
            router.push('/dashboard')
            return
          }
        }

        // Fallback: check for existing session (implicit flow)
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const user = session.user
          const name =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split('@')[0] ||
            'User'
          login({ id: user.id, name, email: user.email!, createdAt: user.created_at })
          router.push('/dashboard')
          return
        }

        router.push('/login?error=auth_failed')
      } catch {
        router.push('/login?error=auth_failed')
      }
    }

    handleCallback()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-cyan-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-200">
          <Sparkles className="w-6 h-6 text-white animate-pulse" />
        </div>
        <p className="text-gray-600 font-medium">Signing you in...</p>
        <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mt-3" />
      </div>
    </div>
  )
}

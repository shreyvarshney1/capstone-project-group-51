"use client"

import "@/lib/i18n"
import { SessionProvider } from "next-auth/react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useEffect } from "react"

import { useSession } from "next-auth/react"

function AuthHydrator({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const { setAuth, clearAuth } = useAuthStore()

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setAuth(
        session.user as any,
        (session as any).accessToken || '',
        (session as any).refreshToken || ''
      )
    } else if (status === 'unauthenticated') {
      clearAuth()
    }
  }, [session, status, setAuth, clearAuth])

  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthHydrator>
        {children}
      </AuthHydrator>
    </SessionProvider>
  )
}

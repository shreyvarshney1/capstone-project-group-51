"use client"

import "@/lib/i18n"
import { SessionProvider } from "next-auth/react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useEffect } from "react"

function AuthHydrator({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useAuthStore.persist.rehydrate()
  }, [])

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

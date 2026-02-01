"use client"

import { SessionProvider } from "next-auth/react"
import { LanguageProvider } from "@/components/language-selector"
import { AccessibilityProvider } from "@/components/accessibility-panel"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AccessibilityProvider>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </AccessibilityProvider>
    </SessionProvider>
  )
}

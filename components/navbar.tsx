"use client"

import Link from "next/link"
import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={session ? "/dashboard" : "/"} className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          CivicConnect
        </Link>

        <div className="flex items-center gap-6">
          {session ? (
            <>
              <div className="hidden md:flex items-center gap-6 text-sm font-medium">
                <Link href="/dashboard" className="transition-colors hover:text-foreground/80 text-foreground/60">
                  Dashboard
                </Link>
                <Link href="/map" className="transition-colors hover:text-foreground/80 text-foreground/60">
                  Map
                </Link>
                <Link href="/report" className="transition-colors hover:text-foreground/80 text-foreground/60">
                  Report Issue
                </Link>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 border-2 border-gray-100 dark:border-gray-800">
                    <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                    <AvatarFallback>{session.user?.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden md:inline-block">
                    {session.user?.name}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => signOut({ callbackUrl: "/" })} 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  Log out
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/map" className="text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60 hidden md:block">
                Live Map
              </Link>
              <Button onClick={() => signIn()} size="sm">Sign In</Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

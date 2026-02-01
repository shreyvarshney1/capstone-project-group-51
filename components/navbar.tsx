"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationBell } from "@/components/notification-bell";
import { LanguageSelector } from "@/components/language-selector";
import { AccessibilityButton } from "@/components/accessibility-panel";
import { OfflineIndicator } from "@/components/offline-indicator";
import { Menu, X, LogOut } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userRole = (session?.user as any)?.role;

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link
            href={session ? "/dashboard" : "/"}
            className="text-xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
          >
            CivicConnect
          </Link>
          <OfflineIndicator showSyncButton={false} />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {session ? (
            <>
              <div className="flex items-center gap-6 text-sm font-medium">
                <Link
                  href="/dashboard"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Dashboard
                </Link>
                <Link
                  href="/feed"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Public Feed
                </Link>
                <Link
                  href="/map"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Map
                </Link>
                <Link
                  href="/report"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Report Issue
                </Link>
                {(userRole === "WARD_OFFICER" ||
                  userRole === "BLOCK_OFFICER" ||
                  userRole === "DISTRICT_OFFICER" ||
                  userRole === "STATE_OFFICER" ||
                  userRole === "ADMIN" ||
                  userRole === "SUPER_ADMIN") && (
                  <Link
                    href="/officer"
                    className="transition-colors hover:text-foreground/80 text-foreground/60"
                  >
                    Officer Dashboard
                  </Link>
                )}
                {(userRole === "ADMIN" || userRole === "SUPER_ADMIN") && (
                  <Link
                    href="/admin"
                    className="transition-colors hover:text-foreground/80 text-foreground/60"
                  >
                    Admin
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-2">
                <LanguageSelector />
                <AccessibilityButton />
                <NotificationBell />

                <div className="flex items-center gap-2 ml-2 pl-2 border-l">
                  <Avatar className="h-8 w-8 border-2 border-border">
                    <AvatarImage
                      src={session.user?.image || ""}
                      alt={session.user?.name || ""}
                    />
                    <AvatarFallback>{session.user?.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:block">
                    <span className="text-sm font-medium">
                      {session.user?.name}
                    </span>
                    {userRole && userRole !== "CITIZEN" && (
                      <span className="text-xs text-muted-foreground block">
                        {userRole.replace("_", " ")}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <AccessibilityButton />
              <Link
                href="/feed"
                className="text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Public Feed
              </Link>
              <Link
                href="/map"
                className="text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Live Map
              </Link>
              <Button onClick={() => signIn()} size="sm">
                Sign In
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          {session && <NotificationBell />}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background p-4 space-y-4">
          {session ? (
            <>
              <div className="flex items-center gap-3 pb-4 border-b">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={session.user?.image || ""} />
                  <AvatarFallback>{session.user?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{session.user?.name}</div>
                  {userRole && (
                    <div className="text-xs text-muted-foreground">
                      {userRole.replace("_", " ")}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Link
                  href="/dashboard"
                  className="block py-2 text-sm font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/feed"
                  className="block py-2 text-sm font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Public Feed
                </Link>
                <Link
                  href="/map"
                  className="block py-2 text-sm font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Map
                </Link>
                <Link
                  href="/report"
                  className="block py-2 text-sm font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Report Issue
                </Link>
                {(userRole === "WARD_OFFICER" ||
                  userRole === "BLOCK_OFFICER" ||
                  userRole === "DISTRICT_OFFICER" ||
                  userRole === "STATE_OFFICER" ||
                  userRole === "ADMIN" ||
                  userRole === "SUPER_ADMIN") && (
                  <Link
                    href="/officer"
                    className="block py-2 text-sm font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Officer Dashboard
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-4 pt-4 border-t">
                <LanguageSelector />
                <AccessibilityButton />
              </div>
              <Button
                variant="outline"
                className="w-full text-red-600"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Log out
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Link
                  href="/feed"
                  className="block py-2 text-sm font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Public Feed
                </Link>
                <Link
                  href="/map"
                  className="block py-2 text-sm font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Live Map
                </Link>
              </div>
              <div className="flex items-center gap-4 pt-4 border-t">
                <LanguageSelector />
                <AccessibilityButton />
              </div>
              <Button className="w-full" onClick={() => signIn()}>
                Sign In
              </Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

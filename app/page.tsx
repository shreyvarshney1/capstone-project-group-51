import Link from "next/link"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { Button } from "@/components/ui/button"
import { MapPin, ClipboardList, CheckCircle2, ArrowRight, Users, Zap } from "lucide-react"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section with Gradient */}
      <section className="relative w-full py-12 md:py-24 lg:py-32 xl:py-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20" />
        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <div className="flex flex-col items-center space-y-8 text-center">
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-white">
                CivicConnect
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-100 text-lg md:text-xl leading-relaxed">
                Empowering citizens to build better communities. Report issues, track progress, and work together for a better city.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-xl">
                <Link href="/report">
                  Report an Issue <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-white border-2 border-white hover:bg-white/20 backdrop-blur-sm hover:scale-105 transition-all duration-300">
                <Link href="/map">View Live Map</Link>
              </Button>
            </div>
            
            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-8 mt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-white">500+</p>
                <p className="text-sm text-gray-200 mt-1">Issues Resolved</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-white">1.2k+</p>
                <p className="text-sm text-gray-200 mt-1">Active Users</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-white">98%</p>
                <p className="text-sm text-gray-200 mt-1">Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose CivicConnect?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A powerful platform designed to make civic engagement simple and effective
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="group relative flex flex-col items-center space-y-4 p-6 text-center rounded-2xl border bg-white dark:bg-gray-950 hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow">
                <MapPin className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-xl font-bold">Geolocation Tagging</h2>
              <p className="text-muted-foreground">
                Automatically tag the exact location of issues using your device's GPS or by selecting on the map.
              </p>
            </div>
            <div className="group relative flex flex-col items-center space-y-4 p-6 text-center rounded-2xl border bg-white dark:bg-gray-950 hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="p-4 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow">
                <Zap className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-xl font-bold">Real-time Tracking</h2>
              <p className="text-muted-foreground">
                Track the status of your reported issues from submission to resolution with real-time updates.
              </p>
            </div>
            <div className="group relative flex flex-col items-center space-y-4 p-6 text-center rounded-2xl border bg-white dark:bg-gray-950 hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="p-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-xl font-bold">Community Impact</h2>
              <p className="text-muted-foreground">
                See the impact of your contributions and how they help improve the neighborhood for everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Simple steps to make your community better
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="relative text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Report</h3>
              <p className="text-muted-foreground">
                Spot an issue in your neighborhood? Take a photo and report it with just a few taps.
              </p>
            </div>
            <div className="relative text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Track</h3>
              <p className="text-muted-foreground">
                Monitor the progress of your report and receive updates as authorities take action.
              </p>
            </div>
            <div className="relative text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-pink-600 to-red-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Resolve</h3>
              <p className="text-muted-foreground">
                See the impact of your contribution as issues get resolved and your community improves.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 md:py-24 lg:py-32 border-t bg-gradient-to-br from-white to-gray-50 dark:from-black dark:to-gray-900">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center space-y-6 text-center">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Ready to make a difference?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground text-lg">
                Join thousands of citizens who are already using CivicConnect to improve their cities.
              </p>
            </div>
            <div className="w-full max-w-sm">
              <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300" size="lg">
                <Link href="/api/auth/signin">Get Started Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-gray-50 dark:bg-gray-950">
        <p className="text-xs text-muted-foreground">
          © 2024 CivicConnect. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4 text-muted-foreground hover:text-foreground transition-colors" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4 text-muted-foreground hover:text-foreground transition-colors" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}

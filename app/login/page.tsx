"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError("")
  }

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      if (isRegister) {
        // Register new user
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })

        const data = await res.json()

        if (!res.ok) {
          setError(data.error || "Registration failed")
          setIsLoading(false)
          return
        }

        // Auto sign in after registration
        const signInResult = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        })

        if (signInResult?.error) {
          setError("Registration successful. Please sign in.")
          setIsRegister(false)
        } else {
          router.push("/dashboard")
        }
      } else {
        // Sign in
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        })

        if (result?.error) {
          setError("Invalid email or password")
        } else {
          router.push("/dashboard")
        }
      }
    } catch {
      setError("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader className="text-center">
          <CardTitle>{isRegister ? "Create an account" : "Welcome back"}</CardTitle>
          <CardDescription>
            {isRegister
              ? "Enter your details to create your account"
              : "Sign in to your account to continue"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCredentialsSubmit} className="grid gap-4">
            {isRegister && (
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
              {isRegister ? "Sign Up" : "Sign In"}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            disabled={isLoading}
          >
            <Icons.google className="mr-2 h-4 w-4" />
            Google
          </Button>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              className="text-primary hover:underline font-medium"
              onClick={() => {
                setIsRegister(!isRegister)
                setError("")
              }}
              disabled={isLoading}
            >
              {isRegister ? "Sign in" : "Sign up"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

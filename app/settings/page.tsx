"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLanguage, SUPPORTED_LANGUAGES, SupportedLanguage } from "@/components/language-selector"
import { useAccessibility } from "@/components/accessibility-panel"
import {
  User,
  Bell,
  Globe,
  Settings,
  Shield,
  Eye,
  Moon,
  Sun,
  Smartphone,
  Mail,
  MessageSquare,
  Save,
  RefreshCw,
  Check,
  Type,
  Contrast
} from "lucide-react"

interface NotificationPreferences {
  email: boolean
  sms: boolean
  push: boolean
  whatsapp: boolean
  statusUpdates: boolean
  comments: boolean
  votes: boolean
  escalations: boolean
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const { language, setLanguage } = useLanguage()
  const { resolvedTheme, setTheme } = useTheme()
  const { settings: accessibilitySettings, updateSettings: updateAccessibility, resetSettings: resetAccessibility } = useAccessibility()

  const [isSaving, setIsSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState("")

  const [notifications, setNotifications] = useState<NotificationPreferences>({
    email: true,
    sms: false,
    push: true,
    whatsapp: false,
    statusUpdates: true,
    comments: true,
    votes: false,
    escalations: true,
  })

  const [phoneNumber, setPhoneNumber] = useState("")

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      redirect("/login")
    }

    // Load user preferences from API
    loadPreferences()
  }, [session, status])

  const loadPreferences = async () => {
    try {
      const response = await fetch("/api/user")
      if (response.ok) {
        const data = await response.json()
        // Load notification preferences if they exist
        if (data.notificationPreferences) {
          setNotifications(data.notificationPreferences)
        }
        if (data.phone) {
          setPhoneNumber(data.phone)
        }
        // Sync accessibility settings from server if available
        if (data.accessibilityMode !== undefined) {
          // Server has stored settings, could sync them
        }
      }
    } catch (error) {
      console.error("Failed to load preferences:", error)
    }
  }

  const savePreferences = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferredLanguage: language,
          phone: phoneNumber || undefined,
          accessibilityMode: (resolvedTheme === 'dark') || accessibilitySettings.highContrast,
          highContrastMode: accessibilitySettings.highContrast,
          fontSize: accessibilitySettings.fontSize === "extra-large" ? "EXTRA_LARGE"
            : accessibilitySettings.fontSize === "large" ? "LARGE"
              : "MEDIUM",
        }),
      })

      if (response.ok) {
        setSavedMessage("Settings saved successfully!")
        setTimeout(() => setSavedMessage(""), 3000)
      } else {
        throw new Error("Failed to save")
      }
    } catch (error) {
      console.error("Failed to save preferences:", error)
      setSavedMessage("Failed to save settings")
      setTimeout(() => setSavedMessage(""), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const toggleNotification = (key: keyof NotificationPreferences) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
  }

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and notifications
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={session?.user?.image || undefined} />
                <AvatarFallback className="text-lg">
                  {session?.user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-lg">{session?.user?.name}</div>
                <div className="text-muted-foreground">{session?.user?.email}</div>
                <Badge variant="outline" className="mt-1">
                  {(session?.user as any)?.role?.replace("_", " ") || "Citizen"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Language
            </CardTitle>
            <CardDescription>Choose your preferred language</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Display Language</Label>
                <Select value={language} onValueChange={(v) => setLanguage(v as SupportedLanguage)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SUPPORTED_LANGUAGES).map(([code, { name, nativeName }]) => (
                      <SelectItem key={code} value={code}>
                        {nativeName} ({name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accessibility Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Accessibility
            </CardTitle>
            <CardDescription>Customize your viewing experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Dark Mode */}
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  {resolvedTheme === 'dark' ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                  <div>
                    <Label>Dark Mode</Label>
                    <p className="text-xs text-muted-foreground">Switch between light and dark theme</p>
                  </div>
                </div>
                <Button
                  variant={resolvedTheme === 'dark' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                >
                  {resolvedTheme === 'dark' ? "On" : "Off"}
                </Button>
              </div>

              {/* High Contrast */}
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Contrast className="h-5 w-5" />
                  <div>
                    <Label>High Contrast</Label>
                    <p className="text-xs text-muted-foreground">Increase color contrast</p>
                  </div>
                </div>
                <Button
                  variant={accessibilitySettings.highContrast ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateAccessibility({ highContrast: !accessibilitySettings.highContrast })}
                >
                  {accessibilitySettings.highContrast ? "On" : "Off"}
                </Button>
              </div>

              {/* Font Size */}
              <div className="flex items-center justify-between p-4 rounded-lg border col-span-full">
                <div className="flex items-center gap-3">
                  <Type className="h-5 w-5" />
                  <div>
                    <Label>Font Size</Label>
                    <p className="text-xs text-muted-foreground">Adjust text size for better readability</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {(["normal", "large", "extra-large"] as const).map(size => (
                    <Button
                      key={size}
                      variant={accessibilitySettings.fontSize === size ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateAccessibility({ fontSize: size })}
                    >
                      {size === "extra-large" ? "XL" : size === "large" ? "L" : "A"}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={resetAccessibility}>
              Reset to Defaults
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </CardTitle>
            <CardDescription>Choose how you want to be notified</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Channels */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Notification Channels</Label>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>Email</span>
                  </div>
                  <Button
                    variant={notifications.email ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleNotification("email")}
                  >
                    {notifications.email ? "On" : "Off"}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <span>SMS</span>
                  </div>
                  <Button
                    variant={notifications.sms ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleNotification("sms")}
                  >
                    {notifications.sms ? "On" : "Off"}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <span>Push Notifications</span>
                  </div>
                  <Button
                    variant={notifications.push ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleNotification("push")}
                  >
                    {notifications.push ? "On" : "Off"}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span>WhatsApp</span>
                  </div>
                  <Button
                    variant={notifications.whatsapp ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleNotification("whatsapp")}
                  >
                    {notifications.whatsapp ? "On" : "Off"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Phone Number for SMS/WhatsApp */}
            {(notifications.sms || notifications.whatsapp) && (
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Required for SMS and WhatsApp notifications
                </p>
              </div>
            )}

            {/* Notification Types */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Notify Me About</Label>
              <div className="space-y-2">
                {[
                  { key: "statusUpdates" as const, label: "Status updates on my issues" },
                  { key: "comments" as const, label: "New comments on my issues" },
                  { key: "votes" as const, label: "Votes on my issues" },
                  { key: "escalations" as const, label: "Issue escalations" },
                ].map(item => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <span>{item.label}</span>
                    <Button
                      variant={notifications[item.key] ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleNotification(item.key)}
                    >
                      {notifications[item.key] ? "On" : "Off"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacy
            </CardTitle>
            <CardDescription>Control your privacy settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <Label>Anonymous Reporting</Label>
                  <p className="text-xs text-muted-foreground">
                    Hide your name from public issue feed
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Off
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <Label>Profile Visibility</Label>
                  <p className="text-xs text-muted-foreground">
                    Show your profile to other users
                  </p>
                </div>
                <Button variant="default" size="sm">
                  On
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-4">
          {savedMessage && (
            <div className="flex items-center gap-2 text-green-600">
              <Check className="h-4 w-4" />
              <span className="text-sm">{savedMessage}</span>
            </div>
          )}
          <Button onClick={savePreferences} disabled={isSaving}>
            {isSaving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  )
}

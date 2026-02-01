"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VoteButton } from "@/components/vote-button"
import { Bell, BellOff, Check, X, AlertTriangle, MessageSquare, ArrowUp, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  data?: {
    issueId?: string
  }
  read: boolean
  createdAt: string
}

export function NotificationBell() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (session) {
      fetchNotifications()
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [session])

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications?unread=false&pageSize=10")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.data)
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    }
  }

  const markAsRead = async (notificationIds?: string[]) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationIds,
          markAll: !notificationIds
        })
      })

      if (response.ok) {
        if (notificationIds) {
          setNotifications(prev => prev.map(n => 
            notificationIds.includes(n.id) ? { ...n, read: true } : n
          ))
          setUnreadCount(prev => Math.max(0, prev - notificationIds.length))
        } else {
          setNotifications(prev => prev.map(n => ({ ...n, read: true })))
          setUnreadCount(0)
        }
      }
    } catch (error) {
      console.error("Failed to mark as read:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "STATUS_UPDATE":
        return <Check className="h-4 w-4 text-green-600" />
      case "COMMENT_ADDED":
        return <MessageSquare className="h-4 w-4 text-blue-600" />
      case "VOTE_RECEIVED":
        return <ArrowUp className="h-4 w-4 text-purple-600" />
      case "ESCALATION":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case "SLA_WARNING":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "SLA_BREACH":
        return <X className="h-4 w-4 text-red-600" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  if (!session) return null

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <Card className="absolute right-0 top-12 w-80 max-h-96 overflow-hidden z-50 shadow-lg">
            <CardHeader className="py-3 px-4 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Notifications</CardTitle>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => markAsRead()}
                  disabled={isLoading}
                >
                  Mark all read
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0 max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  <BellOff className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No notifications yet
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map(notification => (
                    <Link
                      key={notification.id}
                      href={notification.data?.issueId ? `/issues/${notification.data.issueId}` : "#"}
                      onClick={() => {
                        if (!notification.read) {
                          markAsRead([notification.id])
                        }
                        setIsOpen(false)
                      }}
                      className={`block p-3 hover:bg-muted/50 transition-colors ${
                        !notification.read ? "bg-blue-50 dark:bg-blue-950/20" : ""
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="flex-shrink-0">
                            <div className="h-2 w-2 bg-blue-600 rounded-full" />
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

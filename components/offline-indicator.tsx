"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wifi, WifiOff, RefreshCw, Cloud, CloudOff } from "lucide-react"

interface OfflineIndicatorProps {
  showSyncButton?: boolean
  onSync?: () => Promise<void>
}

export function OfflineIndicator({ showSyncButton = true, onSync }: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingDrafts, setPendingDrafts] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSynced, setLastSynced] = useState<Date | null>(null)

  useEffect(() => {
    // Set initial online state
    setIsOnline(navigator.onLine)

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Check for pending drafts in IndexedDB
    checkPendingDrafts()

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && pendingDrafts > 0) {
      handleSync()
    }
  }, [isOnline, pendingDrafts])

  const checkPendingDrafts = async () => {
    try {
      // Check IndexedDB for pending drafts
      if (typeof indexedDB !== "undefined") {
        const db = await openDatabase()
        const transaction = db.transaction(["drafts"], "readonly")
        const store = transaction.objectStore("drafts")
        const countRequest = store.count()

        countRequest.onsuccess = () => {
          setPendingDrafts(countRequest.result)
        }
      }
    } catch (error) {
      console.error("Failed to check pending drafts:", error)
    }
  }

  const openDatabase = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("civicconnect_offline", 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains("drafts")) {
          db.createObjectStore("drafts", { keyPath: "id" })
        }
      }
    })
  }

  const handleSync = async () => {
    if (isSyncing || !isOnline) return

    setIsSyncing(true)
    try {
      if (onSync) {
        await onSync()
      } else {
        // Default sync behavior
        await syncDrafts()
      }
      setLastSynced(new Date())
      setPendingDrafts(0)
    } catch (error) {
      console.error("Sync failed:", error)
    } finally {
      setIsSyncing(false)
    }
  }

  const syncDrafts = async () => {
    try {
      const db = await openDatabase()
      const transaction = db.transaction(["drafts"], "readonly")
      const store = transaction.objectStore("drafts")
      const getAllRequest = store.getAll()

      return new Promise<void>((resolve, reject) => {
        getAllRequest.onsuccess = async () => {
          const drafts = getAllRequest.result

          if (drafts.length === 0) {
            resolve()
            return
          }

          try {
            const response = await fetch("/api/offline", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "bulkSync",
                drafts,
              }),
            })

            if (response.ok) {
              // Clear synced drafts
              const deleteTransaction = db.transaction(["drafts"], "readwrite")
              const deleteStore = deleteTransaction.objectStore("drafts")
              for (const draft of drafts) {
                deleteStore.delete(draft.id)
              }
              resolve()
            } else {
              reject(new Error("Failed to sync drafts"))
            }
          } catch (error) {
            reject(error)
          }
        }

        getAllRequest.onerror = () => reject(getAllRequest.error)
      })
    } catch (error) {
      throw error
    }
  }

  // Don't show anything if online with no pending drafts
  if (isOnline && pendingDrafts === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      {/* Online/Offline Status */}
      <Badge
        variant={isOnline ? "default" : "destructive"}
        className="flex items-center gap-1"
      >
        {isOnline ? (
          <>
            <Wifi className="h-3 w-3" />
            <span className="hidden sm:inline">Online</span>
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            <span className="hidden sm:inline">Offline</span>
          </>
        )}
      </Badge>

      {/* Pending Drafts Indicator */}
      {pendingDrafts > 0 && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <CloudOff className="h-3 w-3" />
          <span>{pendingDrafts} pending</span>
        </Badge>
      )}

      {/* Sync Button */}
      {showSyncButton && pendingDrafts > 0 && isOnline && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSync}
          disabled={isSyncing}
          className="h-7 px-2"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
          <span className="ml-1 hidden sm:inline">
            {isSyncing ? "Syncing..." : "Sync"}
          </span>
        </Button>
      )}

      {/* Syncing Status */}
      {isSyncing && (
        <Badge variant="outline" className="flex items-center gap-1">
          <Cloud className="h-3 w-3 animate-pulse" />
          <span>Syncing...</span>
        </Badge>
      )}
    </div>
  )
}

// Hook for saving drafts offline
export function useOfflineDraft(formKey?: string) {
  const [isSaving, setIsSaving] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [draft, setDraft] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine)

      const handleOnline = () => setIsOnline(true)
      const handleOffline = () => setIsOnline(false)

      window.addEventListener("online", handleOnline)
      window.addEventListener("offline", handleOffline)

      // Load existing draft for this form key
      if (formKey) {
        loadDraft(formKey)
      }

      return () => {
        window.removeEventListener("online", handleOnline)
        window.removeEventListener("offline", handleOffline)
      }
    }
  }, [formKey])

  const loadDraft = async (key: string) => {
    try {
      const db = await openDatabase()
      const transaction = db.transaction(["drafts"], "readonly")
      const store = transaction.objectStore("drafts")

      return new Promise<void>((resolve) => {
        const request = store.get(`draft_${key}`)
        request.onsuccess = () => {
          if (request.result) {
            setDraft(request.result)
          }
          resolve()
        }
        request.onerror = () => resolve()
      })
    } catch {
      // Ignore errors
    }
  }

  const saveDraft = async (draftData: Record<string, any>) => {
    if (!formKey) return

    setIsSaving(true)
    try {
      const db = await openDatabase()
      const transaction = db.transaction(["drafts"], "readwrite")
      const store = transaction.objectStore("drafts")

      const fullDraft = {
        id: `draft_${formKey}`,
        ...draftData,
        savedAt: new Date().toISOString(),
      }

      return new Promise<void>((resolve, reject) => {
        const request = store.put(fullDraft)
        request.onsuccess = () => {
          setDraft(fullDraft)
          resolve()
        }
        request.onerror = () => reject(request.error)
      })
    } finally {
      setIsSaving(false)
    }
  }

  const clearDraft = async () => {
    if (!formKey) return

    try {
      const db = await openDatabase()
      const transaction = db.transaction(["drafts"], "readwrite")
      const store = transaction.objectStore("drafts")

      return new Promise<void>((resolve, reject) => {
        const request = store.delete(`draft_${formKey}`)
        request.onsuccess = () => {
          setDraft(null)
          resolve()
        }
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error("Failed to clear draft:", error)
    }
  }

  const getDrafts = async () => {
    try {
      const db = await openDatabase()
      const transaction = db.transaction(["drafts"], "readonly")
      const store = transaction.objectStore("drafts")

      return new Promise<any[]>((resolve, reject) => {
        const request = store.getAll()
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
    } catch {
      return []
    }
  }

  const deleteDraft = async (id: string) => {
    try {
      const db = await openDatabase()
      const transaction = db.transaction(["drafts"], "readwrite")
      const store = transaction.objectStore("drafts")

      return new Promise<void>((resolve, reject) => {
        const request = store.delete(id)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error("Failed to delete draft:", error)
    }
  }

  return { draft, saveDraft, clearDraft, getDrafts, deleteDraft, isSaving, isOnline }
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("civicconnect_offline", 1)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains("drafts")) {
        db.createObjectStore("drafts", { keyPath: "id" })
      }
    }
  })
}

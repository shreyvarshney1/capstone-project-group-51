// =============================================
// OFFLINE SYNC SERVICE
// Handles offline drafts and synchronization
// =============================================

import { prisma } from "@/lib/prisma"
import { OfflineDraftData, SyncResult } from "@/types"

/**
 * Save an offline draft
 */
export async function saveOfflineDraft(
  userId: string,
  data: OfflineDraftData
): Promise<string> {
  const draft = await prisma.offlineDraft.create({
    data: {
      userId,
      data: data as any,
      synced: false
    }
  })

  return draft.id
}

/**
 * Get all pending offline drafts for a user
 */
export async function getPendingDrafts(userId: string) {
  return prisma.offlineDraft.findMany({
    where: {
      userId,
      synced: false
    },
    orderBy: {
      createdAt: "desc"
    }
  })
}

/**
 * Sync a single offline draft
 */
export async function syncOfflineDraft(
  draftId: string,
  userId: string
): Promise<SyncResult> {
  try {
    const draft = await prisma.offlineDraft.findFirst({
      where: {
        id: draftId,
        userId,
        synced: false
      }
    })

    if (!draft) {
      return { success: false, error: "Draft not found or already synced" }
    }

    const data = draft.data as unknown as OfflineDraftData

    // Create the issue from draft data
    const issue = await prisma.issue.create({
      data: {
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        imageUrl: data.imageBase64 ? await uploadBase64Image(data.imageBase64) : undefined,
        voiceNoteUrl: data.voiceNoteBase64 ? await uploadBase64Audio(data.voiceNoteBase64) : undefined,
        userId,
        submissionMode: "OFFLINE_SYNC"
      }
    })

    // Mark draft as synced
    await prisma.offlineDraft.update({
      where: { id: draftId },
      data: { synced: true }
    })

    return { success: true, issueId: issue.id }
  } catch (error) {
    console.error("Sync failed:", error)
    return { success: false, error: "Failed to sync draft" }
  }
}

/**
 * Sync all pending drafts for a user
 */
export async function syncAllDrafts(userId: string): Promise<{
  total: number
  successful: number
  failed: number
  results: SyncResult[]
}> {
  const drafts = await getPendingDrafts(userId)
  const results: SyncResult[] = []
  let successful = 0
  let failed = 0

  for (const draft of drafts) {
    const result = await syncOfflineDraft(draft.id, userId)
    results.push(result)
    if (result.success) {
      successful++
    } else {
      failed++
    }
  }

  return {
    total: drafts.length,
    successful,
    failed,
    results
  }
}

/**
 * Delete a synced draft
 */
export async function deleteSyncedDrafts(userId: string): Promise<number> {
  const result = await prisma.offlineDraft.deleteMany({
    where: {
      userId,
      synced: true
    }
  })

  return result.count
}

/**
 * Upload base64 image (placeholder for cloud storage)
 */
async function uploadBase64Image(base64: string): Promise<string> {
  // TODO: Integrate with Cloudinary or S3
  // For now, return a placeholder
  console.log("Would upload image to cloud storage")
  return `https://placeholder.com/image-${Date.now()}`
}

/**
 * Upload base64 audio (placeholder for cloud storage)
 */
async function uploadBase64Audio(base64: string): Promise<string> {
  // TODO: Integrate with cloud storage
  console.log("Would upload audio to cloud storage")
  return `https://placeholder.com/audio-${Date.now()}`
}

/**
 * Client-side IndexedDB wrapper for offline storage
 * This would be used in the client component
 */
export const offlineStorageConfig = {
  dbName: "CivicConnectOffline",
  storeName: "drafts",
  version: 1
}

/**
 * Check if we're online
 */
export function isOnline(): boolean {
  if (typeof window === "undefined") return true
  return navigator.onLine
}

/**
 * Generate a temporary ID for offline drafts
 */
export function generateOfflineId(): string {
  return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { syncAllDrafts, saveOfflineDraft, getPendingDrafts } from "@/lib/services/offline-sync"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const drafts = await getPendingDrafts(session.user.id)

    return NextResponse.json({ drafts })
  } catch (error) {
    return new NextResponse(null, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const json = await req.json()
    const { action, data, drafts } = json

    if (action === "save") {
      // Save a single offline draft
      const draftId = await saveOfflineDraft(session.user.id, data)
      return NextResponse.json({ draftId })
    }

    if (action === "sync") {
      // Sync all pending drafts
      const result = await syncAllDrafts(session.user.id)
      return NextResponse.json(result)
    }

    if (action === "bulk-save" && Array.isArray(drafts)) {
      // Save multiple offline drafts
      const draftIds: string[] = []
      for (const draft of drafts) {
        const id = await saveOfflineDraft(session.user.id, draft)
        draftIds.push(id)
      }
      return NextResponse.json({ draftIds })
    }

    return new NextResponse("Invalid action", { status: 400 })
  } catch (error) {
    console.error("Offline sync error:", error)
    return new NextResponse(null, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const draftId = searchParams.get("id")
    const syncedOnly = searchParams.get("synced") === "true"

    if (draftId) {
      // Delete specific draft
      await prisma.offlineDraft.deleteMany({
        where: {
          id: draftId,
          userId: session.user.id
        }
      })
    } else if (syncedOnly) {
      // Delete all synced drafts
      const result = await prisma.offlineDraft.deleteMany({
        where: {
          userId: session.user.id,
          synced: true
        }
      })
      return NextResponse.json({ deleted: result.count })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return new NextResponse(null, { status: 500 })
  }
}

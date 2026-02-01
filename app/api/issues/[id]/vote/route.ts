import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { voteSchema } from "@/lib/validations/issue"
import { createAuditLog } from "@/lib/services/audit"
import { sendNotification } from "@/lib/services/notifications"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id: issueId } = await params

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    // Check if issue exists
    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      select: { id: true, userId: true, title: true, voteCount: true }
    })

    if (!issue) {
      return new NextResponse("Issue not found", { status: 404 })
    }

    // Check if user already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_issueId: {
          userId: session.user.id,
          issueId
        }
      }
    })

    if (existingVote) {
      // Remove vote (toggle)
      await prisma.vote.delete({
        where: { id: existingVote.id }
      })

      // Update vote count
      await prisma.issue.update({
        where: { id: issueId },
        data: { voteCount: { decrement: 1 } }
      })

      return NextResponse.json({
        voted: false,
        voteCount: issue.voteCount - 1
      })
    }

    // Create new vote
    await prisma.vote.create({
      data: {
        userId: session.user.id,
        issueId,
        value: 1
      }
    })

    // Update vote count
    const updatedIssue = await prisma.issue.update({
      where: { id: issueId },
      data: { voteCount: { increment: 1 } }
    })

    // Notify issue owner
    if (issue.userId !== session.user.id) {
      await sendNotification({
        userId: issue.userId,
        type: "VOTE_RECEIVED",
        title: "Your issue received a vote!",
        message: `Someone upvoted your issue "${issue.title}"`,
        data: { issueId }
      })
    }

    // Audit log
    await createAuditLog({
      action: "VOTE",
      entityType: "Issue",
      entityId: issueId,
      userId: session.user.id,
      issueId
    })

    return NextResponse.json({
      voted: true,
      voteCount: updatedIssue.voteCount
    })
  } catch (error) {
    console.error("Vote error:", error)
    return new NextResponse(null, { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id: issueId } = await params

    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      select: { voteCount: true }
    })

    if (!issue) {
      return new NextResponse("Issue not found", { status: 404 })
    }

    let hasVoted = false
    if (session?.user) {
      const vote = await prisma.vote.findUnique({
        where: {
          userId_issueId: {
            userId: session.user.id,
            issueId
          }
        }
      })
      hasVoted = !!vote
    }

    return NextResponse.json({
      voteCount: issue.voteCount,
      hasVoted
    })
  } catch (error) {
    return new NextResponse(null, { status: 500 })
  }
}

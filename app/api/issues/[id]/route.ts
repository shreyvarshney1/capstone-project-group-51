import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { issueStatusSchema, issuePrioritySchema, issueAssignSchema } from "@/lib/validations/issue"
import { createAuditLog } from "@/lib/services/audit"
import { notifyStatusUpdate, notifyEscalation } from "@/lib/services/notifications"
import { updateOfficerWorkload } from "@/lib/services/smart-routing"
import { calculatePriorityScore } from "@/lib/services/ai-classification"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const issue = await prisma.issue.findUnique({
      where: { id },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        assignedOfficer: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        },
        votes: {
          select: {
            userId: true,
            value: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true
                  }
                }
              },
              orderBy: { createdAt: "asc" }
            }
          },
          where: { parentId: null },
          orderBy: { createdAt: "desc" }
        },
        statusHistory: {
          orderBy: { createdAt: "desc" },
          take: 20
        },
        _count: {
          select: {
            votes: true,
            comments: true
          }
        }
      },
    })

    if (!issue) {
      return new NextResponse("Issue not found", { status: 404 })
    }

    return NextResponse.json(issue)
  } catch (error) {
    console.error("Get issue error:", error)
    return new NextResponse(null, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const json = await req.json()
    const { action } = json

    // Get current issue
    const currentIssue = await prisma.issue.findUnique({
      where: { id },
      include: { category: true }
    })

    if (!currentIssue) {
      return new NextResponse("Issue not found", { status: 404 })
    }

    // Check authorization based on role
    const userRole = session.user.role
    const isOfficer = ["WARD_OFFICER", "BLOCK_OFFICER", "DISTRICT_OFFICER", "STATE_OFFICER", "ADMIN", "SUPER_ADMIN"].includes(userRole)
    const isOwner = currentIssue.userId === session.user.id

    if (!isOfficer && !isOwner) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    let updatedIssue

    switch (action) {
      case "updateStatus": {
        const { status, note } = issueStatusSchema.parse(json)
        
        updatedIssue = await prisma.issue.update({
          where: { id },
          data: {
            status,
            ...(status === "ACKNOWLEDGED" && { acknowledgedAt: new Date() }),
            ...(status === "RESOLVED" && { resolvedAt: new Date() }),
            ...(status === "CLOSED" && { closedAt: new Date() }),
          }
        })

        // Create status history
        await prisma.statusHistory.create({
          data: {
            issueId: id,
            fromStatus: currentIssue.status,
            toStatus: status,
            changedBy: session.user.id,
            note
          }
        })

        // Notify user of status change
        await notifyStatusUpdate(id, currentIssue.userId, currentIssue.status, status)

        // Audit log
        await createAuditLog({
          action: "STATUS_CHANGE",
          entityType: "Issue",
          entityId: id,
          userId: session.user.id,
          issueId: id,
          oldValue: { status: currentIssue.status },
          newValue: { status }
        })
        break
      }

      case "updatePriority": {
        const { priority } = issuePrioritySchema.parse(json)
        
        updatedIssue = await prisma.issue.update({
          where: { id },
          data: {
            priority,
            isUrgent: priority === "URGENT" || priority === "CRITICAL"
          }
        })

        await createAuditLog({
          action: "UPDATE",
          entityType: "Issue",
          entityId: id,
          userId: session.user.id,
          issueId: id,
          oldValue: { priority: currentIssue.priority },
          newValue: { priority }
        })
        break
      }

      case "assign": {
        const { assignedOfficerId } = issueAssignSchema.parse(json)
        
        // Update workload for old and new officer
        if (currentIssue.assignedOfficerId) {
          await updateOfficerWorkload(currentIssue.assignedOfficerId, -1)
        }
        await updateOfficerWorkload(assignedOfficerId, 1)

        updatedIssue = await prisma.issue.update({
          where: { id },
          data: {
            assignedOfficerId,
            status: currentIssue.status === "SUBMITTED" ? "ASSIGNED" : currentIssue.status
          }
        })

        await createAuditLog({
          action: "ASSIGNMENT",
          entityType: "Issue",
          entityId: id,
          userId: session.user.id,
          issueId: id,
          oldValue: { assignedOfficerId: currentIssue.assignedOfficerId },
          newValue: { assignedOfficerId }
        })
        break
      }

      case "markUrgent": {
        updatedIssue = await prisma.issue.update({
          where: { id },
          data: { isUrgent: true, priority: "URGENT" }
        })
        break
      }

      case "recalculatePriority": {
        const score = await calculatePriorityScore(
          id,
          currentIssue.sentimentScore || 0,
          currentIssue.voteCount,
          currentIssue.categoryId,
          currentIssue.createdAt
        )

        updatedIssue = await prisma.issue.update({
          where: { id },
          data: { priorityScore: score.score }
        })
        break
      }

      default: {
        // Generic update (for backward compatibility)
        const statusParse = issueStatusSchema.safeParse(json)
        if (statusParse.success) {
          updatedIssue = await prisma.issue.update({
            where: { id },
            data: { status: statusParse.data.status }
          })

          await prisma.statusHistory.create({
            data: {
              issueId: id,
              fromStatus: currentIssue.status,
              toStatus: statusParse.data.status,
              changedBy: session.user.id
            }
          })
        } else {
          return new NextResponse("Invalid action or data", { status: 400 })
        }
      }
    }

    return NextResponse.json(updatedIssue)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 })
    }

    console.error("Update issue error:", error)
    return new NextResponse(null, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const issue = await prisma.issue.findUnique({
      where: { id }
    })

    if (!issue) {
      return new NextResponse("Issue not found", { status: 404 })
    }

    // Only allow deletion by owner or admin
    const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN"
    const isOwner = issue.userId === session.user.id

    if (!isAdmin && !isOwner) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    // Audit log before deletion
    await createAuditLog({
      action: "DELETE",
      entityType: "Issue",
      entityId: id,
      userId: session.user.id,
      issueId: id,
      oldValue: {
        title: issue.title,
        status: issue.status
      }
    })

    await prisma.issue.delete({ where: { id } })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Delete issue error:", error)
    return new NextResponse(null, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { commentSchema } from "@/lib/validations/issue"
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

    const json = await req.json()
    const { content, parentId } = commentSchema.parse(json)

    // Check if issue exists
    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      select: { id: true, userId: true, title: true }
    })

    if (!issue) {
      return new NextResponse("Issue not found", { status: 404 })
    }

    // Validate parent comment if provided
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId }
      })
      if (!parentComment || parentComment.issueId !== issueId) {
        return new NextResponse("Invalid parent comment", { status: 400 })
      }
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content,
        userId: session.user.id,
        issueId,
        parentId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    })

    // Notify issue owner
    if (issue.userId !== session.user.id) {
      await sendNotification({
        userId: issue.userId,
        type: "COMMENT_ADDED",
        title: "New comment on your issue",
        message: `${session.user.name || "Someone"} commented on "${issue.title}"`,
        data: { issueId, commentId: comment.id }
      })
    }

    // Notify parent comment author if it's a reply
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { userId: true }
      })
      
      if (parentComment && parentComment.userId !== session.user.id) {
        await sendNotification({
          userId: parentComment.userId,
          type: "COMMENT_ADDED",
          title: "New reply to your comment",
          message: `${session.user.name || "Someone"} replied to your comment`,
          data: { issueId, commentId: comment.id }
        })
      }
    }

    // Audit log
    await createAuditLog({
      action: "COMMENT",
      entityType: "Comment",
      entityId: comment.id,
      userId: session.user.id,
      issueId
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 })
    }
    console.error("Comment error:", error)
    return new NextResponse(null, { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: issueId } = await params
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")

    const comments = await prisma.comment.findMany({
      where: {
        issueId,
        parentId: null, // Top-level comments only
        isHidden: false
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        replies: {
          where: { isHidden: false },
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
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    })

    const totalCount = await prisma.comment.count({
      where: {
        issueId,
        parentId: null,
        isHidden: false
      }
    })

    return NextResponse.json({
      data: comments,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize)
      }
    })
  } catch (error) {
    return new NextResponse(null, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id: issueId } = await params
    const { searchParams } = new URL(req.url)
    const commentId = searchParams.get("commentId")

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    if (!commentId) {
      return new NextResponse("Comment ID required", { status: 400 })
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    })

    if (!comment) {
      return new NextResponse("Comment not found", { status: 404 })
    }

    // Only allow deletion by comment author or admin
    const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN"
    const isAuthor = comment.userId === session.user.id

    if (!isAdmin && !isAuthor) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    // Soft delete by hiding
    await prisma.comment.update({
      where: { id: commentId },
      data: { isHidden: true }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return new NextResponse(null, { status: 500 })
  }
}

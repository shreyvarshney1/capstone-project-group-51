import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { markNotificationsAsRead, getUnreadNotifications } from "@/lib/services/notifications"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const unreadOnly = searchParams.get("unread") === "true"
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")

    const where: Record<string, unknown> = {
      userId: session.user.id
    }

    if (unreadOnly) {
      where.read = false
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    })

    const totalCount = await prisma.notification.count({ where })
    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        read: false
      }
    })

    return NextResponse.json({
      data: notifications,
      unreadCount,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize)
      }
    })
  } catch (error) {
    console.error("Notifications error:", error)
    return new NextResponse(null, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const json = await req.json()
    const { notificationIds, markAll } = json

    if (markAll) {
      const count = await markNotificationsAsRead(session.user.id)
      return NextResponse.json({ markedAsRead: count })
    }

    if (notificationIds && Array.isArray(notificationIds)) {
      const count = await markNotificationsAsRead(session.user.id, notificationIds)
      return NextResponse.json({ markedAsRead: count })
    }

    return new NextResponse("Invalid request", { status: 400 })
  } catch (error) {
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
    const notificationId = searchParams.get("id")

    if (notificationId) {
      await prisma.notification.deleteMany({
        where: {
          id: notificationId,
          userId: session.user.id
        }
      })
    } else {
      // Delete all read notifications older than 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      await prisma.notification.deleteMany({
        where: {
          userId: session.user.id,
          read: true,
          createdAt: { lt: thirtyDaysAgo }
        }
      })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return new NextResponse(null, { status: 500 })
  }
}

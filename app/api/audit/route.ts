import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getAuditLogs } from "@/lib/services/audit"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Only admins can view audit logs
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const entityType = searchParams.get("entityType")
    const entityId = searchParams.get("entityId")
    const userId = searchParams.get("userId")
    const action = searchParams.get("action")
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "50")

    const where: Record<string, unknown> = {}
    if (entityType) where.entityType = entityType
    if (entityId) where.entityId = entityId
    if (userId) where.userId = userId
    if (action) where.action = action

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    })

    const totalCount = await prisma.auditLog.count({ where })

    return NextResponse.json({
      data: logs,
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

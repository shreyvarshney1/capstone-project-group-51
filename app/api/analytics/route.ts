import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { 
  getDashboardAnalytics, 
  getOfficerPerformanceMetrics,
  getPredictiveAnalytics,
  getStatusDistribution
} from "@/lib/services/analytics"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(req.url)

    const type = searchParams.get("type") || "dashboard"
    const ward = searchParams.get("ward") || undefined
    const district = searchParams.get("district") || undefined
    const state = searchParams.get("state") || undefined
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")

    const filters = {
      ward,
      district,
      state,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined
    }

    switch (type) {
      case "dashboard":
        const dashboardData = await getDashboardAnalytics(filters)
        return NextResponse.json(dashboardData)

      case "performance":
        // Only officers/admins can view performance metrics
        if (!session?.user) {
          return new NextResponse("Unauthorized", { status: 403 })
        }
        const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(session.user.role)
        const isOfficer = ["WARD_OFFICER", "BLOCK_OFFICER", "DISTRICT_OFFICER", "STATE_OFFICER"].includes(session.user.role)
        
        if (!isAdmin && !isOfficer) {
          return new NextResponse("Forbidden", { status: 403 })
        }

        const officerId = searchParams.get("officerId")
        const performance = await getOfficerPerformanceMetrics(
          isAdmin ? officerId || undefined : session.user.id,
          filters.dateFrom && filters.dateTo ? { from: filters.dateFrom, to: filters.dateTo } : undefined
        )
        return NextResponse.json(performance)

      case "predictive":
        const predictions = await getPredictiveAnalytics(ward, searchParams.get("category") || undefined)
        return NextResponse.json(predictions)

      case "status":
        const statusData = await getStatusDistribution(filters)
        return NextResponse.json(statusData)

      case "heatmap":
        // Get heatmap data for map visualization
        const heatmapIssues = await prisma.issue.findMany({
          where: {
            status: { notIn: ["CLOSED", "REJECTED"] },
            ...(ward && { ward }),
            ...(district && { district }),
            ...(state && { state })
          },
          select: {
            latitude: true,
            longitude: true,
            priority: true,
            voteCount: true,
            status: true,
            category: {
              select: { name: true, color: true }
            }
          },
          take: 1000
        })

        const heatmapData = heatmapIssues.map(issue => ({
          lat: issue.latitude,
          lng: issue.longitude,
          intensity: calculateIntensity(issue.priority, issue.voteCount),
          status: issue.status,
          category: issue.category.name
        }))

        return NextResponse.json(heatmapData)

      case "category-trends":
        // Category breakdown over time
        const categoryTrends = await getCategoryTrends(filters)
        return NextResponse.json(categoryTrends)

      default:
        return new NextResponse("Invalid analytics type", { status: 400 })
    }
  } catch (error) {
    console.error("Analytics error:", error)
    return new NextResponse(null, { status: 500 })
  }
}

function calculateIntensity(priority: string, voteCount: number): number {
  let base = 0.5
  
  switch (priority) {
    case "CRITICAL": base = 1.0; break
    case "URGENT": base = 0.85; break
    case "HIGH": base = 0.7; break
    case "MEDIUM": base = 0.5; break
    default: base = 0.3
  }

  const voteBoost = Math.min(voteCount / 50, 1) * 0.2
  return Math.min(base + voteBoost, 1)
}

async function getCategoryTrends(filters: {
  ward?: string
  district?: string
  dateFrom?: Date
  dateTo?: Date
}) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const where: Record<string, unknown> = {
    createdAt: { gte: filters.dateFrom || thirtyDaysAgo }
  }
  if (filters.ward) where.ward = filters.ward
  if (filters.district) where.district = filters.district

  const issues = await prisma.issue.findMany({
    where,
    select: {
      createdAt: true,
      category: {
        select: { name: true }
      }
    }
  })

  // Group by date and category
  const trends: Record<string, Record<string, number>> = {}
  
  issues.forEach(issue => {
    const date = issue.createdAt.toISOString().split("T")[0]
    const category = issue.category.name
    
    if (!trends[date]) trends[date] = {}
    if (!trends[date][category]) trends[date][category] = 0
    trends[date][category]++
  })

  // Convert to array format
  return Object.entries(trends).map(([date, categories]) => ({
    date,
    ...categories
  })).sort((a, b) => a.date.localeCompare(b.date))
}

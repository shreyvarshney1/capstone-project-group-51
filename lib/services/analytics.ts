// =============================================
// ANALYTICS SERVICE
// Dashboard analytics and predictive insights
// =============================================

import { prisma } from "@/lib/prisma"
import { 
  DashboardAnalytics, 
  CategoryBreakdown, 
  TrendDataPoint,
  PerformanceMetrics 
} from "@/types"

/**
 * Get comprehensive dashboard analytics
 */
export async function getDashboardAnalytics(
  filters?: {
    ward?: string
    district?: string
    state?: string
    dateFrom?: Date
    dateTo?: Date
  }
): Promise<DashboardAnalytics> {
  const where: Record<string, unknown> = {}
  
  if (filters?.ward) where.ward = filters.ward
  if (filters?.district) where.district = filters.district
  if (filters?.state) where.state = filters.state
  if (filters?.dateFrom || filters?.dateTo) {
    where.createdAt = {
      ...(filters.dateFrom && { gte: filters.dateFrom }),
      ...(filters.dateTo && { lte: filters.dateTo })
    }
  }

  // Get total counts
  const [totalIssues, resolvedIssues, pendingIssues] = await Promise.all([
    prisma.issue.count({ where }),
    prisma.issue.count({ where: { ...where, status: "RESOLVED" } }),
    prisma.issue.count({ 
      where: { 
        ...where, 
        status: { in: ["SUBMITTED", "ACKNOWLEDGED", "ASSIGNED", "IN_PROGRESS"] } 
      } 
    })
  ])

  // Get average resolution time
  const resolvedWithTime = await prisma.issue.findMany({
    where: {
      ...where,
      status: "RESOLVED",
      resolvedAt: { not: null }
    },
    select: {
      createdAt: true,
      resolvedAt: true
    }
  })

  let averageResolutionTime = 0
  if (resolvedWithTime.length > 0) {
    const totalTime = resolvedWithTime.reduce((sum, issue) => {
      if (issue.resolvedAt) {
        return sum + (issue.resolvedAt.getTime() - issue.createdAt.getTime())
      }
      return sum
    }, 0)
    averageResolutionTime = totalTime / resolvedWithTime.length / (1000 * 60 * 60) // in hours
  }

  // Get category breakdown
  const categoryStats = await prisma.issue.groupBy({
    by: ["categoryId"],
    where,
    _count: true
  })

  const categories = await prisma.category.findMany({
    select: { id: true, name: true, color: true }
  })

  const categoryBreakdown: CategoryBreakdown[] = categoryStats.map(stat => {
    const category = categories.find(c => c.id === stat.categoryId)
    return {
      category: category?.name || "Unknown",
      count: stat._count,
      percentage: (stat._count / Math.max(totalIssues, 1)) * 100,
      color: category?.color || undefined
    }
  }).sort((a, b) => b.count - a.count)

  // Get trend data for last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const trendData = await generateTrendData(thirtyDaysAgo, new Date(), where)

  // Get SLA compliance
  const slaBreached = await prisma.issue.count({
    where: { ...where, slaBreach: true }
  })
  const slaCompliance = totalIssues > 0 
    ? ((totalIssues - slaBreached) / totalIssues) * 100 
    : 100

  // Get heatmap data
  const heatmapIssues = await prisma.issue.findMany({
    where: {
      ...where,
      status: { notIn: ["CLOSED", "REJECTED"] }
    },
    select: {
      latitude: true,
      longitude: true,
      priority: true,
      voteCount: true
    },
    take: 1000
  })

  const heatmapData = heatmapIssues.map(issue => ({
    lat: issue.latitude,
    lng: issue.longitude,
    intensity: calculateIntensity(issue.priority, issue.voteCount)
  }))

  return {
    totalIssues,
    resolvedIssues,
    pendingIssues,
    averageResolutionTime: Math.round(averageResolutionTime * 10) / 10,
    categoryBreakdown,
    trendData,
    heatmapData,
    slaCompliance: Math.round(slaCompliance * 10) / 10
  }
}

/**
 * Generate trend data for a date range
 */
async function generateTrendData(
  startDate: Date,
  endDate: Date,
  baseWhere: Record<string, unknown>
): Promise<TrendDataPoint[]> {
  const data: TrendDataPoint[] = []
  const current = new Date(startDate)

  while (current <= endDate) {
    const dayStart = new Date(current)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(current)
    dayEnd.setHours(23, 59, 59, 999)

    const [submitted, resolved] = await Promise.all([
      prisma.issue.count({
        where: {
          ...baseWhere,
          createdAt: {
            gte: dayStart,
            lte: dayEnd
          }
        }
      }),
      prisma.issue.count({
        where: {
          ...baseWhere,
          resolvedAt: {
            gte: dayStart,
            lte: dayEnd
          }
        }
      })
    ])

    data.push({
      date: current.toISOString().split("T")[0],
      submitted,
      resolved
    })

    current.setDate(current.getDate() + 1)
  }

  return data
}

/**
 * Calculate heatmap intensity
 */
function calculateIntensity(priority: string, voteCount: number): number {
  let base = 0.5
  
  switch (priority) {
    case "CRITICAL": base = 1.0; break
    case "URGENT": base = 0.85; break
    case "HIGH": base = 0.7; break
    case "MEDIUM": base = 0.5; break
    default: base = 0.3
  }

  // Boost based on votes (max 0.2 additional)
  const voteBoost = Math.min(voteCount / 50, 1) * 0.2
  
  return Math.min(base + voteBoost, 1)
}

/**
 * Get officer performance metrics
 */
export async function getOfficerPerformanceMetrics(
  officerId?: string,
  dateRange?: { from: Date; to: Date }
): Promise<PerformanceMetrics[]> {
  const where: Record<string, unknown> = {
    role: {
      in: ["WARD_OFFICER", "BLOCK_OFFICER", "DISTRICT_OFFICER", "STATE_OFFICER"]
    }
  }
  
  if (officerId) where.id = officerId

  const officers = await prisma.user.findMany({
    where,
    include: {
      performanceMetrics: true,
      assignedIssues: {
        where: dateRange ? {
          createdAt: {
            gte: dateRange.from,
            lte: dateRange.to
          }
        } : undefined,
        select: {
          status: true,
          createdAt: true,
          resolvedAt: true,
          slaBreach: true
        }
      }
    }
  })

  return officers.map(officer => {
    const resolved = officer.assignedIssues.filter(i => i.status === "RESOLVED")
    const breached = officer.assignedIssues.filter(i => i.slaBreach)
    
    let avgTime = 0
    if (resolved.length > 0) {
      const totalTime = resolved.reduce((sum, issue) => {
        if (issue.resolvedAt) {
          return sum + (issue.resolvedAt.getTime() - issue.createdAt.getTime())
        }
        return sum
      }, 0)
      avgTime = totalTime / resolved.length / (1000 * 60 * 60) // hours
    }

    return {
      userId: officer.id,
      userName: officer.name || "Unknown",
      totalResolved: resolved.length,
      averageResolutionTime: Math.round(avgTime * 10) / 10,
      satisfactionRating: officer.performanceMetrics?.satisfactionRating || 0,
      slaComplianceRate: officer.assignedIssues.length > 0
        ? ((officer.assignedIssues.length - breached.length) / officer.assignedIssues.length) * 100
        : 100,
      currentWorkload: officer.performanceMetrics?.currentWorkload || 0
    }
  })
}

/**
 * Get predictive analytics for complaint volumes
 */
export async function getPredictiveAnalytics(
  ward?: string,
  category?: string
): Promise<{ date: string; predictedVolume: number; confidence: number }[]> {
  // Simple prediction based on historical averages
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const where: Record<string, unknown> = {
    createdAt: { gte: thirtyDaysAgo }
  }
  if (ward) where.ward = ward
  if (category) {
    const cat = await prisma.category.findFirst({ where: { name: category } })
    if (cat) where.categoryId = cat.id
  }

  // Get daily averages by day of week
  const issues = await prisma.issue.findMany({
    where,
    select: { createdAt: true }
  })

  const dayOfWeekCounts: Record<number, number[]> = {
    0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []
  }

  issues.forEach(issue => {
    const day = issue.createdAt.getDay()
    const dateKey = issue.createdAt.toISOString().split("T")[0]
    dayOfWeekCounts[day].push(1)
  })

  // Calculate averages
  const dayAverages: Record<number, number> = {}
  for (let i = 0; i < 7; i++) {
    const counts = dayOfWeekCounts[i]
    dayAverages[i] = counts.length > 0 
      ? Math.round(counts.length / 4) // Divide by ~4 weeks
      : 5 // Default prediction
  }

  // Generate predictions for next 7 days
  const predictions: { date: string; predictedVolume: number; confidence: number }[] = []
  const today = new Date()

  for (let i = 1; i <= 7; i++) {
    const futureDate = new Date(today)
    futureDate.setDate(futureDate.getDate() + i)
    const dayOfWeek = futureDate.getDay()

    predictions.push({
      date: futureDate.toISOString().split("T")[0],
      predictedVolume: dayAverages[dayOfWeek] || 5,
      confidence: issues.length > 50 ? 0.8 : issues.length > 20 ? 0.6 : 0.4
    })
  }

  return predictions
}

/**
 * Get status distribution
 */
export async function getStatusDistribution(
  filters?: { ward?: string; district?: string }
): Promise<{ status: string; count: number; percentage: number }[]> {
  const where: Record<string, unknown> = {}
  if (filters?.ward) where.ward = filters.ward
  if (filters?.district) where.district = filters.district

  const total = await prisma.issue.count({ where })
  const distribution = await prisma.issue.groupBy({
    by: ["status"],
    where,
    _count: true
  })

  return distribution.map(item => ({
    status: item.status,
    count: item._count,
    percentage: total > 0 ? Math.round((item._count / total) * 100 * 10) / 10 : 0
  }))
}

/**
 * Store daily analytics snapshot
 */
export async function storeDailyAnalytics(): Promise<void> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [totalIssues, resolvedIssues] = await Promise.all([
    prisma.issue.count({
      where: { createdAt: { gte: today } }
    }),
    prisma.issue.count({
      where: { resolvedAt: { gte: today } }
    })
  ])

  const resolvedWithTime = await prisma.issue.findMany({
    where: {
      resolvedAt: { gte: today }
    },
    select: {
      createdAt: true,
      resolvedAt: true
    }
  })

  let avgResolutionTime = 0
  if (resolvedWithTime.length > 0) {
    const totalTime = resolvedWithTime.reduce((sum, issue) => {
      if (issue.resolvedAt) {
        return sum + (issue.resolvedAt.getTime() - issue.createdAt.getTime())
      }
      return sum
    }, 0)
    avgResolutionTime = totalTime / resolvedWithTime.length / (1000 * 60 * 60)
  }

  await prisma.dailyAnalytics.upsert({
    where: { date: today },
    update: {
      totalIssues,
      resolvedIssues,
      avgResolutionTime
    },
    create: {
      date: today,
      totalIssues,
      resolvedIssues,
      avgResolutionTime
    }
  })
}

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { maskIssueForPublic, anonymizeUser } from "@/lib/services/audit"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")
    const ward = searchParams.get("ward")
    const district = searchParams.get("district")
    const category = searchParams.get("category")
    const sortBy = searchParams.get("sortBy") || "recent" // recent, votes, trending

    // Build where clause for public issues only
    const where: Record<string, unknown> = {
      isPublic: true,
      status: {
        notIn: ["DRAFT", "REJECTED"]
      }
    }

    if (ward) where.ward = ward
    if (district) where.district = district
    if (category) {
      const cat = await prisma.category.findFirst({
        where: { name: category }
      })
      if (cat) where.categoryId = cat.id
    }

    // Determine sort order
    let orderBy: Record<string, string>[] = []
    switch (sortBy) {
      case "votes":
        orderBy = [{ voteCount: "desc" }, { createdAt: "desc" }]
        break
      case "trending":
        // Trending = high votes + recent
        orderBy = [{ isUrgent: "desc" }, { voteCount: "desc" }, { createdAt: "desc" }]
        break
      default:
        orderBy = [{ createdAt: "desc" }]
    }

    // Get session for vote status
    const session = await getServerSession(authOptions)

    // Get issues
    const issues = await prisma.issue.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        category: {
          select: {
            name: true,
            color: true,
            icon: true
          }
        },
        ward: true,
        district: true,
        latitude: true,
        longitude: true,
        voteCount: true,
        isUrgent: true,
        createdAt: true,
        user: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            comments: true
          }
        },
        votes: session?.user ? {
          where: { userId: session.user.id },
          select: { id: true }
        } : false
      },
      orderBy: orderBy as any,
      skip: (page - 1) * pageSize,
      take: pageSize
    })

    const totalCount = await prisma.issue.count({ where })

    // Anonymize user data for public feed
    const publicIssues = issues.map(issue => ({
      id: issue.id,
      title: issue.title,
      description: issue.description.substring(0, 300) + (issue.description.length > 300 ? "..." : ""),
      status: issue.status,
      priority: issue.priority,
      category: issue.category,
      ward: issue.ward,
      district: issue.district,
      latitude: issue.latitude,
      longitude: issue.longitude,
      voteCount: issue.voteCount,
      commentCount: issue._count.comments,
      isUrgent: issue.isUrgent,
      createdAt: issue.createdAt,
      user: {
        name: issue.user.name ? issue.user.name.charAt(0) + "***" : "Anonymous"
      },
      hasVoted: session?.user ? issue.votes && issue.votes.length > 0 : false
    }))

    return NextResponse.json({
      data: publicIssues,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        hasNext: page * pageSize < totalCount,
        hasPrevious: page > 1
      }
    })
  } catch (error) {
    console.error("Public feed error:", error)
    return new NextResponse(null, { status: 500 })
  }
}

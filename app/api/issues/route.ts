import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { getIssuesWithCategories, mockIssues } from "@/lib/data"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { issueSchema, issueFiltersSchema } from "@/lib/validations/issue"
import { 
  classifyIssue, 
  analyzeSentiment, 
  checkForDuplicates 
} from "@/lib/services/ai-classification"
import { findBestOfficer, calculateSLADeadline } from "@/lib/services/smart-routing"
import { detectJurisdiction } from "@/lib/services/geo-tagging"
import { createAuditLog } from "@/lib/services/audit"
import { sendNotification } from "@/lib/services/notifications"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const json = await req.json()
    const body = issueSchema.parse(json)

    // Auto-detect jurisdiction from coordinates
    const jurisdiction = await detectJurisdiction(body.latitude, body.longitude)

    // AI Classification
    const classification = await classifyIssue(body.title, body.description)
    
    // Sentiment Analysis
    const sentimentScore = analyzeSentiment(`${body.title} ${body.description}`)

    // Check for duplicates
    const duplicateCheck = await checkForDuplicates(
      body.title,
      body.description,
      body.latitude,
      body.longitude,
      body.categoryId
    )

    // Get category for SLA
    const category = await prisma.category.findUnique({
      where: { id: body.categoryId },
      select: { slaHours: true }
    })

    // Smart routing - find best officer
    const assignment = await findBestOfficer(
      jurisdiction.ward,
      jurisdiction.block,
      jurisdiction.district,
      jurisdiction.state
    )

    const slaDeadline = category 
      ? calculateSLADeadline(new Date(), category.slaHours)
      : null

    // Create the issue
    const issue = await prisma.issue.create({
      data: {
        title: body.title,
        description: body.description,
        categoryId: body.categoryId,
        latitude: body.latitude,
        longitude: body.longitude,
        address: body.address || jurisdiction.ward,
        ward: jurisdiction.ward,
        block: jurisdiction.block,
        district: jurisdiction.district,
        state: jurisdiction.state,
        imageUrl: body.image,
        imageUrls: body.imageUrls || [],
        voiceNoteUrl: body.voiceNoteUrl,
        transcribedText: body.transcribedText,
        userId: session.user.id,
        isPublic: body.isPublic ?? true,
        language: body.language || "en",
        
        // AI fields
        aiClassification: classification.category,
        aiConfidence: classification.confidence,
        sentimentScore,
        
        // Duplicate detection
        isDuplicate: duplicateCheck.isDuplicate,
        duplicateOfId: duplicateCheck.isDuplicate ? duplicateCheck.matchingIssues[0]?.id : null,
        
        // Assignment
        assignedOfficerId: assignment?.officerId,
        escalationLevel: assignment?.escalationLevel || "WARD",
        slaDeadline,
        
        // Status
        status: "SUBMITTED",
        submissionMode: "WEB",
      },
      include: {
        category: true,
        user: {
          select: { name: true, email: true }
        }
      }
    })

    // Create status history entry
    await prisma.statusHistory.create({
      data: {
        issueId: issue.id,
        toStatus: "SUBMITTED",
        note: "Issue submitted by citizen"
      }
    })

    // Create audit log
    await createAuditLog({
      action: "CREATE",
      entityType: "Issue",
      entityId: issue.id,
      userId: session.user.id,
      issueId: issue.id,
      newValue: {
        title: issue.title,
        category: issue.category.name,
        location: `${issue.latitude}, ${issue.longitude}`
      }
    })

    // Notify assigned officer
    if (assignment) {
      await sendNotification({
        userId: assignment.officerId,
        type: "ASSIGNMENT",
        title: "New Issue Assigned",
        message: `A new issue "${issue.title}" has been assigned to you.`,
        data: { issueId: issue.id },
        channels: ["IN_APP", "EMAIL"]
      })
    }

    // Return duplicate warning if detected
    const response = {
      ...issue,
      duplicateWarning: duplicateCheck.isDuplicate ? {
        message: "This issue appears to be similar to existing reports",
        matchingIssues: duplicateCheck.matchingIssues
      } : null
    }

    return NextResponse.json(response)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 })
    }

    console.error("Issue creation error:", error)
    return new NextResponse(null, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    
    // Parse filter parameters
    const filters = {
      status: searchParams.get("status")?.split(","),
      priority: searchParams.get("priority")?.split(","),
      category: searchParams.get("category")?.split(","),
      ward: searchParams.get("ward") || undefined,
      district: searchParams.get("district") || undefined,
      state: searchParams.get("state") || undefined,
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
      isUrgent: searchParams.get("isUrgent") === "true" ? true : undefined,
      page: parseInt(searchParams.get("page") || "1"),
      pageSize: parseInt(searchParams.get("pageSize") || "20"),
    }

    // Build where clause
    const where: Record<string, unknown> = {}
    
    if (filters.status?.length) {
      where.status = { in: filters.status }
    }
    if (filters.priority?.length) {
      where.priority = { in: filters.priority }
    }
    if (filters.category?.length) {
      where.categoryId = { in: filters.category }
    }
    if (filters.ward) {
      where.ward = filters.ward
    }
    if (filters.district) {
      where.district = filters.district
    }
    if (filters.state) {
      where.state = filters.state
    }
    if (filters.isUrgent) {
      where.isUrgent = true
    }
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {
        ...(filters.dateFrom && { gte: new Date(filters.dateFrom) }),
        ...(filters.dateTo && { lte: new Date(filters.dateTo) })
      }
    }

    // Get total count for pagination
    const totalCount = await prisma.issue.count({ where })

    // Get issues with pagination
    const issues = await prisma.issue.findMany({
      where,
      include: {
        category: true,
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            votes: true,
            comments: true
          }
        }
      },
      orderBy: [
        { isUrgent: "desc" },
        { priorityScore: "desc" },
        { createdAt: "desc" }
      ],
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    })

    return NextResponse.json({
      data: issues,
      pagination: {
        page: filters.page,
        pageSize: filters.pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / filters.pageSize),
        hasNext: filters.page * filters.pageSize < totalCount,
        hasPrevious: filters.page > 1
      }
    })
  } catch (error) {
    console.error("Issues fetch error:", error)
    return new NextResponse(null, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { getIssuesWithCategories, mockIssues } from "@/lib/data"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { issueSchema } from "@/lib/validations/issue"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const json = await req.json()
    const body = issueSchema.parse(json)

    // Mock issue creation - just return success
    const issue = {
      id: `issue_${Date.now()}`,
      title: body.title,
      description: body.description,
      categoryId: body.categoryId,
      latitude: body.latitude,
      longitude: body.longitude,
      address: body.address,
      imageUrl: body.image,
      userId: session.user.id,
      status: 'SUBMITTED' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(issue)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 })
    }

    return new NextResponse(null, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const issues = getIssuesWithCategories()

    return NextResponse.json(issues)
  } catch (error) {
    return new NextResponse(null, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { getIssueById, mockIssues } from "@/lib/data"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const routeContextSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
})

const updateIssueSchema = z.object({
  status: z.enum(["SUBMITTED", "ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED", "CLOSED"]),
})

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const issue = getIssueById(id)

    if (!issue) {
      return new NextResponse(null, { status: 404 })
    }

    return NextResponse.json(issue)
  } catch (error) {
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

    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const json = await req.json()
    const body = updateIssueSchema.parse(json)

    const issue = getIssueById(id)
    if (!issue) {
      return new NextResponse(null, { status: 404 })
    }

    // Mock update - return issue with updated status
    const updatedIssue = {
      ...issue,
      status: body.status,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(updatedIssue)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 })
    }

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

    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const issue = getIssueById(id)
    if (!issue) {
      return new NextResponse(null, { status: 404 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return new NextResponse(null, { status: 500 })
  }
}

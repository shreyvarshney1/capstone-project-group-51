import { notFound } from "next/navigation"
import Link from "next/link"
import { getIssueById } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import DynamicMap from "@/components/dynamic-map"
import { prisma } from "@/lib/prisma"
import { IssueDetailClient } from "./issue-detail-client"

export default async function IssuePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const issue = await prisma.issue.findUnique({
    where: {
      id,
    },
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
          role: true,
        },
      },
      statusHistory: {
        orderBy: {
          createdAt: "desc",
        },
      },
      _count: {
        select: {
          votes: true,
          comments: true,
        },
      },
    },
  })

  if (!issue) {
    notFound()
  }

  // Convert dates to strings for client component
  const serializedIssue = {
    ...issue,
    createdAt: issue.createdAt.toISOString(),
    updatedAt: issue.updatedAt.toISOString(),
    slaDeadline: issue.slaDeadline?.toISOString() || null,
    slaDueDate: issue.slaDeadline?.toISOString() || null, // Alias for component compatibility
    escalatedAt: issue.escalatedAt?.toISOString() || null,
    resolvedAt: issue.resolvedAt?.toISOString() || null,
    closedAt: issue.closedAt?.toISOString() || null,
    statusHistory: issue.statusHistory.map((h: any) => ({
      ...h,
      status: h.toStatus, // Map toStatus to status for timeline
      createdAt: h.createdAt.toISOString(),
    })),
    assignedTo: issue.assignedOfficer, // Alias for component compatibility
    images: issue.imageUrls || [],
  }

  return <IssueDetailClient issue={serializedIssue} />
}

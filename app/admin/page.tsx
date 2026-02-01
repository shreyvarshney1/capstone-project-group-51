import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getIssuesWithCategories } from "@/lib/data"
import { AdminDashboard } from "@/components/admin-dashboard"

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || session.user.role !== "ADMIN") {
    redirect("/")
  }

  // Fetch comprehensive admin data
  const [issues, users, categories, stats] = await Promise.all([
    prisma.issue.findMany({
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedOfficer: {
          select: {
            id: true,
            name: true,
          },
        },
        votes: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100, // Limit for performance
    }),
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            issues: true,
            assignedIssues: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.category.findMany({
      include: {
        _count: {
          select: {
            issues: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    }),
    // Get aggregate stats
    prisma.issue.groupBy({
      by: ["status"],
      _count: true,
    }),
  ])

  // Serialize dates
  const serializedIssues = issues.map(issue => ({
    ...issue,
    createdAt: issue.createdAt.toISOString(),
    updatedAt: issue.updatedAt.toISOString(),
    voteCount: issue.votes.length,
  }))

  const serializedUsers = users.map(user => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
  }))

  const serializedCategories = categories.map(cat => ({
    ...cat,
    createdAt: cat.createdAt.toISOString(),
    updatedAt: cat.updatedAt.toISOString(),
  }))

  // Calculate stats
  const statusStats = stats.reduce((acc, curr) => {
    acc[curr.status] = curr._count
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto py-10 px-4">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage issues, users, and system configuration
          </p>
        </div>
        <AdminDashboard 
          initialIssues={serializedIssues}
          users={serializedUsers}
          categories={serializedCategories}
          statusStats={statusStats}
        />
      </div>
    </div>
  )
}

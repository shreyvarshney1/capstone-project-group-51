import DynamicMap from "@/components/dynamic-map"
import { prisma } from "@/lib/prisma"

export const revalidate = 0 // Disable cache for now

export default async function MapPage() {
  const issues = await prisma.issue.findMany({
    include: {
      category: true,
    },
  })

  const serializedIssues = issues.map((issue: typeof issues[number]) => ({
    ...issue,
    createdAt: issue.createdAt.toISOString(),
    updatedAt: issue.updatedAt.toISOString(),
    category: {
      ...issue.category,
      createdAt: issue.category.createdAt.toISOString(),
      updatedAt: issue.category.updatedAt.toISOString(),
    }
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto py-10 px-4">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Civic Issues Map
          </h1>
          <p className="text-muted-foreground">
            Explore and track reported civic issues in your area
          </p>
        </div>
        <div className="bg-white dark:bg-gray-950 p-2 rounded-2xl shadow-xl border-2">
          <DynamicMap issues={serializedIssues} />
        </div>
      </div>
    </div>
  )
}

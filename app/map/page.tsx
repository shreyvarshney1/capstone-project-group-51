import DynamicMap from "@/components/dynamic-map"
import { prisma } from "@/lib/prisma"

export const revalidate = 0 // Disable cache for now

export default async function MapPage() {
  const [issues, categories] = await Promise.all([
    prisma.issue.findMany({
      include: {
        category: true,
        votes: true,
      },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
  ])

  const serializedIssues = issues.map((issue: typeof issues[number]) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    status: issue.status,
    priority: issue.priority,
    latitude: issue.latitude,
    longitude: issue.longitude,
    createdAt: issue.createdAt.toISOString(),
    updatedAt: issue.updatedAt.toISOString(),
    voteCount: issue.votes.length,
    category: {
      id: issue.category.id,
      name: issue.category.name,
    }
  }))

  const serializedCategories = categories.map((cat: typeof categories[number]) => ({
    id: cat.id,
    name: cat.name,
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto py-10 px-4">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Civic Issues Map
          </h1>
          <p className="text-muted-foreground">
            Explore and track reported civic issues in your area. Toggle heatmap view to identify issue hotspots.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-950 p-2 rounded-2xl shadow-xl border-2">
          <DynamicMap 
            issues={serializedIssues} 
            categories={serializedCategories}
            showControls={true}
            height="700px"
          />
        </div>
        
        {/* Legend for status colors */}
        <div className="mt-6 p-4 bg-white dark:bg-gray-950 rounded-xl border">
          <h3 className="font-semibold mb-3">Issue Status Legend</h3>
          <div className="flex flex-wrap gap-4">
            {[
              { status: "PENDING", color: "#f59e0b", label: "Pending" },
              { status: "ACKNOWLEDGED", color: "#3b82f6", label: "Acknowledged" },
              { status: "ASSIGNED", color: "#8b5cf6", label: "Assigned" },
              { status: "IN_PROGRESS", color: "#06b6d4", label: "In Progress" },
              { status: "RESOLVED", color: "#22c55e", label: "Resolved" },
              { status: "ESCALATED", color: "#dc2626", label: "Escalated" },
            ].map(({ status, color, label }) => (
              <div key={status} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full border-2 border-white shadow" 
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, MapPin, Calendar } from "lucide-react"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/api/auth/signin")
  }

  const issues = await prisma.issue.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto py-10 px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              My Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Track and manage your civic issue reports
            </p>
          </div>
          <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all">
            <Link href="/report">
              <Plus className="mr-2 h-4 w-4" />
              Report New Issue
            </Link>
          </Button>
        </div>

        {issues.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No issues reported yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              You haven't reported any civic issues yet. Start making a difference by reporting your first issue.
            </p>
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link href="/report">Report an Issue</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {issues.map((issue) => (
              <Card key={issue.id} className="group hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] bg-white dark:bg-gray-950 border-2">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="text-xs font-medium">
                      {issue.category.name}
                    </Badge>
                    <Badge
                      variant={
                        issue.status === "RESOLVED"
                          ? "default"
                          : issue.status === "IN_PROGRESS"
                          ? "secondary"
                          : "destructive"
                      }
                      className="text-xs"
                    >
                      {issue.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <CardTitle className="line-clamp-2 text-lg group-hover:text-blue-600 transition-colors">
                    {issue.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 text-xs">
                    <Calendar className="h-3 w-3" />
                    {issue.createdAt.toLocaleDateString("en-US", { 
                      month: "short", 
                      day: "numeric", 
                      year: "numeric" 
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                    {issue.description}
                  </p>
                  {issue.imageUrl && (
                    <div className="relative h-40 w-full overflow-hidden rounded-lg border">
                      <img
                        src={issue.imageUrl}
                        alt={issue.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-3">
                  <Button variant="ghost" className="w-full hover:bg-blue-600 hover:text-white transition-colors" asChild>
                    <Link href={`/issues/${issue.id}`}>
                      View Details →
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

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

export default async function IssuePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const issue = getIssueById(id)

  if (!issue) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto py-10 px-4">
        <Button variant="ghost" asChild className="mb-6 hover:bg-blue-600 hover:text-white transition-colors">
          <Link href="/dashboard">← Back to Dashboard</Link>
        </Button>
        
        <div className="bg-white dark:bg-gray-950 rounded-2xl border-2 shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 md:p-8 text-white">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <Badge variant="outline" className="bg-white/20 border-white/40 text-white text-sm px-3 py-1">
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
                  className="text-sm px-3 py-1"
                >
                  {issue.status.replace("_", " ")}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-6 md:p-8 md:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-6">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">{issue.description}</p>
                </CardContent>
              </Card>

              {issue.imageUrl && (
                <Card className="border-2 overflow-hidden">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Photo Evidence
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden">
                      <img
                        src={issue.imageUrl}
                        alt={issue.title}
                        className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Map */}
            <Card className="border-2 h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Location
                </CardTitle>
                <CardDescription>{issue.address || "Coordinates provided below"}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[400px] border-t-2">
                  <DynamicMap issues={[issue]} />
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Lat: {issue.latitude.toFixed(6)}</span>
                    <span>Lng: {issue.longitude.toFixed(6)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

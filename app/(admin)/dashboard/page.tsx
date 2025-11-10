import { prisma } from '@/lib/prisma'
import { Report } from '@prisma/client'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from '@/components/ui/badge'

async function getReports() {
  const reports = await prisma.report.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  })
  return reports
}

export default async function Dashboard() {
  const reports = await getReports()

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{reports.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {reports.filter((r) => r.status === 'PENDING').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {reports.filter((r) => r.status === 'IN_PROGRESS').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {reports.filter((r) => r.status === 'RESOLVED').length}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
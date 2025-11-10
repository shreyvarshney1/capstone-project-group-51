import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Report } from '@prisma/client'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from '@/components/ui/badge'

async function getReports(userId: string) {
  const reports = await prisma.report.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
  return reports
}

export default async function MyReports() {
  const session = await getServerSession(authOptions)
  const reports = await getReports(session?.user?.id!)

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Reports</h1>
      <div className="grid gap-4">
        {reports.map((report: Report) => (
          <Card key={report.id}>
            <CardHeader>
              <CardTitle>{report.title}</CardTitle>
              <CardDescription>
                {report.createdAt.toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>{report.description}</p>
            </CardContent>
            <CardFooter>
              <Badge>{report.status}</Badge>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
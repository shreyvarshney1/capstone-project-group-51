import { prisma } from '@/lib/prisma'
import { Report } from '@prisma/client'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge'

async function getReports() {
  const reports = await prisma.report.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: true,
    },
  })
  return reports
}

export default async function Reports() {
  const reports = await getReports()

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">All Reports</h1>
      <Table>
        <TableCaption>A list of all submitted reports.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report: Report & { user: { name: string | null } }) => (
            <TableRow key={report.id}>
              <TableCell>{report.title}</TableCell>
              <TableCell>{report.category}</TableCell>
              <TableCell>
                <Badge>{report.status}</Badge>
              </TableCell>
              <TableCell>{report.user.name}</TableCell>
              <TableCell>
                {report.createdAt.toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
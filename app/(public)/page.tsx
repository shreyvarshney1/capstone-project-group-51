import { prisma } from '@/lib/prisma'
import { Report } from '@prisma/client'
import MapView from '@/components/map-view'

async function getReports() {
  const reports = await prisma.report.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  })
  return reports
}

export default async function Home() {
  const reports = await getReports()

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">CivicConnect</h1>
      <p className="text-lg text-muted-foreground">
        Report and resolve civic issues in your community.
      </p>
      <div className="w-full h-[600px] mt-8">
        <MapView reports={reports as Report[]} />
      </div>
    </main>
  )
}
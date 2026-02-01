import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { generateCSVExport, generateExcelData, generatePDFContent } from "@/lib/services/export"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const json = await req.json()
    const { format, dateFrom, dateTo, includeComments, includeStatusHistory, anonymize } = json

    const options = {
      format: format || "csv",
      dateRange: dateFrom && dateTo ? {
        from: new Date(dateFrom),
        to: new Date(dateTo)
      } : undefined,
      includeComments: includeComments ?? false,
      includeStatusHistory: includeStatusHistory ?? false,
      anonymize: anonymize ?? false
    }

    switch (options.format) {
      case "csv": {
        const csv = await generateCSVExport(session.user.id, options)
        return new NextResponse(csv, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="civic-issues-${Date.now()}.csv"`
          }
        })
      }

      case "excel": {
        const data = await generateExcelData(session.user.id, options)
        return NextResponse.json({
          data,
          filename: `civic-issues-${Date.now()}.xlsx`
        })
      }

      case "pdf": {
        const html = await generatePDFContent(session.user.id, options)
        return new NextResponse(html, {
          headers: {
            "Content-Type": "text/html",
            "Content-Disposition": `attachment; filename="civic-issues-${Date.now()}.html"`
          }
        })
      }

      default:
        return new NextResponse("Invalid format", { status: 400 })
    }
  } catch (error) {
    console.error("Export error:", error)
    return new NextResponse(null, { status: 500 })
  }
}

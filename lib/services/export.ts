// =============================================
// EXPORT SERVICE
// PDF and Excel export for issue data
// =============================================

import { prisma } from "@/lib/prisma"
import { ExportOptions } from "@/types"

/**
 * Generate CSV export of issues
 */
export async function generateCSVExport(
  userId: string,
  options: ExportOptions
): Promise<string> {
  const issues = await getIssuesForExport(userId, options)
  
  const headers = [
    "ID",
    "Title",
    "Description",
    "Category",
    "Status",
    "Priority",
    "Location",
    "Created At",
    "Updated At",
    "Resolved At"
  ]
  
  if (options.includeComments) {
    headers.push("Comments Count")
  }
  
  const rows = issues.map(issue => {
    const row = [
      issue.id,
      escapeCSV(issue.title),
      escapeCSV(issue.description),
      issue.category.name,
      issue.status,
      issue.priority,
      escapeCSV(issue.address || `${issue.latitude}, ${issue.longitude}`),
      issue.createdAt.toISOString(),
      issue.updatedAt.toISOString(),
      issue.resolvedAt?.toISOString() || ""
    ]
    
    if (options.includeComments) {
      row.push(String(issue._count?.comments || 0))
    }
    
    return row
  })
  
  const csv = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n")
  
  return csv
}

/**
 * Generate JSON export for Excel conversion
 */
export async function generateExcelData(
  userId: string,
  options: ExportOptions
): Promise<Record<string, unknown>[]> {
  const issues = await getIssuesForExport(userId, options)
  
  return issues.map(issue => ({
    "Issue ID": issue.id,
    "Title": issue.title,
    "Description": issue.description,
    "Category": issue.category.name,
    "Status": issue.status,
    "Priority": issue.priority,
    "Address": issue.address || `${issue.latitude}, ${issue.longitude}`,
    "Ward": issue.ward || "N/A",
    "District": issue.district || "N/A",
    "State": issue.state || "N/A",
    "Vote Count": issue.voteCount,
    "Created At": issue.createdAt.toISOString(),
    "Updated At": issue.updatedAt.toISOString(),
    "Resolved At": issue.resolvedAt?.toISOString() || "N/A",
    ...(options.includeComments ? { "Comments Count": issue._count?.comments || 0 } : {}),
    ...(options.includeStatusHistory ? { "Status Changes": issue.statusHistory?.length || 0 } : {})
  }))
}

/**
 * Generate PDF-ready HTML for issues
 */
export async function generatePDFContent(
  userId: string,
  options: ExportOptions
): Promise<string> {
  const issues = await getIssuesForExport(userId, options)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true }
  })
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>CivicConnect Issue Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
        .header { margin-bottom: 30px; }
        .meta { color: #666; font-size: 12px; }
        .issue { border: 1px solid #ddd; padding: 20px; margin-bottom: 20px; border-radius: 8px; }
        .issue-title { font-size: 18px; font-weight: bold; color: #1f2937; }
        .issue-meta { display: flex; gap: 20px; margin: 10px 0; }
        .badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; }
        .badge-status { background: #dbeafe; color: #1e40af; }
        .badge-priority { background: #fee2e2; color: #991b1b; }
        .badge-category { background: #f3e8ff; color: #7c3aed; }
        .description { color: #4b5563; margin-top: 10px; }
        .location { color: #6b7280; font-size: 13px; margin-top: 10px; }
        .dates { color: #9ca3af; font-size: 11px; margin-top: 10px; }
        .footer { margin-top: 40px; text-align: center; color: #9ca3af; font-size: 11px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🏛️ CivicConnect Issue Report</h1>
        <p class="meta">
          Generated for: ${options.anonymize ? "Anonymous" : (user?.name || user?.email)}<br>
          Date: ${new Date().toLocaleDateString()}<br>
          Total Issues: ${issues.length}
        </p>
      </div>
      
      ${issues.map(issue => `
        <div class="issue">
          <div class="issue-title">${escapeHTML(issue.title)}</div>
          <div class="issue-meta">
            <span class="badge badge-status">${issue.status}</span>
            <span class="badge badge-priority">${issue.priority}</span>
            <span class="badge badge-category">${issue.category.name}</span>
          </div>
          <div class="description">${escapeHTML(issue.description)}</div>
          <div class="location">📍 ${escapeHTML(issue.address || `Lat: ${issue.latitude}, Lng: ${issue.longitude}`)}</div>
          <div class="dates">
            Created: ${issue.createdAt.toLocaleDateString()} | 
            Updated: ${issue.updatedAt.toLocaleDateString()}
            ${issue.resolvedAt ? ` | Resolved: ${issue.resolvedAt.toLocaleDateString()}` : ""}
          </div>
        </div>
      `).join("")}
      
      <div class="footer">
        <p>Generated by CivicConnect - Civic Issue Reporting Platform</p>
        <p>This is a computer-generated document.</p>
      </div>
    </body>
    </html>
  `
  
  return html
}

/**
 * Get issues for export with filters
 */
async function getIssuesForExport(
  userId: string,
  options: ExportOptions
) {
  const where: Record<string, unknown> = { userId }
  
  if (options.dateRange) {
    where.createdAt = {
      gte: options.dateRange.from,
      lte: options.dateRange.to
    }
  }
  
  return prisma.issue.findMany({
    where,
    include: {
      category: {
        select: { name: true }
      },
      _count: options.includeComments ? {
        select: { comments: true }
      } : undefined,
      statusHistory: options.includeStatusHistory ? {
        orderBy: { createdAt: "desc" }
      } : undefined
    },
    orderBy: { createdAt: "desc" }
  })
}

/**
 * Escape CSV special characters
 */
function escapeCSV(value: string): string {
  if (!value) return ""
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/**
 * Escape HTML special characters
 */
function escapeHTML(value: string): string {
  if (!value) return ""
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

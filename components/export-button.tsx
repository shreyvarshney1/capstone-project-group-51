"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, FileText, FileSpreadsheet, FileCode, Loader2 } from "lucide-react"

type ExportFormat = "csv" | "excel" | "pdf"

interface ExportButtonProps {
  endpoint: string
  filename?: string
  filters?: Record<string, string>
  disabled?: boolean
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}

export function ExportButton({
  endpoint,
  filename = "export",
  filters = {},
  disabled = false,
  variant = "outline",
  size = "default",
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState<ExportFormat | null>(null)

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(format)
    try {
      const params = new URLSearchParams({ format, ...filters })
      const response = await fetch(`${endpoint}?${params}`)

      if (!response.ok) {
        throw new Error("Export failed")
      }

      const data = await response.json()

      // Handle different format responses
      if (format === "csv") {
        downloadFile(data.content, `${filename}.csv`, "text/csv")
      } else if (format === "excel") {
        // Excel is returned as JSON that would typically be processed by a library
        downloadFile(JSON.stringify(data.content, null, 2), `${filename}.json`, "application/json")
      } else if (format === "pdf") {
        // PDF is returned as HTML string that would be rendered
        const blob = new Blob([data.content], { type: "text/html" })
        const url = URL.createObjectURL(blob)
        window.open(url, "_blank")
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(null)
    }
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const isLoading = isExporting !== null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={disabled || isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {size !== "icon" && (
            <span className="ml-2">
              {isLoading ? "Exporting..." : "Export"}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => handleExport("csv")}
          disabled={isExporting === "csv"}
        >
          <FileText className="h-4 w-4 mr-2" />
          Export as CSV
          {isExporting === "csv" && <Loader2 className="h-4 w-4 ml-auto animate-spin" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleExport("excel")}
          disabled={isExporting === "excel"}
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as Excel
          {isExporting === "excel" && <Loader2 className="h-4 w-4 ml-auto animate-spin" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleExport("pdf")}
          disabled={isExporting === "pdf"}
        >
          <FileCode className="h-4 w-4 mr-2" />
          Export as PDF
          {isExporting === "pdf" && <Loader2 className="h-4 w-4 ml-auto animate-spin" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
